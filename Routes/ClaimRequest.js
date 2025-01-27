import express from "express";
import Auth from "../Middlewares/Authentication/index.js";
import Claims from "../Controllers/ClaimsController/Claims.js";
import { reqFields } from "../Models/requiredFields.js";
import multer from "multer";
import { serverError } from "../Utils/Responses/index.js";
const routes = express.Router();
const upload = multer();

// controllers
const claims = new Claims();

// Middlewares
const authControler = new Auth();

// Get All claims
routes.get(
  "/get-claims",
  authControler.verifyToken,
  authControler.checkAuth,
  async (_, res) => {
    try {
      const val = await claims.getClaims();
      return res.status(val.status).send(val);
    } catch (error) {
      return res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

// Add claims API
routes.post(
  "/create-claims",
  upload.none(),
  authControler.verifyToken,
  authControler.checkAuth,
  authControler.checkFields(reqFields.claims),
  async (req, res) => {
    try {
      const val = await claims.createClaims({
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

// Claim Reward Route
routes.post("/claim/:id", authControler.verifyToken, authControler.CheckObjectId, async (req, res) => {
  try {
    const userId = req.query?.userId ?? req.headers?.userid ?? req.headers?.userId;
    const response = await claims.claimReward(userId, req.params?.id);
    return res.status(response.status).send(response);
  } catch (err) {
    return res.status(serverError.status).send(serverError);
  }
});

// Get claims by User ID API
routes.get(
  "/get-user-claims",
  authControler.verifyToken,
  async (req, res) => {
    try {
      let userId = req.query?.userId ?? req.headers?.userid ?? req.headers?.userId;
      const val = await claims.getClaimsById(userId);
      return res.status(val.status).send(val);
    } catch (error) {
      return res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

// Update claims API
routes.put(
  "/update-claim",
  upload.none(),
  authControler.verifyToken,
  authControler.checkAuth,
  async (req, res) => {
    try {
      const val = await claims.updateClaimsById({
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

// Update claims API - Received status
routes.put(
  "/received",
  upload.none(),
  authControler.verifyToken,
  async (req, res) => {
    try {
      const val = await claims.updateClaimsById({ id: req?.body?.id, status: true });
      return res.status(val.status).send(val);
    } catch (error) {
      return res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

// Delete claims API
routes.delete(
  "/delete-claim/:id",
  authControler.checkAuth,
  authControler.CheckObjectId,
  async (req, res) => {
    try {
      const val = await claims.deleteClaimsById(req.params?.id);
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
