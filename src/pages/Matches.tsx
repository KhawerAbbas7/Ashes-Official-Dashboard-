import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { RefreshCw, Search, SlidersHorizontal, X } from "lucide-react";
import { fetchLiveMatches, fetchMatches } from "../api";
import { getResultText, getScoreString } from "../utils";
import { PageHeader } from "../components/PageHeader";
import { FormatBadge, FormatKey } from "../components/MatchFormat";

function matchDate(timestamp?: number) {
  if (!timestamp) return null;
  return new Date(timestamp * 1000).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Matches() {
  const [activeTab, setActiveTab] = useState<"live" | "recent">("recent");
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [loadingLive, setLoadingLive] = useState(false);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [guildId, setGuildId] = useState("");
  const [channelId, setChannelId] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const loadRecentMatches = () => {
    setLoadingRecent(true);
    fetchMatches(searchQuery, channelId, guildId, playerId)
      .then((res) => {
        setRecentMatches(res);
        setLoadingRecent(false);
      })
      .catch(() => {
        setRecentMatches([]);
        setLoadingRecent(false);
      });
  };

  const loadLiveMatches = () => {
    setLoadingLive(true);
    fetchLiveMatches()
      .then((res) => {
        setLiveMatches(res);
        setLoadingLive(false);
      })
      .catch(() => {
        setLiveMatches([]);
        setLoadingLive(false);
      });
  };

  useEffect(() => {
    if (activeTab === "recent") {
      loadRecentMatches();
    } else {
      loadLiveMatches();
      const interval = setInterval(loadLiveMatches, 15000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  return (
    <>
      <Helmet>
        <title>Matches · Ashes</title>
        <meta name="description" content="View recent and live Ashes Test and T15 cricket matches." />
      </Helmet>

      <PageHeader
        title="Matches"
        description="Completed scorecards, live matches and open lobbies. Every match is marked Test or T15."
      />

      <FormatKey />

      <div className="mt-8 flex items-center justify-between gap-4 border-b border-rule">
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("recent")}
            aria-pressed={activeTab === "recent"}
            className="tab"
          >
            Recent
            {recentMatches.length > 0 && <span className="num ml-2 text-paper-mute">{recentMatches.length}</span>}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("live")}
            aria-pressed={activeTab === "live"}
            className="tab"
          >
            Live
            {liveMatches.length > 0 && <span className="num ml-2 text-paper-mute">{liveMatches.length}</span>}
          </button>
        </div>
        {activeTab === "live" && (
          <button type="button" onClick={loadLiveMatches} className="btn btn-quiet mb-1 py-2">
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Refresh
          </button>
        )}
      </div>

      {activeTab === "recent" && (
        <div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              loadRecentMatches();
            }}
            role="search"
            className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="min-w-0 flex-1">
              <label htmlFor="match-search" className="label">
                Search
              </label>
              <input
                id="match-search"
                type="search"
                placeholder="Team, match ID or winner"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="field mt-1"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                aria-expanded={showFilters}
                className="btn btn-quiet"
              >
                {showFilters ? (
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {showFilters ? "Hide filters" : "Filters"}
              </button>
              <button type="submit" className="btn btn-solid">
                <Search className="h-3.5 w-3.5" aria-hidden="true" />
                Search
              </button>
            </div>
          </form>

          {showFilters && (
            <div className="mt-4 grid gap-4 border-y border-rule py-4 sm:grid-cols-3">
              <div>
                <label htmlFor="filter-guild" className="label">Server ID</label>
                <input
                  id="filter-guild"
                  type="text"
                  value={guildId}
                  onChange={(event) => setGuildId(event.target.value)}
                  className="field mt-1"
                />
              </div>
              <div>
                <label htmlFor="filter-channel" className="label">Channel ID</label>
                <input
                  id="filter-channel"
                  type="text"
                  value={channelId}
                  onChange={(event) => setChannelId(event.target.value)}
                  className="field mt-1"
                />
              </div>
              <div>
                <label htmlFor="filter-player" className="label">Player ID</label>
                <input
                  id="filter-player"
                  type="text"
                  value={playerId}
                  onChange={(event) => setPlayerId(event.target.value)}
                  className="field mt-1"
                />
              </div>
            </div>
          )}

          {loadingRecent ? (
            <p className="label py-12 text-center">Reading the scorebook…</p>
          ) : recentMatches.length === 0 ? (
            <div className="border-b border-rule py-12 text-center">
              <p className="label">No matches found</p>
              <p className="mt-2 text-sm text-paper-mute">Try a different search or clear the filters.</p>
            </div>
          ) : (
            <div className="mt-2">
              {recentMatches.map((match) => {
                const teamA = match.teamAName || "Team A";
                const teamB = match.teamBName || "Team B";
                const taScores: string[] = [];
                const tbScores: string[] = [];

                (match.innings || []).forEach((inn: any) => {
                  const score = getScoreString(inn);
                  if (inn.battingTeam === teamA) taScores.push(score);
                  else if (inn.battingTeam === teamB) tbScores.push(score);
                });

                return (
                  <Link
                    key={match.id}
                    to={`/match/${match.id}`}
                    className="group grid gap-3 border-b border-rule py-5 transition-colors hover:bg-ink-raised sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <FormatBadge match={match} detail />
                        {match.timestamp && <span className="label">{matchDate(match.timestamp)}</span>}
                        <span className="label">
                          {match.guildName || "—"} · {match.channelName || "—"}
                        </span>
                      </div>
                      <p className="display mt-2 text-2xl leading-tight sm:text-3xl">
                        {teamA}{" "}
                        {taScores.length > 0 && <span className="num text-base text-ball">{taScores.join(" & ")}</span>}
                        <span className="mx-2 font-sans text-[10px] uppercase tracking-[0.2em] text-paper-mute">v</span>
                        {teamB}{" "}
                        {tbScores.length > 0 && <span className="num text-base text-ball">{tbScores.join(" & ")}</span>}
                      </p>
                      <p className="mt-1 text-sm leading-snug text-paper-mute">{getResultText(match)}</p>
                    </div>
                    <span className="label transition-colors group-hover:text-paper">Scorecard →</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "live" && (
        <div>
          {loadingLive && liveMatches.length === 0 ? (
            <p className="label py-12 text-center">Reading the live wire…</p>
          ) : liveMatches.length === 0 ? (
            <div className="border-b border-rule py-12 text-center">
              <p className="label">No live matches</p>
              <p className="mt-2 text-sm text-paper-mute">Open lobbies and matches in progress will appear here.</p>
            </div>
          ) : (
            <div className="mt-2">
              {liveMatches.map((match) => {
                const teamA = match.teamAName || "Team A";
                const teamB = match.teamBName || "Team B";
                const isLive = match.state === "live";
                const taScores: string[] = [];
                const tbScores: string[] = [];

                (match.innings || []).forEach((inn: any) => {
                  const score = getScoreString(inn);
                  if (inn.battingTeam === teamA) taScores.push(score);
                  else if (inn.battingTeam === teamB) tbScores.push(score);
                });

                return (
                  <Link
                    key={match.id}
                    to={`/live/${match.id}`}
                    className="group grid gap-3 border-b border-rule py-5 transition-colors hover:bg-ink-raised sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            aria-hidden="true"
                            className={`h-1.5 w-1.5 rounded-full ${isLive ? "animate-pulse bg-live" : "bg-lobby"}`}
                          />
                          <span className={`label ${isLive ? "text-live" : "text-lobby"}`}>
                            {isLive ? "Live" : "Lobby"}
                          </span>
                        </span>
                        <FormatBadge match={match} detail />
                        <span className="label">
                          {match.guildName || "—"} · {match.channelName || "—"}
                        </span>
                      </div>
                      <p className="display mt-2 text-2xl leading-tight sm:text-3xl">
                        {teamA}{" "}
                        {taScores.length > 0 && <span className="num text-base text-ball">{taScores.join(" & ")}</span>}
                        <span className="mx-2 font-sans text-[10px] uppercase tracking-[0.2em] text-paper-mute">v</span>
                        {teamB}{" "}
                        {tbScores.length > 0 && <span className="num text-base text-ball">{tbScores.join(" & ")}</span>}
                      </p>
                      {isLive && match.statusText && (
                        <p className="mt-1 text-sm leading-snug text-paper-mute">{match.statusText}</p>
                      )}
                      {match.phase && (
                        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="label text-t15">
                            Phase {match.phase.number} · {match.phase.name}
                          </span>
                          <span className="label">
                            {match.phase.boundaries}{" "}
                            {match.phase.boundaries === 1 ? "boundary" : "boundaries"} per over
                          </span>
                          <span className="label">{match.phase.oversLeft} overs left in phase</span>
                        </p>
                      )}
                      {!isLive && (
                        <dl className="mt-3 grid gap-1.5">
                          <div className="flex gap-3">
                            <dt className="label w-20 shrink-0 pt-0.5">{teamA}</dt>
                            <dd className="min-w-0 truncate font-mono text-[10px] leading-relaxed text-paper-mute">
                              {(match.teamAPlayers || []).map((player: any) => player.name || player).join(" · ") || "—"}
                            </dd>
                          </div>
                          <div className="flex gap-3">
                            <dt className="label w-20 shrink-0 pt-0.5">{teamB}</dt>
                            <dd className="min-w-0 truncate font-mono text-[10px] leading-relaxed text-paper-mute">
                              {(match.teamBPlayers || []).map((player: any) => player.name || player).join(" · ") || "—"}
                            </dd>
                          </div>
                        </dl>
                      )}
                    </div>
                    <span className="label transition-colors group-hover:text-paper">
                      {isLive ? "Follow live →" : "Join lobby →"}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}
