import { StrictMode } from "react";
import { hydrateRoot, createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";
const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
