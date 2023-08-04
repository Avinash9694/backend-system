import { Router } from "express";
import bcrypt from "bcrypt";
import mysql from "mysql";
import db from "./db-config.js";

const router = Router();

//post method for registering new user
router.post("/", async (req, res) => {
  try {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    //check if password sent by the user contains the following requirement or not
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
    //crypting the entered password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const full_name = req.body.full_name;
    const age = req.body.age;
    const gender = req.body.gender;

    //check if all the fields are filled or not
    if (!username || !email || !hashedPassword || !full_name || !age) {
      return res.status(400).json({
        status: "error",
        code: "INVALID_REQUEST",
        message:
          "Invalid request. Please provide all required fields: username, email, password, full_name.",
      });
    }

    //checks if gender is filled by new user or not
    if (!gender) {
      return res.status(400).json({
        status: "error",
        code: "GENDER_REQUIRED",
        message:
          "Gender field is required. Please specify the gender (e.g., male, female, non-binary).",
      });
    }

    //checks if age is positive integer or not
    if (age <= 0 || typeof age != "number") {
      return res.status(400).json({
        status: "error",
        code: "INVALID_AGE",
        message: "Invalid age value. Age must be a positive integer.",
      });
    }

    // connect sql db
    db.getConnection(async (err, connection) => {
      //query for selecting username from database
      const sqlSearchName = "SELECT * FROM usertable WHERE username = ?";
      const search_name = mysql.format(sqlSearchName, [username]);
      //query for selecting email from database
      const sqlSearchEmail = "SELECT * FROM usertable WHERE email = ?";
      const search_email = mysql.format(sqlSearchEmail, [email]);
      //query for inserting values in usertable
      const sqlInsert = "INSERT INTO usertable VALUES (0,?,?,?,?,?,?)";
      const insert_query = mysql.format(sqlInsert, [
        username,
        email,
        hashedPassword,
        full_name,
        age,
        gender,
      ]);

      //checks if username already exist or not
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

      //checks if email id already exist or not
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

      //if everything is correct then add new user
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
    //if there is any error while registering
    return res.status(500).json({
      status: "error",
      code: "INTERNAL_SERVER_ERROR",
      message: "An internal server error occurred. Please try again later.",
    });
  }
});

export default router;
