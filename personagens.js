document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('heroes-grid');
    const emptyState = document.getElementById('empty-state');

    // Carregar personagens
    const personagens = JSON.parse(localStorage.getItem('valeDaBrumaChars') || '[]');

    if (personagens.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        personagens.forEach(char => {
            const card = document.createElement('div');
            card.className = 'hero-card';
            card.innerHTML = `
                <div class="hero-name">${char.name}</div>
                <div class="hero-info">${char.class} - Nível ${char.level}</div>
                <div style="display:flex; justify-content:space-around; margin-top:1rem; border-top:1px solid rgba(255,255,255,0.1); padding-top:1rem;">
                    <div><small>PV</small><br><strong>${char.hp}</strong></div>
                    <div><small>CA</small><br><strong>${char.ac}</strong></div>
                    <div><small>Alinhamento</small><br><strong>${char.align}</strong></div>
                </div>
            `;
            grid.appendChild(card);
        });
    }
});
