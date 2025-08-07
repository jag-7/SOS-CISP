// Gerenciamento de Formulários
class FormManager {
    constructor() {
        this.setupFormValidation();
        this.setupFormEnhancements();
    }
    
    setupFormValidation() {
        // Validação em tempo real
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, textarea')) {
                this.validateField(e.target);
            }
        });
        
        // Validação no envio
        document.addEventListener('submit', (e) => {
            if (e.target.matches('form')) {
                e.preventDefault();
                this.handleFormSubmit(e.target);
            }
        });
    }
    
    setupFormEnhancements() {
        // Auto-focus no primeiro campo
        document.addEventListener('DOMContentLoaded', () => {
            const firstInput = document.querySelector('input:not([type="hidden"])');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        });
        
        // Navegação com Enter
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.matches('input')) {
                const form = e.target.closest('form');
                if (form) {
                    const inputs = Array.from(form.querySelectorAll('input, textarea'));
                    const currentIndex = inputs.indexOf(e.target);
                    const nextInput = inputs[currentIndex + 1];
                    
                    if (nextInput) {
                        e.preventDefault();
                        nextInput.focus();
                    } else {
                        // Último campo, submeter formulário
                        e.preventDefault();
                        form.dispatchEvent(new Event('submit'));
                    }
                }
            }
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name || field.id;
        let isValid = true;
        let errorMessage = '';
        
        // Remover classes de erro anteriores
        field.classList.remove('error', 'success');
        
        // Validações específicas por tipo de campo
        switch (fieldName) {
            case 'police-id':
                isValid = this.validatePoliceId(value);
                errorMessage = 'ID deve ter formato POL + 3 dígitos';
                break;
                
            case 'police-code':
                isValid = this.validatePoliceCode(value);
                errorMessage = 'Código deve ter formato CISP + 4 dígitos';
                break;
                
            case 'citizen-bi':
            case 'register-bi':
                isValid = this.validateBI(value);
                errorMessage = 'BI deve ter 9 dígitos';
                break;
                
            case 'register-email':
                isValid = this.validateEmail(value);
                errorMessage = 'Email inválido';
                break;
                
            case 'register-phone':
                isValid = this.validatePhone(value);
                errorMessage = 'Telefone inválido';
                break;
                
            case 'register-password':
            case 'citizen-password':
                isValid = this.validatePassword(value);
                errorMessage = 'Senha deve ter pelo menos 6 caracteres';
                break;
                
            case 'register-confirm-password':
                const password = document.getElementById('register-password')?.value;
                isValid = value === password;
                errorMessage = 'Senhas não coincidem';
                break;
                
            case 'register-name':
                isValid = this.validateName(value);
                errorMessage = 'Nome deve ter pelo menos 2 palavras';
                break;
                
            case 'register-address':
                isValid = this.validateAddress(value);
                errorMessage = 'Endereço deve ter pelo menos 10 caracteres';
                break;
        }
        
        // Aplicar validação
        if (value && !isValid) {
            field.classList.add('error');
            this.showFieldError(field, errorMessage);
        } else if (value && isValid) {
            field.classList.add('success');
            this.hideFieldError(field);
        } else {
            this.hideFieldError(field);
        }
        
        return isValid;
    }
    
    validatePoliceId(value) {
        return /^POL\d{3}$/.test(value);
    }
    
    validatePoliceCode(value) {
        return /^CISP\d{4}$/.test(value);
    }
    
    validateBI(value) {
        return /^\d{9}$/.test(value);
    }
    
    validateEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    
    validatePhone(value) {
        // Aceita formatos: 123456789, 123-456-789, (123) 456-789
        const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
        return /^\d{9}$/.test(cleanPhone);
    }
    
    validatePassword(value) {
        return value.length >= 6;
    }
    
    validateName(value) {
        const words = value.split(' ').filter(word => word.length > 0);
        return words.length >= 2 && words.every(word => word.length >= 2);
    }
    
    validateAddress(value) {
        return value.length >= 10;
    }
    
    showFieldError(field, message) {
        this.hideFieldError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: var(--red);
            font-size: var(--font-size-xs);
            margin-top: var(--spacing-xs);
            display: block;
        `;
        
        field.parentNode.appendChild(errorDiv);
    }
    
    hideFieldError(field) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
    
    validateForm(form) {
        const fields = form.querySelectorAll('input, textarea');
        let isValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    async handleFormSubmit(form) {
        const formId = form.id;
        
        if (!this.validateForm(form)) {
            this.showFormError('Por favor, corrija os erros no formulário');
            return false;
        }
        
        // Adicionar estado de loading
        this.setFormLoading(form, true);
        
        try {
            switch (formId) {
                case 'police-login-form':
                    await this.handlePoliceLoginSubmit(form);
                    break;
                    
                case 'citizen-login-form':
                    await this.handleCitizenLoginSubmit(form);
                    break;
                    
                case 'citizen-register-form':
                    await this.handleCitizenRegisterSubmit(form);
                    break;
                    
                default:
                    console.warn('Formulário não reconhecido:', formId);
            }
        } catch (error) {
            console.error('Erro no formulário:', error);
            this.showFormError('Erro ao processar formulário');
        } finally {
            this.setFormLoading(form, false);
        }
    }
    
    async handlePoliceLoginSubmit(form) {
        const formData = new FormData(form);
        const data = {
            policeId: formData.get('police-id'),
            policeCode: formData.get('police-code')
        };
        
        // Simular validação no servidor
        await this.simulateServerRequest();
        
        if (data.policeId === 'POL007' && data.policeCode === 'CISP2007') {
            this.showFormSuccess('Login realizado com sucesso!');
            setTimeout(() => {
                if (window.sosCISPApp) {
                    window.sosCISPApp.handlePoliceLogin();
                }
            }, 1000);
        } else {
            this.showFormError('ID ou código inválido');
        }
    }
    
    async handleCitizenLoginSubmit(form) {
        const formData = new FormData(form);
        const data = {
            bi: formData.get('citizen-bi'),
            password: formData.get('citizen-password')
        };
        
        // Simular validação no servidor
        await this.simulateServerRequest();
        
        if (data.bi === '123456789' && data.password === 'senha123') {
            this.showFormSuccess('Login realizado com sucesso!');
            setTimeout(() => {
                if (window.sosCISPApp) {
                    window.sosCISPApp.handleCitizenLogin();
                }
            }, 1000);
        } else {
            this.showFormError('BI ou senha inválidos');
        }
    }
    
    async handleCitizenRegisterSubmit(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Validação adicional
        if (data['register-password'] !== data['register-confirm-password']) {
            this.showFormError('As senhas não coincidem');
            return;
        }
        
        // Simular cadastro no servidor
        await this.simulateServerRequest();
        
        this.showFormSuccess('Cadastro realizado com sucesso!');
        setTimeout(() => {
            if (window.navigateTo) {
                window.navigateTo('citizen-login');
            }
        }, 2000);
    }
    
    async simulateServerRequest() {
        return new Promise(resolve => {
            setTimeout(resolve, 1000);
        });
    }
    
    setFormLoading(form, isLoading) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const inputs = form.querySelectorAll('input, textarea');
        
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
            inputs.forEach(input => input.disabled = true);
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = submitBtn.dataset.originalText || 'Enviar';
            inputs.forEach(input => input.disabled = false);
        }
    }
    
    showFormSuccess(message) {
        this.showFormMessage(message, 'success');
    }
    
    showFormError(message) {
        this.showFormMessage(message, 'error');
    }
    
    showFormMessage(message, type) {
        // Remover mensagens anteriores
        document.querySelectorAll('.form-message').forEach(msg => msg.remove());
        
        // Criar nova mensagem
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        messageDiv.style.cssText = `
            padding: var(--spacing-md);
            border-radius: var(--border-radius-md);
            margin-bottom: var(--spacing-lg);
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            color: ${type === 'success' ? 'var(--success-green)' : 'var(--red)'};
            background-color: ${type === 'success' ? '#f0fdf4' : 'var(--light-red)'};
            border: 1px solid ${type === 'success' ? 'var(--success-green)' : 'var(--red)'};
        `;
        
        // Inserir no início do formulário
        const form = document.querySelector('form');
        if (form) {
            form.insertBefore(messageDiv, form.firstChild);
        }
        
        // Remover após 5 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
    
    // Utilitários para formulários
    clearForm(form) {
        form.reset();
        form.querySelectorAll('input, textarea').forEach(field => {
            field.classList.remove('error', 'success');
            this.hideFieldError(field);
        });
    }
    
    getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }
    
    setFormData(form, data) {
        Object.keys(data).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = data[key];
            }
        });
    }
}

// Inicializar gerenciador de formulários
let formManager;

document.addEventListener('DOMContentLoaded', () => {
    formManager = new FormManager();
});

// Funções globais para formulários
window.validateField = (field) => {
    if (formManager) {
        return formManager.validateField(field);
    }
};

window.validateForm = (form) => {
    if (formManager) {
        return formManager.validateForm(form);
    }
};

window.clearForm = (form) => {
    if (formManager) {
        formManager.clearForm(form);
    }
}; 