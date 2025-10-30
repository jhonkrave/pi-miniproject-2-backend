"use strict";
/**
 * @fileoverview User model definition for LumiFlix API -miniproject 2
 * @description Mongoose schema and interface definition for user authentication,
 * profile management, and security features including password reset and account locking
 * @author Equipo 8
 * @version 1.0.0
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
/**
 * User schema definition
 * @description Mongoose schema configuration for user documents with validation rules,
 * security features, and timestamps
 * @type {Schema<IUser>}
 */
const userSchema = new mongoose_1.Schema({
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
exports.default = mongoose_1.default.model('User', userSchema);
