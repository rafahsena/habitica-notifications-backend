import express from "express";
import schedule from "node-schedule";
import axios from "axios";

const app = express();
require("dotenv").config();

const firebase = axios.create({ baseURL: process.env.FIREBASE_CLOUD_URL });
const habitica = axios.create({ baseURL: process.env.HABITICA_URL });

app.use(express.json());

app.post("/schedule", (req, res) => {
  const { title, description, date, token } = req.body;
  const dateObject = new Date(date);

  const body = {
    notification: {
      title: title,
      body: description,
    },
    to: token,
  };

  const job = schedule.scheduleJob(dateObject, function () {
    firebase.post("/send", body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${process.env.SERVER_KEY}`,
      },
    });
  });
  res.send();
});

app.get("/tasks", (req, res) => {
  const { "x-api-key": apiKey, "x-api-user": apiUser } = req.headers;
  const { type } = req.query;
  habitica
    .get("/tasks/user", {
      params: { type },
      headers: {
        "x-api-user": apiUser,
        "x-api-key": apiKey,
        "x-client-id": process.env.HABITICA_CLIENT_ID,
      },
    })
    .then((response) => {
      return res.status(200).send(response.data.data);
    })
    .catch((err) => res.status(404).send(err));
});

app.listen(process.env.PORT);
