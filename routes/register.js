import { Router } from "express";
import bcrypt from "bcrypt";
import mysql from "mysql";
import db from "./db-config.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        status: "error",
        code: "INVALID_PASSWORD",
        message:
          "The provided password does not meet the requirements. Password must be at least 8 characters long and contain a mix of uppercase and lowercase letters, numbers, and special characters.",
      });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const full_name = req.body.full_name;
    const age = req.body.age;
    const gender = req.body.gender;

    if (!username || !email || !hashedPassword || !full_name || !age) {
      return res.status(400).json({
        status: "error",
        code: "INVALID_REQUEST",
        message:
          "Invalid request. Please provide all required fields: username, email, password, full_name.",
      });
    }

    if (!gender) {
      return res.status(400).json({
        status: "error",
        code: "GENDER_REQUIRED",
        message:
          "Gender field is required. Please specify the gender (e.g., male, female, non-binary).",
      });
    }

    if (age <= 0 || typeof age != "number") {
      return res.status(400).json({
        status: "error",
        code: "INVALID_AGE",
        message: "Invalid age value. Age must be a positive integer.",
      });
    }

    db.getConnection(async (err, connection) => {
      const sqlSearchName = "SELECT * FROM usertable WHERE username = ?";
      const search_name = mysql.format(sqlSearchName, [username]);
      const sqlSearchEmail = "SELECT * FROM usertable WHERE email = ?";
      const search_email = mysql.format(sqlSearchEmail, [email]);
      const sqlInsert = "INSERT INTO usertable VALUES (0,?,?,?,?,?,?)";
      const insert_query = mysql.format(sqlInsert, [
        username,
        email,
        hashedPassword,
        full_name,
        age,
        gender,
      ]);

      connection.query(search_name, async (err, result) => {
        if (result.length != 0) {
          return res.status(400).json({
            status: "error",
            code: "USERNAME_EXISTS",
            message:
              "The provided username is already taken. Please choose a different username.",
          });
        }
      });
      connection.query(search_email, async (err, result) => {
        if (result.length != 0) {
          return res.status(400).json({
            status: "error",
            code: "EMAIL_EXISTS",
            message:
              "The provided email is already registered. Please use a different email address.",
          });
        }
      });
      connection.query(insert_query, (err, result) => {
        connection.release();
        return res.status(201).json({
          status: "success",
          message: "User successfully registered!",
          data: {
            user_id: req.body.user_id,
            username: req.body.username,
            email: req.body.email,
            full_name: req.body.full_name,
            age: req.body.age,
            gender: req.body.gender,
          },
        });
      });
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      code: "INTERNAL_SERVER_ERROR",
      message: "An internal server error occurred. Please try again later.",
    });
  }
});

export default router;
