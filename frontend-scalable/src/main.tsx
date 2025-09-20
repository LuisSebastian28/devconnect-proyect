import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { router } from "./router";
import { Buffer } from "buffer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "./wagmi.ts";
import { RouterProvider } from "react-router-dom";

globalThis.Buffer = Buffer;
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);

// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import "./index.css";
// import NumberVerifier from "./components/NumberVerifier"; // Asegúrate de que la ruta sea correcta

// Solo necesitamos Buffer si vamos a usar wagmi. Si no, podemos eliminarlo.
// import { Buffer } from "buffer";

// globalThis.Buffer = Buffer;

// createRoot(document.getElementById("root")!).render(
//   <StrictMode>
//     <NumberVerifier />
//   </StrictMode>
// );
