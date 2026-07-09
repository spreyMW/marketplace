<?php

namespace App\Models;

use CodeIgniter\Model;

class ProductImageModel extends Model
{
    protected $table = 'product_images';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $allowedFields = ['product_id', 'image_path'];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updationField = null;
    protected $validationRules = [
        'product_id' => 'required|integer',
        'image_path' => 'required|string|max_length[255]',
    ];
    protected $validationMessages = [];
    protected $skipValidation = false;
    protected $cleanValidationRules = true;

    /**
     * Get images by product
     */
    public function getByProduct($productId)
    {
        return $this->where('product_id', $productId)->findAll();
    }

    /**
     * Delete product images
     */
    public function deleteByProduct($productId)
    {
        return $this->where('product_id', $productId)->delete();
    }
}
