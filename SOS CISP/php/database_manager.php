<?php
/**
 * SOS CISP - Gerenciador de Banco de Dados
 * Usa SQLite para simplicidade
 */

class DatabaseManager {
    private $db;
    private $dbPath;
    
    public function __construct() {
        $this->dbPath = __DIR__ . '/../database/sos_cisp_simple.db';
        $this->initDatabase();
    }
    
    private function initDatabase() {
        try {
            $this->db = new PDO('sqlite:' . $this->dbPath);
            $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Criar tabelas se não existirem
            $this->createTables();
            
        } catch (PDOException $e) {
            error_log("Erro de conexão com banco: " . $e->getMessage());
            throw new Exception("Erro de conexão com banco de dados");
        }
    }
    
    private function createTables() {
        $sql = "
        CREATE TABLE IF NOT EXISTS police_users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            code TEXT NOT NULL,
            rank TEXT,
            department TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS citizen_users (
            bi TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            address TEXT,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id TEXT NOT NULL,
            sender_type TEXT NOT NULL,
            sender_name TEXT NOT NULL,
            message_type TEXT NOT NULL,
            content TEXT,
            latitude REAL,
            longitude REAL,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        ";
        
        $this->db->exec($sql);
        
        // Inserir dados padrão se não existirem
        $this->insertDefaultData();
    }
    
    private function insertDefaultData() {
        // Verificar se já existem dados
        $stmt = $this->db->query("SELECT COUNT(*) FROM police_users");
        if ($stmt->fetchColumn() == 0) {
            $this->db->exec("
                INSERT INTO police_users (id, name, code, rank, department) VALUES 
                ('POL007', 'Agente POL007', 'CISP2007', 'Agente', 'CISP'),
                ('POL008', 'Agente POL008', 'CISP2008', 'Agente', 'CISP'),
                ('POL009', 'Agente POL009', 'CISP2009', 'Agente', 'CISP')
            ");
        }
        
        $stmt = $this->db->query("SELECT COUNT(*) FROM citizen_users");
        if ($stmt->fetchColumn() == 0) {
            $this->db->exec("
                INSERT INTO citizen_users (bi, name, email, phone, address, password) VALUES 
                ('123456789', 'João Silva', 'joao@email.com', '244123456', 'Rua das Flores, 123', '123456'),
                ('987654321', 'Maria Santos', 'maria@email.com', '244654321', 'Avenida Principal, 456', '123456'),
                ('555666777', 'Pedro Costa', 'pedro@email.com', '244555666', 'Travessa da Paz, 789', '123456')
            ");
        }
        
        $stmt = $this->db->query("SELECT COUNT(*) FROM messages");
        if ($stmt->fetchColumn() == 0) {
            $this->db->exec("
                INSERT INTO messages (sender_id, sender_type, sender_name, message_type, content, latitude, longitude, status) VALUES 
                ('123456789', 'citizen', 'João Silva', 'sos', 'SOS - Emergência', -8.8383, 13.2344, 'pending'),
                ('987654321', 'citizen', 'Maria Santos', 'text', 'Roubo em andamento na Rua das Flores', -8.8383, 13.2344, 'processing'),
                ('555666777', 'citizen', 'Pedro Costa', 'location', 'Localização enviada', -8.8383, 13.2344, 'completed'),
                ('123456789', 'citizen', 'João Silva', 'text', 'Violência doméstica', -8.8383, 13.2344, 'pending'),
                ('987654321', 'citizen', 'Maria Santos', 'audio', 'Gravação de áudio', -8.8383, 13.2344, 'processing')
            ");
        }
    }
    
    // Métodos para usuários policiais
    public function getPoliceUser($id) {
        $stmt = $this->db->prepare("SELECT * FROM police_users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function getAllPoliceUsers() {
        $stmt = $this->db->query("SELECT * FROM police_users ORDER BY name");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function createPoliceUser($data) {
        $stmt = $this->db->prepare("
            INSERT INTO police_users (id, name, code, rank, department) 
            VALUES (?, ?, ?, ?, ?)
        ");
        return $stmt->execute([
            $data['id'],
            $data['name'],
            $data['code'],
            $data['rank'] ?? 'Agente',
            $data['department'] ?? 'CISP'
        ]);
    }
    
    // Métodos para usuários cidadãos
    public function getCitizenUser($bi) {
        $stmt = $this->db->prepare("SELECT * FROM citizen_users WHERE bi = ?");
        $stmt->execute([$bi]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function getAllCitizenUsers() {
        $stmt = $this->db->query("SELECT * FROM citizen_users ORDER BY name");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function createCitizenUser($data) {
        $stmt = $this->db->prepare("
            INSERT INTO citizen_users (bi, name, email, phone, address, password) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        return $stmt->execute([
            $data['bi'],
            $data['name'],
            $data['email'],
            $data['phone'],
            $data['address'],
            password_hash($data['password'], PASSWORD_DEFAULT)
        ]);
    }
    
    // Métodos para mensagens
    public function getAllMessages($limit = 50) {
        $stmt = $this->db->prepare("
            SELECT * FROM messages 
            ORDER BY created_at DESC 
            LIMIT ?
        ");
        $stmt->execute([$limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getMessagesByType($type, $limit = 50) {
        $stmt = $this->db->prepare("
            SELECT * FROM messages 
            WHERE message_type = ? 
            ORDER BY created_at DESC 
            LIMIT ?
        ");
        $stmt->execute([$type, $limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function createMessage($data) {
        $stmt = $this->db->prepare("
            INSERT INTO messages (sender_id, sender_type, sender_name, message_type, content, latitude, longitude, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        return $stmt->execute([
            $data['sender_id'],
            $data['sender_type'],
            $data['sender_name'],
            $data['message_type'],
            $data['content'],
            $data['latitude'] ?? null,
            $data['longitude'] ?? null,
            $data['status'] ?? 'pending'
        ]);
    }
    
    public function updateMessageStatus($id, $status) {
        $stmt = $this->db->prepare("UPDATE messages SET status = ? WHERE id = ?");
        return $stmt->execute([$status, $id]);
    }
    
    // Estatísticas
    public function getStats() {
        $stats = [];
        
        // Total de mensagens
        $stmt = $this->db->query("SELECT COUNT(*) FROM messages");
        $stats['total_messages'] = $stmt->fetchColumn();
        
        // Mensagens por tipo
        $stmt = $this->db->query("SELECT message_type, COUNT(*) as count FROM messages GROUP BY message_type");
        $stats['messages_by_type'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Mensagens por status
        $stmt = $this->db->query("SELECT status, COUNT(*) as count FROM messages GROUP BY status");
        $stats['messages_by_status'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Total de usuários
        $stmt = $this->db->query("SELECT COUNT(*) FROM police_users");
        $stats['total_police'] = $stmt->fetchColumn();
        
        $stmt = $this->db->query("SELECT COUNT(*) FROM citizen_users");
        $stats['total_citizens'] = $stmt->fetchColumn();
        
        return $stats;
    }
    
    // Verificar credenciais
    public function verifyPoliceCredentials($id, $code) {
        $user = $this->getPoliceUser($id);
        return $user && $user['code'] === $code;
    }
    
    public function verifyCitizenCredentials($bi, $password) {
        $user = $this->getCitizenUser($bi);
        return $user && password_verify($password, $user['password']);
    }
    
    // Fechar conexão
    public function close() {
        $this->db = null;
    }
}

// Função para criar instância global
function getDatabase() {
    static $db = null;
    if ($db === null) {
        $db = new DatabaseManager();
    }
    return $db;
}
?> 