import BarsModel from "../../Models/barsModel.js";
import { barFetched, barCreated, barUpdated, barDeleted, barNotExist, tryAgain, serverError, barNotExistInGivenRange } from "../../Utils/Responses/index.js";
import { ObjectId } from "mongodb";
import collections from "../../Utils/Collections/collections.js";
const bar = new BarsModel();

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
      // Fetch bar by ID
      const barData = await collections.barsCollection().findOne({ _id: new ObjectId(id) });

      // If the bar does not exist
      if (!barData) {
        return barNotExist;
      }

      // If the bar exists, return the data
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
      const bars = await collections.barsCollection().find({}).sort({ range: 1 }).toArray();

      if (bars.length === 0) {
        return barNotExist;
      }
      if (range <= bars[0].range) {
        return barNotExistInGivenRange(bars[0].range)
      }

      let selectedBar = null;
      for (let i = 0; i < bars.length; i++) {
        if (i === bars.length - 1 || (range > bars[i].range && range <= bars[i + 1].range)) {
          selectedBar = bars[i];
          break;
        }
      }
      if (!selectedBar) {
        return barNotExist;
      }
      const yearlyRate = selectedBar.rate;
      const charges = selectedBar.charges;
      const deductedAmount = (range * charges) / 100
      const deductedRange = range - deductedAmount
      const monthlyRate = (yearlyRate / 100);
      const monthlyReturn = deductedRange * monthlyRate;
      return {
        status: 200,
        message: "Bar details are ready!",
        data: {
          id: selectedBar._id,
          title: selectedBar.title,
          range: selectedBar.range,
          rate: selectedBar.rate,
          monthlyReturn: monthlyReturn.toFixed(2),
          type: selectedBar.type,
          status: selectedBar.status,
          tenure: selectedBar.tenure,
          actualInvestment: deductedRange,
          chargesRate: selectedBar.charges,
          charges: deductedAmount,
          createdAt: selectedBar.createdAt,
          updatedAt: selectedBar.updatedAt,
        },
      };
    } catch (err) {
      return serverError;
    }
  }

}

export default BarsController;
