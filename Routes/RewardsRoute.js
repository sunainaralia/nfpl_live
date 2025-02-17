import express from "express";
import Auth from "../Middlewares/Authentication/index.js";
import { reqFields } from "../Models/requiredFields.js";
import multer from "multer";
import Reward from "../Controllers/RewardController/Reward.js";
import { serverError } from "../Utils/Responses/index.js";

const routes = express.Router();
const upload = multer();

// Controllers
const reward = new Reward();

// Middlewares
const authController = new Auth();

// Get All rewards
// checked
routes.get(
  "/get-rewards",
  authController.verifyToken,
  async (req, res) => {
    try {
      const { page, limit = 10 } = req.query;
      const val = await reward.getRewards(page, parseInt(limit));
      res.status(val.status).send(val);
    } catch (error) {
      return res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

// Add reward API
// checked
routes.post(
  "/create-reward",
  upload.none(),
  authController.verifyToken,
  authController.checkAuth,
  authController.checkFields(reqFields.rewards),
  async (req, res) => {
    try {
      const val = await reward.createReward({
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

// Get Rewards by user Id
routes.get("/get-user-rewards", authController.verifyToken, async (req, res) => {
  try {
    const userId = req.query?.userId ?? req.headers?.userid ?? req.headers?.userId;
    const response = await reward.getRewardByUserId(userId);
    return res.status(response.status).send(response);
  } catch (err) {
    return res.status(serverError.status).send(serverError);
  }
})

// Get reward by Id API
// checked
routes.get(
  "/get-reward-by-id/:id",
  authController.verifyToken,
  authController.checkAuth,
  authController.CheckObjectId,
  async (req, res) => {
    try {
      const val = await reward.getRewardById(req.params?.id);
      res.status(val.status).send(val);
    } catch (error) {
      return res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

// Update reward API
routes.put(
  "/update-reward",
  upload.none(),
  authController.verifyToken,
  authController.checkAuth,
  async (req, res) => {
    try {
      const val = await reward.updateRewardById({
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

// Delete reward API
routes.delete(
  "/delete-reward/:id",
  authController.verifyToken,
  authController.checkAuth,
  authController.CheckObjectId,
  async (req, res) => {
    try {
      const val = await reward.deleteRewardById(req.params?.id);
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
