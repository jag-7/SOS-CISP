// Gerenciamento de Áudio
class AudioManager {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.audioBlob = null;
        this.audioUrl = null;
        this.stream = null;
        this.recordingStartTime = null;
        this.maxRecordingDuration = 300000; // 5 minutos em ms
        
        this.setupAudioServices();
    }
    
    setupAudioServices() {
        // Verificar suporte à API de mídia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.warn('API de mídia não suportada');
            return;
        }
        
        // Configurar opções de áudio
        this.audioOptions = {
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 44100,
                channelCount: 1
            }
        };
        
        // Configurar opções de gravação
        this.recordingOptions = {
            mimeType: 'audio/webm;codecs=opus',
            audioBitsPerSecond: 128000
        };
        
        // Fallback para navegadores que não suportam WebM
        if (!MediaRecorder.isTypeSupported(this.recordingOptions.mimeType)) {
            this.recordingOptions.mimeType = 'audio/mp4';
        }
        
        if (!MediaRecorder.isTypeSupported(this.recordingOptions.mimeType)) {
            this.recordingOptions.mimeType = 'audio/wav';
        }
    }
    
    async requestMicrophonePermission() {
        try {
            const permission = await navigator.permissions.query({ name: 'microphone' });
            
            if (permission.state === 'granted') {
                return true;
            } else if (permission.state === 'prompt') {
                // Solicitar permissão
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(track => track.stop());
                return true;
            } else {
                this.showAudioError('Permissão de microfone negada');
                return false;
            }
        } catch (error) {
            console.error('Erro ao verificar permissão de microfone:', error);
            this.showAudioError('Erro ao verificar permissão de microfone');
            return false;
        }
    }
    
    async startRecording() {
        if (this.isRecording) {
            console.warn('Gravação já está em andamento');
            return false;
        }
        
        try {
            // Verificar permissão
            const hasPermission = await this.requestMicrophonePermission();
            if (!hasPermission) {
                return false;
            }
            
            // Obter stream de áudio
            this.stream = await navigator.mediaDevices.getUserMedia(this.audioOptions);
            
            // Criar MediaRecorder
            this.mediaRecorder = new MediaRecorder(this.stream, this.recordingOptions);
            this.audioChunks = [];
            
            // Configurar eventos
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                this.handleRecordingStop();
            };
            
            this.mediaRecorder.onerror = (event) => {
                this.handleRecordingError(event.error);
            };
            
            // Iniciar gravação
            this.mediaRecorder.start(1000); // Coletar dados a cada segundo
            this.isRecording = true;
            this.recordingStartTime = Date.now();
            
            // Atualizar interface
            this.updateRecordingUI();
            
            // Configurar timer para parar gravação automaticamente
            this.recordingTimer = setTimeout(() => {
                if (this.isRecording) {
                    this.stopRecording();
                }
            }, this.maxRecordingDuration);
            
            console.log('Gravação de áudio iniciada');
            return true;
            
        } catch (error) {
            console.error('Erro ao iniciar gravação:', error);
            this.showAudioError('Erro ao iniciar gravação de áudio');
            return false;
        }
    }
    
    stopRecording() {
        if (!this.isRecording || !this.mediaRecorder) {
            return false;
        }
        
        try {
            // Parar gravação
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Parar stream
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
                this.stream = null;
            }
            
            // Limpar timer
            if (this.recordingTimer) {
                clearTimeout(this.recordingTimer);
                this.recordingTimer = null;
            }
            
            // Atualizar interface
            this.updateRecordingUI();
            
            console.log('Gravação de áudio parada');
            return true;
            
        } catch (error) {
            console.error('Erro ao parar gravação:', error);
            this.showAudioError('Erro ao parar gravação de áudio');
            return false;
        }
    }
    
    handleRecordingStop() {
        try {
            // Criar blob de áudio
            this.audioBlob = new Blob(this.audioChunks, { type: this.recordingOptions.mimeType });
            
            // Criar URL para reprodução
            if (this.audioUrl) {
                URL.revokeObjectURL(this.audioUrl);
            }
            this.audioUrl = URL.createObjectURL(this.audioBlob);
            
            // Calcular duração
            const duration = this.recordingStartTime ? Date.now() - this.recordingStartTime : 0;
            
            // Disparar evento de gravação concluída
            this.dispatchAudioEvent('recordingComplete', {
                blob: this.audioBlob,
                url: this.audioUrl,
                duration: duration,
                size: this.audioBlob.size
            });
            
            // Mostrar sucesso
            this.showAudioSuccess(`Gravação concluída (${this.formatDuration(duration)})`);
            
        } catch (error) {
            console.error('Erro ao processar gravação:', error);
            this.showAudioError('Erro ao processar gravação de áudio');
        }
    }
    
    handleRecordingError(error) {
        console.error('Erro na gravação:', error);
        this.showAudioError('Erro durante a gravação de áudio');
        this.stopRecording();
    }
    
    updateRecordingUI() {
        const recordBtn = document.getElementById('record-audio-btn');
        const audioBtnText = document.getElementById('audio-btn-text');
        
        if (!recordBtn || !audioBtnText) return;
        
        if (this.isRecording) {
            recordBtn.classList.add('recording');
            audioBtnText.textContent = 'Parar Gravação';
            
            // Adicionar indicador visual de gravação
            if (!recordBtn.querySelector('.recording-indicator')) {
                const indicator = document.createElement('div');
                indicator.className = 'recording-indicator';
                indicator.innerHTML = '<i class="fas fa-circle"></i>';
                indicator.style.cssText = `
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    width: 12px;
                    height: 12px;
                    background: var(--red);
                    border-radius: 50%;
                    animation: pulse 1s infinite;
                `;
                recordBtn.style.position = 'relative';
                recordBtn.appendChild(indicator);
            }
        } else {
            recordBtn.classList.remove('recording');
            audioBtnText.textContent = 'Iniciar Gravação';
            
            // Remover indicador de gravação
            const indicator = recordBtn.querySelector('.recording-indicator');
            if (indicator) {
                indicator.remove();
            }
        }
    }
    
    playRecording() {
        if (!this.audioUrl) {
            this.showAudioError('Nenhuma gravação disponível para reprodução');
            return false;
        }
        
        try {
            const audio = new Audio(this.audioUrl);
            
            audio.onended = () => {
                console.log('Reprodução de áudio concluída');
            };
            
            audio.onerror = (error) => {
                console.error('Erro na reprodução:', error);
                this.showAudioError('Erro ao reproduzir áudio');
            };
            
            audio.play();
            return true;
            
        } catch (error) {
            console.error('Erro ao reproduzir áudio:', error);
            this.showAudioError('Erro ao reproduzir áudio');
            return false;
        }
    }
    
    downloadRecording(filename = 'audio_recording') {
        if (!this.audioBlob) {
            this.showAudioError('Nenhuma gravação disponível para download');
            return false;
        }
        
        try {
            const url = URL.createObjectURL(this.audioBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.${this.getFileExtension()}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showAudioSuccess('Download iniciado');
            return true;
            
        } catch (error) {
            console.error('Erro ao fazer download:', error);
            this.showAudioError('Erro ao fazer download do áudio');
            return false;
        }
    }
    
    getFileExtension() {
        const mimeType = this.recordingOptions.mimeType;
        if (mimeType.includes('webm')) return 'webm';
        if (mimeType.includes('mp4')) return 'mp4';
        if (mimeType.includes('wav')) return 'wav';
        return 'audio';
    }
    
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        if (minutes > 0) {
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        } else {
            return `${remainingSeconds}s`;
        }
    }
    
    getRecordingInfo() {
        if (!this.audioBlob) return null;
        
        return {
            size: this.audioBlob.size,
            sizeFormatted: this.formatFileSize(this.audioBlob.size),
            duration: this.recordingStartTime ? Date.now() - this.recordingStartTime : 0,
            durationFormatted: this.formatDuration(Date.now() - (this.recordingStartTime || Date.now())),
            mimeType: this.recordingOptions.mimeType,
            timestamp: new Date().toISOString()
        };
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    clearRecording() {
        this.audioChunks = [];
        this.audioBlob = null;
        
        if (this.audioUrl) {
            URL.revokeObjectURL(this.audioUrl);
            this.audioUrl = null;
        }
        
        this.recordingStartTime = null;
        this.updateRecordingUI();
        
        console.log('Gravação limpa');
    }
    
    showAudioSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'audio-success-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f0fdf4;
            color: var(--success-green);
            padding: var(--spacing-md);
            border-radius: var(--border-radius-md);
            border: 1px solid var(--success-green);
            z-index: 10000;
            max-width: 300px;
            box-shadow: var(--shadow-lg);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
    
    showAudioError(message) {
        const notification = document.createElement('div');
        notification.className = 'audio-error-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--light-red);
            color: var(--red);
            padding: var(--spacing-md);
            border-radius: var(--border-radius-md);
            border: 1px solid var(--red);
            z-index: 10000;
            max-width: 300px;
            box-shadow: var(--shadow-lg);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    dispatchAudioEvent(eventName, data) {
        const event = new CustomEvent(eventName, {
            detail: data,
            bubbles: true
        });
        document.dispatchEvent(event);
    }
    
    // Métodos para integração com o sistema SOS
    async sendAudioForEmergency() {
        if (!this.audioBlob) {
            throw new Error('Nenhuma gravação disponível');
        }
        
        // Simular envio para servidor
        const formData = new FormData();
        formData.append('audio', this.audioBlob, 'emergency_audio.webm');
        formData.append('timestamp', new Date().toISOString());
        formData.append('type', 'emergency_audio');
        
        // Aqui você faria a requisição real para o servidor
        console.log('Enviando áudio de emergência:', {
            size: this.audioBlob.size,
            duration: this.getRecordingInfo()?.duration,
            timestamp: new Date().toISOString()
        });
        
        return {
            success: true,
            message: 'Áudio enviado com sucesso',
            audioId: 'audio_' + Date.now()
        };
    }
    
    // Métodos para análise de áudio
    async analyzeAudio() {
        if (!this.audioBlob) {
            throw new Error('Nenhuma gravação disponível para análise');
        }
        
        // Simular análise de áudio
        const analysis = {
            duration: this.getRecordingInfo()?.duration || 0,
            volume: Math.random() * 100, // Simulado
            hasVoice: Math.random() > 0.3, // Simulado
            quality: 'good',
            noiseLevel: 'low'
        };
        
        return analysis;
    }
}

// Inicializar gerenciador de áudio
let audioManager;

document.addEventListener('DOMContentLoaded', () => {
    audioManager = new AudioManager();
    
    const recordBtn = document.getElementById('record-audio-btn');
    recordBtn.addEventListener('click', () => {
        if (audioManager.isRecording) {
            stopAudioRecording();
        } else {
            startAudioRecording();
        }
    });
});

// Funções globais para áudio
window.startAudioRecording = async () => {
    if (audioManager) {
        return await audioManager.startRecording();
    }
};

window.stopAudioRecording = () => {
    if (audioManager) {
        return audioManager.stopRecording();
    }
};

window.toggleAudioRecording = () => {
    if (audioManager) {
        if (audioManager.isRecording) {
            audioManager.stopRecording();
        } else {
            audioManager.startRecording();
        }
    }
};

window.playAudioRecording = () => {
    if (audioManager) {
        return audioManager.playRecording();
    }
};

window.downloadAudioRecording = (filename) => {
    if (audioManager) {
        return audioManager.downloadRecording(filename);
    }
};

window.clearAudioRecording = () => {
    if (audioManager) {
        audioManager.clearRecording();
    }
};

window.sendAudioForEmergency = async () => {
    if (audioManager) {
        return await audioManager.sendAudioForEmergency();
    }
};

async function enviarAudio() {
    try {
        const result = await sendAudioForEmergency();
        if (result.success) {
            audioManager.showAudioSuccess(result.message);
        } else {
            audioManager.showAudioError('Falha ao enviar áudio');
        }
    } catch (e) {
        audioManager.showAudioError('Erro ao enviar áudio');
    }
}