class KycDetailsModel {
  constructor(
    id,
    userId,
    bankName,
    accountNo,
    IFSC,
    holder,
    aadharNo,
    panNo,
    aadharFile,
    panFile,
    nomineeName,
    nomineeRel,
    nomineeAge,
    gstIn,
    sign,
    status,
    createdAt,
    updatedAt

  ) {
    this.id = id;
    this.userId = userId;
    this.bankName = bankName;
    this.accountNo = accountNo;
    this.IFSC = IFSC;
    this.holder = holder;
    this.aadharNo = aadharNo;
    this.panNo = panNo;
    this.aadharFile = aadharFile;
    this.panFile = panFile;
    this.nomineeName = nomineeName;
    this.nomineeRel = nomineeRel;
    this.nomineeAge = nomineeAge;
    this.gstIn = gstIn;
    this.sign = sign;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  fromJson(jsonData) {
    return new KycDetailsModel(
      jsonData._id ?? null,
      jsonData.userId ?? "",
      jsonData.bankName ?? "",
      jsonData.accountNo ?? "",
      jsonData.IFSC ?? "",
      jsonData.holder ?? "",
      jsonData.aadharNo ?? "",
      jsonData.panNo ?? "",
      [jsonData.aadharFront ?? "", jsonData.aadharBack ?? ''] ?? "",
      jsonData.panFile ?? jsonData.pan?.file ?? "",
      jsonData.nomineeName ?? "",
      jsonData.nomineeRel ?? "",
      jsonData.nomineeAge ?? 0,
      jsonData.gstIn ?? "",
      jsonData.signFile ?? "",
      jsonData.status ?? false,
      jsonData.createdAt ?? new Date(),
      jsonData.updatedAt ?? new Date()
    );
  }

  toDatabaseJson() {
    return {
      userId: this.userId,
      bankName: this.bankName,
      accountNo: this.accountNo,
      IFSC: this.IFSC,
      holder: this.holder,
      aadharNo: this.aadharNo,
      panNo: this.panNo,
      aadharFile: this.aadharFile,
      panFile: this.panFile,
      nomineeName: this.nomineeName,
      nomineeRel: this.nomineeRel,
      nomineeAge: this.nomineeAge,
      gstIn: this.gstIn,
      sign: this.sign,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toClient() {
    return {
      bankName: this.bankName,
      accountNo: this.accountNo,
      IFSC: this.IFSC,
      holder: this.holder,
      aadharNo: this.aadharNo,
      panNo: this.panNo,
      gstIn: this.gstIn,
      nomineeName: this.nomineeName,
      sign: this.sign,
    };
  }
  toUpdateJson(body) {
    const updateJson = {};

    for (const key in body) {
      if (key != "id" && this.hasOwnProperty(key) && body[key] !== null && body[key] !== undefined && body[key] !== "") {
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

export default KycDetailsModel;
