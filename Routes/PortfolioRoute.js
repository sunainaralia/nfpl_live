import express from "express";
import Auth from "../Middlewares/Authentication/index.js";
import { serverError } from "../Utils/Responses/index.js";
import multer from "multer";
import Portfolio from "../Controllers/PortfolioController/Portfolio.js";

const routes = express.Router();
const upload = multer();
const portfolio = new Portfolio();
const authController = new Auth();

// Get All Portfolios with Pagination
routes.get("/portfolios", authController.verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const result = await portfolio.getPortfolios(page, limit);
    return res.status(result.status).send(result);
  } catch (error) {
    return res.status(serverError.status).send({ ...serverError, error });
  }
});

// Create New Portfolio
routes.post(
  "/portfolios",
  authController.verifyToken,
  async (req, res) => {
    try {
      const result = await portfolio.createPortfolio(req.body);
      res.status(result.status).send(result);
    } catch (error) {
      return res.status(serverError.status).send({ ...serverError, error });
    }
  }
);

// Get Portfolio by ID
routes.get("/portfolios/:id", authController.verifyToken, async (req, res) => {
  
  try {
    const result = await portfolio.getPortfolioById(req.params.id);
    res.status(result.status).send(result);
  } catch (error) {
    return res.status(serverError.status).send({ ...serverError, error });
  }
});

// Update Portfolio
routes.put("/portfolios/:id",  authController.verifyToken, async (req, res) => {
  try {
    const result = await portfolio.updatePortfolioById({ id: req.params.id, ...req.body });
    res.status(result.status).send(result);
  } catch (error) {
    return res.status(serverError.status).send({ ...serverError, error });
  }
});

// Delete Portfolio
routes.delete("/portfolios/:id", authController.verifyToken, async (req, res) => {
  try {
    const result = await portfolio.deletePortfolioById(req.params.id);
    res.status(result.status).send(result);
  } catch (error) {
    return res.status(serverError.status).send({ ...serverError, error });
  }
});

export default routes;
