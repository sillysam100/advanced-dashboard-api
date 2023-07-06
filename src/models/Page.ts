import mongoose, { Schema } from "mongoose";
import { IPage } from "../interfaces/Page";

const PageSchema: Schema = new Schema({
    siteId: { type: Schema.Types.ObjectId, ref: "Site", required: true },
    name: { type: String, required: true },
    registers: [{ type: Schema.Types.ObjectId, ref: "Register", required: true }],
    layout: [{
        registerId: { type: Schema.Types.ObjectId, ref: "Register", required: true },
        cols: { type: Number, required: true },
        rows: { type: Number, required: true },
        position: { type: Number, required: true },
    }],
});

export const Page = mongoose.model<IPage>("Page", PageSchema);