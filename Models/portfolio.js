class PortfolioModel {
    constructor(
        id,
        userId,
        title,
        sponsorId,
        amount,
        status,
        totalRoi,
        createdAt,
        updatedAt
    ) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.sponsorId = sponsorId;
        this.amount = amount;
        this.status = status;
        this.totalRoi = totalRoi;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    fromJson(jsonData) {
        return new PortfolioModel(
            jsonData._id ?? null,
            jsonData.userId ?? "",
            jsonData.title ?? "",
            jsonData.sponsorId ?? "",
            jsonData.amount != null ? parseFloat(jsonData.amount) : 0,
            jsonData.status != undefined ? JSON.parse(jsonData.status) : false,
            jsonData.totalRoi != null ? parseFloat(jsonData.totalRoi) : 0,
            jsonData.createdAt ?? new Date(),
            jsonData.updatedAt ?? new Date()
        );
    }

    toDatabaseJson() {

        return {
            userId: this.userId,
            title: this.title,
            sponsorId: this.sponsorId,
            amount: adjustedAmount, // Save adjusted amount
            status: this.status,
            totalRoi: this.totalRoi,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    toUpdateJson(body) {
        const updateJson = {};

        for (const key in body) {
            if (
                key !== "id" &&
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

export default PortfolioModel;
