//const Calendar =require('../backend1/request/Calendar');

const express = require("express");
const cors = require("cors");
const pool = require("./db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Importez la bibliothèque JWT
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();


const crypto = require("crypto");

// Générer une clé secrète aléatoire de 32 caractères
const secretKey = crypto.randomBytes(32).toString("hex");

console.log("Clé secrète générée :", secretKey);

const bodyParser = require("body-parser");
const pgp = require("pg-promise")();

const db = pgp({
  user: "postgres",
  host: "localhost",
  database: "badmaking",
  password: "Gribe123!",
  port: 5432,

});

const app = express();
const port = process.env.PORT || 3030;

app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}`);
});

app.get("/", async (request, response) => {
  response.status(200).send("hello world!");
});

app.use(cors());
app.use(bodyParser.json());

app.use(cookieParser(process.env.SESSION_SECRET));
const sessionSecret = process.env.SESSION_SECRET || 'un_secret_par_defaut';
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // passer à true si vous êtes en https
        maxAge: 1209600000 // deux semaines en millisecondes
    },
}));

app.get("/users", async (req, res) => {
  try {
    const data = await pool.query("SELECT * FROM users");
    res.json(data.rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des données" });
  }
});

//creer nouvel user
app.post("/postusers", async (req, response) => {
  try {
    const { nom, prenom, role, email, password } = req.body;

    // Crypter le mot de passe avec bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (nom, prenom, role, email, password)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id 
    `;

    const values = [nom, prenom, role, email, hashedPassword];

    pool.query(query, values, (err, res) => {
      if (err) {
        console.error(err);
        response
          .status(500)
          //.send("Erreur lors de l'insertion de l'utilisateur");
          .json({ message: "Erreur lors de l'insertion de l'utilisateur" });
      } else {
        //  response.status(200).send("Utilisateur ajouté");
        const id = res.rows[0].id; // Récupère l'ID de l'utilisateur nouvellement inséré
        response
          .status(200)
          .json({ id: id, prenom: prenom, message: "Utilisateur ajouté" });
      }
    });
  } catch (error) {
    console.error(error);
    response
      .status(500)
      .json({ message: "Erreur lors de la récupération des données" });
  }
});

//modifier un user
app.patch("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { nom, prenom, email, classement_simple, classement_double, classement_mixte } = req.body;

  try {
    // Mise à jour de l'utilisateur avec les nouvelles valeurs
    const data = await pool.query(
      "UPDATE users SET nom = $1, prenom = $2, email = $3, classement_simple = $4, classement_double = $5, classement_mixte = $6 WHERE id = $7 RETURNING *",
      [nom, prenom, email, classement_simple, classement_double, classement_mixte, id]
    );

    if (data.rows.length === 0) {
      // Aucun utilisateur trouvé avec cet ID, renvoyer une erreur
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Renvoyer l'utilisateur mis à jour
    res.json(data.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la mise à jour des données" });
  }
});



// Créer un nouvel événement
app.post("/postcalendar", async (req, res) => {
  try {
    const { title, type, user_id, status, terrain_id, date } = req.body;
    const newEvent = await pool.query(
      "INSERT INTO event (title,type,user_id,status,terrain_id,date ) VALUES ($1, $2, $3, $4,$5,$6)",
      [title, type, user_id, status, terrain_id, date]
    );
    res.json(newEvent.rows[0]);
    console.log("event crée");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la création de l'événement backend" });
  }
});

// Récupérer tous les événements
app.get("/calendar", async (req, res) => {
  try {
    const events = await pool.query("SELECT * FROM event");
    res.json(events.rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des événements" });
  }
});
// Récupérer tous les événements à partir d'une date spécifiée
app.get("/events", async (req, res) => {
  try {
    // Supposons que vous ayez une date spécifiée dans la requête GET sous le nom "date"
    // Vous pouvez récupérer la date depuis la requête comme suit
    const { date } = req.query;

    // Utilisez une requête SQL avec une clause WHERE pour filtrer les événements à partir de la date spécifiée
    const events = await pool.query("SELECT * FROM event WHERE date >= $1", [
      date,
    ]);

    res.json(events.rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des événements" });
  }
});

// Supprimer un événement par ID
app.delete("/calendar/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM event WHERE id = $1", [id]);
    res.json({ message: "Événement supprimé avec succès" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de l'événement" });
  }
});

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Non authentifié" });
  }
  // L'utilisateur est authentifié, continuez la requête
  next();
}

