# Backend Pair Activity — Book API Part 2 (Authentication & Route Protection)

## Overview

In Part 1 you built a complete CRUD API for book listings. In Part 2 you will add **user authentication** (sign up and log in) and then **protect certain routes** so that only logged-in users can create, update, or delete books.

**How to use this repo:**

| Folder | Purpose |
|---|---|
| `book-api/step5/` | Your **starting point** for Part 2. This is the fully working CRUD API from Part 1. |
| `book-api/step6/` | Sample solution for Iteration 6 (user registration & login). Only look at it **after** you have tried on your own. |
| `book-api/step7/` | Sample solution for Iteration 7 (route protection). Only look at it **after** you have tried on your own. |

### What You Will Learn

- How to create a **User model** with Mongoose.
- How to **hash passwords** with `bcryptjs` so they are never stored in plain text.
- How to **generate and verify JSON Web Tokens (JWT)** for stateless authentication.
- How to write an **authentication middleware** that protects routes.
- How to **associate resources with users** (each book belongs to the user who created it).
- How to selectively protect only the routes that need authentication.

### Activity Structure

| Iteration | Feature | Files You Will Change / Create |
|---|---|---|
| 6 | User registration & login | `models/userModel.js`, `controllers/userControllers.js`, `routes/userRouter.js`, `app.js`, `package.json`, `.env` |
| 7 | Protect book routes | `models/bookModel.js`, `controllers/bookControllers.js`, `routes/bookRouter.js` |

> **Important:** Commit your work after each iteration.

### Commit Messages (Best Practice)

- `feat(users): add User model with hashed password`
- `feat(users): implement POST /users/signup and /users/login`
- `feat(users): register user routes in app.js`
- `feat(books): protect POST, PUT, DELETE routes with auth middleware`
- `feat(books): associate books with the authenticated user`

---

## Background: How JWT Authentication Works

Before you start coding, here is a brief overview of the authentication flow you are about to implement:

1. **Sign up** — The client sends `name`, `email`, `password`, etc. The server hashes the password, saves the user, and returns a **JWT token**.
2. **Log in** — The client sends `email` and `password`. The server verifies the credentials and returns a **JWT token**.
3. **Authenticated requests** — The client includes the token in the `Authorization` header (`Bearer <token>`). A middleware verifies the token and attaches the user to `req.user`.
4. **Protected routes** — Any route placed *after* the auth middleware can only be accessed with a valid token.

```
Client                          Server
  |                               |
  |  POST /api/users/signup       |
  |  { email, password, ... }     |
  | ----------------------------> |
  |                               |  hash password, save user
  |  { email, token }             |
  | <---------------------------- |
  |                               |
  |  POST /api/books              |
  |  Authorization: Bearer <token>|
  | ----------------------------> |
  |                               |  verify token → req.user
  |                               |  create book with user_id
  |  { book }                     |
  | <---------------------------- |
```

---

## The User API (Reference)

Here are the new endpoints you are adding.

**Base URL:** `http://localhost:4000`

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `POST` | `/api/users/signup` | Register a new user | JSON (see below) |
| `POST` | `/api/users/login` | Log in an existing user | JSON (see below) |

