import { ObjectId } from 'mongodb';  // Import ObjectId if needed

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
    referralKey
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
    this.referralKey = referralKey;
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
      jsonData.sponsorId ?? "", // sponsorId remains a string
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
      jsonData.referralKey ?? "" // referralKey is now a string
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
      referralKey: this.referralKey // referralKey is a string
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
      referralKey: this.referralKey // referralKey is now a string
    };
  }
  toMemberJson() {
    return {
      id: this._id ? this._id.toString() : null,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
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
      referralKey: this.referralKey
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
