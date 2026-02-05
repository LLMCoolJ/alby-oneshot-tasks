/**
 * MockNostrNote - Mock Nostr note display
 * Spec: 12-scenario-7-nostr-zap.md
 */

import { CopyButton } from '@/components/ui';
import type { MockNostrNote as MockNoteType } from '@/types';

interface MockNostrNoteProps {
  note: MockNoteType;
  lightningAddress?: string;
}

export function MockNostrNote({ note, lightningAddress }: MockNostrNoteProps) {
  const timeAgo = formatTimeAgo(note.created_at);

  return (
    <div className="space-y-4" data-testid="mock-nostr-note">
      {/* Note card */}
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        {/* Author header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
            <span className="text-purple-700 font-medium">
              {note.author.name.charAt(0)}
            </span>
          </div>
          <div>
            <div className="font-medium text-purple-900" data-testid="note-author">
              {note.author.name}
            </div>
            <div className="text-xs text-purple-600" data-testid="note-time">
              {timeAgo}
            </div>
          </div>
        </div>

        {/* Note content */}
        <p className="text-purple-900 mb-3" data-testid="note-content">
          {note.content}
        </p>

        {/* Note ID */}
        <div className="flex items-center gap-2 text-xs text-purple-600">
          <span data-testid="note-id">Note ID: {note.id.slice(0, 20)}...</span>
          <CopyButton value={note.id} />
        </div>
      </div>

      {/* Lightning Address info */}
      {lightningAddress ? (
        <div className="p-3 bg-slate-50 rounded-lg" data-testid="lightning-address-info">
          <div className="text-sm text-slate-600 mb-1">Lightning Address:</div>
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono" data-testid="lightning-address">
              {lightningAddress}
            </code>
            <CopyButton value={lightningAddress} />
          </div>
        </div>
      ) : (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg" data-testid="no-lightning-address">
          <p className="text-sm text-yellow-800">
            No Lightning Address found. Bob needs to set one up to receive zaps.
          </p>
        </div>
      )}

      {/* Zap indicator placeholder */}
      <div className="flex items-center gap-4 text-sm text-slate-500" data-testid="note-stats">
        <span>0 zaps</span>
        <span>0 replies</span>
        <span>0 reposts</span>
      </div>
    </div>
  );
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000) - timestamp;
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
