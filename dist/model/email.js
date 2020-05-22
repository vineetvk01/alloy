"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const EmailSchema = mongoose_1.Schema({
    email: {
        type: String,
        required: true
    }
});
const Email = mongoose_1.model("Email", EmailSchema);
exports.default = Email;
