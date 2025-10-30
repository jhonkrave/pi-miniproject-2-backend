"use strict";
/**
 * @fileoverview Database configuration and connection management for LumiFlix API - miniproject 2
 * @description MongoDB connection utilities using Mongoose with environment-based configuration
 * and error handling for database operations
 * @author Equipo 8
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Connect to MongoDB database
 * @description Establishes connection to MongoDB using the URI from environment variables
 * @returns {Promise<void>} Promise that resolves when connection is established
 * @throws {Error} If connection fails, process exits with code 1
 * @example
 * ```typescript
 * await connectDB();
 * console.log('Database connected successfully');
 * ```
 */
const connectDB = async () => {
    try {
        /**
         * MongoDB connection URI from environment variables
         * @description Retrieves the MongoDB connection string from MONGO_URI environment variable
         * @type {string}
         */
        const uri = process.env.MONGO_URI;
        /**
         * Establish MongoDB connection
         * @description Connects to MongoDB using the provided URI
         */
        await mongoose_1.default.connect(uri);
        /**
         * Connection success logging
         * @description Logs successful database connection
         */
        console.log('Connected to MongoDB');
    }
    catch (error) {
        /**
         * Connection error handling
         * @description Logs connection error and exits process with code 1
         * @param {Error} error - Connection error object
         */
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
/**
 * Disconnect from MongoDB database
 * @description Gracefully closes the MongoDB connection
 * @returns {Promise<void>} Promise that resolves when disconnection is complete
 * @example
 * ```typescript
 * await disconnectDB();
 * console.log('Database disconnected successfully');
 * ```
 */
const disconnectDB = async () => {
    try {
        /**
         * Close MongoDB connection
         * @description Gracefully disconnects from MongoDB
         */
        await mongoose_1.default.disconnect();
        /**
         * Disconnection success logging
         * @description Logs successful database disconnection
         */
        console.log('Disconnected from MongoDB');
    }
    catch (error) {
        /**
         * Disconnection error handling
         * @description Logs disconnection error (non-fatal)
         * @param {Error} error - Disconnection error object
         */
        console.error('Error disconnecting from MongoDB:', error.message);
    }
};
exports.disconnectDB = disconnectDB;
