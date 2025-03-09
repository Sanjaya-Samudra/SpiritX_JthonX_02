require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '2003',
    database: 'spirit11'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// Start Server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});

const SECRET_KEY = "spirit11_secret"; // Change for production

// Signup
app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    
    db.query(sql, [username, hashedPassword], (err, result) => {
        if (err) return res.status(400).json({ error: 'Username already exists' });
        res.json({ message: 'Signup successful!' });
    });
});

// Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM users WHERE username = ?";
    
    db.query(sql, [username], (err, results) => {
        if (err || results.length === 0) return res.status(400).json({ error: 'User not found' });

        const user = results[0];
        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    });
});

// Get all players
app.get('/players', (req, res) => {
    db.query("SELECT * FROM players", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// // Add a new player (Admin only)
// app.post('/players', (req, res) => {
//     const { name, university, category, total_runs, balls_faced, innings_played, wickets, overs_bowled, runs_conceded } = req.body;
//     const sql = `INSERT INTO players (name, university, category, total_runs, balls_faced, innings_played, wickets, overs_bowled, runs_conceded) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//     db.query(sql, [name, university, category, total_runs, balls_faced, innings_played, wickets, overs_bowled, runs_conceded], (err, result) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.json({ message: 'Player added successfully!' });
//     });
// });

// Admin can add new players (but dataset players remain unchanged)
app.post('/players', (req, res) => {
    const { name, university, category, total_runs, balls_faced, innings_played, wickets, overs_bowled, runs_conceded } = req.body;

    // Insert only if the player is not already in the dataset
    db.query("SELECT * FROM players WHERE name = ?", [name], (err, results) => {
        if (results.length > 0) return res.status(400).json({ error: "Player already exists!" });

        const sql = `INSERT INTO players (name, university, category, total_runs, balls_faced, innings_played, wickets, overs_bowled, runs_conceded) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.query(sql, [name, university, category, total_runs, balls_faced, innings_played, wickets, overs_bowled, runs_conceded], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "New player added successfully!" });
        });
    });
});


// Update a player (Admin only)
app.put('/players/:id', (req, res) => {
    const { id } = req.params;
    const { total_runs, wickets, overs_bowled } = req.body;
    const sql = `UPDATE players SET total_runs = ?, wickets = ?, overs_bowled = ? WHERE id = ?`;

    db.query(sql, [total_runs, wickets, overs_bowled, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Player updated successfully!' });
    });
});

// Delete a player (Admin only)
app.delete('/players/:id', (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM players WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Player deleted successfully!' });
    });
});

// Get user's team
app.get('/team/:userId', (req, res) => {
    const { userId } = req.params;
    const sql = `SELECT players.* FROM teams INNER JOIN players ON teams.player_id = players.id WHERE teams.user_id = ?`;

    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Add player to team
// app.post('/team', (req, res) => {
//     const { userId, playerId } = req.body;
    
//     // Check if player is already in the team
//     db.query("SELECT * FROM teams WHERE user_id = ? AND player_id = ?", [userId, playerId], (err, results) => {
//         if (results.length > 0) return res.status(400).json({ error: 'Player already in team' });

//         // Add player
//         db.query("INSERT INTO teams (user_id, player_id) VALUES (?, ?)", [userId, playerId], (err, result) => {
//             if (err) return res.status(500).json({ error: err.message });
//             res.json({ message: 'Player added to team!' });
//         });
//     });
// });

// Add player to team (Only from dataset)
app.post('/team', (req, res) => {
    const { userId, playerId } = req.body;

    // Check if the player exists in the dataset
    db.query("SELECT * FROM players WHERE id = ?", [playerId], (err, results) => {
        if (err || results.length === 0) return res.status(400).json({ error: "Invalid player selection!" });

        // Check if player is already in the user's team
        db.query("SELECT * FROM teams WHERE user_id = ? AND player_id = ?", [userId, playerId], (err, teamResults) => {
            if (teamResults.length > 0) return res.status(400).json({ error: "Player already in team!" });

            // Add the player to the user's team
            db.query("INSERT INTO teams (user_id, player_id) VALUES (?, ?)", [userId, playerId], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "Player added to team!" });
            });
        });
    });
});


// Remove player from team
app.delete('/team/:userId/:playerId', (req, res) => {
    const { userId, playerId } = req.params;
    db.query("DELETE FROM teams WHERE user_id = ? AND player_id = ?", [userId, playerId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Player removed from team!' });
    });
});

// Get leaderboard (Top users by points)
app.get('/leaderboard', (req, res) => {
    const sql = `SELECT users.username, leaderboard.points FROM leaderboard 
                 JOIN users ON leaderboard.user_id = users.id 
                 ORDER BY leaderboard.points DESC`;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Update user points (Triggered after a match update)
app.put('/leaderboard/update', (req, res) => {
    const { userId, points } = req.body;
    const sql = `UPDATE leaderboard SET points = ? WHERE user_id = ?`;

    db.query(sql, [points, userId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Leaderboard updated successfully!' });
    });
});

// Chatbot - Get player details
app.get('/chatbot/player/:name', (req, res) => {
    const { name } = req.params;
    const sql = "SELECT * FROM players WHERE name = ?";

    db.query(sql, [name], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) {
            return res.json({ response: "I don’t have enough knowledge to answer that question." });
        }
        res.json(results[0]);
    });
});

// Chatbot - Suggest Best Team (Based on highest runs & wickets)
app.get('/chatbot/best-team', (req, res) => {
    const sql = `SELECT * FROM players ORDER BY (total_runs + wickets * 10) DESC LIMIT 11`;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Function to preload dataset players into the database
function preloadPlayers() {
    const datasetPlayers = [
        ["Chamika Chandimal", "University of the Visual & Performing Arts", "Batsman", 530, 588, 10, 0, 3, 21],
        ["Dimuth Dhananjaya", "University of the Visual & Performing Arts", "All-Rounder", 250, 208, 10, 8, 40, 240],
        ["Avishka Mendis", "Eastern University", "All-Rounder", 210, 175, 7, 7, 35, 210],
        ["Danushka Kumara", "University of the Visual & Performing Arts", "Batsman", 780, 866, 15, 0, 5, 35],
        ["Praveen Vandersay", "Eastern University", "Batsman", 329, 365, 7, 0, 3, 24]
        // Add players from the dataset...
    ];

    const sql = `INSERT IGNORE INTO players (name, university, category, total_runs, balls_faced, innings_played, wickets, overs_bowled, runs_conceded) VALUES ?`;

    db.query(sql, [datasetPlayers], (err) => {
        if (err) console.error("Error preloading players:", err);
        else console.log("Dataset players loaded successfully.");
    });
}

// Call function when the server starts
preloadPlayers();

