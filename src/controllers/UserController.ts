import {
  JsonController,
  Get,
  Param,
  BadRequestError,
  Post,
  Body,
} from "routing-controllers";
import { validate } from "class-validator";
import { UserModel } from "../models/User";
import { UserResponse } from "../types";

@JsonController("/api/users")
export class UserController {
  @Get("/:userId")
  async getUserById(@Param("userId") userId: string): Promise<UserResponse> {
    const errors = await validate({ userId });
    if (errors.length > 0) {
      throw new BadRequestError("Validation failed");
    }

    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      throw new BadRequestError("User not found");
    }

    return user;
  }

  @Post("/")
  async createUser(
    @Body() userPayload: { name: string; email: string }
  ): Promise<UserResponse> {
    // Validate userPayload using class-validator
    const errors = await validate(userPayload);

    if (errors.length > 0) {
      throw new BadRequestError("Validation failed");
    }

    // Create a new user
    const newUser = await UserModel.create(userPayload);

    return newUser;
  }
}
