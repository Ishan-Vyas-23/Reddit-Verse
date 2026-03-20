// Insights.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Sentiment from "sentiment";
import { Pie, Bar } from "react-chartjs-2";
import "chart.js/auto";
import { toast } from "react-toastify";

const sentimentAnalyzer = new Sentiment();

const Insights = () => {
  const location = useLocation();
  const post = location.state || {};
  const token = localStorage.getItem("reddit_token");

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [analysis, setAnalysis] = React.useState(null);

  React.useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      setError(null);
      if (!post?.permalink || !token) {
        setError("Missing post data. Go back and try again.");
        setLoading(false);
        return;
      }
      try {
        const res = await axios.post(
          "http://localhost:5000/api/reddit/insights",
          {
            permalink: post.permalink,
            token,
            post,
          },
        );

        setAnalysis(res.data);
        toast.success("Insights ready 🚀");
      } catch (err) {
        console.error(err);
        setError("Failed to load insights");
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [post.permalink]);

  if (loading)
    return (
      <div
        style={{
          padding: 20,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          color: "darkcyan",
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            border: "4px solid #ccc",
            borderTop: "4px solid #61dafb",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            textAlign: "center",
          }}
        />
        Analyzing comments — grab a snack.
      </div>
    );

  if (error)
    return <div style={{ padding: 20, color: "crimson" }}>Error: {error}</div>;
  if (!analysis) return null;

  const {
    counts,
    avgSentiment,
    weightedAvg,
    totalComments,
    topPositive,
    topNegative,
    postUps,
  } = analysis;

  const pieData = {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      {
        label: "Sentiment distribution",
        data: [counts.positive, counts.neutral, counts.negative],
      },
    ],
  };

  const barData = {
    labels: ["Avg Sentiment", "Weighted Avg", "Post Upvotes"],
    datasets: [
      {
        label: "Metrics",
        data: [Number(avgSentiment * 100), Number(weightedAvg * 100), postUps],
      },
    ],
  };

  return (
    <div className="Insights">
      <h2 style={{ textTransform: "capitalize" }}>{post.title}</h2>
      <p>
        r/{post.subreddit} • u/{post.author} • {post.ups ?? 0} upvotes
      </p>

      <div className="graphs">
        <div>
          <h4>Sentiment distribution</h4>
          <Pie data={pieData} style={{ minWidth: "400px" }} />
        </div>

        <div>
          <h4>Metrics</h4>
          <Bar data={barData} style={{ minWidth: "500px" }} />
          <div>
            <small>Total comments analyzed: {totalComments}</small>
            <br />
            <small>Avg sentiment (raw): {avgSentiment.toFixed(3)}</small>
            <br />
            <small>
              Weighted avg by comment score: {weightedAvg.toFixed(3)}
            </small>
          </div>
        </div>
      </div>

      <div className="comments-section">
        <div>
          <h4 style={{ color: "#F2F2F2", fontSize: "1.2rem" }}>
            Top Positive Comments
          </h4>
          {topPositive.length ? (
            topPositive.map((c) => (
              <div key={c.id}>
                <small>
                  score: {c.score} • sentiment: {c.sentimentScore} • by u/
                  {c.author}
                </small>
                <p>
                  {c.body.length > 300 ? c.body.slice(0, 300) + "..." : c.body}
                </p>
              </div>
            ))
          ) : (
            <p>No strongly positive comments found.</p>
          )}
        </div>

        <div>
          <h4 style={{ color: "#F2F2F2", fontSize: "1.2rem" }}>
            Top Negative Comments
          </h4>
          {topNegative.length ? (
            topNegative.map((c) => (
              <div key={c.id}>
                <small>
                  score: {c.score} • sentiment: {c.sentimentScore} • by u/
                  {c.author}
                </small>
                <p>
                  {c.body.length > 300 ? c.body.slice(0, 300) + "..." : c.body}
                </p>
              </div>
            ))
          ) : (
            <p>No strongly negative comments found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Insights;
