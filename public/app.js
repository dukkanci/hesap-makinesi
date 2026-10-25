// Oyun Atölyesi - Voice Commands & Chat Implementation
// Supports: Speech Recognition (commands), Speech Synthesis (TTS), WebRTC Voice Chat

// ============================================
// STATE & CONFIGURATION
// ============================================
const state = {
    // Voice Commands
    recognition: null,
    isListening: false,
    language: 'tr-TR',
    ttsEnabled: true,

    // Voice Chat (WebRTC)
    peerConnection: null,
    localStream: null,
    remoteStream: null,
    isInVoiceChat: false,
    signalingChannel: null, // WebSocket for signaling

    // UI Elements
    elements: {}
};

// Voice command patterns (Turkish & English)
const voiceCommands = {
    'tr-TR': {
        dice: ['zar at', 'zar', 'dice', 'at zar'],
        character: ['karakter oluştur', 'karakter yap', 'yeni karakter', 'npc oluştur'],
        namegen: ['isim ver', 'isim üret', 'fantasy isim', 'isim öner'],
        encounter: ['mücadele hazırla', 'mücadele tasarla', 'encounter', 'düşman oluştur'],
        loot: ['loot ver', 'loot çek', 'ödül ver', 'eşya ver'],
        world: ['dünya tanıt', 'harita göster', 'bölge oluştur', 'dünya oluştur'],
        calculator: ['hesap makinesi', 'hesap makinesini aç', 'calculator'],
        stop: ['durdur', 'kapat', 'sessiz', 'bitir', 'stop', 'dur']
    },
    'en-US': {
        dice: ['roll dice', 'dice', 'roll'],
        character: ['create character', 'new character', 'npc'],
        namegen: ['give name', 'generate name', 'fantasy name'],
        encounter: ['create encounter', 'design encounter', 'battle'],
        loot: ['give loot', 'roll loot', 'reward'],
        world: ['show world', 'create world', 'map'],
        calculator: ['calculator', 'open calculator'],
        stop: ['stop', 'quit', 'quiet', 'end']
    }
};

// Tool implementations
const tools = {
    dice: () => {
        const sides = [4, 6, 8, 10, 12, 20, 100];
        const results = sides.map(s => Math.floor(Math.random() * s) + 1);
        return `🎲 Zar sonuçları: ${results.map((r, i) => `d${sides[i]}: ${r}`).join(', ')}`;
    },
    character: () => {
        const races = ['İnsan', 'Elf', 'Cüce', 'Hobbit', 'Ork', 'Tiefling', 'Ejderi'];
        const classes = ['Savaşçı', 'Büyücü', 'Hırsız', 'Ranger', 'Paladin', 'Barbar', 'Bard', 'Druid', 'Monk'];
        const race = races[Math.floor(Math.random() * races.length)];
        const cls = classes[Math.floor(Math.random() * classes.length)];
        const level = Math.floor(Math.random() * 10) + 1;
        return `🎭 Yeni Karakter: **${race} ${cls}** (Seviye ${level})`;
    },
    namegen: () => {
        const prefixes = ['Ael', 'Bor', 'Cyl', 'Dor', 'Eir', 'Fen', 'Gor', 'Hal', 'Ith', 'Jor', 'Kel', 'Lor', 'Mor', 'Nym', 'Orn', 'Pyr', 'Qil', 'Ryn', 'Syl', 'Tor', 'Ulv', 'Vex', 'Wyn', 'Xan', 'Yor', 'Zyl'];
        const suffixes = ['an', 'dor', 'el', 'fin', 'gor', 'hyn', 'ion', 'jor', 'kas', 'lor', 'mir', 'nor', 'or', 'phex', 'qun', 'rin', 'sor', 'tor', 'ul', 'ven', 'wyn', 'xan', 'yor', 'zin'];
        const name = prefixes[Math.floor(Math.random() * prefixes.length)] +
                     suffixes[Math.floor(Math.random() * suffixes.length)] +
                     suffixes[Math.floor(Math.random() * suffixes.length)];
        return `🏷️ Önerilen isim: **${name.charAt(0).toUpperCase() + name.slice(1)}**`;
    },
    encounter: () => {
        const monsters = ['Goblin', 'Ork', 'Kurt', 'Akrep', 'Örümcek', 'Zombi', 'İskelet', 'Şeytan', 'Ejderha'];
        const count = Math.floor(Math.random() * 6) + 1;
        const monster = monsters[Math.floor(Math.random() * monsters.length)];
        const difficulty = ['Kolay', 'Orta', 'Zor', 'Ölümcül'][Math.floor(Math.random() * 4)];
        return `⚔️ Mücadele: **${count} ${monster}${count > 1 ? 'lar' : ''}** (${difficulty})`;
    },
    loot: () => {
        const items = [
            'Kılıç +1', 'Kalkan +1', 'Büyü Asası', 'İksir (İyileşme)', 'Altın (100-500)',
            'Harcı Sahnesi', 'Sihirli Yüzük', 'Zırh +1', 'Ok (20 adet)', 'Taç'
        ];
        const count = Math.floor(Math.random() * 3) + 1;
        const loot = [];
        for (let i = 0; i < count; i++) {
            loot.push(items[Math.floor(Math.random() * items.length)]);
        }
        return `💰 Loot: ${loot.join(', ')}`;
    },
    world: () => {
        const regions = ['Dağlık Bölge', 'Orman', 'Çöl', 'Sahil', 'Bataklık', 'Tundra', 'Vadisi', 'Cennet Adası'];
        const settlements = ['Köy', 'Kasaba', 'Şehir', 'Kale', 'Manastır', 'Ticaret Merkezi'];
        const region = regions[Math.floor(Math.random() * regions.length)];
        const settlement = settlements[Math.floor(Math.random() * settlements.length)];
        return `🌍 Dünya: **${region}** içinde bir **${settlement}**`;
    },
    calculator: () => {
        openTool('calculator');
        return '🔢 Hesap makinesi açıldı!';
    }
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    initSpeechRecognition();
    initEventListeners();
    updateWelcomeTime();
    initWebRTCSignaling();

    console.log('🎮 Oyun Atölyesi hazır!');
    console.log('🎤 Sesli komutlar etkin');
    console.log('🔊 WebRTC sesli sohbet hazır');
});

