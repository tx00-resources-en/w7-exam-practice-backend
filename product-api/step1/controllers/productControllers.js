const Product = require('../models/productModel');
const mongoose = require('mongoose');

// GET /api/products
const getAllProducts = async (req, res) => {
  res.send("getAllProducts");
};

// POST /api/products
const createProduct = async (req, res) => {
  const { title, category, description, price, stockQuantity, supplier } = req.body;
  try {
    const product = await Product.create({ title, category, description, price, stockQuantity, supplier });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// GET /api/products/:productId
const getProductById = async (req, res) => {
  res.send("getProductById");
};

// PUT /api/products/:productId
const updateProduct = async (req, res) => {
  res.send("updateProduct");
};

// DELETE /api/products/:productId
const deleteProduct = async (req, res) => {
  res.send("deleteProduct");
};

module.exports = {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
};
