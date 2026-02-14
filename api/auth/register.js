import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// In-memory storage (shared across functions via module cache)
const users = global.users || (global.users = []);
const chatHistory = global.chatHistory || (global.chatHistory = {});
const dailyLimits = global.dailyLimits || (global.dailyLimits = {});

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

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

        // Initialize user data
        chatHistory[user.id] = [];
        dailyLimits[user.id] = { date: new Date().toDateString(), count: 0 };

        // Generate token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '7d' });

        console.log('User registered successfully:', user.email);

        res.status(201).json({
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server xatosi / Server error' });
    }
}
