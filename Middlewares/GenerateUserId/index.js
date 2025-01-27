import collections from "../../Utils/Collections/collections.js";
import { serverError } from "../../Utils/Responses/index.js";


export const generateUserId = async (name) => {
  let generatedId = Math.floor(1000000 + Math.random() * 900000);
  let userId = name + generatedId;

  try {
    const result = await collections.userCollection().countDocuments({
      userId: userId
    });

    while (result > 0) {
      generatedId = Math.floor(1000000 + Math.random() * 9000000);
      const newResult = await collections.userCollection().countDocuments({
        userId: userId
      });
      result = newResult;
    }

    return {
      status: 200,
      userId: userId?.toLocaleLowerCase()
    };
  } catch (error) {
    return serverError;
  }
};

export const generateAdminId = async (name) => {
  let generatedId = Math.floor(1000000 + Math.random() * 900000);
  let userId = name + generatedId;

  try {
    const result = await collections.adminCollection().countDocuments({
      userId: userId
    });

    while (result > 0) {
      generatedId = Math.floor(1000000 + Math.random() * 9000000);
      userId = preFix + generatedId;
      const newResult = await collections.adminCollection().countDocuments({
        userId: userId
      });
      result = newResult;
    }

    return {
      status: 200,
      userId: userId.toLocaleLowerCase()
    };
  } catch (error) {
    console.error("Error checking user_id existence:", error.message);
    return serverError;
  }
};