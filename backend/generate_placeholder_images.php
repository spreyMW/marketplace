<?php
// Create placeholder images for products

$uploadsDir = __DIR__ . '/public/uploads/products';

// Ensure directory exists
if (!is_dir($uploadsDir)) {
    mkdir($uploadsDir, 0755, true);
    echo "Created directory: {$uploadsDir}\n";
}

// Define image names to create
$images = [
    'tote-1.jpg',
    'tote-2.jpg',
    'tote-3.jpg',
    'mug-1.jpg',
    'mug-2.jpg',
    'lamp-1.jpg',
    'lamp-2.jpg',
    'lamp-3.jpg',
    'notebook-1.jpg',
    'notebook-2.jpg',
];

// Create a simple placeholder image function
function createPlaceholderImage($filepath, $text, $width = 400, $height = 400) {
    // Create a 400x400 image
    $image = imagecreatetruecolor($width, $height);
    
    // Define colors
    $bgColor = imagecolorallocate($image, 240, 240, 240);
    $textColor = imagecolorallocate($image, 100, 100, 100);
    $borderColor = imagecolorallocate($image, 200, 200, 200);
    
    // Fill background
    imagefill($image, 0, 0, $bgColor);
    
    // Add border
    imagerectangle($image, 0, 0, $width - 1, $height - 1, $borderColor);
    
    // Add text
    $fontSize = 3;
    $textWidth = imagefontwidth($fontSize) * strlen($text);
    $textHeight = imagefontheight($fontSize);
    
    $x = ($width - $textWidth) / 2;
    $y = ($height - $textHeight) / 2;
    
    imagestring($image, $fontSize, $x, $y, $text, $textColor);
    
    // Save as JPEG
    imagejpeg($image, $filepath, 85);
    imagedestroy($image);
    
    echo "Created: " . basename($filepath) . "\n";
}

// Generate all placeholder images
foreach ($images as $imageName) {
    $filepath = $uploadsDir . '/' . $imageName;
    $productType = explode('-', $imageName)[0];
    createPlaceholderImage($filepath, strtoupper($productType), 400, 400);
}

echo "\nAll placeholder images created successfully!\n";
?>
