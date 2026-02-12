# Backend Activity — Book API (Beginner-Friendly)

## Overview

In this activity you will build an **Express + MongoDB** back-end API from scratch.  
By the end you will have a working REST API that can **Create, Read, Update and Delete** (CRUD) books — a simple library management system.

**How to use this repo:**

| Folder | Purpose |
|---|---|
| `book-api/step0/` | Your **starting point**. Copy this folder and work inside the copy. All routes exist but return placeholder text. |
| `book-api/step1/` – `step4/` | Sample solutions for each iteration. Only look at them **after** you have tried on your own. |
| `book-api/step5/` | The fully working API with all CRUD operations implemented. |

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
| 1 | Create a book | `POST` | `controllers/bookControllers.js` |
| 2 | Get all books | `GET` | `controllers/bookControllers.js` |
| 3 | Delete a book | `DELETE` | `controllers/bookControllers.js` |
| 4 | Get a single book | `GET` | `controllers/bookControllers.js` |
| 5 | Update a book | `PUT` | `controllers/bookControllers.js` |

> **Important:** Commit your work after each iteration.


<!-- ## How You Will Work (Paired)

You work as **two problem-solvers** — you can both talk, think, and type. This is not strict pair-programming; it is collaborative problem-solving.

### Help Ladder (use in order)

When you get stuck:

1. Re-read the instruction and the code you are changing.
2. Ask your partner to explain their approach.
3. Try a tiny experiment (change one thing, test with a REST client).
4. Open the sample solution for that iteration.
5. Ask the teacher.

### Discussion Checkpoints

After **every** iteration, before moving on:

- Partner A explains: "What did we change and why?"
- Partner B points to the exact file and line.
- Both test the endpoint with a REST client (VS Code REST Client, Postman, or curl).

If you cannot explain it, do not move on yet. -->

### Commit Messages (Best Practice)

Use small commits that describe *what* changed. Recommended format:

- `feat(books): implement POST /books to create a new book`
- `feat(books): implement GET /books to fetch all books`
- `feat(books): implement DELETE /books/:bookId`
- `chore: install dependencies`

Rule of thumb: one commit = one idea you can explain in one sentence.

---

## The Book API (Reference)

Here is the API you are building.

**Base URL:** `http://localhost:4000`

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `POST` | `/api/books` | Create a new book | JSON (see below) |
| `GET` | `/api/books` | Get all books | — |
| `GET` | `/api/books/:bookId` | Get a single book by ID | — |
| `PUT` | `/api/books/:bookId` | Update a book by ID | JSON (see below) |
| `DELETE` | `/api/books/:bookId` | Delete a book by ID | — |

**Book JSON shape** (what the API expects and returns):

```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "978-0743273565",
  "availability": {
    "isAvailable": true,
    "borrower": ""
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
   cd backend-labs/book-api/step0
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
   GET http://localhost:4000/api/books
   ```
   You should see the response: `getAllBooks`
   
   This confirms the route exists but the logic is not implemented yet.

**You are done with Iteration 0 when:**

- The server is running on `http://localhost:4000`.
- MongoDB is connected.
- Placeholder routes respond with text like `getAllBooks`, `createBook`, etc.

---

### Iteration 1: Create a Book (`POST`)

**Goal:** Implement the `createBook` controller function so that `POST /api/books` saves a new book to the database.

**File to change:** `controllers/bookControllers.js`

Right now the `createBook` function just returns `res.send("createBook")`. You need to:

1. **Extract the book data from the request body** and create a new document in MongoDB using the `Book` model.

2. **Return the created book** with status `201`.

3. **Handle errors** — if creation fails, return status `400` with an error message.

**Implementation:**

```javascript
// POST /books
const createBook = async (req, res) => {
  try {
    const newBook = await Book.create({ ...req.body });
    res.status(201).json(newBook);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create book", error: error.message });
  }
};
```

**Key concepts:**
- `Book.create({ ...req.body })` — Creates a new document using the Mongoose model
- `res.status(201)` — HTTP 201 means "Created"
- The `try/catch` handles validation errors (e.g., missing required fields)

