// SOS CISP - Aplicação Principal
class SOSCISPApp {
    constructor() {
        this.currentScreen = 'splash-screen';
        this.currentUser = null;
        this.userType = null; // 'police', 'citizen', 'admin'
        this.isAuthenticated = false;
        this.locationData = null;
        this.audioRecorder = null;
        this.isRecording = false;
        
        this.init();
    }
    
    init() {
        console.log('Inicializando SOS CISP...');
        
        // Verificar se todos os elementos necessários estão presentes
        this.checkRequiredElements();
        
        this.setupEventListeners();
        this.startSplashScreen();
        this.loadInitialData();
        
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
        const filterButtons = document.querySelectorAll('.filter-button');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Filtra as mensagens
                const filter = btn.getAttribute('data-filter');
                this.filterMessages(filter);
            });
        });
    }
    
    setupMenuListeners() {
        // Menu policial
        const menuBtn = document.querySelector('.menu-btn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => this.toggleMenu());
        }
        
        // Menu cidadão
        const citizenMenuBtn = document.querySelector('#citizen-main .menu-btn');
        if (citizenMenuBtn) {
            citizenMenuBtn.addEventListener('click', () => this.toggleCitizenMenu());
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
        // Verificar se a splash screen está visível
        const splashScreen = document.getElementById('splash-screen');
        if (!splashScreen) {
            console.log('Splash screen não encontrada, navegando direto para seleção de acesso');
            this.showScreen('access-selection');
            return;
        }
        
        console.log('Iniciando splash screen...');
        
        // Simular carregamento de dados por 5 segundos (reduzido de 10 para 5)
        setTimeout(() => {
            console.log('Tempo de carregamento concluído, navegando para seleção de acesso');
            this.showScreen('access-selection');
        }, 5000); // 5 segundos
        
        // Fallback: se após 7 segundos ainda estiver na splash, forçar navegação
        setTimeout(() => {
            if (this.currentScreen === 'splash-screen') {
                console.log('Fallback: forçando navegação para seleção de acesso');
                this.showScreen('access-selection');
            }
        }, 7000); // 7 segundos máximo
    }
    
    loadInitialData() {
        // Carregar dados iniciais do sistema
        this.loadMockData();
    }
    
    loadMockData() {
        // Dados simulados para demonstração
        this.mockMessages = [
            {
                id: 1,
                type: 'text',
                content: 'Roubo em andamento na Rua das Flores',
                sender: 'João Silva',
                timestamp: new Date(Date.now() - 300000),
                location: { lat: -8.8383, lng: 13.2344 },
                status: 'pending'
            },
            {
                id: 2,
                type: 'audio',
                content: 'audio_emergency_001.mp3',
                sender: 'Maria Santos',
                timestamp: new Date(Date.now() - 600000),
                location: { lat: -8.8383, lng: 13.2344 },
                status: 'processing'
            },
            {
                id: 3,
                type: 'location',
                content: 'Localização enviada',
                sender: 'Pedro Costa',
                timestamp: new Date(Date.now() - 900000),
                location: { lat: -8.8383, lng: 13.2344 },
                status: 'completed'
            }
        ];
        
        this.mockStats = {
            messages: 15,
            emergencies: 8,
            networkStatus: 'Online'
        };
    }
    
    handleAccessSelection(accessType) {
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
        
        // Simular validação
        if (policeId === 'POL007' && policeCode === 'CISP2007') {
            this.currentUser = {
                id: policeId,
                name: 'Agente POL007',
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
        
        // Simular validação
        if (bi === '123456789' && password === 'senha123') {
            this.currentUser = {
                id: bi,
                name: 'João Silva',
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
        
        // Simular cadastro bem-sucedido
        this.showSuccess('Cadastro realizado com sucesso!');
        setTimeout(() => {
            this.showScreen('citizen-login');
        }, 2000);
    }
    
    loadPolicePanel() {
        // Carregar estatísticas
        document.getElementById('messages-count').textContent = this.mockStats.messages;
        document.getElementById('emergencies-count').textContent = this.mockStats.emergencies;
        document.getElementById('network-status').textContent = this.mockStats.networkStatus;
        
        // Carregar mensagens
        this.loadMessages();
    }
    
    loadCitizenMain() {
        // Atualizar nome do usuário
        document.getElementById('citizen-name').textContent = this.currentUser.name;
        
        // Solicitar permissão de localização
        this.requestLocationPermission();
    }
    
    loadMessages(filter = 'all') {
        const messagesList = document.getElementById('messages-list');
        if (!messagesList) return;

        // Atualiza botão ativo do filtro
        document.querySelectorAll('.filter-button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-filter') === filter) {
                btn.classList.add('active');
            }
        });

        let filteredMessages = this.mockMessages;

        if (filter !== 'all') {
            filteredMessages = this.mockMessages.filter(msg => msg.type === filter);
        }

        messagesList.innerHTML = filteredMessages.map(message => `
            <div class="message-item">
                <div class="message-header">
                    <span class="message-sender">${message.sender}</span>
                    <span class="message-time">${this.formatTime(message.timestamp)}</span>
                </div>
                <div class="message-content">
                    <div class="message-type-icon">
                        ${this.getMessageTypeIcon(message.type)}
                    </div>
                    <div class="message-text">
                        ${message.content}
                    </div>
                </div>
                <div class="message-status ${message.status}">
                    ${this.getStatusText(message.status)}
                </div>
            </div>
        `).join('');
    }
    
    getMessageTypeIcon(type) {
        const icons = {
            text: '<i class="fas fa-comment"></i>',
            audio: '<i class="fas fa-microphone"></i>',
            location: '<i class="fas fa-map-marker-alt"></i>'
        };
        return icons[type] || '<i class="fas fa-question"></i>';
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
    
    filterMessages(filter) {
        this.loadMessages(filter);
    }
    
    renderMessages(messages) {
        // Exemplo de renderização (adapte para seu HTML)
        const list = document.getElementById('messages-list');
        if (!list) return;
        list.innerHTML = '';
        messages.forEach(msg => {
            const item = document.createElement('div');
            item.className = 'message-item';
            item.innerHTML = `
                <span class="message-type">${msg.type}</span>
                <span class="message-content">${msg.content}</span>
            `;
            list.appendChild(item);
        });
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
        
        this.showSuccess('SOS enviado com sucesso!');
        
        // Simular envio
        const sosData = {
            type: 'sos',
            content: 'SOS - Emergência',
            location: this.locationData,
            timestamp: new Date(),
            sender: this.currentUser.name
        };
        
        console.log('SOS enviado:', sosData);
    }
    
    async sendLocation() {
        try {
            const position = await this.getCurrentPosition();
            this.locationData = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            this.updateLocationDisplay();
            this.showSuccess('Localização enviada com sucesso!');
            
            console.log('Localização enviada:', this.locationData);
        } catch (error) {
            this.showError('Erro ao enviar localização');
        }
    }
    
    sendQuickMessage(message) {
        if (!this.locationData) {
            this.showError('Localização não disponível');
            return;
        }
        
        this.showSuccess(`Mensagem "${message}" enviada com sucesso!`);
        
        const quickData = {
            type: 'text',
            content: message,
            location: this.locationData,
            timestamp: new Date(),
            sender: this.currentUser.name
        };
        
        console.log('Mensagem rápida enviada:', quickData);
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
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.audioRecorder = new MediaRecorder(stream);
            const chunks = [];
            
            this.audioRecorder.ondataavailable = (e) => chunks.push(e.data);
            this.audioRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/wav' });
                this.sendAudioMessage(blob);
            };
            
            this.audioRecorder.start();
            this.isRecording = true;
            
            document.getElementById('audio-btn-text').textContent = 'Parar Gravação';
            document.getElementById('record-audio-btn').classList.add('recording');
            
        } catch (error) {
            this.showError('Erro ao iniciar gravação de áudio');
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
    
    sendAudioMessage(audioBlob) {
        this.showSuccess('Áudio enviado com sucesso!');
        
        const audioData = {
            type: 'audio',
            content: audioBlob,
            location: this.locationData,
            timestamp: new Date(),
            sender: this.currentUser.name
        };
        
        console.log('Áudio enviado:', audioData);
    }
    
    sendCustomMessage() {
        const input = document.getElementById('custom-message-input');
        const feedback = document.getElementById('custom-message-feedback');
        const mensagem = input.value.trim();

        // Limpa feedback anterior
        feedback.textContent = '';
        feedback.className = '';

        if (!mensagem) {
            feedback.textContent = 'Por favor, digite uma mensagem.';
            feedback.className = 'error';
            return;
        }

        // Envio da mensagem (simulação)
        feedback.textContent = 'Mensagem enviada com sucesso!';
        feedback.className = 'success';
        input.value = '';
    }
    
    toggleMenu() {
        const menuOverlay = document.getElementById('menu-overlay');
        menuOverlay.classList.toggle('hidden');
    }
    
    toggleCitizenMenu() {
        const menuOverlay = document.getElementById('citizen-menu-overlay');
        menuOverlay.classList.toggle('hidden');
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
        console.log(`Tentando navegar para: ${screenId}`);
        
        // Ocultar splash screen primeiro
        const splashScreen = document.getElementById('splash-screen');
        if (splashScreen) {
            splashScreen.style.display = 'none';
            console.log('Splash screen ocultada');
        }
        
        // Ocultar todas as telas
        const allScreens = document.querySelectorAll('.screen');
        console.log(`Encontradas ${allScreens.length} telas para ocultar`);
        
        allScreens.forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Mostrar tela selecionada
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            this.currentScreen = screenId;
            console.log(`Tela ${screenId} exibida com sucesso`);
            
            // Executar ações específicas da tela
            this.handleScreenLoad(screenId);
        } else {
            console.error(`Tela ${screenId} não encontrada no DOM`);
            // Fallback: tentar mostrar a tela de seleção de acesso
            const fallbackScreen = document.getElementById('access-selection');
            if (fallbackScreen) {
                fallbackScreen.classList.remove('hidden');
                this.currentScreen = 'access-selection';
                console.log('Fallback: navegando para seleção de acesso');
            }
        }
    }
    
    handleScreenLoad(screenId) {
        switch (screenId) {
            case 'access-selection':
                // Tela de seleção de acesso carregada
                console.log('Tela de seleção de acesso carregada');
                break;
            case 'police-panel':
                this.loadPolicePanel();
                break;
            case 'citizen-main':
                this.loadCitizenMain();
                break;
            case 'admin-panel':
                // Carregar dados do admin
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
        
        // Adicionar ao body
        document.body.appendChild(notification);
        
        // Mostrar notificação
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    loadAdminData() {
        // Carregar dados do painel administrativo
        document.getElementById('total-users').textContent = '125';
        document.getElementById('total-police').textContent = '45';
        document.getElementById('total-citizens').textContent = '80';
        
        // Carregar lista de usuários
        this.loadUsersList();
    }
    
    loadUsersList() {
        const usersList = document.getElementById('users-list');
        if (usersList) {
            usersList.innerHTML = `
                <div class="user-item">
                    <i class="fas fa-user-shield"></i>
                    <span>Agente POL007</span>
                    <span class="user-status active">Ativo</span>
                </div>
                <div class="user-item">
                    <i class="fas fa-user"></i>
                    <span>João Silva</span>
                    <span class="user-status active">Ativo</span>
                </div>
                <div class="user-item">
                    <i class="fas fa-user"></i>
                    <span>Maria Santos</span>
                    <span class="user-status inactive">Inativo</span>
                </div>
            `;
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
    const input = document.getElementById('custom-message-input');
    const feedback = document.getElementById('custom-message-feedback');
    const mensagem = input.value.trim();

    // Limpa feedback anterior
    feedback.textContent = '';
    feedback.className = '';

    if (!mensagem) {
        feedback.textContent = 'Por favor, digite uma mensagem.';
        feedback.className = 'error';
        return;
    }

    // Envio da mensagem (simulação)
    feedback.textContent = 'Mensagem enviada com sucesso!';
    feedback.className = 'success';
    input.value = '';
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