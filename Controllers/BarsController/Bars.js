import BarsModel from "../../Models/barsModel.js";
import { barFetched, barCreated, barUpdated, barDeleted, barNotExist, tryAgain, serverError, barNotExistInGivenRange, settingNotExist } from "../../Utils/Responses/index.js";
import { ObjectId } from "mongodb";
import collections from "../../Utils/Collections/collections.js";
import Auth from "../../Middlewares/Authentication/index.js";
const bar = new BarsModel();
const authentications = new Auth();
class BarsController {
  constructor() { }

  // Get all bars based on the type
  async getBars(page, limit, type) {
    try {
      const skip = parseInt(page) * limit;
      const bars = await collections.barsCollection().find({ type: type }).skip(skip).limit(parseInt(limit)).toArray();
      const length = await collections.barsCollection().countDocuments({ type: type });

      if (bars.length > 0) {
        return {
          ...barFetched,
          data: bars,
          length: length,
        };
      } else {
        return barNotExist;
      }
    } catch (err) {
      return {
        ...serverError,
        err,
      };
    }
  }

  // Create a new bar
  async createBar(body) {
    const responses = bar.fromJson(body);
    try {
      const result = await collections.barsCollection().insertOne(responses.toDatabaseJson());
      if (result && result.insertedId) {
        return {
          ...barCreated,
          data: { id: result.insertedId },
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

  // Update a bar by ID
  async updateBarById(body) {
    try {
      const { id } = body;
      const updateData = bar.toUpdateJson(body);
      const result = await collections.barsCollection().updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...updateData } }
      );

      if (result.modifiedCount > 0) {
        return {
          ...barUpdated,
        };
      } else {
        return barNotExist;
      }
    } catch (err) {
      return {
        ...serverError,
        err,
      };
    }
  }

  // Delete a bar by ID
  async deleteBarById(id) {
    try {
      const result = await collections.barsCollection().deleteOne({
        _id: new ObjectId(id),
      });

      if (result.deletedCount > 0) {
        return {
          ...barDeleted,
        };
      } else {
        return barNotExist;
      }
    } catch (err) {
      return {
        ...serverError,
        err,
      };
    }
  }
  // Get Bar by ID
  async getBarById(id) {
    try {
      const barData = await collections.barsCollection().findOne({ _id: new ObjectId(id) });
      if (!barData) {
        return barNotExist;
      }
      return {
        ...barFetched,
        data: barData,
      };
    } catch (err) {
      return {
        ...serverError,
        error: err.message,
      };
    }
  }

  // Get bar by range and calculate monthly return
  async getBarByRange(range) {
    try {
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
      const yearlyRate = selectedBar.rate;
      const charges = selectedBar.charges;
      const deductedAmount = (range * charges) / 100
      const deductedRange = range - deductedAmount
      const monthlyRate = (yearlyRate / 100);
      const monthlyReturn = deductedRange * monthlyRate;
      const barModels = new BarsModel(
        selectedBar._id,
        selectedBar.adminId,
        selectedBar.title,
        selectedBar.range,
        selectedBar.rate,
        selectedBar.type,
        selectedBar.status,
        selectedBar.tenure,
        deductedAmount,
        selectedBar.createdAt,
        selectedBar.updatedAt
      )
      const responseData = barModels.toClientJson();
      const actualResponseData = { ...responseData, monthlyReturn: monthlyReturn.toFixed(2), actualInvestment: deductedRange, chargesRate: selectedBar.charges }
      delete actualResponseData.adminId;
      return {
        ...barFetched,
        data: actualResponseData,
      };
    } catch (err) {
      return serverError;
    }
  }

}

export default BarsController;