**Signup JSON shape:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "phone_number": "555-123-4567",
  "gender": "Male",
  "date_of_birth": "1990-01-15",
  "membership_status": "Active"
}
```

**Login JSON shape:**

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Successful response (both signup and login):**

```json
{
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Instructions

### Iteration 6: User Registration & Login

**Goal:** Add user signup and login so that clients can create accounts and receive JWT tokens.

This iteration involves **installing new dependencies**, creating **three new files**, and updating **two existing files**:

1. `package.json` — Add `bcryptjs` and `jsonwebtoken` dependencies
2. `.env` — Add a `SECRET` variable for signing tokens
3. `models/userModel.js` — The User schema
4. `controllers/userControllers.js` — Signup and login logic
5. `routes/userRouter.js` — User routes
6. `app.js` — Register the new user routes

---

#### Step 6a: Install New Dependencies

The step5 `package.json` does not include the authentication libraries. You need to install them:

```bash
npm install bcryptjs jsonwebtoken
```

This adds:
- **`bcryptjs`** — For hashing and comparing passwords.
- **`jsonwebtoken`** — For creating and verifying JWT tokens.

---

#### Step 6b: Add `SECRET` to `.env`

**File to change:** `.env`

Add a `SECRET` variable that will be used as the signing key for JWT tokens. You can generate a random hex string at [browserling.com/tools/random-hex](https://www.browserling.com/tools/random-hex) or use any long random string.

**Add this line to your `.env` file:**

```dotenv
SECRET=f9d1e69365fa3f662ffd4b4132ef8f94077d496ed6508760371495a7debf1cbc
```

> **Important:** Never commit your `.env` file. The `.env.example` file shows what variables are needed without revealing real values.

---

#### Step 6c: Create the User Model

**File to create:** `models/userModel.js`

Define a Mongoose schema for the user. All fields are required. The `email` field should be `unique` to prevent duplicate accounts.

**Implementation:**

```javascript
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    date_of_birth: {
      type: Date,
      required: true,
    },
    membership_status: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("User", userSchema);
```

**Key concepts:**
- `unique: true` on the `email` field — MongoDB will reject duplicate emails at the database level.
- `timestamps: true` — Mongoose automatically adds `createdAt` and `updatedAt` fields.
- `versionKey: false` — Disables the `__v` field that Mongoose adds by default.
- The `password` field stores the **hashed** password, never the plain text. The hashing happens in the controller.

---

#### Step 6d: Create the User Controller

**File to create:** `controllers/userControllers.js`

This file contains three functions:

1. `generateToken` — A helper that creates a JWT from the user's `_id`.
2. `signupUser` — Validates input, checks for duplicates, hashes the password, creates the user, and returns a token.
3. `loginUser` — Finds the user by email, compares the password, and returns a token.

**Implementation:**

```javascript
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT
const generateToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, {
    expiresIn: "3d",
  });
};

// @desc    Register new user
// @route   POST /api/users/signup
// @access  Public
const signupUser = async (req, res) => {
  const {
    name,
    email,
    password,
    phone_number,
    gender,
    date_of_birth,
    membership_status,
  } = req.body;
  try {
    if (
      !name ||
      !email ||
      !password ||
      !phone_number ||
      !gender ||
      !date_of_birth ||
      !membership_status
    ) {
      res.status(400);
      throw new Error("Please add all fields");
    }
    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone_number,
      gender,
      date_of_birth,
      membership_status,
    });

    if (user) {
      const token = generateToken(user._id);
      res.status(201).json({ email, token });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user._id);
      res.status(200).json({ email, token });
    } else {
      res.status(400);
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  signupUser,
  loginUser,
};
```

**Key concepts:**
- `jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" })` — Creates a token that contains the user's `_id` and expires in 3 days. The `SECRET` from `.env` is the signing key.
- `bcrypt.genSalt(10)` — Generates a salt with 10 rounds. Higher numbers are more secure but slower.
- `bcrypt.hash(password, salt)` — Hashes the plain-text password. The resulting string is safe to store in the database.
- `bcrypt.compare(password, user.password)` — Compares a plain-text password with a hashed one. Returns `true` if they match.
- We **never** return the password in the response — only the `email` and `token`.
- The `try/catch` block catches both our thrown errors (e.g., "User already exists") and unexpected errors.

---

#### Step 6e: Create the User Router

**File to create:** `routes/userRouter.js`

Wire up the two public endpoints: signup and login.

**Implementation:**

```javascript
const express = require("express");
const router = express.Router();

const { loginUser, signupUser } = require("../controllers/userControllers");

// login route
router.post("/login", loginUser);

// signup route
router.post("/signup", signupUser);

module.exports = router;
```

**Key concepts:**
- Both routes use `POST` because they receive data in the request body (credentials).
- These routes are **public** — no authentication is required to sign up or log in.

---

#### Step 6f: Register User Routes in `app.js`

**File to change:** `app.js`

Import the user router and mount it on `/api/users`.

**What to add:**

```javascript
const userRouter = require("./routes/userRouter");
```

Add this line near the top where `bookRouter` is imported. Then register the route **before** the error-handling middleware:

```javascript
app.use("/api/users", userRouter);
```

**The updated `app.js` should look like this:**

```javascript
require("dotenv").config();
const express = require("express");
const app = express();
const bookRouter = require("./routes/bookRouter");
const userRouter = require("./routes/userRouter");
const { unknownEndpoint, errorHandler } = require("./middleware/customMiddleware");
const connectDB = require("./config/db");
const cors = require("cors");

// Middlewares
app.use(cors());
app.use(express.json());

connectDB();

// Use the bookRouter for all "/books" routes
app.use("/api/books", bookRouter);
// Use the userRouter for all "/users" routes
app.use("/api/users", userRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;
```

**Key concepts:**
- Each router is mounted at a specific path prefix. When a request comes in for `/api/users/signup`, Express strips `/api/users` and passes `/signup` to the user router.
- The order matters: route handlers must come **before** `unknownEndpoint` and `errorHandler`.

> **Sample solution (after trying yourself):** [step6/controllers/userControllers.js](./step6/controllers/userControllers.js), [step6/models/userModel.js](./step6/models/userModel.js), [step6/routes/userRouter.js](./step6/routes/userRouter.js), [step6/app.js](./step6/app.js)

---

#### Test Your Implementation

**1. Sign up a new user:**

```http
POST http://localhost:4000/api/users/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "phone_number": "555-123-4567",
  "gender": "Male",
  "date_of_birth": "1990-01-15",
  "membership_status": "Active"
}
```

Expected response (status `201`):
```json
{
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiI..."
}
```

**2. Try signing up with the same email again:**

You should get status `400` with `"User already exists"`.

**3. Try signing up with missing fields:**

```http
POST http://localhost:4000/api/users/signup
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

You should get status `400` with `"Please add all fields"`.

**4. Log in with valid credentials:**

```http
POST http://localhost:4000/api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secret123"
}
```

Expected response (status `200`):
```json
{
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiI..."
}
```

**5. Log in with wrong password:**

```http
POST http://localhost:4000/api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "wrongpassword"
}
```

You should get status `400` with `"Invalid credentials"`.

> **Tip:** Save the `token` from a successful signup or login — you will need it in Iteration 7 to test protected routes.

**You are done with Iteration 6 when:**

- `POST /api/users/signup` creates a new user and returns status `201` with `{ email, token }`.
- Duplicate emails are rejected with status `400`.
- Missing fields are rejected with status `400`.
- `POST /api/users/login` returns status `200` with `{ email, token }` for valid credentials.
- Invalid credentials return status `400`.
- The password is **hashed** in the database (check with MongoDB Compass — you should see a long string, not the plain password).

**Discussion Questions:**

- Why do we hash the password instead of storing it directly?
- What information is stored inside the JWT token? (Hint: try pasting your token at [jwt.io](https://jwt.io))
- Why does `generateToken` only include `_id` in the payload and not the email or password?

---

### Iteration 7: Protect Book Routes with Authentication

**Goal:** Require authentication for creating, updating, and deleting books. Keep reading all books and reading a single book as public endpoints. Associate each new book with the user who created it.

This iteration involves changes to **three existing files** and creating **one new file**:

1. `middleware/requireAuth.js` — **New** — Authentication middleware
2. `models/bookModel.js` — Add a `user_id` field
3. `controllers/bookControllers.js` — Update `createBook` to save the user's ID
4. `routes/bookRouter.js` — Apply the `requireAuth` middleware to protected routes

---

#### Step 7a: Create the `requireAuth` Middleware

**File to create:** `middleware/requireAuth.js`

This middleware reads the JWT from the `Authorization` header, verifies it, and attaches the user to `req.user`.

**Implementation:**

```javascript
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const requireAuth = async (req, res, next) => {
  // verify user is authenticated
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const token = authorization.split(" ")[1];

  try {
    const { _id } = jwt.verify(token, process.env.SECRET);

    req.user = await User.findOne({ _id }).select("_id");
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Request is not authorized" });
  }
};

