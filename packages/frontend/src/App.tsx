import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./routes/Home";
import { Document } from "./routes/Document";

export function App() {
  return (
    <BrowserRouter basename="/collab">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doc/:id" element={<Document />} />
      </Routes>
    </BrowserRouter>
  );
}
