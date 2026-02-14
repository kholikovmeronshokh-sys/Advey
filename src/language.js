let currentLang = localStorage.getItem('lang') || 'uz';

export function initLanguage() {
    updateLanguage();
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            setLanguage(lang);
        });
    });
}

export function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    updateLanguage();
}

export function getCurrentLanguage() {
    return currentLang;
}

function updateLanguage() {
    // Update all elements with data-uz and data-en attributes
    document.querySelectorAll('[data-uz][data-en]').forEach(el => {
        el.textContent = el.dataset[currentLang];
    });
    
    // Update placeholders
    document.querySelectorAll('[data-placeholder-uz][data-placeholder-en]').forEach(el => {
        el.placeholder = el.dataset[`placeholder${currentLang.charAt(0).toUpperCase() + currentLang.slice(1)}`];
    });
    
    // Update active language button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
}
