'use client';

import BaseCard from '@/features/games/components/BaseCard';
import CardEntry from '@/features/games/components/CardEntry';
import GameCardOverlay from '@/features/games/components/GameCardOverlay';
import SelectionButton from '@/features/selection/components/SelectionButton';
import { SelectionKindBadge } from '../SelectionKindBadge';
import type { SelectionEntry } from "@/domain/selection/types";

type SelectionCardProps = {
  entry: SelectionEntry;
  onDetail: (entry: SelectionEntry) => void;
};

export function SelectionCard({ entry, onDetail }: SelectionCardProps) {
  const badge = <SelectionKindBadge category={entry.category} />;

  if (entry.source === 'published') {
    return <CardEntry category={entry.category} game={entry.game} badge={badge} />;
  }

  return (
    <BaseCard
      item={entry.game}
      badgesSlot={() => badge}
      onClick={() => onDetail(entry)}
      overlayPersistent
      overlaySlot={game => <GameCardOverlay game={game} />}
      actionsSlot={game => (
        <SelectionButton id={game.id} category={entry.category} title={game.title} />
      )}
    />
  );
}