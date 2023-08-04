import express, { json } from "express";
const app = express();

import dotenv from "dotenv";
dotenv.config();

import auth_token from "./auth.js";
import registerRoute from "./register.js";
import tokenRoute from "./token.js";
import dataRoute from "./data.js";

const port = process.env.PORT || 3000;

app.use(json());
//adding endpoints for register and token generation
app.use("/api/register", registerRoute);
app.use("/api/token", tokenRoute);

// Adding the auth token middleware to all data routes
app.use("/api/data", auth_token);
app.use("/api/data", dataRoute);

app.listen(port, () => console.log(`Server Started on port ${port}`));
