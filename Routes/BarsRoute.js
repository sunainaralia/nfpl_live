import express from "express";
import Auth from "../Middlewares/Authentication/index.js";
import BarsController from "../Controllers/BarsController/Bars.js";
import { reqFields } from "../Models/requiredFields.js";
import multer from "multer";
import { serverError } from "../Utils/Responses/index.js";
// Initialize router and multer
const routes = express.Router();
const upload = multer();

// controllers -------------------------
const barsController = new BarsController();
const authController = new Auth();

// Get all bars (with pagination and type filtering)
routes.get(
  "/get-bars",
  async (req, res) => {
    try {
      const { type = "published", page = 0, limit = 10 } = req.query;
      const val = await barsController.getBars(page, parseInt(limit), type);
      return res.status(val.status).send(val);
    } catch (error) {
      return res.status(serverError.status).send(serverError);
    }
  }
);

// Add a new bar
routes.post(
  "/create-bar",
  upload.none(),
  authController.verifyToken,
  authController.checkAuth,
  authController.checkFields(reqFields.slab),
  async (req, res) => {
    try {
      const val = await barsController.createBar({
        ...req.body,
      });
      res.status(val.status).send(val);
    } catch (error) {
      return res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

// Get bars by type (with pagination)
routes.get("/get-bars-by-type", async (req, res) => {
  try {
    const { page = 0, limit = 10, type = "source" } = req.query;
    const val = await barsController.getBars(page, parseInt(limit), type);
    return res.status(val.status).send(val);
  } catch (error) {
    return res.status(serverError.status).send({
      ...serverError,
      error,
    });
  }
});

// Generate random bar data (based on range)
routes.get("/generate-bar/:range", authController.verifyToken, async (req, res) => {
  try {
    const response = await barsController.getBarByRange(parseInt(req.params?.range) ?? 1);
    return res.status(response.status).send(response);
  } catch (err) {
    return res.status(serverError.status).send(serverError);
  }
});

// Get bar by ID

routes.get(
  "/get-bar-by-id/:id",
  authController.verifyToken,
  authController.CheckObjectId,
  async (req, res) => {
    try {
      const val = await barsController.getBarById(req.params?.id);
      res.status(val.status).send(val);
    } catch (error) {
      return res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

// Update bar by ID
routes.put(
  "/update-bar",
  upload.none(),
  authController.verifyToken,
  authController.checkAuth,
  async (req, res) => {
    try {
      const val = await barsController.updateBarById({
        ...req.body,
      });
      res.status(val.status).send(val);
    } catch (error) {
      return res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

// Delete bar by ID
routes.delete(
  "/delete-bar/:id",
  authController.verifyToken,
  authController.checkAuth,
  authController.CheckObjectId,
  async (req, res) => {
    try {
      const val = await barsController.deleteBarById(req.params?.id);
      res.status(val.status).send(val);
    } catch (error) {
      return res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

export default routes;
