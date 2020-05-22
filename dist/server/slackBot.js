"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rp = require("request-promise");
const user_1 = __importDefault(require("../model/user"));
const wiki_1 = __importDefault(require("./wiki"));
exports.getAccessToken = (data) => __awaiter(this, void 0, void 0, function* () {
    const options = {
        method: "POST",
        uri: "https://slack.com/api/oauth.v2.access",
        form: data,
    };
    const authDetails = yield rp(options);
    console.log(JSON.parse(authDetails));
    return JSON.parse(authDetails);
});
exports.sendScrappData = () => __awaiter(this, void 0, void 0, function* () {
    try {
        const users = yield user_1.default.find();
        const scrappData = yield wiki_1.default();
        users.forEach((user) => __awaiter(this, void 0, void 0, function* () {
            const data = {
                token: user.accessToken,
                channel: user.userId,
                text: scrappData,
            };
            const options = {
                method: "POST",
                uri: "https://slack.com/api/chat.postMessage",
                form: data,
            };
            yield rp(options);
        }));
    }
    catch (err) {
        console.log(err);
    }
});