// Cache DOM elements
function cacheElements() {
    state.elements = {
        voiceToggleBtn: document.getElementById('voiceToggleBtn'),
        micIcon: document.getElementById('micIcon'),
        micIconMuted: document.getElementById('micIconMuted'),
        btnText: document.getElementById('btnText'),
        voiceChatBtn: document.getElementById('voiceChatBtn'),
        voiceChatBtnText: document.getElementById('voiceChatBtnText'),
        statusIndicator: document.getElementById('statusIndicator'),
        statusText: document.getElementById('statusText'),
        voiceVisualizer: document.getElementById('voiceVisualizer'),
        visualizerText: document.getElementById('visualizerText'),
        clearChatBtn: document.getElementById('clearChatBtn'),
        chatMessages: document.getElementById('chatMessages'),
        chatInput: document.getElementById('chatInput'),
        chatForm: document.getElementById('chatForm'),
        languageSelect: document.getElementById('languageSelect'),
        ttsToggleBtn: document.getElementById('ttsToggleBtn'),
        detailPanel: document.getElementById('detailPanel'),
        detailTitle: document.getElementById('detailTitle'),
        detailContent: document.getElementById('detailContent'),
        closeDetailBtn: document.getElementById('closeDetailBtn'),
        toolGrid: document.getElementById('toolGrid'),
        toastContainer: document.getElementById('toastContainer')
    };
}

// ============================================
// SPEECH RECOGNITION (Voice Commands)
// ============================================
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        showToast('⚠️ Tarayıcınız ses tanımayı desteklemiyor. Chrome/Edge önerilir.', 'warning');
        disableVoiceUI();
        return;
    }

    state.recognition = new SpeechRecognition();
    state.recognition.continuous = true;
    state.recognition.interimResults = true;
    state.recognition.lang = state.language;
    state.recognition.maxAlternatives = 1;

    state.recognition.onstart = () => {
        state.isListening = true;
        updateVoiceUI(true);
        showVisualizer(true);
    };

    state.recognition.onend = () => {
        state.isListening = false;
        updateVoiceUI(false);
        showVisualizer(false);
        // Auto-restart if still supposed to be listening
        if (state.elements.voiceToggleBtn.classList.contains('listening')) {
            setTimeout(() => {
                if (state.elements.voiceToggleBtn.classList.contains('listening')) {
                    try { state.recognition.start(); } catch(e) {}
                }
            }, 500);
        }
    };

    state.recognition.onerror = (event) => {
        console.warn('Ses tanıma hatası:', event.error);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
            showToast('🎤 Mikrofon izni reddedildi. Tarayıcı ayarlarından izin verin.', 'error');
            stopListening();
        } else if (event.error === 'no-speech') {
            // Normal, ignore
        }
    };

    state.recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        if (finalTranscript) {
            processVoiceCommand(finalTranscript.trim().toLowerCase());
        }
        updateVisualizerText(interimTranscript || finalTranscript || 'Dinleniyor...');
    };
}

