
const express = require("express");
const pool = require("../db.js");

const router = express.Router();


  


const cors = require("cors");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Importez la bibliothèque JWT
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
        const { participation, id, date: receivedDate } = req.body; // Inclure la date reçue du frontend
        const { eventId } = req.params;

        // Validation de la participation
        if (participation !== "Oui" && participation !== "Non") {
            return res.status(400).json({ message: 'La participation doit être "Oui" ou "Non"' });
        }

        // Conversion de la date reçue en UTC si nécessaire
        // Assurez-vous que receivedDate est déjà en format UTC (comme une chaîne ISO)
        const dateUTC = new Date(receivedDate).toISOString();
        console.log(dateUTC);

        // Vérification de l'existence de la participation
        const existingParticipation = await db.oneOrNone(
            "SELECT * FROM participation_events WHERE event_id = $1 AND user_id = $2",
            [eventId, id]
        );

        // Mise à jour ou insertion de la participation
        if (existingParticipation) {
            await db.none(
                "UPDATE participation_events SET participation = $1, date = $2 WHERE event_id = $3 AND user_id = $4",
                [participation === "Oui", dateUTC, eventId, id]
            );
        } else {
            await db.none(
                "INSERT INTO participation_events (event_id, user_id, date, participation) VALUES ($1, $2, $3, $4)",
                [eventId, id, dateUTC, participation === "Oui"]
            );
        }

        res.json({ message: "Participation mise à jour avec succès" });
        console.log("Participation mise à jour avec succès");
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la participation", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour de la participation" });
    }
});


// match avec "oui" comme participation pour les events- recuperation nom prenom et date avec un JOIN
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
        const events = await pool.query(query);
        res.json(events.rows);
    } catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "Erreur lors de la récupération des événements" });
    }
});

module.exports = router;
