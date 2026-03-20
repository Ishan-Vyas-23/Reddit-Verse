import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { toast } from "react-toastify";
import axios from "axios";

const BASE = "http://localhost:5000/api/reddit";

// PostCard is a separate component to avoid the useState-inside-map bug
const PostCard = ({ post, onInsights }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="post-card">
      <h3>{post.title}</h3>
      <p>
        <span>OP: </span>
        {post.author}
      </p>
      <p>
        <span>Upvotes: </span>
        {post.upvotes}
      </p>

      {post.image && (
        <img
          src={post.image}
          alt="post"
          style={{ width: "100%", borderRadius: "8px", marginBottom: "8px" }}
        />
      )}

      <p>
        <span>Description: </span>
        {post.selftext
          ? expanded
            ? post.selftext
            : post.selftext.slice(0, 200)
          : "none"}
        {post.selftext && post.selftext.length > 200 && (
          <a
            onClick={() => setExpanded(!expanded)}
            style={{ cursor: "pointer", color: "#64B5F6" }}
          >
            {expanded ? " ...read less" : " ...read more"}
          </a>
        )}
      </p>

      <div className="btn-cont">
        <a
          href={`https://reddit.com${post.permalink}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <CiSearch size={20} style={{ color: "whitesmoke" }} />
        </a>
        <button onClick={() => onInsights(post)}>Insights</button>
      </div>
    </div>
  );
};

// Main Analyze Page
const Analyze = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialPosts = location.state?.data || [];
  const subName = location.state?.subName || "unknown";

  const [activeTab, setActiveTab] = React.useState("all");
  const [displayedPosts, setDisplayedPosts] = React.useState(initialPosts);
  const [dsLabel, setDsLabel] = React.useState("LinkedList");
  const [loading, setLoading] = React.useState(false);

  const [minUpvotes, setMinUpvotes] = React.useState("");
  const [maxUpvotes, setMaxUpvotes] = React.useState("");

  const [lookupId, setLookupId] = React.useState("");
  const [lookedUpPost, setLookedUpPost] = React.useState(null);

  const [trendingLimit, setTrendingLimit] = React.useState(5);

  const runAnalyze = (post) => {
    navigate("/insights", { state: post });
    toast.info("Running analysis...");
  };

  // All Posts — LinkedList
  const showAll = () => {
    setActiveTab("all");
    setDisplayedPosts(initialPosts);
    setDsLabel("LinkedList");
    setLookedUpPost(null);
  };

  // Trending — Max Heap
  const fetchTrending = async () => {
    setActiveTab("trending");
    setLookedUpPost(null);
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/trending?limit=${trendingLimit}`);
      setDisplayedPosts(res.data.posts);
      setDsLabel("MaxHeap");
      toast.success(`Top ${res.data.posts.length} trending posts loaded`);
    } catch (err) {
      toast.error("Failed to fetch trending posts");
    } finally {
      setLoading(false);
    }
  };

  // Sorted — BST inorder
  const fetchSorted = async () => {
    setActiveTab("sorted");
    setLookedUpPost(null);
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/sorted`);
      setDisplayedPosts(res.data.posts);
      setDsLabel("BST (inorder)");
      toast.success("Posts sorted by upvotes via BST");
    } catch (err) {
      toast.error("Failed to fetch sorted posts");
    } finally {
      setLoading(false);
    }
  };

  // Range Search — BST
  const fetchRange = async () => {
    if (minUpvotes === "" || maxUpvotes === "") {
      toast.warn("Enter both min and max upvote values");
      return;
    }
    setActiveTab("range");
    setLookedUpPost(null);
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE}/range?min=${minUpvotes}&max=${maxUpvotes}`,
      );
      setDisplayedPosts(res.data.posts);
      setDsLabel("BST (range search)");
      toast.success(`${res.data.posts.length} posts found in range`);
    } catch (err) {
      toast.error("Range search failed");
    } finally {
      setLoading(false);
    }
  };

  // ID Lookup — HashMap
  const fetchById = async () => {
    if (!lookupId.trim()) {
      toast.warn("Enter a post ID");
      return;
    }
    try {
      const res = await axios.get(`${BASE}/post/${lookupId.trim()}`);
      setLookedUpPost(res.data.post);
      toast.success("Post found via HashMap!");
    } catch (err) {
      setLookedUpPost(null);
      toast.error("Post not found in HashMap");
    }
  };

  return (
    <div className="Analyze">
      <h1>r/{subName}</h1>

      {/* DS Controls Bar */}
      <div className="ds-controls">
        {/* All Posts — LinkedList */}
        <button
          className={`ds-tab ${activeTab === "all" ? "active" : ""}`}
          onClick={showAll}
        >
          All Posts
          <span className="ds-badge">LinkedList</span>
        </button>

        {/* Trending — MaxHeap */}
        <div className="ds-tab-group">
          <button
            className={`ds-tab ${activeTab === "trending" ? "active" : ""}`}
            onClick={fetchTrending}
          >
            Trending
            <span className="ds-badge">MaxHeap</span>
          </button>
          <input
            type="number"
            min={1}
            max={50}
            value={trendingLimit}
            onChange={(e) => setTrendingLimit(Number(e.target.value))}
            placeholder="limit"
            className="ds-small-input"
            title="Number of top posts"
          />
        </div>

        {/* Sorted — BST */}
        <button
          className={`ds-tab ${activeTab === "sorted" ? "active" : ""}`}
          onClick={fetchSorted}
        >
          Sorted
          <span className="ds-badge">BST</span>
        </button>

        {/* Range Search — BST */}
        <div className="ds-tab-group">
          <input
            type="number"
            placeholder="Min upvotes"
            value={minUpvotes}
            onChange={(e) => setMinUpvotes(e.target.value)}
            className="ds-small-input"
          />
          <input
            type="number"
            placeholder="Max upvotes"
            value={maxUpvotes}
            onChange={(e) => setMaxUpvotes(e.target.value)}
            className="ds-small-input"
          />
          <button
            className={`ds-tab ${activeTab === "range" ? "active" : ""}`}
            onClick={fetchRange}
          >
            Range
            <span className="ds-badge">BST</span>
          </button>
        </div>

        {/* ID Lookup — HashMap */}
        <div className="ds-tab-group">
          <input
            type="text"
            placeholder="Post ID (e.g. 1e2abc)"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            className="ds-small-input"
            style={{ width: "160px" }}
          />
          <button className="ds-tab" onClick={fetchById}>
            Lookup
            <span className="ds-badge">HashMap</span>
          </button>
        </div>
      </div>

      {/* Active DS source label */}
      <div className="ds-source-label">
        Source: <strong>{dsLabel}</strong>
        {loading && (
          <span style={{ marginLeft: 12, color: "#61dafb" }}>Loading...</span>
        )}
      </div>

      {/* HashMap single result */}
      {lookedUpPost && (
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ color: "#61dafb" }}>HashMap Lookup Result</h3>
          <PostCard post={lookedUpPost} onInsights={runAnalyze} />
        </div>
      )}

      {/* Empty state */}
      {!loading && displayedPosts.length === 0 && (
        <p style={{ color: "#aaa", marginTop: 20 }}>No posts to display.</p>
      )}

      {/* Post grid */}
      <div className="all-posts">
        {displayedPosts.map((post) => (
          <PostCard key={post.id} post={post} onInsights={runAnalyze} />
        ))}
      </div>
    </div>
  );
};

export default Analyze;
