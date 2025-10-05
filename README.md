# Flight Admin Backend

This is the backend for the Flight Administration project. It is a Node.js application using Express.js and MongoDB.

## Overview

The backend provides a RESTful API for managing flights and users. It handles user authentication and authorization, allowing administrators to perform CRUD operations on flight data.

## Prerequisites

- [Node.js](https://nodejs.org/) (v12 or higher)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/)

## Getting Started

### Installation

1.  Clone the repository or download the source code
2.  Navigate to the `backend` directory.
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Configuration

1.  Create a `.env` file in the `backend` directory.
2.  Add the following environment variable, replacing the value with your MongoDB connection string:
    ```
    MONGO_URI=mongodb://localhost:27017/flightdb
    ```

## Usage

### Running the Server

To start the server, run the following command from the `backend` directory:

```bash
npm start
```

The server will start on `http://localhost:1221`.

## API Endpoint

All endpoints are prefixed with `/api`.

### Authentication (`/auth`)

-   **`POST /register`**: Register a new user.
    -   **Body**: `{ "email": "user@example.com", "password": "yourpassword", "role": "user" }`
    -   **Role**: Can be `user` or `admin`.

-   **`POST /login`**: Log in and receive a JWT.
    -   **Body**: `{ "email": "user@example.com", "password": "yourpassword" }`
    -   **Response**: `{ "token": "your.jwt.token", "role": "user" }`

### Flights (`/flights`)

-   **`GET /`**: Get a list of all flights.
-   **`POST /`**: (Admin only) Add a new flight.
    -   **Headers**: `Authorization: Bearer <token>`
    -   **Body**: `multipart/form-data` with fields: `flightNumber`, `departure`, `arrival`, `time`, and `logo` (image file).
-   **`PUT /:id`**: (Admin only) Update an existing flight.
    -   **Headers**: `Authorization: Bearer <token>`
    -   **Body**: `multipart/form-data` with fields to update.
-   **`DELETE /:id`**: (Admin only) Delete a flight.
    -   **Headers**: `Authorization: Bearer <token>`

## Project Structure

```
.
├── index.js          # Main server entry point
├── models/           # Mongoose schemas (User, Flight)
├── routes/           # API route definitions (auth, flight)
├── uploads/          # Directory for uploaded flight logos
├── .env              # Environment variables (needs to be created)
├── .gitignore        # Git ignore file
├── package.json      # Project dependencies and scripts
└── Readme.md         # This file
```

## Key Dependencies

-   **[express](https://expressjs.com/)**: Web framework for Node.js.
-   **[mongoose](https://mongoosejs.com/)**: Object Data Modeling (ODM) library for MongoDB.
-   **[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)**: For generating and verifying JSON Web Tokens.
-   **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)**: For hashing passwords.
-   **[multer](https://github.com/expressjs/multer)**: Middleware for handling `multipart/form-data`.
-   **[cors](https://github.com/expressjs/cors)**: For enabling Cross-Origin Resource Sharing.
-   **[dotenv](https://github.com/motdotla/dotenv)**: For loading environment variables from a `.env` file.
