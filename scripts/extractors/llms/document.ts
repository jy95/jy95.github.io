import {renderCatalog} from "./catalog";
import {renderFeeds} from "./feeds";
import {renderGuidance} from "./guidance";
import {renderPublishedGames} from "./published-games";
import {renderSitePages} from "./site-pages";
import type {LlmContextData} from "./types";

const INTRODUCTION = `# GamesPassionFR

GamesPassionFR is a bilingual French and English catalog for the GamesPassionFR YouTube gaming channel. It helps visitors discover published walkthroughs and tests, see planned games and backlog candidates, and browse the channel's rankings.`;

export const buildLlmContext = (data: LlmContextData): string => [
    INTRODUCTION,
    renderSitePages(data.staticPaths),
    renderFeeds(),
    renderGuidance(),
    renderCatalog(data),
    renderPublishedGames(data.games),
].join("\n\n");
