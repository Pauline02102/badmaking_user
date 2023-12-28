/*const pgp = require('pg-promise')();

let dbConfig;

if (process.env.NODE_ENV === 'test') {
    // Configuration pour la base de données de test
    dbConfig = {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.TEST_DB_NAME, 
        password: process.env.DB_PASS,
        port: process.env.DB_PORT,
    };
} else {
    // Configuration pour la base de données de production
    dbConfig = {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASS,
        port: process.env.DB_PORT,
    };
}

const db = pgp(dbConfig);

module.exports = db;
*/
const pgp = require('pg-promise')();

let db;

if (process.env.NODE_ENV === 'test') {
    // Configuration pour la base de données de test
    db = pgp({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.TEST_DB_NAME,
        password: process.env.DB_PASS,
        port: process.env.DB_PORT,
    });
} else {
    // Configuration pour la base de données de production (Heroku)
    db = pgp(process.env.BASE_URL);
   
}

module.exports = db;

