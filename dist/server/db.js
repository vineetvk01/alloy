"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbConnect = () => new Promise((resolve, reject) => {
    mongoose_1.default.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        poolsize: 0,
        useCreateIndex: true,
        useUnifiedTopology: true,
        socketOptions: {
            socketTimeoutMS: 600
        }
    });
    mongoose_1.default.connection.on('connected', () => {
        console.log('Connected');
        resolve('connected');
    });
    mongoose_1.default.connection.on('error', (err) => {
        console.log(`Mongoose default connection error: ${err}`);
        reject(new Error(`Error in connection ${err}`));
    });
    mongoose_1.default.connection.on('disconnected', () => {
        console.log('Mongoose default connection disconnected');
    });
});
const dbDisconnect = () => mongoose_1.default.connection.close();
exports.default = { dbConnect, dbDisconnect };
