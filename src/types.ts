import { Types } from "mongoose";

export type UserResponse = {
  _id: Types.ObjectId;
  name: string;
  email: string;
  createdAt?: Date | undefined;
};
