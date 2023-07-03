const express = require("express");
const bodyParser = require("body-parser");
const router = new express.Router();
const app = express();
const xmlParser = require("express-xml-bodyparser");
const xml = require("xml");
const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");
const cors = require("cors");
const axios = require("axios");
const qs = require("qs");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const JWT_OPTIONS = {};
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors());

Date.prototype.addHours = function (h) {
  this.setHours(this.getHours() + h);
  return this;
};

router.post("/token", (req, res) => {
  console.log("running");
  const jti = uuid();
  const iat = Math.floor(new Date().getTime() / 1000);
  const exp = Math.floor(new Date().addHours(1) / 1000);
  const iss = "61654c80424ec551b72be555";
  const OrgUnitId = "61654c80424ec551b72be554";
  const MAC = "55dd3cbe-23a6-456a-84dc-71cdfe5ff0b8";
  const ReturnUrl = "http://localhost:3001/after-challenge";
  const payload = {
    jti,
    iat,
    iss,
    OrgUnitId,
    ReturnUrl,
  };
  console.log("still running");

  const token = jwt.sign(payload, MAC, JWT_OPTIONS);
  return res.json({ token });
});

router.post("/token2", (req, res) => {
  const jti = uuid();
  const iat = Math.floor(new Date().getTime() / 1000);
  // const iss = process.env.ISS;
  //   const OrgUnitId = process.env.ORG_UNIT_ID;
  const ReturnUrl = "http://localhost:3001/after-challenge";
  const ReferenceId = req.body.ReferenceId;
  console.log(req.body);

  // const MAC = process.env.MAC;
  const iss = "61654c80424ec551b72be555";
  const OrgUnitId = "61654c80424ec551b72be554";
  const MAC = "55dd3cbe-23a6-456a-84dc-71cdfe5ff0b8";
  const Payload = {
    Payload: req.body.Payload,
    ACSUrl:
      "https://0merchantacsstag.cardinalcommerce.com/MerchantACSWeb/creq.jsp",
    TransactionId: req.body.TransactionId,
  };

  const payload = {
    jti,
    iat,
    iss,
    ReferenceId,
    OrgUnitId,
    ReturnUrl,
    Payload,
    ObjectifyPayload: true,
  };
  const token = jwt.sign(payload, MAC, {});
  return res.json({ token });
});

router.get("/", (req, res) => {
  return res.json({ res: "something" });
});

router.post("/auth-request", async (req, res) => {
  const config = {
    headers: { "Content-Type": "text/xml", Charset: "UTF-8" },
  };
  const authRes = await axios
    .post(
      "https://secure-test.worldpay.com/jsp/merchant/xml/paymentService.jsp",
      req.body.request,
      {
        auth: {
          username: process.env.USERNAME,
          password: process.env.PASSWORD,
        },
      }
    )
    .then(d => d);
  console.dir(authRes);

  res.send({ res: authRes.data, cookie: authRes.headers["set-cookie"][0] });
});

router.post("/after-challenge", async (req, res) => {
  // res.send({ response: req.body });
  // can return HTML with a script to call out to iFrame's parent on page load using messsage API
  console.dir(req.body);
  res.set("Content-Type", "text/html");
  res.send(
    Buffer.from(
      "<h2>Received response from Cardinal indicating completion of challenge</h2><script>window.parent.postMessage('Challenge completed', '*');</script>"
    )
  );
});

router.post("/second-auth-request", async (req, res) => {
  console.log(req.body.request.cookie);
  const config = {
    headers: { "Content-Type": "text/xml", Charset: "UTF-8" },
  };
  console.log(`req.body is ${req.body.request.xml}`);
  const secondAuthRes = await axios
    .post(
      "https://secure-test.worldpay.com/jsp/merchant/xml/paymentService.jsp",
      req.body.request.xml,
      {
        auth: {
          username: process.env.USERNAME,
          password: process.env.PASSWORD,
        },
        withCredentials: true,
        headers: {
          Cookie: req.body.request.cookie,
        },
      }
    )
    .then(d => d);
  console.log(secondAuthRes.data);
  res.send({ res: secondAuthRes.data });
});

app.use(router);
app.use((req, res) => {
  res.status(404).json({
    someBody: "Route not found or missing resource.....",
  });
});

module.exports = app;
