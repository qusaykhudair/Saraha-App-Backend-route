import { model, Schema } from "mongoose";

const schema = new Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    // ttl for otp -- time to live
    expiresAt: { type: Date, index: { expires: 0 } },
    attempts: { type: Number, default: 0 },
});

export const Otp = model("Otp", schema);