app.post("/updateParticipation/:eventId", async (req, res) => {
  try {
    const { participation, id, date: receivedDate } = req.body; // Inclure la date reçue du frontend
    const { eventId } = req.params;

    // Validation de la participation
    if (participation !== "Oui" && participation !== "Non") {
      return res.status(400).json({ message: 'La participation doit être "Oui" ou "Non"' });
    }

    // Conversion de la date reçue en UTC si nécessaire
    // Assurez-vous que receivedDate est déjà en format UTC (comme une chaîne ISO)
    const dateUTC = new Date(receivedDate).toISOString();
    console.log(dateUTC);

    // Vérification de l'existence de la participation
    const existingParticipation = await db.oneOrNone(
      "SELECT * FROM participation_events WHERE event_id = $1 AND user_id = $2",
      [eventId, id]
    );

    // Mise à jour ou insertion de la participation
    if (existingParticipation) {
      await db.none(
        "UPDATE participation_events SET participation = $1, date = $2 WHERE event_id = $3 AND user_id = $4",
        [participation === "Oui", dateUTC, eventId, id]
      );
    } else {
      await db.none(
        "INSERT INTO participation_events (event_id, user_id, date, participation) VALUES ($1, $2, $3, $4)",
        [eventId, id, dateUTC, participation === "Oui"]
      );
    }

    res.json({ message: "Participation mise à jour avec succès" });
    console.log("Participation mise à jour avec succès");
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la participation", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de la participation" });
  }
});


