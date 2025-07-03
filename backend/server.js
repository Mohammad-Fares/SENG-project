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

const dbPath = path.join(__dirname, 'database', 'users.db');
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
        db.run(`CREATE TABLE IF NOT EXISTS posts (
            postID INTEGER PRIMARY KEY AUTOINCREMENT,
            tutorID INTEGER NOT NULL,
            name TEXT NOT NULL,
            bio TEXT,
            email TEXT,
            phone TEXT,
            rating INTEGER,
            pricePerHour REAL,
            location TEXT,
            timeSlot TEXT,
            FOREIGN KEY (tutorID) REFERENCES tutors(tutor_id) ON DELETE CASCADE
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS saved_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            post_id INTEGER NOT NULL,
            saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
            FOREIGN KEY (post_id) REFERENCES posts(postID) ON DELETE CASCADE,
            UNIQUE(student_id, post_id)
        )`);
    }
});

app.post('/api/register', (req, res) => {
    const { name, email, password, role } = req.body;

    if (role !== "student" && role !==  "tutor") {
        return res.status(400).send('Bad request ');
    }

    const checkEmailSql = `SELECT * FROM users WHERE email = ?`;

    db.get(checkEmailSql, [email], (err, row) => {
        if (err) return res.status(500).send('Internal server error');

        if (row) return res.status(409).send('Email already registered');

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return res.status(500).send('Error hashing password');

            const sql = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;
            db.run(sql, [name, email, hashedPassword, role], function (err) {
                if (err) return res.status(500).send('Error inserting user');

                const userId = this.lastID;
                const roleTable = role === 'student' ? 'students' : 'tutors';
                const roleSql = `INSERT INTO ${roleTable} (user_id) VALUES (?)`;

                db.run(roleSql, [userId], function (roleErr) {
                    if (roleErr) return res.status(500).send(`Error creating ${role} profile`);
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

app.post('/api/logout', (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
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

function getTutorIDFromUserID(userID, callback) {
    db.get("SELECT tutor_id FROM tutors WHERE user_id = ?", [userID], (err, row) => {
        if (err || !row) return callback(null);
        callback(row.tutor_id);
    });
}

function getStudentIDFromUserID(userID, callback) {
    db.get("SELECT student_id FROM students WHERE user_id = ?", [userID], (err, row) => {
        if (err || !row) return callback(null);
        callback(row.student_id);
    });
}

app.post('/api/create-post', authenticateToken, (req, res) => {
    const { name, bio, email, phone, pricePerHour, location, timeSlot } = req.body;
    const userID = req.user.id;

    if (req.user.role !== "tutor") return res.status(403).send("Only tutors can create posts");

    getTutorIDFromUserID(userID, (tutorID) => {
        if (!tutorID) return res.status(403).send("Tutor profile not found");

        db.run(`
            INSERT INTO posts (tutorID, name, bio, email, phone, rating, pricePerHour, location, timeSlot)
            VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`,
            [tutorID, name, bio, email, phone, pricePerHour, location, timeSlot],
            function (err) {
                if (err) {
                    console.error(err.message);
                    return res.status(500).send("Failed to create post");
                }
                res.json({ message: "Post successfully created", postId: this.lastID });
            }
        );
    });
});

app.get('/api/posts', (req, res) => {
    const sql = `SELECT posts.*, users.name as tutor_name
                 FROM posts
                 JOIN tutors ON posts.tutorID = tutors.tutor_id
                 JOIN users ON tutors.user_id = users.id`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error fetching posts:', err.message);
            return res.status(500).json({ error: 'Failed to retrieve posts' });
        }

        res.json(rows);
    });
});

app.get('/api/tutor-posts', authenticateToken, (req, res) => {
    if (req.user.role !== "tutor") return res.status(403).send("Only tutors can access this endpoint");

    getTutorIDFromUserID(req.user.id, (tutorID) => {
        if (!tutorID) return res.status(404).send("Tutor profile not found");

        const sql = `SELECT posts.*, users.name as tutor_name
                     FROM posts
                     JOIN tutors ON posts.tutorID = tutors.tutor_id
                     JOIN users ON tutors.user_id = users.id
                     WHERE posts.tutorID = ?`;

        db.all(sql, [tutorID], (err, rows) => {
            if (err) {
                console.error('Error fetching tutor posts:', err.message);
                return res.status(500).json({ error: 'Failed to retrieve tutor posts' });
            }
            res.json(rows);
        });
    });
});

app.delete('/api/posts/:postId', authenticateToken, (req, res) => {
    const postId = req.params.postId;
    
    if (req.user.role !== "tutor") return res.status(403).send("Only tutors can delete posts");

    getTutorIDFromUserID(req.user.id, (tutorID) => {
        if (!tutorID) return res.status(404).send("Tutor profile not found");

        db.get("SELECT * FROM posts WHERE postID = ? AND tutorID = ?", [postId, tutorID], (err, post) => {
            if (err) {
                console.error('Error checking post ownership:', err.message);
                return res.status(500).send("Database error");
            }
            
            if (!post) {
                return res.status(404).send("Post not found or you don't have permission to delete it");
            }

            db.run("DELETE FROM posts WHERE postID = ?", [postId], function(err) {
                if (err) {
                    console.error('Error deleting post:', err.message);
                    return res.status(500).send("Failed to delete post");
                }
                res.json({ message: "Post deleted successfully" });
            });
        });
    });
});

// add post to saved_posts with + button
app.post('/api/save-post', authenticateToken, (req, res) => {
    const { postId } = req.body;
    
    if (req.user.role !== "student") return res.status(403).send("Only students can save posts");

    getStudentIDFromUserID(req.user.id, (studentID) => {
        if (!studentID) return res.status(404).send("Student profile not found");

        db.get("SELECT * FROM posts WHERE postID = ?", [postId], (err, post) => {
            if (err) {
                console.error('Error checking post:', err.message);
                return res.status(500).send("Database error");
            }
            
            if (!post) {
                return res.status(404).send("Post not found");
            }

            db.run("INSERT INTO saved_posts (student_id, post_id) VALUES (?, ?)", [studentID, postId], function(err) {
                if (err) {
                    if (err.code === 'SQLITE_CONSTRAINT') {
                        return res.status(409).send("Post already saved");
                    }
                    console.error('Error saving post:', err.message);
                    return res.status(500).send("Failed to save post");
                }
                res.json({ message: "Post saved successfully" });
            });
        });
    });
});

app.get('/api/saved-posts', authenticateToken, (req, res) => {
    if (req.user.role !== "student") return res.status(403).send("Only students can access saved posts");

    getStudentIDFromUserID(req.user.id, (studentID) => {
        if (!studentID) return res.status(404).send("Student profile not found");

        const sql = `SELECT posts.*, users.name as tutor_name, saved_posts.saved_at
                     FROM saved_posts
                     JOIN posts ON saved_posts.post_id = posts.postID
                     JOIN tutors ON posts.tutorID = tutors.tutor_id
                     JOIN users ON tutors.user_id = users.id
                     WHERE saved_posts.student_id = ?
                     ORDER BY saved_posts.saved_at DESC`;

        db.all(sql, [studentID], (err, rows) => {
            if (err) {
                console.error('Error fetching saved posts:', err.message);
                return res.status(500).json({ error: 'Failed to retrieve saved posts' });
            }
            res.json(rows);
        });
    });
});

app.delete('/api/saved-posts/:postId', authenticateToken, (req, res) => {
    const postId = req.params.postId;
    
    if (req.user.role !== "student") return res.status(403).send("Only students can remove saved posts");

    getStudentIDFromUserID(req.user.id, (studentID) => {
        if (!studentID) return res.status(404).send("Student profile not found");

        db.run("DELETE FROM saved_posts WHERE student_id = ? AND post_id = ?", [studentID, postId], function(err) {
            if (err) {
                console.error('Error removing saved post:', err.message);
                return res.status(500).send("Failed to remove saved post");
            }
            
            if (this.changes === 0) {
                return res.status(404).send("Saved post not found");
            }
            
            res.json({ message: "Saved post removed successfully" });
        });
    });
});

app.post('/api/endorse-post', authenticateToken, (req, res) => {
    const { postId } = req.body;

    if (req.user.role !== "student") return res.status(403).send("Only students can save posts");

    getStudentIDFromUserID(req.user.id, (studentID) => {
        if (!studentID) return res.status(404).send("Student profile not found");

        db.get("SELECT * FROM posts WHERE postID = ?", [postId], (err, post) => {
            if (err) {
                console.error('Error checking post:', err.message);
                return res.status(500).send("Database error");
            }
            
            if (!post) {
                return res.status(404).send("Post not found");
            }

            db.run("UPDATE posts SET rating = rating +1 WHERE postID = ?", [postId], function(err) {
                if (err) {
                    console.error('Error endorsing post:', err.message);
                    return res.status(500).send("Failed to endorse post");
                }
                res.json({ message: "Post endorsed successfully" });
            });
        });
    });
})

app.get('/session', authenticateToken, (req, res) => {
    if (req.user.role !== "tutor") return res.status(403).send("Access denied");

    getTutorIDFromUserID(req.user.id, (tutorID) => {
        if (!tutorID) return res.status(404).send("Tutor ID not found");
        res.json({ tutorID });
    });
});

app.post('/api/token', (req, res) => {
    const { token } = req.body;
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        const newAccessToken = generateAccessToken({ id: user.id, role: user.role });
        res.json({ accessToken: newAccessToken });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});