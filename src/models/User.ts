import { prop, getModelForClass } from "@typegoose/typegoose";

class User {
  @prop({ required: true })
  name!: string;

  @prop({ required: true, unique: true })
  email!: string;

  @prop({ default: Date.now() })
  createdAt?: Date;
}

export const UserModel = getModelForClass(User);
