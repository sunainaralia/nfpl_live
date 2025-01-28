import express from "express";
import InvestmentController from "../Controllers/InvestmentController/Investment.js";
import Auth from "../Middlewares/Authentication/index.js";
import { serverError } from "../Utils/Responses/index.js";
import { reqFields } from "../Models/requiredFields.js";
// Initialize router
const routes = express.Router();
const authController = new Auth();
const investmentController = new InvestmentController();

// Get all investments (with pagination)
routes.get(
  "/get-investments",
  authController.verifyToken,
  authController.checkAuth,
  async (req, res) => {
    console.log("Handling /get-investments route");
    try {
      const { page = 0, limit = 10 } = req.query;
      const result = await investmentController.getInvestments(page, parseInt(limit));
      return res.status(result.status).send(result);
    } catch (error) {
      console.error("Error handling /get-investments route:", error);
      return res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

// Create a new investment
routes.post(
  "/create-investment",
  authController.verifyToken,
  authController.checkFields(reqFields.investment),
  async (req, res) => {
    try {
      const result = await investmentController.createInvestment(req.body);
      res.status(result.status).send(result);
    } catch (error) {
      return res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

// Get investment by ID
routes.get(
  "/get-investment-by-id/:id",
  authController.verifyToken,
  authController.CheckObjectId,
  async (req, res) => {
    try {
      const result = await investmentController.getInvestmentById(req.params?.id);
      res.status(result.status).send(result);
    } catch (error) {
      return res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

// Update investment by ID
routes.put(
  "/update-investment",
  authController.verifyToken,
  authController.checkAuth,  // Ensure the user is an admin or has required permissions
  async (req, res) => {
    try {
      const result = await investmentController.updateInvestmentById(req.body);
      res.status(result.status).send(result);
    } catch (error) {
      return res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

// Delete investment by ID
routes.delete(
  "/delete-investment/:id",
  authController.verifyToken,
  authController.checkAuth,  // Ensure the user is an admin or has required permissions
  authController.CheckObjectId, // Ensure the ID is valid
  async (req, res) => {
    try {
      const result = await investmentController.deleteInvestmentById(req.params?.id);
      res.status(result.status).send(result);
    } catch (error) {
      return res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }

);
// Get investments by userId
routes.post(
  "/get-investments-by-userid",
  authController.verifyToken,
  async (req, res) => {
    try {
      const userId = req.body.userId;
      const { page = 0, limit = 10 } = req.query;

      const result = await investmentController.getInvestmentsByUserId(
        userId,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(result.status).send(result);
    } catch (error) {
      return res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

export default routes;
