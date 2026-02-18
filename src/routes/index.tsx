import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { BoardList } from '@/features/boards/BoardList';
import { BoardView } from '@/features/boards/BoardView';

export function AppRoutes(): React.ReactElement {
  return (
    <Routes>
      <Route path="/" element={<AppShell><BoardList /></AppShell>} />
      <Route path="/board/:boardId" element={<AppShell><BoardView /></AppShell>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
