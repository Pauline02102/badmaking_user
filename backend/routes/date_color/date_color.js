


const express = require("express");
const db= require("../db.js");

const router = express.Router();


  


const cors = require("cors");

const bcrypt = require("bcrypt");
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

// associate Color To Date
router.post("/associateColorToDate", async (req, res) => {
    try {
        const { date, color } = req.body;
        console.log("Valeur de 'color' dans la requête :", color);
        console.log("Valeur de 'date' dans la requête :", date);

        if (color === 'white') {
            // Requête SQL pour supprimer la couleur associée à une date
            const removeColorQuery = `
            DELETE FROM date_color WHERE date = $1;
            `;

            // Exécutez la requête pour supprimer la couleur
            await db.none(removeColorQuery, [date]);
            res.json({ message: "Couleur supprimée de la date avec succès" });
            console.log("Couleur supprimée de la date avec succès");
        } else {
            // Requête SQL pour associer la couleur à une date
            const associateColorQuery = `
            INSERT INTO date_color (date, color)
            VALUES ($1, $2)
            ON CONFLICT (date) DO UPDATE
            SET color = EXCLUDED.color;
            `;

            // Exécutez la requête pour associer la couleur à une date
            await db.none(associateColorQuery, [date, color]);
            res.json({ message: "Couleur associée à la date avec succès" });
            console.log("Couleur associée à la date avec succès");
        }
    } catch (error) {
        console.error("Erreur lors de l'association de la couleur à la date", error);
        res.status(500).json({
            message: "Erreur lors de l'association de la couleur à la date",
        });
    }
});



// Récupérer la couleur associée à une date
router.get("/getColorForDate/:date", async (req, res) => {
    try {
        const { date } = req.params;
        console.log("Date demandée :", date);

        // Requête SQL pour récupérer la couleur associée à la date spécifiée
        const getColorQuery = `
          SELECT color
          FROM date_color
          WHERE date = $1;
        `;

        //  récupérer la couleur
        const result = await db.oneOrNone(getColorQuery, [date]);

        if (result) {
            res.json({ color: result.color });
            console.log("Couleur récupérée avec succès :", result.color);
        } else {
            res
                .status(404)
                .json({ message: "Aucune couleur associée à la date spécifiée" });
            console.log("Aucune couleur associée à la date spécifiée");
        }
    } catch (error) {
        console.error("Erreur lors de la récupération de la couleur", error);
        res.status(500).json({
            message: "Erreur lors de la récupération de la couleur",
        });
    }
});

router.get("/getAllDateColors", async (req, res) => {
    try {
        const query = "SELECT * FROM date_color";
        const result = await db.query(query);

        if (result && result && result.length > 0) {
            const dateColors = {};
            result.forEach((row) => {
                dateColors[row.date] = row.color;
            });
            res.status(200).json(dateColors);

        } else {
            res.status(404).json({ message: "Aucune couleur de date trouvée" });
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des couleurs de date", error);
        res
            .status(500)
            .json({ message: "Erreur lors de la récupération des couleurs de date" });
    }
});

module.exports = router;
