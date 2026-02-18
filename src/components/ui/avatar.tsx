import * as React from 'react';
import { cn } from '@/utils/cn';

const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full',
        className
      )}
      {...props}
    />
  )
);
Avatar.displayName = 'Avatar';

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = 'AvatarFallback';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  color?: string;
}

function AvatarWithFallback({ name, color, className, ...props }: AvatarProps): React.ReactElement {
  const initial = name ? name.slice(0, 2).toUpperCase() : '?';
  return (
    <Avatar
      className={cn(className)}
      style={color ? { backgroundColor: color } : undefined}
      {...props}
    >
      <AvatarFallback className={color ? 'bg-transparent text-white' : undefined}>
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}

export { Avatar, AvatarFallback, AvatarWithFallback };
