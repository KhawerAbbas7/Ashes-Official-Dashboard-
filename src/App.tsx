import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Leaderboard } from "./pages/Leaderboard";
import { LiveMatch } from "./pages/LiveMatch";
import { Matches } from "./pages/Matches";
import { MatchScorecard } from "./pages/MatchScorecard";
import { Rankings } from "./pages/Rankings";
import { Players } from "./pages/Players";
import { PlayerProfile } from "./pages/PlayerProfile";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="matches" element={<Matches />} />
          <Route path="match/:id" element={<MatchScorecard />} />
          <Route path="live/:id" element={<LiveMatch />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="rankings" element={<Rankings />} />
          <Route path="players" element={<Players />} />
          <Route path="player/:id" element={<PlayerProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}