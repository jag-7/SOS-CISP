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
    
    $required = ['sender_id', 'sender_type', 'sender_name', 'message_type', 'content'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            throw new Exception("Campo obrigatório ausente: $field");
        }
    }
    
    $db = getDatabase();
    
    $messageData = [
        'sender_id' => $input['sender_id'],
        'sender_type' => $input['sender_type'],
        'sender_name' => $input['sender_name'],
        'message_type' => $input['message_type'],
        'content' => $input['content'],
        'latitude' => $input['latitude'] ?? null,
        'longitude' => $input['longitude'] ?? null,
        'status' => 'pending'
    ];
    
    $success = $db->createMessage($messageData);
    
    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Mensagem enviada com sucesso',
            'id' => $db->getLastInsertId()
        ]);
    } else {
        throw new Exception('Erro ao salvar mensagem');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 