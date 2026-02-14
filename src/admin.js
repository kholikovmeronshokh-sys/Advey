const API_URL = import.meta.env.PROD 
    ? '/api' 
    : 'http://localhost:3000/api';

export async function initAdmin() {
    // Check if user is admin
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/admin/check`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.isAdmin) {
            showAdminButton();
        }
    } catch (error) {
        console.error('Admin check failed:', error);
    }
}

function showAdminButton() {
    const headerActions = document.querySelector('.header-actions');
    
    // Check if button already exists
    if (document.getElementById('adminBtn')) return;
    
    const adminBtn = document.createElement('button');
    adminBtn.id = 'adminBtn';
    adminBtn.className = 'btn-icon btn-admin';
    adminBtn.innerHTML = `
        <i class="fas fa-user-shield"></i>
        <span class="btn-text">Admin</span>
    `;
    
    // Insert before history button
    const historyBtn = document.getElementById('historyBtn');
    headerActions.insertBefore(adminBtn, historyBtn);
    
    adminBtn.addEventListener('click', openAdminPanel);
}

async function openAdminPanel() {
    const token = localStorage.getItem('token');
    
    try {
        // Fetch stats and users
        const [statsRes, usersRes] = await Promise.all([
            fetch(`${API_URL}/admin/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`${API_URL}/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        const stats = await statsRes.json();
        const usersData = await usersRes.json();

        showAdminModal(stats, usersData.users);
    } catch (error) {
        console.error('Failed to load admin data:', error);
        alert('Failed to load admin panel');
    }
}

function showAdminModal(stats, users) {
    // Remove existing modal if any
    const existingModal = document.getElementById('adminModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'adminModal';
    modal.className = 'admin-modal';
    modal.innerHTML = `
        <div class="admin-modal-content">
            <div class="admin-header">
                <h2><i class="fas fa-user-shield"></i> Admin Panel</h2>
                <button class="admin-close" onclick="document.getElementById('adminModal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="admin-stats">
                <div class="stat-card">
                    <i class="fas fa-users"></i>
                    <div>
                        <h3>${stats.totalUsers}</h3>
                        <p>Total Users</p>
                    </div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-comments"></i>
                    <div>
                        <h3>${stats.totalQuestions}</h3>
                        <p>Total Questions</p>
                    </div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-fire"></i>
                    <div>
                        <h3>${stats.activeToday}</h3>
                        <p>Active Today</p>
                    </div>
                </div>
            </div>
            
            <div class="admin-users">
                <h3><i class="fas fa-list"></i> All Users</h3>
                <div class="users-list">
                    ${users.map(user => `
                        <div class="user-card">
                            <div class="user-info">
                                <div class="user-avatar-small">
                                    <i class="fas fa-user"></i>
                                </div>
                                <div class="user-details-small">
                                    <h4>${user.name}</h4>
                                    <p>${user.email}</p>
                                    <span class="user-stats-small">
                                        <i class="fas fa-comment"></i> ${Math.floor(user.totalMessages / 2)} questions
                                        <i class="fas fa-calendar"></i> ${user.dailyLimit.count}/20 today
                                    </span>
                                </div>
                            </div>
                            <div class="user-actions">
                                <button class="btn-view" onclick="viewUserHistory('${user.id}', '${user.name}')">
                                    <i class="fas fa-eye"></i> View
                                </button>
                                ${user.email !== 'kholikovmeronshokh@gmail.com' ? `
                                    <button class="btn-delete" onclick="deleteUser('${user.id}', '${user.name}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

window.viewUserHistory = async function(userId, userName) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/admin/users/${userId}/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        showHistoryModal(userName, data.history);
    } catch (error) {
        console.error('Failed to load user history:', error);
        alert('Failed to load user history');
    }
};

function showHistoryModal(userName, history) {
    const modal = document.createElement('div');
    modal.className = 'admin-modal history-modal';
    modal.innerHTML = `
        <div class="admin-modal-content">
            <div class="admin-header">
                <h2><i class="fas fa-history"></i> ${userName}'s Chat History</h2>
                <button class="admin-close" onclick="this.closest('.admin-modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="history-content">
                ${history.length === 0 ? '<p class="no-history">No conversations yet</p>' : ''}
                ${history.map(item => `
                    <div class="history-item-admin">
                        <div class="question-admin">
                            <i class="fas fa-user"></i>
                            <p>${item.question}</p>
                        </div>
                        <div class="answer-admin">
                            <i class="fas fa-robot"></i>
                            <p>${item.answer}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

window.deleteUser = async function(userId, userName) {
    if (!confirm(`Are you sure you want to delete ${userName}?`)) return;
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert('User deleted successfully');
            document.getElementById('adminModal').remove();
            openAdminPanel(); // Refresh
        } else {
            alert('Failed to delete user');
        }
    } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user');
    }
};
