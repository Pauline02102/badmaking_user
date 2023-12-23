

const express = require("express");
const db = require("../../db");
const bodyParser = require("body-parser");
const router = express.Router();




const cors = require("cors");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Importez la bibliothèque JWT
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const crypto = require("crypto");
const secretKey = crypto.randomBytes(32).toString("hex");

//const pgp = require("pg-promise")();

const app = express();
const port = process.env.PORT || 3030;


//verifier que c'est le bon user conecté 
const userAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token manquant ou mal formaté" });
    }
    const token = req.headers.authorization.split(" ")[1]; // Bearer TOKEN_VALUE

    // Interroge la base de données pour le jeton
    const tokenQuery = "SELECT * FROM user_tokens WHERE token = $1";
    const tokenResult = await db.query(tokenQuery, [token]);

    if (tokenResult.length === 0) {
      return res.status(401).json({ message: "Token invalide" });
    }

    const tokenData = tokenResult[0];

    // Regarde si c'est expiré ou non
    if (new Date() > new Date(tokenData.expires_at)) {
      return res.status(401).json({ message: "Token expiré " });
    }

    // Récupére les détails de l'utilisateur
    const userQuery = "SELECT * FROM users WHERE id = $1";
    const userResult = await db.query(userQuery, [tokenData.user_id]);

    if (userResult.length === 0) {
      return res.status(401).json({ message: "Utilisateur pas trouvé" });
    }

    const user = userResult[0];

    // Ajouter les détails de l'utilisateur à la demande d'objet
    req.user = {
      id: user.id,
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      role: user.role,
      classement_simple: user.classement_simple,
      classement_double: user.classement_double,
      classement_mixte: user.classement_mixte
    };
    next(); //Passer au prochain middleware ou gestionnaire de route
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur durant l'authentification" });
  }
};

const isAdminMiddleware = (req, res, next) => {

  if (!req.user) {
    return res.status(401).json({ message: "Utilisateur non authentifié" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès interdit. Vous devez être administrateur pour effectuer cette action." });
  }
  next();
};

module.exports = userAuthMiddleware;
module.exports = isAdminMiddleware;
router.use(express.json());

router.get("/get-user-info", userAuthMiddleware, async (req, res) => {
  // Si le middleware réussit,  un utilisateur valide
  // req.user est ajouté par userAuthMiddleware
  const userInfo = {
    id: req.user.id,
    prenom: req.user.prenom,
    nom: req.user.nom,
    email: req.user.email,
    role: req.user.role,
    classement_simple: req.user.classement_simple,
    classement_double: req.user.classement_double,
    classement_mixte: req.user.classement_mixte
  };
  res.json({ success: true, user: userInfo });

});

//deconnecter un user
router.post("/logout", userAuthMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Récupère le token

    // Supprime le token de la base de données 
    const deleteTokenQuery = "DELETE FROM user_tokens WHERE token = $1";
    await db.query(deleteTokenQuery, [token]);

    res.json({ message: "Déconnexion réussie" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la déconnexion" });
  }
});
const hashedPassword = "$2b$10$lAo/2PH8PEFM.zMlRfA3Ke5HXBYpHRS1IwN8i4xIJf/RDjryn/IF6"; // La version hashée
const plainPassword = "Leroy"; // Votre mot de passe en clair


//nouvelle login securisé token opaque

// Nouvelle route de connexion sécurisée avec token opaque
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier que l'email et le mot de passe ne sont pas vides
    if (!email || !password) {
      return res.status(400).json({ message: "L'email et le mot de passe sont requis." });
    }

    // Normaliser l'email pour la comparaison
    const normalizedEmail = email.toLowerCase().trim();


    // Préparer la requête SQL pour trouver un utilisateur par email
    const userQuery = "SELECT * FROM users WHERE LOWER(email) = LOWER($1)";
    const userResult = await db.query(userQuery, [normalizedEmail]);

    // Vérifier si un utilisateur a été trouvé
    if (userResult.length === 0) {
      return res.status(401).json({ message: "Adresse e-mail incorrecte." });
    }

    const user = userResult[0];

    // Vérifier le mot de passe
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: "Mot de passe incorrect." });
    }

    // Vérifier si un token existe déjà pour cet utilisateur
    const existingTokenQuery = "SELECT * FROM user_tokens WHERE user_id = $1";
    const existingTokenResult = await db.query(existingTokenQuery, [user.id]);

    let token;
    let expiresAt;

    if (existingTokenResult.length > 0) {
      // Un token existe déjà, mettez à jour ce token existant
      token = existingTokenResult[0].token;
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Mettre à jour la date d'expiration si nécessaire
      const updateTokenQuery = "UPDATE user_tokens SET expires_at = $1 WHERE user_id = $2";
      await db.query(updateTokenQuery, [expiresAt, user.id]);
    } else {
      // Générer un nouveau token opaque
      token = crypto.randomBytes(48).toString('hex');
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Expire dans 24 heures

      // Stocker le nouveau token dans la base de données
      const insertTokenQuery = "INSERT INTO user_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)";
      await db.query(insertTokenQuery, [token, user.id, expiresAt]);
    }

    // Envoyer le token au client
    res.cookie('session_token', token, { httpOnly: true, secure: true }); // Utilisez secure: true en production
    res.status(200).json({
      token,
      id: user.id,
      prenom: user.prenom,
      mail: user.email,
      nom: user.nom,
      role: user.role,
      message: "Connexion réussie."
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: "Erreur lors de la connexion." });
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
    const userResult = await db.query(userQuery, [userId]);
    if (userResult.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const currentUser = userResult[0];

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
    await db.query(updateQuery, values);

    res.json({ message: 'Profil mis à jour avec succès' });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil :", error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
  }
});
module.exports = router;
