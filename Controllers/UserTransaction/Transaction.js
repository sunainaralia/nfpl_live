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
  unauthorized,
  walletMsg,
  withdrawRejected,
  transaction,
  idNotFound,
  barNotExist,
  barNotExistInGivenRange,
  settingNotExist,
  AdequateInvestmentAmount
} from "../../Utils/Responses/index.js";
import UserTransactionModel from "../../Models/transactionModel.js";
import Notifications from "../NotificationController/Notifications.js";
import {
  amountAdded,
  amountWithdraw,
  transactionMade,
  transfered,
} from "../../Utils/Notifications/index.js";
import User from "../UserController/Users.js";
import collections from "../../Utils/Collections/collections.js";
import { client } from "../../dbConnection.js";
import { options, sendMail, transponder } from "../../Utils/Mailer/index.js";
import InvestmentModel from "../../Models/InvestmentModel.js";
import Auth from "../../Middlewares/Authentication/index.js";
// import { sendSms } from "../../Mailer/smsService.js";

// Models
const userTrans = new UserTransactionModel();

// User Controller
const user = new User();
const authentications = new Auth();
class UserTrans extends Notifications {
  constructor() {
    super();
  }

  // Get User Transactions with default limit 10
  async getUserTrans(page, limit) {
    let skip = (page) * limit;
    try {
      const result = await collections
        .transCollection()
        .find({})
        .skip(skip)
        .limit(limit)
        .toArray();
      const totalTransactions = await collections
        .transCollection()
        .countDocuments({});
      if (result.length > 0) {
        return {
          ...fetched("User Transaction"),
          data: result,
          length: totalTransactions
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

  // Static Add Transaction Function
  async addTransaction(transaction) {
    const result = await collections.transCollection().insertOne(transaction);
    if (result.acknowledged && result.insertedId) {
      return result;
    }
    return null;
  }

  // Create new purchase transaction
  async createPurchase(body) {
    try {
      const transactionbody = {
        ...body,
      };

      if (!body?.status) {
        return tryAgain;
      }

      const connection = await collections.connCollection().findOne({
        _id: new ObjectId(body.id),
      });

      const invoiceNo = await collections.transCollection().countDocuments();
      if (!connection || connection.status || ObjectId.isValid(connection?.transactionId)) {
        return InvalidId("connection");
      }

      transactionbody.amount = parseFloat(connection.amount + (connection?.amount * connection?.tax) / 100);

      if (body.amount !== parseFloat(transactionbody.amount)) {
        return unauthorized;
      }

      transactionbody.userId = connection.userId;
      transactionbody.transactionId = new ObjectId().toString(); // Generate a new transaction ID
      transactionbody.invoiceNo = invoiceNo + 1;

      const result = await this.addTransaction(userTrans.fromJson(transactionbody).toDatabaseJson());
      if (result) {
        await collections.connCollection().updateOne(
          {
            _id: new ObjectId(body.id),
          },
          {
            $set: {
              transactionId: result.insertedId.toString(),
            },
          }
        );
        await this.newNotification(transactionMade(transactionbody.userId, result.insertedId));
        // Send SMS, etc.

        return {
          ...columnCreated("Transaction"),
          data: {
            data: result.insertedId,
          },
        };
      }
      return tryAgain;
    } catch (err) {
      console.log(err);
      return {
        ...serverError,
        ...err,
      };
    }
  }

  // Create new user transaction (for other types)
  // async createTransaction(body) {
  //   const trans = userTrans.fromJson(body);

  //   try {
  //     const slab = await collections.slabCollection().findOne({ type: "oumvest" });

  //     if (!slab) {
  //       return tryAgain;
  //     }

  //     let user;

  //     trans.amount += trans.amount / 100 * trans.charges;

  //     if (trans.type === "new-connection (loan)") {
  //       let amount = trans.amount;
  //       amount += parseInt(amount * 14.6 / 100);

  //       user = await collections.userCollection().findOneAndUpdate(
  //         { userId: trans.userId },
  //         { $inc: { wallet: -amount } },
  //         { returnDocument: "after" }
  //       );
  //     } else {
  //       user = await collections.userCollection().findOne({ userId: trans.userId });
  //     }

  //     if (user && user.userId) {
  //       const invoiceNo = await collections.transCollection().countDocuments() + 1;
  //       trans.invoiceNo = invoiceNo;
  //       trans.status = false;

  //       const result = await collections.transCollection().insertOne(trans.toDatabaseJson());

  //       if (result && result.insertedId) {
  //         let option = options(user.email, "Oumvest Transaction Code Generated", transaction(user.userId, trans.amount, result.insertedId, user.fullName));
  //         await transponder.verify();
  //         await sendMail(option);

  //         return {
  //           ...columnCreated("Transaction"),
  //           data: { id: result.insertedId }
  //         };
  //       } else {
  //         return tryAgain;
  //       }
  //     } else {
  //       return idNotFound;
  //     }
  //   } catch (error) {
  //     return serverError;
  //   }
  // }

  // Create new user transaction on type based
  async createUserTrans(body) {
    try {
      const trans = userTrans.fromJson(body);
      if (!body?.status) {
        return unauthorized;
      }
      trans.status = trans.type !== "withdraw";
      const invoiceNo = await collections.transCollection().countDocuments();
      trans.invoiceNo = invoiceNo ?? 0;
      const wallet = await user.updateUserWallet(
        trans.userId.toLowerCase(),
        parseFloat(trans.amount),
        trans.type,
      );

      // Add Notification
      if (wallet) {
        let result = await this.addTransaction(trans.toDatabaseJson());
        let notification = amountWithdraw(
          trans.userId,
          result.insertedId.toString(),
          trans.amount
        );

        await this.newNotification({
          ...notification,
        });
        // Send SMS, etc.

        let message = walletMsg(trans.type);
        return {
          ...message,
          data: {
            id: result.insertedId,
          },
        };
      }
      return tryAgain;
    } catch (error) {
      return {
        ...serverError,
        error,
      };
    }
  }

  // Get User Transactions by User ID for specific month and year
  async getUserTransByUserId(id, month, year, page, limit) {
    let value = id.toLowerCase();

    try {
      let skip = page * limit;
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      const result = await collections
        .transCollection()
        .find({
          $and: [{
            userId: value,
          }]
        }).skip(skip)
        .limit(limit)
        .toArray();
      const totalTransactions = await collections
        .transCollection()
        .countDocuments({
          userId: value,
        });

      if (result && result.length > 0) {
        return {
          ...fetched("User Transaction"),
          data: result,
          length: totalTransactions
        };
      } else {
        return notExist("transaction");
      }
    } catch (err) {
      console.log(err);
      return {
        ...serverError,
        err,
      };
    }
  }

  // Get selected User Transaction by ID
  async getUserTransById(id) {
    try {
      const result = await collections.transCollection().findOne({
        _id: new ObjectId(id),
      });
      if (result) {
        let data = userTrans.fromJson(result);
        return {
          ...fetched("User Transaction"),
          data: data,
        };
      } else {
        return InvalidId("User Transaction");
      }
    } catch (err) {
      return serverError;
    }
  }

  // Update User Transaction
  async updateUserTransById(body) {
    try {
      const { id } = body;
      const trans = userTrans.toUpdateJson(body);

      const result = await collections.transCollection().updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $set: {
            ...trans,
          },
        }
      );

      if (result.modifiedCount > 0) {
        return {
          ...columnUpdated("User Transaction"),
        };
      } else {
        return InvalidId("User Transaction");
      }
    } catch (err) {
      console.error("Error:", err);
      return serverError;
    }
  }

  // Filter Transactions by specific parameters
  async filterTransaction(filterParams) {
    try {
      const result = await collections
        .transCollection()
        .find({ ...filterParams })
        .toArray();
      if (result.length > 0) {
        return {
          ...fetched("Transactions"),
          data: result,
        };
      }
      return {
        ...notExist("Transactions"),
        data: {},
      };
    } catch (err) {
      console.log("Error in filter transaction controller");
      return serverError;
    }
  }

  // Get Pending Withdraw Transactions
  async getPendingWithdraw() {
    try {
      const response = await collections.transCollection().find({ $and: [{ type: "withdraw" }, { status: false }] }).toArray();
      if (response && response.length > 0) {
        return { ...fetched("Pending withdrawal"), data: response };
      } else {
        return notExist("Pending Withdraw");
      }
    } catch (err) {
      return serverError;
    }
  }

  // Reject Withdraw Transaction
  async rejectWithdraw(id) {
    try {
      const response = await collections.transCollection().findOne({ _id: new ObjectId(id) });
      if (response && !response.status) {
        let amount = parseFloat(response.amount);
        const user = await collections.userCollection().updateOne({ userId: response.userId }, { $inc: { totalWithdraw: -amount, wallet: amount } });
        if (user.acknowledged && user.modifiedCount > 0) {
          await collections.transCollection().deleteOne({ _id: new ObjectId(id) });
          return withdrawRejected;
        } else {
          return tryAgain;
        }
      } else {
        return tryAgain;
      }
    } catch (err) {
      return serverError;
    }
  }

  // Get Transaction by type for user
  async getTransactionByType(key, value, userId, page, limit) {
    const filter = {
      [key]: value,
    };
    const skip = parseInt(page) * limit;
    try {
      const result = await collections
        .transCollection()
        .find({
          ...filter,
          userId: userId,
        })
        .skip(skip)
        .limit(limit)
        .toArray();
      if (result.length > 0) {
        return {
          ...fetched("Transactions"),
          data: result,
        };
      }
      return notExist("Transactions");
    } catch (err) {
      return serverError;
    }
  }

  // Delete User Transaction by ID
  async deleteUserTransById(id) {
    try {
      const result = await collections.transCollection().deleteOne({
        _id: new ObjectId(id),
      });
      if (result.deletedCount > 0) {
        return {
          ...deleted("User Transaction"),
          data: {},
        };
      } else {
        return InvalidId("User Transaction");
      }
    } catch (err) {
      console.error("Error:", err);
      return serverError;
    }
  }
  // create transactions
  async createTransaction(body) {
    const session = client.startSession();
    session.startTransaction();
    try {
      const range = body.amount;
      const investmentId = body?.investmentId || "";
      const bars = await collections.barsCollection()
        .find({ type: "config" })
        .sort({ range: 1 })
        .toArray();

      if (bars.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return barNotExist;
      }
      const settingCollections = await collections.settingsCollection().findOne(
        { type: "min-range", status: true },
        { session }
      );

      if (!settingCollections) {
        await session.abortTransaction();
        session.endSession();
        return settingNotExist;
      }
      const requiredMinInvestment = parseFloat(settingCollections.value);
      if (range < requiredMinInvestment) {
        await session.abortTransaction();
        session.endSession();
        return barNotExistInGivenRange(requiredMinInvestment);
      }
      const selectedBar = bars.find((bar) => range <= bar.range);
      if (!selectedBar) {
        await session.abortTransaction();
        session.endSession();
        return barNotExist;
      }

      const charges = parseInt(selectedBar.charges);
      const deductedAmount = (range * charges) / 100;
      // Fetch tax settings
      const taxSettings = await collections.settingsCollection().findOne(
        { type: "tax-config" },
        { session }
      );

      if (!taxSettings) {
        await session.abortTransaction();
        session.endSession();
        return notExist("Settings");
      }

      const taxRate = taxSettings.value;

      // Fetch user details
      let user = await collections.userCollection().findOne(
        { _id: new ObjectId(body.userId) },
        { session }
      );

      if (!user || !user._id) {
        await session.abortTransaction();
        session.endSession();
        return notExist("User");
      }
      const invoiceNo = `oum|${(await collections.transCollection().countDocuments()) + 1}`;

      const transConstructor = new UserTransactionModel(
        null,
        body.userId,
        deductedAmount,
        null,
        parseInt(range),
        invoiceNo,
        parseInt(taxRate),
        body.paymentMethod,
        true,
        new Date(),
        new Date()
      );

      const transationData = transConstructor.toDatabaseJson();
      const result = await collections.transCollection().insertOne(transationData, { session });

      if (!result || !result.insertedId) {
        await session.abortTransaction();
        session.endSession();
        return idNotFound;
      }
      if (investmentId) {
        const investmentData = await collections.investmentCollection().findOneAndUpdate(
          { _id: new ObjectId(investmentId) },
          { $set: { transactionId: result.insertedId.toString(), status: true } },
          { returnDocument: "after", session }
        );
        if (!investmentData) {
          await session.abortTransaction();
          session.endSession();
          return notExist("Investment");
        }
        if (!(parseInt(investmentData.amount + investmentData.charges) === parseInt(range))) {
          await session.abortTransaction();
          session.endSession();
          return AdequateInvestmentAmount;
        }
      }
      let option = options(
        user.email,
        "Oumvest Transaction Code Generated",
        transaction(user._id, transationData.amount, result.insertedId, user.fullName)
      );

      await sendMail(option);
      await session.commitTransaction();
      session.endSession();

      return {
        ...columnCreated("Transaction"),
        data: { id: result.insertedId }
      };

    } catch (error) {
      console.error(error);
      await session.abortTransaction();
      session.endSession();
      return serverError;
    }
  }


}

export default UserTrans;
