import { Timestamp } from "mongodb";
import mongoose from "mongoose";

const subscrptionSchema = mongoose.Schema(
    {
        subscriber: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscrptionSchema);
