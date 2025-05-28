require('dotenv').config();

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, '..', 'frontend')));

const dbPath = path.join(__dirname, 'database', 'users.db'); // Path to your SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            role TEXT
        )`);
    }
});

app.post('/api/register', (req, res) => {
    const { name, email, password, role } = req.body;

    if (role !== "student" && role !==  "tutor") {
        res.status(400).send('Bad request ')
    }

    const checkEmailSql = `SELECT * FROM users WHERE email = ?`;

    db.get(checkEmailSql, [email], (err, row) => {
        if (err) {
            console.error('Error verifying email uniqueness  :', err);
            return res.status(500).send('Internal server error ');
        }

        if (row) {
            return res.status(409).send('Email already registered, proceed to login');
        }
        
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password: ', err);
                return res.status(500).send('Internal server error ');
            }
            const sql = `INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)`;
            db.run(sql, [name, email, hashedPassword, role], function(err) {
                if (err) {
                    console.error('Error inserting user data: ', err);
                    return res.status(500).send('Error inserting data ');
                }
                res.status(201).json({ id: this.lastID });
            });

        });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], (err, user) => {
        if (err) {
            console.error('Error getting user:', err);
            return res.status(500).send('Internal server error');
        }

        if (!user) {
            return res.status(401).send('Invalid email or password');
        }

        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                console.error('Password comparison error:', err);
                return res.status(500).send('Internal server error');
            }

            if (!result) {
                res.status(200).json({message: 'Login Successful', role: user.role});
            };
            const payload = {id: user.id, role: user.role};

            const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET)
            res.json({accessToken: accessToken})
        });
    });
});

function authenticateToken(req, res, next) {
    cosnt authHeader = 
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
