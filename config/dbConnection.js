const mongoose = require('mongoose');

const connectDb = async () => {
  const maxRetries = 5; // Set the number of retries
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`Database connected: ${conn.connection.host}`);
      break; // Exit the loop once connected
    } catch (err) {
      attempts++;
      console.error(`Attempt ${attempts} failed to connect to the database: ${err.message}`);
      if (attempts >= maxRetries) {
        console.error(`Failed to connect after ${maxRetries} attempts. Exiting...`);
        process.exit(1); // Exit the process if unable to connect
      }
      console.log(`Retrying in 5 seconds...`);
      await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds before retrying
    }
  }
};

module.exports = connectDb;
