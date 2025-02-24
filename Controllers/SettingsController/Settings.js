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
import SettingsModel from "../../Models/settingsModel.js";
import collections from "../../Utils/Collections/collections.js";


//Settings Model
const settingsModel = new SettingsModel();

class Settings {
  constructor() { }

  // Get all Settingss controller
  async getSettings(page, limit) {
    let skip = parseInt(page) * limit;
    try {
      const result = await collections
        .settingsCollection()
        .find({})
        .skip(skip)
        .limit(limit)
        .toArray();

      if (result.length > 0) {

        return {
          ...fetched("Settings"),
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

  // Create new Settings controller
  async createSettings(body) {
    const settings = SettingsModel.fromJson(body);

    try {
      const result = await collections
        .settingsCollection()
        .insertOne(settings.toDatabaseJson());

      if (result && result.insertedId) {
        return {
          ...columnCreated("Settings"),
          data: {
            id: result.insertedId,
          },
        };
      } else {
        console.error("Insert failed, result:", result);
        return tryAgain;
      }
    } catch (error) {
      console.error("Error during insert:", error); 
      return {
        ...serverError,
        error,
      };
    }
  }


  // Get Settings by id controller
  async getSettingsById(id) {
    try {
      const result = await collections.settingsCollection().findOne({
        _id: new ObjectId(id),
      });
      if (result) {
        let data = settingsModel.fromJson(result);
        return {
          ...fetched("Settings"),
          data: data,
        };
      } else {
        return InvalidId("Settings Detail");
      }
    } catch (err) {
      return {
        ...serverError,
        err,
      };
    }
  }

  async updateSettingsById(body) {
    try {
      const { id } = body;
      const add = settingsModel.toUpdateJson(body);

      const result = await collections.settingsCollection().updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $set: {
            ...add,
          },
        }
      );

      if (result.acknowledged && result.modifiedCount > 0) {
        return {
          ...columnUpdated("Settings"),
        };
      } else {
        return InvalidId("Settings");
      }
    } catch (err) {
      return {
        ...serverError,
        err,
      };
    }
  }

  async deleteSettingsById(id) {
    try {
      const result = await collections.settingsCollection().deleteOne({
        _id: new ObjectId(id),
      });
      if (result.deletedCount > 0) {
        return {
          ...deleted("Settings"),
        };
      } else {
        return InvalidId("Settings");
      }
    } catch (err) {
      return {
        ...serverError,
        err,
      };
    }
  }

  async authSettings(type, status, session) {
    const settings = await collections.settingsCollection().findOne({
      type: type,
      status: status,
    }, { session });
    if (settings) {
      let newsettings = settings.fromJson(settings);
      return newsettings;
    }
    return null;
  }

  async getSettingsByType(type) {
    try {
      const result = await collections
        .settingsCollection()
        .findOne({ $and: [{ type: type }, { status: true }] });

      if (result && result.status) {
        return { ...fetched(type), data: result };
      } else {
        return notExist(type);
      }
    } catch (err) {
      console.log(err);
      return serverError;
    }
  }
};

export default Settings;
