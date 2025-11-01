/**
 * @fileoverview User model definition for LumiFlix API -miniproject 2
 * @description Mongoose schema and interface definition for user authentication,
 * profile management, and security features including password reset and account locking
 * @author Equipo 8
 * @version 1.0.0
 */

import mongoose, { Schema, Document } from 'mongoose';

/**
 * User interface extending Mongoose Document
 * @description Defines the structure and types for user documents in the database
 * @interface IUser
 * @extends {Document}
 */
export interface IUser extends Document {
  /** User's email address (unique identifier) */
  email: string;
  /** Hashed user password */
  password: string;
  /** User's first name */
  firstname: string;
  /** User's last name */
  lastname: string;
  /** User's age (must be at least 13) */
  age: number;
  /** Account activation status */
  isActive: boolean;
  /** Token for password reset functionality */
  resetPasswordToken: string | null;
  /** Expiration date for password reset token */
  resetPasswordExpires: Date | null;
  /** Number of failed login attempts */
  loginAttempts: number;
  /** Account lock expiration date */
  lockUntil: Date | null;
  /** Document creation timestamp */
  createdAt: Date;
  /** Document last update timestamp */
  updatedAt: Date;
}

/**
 * User schema definition
 * @description Mongoose schema configuration for user documents with validation rules,
 * security features, and timestamps
 * @type {Schema<IUser>}
 */
const userSchema = new Schema<IUser>({
  /**
   * User email address
   * @description Unique email identifier for user authentication
   * @type {Object}
   */
  email: {
    type: String,
    required: true,
    unique: true,
  },
  /**
   * User password
   * @description Hashed password for user authentication
   * @type {Object}
   */
  password: {
    type: String,
    required: true,
  },
  /**
   * User first name
   * @description User's given name
   * @type {Object}
   */
  firstname: {
    type: String,
    required: true,
  },
  /**
   * User last name
   * @description User's family name
   * @type {Object}
   */
  lastname: {
    type: String,
    required: true,
  },
  /**
   * User age
   * @description User's age with validation (must be integer and at least 13)
   * @type {Object}
   */
  age: {
    type: Number,
    validate: {
      validator: Number.isInteger,
    },
    min: 13,
    required: true,
  },
  /**
   * Account activation status
   * @description Boolean flag indicating if account is active
   * @type {Object}
   */
  isActive: {
    type: Boolean,
    default: true,
  },
  /**
   * Password reset token
   * @description Temporary token for password reset functionality
   * @type {Object}
   */
  resetPasswordToken: {
    type: String,
    required: false,
    default: null,
  },
  /**
   * Password reset token expiration
   * @description Date when password reset token expires
   * @type {Object}
   */
  resetPasswordExpires: {
    type: Date,
    required: false,
    default: null,
  },
  /**
   * Failed login attempts counter
   * @description Tracks number of consecutive failed login attempts
   * @type {Object}
   */
  loginAttempts: {
    type: Number,
    default: 0,
  },
  /**
   * Account lock expiration
   * @description Date when account lock expires (for security)
   * @type {Object}
   */
  lockUntil: {
    type: Date,
    default: null,
  },
}, { 
  timestamps: true, 
  collection: 'users' 
});

/**
 * User model export
 * @description Exports the Mongoose model for User documents with IUser interface
 * @type {Model<IUser>}
 */
export default mongoose.model<IUser>('User', userSchema);


