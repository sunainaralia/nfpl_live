class UserTransactionModel {
  constructor(
    id,
    userId,
    charges,
    transactionId,
    amount,
    invoiceNo,
    tax,
    paymentMethod,
    status,
    createdAt,
    updatedAt
  ) {
    this.id = id;
    this.userId = userId;
    this.charges = charges;
    this.transactionId = transactionId;
    this.amount = amount;
    this.invoiceNo = invoiceNo;
    this.tax = tax;
    this.paymentMethod = paymentMethod;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  fromJson(jsonData) {
    return new UserTransactionModel(
      jsonData._id ?? null,
      jsonData.userId ?? "",
      jsonData.charges != null ? parseFloat(jsonData.charges) : 0,
      jsonData.transactionId ?? "",
      jsonData.amount != null ? parseFloat(jsonData.amount) : 0,
      jsonData.invoiceNo != null ? parseInt(jsonData.invoiceNo) : 0,
      jsonData.tax ?? "",
      jsonData.paymentMethod ?? "NEFT",
      jsonData.status === "true" || jsonData.status === true,
      jsonData.createdAt ?? new Date(),
      jsonData.updatedAt ?? new Date()
    );
  }

  toDatabaseJson() {
    return {
      userId: this.userId,
      status: this.status,
      transactionId: this.transactionId,
      charges: this.charges,
      amount: this.amount,
      tax: this.tax,
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
      charges: this.charges,
      transactionId: this.transactionId,
      amount: this.amount,
      invoiceNo: this.invoiceNo,
      tax: this.tax,
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
