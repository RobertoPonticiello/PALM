import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { getLanguage } from "@/hooks/useLanguage";
import { bootstrapI18nRuntime } from "@/lib/i18nRuntime";
import "./index.css";

bootstrapI18nRuntime(getLanguage());
createRoot(document.getElementById("root")!).render(<App />);
