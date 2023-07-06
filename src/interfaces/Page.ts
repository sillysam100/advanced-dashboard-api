import mongoose from 'mongoose';

export interface ILayoutEntry {
    registerId: mongoose.Schema.Types.ObjectId;
    cols: number;
    rows: number;
    position: number;
}

export interface IPage {
    _id?: mongoose.Schema.Types.ObjectId;
    siteId: mongoose.Schema.Types.ObjectId;
    name: string;
    registers: mongoose.Schema.Types.ObjectId[];
    layout: ILayoutEntry[];
}