function startListening() {
    if (!state.recognition) return;
    try {
        state.recognition.lang = state.language;
        state.recognition.start();
        state.elements.voiceToggleBtn.classList.add('listening');
    } catch (e) {
        console.error('Ses tanıma başlatılamadı:', e);
        showToast('Ses tanıma başlatılamadı', 'error');
    }
}

function stopListening() {
    if (!state.recognition) return;
    try {
        state.recognition.stop();
    } catch (e) {}
    state.elements.voiceToggleBtn.classList.remove('listening');
    state.isListening = false;
    updateVoiceUI(false);
    showVisualizer(false);
}

function toggleListening() {
    if (state.isListening) {
        stopListening();
    } else {
        startListening();
    }
}

function processVoiceCommand(command) {
    addMessage('user', `🎤 "${command}"`);

    // Check for stop command first
    const stopCmds = voiceCommands[state.language].stop || [];
    if (stopCmds.some(cmd => command.includes(cmd))) {
        stopListening();
        speak('Dinleme durduruldu.');
        addMessage('system', '🔇 Sesli dinleme kapatıldı.');
        return;
    }

    // Match command
    let matchedTool = null;
    for (const [tool, cmds] of Object.entries(voiceCommands[state.language])) {
        if (cmds.some(cmd => command.includes(cmd))) {
            matchedTool = tool;
            break;
        }
    }

    if (matchedTool && tools[matchedTool]) {
        const result = tools[matchedTool]();
        addMessage('assistant', result);
        speak(result);
        openTool(matchedTool);
    } else {
        const responses = {
            'tr-TR': 'Anlamadım. "Zar at", "Karakter oluştur" gibi komutlar deneyin.',
            'en-US': 'I didn\'t understand. Try "roll dice", "create character", etc.'
        };
        const response = responses[state.language] || responses['tr-TR'];
        addMessage('assistant', response);
        speak(response);
    }
}

// ============================================
// SPEECH SYNTHESIS (Text-to-Speech)
// ============================================
function speak(text) {
    if (!state.ttsEnabled || !window.speechSynthesis) return;

    // Clean text for speech (remove markdown)
    const cleanText = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/[#*_`]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = state.language;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to find a good voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith(state.language.split('-')[0]));
    if (preferredVoice) utterance.voice = preferredVoice;

    speechSynthesis.cancel(); // Stop any current speech
    speechSynthesis.speak(utterance);
}

function toggleTTS() {
    state.ttsEnabled = !state.ttsEnabled;
    const btn = state.elements.ttsToggleBtn;
    const speakerIcon = btn.querySelector('.speaker-icon:not(.muted)');
    const speakerIconMuted = btn.querySelector('.speaker-icon.muted');

    if (state.ttsEnabled) {
        speakerIcon.style.display = 'block';
        speakerIconMuted.style.display = 'none';
        btn.title = 'Metin okuma: Açık';
    } else {
        speakerIcon.style.display = 'none';
        speakerIconMuted.style.display = 'block';
        btn.title = 'Metin okuma: Kapalı';
        speechSynthesis.cancel();
    }
}

// ============================================
// VOICE CHAT (WebRTC)
// ============================================
async function initWebRTCSignaling() {
    // Use WebSocket for signaling (connect to same server)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
        state.signalingChannel = new WebSocket(wsUrl);

        state.signalingChannel.onopen = () => {
            console.log('🔗 Signaling server connected');
        };

        state.signalingChannel.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            await handleSignalingMessage(data);
        };

        state.signalingChannel.onclose = () => {
            console.log('🔌 Signaling disconnected, reconnecting...');
            setTimeout(initWebRTCSignaling, 3000);
        };

        state.signalingChannel.onerror = (err) => {
            console.warn('WebSocket error:', err);
        };
    } catch (e) {
        console.warn('WebSocket not available, using manual signaling');
        // Fallback: manual signaling via copy-paste (for simple testing)
    }
}

