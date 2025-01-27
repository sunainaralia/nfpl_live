class AddressModel {
  constructor(
    userId,
    street,
    city,
    state,
    country,
    postalCode,
    createdAt = new Date(),
    updatedAt = new Date()
  ) {
    this.userId = userId;
    this.street = street;
    this.city = city;
    this.state = state;
    this.country = country;
    this.postalCode = postalCode;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  fromJson(jsonData) {
    return new AddressModel(
      jsonData.userId ?? "",
      jsonData.street ?? "",
      jsonData.city ?? "",
      jsonData.state ?? "",
      jsonData.country ?? "",
      jsonData.postalCode ?? 0,
      jsonData.createdAt ?? new Date(),
      jsonData.updatedAt ?? new Date()
    );
  }

  toDatabaseJson() {
    return {
      street: this.street,
      userId: this.userId,
      city: this.city,
      state: this.state,
      country: this.country,
      postalCode: this.postalCode,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toClient() {
    return {
      street: this.street,
      city: this.city,
      state: this.state,
      country: this.country,
      postalCode: this.postalCode,
    };
  }

  toUpdateJson(body) {
    const updateJson = {};

    // Loop over all keys in the body
    for (const key in body) {
      // Do not update userId or id field, because userId is part of the query
      if (key !== "id" && key !== "userId" && this.hasOwnProperty(key) && body[key] !== null && body[key] !== undefined && body[key] !== "") {
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

        // Add to the update object
        updateJson[key] = value;
      }
    }

    // Always update the 'updatedAt' field
    updateJson.updatedAt = new Date();
    return updateJson;
  }
}

export default AddressModel;
