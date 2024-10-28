// swagger.js
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "MedEquip Pro",
      version: "1.0.0",
      description: "API documentation for MedEquip Pro.",
    },
    servers: [
      {
        url: "http://localhost:5000", // Replace with your server URL
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to your API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};

module.exports = setupSwagger;
