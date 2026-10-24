import React from "react";
import { createRoot } from "react-dom/client";
import Routing from "./config/routing.config.jsx";
import "react-toastify/dist/ReactToastify.css";
import "./assets/css/main.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Routing />
  </React.StrictMode>,
);
