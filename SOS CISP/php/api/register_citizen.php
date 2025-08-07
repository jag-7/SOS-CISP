<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../database_manager.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Dados inválidos');
    }
    
    // Validar campos obrigatórios
    $required = ['bi', 'name', 'email', 'phone', 'address', 'password'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            throw new Exception("Campo obrigatório ausente: $field");
        }
    }
    
    $db = getDatabase();
    
    // Verificar se o BI já existe
    if ($db->getCitizenUser($input['bi'])) {
        echo json_encode([
            'success' => false,
            'error' => 'Este número de BI já está cadastrado'
        ]);
        exit;
    }
    
    // Criar novo usuário
    $success = $db->createCitizenUser($input);
    
    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Cadastro realizado com sucesso'
        ]);
    } else {
        throw new Exception('Erro ao criar usuário');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 