

const express = require("express");
const db = require("../../db");

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


// Créer un nouvel événement pour admin
router.post("/postcalendar", async (req, res) => {
  try {
      const { title, user_id, status, terrain_id, date, heure } = req.body;

      const insertEventQuery = 'CALL insert_event($1, $2, $3, $4, $5, $6)';
      await db.none(insertEventQuery, [title, user_id, status, terrain_id, date, heure]);

      res.status(201).json({
          message: 'Événement créé avec succès.'
      });
  } catch (error) {
      console.error("Erreur lors de la création de l'événement :", error);
      res.status(500).json({ message: 'Erreur lors de la création de l\'événement' });
  }
});


// Mettre à jour un événement existant par ID pour admin
router.put("/modifier/:eventId", async (req, res) => {
  try {
      const eventId = req.params.eventId;
      const { title, status, date, heure } = req.body;

      const updateEventQuery = 'CALL update_event($1, $2, $3, $4, $5)';
      await db.none(updateEventQuery, [eventId, title, status, date, heure]);

      res.status(200).json({
          message: 'Événement mis à jour avec succès.'
      });
  } catch (error) {
      console.error("Erreur lors de la mise à jour de l'événement :", error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'événement' });
  }
});


module.exports = router;
