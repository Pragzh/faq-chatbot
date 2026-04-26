import { BrowserRouter, Routes, Route } from "react-router-dom";
import Setup from "./pages/Setup";
import ChatPage from "./pages/ChatPage";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Setup />} />
        <Route path="/chat/:shareLink" element={<ChatPage />} />
        <Route path="/dashboard/:shareLink" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}