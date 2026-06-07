import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { fetchLiveMatches, fetchMatches } from "../api";
import { getResultText, getScoreString } from "../utils";

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
        <meta name="description" content="View recent and live Ashes cricket matches." />
      </Helmet>

      <div className="flex w-full mb-6 border-b border-white/5">
        <button
          onClick={() => setActiveTab("recent")}
          className={`flex-1 md:flex-none font-mono text-[10px] uppercase tracking-[0.2em] px-4 md:px-6 py-4 transition-colors text-center ${
            activeTab === "recent"
              ? "text-ashes-red border-b-2 border-ashes-red font-bold"
              : "text-ashes-muted hover:text-white"
          }`}
        >
          Recent Matches
        </button>
        <button
          onClick={() => setActiveTab("live")}
          className={`flex-1 md:flex-none font-mono text-[10px] uppercase tracking-[0.2em] px-4 md:px-6 py-4 transition-colors text-center ${
            activeTab === "live"
              ? "text-ashes-red border-b-2 border-ashes-red font-bold"
              : "text-ashes-muted hover:text-white"
          }`}
        >
          Live
        </button>
      </div>

      {activeTab === "recent" && (
        <div>
          <div className="flex flex-col sm:flex-row mb-4 gap-2">
            <input
              type="text"
              placeholder="Search matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadRecentMatches()}
              className="flex-1 bg-ashes-card border border-ashes-border text-white font-sans text-sm rounded-sm px-4 py-3 sm:py-2.5 outline-none focus:border-ashes-red w-full"
            />
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex-1 sm:flex-none bg-ashes-card border border-ashes-border text-ashes-muted font-mono text-[10px] uppercase tracking-[0.2em] px-5 py-3 sm:py-2.5 rounded-sm hover:border-ashes-red hover:text-white transition-colors whitespace-nowrap"
              >
                {showFilters ? "✕ Hide" : "⚙ Filters"}
              </button>
              <button
                onClick={loadRecentMatches}
                className="flex-1 sm:flex-none bg-ashes-red text-white font-mono text-[10px] uppercase tracking-[0.2em] px-6 py-3 sm:py-2.5 rounded-sm hover:bg-ashes-red-hover transition-colors whitespace-nowrap font-bold"
              >
                Search
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <input type="text" placeholder="Server ID" value={guildId} onChange={(e) => setGuildId(e.target.value)} className="bg-ashes-card border border-ashes-border text-white text-sm rounded-sm px-4 py-2.5 outline-none focus:border-ashes-red" />
              <input type="text" placeholder="Channel ID" value={channelId} onChange={(e) => setChannelId(e.target.value)} className="bg-ashes-card border border-ashes-border text-white text-sm rounded-sm px-4 py-2.5 outline-none focus:border-ashes-red" />
              <input type="text" placeholder="Player ID" value={playerId} onChange={(e) => setPlayerId(e.target.value)} className="bg-ashes-card border border-ashes-border text-white text-sm rounded-sm px-4 py-2.5 outline-none focus:border-ashes-red" />
            </div>
          )}

          {loadingRecent ? (
            <div className="text-ashes-muted font-mono text-[10px] uppercase tracking-[0.2em] text-center mt-12">Loading...</div>
          ) : recentMatches.length === 0 ? (
             <div className="text-ashes-muted font-mono text-[10px] uppercase tracking-[0.2em] text-center mt-12">No Results Found</div>
          ) : (
            <div className="flex flex-col gap-4">
              {recentMatches.map((match) => {
                const teamA = match.teamAName || "Team A";
                const teamB = match.teamBName || "Team B";
                const ts = match.timestamp;
                const taScores: string[] = [];
                const tbScores: string[] = [];
                
                (match.innings || []).forEach((inn: any) => {
                  const scoreStr = getScoreString(inn);
                  if (inn.battingTeam === teamA) taScores.push(scoreStr);
                  else if (inn.battingTeam === teamB) tbScores.push(scoreStr);
                });

                return (
                  <div key={match.id} className="bg-ashes-card border border-ashes-border border-l-[3px] border-l-ashes-red hover:border-ashes-red/30 transition-colors rounded-sm overflow-hidden flex flex-col md:flex-row shadow-lg">
                    <div className="p-4 md:p-6 flex flex-col items-start w-full md:w-3/4">
                      <div className="font-mono text-[10px] text-ashes-very-muted uppercase tracking-[0.2em] mb-4 flex items-center flex-wrap gap-2">
                        {ts ? <span className="block">{new Date(ts * 1000).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} <span className="hidden sm:inline">·</span></span> : ""} <span>{match.guildName || "—"}</span> <span className="hidden sm:inline">·</span> <span>{match.channelName || "—"}</span>
                      </div>
                      <div className="font-bebas text-2xl sm:text-3xl text-white tracking-wide mb-4 flex flex-wrap items-center leading-none">
                        {teamA} {taScores.length > 0 && <span className="font-mono text-ashes-red text-base sm:text-lg mx-2 tracking-normal">{taScores.join(" & ")}</span>}
                        <span className="text-ashes-very-muted text-base sm:text-lg mx-3 font-sans tracking-widest italic">VS</span>
                        {teamB} {tbScores.length > 0 && <span className="font-mono text-ashes-red text-base sm:text-lg mx-2 tracking-normal">{tbScores.join(" & ")}</span>}
                      </div>
                      <div className="inline-flex items-center bg-ashes-card-light border border-ashes-border-light text-zinc-300 font-mono text-[10px] px-3 py-1.5 rounded-sm uppercase tracking-[0.1em]">
                        <span className="text-ashes-red mr-2 font-bold">RES</span> {getResultText(match)}
                      </div>
                    </div>
                    <Link to={`/match/${match.id}`} className="block w-full md:w-1/4 bg-ashes-card-light/50 border-t md:border-t-0 md:border-l border-ashes-border flex items-center justify-center text-ashes-muted font-mono text-[10px] tracking-[0.2em] font-bold uppercase py-4 md:py-0 hover:bg-ashes-red hover:text-white transition-all">
                      Scorecard →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "live" && (
        <div>
          <div className="flex justify-start mb-6">
            <button onClick={loadLiveMatches} className="font-mono text-[10px] text-zinc-400 border border-ashes-border bg-ashes-card px-4 py-2 hover:text-white hover:border-ashes-red/50 transition-colors uppercase tracking-[0.2em] rounded-sm">
              ⟳ Refresh
            </button>
          </div>
          {loadingLive ? (
            <div className="text-ashes-muted font-mono text-[10px] uppercase tracking-[0.2em] text-center mt-12">Loading...</div>
          ) : liveMatches.length === 0 ? (
            <div className="text-center mt-12">
              <div className="font-mono text-xs text-ashes-muted uppercase tracking-[0.3em]">No Live Matches</div>
              <div className="font-mono text-[10px] text-ashes-very-muted uppercase tracking-[0.2em] mt-3">Check back soon</div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {liveMatches.map((match) => {
                const teamA = match.teamAName || "Team A";
                const teamB = match.teamBName || "Team B";
                const isLive = match.state === "live";
                
                const taScores: string[] = [];
                const tbScores: string[] = [];
                (match.innings || []).forEach((inn: any) => {
                  const scoreStr = getScoreString(inn);
                  if (inn.battingTeam === teamA) taScores.push(scoreStr);
                  else if (inn.battingTeam === teamB) tbScores.push(scoreStr);
                });

                return (
                  <div key={match.id} className={`bg-ashes-card border border-ashes-border border-l-[3px] rounded-sm overflow-hidden flex flex-col md:flex-row shadow-lg ${isLive ? 'border-l-[#10b981]' : 'border-l-[#eab308]'}`}>
                    <div className="p-4 md:p-6 flex flex-col items-start w-full md:w-3/4">
                      <div className="font-mono text-[10px] text-ashes-very-muted uppercase tracking-[0.2em] mb-4 flex flex-wrap items-center gap-3">
                        {isLive ? (
                          <span className="inline-flex items-center gap-1.5 bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 px-2 py-0.5 rounded-sm">
                            <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-pulse"></span>
                            Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-[#eab308]/10 text-[#eab308] border border-[#eab308]/20 px-2 py-0.5 rounded-sm">
                            ⏳ Lobby
                          </span>
                        )}
                        {match.guildName || "—"} · {match.channelName || "—"}
                      </div>
                      <div className="font-bebas text-2xl sm:text-3xl text-white tracking-wide mb-2 flex flex-wrap items-center">
                        {teamA} {taScores.length > 0 && <span className="font-mono text-ashes-red text-base sm:text-lg mx-2 tracking-normal">{taScores.join(" & ")}</span>}
                        <span className="text-ashes-very-muted text-base sm:text-lg mx-3 font-sans tracking-widest italic">VS</span>
                        {teamB} {tbScores.length > 0 && <span className="font-mono text-ashes-red text-base sm:text-lg mx-2 tracking-normal">{tbScores.join(" & ")}</span>}
                      </div>
                      {!isLive && (
                        <div className="w-full mt-4 space-y-2">
                           <div className="flex flex-col sm:flex-row sm:gap-3 sm:items-baseline">
                             <span className="font-mono text-[10px] text-ashes-muted uppercase tracking-[0.2em] font-bold min-w-[60px] mb-1 sm:mb-0">{teamA}</span>
                             <span className="font-mono text-[10px] text-ashes-very-muted truncate tracking-[0.1em]">{(match.teamAPlayers || []).map((p: any) => p.name || p).join(" · ") || "—"}</span>
                           </div>
                           <div className="flex flex-col sm:flex-row sm:gap-3 sm:items-baseline">
                             <span className="font-mono text-[10px] text-ashes-muted uppercase tracking-[0.2em] font-bold min-w-[60px] mb-1 sm:mb-0">{teamB}</span>
                             <span className="font-mono text-[10px] text-ashes-very-muted truncate tracking-[0.1em]">{(match.teamBPlayers || []).map((p: any) => p.name || p).join(" · ") || "—"}</span>
                           </div>
                        </div>
                      )}
                    </div>
                    <Link to={`/live/${match.id}`} className="block w-full md:w-1/4 bg-ashes-card-light/50 border-t md:border-t-0 md:border-l border-ashes-border flex items-center justify-center text-ashes-muted font-mono text-[10px] tracking-[0.2em] font-bold uppercase py-4 md:py-0 hover:bg-ashes-red hover:text-white transition-all">
                      {isLive ? "Live Match →" : "Join Lobby →"}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}
