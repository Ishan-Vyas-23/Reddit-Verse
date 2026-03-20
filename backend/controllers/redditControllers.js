const axios = require("axios");
const Sentiment = require("sentiment");
const {
  postList,
  postHeap,
  postBST,
  postMap,
  storePosts,
} = require("../services/postStore");

const redditLogin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Missing credentials" });

  try {
    const params = new URLSearchParams();
    params.append("grant_type", "password");
    params.append("username", username);
    params.append("password", password);

    const response = await axios.post(
      "https://www.reddit.com/api/v1/access_token",
      params.toString(),
      {
        auth: {
          username: process.env.REDDIT_CLIENT_ID,
          password: process.env.REDDIT_CLIENT_SECRET,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": process.env.REDDIT_USER_AGENT,
        },
      },
    );
    res.json({ success: true, token: response.data.access_token });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(401).json({ success: false, message: "Reddit login failed" });
  }
};

const fetchSubreddit = async (req, res) => {
  const { subName, postNum, filter, token } = req.body;
  if (!subName || !token)
    return res
      .status(400)
      .json({ success: false, message: "Missing subreddit or token" });

  try {
    const url = `https://oauth.reddit.com/r/${subName}/${filter}?limit=${postNum}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": process.env.REDDIT_USER_AGENT,
      },
    });

    const posts = response.data.data.children.map((item) => {
      const data = item.data;
      let image = "";
      if (data.preview?.images?.[0]?.source?.url)
        image = data.preview.images[0].source.url.replace(/&amp;/g, "&");
      else if (data.thumbnail?.startsWith("http")) image = data.thumbnail;

      return {
        id: data.id,
        title: data.title,
        author: data.author,
        upvotes: data.ups,
        comments: data.num_comments,
        selftext: data.selftext,
        permalink: data.permalink,
        created: data.created_utc,
        image,
      };
    });

    storePosts(posts);

    const postsFromList = postList.toArray();

    res.json({ success: true, posts: postsFromList });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch subreddit data" });
  }
};

const sentimentAnalyzer = new Sentiment();

const getInsights = async (req, res) => {
  console.log("BODY RECEIVED:", req.body);
  const { permalink, token, post } = req.body;
  if (!permalink || !token)
    return res.status(400).json({ message: "Missing data" });

  try {
    const url = `https://oauth.reddit.com${permalink}?limit=200`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": process.env.REDDIT_USER_AGENT,
      },
    });

    const raw = response.data?.[1]?.data?.children || [];

    const flatten = (children, out = []) => {
      for (const node of children) {
        if (!node || !node.data) continue;
        if (node.kind === "t1") {
          out.push({
            id: node.data.id,
            body: node.data.body || "",
            score: node.data.score || 0,
            author: node.data.author || "[unknown]",
          });
          if (node.data.replies?.data)
            flatten(node.data.replies.data.children, out);
        }
      }
      return out;
    };

    const comments = flatten(raw).filter(
      (c) =>
        c.body &&
        c.body.trim().length > 0 &&
        c.body !== "[deleted]" &&
        c.body !== "[removed]",
    );

    if (!comments.length) {
      return res.json({
        counts: { positive: 0, neutral: 0, negative: 0 },
        avgSentiment: 0,
        weightedAvg: 0,
        totalComments: 0,
        topPositive: [],
        topNegative: [],
        postUps: post?.upvotes || 0,
      });
    }

    const analyzed = comments.map((c) => {
      const r = sentimentAnalyzer.analyze(c.body);
      return { ...c, sentimentScore: r.score };
    });

    let pos = 0,
      neg = 0,
      neu = 0,
      sum = 0,
      weightedSum = 0,
      weightTotal = 0;
    for (const c of analyzed) {
      sum += c.sentimentScore;
      const weight = Math.log1p(Math.max(0, c.score));
      weightedSum += c.sentimentScore * (weight || 1);
      weightTotal += weight || 1;
      if (c.sentimentScore > 0) pos++;
      else if (c.sentimentScore < 0) neg++;
      else neu++;
    }

    const avgSentiment = sum / analyzed.length;
    const weightedAvg = weightTotal ? weightedSum / weightTotal : avgSentiment;

    const topPositive = analyzed
      .filter((c) => c.sentimentScore > 0)
      .sort((a, b) => b.sentimentScore - a.sentimentScore)
      .slice(0, 5);

    const topNegative = analyzed
      .filter((c) => c.sentimentScore < 0)
      .sort((a, b) => a.sentimentScore - b.sentimentScore)
      .slice(0, 5);

    res.json({
      counts: { positive: pos, neutral: neu, negative: neg },
      avgSentiment,
      weightedAvg,
      totalComments: analyzed.length,
      topPositive,
      topNegative,
      postUps: post?.upvotes || 0,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: "Analysis failed" });
  }
};

const getTrending = (req, res) => {
  const limit = parseInt(req.query.limit) || 5;

  if (postHeap.size === 0)
    return res.status(404).json({
      success: false,
      message: "No posts loaded. Fetch a subreddit first.",
    });

  const topPosts = postHeap.getTop(limit);
  res.json({ success: true, source: "MaxHeap", posts: topPosts });
};

const getSorted = (req, res) => {
  if (!postBST.root)
    return res.status(404).json({
      success: false,
      message: "No posts loaded. Fetch a subreddit first.",
    });

  const sorted = postBST.inorder();
  res.json({ success: true, source: "BST", posts: sorted });
};

const getRangeSearch = (req, res) => {
  const min = parseInt(req.query.min);
  const max = parseInt(req.query.max);

  if (isNaN(min) || isNaN(max))
    return res
      .status(400)
      .json({ success: false, message: "Provide ?min=X&max=Y as integers." });

  if (!postBST.root)
    return res.status(404).json({
      success: false,
      message: "No posts loaded. Fetch a subreddit first.",
    });

  const results = postBST.rangeSearch(min, max);
  res.json({
    success: true,
    source: "BST",
    range: { min, max },
    posts: results,
  });
};

const getPostById = (req, res) => {
  const { id } = req.params;
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Post ID is required." });

  const post = postMap.get(id);
  if (!post)
    return res
      .status(404)
      .json({ success: false, message: "Post not found in HashMap." });

  res.json({ success: true, source: "HashMap", post });
};

module.exports = {
  redditLogin,
  fetchSubreddit,
  getInsights,
  getTrending,
  getSorted,
  getRangeSearch,
  getPostById,
};