module.exports = requireAuth;
```

**How it works:**
1. It reads the `Authorization` header from the request.
2. It expects the format `Bearer <token>` and extracts the token part.
3. It verifies the token using `jwt.verify()` with the same `SECRET` used to sign it.
4. If valid, it finds the user in the database and attaches `req.user` (containing `_id`).
5. It calls `next()` to pass control to the next middleware or route handler.
6. If the token is missing or invalid, it returns `401 Unauthorized`.

---

#### Step 7b: Add `user_id` to the Book Model

**File to change:** `models/bookModel.js`

Add a `user_id` field that references the User model. This creates a relationship between books and users.

**What to add inside the schema:**

```javascript
user_id: {
  type: mongoose.Schema.Types.ObjectId,
  required: true,
  ref: "User",
},
```

**The updated `bookModel.js` should look like this:**

```javascript
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String, required: true },
    availability: {
      isAvailable: { type: Boolean, required: true },
      borrower: { type: String },
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

// add virtual field id
bookSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    return ret;
  },
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
```

**Key concepts:**
- `mongoose.Schema.Types.ObjectId` — Stores a reference to another document's `_id`.
- `ref: "User"` — Tells Mongoose this references the `User` model. This enables `.populate()` if you need it later.
- `required: true` — Every book must belong to a user. This means creating a book without authentication will fail at the database level.

---

#### Step 7c: Update `createBook` to Save the User ID

**File to change:** `controllers/bookControllers.js`

When a user creates a book, the `requireAuth` middleware has already verified the token and attached the user to `req.user`. You need to extract `req.user._id` and include it when creating the book.

**Updated `createBook` function:**

```javascript
// Create a new book
const createBook = async (req, res) => {
  try {
    const user_id = req.user._id;
    const newBook = new Book({
      ...req.body,
      user_id,
    });
    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).json({ error: "Server Error" });
  }
};
```

**Key concepts:**
- `req.user._id` — This is available because the `requireAuth` middleware runs before this controller.
- `{ ...req.body, user_id }` — Spreads the request body and adds the `user_id` field. This ensures the user ID comes from the verified token, not from the request body (which could be faked).
- We use `new Book({ ... })` and `await newBook.save()` instead of `Book.create()` — both approaches work, this is just an alternative pattern.

> **Sample solution (after trying yourself):** [step7/controllers/bookControllers.js](./step7/controllers/bookControllers.js)

---

#### Step 7d: Protect Routes in the Book Router

**File to change:** `routes/bookRouter.js`

Import the `requireAuth` middleware and apply it to the routes that should be protected. In this API:

- `GET /api/books` — **Public** (anyone can browse books)
- `GET /api/books/:bookId` — **Public** (anyone can view a book)
- `POST /api/books` — **Protected** (only logged-in users can create books)
- `PUT /api/books/:bookId` — **Protected** (only logged-in users can update books)
- `DELETE /api/books/:bookId` — **Protected** (only logged-in users can delete books)

**Updated `bookRouter.js`:**

```javascript
const express = require("express");
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} = require("../controllers/bookControllers");
const requireAuth = require("../middleware/requireAuth");
const router = express.Router();

