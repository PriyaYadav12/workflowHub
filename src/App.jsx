import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import WorkflowForm from './pages/WorkflowForm';

function App() {
  return (
    <div className="min-h-full">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/workflows/:id" element={<WorkflowForm />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App