// match avec "oui" comme participation pour les events- recuperation nom prenom et date avec un JOIN
app.get("/ouiparticipation", async (req, res) => {
  try {
    let query = `
      SELECT p.event_id, p.user_id, p.participation, u.prenom, u.nom, u.classement_simple, u.classement_double, u.classement_mixte, (e.date + INTERVAL '1 hour') AS date 
      FROM participation_events AS p
      JOIN users AS u ON p.user_id = u.id
      JOIN event AS e ON p.event_id = e.id
      WHERE p.participation = 'True'
    `;

    const params = [];
    if (req.query.date && !isNaN(Date.parse(req.query.date))) {
      query += ` AND DATE(e.date) = $1`;
      params.push(req.query.date);
    }

    const events = await pool.query(query, params);
    res.json(events.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des événements" });
  }
});


//oui participation au jeu libre
app.get("/ouiparticipationjeulibre/:selectedDate", async (req, res) => {
  try {
    const selectedDate = req.params.selectedDate;
    const query = `
      SELECT p.user_id, p.participation, p.heure, u.prenom, u.nom
      FROM participation_jeu AS p
      JOIN users AS u ON p.user_id = u.id
      WHERE p.participation = 'True' AND DATE(p.date) = DATE('${selectedDate}');
    `;
    
    const participations = await pool.query(query);
    res.json(participations.rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des participations" });
  }
});


// Middleware d'authentification
/*
//login verification
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Recherche de l'utilisateur dans la base de données par adresse e-mail
    const query = "SELECT * FROM users WHERE email = $1 ";
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      // Aucun utilisateur trouvé avec cette adresse e-mail
      return res.status(401).json({ message: "Adresse e-mail incorrecte" });
    }

    // Comparaison du mot de passe entré avec le mot de passe stocké (utilisation de bcrypt)
    const user = result.rows[0];
    console.log("Mot de passe stocké :", user.password);
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // Mot de passe incorrect
      console.log("Mot de passe incorrect :", password);
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }
    // Génère un token
    const id = result.rows[0].id;
    const prenom = result.rows[0].prenom;
    const token = jwt.sign({ id, prenom }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
    console.log("token",token);
    // Stocke le token dans un cookie
    res.cookie('jwt', token, { httpOnly: true, secure: false });    
    res
    .status(200)
    .json({ id: id, prenom: prenom, message: "Connexion réussie" });
    /*
    const id = result.rows[0].id;
    const prenom = result.rows[0].prenom;
    res
      .status(200)
      .json({ id: id, prenom: prenom, message: "Connexion réussie" });
      
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
});*/

//nouvelle login securisé token opaque
app.post("/login", async (req, res) => {
  try {
    const { email, password} = req.body;
    const userQuery = "SELECT * FROM users WHERE email = $1";
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Adresse e-mail incorrecte" });
    }

    const user = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    // Générer un token opaque
    const token = crypto.randomBytes(48).toString('hex');
    const userId = user.id;
    const prenom = user.prenom;
    const mail = user.email;
    const nom = user.nom;

    // Définir une date d'expiration pour le token, par exemple 24 heures
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    // Stocker le token dans la base de données
    const tokenQuery = "INSERT INTO user_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)";
    await pool.query(tokenQuery, [token, userId, expiresAt]);

    // Envoyer le token au client
    res.cookie('session_token', token, { httpOnly: true, secure: false }); // Utilisez secure: true en production
    res.status(200).json({ id: userId, prenom: prenom, mail : mail,nom : nom, message: "Connexion réussie" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
});


// associate Color To Date
app.post("/associateColorToDate", async (req, res) => {
  try {
    const { date, color } = req.body;
    console.log("Valeur de 'color' dans la requête :", color);
    console.log("Valeur de 'date' dans la requête :", date);
    // Assurez-vous que la couleur et la date sont des valeurs valides
    // Vous pouvez ajouter une validation supplémentaire ici si nécessaire

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
  } catch (error) {
    console.error(
      "Erreur lors de l'association de la couleur à la date",
      error
    );
    res.status(500).json({
      message: "Erreur lors de l'association de la couleur à la date",
    });
  }
});

// Récupérer la couleur associée à une date
app.get("/getColorForDate/:date", async (req, res) => {
  try {
    const { date } = req.params;
    console.log("Date demandée :", date);

    // Requête SQL pour récupérer la couleur associée à la date spécifiée
    const getColorQuery = `
        SELECT color
        FROM date_color
        WHERE date = $1;
      `;

    // Exécutez la requête pour récupérer la couleur
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

app.get("/getAllDateColors", async (req, res) => {
  try {
    const query = "SELECT * FROM date_color";
    const result = await pool.query(query);

    if (result.rows.length > 0) {
      const dateColors = {};
      result.rows.forEach((row) => {
        dateColors[row.date] = row.color;
      });
      res.status(200).json(dateColors);
      console.log("ok");
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

// participation jeu libre
app.post("/participationJeuLibre/:userId", async (req, res) => {
  try {
    const { participation, date, heure } = req.body; // Assurez-vous que "date" est correctement envoyé depuis le frontend
    const { userId } = req.params;

    // Verifier que "heure" est au format correct (HH:MM)
    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(heure)) {
      return res
        .status(400)
        .json({ message: "Heure non valide. Le format doit être HH:MM." });
    }


    //  valider que la valeur de participation est soit "Oui" soit "Non"
    if (participation !== "Oui" && participation !== "Non") {
      return res
        .status(400)
        .json({ message: 'La participation doit être soit "Oui" soit "Non"' });
    }

    // Vérifier si l'enregistrement de participation existe déjà pour cet utilisateur et cette date
    const existingParticipation = await db.oneOrNone(
      "SELECT * FROM participation_jeu WHERE user_id = $1 AND date = $2 AND heure = $3" ,
      [userId, date, heure]
    );

    if (existingParticipation) {
      // Si l'enregistrement de participation existe, mettez à jour la participation existante
      await db.none(
        "UPDATE participation_jeu SET participation = $1 WHERE user_id = $2 AND date = $3 AND heure = $4",
        [participation === "Oui", userId, date,heure]
      );
    } else {
      // Si l'enregistrement de participation n'existe pas, insérez un nouvel enregistrement
      await db.none(
        "INSERT INTO participation_jeu (user_id, participation, date,heure) VALUES ($1, $2, $3,$4)",
        [userId, participation === "Oui", date,heure]
      );
    }

    res.json({ message: "Participation mise à jour avec succès" });
    console.log("Participation mise à jour avec succès");
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la participation", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de la participation" });
  }
});

//get les match avec nom et prenom et date
app.get("/matches", async (req, res) => {
  try {
    const query = `
    SELECT m.*, u.nom, u.prenom, event.date   
      FROM matchs AS m   
               

      JOIN user_match AS um       
      ON m.id = um.id_match       

      JOIN users AS u            
      ON um.id_user = u.id     

      JOIN terrain AS t
      ON m.terrain_id = t.id

      JOIN event as event
      ON t.id = event.terrain_id
    `;
    const matches = await pool.query(query);
    res.json(matches.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des matchs avec les noms des joueurs" });
  }
});


//creation match
app.post("/match", async (req, res) => {
  try {
    const { type, terrain_id } = req.body;
    const newMatch = await pool.query(
      "INSERT INTO matchs (type, terrain_id) VALUES ($1, $2) RETURNING *",
      [type, terrain_id]
    );
    res.json(newMatch.rows[0]);
    console.log("Match créé");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création du match en backend" });
  }
});

//get les match avec nom et prenom et date
app.get("/matches", async (req, res) => {
  try {
    const query = `
    SELECT m.*, u.nom, u.prenom, event.date   
      FROM matchs AS m   
               

      JOIN user_match AS um       
      ON m.id = um.id_match       

      JOIN users AS u            
      ON um.id_user = u.id     

      JOIN terrain AS t
      ON m.terrain_id = t.id

      JOIN event as event
      ON t.id = event.terrain_id
    `;
    const matches = await pool.query(query);
    res.json(matches.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des matchs avec les noms des joueurs" });
  }
});

// recupere donnée user_match + nom, prenom + date de participation events
app.get("/matches1", async (req, res) => {
  try {
    const query = `
      SELECT um.id_match,
              um.id_user,
             u.nom,
             u.prenom,
             (pe.date + INTERVAL '1 hour') 

      FROM user_match um
      JOIN users u ON um.id_user = u.id
      JOIN participation_events pe ON u.id = pe.user_id

    `;
    const matches = await pool.query(query);
    res.json(matches.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des matchs avec les noms des joueurs et les dates des événements" });
  }
});


//Requête POST pour créer des paires
app.post("/creerPaires", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const paires = req.body; // Liste d'objets { event_id, user1, user2 }

    paires.forEach(async (paire) => {
      const insertQuery = `
        INSERT INTO paires (event_id, user1, user2)
        VALUES ($1, $2, $3)
      `;
      await client.query(insertQuery, [paire.event_id, paire.user1, paire.user2]);
    });

    await client.query('COMMIT');
    res.status(200).json({ message: "Paires créées avec succès" });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création des paires" });
  } finally {
    client.release();
  }
});

 //forme les paires en melangeant les joueurs et en faisant attention a l'event_id
app.post("/formerPaires", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const participants = req.body; // Les données des participants
    const groupedByEvent = participants.reduce((acc, participant) => {
      // Regrouper les participants par event_id
      acc[participant.event_id] = acc[participant.event_id] || [];
      acc[participant.event_id].push(participant);
      return acc;
    }, {});

    let response = [];

    for (const [eventId, users] of Object.entries(groupedByEvent)) {
      // Mélanger l'array pour former des paires aléatoires
      shuffleArray(users);

      // Former des paires
      for (let i = 0; i < users.length; i += 2) {
        if (users[i + 1]) {
          // Insérer la paire dans la base de données
          const insertQuery = 'INSERT INTO paires (event_id, user1, user2) VALUES ($1, $2, $3)';
          await client.query(insertQuery, [eventId, users[i].user_id, users[i + 1].user_id]);
        } else {
          // Gérer le cas où un utilisateur reste sans paire
          response.push({ message: `L'utilisateur ${users[i].user_id} (événement ${eventId}) est resté sans paire` });
        }
      }
    }

    await client.query('COMMIT');
    res.status(200).json(response.length > 0 ? response : { message: "Toutes les paires ont été formées avec succès" });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la formation des paires" });
  } finally {
    client.release();
  }
});

//recupère les paires aves les nom 
app.get("/recupererPaires", async (req, res) => {
  try {
    const query = `
      SELECT p.id as pair_id, 
             p.event_id,
             e.title as nom_event,    -- Nom de l'événement
            (  e.date + INTERVAL '1 hour') as date_event,    -- Ajout de la date de l'événement
             u1.nom as user1_nom, 
             u1.prenom as user1_prenom,
             u2.nom as user2_nom,
             u2.prenom as user2_prenom
      FROM paires p
      JOIN users u1 ON p.user1 = u1.id
      JOIN users u2 ON p.user2 = u2.id
      JOIN event e ON p.event_id = e.id;  -- Jointure avec la table event
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des paires" });
  }
});


// Fonction pour mélanger un tableau (Fisher-Yates shuffle)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

//post creation de poules

//post creation de poules
app.post("/creerPoules", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(`
      SELECT event_id, COUNT(*) as nombre_paires
      FROM paires
      GROUP BY event_id;
    `);

    let messages = [];

    for (const row of result.rows) {
      const nombrePaires = parseInt(row.nombre_paires);
      const eventId = row.event_id;

      if (nombrePaires < 3) {
        messages.push(`Pas assez de paires pour former une poule pour l'événement ${eventId}`);
        console.log(`Pas assez de paires pour former une poule pour l'événement ${eventId}`);
        continue;
      }

      let taillesPoules = [];
      let totalPaires = nombrePaires; // Utilisation d'une variable temporaire pour ne pas modifier nombrePaires directement
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
          const paireId = paires.rows[indexPaire++].id;
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
  } finally {
    client.release();
  }
});


//recuperer poule 
app.get("/recupererPoules", async (req, res) => {
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
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des poules et des informations des joueurs" });
  }
});

// post pour créer toutes les combinaisons de matchs 

app.post("/creerMatchs", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Récupérer les numéros de poule existants
    const poulesExistantesResult = await client.query(`
      SELECT DISTINCT poule 
      FROM poule;
    `);
    const poulesExistantes = poulesExistantesResult.rows.map(row => row.poule);

    // Récupérer les paires pour chaque poule
    const poulesResult = await client.query(`
      SELECT poule, paire_id 
      FROM poule 
      ORDER BY poule, id;
    `);

    // Regrouper les paires par poule
    const pairesParPoule = {};
    poulesResult.rows.forEach(row => {
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
  } finally {
    client.release();
  }
});

//get recuperer les matchs crée

app.get("/recupererMatchs", async (req, res) => {
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
             u4.prenom as user2_prenom_paire2
             
      FROM match m
      JOIN paires p1 ON m.paire1 = p1.id
      JOIN paires p2 ON m.paire2 = p2.id
      JOIN users u1 ON p1.user1 = u1.id
      JOIN users u2 ON p1.user2 = u2.id
      JOIN users u3 ON p2.user1 = u3.id
      JOIN users u4 ON p2.user2 = u4.id

    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des matchs" });
  }
});








