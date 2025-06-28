/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html` and also used directly for WordPress integration.
 */

import { createRoot } from "react-dom/client";
import { App } from "./App";
import { FeedbackApp } from "./FeedbackApp";
import "./index.css";
import "./logo.svg";

const elem = document.getElementById("rwl-element");
const elem2 = document.getElementById("feedback-element");
if (!elem && !elem2) {
	console.error("Element with id 'rwl-element' or 'feedback-element' not found");
	throw new Error("Element with id 'rwl-element' or 'feedback-element' not found");
}

if (elem) {
	createRoot(elem).render(<App />);
}

if (elem2) {
	createRoot(elem2).render(<FeedbackApp />);
}
