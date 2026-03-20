import React from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const navigate = useNavigate();

  const submitLogin = async (e) => {
    e.preventDefault();

    if (!name || !password) {
      toast.error("enter all credentials");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/reddit/login", {
        username: name,
        password: password,
      });

      localStorage.setItem("reddit_token", res.data.token);

      toast.success("Logged in successfully");
      navigate("/reddit-home");
    } catch (err) {
      console.error(err);
      toast.error("Error logging in");
    }
  };

  return (
    <div className="App">
      <>
        <form onSubmit={submitLogin}>
          <h2>Login to your Reddit account </h2>
          <div>
            <label>
              <h2>Username</h2>
              <input
                type="password"
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label>
              <h2>Password</h2>
              <input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          </div>
          <button>Login</button>
        </form>
        <Link
          to={"/reddit-home"}
          style={{
            color: "whitesmoke",
            textDecoration: "none",
            marginTop: "20px",
            display: "inline-block",
          }}
        >
          Already have a token ?
        </Link>
      </>
    </div>
  );
};

export default Register;
