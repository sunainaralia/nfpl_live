class RegularIncomeModel {
  constructor(id, userId, level, investmentId,
    amount,
    sourceId,
    type, status, createdAt, lastPayment, updatedAt) {
    this.id = id;
    this.userId = userId;
    this.level = level;
    this.investmentId = investmentId;
    this.amount = amount;
    this.sourceId = sourceId;
    this.type = type;
    this.status = status;
    this.createdAt = createdAt;
    this.lastPayment = lastPayment;
    this.updatedAt = updatedAt;
  }

  // Static method to handle the conversion from JSON data to RegularIncomeModel instance
  static fromJson(jsonData) {
    return new RegularIncomeModel(
      jsonData._id ?? null,
      jsonData.userId,
      jsonData.level != null ? parseInt(jsonData.level) : 0,
      jsonData.investmentId,
      jsonData.amount,
      jsonData.sourceId,
      jsonData.type ?? "",
      jsonData.status !== undefined ? JSON.parse(jsonData.status) : false,
      jsonData.createdAt ? new Date(jsonData.createdAt) : new Date(),
      jsonData.lastPayment ? new Date(jsonData.lastPayment) : null,
      jsonData.updatedAt ? new Date(jsonData.updatedAt) : new Date()
    );
  }

  // Converts the current object instance to the database-compatible JSON format
  toDatabaseJson() {
    return {
      userId: this.userId,
      level: this.level,
      investmentId: this.investmentId,
      amount: this.amount,
      sourceId: this.sourceId,
      type: this.type,  // type (roi / ror / royalty / salary)
      status: this.status,
      createdAt: this.createdAt,
      lastPayment: this.lastPayment,
      updatedAt: this.updatedAt
    };
  }

  // Converts the current object instance to the client-facing JSON format
  toClientJson() {
    return {
      id: this.id,
      userId: this.userId,
      level: this.level,
      investmentId: this.investmentId,
      amount: this.amount,
      sourceId: this.sourceId,
      type: this.type,
      status: this.status,
      createdAt: this.createdAt,
      lastPayment: this.lastPayment,
      updatedAt: this.updatedAt
    };
  }

  // Method to update the object with values from the request body
  toUpdateJson(body) {
    const updateJson = {};

    for (const key in body) {
      if (key !== "id" && this.hasOwnProperty(key) && body[key] !== null && body[key] !== undefined && body[key] !== "") {
        let value = body[key];

        // Convert string representation of boolean to actual boolean
        if (value === "true" || value === "false") {
          value = value === "true";
        }

        // Convert string representation of number to actual number
        const parsedNumber = parseFloat(value);
        if (!isNaN(parsedNumber)) {
          value = parsedNumber;
        }
        if (key == "createdAt") {
          value = new Date(value);
        }
        updateJson[key] = value;
      }
    }

    // Update the timestamp on any update operation
    updateJson.updatedAt = new Date();
    return updateJson;
  }
}

export default RegularIncomeModel;
