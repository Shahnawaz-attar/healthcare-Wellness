// swaggerConfig.js

const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Healthcare Wellness API",
        version: "1.0.0",
        description: "API documentation for the Healthcare Wellness platform",
      },
      servers: [
        {
          url: "https://healthcare-wellness.onrender.com",
          description: "Production server",
        },
        {
          url: "http://localhost:4000",
          description: "Development server",
        },
      ],
    },
    apis: ["./src/routes/*.js", "./src/routes/*.ts"], // Adjust the path to match your route files
  };
  
module.exports = swaggerOptions
  