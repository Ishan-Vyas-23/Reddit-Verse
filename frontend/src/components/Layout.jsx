import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import BackButton from "./BackButton";

const Layout = () => {
  return (
    <>
      <Header />
      <BackButton />
      <Outlet />
      <Footer />
    </>
  );
};

export default Layout;
