import express from "express";
import User from "../Controllers/UserController/Users.js";
import Auth from "../Middlewares/Authentication/index.js";
// import multer from "multer";
import ifsc from "ifsc";
import { noIfsc, serverError, signUp } from "../Utils/Responses/index.js";
import { reqFields } from "../Models/requiredFields.js";
import { upload } from "../Utils/Multer/Multer.js";
// const upload = multer();
const routes = express.Router();

// Controllers
const userController = new User();
const authMiddleware = new Auth();

// Get All Users
routes.get(
  "/get-users",
  authMiddleware.verifyToken,
  authMiddleware.checkAuth,
  async (req, res) => {
    try {
      const { page = 0, limit = 10 } = req.query;
      const result = await userController.getUsers(page, parseInt(limit));
      return res.status(result.status).send(result);
    } catch (error) {
      return res.status(serverError.status).send(serverError);
    }
  }
);

// User Login API
routes.post(
  "/login",
  upload.none(),
  authMiddleware.checkFields(["userId", "password"]),
  authMiddleware.checkPassword,
  userController.login
);

routes.get(
  "/validate-user",
  upload.none(),
  authMiddleware.verifyToken,
  async (req, res) => {
    try {

      let userId = req.headers?.userid ?? req.headers?.userId;
      const result = await userController.completeProfile(userId);
      return res.status(result.status).send(result);
    } catch (err) {
      console.log(err);
      return res.status(serverError.status).send(serverError);
    }
  }
);

routes.post(
  "/sponsor-now",
  upload.none(),
  authMiddleware.checkFields(["referralKey"]),
  async (req, res) => {
    try {
      const response = await userController.sponsorNow(req?.body?.referralKey);
      return res.status(response.status).send(response);
    } catch (err) {
      return res.status(serverError.status).send(serverError);
    }
  }
);

// Ger pending Verifications request
routes.get("/get-verifications", authMiddleware.verifyToken, authMiddleware.checkAuth, async (_, res) => {
  try {
    const result = await userController.getPendingVerifications();
    return res.status(result.status).send(result);
  } catch (err) {
    return res.status(serverError.status).send(serverError);
  }
});

