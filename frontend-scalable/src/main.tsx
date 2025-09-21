import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Buffer } from "buffer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "./wagmi.ts";
import App from "./App"; 

globalThis.Buffer = Buffer;
const queryClient = new QueryClient();

console.log('React app starting...');

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App /> 
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);