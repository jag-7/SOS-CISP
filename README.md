# SOS CISP - Sistema de Comunicação de Emergência

## 📋 Descrição

Sistema completo de comunicação de emergência com armazenamento local, permitindo que cidadãos enviem alertas de emergência e policiais recebam e gerenciem essas informações em tempo real.

## ✨ Funcionalidades Implementadas

### 🔐 Sistema de Autenticação
- **Login Policial**: Acesso com ID e código interno
- **Login Cidadão**: Acesso com BI e senha
- **Cadastro de Cidadãos**: Registro completo com validação
- **Armazenamento Local**: Todos os dados salvos no localStorage

### 👮‍♂️ Painel Policial
- **Dashboard em Tempo Real**: Estatísticas de mensagens e emergências
- **Lista de Mensagens**: Visualização de todas as comunicações recebidas
- **Filtros**: Filtrar por tipo de mensagem (texto, áudio, localização, SOS)
- **Informações Detalhadas**: Localização, remetente e status de cada mensagem

### 🙋‍♂️ Interface do Cidadão
- **Botão SOS**: Envio rápido de emergência
- **Localização Automática**: Captura e envio da localização atual
- **Mensagens Rápidas**: Botões pré-definidos para situações comuns
- **Gravação de Áudio**: Captura de áudio para descrição detalhada
- **Mensagem Personalizada**: Campo de texto livre para descrições

### 🎨 Interface Moderna
- **Tema Escuro**: Design moderno com fundo escuro
- **Ícones Pretos**: Todos os ícones em cor preta para contraste
- **Botão "Sair"**: Substituição dos 3 pontos por botão "Sair" claro
- **Responsivo**: Funciona em dispositivos móveis e desktop

## 🚀 Como Usar

### Credenciais Padrão

#### Policiais:
- **ID**: POL007 | **Código**: CISP2007
- **ID**: POL008 | **Código**: CISP2008

#### Cidadãos:
- **BI**: 123456789 | **Senha**: 123456
- **BI**: 987654321 | **Senha**: 123456

### Fluxo de Uso

1. **Acesso**: Selecione entre "Polícia" ou "Cidadão"
2. **Login**: Use as credenciais padrão ou cadastre-se (cidadãos)
3. **Envio de Emergência** (Cidadãos):
   - Pressione o botão SOS para emergência imediata
   - Use mensagens rápidas para situações específicas
   - Grave áudio para descrições detalhadas
   - Envie localização para precisão
4. **Monitoramento** (Policiais):
   - Visualize todas as mensagens recebidas
   - Filtre por tipo de emergência
   - Acompanhe estatísticas em tempo real

## 💾 Armazenamento Local

O sistema utiliza localStorage para:
- **Usuários**: Policiais e cidadãos cadastrados
- **Mensagens**: Todas as comunicações enviadas
- **Estatísticas**: Contadores e métricas do sistema

## 🔧 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Design responsivo com tema escuro
- **JavaScript ES6+**: Lógica de aplicação
- **Font Awesome**: Ícones
- **Google Fonts**: Tipografia Inter

## 📱 Recursos Técnicos

### Geolocalização
- Captura automática da localização do usuário
- Coordenadas precisas para cada mensagem
- Permissões de localização solicitadas automaticamente

### Gravação de Áudio
- API MediaRecorder para captura de áudio
- Suporte a diferentes formatos de áudio
- Interface visual durante gravação

### Notificações
- Sistema de notificações em tempo real
- Feedback visual para todas as ações
- Mensagens de sucesso e erro

## 🎯 Funcionalidades Principais

### Para Cidadãos:
- ✅ Envio de SOS com localização
- ✅ Mensagens rápidas pré-definidas
- ✅ Gravação de áudio
- ✅ Mensagens personalizadas
- ✅ Cadastro e login
- ✅ Interface intuitiva

### Para Policiais:
- ✅ Dashboard em tempo real
- ✅ Lista completa de mensagens
- ✅ Filtros por tipo
- ✅ Estatísticas detalhadas
- ✅ Informações de localização
- ✅ Status de processamento

## 🔄 Atualizações Recentes

- **Armazenamento Local**: Remoção da dependência de PHP/MySQL
- **Tema Escuro**: Implementação completa do design escuro
- **Ícones Pretos**: Todos os ícones agora são pretos
- **Botão Sair**: Substituição dos 3 pontos por "Sair"
- **Funcionalidade Completa**: Todas as funcionalidades operacionais

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação ou entre em contato com a equipe de desenvolvimento.

---

**SOS CISP** - Comunicação de Emergência Segura e Eficiente 