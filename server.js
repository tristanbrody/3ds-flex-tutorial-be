require("dotenv").config();
const cors = require("cors");
const app = require("./app");
const { MongoClient } = require("mongodb");

app.use(cors());
app.listen(3001, () => {
  console.log("listening on port 3001");
});

const uri = `mongodb+srv://<tristan_89>:<Pancakes>@sandbox.dqsvm.mongodb.net/db?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});