async function handleSignalingMessage(data) {
    if (!state.peerConnection) await createPeerConnection();

    switch (data.type) {
        case 'offer':
            await state.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await state.peerConnection.createAnswer();
            await state.peerConnection.setLocalDescription(answer);
            sendSignaling({ type: 'answer', answer });
            break;

        case 'answer':
            await state.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
            break;

        case 'candidate':
            if (data.candidate) {
                await state.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
            break;

        case 'join':
            // Someone wants to join, create offer
            if (!state.isInVoiceChat) {
                await startVoiceChat(true); // isInitiator = true
            }
            break;

        case 'leave':
            endVoiceChat();
            break;
    }
}

function sendSignaling(data) {
    if (state.signalingChannel && state.signalingChannel.readyState === WebSocket.OPEN) {
        state.signalingChannel.send(JSON.stringify(data));
    }
}

async function createPeerConnection() {
    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };

    state.peerConnection = new RTCPeerConnection(configuration);

    state.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            sendSignaling({ type: 'candidate', candidate: event.candidate });
        }
    };

    state.peerConnection.ontrack = (event) => {
        state.remoteStream = event.streams[0];
        playRemoteAudio(state.remoteStream);
    };

    state.peerConnection.onconnectionstatechange = () => {
        console.log('WebRTC state:', state.peerConnection.connectionState);
        if (state.peerConnection.connectionState === 'connected') {
            showToast('🎙️ Sesli sohbet bağlandı!', 'success');
        } else if (state.peerConnection.connectionState === 'disconnected' ||
                   state.peerConnection.connectionState === 'failed') {
            showToast('🔌 Sesli sohbet kesildi', 'warning');
            endVoiceChat();
        }
    };

    // Add local audio track
    if (state.localStream) {
        state.localStream.getTracks().forEach(track => {
            state.peerConnection.addTrack(track, state.localStream);
        });
    }
}

async function startVoiceChat(isInitiator = false) {
    try {
        // Get user media (audio only)
        state.localStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });

        await createPeerConnection();

        state.isInVoiceChat = true;
        updateVoiceChatUI(true);

        if (isInitiator) {
            const offer = await state.peerConnection.createOffer();
            await state.peerConnection.setLocalDescription(offer);
            sendSignaling({ type: 'offer', offer });
            showToast('📞 Bağlantı bekleniyor... (Arkadaşınız "Katıl" butonuna basmalı)', 'info');
        } else {
            sendSignaling({ type: 'join' });
        }

    } catch (err) {
        console.error('Voice chat error:', err);
        if (err.name === 'NotAllowedError') {
            showToast('🎤 Mikrofon izni gerekli!', 'error');
        } else {
            showToast('Sesli sohbet başlatılamadı: ' + err.message, 'error');
        }
        endVoiceChat();
    }
}

function endVoiceChat() {
    if (state.peerConnection) {
        state.peerConnection.close();
        state.peerConnection = null;
    }
    if (state.localStream) {
        state.localStream.getTracks().forEach(track => track.stop());
        state.localStream = null;
    }
    if (state.remoteStream) {
        state.remoteStream.getTracks().forEach(track => track.stop());
        state.remoteStream = null;
    }
    state.isInVoiceChat = false;
    updateVoiceChatUI(false);
    sendSignaling({ type: 'leave' });
}

function playRemoteAudio(stream) {
    let audio = document.getElementById('remoteAudio');
    if (!audio) {
        audio = document.createElement('audio');
        audio.id = 'remoteAudio';
        audio.autoplay = true;
        audio.style.display = 'none';
        document.body.appendChild(audio);
    }
    audio.srcObject = stream;
}

function toggleVoiceChat() {
    if (state.isInVoiceChat) {
        endVoiceChat();
    } else {
        startVoiceChat(false); // Join as receiver
    }
}

function updateVoiceChatUI(connected) {
    const btn = state.elements.voiceChatBtn;
    const phoneIcon = btn.querySelector('.phone-icon:not(.active)');
    const phoneIconActive = btn.querySelector('.phone-icon.active');
    const btnText = state.elements.voiceChatBtnText;

    if (connected) {
        btn.classList.add('active');
        btn.setAttribute('aria-label', 'Sesli sohbeti kapat');
        phoneIcon.style.display = 'none';
        phoneIconActive.style.display = 'block';
        btnText.textContent = 'Bağlı';
    } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-label', 'Sesli sohbeti aç');
        phoneIcon.style.display = 'block';
        phoneIconActive.style.display = 'none';
        btnText.textContent = 'Sesli Sohbet';
    }
}

// ============================================
// TOOL SYSTEM
// ============================================
function openTool(toolName) {
    const toolNames = {
        dice: 'Zar At',
        character: 'Karakter Oluştur',
        namegen: 'İsim Üretici',
        encounter: 'Mücadele Tasarım',
        loot: 'Loot Tablosu',
        world: 'Dünya Oluşturucu',
        calculator: 'Hesap Makinesi'
    };

    state.elements.detailTitle.textContent = toolNames[toolName] || 'Araç';
    state.elements.detailPanel.classList.add('open');

    // Generate tool content
    let content = '';
    switch (toolName) {
        case 'dice':
            content = generateDiceUI();
            break;
        case 'character':
            content = generateCharacterUI();
            break;
        case 'namegen':
            content = generateNameGenUI();
            break;
        case 'encounter':
            content = generateEncounterUI();
            break;
        case 'loot':
            content = generateLootUI();
            break;
        case 'world':
            content = generateWorldUI();
            break;
        case 'calculator':
            content = generateCalculatorUI();
            break;
    }
    state.elements.detailContent.innerHTML = content;
    initToolInteractions(toolName);
}

