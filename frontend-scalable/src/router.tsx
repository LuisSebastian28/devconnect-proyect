import { createBrowserRouter, Navigate } from "react-router-dom";
import Explorer from "./layout/Explorer";
import Register from "./layout/Register";
import Login from "./layout/Login";
import PymeDashboard from "./layout/PymeDashboard";
import { CreateLoanRequest } from "./layout/CreateLoanRequest";
import { RequestSuccess } from "./layout/RequestSuccess";
import Landing from "./layout/Landing";


export const router = createBrowserRouter([
  // login route (sin protección)
  //{ path: "/", element: <App /> },
  { path: "/", element: <Landing /> },
  { path: "/explorer", element: <Explorer /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/dashboard", element: <PymeDashboard /> },
  { path: "/create-request", element: <CreateLoanRequest /> },
  { path: "/request-success", element: <RequestSuccess  /> },
  { path: "*", element: <Navigate to="/" replace /> },
]);
