const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

const redditRoutes = require("./routes/redditRoutes");

app.use(express.json());
app.use(cors());

app.use("/api/reddit", redditRoutes);

app.listen(PORT, () => {
  console.log(`Server listening at PORT ${PORT}...`);
});
