<?php
/**
 * Tarik Clothing — Persistent Upload Server
 * Serves uploaded files from PERSISTENT storage outside public_html.
 * Supports HTTP Range requests for smooth video streaming/seeking.
 *
 * Called via .htaccess rewrite:  /uploads/reels/file.mp4 → serve-upload.php?file=reels/file.mp4
 * Storage path:                  /home/<user>/tarik_uploads/reels/file.mp4
 */

$requestedFile = $_GET['file'] ?? '';

if (empty($requestedFile)) {
    http_response_code(400);
    exit;
}

// ─── Security: Prevent directory traversal ───
// Only allow: images/<filename> or reels/<filename>
$allowedDirs = ['images', 'reels'];
$parts = explode('/', $requestedFile);

// Must be exactly subfolder/filename (no deeper paths)
if (count($parts) !== 2) {
    http_response_code(404);
    exit;
}

$subfolder = $parts[0];
$filename = basename($parts[1]); // basename() strips any path tricks

if (!in_array($subfolder, $allowedDirs) || empty($filename)) {
    http_response_code(404);
    exit;
}

// Block any remaining traversal attempts
if (strpos($filename, '..') !== false || strpos($filename, '/') !== false || strpos($filename, '\\') !== false) {
    http_response_code(403);
    exit;
}

// ─── Resolve file path ───
$persistentBase = dirname($_SERVER['DOCUMENT_ROOT']) . '/tarik_uploads/';
$filePath = $persistentBase . $subfolder . '/' . $filename;

if (!file_exists($filePath) || !is_file($filePath)) {
    http_response_code(404);
    exit;
}

// ─── Determine MIME type ───
$mimeTypes = [
    'jpg'  => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png'  => 'image/png',
    'webp' => 'image/webp',
    'gif'  => 'image/gif',
    'mp4'  => 'video/mp4',
    'mov'  => 'video/quicktime',
    'webm' => 'video/webm',
];
$ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
$mime = $mimeTypes[$ext] ?? 'application/octet-stream';
$fileSize = filesize($filePath);

// ─── CORS headers ───
header('Access-Control-Allow-Origin: *');

// ─── Cache headers (1 year — filenames are unique per upload) ───
header('Cache-Control: public, max-age=31536000, immutable');

// ─── HTTP Range Request Support (for video seeking) ───
header('Accept-Ranges: bytes');
header('Content-Type: ' . $mime);

if (isset($_SERVER['HTTP_RANGE'])) {
    // Parse range header: "bytes=start-end"
    $range = $_SERVER['HTTP_RANGE'];
    if (preg_match('/bytes=(\d+)-(\d*)/', $range, $matches)) {
        $start = intval($matches[1]);
        $end = !empty($matches[2]) ? intval($matches[2]) : $fileSize - 1;

        // Validate range
        if ($start > $end || $start >= $fileSize) {
            http_response_code(416); // Range Not Satisfiable
            header("Content-Range: bytes */$fileSize");
            exit;
        }

        $end = min($end, $fileSize - 1);
        $length = $end - $start + 1;

        http_response_code(206); // Partial Content
        header("Content-Range: bytes $start-$end/$fileSize");
        header("Content-Length: $length");

        // Serve the requested byte range
        $fp = fopen($filePath, 'rb');
        fseek($fp, $start);
        $remaining = $length;
        $bufferSize = 8192;
        while ($remaining > 0 && !feof($fp)) {
            $readSize = min($bufferSize, $remaining);
            echo fread($fp, $readSize);
            $remaining -= $readSize;
            flush();
        }
        fclose($fp);
        exit;
    }
}

// ─── Full file response (no range requested) ───
header('Content-Length: ' . $fileSize);
readfile($filePath);
