import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./assets/global.css";
import { UserProvider } from "./context/UserContext.jsx";
import { MLProvider } from "./context/MLContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <MLProvider>
        <App />
      </MLProvider>
    </UserProvider>
  </StrictMode>
);
