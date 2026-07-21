export type TaskType =
  | "ADD_GAME"
  | "UPDATE_GAME"
  | "DELETE_GAME"
  | "ADD_BACKLOG"
  | "DELETE_BACKLOG"
  | "ADD_SERIE"
  | "MANAGE_SERIE"
  | "MANAGE_DLCS"
  | "CLEAN_BACKLOG"
  | "ADD_TEST"
  | "UPDATE_TEST"
  | "DELETE_TEST"
  | "UPDATE_TIER_LIST";

export type IdentifierKind = 'Playlist' | 'Video';

export type Platform = 'PC' | 'GBA' | 'PSP' | 'PS1' | 'PS2' | 'PS3';

export type GameGenre =
  | 'Action'
  | 'Adventure'
  | 'Arcade'
  | 'Board Games'
  | 'Card'
  | 'Casual'
  | 'Educational'
  | 'Family'
  | 'Fighting'
  | 'Indie'
  | 'MMORPG'
  | 'Platformer'
  | 'Puzzle'
  | 'RPG'
  | 'Racing'
  | 'Shooter'
  | 'Simulation'
  | 'Sports'
  | 'Strategy'
  | 'Misc';

export interface GamePayload {
  title: string;
  releaseDate: string;
  identifierKind: IdentifierKind;
  identifierValue: string;
  platform: Platform;
  genres?: GameGenre[];
  duration?: string;
  availableAt?: string;
  endAt?: string;
}

export interface BacklogPayload {
  title: string;
  platform?: Platform;
  notes?: string;
  hltb_main?: string;
  hltb_extra?: string;
  hltb_completionist?: string;
}

export interface SeriePayload {
  title: string;
  games_textarea?: string;
}

export interface DlcPayload {
  gameID: string;
  dlcs_textarea: string;
}

export interface TestPayload {
  title: string;
  releaseDate?: string;
  identifierKind: IdentifierKind;
  identifierValue: string;
  platform: Platform;
  duration?: string;
}

export interface TierListPayload {
  tierList: "GAMES" | "BACKLOG" | "TESTS";
  category: "tier_average" | "tier_bad" | "tier_excellent" | "tier_good" | "tier_masterpiece" | "tier_not_evaluated" | "tier_poor";
  games_textarea: string;
}