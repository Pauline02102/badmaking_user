

const express = require("express");
const db = require("../../db");
const nodemailer = require('nodemailer');
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

const userAuthMiddleware = require('../user_tokens/user_tokens');
const isAdminMiddleware = require('../user_tokens/user_tokens');

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
router.post("/postcalendar", userAuthMiddleware, isAdminMiddleware, async (req, res) => {
  try {
    const { title, user_id, status, date, heure } = req.body;

    const insertEventQuery = 'INSERT INTO event (title, user_id, status, date, heure) VALUES ($1, $2, $3, $4, $5)';

    await db.none(insertEventQuery, [title, user_id, status, date, heure]);

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

router.delete("/supprimer/:eventId", userAuthMiddleware, isAdminMiddleware, async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Supprimer d'abord toutes les inscriptions liées à cet événement
    const deleteInscriptionsQuery = 'DELETE FROM participation_events WHERE event_id = $1';
    await db.none(deleteInscriptionsQuery, [eventId]);

    // Ensuite, supprimer l'événement lui-même
    const deleteEventQuery = 'DELETE FROM event WHERE id = $1';
    await db.none(deleteEventQuery, [eventId]);

    res.status(200).json({
      message: 'Événement et toutes les inscriptions associées supprimés avec succès.'
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'événement et des inscriptions :", error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'événement et des inscriptions' });
  }
});

router.get("/checkDate", async (req, res) => {
  try {
    const { date } = req.query;

    const checkDateQuery = 'SELECT COUNT(*) FROM event WHERE date = $1';
    const result = await db.one(checkDateQuery, [date]);
    console.log(date);
    console.log(checkDateQuery);
    console.log(result);

    const exists = parseInt(result.count, 10) > 0;
    res.json({ exists });
  } catch (error) {
    console.error("Erreur lors de la vérification de la date :", error);
    res.status(500).json({ message: "Erreur lors de la vérification de la date" });
  }
});


module.exports = router;
