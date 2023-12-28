
const BASE_URL = 'http://192.168.1.6:3030'
const express = require("express");
const db = require("../../db");

const router = express.Router();




const cors = require("cors");


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
const cron = require('node-cron');

// 30 secondes : */30 * * * * *
// 3 mintes : */3 * * * * *
// 10 h : 0 */10 * * * *
// 24h : 0 0 */1 * * *

if (process.env.NODE_ENV !== 'test') {
    cron.schedule('0 */10 * * * *', async () => {
        const client = await db.connect();
        console.log("Travail Cron démarré - vérification des événements pour créer des paires");

        try {
            const eventQuery = `
            SELECT id, status, 
            TO_CHAR(date, 'YYYY-MM-DD') AS event_date, 
            TO_CHAR(heure, 'HH24:MI:SS') AS event_time
            FROM event 
            WHERE date BETWEEN NOW()::DATE AND NOW()::DATE + INTERVAL '1 DAY'
            
            AND heure BETWEEN NOW()::TIME AND NOW()::TIME + INTERVAL '2 MINUTES'
            AND paire_creer = false`;
            const upcomingEvents = await client.query(eventQuery);

            if (Array.isArray(upcomingEvents) && upcomingEvents.length > 0) {
                for (const event of upcomingEvents) {
                    console.log(upcomingEvents);
                    console.log("Données reçues du serveur:", event);
                    // Fetch participants for the event

                    
                    const participantsQuery = `
              SELECT p.event_id, p.user_id, p.participation, u.prenom, u.nom, 
                     u.classement_double, u.classement_mixte, 
                     TO_CHAR(e.date,'YYYY-MM-DD') AS "date",
                     e.status as status
              FROM participation_events AS p
              JOIN users AS u ON p.user_id = u.id
              JOIN event AS e ON p.event_id = e.id
              WHERE p.participation = 'True' AND p.event_id = $1`;


                    const participants = await client.query(participantsQuery, [event.id]);
                    console.log(participantsQuery);
                    console.log(participants);

                    // Vérifier si le nombre de participations est inférieur à 6
                    if (!participants.rows || participants.rows.length < 6) {
                        console.log(`L'événement ${event.id} a moins de 6 participants ou aucun participant, il ne sera pas traité.`);
                        continue; // Passer à l'événement suivant
                    }

                    if (event.status === 'Tous niveau') {
                        console.log(`Paire Tous niveau créée pour l'événement : ${event.id}`);
                        await handleCreerPaires(participants);
                    } else if (event.status === 'Par niveau') {
                        console.log(`Paire par classement créée pour l'événement : ${event.id}`);
                        await handleCreerPairesParClassement(participants);
                    }
                    await createPools(event.id);
                    await createMatches(event.id);
                    // Update the event as pairs created
                    const updateEventQuery = `UPDATE event SET paire_creer = true WHERE id = $1`;
                    await client.query(updateEventQuery, [event.id]);
                }
            } else {
                console.log("No upcoming events or invalid format");
            }
        } catch (error) {
            console.error('Error in scheduled task: ', error);
        } finally {
            client.release();
        }
    });

}

async function handleCreerPaires(participants) {
    try {
        const url = `${BASE_URL}/paires/formerPaires`;
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(participants),
        };

        const response = await fetch(url, requestOptions);

        // Vérifier le statut de la réponse
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Obtenir la réponse brute en texte
        const text = await response.text();

        try {
            // Essayer de parser la réponse en JSON
            const data = JSON.parse(text);
            console.log("Données reçues du serveur:", data);
        } catch (error) {
            // Gérer les erreurs de parsing JSON
            console.error('Erreur lors du parsing JSON:', error);
            console.log('Réponse brute:', text);
        }

    } catch (error) {
        console.error('Erreur lors de la création des paires:', error);
    }
}


async function handleCreerPairesParClassement(participants) {
    try {
        const url = `${BASE_URL}/paires/formerPaireParClassementDouble`;
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(participants),
        };

        const response = await fetch(url, requestOptions);
        // Vérifier le statut de la réponse
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Obtenir la réponse brute en texte
        const text = await response.text();

        try {
            // Essayer de parser la réponse en JSON
            const data = JSON.parse(text);
            console.log("Données reçues du serveur:", data);
        } catch (error) {
            // Gérer les erreurs de parsing JSON
            console.error('Erreur lors du parsing JSON:', error);
            console.log('Réponse brute:', text);
        }

    } catch (error) {
        console.error('Erreur lors de la création des paires:', error);
    }

}

async function createPools(eventId) {
    try {
        const url = `${BASE_URL}/poule/creerPoules`;
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        };

        const response = await fetch(url, requestOptions);
        // Vérifier le statut de la réponse
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Obtenir la réponse brute en texte
        const text = await response.text();

        try {
            // Essayer de parser la réponse en JSON
            const data = JSON.parse(text);
            console.log("Données reçues du serveur:", data);
        } catch (error) {
            // Gérer les erreurs de parsing JSON
            console.error('Erreur lors du parsing JSON:', error);
            console.log('Réponse brute:', text);
        }

    } catch (error) {
        console.error('Erreur lors de la création des poules:', error);
    }
}

async function createMatches(eventId) {
    try {
        const url = `${BASE_URL}/match/creerMatchs`;
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        };

        const response = await fetch(url, requestOptions);
        // Vérifier le statut de la réponse
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Obtenir la réponse brute en texte
        const text = await response.text();

        try {
            // Essayer de parser la réponse en JSON
            const data = JSON.parse(text);
            console.log("Données reçues du serveur:", data);
        } catch (error) {
            // Gérer les erreurs de parsing JSON
            console.error('Erreur lors du parsing JSON:', error);
            console.log('Réponse brute:', text);
        }

    } catch (error) {
        console.error('Erreur lors de la création des matchs:', error);
    }
}
module.exports = router;
