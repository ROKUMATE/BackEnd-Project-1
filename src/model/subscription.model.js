import { Timestamp } from "mongodb";
import mongoose from "mongoose";

const subscrptionSchema = mongoose.Schema(
    {
        //
        subscriber: {
            type: mongoose.Types.ObjectId,
            // One Who is Subscribing
            ref: "User",
        },
        channel: {
            type: mongoose.Types.ObjectId,
            // One to Whome the Subscriber is Subscribing
            ref: "User",
        },
    },
    { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscrptionSchema);
