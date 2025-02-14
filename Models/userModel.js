class UserModel {
  constructor(
    _id,
    initial,
    fullName,
    password,
    email,
    phone,
    image,
    dob,
    status,
    type,
    attempt,
    isVerified,
    referalId,
    sponsorId,
    level,
    member,
    unlocked,
    totalInvestment,
    rewardId,
    designation,
    earnings,
    withdraw,
    wallet,
    createdAt,
    updatedAt,
    linkdinId,
    instagramId

  ) {
    this._id = _id;
    this.initial = initial;
    this.fullName = fullName;
    this.password = password;
    this.email = email;
    this.phone = phone;
    this.image = image;
    this.dob = dob;
    this.status = status;
    this.type = type;
    this.attempt = attempt;
    this.isVerified = isVerified;
    this.referalId = referalId;
    this.sponsorId = sponsorId;
    this.level = level;
    this.member = member;
    this.unlocked = unlocked;
    this.totalInvestment = totalInvestment;
    this.rewardId = rewardId;
    this.designation = designation;
    this.earnings = earnings;
    this.withdraw = withdraw;
    this.wallet = wallet;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.linkdinId = linkdinId,
      this.instagramId = instagramId
  }

  // Method to create a new instance of UserModel from JSON data
  fromJson(jsonData) {
    return new UserModel(
      jsonData._id,
      jsonData.initial ?? "",
      jsonData.fullName ?? "",
      jsonData.password ?? "",
      jsonData.email ?? "",
      jsonData.phone ?? null,
      jsonData.image ?? "",
      jsonData.dob ?? null,
      jsonData.status ?? false,
      jsonData.type ?? "individual",
      jsonData.attempt ?? 5,
      jsonData.isVerified ?? false,
      jsonData.referalId ?? "",
      jsonData.sponsorId ?? "",
      jsonData.level ?? 0,
      jsonData.member ?? 0,
      jsonData.unlocked ?? 0,
      jsonData.totalInvestment ?? 0,
      jsonData.rewardId ?? [],
      jsonData.designation ?? "",
      jsonData.earnings ?? 0,
      jsonData.withdraw ?? 0,
      jsonData.wallet ?? 0,
      jsonData.createdAt ?? new Date(),
      jsonData.updatedAt ?? new Date(),
      jsonData.linkdinId ?? "",
      jsonData.instagramId ?? ""
    );
  }

  // Method to convert object to database-ready format
  toDatabaseJson() {
    return {
      _id: this._id,
      initial: this.initial,
      fullName: this.fullName,
      password: this.password,
      email: this.email,
      phone: this.phone,
      image: this.image,
      dob: this.dob,
      status: this.status,
      type: this.type,
      attempt: this.attempt,
      isVerified: this.isVerified,
      referalId: this.referalId, // referalId is a string
      sponsorId: this.sponsorId, // sponsorId is a string
      level: this.level,
      member: this.member,
      unlocked: this.unlocked,
      totalInvestment: this.totalInvestment,
      rewardId: this.rewardId,
      designation: this.designation,
      earnings: this.earnings,
      withdraw: this.withdraw,
      wallet: this.wallet,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      linkdinId: this.linkdinId,
      instagramId: this.instagramId
    };
  }

  // Method to convert to client JSON format, renaming _id to id
  toClientJson() {
    return {
      id: this._id.toString(),
      initial: this.initial,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      image: this.image,
      dob: this.dob,
      status: this.status,
      type: this.type,
      attempt: this.attempt,
      isVerified: this.isVerified,
      referalId: this.referalId, // referalId is now a string
      sponsorId: this.sponsorId,
      level: this.level,
      member: this.member,
      unlocked: this.unlocked,
      totalInvestment: this.totalInvestment,
      rewardId: this.rewardId,
      designation: this.designation,
      earnings: this.earnings,
      withdraw: this.withdraw,
      wallet: this.wallet,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      linkdinId: this.linkdinId,
      instagramId: this.instagramId

    };
  }
  toMemberJson() {
    return {
      id: this._id ? this._id.toString() : null,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      referalId: this.referalId,
      status: this.status,
      isVerified: this.isVerified,
      level: this.level,
      member: this.member,
      unlocked: this.unlocked,
      totalInvestment: this.totalInvestment,
      rewardId: this.rewardId,
      designation: this.designation,
      earnings: this.earnings,
      withdraw: this.withdraw,
      wallet: this.wallet,
      createdAt: this.createdAt,
      linkdinId: this.linkdinId,
      instagramId: this.instagramId
    };
  }

  toUpdateJson(body) {
    const updateJson = {};

    for (const key in body) {
      if (key !== "id" && this.hasOwnProperty(key) && body[key] !== undefined && body[key] !== "") {
        let value = body[key];

        if (value === "true" || value === "false") {
          value = value === "true";
        }

        const parsedNumber = parseFloat(value);
        if (!isNaN(parsedNumber)) {
          value = parsedNumber;
        }

        if (key === "rewardId" && Array.isArray(value)) {
          value = value;
        }

        if (key === "dob" && typeof value === "string") {
          value = new Date(value);
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

export default UserModel;
