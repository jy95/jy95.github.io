'use client';

import BaseCard from '@/features/games/components/BaseCard';
import CardEntry from '@/features/games/components/CardEntry';
import GameCardOverlay from '@/features/games/components/GameCardOverlay';
import SelectionButton from '@/features/selection/components/SelectionButton';
import { SelectionKindBadge } from '../SelectionKindBadge';
import type { SelectionEntry } from "@/domain/selection/types";

type SelectionCardProps = {
  entry: SelectionEntry;
  selectable?: boolean;
  onDetail: (entry: SelectionEntry) => void;
};

export function SelectionCard({ entry, onDetail, selectable = true }: SelectionCardProps) {
  const badge = <SelectionKindBadge category={entry.category} />;

  if (entry.source === 'published') {
    return <CardEntry selectable={selectable} category={entry.category} game={entry.game} badge={badge} />;
  }

  return (
    <BaseCard
      item={entry.game}
      badgesSlot={() => badge}
      onClick={() => onDetail(entry)}
      overlayPersistent
      overlaySlot={game => <GameCardOverlay game={game} />}
      actionsSlot={game => selectable && (
        <SelectionButton id={game.id} category={entry.category} title={game.title} />
      )}
    />
  );
}