import jwt from 'jsonwebtoken';

const dailyLimits = global.dailyLimits || (global.dailyLimits = {});
const chatHistory = global.chatHistory || (global.chatHistory = {});

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Token topilmadi' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
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
}
