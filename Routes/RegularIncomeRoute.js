import express from "express";
import Auth from "../Middlewares/Authentication/index.js";
import { serverError } from "../Utils/Responses/index.js";
import multer from "multer";
import RegularIncome from "../Controllers/RegularIncomeController/RegularIncome.js";
const routes = express.Router();
const upload = multer();
const regularIncome = new RegularIncome();
const authController = new Auth();

// Get All Regular Incomes with Pagination
routes.get("/regular-incomes", authController.verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const result = await regularIncome.getRegularIncomes(page, limit);
    return res.status(result.status).send(result);
  } catch (error) {
    return res.status(serverError.status).send({ ...serverError, error });
  }
});

// Create New Regular Income
routes.post(
  "/regular-incomes",
  authController.verifyToken,
  async (req, res) => {
    try {
      const result = await regularIncome.createRegularIncome(req.body);
      res.status(result.status).send(result);
    } catch (error) {
      return res.status(serverError.status).send({ ...serverError, error });
    }
  }
);

// Get Regular Income by ID
routes.get("/regular-incomes/:id", authController.verifyToken, async (req, res) => {
  try {
    const result = await regularIncome.getRegularIncomeById(req.params.id);
    res.status(result.status).send(result);
  } catch (error) {
    return res.status(serverError.status).send({ ...serverError, error });
  }
});

// Update Regular Income
routes.put("/regular-incomes/:id", authController.verifyToken, async (req, res) => {
  try {
    const result = await regularIncome.updateRegularIncomeById({ id: req.params.id, ...req.body });
    res.status(result.status).send(result);
  } catch (error) {
    return res.status(serverError.status).send({ ...serverError, error });
  }
});

// Delete Regular Income
routes.delete("/regular-incomes/:id", authController.verifyToken, async (req, res) => {
  try {
    const result = await regularIncome.deleteRegularIncomeById(req.params.id);
    res.status(result.status).send(result);
  } catch (error) {
    return res.status(serverError.status).send({ ...serverError, error });
  }
});

export default routes;
