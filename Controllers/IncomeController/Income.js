import { ObjectId } from "mongodb";
import {
  columnUpdated,
  columnCreated,
  InvalidId,
  fetched,
  serverError,
  tryAgain,
  deleted,
  notExist,
} from "../../Utils/Responses/index.js";
import IncomeModel from "../../Models/incomeModel.js";
import collections from "../../Utils/Collections/collections.js";
// Model instance
const income = new IncomeModel();

class IncomeController {

  constructor() { }

  // Get all income logs, only by admin
  async getIncomeLogs(limit, page) {
    let skip = parseInt(page) * limit;
    try {
      const result = await collections.incomeCollection().find({}).skip(skip).limit(limit).toArray();
      if (result.length > 0) {
        return {
          ...fetched("Income Logs"),
          data: result,
        };
      } else {
        return notExist("Income Logs");
      }
    } catch (err) {
      return {
        ...serverError,
        err,
      };
    }
  }

  // Create new income entry
  async createIncome(body) {
    try {
      const newIncome = income.fromJson(body);
      const result = await collections.incomeCollection().insertOne(newIncome.toDatabaseJson());

      if (result && result.insertedId) {
        return {
          ...columnCreated("Income"),
          data: {
            id: result.insertedId,
          },
        };
      } else {
        return tryAgain;
      }
    } catch (err) {
      return {
        ...serverError,
        err,
      };
    }
  }

  // Get income log by specific userId
  async getIncomeByUserId(userId, page, limit) {
    let skip = parseInt(page) * limit;
    try {
      const result = await collections.incomeCollection().find({ userId }).skip(skip).limit(limit).toArray();
      if (result.length > 0) {
        return {
          ...fetched("Income Logs for user"),
          data: result,
        };
      } else {
        return notExist("Income Logs");
      }
    } catch (err) {
      return {
        ...serverError,
        err,
      };
    }
  }

  // Get income log by ID
  async getIncomeById(id) {
    try {
      const result = await collections.incomeCollection().findOne({ _id: new ObjectId(id) });
      if (result) {
        const incomeData = income.fromJson(result);
        return {
          ...fetched("Income Log"),
          data: incomeData,
        };
      } else {
        return InvalidId("Income Log");
      }
    } catch (err) {
      return {
        ...serverError,
        err,
      };
    }
  }

  // Update income log by ID
  async updateIncomeById(body) {
    try {
      const { id } = body;
      const updateData = income.toUpdateJson(body);

      const result = await collections.incomeCollection().updateOne(
        { _id: new ObjectId(id) },
        {
          $set: updateData,
        }
      );

      if (result.modifiedCount > 0) {
        return {
          ...columnUpdated("Income"),
          data: result,
        };
      } else {
        return InvalidId("Income Log");
      }
    } catch (err) {
      return {
        ...serverError,
        err,
      };
    }
  }

  // Delete income log by ID
  async deleteIncomeById(id) {
    try {
      const result = await collections.incomeCollection().deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount > 0) {
        return {
          ...deleted("Income Log"),
        };
      } else {
        return InvalidId("Income Log");
      }
    } catch (err) {
      return {
        ...serverError,
        err,
      };
    }
  }

}

export default IncomeController;
