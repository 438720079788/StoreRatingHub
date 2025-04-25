import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Material Icons
const link = document.createElement("link");
link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
link.rel = "stylesheet";
document.head.appendChild(link);

// Roboto Font
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

// Title
const title = document.createElement("title");
title.textContent = "Store Rating Platform";
document.head.appendChild(title);

createRoot(document.getElementById("root")!).render(<App />);
