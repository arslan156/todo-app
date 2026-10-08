import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import App from "./app/App";
import { Provider } from "react-redux";
import { store } from "./app/store";
import NotificationToast from "./shared/components/NotificationToast";
import GlobalLoader from "./shared/components/GlobalLoader";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <NotificationToast />
      <GlobalLoader />
    </Provider>
  </React.StrictMode>
);