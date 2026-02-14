import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { users, chatHistory, dailyLimits } from './auth.js';

const router = express.Router();

const ADMIN_EMAIL = 'kholikovmeronshokh@gmail.com';

// Admin middleware
const adminMiddleware = (req, res, next) => {
    const userId = req.userId;
    const user = users.find(u => u.id === userId);
    
    if (!user || user.email !== ADMIN_EMAIL) {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    next();
};

// Check if user is admin
router.get('/check', authMiddleware, (req, res) => {
    const userId = req.userId;
    const user = users.find(u => u.id === userId);
    
    res.json({ isAdmin: user?.email === ADMIN_EMAIL });
});

// Get all users
router.get('/users', authMiddleware, adminMiddleware, (req, res) => {
    const usersData = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        registeredAt: user.createdAt || new Date().toISOString(),
        totalMessages: chatHistory[user.id]?.length || 0,
        dailyLimit: dailyLimits[user.id] || { date: new Date().toDateString(), count: 0 }
    }));
    
    res.json({ users: usersData });
});

// Get user chat history
router.get('/users/:userId/history', authMiddleware, adminMiddleware, (req, res) => {
    const { userId } = req.params;
    const history = chatHistory[userId] || [];
    
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    // Format history
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
    
    res.json({
        user: {
            name: user.name,
            email: user.email
        },
        history: formattedHistory.reverse()
    });
});

// Get statistics
router.get('/stats', authMiddleware, adminMiddleware, (req, res) => {
    const totalUsers = users.length;
    const totalMessages = Object.values(chatHistory).reduce((sum, hist) => sum + hist.length, 0);
    const activeToday = Object.values(dailyLimits).filter(
        limit => limit.date === new Date().toDateString() && limit.count > 0
    ).length;
    
    res.json({
        totalUsers,
        totalMessages: Math.floor(totalMessages / 2), // Divide by 2 (question + answer)
        activeToday,
        totalQuestions: Math.floor(totalMessages / 2)
    });
});

// Delete user
router.delete('/users/:userId', authMiddleware, adminMiddleware, (req, res) => {
    const { userId } = req.params;
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't allow deleting admin
    if (users[userIndex].email === ADMIN_EMAIL) {
        return res.status(403).json({ message: 'Cannot delete admin user' });
    }
    
    // Delete user data
    users.splice(userIndex, 1);
    delete chatHistory[userId];
    delete dailyLimits[userId];
    
    res.json({ message: 'User deleted successfully' });
});

export default router;
