# NexisGame

**NexisGame** is a fantasy sandbox MMORPG set in the world of Nexis. Players arrive as newcomers to a magical world full of guilds, adventurers, monsters and kingdoms. This project contains the backend server code for the game.

## Features

- **Education System:** Multi‑day courses that unlock new abilities and specialisations.
- **Life Paths:** Multiple roles such as rogue, merchant, magus, healer, warrior and diplomat, each with its own skills and progression tree.
- **Jobs:** Neutral careers that provide passive bonuses or active abilities when fully ranked.
- **World & Economy:** Players explore regions, build bases, trade on markets and interact with guilds.
- **Modular Design:** The server uses a modular structure to support future expansion.

## Getting Started

Install dependencies:

```sh
npm install
```

Run the development server:

```sh
npm run dev
```

This will start the server on `localhost:3000`. The server currently exposes a health endpoint and placeholder modules for future gameplay systems.

## Project Structure

```
NexisGame/
  package.json         Package metadata and scripts.
  server.js            Entry point for the Express server.
  src/
    education.js       Placeholder for the education system.
    jobs.js            Placeholder for job definitions.
    world.js           Placeholder for world and region logic.
```

## License

This project is provided under the MIT License.