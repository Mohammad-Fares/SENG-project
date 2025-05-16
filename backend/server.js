const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const regsubmit = require(`./frontend/script.js`);

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

const dbPath = path.join(__dirname, 'database', 'users.db');
if regsubmit = 2


if regsubmit =