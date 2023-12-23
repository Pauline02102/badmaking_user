

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

// post pour créer toutes les combinaisons de matchs 
router.post("/creerMatchs", async (req, res) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // Récupérer les numéros de poule existants
        const poulesExistantesResult = await client.query(`
        SELECT DISTINCT poule 
        FROM poule;
      `);
        const poulesExistantes = poulesExistantesResult.map(row => row.poule);

        // Récupérer les paires pour chaque poule
        const poulesResult = await client.query(`
        SELECT poule, paire_id 
        FROM poule 
        ORDER BY poule, id;
      `);

        // Regrouper les paires par poule
        const pairesParPoule = {};
        poulesResult.forEach(row => {
            if (!pairesParPoule[row.poule]) {
                pairesParPoule[row.poule] = [];
            }
            pairesParPoule[row.poule].push(row.paire_id);
        });

        // Générer et insérer les matchs
        for (const [pouleNum, paires] of Object.entries(pairesParPoule)) {
            if (poulesExistantes.includes(parseInt(pouleNum))) {
                for (let i = 0; i < paires.length; i++) {
                    for (let j = i + 1; j < paires.length; j++) {
                        const paire1 = paires[i];
                        const paire2 = paires[j];

                        // Insérer le match
                        await client.query(`
                INSERT INTO match (poule_id, paire1, paire2)
                VALUES ($1, $2, $3)
              `, [pouleNum, paire1, paire2]);
                    }
                }
            }
        }

        await client.query('COMMIT');
        res.status(200).json({ message: "Matchs créés avec succès" });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la création des matchs" });
    } 
});

//get recuperer les matchs crée

router.get("/recupererMatchs", async (req, res) => {
    try {
        const query = `
            SELECT m.id as match_id,
            m.poule_id,
            p1.id as paire1_id,
            p2.id as paire2_id,
            u1.nom as user1_nom_paire1,
            u1.prenom as user1_prenom_paire1,
            u2.nom as user2_nom_paire1,
            u2.prenom as user2_prenom_paire1,
            u3.nom as user1_nom_paire2,
            u3.prenom as user1_prenom_paire2,
            u4.nom as user2_nom_paire2,
            u4.prenom as user2_prenom_paire2,
            u1.classement_mixte as user1_mixte,
            u1.classement_double as user1_double,
            u2.classement_mixte as user2_mixte,
            u2.classement_double as user2_double,
            u3.classement_mixte as user3_mixte,
            u3.classement_double as user3_double,
            u4.classement_mixte as user4_mixte,
            u4.classement_double as user4_double,
            p1.event_id as event_id ,
            TO_CHAR(e.date,'YYYY-MM-DD') AS "event_date",
            TO_CHAR(e.heure, 'HH24:MI') AS "event_time",
            e.status as status
            
        FROM match m
        JOIN paires p1 ON m.paire1 = p1.id
        JOIN paires p2 ON m.paire2 = p2.id
        JOIN users u1 ON p1.user1 = u1.id
        JOIN users u2 ON p1.user2 = u2.id
        JOIN users u3 ON p2.user1 = u3.id
        JOIN users u4 ON p2.user2 = u4.id
        JOIN event e ON p1.event_id = e.id
        WHERE e.date >= CURRENT_DATE - INTERVAL '1 day';
      `;
        const result = await db.query(query);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des matchs" });
    }
});
module.exports = router;
