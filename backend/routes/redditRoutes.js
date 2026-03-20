const express = require("express");
const router = express.Router();
const {
  redditLogin,
  fetchSubreddit,
  getInsights,
  getTrending,
  getSorted,
  getRangeSearch,
  getPostById,
} = require("../controllers/redditControllers");

router.post("/login", redditLogin);
router.post("/fetch", fetchSubreddit);
router.post("/insights", getInsights);

router.get("/trending", getTrending);
router.get("/sorted", getSorted);
router.get("/range", getRangeSearch);
router.get("/post/:id", getPostById);

module.exports = router;
