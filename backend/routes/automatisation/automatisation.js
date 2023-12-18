


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
const cron = require('node-cron');

cron.schedule('* * * * *', async () => {
    const client = await db.connect();
    console.log("Travail Cron démarré - vérification des événements pour créer des paires");

    try {
        // Get events starting within the next 24 hours


        const eventQuery = `
    SELECT id, status, TO_CHAR(date, 'YYYY-MM-DD HH24:MI:SS') AS start_time
    FROM event 
    WHERE date BETWEEN NOW() AND NOW() + INTERVAL '2 MINUTES'
    AND paire_creer = false`;
        const { rows: upcomingEvents } = await client.query(eventQuery);
        console.log('upcomingEvents:', upcomingEvents);
        if (upcomingEvents && Array.isArray(upcomingEvents)) {
            for (const event of upcomingEvents) {
                console.log('upcomingEvents:', upcomingEvents);

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
                const { rows: participants } = await client.query(participantsQuery, [event.id]);

                if (event.status === 'Random') {
                    console.log(`Paire random crée pour l'event : ${event.id}`);
                    await handleCreerPaires(participants);
                } else if (event.status === 'par niveau') {
                    console.log(`Paire par classement crée pour l'event : ${event.id}`);
                    await handleCreerPairesParClassement(participants);
                }
                await createPools(event.id);
                await createMatches(event.id);
                // Update the event as pairs created
                const updateEventQuery = `UPDATE event SET paire_creer = true WHERE id = $1`;
                await client.query(updateEventQuery, [event.id]);
                console.log('upcomingEvents:', upcomingEvents);

            }
        } else {
            console.log('No upcoming events found or unexpected format.');
        }
    } catch (error) {
        console.error('Error in scheduled task: ', error);
    } finally {
        client.release();
    }
});

async function handleCreerPaires(participants) {
    try {
        const url = 'http://192.168.1.6:3030/formerPaires';
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(participants),
        };

        const response = await fetch(url, requestOptions);
        const data = await response.json();
        console.log("Données reçues du serveur:", data);
    } catch (error) {
        console.error('Erreur lors de la création des paires:', error);
    }

}

async function handleCreerPairesParClassement(participants) {
    try {
        const url = 'http://192.168.1.6:3030/formerPaireParClassementDouble';
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(participants),
        };

        const response = await fetch(url, requestOptions);
        const data = await response.json();
        console.log("Données reçues du serveur:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Erreur lors de la création des paires:', error);
    }

}

async function createPools(eventId) {
    try {
        const url = 'http://192.168.1.6:3030/creerPoules';
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        };

        const response = await fetch(url, requestOptions);
        const data = await response.json();
        console.log("Données reçues du serveur:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Erreur lors de la création des poules:', error);
    }
}

async function createMatches(eventId) {
    try {
        const url = 'http://192.168.1.6:3030/creerMatchs';
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        };

        const response = await fetch(url, requestOptions);
        const data = await response.json();
        console.log("Matchs créés: ", data);
    } catch (error) {
        console.error('Erreur lors de la création des matchs:', error);
    }
}
module.exports = router;
