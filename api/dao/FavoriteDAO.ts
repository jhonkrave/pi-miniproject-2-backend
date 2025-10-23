/**
 * @fileoverview Favorite Data Access Object (DAO) for LumiFlix API - miniproject 2
 * @description Provides CRUD operations for favorite documents in the database
 * @author Equipo 8
 * @version 1.0.0
 */
import GlobalDAO from './GlobalDAO';
import Favorite, { IFavorite } from '../models/Favorite';

/**
 * Favorite Data Access Object class
 * @description Extends GlobalDAO to provide favorite-specific database operations
 * @class FavoriteDAO
 * @extends {GlobalDAO<IFavorite>}
 */
class FavoriteDAO extends GlobalDAO<IFavorite> {
    /**
     * FavoriteDAO constructor
     * @description Initializes the FavoriteDAO with the Favorite model
     * @constructor
     */
    constructor() {
        super(Favorite);
    }
}

/**
 * FavoriteDAO singleton instance
 * @description Exports a single instance of FavoriteDAO for use throughout the application
 * @type {FavoriteDAO}
 */
export default new FavoriteDAO();