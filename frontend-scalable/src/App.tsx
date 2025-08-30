import { Navbar } from "./components/Navbar";

function App() {
  return (
    <>
      <div className="min-h-screen bg-background">
        <Navbar />
        <h1 className="text-3xl md:text-4xl text-[#E86701] font-bold mb-4">
          SCALABLE JUAN{" "}
        </h1>
        <h2>SCALABLE JUAN </h2>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
