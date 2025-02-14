import { client } from "../../dbConnection.js";
const collections = {
    // Transaction Collection
    transCollection: () => client.db(process.env.MONGO_DATABASE).collection("transactions"),
    // User Collection
    userCollection: () => client.db(process.env.MONGO_DATABASE).collection("users"),
    // Income Collection
    incomeCollection: () => client.db(process.env.MONGO_DATABASE).collection("incomes"),
    // Address Collection
    addCollection: () => client.db(process.env.MONGO_DATABASE).collection("address"),
    // Kyc Collection
    kycCollection: () => client.db(process.env.MONGO_DATABASE).collection("kyc"),
    // Limit Rewards Collection
    claimsCollection: () => client.db(process.env.MONGO_DATABASE).collection("claims"),
    // Notification Collection
    notifCollection: () => client.db(process.env.MONGO_DATABASE).collection("notifications"),
    // Slab Collection
    slabCollection: () => client.db(process.env.MONGO_DATABASE).collection("products"),
    // Rewads Collection
    rewardCollection: () => client.db(process.env.MONGO_DATABASE).collection("rewards"),
    // Royality Collection
    royalityCollection: () => client.db(process.env.MONGO_DATABASE).collection("royalities"),
    // Connection Collection
    connCollection: () => client.db(process.env.MONGO_DATABASE).collection("connections"),
    // Source Collection
    settingsCollection: () => client.db(process.env.MONGO_DATABASE).collection("settings"),
    // Routes Collection
    routeCollection: () => client.db(process.env.MONGO_DATABASE).collection("routes"),
    // Admin Collection
    adminCollection: () => client.db(process.env.MONGO_DATABASE).collection("administrators"),
    // verification collection
    veriCollection: () => client.db(process.env.MONGO_DATABASE).collection("verification"),
    // bars collection
    barsCollection: () => client.db(process.env.MONGO_DATABASE).collection("bar"),
    // distribution collection
    distributionCollection: () => client.db(process.env.MONGO_DATABASE).collection("distribution"),
    // investment collection
    investmentCollection: () => client.db(process.env.MONGO_DATABASE).collection("investment"),
    // portfolio collection
    portfolioCollection: () => client.db(process.env.MONGO_DATABASE).collection("portfolio"),
    // regularIncome collection
    regularIncomeCollection:()=>client.db(process.env.MONGO_DATABASE).collection("regularIncome")
}

export default collections;