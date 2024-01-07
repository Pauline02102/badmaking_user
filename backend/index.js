
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const https = require('https');
const fs = require('fs');
const paires = require("./routes/paires/paires.js");
const automatisation = require("./routes/automatisation/automatisation.js");
const date_color = require("./routes/date_color/date_color.js");
const event = require("./routes/event/event.js");
const match = require("./routes/match/match.js");
const participation_event = require("./routes/participation_event/participation_event.js");
const participation_jeu = require("./routes/participation_jeu/participation_jeu.js");
const poule = require("./routes/poule/poule.js");
const resultat = require("./routes/resultat/resultat.js");
const user_tokens = require("./routes/user_tokens/user_tokens.js");
const users = require("./routes/users/users.js");

console.log('DB Host:', process.env.DB_HOST);
console.log('DB User:', process.env.DB_USER);
console.log('DB User:', process.env.DB_NAME);
process.env.TZ = 'Europe/Paris';
console.log('fuseau', process.env.TZ);
// ... et ainsi de suite pour les autres variables

const app = express();

const db = require('./db.js');
const moment = require('moment-timezone');
console.log("Heure actuelle:", moment().tz("Europe/Paris").format());

const corsOptions = {
  origin: '*', 
  optionsSuccessStatus: 200,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: 'Authorization,Content-Type',
};

app.use(cors(corsOptions));

const httpsOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/rixbad.ovh/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/rixbad.ovh/fullchain.pem')
};

db.query('SELECT NOW()', [])
  .then(res => {
    console.log("Connexion à la base de données PostgreSQL réussie, heure actuelle :", res[0].now);
  })
  .catch(err => {
    console.error("Erreur lors de la connexion à la base de données PostgreSQL :", err);
  });


app.use(express.json());
// Vérifier l'environnement avant de lancer le serveur HTTPS
if (process.env.NODE_ENV !== 'test') {
  https.createServer(httpsOptions, app).listen(443, () => {
    console.log('Serveur HTTPS en cours d\'exécution sur le port 443');
  });
}



app.use("/paires", paires);
app.use("/automatisation", automatisation);
app.use("/date_color", date_color);
app.use("/event", event);
app.use("/match", match);

app.use("/participation_event", participation_event);
app.use("/participation_jeu", participation_jeu);
app.use("/poule", poule);
app.use("/resultat", resultat);

app.use("/user_tokens", user_tokens);
app.use("/users", users);
module.exports = app;