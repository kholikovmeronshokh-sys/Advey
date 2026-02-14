import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// In-memory user storage (replace with database in production)
const users = [];
const chatHistory = {}; // userId -> array of messages
const dailyLimits = {}; // userId -> { date, count }

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        console.log('Register attempt:', { name, email });

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Barcha maydonlarni to\'ldiring / Fill all fields' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak / Password must be at least 6 characters' });
        }

        // Check if user exists
        const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'Bu email allaqachon ro\'yxatdan o\'tgan / Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            name,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        users.push(user);
        console.log('Total users now:', users.length);
        console.log('All users:', users.map(u => ({ id: u.id, email: u.email, name: u.name })));

        // Initialize user data
        chatHistory[user.id] = [];
        dailyLimits[user.id] = { date: new Date().toDateString(), count: 0 };

        // Generate token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        console.log('User registered successfully:', user.email);

        res.status(201).json({
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server xatosi / Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Login attempt:', { email });

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email va parolni kiriting / Enter email and password' });
        }

        // Find user
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
            console.log('User not found:', email);
            console.log('Available users:', users.map(u => u.email));
            return res.status(400).json({ message: 'Email yoki parol noto\'g\'ri / Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Email yoki parol noto\'g\'ri / Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        console.log('User logged in successfully:', user.email);

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server xatosi / Server error' });
    }
});

// Get user stats
router.get('/stats', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Token topilmadi' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        
        const today = new Date().toDateString();
        const userLimit = dailyLimits[userId] || { date: today, count: 0 };
        
        // Reset if new day
        if (userLimit.date !== today) {
            dailyLimits[userId] = { date: today, count: 0 };
        }
        
        res.json({
            remainingQuestions: 20 - (dailyLimits[userId]?.count || 0),
            totalQuestions: chatHistory[userId]?.length || 0
        });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

export { users, chatHistory, dailyLimits };
export default router;