// Public routes (no authentication needed)
router.get("/", getAllBooks);
router.get("/:bookId", getBookById);

// All routes below this line require authentication
router.use(requireAuth);

// Protected routes
router.post("/", createBook);
router.put("/:bookId", updateBook);
router.delete("/:bookId", deleteBook);

module.exports = router;
```

**Key concepts:**
- `router.use(requireAuth)` — This applies the middleware to **all routes defined after it** in this router. Routes defined before this line are not affected.
- Order matters! The two `GET` routes are placed **above** `router.use(requireAuth)` so they remain public. The `POST`, `PUT`, and `DELETE` routes are placed **below** so they are protected.
- This is called a **middleware waterfall** — Express processes middleware in the order they are defined.

> **Sample solution (after trying yourself):** [step7/routes/bookRouter.js](./step7/routes/bookRouter.js)

---

#### Test Your Implementation

**1. Try creating a book without a token (should fail):**

```http
POST http://localhost:4000/api/books
Content-Type: application/json

{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "978-0-7432-7356-5",
  "availability": {
    "isAvailable": true,
    "borrower": ""
  }
}
```

Expected response (status `401`):
```json
{
  "error": "Authorization token required"
}
```

**2. Log in to get a token:**

```http
POST http://localhost:4000/api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secret123"
}
```

Copy the `token` from the response.

**3. Create a book with the token (should succeed):**

```http
POST http://localhost:4000/api/books
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE

