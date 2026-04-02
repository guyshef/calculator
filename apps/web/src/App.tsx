import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LobbyScreen from './screens/LobbyScreen';
import AvatarScreen from './screens/AvatarScreen';
import MapScreen from './screens/MapScreen';
import ExerciseScreen from './screens/ExerciseScreen';
import ResultsScreen from './screens/ResultsScreen';
import ParentDashboard from './screens/ParentDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LobbyScreen />} />
          <Route path="/avatar" element={<AvatarScreen />} />
          <Route path="/map" element={<MapScreen />} />
          <Route path="/exercise/:level" element={<ExerciseScreen />} />
          <Route path="/results" element={<ResultsScreen />} />
          <Route path="/parent" element={<ParentDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}