> **Sample solution (after trying yourself):** [step1/controllers/bookControllers.js](./step1/controllers/bookControllers.js)

**Test your implementation:**

```http
POST http://localhost:4000/api/books
Content-Type: application/json

{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "978-0743273565",
  "availability": {
    "isAvailable": true,
    "borrower": ""
  }
}
```

**You are done with Iteration 1 when:**

- `POST /api/books` returns status `201` with the created book (including `_id`).
- The book is saved in MongoDB (check with MongoDB Compass or a GET request later).
- Sending invalid data (e.g., missing `title`) returns status `400`.

---

### Iteration 2: Get All Books (`GET`)

**Goal:** Implement the `getAllBooks` controller function so that `GET /api/books` returns all books from the database.

**File to change:** `controllers/bookControllers.js`

Right now the `getAllBooks` function just returns `res.send("getAllBooks")`. You need to:

1. **Find all books** in the database using `Book.find({})`.
2. **Sort them** by creation date (newest first).
3. **Return the books array** with status `200`.
4. **Handle errors** — if the query fails, return status `500`.

**Implementation:**

```javascript
// GET /books
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find({}).sort({ createdAt: -1 });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve books" });
  }
};
```

**Key concepts:**
- `Book.find({})` — Finds all documents in the collection
- `.sort({ createdAt: -1 })` — Sorts by `createdAt` field in descending order (newest first)
- `res.status(200)` — HTTP 200 means "OK"
- `res.status(500)` — HTTP 500 means "Internal Server Error"

> **Sample solution (after trying yourself):** [step2/controllers/bookControllers.js](./step2/controllers/bookControllers.js)

**Test your implementation:**

```http
GET http://localhost:4000/api/books
```

**You are done with Iteration 2 when:**

- `GET /api/books` returns an array of all books in the database.
- Books created in Iteration 1 appear in the response.
- If you create multiple books, the newest appears first.

**Discussion Questions:**

- What does the empty object `{}` in `Book.find({})` mean?
- What would happen if you used `.sort({ createdAt: 1 })` instead?

---

### Iteration 3: Delete a Book (`DELETE`)

**Goal:** Implement the `deleteBook` controller function so that `DELETE /api/books/:bookId` removes a book from the database.

**File to change:** `controllers/bookControllers.js`

Right now the `deleteBook` function just returns `res.send("deleteBook")`. You need to:

1. **Get the `bookId`** from the URL parameters.
2. **Validate the ID** — check if it's a valid MongoDB ObjectId.
3. **Find and delete** the book using `Book.findOneAndDelete()`.
4. **Return status `204`** (No Content) if successful.
5. **Handle not found** — return `404` if the book doesn't exist.

**Implementation:**

```javascript
// DELETE /books/:bookId
const deleteBook = async (req, res) => {
  const { bookId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: "Invalid book ID" });
  }

  try {
    const deletedBook = await Book.findOneAndDelete({ _id: bookId });
    if (deletedBook) {
      res.status(204).send(); // 204 No Content
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to delete book" });
  }
};
```

**Key concepts:**
- `req.params.bookId` — Extracts the `:bookId` from the URL
- `mongoose.Types.ObjectId.isValid()` — Validates that the ID is a proper MongoDB ObjectId
- `Book.findOneAndDelete({ _id: bookId })` — Finds and deletes in one operation
- `res.status(204).send()` — HTTP 204 means "No Content" (success, but no body to return)
- `res.status(404)` — HTTP 404 means "Not Found"

> **Sample solution (after trying yourself):** [step3/controllers/bookControllers.js](./step3/controllers/bookControllers.js)

**Test your implementation:**

First, get a book ID from `GET /api/books`, then:

```http
DELETE http://localhost:4000/api/books/YOUR_BOOK_ID_HERE
```

**You are done with Iteration 3 when:**

- `DELETE /api/books/:bookId` returns status `204` when successful.
- The book is actually removed from the database (verify with GET /api/books).
- Deleting a non-existent ID returns status `404`.
- Using an invalid ID format returns status `400`.

---

### Iteration 4: Get a Single Book (`GET`)

**Goal:** Implement the `getBookById` controller function so that `GET /api/books/:bookId` returns one specific book.

