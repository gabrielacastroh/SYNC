import * as React from 'react';
import { cn } from '@/utils/cn';

interface TooltipContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  content: React.ReactNode;
  setContent: (v: React.ReactNode) => void;
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

export function TooltipProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [content, setContent] = React.useState<React.ReactNode>(null);
  const value = React.useMemo(
    () => ({ open, setOpen, content, setContent }),
    [open, content]
  );
  return (
    <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>
  );
}

export function Tooltip({
  children,
  content,
  side = 'top',
  className,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}): React.ReactElement {
  const ctx = React.useContext(TooltipContext);
  const [localOpen, setLocalOpen] = React.useState(false);
  const show = ctx ? ctx.open : localOpen;
  const setShow = ctx ? ctx.setOpen : setLocalOpen;
  const ref = React.useRef<HTMLDivElement>(null);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className={cn('relative inline-flex', className)}
      ref={ref}
      onMouseEnter={() => {
        if (ctx) ctx.setContent(content);
        setShow(true);
      }}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className={cn(
            'absolute z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95',
            positionClasses[side]
          )}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
}
