const app = require("./app");
const connectDatabase = require("./config/database");

const port = process.env.PORT || 1000;

connectDatabase()
  .then(() => {
    console.log("Database connected");
    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    process.exitCode = 1;
  });
