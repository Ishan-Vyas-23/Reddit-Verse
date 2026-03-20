import React from "react";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();
  function back() {
    navigate(-1);
  }
  return (
    <div className="back-btn-container">
      <div className="back-btn">
        <IoMdArrowBack onClick={back} />
      </div>
    </div>
  );
};

export default BackButton;