{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "978-0-7432-7356-5",
  "availability": {
    "isAvailable": true,
    "borrower": ""
  }
}
```

Expected response (status `201`): The created book, including a `user_id` field matching the logged-in user.

**4. Verify GET routes are still public (no token needed):**

```http
GET http://localhost:4000/api/books
```

Expected: status `200` with the array of books — no authentication required.

**5. Try deleting a book without a token (should fail):**

```http
DELETE http://localhost:4000/api/books/YOUR_BOOK_ID_HERE
```

Expected response (status `401`):
```json
{
  "error": "Authorization token required"
}
```

**6. Delete a book with the token (should succeed):**

```http
DELETE http://localhost:4000/api/books/YOUR_BOOK_ID_HERE
Authorization: Bearer YOUR_TOKEN_HERE
```

Expected response: status `204` (No Content).

**You are done with Iteration 7 when:**

- `POST /api/books` without a token returns `401`.
- `PUT /api/books/:bookId` without a token returns `401`.
- `DELETE /api/books/:bookId` without a token returns `401`.
- `GET /api/books` and `GET /api/books/:bookId` work **without** a token.
- Creating a book **with** a valid token returns `201` and the book includes a `user_id` field.
- The `user_id` in the created book matches the authenticated user's ID.

**Discussion Questions:**

- What happens if you send an expired token? How would you test that?
- Why do we put public routes *above* `router.use(requireAuth)` instead of adding `requireAuth` individually to each protected route?
- Why do we take the `user_id` from `req.user._id` (the verified token) instead of allowing the client to send it in the request body?
- What would you need to change so that users can only update and delete **their own** books?

---

## Summary

Congratulations! You have extended the Book API with authentication and route protection:

| Operation | HTTP Method | Endpoint | Auth Required | Status Codes |
|---|---|---|---|---|
| Sign up | `POST` | `/api/users/signup` | No | 201, 400 |
| Log in | `POST` | `/api/users/login` | No | 200, 400 |
| Create book | `POST` | `/api/books` | **Yes** | 201, 401, 500 |
| Read all books | `GET` | `/api/books` | No | 200, 500 |
| Read one book | `GET` | `/api/books/:bookId` | No | 200, 400, 404, 500 |
| Update book | `PUT` | `/api/books/:bookId` | **Yes** | 200, 400, 401, 404, 500 |
| Delete book | `DELETE` | `/api/books/:bookId` | **Yes** | 204, 400, 401, 404, 500 |

**What changed from Part 1:**

| File | Change |
|---|---|
| `package.json` | **Updated** — Added `bcryptjs` and `jsonwebtoken` dependencies |
| `.env` | **Updated** — Added `SECRET` variable |
| `models/userModel.js` | **New** — User schema with hashed password |
| `controllers/userControllers.js` | **New** — Signup, login, token generation |
| `routes/userRouter.js` | **New** — `/api/users/signup` and `/api/users/login` |
| `app.js` | **Updated** — Registered user routes |
| `middleware/requireAuth.js` | **New** — Verifies JWT and attaches `req.user` |
| `models/bookModel.js` | **Updated** — Added `user_id` field referencing User |
| `controllers/bookControllers.js` | **Updated** — `createBook` saves `user_id` from authenticated user |
| `routes/bookRouter.js` | **Updated** — Applied `requireAuth` middleware to POST, PUT, DELETE |

**Next steps to explore:**
- Restrict update and delete so users can only modify **their own** books
- Add a `GET /api/users/me` endpoint that returns the logged-in user's profile
- Add password strength validation
- Add token refresh logic
- Write automated tests for the auth endpoints with Jest and Supertest
