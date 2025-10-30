"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @fileoverview Favorite Data Access Object (DAO) for LumiFlix API - miniproject 2
 * @description Provides CRUD operations for favorite documents in the database
 * @author Equipo 8
 * @version 1.0.0
 */
const GlobalDAO_1 = __importDefault(require("./GlobalDAO"));
const Favorite_1 = __importDefault(require("../models/Favorite"));
/**
 * Favorite Data Access Object class
 * @description Extends GlobalDAO to provide favorite-specific database operations
 * @class FavoriteDAO
 * @extends {GlobalDAO<IFavorite>}
 */
class FavoriteDAO extends GlobalDAO_1.default {
    /**
     * FavoriteDAO constructor
     * @description Initializes the FavoriteDAO with the Favorite model
     * @constructor
     */
    constructor() {
        super(Favorite_1.default);
    }
}
/**
 * FavoriteDAO singleton instance
 * @description Exports a single instance of FavoriteDAO for use throughout the application
 * @type {FavoriteDAO}
 */
exports.default = new FavoriteDAO();
