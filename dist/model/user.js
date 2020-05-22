"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = mongoose_1.Schema({
    userId: {
        type: String,
        required: true
    },
    accessToken: {
        type: String,
        required: true
    }
});
const User = mongoose_1.model("User", UserSchema);
exports.default = User;
