// SOS CISP - Aplicação Unificada com Armazenamento Local
// Este arquivo contém toda a funcionalidade da aplicação em um só lugar

class SOSCISPApp {
    constructor() {
        this.currentScreen = 'splash-screen';
        this.currentUser = null;
        this.userType = null; // 'police', 'citizen', 'admin'
        this.isAuthenticated = false;
        this.locationData = null;
        this.audioRecorder = null;
        this.isRecording = false;
        this.screenHistory = [];

        // Dados locais
        this.localStorage = {
            users: this.loadFromStorage('users') || {
                police: [
                    { id: 'POL007', code: 'CISP2007', name: 'Agente Silva', type: 'police' },
                    { id: 'POL008', code: 'CISP2008', name: 'Agente Santos', type: 'police' }
                ],
                citizens: [
                    { id: '123456789', password: '123456', name: 'João Silva', email: 'joao@email.com', phone: '123456789', address: 'Rua A, 123', type: 'citizen' },
                    { id: '987654321', password: '123456', name: 'Maria Santos', email: 'maria@email.com', phone: '987654321', address: 'Rua B, 456', type: 'citizen' }
                ]
            },
            messages: this.loadFromStorage('messages') || [],
            stats: this.loadFromStorage('stats') || {
                total_messages: 0,
                messages_by_type: {
                    sos: 0,
                    location: 0,
                    text: 0,
                    audio: 0
                }
            }
        };

        this.init();
    }

