import { Navbar } from "./components/Navbar";
import Catalog from "./layout/Catalog";
import Landing from "./layout/Landing";

function App() {
  return (
    <>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Landing />
      </div>
    </>
  );
}

export default App;
