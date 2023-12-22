

const express = require("express");
const db= require("../../db.js");

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


//oui participation au jeu libre
router.get("/ouiparticipationjeulibre/:selectedDate", async (req, res) => {
    try {
        const selectedDate = req.params.selectedDate;
        const query = `
        SELECT p.user_id, p.participation, p.heure, u.prenom, u.nom
        FROM participation_jeulibre AS p
        JOIN users AS u ON p.user_id = u.id
        WHERE p.participation = 'True' AND DATE(p.date) = DATE('${selectedDate}');
      `;

        const participations = await db.query(query);
        res.json(participations);
    } catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "Erreur lors de la récupération des participations" });
    }
});


// participation jeu libre
router.post("/participationJeuLibre/:userId", async (req, res) => {
    try {
        const { participation, date, heure } = req.body;
        const { userId } = req.params;

        console.log(`Requête reçue - User ID: ${userId}, Participation: ${participation}, Date: ${date}, Heure: ${heure}`);

        // Validation de l'heure
        if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(heure)) {
            console.log("Erreur: Format d'heure invalide");
            return res.status(400).json({ message: "Heure non valide. Le format doit être HH:MM." });
        }

        // Validation de la participation
        if (participation !== "Oui" && participation !== "Non") {
            console.log("Erreur: Valeur de participation invalide");
            return res.status(400).json({ message: 'La participation doit être soit "Oui" soit "Non"' });
        }

        // Vérification d'un enregistrement existant
        console.log("Vérification de l'enregistrement existant dans la base de données");
        const existingParticipation = await db.oneOrNone(
            "SELECT * FROM participation_jeulibre WHERE user_id = $1 AND date = $2",
            [userId, date]
        );

        if (existingParticipation) {
            console.log("Mise à jour de l'enregistrement existant");
            await db.none(
                "UPDATE participation_jeulibre SET heure = $1, participation = $2 WHERE user_id = $3 AND date = $4",
                [heure, participation === "Oui", userId, date]
            );
            console.log("Mise à jour de la participation avec succès");
            res.json({ message: "Mise à jour de la participation avec succès" });
        } else {
            console.log("Insertion d'un nouvel enregistrement");
            await db.none(
                "INSERT INTO participation_jeulibre (user_id, participation, date, heure) VALUES ($1, $2, $3, $4)",
                [userId, participation === "Oui", date, heure]
            );
            console.log("Nouvelle participation insérée avec succès");
            res.json({ message: "Nouvelle participation insérée avec succès" });
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la participation", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour de la participation" });
    }
});

module.exports = router;
