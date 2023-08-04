import { Router } from "express";
import { format } from "mysql";
import db from "./db-config.js";

const router = Router();
//allows user to store data
router.post("/", async (req, res) => {
  try {
    const key = req.body.key;
    const value = req.body.value;

    //checks if key field is not empty
    if (!key) {
      return res.status(400).json({
        status: "error",
        code: "INVALID_KEY",
        message: "The provided key is not valid or missing.",
      });
    }

    //checks if value field is not empty
    if (!value) {
      return res.status(400).json({
        status: "error",
        code: "INVALID_VALUE",
        message: "The provided value is not valid or missing.",
      });
    }
    //connect to db
    db.getConnection(async (err, connection) => {
      //query to search key in datatable
      const sqlSearch = "SELECT * FROM datatable WHERE `key` = ?";
      const search_key = format(sqlSearch, [key]);
      //query to insert values in datatable
      const sqlInsertKey = "INSERT INTO datatable  VALUES (0,?, ?)";
      const insert_key = format(sqlInsertKey, [key, value]);

      connection.query(search_key, async (err, result) => {
        connection.release();
        //check if key already exist or not
        if (result.length != 0) {
          return res.status(409).json({
            status: "error",
            code: "KEY_EXISTS",
            message:
              "The provided key already exists in the database. To update an existing key, use the update API.",
          });
        } else {
          //if everything is correct then store key and value
          connection.query(insert_key, async (err, result) => {
            return res.status(201).json({
              status: "success",
              message: "Data stored successfully.",
            });
          });
        }
      });
    });
  } catch (err) {
    //return error if there is something wrong
    console.error(err);
    return res.status(500).json({
      status: "error",
      code: "INTERNAL_SERVER_ERROR",
      message: "An internal server error occurred. Please try again later.",
    });
  }
});

//allows user to retreive key for particular key
router.get("/:key", async (req, res) => {
  try {
    const key = req.params.key;

    //checks if key in param is empty or not
    if (!key) {
      return res.status(400).json({
        status: "error",
        code: "INVALID_KEY",
        message: "The provided key is not valid or missing.",
      });
    }

    db.getConnection(async (err, connection) => {
      const sqlSearch = "SELECT * FROM datatable WHERE `key` = ?";
      const search_key = format(sqlSearch, [key]);

      connection.query(search_key, async (err, result) => {
        connection.release();
        //checks if key entered is present in table or not
        if (result.length === 0) {
          return res.status(404).json({
            status: "error",
            code: "KEY_NOT_FOUND",
            message: "The provided key does not exist in the database.",
          });
        } else {
          //if everything is correct then return key and value
          const value = result[0].value;
          return res.status(200).json({
            status: "success",
            data: {
              key: key,
              value: value,
            },
          });
        }
      });
    });
  } catch (err) {
    //return error if there is something wrong
    console.error(err);
    return res.status(500).json({
      status: "error",
      code: "INTERNAL_SERVER_ERROR",
      message: "An internal server error occurred. Please try again later.",
    });
  }
});

//allow user to edit value for particular key
router.put("/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const value = req.body.value;
    //check if entered key in param is valid or not
    if (!key) {
      return res.status(400).json({
        status: "error",
        code: "INVALID_KEY",
        message: "The provided key is not valid or missing.",
      });
    }
    //check if entered value is not empty
    if (!value) {
      return res.status(400).json({
        status: "error",
        code: "INVALID_VALUE",
        message: "The provided value is not valid or missing.",
      });
    }
    //connection to database
    db.getConnection(async (err, connection) => {
      //query for searching key in datatable
      const sqlSearch = "SELECT * FROM datatable WHERE `key` = ?";
      const search_key = format(sqlSearch, [key]);
      //query for updating value in datatable
      const sqlUpdateKey = "UPDATE datatable SET value = ? WHERE `key` = ?";
      const update_key = format(sqlUpdateKey, [value, key]);

      connection.query(search_key, async (err, result) => {
        connection.release();
        //check if provided key is present in database or not
        if (result.length === 0) {
          return res.status(404).json({
            status: "error",
            code: "KEY_NOT_FOUND",
            message: "The provided key does not exist in the database.",
          });
        } else {
          //if everything is correct then update value
          connection.query(update_key, async (err, result) => {
            return res.status(200).json({
              status: "success",
              message: "Data updated successfully.",
            });
          });
        }
      });
    });
  } catch (err) {
    //if there is anything wrong then throw error
    console.error(err);
    return res.status(500).json({
      status: "error",
      code: "INTERNAL_SERVER_ERROR",
      message: "An internal server error occurred. Please try again later.",
    });
  }
});

//allow user to delete key and value
router.delete("/:key", async (req, res) => {
  try {
    const key = req.params.key;

    //checks if key entered is valid or not
    if (!key) {
      return res.status(400).json({
        status: "error",
        code: "INVALID_KEY",
        message: "The provided key is not valid or missing.",
      });
    }

    db.getConnection(async (err, connection) => {
      //query for searching key in database
      const sqlSearch = "SELECT * FROM datatable WHERE `key` = ?";
      const search_key = format(sqlSearch, [key]);
      //query for deleting key in database
      const sqlDeleteKey = "DELETE FROM datatable WHERE `key` = ?";
      const delete_key = format(sqlDeleteKey, [key]);
      
      connection.query(search_key, async (err, result) => {
        connection.release();
        //checks if key provided in param exist in database or not
        if (result.length === 0) {
          return res.status(404).json({
            status: "error",
            code: "KEY_NOT_FOUND",
            message: "The provided key does not exist in the database.",
          });
        } else {
          //delete key and value if everthing entered is correct
          connection.query(delete_key, async (err, result) => {
            return res.status(200).json({
              status: "success",
              message: "Data deleted successfully.",
            });
          });
        }
      });
    });
  } catch (err) {
    //return error if there is something wrong
    console.error(err);
    return res.status(500).json({
      status: "error",
      code: "INTERNAL_SERVER_ERROR",
      message: "An internal server error occurred. Please try again later.",
    });
  }
});

export default router;
