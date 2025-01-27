import { ObjectId } from "mongodb";
import {
  columnCreated,
  columnUpdated,
  InvalidId,
  fetched,
  serverError,
  tryAgain,
  deleted,
  notExist,
} from "../../Utils/Responses/index.js";
import RewardsModel from "../../Models/rewardModel.js";
import collections from "../../Utils/Collections/collections.js";
// Models
const reward = new RewardsModel();

// Controller
class RewardsController {
  constructor() { }

  // Get All Rewards
  async getRewards(page, limit) {
    const skip = parseInt(page) * limit;
    try {
      const result = await collections.rewardCollection().find({}).skip(skip).limit(limit).toArray();
      if (result.length > 0) {
        return {
          ...fetched("Rewards"),
          data: result,
        };
      } else {
        return notExist("Rewards");
      }
    } catch (err) {
      return {
        ...serverError,
        err,
      };
    }
  }

  // Create New Reward
  async createReward(body) {
    const add = reward.fromJson(body);
    try {
      const result = await collections.rewardCollection().insertOne(add.toDatabaseJson());
      if (result && result.insertedId) {
        return {
          ...columnCreated("Reward"),
          data: {
            id: result.insertedId,
          },
        };
      } else {
        return tryAgain;
      }
    } catch (error) {
      return {
        ...serverError,
        err: error,
      };
    }
  }

  // Get Reward By ID
  async getRewardById(id) {
    try {
      const result = await collections.rewardCollection().findOne({
        _id: new ObjectId(id),
      });
      if (result) {
        let data = reward.fromJson(result);
        return {
          ...fetched("Reward"),
          data: data.toClientJson(),
        };
      } else {
        return InvalidId("Reward");
      }
    } catch (err) {
      return {
        ...serverError,
        err,
      };
    }
  }

  // Update Reward By ID
  // checked
  async updateRewardById(body) {
    try {
      const { id } = body;
      const add = reward.toUpdateJson(body);

      const result = await collections.rewardCollection().updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $set: {
            ...add,
          },
        }
      );

      if (result.modifiedCount > 0) {
        return {
          ...columnUpdated("Reward"),
          data: {},
        };
      } else {
        return InvalidId("Reward");
      }
    } catch (err) {
      return {
        ...serverError,
        err,
      };
    }
  }

  // Delete Reward By ID
  async deleteRewardById(id) {
    try {
      const result = await collections.rewardCollection().deleteOne({
        _id: new ObjectId(id),
      });

      if (result.deletedCount > 0) {
        return {
          ...deleted("Reward"),
        };
      } else {
        return InvalidId("Reward");
      }
    } catch (err) {
      return {
        ...serverError,
        err,
      };
    }
  }

  // Get Rewards By User ID
  async getRewardByUserId(userId) {
    try {
      const rewards = await collections.rewardCollection().find().toArray();
      const user = await collections.userCollection().findOne({ userId });
      if (rewards.length > 0 && user && user._id) {
        rewards.sort((a, b) => a.tenure - b.tenure);
        const currentDate = new Date();
        const userCreationDate = new Date(user.createdAt); // Assuming the user creation date is stored in the "createdAt" field

        const daysSinceCreation = Math.floor(
          (currentDate - userCreationDate) / (1000 * 60 * 60 * 24)
        ); // Calculate the number of days since user creation

        // Filter limit rewards and find the maximum rule value
        const limitRewards = rewards.filter((reward) => reward.type === "limit");
        let maxTenureValue;
        if (limitRewards.length > 0) {
          maxTenureValue = Math.max(...limitRewards.map((reward) => reward.tenure));
        }

        let rewardFilteration = limitRewards.filter(
          (e) => !user.rewardId?.includes(e._id.toString())
        );

        let data = [];
        let setter = true;
        if (daysSinceCreation < 20 && rewardFilteration.length > 0) {
          data = await this.filterReward(rewardFilteration, daysSinceCreation);
        } else {
          let modifiedRewards = rewards.filter((reward) => reward.type === "lifetime");
          modifiedRewards.sort((a, b) => a.tenure - b.tenure);

          data = modifiedRewards;
        }
        if (data?.length > 0) {
          let modifiedRewards = data?.map((reward) => {
            if (user.rewardId.includes(reward._id.toString())) {
              reward.claimed = true;
              reward.claim = false;
            } else {
              reward.claimed = false;
              reward.claim = setter;
              setter = false;
            }
            return reward;
          });

          return { ...fetched("Reward"), data: modifiedRewards };
        } else {
          return tryAgain;
        }
      } else {
        return tryAgain;
      }
    } catch (err) {
      console.log(err);
      return serverError;
    }
  }

  // Filter Rewards Based on Tenure
  async filterReward(reward, storage) {
    let newRewards = reward;
    newRewards.sort((a, b) => a.tenure - b.tenure);
    let slab = await this.filterRange(newRewards, storage);
    return slab;
  }

  // Filter Rewards Range
  async filterRange(res, range) {
    let response = [];
    for (let level of res) {
      if (parseInt(level.tenure) >= range) {
        response.push(level);
        break;
      }
    }
    return response;
  }
}

export default RewardsController;
