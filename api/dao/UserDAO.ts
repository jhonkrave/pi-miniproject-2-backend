/**
 * @fileoverview User Data Access Object (DAO) for LumiFlix API - miniproject 2
 * @description Provides data access layer for user operations by extending
 * the GlobalDAO with User model-specific functionality
 * @author Equipo 8
 * @version 1.0.0
 */

import GlobalDAO from './GlobalDAO';
import User, { IUser } from '../models/User';

/**
 * User Data Access Object class
 * @description Extends GlobalDAO to provide user-specific database operations
 * @class UserDAO
 * @extends {GlobalDAO<IUser>}
 */
class UserDAO extends GlobalDAO<IUser> {
  /**
   * UserDAO constructor
   * @description Initializes the UserDAO with the User model
   * @constructor
   */
  constructor() {
    super(User);
  }
}

/**
 * UserDAO singleton instance
 * @description Exports a single instance of UserDAO for use throughout the application
 * @type {UserDAO}
 */
export default new UserDAO();


