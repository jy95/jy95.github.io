import { compareRelatedGames } from "./compareRelatedGames";  
import type { RelatedGameResult } from "./types";  
  
/**  
 * Maintains up to `limit` best-ranked results via binary-search insertion  
 * into an array capped to `limit`, instead of collecting every candidate  
 * and sorting the full set afterward. Turns per-target ranking from  
 * O(C log C) into roughly O(C * limit) — effectively O(C) once `limit`  
 * is treated as a small constant (3-12) — as the candidate pool `C` grows.  
 *  
 * Still deduplicates by game id: if the same id is scored twice (e.g. a  
 * caller passes a candidate array with duplicates), only the better-scoring  
 * entry is kept, matching the previous Map-based behavior.  
 */  
export class BoundedTopK {  
    private readonly items: RelatedGameResult[] = [];  
    private readonly indexById = new Map<string, number>();  
  
    constructor(private readonly limit: number) {}  
  
    add(result: RelatedGameResult): void {  
        if (this.limit <= 0) return;  
  
        const existingIndex = this.indexById.get(result.game.id);  
        if (existingIndex !== undefined) {  
            if (compareRelatedGames(result, this.items[existingIndex]) < 0) {  
                this.removeAt(existingIndex);  
                this.insertSorted(result);  
            }  
            return;  
        }  
  
        if (this.items.length < this.limit) {  
            this.insertSorted(result);  
            return;  
        }  
  
        const worst = this.items[this.items.length - 1];  
        if (compareRelatedGames(result, worst) < 0) {  
            this.removeAt(this.items.length - 1);  
            this.insertSorted(result);  
        }  
    }  
  
    toArray(): RelatedGameResult[] {  
        return [...this.items];  
    }  
  
    private insertSorted(result: RelatedGameResult): void {  
        let low = 0;  
        let high = this.items.length;  
        while (low < high) {  
            const mid = (low + high) >>> 1;  
            if (compareRelatedGames(this.items[mid], result) <= 0) low = mid + 1;  
            else high = mid;  
        }  
        this.items.splice(low, 0, result);  
        this.reindexFrom(low);  
    }  
  
    private removeAt(index: number): void {  
        this.indexById.delete(this.items[index].game.id);  
        this.items.splice(index, 1);  
        this.reindexFrom(index);  
    }  
  
    private reindexFrom(from: number): void {  
        for (let i = from; i < this.items.length; i++) {  
            this.indexById.set(this.items[i].game.id, i);  
        }  
    }  
}