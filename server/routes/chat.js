import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { chatHistory, dailyLimits } from './auth.js';

const router = express.Router();

// Chat endpoint
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { message, language } = req.body;
        const userId = req.userId;

        // Check daily limit
        const today = new Date().toDateString();
        
        // Initialize if not exists
        if (!dailyLimits[userId]) {
            dailyLimits[userId] = { date: today, count: 0 };
        }
        
        // Reset if new day
        if (dailyLimits[userId].date !== today) {
            dailyLimits[userId] = { date: today, count: 0 };
        }
        
        // Check limit
        if (dailyLimits[userId].count >= 20) {
            return res.status(429).json({ 
                message: language === 'uz' 
                    ? 'Kunlik limit tugadi (20/20). Ertaga qayta urinib ko\'ring.' 
                    : 'Daily limit reached (20/20). Try again tomorrow.',
                remaining: 0
            });
        }

        // Initialize chat history
        if (!chatHistory[userId]) {
            chatHistory[userId] = [];
        }

        // System prompts for different languages
        const systemPrompts = {
            uz: `Siz Advey - professional AI maslahat beruvchisiz. Sizning vazifangiz:

1. CHUQUR TAHLIL: Har bir muammoni psiхologik, ijtimoiy va amaliy jihatdan tahlil qiling
2. PROFESSIONAL YONDASHUV: Ilmiy asoslangan, hayotiy va amaliy maslahatlar bering
3. STRUKTURALI JAVOB: Javobingizni quyidagi formatda bering:
   
   📊 TAHLIL:
   [Muammoning mohiyati va sabablari]
   
   💡 YECHIM:
   [Konkret qadamlar va strategiyalar]
   
   🎯 AMALIY MASLAHAT:
   [Bugundan boshlash mumkin bo'lgan harakatlar]
   
   ✨ ILHOM:
   [Motivatsion fikr yoki hikmat]

4. SHAXSIY YONDASHUV: Har bir insonning vaziyati noyob ekanligini hisobga oling
5. FUTURISTIK QARASH: Zamonaviy texnologiyalar va usullarni tavsiya eting

Javoblaringiz 200-300 so'zdan iborat, aniq va ta'sirchan bo'lsin.`,
            en: `You are Advey - a professional AI advisor. Your mission:

1. DEEP ANALYSIS: Analyze each problem from psychological, social, and practical perspectives
2. PROFESSIONAL APPROACH: Provide scientifically-backed, practical advice
3. STRUCTURED RESPONSE: Format your answer as:
   
   📊 ANALYSIS:
   [Core issue and root causes]
   
   💡 SOLUTION:
   [Concrete steps and strategies]
   
   🎯 ACTIONABLE ADVICE:
   [Actions to start today]
   
   ✨ INSPIRATION:
   [Motivational thought or wisdom]

4. PERSONALIZED: Consider each person's unique situation
5. FUTURISTIC VIEW: Recommend modern technologies and methods

Keep responses 200-300 words, clear and impactful.`
        };

        const systemPrompt = systemPrompts[language] || systemPrompts.uz;

        // Get recent history (last 5 messages for context)
        const recentHistory = chatHistory[userId].slice(-5);

        // Build messages with history
        const messages = [
            { role: 'system', content: systemPrompt },
            ...recentHistory,
            { role: 'user', content: message }
        ];

        // Call Groq API
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                temperature: 0.7,
                max_tokens: 600,
                top_p: 0.9
            })
        });

        const data = await response.json();

        if (response.ok) {
            const aiResponse = data.choices[0].message.content;
            
            // Save to history
            chatHistory[userId].push(
                { role: 'user', content: message },
                { role: 'assistant', content: aiResponse }
            );
            
            // Increment daily count
            dailyLimits[userId].count++;
            
            res.json({ 
                response: aiResponse,
                remaining: 20 - dailyLimits[userId].count
            });
        } else {
            console.error('Groq API error:', data);
            res.status(500).json({ message: 'AI javob berishda xatolik / AI response error' });
        }
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ message: 'Server xatosi / Server error' });
    }
});

// Get chat history
router.get('/history', authMiddleware, (req, res) => {
    const userId = req.userId;
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
});

// Clear history
router.delete('/history', authMiddleware, (req, res) => {
    const userId = req.userId;
    chatHistory[userId] = [];
    res.json({ message: 'History cleared' });
});

export default router;
