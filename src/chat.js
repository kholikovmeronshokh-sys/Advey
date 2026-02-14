import { getCurrentLanguage } from './language';
import { triggerResponseAnimation } from './background';

const API_URL = import.meta.env.PROD 
    ? '/api' 
    : 'http://localhost:3000/api';

let isProcessing = false;

export function initChat() {
    const chatForm = document.getElementById('chatForm');
    const userInput = document.getElementById('userInput');
    const messagesContainer = document.getElementById('messages');
    const sendBtn = document.getElementById('sendBtn');

    // Load stats and history on init
    loadStats();
    loadHistory();

    // History toggle
    document.getElementById('historyBtn').addEventListener('click', toggleHistory);
    document.getElementById('closeHistory').addEventListener('click', toggleHistory);
    document.getElementById('clearHistory').addEventListener('click', clearHistory);
    
    // New chat button
    document.getElementById('newChatBtn').addEventListener('click', () => {
        const lang = getCurrentLanguage();
        const confirmMsg = lang === 'uz' 
            ? 'Yangi suhbat boshlamoqchimisiz?' 
            : 'Start a new conversation?';
        
        if (confirm(confirmMsg)) {
            document.getElementById('messages').innerHTML = '';
            userInput.focus();
        }
    });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Prevent double submission
        if (isProcessing) {
            return;
        }
        
        const message = userInput.value.trim();
        if (!message) return;

        // Set processing flag
        isProcessing = true;
        
        // Add user message
        addMessage(message, 'user');
        userInput.value = '';

        // Show loading
        const loadingId = addMessage('', 'ai', true);
        sendBtn.disabled = true;
        userInput.disabled = true;

        try {
            const token = localStorage.getItem('token');
            const lang = getCurrentLanguage();

            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message, language: lang })
            });

            const data = await response.json();

            // Remove loading
            const loadingEl = document.getElementById(loadingId);
            if (loadingEl) {
                loadingEl.remove();
            }
            
            if (response.ok) {
                // Trigger 3D animation
                triggerResponseAnimation();
                
                // Add AI response with typing effect
                await addMessageWithTyping(data.response, 'ai');
                
                // Update stats
                if (data.remaining !== undefined) {
                    updateStats(data.remaining);
                }
                
                // Reload history
                setTimeout(() => loadHistory(), 500);
            } else {
                addMessage(data.message || 'Xatolik yuz berdi / Error occurred', 'ai');
            }
        } catch (error) {
            document.getElementById(loadingId)?.remove();
            addMessage('Server bilan bog\'lanishda xatolik / Connection error', 'ai');
        } finally {
            sendBtn.disabled = false;
            userInput.disabled = false;
            isProcessing = false;
            userInput.focus();
        }
    });
}

function addMessage(text, type, isLoading = false) {
    const messagesContainer = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    const id = `msg-${Date.now()}`;
    messageDiv.id = id;
    messageDiv.className = `message ${type}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (isLoading) {
        contentDiv.innerHTML = '<div class="loading-dots"><span>.</span><span>.</span><span>.</span></div>';
    } else {
        contentDiv.innerHTML = formatMessage(text);
    }
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return id;
}

async function addMessageWithTyping(text, type) {
    const messagesContainer = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    const id = `msg-${Date.now()}`;
    messageDiv.id = id;
    messageDiv.className = `message ${type} typing`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    
    // Faster typing effect - by characters instead of words
    let currentText = '';
    const chars = text.split('');
    
    for (let i = 0; i < chars.length; i++) {
        currentText += chars[i];
        contentDiv.innerHTML = formatMessage(currentText);
        
        // Scroll every 10 characters for better performance
        if (i % 10 === 0) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        // Faster typing - 10ms per character
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    // Final scroll
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    messageDiv.classList.remove('typing');
    return id;
}

function formatMessage(text) {
    // Format emojis and structure
    return text
        .replace(/📊 TAHLIL:/g, '<div class="section-title">📊 TAHLIL:</div>')
        .replace(/💡 YECHIM:/g, '<div class="section-title">💡 YECHIM:</div>')
        .replace(/🎯 AMALIY MASLAHAT:/g, '<div class="section-title">🎯 AMALIY MASLAHAT:</div>')
        .replace(/✨ ILHOM:/g, '<div class="section-title">✨ ILHOM:</div>')
        .replace(/📊 ANALYSIS:/g, '<div class="section-title">📊 ANALYSIS:</div>')
        .replace(/💡 SOLUTION:/g, '<div class="section-title">💡 SOLUTION:</div>')
        .replace(/🎯 ACTIONABLE ADVICE:/g, '<div class="section-title">🎯 ACTIONABLE ADVICE:</div>')
        .replace(/✨ INSPIRATION:/g, '<div class="section-title">✨ INSPIRATION:</div>')
        .replace(/\n/g, '<br>');
}

async function loadStats() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/chat/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            updateStats(data.remainingQuestions);
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

function updateStats(remaining) {
    const statsEl = document.getElementById('dailyLimit');
    if (statsEl) {
        statsEl.textContent = `${remaining}/20`;
        
        if (remaining <= 5) {
            statsEl.classList.add('warning');
        } else {
            statsEl.classList.remove('warning');
        }
    }
}

async function loadHistory() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/chat/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayHistory(data.history);
        }
    } catch (error) {
        console.error('Failed to load history:', error);
    }
}

function displayHistory(history) {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    if (history.length === 0) {
        historyList.innerHTML = '<div class="no-history"><i class="fas fa-inbox"></i><br>Hali suhbat yo\'q / No conversations yet</div>';
        return;
    }
    
    history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-question"><i class="fas fa-user"></i> ${item.question}</div>
            <div class="history-answer"><i class="fas fa-robot"></i> ${item.answer.substring(0, 100)}...</div>
        `;
        historyItem.addEventListener('click', () => {
            document.getElementById('messages').innerHTML = '';
            addMessage(item.question, 'user');
            addMessage(item.answer, 'ai');
            toggleHistory();
        });
        historyList.appendChild(historyItem);
    });
}

function toggleHistory() {
    document.getElementById('historyPanel').classList.toggle('active');
}

async function clearHistory() {
    const lang = getCurrentLanguage();
    const confirmMsg = lang === 'uz' 
        ? 'Barcha suhbatlarni o\'chirmoqchimisiz?' 
        : 'Clear all conversations?';
    
    if (!confirm(confirmMsg)) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/chat/history`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            document.getElementById('messages').innerHTML = '';
            loadHistory();
        }
    } catch (error) {
        console.error('Failed to clear history:', error);
    }
}
