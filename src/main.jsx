import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./i18n/config";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import store from "./store";
import App from "./App.jsx";
import "./scss/app.scss";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Provider store={store}>
        <App />
      </Provider>
    </Router>
  </StrictMode>
);
