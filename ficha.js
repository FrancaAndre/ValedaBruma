document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('ose-form');
    const btnConcluir = document.getElementById('btn-concluir');
    const fichaView = document.getElementById('ficha-view');
    const btnDownload = document.getElementById('btn-download');

    // Função para tocar som de espada cortando
    function playSlashSound() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const audioCtx = new AudioContext();
            
            const bufferSize = audioCtx.sampleRate * 0.3; // 300ms
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1; // Ruído branco
            }
            
            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;
            
            // Filtro para dar aspecto metálico "swoosh"
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(500, audioCtx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(8000, audioCtx.currentTime + 0.1);
            
            const gainNode = audioCtx.createGain();
            gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            
            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            noise.start();
        } catch (e) {
            console.error("Erro ao tocar áudio", e);
        }
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Tocar som e iniciar animação
            playSlashSound();
            btnConcluir.classList.add('cut');

            // Pegar os dados
            const charData = {
                id: Date.now().toString(),
                name: document.getElementById('charName').value,
                class: document.getElementById('charClass').value,
                title: document.getElementById('charTitle').value,
                align: document.getElementById('charAlign').value,
                level: document.getElementById('charLevel').value,
                for: document.getElementById('attrFOR').value,
                int: document.getElementById('attrINT').value,
                sab: document.getElementById('attrSAB').value,
                des: document.getElementById('attrDES').value,
                con: document.getElementById('attrCON').value,
                car: document.getElementById('attrCAR').value,
                hp: document.getElementById('charHP').value,
                ac: document.getElementById('charAC').value,
            };

            // Salvar no localStorage
            let personagens = JSON.parse(localStorage.getItem('valeDaBrumaChars') || '[]');
            personagens.push(charData);
            localStorage.setItem('valeDaBrumaChars', JSON.stringify(personagens));

            // Atualizar View
            document.getElementById('viewName').textContent = charData.name;
            document.getElementById('viewClass').textContent = charData.class;
            document.getElementById('viewLevel').textContent = charData.level;
            document.getElementById('viewAlign').textContent = charData.align;
            
            document.getElementById('viewFOR').textContent = charData.for;
            document.getElementById('viewINT').textContent = charData.int;
            document.getElementById('viewSAB').textContent = charData.sab;
            document.getElementById('viewDES').textContent = charData.des;
            document.getElementById('viewCON').textContent = charData.con;
            document.getElementById('viewCAR').textContent = charData.car;
            
            document.getElementById('viewHP').textContent = charData.hp;
            document.getElementById('viewAC').textContent = charData.ac;

            // Transição
            setTimeout(() => {
                form.classList.add('hidden');
                fichaView.classList.remove('hidden');
            }, 800); // tempo para a animação de quebra terminar
        });
    }

    if (btnDownload) {
        btnDownload.addEventListener('click', () => {
            const element = document.getElementById('pdf-content');
            const opt = {
                margin:       1,
                filename:     `Ficha_${document.getElementById('viewName').textContent}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, backgroundColor: '#1e293b' },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            // Gerar PDF
            html2pdf().set(opt).from(element).save();
        });
    }
});
