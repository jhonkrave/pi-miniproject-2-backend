import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  age: number;
  isActive: boolean;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
  loginAttempts: number;
  lockUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    validate: {
      validator: Number.isInteger,
    },
    min: 13,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  resetPasswordToken: {
    type: String,
    required: false,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    required: false,
    default: null,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
    default: null,
  },
}, { timestamps: true, collection: 'users' });

export default mongoose.model<IUser>('User', userSchema);


