

const express = require("express");
const db= require("../db.js");

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
// Créer un nouvel événement
router.post("/postcalendar", async (req, res) => {
    try {
        const { title, type, user_id, status, terrain_id, date } = req.body;
        const newEvent = await db.query(
            "INSERT INTO event (title,type,user_id,status,terrain_id,date ) VALUES ($1, $2, $3, $4,$5,$6)",
            [title, type, user_id, status, terrain_id, date]
        );
        res.json(newEvent[0]);
        console.log("event crée");
    } catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "Erreur lors de la création de l'événement backend" });
    }
});

// Récupérer tous les événements
router.get("/calendar", async (req, res) => {
    try {
        const events = await db.query("SELECT * FROM event");
        res.json(events);
    } catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "Erreur lors de la récupération des événements" });
    }
});
// Supprimer un événement par ID
router.delete("/calendar/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM event WHERE id = $1", [id]);
        res.json({ message: "Événement supprimé avec succès" });
    } catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "Erreur lors de la suppression de l'événement" });
    }
});

module.exports = router;
