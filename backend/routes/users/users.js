

const express = require("express");
const db = require("../db.js");

const router = express.Router();



const cors = require("cors");

const bcrypt = require("bcrypt");
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

//creer nouvel user
router.post("/postusers", async (req, res) => {
    try {
        const { nom, prenom, role, email, password, classementSimple, classementDouble, classementMixte } = req.body;

        // Vérifie d'abord si l'utilisateur avec cet e-mail existe déjà dans la base de données
        const checkUserQuery = 'SELECT * FROM users WHERE email = $1';
        const existingUsers = await db.manyOrNone(checkUserQuery, [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'L\'utilisateur avec cet e-mail existe déjà.' });
        }

        // Hash du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insére l'utilisateur dans la base de données grace a une procédure
        const insertUserQuery = 'CALL insert_user($1, $2, $3, $4, $5, $6, $7, $8)';
        await db.none(insertUserQuery, [nom, prenom, role, email, hashedPassword, classementSimple, classementDouble, classementMixte]);

        return res.status(201).json({
            message: 'Inscription réussie.'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de l\'inscription.' });
    }
});



module.exports = router;
