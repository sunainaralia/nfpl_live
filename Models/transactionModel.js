class UserTransactionModel {
  constructor(
    id,
    userId,
    transactionId,
    charges,
    amount,
    invoiceNo,
    paymentMethod,
    status,
    createdAt,
    updatedAt
  ) {
    this.id = id;
    this.userId = userId;
    this.transactionId = transactionId;
    this.charges = charges;
    this.amount = amount;
    this.invoiceNo = invoiceNo;
    this.paymentMethod = paymentMethod;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  fromJson(jsonData) {
    return new UserTransactionModel(
      jsonData.id ?? null,
      jsonData.userId ?? "",
      jsonData.transactionId ?? "",
      jsonData.charges != null ? parseFloat(jsonData.charges) : 0,
      jsonData.amount != null ? parseFloat(jsonData.amount) : 0,
      jsonData.invoiceNo != null ? parseInt(jsonData.invoiceNo) : 0,
      jsonData.paymentMethod ?? "NEFT",
      jsonData.status === "true" || jsonData.status === true,
      jsonData.createdAt ?? new Date(),
      jsonData.updatedAt ?? new Date()
    );
  }

  toDatabaseJson() {
    return {
      id: this.id,
      userId: this.userId,
      transactionId: this.transactionId,
      status: this.status,
      charges: this.charges,
      amount: this.amount,
      invoiceNo: this.invoiceNo,
      paymentMethod: this.paymentMethod,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toClientJson() {
    return {
      id: this.id,
      userId: this.userId,
      transactionId: this.transactionId,
      charges: this.charges,
      amount: this.amount,
      invoiceNo: this.invoiceNo,
      paymentMethod: this.paymentMethod,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toUpdateJson(body) {
    const updateJson = {};

    for (const key in body) {
      if (key !== "id" && this.hasOwnProperty(key) && body[key] !== null && body[key] !== undefined && body[key] !== "") {
        let value = body[key];

        if (value === "true" || value === "false") {
          value = value === "true";
        }

        const parsedNumber = parseFloat(value);
        if (!isNaN(parsedNumber)) {
          value = parsedNumber;
        }

        if (key === "paymentMethod" && !["NEFT", "Cheque", "Cash"].includes(value)) {
          throw new Error("Invalid payment method. Allowed values are: NEFT, Cheque, Cash.");
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

export default UserTransactionModel;
