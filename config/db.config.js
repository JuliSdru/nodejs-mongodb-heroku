// config.js
const dotenv = require('dotenv').config();

module.exports = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    //MONGO_URL: process.env.MONGO_URL || 'mongodb+srv://127.0.0.1:27017/',
    MONGO_URL: process.env.MONGO_URL || 'mongodb+srv://dbUser:ticketera@cluster0.59zsy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
    MONGO_DB_NAME: process.env.MONGO_DB_NAME || 'ticketera'
}