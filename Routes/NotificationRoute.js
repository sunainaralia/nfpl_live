import express from "express";
import Auth from "../Middlewares/Authentication/index.js";
import { reqFields } from "../Models/requiredFields.js";
import Notifications from "../Controllers/NotificationController/Notifications.js";
import multer from "multer";
import { serverError } from "../Utils/Responses/index.js";
const routes = express.Router();
const upload = multer();

// Controllers
const authMiddleware = new Auth();
const notifications = new Notifications();

// Get All Notifications
routes.get(
  "/get-notifications",
  authMiddleware.verifyToken,
  async (req, res) => {
    try {
      const { page = 0, limit = 10 } = req.query;
      const result = await notifications.getNotifications(
        page,
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

// User Registration API
routes.post(
  "/create-notifications",
  upload.none(),
  authMiddleware.checkAuth,
  authMiddleware.checkFields(reqFields.notif),
  async (req, res) => {
    try {
      const result = await notifications.createNotification(req.body);
      res.status(result.status).send(result);
    } catch (error) {
      return res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

// Get NOtification by Id and mark read
routes.get(
  "/get-notification-by-id/:id",
  authMiddleware.CheckObjectId,
  authMiddleware.verifyToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const result = await notifications.getNotificationById(id);
      res.status(result.status).send(result);
    } catch (error) {
      return res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

// Get NOtification by Id and mark read
routes.get(
  "/get-user-notification",
  authMiddleware.verifyToken,
  async (req, res) => {
    try {
      let { page = 0, limit = 100 } = req.query;
      const userId = req.query?.userId ?? req.headers?.userid ?? req.headers?.userId;
      const result = await notifications.getUserNotification(
        userId,
        page,
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

// Update Notifications
routes.put(
  "/update-notification",
  upload.none(),
  authMiddleware.checkAuth,
  async (req, res) => {
    try {
      const result = await notifications.updateNotification({
        ...req.body,
      });
      res.status(result.status).send(result);
    } catch (error) {
      return res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

// mark as read
routes.put("/mark-read", authMiddleware.verifyToken, async (req, res) => {
  try {
    const userId = req.headers?.userid ?? req.headers?.userId ?? req.body?.userId;
    const response = await notifications.markRead(userId);
    return res.status(response.status).send(response);
  } catch (err) {
    return res.status(serverError.status).send(serverError);

  }
})

routes.delete(
  "/delete-notifications",
  authMiddleware.verifyToken,
  async (req, res) => {
    try {
      const userId = req.headers?.userid ?? req.headers?.userId ?? req.body?.userId;
      const result = await notifications.deleteNotification(
        userId
      );
      return res.status(result.status).send(result);
    } catch (err) {
      return res.status(serverError.status).send({
        ...serverError,
        err,
      });
    }
  }
);

export default routes;
