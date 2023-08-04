import { Router } from "express";
import { format } from "mysql";
import db from "./db-config.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const key = req.body.key;
    const value = req.body.value;

    if (!key) {
      return res.status(400).json({
        status: "error",
        code: "INVALID_KEY",
        message: "The provided key is not valid or missing.",
      });
    }

    if (!value) {
      return res.status(400).json({
        status: "error",
        code: "INVALID_VALUE",
        message: "The provided value is not valid or missing.",
      });
    }

    db.getConnection(async (err, connection) => {
      const sqlSearch = "SELECT * FROM datatable WHERE `key` = ?";
      const search_key = format(sqlSearch, [key]);
      const sqlInsertKey = "INSERT INTO datatable  VALUES (0,?, ?)";
      const insert_key = format(sqlInsertKey, [key, value]);
      connection.query(search_key, async (err, result) => {
        connection.release();

        if (result.length != 0) {
          return res.status(409).json({
            status: "error",
            code: "KEY_EXISTS",
            message:
              "The provided key already exists in the database. To update an existing key, use the update API.",
          });
        } else {
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
    console.error(err);
    return res.status(500).json({
      status: "error",
      code: "INTERNAL_SERVER_ERROR",
      message: "An internal server error occurred. Please try again later.",
    });
  }
});

router.get("/:key", async (req, res) => {
  try {
    const key = req.params.key;

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

        if (result.length === 0) {
          return res.status(404).json({
            status: "error",
            code: "KEY_NOT_FOUND",
            message: "The provided key does not exist in the database.",
          });
        } else {
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
    console.error(err);
    return res.status(500).json({
      status: "error",
      code: "INTERNAL_SERVER_ERROR",
      message: "An internal server error occurred. Please try again later.",
    });
  }
});

router.put("/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const value = req.body.value;

    if (!key) {
      return res.status(400).json({
        status: "error",
        code: "INVALID_KEY",
        message: "The provided key is not valid or missing.",
      });
    }

    if (!value) {
      return res.status(400).json({
        status: "error",
        code: "INVALID_VALUE",
        message: "The provided value is not valid or missing.",
      });
    }

    db.getConnection(async (err, connection) => {
      const sqlSearch = "SELECT * FROM datatable WHERE `key` = ?";
      const search_key = format(sqlSearch, [key]);
      const sqlUpdateKey = "UPDATE datatable SET value = ? WHERE `key` = ?";
      const update_key = format(sqlUpdateKey, [value, key]);

      connection.query(search_key, async (err, result) => {
        connection.release();

        if (result.length === 0) {
          return res.status(404).json({
            status: "error",
            code: "KEY_NOT_FOUND",
            message: "The provided key does not exist in the database.",
          });
        } else {
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
    console.error(err);
    return res.status(500).json({
      status: "error",
      code: "INTERNAL_SERVER_ERROR",
      message: "An internal server error occurred. Please try again later.",
    });
  }
});

router.delete("/:key", async (req, res) => {
  try {
    const key = req.params.key;

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
      const sqlDeleteKey = "DELETE FROM datatable WHERE `key` = ?";
      const delete_key = format(sqlDeleteKey, [key]);

      connection.query(search_key, async (err, result) => {
        connection.release();

        if (result.length === 0) {
          return res.status(404).json({
            status: "error",
            code: "KEY_NOT_FOUND",
            message: "The provided key does not exist in the database.",
          });
        } else {
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
    console.error(err);
    return res.status(500).json({
      status: "error",
      code: "INTERNAL_SERVER_ERROR",
      message: "An internal server error occurred. Please try again later.",
    });
  }
});

export default router;