    // Funções de armazenamento local
    saveToStorage(key, data) {
        try {
            console.log(`Salvando ${key}:`, data);
            localStorage.setItem(key, JSON.stringify(data));
            console.log(`✓ ${key} salvo com sucesso`);
        } catch (error) {
            console.error(`Erro ao salvar ${key} no localStorage:`, error);
            // Se for erro de quota, tentar limpar dados antigos
            if (error.name === 'QuotaExceededError') {
                console.log('Tentando limpar localStorage...');
                try {
                    localStorage.clear();
                    localStorage.setItem(key, JSON.stringify(data));
                    console.log(`✓ ${key} salvo após limpeza`);
                } catch (clearError) {
                    console.error('Erro mesmo após limpeza:', clearError);
                }
            }
        }
    }

    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            const parsed = data ? JSON.parse(data) : null;
            console.log(`Carregando ${key}:`, parsed);
            return parsed;
        } catch (error) {
            console.error(`Erro ao carregar ${key} do localStorage:`, error);
            return null;
        }
    }

    // Função para adicionar mensagem
    addMessage(message) {
        console.log('=== ADICIONANDO MENSAGEM ===');
        console.log('Tipo da mensagem:', message.message_type);
        console.log('Tem audioData?', !!message.audioData);
        if (message.audioData) {
            console.log('Tamanho do audioData:', message.audioData.length);
        }

        const newMessage = {
            id: Date.now().toString(),
            sender_id: message.sender_id,
            sender_type: message.sender_type,
            sender_name: message.sender_name,
            message_type: message.message_type,
            content: message.content,
            audioData: message.audioData, // Adicionar dados de áudio
            latitude: message.latitude,
            longitude: message.longitude,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        console.log('Nova mensagem criada:', newMessage);

        this.localStorage.messages.push(newMessage);
        this.localStorage.stats.total_messages++;

        if (this.localStorage.stats.messages_by_type[message.message_type]) {
            this.localStorage.stats.messages_by_type[message.message_type]++;
        }

        console.log('Total de mensagens:', this.localStorage.messages.length);
        console.log('Salvando mensagens no localStorage...');

        this.saveToStorage('messages', this.localStorage.messages);
        this.saveToStorage('stats', this.localStorage.stats);

        return newMessage;
    }

    // Função para buscar usuário
    findUser(id, type) {
        const users = type === 'police' ? this.localStorage.users.police : this.localStorage.users.citizens;
        return users.find(user => user.id === id);
    }

    // Função para verificar credenciais
    verifyCredentials(id, password, type) {
        const user = this.findUser(id, type);
        if (!user) return false;

        if (type === 'police') {
            return user.code === password;
        } else {
            return user.password === password;
        }
    }

    init() {
        console.log('Inicializando SOS CISP...');

        // Verificar se todos os elementos necessários estão presentes
        this.checkRequiredElements();

        this.setupEventListeners();
        this.startSplashScreen();

        console.log('SOS CISP inicializado com sucesso');
    }

    checkRequiredElements() {
        const requiredScreens = [
            'splash-screen',
            'access-selection',
            'police-login',
            'police-panel',
            'citizen-login',
            'citizen-register',
            'citizen-main',
            'admin-panel'
        ];

        console.log('Verificando elementos necessários...');
        requiredScreens.forEach(screenId => {
            const element = document.getElementById(screenId);
            if (element) {
                console.log(`✓ Tela ${screenId} encontrada`);
            } else {
                console.error(`✗ Tela ${screenId} NÃO encontrada`);
            }
        });
    }

    setupEventListeners() {
        // Cards de acesso
        document.querySelectorAll('.access-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const accessType = e.currentTarget.dataset.access;
                this.handleAccessSelection(accessType);
            });
        });

        // Formulários
        this.setupFormListeners();

        // Filtros de mensagens
        this.setupFilterListeners();

        // Botões de menu
        this.setupMenuListeners();

        // Botões de ação
        this.setupActionListeners();

        // Fechar menus ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.menu-content') && !e.target.closest('.menu-btn')) {
                this.closeAllMenus();
            }
        });

        // Fechar menus com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllMenus();
            }
        });
    }

    setupFormListeners() {
        // Login Polícia
        const policeLoginForm = document.getElementById('police-login-form');
        if (policeLoginForm) {
            policeLoginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePoliceLogin();
            });
        }

        // Login Cidadão
        const citizenLoginForm = document.getElementById('citizen-login-form');
        if (citizenLoginForm) {
            citizenLoginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCitizenLogin();
            });
        }

        // Cadastro Cidadão
        const citizenRegisterForm = document.getElementById('citizen-register-form');
        if (citizenRegisterForm) {
            citizenRegisterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCitizenRegister();
            });
        }
    }

    setupFilterListeners() {
        document.querySelectorAll('.filter-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.filterMessages(filter);
            });
        });
    }

    setupMenuListeners() {
        // Menu policial
        const menuBtn = document.querySelector('.menu-btn');
        if (menuBtn) {
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu();
            });
        }

        // Menu cidadão
        const citizenMenuBtn = document.querySelector('#citizen-main .menu-btn');
        if (citizenMenuBtn) {
            citizenMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleCitizenMenu();
            });
        }
    }

    setupActionListeners() {
        // Botão SOS
        const sosButton = document.getElementById('sos-button');
        if (sosButton) {
            sosButton.addEventListener('click', () => this.sendSOS());
        }

        // Botão de localização
        const locationBtn = document.getElementById('send-location-btn');
        if (locationBtn) {
            locationBtn.addEventListener('click', () => this.sendLocation());
        }

        // Botão de gravação de áudio
        const audioBtn = document.getElementById('record-audio-btn');
        if (audioBtn) {
            audioBtn.addEventListener('click', () => this.toggleAudioRecording());
        }

        // Botão de mensagem personalizada
        const customMessageBtn = document.getElementById('send-custom-message-btn');
        if (customMessageBtn) {
            customMessageBtn.addEventListener('click', () => this.sendCustomMessage());
        }
    }

    startSplashScreen() {
        console.log('=== INICIANDO SPLASH SCREEN ===');

        // Verificar se a splash screen está visível
        const splashScreen = document.getElementById('splash-screen');
        if (!splashScreen) {
            console.error('Splash screen não encontrada no DOM');
            this.showScreen('access-selection');
            return;
        }

        console.log('Splash screen encontrada, exibindo...');

        // Garantir que a splash screen está visível
        splashScreen.style.display = 'flex';
        splashScreen.classList.remove('hidden');

        // Ocultar outras telas
        const allScreens = document.querySelectorAll('.screen');
        allScreens.forEach(screen => {
            screen.classList.add('hidden');
        });

        console.log('Splash screen exibida, iniciando timer de 3 segundos...');

        // Simular carregamento de dados por 3 segundos
        setTimeout(() => {
            console.log('Timer concluído, navegando para seleção de acesso');
            this.showScreen('access-selection');
        }, 3000);

        // Fallback: se após 5 segundos ainda estiver na splash, forçar navegação
        setTimeout(() => {
            if (this.currentScreen === 'splash-screen') {
                console.log('Fallback: forçando navegação para seleção de acesso');
                this.showScreen('access-selection');
            }
        }, 5000);
    }

    async handleAccessSelection(accessType) {
        this.userType = accessType;

        switch (accessType) {
            case 'police':
                this.showScreen('police-login');
                break;
            case 'citizen':
                this.showScreen('citizen-login');
                break;
            default:
                console.error('Tipo de acesso inválido:', accessType);
        }
    }

    async handlePoliceLogin() {
        const policeId = document.getElementById('police-id').value;
        const policeCode = document.getElementById('police-code').value;

        if (!policeId || !policeCode) {
            this.showError('Por favor, preencha todos os campos');
            return;
        }

        // Verificar credenciais localmente
        if (this.verifyCredentials(policeId, policeCode, 'police')) {
            const user = this.findUser(policeId, 'police');
            this.currentUser = {
                id: policeId,
                name: user.name,
                type: 'police'
            };
            this.isAuthenticated = true;
            this.showScreen('police-panel');
            this.loadPolicePanel();
        } else {
            this.showError('ID ou código inválido');
        }
    }

    async handleCitizenLogin() {
        const bi = document.getElementById('citizen-bi').value;
        const password = document.getElementById('citizen-password').value;

        if (!bi || !password) {
            this.showError('Por favor, preencha todos os campos');
            return;
        }

        // Verificar credenciais localmente
        if (this.verifyCredentials(bi, password, 'citizen')) {
            const user = this.findUser(bi, 'citizen');
            this.currentUser = {
                id: bi,
                name: user.name,
                type: 'citizen'
            };
            this.isAuthenticated = true;
            this.showScreen('citizen-main');
            this.loadCitizenMain();
        } else {
            this.showError('BI ou senha inválidos');
        }
    }

    async handleCitizenRegister() {
        const formData = new FormData(document.getElementById('citizen-register-form'));
        const data = Object.fromEntries(formData);

        // Validação básica
        if (data['register-password'] !== data['register-confirm-password']) {
            this.showError('As senhas não coincidem');
            return;
        }

        // Verificar se o BI já existe
        const existingUser = this.findUser(data['register-bi'], 'citizen');
        if (existingUser) {
            this.showError('BI já cadastrado');
            return;
        }

        // Adicionar novo usuário
        const newUser = {
            id: data['register-bi'],
            password: data['register-password'],
            name: data['register-name'],
            email: data['register-email'],
            phone: data['register-phone'],
            address: data['register-address'],
            type: 'citizen'
        };

        this.localStorage.users.citizens.push(newUser);
        this.saveToStorage('users', this.localStorage.users);

        this.clearCitizenRegisterForm();
        this.showSuccess('Cadastro realizado com sucesso! Você pode fazer login agora.');
        setTimeout(() => {
            this.showScreen('citizen-login');
        }, 2000);
    }

    clearCitizenRegisterForm() {
        const form = document.getElementById('citizen-register-form');
        if (form) {
            form.reset();
        }
    }

    async loadPolicePanel() {
        try {
            // Atualizar estatísticas
            const stats = this.localStorage.stats;
            document.getElementById('messages-count').textContent = stats.total_messages;
            document.getElementById('emergencies-count').textContent = stats.messages_by_type.sos || 0;
            document.getElementById('network-status').textContent = 'Online';

            // Atualizar nome do usuário
            document.getElementById('police-name').textContent = this.currentUser.name;

            // Carregar mensagens
            await this.loadMessages();

        } catch (error) {
            console.error('Erro ao carregar painel policial:', error);
            this.showError('Erro ao carregar dados');
        }
    }

    loadCitizenMain() {
        // Atualizar nome do usuário
        document.getElementById('citizen-name').textContent = this.currentUser.name;

        // Solicitar permissão de localização
        this.requestLocationPermission();
    }

    async loadMessages(filter = 'all') {
        const messagesList = document.getElementById('messages-list');
        if (!messagesList) return;

        try {
            console.log('=== CARREGANDO MENSAGENS ===');
            let messages = this.localStorage.messages;
            console.log('Total de mensagens carregadas:', messages.length);

            // Aplicar filtro
            if (filter !== 'all') {
                messages = messages.filter(msg => msg.message_type === filter);
                console.log(`Mensagens após filtro '${filter}':`, messages.length);
            }

            // Verificar mensagens de áudio
            const audioMessages = messages.filter(msg => msg.message_type === 'audio');
            console.log('Mensagens de áudio encontradas:', audioMessages.length);
            audioMessages.forEach((msg, index) => {
                console.log(`Áudio ${index + 1}:`, {
                    id: msg.id,
                    temAudioData: !!msg.audioData,
                    tamanhoAudioData: msg.audioData ? msg.audioData.length : 0
                });
            });

            // Ordenar por timestamp (mais recentes primeiro)
            messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            if (messages.length > 0) {
                messagesList.innerHTML = messages.map(message => {
                    // Preparar dados para o HTML
                    const audioButton = message.message_type === 'audio' ?
                        `<br><button onclick="window.sosCISPApp.playAudioMessage('${message.audioData || ''}')" style="background: var(--accent-color); color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; margin-top: 5px; font-size: 12px;">
                            <i class="fas fa-play"></i> Reproduzir Áudio
                        </button>` : '';

                    const locationLink = message.latitude && message.longitude ?
                        `<br><small>📍 <a href="https://www.google.com/maps?q=${message.latitude},${message.longitude}" target="_blank" style="color: var(--accent-color); text-decoration: none; font-weight: bold;">Abrir no Google Maps: ${message.latitude.toFixed(6)}, ${message.longitude.toFixed(6)}</a></small>` : '';

                    return `
                        <div class="message-item">
                            <div class="message-header">
                                <span class="message-sender">${message.sender_name}</span>
                                <span class="message-time">${this.formatTime(new Date(message.timestamp))}</span>
                            </div>
                            <div class="message-content">
                                <div class="message-type-icon">
                                    ${this.getMessageTypeIcon(message.message_type)}
                                </div>
                                <div class="message-text">
                                    ${message.content}
                                    ${audioButton}
                                    ${locationLink}
                                </div>
                            </div>
                            <div class="message-status ${message.status}">
                                ${this.getStatusText(message.status)}
                            </div>
                        </div>
                    `;
                }).join('');
                console.log('HTML das mensagens gerado com sucesso');
            } else {
                messagesList.innerHTML = '<p class="no-messages">Nenhuma mensagem encontrada</p>';
                console.log('Nenhuma mensagem para exibir');
            }
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
            messagesList.innerHTML = '<p class="error-message">Erro ao carregar mensagens</p>';
        }
    }

    getMessageTypeIcon(type) {
        const icons = {
            text: '<i class="fas fa-comment"></i>',
            audio: '<i class="fas fa-microphone"></i>',
            location: '<i class="fas fa-map-marker-alt"></i>',
            sos: '<i class="fas fa-exclamation-triangle"></i>'
        };
        return icons[type] || '<i class="fas fa-question"></i>';
    }

    playAudioMessage(audioData) {
        console.log('=== REPRODUZINDO ÁUDIO ===');
        console.log('Tamanho do audioData recebido:', audioData ? audioData.length : 'null');
        console.log('Primeiros 100 caracteres:', audioData ? audioData.substring(0, 100) : 'null');

        if (!audioData) {
            console.error('audioData é null ou undefined');
            this.showError('Dados de áudio não disponíveis (null)');
            return;
        }

        if (audioData.length < 50) {
            console.error('audioData muito pequeno:', audioData.length, 'caracteres');
            this.showError('Dados de áudio muito pequenos ou inválidos');
            return;
        }

        try {
            const audio = new Audio(audioData);
            console.log('Elemento de áudio criado com sucesso');

            // Adicionar eventos para melhor feedback
            audio.addEventListener('loadstart', () => {
                console.log('Carregando áudio...');
                this.showNotification('Carregando áudio...', 'info');
            });

            audio.addEventListener('canplay', () => {
                console.log('Áudio pronto para reprodução');
            });

            audio.addEventListener('ended', () => {
                console.log('Áudio finalizado');
                this.showNotification('Áudio finalizado', 'success');
            });

            audio.addEventListener('error', (e) => {
                console.error('Erro no elemento de áudio:', e);
                console.error('Código de erro:', audio.error ? audio.error.code : 'desconhecido');
                this.showError('Erro ao reproduzir áudio: ' + (audio.error ? audio.error.message : 'erro desconhecido'));
            });

            audio.play().then(() => {
                console.log('Áudio iniciado com sucesso');
                this.showNotification('Reproduzindo áudio...', 'success');
            }).catch(error => {
                console.error('Erro ao reproduzir áudio:', error);
                this.showError(`Erro ao reproduzir áudio: ${error.message}`);
            });
        } catch (error) {
            console.error('Erro ao criar elemento de áudio:', error);
            this.showError(`Erro ao reproduzir áudio: ${error.message}`);
        }
    }

    getStatusText(status) {
        const statusTexts = {
            pending: 'Pendente',
            processing: 'Processando',
            completed: 'Concluído'
        };
        return statusTexts[status] || 'Desconhecido';
    }

    formatTime(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) return 'Agora';
        if (minutes < 60) return `${minutes} min atrás`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h atrás`;

        return timestamp.toLocaleDateString('pt-BR');
    }

    async filterMessages(filter) {
        // Atualizar botões ativos
        document.querySelectorAll('.filter-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        // Carregar mensagens filtradas
        await this.loadMessages(filter);
    }

    async requestLocationPermission() {
        if ('geolocation' in navigator) {
            try {
                const position = await this.getCurrentPosition();
                this.locationData = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                this.updateLocationDisplay();
            } catch (error) {
                console.error('Erro ao obter localização:', error);
                this.showError('Não foi possível obter sua localização');
            }
        } else {
            this.showError('Geolocalização não suportada');
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            });
        });
    }

    updateLocationDisplay() {
        const locationText = document.getElementById('location-text');
        if (locationText && this.locationData) {
            locationText.textContent = `${this.locationData.lat.toFixed(6)}, ${this.locationData.lng.toFixed(6)}`;
        }
    }

    async sendSOS() {
        if (!this.locationData) {
            this.showError('Localização não disponível');
            return;
        }

        try {
            const message = {
                sender_id: this.currentUser.id,
                sender_type: this.currentUser.type,
                sender_name: this.currentUser.name,
                message_type: 'sos',
                content: 'SOS - Emergência',
                latitude: this.locationData.lat,
                longitude: this.locationData.lng
            };

            this.addMessage(message);
            this.showSuccess('SOS enviado com sucesso!');

            // Atualizar painel policial se estiver ativo
            if (this.currentScreen === 'police-panel') {
                this.loadPolicePanel();
            }

        } catch (error) {
            console.error('Erro ao enviar SOS:', error);
            this.showError('Erro ao enviar SOS');
        }
    }

    async sendLocation() {
        try {
            const position = await this.getCurrentPosition();
            this.locationData = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            this.updateLocationDisplay();

            const message = {
                sender_id: this.currentUser.id,
                sender_type: this.currentUser.type,
                sender_name: this.currentUser.name,
                message_type: 'location',
                content: 'Localização enviada',
                latitude: this.locationData.lat,
                longitude: this.locationData.lng
            };

            this.addMessage(message);
            this.showSuccess('Localização enviada com sucesso!');

            // Atualizar painel policial se estiver ativo
            if (this.currentScreen === 'police-panel') {
                this.loadPolicePanel();
            }

        } catch (error) {
            console.error('Erro ao enviar localização:', error);
            this.showError('Erro ao enviar localização');
        }
    }

    async sendQuickMessage(message) {
        if (!this.locationData) {
            this.showError('Localização não disponível');
            return;
        }

        try {
            const messageData = {
                sender_id: this.currentUser.id,
                sender_type: this.currentUser.type,
                sender_name: this.currentUser.name,
                message_type: 'text',
                content: message,
                latitude: this.locationData.lat,
                longitude: this.locationData.lng
            };

            this.addMessage(messageData);
            this.showSuccess(`Mensagem "${message}" enviada com sucesso!`);

            // Atualizar painel policial se estiver ativo
            if (this.currentScreen === 'police-panel') {
                this.loadPolicePanel();
            }

        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            this.showError('Erro de conexão. Tente novamente.');
        }
    }

    async toggleAudioRecording() {
        if (!this.isRecording) {
            await this.startAudioRecording();
        } else {
            await this.stopAudioRecording();
        }
    }

    async startAudioRecording() {
        try {
            console.log('=== INICIANDO GRAVAÇÃO DE ÁUDIO ===');

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Stream de áudio obtido:', stream);

            this.audioRecorder = new MediaRecorder(stream);
            const chunks = [];

            this.audioRecorder.ondataavailable = (e) => {
                console.log('Chunk de áudio recebido:', e.data.size, 'bytes');
                chunks.push(e.data);
            };

            this.audioRecorder.onstop = () => {
                console.log('Gravação finalizada, processando chunks...');
                console.log('Total de chunks:', chunks.length);

                const blob = new Blob(chunks, { type: 'audio/wav' });
                console.log('Blob criado:', blob.size, 'bytes, tipo:', blob.type);

                if (blob.size > 0) {
                    this.sendAudioMessage(blob);
                } else {
                    console.error('Blob de áudio está vazio');
                    this.showError('Erro: gravação de áudio falhou');
                }
            };

            this.audioRecorder.onerror = (event) => {
                console.error('Erro na gravação:', event);
                this.showError('Erro durante a gravação de áudio');
            };

            this.audioRecorder.start(1000); // Capturar chunks a cada 1 segundo
            this.isRecording = true;

            document.getElementById('audio-btn-text').textContent = 'Parar Gravação';
            document.getElementById('record-audio-btn').classList.add('recording');

            console.log('Gravação iniciada com sucesso');

        } catch (error) {
            console.error('Erro ao iniciar gravação de áudio:', error);
            this.showError('Erro ao iniciar gravação de áudio: ' + error.message);
        }
    }

    async stopAudioRecording() {
        if (this.audioRecorder && this.isRecording) {
            this.audioRecorder.stop();
            this.audioRecorder.stream.getTracks().forEach(track => track.stop());

            this.isRecording = false;
            document.getElementById('audio-btn-text').textContent = 'Iniciar Gravação';
            document.getElementById('record-audio-btn').classList.remove('recording');
        }
    }

    async sendAudioMessage(audioBlob) {
        try {
            console.log('=== INICIANDO ENVIO DE ÁUDIO ===');
            console.log('Tamanho do blob:', audioBlob.size);
            console.log('Tipo do blob:', audioBlob.type);

            if (!audioBlob || audioBlob.size === 0) {
                console.error('Blob de áudio inválido ou vazio');
                this.showError('Erro: áudio não foi gravado corretamente');
                return;
            }

            // Convert audio blob to base64 for storage
            const reader = new FileReader();
            reader.onload = () => {
                const audioData = reader.result;
                console.log('Áudio convertido para base64, tamanho:', audioData.length);

                if (!audioData || audioData.length < 100) {
                    console.error('Dados de áudio convertidos são inválidos');
                    this.showError('Erro: falha na conversão do áudio');
                    return;
                }

                const message = {
                    sender_id: this.currentUser.id,
                    sender_type: this.currentUser.type,
                    sender_name: this.currentUser.name,
                    message_type: 'audio',
                    content: 'Gravação de áudio',
                    audioData: audioData, // Store the actual audio data
                    latitude: this.locationData?.lat || null,
                    longitude: this.locationData?.lng || null
                };

                console.log('Mensagem criada:', message);
                console.log('Tamanho do audioData na mensagem:', message.audioData.length);

                this.addMessage(message);
                this.showSuccess('Áudio enviado com sucesso!');

                // Atualizar painel policial se estiver ativo
                if (this.currentScreen === 'police-panel') {
                    this.loadPolicePanel();
                }
            };

            reader.onerror = (error) => {
                console.error('Erro na conversão do áudio:', error);
                this.showError('Erro ao processar áudio');
            };

            reader.readAsDataURL(audioBlob);

        } catch (error) {
            console.error('Erro ao enviar áudio:', error);
            this.showError('Erro ao enviar áudio');
        }
    }

    async sendCustomMessage() {
        const messageInput = document.getElementById('custom-message-input');
        const message = messageInput.value.trim();

        if (!message) {
            this.showError('Por favor, digite uma mensagem');
            return;
        }

        if (!this.locationData) {
            this.showError('Localização não disponível');
            return;
        }

        try {
            const messageData = {
                sender_id: this.currentUser.id,
                sender_type: this.currentUser.type,
                sender_name: this.currentUser.name,
                message_type: 'text',
                content: message,
                latitude: this.locationData.lat,
                longitude: this.locationData.lng
            };

            this.addMessage(messageData);
            this.showSuccess('Mensagem enviada com sucesso!');
            messageInput.value = '';

            // Atualizar painel policial se estiver ativo
            if (this.currentScreen === 'police-panel') {
                this.loadPolicePanel();
            }

        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            this.showError('Erro de conexão. Tente novamente.');
        }
    }

    toggleMenu() {
        const menuOverlay = document.getElementById('menu-overlay');
        if (menuOverlay) {
            menuOverlay.classList.toggle('hidden');
        }
    }

    toggleCitizenMenu() {
        const menuOverlay = document.getElementById('citizen-menu-overlay');
        if (menuOverlay) {
            menuOverlay.classList.toggle('hidden');
        }
    }

    closeAllMenus() {
        document.querySelectorAll('.menu-overlay').forEach(menu => {
            menu.classList.add('hidden');
        });
    }

    showSettings() {
        this.toggleMenu();
        this.showError('Funcionalidade em desenvolvimento');
    }

    showCitizenSettings() {
        this.toggleCitizenMenu();
        this.showError('Funcionalidade em desenvolvimento');
    }

    logout() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.userType = null;
        this.toggleMenu();
        this.showScreen('access-selection');
    }

    citizenLogout() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.userType = null;
        this.toggleCitizenMenu();
        this.showScreen('access-selection');
    }

    showScreen(screenId) {
        console.log(`=== NAVEGANDO PARA: ${screenId} ===`);

        // Ocultar splash screen primeiro
        const splashScreen = document.getElementById('splash-screen');
        if (splashScreen) {
            splashScreen.style.display = 'none';
            splashScreen.classList.add('hidden');
            console.log('Splash screen ocultada');
        }

        // Ocultar todas as telas
        const allScreens = document.querySelectorAll('.screen');
        console.log(`Encontradas ${allScreens.length} telas para ocultar`);

        allScreens.forEach(screen => {
            screen.classList.add('hidden');
            screen.style.display = 'none';
        });

        // Mostrar tela selecionada
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            targetScreen.style.display = 'block';
            this.currentScreen = screenId;
            console.log(`Tela ${screenId} exibida com sucesso`);

            // Adicionar à história se não for a mesma tela
            if (this.screenHistory[this.screenHistory.length - 1] !== screenId) {
                this.screenHistory.push(screenId);
            }

            // Limitar histórico a 10 telas
            if (this.screenHistory.length > 10) {
                this.screenHistory.shift();
            }

            // Executar ações específicas da tela
            this.handleScreenLoad(screenId);
        } else {
            console.error(`Tela ${screenId} não encontrada no DOM`);
            // Fallback: tentar mostrar a tela de seleção de acesso
            const fallbackScreen = document.getElementById('access-selection');
            if (fallbackScreen) {
                fallbackScreen.classList.remove('hidden');
                fallbackScreen.style.display = 'block';
                this.currentScreen = 'access-selection';
                console.log('Fallback: navegando para seleção de acesso');
            }
        }
    }

    goBack() {
        if (this.screenHistory.length > 1) {
            this.screenHistory.pop(); // Remove tela atual
            const previousScreen = this.screenHistory[this.screenHistory.length - 1];
            this.showScreen(previousScreen);
        } else {
            this.showScreen('access-selection');
        }
    }

    handleScreenLoad(screenId) {
        switch (screenId) {
            case 'access-selection':
                console.log('Tela de seleção de acesso carregada');
                break;
            case 'police-panel':
                this.loadPolicePanel();
                break;
            case 'citizen-main':
                this.loadCitizenMain();
                break;
            case 'admin-panel':
                this.loadAdminData();
                break;
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Criar notificação
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Adicionar ao container de notificações
        const container = document.getElementById('notification-container');
        if (container) {
            container.appendChild(notification);
        } else {
            document.body.appendChild(notification);
        }

        // Mostrar notificação
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Remover após 5 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    refreshData() {
        if (this.currentScreen === 'police-panel') {
            this.loadPolicePanel();
            this.showSuccess('Dados atualizados com sucesso');
        } else if (this.currentScreen === 'admin-panel') {
            this.loadAdminData();
            this.showSuccess('Dados administrativos atualizados');
        }
    }

    showSettings() {
        this.showNotification('Configurações em desenvolvimento', 'info');
    }

    showCitizenSettings() {
        this.showNotification('Configurações do cidadão em desenvolvimento', 'info');
    }

    showNotification(message, type) {
        // Criar notificação
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Adicionar ao container de notificações
        const container = document.getElementById('notification-container');
        if (container) {
            container.appendChild(notification);
        } else {
            document.body.appendChild(notification);
        }

        // Mostrar notificação
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Remover após 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (container) {
                    container.removeChild(notification);
                } else {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    async loadAdminData() {
        try {
            const stats = this.localStorage.stats;
            const users = this.localStorage.users;

            document.getElementById('total-users').textContent = users.police.length + users.citizens.length;
            document.getElementById('total-police').textContent = users.police.length;
            document.getElementById('total-citizens').textContent = users.citizens.length;
        } catch (error) {
            console.error('Erro ao carregar dados admin:', error);
        }
    }
}

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, iniciando SOS CISP...');

    // Aguardar um pouco mais para garantir que todos os recursos estejam carregados
    setTimeout(() => {
        try {
            window.sosCISPApp = new SOSCISPApp();
            console.log('SOS CISP inicializado com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar SOS CISP:', error);
            // Fallback: tentar inicializar novamente
            setTimeout(() => {
                window.sosCISPApp = new SOSCISPApp();
            }, 500);
        }
    }, 200);
});

// Funções globais para compatibilidade com onclick
window.showScreen = (screenId) => {
    console.log(`Função global showScreen chamada para: ${screenId}`);
    if (window.sosCISPApp) {
        window.sosCISPApp.showScreen(screenId);
    } else {
        console.error('Aplicação SOS CISP não inicializada');
        // Fallback direto
        const splashScreen = document.getElementById('splash-screen');
        if (splashScreen) {
            splashScreen.style.display = 'none';
        }

        const allScreens = document.querySelectorAll('.screen');
        allScreens.forEach(screen => {
            screen.classList.add('hidden');
        });

        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
        }
    }
};

window.sendSOS = () => {
    if (window.sosCISPApp) {
        window.sosCISPApp.sendSOS();
    }
};

window.sendLocation = () => {
    if (window.sosCISPApp) {
        window.sosCISPApp.sendLocation();
    }
};

window.sendQuickMessage = (message) => {
    if (window.sosCISPApp) {
        window.sosCISPApp.sendQuickMessage(message);
    }
};

window.toggleAudioRecording = () => {
    if (window.sosCISPApp) {
        window.sosCISPApp.toggleAudioRecording();
    }
};

window.sendCustomMessage = () => {
    if (window.sosCISPApp) {
        window.sosCISPApp.sendCustomMessage();
    }
};

window.toggleMenu = () => {
    if (window.sosCISPApp) {
        window.sosCISPApp.toggleMenu();
    }
};

window.toggleCitizenMenu = () => {
    if (window.sosCISPApp) {
        window.sosCISPApp.toggleCitizenMenu();
    }
};

window.showCitizenSettings = () => {
    if (window.sosCISPApp) {
        window.sosCISPApp.showCitizenSettings();
    }
};

window.citizenLogout = () => {
    if (window.sosCISPApp) {
        window.sosCISPApp.citizenLogout();
    }
};

window.showSettings = () => {
    if (window.sosCISPApp) {
        window.sosCISPApp.showSettings();
    }
};

window.logout = () => {
    if (window.sosCISPApp) {
        window.sosCISPApp.logout();
    }
};

window.goBack = () => {
    if (window.sosCISPApp) {
        window.sosCISPApp.goBack();
    }
};

// Função para debug - pular splash screen
window.skipSplash = () => {
    console.log('Função skipSplash chamada');
    if (window.sosCISPApp) {
        console.log('Navegando via aplicação');
        window.sosCISPApp.showScreen('access-selection');
    } else {
        console.log('Aplicação não inicializada, usando fallback');
        // Fallback direto
        const splashScreen = document.getElementById('splash-screen');
        if (splashScreen) {
            splashScreen.style.display = 'none';
            console.log('Splash screen ocultada via fallback');
        }

        const allScreens = document.querySelectorAll('.screen');
        allScreens.forEach(screen => {
            screen.classList.add('hidden');
        });

        const accessScreen = document.getElementById('access-selection');
        if (accessScreen) {
            accessScreen.classList.remove('hidden');
            console.log('Tela de acesso exibida via fallback');
        }
    }
};

// Função para atualizar dados do dashboard
window.refreshData = () => {
    if (window.sosCISPApp) {
        window.sosCISPApp.refreshData();
    }
};

// Função para mostrar configurações
window.showSettings = () => {
    if (window.sosCISPApp) {
        window.sosCISPApp.showSettings();
    }
};

// Função para mostrar configurações do cidadão
window.showCitizenSettings = () => {
    if (window.sosCISPApp) {
        window.sosCISPApp.showCitizenSettings();
    }
};