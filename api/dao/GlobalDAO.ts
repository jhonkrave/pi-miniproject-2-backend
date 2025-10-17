import { Model, FilterQuery, Document } from 'mongoose';

export default class GlobalDAO<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    const document = new this.model(data);
    return await document.save();
  }

  async read(id: string): Promise<T> {
    const document = await this.model.findById(id);
    if (!document) throw new Error('Document not found');
    return document as T;
  }

  async update(id: string, updateData: Partial<T>): Promise<T> {
    const updatedDocument = await this.model.findByIdAndUpdate(
      id,
      updateData as any,
      { new: true, runValidators: true }
    );
    if (!updatedDocument) throw new Error('Document not found');
    return updatedDocument as T;
  }

  async delete(id: string): Promise<T> {
    const deletedDocument = await this.model.findByIdAndDelete(id);
    if (!deletedDocument) throw new Error('Document not found');
    return deletedDocument as T;
  }

  async getAll(filter: FilterQuery<T> = {} as FilterQuery<T>): Promise<T[]> {
    return await this.model.find(filter);
  }

  async findOne(filter: FilterQuery<T> = {} as FilterQuery<T>): Promise<T | null> {
    return await this.model.findOne(filter);
  }
}


