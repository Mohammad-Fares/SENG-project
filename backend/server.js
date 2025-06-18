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

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}

function generateRefreshToken(user) {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}


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
        db.run(`CREATE TABLE IF NOT EXISTS students (
            student_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS tutors (
            tutor_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            FOREIGN KEY(user_id) REFERENCES users(id)
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
                    return res.status(500).send('Error inserting data');
                }

                const userId = this.lastID;
                const roleTable = role === 'student' ? 'students' : 'tutors';
                const roleSql = `INSERT INTO ${roleTable} (user_id) VALUES (?)`;
                
                db.run(roleSql, [userId], function(roleErr) {
                    if (roleErr) {
                        console.error(`Error inserting into ${roleTable} table: `, roleErr);
                        return res.status(500).send(`Error creating ${role} profile`);
                    }

                    res.status(201).json({ id: userId, role });
                });
            });

        });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], (err, user) => {
        if (err || !user) return res.status(401).send('Invalid credentials');

        bcrypt.compare(password, user.password, (err, result) => {
            if (err || !result) return res.status(401).send('Invalid credentials');

            const payload = { id: user.id, role: user.role };

            const accessToken = generateAccessToken(payload);
            const refreshToken = generateRefreshToken(payload);

            res.status(200).json({
                accessToken,
                refreshToken,
                role: user.role,
                name: user.name
            });
        });
    });
});

app.post('/api/token', (req, res) => {
    const { token } = req.body;

    if (!token) return res.sendStatus(401);
    if (!refreshTokens.includes(token)) return res.sendStatus(403);

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);

        const newAccessToken = generateAccessToken({ id: user.id, role: user.role });
        res.json({ accessToken: newAccessToken });
    });
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
