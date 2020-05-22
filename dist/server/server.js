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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const db_1 = __importDefault(require("./db"));
const email_1 = __importDefault(require("../model/email"));
const user_1 = __importDefault(require("../model/user"));
const cronJob_1 = __importDefault(require("./cronJob"));
const slackBot = __importStar(require("./slackBot"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const app = express_1.default();
cronJob_1.default.start();
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
express_1.default.static(path_1.default.join(__dirname, "../public"));
app.get("/auth/redirect", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.query.code) {
            return;
        }
        try {
            var data = {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                code: req.query.code,
            };
            const response = yield slackBot.getAccessToken(data);
            console.log("Response:::::", response);
            const user = {
                userId: response.authed_user.id,
                accessToken: response.access_token,
            };
            const newUser = new user_1.default(user);
            yield newUser.save();
            res.sendFile(path_1.default.resolve(__dirname + "/../../public/success.html"));
        }
        catch (err) {
            console.log(err);
            res.status(400).send(err);
        }
    });
});
app.get("/slack", function (req, res) {
    res.sendFile(path_1.default.resolve(__dirname + "/../../public/slack.html"));
});
app.post("/event", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const email = req.body.form_response.answers[0].email;
            const newEmail = new email_1.default({ email: email });
            yield newEmail.save();
            yield slackBot.sendScrappData();
            res.status(200).send("done");
        }
        catch (err) {
            console.log(err);
            res.status(400).send(err);
        }
    });
});
app.post('/form/submit', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const answers = req.body.form_response ? req.body.form_response.answers : null;
    const { text } = answers[0];
    console.log(text);
    const data = yield slackBot.sendScrappData();
    console.log(data);
    res.send({});
}));
app.get('/', (req, res) => {
    console.log('Working');
    res.send({});
});
db_1.default.dbConnect()
    .then(() => {
    try {
        const port = process.env.port || 3000;
        app.listen(port, () => {
            console.log(`App is listening on port ${port}!`);
        });
    }
    catch (err) {
        console.log(err);
    }
})
    .catch((err) => console.log(err));
