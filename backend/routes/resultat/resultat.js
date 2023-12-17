
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

//récupérer tous les joueurs et leurs résultats de matchs
router.get('/joueurs_resultats', async (req, res) => {
    try {
        const playersQuery = `
        SELECT  
          user_id, 
          prenom, 
          nom, 
          COUNT(CASE WHEN victoire = 1 THEN 1 END) as total_victoires, 
          COUNT(CASE WHEN defaite = 1 THEN 1 END) as total_defaites,
          ARRAY_AGG(DISTINCT match_id) as match_ids
        FROM resultat 
        JOIN users ON resultat.user_id = users.id
        GROUP BY user_id, prenom, nom
        ORDER BY total_victoires DESC
      `;
        const players = await pool.query(playersQuery);
        res.status(200).json(players.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des joueurs" });
    }
});


// recuperer les resultats d'un match
router.get('/check-match-result', async (req, res) => {
    try {
        const { match_id, user_id } = req.query;

        // Vérification de l'existence du match_id et du user_id
        if (!match_id || !user_id) {
            return res.status(400).json({ message: "Le match_id et le user_id sont requis." });
        }

        // Vérifier si l'utilisateur a déjà enregistré un résultat pour ce match
        const existingResultQuery = `
        SELECT victoire, defaite
        FROM resultat
        WHERE match_id = $1 AND user_id = $2
      `;
        const existingResult = await pool.query(existingResultQuery, [match_id, user_id]);

        if (existingResult.rows.length > 0) {
            // L'utilisateur a déjà enregistré un résultat
            return res.status(200).json({ resultExists: true, victory: existingResult.rows[0].victoire, defeat: existingResult.rows[0].defaite });
        }

        // Aucun résultat trouvé
        res.status(200).json({ resultExists: false });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la vérification du résultat du match" });
    }
});

//enregistrer les resultats d'un match
router.post('/report-match-result', async (req, res) => {
    try {
        const { match_id, user_id, victoire, defaite } = req.body;

        // Recherche d'un résultat existant pour l'utilisateur et le match
        const existingResultQuery = `SELECT * FROM resultat WHERE match_id = $1 AND user_id = $2`;
        const existingResult = await pool.query(existingResultQuery, [match_id, user_id]);
        if (existingResult.rows.length > 0) {
            // Avant de mettre à jour, vérifier s'il y a un conflit avec les résultats des adversaires

            // Récupérer les identifiants des paires du match
            const pairsQuery = `
          SELECT paire1, paire2 FROM match
          WHERE id = $1
        `;
            const pairsResult = await pool.query(pairsQuery, [match_id]);
            const { paire1, paire2 } = pairsResult.rows[0];

            // Récupérer les identifiants des joueurs pour chaque paire
            const playersQuery = `
          SELECT user1, user2 FROM paires WHERE id = $1
          UNION
          SELECT user1, user2 FROM paires WHERE id = $2
        `;
            const playersResult = await pool.query(playersQuery, [paire1, paire2]);
            const players = playersResult.rows;

            // Identifier l'équipe du joueur actuel et l'équipe adverse
            let myTeam = [];
            let opponentTeam = [];
            players.forEach(pair => {
                if (pair.user1 === user_id || pair.user2 === user_id) {
                    myTeam.push(pair.user1, pair.user2);
                } else {
                    opponentTeam.push(pair.user1, pair.user2);
                }
            });

            // Vérifier les résultats de l'équipe adverse
            const opponentResultsQuery = `
          SELECT SUM(victoire) as total_victoires, SUM(defaite) as total_defaites
          FROM resultat
          WHERE match_id = $1 AND (user_id = ANY($2))
        `;
            const opponentResults = await pool.query(opponentResultsQuery, [match_id, opponentTeam]);
            const opponentData = opponentResults.rows[0];

            // Vérifier les conflits de résultat
            if (opponentData && ((victoire == 1 && opponentData.total_victoires > 0) || (defaite == 1 && opponentData.total_defaites > 0))) {
                return res.status(400).json({ message: "Les résultats du match sont contradictoires." });
            }

            // Mettre à jour le résultat existant si aucune incohérence n'est détectée
            const updateQuery = `
          UPDATE resultat
          SET victoire = $3, defaite = $4
          WHERE match_id = $1 AND user_id = $2
        `;
            await pool.query(updateQuery, [match_id, user_id, victoire, defaite]);
            return res.status(200).json({ message: "Le résultat du match a été mis à jour avec succès." });
        }

        // Vérifiez l'état actuel des résultats du match
        const checkQuery = `
        SELECT SUM(victoire) as total_victories, SUM(defaite) as total_defeats
        FROM resultat
        WHERE match_id = $1
        GROUP BY match_id
      `;
        const checkResult = await pool.query(checkQuery, [match_id]);
        const matchResult = checkResult.rows[0];

        // Logique pour éviter plus de 2 victoires ou défaites
        if (matchResult) {
            if ((victoire == 1 && matchResult.total_victories >= 2) || (defaite == 1 && matchResult.total_defeats >= 2)) {
                return res.status(400).json({ message: "Le résultat de ce match est déjà complet." });
            }
        }

        // Récupérer les identifiants des paires du match
        const pairsQuery = `
        SELECT paire1, paire2 FROM match
        WHERE id = $1
      `;
        const pairsResult = await pool.query(pairsQuery, [match_id]);
        const { paire1, paire2 } = pairsResult.rows[0];

        // Récupérer les identifiants des joueurs pour chaque paire
        const playersQuery = `
        SELECT user1, user2 FROM paires WHERE id = $1
        UNION
        SELECT user1, user2 FROM paires WHERE id = $2
      `;
        const playersResult = await pool.query(playersQuery, [paire1, paire2]);
        const players = playersResult.rows;

        // Identifier l'équipe du joueur actuel et l'équipe adverse
        let myTeam = [];
        let opponentTeam = [];
        players.forEach(pair => {
            if (pair.user1 === user_id || pair.user2 === user_id) {
                myTeam.push(pair.user1, pair.user2);
            } else {
                opponentTeam.push(pair.user1, pair.user2);
            }
        });

        // Vérifier les résultats de l'équipe adverse
        const opponentResultsQuery = `
        SELECT SUM(victoire) as total_victoires, SUM(defaite) as total_defaites
        FROM resultat
        WHERE match_id = $1 AND (user_id = ANY($2))
      `;
        const opponentResults = await pool.query(opponentResultsQuery, [match_id, opponentTeam]);
        const opponentData = opponentResults.rows[0];

        // Vérifier les conflits de résultat
        if (opponentData && ((victoire == 1 && opponentData.total_victoires > 0) || (defaite == 1 && opponentData.total_defaites > 0))) {
            return res.status(400).json({ message: "Les résultats du match sont contradictoires." });

        }

        // Insérer le résultat
        const insertQuery = `
        INSERT INTO resultat (match_id, user_id, victoire, defaite)
        VALUES ($1, $2, $3, $4)
      `;
        await pool.query(insertQuery, [match_id, user_id, victoire, defaite]);

        res.status(200).json({ message: "Le résultat du match a été signalé avec succès." });
        console.log({ message: "Le résultat du match a été signalé avec succès." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur dans les résultats du match" });
        console.log({ message: "Erreur dans les résultats du match" });
    }
});
module.exports = router;
