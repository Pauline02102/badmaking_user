

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

//creer nouvel user
router.post("/postusers", async (req, response) => {
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


module.exports = router;
