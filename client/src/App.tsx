import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import TrainerPage from "./pages/TrainerPage";
import EarTrainingPage from "./pages/EarTrainingPage";
import LessonsPage from "./pages/LessonsPage";
import ReferencePage from "./pages/ReferencePage";
import GlossaryPage from "./pages/GlossaryPage";
import ProgressPage from "./pages/ProgressPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="trainer" element={<TrainerPage />} />
        <Route path="ear-training" element={<EarTrainingPage />} />
        <Route path="lessons" element={<LessonsPage />} />
        <Route path="reference" element={<ReferencePage />} />
        <Route path="glossary" element={<GlossaryPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="progress" element={<ProgressPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
