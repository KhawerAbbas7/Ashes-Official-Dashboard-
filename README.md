# Ashes

Official website for **Ashes**, a real-time Test cricket simulator for Discord.

The site provides live match coverage, complete scorecards, player profiles, global leaderboards, and official player rankings.

## Stack

- **React 19** with **TypeScript**
- **Vite 6** for development and builds
- **Tailwind CSS 4** for styling
- **React Router 7** for routing
- **react-helmet-async** for page metadata
- **Vercel** for deployment, with Python serverless functions under `api/`

## Getting started

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:3000`. Requests to `/api` are proxied to the backend configured in `vite.config.ts`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Type-check the project with TypeScript |
| `npm run clean` | Remove build output |

## Project structure

```
src/
  components/   Shared layout and page header components
  pages/        Route-level pages (home, matches, scorecards, players, rankings)
  api.ts        Typed helpers for the backend API
  utils.ts      Score and result formatting helpers
api/            Python serverless functions and image templates
```

## Links

- Website: https://ashesdb.vercel.app
- Add to Discord: https://top.gg/bot/1443165621100740668
- Support server: https://discord.gg/7fXmznW9sB
