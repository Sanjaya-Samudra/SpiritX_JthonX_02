CREATE DATABASE spirit11;
USE spirit11;

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    budget INT DEFAULT 9000000,
    points INT DEFAULT 0
);

-- Players Table (Preloaded from Dataset)
CREATE TABLE players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    university VARCHAR(100) NOT NULL,
    category ENUM('Batsman', 'Bowler', 'All-Rounder') NOT NULL,
    total_runs INT DEFAULT 0,
    balls_faced INT DEFAULT 0,
    innings_played INT DEFAULT 0,
    wickets INT DEFAULT 0,
    overs_bowled INT DEFAULT 0,
    runs_conceded INT DEFAULT 0
);

-- User Teams Table
CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    player_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- Leaderboard Table
CREATE TABLE leaderboard (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    points INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


npm init -y
npm install express mysql bcryptjs jsonwebtoken cors dotenv body-parser
