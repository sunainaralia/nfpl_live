import { generateUserId } from "../../Middlewares/GenerateUserId/index.js";
import {
  ComparePassword,
  HashPassword,
} from "../../Middlewares/EncryptPassword/index.js";
import {
  InvalidId,
  accVerifiedSub,
  activateAccount,
  alreadyActive,
  columnUpdated,
  comProfile,
  createAcc,
  debitedSub,
  deleted,
  failedIncome,
  fetched,
  forgetPasswordContent,
  idNotFound,
  income,
  invalidLoginCred,
  invalidOtp,
  limitCrossed,
  loggedIn,
  loginOtp,
  noMember,
  notExist,
  otpSent,
  otpSentSub,
  otpVerified,
  placementer,
  registered,
  serverError,
  tryAgain,
  unauthorized,
  userActivated,
  walletUpdated,
  emailSent,
  sentOtpfailed,
  investmentNotFound,
  transactionNotFound,
  userNotFound,
  incomeUpdated,
  transactionFailed,
  barNotExist,
  barNotExistInGivenRange
} from "../../Utils/Responses/index.js";
import { options, sendMail, transponder } from "../../Utils/Mailer/index.js";
import UserModel from "../../Models/userModel.js";
import IncomeLog from "../../Models/incomeModel.js";
import IncomeModel from "../../Models/incomeModel.js";
import Income from "../IncomeController/Income.js";
import Notifications from "../NotificationController/Notifications.js";
import { newPlacement, newRef } from "../../Utils/Notifications/index.js";
import { ObjectId } from "mongodb";
import collections from "../../Utils/Collections/collections.js";
import jwt from "jsonwebtoken";
// import { sendSms } from "../../Mailer/smsService.js";
import path from "path";
import fs from "fs";
import Settings from "../SettingsController/Settings.js";
import { readFile } from "../../Middlewares/FileReader/index.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { client } from "../../dbConnection.js";
import isreferalIdUnique, { generatereferalId } from "../../Utils/Referral/index.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import SettingsModel from "../../Models/settingsModel.js";
import sendEmail from "../../Utils/Mailer/SendMail.js";
import bcrypt from 'bcrypt';
import RegularIncomeModel from "../../Models/regularIncomeModel.js";
import PortfolioModel from "../../Models/portfolio.js";
// Models
const incomeModel = new IncomeLog();
const userModel = new UserModel();

// Other controllers
const incomeController = new Income();
const notification = new Notifications();

const settings = new Settings();

class User {
  constructor() {
  }

  async getUsers(page, limit) {
    const skip = parseInt(page) * limit;

    try {
      const [users, count] = await Promise.all([
        collections.userCollection().find().skip(skip).limit(limit).toArray(),
        collections.userCollection().countDocuments()
      ]);

      if (users.length > 0) {
        users.forEach(user => {
          user.image = user.image ? readFile(user?.image):""
        })


        return {
          ...fetched("Users"),
          data: users,
          length: count
        };
      }
      return { ...notExist("Users") };
    } catch (err) {
      return {
        ...serverError,
        err,
      };
    }
  }


  async verifyOtp(req, res) {
    try {
      let otp = req.body?.otp;
      let userId = req.body?.userId.toLowerCase();
      const verify = await collections.veriCollection().findOne({
        otp: otp,
      });
      if (verify && verify.userId) {
        let objectIdQuery = null;
        if (ObjectId.isValid(userId)) {
          objectIdQuery = new ObjectId(userId);
        }
        const user = await collections.userCollection().findOne({
          $or: [{
            _id: objectIdQuery,
          }, { email: userId }]
        });
        if (user && user._id.toString() == verify.userId.toString()) {
          const token = jwt.sign(
            {
              id: user._id,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "1d",
            }
          );
          res.cookie("userId", user._id, {
            httpOnly: true,
            maxAge: 1 * 24 * 60 * 60 * 1000,
            secure: true,
            sameSite: "strict",
          });

          return res
            .status(loggedIn.status)
            .cookie("authToken", token, {
              httpOnly: true,
              maxAge: 1 * 24 * 60 * 60 * 1000,
              secure: true,
              sameSite: "strict",
            })
            .send({
              ...loggedIn,
              data: {
                token: token,
                userId: user._id
              },
            });
        }
        else {
          res.status(tryAgain.status).send(tryAgain);
        }
      } else {
        return res.status(invalidOtp.status).send(invalidOtp);
      }
    } catch (err) {
      return res.status(serverError.status).send(serverError);
    }
  }

  // Complete login controller

