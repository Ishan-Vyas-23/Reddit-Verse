import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Register from "./pages/Login";
import RedditHome from "./pages/RedditHome";
import Analyze from "./pages/Analyze";
import Insights from "./pages/Insights";
import Home from "./pages/Home";
import Layout from "./components/Layout";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Register />} />
          <Route path="reddit-home" element={<RedditHome />} />
          <Route path="analyze" element={<Analyze />} />
          <Route path="insights" element={<Insights />} />
        </Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        theme="dark"
        toastStyle={{
          backgroundColor: "#1c1c1c",
          color: "#ededed",
          border: "1px solid #ededed",
          borderRadius: "8px",
          fontSize: "14px",
          fontFamily: "inherit",
        }}
        progressStyle={{
          background: "#ededed",
        }}
      />
    </>
  );
};

export default App;
