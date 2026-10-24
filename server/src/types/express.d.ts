import { IUser } from '../models/user.model';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