function closeDetailPanel() {
    state.elements.detailPanel.classList.remove('open');
}

// Tool UI Generators
function generateDiceUI() {
    return `
        <div class="tool-detail">
            <p>D&D ve RPG sistemleri için zar atın.</p>
            <div class="dice-buttons">
                <button class="dice-btn" data-sides="4">d4</button>
                <button class="dice-btn" data-sides="6">d6</button>
                <button class="dice-btn" data-sides="8">d8</button>
                <button class="dice-btn" data-sides="10">d10</button>
                <button class="dice-btn" data-sides="12">d12</button>
                <button class="dice-btn" data-sides="20">d20</button>
                <button class="dice-btn" data-sides="100">d100</button>
            </div>
            <div class="dice-result" id="diceResult"></div>
            <button class="btn btn-primary" id="rollAllBtn">Hepsini At</button>
        </div>
    `;
}

function generateCharacterUI() {
    return `
        <div class="tool-detail">
            <p>Hızlı NPC/PC karakter oluşturun.</p>
            <div class="character-result" id="characterResult"></div>
            <button class="btn btn-primary" id="genCharBtn">Yeni Karakter</button>
        </div>
    `;
}

function generateNameGenUI() {
    return `
        <div class="tool-detail">
            <p>Fantasy, sci-fi isimler üretin.</p>
            <select id="nameType" class="tool-select">
                <option value="fantasy">Fantasy</option>
                <option value="scifi">Sci-Fi</option>
                <option value="turkish">Türkçe</option>
            </select>
            <div class="name-result" id="nameResult"></div>
            <button class="btn btn-primary" id="genNameBtn">İsim Üret</button>
        </div>
    `;
}

function generateEncounterUI() {
    return `
        <div class="tool-detail">
            <p>Dengeli mücadeleler tasarlayın.</p>
            <div class="encounter-controls">
                <label>Seviye: <input type="number" id="encLevel" value="3" min="1" max="20"></label>
                <label>Oyuncu Sayısı: <input type="number" id="encPlayers" value="4" min="1" max="8"></label>
                <label>Zorluk:
                    <select id="encDifficulty" class="tool-select">
                        <option value="easy">Kolay</option>
                        <option value="medium" selected>Orta</option>
                        <option value="hard">Zor</option>
                        <option value="deadly">Ölümcül</option>
                    </select>
                </label>
            </div>
            <div class="encounter-result" id="encounterResult"></div>
            <button class="btn btn-primary" id="genEncounterBtn">Mücadele Oluştur</button>
        </div>
    `;
}

function generateLootUI() {
    return `
        <div class="tool-detail">
            <p>Rastgele ödüller ve eşyalar çekin.</p>
            <select id="lootType" class="tool-select">
                <option value="any">Herhangi</option>
                <option value="weapon">Silah</option>
                <option value="armor">Zırh</option>
                <option value="potion">İksir</option>
                <option value="magic">Sihirli</option>
            </select>
            <div class="loot-result" id="lootResult"></div>
            <button class="btn btn-primary" id="genLootBtn">Loot Çek</button>
        </div>
    `;
}

function generateWorldUI() {
    return `
        <div class="tool-detail">
            <p>Harita, şehir, bölgesel içerik oluşturun.</p>
            <select id="worldType" class="tool-select">
                <option value="region">Bölge</option>
                <option value="settlement">Yerleşim</option>
                <option value="dungeon">Zindan</option>
                <option value="quest">Görev Kancası</option>
            </select>
            <div class="world-result" id="worldResult"></div>
            <button class="btn btn-primary" id="genWorldBtn">Oluştur</button>
        </div>
    `;
}

function generateCalculatorUI() {
    return `
        <div class="tool-detail calculator-ui">
            <div class="calc-display" id="calcDisplay">0</div>
            <div class="calc-buttons">
                <button class="calc-btn func" data-action="clear">C</button>
                <button class="calc-btn func" data-action="backspace">⌫</button>
                <button class="calc-btn func" data-action="paren">(</button>
                <button class="calc-btn func" data-action="paren">)</button>
                <button class="calc-btn op" data-value="/">÷</button>
                <button class="calc-btn" data-value="7">7</button>
                <button class="calc-btn" data-value="8">8</button>
                <button class="calc-btn" data-value="9">9</button>
                <button class="calc-btn op" data-value="*">×</button>
                <button class="calc-btn" data-value="4">4</button>
                <button class="calc-btn" data-value="5">5</button>
                <button class="calc-btn" data-value="6">6</button>
                <button class="calc-btn op" data-value="-">−</button>
                <button class="calc-btn" data-value="1">1</button>
                <button class="calc-btn" data-value="2">2</button>
                <button class="calc-btn" data-value="3">3</button>
                <button class="calc-btn op" data-value="+">+</button>
                <button class="calc-btn" data-value="0">0</button>
                <button class="calc-btn" data-value=".">.</button>
                <button class="calc-btn" data-value="pi">π</button>
                <button class="calc-btn op" data-value="=">=</button>
            </div>
        </div>
    `;
}

