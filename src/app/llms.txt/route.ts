const llmsContext = `# jy95/jy95.github.io - LLM Context

## Repository Overview

**Project**: GamesPassionFR Gaming Catalog  
**Description**: An online catalog for the GamesPassionFR YouTube gaming channel  
**Language**: TypeScript  
**License**: GNU Affero General Public License v3.0  
**Homepage**: https://jy95.github.io/  
**Main Topics**: gaming, catalog, games, library, YouTube walkthrough, Next.js, React

## Project Summary

This is a Next.js-based web application that serves as a gaming library and catalog for the GamesPassionFR YouTube channel. It manages and displays information about games, series, tests (reviews), backlogs, and tier lists. The project includes:

- A Next.js frontend built with React
- TypeScript with strict mode enabled
- SQLite database for game and playlist data
- Multiple API endpoints serving JSON data
- Scripts for image processing, data extraction, and database management
- Internationalization support (English and French)
- Material-UI components for the UI
- Redux for state management
- Testing with Vitest
- Analytics integration (Vercel)

## Core Features

### Pages
- \`/games\` - List of games, series & DLCs published on the channel
- \`/planning\` - Upcoming games to be published
- \`/tests\` - Game reviews and tests published on the channel
- \`/stats\` - Channel statistics and viewing metrics
- \`/backlog\` - Games backlog (games to be played)
- \`/links\` - Related links to the YouTube channel
- \`/tier\` - Tier lists for grouping and ranking games, backlogs, and tests

### Data Management
- SQLite database (\`GamesPassionFR.db\`) storing games, genres, platforms, series, schedules, and video metadata
- JSON API endpoints for frontend consumption
- Database extraction scripts for data synchronization
- RSS and JSON feed generation for content syndication

## Technology Stack

### Core Technologies
- **Framework**: Next.js with React for frontend
- **Language**: TypeScript with strict mode
- **Runtime**: Node.js with ES modules
- **Package Manager**: npm

### Frontend Layer
- **UI Components**: Material-UI (MUI) for professional design system
- **Styling**: Emotion for CSS-in-JS styling
- **State Management**: Redux for complex application state
- **Search**: Fuse.js for client-side fuzzy search functionality
  - Example: User types "rac" and finds "Ratchet & Clank" series
- **Internationalization**: Multi-language support (English, French)
- **Analytics**: Vercel Analytics and Speed Insights integration

### Data & Database Layer
- **Database**: SQLite with better-sqlite3 driver
- **YouTube Integration**: Google APIs for playlist and video metadata
- **Image Processing**: Sharp for responsive image generation and optimization
- **Game Duration Data**: Integration with HowLongToBeat for completion times
- **Image Search**: Automated cover art discovery

### Development & Testing
- **Testing Framework**: Vitest for fast unit and component tests
- **Component Testing**: React Testing Library for UI testing
- **Test Coverage**: Automated coverage reporting
- **Linting**: ESLint with Next.js configuration
- **Task Execution**: tsx for running TypeScript scripts

## Directory Structure

### Root Configuration Files
\`\`\`
tsconfig.json          - TypeScript configuration with path aliases (@/*)
next.config.ts         - Next.js build and runtime configuration
eslint.config.mjs      - Linting rules and standards
vitest.config.mts      - Test runner configuration
package.json           - Dependencies and npm scripts
vercel.json            - Vercel deployment settings
\`\`\`

### Source Code (\`/src\`)
Main application directory containing:
- **app/** - Next.js App Router pages and layouts
  - \`[locale]/\` - Localized page routes (en, fr)
  - \`api/\` - API routes serving JSON data
- **components/** - Reusable React components
- **domain/** - Business logic and type definitions
- **i18n/** - Internationalization configuration
- **store/** - Redux store configuration
- **styles/** - Global styles and themes

### Scripts (\`/scripts\`)
Automation and data processing utilities:

**Main Generation Scripts:**
- \`generateJsonFiles.ts\` - Orchestrates all data extraction from SQLite to JSON
  - Example: Reads games from database, writes to \`/src/app/api/games/games.json\`
  - Runs extractors for backlog, series, platforms, genres, etc.

**Image Processing:**
- \`generate-responsive-images.ts\` - Creates multiple image sizes for optimization
  - Example: Converts \`cover.jpg\` to \`cover@small.webp\`, \`cover@medium.webp\`, \`cover@big.webp\`
  - Generates 150x150, 200x200, 250x250 pixel variants

**Data Extraction:**
- \`generate-playlists-stats.ts\` - Processes CSV statistics into JSON
  - Example: Reads \`playlists_stats.csv\`, outputs view counts and watch time
- \`generate-playlist-csv.ts\` - Exports playlist data in CSV format
- \`findPublishedGames.ts\` - Syncs published games from YouTube
- \`backlog-cover-downloader.ts\` - Auto-downloads game covers using image search
  - Example: Searches "Batman Begins PSP official box art" and downloads cover

**Task-based Operations:**
- \`tasks/copy-covers.ts\` - Copies covers between source/destination folders
  - Example: Copy covers from game A to game B
- Task handlers for adding/updating/deleting games, series, tests

### Public Assets (\`/public\`)
Static files and generated content:
\`\`\`
/covers/              - Game cover images organized by game ID
/testscovers/         - Review/test cover images
/backlogcovers/       - Backlog game cover images
rss.xml              - RSS feed for content syndication
feed.json            - JSON feed format for content
\`\`\`

### Database
\`\`\`
GamesPassionFR.db         - SQLite database with all catalog data
GamesPassionFR.sqbpro     - SQLiteStudio IDE project file
\`\`\`

### Generated Output
\`\`\`
/gh-pages-out/        - Built static files for GitHub Pages deployment
\`\`\`

### Internationalization
\`\`\`
/messages/            - Translation files for English and French locales
\`\`\`

## Database Schema

### Core Content Tables

**games** - Published video game content
\`\`\`
Fields: id, videoId, playlistId, title, releaseDate, platform, duration, coverFile
Example: {
  id: 42,
  title: "The Legend of Zelda: Ocarina of Time",
  playlistId: "PLRfhDHeBTBJ4KQEvirhf9p1o_xuFysva8",
  platform: 2,
  releaseDate: "2023-06-15",
  duration: "02:30:00"
}
\`\`\`

**backlog** - Games to be played
\`\`\`
Fields: id, title, platform, notes, hltb_main, hltb_extra, hltb_completionist
Example: {
  id: 1,
  title: "Cyberpunk 2077",
  platform: 1,
  hltb_main: "25:00:00",
  hltb_completionist: "100:00:00"
}
\`\`\`

**tests** - Published game reviews/tests
\`\`\`
Fields: id, videoId, playlistId, title, releaseDate, platform, duration
Example: {
  id: 15,
  title: "Elden Ring Review",
  videoId: "dQw4w9WgXcQ",
  platform: 5,
  duration: "00:45:00"
}
\`\`\`

**series** - Game series information
\`\`\`
Fields: id, name
Example: { id: 3, name: "Ratchet & Clank" }
\`\`\`

**platforms** - Gaming platforms
\`\`\`
Fields: id, name
Example: { id: 1, name: "PC" }, { id: 2, name: "PlayStation 5" }
\`\`\`

**genres** - Game categories
\`\`\`
Fields: id, name
Example: { id: 1, name: "Action" }, { id: 2, name: "RPG" }
\`\`\`

### Relationship Tables

**games_genres** - Maps games to multiple genres
\`\`\`
Example: game=42, genre=1 (Zelda is Action genre)
\`\`\`

**series_games** - Defines game order within a series
\`\`\`
Fields: serie, game, order
Example: { serie: 3, game: 42, order: 2 } (Zelda is 2nd in series)
\`\`\`

**games_dlcs** - Links DLC content to base games
\`\`\`
Fields: game, dlc, order
Example: { game: 100, dlc: 101, order: 1 } (DLC is first for game)
\`\`\`

**games_schedules** - Availability windows for games
\`\`\`
Fields: id, availableAt, endAt
Example: { id: 42, availableAt: "2023-06-15 10:00", endAt: "2023-12-31" }
\`\`\`

### Tier List Tables

**tier_categories** - Ranking categories
\`\`\`
Fields: id, slug, display_order
Example: { id: 1, slug: "tier_excellent", display_order: 1 }
\`\`\`

**tier_list_games** - Game rankings
\`\`\`
Fields: game_id, category_id
Example: { game_id: 42, category_id: 1 } (Zelda in excellent tier)
\`\`\`

**tier_list_backlog** - Backlog rankings
\`\`\`
Fields: backlog_id, category_id
Example: { backlog_id: 5, category_id: 3 } (Cyberpunk in good tier)
\`\`\`

**tier_list_tests** - Test/review rankings
\`\`\`
Fields: test_id, category_id
Example: { test_id: 15, category_id: 2 } (Elden Ring review in great tier)
\`\`\`

## API Endpoints

JSON endpoints that power the frontend:

- \`/api/games/games.json\` - All published games
- \`/api/tests/tests.json\` - All game reviews
- \`/api/backlog/backlog.json\` - Games in backlog
- \`/api/series/series.json\` - Game series information
- \`/api/platforms/platforms.json\` - Available platforms
- \`/api/genres/genres.json\` - Game genres
- \`/api/planning/planning.json\` - Upcoming games
- \`/api/planning/past-planning.json\` - Previously published games
- \`/api/dlcs/dlcs.json\` - DLC information
- \`/api/stats/stats.json\` - Channel statistics
- \`/api/random/identifiers.json\` - Random game/video selections
- \`/api/tier-lists/games/games.json\` - Game tier rankings
- \`/api/tier-lists/backlog/backlog.json\` - Backlog tier rankings
- \`/api/tier-lists/tests/tests.json\` - Test tier rankings
- \`/api/tier-lists/categories/categories.json\` - Available tier categories

## npm Scripts

**Development:**
- \`npm run dev\` - Start local development server on http://localhost:3000
- \`npm run dev:test\` - Watch mode for tests (re-run on file changes)

**Production:**
- \`npm run build\` - Build application for production
- \`npm start\` - Start production server

**Code Quality:**
- \`npm run lint\` - Check code with ESLint
- \`npm test\` - Run full test suite once
- \`npm run test:coverage\` - Generate test coverage report

**Data Generation:**
- \`npm run generate-api-json-files\` - Main command to update all API JSON files
  - Extracts data from database and generates all \`/src/app/api/\` JSON files
  - Run this after database updates
- \`npm run generate-responsive-images\` - Generate all responsive image variants
  - Example: \`npm run generate-responsive-images\`
- \`npm run sample-game\` - Generate images for single game
  - Example: \`npm run sample-game PLRfhDHeBTBJ4KQEvirhf9p1o_xuFysva8 covers cover.jpg\`
- \`npm run generate-playlist-data-report\` - Create statistics report
- \`npm run generate-playlist-csv\` - Export playlist data
- \`npm run find-published-games\` - Sync published games from YouTube

## Key Workflows

### Adding a New Game

1. Update SQLite database with game details
2. Run \`npm run generate-api-json-files\` to refresh API
3. Add cover image to \`/public/covers/{playlistId-or-videoId}/cover.jpg\`
4. Run \`npm run generate-responsive-images -- singleGame {playlistId-or-videoId} covers cover.jpg\`
5. Commit changes to git

### Publishing Game Reviews (Tests)

1. Add test entry to database
2. Create test cover image
3. Run generation scripts
4. Test entry appears on \`/tests\` page
5. RSS feed auto-updates for subscribers

### Managing Game Backlogs

1. Add backlog entry to database (optional HLTB duration data)
2. Auto-download cover or manually upload to \`/public/backlogcovers/\`
3. Generate responsive images
4. Entry visible on \`/backlog\` page with completion time estimates

### Creating Tier Lists

1. Define tier categories in database
2. Rank games/backlogs/tests by assigning to categories
3. Run generation script to output tier list JSON
4. \`/tier\` page displays sortable rankings

## Testing Approach

**Unit Tests:**
- Test individual functions and utilities
- Mock database calls and external APIs
- Example: Test that backlog entries get correct image paths

**Component Tests:**
- Test React components with React Testing Library
- Example: Test that game search filters correctly
- Mock API responses

**Integration Tests:**
- Test API routes returning correct data
- Example: GET \`/api/games/games.json\` returns array of games

**Coverage Goals:**
- Aim for high coverage on business logic
- Focus on critical paths (data generation, API routes)
- Run with \`npm run test:coverage\`

## Internationalization (i18n)

- Supports French (fr) and English (en)
- Default locale: French
- Locale prefixes are added only when needed (for example, \`/en/games\`; French routes use \`/games\`)
- Message files in \`/messages/\` directory
- Example: Navigation labels, page titles translated

## Image Processing Pipeline

1. **Source Images**: The default pipeline processes \`/public/covers/{playlistId-or-videoId}/cover.webp\` and \`/public/testscovers/{playlistId-or-videoId}/cover.webp\`. Backlog downloads store source images at \`/public/backlogcovers/{id}/cover.{extension}\`.
2. **Responsive Generation**: Sharp creates three variants. Use \`npm run generate-responsive-images -- singleGame {folder} {gameId} {sourceFilename}\` to generate them for a specific folder, game ID, and source filename.
   - Small (150x150) - Thumbnails in lists
   - Medium (200x200) - Grid views
   - Large (250x250) - Detail pages
3. **Format**: All output as WebP for efficiency
4. **Naming**: \`cover@small.webp\`, \`cover@medium.webp\`, \`cover@big.webp\`
5. **Consumption**: Frontend selects appropriate size based on viewport

## State Management with Redux

Handles global application state:
- Game filters and search state
- User preferences
- Sidebar/navigation state
- Tier list selections

Example action: User clicks genre filter → Redux updates → Component re-renders with filtered results

## Performance Optimizations

- Image optimization via Sharp with WebP format
- Responsive image delivery (mobile gets smaller images)
- Static JSON API files (no server computation needed)
- Client-side search with Fuse.js (no network request)
- Analytics tracking for performance monitoring

## Deployment Strategy

- **Main Platform**: Vercel (automatic deployments on push)
- **Fallback**: GitHub Pages (via \`gh-pages-out\` directory)
- **Branch Protection**: Configured for code review before merge
- **Preview Deployments**: Automatic for pull requests

## Development Conventions

- **TypeScript**: Strict mode enabled; avoid \`any\` where possible
- **Path Aliases**: Use \`@/*\` for imports (maps to \`./src/*\`)
- **Async Scripts**: Use \`async\`/\`await\` pattern
- **Error Handling**: Try-catch blocks with console logging
- **Testing**: Co-locate test files with source (\`file.ts\` + \`file.test.ts\`)

## Notable Design Patterns

**Data Extraction Pattern:**
- Database → TypeScript script → JSON file → API endpoint → Frontend
- Decouples database from frontend, enables static hosting

**Responsive Images Pattern:**
- Store original image once
- Generate multiple sizes programmatically
- Frontend selects based on device capability

**Localization Pattern:**
- URL prefix for locale routing
- Message files organized by language
- Fallback to default locale

**Task-based CLI Pattern:**
- Scripts accept arguments for flexible operations
- Example: \`npm run sample-game {gameId} {folder} {imageFile}\`
- Central task handler in scripts
`;

export function GET() {
    return new Response(llmsContext, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
        },
    });
}

