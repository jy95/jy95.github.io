import type { CommonProps, BaseCardProps } from "./types";

export type CardFactoryDefaults<T extends CommonProps> = Partial<
  Pick<BaseCardProps<T>, "aspectRatio" | "objectFit" | "overlayPersistent" | "onClick">
>;

export function createCardFactory<T extends CommonProps>(
  defaults: CardFactoryDefaults<T> = {}
) {
  return function CardFactory(
    props: Omit<BaseCardProps<T>, "item"> & { item: T }
  ) {
    const { item, aspectRatio, objectFit, overlayPersistent, onClick, ...rest } = props;

    return (
      <BaseCard
        item={item}
        aspectRatio={aspectRatio ?? defaults.aspectRatio}
        objectFit={objectFit ?? defaults.objectFit}
        overlayPersistent={overlayPersistent ?? defaults.overlayPersistent}
        onClick={onClick ?? defaults.onClick}
        {...rest}
      />
    );
  };
}

// This import is intentionally kept below the function declaration so the
// factory remains declarative while still reusing the shared BaseCard.
import BaseCard from "./BaseCard";
