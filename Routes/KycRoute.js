import express from "express";
import Auth from "../Middlewares/Authentication/index.js";
import KycDetail from "../Controllers/KycDetailsController/Kyc.js";
import { serverError } from "../Utils/Responses/index.js";
// import multer from "multer";
import { reqFields } from "../Models/requiredFields.js";
import { upload } from "../Utils/Multer/Multer.js";
const routes = express.Router();

// Controllers
const kyc = new KycDetail();

// Middlewares
const authControler = new Auth();
// const upload = multer();

// Get All transaction
routes.get(
  "/get-kyc",
  // authControler.verifyToken,
  // authControler.checkAuth,
  async (req, res) => {
    try {
      let { page, limit = 10 } = req.query;
      const val = await kyc.getKycDetail(page, parseInt(limit));
      res.status(val.status).send(val);
    } catch (error) {
      res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

// Add Kyc API
routes.post(
  "/create-kyc",
  upload.none(),
  authControler.checkFields(reqFields.kyc),
  async (req, res) => {
    try {
      const val = await kyc.createKycDetail({
        ...req.body,
      });
      return res.status(val.status).send(val);
    } catch (error) {
      console.error('Error processing create-kyc:', error);
      return res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);


routes.post("/upload-documents", upload.fields([
  {
    name: "aadharFront",
  },
  {
    name: "aadharBack",
  },
  {
    name: "panFile",
  },
  {
    name: "sign",
  },
]), authControler.checkFields(["userId"]), authControler.checkFiles(reqFields.kycFiles), async (req, res) => {
  try {
    const userId = req.body?.userId;
    const aadharFront = req.files?.["aadharFront"][0];
    const aadharBack = req.files?.["aadharBack"][0];
    const panFile = req.files?.["panFile"][0];
    const sign = req.files?.["sign"][0];
    const result = await kyc.uploadDocument(aadharFront, aadharBack, panFile, sign, userId);
    return res.status(result.status).send(result);
  } catch (err) {
    console.log(err);
    return res.status(serverError.status).send(serverError);

  }
});


// Get KycDetail by Id API
routes.get(
  "/get-kyc-by-id/:id",
  authControler.verifyToken,
  authControler.CheckObjectId,
  async (req, res) => {
    try {
      // Assuming id is sent as a query parameter
      const val = await kyc.getKycDetailById(req.params.id);
      res.status(val.status).send(val);
    } catch (error) {
      res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

// Get KycDetail by User Id API
routes.get(
  "/get-kyc-by-user-id",
  authControler.verifyToken,
  async (req, res) => {
    try {
      const val = await kyc.getKycDetailByUserId(req.body?.userId);
      res.status(val.status).send(val);
    } catch (error) {
      res.status(serverError.status).send({
        ...serverError,
        error,
      });
    }
  }
);

// Update KycDetails API
routes.put(
  "/update-kyc",
  authControler.verifyToken,
  authControler.checkAuth,
  async (req, res) => {
    try {
      const val = await kyc.updateKycById({
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

// Delete KycDetail API
routes.delete(
  "/delete-kyc/:id",
  authControler.checkAuth,
  authControler.verifyToken,
  authControler.CheckObjectId,
  async (req, res) => {
    try {
      const val = await kyc.deleteKycDetailById(req.params?.id);
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
