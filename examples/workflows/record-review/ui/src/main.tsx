import "@noorddev/vlak-react/css";
import { createRoot } from "react-dom/client";
import { RecordReviewApp } from "./record-review-app.tsx";
import "./style.css";

createRoot(document.getElementById("root")!).render(<RecordReviewApp />);
