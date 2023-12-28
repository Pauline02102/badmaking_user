
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
    res.status(200).json(players);
  } catch (error) {
    console.error(error);
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

//enregistrer les resultats d'un match
router.post('/report-match-result', async (req, res) => {
  try {
    console.log("Received report match result with body:", req.body);
    const { match_id, user_id, victoire, defaite, event_id } = req.body;

    // Recherche d'un résultat existant pour l'utilisateur et le match
    const existingResultQuery = `SELECT * FROM resultat WHERE match_id = $1 AND user_id = $2`;
    const existingResult = await db.query(existingResultQuery, [match_id, user_id]);
    if (existingResult.length > 0) {
      // Avant de mettre à jour, vérifier s'il y a un conflit avec les résultats des adversaires

      // Récupérer les identifiants des paires du match
      const pairsQuery = `
          SELECT paire1, paire2 FROM match
          WHERE id = $1
        `;
      const pairsResult = await db.query(pairsQuery, [match_id]);
      const { paire1, paire2 } = pairsResult[0];

      // Récupérer les identifiants des joueurs pour chaque paire
      const playersQuery = `
          SELECT user1, user2 FROM paires WHERE id = $1
          UNION
          SELECT user1, user2 FROM paires WHERE id = $2
        `;
      const playersResult = await db.query(playersQuery, [paire1, paire2]);
      const players = playersResult;

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
      const opponentResults = await db.query(opponentResultsQuery, [match_id, opponentTeam]);
      const opponentData = opponentResults[0];

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
      await db.query(updateQuery, [match_id, user_id, victoire, defaite]);
      return res.status(200).json({ message: "Le résultat du match a été mis à jour avec succès." });
    }

    // Vérifie l'état actuel des résultats du match
    const checkQuery = `
        SELECT SUM(victoire) as total_victories, SUM(defaite) as total_defeats
        FROM resultat
        WHERE match_id = $1
        GROUP BY match_id
      `;
    const checkResult = await db.query(checkQuery, [match_id]);
    const matchResult = checkResult[0];

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
    const pairsResult = await db.query(pairsQuery, [match_id]);
    const { paire1, paire2 } = pairsResult[0];

    // Récupérer les identifiants des joueurs pour chaque paire
    const playersQuery = `
        SELECT user1, user2 FROM paires WHERE id = $1
        UNION
        SELECT user1, user2 FROM paires WHERE id = $2
      `;
    const playersResult = await db.query(playersQuery, [paire1, paire2]);
    const players = playersResult;

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
    const opponentResults = await db.query(opponentResultsQuery, [match_id, opponentTeam]);
    const opponentData = opponentResults[0];

    // Vérifier les conflits de résultat
    if (opponentData && ((victoire == 1 && opponentData.total_victoires > 0) || (defaite == 1 && opponentData.total_defaites > 0))) {
      return res.status(400).json({ message: "Les résultats du match sont contradictoires." });

    }

    // Insérer le résultat

    const insertQuery = `
    INSERT INTO resultat (match_id, user_id, victoire, defaite, event_id)
    VALUES ($1, $2, $3, $4, $5)
`;
    await db.query(insertQuery, [match_id, user_id, victoire, defaite, event_id]);

    res.status(200).json({ message: "Le résultat du match a été signalé avec succès." });
    console.log({ message: "Le résultat du match a été signalé avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur dans les résultats du match" });
    console.log({ message: "Erreur dans les résultats du match" });
  }
});
module.exports = router;
