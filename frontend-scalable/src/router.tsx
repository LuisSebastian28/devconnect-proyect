import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import Explorer from "./layout/Explorer";
import Register from "./layout/Register";
import Login from "./layout/Login";
import PymeDashboard from "./layout/PymeDashboard";

export const router = createBrowserRouter([
  // login route (sin protección)
  { path: "/", element: <App /> },
  { path: "/explorer", element: <Explorer /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/dashboard", element: <PymeDashboard /> },
  { path: "*", element: <Navigate to="/" replace /> },
]);
