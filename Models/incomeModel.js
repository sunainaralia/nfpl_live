class IncomeModel {
  constructor(id, userId, sourceId, level, amount, type, tds, charges, status, createdAt, updatedAt) {
    this.id = id;
    this.userId = userId;
    this.sourceId = sourceId;
    this.level = level;
    this.amount = amount;
    this.type = type;
    this.tds = tds;
    this.charges = charges;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Static method to handle the conversion from JSON data to IncomeLog instance
  static fromJson(jsonData) {
    return new IncomeModel(
      jsonData._id ?? null,
      jsonData.userId,
      jsonData.sourceId,
      jsonData.level != null ? parseInt(jsonData.level) : 0,  // Ensure level is an integer
      parseFloat(jsonData.amount) || 0,  // Ensure amount is a valid float
      jsonData.type ?? "",  // Ensure type is a string
      parseFloat(jsonData.tds) || 0,  // Ensure tds is a valid float
      parseFloat(jsonData.conCharge) || 0,  // Ensure charges (formerly conCharge) is a valid float
      jsonData.status !== undefined ? JSON.parse(jsonData.status) : false,  // Ensure status is a boolean
      jsonData.createdAt ? new Date(jsonData.createdAt) : new Date(),  // Ensure createdAt is a date
      jsonData.updatedAt ? new Date(jsonData.updatedAt) : new Date()  // Ensure updatedAt is a date
    );
  }

  // Converts the current object instance to the database-compatible JSON format
  toDatabaseJson() {
    return {
      userId: this.userId,
      sourceId: this.sourceId,
      level: this.level,
      amount: this.amount,
      type: this.type,
      tds: this.tds,
      charges: this.charges,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Converts the current object instance to a client-friendly JSON format
  toClientJson() {
    return {
      id: this.id,
      userId: this.userId,
      sourceId: this.sourceId,
      level: this.level,
      amount: this.amount,
      type: this.type,
      tds: this.tds,
      charges: this.charges,
      status: this.status,
      createdAt: this.createdAt,
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

export default IncomeModel;
