import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("reddit_token");

  const Go = () => {
    const link = token ? "/reddit-home" : "/login";
    navigate(link);
  };

  return (
    <div className="App">
      <h2 style={{ color: "#F8F8FF", lineHeight: "4rem", textAlign: "center" }}>
        Welcome to the Reddit Sentiment Analyzer! Here, you can explore any
        subreddit, fetch the latest posts, and dive deep into the community’s
        vibe. Just log in with your Reddit account, enter a subreddit name, and
        we’ll pull in the top posts for you. From there, you can view details,
        expand long discussions, and even analyze comments with sentiment
        insights to see if the crowd is feeling positive, negative, or neutral.
        Whether you’re researching trends, checking community mood, or just
        exploring Reddit in a new way — this is your starting point.
      </h2>
      <button onClick={Go}>Get started</button>
    </div>
  );
};
export default Home;
