const Book = require("../models/bookModel");
const mongoose = require("mongoose");

// GET /books
const getAllBooks = async (req, res) => {
  res.send("getAllBooks");
};

// POST /books
const createBook = async (req, res) => {
  res.send("createBook");
};

// GET /books/:bookId
const getBookById = async (req, res) => {
  res.send("getBookById");
};

// PUT /books/:bookId
const updateBook = async (req, res) => {
  res.send("updateBook");
};

// DELETE /books/:bookId
const deleteBook = async (req, res) => {
  res.send("deleteBook");
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};
