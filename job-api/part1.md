# Backend Pair Activity — Job API (Beginner-Friendly)

## Overview

In this activity you will build an **Express + MongoDB** back-end API from scratch.  
By the end you will have a working REST API that can **Create, Read, Update and Delete** (CRUD) job listings.

**How to use this repo:**

| Folder | Purpose |
|---|---|
| `job-api/step0/` | Your **starting point**. Copy this folder and work inside the copy. All routes exist but return placeholder text. |
| `job-api/step1/` – `step4/` | Sample solutions for each iteration. Only look at them **after** you have tried on your own. |
| `job-api/step5/` | The fully working API with all CRUD operations implemented. |

### What You Will Learn

- How to create an Express REST API with proper route handlers.
- How to use **Mongoose** to interact with MongoDB (create, find, update, delete).
- How to validate MongoDB ObjectIds before querying.
- How to return proper HTTP status codes (`200`, `201`, `204`, `400`, `404`, `500`).
- How to structure a Node.js backend with **controllers**, **routes**, **models**, and **middleware**.

### Activity Structure

There are **5 iterations** (plus a setup step). Each iteration implements one CRUD operation:

| Iteration | Feature | HTTP Method | File You Will Change |
|---|---|---|---|
| 0 | Setup | — | — |
| 1 | Create a job | `POST` | `controllers/jobControllers.js` |
| 2 | Get all jobs | `GET` | `controllers/jobControllers.js` |
| 3 | Delete a job | `DELETE` | `controllers/jobControllers.js` |
| 4 | Get a single job | `GET` | `controllers/jobControllers.js` |
| 5 | Update a job | `PUT` | `controllers/jobControllers.js` |

> **Important:** Commit your work after each iteration.

### Commit Messages (Best Practice)

Use small commits that describe *what* changed. Recommended format:

- `feat(jobs): implement POST /jobs to create a new job`
- `feat(jobs): implement GET /jobs to fetch all jobs`
- `feat(jobs): implement DELETE /jobs/:jobId`
- `chore: install dependencies`

Rule of thumb: one commit = one idea you can explain in one sentence.

---

## The Job API (Reference)

Here is the API you are building.

**Base URL:** `http://localhost:4000`

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `POST` | `/api/jobs` | Create a new job | JSON (see below) |
| `GET` | `/api/jobs` | Get all jobs | — |
| `GET` | `/api/jobs/:jobId` | Get a single job by ID | — |
| `PUT` | `/api/jobs/:jobId` | Update a job by ID | JSON (see below) |
| `DELETE` | `/api/jobs/:jobId` | Delete a job by ID | — |

**Job JSON shape** (what the API expects and returns):

```json
{
  "title": "Senior React Developer",
  "type": "Full-Time",
  "description": "We are seeking a talented Front-End Developer to join our team in Boston, MA.",
  "company": {
    "name": "NewTek Solutions",
    "contactEmail": "contact@newteksolutions.com",
    "contactPhone": "555-555-5555"
  }
}
```

> **Tip:** Test each endpoint with VS Code REST Client, Postman, or `curl` as you build it.

---

## Instructions

### Iteration 0: Setup

