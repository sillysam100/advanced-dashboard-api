import { Document } from 'mongoose';

export interface IRegister extends Document {
    _id: string;
    name: string;
    userId: string;
    controlType: 'read' | 'write';
}