const BASE = "/api";

export const fetchMatches = async (query?: string, channelId?: string, guildId?: string, playerId?: string) => {
  const url = new URL(`${BASE}/matches/getrecent`);
  url.searchParams.append("recent", "20");
  if (query) url.searchParams.append("query", query);
  if (channelId) url.searchParams.append("channelId", channelId);
  if (guildId) url.searchParams.append("guildId", guildId);
  if (playerId) url.searchParams.append("playerId", playerId);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch matches");
  const data = await res.json();
  return data.Matches || [];
};

export const fetchScorecard = async (matchId: string) => {
  const res = await fetch(`${BASE}/matches/${matchId}/scorecard`);
  if (!res.ok) throw new Error("Failed to fetch scorecard");
  return res.json();
};

export const fetchMatch = async (matchId: string) => {
  const res = await fetch(`${BASE}/matches/${matchId}`);
  if (!res.ok) throw new Error("Failed to fetch match");
  return res.json();
};

export const fetchLiveMatches = async () => {
  const res = await fetch(`${BASE}/matches/live`);
  if (!res.ok) throw new Error("Failed to fetch live matches");
  const data = await res.json();
  return data.matches || [];
};

export const fetchLiveMatch = async (matchId: string) => {
  const res = await fetch(`${BASE}/matches/${matchId}/live`);
  if (!res.ok) throw new Error("Failed to fetch live match");
  return res.json();
};

export const fetchLeaderboard = async (category: string) => {
  const res = await fetch(`${BASE}/leaderboard?category=${category}&limit=15`);
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
};
