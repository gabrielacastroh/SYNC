import { usePersistSync } from '@/hooks/usePersistSync';
import { useThemeSync } from '@/hooks/useThemeSync';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps): React.ReactElement {
  usePersistSync();
  useThemeSync();
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {children}
    </div>
  );
}
