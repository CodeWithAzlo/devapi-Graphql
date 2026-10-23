import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Workspaces } from './pages/Workspaces.jsx';
import { WorkspaceDetail } from './pages/WorkspaceDetail.jsx';
import { ApiDocs } from './pages/ApiDocs.jsx';
import { ApiChangelog } from './pages/ApiChangelog.jsx';
import { Explorer } from './pages/Explorer.jsx';
import { Guide } from './pages/Guide.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';

function Guard({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/guide" element={<Guide />} />
      <Route path="/" element={<Guard><Dashboard /></Guard>} />
      <Route path="/workspaces" element={<Guard><Workspaces /></Guard>} />
      <Route path="/workspaces/:workspaceId" element={<Guard><WorkspaceDetail /></Guard>} />
      <Route path="/apis/:apiId" element={<Guard><ApiDocs /></Guard>} />
      <Route path="/apis/:apiId/changelog" element={<Guard><ApiChangelog /></Guard>} />
      <Route path="/explorer" element={<Guard><Explorer /></Guard>} />
    </Routes>
  );
}
