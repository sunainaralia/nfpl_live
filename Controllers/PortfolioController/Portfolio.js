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
import PortfolioModel from "../../Models/portfolio.js";
import collections from "../../Utils/Collections/collections.js";

const portfolioModel = new PortfolioModel();

class Portfolio {
  constructor() { }

  async getPortfolios(page, limit) {
    let skip = parseInt(page) * limit;
    try {
      const result = await collections
        .portfolioCollection()
        .find({})
        .skip(skip)
        .limit(limit)
        .toArray();

      if (result.length > 0) {
        return {
          ...fetched("Portfolios"),
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

  async createPortfolio(body) {
    const portfolio = PortfolioModel.fromJson(body);

    try {
      const result = await collections
        .portfolioCollection()
        .insertOne(portfolio.toDatabaseJson());

      if (result && result.insertedId) {
        return {
          ...columnCreated("Portfolio"),
          data: { id: result.insertedId },
        };
      } else {
        return tryAgain;
      }
    } catch (error) {
      return { ...serverError, error };
    }
  }

  async getPortfolioById(id) {
    try {
      const result = await collections.portfolioCollection().findOne({
        userId: id,
      });
      if (result) {
        return { ...fetched("Portfolio"), data: result };
      } else {
        return InvalidId("User");
      }
    } catch (err) {
      return { ...serverError, err };
    }
  }

  async updatePortfolioById(body) {
    try {
      const { id } = body;
      const updateData = portfolioModel.toUpdateJson(body);

      const result = await collections.portfolioCollection().updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.acknowledged && result.modifiedCount > 0) {
        return { ...columnUpdated("Portfolio") };
      } else {
        return InvalidId("Portfolio");
      }
    } catch (err) {
      return { ...serverError, err };
    }
  }

  async deletePortfolioById(id) {
    try {
      const result = await collections.portfolioCollection().deleteOne({
        _id: new ObjectId(id),
      });
      if (result.deletedCount > 0) {
        return { ...deleted("Portfolio") };
      } else {
        return InvalidId("Portfolio");
      }
    } catch (err) {
      return { ...serverError, err };
    }
  }
}

export default Portfolio;
