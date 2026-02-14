import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Advey API is running' });
});

app.listen(PORT, () => {
    console.log(`🚀 Advey Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints:`);
    console.log(`   - POST /api/auth/register`);
    console.log(`   - POST /api/auth/login`);
    console.log(`   - POST /api/chat`);
    console.log(`   - GET  /api/chat/history`);
    console.log(`   - GET  /api/chat/stats`);
    console.log(`   - GET  /api/admin/users (Admin only)`);
    console.log(`   - GET  /api/admin/stats (Admin only)`);
});

