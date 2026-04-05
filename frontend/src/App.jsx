import { useState } from "react";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

function App() {
  const [page, setPage] = useState("landing");

  if (page === "landing") return <Landing setPage={setPage} />;
  if (page === "auth")    return <Auth setPage={setPage} />;
  if (page === "dashboard") return <Dashboard setPage={setPage} />;
}

export default App;