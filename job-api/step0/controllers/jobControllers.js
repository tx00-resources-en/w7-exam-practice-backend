const Job = require("../models/jobModel");
const mongoose = require("mongoose");

//GET / jobs;
const getAllJobs = async (req, res) => {
  res.send("getAllJobs");
};

// POST /jobs
const createJob = async (req, res) => {
  res.send("createJob");
};

// GET /jobs/:jobId
const getJobById = async (req, res) => {
  res.send("getJobById");
};

// PUT /jobs/:jobId
const updateJob = async (req, res) => {
  res.send("updateJob");
};

// DELETE /jobs/:jobId
const deleteJob = async (req, res) => {
  res.send("deleteJob");
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};
