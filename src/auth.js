import { getCurrentLanguage } from './language';

const API_URL = import.meta.env.PROD 
    ? '/api' 
    : 'http://localhost:3000/api';

export function initAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        showChatScreen();
    }

    // Password toggle functionality
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const input = document.getElementById(targetId);
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            document.getElementById(`${tab}Form`).classList.add('active');
        });
    });

    // Login
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        if (submitBtn.disabled) return;
        
        submitBtn.disabled = true;
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            showError('Barcha maydonlarni to\'ldiring / Fill all fields');
            submitBtn.disabled = false;
            return;
        }

        try {
            console.log('Sending login request:', { email });
            
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log('Login response:', data);

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userName', data.user.name);
                showChatScreen();
            } else {
                showError(data.message || 'Kirish xatosi / Login error');
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Server bilan bog\'lanishda xatolik / Connection error');
            submitBtn.disabled = false;
        }
    });

    // Register
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        if (submitBtn.disabled) return;
        
        submitBtn.disabled = true;
        
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;

        // Basic validation
        if (!name || !email || !password) {
            showError('Barcha maydonlarni to\'ldiring / Fill all fields');
            submitBtn.disabled = false;
            return;
        }

        if (password.length < 6) {
            showError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak / Password must be at least 6 characters');
            submitBtn.disabled = false;
            return;
        }

        try {
            console.log('Sending register request:', { name, email });
            
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();
            console.log('Register response:', data);

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userName', data.user.name);
                showChatScreen();
            } else {
                showError(data.message || 'Ro\'yxatdan o\'tishda xatolik / Registration error');
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Register error:', error);
            showError('Server bilan bog\'lanishda xatolik / Connection error');
            submitBtn.disabled = false;
        }
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        document.getElementById('authScreen').classList.add('active');
        document.getElementById('chatScreen').classList.remove('active');
    });
}

function showChatScreen() {
    const userName = localStorage.getItem('userName');
    document.getElementById('userName').textContent = userName;
    document.getElementById('authScreen').classList.remove('active');
    document.getElementById('chatScreen').classList.add('active');
    
    // Check admin status
    import('./admin.js').then(module => {
        module.initAdmin();
    });
}

function showError(message) {
    const errorEl = document.getElementById('authError');
    errorEl.textContent = message;
    errorEl.classList.add('show');
    setTimeout(() => errorEl.classList.remove('show'), 3000);
}
