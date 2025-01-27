class NotificationsModel {
  constructor(
    id,
    userId,
    title,
    message,
    icon,
    type,
    status,
    delivered,
    createdAt,
    updatedAt
  ) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.message = message;
    this.icon = icon;
    this.type = type;
    this.status = status;
    this.delivered = delivered;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromJson(jsonData) {
    return new NotificationsModel(
      jsonData.id ?? null,
      jsonData.userId,
      jsonData.title,
      jsonData.message ?? "",
      jsonData.icon ?? "notifications",
      jsonData.type ?? "general",
      jsonData.status ?? false,
      jsonData.delivered ?? false,
      jsonData.createdAt ?? new Date(),
      jsonData.updatedAt ?? new Date()
    );
  }

  toDatabaseJson() {
    return {
      id: this.id,
      userId: this.userId,
      title: this.title,
      message: this.message,
      icon: this.icon,
      type: this.type,
      status: this.status,
      delivered: this.delivered,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toClientJson() {
    return {
      id: this.id,
      userId: this.userId,
      title: this.title,
      message: this.message,
      icon: this.icon,
      type: this.type,
      status: this.status,
      delivered: this.delivered,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toUpdateJson(body) {
    const updateJson = {};

    for (const key in body) {
      if (
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

export default NotificationsModel;
