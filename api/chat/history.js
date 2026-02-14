import jwt from 'jsonwebtoken';

const chatHistory = global.chatHistory || (global.chatHistory = {});

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Token topilmadi' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
        const userId = decoded.userId;

        if (req.method === 'GET') {
            const history = chatHistory[userId] || [];
            
            // Format history for display
            const formattedHistory = [];
            for (let i = 0; i < history.length; i += 2) {
                if (history[i] && history[i + 1]) {
                    formattedHistory.push({
                        id: Date.now() + i,
                        question: history[i].content,
                        answer: history[i + 1].content,
                        timestamp: new Date().toISOString()
                    });
                }
            }
            
            res.json({ history: formattedHistory.reverse() });
        } else if (req.method === 'DELETE') {
            chatHistory[userId] = [];
            res.json({ message: 'History cleared' });
        } else {
            res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
}
