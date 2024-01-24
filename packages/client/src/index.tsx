import * as React from "react";
import * as ReactDOM from "react-dom/client";
import "./index.css";
import Match from "./views/Match";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Queue from "./views/Queue";
import QueueProvider from "./context/QueueContext";
import ModalProvider from "./context/ModalContext";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Queue />,
  },
  {
    path: "/match/:id?",
    element: <Match />,
  }
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <QueueProvider>
    <ModalProvider>
      <RouterProvider router={router} />
    </ModalProvider>
  </QueueProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
