const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// User Registration
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const [rows] = await pool.execute(
            'INSERT INTO Users (Name, Email, Password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        const token = jwt.sign(
            { userId: rows.insertId, email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ success: true, userId: rows.insertId, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await pool.execute(
            'SELECT * FROM Users WHERE Email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.Password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const token = jwt.sign(
            { userId: user.UserID, email: user.Email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            userId: user.UserID,
            name: user.Name,
            email: user.Email,
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Goal
app.post('/api/goals', authenticateToken, async (req, res) => {
    const { goalName, category, targetValue, deadline } = req.body;
    const userId = req.user.userId;

    try {
        const [result] = await pool.execute(
            'INSERT INTO Goals (UserID, GoalName, Category, TargetValue, Deadline) VALUES (?, ?, ?, ?, ?)',
            [userId, goalName, category, targetValue, deadline]
        );

        res.json({ success: true, goalId: result.insertId, message: 'Goal created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Goal Progress
app.post('/api/goals/:goalId/progress', authenticateToken, async (req, res) => {
    const { goalId } = req.params;
    const { value } = req.body;
    const userId = req.user.userId;

    try {
        const [goals] = await pool.execute(
            'SELECT * FROM Goals WHERE GoalID = ? AND UserID = ?',
            [goalId, userId]
        );

        if (goals.length === 0) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        await pool.execute(
            'INSERT INTO ProgressLog (GoalID, Date, Value) VALUES (?, CURDATE(), ?)',
            [goalId, value]
        );

        await pool.execute(
            'UPDATE Goals SET CurrentValue = CurrentValue + ? WHERE GoalID = ?',
            [value, goalId]
        );

        const [updatedGoal] = await pool.execute(
            'SELECT *, (CurrentValue/TargetValue)*100 as progress FROM Goals WHERE GoalID = ?',
            [goalId]
        );

        res.json({ success: true, progress: updatedGoal[0].progress, currentValue: updatedGoal[0].CurrentValue });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get User Goals
app.get('/api/goals', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        const [goals] = await pool.execute(
            `SELECT g.*, 
                    (g.CurrentValue/g.TargetValue)*100 as progress,
                    DATEDIFF(g.Deadline, CURDATE()) as daysRemaining
             FROM Goals g 
             WHERE g.UserID = ? 
             ORDER BY g.Deadline ASC`,
            [userId]
        );
        res.json(goals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Goal Analytics
app.get('/api/analytics', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        const [totalGoals] = await pool.execute(
            'SELECT COUNT(*) as count FROM Goals WHERE UserID = ?',
            [userId]
        );

        const [completedGoals] = await pool.execute(
            'SELECT COUNT(*) as count FROM Goals WHERE UserID = ? AND (CurrentValue/TargetValue)*100 >= 100',
            [userId]
        );

        const [avgProgress] = await pool.execute(
            'SELECT AVG((CurrentValue/TargetValue)*100) as avg FROM Goals WHERE UserID = ?',
            [userId]
        );

        const [byCategory] = await pool.execute(
            `SELECT Category, COUNT(*) as count 
             FROM Goals 
             WHERE UserID = ? 
             GROUP BY Category`,
            [userId]
        );

        res.json({
            totalGoals: totalGoals[0].count,
            completedGoals: completedGoals[0].count,
            averageProgress: avgProgress[0].avg || 0,
            byCategory
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
