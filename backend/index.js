//const Calendar =require('../backend1/request/Calendar');
const express = require("express");
const cors = require("cors");
const pool = require("./db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Importez la bibliothèque JWT

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


// match avec "oui" comme participation - recuperation nom prenom et date avec un JOIN
app.get("/ouiparticipation", async (req, res) => {
  try {
    const query = `
      SELECT p.event_id, p.user_id, p.participation, u.prenom, u.nom, e.date
      FROM participation_events AS p
      JOIN users AS u ON p.user_id = u.id
      JOIN event AS e ON p.event_id = e.id
      WHERE p.participation = 'True';
    `;
    const events = await pool.query(query);
    res.json(events.rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des événements" });
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

    // Si l'adresse e-mail et le mot de passe sont corrects, vous pouvez générer un jeton d'authentification ici
    // et le renvoyer comme réponse pour gérer l'authentification ultérieurement
    // Exemple : const token = generateAuthToken(user.id);
    // Si l'adresse e-mail et le mot de passe sont corrects, générez un jeton d'authentification
    /*const token = jwt.sign(
      { id: user.id, email: user.email }, // Les données que vous souhaitez inclure dans le token
      "f630f38a7a67e3044f05c3dc1cdc3208e1b48a8a924370c00117ba630c14c7fd", // Remplacez par une clé secrète sécurisée
      { expiresIn: "1h" } // Optionnel : la durée de validité du token (par exemple, 1 heure)
    );*/

    // Réponse réussie
    //res.status(200).json({ message: "Connexion réussie", id: user.id });
    const id = result.rows[0].id;
    const prenom = result.rows[0].prenom;
    res
      .status(200)
      .json({ id: id, prenom: prenom, message: "Connexion réussie" });
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



