import express from "express";
import bcrypt from "bcrypt";
import { createPool } from "mysql";
import dotenv from "dotenv";
import mysql from "mysql";
import JWT from "jsonwebtoken";

const app = express();

dotenv.config();

const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE;
const DB_PORT = process.env.DB_PORT;

const db = createPool({
  connectionLimit: 100,
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  port: DB_PORT,
});

app.use(express.json());

app.post("/api/register", async (req, res) => {
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
          connection.release();
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
          connection.release();
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
        res.sendStatus(201);
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

app.post("/api/token", (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    //validation
    if (!username || !password) {
      return res.status(404).send({
        status: "MISSING_FIELDS",
        message: "Missing fields. Please provide both username and password.",
      });
    }

    db.getConnection(async (err, connection) => {
      const sqlSearch = "Select * from userTable where username = ?";
      const search_name = mysql.format(sqlSearch, [username]);
      connection.query(search_name, async (err, result) => {
        connection.release();

        if (result.length == 0) {
          return res.status(404).send({
            status: "INVALID_CREDENTIALS",
            message:
              "Invalid credentials. The provided username or password is incorrect.",
          });
        } else {
          const hashedPassword = result[0].password;
          //get the hashedPassword from result
          if (await bcrypt.compare(password, hashedPassword)) {
            const token = JWT.sign(
              { _id: username._id },
              process.env.JWT_SECRET,
              { expiresIn: "1h" }
            );
            res.status(200).send({
              success: "success",
              message: "Access token generated successfully.",
              data: {
                access_token: token,
                expires_in: 3600,
              },
            });
          } else {
            return res.status(403).send({
              status: "INVALID_CREDENTIALS",
              message:
                "Invalid credentials. The provided username or password is incorrect.",
            });
          }
        }
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

const port = process.env.PORT;
app.listen(port, () => console.log(`Server Started on port ${port}`));
