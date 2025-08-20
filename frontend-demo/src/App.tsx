import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Documentation from "@/pages/Documentation";
import API from "@/pages/API";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/documentation" element={<Documentation />} />
      <Route path="/api" element={<API />} />
    </Routes>
  );
}
