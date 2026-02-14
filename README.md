# Advey - AI Maslahat Generatori

Futuristik 3D interfeys bilan professional AI maslahat generatori. Groq API va Three.js yordamida yaratilgan.

## ✨ Xususiyatlar

- 🎨 **Professional 3D Interfeys** - Three.js bilan animatsiyali background
- 🤖 **Groq AI (Llama 3.3 70B)** - Chuqur tahlil va professional maslahatlar
- 📊 **Strukturali Javoblar** - Tahlil, Yechim, Amaliy Maslahat, Ilhom
- 🔐 **To'liq Autentifikatsiya** - JWT bilan xavfsiz tizim
- 📜 **Chat History** - Barcha suhbatlar saqlanadi
- ⏱️ **Kunlik Limit** - Har foydalanuvchi uchun 20 ta savol/kun
- 🎭 **3D Animatsiya** - Har javobda turli 3D effektlar
- 🌐 **Ko'p tillilik** - O'zbekcha va English
- 📱 **Mobile Responsive** - Barcha qurilmalarda ishlaydi
- 👨‍💼 **Admin Panel** - Foydalanuvchilarni boshqarish

## 🚀 Vercel Deploy

### 1. Vercel Account
1. [Vercel](https://vercel.com) ga kiring
2. GitHub bilan bog'lang

### 2. Environment Variables
Vercel dashboard da quyidagi environment variables qo'shing:

```
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=your_jwt_secret_key_here
```

### 3. Deploy
```bash
# Vercel CLI o'rnatish
npm i -g vercel

# Deploy qilish
vercel

# Production deploy
vercel --prod
```

Yoki GitHub bilan:
1. Repository ni GitHub ga push qiling
2. Vercel dashboard da "Import Project"
3. GitHub repository ni tanlang
4. Environment variables kiriting
5. Deploy!

## 💻 Local Development

### O'rnatish
```bash
npm install
```

### Ishga tushirish
```bash
# Terminal 1 - Backend
npm run server:dev

# Terminal 2 - Frontend
npm run dev
```

Sayt `http://localhost:5173` da ochiladi

### Production Build
```bash
npm run build
npm run preview
```

## 📱 Foydalanish

1. **Ro'yxatdan o'tish** - Ism, email va parol bilan
2. **Tizimga kirish** - Email va parol bilan
3. **Til tanlash** - O'zbek yoki ingliz tili
4. **Savol berish** - Muammoingizni yozing
5. **Professional javob** - AI strukturali maslahat beradi
6. **History ko'rish** - 📜 tugmasi orqali barcha suhbatlarni ko'ring

## 🎯 Asosiy Funksiyalar

### Kunlik Limit
- Har foydalanuvchi kuniga 20 ta savol
- Limit har kuni 00:00 da yangilanadi
- Qolgan savollar headerda ko'rsatiladi

### Chat History
- Barcha suhbatlar saqlanadi
- History paneldan oldingi suhbatlarni ko'rish
- Suhbatlarni tozalash imkoniyati

### 3D Animatsiyalar
- Har javobda yangi 3D shakllar
- Particle burst effektlari
- Dinamik rang o'zgarishlari

### Admin Panel
- Faqat `kholikovmeronshokh@gmail.com` uchun
- Barcha foydalanuvchilarni ko'rish
- Har bir userning suhbatlarini ko'rish
- Statistika va analytics

## 🛠️ Texnologiyalar

### Frontend
- **Vite** - Build tool
- **Three.js** - 3D graphics
- **Vanilla JavaScript** - No framework
- **Font Awesome** - Icons

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### AI
- **Groq API** - Llama 3.3 70B model
- **Context-aware** - Chat history

## 📁 Loyiha Tuzilmasi

```
advey/
├── public/              # Static files (favicon, etc)
├── src/
│   ├── main.js         # Entry point
│   ├── style.css       # Styles
│   ├── background.js   # Three.js 3D
│   ├── auth.js         # Authentication
│   ├── chat.js         # Chat logic
│   ├── admin.js        # Admin panel
│   └── language.js     # Multi-language
├── server/
│   ├── index.js        # Express server
│   ├── middleware/
│   │   └── auth.js     # Auth middleware
│   └── routes/
│       ├── auth.js     # Auth endpoints
│       ├── chat.js     # Chat endpoints
│       └── admin.js    # Admin endpoints
├── vercel.json         # Vercel config
├── package.json
└── README.md
```

## 🔒 Xavfsizlik

- Parollar bcrypt bilan hash qilinadi
- JWT token 7 kun amal qiladi
- CORS himoyasi
- Input validatsiya
- Admin-only endpoints

## 📊 API Endpoints

### Auth
- `POST /api/auth/register` - Ro'yxatdan o'tish
- `POST /api/auth/login` - Tizimga kirish

### Chat
- `POST /api/chat` - Savol berish
- `GET /api/chat/history` - Suhbatlar tarixi
- `GET /api/chat/stats` - Statistika
- `DELETE /api/chat/history` - Tarixni tozalash

### Admin (Admin only)
- `GET /api/admin/check` - Admin tekshirish
- `GET /api/admin/users` - Barcha userlar
- `GET /api/admin/users/:id/history` - User tarixi
- `GET /api/admin/stats` - Umumiy statistika
- `DELETE /api/admin/users/:id` - Userni o'chirish

## 🎨 Dizayn Xususiyatlari

- Gradient animatsiyalar
- Glassmorphism effektlari
- Smooth transitions
- Responsive design
- Dark theme
- Neon colors
- 3D particles

## 📝 Litsenziya

MIT

## 🤝 Muallif

**Advey** - Futuristik AI Maslahat Generatori
Created by **Kholikov Meronshokh**
© 2026

---

## 🚀 Deploy Checklist

- [x] Environment variables sozlangan
- [x] vercel.json yaratilgan
- [x] API URLs production uchun sozlangan
- [x] Mobile responsive
- [x] Admin panel ishlaydi
- [x] Chat history saqlanadi
- [x] 3D animatsiyalar ishlaydi

**Eslatma:** Production da MongoDB yoki PostgreSQL ishlatish tavsiya etiladi.
