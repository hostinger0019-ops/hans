<?php
/**
 * Tarik Clothing — File Upload Handler
 * Saves files to PERSISTENT storage OUTSIDE public_html.
 * This ensures uploads survive Git deployments.
 *
 * Storage path: /home/<user>/tarik_uploads/images/ or /reels/
 * Served via:   serve-upload.php (rewritten by .htaccess)
 */

// CORS headers for admin panel
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Upload-Key');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Simple API key check
$uploadKey = 'tarik-upload-2024-secure';
$providedKey = $_SERVER['HTTP_X_UPLOAD_KEY'] ?? '';

if ($providedKey !== $uploadKey) {
    http_response_code(403);
    echo json_encode(['error' => 'Invalid upload key']);
    exit;
}

// Check if file was uploaded
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded or upload error']);
    exit;
}

$file = $_FILES['file'];
$fileType = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$mimeType = mime_content_type($file['tmp_name']);

// Allowed file types
$allowedImages = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
$allowedVideos = ['mp4', 'mov', 'webm'];
$allowedMimes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/quicktime', 'video/webm',
];

if (!in_array($fileType, array_merge($allowedImages, $allowedVideos))) {
    http_response_code(400);
    echo json_encode(['error' => 'File type not allowed: ' . $fileType]);
    exit;
}

if (!in_array($mimeType, $allowedMimes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid MIME type: ' . $mimeType]);
    exit;
}

// Max file size: 50MB
$maxSize = 50 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['error' => 'File too large. Max 50MB.']);
    exit;
}

// Determine subfolder
$isVideo = in_array($fileType, $allowedVideos);
$subfolder = $isVideo ? 'reels' : 'images';

// ─── PERSISTENT STORAGE — Outside public_html ───
// This directory is NOT touched by Git deployments
$persistentBase = dirname($_SERVER['DOCUMENT_ROOT']) . '/tarik_uploads/';
$uploadDir = $persistentBase . $subfolder . '/';

if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create upload directory']);
        exit;
    }
}

// Generate unique filename
$uniqueName = uniqid('tarik_', true) . '.' . $fileType;
$destPath = $uploadDir . $uniqueName;

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save file']);
    exit;
}

// Build public URL — served via .htaccess rewrite → serve-upload.php
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'];
$publicUrl = $protocol . '://' . $host . '/uploads/' . $subfolder . '/' . $uniqueName;

// Return success
echo json_encode([
    'success' => true,
    'url' => $publicUrl,
    'filename' => $uniqueName,
    'type' => $isVideo ? 'video' : 'image',
    'size' => $file['size'],
]);
