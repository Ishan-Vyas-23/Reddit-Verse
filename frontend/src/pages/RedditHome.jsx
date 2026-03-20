import React from "react";
import { FaReddit } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Link } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const RedditHome = () => {
  const token = localStorage.getItem("reddit_token");
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!token) {
      toast.error("No token found — please login first");
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  const [subName, setSubName] = React.useState("");
  const [postNum, setPostNum] = React.useState(10);
  const [filter, setFilter] = React.useState("hot");

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!subName) {
      toast.error("Please enter a sub-reddit name");
      return;
    }

    try {
      toast.info("Fetching data from backend...");

      const res = await axios.post("http://localhost:5000/api/reddit/fetch", {
        subName,
        postNum,
        filter,
        token,
      });

      toast.success("Data fetched successfully");

      navigate("/analyze", {
        state: { data: res.data.posts, subName },
      });
    } catch (error) {
      console.error(error);
      toast.error("Error fetching data");
    }
  };

  const logout = () => {
    localStorage.removeItem("reddit_token");
    navigate("/");
    toast.success("logged out , token deleted");
  };

  return (
    <>
      <div className="App">
        <h1>
          <div>
            <FaReddit />
          </div>
          Reddit Analyse
        </h1>
        <h2>Get insights of any sub-reddit </h2>
        <form onSubmit={submitHandler}>
          <label htmlFor="subname">
            Sub-reddit Name
            <input
              type="text"
              placeholder="search for r/"
              onChange={(e) => setSubName(e.target.value)}
            />
          </label>
          <label htmlFor="number of posts">
            Number of posts
            <input
              type="number"
              placeholder="default : 10"
              onChange={(e) => setPostNum(Number(e.target.value))}
            />
          </label>
          <label htmlFor="filter">
            Filter
            <select
              name="filter"
              id="filter"
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="hot">Hot</option>
              <option value="new">New</option>
              <option value="top">Top</option>
              <option value="rising">Rising</option>
            </select>
          </label>
          <button type="submit">Go</button>
        </form>
        <div style={{ display: "flex", gap: "20px" }}>
          <Link
            to={"/login"}
            style={{
              color: "whitesmoke",
              textDecoration: "none",
              marginTop: "20px",
              display: "inline-block",
            }}
          >
            <IoMdArrowBack /> Back to login
          </Link>
          <Link
            to={"/"}
            style={{
              color: "whitesmoke",
              textDecoration: "none",
              marginTop: "20px",
              display: "inline-block",
            }}
            onClick={logout}
          >
            Logout
          </Link>
        </div>
      </div>
    </>
  );
};

export default RedditHome;
