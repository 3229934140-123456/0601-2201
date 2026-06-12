import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Editor from "@/pages/Editor";
import Preview from "@/pages/Preview";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Editor />} />
        <Route path="/preview" element={<Preview />} />
      </Routes>
    </Router>
  );
}
