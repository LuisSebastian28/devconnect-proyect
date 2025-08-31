import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import Explorer from "./layout/Explorer";

export const router = createBrowserRouter([
  // login route (sin protección)
  { path: "/", element: <App /> },
  { path: "/explorer", element: <Explorer /> },
  { path: "*", element: <Navigate to="/" replace /> },
]);