// Tool Interactions
function initToolInteractions(toolName) {
    switch (toolName) {
        case 'dice':
            document.querySelectorAll('.dice-btn').forEach(btn => {
                btn.onclick = () => rollDice(parseInt(btn.dataset.sides));
            });
            document.getElementById('rollAllBtn').onclick = rollAllDice;
            break;
        case 'character':
            document.getElementById('genCharBtn').onclick = generateCharacter;
            generateCharacter();
            break;
        case 'namegen':
            document.getElementById('genNameBtn').onclick = generateName;
            document.getElementById('nameType').onchange = generateName;
            generateName();
            break;
        case 'encounter':
            document.getElementById('genEncounterBtn').onclick = generateEncounter;
            generateEncounter();
            break;
        case 'loot':
            document.getElementById('genLootBtn').onclick = generateLoot;
            document.getElementById('lootType').onchange = generateLoot;
            generateLoot();
            break;
        case 'world':
            document.getElementById('genWorldBtn').onclick = generateWorld;
            document.getElementById('worldType').onchange = generateWorld;
            generateWorld();
            break;
        case 'calculator':
            initCalculator();
            break;
    }
}

// Tool Implementations
function rollDice(sides) {
    const result = Math.floor(Math.random() * sides) + 1;
    const display = document.getElementById('diceResult');
    display.innerHTML = `<div class="dice-roll">d${sides}: <strong>${result}</strong></div>` + (display.innerHTML || '');
    speak(`d${sides}, ${result}`);
}

function rollAllDice() {
    const sides = [4, 6, 8, 10, 12, 20, 100];
    const display = document.getElementById('diceResult');
    display.innerHTML = sides.map(s => {
        const r = Math.floor(Math.random() * s) + 1;
        return `<div class="dice-roll">d${s}: <strong>${r}</strong></div>`;
    }).join('');
    speak('Tüm zarlar atıldı');
}

function generateCharacter() {
    const result = tools.character();
    document.getElementById('characterResult').innerHTML = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    speak(result);
}

