import "reflect-metadata";
import { createExpressServer, useContainer } from "routing-controllers";
import { Container } from "typedi";
import { UserController } from "./controllers/UserController";
import express from "express";
import morgan from "morgan";
import { rateLimitMiddleware } from "./middlewares/RateLimitMiddleware";

useContainer(Container);

const app = createExpressServer({
  controllers: [UserController],
  validation: true,
  defaults: {
    paramOptions: {
      required: true,
    },
  },
});

app.use(rateLimitMiddleware);
app.use(morgan("combined")); // Logging middleware

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
