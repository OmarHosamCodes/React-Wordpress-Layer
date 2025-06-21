/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html` and also used directly for WordPress integration.
 */

import { createRoot } from "react-dom/client";
import { FeedbackApp } from "./FeedbackApp";
import "./index.css";
import "./logo.svg";

const feedbackElem = document.getElementById("feedback-element");
const feedback = <FeedbackApp />;

createRoot(feedbackElem).render(feedback);
