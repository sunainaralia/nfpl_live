class BarsModel {
  constructor(
    id,
    adminId,
    title,
    range,
    rate,
    chargesRate,
    type,
    status,
    tenure,
    charges,
    createdAt,
    updatedAt
  ) {
    this.id = id;
    this.adminId = adminId;
    this.title = title;
    this.range = range;
    this.rate = rate;
    this.chargesRate = chargesRate;
    this.type = type;
    this.status = status;
    this.tenure = tenure;
    this.charges = charges;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  fromJson(jsonData) {
    return new BarsModel(
      jsonData._id ?? null,
      jsonData.adminId ?? "",
      jsonData.title ?? "",
      !isNaN(parseFloat(jsonData.range)) ? parseFloat(jsonData.range) : 0,
      !isNaN(parseFloat(jsonData.rate)) ? parseFloat(jsonData.rate) : 0,
      !isNaN(parseFloat(jsonData.chargesRate)) ? parseFloat(jsonData.chargesRate) : 0,
      jsonData.type ?? "source",
      jsonData.status !== undefined ? JSON.parse(jsonData.status) : true,
      !isNaN(parseFloat(jsonData.tenure)) ? parseFloat(jsonData.tenure) : 0,
      jsonData.charges ?? 2,
      jsonData.createdAt ?? new Date(),
      jsonData.updatedAt ?? new Date()
    );
  }


  toDatabaseJson() {
    return {
      adminId: this.adminId,
      title: this.title,
      range: this.range,
      rate: this.rate,
      chargesRate: this.chargesRate,
      type: this.type,
      status: this.status,
      tenure: this.tenure,
      charges: this.charges,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toClientJson() {
    return {
      id: this.id,
      adminId: this.adminId,
      title: this.title,
      range: this.range,
      rate: this.rate,
      chargesRate: this.chargesRate,
      type: this.type,
      status: this.status,
      tenure: this.tenure,
      charges: this.charges,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
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

export default BarsModel;
