
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

//forme les paires en melangeant les joueurs et en faisant attention a l'event_id
router.post("/formerPaires", async (req, res) => {
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
                    console.log({ message: `L'utilisateur ${users[i].user_id} (événement ${eventId}) est resté sans paire` });
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

//paire aleatoire 
router.post("/formerPaireParClassementDouble", async (req, res) => {
    const client = await pool.connect();
    let responseSent = false;
    try {
        await client.query('BEGIN');

        const participants = req.body; // Les données des participants
        // Extrait le tableau de participants
        const waitingList = []; // Liste d'attente pour les joueurs du groupe moyen
        const formedPairs = []; // Paires formées
        console.log(participants)
        if (!Array.isArray(participants)) {
            return res.status(400).json({ message: 'Les données des participants ne sont pas au format attendu' });
        }

        const groupedByEvent = participants.reduce((acc, participant) => {

            // Regrouper les participants par event_id et par niveau
            acc[participant.event_id] = acc[participant.event_id] || { haut: [], bas: [], moyen: [] };
            if (participant.classement_double >= 1 && participant.classement_double <= 4) {
                acc[participant.event_id].bas.push(participant);
            } else if (participant.classement_double >= 8 && participant.classement_double <= 12) {
                acc[participant.event_id].haut.push(participant);
            } else if (participant.classement_double >= 5 && participant.classement_double <= 7) {
                acc[participant.event_id].moyen.push(participant);
            }
            return acc;
        }, {});

        for (const [eventId, levels] of Object.entries(groupedByEvent)) {
            const hautParticipants = levels.haut;
            const basParticipants = levels.bas;
            const moyenParticipants = levels.moyen;

            // Formez des paires entre bas et haut
            while (basParticipants.length > 0 && hautParticipants.length > 0) {
                const userBas = basParticipants.pop();
                const userHaut = hautParticipants.pop();

                // Insérez la paire dans la table "paires"
                await client.query('INSERT INTO paires (event_id, user1, user2) VALUES ($1, $2, $3)', [eventId, userBas.user_id, userHaut.user_id]);
                formedPairs.push({ user1: userBas, user2: userHaut });
            }
            // Ajouter les joueurs bas et haut restants dans la liste d'attente
            waitingList.push(...basParticipants, ...hautParticipants);
            // console.log seulement s'il y a des joueurs du groupe bas
            if (basParticipants.length > 0) {
                basParticipants.forEach(user => {
                    console.log(`Joueur du groupe bas ajouté à la liste d'attente: ${user.prenom} ${user.nom} (ID: ${user.user_id})`);
                });
            } else {
                console.log("Aucun joueur du groupe bas à ajouter à la liste d'attente");
            }
            //  console.log seulement s'il y a des joueurs du groupe haut
            if (hautParticipants.length > 0) {
                hautParticipants.forEach(user => {
                    console.log(`Joueur du groupe haut ajouté à la liste d'attente: ${user.prenom} ${user.nom} (ID: ${user.user_id})`);
                });
            } else {
                console.log("Aucun joueur du groupe haut à ajouter à la liste d'attente.");
            }

            // Formez des paires entre joueurs moyens
            while (moyenParticipants.length >= 2) {
                const joueur1 = moyenParticipants.pop();
                const joueur2 = moyenParticipants.pop();

                // Insérez la paire dans la table "paires"
                await client.query('INSERT INTO paires (event_id, user1, user2) VALUES ($1, $2, $3)', [eventId, joueur1.user_id, joueur2.user_id]);
                formedPairs.push({ user1: joueur1, user2: joueur2 });
            }

            // Si le nombre de joueurs moyens est impair
            if (moyenParticipants.length === 1) {
                const joueurMoyenRestant = moyenParticipants.pop();

                // Vérifiez s'il y a un joueur en attente
                if (waitingList.length > 0) {
                    const joueurEnAttente = waitingList.pop();

                    // Formez la paire entre joueurMoyenRestant et joueurEnAttente
                    formedPairs.push({ joueurMoyenRestant, joueurEnAttente });

                    // Retirez le joueur en attente de la liste d'attente
                    const index = waitingList.indexOf(joueurEnAttente);
                    if (index !== -1) {
                        waitingList.splice(index, 1);
                    }

                    // Insérez la paire dans la table "paires"
                    await client.query('INSERT INTO paires (event_id, user1, user2) VALUES ($1, $2, $3)', [eventId, joueurMoyenRestant.user_id, joueurEnAttente.user_id]);
                } else {
                    // Aucun joueur en attente disponible
                    // Ajoutez le joueur moyen restant à la liste d'attente
                    waitingList.push(joueurMoyenRestant);
                    console.log(`Le joueur du groupe moyen ${joueurMoyenRestant.user_id} est ajouté à la liste d'attente car la liste d'attente est vide`);
                }
            }
        }
        // Ajoutez les joueurs restants de la liste d'attente à un message
        const joueursRestants = waitingList.map(joueur => `${joueur.prenom} ${joueur.nom}`).join(', ');

        await client.query('COMMIT');
        if (!responseSent) {
            res.status(200).json({ message: "Paire formée", formedPairs, joueursRestants });
        }
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erreur lors de la formation des paires :', error);
        res.status(500).json({ message: "Erreur lors de la formation des paires" });
    } finally {
        client.release();
    }
});

//recupère les paires aves les nom 
router.get("/recupererPaires", async (req, res) => {
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
module.exports = router;
