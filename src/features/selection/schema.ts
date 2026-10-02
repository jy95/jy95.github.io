export const SELECTION_CATEGORIES = ['games', 'backlog', 'dlcs', 'planning'] as const;
export type SelectionCategory = typeof SELECTION_CATEGORIES[number];
export type SelectionCategories = Record<string, SelectionCategory>;
export type SelectionDocument = { version: 2 } & Record<SelectionCategory, string[]> & { legacyIds?: string[] };

export const emptySelection = (): SelectionDocument => ({ version: 2, games: [], backlog: [], dlcs: [], planning: [] });
export function normalizeSelectionIds(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter((id): id is string => typeof id === 'string' && /^(?:backlog:\d{1,128}|[A-Za-z0-9_-]{1,128})$/.test(id)))];
}
export function selectionIds(document: SelectionDocument): string[] {
    return normalizeSelectionIds(SELECTION_CATEGORIES.flatMap(category => document[category].map(id => category === 'backlog' ? `backlog:${id}` : id)).concat(document.legacyIds ?? []));
}
export function classifySelection(ids: string[], categories: SelectionCategories = {}): SelectionDocument {
    const document = emptySelection();
    for (const id of normalizeSelectionIds(ids)) {
        const category = id.startsWith('backlog:') ? 'backlog' : Object.hasOwn(categories, id) ? categories[id] : undefined;
        if (category) document[category].push(category === 'backlog' ? id.slice(8) : id);
        else {
            document.legacyIds ??= [];
            document.legacyIds.push(id);
        }
    }
    return document;
}
/** Strict shared/storage schema validation; duplicate identifiers are normalized. */
export function validateSelection(value: unknown): SelectionDocument {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid');
    const data = value as Record<string, unknown>;
    if (typeof data.version !== 'number') throw new Error('invalid');
    if (data.version !== 2) throw new Error('unsupported');
    if (Object.keys(data).some(key => !['version', ...SELECTION_CATEGORIES, 'legacyIds'].includes(key))) throw new Error('invalid');
    const document = emptySelection();
    for (const category of SELECTION_CATEGORIES) {
        const ids = data[category];
        const pattern = category === 'backlog' ? /^\d{1,128}$/ : /^[A-Za-z0-9_-]{1,128}$/;
        if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string' || !pattern.test(id))) throw new Error('invalid');
        document[category] = [...new Set(ids)] as string[];
    }
    if (data.legacyIds !== undefined) {
        if (!Array.isArray(data.legacyIds) || data.legacyIds.some(id => normalizeSelectionIds([id]).length !== 1)) throw new Error('invalid');
        document.legacyIds = normalizeSelectionIds(data.legacyIds);
    }
    return document;
}

/** Resolve only legacy IDs; explicit versioned categories remain authoritative. */
export function resolveLegacySelection(document: SelectionDocument, categories: SelectionCategories): SelectionDocument {
    const migrated = classifySelection(document.legacyIds ?? [], categories);
    const resolved = { ...document };
    for (const category of SELECTION_CATEGORIES) resolved[category] = [...new Set([...document[category], ...migrated[category]])];
    if (migrated.legacyIds?.length) resolved.legacyIds = migrated.legacyIds;
    else delete resolved.legacyIds;
    return resolved;
}
