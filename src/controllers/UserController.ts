import "reflect-metadata";
import {
  JsonController,
  Get,
  Param,
  BadRequestError,
  Post,
  Body,
  HttpCode,
  NotFoundError,
} from "routing-controllers";
import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsString,
  validate,
} from "class-validator";
import { UserModel } from "../models/User";
import { UserResponse } from "../types";
import { Service } from "typedi";
import { Types } from "mongoose";

class GetUser {
  // userId is only required for the get group
  @IsMongoId()
  userId: string = "";
}

class CreateUser {
  @IsEmail()
  email: string = "";

  @IsNotEmpty()
  @IsString()
  name: string = "";
}

@JsonController("/api/users")
@Service()
export class UserController {
  @Get("/:userId")
  @HttpCode(200)
  async getUserById(@Param("userId") userId: string): Promise<UserResponse> {
    const isUserIdValid = Types.ObjectId.isValid(userId);

    if (!isUserIdValid) {
      throw new BadRequestError("Invalid userId");
    }

    const user = await UserModel.findOne({ _id: userId }).lean();
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  @Post("/")
  @HttpCode(201)
  async createUser(@Body() userPayload: CreateUser): Promise<UserResponse> {
    // Validate userPayload using class-validator
    const errors = await validate(userPayload);

    if (errors.length > 0) {
      throw new BadRequestError("Validation failed");
    }

    // Create a new user
    const newUser = await UserModel.create(userPayload);

    return newUser.toJSON();
  }
}
