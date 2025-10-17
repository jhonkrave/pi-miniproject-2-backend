import GlobalDAO from './GlobalDAO';
import User, { IUser } from '../models/User';

class UserDAO extends GlobalDAO<IUser> {
  constructor() {
    super(User);
  }
}

export default new UserDAO();


