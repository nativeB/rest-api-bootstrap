import "reflect-metadata";
import request from "supertest";
import { Container } from "typedi";
import { createExpressServer, useContainer } from "routing-controllers";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { UserModel } from "../models/User";
import { UserController } from "../controllers/UserController";
import { rateLimitMiddleware } from "../middlewares/RateLimitMiddleware";
import morgan from "morgan";

useContainer(Container);

describe("UserController", () => {
  let mongoServer: MongoMemoryServer;
  let app: any;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = await mongoServer.getUri();

    await mongoose.connect(mongoUri);

    app = createExpressServer({
      controllers: [UserController],
      validation: true,
      defaults: {
        paramOptions: {
          required: true,
        },
      },
      middlewares: [rateLimitMiddleware, morgan("combined")],
      defaultErrorHandler: true,
      classTransformer: true,
    });

    // Apply rate limiter middleware directly for testing purposes
    app.use(rateLimitMiddleware);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  it("should create a new user", async () => {
    const userPayload = { name: "John Doe", email: "john.doe@example.com" };

    const response = await request(app)
      .post("/api/users")
      .send(userPayload)
      .expect(201);

    expect(response.body).toHaveProperty("_id");
    expect(response.body.name).toBe(userPayload.name);
    expect(response.body.email).toBe(userPayload.email);
    expect(response.body.createdAt).toBeTruthy();
  });

  it("should handle validation errors during user creation", async () => {
    const invalidUserPayload = { name: "", email: "invalid-email" };

    const response = await request(app)
      .post("/api/users")
      .send(invalidUserPayload)
      .expect(400);

    expect(response.body.message).toBe(
      "Invalid body, check 'errors' property for more info."
    );
    expect(response.body.errors.length).toBe(2);
  });

  it("should get a user by userId", async () => {
    const newUser = await UserModel.create({
      name: "Alice",
      email: "alice@example.com",
    });

    const response = await request(app)
      .get(`/api/users/${newUser._id}`)
      .expect(200);

    expect(response.body).toHaveProperty("_id");
    expect(response.body.name).toBe(newUser.name);
    expect(response.body.email).toBe(newUser.email);
    expect(response.body.createdAt).toBeTruthy();
  });

  it("should fail to get a user if userId is invalid", async () => {
    const invalidUserId = "invalid-user-id";

    const response = await request(app)
      .get(`/api/users/${invalidUserId}`)
      .expect(400);

    console.log(response.body);
    expect(response.body.message).toBe("Invalid userId");
  });

  it("should fail to get a user if userId is not found", async () => {
    const nonExistentUserId = "6034cbb21c9d440000000000";

    const response = await request(app)
      .get(`/api/users/${nonExistentUserId}`)
      .expect(404);

    expect(response.body.message).toBe("User not found");
  });
});
