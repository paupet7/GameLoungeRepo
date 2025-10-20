const swaggerAutogen = require('swagger-autogen')();

const output= "./swaggger-output.json";
const endpointsFiles = ["./routes/authRoutes.js", "./routes/gameRoutes.js", "./routes/commentRoutes.js", "./routes/themeRoutes.js"];

swaggerAutogen(output, endpointsFiles).then(() => {
    console.log("Swagger documentation generated successfully.");
});