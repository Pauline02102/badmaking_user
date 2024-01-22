
const express = require("express");
const db = require("../../db");

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


const app = express();
const port = process.env.PORT || 3030;

//récupérer tous les joueurs et leurs résultats de matchs
router.get('/joueurs_resultats', async (req, res) => {
  try {
    console.log('Executing /joueurs_resultats');
    const playersQuery = `
        SELECT  
          users.id as user_id, 
          users.prenom, 
          users.nom,   
          (event.date + INTERVAL '1 hour') as date,
          COUNT(CASE WHEN resultat.victoire = 1 THEN 1 END) as total_victoires, 
          COUNT(CASE WHEN resultat.defaite = 1 THEN 1 END) as total_defaites,
          ARRAY_AGG(DISTINCT resultat.match_id) as match_ids
        FROM resultat 
        JOIN users ON resultat.user_id = users.id
        JOIN event ON resultat.event_id = event.id  -- Jointure avec la table event
        GROUP BY users.id, users.prenom, users.nom, event.date  -- Ajout de la date dans le GROUP BY
        ORDER BY total_victoires DESC
      `;
    const players = await db.query(playersQuery);
    console.log('Players fetched:', players);
    res.status(200).json(players);
  } catch (error) {
    
    console.error('Error in /joueurs_resultats:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des joueurs" });
  }
});


// get resultats par date 
router.get('/joueurs_resultatsPardate/:date', async (req, res) => {
  try {
    const date = req.params.date; // Assume date is passed as a query parameter in 'YYYY-MM-DD' format

    const playersQuery = `
    SELECT  
    users.id as user_id, 
    users.prenom, 
    users.nom, 
    COUNT(CASE WHEN resultat.victoire = 1 THEN 1 END) as total_victoires, 
    COUNT(CASE WHEN resultat.defaite = 1 THEN 1 END) as total_defaites,
    ARRAY_AGG(DISTINCT resultat.match_id) as match_ids
    FROM resultat 
    INNER JOIN event ON resultat.event_id = event.id
    INNER JOIN users ON resultat.user_id = users.id
    WHERE event.date = $1
    GROUP BY users.id, users.prenom, users.nom
    ORDER BY total_victoires DESC

    `;

    console.log('Executing query with date:', date); // Log the date being used in the query
    const players = await db.query(playersQuery, [date]);

    console.log('Query result:', players); // Log the result of the query

    res.status(200).json(players);
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
    const existingResult = await db.query(existingResultQuery, [match_id, user_id]);

    if (existingResult.length > 0) {
      // L'utilisateur a déjà enregistré un résultat
      return res.status(200).json({ resultExists: true, victory: existingResult[0].victoire, defeat: existingResult[0].defaite });
    }

    // Aucun résultat trouvé
    res.status(200).json({ resultExists: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la vérification du résultat du match" });
  }
});
/*
//enregistrer les resultats d'un match
router.post('/report-match-result', async (req, res) => {
  try {
    const { match_id, user_id, victoire, defaite, event_id } = req.body;

    // Vérifier si un résultat existe déjà pour le match
    const existingResultQuery = `
      SELECT user_id, victoire, defaite
      FROM resultat
      WHERE match_id = $1
    `;
    const existingResults = await db.query(existingResultQuery, [match_id]);

    if (existingResults.length === 0) {
      // Aucun résultat pour le match, enregistrer le résultat tel qu'il est
      const insertQuery = `
        INSERT INTO resultat (match_id, user_id, victoire, defaite, event_id)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await db.query(insertQuery, [match_id, user_id, victoire, defaite, event_id]);
      return res.status(200).json({ message: "Le résultat du match a été signalé avec succès." });
    }

    const opponentResults = existingResults.filter(result => result.user_id !== user_id);
    const myResults = existingResults.find(result => result.user_id === user_id);

    if (opponentResults.length > 0) {
      // Des résultats pour les adversaires existent
      const opponentResult = opponentResults[0];

      if (
        (victoire === 1 && opponentResult.defaite === 1) ||
        (defaite === 1 && opponentResult.victoire === 1)
      ) {
        // Les résultats sont inversés par rapport à l'adversaire, renvoyer une erreur
        return res.status(400).json({ message: "Les résultats ne peuvent pas être inversés par rapport à l'adversaire ou différent de celui de votre partenaire" });
      }
    }

    if (myResults) {
      // Un résultat existe déjà pour l'utilisateur
      const updateQuery = `
        UPDATE resultat
        SET victoire = $3, defaite = $4, event_id = $5
        WHERE match_id = $1 AND user_id = $2
      `;
      await db.query(updateQuery, [match_id, user_id, victoire, defaite, event_id]);
      return res.status(200).json({ message: "Le résultat du match a été mis à jour avec succès." });
    } else {
      // Aucun résultat pour l'utilisateur, enregistrer le résultat tel qu'il est
      const insertQuery = `
        INSERT INTO resultat (match_id, user_id, victoire, defaite, event_id)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await db.query(insertQuery, [match_id, user_id, victoire, defaite, event_id]);
      return res.status(200).json({ message: "Le résultat du match a été signalé avec succès." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur dans les résultats du match." });
  }
});*/

router.post('/report-match-result', async (req, res) => {
  try {
    const { match_id, user_id, victoire, defaite, event_id } = req.body;

    // Récupérer les détails du match, y compris les paires
    const matchQuery = `
      SELECT paire1, paire2
      FROM match
      WHERE id = $1
    `;
    const matchDetails = await db.query(matchQuery, [match_id]);
    const { paire1, paire2 } = matchDetails[0];

    // Déterminer la paire de l'utilisateur et trouver le partenaire
    const userPaire = [paire1, paire2].find(p => p.includes(user_id));
    const partnerId = userPaire.find(id => id !== user_id);

    // Récupérer les résultats existants pour le match
    const existingResultQuery = `
      SELECT user_id, victoire, defaite
      FROM resultat
      WHERE match_id = $1
    `;
    const existingResults = await db.query(existingResultQuery, [match_id]);

    // Vérifier la cohérence avec le partenaire
    const partnerResult = existingResults.rows.find(result => result.user_id === partnerId);
    if (partnerResult && (partnerResult.victoire !== victoire || partnerResult.defaite !== defaite)) {
      return res.status(400).json({ message: "Les résultats doivent correspondre à ceux du partenaire." });
    }

    // Vérifier l'incohérence avec les adversaires
    const adversaryPaire = userPaire === paire1 ? paire2 : paire1;
    const adversaryResults = existingResults.rows.filter(result => adversaryPaire.includes(result.user_id));
    for (let adversaryResult of adversaryResults) {
      if (adversaryResult.victoire === victoire || adversaryResult.defaite === defaite) {
        return res.status(400).json({ message: "Les résultats doivent être l'inverse de ceux de l'adversaire." });
      }
    }

    // Insérer ou mettre à jour le résultat
    const myResult = existingResults.rows.find(result => result.user_id === user_id);
    if (myResult) {
      const updateQuery = `
        UPDATE resultat
        SET victoire = $3, defaite = $4, event_id = $5
        WHERE match_id = $1 AND user_id = $2
      `;
      await db.query(updateQuery, [match_id, user_id, victoire, defaite, event_id]);
    } else {
      const insertQuery = `
        INSERT INTO resultat (match_id, user_id, victoire, defaite, event_id)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await db.query(insertQuery, [match_id, user_id, victoire, defaite, event_id]);
    }

    return res.status(200).json({ message: "Le résultat du match a été traité avec succès." });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur dans les résultats du match." });
  }
});






module.exports = router;
