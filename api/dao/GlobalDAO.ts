/**
 * @fileoverview Global Data Access Object (DAO) base class for LumiFlix API - miniproject 2
 * @description Generic base class providing CRUD operations for MongoDB documents
 * using Mongoose models with TypeScript generics
 * @author Equipo 8
 * @version 1.0.0
 */

import { Model, FilterQuery, Document } from 'mongoose';

/**
 * Global Data Access Object base class
 * @description Generic base class that provides common CRUD operations for MongoDB documents
 * @template T - Document type that extends Mongoose Document
 * @class GlobalDAO
 */
export default class GlobalDAO<T extends Document> {
  /**
   * Mongoose model instance
   * @description Protected model instance for database operations
   * @type {Model<T>}
   * @protected
   */
  protected model: Model<T>;

  /**
   * GlobalDAO constructor
   * @description Initializes the DAO with a Mongoose model
   * @param {Model<T>} model - Mongoose model instance
   * @constructor
   */
  constructor(model: Model<T>) {
    this.model = model;
  }

  /**
   * Create a new document
   * @description Creates and saves a new document to the database
   * @param {Partial<T>} data - Partial document data for creation
   * @returns {Promise<T>} Created document
   * @throws {Error} If document creation fails
   */
  async create(data: Partial<T>): Promise<T> {
    const document = new this.model(data);
    return await document.save();
  }

  /**
   * Read a document by ID
   * @description Retrieves a single document by its ID
   * @param {string} id - Document ID
   * @returns {Promise<T>} Found document
   * @throws {Error} If document is not found
   */
  async read(id: string): Promise<T> {
    const document = await this.model.findById(id);
    if (!document) throw new Error('Document not found');
    return document as T;
  }

  /**
   * Update a document by ID
   * @description Updates an existing document with new data
   * @param {string} id - Document ID to update
   * @param {Partial<T>} updateData - Partial data to update
   * @returns {Promise<T>} Updated document
   * @throws {Error} If document is not found
   */
  async update(id: string, updateData: Partial<T>): Promise<T> {
    const updatedDocument = await this.model.findByIdAndUpdate(
      id,
      updateData as any,
      { new: true, runValidators: true }
    );
    if (!updatedDocument) throw new Error('Document not found');
    return updatedDocument as T;
  }

  /**
   * Delete a document by ID
   * @description Removes a document from the database
   * @param {string} id - Document ID to delete
   * @returns {Promise<T>} Deleted document
   * @throws {Error} If document is not found
   */
  async delete(id: string): Promise<T> {
    const deletedDocument = await this.model.findByIdAndDelete(id);
    if (!deletedDocument) throw new Error('Document not found');
    return deletedDocument as T;
  }

  /**
   * Get all documents with optional filter
   * @description Retrieves all documents matching the provided filter
   * @param {FilterQuery<T>} filter - MongoDB filter query (optional)
   * @returns {Promise<T[]>} Array of matching documents
   */
  async getAll(filter: FilterQuery<T> = {} as FilterQuery<T>): Promise<T[]> {
    return await this.model.find(filter);
  }

  /**
   * Find a single document with optional filter
   * @description Retrieves the first document matching the provided filter
   * @param {FilterQuery<T>} filter - MongoDB filter query (optional)
   * @returns {Promise<T | null>} Found document or null if not found
   */
  async findOne(filter: FilterQuery<T> = {} as FilterQuery<T>): Promise<T | null> {
    return await this.model.findOne(filter);
  }
}


