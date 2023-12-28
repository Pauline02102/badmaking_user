
const express = require("express");
const db = require("../../db");

const router = express.Router();


  


const cors = require("cors");


const jwt = require("jsonwebtoken"); 
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const crypto = require("crypto");
const secretKey = crypto.randomBytes(32).toString("hex");
const bodyParser = require("body-parser");
const pgp = require("pg-promise")();


const app = express();
const port = process.env.PORT || 3030;

router.post("/updateParticipation/:eventId", async (req, res) => {
    try {
        const { participation, id } = req.body;
        const { eventId } = req.params;

        // Validation de la participation
        if (participation !== "Oui" && participation !== "Non") {
            return res.status(400).json({ message: 'La participation doit être "Oui" ou "Non"' });
        }

        // Vérification de l'existence de la participation
        const existingParticipation = await db.oneOrNone(
            "SELECT * FROM participation_events WHERE event_id = $1 AND user_id = $2",
            [eventId, id]
        );

        // Mise à jour ou insertion de la participation
        if (existingParticipation) {
            await db.none(
                "UPDATE participation_events SET participation = $1 WHERE event_id = $2 AND user_id = $3",
                [participation === "Oui", eventId, id]
            );
        } else {
            await db.none(
                "INSERT INTO participation_events (event_id, user_id, participation) VALUES ($1, $2, $3)",
                [eventId, id, participation === "Oui"]
            );
        }

        res.json({ message: "Participation mise à jour avec succès" });
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la participation", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour de la participation" });
    }
});



// participation avec "oui" comme participation pour les events- recuperation nom prenom et date avec un JOIN
router.get("/ouiparticipation", async (req, res) => {
    try {
        const query = `
        SELECT p.event_id, p.user_id, p.participation, u.prenom, u.nom, u.classement_double, u.classement_mixte, 
        TO_CHAR(  e.date,'YYYY-MM-DD') AS "date",
        e.status as status
        FROM participation_events AS p
        JOIN users AS u ON p.user_id = u.id
        JOIN event AS e ON p.event_id = e.id
        WHERE p.participation = 'True'
        
        ;
      `;
        const events = await db.query(query);
        res.json(events);
    } catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "Erreur lors de la récupération des événements" });
    }
});

// participation avec "oui" comme participation pour les events- recuperation nom prenom et date avec un JOIN par apport a un event
router.get("/ouiparticipation/:event_id", async (req, res) => {
    try {
        const { event_id } = req.params; // Récupérer l'ID de l'événement depuis les paramètres de l'URL
        const query = `
        SELECT p.event_id, p.user_id, p.participation, u.prenom, u.nom, u.classement_double, u.classement_mixte, 
        TO_CHAR(e.date,'YYYY-MM-DD') AS "date",
        e.status as status
        FROM participation_events AS p
        JOIN users AS u ON p.user_id = u.id
        JOIN event AS e ON p.event_id = e.id
        WHERE p.participation = 'True' AND p.event_id = $1;
      `;
        const events = await db.query(query, [event_id]); // Passer l'ID de l'événement en tant que paramètre
        res.json(events);
    } catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "Erreur lors de la récupération des événements" });
    }
});

//compte le nombre de participants a l'evenement 
router.get("/participantcount/:event_id", async (req, res) => {
    try {
        const { event_id } = req.params;
        const query = `
            SELECT COUNT(*) as participant_count
            FROM participation_events
            WHERE event_id = $1 AND participation = 'True';
        `;
        const result = await db.oneOrNone(query, [event_id]);
        res.json({ event_id: event_id, participant_count: result ? result.participant_count : 0 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération du nombre de participants" });
    }
});

 module.exports = router;
