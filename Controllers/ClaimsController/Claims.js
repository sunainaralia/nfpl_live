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
  notEligible,
  achieved,
  rewardAch,
  alreadyClaimed,
} from "../../Utils/Responses/index.js";
import ClaimRequest from "../../Models/claimModel.js";
import collections from "../../Utils/Collections/collections.js";
import Notifications from "../NotificationController/Notifications.js";
import { rewardAchieved } from "../../Utils/Notifications/index.js";
// import RentModel from "../../Models/rentModel.js";
import { options, transponder } from "../../Utils/Mailer/index.js";
// Model instance for ClaimRequest
const claims = new ClaimRequest();

// Controller for Notifications
const notification = new Notifications();

class Claims {
  static collection = Function;

  constructor() { }

  // Get all Claims
  async getClaims() {
    try {
      const result = await collections.claimsCollection().find().toArray();
      if (result.length > 0) {
        return {
          ...fetched("Claims"),
          data: result
        };
      } else {
        return notExist("Claims");
      }
    } catch (err) {
      return serverError;
    }
  }

  // Create new claim
  async createClaims(body) {
    const add = claims.fromJson(body);

    try {
      const result = await collections.claimsCollection().insertOne(add.toDatabaseJson());
      if (result && result.insertedId) {
        return {
          ...columnCreated("claims"),
          data: {
            id: result.insertedId
          },
        };
      } else {
        return tryAgain;
      }
    } catch (error) {
      return serverError;
    }
  }

  // Eligibility check for claiming rewards
  async eligibility(userId, tb, type) {
    let legs = [], i = 0;
    let users = await collections.userCollection().find({ placementId: userId }).toArray();

    if (users.length >= 2) {
      let distribution = [];
      let ratio = await collections.settingsCollection().findOne({ type: "reward" });

      while (i < users.length) {
        let j = 0;
        legs.push([users[i]]);
        while (j < legs[i]?.length) {
          let member = await collections.userCollection().find({ placementId: legs?.[i]?.[j].userId }).toArray();
          if (member.length > 0) {
            legs[i].push(...member);
          }
          j++;
        }

        const ownStorage = legs[i].reduce((total, user) => {
          if (user?.status && user?.storage?.own) {
            return total += parseFloat(user.storage?.own) ?? 0;
          } else {
            return total;
          }
        }, 0);

        distribution.push(parseFloat(ownStorage));
        i++;
      }

      if (distribution.length > 0) {
        distribution.sort((a, b) => a - b);
        let rewards = await collections.rewardCollection().find({ $and: [{ status: true }, { type: type }] }).toArray();

        if (rewards.length == 0) {
          return tryAgain;
        }

        rewards.sort((a, b) => a.range - b.range);
        let tbCount = rewards.reduce((total, reward) => {
          if (parseInt(reward.range) > parseInt(tb)) {
            return total;
          } else {
            return total += reward.range;
          }
        }, 0);

        let maxVal = distribution.pop();
        let firstCount = (parseFloat(tbCount * parseInt(ratio.rule) / 100));
        let restCount = 0;
        let leftBusi = 0;

        if (maxVal >= firstCount) {
          for (let terabyte of distribution) {
            restCount += parseFloat(terabyte / tbCount * 100);
            leftBusi += terabyte;
          }

          let restRatio = (parseInt(100 - ratio.rule));
          let secondCount = (parseFloat(tbCount * restRatio / 100));

          if (restCount >= restRatio) {
            return [true, ""];
          } else {
            return [false, (secondCount - leftBusi), 1, [secondCount, leftBusi, maxVal, tbCount, distribution]];
          }
        } else {
          return [false, (firstCount - maxVal), 2, tbCount, maxVal, distribution];
        }
      } else {
        return [false, "Business", 3];
      }
    }
    return [false, "Business", 3];
  }

  // Claim the reward
  async claimReward(userId, id) {
    try {
      const reward = await collections.rewardCollection().findOne({ _id: new ObjectId(id) });

      if (reward && reward.status) {
        const isClaimed = await collections.claimsCollection().countDocuments({
          $and: [{ userId: userId }, { rewardId: new ObjectId(id) }],
        });

        if (isClaimed > 0) {
          return alreadyClaimed;
        }

        const user = await collections.userCollection().findOne({ _id: new ObjectId(userId) });
        if (user && user.userId) {
          if (user.rewardId?.includes(id)) {
            return alreadyClaimed;
          }

          let condition = true;
          if (reward.type === "limit") {
            const currentDate = new Date();
            const joiningDate = new Date(user.createdAt);
            const totalDays = Math.floor((currentDate - joiningDate) / (1000 * 60 * 60 * 24));
            if (totalDays > reward.tenure) {
              condition = false;
            }
          }

          if (Boolean(condition)) {
            let isEligible = await this.eligibility(userId, parseInt(reward.range), reward.type);
            if (isEligible[0] === true) {
              let claim = new ClaimRequest().fromJson({
                userId: userId ?? "Error",
                title: reward.title ?? "Error",
                rewardId: reward._id ?? "Error",
              });
              await collections.claimsCollection().insertOne(claim.toDatabaseJson());
              await collections.userCollection().updateOne({ userId: userId }, { $push: { rewardId: id } });
              await notification.newNotification(rewardAchieved(userId, reward._id, reward.title));

              if (parseFloat(reward.salary) > 0) {
                // let salary = new RentModel().fromJson({
                //   userId: userId,
                //   source: reward._id,
                //   storage: reward.range,
                //   amount: reward.salary,
                //   connectionId: reward._id,
                //   type: "rewards",
                //   endDate: new Date(),
                // });

                salary.endDate.setFullYear(salary.endDate.getFullYear() + reward.rule);
                // await collections.rentCollection().insertOne(salary.toDatabaseJson());
              }

              let option = options(user.email, "Congratulations! New Reward Achieved!", rewardAch(user.name, userId, reward.title));
              await transponder.verify();
              await sendMail(option);

              return achieved;
            } else {
              return notEligible(isEligible);
            }
          } else {
            return notEligible([false, 'Business', 3]);
          }
        }

        return unauthorized;
      } else {
        return tryAgain;
      }
    } catch (err) {
      console.log(err);
      return serverError;
    }
  }

  // Get Claims by User ID
  async getClaimsById(id) {
    try {
      const result = await collections.claimsCollection().find({
        userId: id.toLowerCase(),
      }).toArray();

      if (result && result?.length > 0) {
        return {
          ...fetched("Claims"),
          data: result
        };
      } else {
        return notExist("Claims");
      }
    } catch (err) {
      return serverError;
    }
  }

  // Update Claim by ID
  async updateClaimsById(body) {
    try {
      const { id } = body;
      const add = claims.toUpdateJson(body);

      const result = await collections.claimsCollection().updateOne({
        _id: new ObjectId(id)
      }, {
        $set: {
          ...add,
        },
      });

      if (result.modifiedCount > 0) {
        return {
          ...columnUpdated("Claims")
        };
      } else {
        return InvalidId("Claim");
      }
    } catch (err) {
      return serverError;
    }
  }

  // Delete Claim by ID
  async deleteClaimsById(id) {
    try {
      const result = await collections.claimsCollection().deleteOne({
        _id: new ObjectId(id),
      });
      if (result.deletedCount > 0) {
        return {
          ...deleted("Claim")
        };
      } else {
        return InvalidId("Claim");
      }
    } catch (err) {
      return serverError;
    }
  }
}

export default Claims;
