import { Router } from "express";
import bcrypt from "bcrypt";
import mysql from "mysql";
import db from "./db-config.js";
import JWT from "jsonwebtoken";

const router = Router();

router.post("/", async (req, res) => {
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
      const sqlSearch = "Select * from usertable where username = ?";
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
              status: "success",
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

export default router;
