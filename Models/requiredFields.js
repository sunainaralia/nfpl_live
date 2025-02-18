export const reqFields = {
  // user fields
  user: [
    "initial",
    "fullName",
    "password",
    "email",
    "dob",
    "phone",
    "type",
    "sponsorId",
    "accountName",
    "confirmPassword"
  ],
  // admin fields
  admin: ["initial", "fullName", "password", "email", "phone", "type"],

  // Transactions Fields
  transactions: ["amount", "type"],

  // TDS Fields
  tds: ["userId", "type", "typeId", "amount"],

  // Routes Fields
  routes: ["name", "key", "route", "auth", "type", "noCollapse"],

  // Source fields
  settings: ["title", "type", "value", "adminId"],

  // Connection Fields
  con: ["userId", "storage", "transactionId"],

  // Slabs Fields
  slab: ["range", "title", "type", "adminId", "rate"],

  // Royality
  royality: ["range", "level", "rate", "rule", "status", "designation"],

  // Rewards Fields
  rewards: ["tenure", "type", "salary", "title", "adminId"],

  // Rent Fields
  rent: ["userId", "level", "storage", "amount", "connectionId", "status"],

  // Notifications Fields
  notif: ["userId", "title", "message", "icon", "type"],
  // LimitRewards Fields
  claims: ["range", "rule", "type"],

  // KYC Fields
  kyc: [
    "userId",
    "bankName",
    "accountNo",
    "IFSC",
    "holder",
    "aadharNo",
    "panNo",
    "nomineeName",
    "nomineeRel",
    "nomineeAge",
    "gstIn",
  ],

  kycFiles: ["aadharFront", "aadharBack", "panFile", "sign"],

  // Income Fields
  income: ["userId", "amount", "type", "status", "charges", "tds", "level", "sourceId"],
  // Address Fields
  address: [
    "userId", "street", "city", "state", "country", "postalCode"
  ],
  investment: [
    "userId", "title", "amount"
  ],
  distribution: [
    "adminId", "rate", "level"
  ]
};
