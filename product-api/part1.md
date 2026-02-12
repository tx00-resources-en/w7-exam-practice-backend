# Backend Activity — Product API (Beginner-Friendly)

## Overview

In this activity you will build an **Express + MongoDB** back-end API from scratch.  
By the end you will have a working REST API that can **Create, Read, Update and Delete** (CRUD) products — a simple inventory management system.

**How to use this repo:**

| Folder | Purpose |
|---|---|
| `product-api/step0/` | Your **starting point**. Copy this folder and work inside the copy. All routes exist but return placeholder text. |
| `product-api/step1/` – `step4/` | Sample solutions for each iteration. Only look at them **after** you have tried on your own. |
| `product-api/step5/` | The fully working API with all CRUD operations implemented. |

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
| 1 | Create a product | `POST` | `controllers/productControllers.js` |
| 2 | Get all products | `GET` | `controllers/productControllers.js` |
| 3 | Delete a product | `DELETE` | `controllers/productControllers.js` |
| 4 | Get a single product | `GET` | `controllers/productControllers.js` |
| 5 | Update a product | `PUT` | `controllers/productControllers.js` |

> **Important:** Commit your work after each iteration.
<!-- 
---

## How You Will Work (Paired)

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

- `feat(products): implement POST /products to create a new product`
- `feat(products): implement GET /products to fetch all products`
- `feat(products): implement DELETE /products/:productId`
- `chore: install dependencies`

Rule of thumb: one commit = one idea you can explain in one sentence.

---

## The Product API (Reference)

Here is the API you are building.

**Base URL:** `http://localhost:4000`

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `POST` | `/api/products` | Create a new product | JSON (see below) |
| `GET` | `/api/products` | Get all products | — |
| `GET` | `/api/products/:productId` | Get a single product by ID | — |
| `PUT` | `/api/products/:productId` | Update a product by ID | JSON (see below) |
| `DELETE` | `/api/products/:productId` | Delete a product by ID | — |

**Product JSON shape** (what the API expects and returns):

```json
{
  "title": "Wireless Headphones",
  "category": "Electronics",
  "description": "High-quality wireless headphones with noise cancellation",
  "price": 149.99,
  "stockQuantity": 50,
  "supplier": {
    "name": "TechSupplies Inc.",
    "contactEmail": "sales@techsupplies.com",
    "contactPhone": "555-123-4567",
    "rating": 4
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
   cd backend-labs/product-api/step0
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
   GET http://localhost:4000/api/products
   ```
   You should see the response: `getAllProducts`
   
   This confirms the route exists but the logic is not implemented yet.

**You are done with Iteration 0 when:**

- The server is running on `http://localhost:4000`.
- MongoDB is connected.
- Placeholder routes respond with text like `getAllProducts`, `createProduct`, etc.

---

### Iteration 1: Create a Product (`POST`)

**Goal:** Implement the `createProduct` controller function so that `POST /api/products` saves a new product to the database.

**File to change:** `controllers/productControllers.js`

Right now the `createProduct` function just returns `res.send("createProduct")`. You need to:

1. **Extract the product data from the request body** and create a new document in MongoDB using the `Product` model.

2. **Return the created product** with status `201`.

3. **Handle errors** — if creation fails, return status `400` with an error message.

**Implementation:**

```javascript
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
```

**Key concepts:**
- Destructuring `req.body` — Extracts specific fields from the request
- `Product.create({...})` — Creates a new document using the Mongoose model
- `res.status(201)` — HTTP 201 means "Created"
- The `try/catch` handles validation errors (e.g., missing required fields)

> **Sample solution (after trying yourself):** [step1/controllers/productControllers.js](./step1/controllers/productControllers.js)

**Test your implementation:**

```http
POST http://localhost:4000/api/products
Content-Type: application/json

{
  "title": "Wireless Headphones",
  "category": "Electronics",
  "description": "High-quality wireless headphones with noise cancellation",
  "price": 149.99,
  "stockQuantity": 50,
  "supplier": {
    "name": "TechSupplies Inc.",
    "contactEmail": "sales@techsupplies.com",
    "contactPhone": "555-123-4567",
    "rating": 4
  }
}
```

