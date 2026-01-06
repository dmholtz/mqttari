import { BrowserRouter, Routes, Route, Navigate } from "react-router";

import ConnectPage from "./pages/ConnectPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* */}
        <Route path="/" element={<Navigate to="/connect" replace />} />
        <Route path="/connect" element={<ConnectPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes> 
    </BrowserRouter>
  )
}