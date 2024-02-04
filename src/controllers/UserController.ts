import {
  JsonController,
  Get,
  Param,
  BadRequestError,
} from "routing-controllers";
import { validate } from "class-validator";
import { UserModel } from "../models/User";

@JsonController("/api/users")
export class UserController {
  @Get("/:userId")
  async getUserById(@Param("userId") userId: string) {
    const errors = await validate({ userId });
    if (errors.length > 0) {
      throw new BadRequestError("Validation failed");
    }

    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      // Handle user not found
    }

    return user;
  }
}