**You are done with Iteration 1 when:**

- `POST /api/products` returns status `201` with the created product (including `_id`).
- The product is saved in MongoDB (check with MongoDB Compass or a GET request later).
- Sending invalid data (e.g., missing `title`) returns status `400`.

---

### Iteration 2: Get All Products (`GET`)

**Goal:** Implement the `getAllProducts` controller function so that `GET /api/products` returns all products from the database.

**File to change:** `controllers/productControllers.js`

Right now the `getAllProducts` function just returns `res.send("getAllProducts")`. You need to:

1. **Find all products** in the database using `Product.find({})`.
2. **Sort them** by creation date (newest first).
3. **Return the products array** with status `200`.
4. **Handle errors** — if the query fails, return status `500`.

**Implementation:**

```javascript
// GET /api/products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

**Key concepts:**
- `Product.find({})` — Finds all documents in the collection
- `.sort({ createdAt: -1 })` — Sorts by `createdAt` field in descending order (newest first)
- `res.status(200)` — HTTP 200 means "OK"
- `res.status(500)` — HTTP 500 means "Internal Server Error"

> **Sample solution (after trying yourself):** [step2/controllers/productControllers.js](./step2/controllers/productControllers.js)

**Test your implementation:**

```http
GET http://localhost:4000/api/products
```

**You are done with Iteration 2 when:**

- `GET /api/products` returns an array of all products in the database.
- Products created in Iteration 1 appear in the response.
- If you create multiple products, the newest appears first.

**Discussion Questions:**

- What does the empty object `{}` in `Product.find({})` mean?
- What would happen if you used `.sort({ createdAt: 1 })` instead?

---

### Iteration 3: Delete a Product (`DELETE`)

**Goal:** Implement the `deleteProduct` controller function so that `DELETE /api/products/:productId` removes a product from the database.

**File to change:** `controllers/productControllers.js`

Right now the `deleteProduct` function just returns `res.send("deleteProduct")`. You need to:

1. **Get the `productId`** from the URL parameters.
2. **Validate the ID** — check if it's a valid MongoDB ObjectId.
3. **Find and delete** the product using `Product.findOneAndDelete()`.
4. **Return status `204`** (No Content) if successful.
5. **Handle not found** — return `404` if the product doesn't exist.

**Implementation:**

```javascript
// DELETE /api/products/:productId
const deleteProduct = async (req, res) => {
  const { productId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(404).json({ error: 'Product not found' });
  }
  try {
    const product = await Product.findOneAndDelete({ _id: productId });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

**Key concepts:**
- `req.params.productId` — Extracts the `:productId` from the URL
- `mongoose.Types.ObjectId.isValid()` — Validates that the ID is a proper MongoDB ObjectId
- `Product.findOneAndDelete({ _id: productId })` — Finds and deletes in one operation
- `res.status(204).send()` — HTTP 204 means "No Content" (success, but no body to return)
- `res.status(404)` — HTTP 404 means "Not Found"

> **Sample solution (after trying yourself):** [step3/controllers/productControllers.js](./step3/controllers/productControllers.js)

**Test your implementation:**

First, get a product ID from `GET /api/products`, then:

```http
DELETE http://localhost:4000/api/products/YOUR_PRODUCT_ID_HERE
```

**You are done with Iteration 3 when:**

- `DELETE /api/products/:productId` returns status `204` when successful.
- The product is actually removed from the database (verify with GET /api/products).
- Deleting a non-existent ID returns status `404`.
- Using an invalid ID format returns status `404`.

---

### Iteration 4: Get a Single Product (`GET`)

**Goal:** Implement the `getProductById` controller function so that `GET /api/products/:productId` returns one specific product.

**File to change:** `controllers/productControllers.js`

Right now the `getProductById` function just returns `res.send("getProductById")`. You need to:

1. **Get the `productId`** from the URL parameters.
2. **Validate the ID** — check if it's a valid MongoDB ObjectId.
3. **Find the product** using `Product.findById()`.
4. **Return the product** with status `200`, or `404` if not found.

**Implementation:**

```javascript
// GET /api/products/:productId
const getProductById = async (req, res) => {
  const { productId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(404).json({ error: 'Product not found' });
  }
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

**Key concepts:**
- `Product.findById(productId)` — Shorthand for finding by `_id`
- This pattern is very similar to `deleteProduct`, but we return the product instead of deleting it

> **Sample solution (after trying yourself):** [step4/controllers/productControllers.js](./step4/controllers/productControllers.js)

**Test your implementation:**

```http
GET http://localhost:4000/api/products/YOUR_PRODUCT_ID_HERE
```

**You are done with Iteration 4 when:**

- `GET /api/products/:productId` returns the product with status `200`.
- Using a non-existent ID returns status `404`.
- Using an invalid ID format returns status `404`.

**Discussion Questions:**

- What's the difference between `findById()` and `findOne({ _id: id })`?
- Why do we validate the ObjectId before querying?

---

### Iteration 5: Update a Product (`PUT`)

**Goal:** Implement the `updateProduct` controller function so that `PUT /api/products/:productId` updates an existing product.

**File to change:** `controllers/productControllers.js`

Right now the `updateProduct` function just returns `res.send("updateProduct")`. You need to:

1. **Get the `productId`** from the URL parameters.
2. **Validate the ID** — check if it's a valid MongoDB ObjectId.
3. **Find and update** the product using `Product.findOneAndUpdate()`.
4. **Return the updated product** with status `200`, or `404` if not found.

**Implementation:**

```javascript
// PUT /api/products/:productId
const updateProduct = async (req, res) => {
  const { productId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(404).json({ error: 'Product not found' });
  }
  try {
    const product = await Product.findOneAndUpdate(
      { _id: productId },
      { ...req.body },
      { new: true, returnDocument: 'after' }
    );
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

**Key concepts:**
- `Product.findOneAndUpdate(filter, update, options)` — Finds a document, updates it, and returns it
- `{ new: true, returnDocument: 'after' }` — Returns the document **after** the update (default is before)
- `{ ...req.body }` — Spreads all fields from the request body as the update

> **Sample solution (after trying yourself):** [step5/controllers/productControllers.js](./step5/controllers/productControllers.js)

**Test your implementation:**

```http
PUT http://localhost:4000/api/products/YOUR_PRODUCT_ID_HERE
Content-Type: application/json

{
  "title": "Updated Headphones",
  "category": "Electronics",
  "description": "Updated description",
  "price": 199.99,
  "stockQuantity": 100,
  "supplier": {
    "name": "NewSupplier Inc.",
    "contactEmail": "new@supplier.com",
    "contactPhone": "555-000-0000",
    "rating": 5
  }
}
```

**You are done with Iteration 5 when:**

- `PUT /api/products/:productId` returns the updated product with status `200`.
- The changes persist in the database (verify with GET).
- Using a non-existent ID returns status `404`.
- Using an invalid ID format returns status `404`.

---

## Summary

Congratulations! You have built a complete REST API with all CRUD operations:

| Operation | HTTP Method | Endpoint | Status Codes |
|---|---|---|---|
| Create | `POST` | `/api/products` | 201, 400 |
| Read all | `GET` | `/api/products` | 200, 500 |
| Read one | `GET` | `/api/products/:productId` | 200, 404, 500 |
| Update | `PUT` | `/api/products/:productId` | 200, 400, 404 |
| Delete | `DELETE` | `/api/products/:productId` | 204, 404, 500 |

**Next steps to explore:**
- Add request validation with a library like `express-validator` or `joi`
- Add authentication with JWT
- Add pagination to `GET /api/products`
- Write automated tests with Jest and Supertest
