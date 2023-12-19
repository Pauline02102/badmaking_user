

const express = require("express");
const db = require("../db.js");

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


// Créer un nouvel événement pour admin
router.post("/postcalendar", async (req, res) => {
  try {
    const { title, user_id, status, terrain_id, date, heure } = req.body;

    // Log des données reçues pour le débogage
    console.log("Données reçues pour l'événement:", { title, user_id, status, terrain_id, date, heure });

    // Exécution de la requête d'insertion avec pg-promise
    const newEvent = await db.query(
      "INSERT INTO event (title, user_id, status, terrain_id, date, heure) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [title, user_id, status, terrain_id, date, heure]
    );

    // Vérifier si l'événement a été inséré et renvoyer les données
    if (newEvent.length > 0) {
      console.log("Événement créé avec succès:", newEvent[0]);
      res.json(newEvent[0]);
    } else {
      // Si aucun objet n'est retourné
      throw new Error("Échec de l'insertion de l'événement dans la base de données.");
    }
  } catch (error) {
    console.error("Erreur lors de la création de l'événement:", error);
    res.status(500).json({ message: "Erreur lors de la création de l'événement", error: error.message });
  }
});

// Mettre à jour un événement existant par ID pour admin
router.put("/modifier/:eventId", async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const { title, status, date, heure } = req.body;

    // Log des données reçues pour le débogage
    console.log("Données reçues pour la mise à jour de l'événement:", { title, status, date, heure });

    const updatedEvent = await db.query(
      "UPDATE event SET title = $1, status = $2, date = $3, heure = $4 WHERE id = $5 RETURNING *",
      [title, status, date, heure, eventId]
    );

    // Vérifier si l'événement a été mis à jour et renvoyer les données
    if (updatedEvent.length > 0) {
      console.log("Événement mis à jour avec succès:", updatedEvent[0]);
      res.json(updatedEvent[0]);
    } else {
      // Si aucun objet n'est retourné
      throw new Error("Échec de la mise à jour de l'événement dans la base de données.");
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'événement:", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'événement", error: error.message });
  }
});


module.exports = router;
