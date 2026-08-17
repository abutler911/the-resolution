import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { Spinner } from "./components/ui";
import { useAuth } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import TheoryPage from "./pages/TheoryPage";
import TrainerPage from "./pages/TrainerPage";
import EarTrainingPage from "./pages/EarTrainingPage";
import LessonsPage from "./pages/LessonsPage";
import ReferencePage from "./pages/ReferencePage";
import GlossaryPage from "./pages/GlossaryPage";
import ProgressPage from "./pages/ProgressPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PracticeDashboard from "./pages/practice/PracticeDashboard";
import LogSessionPage from "./pages/practice/LogSessionPage";
import SessionsPage from "./pages/practice/SessionsPage";
import RepertoirePage from "./pages/practice/RepertoirePage";
import GoalsPage from "./pages/practice/GoalsPage";
import InsightsPage from "./pages/practice/InsightsPage";

/** Signed-in players land on their practice dashboard; everyone else gets the pitch. */
function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? <Navigate to="/practice" replace /> : <HomePage />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomeRoute />} />
        <Route path="theory" element={<TheoryPage />} />
        <Route path="trainer" element={<TrainerPage />} />
        <Route path="ear-training" element={<EarTrainingPage />} />
        <Route path="lessons" element={<LessonsPage />} />
        <Route path="reference" element={<ReferencePage />} />
        <Route path="glossary" element={<GlossaryPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="progress" element={<ProgressPage />} />
          <Route path="practice">
            <Route index element={<PracticeDashboard />} />
            <Route path="log" element={<LogSessionPage />} />
            <Route path="log/:id" element={<LogSessionPage />} />
            <Route path="sessions" element={<SessionsPage />} />
            <Route path="repertoire" element={<RepertoirePage />} />
            <Route path="goals" element={<GoalsPage />} />
            <Route path="insights" element={<InsightsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
