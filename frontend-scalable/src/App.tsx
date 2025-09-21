import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <RouterProvider router={router} />
      </div>
    </AuthProvider>
  );
}

export default App;