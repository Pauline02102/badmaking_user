

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

//creer nouvel user
router.post("/postusers", async (req, res) => {
    try {
        const { nom, prenom, role, email, password, classementSimple, classementDouble, classementMixte } = req.body;

        // Vérifiez d'abord si l'utilisateur avec cet e-mail existe déjà dans la base de données
        const checkUserQuery = 'SELECT * FROM users WHERE email = $1';
        const existingUsers = await db.manyOrNone(checkUserQuery, [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'L\'utilisateur avec cet e-mail existe déjà.' });
        }

        // Hash du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insérez l'utilisateur dans la base de données
        const insertUserQuery = `
          INSERT INTO users (nom, prenom, role, email, password, classement_simple, classement_double, classement_mixte)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id, prenom
        `;

        const newUser = await db.one(insertUserQuery, [nom, prenom, role, email, hashedPassword, classementSimple, classementDouble, classementMixte]);

        if (newUser) {
            return res.status(201).json({
                id: newUser.id,
                prenom: newUser.prenom,
                message: 'Inscription réussie.'
            });
        } else {
            return res.status(500).json({ message: 'Erreur lors de l\'inscription.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de l\'inscription.' });
    }
});



module.exports = router;
