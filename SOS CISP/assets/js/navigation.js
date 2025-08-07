// Navegação entre telas
class NavigationManager {
    constructor() {
        this.screenHistory = [];
        this.currentScreen = null;
        this.setupNavigation();
    }
    
    setupNavigation() {
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
        
        // Navegação com botões de voltar
        this.setupBackButtons();
    }
    
    setupBackButtons() {
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.goBack();
            });
        });
    }
    
    goBack() {
        if (this.screenHistory.length > 1) {
            this.screenHistory.pop(); // Remove tela atual
            const previousScreen = this.screenHistory[this.screenHistory.length - 1];
            this.navigateTo(previousScreen);
        } else {
            this.navigateTo('access-selection');
        }
    }
    
    navigateTo(screenId) {
        // Ocultar todas as telas
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Mostrar tela selecionada
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            this.currentScreen = screenId;
            
            // Adicionar à história se não for a mesma tela
            if (this.screenHistory[this.screenHistory.length - 1] !== screenId) {
                this.screenHistory.push(screenId);
            }
            
            // Limitar histórico a 10 telas
            if (this.screenHistory.length > 10) {
                this.screenHistory.shift();
            }
        }
    }
    
    closeAllMenus() {
        document.querySelectorAll('.menu-overlay').forEach(menu => {
            menu.classList.add('hidden');
        });
    }
    
    // Navegação específica para diferentes tipos de usuário
    navigateToPoliceLogin() {
        this.navigateTo('police-login');
    }
    
    navigateToCitizenLogin() {
        this.navigateTo('citizen-login');
    }
    
    navigateToCitizenRegister() {
        this.navigateTo('citizen-register');
    }
    
    navigateToPolicePanel() {
        this.navigateTo('police-panel');
    }
    
    navigateToCitizenMain() {
        this.navigateTo('citizen-main');
    }
    
    navigateToAdminPanel() {
        this.navigateTo('admin-panel');
    }
    
    // Navegação com animação
    navigateWithAnimation(screenId, animationType = 'fade') {
        const currentScreen = document.getElementById(this.currentScreen);
        const targetScreen = document.getElementById(screenId);
        
        if (!currentScreen || !targetScreen) return;
        
        // Aplicar animação de saída
        currentScreen.classList.add(`animate-out-${animationType}`);
        
        setTimeout(() => {
            this.navigateTo(screenId);
            targetScreen.classList.add(`animate-in-${animationType}`);
            
            setTimeout(() => {
                targetScreen.classList.remove(`animate-in-${animationType}`);
            }, 300);
        }, 300);
    }
}

// Inicializar gerenciador de navegação
let navigationManager;

document.addEventListener('DOMContentLoaded', () => {
    navigationManager = new NavigationManager();
});

// Funções globais para navegação
window.navigateTo = (screenId) => {
    if (navigationManager) {
        navigationManager.navigateTo(screenId);
    }
};

window.navigateWithAnimation = (screenId, animationType) => {
    if (navigationManager) {
        navigationManager.navigateWithAnimation(screenId, animationType);
    }
};

window.goBack = () => {
    if (navigationManager) {
        navigationManager.goBack();
    }
}; 