import InvestmentModel from "../../Models/InvestmentModel.js";
import {
  investmentCreated,
  investmentUpdated,
  investmentDeleted,
  investmentFetched,
  investmentNotExist,
  tryAgain,
  serverError,
  idNotFound,
  notExist,
  InvestmentError,
  barNotExist,
  settingNotExist,
  barNotExistInGivenRange
} from "../../Utils/Responses/index.js";
import { ObjectId } from "mongodb";
import collections from "../../Utils/Collections/collections.js";

const investment = new InvestmentModel();

class InvestmentController {
  constructor() { }

  // Get all investments with pagination
  async getInvestments(page, limit) {
    const skip = parseInt(page) * limit;

    try {
      const investments = await collections
        .investmentCollection()
        .find({})
        .skip(skip)
        .limit(limit)
        .toArray();

      const length = await collections
        .investmentCollection()
        .countDocuments();

      if (investments.length > 0) {
        return {
          ...investmentFetched,
          data: investments,
          length: length,
        };
      } else {
        return investmentNotExist;
      }
    } catch (err) {
      return {
        ...serverError,
        err,
      };
    }
  }

  // Create a new investment
  async createInvestment(body) {
    try {
      const range = parseInt(body.amount);
      const user = body.userId;
      const userData = await collections.userCollection().findOne({ _id: new ObjectId(user) });
      if (!userData) {
        return notExist("User");
      }
      const checkInvestments = await collections.investmentCollection().countDocuments({
        userId: user,
        status: false,
        $or: [{ transactionId: null }, { transactionId: "" }]
      });
      if (checkInvestments > 0) {
        return InvestmentError;
      }
      const bars = await collections.barsCollection().find({ type: "config" }).sort({ range: 1 }).toArray();
      if (bars.length === 0) return barNotExist;
      const settingCollections = await collections.settingsCollection().findOne({ type: "min-range", status: true });
      if (!settingCollections) {
        return settingNotExist;
      }
      const requiredMinInvestment = parseFloat(settingCollections.value);
      if (range < requiredMinInvestment) {
        return barNotExistInGivenRange(requiredMinInvestment);
      }
      const selectedBar = bars.find((bar) => {
        return (range <= bar.range
        );
      });
      if (!selectedBar) {
        return barNotExist;
      }
      const charges = selectedBar.charges;
      const deductedAmount = (range * charges) / 100;
      const deductedRange = range - deductedAmount;
      const investmentConstructor = new InvestmentModel(null, body.userId, selectedBar.title, null, deductedRange, deductedAmount, false, false, new Date(), new Date())
      const result = await collections
        .investmentCollection()
        .insertOne(investmentConstructor.toDatabaseJson());

      if (result && result.insertedId) {
        return {
          ...investmentCreated,
          data: {
            id: result.insertedId,
          },
        };
      } else {
        return tryAgain;
      }
    } catch (error) {
      return {
        ...serverError,
        error,
      };
    }
  }


  // Get investment by ID
  async getInvestmentById(id) {
    try {
      const investmentData = await collections
        .investmentCollection()
        .findOne({ _id: new ObjectId(id) });

      if (!investmentData) {
        return investmentNotExist;
      }

      return {
        ...investmentFetched,
        data: investmentData,
      };
    } catch (err) {
      return {
        ...serverError,
        error: err.message,
      };
    }
  }

  // Update investment by ID
  async updateInvestmentById(body) {
    const { id } = body;
    const updateData = investment.toUpdateJson(body);

    try {
      const result = await collections
        .investmentCollection()
        .updateOne(
          { _id: new ObjectId(id) },
          { $set: { ...updateData } }
        );

      if (result.modifiedCount > 0) {
        return {
          ...investmentUpdated,
        };
      } else {
        return investmentNotExist;
      }
    } catch (err) {
      return {
        ...serverError,
        err,
      };
    }
  }

  // Delete investment by ID
  async deleteInvestmentById(id) {
    try {
      const result = await collections
        .investmentCollection()
        .deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount > 0) {
        return {
          ...investmentDeleted,
        };
      } else {
        return investmentNotExist;
      }
    } catch (err) {
      return {
        ...serverError,
        err,
      };
    }
  }
  // Get investments by userId
  async getInvestmentsByUserId(userId, page = 0, limit = 10) {
    const skip = parseInt(page) * limit;
    try {
      const investments = await collections
        .investmentCollection()
        .find({ userId: userId })
        .skip(skip)
        .limit(limit)
        .toArray();

      const length = await collections
        .investmentCollection()
        .countDocuments({ userId: userId });

      if (investments.length > 0) {
        return {
          ...investmentFetched,
          data: investments,
          length: length,
        };
      } else {
        return investmentNotExist;
      }
    } catch (err) {
      return {
        ...serverError,
        err,
      };
    }
  }

  async getPendingInvestmentById(userid) {
    try {
      const investmentData = await collections.investmentCollection().find({
        userId: userid,
        status: false,
        $or: [{ transactionId: null }, { transactionId: "" }]
      }).toArray();

      if (investmentData.length === 0) {
        return investmentNotExist;
      }

      return {
        ...investmentFetched,
        data: investmentData,
      };
    } catch (err) {
      return {
        ...serverError,
        error: err.message,
      };
    }
  }
}

export default InvestmentController;
