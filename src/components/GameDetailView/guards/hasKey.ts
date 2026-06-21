import type { WithProperty } from "../types";

export default function hasKey<T extends object, K extends PropertyKey, V>(
    obj: T,
    key: K,
    validator: (value: unknown) => value is V
): obj is WithProperty<T, K, V> {
    return key in obj && validator((obj as any)[key]);
}