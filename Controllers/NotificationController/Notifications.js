import { ObjectId } from "mongodb";
import {
    columnCreated,
    columnUpdated,
    deleted,
    fetched,
    InvalidId,
    markedRead,
    notExist,
    readed,
    serverError,
    tryAgain
} from "../../Utils/Responses/index.js";
import NotificationsModel from "../../Models/notificationModel.js";
import collections from "../../Utils/Collections/collections.js";

class Notifications {
    static collection = Function;

    constructor() { }

    // Extract All notifications
    async getNotifications(page, limit) {
        try {
            const skip = parseInt(page) * limit;
            const result = await collections.notifCollection().find({}).skip(skip).limit(limit).toArray();
            if (result.length > 0) {
                return {
                    ...fetched("Notifications"),
                    data: result
                };
            } else {
                return notExist("Notifications");
            }
        } catch (err) {
            return {
                ...serverError,
                err
            };
        }
    }

    // Static Create New Notification Controller
    async newNotification(body) {
        const notification = await collections.notifCollection().insertOne(body);
        await collections.notifCollection().createIndex({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
        if (notification.insertedId) {
            return notification;
        }
        return null;
    }

    // Create New Notifications Controller
    async createNotification(body) {
        try {
            console.log(body); 
            const notification = NotificationsModel.fromJson(body);  // Static method call
            const result = await this.newNotification(notification.toDatabaseJson());
            if (result && result.insertedId) {
                return {
                    ...columnCreated("Notification"),
                    data: {
                        id: result.insertedId
                    }
                };
            }
            return tryAgain;
        } catch (err) {
            return {
                ...serverError,
                err
            };
        }
    }


    // Notifications for Users controller
    async getUserNotification(userId, page, limit) {
        let skip = parseInt(page) * limit;
        try {
            const result = await collections.notifCollection().find({ userId }).skip(skip).limit(limit).toArray();
            if (result && result.length > 0) {
                return {
                    ...fetched("Notifications"),
                    data: result
                };
            }
            return notExist("Notifications");
        } catch (err) {
            return {
                ...serverError,
                err
            };
        }
    }

    // Mark Notification Read Controller
    async getNotificationById(id) {
        try {
            const result = await collections.notifCollection().findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: { status: true } },
                { returnDocument: "after" }
            );
            if (result && result.value) {
                return {
                    ...readed,
                    data: result.value
                };
            }
            return tryAgain;
        } catch (err) {
            return {
                ...serverError,
                err
            };
        }
    }

    // Update Notifications controller
    async updateNotification(body) {
        try {
            const { id } = body;
            const notification = new NotificationsModel().toUpdateJson(body); 
            const result = await collections.notifCollection().updateOne(
                { _id: new ObjectId(id) },
                { $set: { ...notification } }
            );
            if (result.modifiedCount > 0) {
                return {
                    ...columnUpdated("Notifications"),
                    data: {}
                };
            } else {
                return InvalidId("Notification");
            }
        } catch (err) {
            return {
                ...serverError,
                err
            };
        }
    }

    // Mark All Notifications as Read Controller
    async markRead(userId) {
        try {
            const response = await collections.notifCollection().updateMany(
                { userId },
                { $set: { status: true } }
            );
            if (response.modifiedCount > 0) {
                return markedRead;
            }
            return notExist("Notifications");
        } catch (err) {
            return serverError;
        }
    }

    // Delete notifications controller
    async deleteNotification(userId) {
        try {
            const result = await collections.notifCollection().deleteMany({
                userId: userId.toLowerCase(),
            });
            if (result.deletedCount > 0) {
                return {
                    ...deleted("Notification"),
                };
            } else {
                return notExist("Notifications");
            }
        } catch (err) {
            return {
                ...serverError,
                err
            };
        }
    }
}

export default Notifications;
