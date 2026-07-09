<?php

namespace App\Models;

use CodeIgniter\Model;

class ProductModel extends Model
{
    protected $table = 'products';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $allowedFields = ['name', 'slug', 'description', 'price', 'stock', 'category', 'featured_image', 'image', 'status'];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
    protected $validationRules = [
        'name' => 'required|string|max_length[255]',
        'slug' => 'string|max_length[255]',
        'description' => 'required|string',
        'price' => 'required|decimal',
        'stock' => 'required|integer',
        'category' => 'required|string|max_length[255]',
        'featured_image' => 'if_exist|string|max_length[255]',
        'image' => 'if_exist|string|max_length[255]',
        'status' => 'in_list[active,inactive]',
    ];
    protected $validationMessages = [];
    protected $skipValidation = false;
    protected $cleanValidationRules = true;

    /**
     * Get active products
     */
    public function getActive()
    {
        return $this->findAll();
    }

    /**
     * Get product with images
     */
    public function getWithImages($id)
    {
        $product = $this->find($id);
        if ($product) {
            $productImageModel = new ProductImageModel();
            $product['images'] = $productImageModel->getByProduct($id);
        }
        return $product;
    }

    /**
     * Search products
     */
    public function search($keyword)
    {
        return $this->like('name', $keyword)
                    ->orLike('description', $keyword)
                    ->findAll();
    }
}

