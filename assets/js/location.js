// Gerenciamento de Localização
class LocationManager {
    constructor() {
        this.currentLocation = null;
        this.watchId = null;
        this.isTracking = false;
        this.locationHistory = [];
        this.maxHistorySize = 10;
        
        this.setupLocationServices();
    }
    
    setupLocationServices() {
        // Verificar suporte à geolocalização
        if (!('geolocation' in navigator)) {
            console.warn('Geolocalização não suportada');
            return;
        }
        
        // Configurar opções padrão
        this.options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000 // 1 minuto
        };
        
        // Solicitar permissão inicial
        this.requestPermission();
    }
    
    async requestPermission() {
        try {
            // Verificar se já temos permissão
            const permission = await navigator.permissions.query({ name: 'geolocation' });
            
            if (permission.state === 'granted') {
                this.onPermissionGranted();
            } else if (permission.state === 'prompt') {
                // Solicitar permissão
                this.getCurrentPosition();
            } else {
                this.onPermissionDenied();
            }
            
            // Monitorar mudanças na permissão
            permission.addEventListener('change', () => {
                if (permission.state === 'granted') {
                    this.onPermissionGranted();
                } else {
                    this.onPermissionDenied();
                }
            });
            
        } catch (error) {
            console.error('Erro ao verificar permissão:', error);
            this.onPermissionDenied();
        }
    }
    
    onPermissionGranted() {
        console.log('Permissão de localização concedida');
        this.updateLocationDisplay('Permissão concedida');
    }
    
    onPermissionDenied() {
        console.warn('Permissão de localização negada');
        this.updateLocationDisplay('Permissão negada');
        this.showLocationError('Permissão de localização negada. Ative a localização nas configurações do navegador.');
    }
    
    async getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.handleLocationSuccess(position);
                    resolve(position);
                },
                (error) => {
                    this.handleLocationError(error);
                    reject(error);
                },
                this.options
            );
        });
    }
    
    startLocationTracking() {
        if (this.isTracking) {
            console.warn('Rastreamento já está ativo');
            return;
        }
        
        if (!('geolocation' in navigator)) {
            this.showLocationError('Geolocalização não suportada');
            return;
        }
        
        this.isTracking = true;
        this.updateLocationDisplay('Rastreando localização...');
        
        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                this.handleLocationSuccess(position);
            },
            (error) => {
                this.handleLocationError(error);
            },
            this.options
        );
        
        console.log('Rastreamento de localização iniciado');
    }
    
    stopLocationTracking() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
            this.isTracking = false;
            console.log('Rastreamento de localização parado');
        }
    }
    
    handleLocationSuccess(position) {
        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp),
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed
        };
        
        this.currentLocation = location;
        this.addToHistory(location);
        this.updateLocationDisplay();
        
        // Disparar evento de localização atualizada
        this.dispatchLocationEvent('locationUpdated', location);
    }
    
    handleLocationError(error) {
        let errorMessage = 'Erro ao obter localização';
        
        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = 'Permissão de localização negada';
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = 'Informação de localização indisponível';
                break;
            case error.TIMEOUT:
                errorMessage = 'Tempo limite excedido ao obter localização';
                break;
            default:
                errorMessage = 'Erro desconhecido ao obter localização';
        }
        
        console.error('Erro de localização:', errorMessage);
        this.showLocationError(errorMessage);
        this.updateLocationDisplay('Erro ao obter localização');
        
        // Disparar evento de erro
        this.dispatchLocationEvent('locationError', { error, message: errorMessage });
    }
    
    addToHistory(location) {
        this.locationHistory.push(location);
        
        // Manter apenas as últimas localizações
        if (this.locationHistory.length > this.maxHistorySize) {
            this.locationHistory.shift();
        }
    }
    
    updateLocationDisplay(status = null) {
        const locationText = document.getElementById('location-text');
        const locationDisplay = document.getElementById('location-display');
        
        if (!locationText) return;
        
        if (status) {
            locationText.textContent = status;
            return;
        }
        
        if (this.currentLocation) {
            const lat = this.currentLocation.latitude.toFixed(6);
            const lng = this.currentLocation.longitude.toFixed(6);
            const accuracy = this.currentLocation.accuracy ? 
                ` (±${Math.round(this.currentLocation.accuracy)}m)` : '';
            
            locationText.textContent = `${lat}, ${lng}${accuracy}`;
            
            if (locationDisplay) {
                locationDisplay.classList.remove('error');
                locationDisplay.classList.add('success');
            }
        } else {
            locationText.textContent = 'Localização não disponível';
            
            if (locationDisplay) {
                locationDisplay.classList.remove('success');
                locationDisplay.classList.add('error');
            }
        }
    }
    
    showLocationError(message) {
        // Criar notificação de erro
        const notification = document.createElement('div');
        notification.className = 'location-error-notification';
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
        
        // Remover automaticamente após 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    dispatchLocationEvent(eventName, data) {
        const event = new CustomEvent(eventName, {
            detail: data,
            bubbles: true
        });
        document.dispatchEvent(event);
    }
    
    // Utilitários de localização
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Raio da Terra em km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c; // Distância em km
        return distance;
    }
    
    deg2rad(deg) {
        return deg * (Math.PI/180);
    }
    
    formatLocation(location) {
        if (!location) return 'Localização não disponível';
        
        const lat = location.latitude.toFixed(6);
        const lng = location.longitude.toFixed(6);
        const accuracy = location.accuracy ? 
            ` (Precisão: ±${Math.round(location.accuracy)}m)` : '';
        
        return `${lat}, ${lng}${accuracy}`;
    }
    
    getLocationForEmergency() {
        if (!this.currentLocation) {
            throw new Error('Localização não disponível');
        }
        
        return {
            latitude: this.currentLocation.latitude,
            longitude: this.currentLocation.longitude,
            accuracy: this.currentLocation.accuracy,
            timestamp: new Date().toISOString(),
            source: 'browser_geolocation'
        };
    }
    
    // Métodos para integração com mapas
    getGoogleMapsUrl(location = this.currentLocation) {
        if (!location) return null;
        
        return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    }
    
    getOpenStreetMapUrl(location = this.currentLocation) {
        if (!location) return null;
        
        return `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}&zoom=15`;
    }
    
    // Métodos para compartilhamento de localização
    async shareLocation() {
        if (!this.currentLocation) {
            this.showLocationError('Localização não disponível para compartilhamento');
            return false;
        }
        
        if (navigator.share) {
            try {
                const shareData = {
                    title: 'Minha Localização - SOS CISP',
                    text: `Estou em: ${this.formatLocation(this.currentLocation)}`,
                    url: this.getGoogleMapsUrl()
                };
                
                await navigator.share(shareData);
                return true;
            } catch (error) {
                console.error('Erro ao compartilhar localização:', error);
                return false;
            }
        } else {
            // Fallback: copiar para área de transferência
            return this.copyLocationToClipboard();
        }
    }
    
    async copyLocationToClipboard() {
        if (!this.currentLocation) return false;
        
        const locationText = this.formatLocation(this.currentLocation);
        const mapsUrl = this.getGoogleMapsUrl();
        const textToCopy = `${locationText}\n${mapsUrl}`;
        
        try {
            await navigator.clipboard.writeText(textToCopy);
            this.showLocationSuccess('Localização copiada para área de transferência');
            return true;
        } catch (error) {
            console.error('Erro ao copiar localização:', error);
            return false;
        }
    }
    
    showLocationSuccess(message) {
        // Criar notificação de sucesso
        const notification = document.createElement('div');
        notification.className = 'location-success-notification';
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
        
        // Remover automaticamente após 3 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
    
    // Métodos para estatísticas de localização
    getLocationStats() {
        if (this.locationHistory.length === 0) {
            return null;
        }
        
        const locations = this.locationHistory;
        const totalDistance = locations.reduce((total, location, index) => {
            if (index === 0) return 0;
            const prevLocation = locations[index - 1];
            return total + this.calculateDistance(
                prevLocation.latitude, prevLocation.longitude,
                location.latitude, location.longitude
            );
        }, 0);
        
        return {
            totalLocations: locations.length,
            totalDistance: totalDistance,
            averageAccuracy: locations.reduce((sum, loc) => sum + (loc.accuracy || 0), 0) / locations.length,
            firstLocation: locations[0],
            lastLocation: locations[locations.length - 1],
            timeSpan: locations[locations.length - 1].timestamp - locations[0].timestamp
        };
    }
}

// Inicializar gerenciador de localização
let locationManager;

document.addEventListener('DOMContentLoaded', () => {
    locationManager = new LocationManager();
});

// Funções globais para localização
window.getCurrentLocation = async () => {
    if (locationManager) {
        return await locationManager.getCurrentPosition();
    }
};

window.startLocationTracking = () => {
    if (locationManager) {
        locationManager.startLocationTracking();
    }
};

window.stopLocationTracking = () => {
    if (locationManager) {
        locationManager.stopLocationTracking();
    }
};

window.shareLocation = async () => {
    if (locationManager) {
        return await locationManager.shareLocation();
    }
};

window.copyLocationToClipboard = async () => {
    if (locationManager) {
        return await locationManager.copyLocationToClipboard();
    }
}; 