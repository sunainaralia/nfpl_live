class RewardsModel {
  constructor(
    id,
    adminId,
    title,
    salary,
    type,
    tenure,
    status,
    createdAt,
    updatedAt
  ) {
    this.id = id;
    this.adminId = adminId;
    this.title = title;
    this.salary = salary;
    this.type = type;
    this.tenure = tenure;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Static method to convert JSON data into a RewardsModel instance
  fromJson(jsonData) {
    return new RewardsModel(

      jsonData._id ?? null,  
      jsonData.adminId ?? "",  
      jsonData.title ?? "",  
      !isNaN(parseFloat(jsonData.salary)) ? parseFloat(jsonData.salary) : 0,  
      jsonData.type ?? "lifetime",
      parseInt(jsonData.tenure) ?? 0, 
      jsonData.status !== undefined ? JSON.parse(jsonData.status) : false,  
      jsonData.createdAt ?? new Date(),  
      jsonData.updatedAt ?? new Date() 

    );
  }

  // Convert RewardsModel instance to database-compatible JSON
  toDatabaseJson() {
    return {
      adminId: this.adminId,
      title: this.title,
      salary: this.salary,
      type: this.type,
      tenure: this.tenure,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Convert the RewardsModel to client-facing JSON
  toClientJson() {
    return {
      id: this.id,
      adminId: this.adminId,
      title: this.title,
      salary: this.salary,
      type: this.type,
      tenure: this.tenure,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Method to update the RewardsModel instance from the provided data
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

    // Always update the `updatedAt` timestamp when updating
    updateJson.updatedAt = new Date();
    return updateJson;
  }
}

export default RewardsModel;