**File to change:** `controllers/bookControllers.js`

Right now the `getBookById` function just returns `res.send("getBookById")`. You need to:

1. **Get the `bookId`** from the URL parameters.
2. **Validate the ID** — check if it's a valid MongoDB ObjectId.
3. **Find the book** using `Book.findById()`.
4. **Return the book** with status `200`, or `404` if not found.

**Implementation:**

```javascript
// GET /books/:bookId
const getBookById = async (req, res) => {
  const { bookId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: "Invalid book ID" });
  }

  try {
    const book = await Book.findById(bookId);
    if (book) {
      res.status(200).json(book);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve book" });
  }
};
```

**Key concepts:**
- `Book.findById(bookId)` — Shorthand for finding by `_id`
- This pattern is very similar to `deleteBook`, but we return the book instead of deleting it

> **Sample solution (after trying yourself):** [step4/controllers/bookControllers.js](./step4/controllers/bookControllers.js)

**Test your implementation:**

```http
GET http://localhost:4000/api/books/YOUR_BOOK_ID_HERE
```

**You are done with Iteration 4 when:**

- `GET /api/books/:bookId` returns the book with status `200`.
- Using a non-existent ID returns status `404`.
- Using an invalid ID format returns status `400`.

**Discussion Questions:**

- What's the difference between `findById()` and `findOne({ _id: id })`?
- Why do we validate the ObjectId before querying?

---

### Iteration 5: Update a Book (`PUT`)

**Goal:** Implement the `updateBook` controller function so that `PUT /api/books/:bookId` updates an existing book.

**File to change:** `controllers/bookControllers.js`

Right now the `updateBook` function just returns `res.send("updateBook")`. You need to:

1. **Get the `bookId`** from the URL parameters.
2. **Validate the ID** — check if it's a valid MongoDB ObjectId.
3. **Find and update** the book using `Book.findOneAndUpdate()`.
4. **Return the updated book** with status `200`, or `404` if not found.

**Implementation:**

```javascript
// PUT /books/:bookId
const updateBook = async (req, res) => {
  const { bookId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: "Invalid book ID" });
  }

  try {
    const updatedBook = await Book.findOneAndUpdate(
      { _id: bookId },
      { ...req.body },
      { returnDocument: "after" }
    );
    if (updatedBook) {
      res.status(200).json(updatedBook);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to update book" });
  }
};
```

**Key concepts:**
- `Book.findOneAndUpdate(filter, update, options)` — Finds a document, updates it, and returns it
- `{ returnDocument: "after" }` — Returns the document **after** the update (default is before)
- `{ ...req.body }` — Spreads all fields from the request body as the update

> **Sample solution (after trying yourself):** [step5/controllers/bookControllers.js](./step5/controllers/bookControllers.js)

**Test your implementation:**

```http
PUT http://localhost:4000/api/books/YOUR_BOOK_ID_HERE
Content-Type: application/json

{
  "title": "Updated Book Title",
  "author": "Updated Author",
  "isbn": "978-0000000000",
  "availability": {
    "isAvailable": false,
    "borrower": "John Doe"
  }
}
```

**You are done with Iteration 5 when:**

- `PUT /api/books/:bookId` returns the updated book with status `200`.
- The changes persist in the database (verify with GET).
- Using a non-existent ID returns status `404`.
- Using an invalid ID format returns status `400`.

---

## Summary

Congratulations! You have built a complete REST API with all CRUD operations:

| Operation | HTTP Method | Endpoint | Status Codes |
|---|---|---|---|
| Create | `POST` | `/api/books` | 201, 400 |
| Read all | `GET` | `/api/books` | 200, 500 |
| Read one | `GET` | `/api/books/:bookId` | 200, 400, 404, 500 |
| Update | `PUT` | `/api/books/:bookId` | 200, 400, 404, 500 |
| Delete | `DELETE` | `/api/books/:bookId` | 204, 400, 404, 500 |

**Next steps to explore:**
- Add request validation with a library like `express-validator` or `joi`
- Add authentication with JWT
- Add pagination to `GET /api/books`
- Write automated tests with Jest and Supertest
