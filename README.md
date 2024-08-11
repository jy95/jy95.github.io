#  [GamesPassionFR](https://www.youtube.com/channel/UCG0N7IV-C43AM9psxslejCQ) Gaming Catalog

Online catalog to have a clear view of the [GamesPassionFR](https://www.youtube.com/channel/UCG0N7IV-C43AM9psxslejCQ) channel.  
Currently, we have the following pages :
* [`/games`](https://jy95.github.io/games) - List of games & series published on [GamesPassionFR](https://www.youtube.com/channel/UCG0N7IV-C43AM9psxslejCQ) YT channel
* [`/planning`](https://jy95.github.io/planning) - Upcoming games that will be published on [GamesPassionFR](https://www.youtube.com/channel/UCG0N7IV-C43AM9psxslejCQ) YT channel
* [`/tests`](https://jy95.github.io/tests) - Games review on [GamesPassionFR](https://www.youtube.com/channel/UCG0N7IV-C43AM9psxslejCQ) YT channel
* [`/stats`](https://jy95.github.io/stats) - Statistics on [GamesPassionFR](https://www.youtube.com/channel/UCG0N7IV-C43AM9psxslejCQ) YT channel
* [`/backlog`](https://jy95.github.io/backlog) - Games backlog on [GamesPassionFR](https://www.youtube.com/channel/UCG0N7IV-C43AM9psxslejCQ) YT channel

## Getting Started

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.  
This project uses [`Fuse.js`](https://www.fusejs.io/) to offer fuzzy-search for the games.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Database

There is a database schema for managing video games, their genres, platforms, series, schedules, and associated video content. The schema consists of several interrelated tables: games, backlog, games_genres, games_schedules, genres, platforms, series, series_games, and tests.

### `games` Table

| Field        | Description                                          | Required/Optional | Example              |
|--------------|------------------------------------------------------|-------------------|----------------------|
| `id`         | Unique identifier for each game (Primary Key).       | Required          | `1`                  |
| `videoId`    | Unique identifier for an associated video.           | Optional          | `IOog6QKck6o`        |
| `playlistId` | Unique identifier for an associated playlist.        | Optional          | `PLRfhDHeBTBJ7zlVdm21oc8ndiRGxQJy6F`             |
| `title`      | The title of the game.                               | Required          | `Harry Potter 3`     |
| `releaseDate`| The release date of the game.                        | Required          | `2023-01-01`         |
| `duration`   | The duration of the game or video content.           | Optional          | `02:30:00`           |
| `platform`   | Foreign key referencing the `platforms` table.       | Required          | `2`                  |

### `backlog` Table

| Field     | Description                                               | Required/Optional | Example              |
|-----------|-----------------------------------------------------------|-------------------|----------------------|
| `id`      | Unique identifier for each backlog entry (Primary Key).    | Required          | `1`                  |
| `title`   | The title of the game.                                     | Required          | `Batman Begins`      |
| `platform`| Foreign key referencing the `platforms` table.             | Optional          | `2`                  |
| `notes`   | Additional notes or comments about the game.               | Optional          | `Play this first.`   |

### `games_genres` Table

| Field   | Description                                           | Required/Optional | Example              |
|---------|-------------------------------------------------------|-------------------|----------------------|
| `game`  | Foreign key referencing the `games` table.            | Required          | `1`                  |
| `genre` | Foreign key referencing the `genres` table.           | Required          | `3`                  |

### `games_schedules` Table

| Field        | Description                                          | Required/Optional | Example              |
|--------------|------------------------------------------------------|-------------------|----------------------|
| `id`         | Foreign key referencing the `games` table.           | Required          | `1`                  |
| `availableAt`| Date (and time) when the game becomes available.     | Optional          | `2023-08-01 10:00:00`|
| `endAt`      | Date (and time) when the game is no longer available.| Optional          | `2023-12-31 23:59:59`|

### `genres` Table

| Field    | Description                                     | Required/Optional | Example              |
|----------|-------------------------------------------------|-------------------|----------------------|
| `id`     | Unique identifier for each genre (Primary Key). | Required          | `3`                  |
| `name`   | The name of the genre.                          | Required          | `Action`             |

### `platforms` Table

| Field    | Description                                        | Required/Optional | Example              |
|----------|----------------------------------------------------|-------------------|----------------------|
| `id`     | Unique identifier for each platform (Primary Key). | Required          | `2`                  |
| `name`   | The name of the platform.                          | Required          | `PlayStation`        |

## `series` Table

| Field    | Description                                      | Required/Optional | Example              |
|----------|--------------------------------------------------|-------------------|----------------------|
| `id`     | Unique identifier for each series (Primary Key). | Required          | `1`                  |
| `name`   | The name of the series.                          | Required          | `Ratchet & Clank`    |

## `series_games` Table

| Field   | Description                                           | Required/Optional | Example              |
|---------|-------------------------------------------------------|-------------------|----------------------|
| `serie` | Foreign key referencing the `series` table.           | Required          | `1`                  |
| `game`  | Foreign key referencing the `games` table.            | Required          | `2`                  |
| `order` | The order of the game within the series.              | Optional          | `1`                  |

## `tests` Table

| Field        | Description                                           | Required/Optional | Example              |
|--------------|-------------------------------------------------------|-------------------|----------------------|
| `id`         | Unique identifier for each test (Primary Key).        | Required          | `1`                  |
| `videoId`    | Unique identifier for an associated video.            | Optional          | `IOog6QKck6o`        |
| `playlistId` | Unique identifier for an associated playlist.         | Optional          | `PLRfhDHeBTBJ7zlVdm21oc8ndiRGxQJy6F`             |
| `title`      | The title of the game.                                | Required          | `Harry Potter 3`     |
| `releaseDate`| The release date of the test.                         | Required          | `2023-01-01`         |
| `platform`   | Foreign key referencing the `platforms` table.        | Required          | `2`                  |
| `duration`   | The duration of the test or video content.            | Optional          | `00:30:00`           |