# 🎯 ShowMatch

> **Tinder swipes meet Kahoot energy** — the group movie & TV-show picker that ends the "what should we watch?" debate.

One person creates a room, friends join with a 5-letter code, everyone swipes through the same title pool, and whatever the group agrees on wins. No more arguing.

---

## Screenshots

| Home | Create | Join |
|------|--------|------|
| ![Home](apps/web/public/screenshots/home.png) | ![Create](apps/web/public/screenshots/create.png) | ![Join](apps/web/public/screenshots/join.png) |

| Lobby (guest) | Room Settings (host) | Swipe |
|---------------|----------------------|-------|
| ![Lobby](apps/web/public/screenshots/player_lobby.png) | ![Room Settings](apps/web/public/screenshots/room_settings.png) | ![Swipe](apps/web/public/screenshots/swipe.png) |

| Winner | Results |
|--------|---------|
| ![Winner](apps/web/public/screenshots/winner.png) | ![Results](apps/web/public/screenshots/results.png) |

---

## Features

- 🃏 **Tinder-style swiping** — Like, Pass, or ⭐ Super-Like (once per game, guaranteed finalist)
- 🚀 **Multiplayer rooms** — join with a 5-letter code, no account needed
- 🎬 **TMDB + OMDB data** — real posters, ratings, trailers, cast, streaming providers
- 🎛️ **Filters** — movies / TV / both, streaming service, genres, era, min rating, pool size
- 📍 **Region-aware** — providers matched to your country automatically
- 🏆 **Smart winner** — single match wins instantly; multiple matches → ranking round
- 🃏 **Wildcard mode** — host picks a surprise title from top-liked if nobody agrees
- 🎉 **Celebrations** — confetti, sounds, swipe reveal, full game stats
- 🔁 **Play again** — host can restart with the same room and players
- 📱 **Mobile-first** — designed for phones; tap to flip a card for full details
- 🔄 **Session persistence** — refresh the page mid-game and rejoin automatically
- 📖 **Built-in tutorial** — interactive walkthrough on first game (replayable anytime)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS + Framer Motion |
| Realtime | Socket.io (Express server) |
| State | Zustand |
| Content | TMDB API (posters, metadata, streaming providers) + OMDB (RT scores) |
| Monorepo | npm workspaces |

No database — all state is in-memory on the socket server. Perfect for a local-network Pi deployment.

---

## Prerequisites

- **Node.js 18+** (v22 recommended)
- **TMDB account** — [themoviedb.org](https://www.themoviedb.org/) → Settings → API → *Read Access Token* (the long JWT, **not** the v3 API key)
- **OMDB API key** — [omdbapi.com](https://www.omdbapi.com/apikey.aspx) (free tier is fine)

---

## Setup

### 1. Clone

```bash
git clone https://github.com/IdoSagiv/showmatch.git
cd showmatch
npm install
```

### 2. Environment variables

Create two `.env` files from the template below.

**`apps/web/.env.local`**
```env
# TMDB Read Access Token (long JWT — NOT the v3 API key)
TMDB_READ_ACCESS_TOKEN=eyJhbGciOiJSUzI1NiJ9...

# OMDB API key
OMDB_API_KEY=abc12345

# Optional: override the socket server URL.
# If omitted, the app connects to port 3001 on whatever hostname the browser used —
# so LAN / Tailscale / localhost all just work automatically.
# NEXT_PUBLIC_SOCKET_URL=http://192.168.1.100:3001
```

**`apps/socket-server/.env`**
```env
TMDB_READ_ACCESS_TOKEN=eyJhbGciOiJSUzI1NiJ9...
OMDB_API_KEY=abc12345
```

---

## Running

### Development

```bash
npm run dev
```

Starts both servers with hot-reload:
- **Next.js** → `http://localhost:3000`
- **Socket server** → `http://localhost:3001`

> Pages compile on first visit in dev mode — expect a 1–2 s pause the first time you navigate to each screen.

### Production (Raspberry Pi / always-on LAN server)

Build once, then start. Pages are pre-compiled — navigation is instant.

```bash
# First run (or after pulling code changes):
bash scripts/prod.sh
```

This kills any running servers, builds Next.js, and starts both servers in the background. Logs go to `/tmp/showmatch-prod.log`.

**Quick restart** (no rebuild needed — e.g. after a reboot):
```bash
cd showmatch
setsid bash -c 'npm run start >> /tmp/showmatch-prod.log 2>&1' &
```

Access from any device on the network at `http://<pi-ip>:3000`.

---

## How to Play

1. **Host** opens the app and taps **Create Game**
2. **Friends** join by entering the 5-letter room code on the home screen
3. Host sets filters (streaming service, genre, era, rating…) and taps **Start**
4. A quick tutorial walks everyone through the swipe controls on first play
5. Everyone swipes the same pool simultaneously:
   - **Swipe right / ❤️** — Like
   - **Swipe left / ✖️** — Pass
   - **Swipe up / ⭐** — Super-Like (once per game; guaranteed finalist)
   - **Tap the card** — flip to see full details, cast, and streaming info
6. **One title gets all likes** → instant winner 🎉
7. **Multiple matches** → quick ranking round; highest combined score wins
8. **No matches** → host picks a wildcard from the most-liked titles
9. Results screen shows the winner, where to watch, trailer, and full swipe breakdown

---

## Project Structure

```
showmatch/
├── apps/
│   ├── web/               # Next.js frontend (port 3000)
│   │   ├── src/app/       # Pages (home, lobby, game, results, join)
│   │   ├── src/components/# UI components
│   │   ├── src/hooks/     # useSocket, useBeforeUnload
│   │   ├── src/stores/    # Zustand game store
│   │   └── public/sounds/ # Synthesised sound effects
│   └── socket-server/     # Express + Socket.io server (port 3001)
│       └── src/
│           ├── handlers/  # Room, game, ranking event handlers
│           ├── state/     # RoomManager, GameSession
│           └── lib/       # TMDB + OMDB API clients
└── packages/
    └── shared/            # Shared provider-filter logic (used by both apps)
```

---

## API Keys

| Key | Where to get it | Used for |
|---|---|---|
| `TMDB_READ_ACCESS_TOKEN` | [themoviedb.org](https://www.themoviedb.org/settings/api) — *Read Access Token* | Discover titles, posters, providers, trailers |
| `OMDB_API_KEY` | [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx) | Rotten Tomatoes scores |

> ⚠️ Use the TMDB **Read Access Token** (long JWT), not the short v3 API key. The app sends it as `Authorization: Bearer <token>`.

---

## License

MIT
