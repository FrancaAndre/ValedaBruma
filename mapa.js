document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.getElementById('map-wrapper');
    const container = document.getElementById('map-container');
    const modal = document.getElementById('info-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const closeModal = document.getElementById('close-modal');
    const pinsContainer = document.getElementById('pins-container');

    // Estado do Pan e Zoom
    let scale = 1;
    let isDragging = false;
    let startX, startY;
    let translateX = 0, translateY = 0;

    // Dados extraídos do PDF
    // As coordenadas (x, y) são em porcentagem (0-100) para funcionar independente do tamanho da imagem.
    // Como a IA não vê a imagem real, posicionei em locais aproximados/espalhados.
    // O usuário pode facilmente alterar os valores de x e y para ajustar perfeitamente no mapa real.
    const locations = [
        {
            id: 1, name: "Vale da Bruma", icon: "🌫️",
            x: 50, y: 50, // Central
            desc: "<p>Ponto inicial da campanha. Uma cidade pequena situada num vale permanentemente coberto por neblina. Estranha, isolada, e marcada por eventos misteriosos no passado.</p><p>Atualmente vive uma ascensão econômica devido à descoberta da <strong>Runita</strong>. Rumores dizem que o Vale já foi palco de rituais antigos e que a própria neblina 'observa'.</p>"
        },
        {
            id: 2, name: "Varrok", icon: "🏰",
            x: 50, y: 30, // Ao norte do Vale
            desc: "<p>Reino grande e fortificado, ao norte do Vale da Bruma. Conhecido por sua disciplina militar e organização rígida.</p><ul><li>Sociedade austera e hierárquica.</li><li>Magia vista com desconfiança.</li><li>Exército temido e arquitetura de muralhas altas.</li></ul><p>Diz-se que o inverno varrockiano é tão frio quanto a própria política do reino.</p>"
        },
        {
            id: 3, name: "Feerox", icon: "⚖️",
            x: 50, y: 70, // Ao sul do Vale
            desc: "<p>Reino ao sul do Vale da Bruma, atualmente em crise profunda e Guerra Civil.</p><ul><li><strong>O Império:</strong> tradicionalista, autoritário e rico.</li><li><strong>A Resistência:</strong> descentralizada, popular e desesperada.</li></ul><p>A população vive no medo sob o controle das facções nas estradas.</p>"
        },
        {
            id: 4, name: "Karamja", icon: "🌴",
            x: 80, y: 50, // Costeiro, assumindo Leste/Oeste
            desc: "<p>Reino costeiro com clima tropical. Um reino relativamente estável e próspero.</p><ul><li>Economia baseada na extração de sal e comércio marítimo.</li><li>Navegadores habilidosos que cruzam rotas perigosas.</li></ul>"
        },
        {
            id: 5, name: "Lumbridge", icon: "🧙‍♂️",
            x: 80, y: 80, // Sudeste
            desc: "<p>Localizado na extremidade sudeste de Eldoria, cercado por Terras Selvagens.</p><ul><li>Vasto conhecimento mágico e escolas arcanas.</li><li>Acesso marítimo apenas para Karamja ou Arkeem.</li></ul><p>Regida por forças militares, criando um equilíbrio estranho entre magia e disciplina.</p>"
        },
        {
            id: 6, name: "Arkeem", icon: "🌾",
            x: 80, y: 65, // Norte de Lumbridge
            desc: "<p>Pequeno reino ao norte de Lumbridge, em início de desenvolvimento cultural.</p><ul><li>Pouco povoado e com economia simples.</li><li>Exército pequeno, mas determinado.</li></ul><p>Persiste por teimosia com uma surpreendente capacidade de resistência.</p>"
        },
        {
            id: 7, name: "Edville", icon: "🗡️",
            x: 30, y: 50, // Ponto ligando leste/oeste
            desc: "<p>Cidade perigosa e instável, famosa pela guilda de ladrões.</p><ul><li>Feudo central controlado por 'famílias' criminosas.</li><li>Ruas mal iluminadas e estradas com emboscadas.</li></ul><p>Ponto estratégico ligando leste ao oeste de Eldoria, dominado pela corrupção.</p>"
        },
        {
            id: 8, name: "Dohan", icon: "🌲",
            x: 30, y: 30, // Norte de Edville
            desc: "<p>Localizada ao norte de Edville, na base de uma grande serra. A terra dos elfos.</p><ul><li>Forjas arcanas e armas excepcionais.</li><li>Elfos hábeis e profunda conexão com magia antiga.</li></ul><p>Rumores dizem que segredos da Segunda Era vivem nas florestas douradas de Dohan.</p>"
        },
        {
            id: 9, name: "Duri Drok", icon: "⛏️",
            x: 80, y: 20, // Nordeste
            desc: "<p>Cidade dos anões no nordeste de Eldoria, rica em minas e metais raros.</p><ul><li>Cultura rígida e disciplinada.</li><li>Maiores fortalezas subterrâneas e armaduras de alta qualidade.</li></ul><p>Rivalidade com humanos e elfos, mas também alianças poderosas.</p>"
        }
    ];

    // Gerar Pins
    locations.forEach(loc => {
        const pin = document.createElement('div');
        pin.className = 'map-pin';
        // As coordenadas são % da largura/altura do container da imagem
        pin.style.left = loc.x + '%';
        pin.style.top = loc.y + '%';
        pin.innerHTML = `${loc.id}<div class="pin-label">${loc.icon} ${loc.name}</div>`;
        
        pin.addEventListener('click', (e) => {
            e.stopPropagation(); // Previne que o clique dispare ações no mapa debaixo
            openModal(loc);
        });

        pinsContainer.appendChild(pin);
    });

    // Lógica do Modal
    function openModal(loc) {
        modalTitle.innerHTML = `${loc.icon} ${loc.name}`;
        modalDesc.innerHTML = loc.desc;
        modal.classList.remove('hidden');
    }

    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Fecha ao clicar fora da janela
    modal.addEventListener('click', (e) => {
        if(e.target === modal) modal.classList.add('hidden');
    });

    // --- LÓGICA DE PAN (Arraste) e ZOOM ---
    wrapper.addEventListener('mousedown', (e) => {
        if(e.target.closest('.map-pin')) return;
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateTransform();
    });

    wrapper.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomSpeed = 0.1;
        const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
        
        let newScale = scale + delta;
        // Limites de zoom
        if(newScale < 0.5) newScale = 0.5;
        if(newScale > 4) newScale = 4;
        
        // Ponto sob o mouse
        const rect = wrapper.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Ajustar translação para dar zoom em direção ao mouse
        translateX = mouseX - (mouseX - translateX) * (newScale / scale);
        translateY = mouseY - (mouseY - translateY) * (newScale / scale);
        
        scale = newScale;
        updateTransform();
    });

    function updateTransform() {
        container.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }
});
