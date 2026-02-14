import jwt from 'jsonwebtoken';

const users = global.users || (global.users = []);
const chatHistory = global.chatHistory || (global.chatHistory = {});
const dailyLimits = global.dailyLimits || (global.dailyLimits = {});
const ADMIN_EMAIL = 'kholikovmeronshokh@gmail.com';

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
        const user = users.find(u => u.id === userId);
        
        if (!user || user.email !== ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const totalUsers = users.length;
        const totalMessages = Object.values(chatHistory).reduce((sum, hist) => sum + hist.length, 0);
        const activeToday = Object.values(dailyLimits).filter(
            limit => limit.date === new Date().toDateString() && limit.count > 0
        ).length;
        
        res.json({
            totalUsers,
            totalMessages: Math.floor(totalMessages / 2),
            activeToday,
            totalQuestions: Math.floor(totalMessages / 2)
        });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
}
