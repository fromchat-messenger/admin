import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { dismissBootSplash } from "./bootSplash";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

dismissBootSplash();