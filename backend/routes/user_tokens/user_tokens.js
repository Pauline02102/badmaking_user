

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

//verifier que c'est le bon user conecté 
const userAuthMiddleware = async (req, res, next) => {
  try {

    const token = req.headers.authorization.split(" ")[1]; // Bearer TOKEN_VALUE

    // Interroge la base de données pour le jeton
    const tokenQuery = "SELECT * FROM user_tokens WHERE token = $1";
    const tokenResult = await pool.query(tokenQuery, [token]);

    if (tokenResult.rows.length === 0) {
      return res.status(401).json({ message: "Token invalide" });
    }

    const tokenData = tokenResult.rows[0];

    // Regarde si c'est expiré ou non
    if (new Date() > new Date(tokenData.expires_at)) {
      return res.status(401).json({ message: "Token expiré " });
    }

    // Récupére les détails de l'utilisateur
    const userQuery = "SELECT * FROM users WHERE id = $1";
    const userResult = await pool.query(userQuery, [tokenData.user_id]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Utilisateur pas trouvé" });
    }

    const user = userResult.rows[0];

    // Ajouter les détails de l'utilisateur à la demande d'objet
    req.user = {
      id: user.id,
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      classement_simple : user.classement_simple,
      classement_double : user.classement_double,
      classement_mixte : user.classement_mixte
    };
    next(); //Passer au prochain middleware ou gestionnaire de route
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur durant l'authentification" });
  }
};

router.get("/get-user-info", userAuthMiddleware, async (req, res) => {
  // Si le middleware réussit,  un utilisateur valide
  // req.user est ajouté par userAuthMiddleware
  const userInfo = {
    id: req.user.id,
    prenom: req.user.prenom,
    nom: req.user.nom,
    email : req.user.email,
    classement_simple : req.user.classement_simple,
    classement_double : req.user.classement_double,
    classement_mixte : req.user.classement_mixte
  };
  res.json({ success: true, user: userInfo });
});

//deconnecter un user
router.post("/logout", userAuthMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Récupère le token

    // Supprime le token de la base de données 
    const deleteTokenQuery = "DELETE FROM user_tokens WHERE token = $1";
    await pool.query(deleteTokenQuery, [token]);

    res.json({ message: "Déconnexion réussie" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la déconnexion" });
  }
});

//nouvelle login securisé token opaque
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
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
    res.status(200).json({token, id: userId, prenom: prenom, mail: mail, nom: nom, message: "Connexion réussie" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
});
 

// Route pour la mise à jour du profil
router.put('/update-profile', userAuthMiddleware, async (req, res) => {
  if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
  }

  const userId = req.user.id;
  try {
      // Récupérer les informations actuelles de l'utilisateur
      const userQuery = "SELECT * FROM users WHERE id = $1";
      const userResult = await pool.query(userQuery, [userId]);
      if (userResult.rows.length === 0) {
          return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      const currentUser = userResult.rows[0];

      // Utiliser les nouvelles valeurs ou conserver les anciennes si non fournies
      const {
          prenom = currentUser.prenom,
          nom = currentUser.nom,
          email = currentUser.email,
          classement_simple = currentUser.classement_simple,
          classement_double = currentUser.classement_double,
          classement_mixte = currentUser.classement_mixte
      } = req.body;

      // Mise à jour du profil de l'utilisateur
      const updateQuery = `
      UPDATE users
      SET prenom = $1, nom = $2, email = $3, classement_simple = $4, classement_double = $5, classement_mixte = $6
      WHERE id = $7
    `;

      const values = [prenom, nom, email, classement_simple, classement_double, classement_mixte, userId];
      await pool.query(updateQuery, values);

      res.json({ message: 'Profil mis à jour avec succès' });
  } catch (error) {
      console.error("Erreur lors de la mise à jour du profil :", error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
  }
});
module.exports = router;
