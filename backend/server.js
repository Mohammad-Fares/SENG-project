const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const regsubmit = require(`./frontend/script.js`);

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

const dbPath = path.join(__dirname, 'database', 'users.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            password TEXT,
            role TEXT
        )`);
    }
});

app.post('/api/register', (req, res) => {
    const { name, email, password, role } = req.body;
    db.run(`INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)`, 
        [name, email, password, role],
        (err) => {
            if (err) {
                res.status(500).send('Error inserting data');
            } else {
                res.status(201).json({id: this.lastID});
            }
        });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.run(`INSERT INTO users (email, password) VALUES (?,?)`, 
        [email, password],
        (err) => {
            if (err) {
                res.status(500).send('Error inserting data');
            } else {
                res.status(201).json({id: this.lastID});
            }
        });
});

/*if (regsubmit = 2) {
    pass
}


if (regsubmit = 1) {
    pass
}*/