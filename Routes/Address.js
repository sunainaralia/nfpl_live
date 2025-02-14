import express from "express";
import Auth from "../Middlewares/Authentication/index.js";
import Address from "../Controllers/AddressController/Address.js";
import { reqFields } from "../Models/requiredFields.js";
import multer from "multer";

const routes = express.Router();
const upload = multer();

// Controllers ------------------------
const address = new Address();

// Middlewares
const authControler = new Auth();

// Get All addresses
routes.get(
  "/get-address",
  authControler.verifyToken,
  authControler.checkAuth,
  async (req, res) => {
    try {
      const { page, limit = 10 } = req.query;

      const val = await address.getAddress(page, limit);
      res.status(val.status).send(val);
    } catch (error) {
      res.status(serverError.status).send(serverError);
    }
  }
);

// Add address API
routes.post(
  "/create-address",
  upload.none(),
  authControler.addressExist, 
  authControler.checkFields(reqFields.address), 
  async (req, res) => {
    try {
      const val = await address.createAddress({
        ...req.body,
      });
      return res.status(val.status).send(val);
    } catch (error) {
      console.error("Error processing create-address:", error); 
      return res.status(serverError.status).send(serverError);
    }
  }
);


// Get Address by Id API
routes.get(
  "/get-address-by-id/:id",
  authControler.CheckObjectId,
  async (req, res) => {
    try {
      const val = await address.getAddressById(req.params?.id);
      res.status(val.status).send(val);
    } catch (error) {
      console.error("Error fetching address by ID:", error.message);
      res.status(serverError.status).send(serverError);
    }
  }
);

// Get Address by User Id API
routes.get(
  "/get-address-by-user-id/:id",
  authControler.verifyToken,
  async (req, res) => {
    try {
      const val = await address.getAddressByUserId({
        ...req.params?.id,
      });
      res.status(val.status).send(val);
    } catch (error) {
      console.error("Error fetching address by user ID:", error.message);
      res.status(serverError.status).send(serverError);
    }
  }
);

// Get Address by postal code
routes.get(
  "/get-address-by-postal-code/:code/",
  authControler.verifyToken,
  async (req, res) => {
    try {
      const { code } = req.params;
      const { page, limit = 10 } = req.query;
      const val = await address.getAddressBycode(code, page, limit);
      res.status(val.status).send(val);
    } catch (error) {
      console.error("Error fetching address by user ID:", error.message);
      res.status(serverError.status).send(serverError);
    }
  }
);

// Update address API
routes.put(
  "/update-address",
  upload.none(),
  authControler.verifyToken,
  async (req, res) => {
    try {
      const val = await address.updateAddress({
        ...req.body,
      });
      res.status(val.status).send(val);
    } catch (error) {
      console.error("Error updating address:", error.message);
      res.status(serverError.status).send(serverError);
    }
  }
);

// Delete Address API
routes.delete(
  "/delete-address/:id",
  authControler.verifyToken,
  authControler.CheckObjectId,
  authControler.checkAuth,
  async (req, res) => {
    try {
      const val = await address.deleteAddressById(req.params?.id);
      res.status(val.status).send(val);
    } catch (error) {
      console.error("Error deleting address:", error.message);
      res.status(serverError.status).send(serverError);
    }
  }
);

export default routes;
