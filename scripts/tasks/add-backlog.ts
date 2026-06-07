import { platformToInt } from "./common/utils";

// Types
import type { Database } from "better-sqlite3";
import type { BacklogPayload } from "./common/types";

export async function addBacklogToDatabase(db: Database, payload: BacklogPayload) {
  const backlogToInsert = {
    title: payload.title,
    platform: payload.platform !== undefined ? platformToInt(payload.platform) : null,
    hltb_main: payload.hltb_main || null,
    hltb_extra: payload.hltb_extra || null,
    hltb_completionist: payload.hltb_completionist || null,
    notes: payload.notes || null
  };

  const insertStmt = db.prepare("INSERT INTO backlog (title, platform, hltb_main, hltb_extra, hltb_completionist, notes) VALUES (@title, @platform, @hltb_main, @hltb_extra, @hltb_completionist, @notes)");
  return insertStmt.run(backlogToInsert);
}