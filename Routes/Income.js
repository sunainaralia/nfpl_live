import express from "express";
import Auth from "../Middlewares/Authentication/index.js";
import Income from "../Controllers/IncomeController/Income.js";
import { reqFields } from "../Models/requiredFields.js";
import multer from "multer";
import { serverError } from "../Utils/Responses/index.js";
const routes = express.Router();
const upload = multer();
// controllers
const income = new Income();

// Middleware
const authController = new Auth();

// Get All Income
routes.get(
  "/get-incomes",
  authController.verifyToken,
  authController.checkAuth,
  async (req, res) => {
    try {
      const { limit = 10, page } = req.query;
      const val = await income.getIncomeLogs(parseInt(limit), page);
      res.status(val.status).send(val);
    } catch (error) {
      res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

// Get income by Id API
routes.get(
  "/get-income-by-id/:id",
  authController.verifyToken,
  authController.CheckObjectId,
  async (req, res) => {
    try {
      const val = await income.getIncomeById(req.params?.id);
      res.status(val.status).send(val);
    } catch (error) {
      console.error("Error getting income by ID:", error);
      res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

// Get income by User Id API
routes.get(
  "/get-income-by-user-id",
  authController.verifyToken,
  async (req, res) => {
    try {
      let userId = req.query?.userId ?? req.headers?.userid ?? req.headers.userId;
      let month = req?.query?.month;
      let year = req?.query?.year;
      const val = await income.getIncomeByUserId(userId, month, year);
      return res.status(val.status).send(val);
    } catch (error) {
      return res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

// Update Income API
routes.put(
  "/update-income",
  upload.none(),
  authController.verifyToken,
  authController.checkAuth,
  async (req, res) => {
    try {
      const val = await income.updateIncomeById({
        ...req.body,
      });
      return res.status(val.status).send(val);
    } catch (error) {
      return res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

// Delete income API
routes.delete(
  "/delete-income/:id",
  authController.verifyToken,
  authController.checkAuth,
  async (req, res) => {
    try {
      const val = await income.deleteIncomeById(req.params?.id);
      res.status(val.status).send(val);
    } catch (error) {
      res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

// Create Income API
routes.post(
  "/create-income",
  upload.none(),
  authController.checkFields(reqFields.income),
  authController.verifyToken,
  authController.checkAuth,
  async (req, res) => {
    try {
      const val = await income.createNewIncome({
        ...req.body,
      });
      res.status(val.status).send(val);
    } catch (error) {
      res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

export default routes;
