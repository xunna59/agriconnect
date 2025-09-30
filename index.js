require('dotenv').config();
const { sequelize } = require('./src/models');
const app = require('./app');

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connection successful");
    await sequelize.sync();
    console.log("Database synced successfully.");

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`Server running at http://127.0.0.1:${PORT}`);
    });

    process.on('SIGINT', () => {
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGTERM', () => {
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Unable to start server:", error);
  }
};

start();
