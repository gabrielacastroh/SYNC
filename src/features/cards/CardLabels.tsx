import type { CardLabel } from '@/types';
import { cn } from '@/utils/cn';

const labelColorMap: Record<string, string> = {
  gray: 'bg-gray-100/90 text-gray-700 dark:bg-gray-700/40 dark:text-gray-200',
  red: 'bg-red-100/90 text-red-700 dark:bg-red-900/40 dark:text-red-200',
  orange: 'bg-orange-100/90 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200',
  yellow: 'bg-yellow-100/90 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
  green: 'bg-green-100/90 text-green-700 dark:bg-green-900/40 dark:text-green-200',
  blue: 'bg-blue-100/90 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
  purple: 'bg-purple-100/90 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200',
  pink: 'bg-pink-100/90 text-pink-700 dark:bg-pink-900/40 dark:text-pink-200',
};

export function CardLabels({ labels }: { labels: CardLabel[] }): React.ReactElement {
  return (
    <>
      {labels.map((label) => (
        <span
          key={label.id}
          className={cn(
            'inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-tight shadow-sm',
            labelColorMap[label.color] ?? labelColorMap.gray
          )}
        >
          {label.text}
        </span>
      ))}
    </>
  );
}
