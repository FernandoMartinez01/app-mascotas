import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import "./styles/LoadingAnimation.css";

const LoadingAnimation = () => {
  return (
    <div className="loading-animation-container">
      <DotLottieReact
        src="https://lottie.host/dcc71db8-6faf-44a7-8c53-03dc047d4007/Q5fms50fZL.lottie"
        loop
        autoplay
      />
    </div>
  );
};

export default LoadingAnimation;