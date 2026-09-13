import type messages from '../../messages/en.json';

type MessageAtPath<
  Message,
  Path extends readonly string[],
> = Path extends readonly [infer Key extends keyof Message & string, ...infer Rest extends string[]]
  ? MessageAtPath<Message[Key], Rest>
  : Message;

/**
 * Retrieves the message object at a dot-namespace path from the canonical
 * English catalog. Consumers can derive the valid keys at that namespace.
 */
export type MessageKeysOf<Path extends readonly string[]> = MessageAtPath<
  typeof messages,
  Path
>;
