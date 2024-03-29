import "reflect-metadata";
import { createExpressServer, useContainer } from "routing-controllers";
import { Container } from "typedi";
import { UserController } from "./controllers/UserController";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "../swagger.json";
import express from "express";
import morgan from "morgan";
import { RateLimiterMiddleware } from "./middlewares/RateLimitMiddleware";
import { connectToDatabase } from "./config/mongo.config";

useContainer(Container);

const app = createExpressServer({
  controllers: [UserController],
  validation: true,
  defaults: {
    paramOptions: {
      required: true,
    },
  },
  defaultErrorHandler: true,
  classTransformer: true,
  middlewares: [RateLimiterMiddleware],
});

app.use(morgan("combined"));

// documentation setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const startServer = async () => {
  await connectToDatabase();
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
};

startServer();
