import BarsModel from "../../Models/barsModel.js";
import { barFetched, barCreated, barUpdated, barDeleted, barNotExist, tryAgain, serverError } from "../../Utils/Responses/index.js";
import { ObjectId } from "mongodb";
import collections from "../../Utils/Collections/collections.js";
const bar = new BarsModel();

class BarsController {
  constructor() {}

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
  //  checked
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
  // checked
  async getBarById(id) {
    try {
      // Fetch bar by ID
      const barData = await collections.barsCollection().findOne({ _id: new ObjectId(id) });

      // If the bar does not exist
      if (!barData) {
        return barNotExist;  // Return barNotExist response if no data found
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
}

export default BarsController;
