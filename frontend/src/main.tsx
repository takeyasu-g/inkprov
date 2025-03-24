import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App";
import { LanguageProvider } from "./contexts/LangContext";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);

root.render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);
