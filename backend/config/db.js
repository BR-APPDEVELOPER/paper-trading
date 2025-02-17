const mongoose = require('mongoose');

const connectDB = async () => {
    console.log(process.env.MONGO_URI);
    
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: MongoDB connection failed ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
