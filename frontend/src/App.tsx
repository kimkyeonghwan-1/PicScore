import { Outlet } from "react-router-dom";
import BottomBar from "./components/BottomBar/BottomBar";
function App() {
  return (
    <div
      className="border flex flex-col max-w-md mx-auto min-h-screen bg-gray-50
    "
    >
      <header></header>
      <main className="flex flex-col justify-between flex-grow">
        <Outlet />
      </main>
      <BottomBar />
    </div>
  );
}

export default App;
