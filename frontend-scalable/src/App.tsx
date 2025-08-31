import { Navbar } from "./components/Navbar";
import Catalog from "./layout/Catalog";


function App() {
  return (
    <>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Catalog />
      </div>
    </>
  );
}

export default App;