// User Registration API
routes.post(
  "/register-user",
  upload.none(),
  authMiddleware.checkFields(reqFields.user),
  authMiddleware.userExists,
  authMiddleware.checkPassword,
  async (req, res) => {
    try {
      const result = await userController.register(req.body);
      return res.status(result.status).send(result);
    } catch (error) {
      return res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

// Activate connection and generate income
routes.post(
  "/activate-connection",
  upload.none(),
  authMiddleware.verifyToken,
  authMiddleware.checkFields(["connectionId"]),
  authMiddleware.isValidUserId,
  async (req, res) => {
    try {
      const result = await userController.updateUsersIncome(
        req.body
      );
      return res.status(result.status).send(result);
    } catch (error) {
      return res.status(serverError.status).send(serverError);
    }
  }
);

// Get User Members
routes.get(
  "/get-members/",
  authMiddleware.verifyToken,
  async (req, res) => {
    try {
      let userId
      if (req.query?.userId) {
        userId = req.query?.userId
      } else {
        userId = req.headers?.userid ?? req.headers?.userId
      }
      const result = await userController.getMembers(userId);
      return res.status(result.status).send(result);
    } catch (error) {
      return res.status(serverError.status).send(serverError);
    }
  }
);

// Forget Password API
routes.post(
  "/forget-password",
  upload.none(),
  authMiddleware.checkFields(["userId"]),
  async (req, res) => {
    try {
      const result = await userController.forgetPass(req, req.body?.userId);
      return res.status(result.status).send(result);
    } catch (error) {
      return res.status(serverError.status).send(serverError);
    }
  }
);
// reset password
routes.post("/reset-password",
  upload.none(),
  authMiddleware.verifyTokenAndExtractId,
  authMiddleware.checkFields(["password"]),
  async (req, res) => {
    try {
      const result = await userController.resetPassword(req, req.body?.password);
      return res.status(result.status).send(result);
    } catch (error) {
      console.error(error);
      return res.status(serverError.status).send(serverError);
    }
  }
);

// Get User by user Id API
routes.get(
  "/get-user-by-id/",
  authMiddleware.verifyToken,
  async (req, res) => {
    try {
      let userId = req.headers?.userid ?? req.headers?.userId;
      if (req.query && req.query.hasOwnProperty("userId") && req.query?.userId) {
        userId = req.query?.userId;
      }
      const result = await userController.getUserById(userId);
      res.status(result.status).send(result);
    } catch (error) {
      res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

routes.post(
  "/verify-otp",
  upload.none(),
  authMiddleware.checkFields(["userId", "otp"]),
  userController.verifyOtp
);

routes.post(
  "/send-otp",
  upload.none(),
  authMiddleware.checkFields(["userId"]), async (req, res) => {
    try {
      const { userId } = req.body;
      const result = await userController.sendOtp(userId);
      return res.status(result.status).send(result);
    } catch (err) {
      console.log(err);
      return res.status(serverError.status).send(serverError);

    }
  }
);

// Update User API
routes.put(
  "/update-user",
  upload.none(),
  authMiddleware.verifyToken,
  async (req, res) => {
    try {
      const result = await userController.updateUser({
        ...req.body,
      });
      return res.status(result.status).send(result);
    } catch (error) {
      return res.status(serverError.status).send(serverError);
    }
  }
);

routes.get("/ifsc-validate/:ifsc", async (req, res) => {
  try {
    if (req.params?.ifsc && ifsc.validate(req.params?.ifsc)) {
      let result = await ifsc.fetchDetails(req.params?.ifsc);
      return res.status(200).send({
        status: 200,
        data: result,
      });
    }
    return res.status(noIfsc.status).send(noIfsc);
  } catch (err) {
    return res.status(serverError.status).send(serverError);
  }
});

// Change Password API
routes.put(
  "/change-password",
  upload.none(),
  authMiddleware.verifyToken,
  authMiddleware.checkFields(["userId", "password", "confirmPassword", "oldPassword"]),
  authMiddleware.matchPassworrd,
  authMiddleware.checkPassword,
  async (req, res) => {
    try {
      const result = await userController.changePassword(req.body);
      return res.status(result.status).send(result);
    } catch (error) {
      return res.status(serverError.status).send(serverError);
    }
  }
);

// Update Profile Photo API
routes.put(
  "/update-profile-image",
  upload.single("image"),
  authMiddleware.verifyToken,
  async (req, res) => {
    try {
      let userId = req.headers?.userid ?? req.headers?.userId ?? req.headers?.id;
      const result = await userController.changePhoto(userId, req.file)
      return res.status(result.status).send(result);
    } catch (error) {
      return res.status(serverError.status).send(serverError);
    }
  }
);

routes.delete("/delete-user/:id", authMiddleware.verifyToken, authMiddleware.checkAuth, async (req, res) => {
  try {
    const result = await userController.deleteUsers(req?.params?.id);
    return res.status(result.status).send(result);
  } catch (err) {
    return res.status(serverError.status).send(serverError);
  }
});
routes.post(
  "/update-user-income",
  authMiddleware.verifyToken,
  // authMiddleware.checkAuth,
  authMiddleware.checkFields(["investmentId"]),
  async (req, res) => {
    try {
      const result = await userController.updateUsersIncome(req);
      return res.status(result.status).send(result);
    } catch (error) {
      console.error("Error updating user income:", error);
      return res.status(serverError.status).send(serverError);
    }
  }
);
routes.post(
  "/update-user-ror",
  authMiddleware.verifyToken,
  // authMiddleware.checkAuth,
  authMiddleware.checkFields(["id"]),
  async (req, res) => {
    try {
      const result = await userController.updateUserRor(req);
      return res.status(result.status).send(result);
    } catch (error) {
      console.error("Error updating user income:", error);
      return res.status(serverError.status).send(serverError);
    }
  }
);
routes.get(
  "/get-income-graph/:userId",
  authMiddleware.verifyToken,
  async (req, res) => {
    try {
      const result = await userController.getIncomeGraph(req);
      return res.status(result.status).send(result);
    } catch (error) {
      console.error("Error updating user income:", error);
      return res.status(serverError.status).send(serverError);
    }
  }
);
routes.get(
  "/get-team-investment-graph",
  authMiddleware.verifyToken,
  async (req, res) => {
    try {
      const result = await userController.getTeamInvestments(req);
      return res.status(result.status).send(result);
    } catch (error) {
      console.error("Error getting team invetment:", error);
      return res.status(serverError.status).send(serverError);
    }
  }
);
routes.put(
  "/release-roi",
  authMiddleware.verifyToken,
  authMiddleware.checkFields(["transactionId"]),
  async (req, res) => {
    try {
      const result = await userController.releaseRoi(req);
      return res.status(result.status).send(result);
    } catch (error) {
      console.error("Error getting team invetment:", error);
      return res.status(serverError.status).send(serverError);
    }
  }
);

export default routes;
