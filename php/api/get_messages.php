<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../database_manager.php';

try {
    $db = getDatabase();
    
    $type = $_GET['type'] ?? 'all';
    $limit = (int)($_GET['limit'] ?? 50);
    
    if ($type === 'all') {
        $messages = $db->getAllMessages($limit);
    } else {
        $messages = $db->getMessagesByType($type, $limit);
    }
    
    // Formatar mensagens para o frontend
    $formattedMessages = [];
    foreach ($messages as $message) {
        $formattedMessages[] = [
            'id' => $message['id'],
            'type' => $message['message_type'],
            'content' => $message['content'],
            'sender' => $message['sender_name'],
            'timestamp' => $message['created_at'],
            'location' => [
                'lat' => (float)$message['latitude'],
                'lng' => (float)$message['longitude']
            ],
            'status' => $message['status']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'messages' => $formattedMessages,
        'total' => count($formattedMessages)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao buscar mensagens: ' . $e->getMessage()
    ]);
}
?> 