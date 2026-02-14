import jwt from 'jsonwebtoken';

const chatHistory = global.chatHistory || (global.chatHistory = {});
const dailyLimits = global.dailyLimits || (global.dailyLimits = {});

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Auth
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token topilmadi' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
        const userId = decoded.userId;

        const { message, language } = req.body;

        // Check daily limit
        const today = new Date().toDateString();
        if (!dailyLimits[userId]) {
            dailyLimits[userId] = { date: today, count: 0 };
        }
        
        if (dailyLimits[userId].date !== today) {
            dailyLimits[userId] = { date: today, count: 0 };
        }
        
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

        // System prompts
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

Keep responses 200-300 words, clear and impactful.`
        };

        const systemPrompt = systemPrompts[language] || systemPrompts.uz;
        const recentHistory = chatHistory[userId].slice(-5);
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
            res.status(500).json({ message: 'AI javob berishda xatolik' });
        }
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ message: 'Server xatosi / Server error' });
    }
}