  async login(req, res) {
    try {
      const { userId, password } = req.body;
      let value = userId.toLowerCase();
      // Check if the userId is a valid ObjectId
      let objectIdQuery = null;
      if (ObjectId.isValid(value)) {
        objectIdQuery = new ObjectId(value);
      }

      // Query the database, searching by either ObjectId or email
      const result = await collections.userCollection().findOne({
        $or: [
          { _id: objectIdQuery },
          { email: value }
        ]
      });

      // If the result is found, proceed with the password check
      if (result) {
        const user = userModel.fromJson(result);
        // Check the number of attempts
        if (user.attempt > 0) {
          const comparedPassword = await ComparePassword(password, user.password);

          if (comparedPassword) {
            // If login is successful, reset attempts to 5
            if (user.attempt < 5) {
              await collections.userCollection().updateOne(
                { _id: user._id },
                { $set: { attempt: 5 } }
              );
            }
            // Create JWT token
            const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });

            // Set cookies for authentication
            res.cookie('userId', user._id, {
              httpOnly: true,
              maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
              secure: true,  // Set to false for local development
              sameSite: 'strict',
            });

            // Send successful login response
            return res
              .status(loggedIn.status)
              .cookie('authToken', token, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
                secure: true,  // Set to false for local development
                sameSite: 'strict',
              })
              .send({
                ...loggedIn,
                data: {
                  token: token,
                  userId: user._id,
                },
              });
          } else {
            // If password is incorrect, decrement the attempt counter
            await collections.userCollection().updateOne(
              { _id: user._id },
              { $inc: { attempt: -1 } }
            );
            let message = invalidLoginCred(parseInt(user.attempt - 1));
            return res.status(message.status).send(message);
          }
        } else {
          return res.status(limitCrossed.status).send(limitCrossed);
        }
      } else {
        let msg = InvalidId("User");
        return res.status(msg.status).send(msg);
      }
    } catch (error) {
      console.log(error);
      return res.status(serverError.status).send(serverError);
    }
  }

  // Static new user controller
  async addUser(user) {
    const res = await collections.userCollection().insertOne(user);
    if (res.acknowledged && res.insertedId) {
      if (parseInt(user.level) > 0) {
        await notification.newNotification(newRef(user.sponsorId, user._id));
      }
      let message = registered(user?._id, user?.email);
      return {
        ...message,
        data: {
          id: user._id,
        },
      };
    } else {
      return tryAgain;
    }
  }

  async getSponsorInfo(sponsorId, type) {
    try {
      if (type === "individual") {
        const user = await collections.userCollection().findOne({
          referalId: sponsorId
        });
        return user;
      } else {
        const user = await collections.adminCollection().findOne({
          referalId: sponsorId
        });
        return user;
      }
    } catch (error) {
      console.error("Error in getSponsorInfo:", error);
      return null;
    }
  }

  async register(body) {
    const user = new UserModel().fromJson(body);
    let sponsorId = body.sponsorId;
    let password = body.password;
    let confirmPassword = body.confirmPassword
    if (password != confirmPassword) {
      return res.status(400).send({
        status: 400,
        message: "password and confirmPassword are not matched ,please try again "
      })
    }
    try {
      // Validate user type
      const userTypesSettings = await collections.settingsCollection().findOne({
        title: "users-types"
      });
      if (!userTypesSettings) {
        return tryAgain;
      }

      const settingsModel = SettingsModel.fromJson(userTypesSettings);

      const allowedUserTypes = settingsModel.value.split(',').map(type => type.trim());

      if (!allowedUserTypes.includes(user.type)) {
        return unauthorized;
      }
      // Hash password
      const hashedPassword = await HashPassword(user.password);
      user.password = hashedPassword;

      // Generate referral key
      let referalId = generatereferalId();
      while (!await isreferalIdUnique(referalId)) {
        referalId = generatereferalId();
      }
      user.referalId = referalId;

      // Validate sponsor - first try user collection
      let sponsorUser = await this.getSponsorInfo(sponsorId, user.type);
      if (!sponsorUser || !sponsorUser.referalId) {
        // If not found in users, try admin collection
        sponsorUser = await this.getSponsorInfo(sponsorId, "admin");
        if (!sponsorUser) {
          return InvalidId("Sponsor");
        }
        if (!sponsorUser) {
          return InvalidId("Sponsor");
        }
      }

      // Ensure sponsor is valid and has a valid level
      // if (!sponsorUser?.status) {
      //   return InvalidId("Sponsor");
      // }

      // Set user level based on sponsor's level (handle maximum level condition)
      let newLevel = Number(sponsorUser.level) + 1;

      user.level = newLevel;
      // Add user to the database
      let res = await this.addUser(user.toDatabaseJson());
      return res;

    } catch (error) {
      console.error("Registration error:", error);
      return {
        ...serverError,
        error,
      };
    }
  }


  // Get User Members
  async getMembers(userId) {
    try {
      // Validate userId and convert to ObjectId
      const userObjectId = ObjectId.isValid(userId) ? new ObjectId(userId) : null;
      if (!userObjectId) {
        return { status: 400, message: "Invalid userId" };
      }
      // Find the user in the database
      const user = await collections.userCollection().findOne({ _id: userObjectId });
      user.image = user.image ? readFile(user?.image) : ""
      if (!user) {
        return { status: 404, message: "User not found" };
      }
      // Use $graphLookup to find all referrals based on sponsorId (referral system)
      const members = await collections.userCollection().aggregate([
        {
          $match: { _id: userObjectId }
        },
        {
          $graphLookup: {
            from: "users",
            startWith: "$referalId",
            connectFromField: "referalId",
            connectToField: "sponsorId",
            as: "teamMembers",
            maxDepth: 1000,
            depthField: "hierarchyLevel"
          }
        }
      ]).toArray();

      if (members.length > 0) {
        let team = members[0]?.teamMembers || [];
        // Update the member count for the user
        const totalMembers = team.length;
        await collections.userCollection().updateOne(
          { _id: userObjectId },
          { $set: { memberCount: totalMembers } }
        );
        // Format response data
        let users = team.map(e => ({
          id: e._id ? e._id.toString() : null,
          fullName: e.fullName,
          email: e.email,
          phone: e.phone,
          status: e.status,
          isVerified: e.isVerified,
          level: e.level,
          member: e.member,
          unlocked: e.unlocked,
          totalInvestment: e.totalInvestment,
          rewardId: e.rewardId,
          designation: e.designation,
          earnings: e.earnings,
          withdraw: e.withdraw,
          wallet: e.wallet,
          createdAt: e.createdAt,
          referalId: e.referalId,
          sponsorId: e.sponsorId,
          image: e.image ? readFile(e?.image) : ""

        }));

        return { status: 200, message: "Team members retrieved successfully", data: [...users, user], referalId: user.referalId };
      }

      return { status: 404, message: "No team members found" };
    } catch (err) {
      console.error(err);
      return serverError;
    }
  }

  // activateAccount
  async activate(id) {
    try {
      const user = await collections
        .userCollection()
        .findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: { isVerified: true } },
          { returnDocument: "before" }
        );
      if (user && user?.isVerified) {
        return alreadyActive;
      }
      const kyc = await collections
        .kycCollection()
        .findOne({ userId: user.userId });
      if (user && kyc && user.userId == kyc.userId) {
        // await sendSms(
        //   user.phone,
        //   `Hi ${user.fullName}, \n\n Your knoone India Account has been successfully verified and ready to use. Start investing in future.\n\nLogin:- https://account.knooneindia.com/\n\n Thanks & Regards \nknoone India Limited`,
        //   "ARN"
        // );

        let mailOption = options(
          user.email,
          accVerifiedSub,
          activateAccount(user.userId, user.fullName)
        );
        await transponder.verify();
        await sendMail(mailOption);

        return { ...userActivated, data: { id: user.userId } };
      } else {
        await collections
          .userCollection()
          .findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { isVerified: false } },
            { returnDocument: "after" }
          );
        return unauthorized;
      }
    } catch (err) {
      return serverError;
    }
  }

  // Send credentials via mail controller
  async sendOtp(id) {
    try {
      let value = id.toLowerCase();
      let objectIdQuery = null;

      if (ObjectId.isValid(value)) {
        objectIdQuery = new ObjectId(value);
      }

      const result = await collections.userCollection().findOne({
        $or: [{ _id: objectIdQuery }, { email: value }]
      });

      if (!result || (result._id != value && result.email.toLowerCase() != value)) {
        return InvalidId("user");
      }

      const { email, fullName, _id } = result;
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Store OTP in database
      await collections.veriCollection().insertOne({
        otp,
        userId: _id,
        status: true,
        createdAt: new Date(),
      });
      console.log("otp", otp)

      // Create expiry index
      await collections.veriCollection().createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: 60 * 5 }
      );

      const mailOption = options(
        email,
        "Your oumvest India OTP",
        `Hi ${fullName},<br><br>
             Your Oumvest Authentication OTP is ${otp}.<br>
             Please don't share this OTP with anyone.<br><br>
             Thanks & Regards,<br>
             Nextwork Financials`
      );

      const emailResult = await sendMail(mailOption);
      if (!emailResult.success) {
        throw new Error('Failed to send email');
      }
      return { ...otpSent, data: { userId: _id } };
    } catch (err) {
      console.error('Error in sendOtp:', err);
      return serverError;
    }
  }

  // Send credentials via mail controller
  async forgetPass(req, id) {
    try {
      let value = id.toLowerCase();
      let objectIdQuery = null;
      if (ObjectId.isValid(id)) {
        objectIdQuery = new ObjectId(id);
      }
      const user = await collections.userCollection().findOne({
        $or: [{ _id: objectIdQuery }, { email: value }]
      });
      if (user && user?._id) {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '5m' });
        const url = `${req.protocol}://${req.get('host')}/v1/api/user/resetPassword/?reset_token=${token}`;
        try {
          const msg = `Oumvest Password Recovery Initiated.please reset your password by click on following link \n\n ${url}\n\n\n and this is valid upto 5 minutes`
          sendEmail({
            msg: msg,
            email: value,
            subject: "Oumvest Password Recovery"
          });
        } catch (err) {
          return sentOtpfailed
        }
        console.log(url)
        return emailSent;
      } else {
        return tryAgain;
      }

    } catch (err) {
      console.log(err);
      return serverError
    }
  }

  // Get User by user Id controller
  async getUserById(id) {
    try {
      const value = id.toLowerCase();
      const [user, kyc, unread] = await Promise.all([
        collections.userCollection().findOne({ _id: new ObjectId(value) }),
        collections.kycCollection().findOne({ userId: value }),
        collections.notifCollection().countDocuments({ userId: value, status: false }),
      ]);
      if (user) {
        const newUser = new UserModel().fromJson(user).toClientJson();
        newUser.image = newUser.image ? readFile(user?.image) : "";
        if (kyc) {
          kyc.aadharFile = [
            readFile(kyc?.aadharFile?.[0]) ?? "",
            readFile(kyc?.aadharFile?.[1]) ?? "",
          ];
          kyc.panFile = readFile(kyc?.panFile);
          kyc.sign = readFile(kyc?.sign);
        }

        return {
          ...fetched("Your"),
          data: {
            user: newUser,
            kyc: kyc,
            unread: unread ?? 0,
          },
        };
      } else {
        return idNotFound;
      }
    } catch (err) {
      console.error(err);
      return serverError;
    }
  }


  async getPendingVerifications() {
    try {
      const pendingVerifications = await collections.userCollection().aggregate([
        {
          $match: {
            isVerified: false
          }
        },
        {
          $lookup: {
            from: "kyc",
            localField: "userId",
            foreignField: "userId",
            as: "kycDetails"
          }
        },
        {
          $match: {
            "kycDetails": { $ne: [] },
            "kycDetails.status": true
          }
        },
        {
          $project: {
            _id: 1,
            initial: 1,
            fullName: 1,
            email: 1,
            phone: 1,
            kycDetails: 1
          }
        }
      ]).toArray();

      if (pendingVerifications.length && pendingVerifications.length > 0) {

        pendingVerifications.forEach(user => {
          user.kycDetails.forEach(kyc => {
            console.log(kyc,);
            let aadharFront = kyc.aadharFile?.[0] ?? "0";
            let aadharBack = kyc.aadharFile?.[1] ?? "";
            let panFile = kyc.panFile;
            let sign = kyc.sign;
            kyc.aadharFile = [readFile(aadharFront), readFile(aadharBack)];
            kyc.panFile = readFile(panFile);
            kyc.sign = readFile(sign);
          });
        });

        return { ...fetched("Pending Verifications"), data: pendingVerifications };
      } else {
        return notExist("Verifications");
      }

    } catch (err) {
      return serverError;
    }
  }

  // Complete Profile controller
  async completeProfile(id) {
    try {
      let value = id.toLowerCase();
      const user = await collections.userCollection().findOne({
        $or: [{ _id: new ObjectId(value) }, { email: value }]
      });
      if (user && user._id) {
        let countAdd = await collections.addCollection().countDocuments({ userId: user._id.toString() });
        let countKyc = await collections.kycCollection().findOne({ userId: user._id.toString() });
        if (countAdd == 0) {
          return { ...comProfile, data: { step: 1 } };
        } else if (!countKyc || countKyc.userId === null || countKyc.userId === undefined) {
          return { ...comProfile, data: { step: 2 } };
        } else if (!countKyc.status) {
          return { ...comProfile, data: { step: 3 } };
        } else {
          return { ...alreadyActive, data: { step: 0 } };
        }
      }
      else {
        return InvalidId("User");
      }
    } catch (err) {
      return serverError;

    }
  }

  // Update user wallet based on Type
  async updateUserWallet(userId, amount, type) {
    const res = await collections.userCollection().findOne({
      userId: userId,
    });
    if (res && res.userId) {
      let wallet = parseFloat(res.wallet);

      // Withdraw Money from Wallet
      if (type === "withdraw" && amount <= wallet && wallet > 499) {
        console.log(amount);
        const user = await collections.userCollection().updateOne(
          {
            userId: userId,
          },
          {
            $inc: {
              totalWithdraw: amount,
              wallet: -amount,
            },
          }
        );

        if (user.modifiedCount > 0) {
          let mailOption = options(
            res.email,
            debitedSub,
            walletUpdated(
              userId,
              res.fullName,
              parseFloat(wallet - amount),
              amount,
              "Debited"
            )
          );
          await sendMail(mailOption);
          return true;
        } else {
          return false;
        }
      }
      // Return Error if Any
      else {
        return null;
      }
    } else {
      return null;
    }
  }

  // Update user by id
  async updateUser(body) {
    try {
      const { id } = body;
      const user = new UserModel().toUpdateJson(body);

      // Update User Information
      const result = await collections.userCollection().updateOne(
        {
          userId: id,
        },
        {
          $set: {
            ...user,
          },
        }
      );
      if (result && result.modifiedCount > 0) return columnUpdated("Account");
      return InvalidId("user");
    } catch (err) {
      return serverError;
    }
  }

  // change profile pic controller
  async changePhoto(id, photo) {
    try {
      const userFolder = path.join(__dirname, '../..', 'uploads', id);
      if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder, { recursive: true });
      }
      const photoPath = path.join(userFolder, photo.originalname);
      fs.writeFileSync(photoPath, photo.buffer);
      const result = await collections.userCollection().updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $set: {
            image: photoPath,
          },
        }
      );
      if (result.acknowledged && result.modifiedCount > 0) {
        return columnUpdated("Your Profile Photo");
      }
      else {
        return tryAgain;
      }
    } catch (err) {
      return serverError;
    }
  }

  // Change Password controller
  async changePassword(body) {
    try {
      const { oldPassword, password, userId } = body;
      let value = userId.toLowerCase();

      // First, fetch the user to verify old password
      const existingUser = await collections.userCollection().findOne({
        $or: [{ userId: value }, { email: value }]
      });

      if (!existingUser) {
        return { success: false, message: "User not found" };
      }

      // Verify old password
      const isOldPasswordValid = await bcrypt.compare(oldPassword, existingUser.password);

      if (!isOldPasswordValid) {
        return { success: false, message: "Current password is incorrect" };
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update with new password
      const user = await collections.userCollection().findOneAndUpdate(
        { $or: [{ userId: value }, { email: value }] },
        {
          $set: {
            password: hashedPassword,
          },
        },
        { returnDocument: "after" }
      );

      if (user && user.password) {
        return { success: true, message: "Your password has been updated successfully" };
      } else {
        return { success: false, message: "Failed to update password. Please try again" };
      }
    } catch (err) {
      console.error('Error in changePassword:', err);
      return { success: false, message: "Server error occurred" };
    }
  }
  async resetPassword(req, password) {
    try {

      const userId = req.userId;
      // Hash the new password
      const hashedPassword = await HashPassword(password);
      let objectIdQuery = null;
      if (ObjectId.isValid(userId)) {
        objectIdQuery = new ObjectId(userId);
      }
      // Update the password in the database
      const user = await collections.userCollection().findOneAndUpdate(
        { _id: objectIdQuery },
        {
          $set: {
            password: hashedPassword,
          },
        },
        { returnDocument: "after" }
      );
      if (user) {
        return columnUpdated("Your Password")
      } else {
        return tryAgain;
      }
    } catch (err) {
      console.log(err);
      return serverError;
    }
  }

  // Static Consultation Filter by type
  async filterConsultation(cons, type) {
    let response = cons;
    let data = {}

    response.sort((a, b) => a.range - b.range);

    data = response.filter((e) => {
      if (e.type == type) {
        return e;
      }
    });

    data.sort((a, b) => a.range - b.range);

    return data;
  }

  async filterRange(res, range) {
    let response = {};
    for (let level of res) {
      if (parseInt(level.range) >= range) {
        response = level;
        break;
      }
    }
    return response;
  }

  // Static Slabs Filter
  async filterSlabs(slabs, storage) {
    let newSlabs = slabs;
    newSlabs.sort((a, b) => a.range - b.range);
    let slab = this.filterRange(newSlabs, storage);
    return slab;
  }

  // Static Update User account with new Income and Storage function
  async addNewIncome(userId, updateQuery, session) {
    let options = {
      returnDocument: "after",
      session: session
    };
    let user = await collections.userCollection().findOneAndUpdate(
      {
        userId: userId,
        // isVerified: true,
      },
      updateQuery,
      options,
    );
    return user;
  }

  async sponsorNow(id) {
    try {
      let value = id

      const user = await collections.userCollection().findOne({
        referralKey: value
      });
      if (user && user?.status) {
        return { ...createAcc, data: { userId: user._id } };
      } else {
        return notExist("Sponsor is not verified or");
      }
    } catch (err) {
      return serverError;
    }
  }

  // Generate Income to all sponsors
  // async updateUsersIncome(body) {
  //   body.type = "roi";
  //   const newreturn = new RegularIncomeModel().fromJson(body);
  //   const sourceId = newreturn.userId;
  //   const session = client.startSession();

  //   var i = 0,
  //     status = true,
  //     result = false,
  //     totalAmt = 0,
  //     rentAmt = 0,
  //     investment = 0;

  //   try {
  //     session.startTransaction();

  //     const csl = await collections
  //       .distributionCollection()
  //       .find({
  //         status: status,
  //       })
  //       .toArray({ session });

  //     const levels = await settings.authSettings("levels", status, session);
  //     const tdsRate = await settings.authSettings("tds", status, session);
  //     const conveinienceRate = await settings.authSettings("convenience", status, session);
  //     const slabs = await collections
  //       .slabCollection()
  //       .find({
  //         type: "bars",
  //       })
  //       .toArray({ session });

  //     const connection = await collections.investmentCollection().findOneAndUpdate({ _id: new ObjectId(body?.investmentId) }, { $set: { status: true } }, { returnDocument: "before", session: session });
  //     if (csl.length > 0 && rentalRule && slabs.length > 0 && tdsRate && conveinienceRate && connection && !connection.status) {
  //       endDate.setFullYear(endDate.getFullYear() + rentalRule.rule);
  //       storage = connection.storage;

  //       // Consultations - Regular
  //       const regular = await this.filterConsultation(csl, "ror");

  //       const rentConfig = await this.filterSlabs(slabs, parseInt(storage));

  //       // Update Query for Buyer
  //       let updateQuery = {
  //         $inc: {
  //           "totalInvestment": parseFloat(storage),
  //         },
  //         $set: {
  //           status: status,
  //         },
  //       };

  //       // Setting Rent end date and amount Dynamically
  //       newreturn.investment = investment;
  //       newreturn.endDate = endDate;
  //       let multiplier = parseFloat(storage) < 1 ? 1 : parseFloat(storage);
  //       totalAmt = parseFloat(multiplier * rentConfig.basicAmt);
  //       rentAmt = parseFloat((totalAmt * rentConfig.rent) / 100);
  //       newreturn.amount = rentAmt;

  //       // Generating Income among Approved sponsors
  //       while (i <= levels?.value) {

  //         // Updating user Account
  //         let receiver = await this.addNewIncome(newreturn.userId, updateQuery, session);

  //         if (i >= 1 && !receiver?.leader) {
  //           let level = await collections.userCollection().aggregate([
  //             {
  //               $match: { sponsorId: newreturn.userId }
  //             },
  //             {
  //               $group: {
  //                 _id: null,
  //                 totalOwn: { $sum: "$storage.own" }
  //               }
  //             }
  //           ]).toArray({ session });

  //           // Check if the level array is not empty and contains the totalOwn field
  //           if (level.length > 0 && level[0].totalOwn !== undefined) {
  //             newreturn.status = parseFloat(level[0].totalOwn) >= i;
  //           } else {
  //             // If the level array  is empty or totalOwn is undefined, set status to false
  //             newreturn.status = false;
  //           }
  //         } else {
  //           newreturn.status = true;
  //         }

  //         let receiverRent = await this.addRent(newreturn.toDatabaseJson(), session);
  //         // Creating Receiver Rent Account.

  //         // If receiver exist and receiver rent has been added and user is networker, then generate income among sponsors
  //         if (receiver && receiverRent && receiver.userId) {
  //           if (parseInt(receiver.level) == 0) {
  //             result = true;
  //             break;
  //           };
  //           if (parseFloat(receiver.storage?.own) == 0 || !receiver.status) {
  //             continue;
  //           }
  //           i += 1;
  //           let incentiveLevel = await this.filterRange(incentive, i);
  //           let newIncome = parseFloat((totalAmt * incentiveLevel.rate) / 100);
  //           let conveinience = parseFloat((newIncome * conveinienceRate.range) / 100);
  //           newIncome -= conveinience;
  //           let tds = parseFloat((newIncome * tdsRate.range) / 100);
  //           newIncome -= tds;
  //           delete updateQuery["storage.own"];
  //           updateQuery = {
  //             $inc: {
  //               "storage.member": parseFloat(storage),
  //               totalEarn: parseFloat(newIncome),
  //               wallet: parseFloat(newIncome),
  //             },
  //           };

  //           // Update Income Log
  //           const newModel = incomeModel.fromJson({
  //             userId: receiver.sponsorId,
  //             sourceId: sourceId,
  //             level: i,
  //             amount: newIncome,
  //             tds: tds,
  //             conCharge: conveinience,
  //             type: "incentive",
  //             status: true,
  //           });

  //           let insertTds = new TDSModel().fromJson({
  //             userId: receiver.sponsorId,
  //             type: "incentive",
  //             amount: tds
  //           });

  //           await collections.tdsCollection().insertOne(insertTds.toDatabaseJson(), { session });
  //           await incomeController.createIncome(newModel.toDatabaseJson(), { session });

  //           let regularLevel = await this.filterRange(regular, i);
  //           newreturn.amount = parseFloat((rentAmt * parseFloat(regularLevel.rate)) / 100);
  //           newreturn.source = sourceId;
  //           newreturn.level = i;
  //           newreturn.type = "ror"
  //           newreturn.userId = receiver.sponsorId;
  //         }
  //         else {
  //           body.userId = newreturn.userId;
  //           body.index = i;
  //           break;
  //         }
  //       }
  //       // return response
  //       if (result || i > range) {
  //         // await sendSms();
  //         await session.commitTransaction();

  //         return income;
  //       } else {
  //         await session.abortTransaction();
  //         return {
  //           ...failedIncome,
  //           data: {
  //             body,
  //           },
  //         };
  //       }
  //     }
  //     // return error
  //     else {
  //       await session.abortTransaction();

  //       return {
  //         ...tryAgain,
  //         data: {
  //           ...body,
  //         },
  //       };
  //     }
  //   } catch (err) {
  //     await session.abortTransaction();
  //     return serverError;
  //   }
  //   finally {
  //     await session.endSession();
  //   }
  // }

  //   Delete User controller
  async deleteUsers(id) {
    const session = client.startSession();

    try {
      // Start a transaction
      session.startTransaction();

      const userResult = await collections.userCollection().deleteOne({ userId: id }, { session });
      const addressResult = await collections.addCollection().deleteMany({ userId: id }, { session });
      const kycResult = await collections.kycCollection().deleteMany({ userId: id }, { session });

      if (
        (userResult.acknowledged || userResult.deletedCount > 0) &&
        (addressResult.acknowledged || addressResult.deletedCount > 0) &&
        (kycResult.acknowledged || kycResult.deletedCount > 0)
      ) {
        // Commit the transaction
        await session.commitTransaction();
        return { ...deleted("User") };
      } else {
        // Abort the transaction if any deletion failed
        await session.abortTransaction();
        return InvalidId("User");
      }
    } catch (err) {
      // Log the error and abort the transaction
      console.error('Transaction error:', err);
      await session.abortTransaction();
      return serverError;
    } finally {
      // End the session
      session.endSession();
    }
  }

  async addIncomeToUser(userId, income, session) {
    try {
      const user = await collections.userCollection().findOne(
        { _id: new ObjectId(userId) },
        { session, projection: { sourceId: 1, level: 1 } }
      );

      if (!user) return { status: userNotFound.status, message: userNotFound.message };

      const tdsSetting = await collections.settingsCollection().findOne(
        { title: "tds" },
        { session }
      );
      const tdsRate = parseFloat(tdsSetting?.value) || 0;
      const tdsAmount = (income * tdsRate) / 100;
      const userLevel = user.level || 0;
      const sourceId = user.sourceId || null;

      // Create new income entry
      const newIncome = new IncomeModel(
        null,
        userId,
        sourceId,
        userLevel,
        income,
        "roi",
        tdsAmount,
        deductedAmount,
        true,
        new Date(),
        new Date()
      );

      // Insert income entry into the database
      await collections.incomeCollection().insertOne(newIncome.toDatabaseJson(), { session });
      return { status: 200, message: "Income added successfully." };
    } catch (error) {
      console.error("Error adding income:", error);
      return { status: serverError.status, message: serverError.message };
    }
  }

  async calculateTeamInvestment(sponsorId, level, session) {
    if (!sponsorId) return 0;
    const sponsor = await collections.userCollection().findOne(
      { referalId: sponsorId },
      { session, projection: { referalId: 1 } }
    );

    if (!sponsor) return 0;

    const aggregationResult = await collections.userCollection().aggregate([
      {
        $match: { sponsorId: sponsor.referalId }
      },
      {
        $graphLookup: {
          from: "users",
          startWith: sponsor.referalId,
          connectFromField: "referalId",
          connectToField: "sponsorId",
          as: "teamMembers",
          maxDepth: level - 1,
          depthField: "depth"
        }
      },
      { $unwind: "$teamMembers" },
      {
        $group: {
          _id: null,
          totalInvestment: { $sum: "$teamMembers.totalInvestment" }
        }
      }
    ], { session }).toArray();

    return aggregationResult[0]?.totalInvestment || 0;
  }

  async updateUsersIncome(req) {
    const session = client.startSession();
    let result = false;
    const { investmentId } = req.body;

    try {
      session.startTransaction();

      // Fetch investment details
      const investment = await collections.investmentCollection().findOne(
        { _id: new ObjectId(investmentId) },
        { session }
      );
      if (!investment) return investmentNotFound;

      // Fetch transaction details
      const transaction = await collections.transCollection().findOne(
        { transactionId: investment.transactionId },
        { session }
      );
      if (!transaction) return transactionNotFound;

      const range = investment.amount;
      // Fetch portfolio details
      let portfolio = await collections.portfolioCollection().findOne(
        { userId: investment.userId },
        { session }
      );
      // Fetch user details
      const user = await collections.userCollection().findOne(
        { _id: new ObjectId(investment.userId) },
        { session }
      );
      if (!user) return userNotFound;
      let totalInvestedAmount;
      let calculatedRoi;
      if (portfolio) {
        totalInvestedAmount = portfolio.amount + range

        // Fetch bars settings for ROI calculation
        const bars = await collections.barsCollection().find({}).sort({ range: 1 }).toArray({ session });
        if (bars.length === 0) return barNotExist;
        if (totalInvestedAmount <= bars[0].range) return barNotExistInGivenRange(bars[0].range);

        let selectedBar = null;
        for (let i = 0; i < bars.length; i++) {
          if (i === bars.length - 1 || (totalInvestedAmount > bars[i].range && totalInvestedAmount <= bars[i + 1].range)) {
            selectedBar = bars[i];
            break;
          }
        }
        if (!selectedBar) return barNotExist;

        const monthlyReturnRate = selectedBar?.rate || 0;
        const monthlyRate = monthlyReturnRate / 100;
        calculatedRoi = totalInvestedAmount * monthlyRate;

        await collections.portfolioCollection().updateOne(
          { userId: investment.userId },
          {
            $inc: {
              amount: range
            },
            $set: { updatedAt: new Date(), totalRoi: calculatedRoi, title: selectedBar.title }
          },
          { session }
        );

      } else {

        totalInvestedAmount = range

        // Fetch bars settings for ROI calculation
        const bars = await collections.barsCollection().find({}).sort({ range: 1 }).toArray({ session });
        if (bars.length === 0) return barNotExist;
        if (totalInvestedAmount <= bars[0].range) return barNotExistInGivenRange(bars[0].range);

        let selectedBar = null;
        for (let i = 0; i < bars.length; i++) {
          if (i === bars.length - 1 || (totalInvestedAmount > bars[i].range && totalInvestedAmount <= bars[i + 1].range)) {
            selectedBar = bars[i];
            break;
          }
        }
        if (!selectedBar) return barNotExist;

        const monthlyReturnRate = selectedBar?.rate || 0;
        const monthlyRate = monthlyReturnRate / 100;
        calculatedRoi = totalInvestedAmount * monthlyRate;
        const newPortfolio = new PortfolioModel(
          null,
          investment.userId,
          investment.title,
          user.sponsorId,
          totalInvestedAmount,
          true,
          calculatedRoi,
          new Date(),
          new Date()
        );

        await collections.portfolioCollection().insertOne(
          newPortfolio.toDatabaseJson(),
          { session }
        );
        // Update user earnings and total investment
        await collections.userCollection().updateOne(
          { _id: investment.userId },
          {
            $inc: { totalInvestment: transaction.amount },
            $set: { earnings: calculatedRoi }
          },
          { session }
        );
      }

      // ---------------- ROR Calculation -----------------
      const minInvestmentSetting = await collections.settingsCollection().findOne(
        { title: 'min-investment' },
        { session }
      );
      const minInvestment = parseFloat(minInvestmentSetting?.value) || 0;

      let currentSponsorId = user.sponsorId;

      for (let level = 1; level <= 15; level++) {
        if (!currentSponsorId) break;

        const sponsor = await collections.userCollection().findOne(
          { referalId: currentSponsorId },
          { session }
        );
        if (!sponsor) {
          currentSponsorId = null;
          continue;
        }

        // Calculate team's total investment up to the current level
        const teamInvestment = await calculateTeamInvestment(sponsor.referalId, level, session);
        const requiredInvestment = minInvestment * level;

        if (teamInvestment < requiredInvestment) {
          currentSponsorId = sponsor.sponsorId;
          continue;
        }

        // Fetch ROR distribution rate for this level
        const distribution = await collections.distributionCollection().findOne(
          { level: level, type: 'ror' },
          { session }
        );
        if (!distribution) {
          currentSponsorId = sponsor.sponsorId;
          continue;
        }

        const rorAmount = calculatedRoi * (distribution.rate / 100);

        await collections.userCollection().updateOne(
          { referalId: sponsor.referalId },
          {
            $inc: { earnings: rorAmount, wallet: rorAmount }
          },
          { session }
        );

        const rorIncome = new RegularIncomeModel(
          null,
          sponsor.referalId,
          level,
          investmentId,
          user.referalId,
          'ror',
          true,
          new Date(),
          null,
          new Date()
        );
        await collections.regularIncomeCollection().insertOne(
          rorIncome.toDatabaseJson(),
          { session }
        );

        currentSponsorId = sponsor.sponsorId;
      }

      await session.commitTransaction();
      return incomeUpdated;

    } catch (error) {
      await session.abortTransaction();
      console.error("Transaction error:", error);
      return transactionFailed;
    } finally {
      await session.endSession();
    }
  }


};

export default User;
