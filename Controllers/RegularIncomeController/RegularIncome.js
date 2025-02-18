import { ObjectId } from "mongodb";
import {
  columnUpdated,
  columnCreated,
  InvalidId,
  fetched,
  serverError,
  tryAgain,
  deleted,
} from "../../Utils/Responses/index.js";
import RegularIncomeModel from "../../Models/regularIncomeModel.js";
import collections from "../../Utils/Collections/collections.js";

const regularIncomeModel = new RegularIncomeModel();

class RegularIncome {
  constructor() { }

  async getRegularIncomes(page, limit) {
    let skip = parseInt(page) * limit;
    try {
      const result = await collections
        .regularIncomeCollection()
        .find({})
        .skip(skip)
        .limit(limit)
        .toArray();

      if (result.length > 0) {
        return {
          ...fetched("Regular Incomes"),
          data: result,
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

  async createRegularIncome(body) {
    const regularIncome = RegularIncomeModel.fromJson(body);

    try {
      const result = await collections
        .regularIncomeCollection()
        .insertOne(regularIncome.toDatabaseJson());

      if (result && result.insertedId) {
        return {
          ...columnCreated("Regular Income"),
          data: { id: result.insertedId },
        };
      } else {
        return tryAgain;
      }
    } catch (error) {
      return { ...serverError, error };
    }
  }

  async getRegularIncomeById(id) {
    try {
      const result = await collections.regularIncomeCollection().find({
        userId: new ObjectId(id),
      }).toArray();
      if (result) {
        return { ...fetched("Regular Income"), data: result };
      } else {
        return InvalidId("User");
      }
    } catch (err) {
      return { ...serverError, err };
    }
  }

  async updateRegularIncomeById(body) {
    try {
      const { id } = body;
      const updateData = regularIncomeModel.toUpdateJson(body);

      const result = await collections.regularIncomeCollection().updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.acknowledged && result.modifiedCount > 0) {
        return { ...columnUpdated("Regular Income") };
      } else {
        return InvalidId("Regular Income");
      }
    } catch (err) {
      return { ...serverError, err };
    }
  }

  async deleteRegularIncomeById(id) {
    try {
      const result = await collections.regularIncomeCollection().deleteOne({
        _id: new ObjectId(id),
      });
      if (result.deletedCount > 0) {
        return { ...deleted("Regular Income") };
      } else {
        return InvalidId("Regular Income");
      }
    } catch (err) {
      return { ...serverError, err };
    }
  }
}

export default RegularIncome;
