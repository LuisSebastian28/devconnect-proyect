import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";

export const router = createBrowserRouter([
  // login route (sin protección)
  { path: "/", element: <App /> },

  { path: "*", element: <Navigate to="/" replace /> },
]);