function generateName() {
    const type = document.getElementById('nameType').value;
    let name = '';
    if (type === 'turkish') {
        const first = ['Ayşe', 'Mehmet', 'Fatma', 'Ali', 'Zeynep', 'Mustafa', 'Emine', 'Hasan'];
        const last = ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Yıldız', 'Arslan', 'Doğan'];
        name = `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
    } else {
        name = tools.namegen().replace('🏷️ Önerilen isim: **', '').replace('**', '');
    }
    document.getElementById('nameResult').innerHTML = `<strong>${name}</strong>`;
    speak(`İsim: ${name}`);
}

function generateEncounter() {
    const level = parseInt(document.getElementById('encLevel').value) || 3;
    const players = parseInt(document.getElementById('encPlayers').value) || 4;
    const difficulty = document.getElementById('encDifficulty').value;

    const monsters = [
        { name: 'Goblin', cr: 0.25, xp: 50 },
        { name: 'Kurt', cr: 0.25, xp: 50 },
        { name: 'Ork', cr: 0.5, xp: 100 },
        { name: 'Akrep', cr: 0.5, xp: 100 },
        { name: 'Örümcek', cr: 0.5, xp: 100 },
        { name: 'Zombi', cr: 0.25, xp: 50 },
        { name: 'İskelet', cr: 0.25, xp: 50 },
        { name: 'Gnoll', cr: 0.5, xp: 100 },
        { name: 'Hobgoblin', cr: 0.5, xp: 100 },
        { name: 'Bugbear', cr: 1, xp: 200 },
        { name: 'Ogre', cr: 2, xp: 450 },
        { name: 'Troll', cr: 5, xp: 1800 },
        { name: 'Ejderha (Genç)', cr: 7, xp: 2900 }
    ];

    const xpThresholds = {
        easy: level * players * 25,
        medium: level * players * 50,
        hard: level * players * 75,
        deadly: level * players * 100
    };

    const budget = xpThresholds[difficulty];
    let encounter = [];
    let totalXP = 0;

    while (totalXP < budget && encounter.length < 12) {
        const available = monsters.filter(m => m.xp <= budget - totalXP);
        if (available.length === 0) break;
        const m = available[Math.floor(Math.random() * available.length)];
        encounter.push(m);
        totalXP += m.xp;
    }

    const grouped = {};
    encounter.forEach(m => {
        grouped[m.name] = (grouped[m.name] || 0) + 1;
    });

    let html = `<h4>${difficulty.toUpperCase()} Mücadele (Seviye ${level}, ${players} Oyuncu)</h4>`;
    html += `<p>XP Bütçesi: ${budget} | Kullanılan: ${totalXP}</p><ul>`;
    for (const [name, count] of Object.entries(grouped)) {
        html += `<li>${count}x ${name}</li>`;
    }
    html += '</ul>';

    document.getElementById('encounterResult').innerHTML = html;
    speak(`${difficulty} mücadele oluşturuldu. ${Object.keys(grouped).length} farklı düşman türü.`);
}

function generateLoot() {
    const type = document.getElementById('lootType').value;
    const lootTables = {
        weapon: ['Kılıç +1', 'Bıçak +1', 'Yay +1', 'Balta +1', 'Çekiç +1', 'Mızrak +1'],
        armor: ['Deri Zırh +1', 'Zincir Postu +1', 'Plaka Zırh +1', 'Kalkan +1', 'Bacaklık +1'],
        potion: ['İyileşme İksiri', 'Büyük İyileşme İksiri', 'Kuvvet İksiri', 'Hız İksiri', 'Görünmezlik İksiri', 'Solunum İksiri (Su)'],
        magic: ['Sihirli Yüzük (Koruma)', 'Mantol (Sihirli)', 'Asa (Ateş Topu)', 'Küpe (Doğa)', 'Gözlük (Algılama)'],
        any: ['Kılıç +1', 'Deri Zırh +1', 'İyileşme İksiri', 'Sihirli Yüzük', 'Altın (200)', 'Harcı Sahnesi', 'Ok (20)']
    };

    const table = lootTables[type] || lootTables.any;
    const count = Math.floor(Math.random() * 3) + 1;
    const items = [];
    for (let i = 0; i < count; i++) {
        items.push(table[Math.floor(Math.random() * table.length)]);
    }

    document.getElementById('lootResult').innerHTML = `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
    speak(`${count} eşya bulundu: ${items.join(', ')}`);
}

function generateWorld() {
    const type = document.getElementById('worldType').value;
    let result = '';

    if (type === 'region') {
        const biomes = ['Dağlık', 'Orman', 'Çöl', 'Sahil', 'Bataklık', 'Tundra', 'Ova', 'Vulkanik'];
        const features = ['Eski harabeler', 'Gizli mağara', 'Kutsal bosluk', 'Ticaret yolu', 'Savaş alanı', 'Sihirliorman'];
        result = `<strong>${biomes[Math.floor(Math.random() * biomes.length)]} Bölgesi</strong><br>Özellik: ${features[Math.floor(Math.random() * features.length)]}`;
    } else if (type === 'settlement') {
        const types = ['Köy (200-500)', 'Kasaba (500-5000)', 'Şehir (5000-25000)', 'Büyükşehir (25000+)'];
        const gov = ['Demokrasi', 'Monarşi', 'Oligarşi', 'Teokrasi', 'Komün', 'Askeri Cunta'];
        result = `<strong>${types[Math.floor(Math.random() * types.length)]}</strong><br>Yönetim: ${gov[Math.floor(Math.random() * gov.length)]}`;
    } else if (type === 'dungeon') {
        const themes = ['Eski Maden', 'Kutsal Mezarlık', 'Sihirli Kule', 'Doğal Mağara', 'Düşman Kale', 'Unutulmuş Tapınak'];
        const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        result = `<strong>${themes[Math.floor(Math.random() * themes.length)]}</strong><br>Önerilen Seviye: ${levels[Math.floor(Math.random() * levels.length)]}`;
    } else if (type === 'quest') {
        const hooks = ['Kayıp eşya', 'Kaçırılan kişi', 'Tehlikeli canavar', 'Siyasi komplo', 'Doğal afet', 'Antik keşif'];
        result = `<strong>Görev: ${hooks[Math.floor(Math.random() * hooks.length)]}</strong>`;
    }

    document.getElementById('worldResult').innerHTML = result;
    speak(result.replace('<strong>', '').replace('</strong>', '').replace('<br>', '. '));
}

// Calculator
let calcExpression = '';
function initCalculator() {
    const display = document.getElementById('calcDisplay');
    document.querySelectorAll('.calc-btn').forEach(btn => {
        btn.onclick = () => {
            const val = btn.dataset.value;
            const action = btn.dataset.action;

            if (action === 'clear') {
                calcExpression = '';
            } else if (action === 'backspace') {
                calcExpression = calcExpression.slice(0, -1);
            } else if (action === 'paren') {
                calcExpression += val;
            } else if (val === '=') {
                try {
                    calcExpression = eval(calcExpression.replace('π', 'Math.PI')).toString();
                } catch (e) {
                    calcExpression = 'Hata';
                }
            } else if (val === 'pi') {
                calcExpression += 'Math.PI';
            } else {
                calcExpression += val;
            }

            display.textContent = calcExpression || '0';
            if (val === '=') speak(`Sonuç: ${calcExpression}`);
        };
    });
}

// ============================================
// CHAT SYSTEM
// ============================================
function addMessage(role, text, isHTML = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;

    const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    const avatar = role === 'user' ? '👤' : role === 'assistant' ? '🎮' : '🔔';

    msgDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-sender">${role === 'user' ? 'Siz' : role === 'assistant' ? 'Oyun Atölyesi' : 'Sistem'}</span>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-text">${isHTML ? text : escapeHtml(text)}</div>
        </div>
    `;

    state.elements.chatMessages.appendChild(msgDiv);
    state.elements.chatMessages.scrollTop = state.elements.chatMessages.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function handleChatSubmit(e) {
    e.preventDefault();
    const input = state.elements.chatInput;
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    addMessage('user', text);
    processVoiceCommand(text.toLowerCase());
}

// ============================================
// UI HELPERS
// ============================================
function updateVoiceUI(listening) {
    const btn = state.elements.voiceToggleBtn;
    const indicator = state.elements.statusIndicator;
    const statusText = state.elements.statusText;

    if (listening) {
        btn.classList.add('listening');
        btn.setAttribute('aria-label', 'Sesli komutları kapat');
        state.elements.micIcon.style.display = 'none';
        state.elements.micIconMuted.style.display = 'block';
        state.elements.btnText.textContent = 'Dinleniyor...';
        indicator.classList.add('active');
        statusText.textContent = 'Dinleniyor...';
    } else {
        btn.classList.remove('listening');
        btn.setAttribute('aria-label', 'Sesli komutları aç');
        state.elements.micIcon.style.display = 'block';
        state.elements.micIconMuted.style.display = 'none';
        state.elements.btnText.textContent = 'Dinlemeye Başla';
        indicator.classList.remove('active');
        statusText.textContent = 'Hazır';
    }
}

function showVisualizer(show) {
    state.elements.voiceVisualizer.style.display = show ? 'flex' : 'none';
}

function updateVisualizerText(text) {
    state.elements.visualizerText.textContent = text || 'Dinleniyor...';
}

function updateWelcomeTime() {
    const el = document.getElementById('welcomeTime');
    if (el) el.textContent = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function disableVoiceUI() {
    state.elements.voiceToggleBtn.disabled = true;
    state.elements.voiceToggleBtn.title = 'Ses tanıma desteklenmiyor';
    state.elements.btnText.textContent = 'Desteklenmiyor';
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    state.elements.toastContainer.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ============================================
// EVENT LISTENERS
// ============================================
function initEventListeners() {
    // Voice toggle
    state.elements.voiceToggleBtn.addEventListener('click', toggleListening);

    // Voice chat toggle
    state.elements.voiceChatBtn.addEventListener('click', toggleVoiceChat);

    // Clear chat
    state.elements.clearChatBtn.addEventListener('click', () => {
        state.elements.chatMessages.innerHTML = '';
        addMessage('system', 'Sohbet temizlendi.', true);
    });

    // Chat form
    state.elements.chatForm.addEventListener('submit', handleChatSubmit);

    // Language change
    state.elements.languageSelect.addEventListener('change', (e) => {
        state.language = e.target.value;
        if (state.recognition) state.recognition.lang = state.language;
        showToast(`Dil değiştirildi: ${state.language === 'tr-TR' ? 'Türkçe' : 'English'}`, 'info');
    });

    // TTS toggle
    state.elements.ttsToggleBtn.addEventListener('click', toggleTTS);

    // Close detail panel
    state.elements.closeDetailBtn.addEventListener('click', closeDetailPanel);

    // Tool cards
    state.elements.toolGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.tool-card');
        if (card) openTool(card.dataset.tool);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Space to toggle voice (when not typing)
        if (e.code === 'Space' && e.target === document.body) {
            e.preventDefault();
            toggleListening();
        }
        // Escape to close detail panel
        if (e.key === 'Escape') closeDetailPanel();
    });

    // Load voices for TTS
    if (window.speechSynthesis) {
        speechSynthesis.onvoiceschanged = () => {};
        // Trigger voice load
        speechSynthesis.getVoices();
    }
}

// Make functions globally available for onclick handlers
window.openTool = openTool;
window.closeDetailPanel = closeDetailPanel;
window.toggleVoiceChat = toggleVoiceChat;