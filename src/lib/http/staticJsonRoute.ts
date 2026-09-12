import { cachedJson } from "./cachedJson";

export function staticJsonRoute<T>(loadJson: () => Promise<{ default: T }>) {
    return async function GET() {
        const data = (await loadJson()).default;
        return cachedJson(data);
    };
}