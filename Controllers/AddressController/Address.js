import {
  ObjectId
} from "mongodb";
import {
  columnUpdated,
  columnCreated,
  InvalidId,
  fetched,
  serverError,
  tryAgain,
  notExist,
} from "../../Utils/Responses/index.js";
import AddressModel from "../../Models/addressModel.js";
import collections from "../../Utils/Collections/collections.js";

const address = new AddressModel();

// Collections
const collection = collections;

class Address {

  constructor() { }
  // checked
  async getAddress(page, limit) {
    const skip = parseInt(page) * limit;
    try {
      const result = await collection.addCollection().find({}).skip(skip).limit(limit).toArray();
      if (result.length > 0) {
        let data = [];
        result.map((e) => {
          data.push(address.fromJson(e));
        });
        return {
          ...fetched("Address"),
          data: data
        };
      } else {
        return tryAgain;
      }
    } catch (err) {
      return {
        ...serverError,
        err
      };
    }
  }
  // checked
  async createAddress(body) {
    const add = new AddressModel(body.userId, body.street, body.city, body.state, body.country, body.postalCode, new Date(), new Date());
    try {
      const result = await collection.addCollection().insertOne(add.toDatabaseJson());
      if (result && result.insertedId) {
        console.log(add)
        return {
          ...columnCreated("Address"),
          data: {
            id: result.insertedId,
            userId: add.userId
          }
        };
      } else {
        return tryAgain;
      }
    } catch (error) {
      console.error("Error creating address:", error); // Log error for debugging
      return serverError;
    }
  }

  // checked
  async getAddressByUserId(id) {
    try {
      const userId = typeof id === 'object' ? Object.values(id).join('') : id;

      // Now try the query with both ObjectId and string formats
      const result = await collection.addCollection()
        .find({
          $or: [
            { userId: new ObjectId(userId) },
            { userId: userId },
            { "userId": new ObjectId(userId) },
            { "userId": userId }
          ]
        })
        .toArray();

      if (result.length > 0) {
        return {
          ...fetched("Address"),
          data: result
        };
      } else {
        return InvalidId("User");
      }
    } catch (err) {
      console.error("Error in getAddressByUserId:", err);
      return {
        ...serverError,
        err
      };
    }
  }
  // checked
  async getAddressById(id) {
    try {
      const result = await collection.addCollection().findOne({
        _id: new ObjectId(id),
      });
      if (result) {
        let data = new AddressModel().fromJson(result);
        return {
          ...fetched("Address"),
          data: data
        };
      } else {
        return InvalidId("Address");
      }
    } catch (err) {
      return {
        ...serverError,
        err
      };
    }
  }
  // checked
  async updateAddress(body) {
    try {
      const { userId } = body;

      if (!userId) {
        console.log("Invalid User ID .....")
        return InvalidId("User");
      }

      // Check if the address exists for the given userId
      const addressExists = await collection.addCollection().findOne({ userId: userId });
      console.log(addressExists);
      if (!addressExists) {
        console.log("Address not found for User ID:", userId);
        return {
          status: 400,
          type: "invalid",
          message: "Invalid Address ID"
        };
      }

      // Convert the rest of the fields for the update
      const add = address.toUpdateJson(body);
      console.log("add.............", add);

      // Perform the update operation using userId as a string
      const result = await collection.addCollection().updateOne(
        { userId: userId },
        { $set: add }
      );

      if (result.modifiedCount > 0) {
        // Fetch the updated address from the database
        const updatedAddress = await collection.addCollection().findOne({ userId: userId });
        console.log("Updated Address:", updatedAddress);

        return {
          ...columnUpdated("Address"),
          data: updatedAddress  
        };
      } else {
        return InvalidId("Address");
      }
    } catch (err) {
      console.error("Error updating address:", err);
      return {
        ...serverError,
        error: err.message
      };
    }
  }


  // checked
  async getAddressBycode(code, page, limit) {
    let skip = parseInt(page) * limit;
    try {
      const res = await collection.addCollection().find({
        postalCode: code
      }).skip(skip).limit(limit).toArray();
      if (res && res.length > 0) {
        return {
          ...fetched("Address"),
          data: res
        };
      }
      return notExist("Address");
    } catch (err) {
      return {
        ...serverError,
        err
      };

    }
  }

  async deleteAddressById(id) {
    try {
      const result = await collection.addCollection().deleteOne({
        userId: id.toLowerCase(),
      });
      if (result.deletedCount > 0) {
        return {
          ...transaction("deleted")
        };
      } else {
        return InvalidId("Address");
      }
    } catch (err) {
      console.error("Error:", err);
      return {
        ...serverError,
        err
      };
    }
  }
}

export default Address;