1. Clone [the starter repository](https://github.com/tx00-resources-en/w5-exam-practice-backend) into a separate folder.
   - After cloning, **delete** the `.git` directory so you can start your own Git history (`git init`).

2. **Prepare the environment:**
   ```bash
   cd backend-labs/job-api/step0
   cp .env.example .env      # create your .env file (edit MONGO_URI if needed)
   npm install
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```
   You should see `Server running on port 4000` and `MongoDB Connected`.

4. **Test the placeholder routes:**
   
   Open a REST client and make a request:
   ```http
   GET http://localhost:4000/api/jobs
   ```
   You should see the response: `getAllJobs`
   
   This confirms the route exists but the logic is not implemented yet.

**You are done with Iteration 0 when:**

- The server is running on `http://localhost:4000`.
- MongoDB is connected.
- Placeholder routes respond with text like `getAllJobs`, `createJob`, etc.

---

### Iteration 1: Create a Job (`POST`)

**Goal:** Implement the `createJob` controller function so that `POST /api/jobs` saves a new job to the database.

**File to change:** `controllers/jobControllers.js`

Right now the `createJob` function just returns `res.send("createJob")`. You need to:

1. **Extract the job data from the request body** and create a new document in MongoDB using the `Job` model.

2. **Return the created job** with status `201`.

3. **Handle errors** — if creation fails, return status `400` with an error message.

**Implementation:**

```javascript
// POST /jobs
const createJob = async (req, res) => {
  try {
    const newJob = await Job.create({ ...req.body });
    res.status(201).json(newJob);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create job", error: error.message });
  }
};
```

**Key concepts:**
- `Job.create({ ...req.body })` — Creates a new document using the Mongoose model
- `res.status(201)` — HTTP 201 means "Created"
- The `try/catch` handles validation errors (e.g., missing required fields)

> **Sample solution (after trying yourself):** [step1/controllers/jobControllers.js](./step1/controllers/jobControllers.js)

**Test your implementation:**

```http
POST http://localhost:4000/api/jobs
Content-Type: application/json

{
  "title": "Senior React Developer",
  "type": "Full-Time",
  "description": "We are seeking a talented developer.",
  "company": {
    "name": "NewTek Solutions",
    "contactEmail": "contact@newteksolutions.com",
    "contactPhone": "555-555-5555"
  }
}
```

**You are done with Iteration 1 when:**

- `POST /api/jobs` returns status `201` with the created job (including `_id`).
- The job is saved in MongoDB (check with MongoDB Compass or a GET request later).
- Sending invalid data (e.g., missing `title`) returns status `400`.

---

### Iteration 2: Get All Jobs (`GET`)

**Goal:** Implement the `getAllJobs` controller function so that `GET /api/jobs` returns all jobs from the database.

**File to change:** `controllers/jobControllers.js`

Right now the `getAllJobs` function just returns `res.send("getAllJobs")`. You need to:

1. **Find all jobs** in the database using `Job.find({})`.
2. **Sort them** by creation date (newest first).
3. **Return the jobs array** with status `200`.
4. **Handle errors** — if the query fails, return status `500`.

**Implementation:**

```javascript
//GET /jobs
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({}).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve jobs" });
  }
};
```

**Key concepts:**
- `Job.find({})` — Finds all documents in the collection
- `.sort({ createdAt: -1 })` — Sorts by `createdAt` field in descending order (newest first)
- `res.status(200)` — HTTP 200 means "OK"
- `res.status(500)` — HTTP 500 means "Internal Server Error"

> **Sample solution (after trying yourself):** [step2/controllers/jobControllers.js](./step2/controllers/jobControllers.js)

**Test your implementation:**

```http
GET http://localhost:4000/api/jobs
```

**You are done with Iteration 2 when:**

- `GET /api/jobs` returns an array of all jobs in the database.
- Jobs created in Iteration 1 appear in the response.
- If you create multiple jobs, the newest appears first.

**Discussion Questions:**

- What does the empty object `{}` in `Job.find({})` mean?
- What would happen if you used `.sort({ createdAt: 1 })` instead?

---

### Iteration 3: Delete a Job (`DELETE`)

**Goal:** Implement the `deleteJob` controller function so that `DELETE /api/jobs/:jobId` removes a job from the database.

**File to change:** `controllers/jobControllers.js`

Right now the `deleteJob` function just returns `res.send("deleteJob")`. You need to:

1. **Get the `jobId`** from the URL parameters.
2. **Validate the ID** — check if it's a valid MongoDB ObjectId.
3. **Find and delete** the job using `Job.findOneAndDelete()`.
4. **Return status `204`** (No Content) if successful.
5. **Handle not found** — return `404` if the job doesn't exist.

**Implementation:**

```javascript
// DELETE /jobs/:jobId
const deleteJob = async (req, res) => {
  const { jobId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({ message: "Invalid job ID" });
  }

  try {
    const deletedJob = await Job.findOneAndDelete({ _id: jobId });
    if (deletedJob) {
      res.status(204).send(); // 204 No Content
    } else {
      res.status(404).json({ message: "Job not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to delete job" });
  }
};
```

**Key concepts:**
- `req.params.jobId` — Extracts the `:jobId` from the URL
- `mongoose.Types.ObjectId.isValid()` — Validates that the ID is a proper MongoDB ObjectId
- `Job.findOneAndDelete({ _id: jobId })` — Finds and deletes in one operation
- `res.status(204).send()` — HTTP 204 means "No Content" (success, but no body to return)
- `res.status(404)` — HTTP 404 means "Not Found"

> **Sample solution (after trying yourself):** [step3/controllers/jobControllers.js](./step3/controllers/jobControllers.js)

**Test your implementation:**

First, get a job ID from `GET /api/jobs`, then:

```http
DELETE http://localhost:4000/api/jobs/YOUR_JOB_ID_HERE
```

**You are done with Iteration 3 when:**

- `DELETE /api/jobs/:jobId` returns status `204` when successful.
- The job is actually removed from the database (verify with GET /api/jobs).
- Deleting a non-existent ID returns status `404`.
- Using an invalid ID format returns status `400`.

---

### Iteration 4: Get a Single Job (`GET`)

**Goal:** Implement the `getJobById` controller function so that `GET /api/jobs/:jobId` returns one specific job.

**File to change:** `controllers/jobControllers.js`

Right now the `getJobById` function just returns `res.send("getJobById")`. You need to:

1. **Get the `jobId`** from the URL parameters.
2. **Validate the ID** — check if it's a valid MongoDB ObjectId.
3. **Find the job** using `Job.findById()`.
4. **Return the job** with status `200`, or `404` if not found.

**Implementation:**

```javascript
// GET /jobs/:jobId
const getJobById = async (req, res) => {
  const { jobId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({ message: "Invalid job ID" });
  }

  try {
    const job = await Job.findById(jobId);
    if (job) {
      res.status(200).json(job);
    } else {
      res.status(404).json({ message: "Job not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve job" });
  }
};
```

**Key concepts:**
- `Job.findById(jobId)` — Shorthand for finding by `_id`
- This pattern is very similar to `deleteJob`, but we return the job instead of deleting it

> **Sample solution (after trying yourself):** [step4/controllers/jobControllers.js](./step4/controllers/jobControllers.js)

**Test your implementation:**

```http
GET http://localhost:4000/api/jobs/YOUR_JOB_ID_HERE
```

**You are done with Iteration 4 when:**

- `GET /api/jobs/:jobId` returns the job with status `200`.
- Using a non-existent ID returns status `404`.
- Using an invalid ID format returns status `400`.

**Discussion Questions:**

- What's the difference between `findById()` and `findOne({ _id: id })`?
- Why do we validate the ObjectId before querying?

---

### Iteration 5: Update a Job (`PUT`)

**Goal:** Implement the `updateJob` controller function so that `PUT /api/jobs/:jobId` updates an existing job.

**File to change:** `controllers/jobControllers.js`

Right now the `updateJob` function just returns `res.send("updateJob")`. You need to:

1. **Get the `jobId`** from the URL parameters.
2. **Validate the ID** — check if it's a valid MongoDB ObjectId.
3. **Find and update** the job using `Job.findOneAndUpdate()`.
4. **Return the updated job** with status `200`, or `404` if not found.

**Implementation:**

```javascript
// PUT /jobs/:jobId
const updateJob = async (req, res) => {
  const { jobId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({ message: "Invalid job ID" });
  }

  try {
    const updatedJob = await Job.findOneAndUpdate(
      { _id: jobId },
      { ...req.body },
      { returnDocument: 'after' }
    );
    if (updatedJob) {
      res.status(200).json(updatedJob);
    } else {
      res.status(404).json({ message: "Job not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to update job" });
  }
};
```

**Key concepts:**
- `Job.findOneAndUpdate(filter, update, options)` — Finds a document, updates it, and returns it
- `{ returnDocument: 'after' }` — Returns the document **after** the update (default is before)
- `{ ...req.body }` — Spreads all fields from the request body as the update

> **Sample solution (after trying yourself):** [step5/controllers/jobControllers.js](./step5/controllers/jobControllers.js)

**Test your implementation:**

```http
PUT http://localhost:4000/api/jobs/YOUR_JOB_ID_HERE
Content-Type: application/json

{
  "title": "Updated Job Title",
  "type": "Part-Time",
  "description": "Updated description.",
  "company": {
    "name": "Updated Company",
    "contactEmail": "updated@example.com",
    "contactPhone": "555-000-0000"
  }
}
```

**You are done with Iteration 5 when:**

- `PUT /api/jobs/:jobId` returns the updated job with status `200`.
- The changes persist in the database (verify with GET).
- Using a non-existent ID returns status `404`.
- Using an invalid ID format returns status `400`.

---

## Summary

Congratulations! You have built a complete REST API with all CRUD operations:

| Operation | HTTP Method | Endpoint | Status Codes |
|---|---|---|---|
| Create | `POST` | `/api/jobs` | 201, 400 |
| Read all | `GET` | `/api/jobs` | 200, 500 |
| Read one | `GET` | `/api/jobs/:jobId` | 200, 400, 404, 500 |
| Update | `PUT` | `/api/jobs/:jobId` | 200, 400, 404, 500 |
| Delete | `DELETE` | `/api/jobs/:jobId` | 204, 400, 404, 500 |

**Next steps to explore:**
- Add request validation with a library like `express-validator` or `joi`
- Add authentication with JWT
- Add pagination to `GET /api/jobs`
- Write automated tests with Jest and Supertest
