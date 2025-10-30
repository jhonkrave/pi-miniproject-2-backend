"use strict";
/**
 * @fileoverview User Data Access Object (DAO) for LumiFlix API - miniproject 2
 * @description Provides data access layer for user operations by extending
 * the GlobalDAO with User model-specific functionality
 * @author Equipo 8
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GlobalDAO_1 = __importDefault(require("./GlobalDAO"));
const User_1 = __importDefault(require("../models/User"));
/**
 * User Data Access Object class
 * @description Extends GlobalDAO to provide user-specific database operations
 * @class UserDAO
 * @extends {GlobalDAO<IUser>}
 */
class UserDAO extends GlobalDAO_1.default {
    /**
     * UserDAO constructor
     * @description Initializes the UserDAO with the User model
     * @constructor
     */
    constructor() {
        super(User_1.default);
    }
}
/**
 * UserDAO singleton instance
 * @description Exports a single instance of UserDAO for use throughout the application
 * @type {UserDAO}
 */
exports.default = new UserDAO();
