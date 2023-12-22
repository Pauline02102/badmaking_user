
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


//post creation de poules
router.post("/creerPoules", async (req, res) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const result = await client.query(`
        SELECT event_id, COUNT(*) as nombre_paires
        FROM paires
        GROUP BY event_id;
      `);

        let messages = [];

        for (const row of result) {
            const nombrePaires = parseInt(row.nombre_paires);
            const eventId = row.event_id;

            if (nombrePaires < 3) {
                messages.push(`Pas assez de paires pour former une poule pour l'événement ${eventId}`);
                console.log(`Pas assez de paires pour former une poule pour l'événement ${eventId}`);
                continue;
            }

            let taillesPoules = [];
            let totalPaires = nombrePaires; 

            if (nombrePaires % 9 === 0) {
                // Logique spécifique pour les multiples de 9
                const nombreGroupes = nombrePaires / 9;
                for (let i = 0; i < nombreGroupes; i++) {
                    taillesPoules.push(4);
                    taillesPoules.push(5);
                }
            }

            if (nombrePaires % 5 === 0) {
                taillesPoules = new Array(nombrePaires / 5).fill(5);
            } else if (nombrePaires % 4 === 0) {
                taillesPoules = new Array(nombrePaires / 4).fill(4);
            } else if (nombrePaires % 3 === 0) {
                taillesPoules = new Array(nombrePaires / 3).fill(3);
            } else {
                // Logique pour les cas non multiples de 3, 4 ou 5
                while (totalPaires > 0) {
                    if (totalPaires % 4 === 0 || totalPaires - 4 >= 3) {
                        taillesPoules.push(4);
                        totalPaires -= 4;
                    } else if (totalPaires % 5 === 0 || totalPaires - 5 >= 3) {
                        taillesPoules.push(5);
                        totalPaires -= 5;
                    } else {
                        taillesPoules.push(3);
                        totalPaires -= 3;
                    }
                }
            }

            const paires = await client.query(`
          SELECT id
          FROM paires
          WHERE event_id = $1
          ORDER BY id;
        `, [eventId]);

            let pouleNum = 1;
            let indexPaire = 0;
            for (const taille of taillesPoules) {
                for (let i = 0; i < taille; i++) {
                    const paireId = paires[indexPaire++].id;
                    await client.query(`
              INSERT INTO poule (poule, paire_id)
              VALUES ($1, $2)
            `, [pouleNum, paireId]);
                }
                pouleNum++;
            }

            messages.push(`Poules créées pour l'événement ${eventId} avec des tailles de ${taillesPoules.join(', ')}`);
            console.log(`Poules créées pour l'événement ${eventId} avec des tailles de ${taillesPoules.join(', ')}`);
        }

        await client.query('COMMIT');
        res.status(200).json({ messages });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la création des poules" });
    }
});


//recuperer poule 
router.get("/recupererPoules", async (req, res) => {
    try {
        const query = `
        SELECT po.id as poule_id, 
               po.poule, 
               pa.id as paire_id,
               u1.nom as user1_nom, 
               u1.prenom as user1_prenom,
               u2.nom as user2_nom, 
               u2.prenom as user2_prenom
        FROM poule po
        JOIN paires pa ON po.paire_id = pa.id
        JOIN users u1 ON pa.user1 = u1.id
        JOIN users u2 ON pa.user2 = u2.id;
      `;
        const result = await db.query(query);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des poules et des informations des joueurs" });
    }
});
module.exports = router;

