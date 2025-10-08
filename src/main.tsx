import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <NotificationsProvider>
      <App />
    </NotificationsProvider>
  </ThemeProvider>
);
