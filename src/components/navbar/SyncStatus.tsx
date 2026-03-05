import React from 'react';
import { Cloud, CloudOff } from 'lucide-react';

export type SyncStatusValue = 'idle' | 'syncing' | 'synced' | 'error';

interface SyncStatusProps {
  status: SyncStatusValue;
}

/**
 * Cloud icon and label for Firebase sync state. Renders nothing when status is 'idle'.
 */
export default function SyncStatus({ status }: SyncStatusProps) {
  if (status === 'idle') return null;
  const title =
    status === 'syncing'
      ? '同步中'
      : status === 'synced'
        ? '已同步'
        : '同步失敗';
  const label =
    status === 'syncing'
      ? '同步中'
      : status === 'synced'
        ? '已同步'
        : status === 'error'
          ? '同步失敗'
          : '';
  return (
    <span
      className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"
      title={title}
    >
      {status === 'error' ? (
        <CloudOff size={14} />
      ) : (
        <Cloud
          size={14}
          className={status === 'syncing' ? 'animate-pulse' : ''}
        />
      )}
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}
