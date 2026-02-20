const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config(); // Ensure dotenv is configured for DB connection

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useCreateIndex: true, // Deprecated in newer Mongoose versions
            // useFindAndModify: false // Deprecated in newer Mongoose versions
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;