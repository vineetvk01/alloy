import express from "express";
import bodyParser from "body-parser";
import path from "path";
import db from "./db";
import Email from "../model/email";
import User from "../model/user";
import cronJob from "./cronJob";
import * as slackBot from "./slackBot";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();

cronJob.start();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
express.static(path.join(__dirname, "../public"));

app.get("/auth/redirect", async function (req, res) {
  if (!req.query.code) {
    return;
  }
  try {
    var data = {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code: req.query.code,
    };
    const response = await slackBot.getAccessToken(data);
    console.log("Response:::::", response);
    const user = {
      userId: response.authed_user.id,
      accessToken: response.access_token,
    };
    const newUser = new User(user);
    await newUser.save();
    res.sendFile(path.resolve(__dirname + "/../../public/success.html"));
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

app.get("/slack", function (req, res) {
  res.sendFile(path.resolve(__dirname + "/../../public/slack.html"));
});

// Email was blank in below route

// app.post("/event", async function (req, res) {
//   try {
//     const email = req.body.form_response.answers[0].email;
//     const newEmail = new Email({ email: email });
//     await newEmail.save();
//     await slackBot.sendScrappData();
//     res.status(200).send("done");
//   } catch (err) {
//     console.log(err);
//     res.status(400).send(err);
//   }
// });

// Avoid async as webhook should be 
app.post('/form/submit', async (req, res) => {

  const answers = req.body.form_response ? req.body.form_response.answers : null;
  try{
  const { text } = answers[0];
  console.log(text);

  const email = new Email({ email: text });
  email.save();
  const data = await slackBot.sendScrappData(email);
  console.log(data);
  } catch (err){
    console.log(err)
  }finally{
    // Dont keep the webhook on hold...
    res.send({})
  }
  
})

app.get('/', (req, res) => {
  console.log('Working');
  res.send({})
})

app.post('/signup', (req, res) => {
  const { email, password, name } = req.body;
  try {
    User.findOne({ email }, (error, user) => {
      if (error) throw new Error(error);
      if (user) throw new Error('User Exists');
    })
    const user = new User({ email, password, name });
    user.save();
  }catch(error) {
    res.status(400).send({ 
      error
    })
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  try {
    User.findOne({ email, password }, (error, user) => {
      if (error) throw new Error(error);
      if(user){
        // Set Session headers with JWT http-only
      }
    })
  }catch(error) {
    res.status(400).send({ 
      error
    })
  }
});



db.dbConnect()
  .then(() => {
    try {
      const port = process.env.port || 3000
      app.listen(port, () => {
        console.log(`App is listening on port ${port}!`);
      });
    } catch (err) {
      console.log(err);
    }
  })
  .catch((err) => console.log(err));
