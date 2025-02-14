class InvestmentModel {
  constructor(
    id,
    userId,
    title,
    transactionId,
    amount,
    charges,
    status,
    withdraw,
    createdAt,
    updatedAt
  ) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.transactionId = transactionId;
    this.amount = amount;
    this.charges = charges;
    this.status = status;
    this.withdraw = withdraw;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  fromJson(jsonData) {
    return new InvestmentModel(
      jsonData._id ?? null,
      jsonData.userId ?? "",
      jsonData.title ?? "",
      jsonData.transactionId ?? [],
      jsonData.amount != null ? parseFloat(jsonData.amount) : 0,
      jsonData.charges != null ? parseFloat(jsonData.charges) : 0,
      jsonData.status != undefined ? JSON.parse(jsonData.status) : false,
      jsonData.withdraw != undefined ? JSON.parse(jsonData.status) : false,
      jsonData.createdAt ?? new Date(),
      jsonData.updatedAt ?? new Date()
    );
  }

  toDatabaseJson() {
    const adjustedAmount = this.amount - this.charges; // Deduct charges from amount

    return {
      userId: this.userId,
      title: this.title,
      transactionId: this.transactionId,
      amount: adjustedAmount,
      charges: this.charges,
      status: this.status,
      withdraw: this.withdraw,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toUpdateJson(body) {
    const updateJson = {};

    for (const key in body) {
      if (
        key !== "id" &&
        this.hasOwnProperty(key) &&
        body[key] !== null &&
        body[key] !== undefined &&
        body[key] !== ""
      ) {
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

    updateJson.updatedAt = new Date();
    return updateJson;
  }
}

export default InvestmentModel;
