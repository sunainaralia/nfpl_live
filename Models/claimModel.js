class ClaimRequest {
  constructor(id, userId, rewardId, title, status, createdAt, updatedAt) {
    this.id = id;
    this.userId = userId;
    this.rewardId = rewardId;
    this.title = title;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromJson(jsonData) {
    return new ClaimRequest(
      jsonData._id ?? null,
      jsonData.userId ?? "",
      jsonData.rewardId ?? "",
      jsonData.title ?? "",
      jsonData.status !== undefined ? JSON.parse(jsonData.status) : false,
      jsonData.createdAt ? new Date(jsonData.createdAt) : new Date(),
      jsonData.updatedAt ? new Date(jsonData.updatedAt) : new Date()
    );
  }

  toDatabaseJson() {
    return {
      userId: this.userId,
      rewardId: this.rewardId,
      title: this.title,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toClientJson() {
    return {
      id: this.id,
      userId: this.userId,
      rewardId: this.rewardId,
      title: this.title,
      status: this.status,
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

export default ClaimRequest;
