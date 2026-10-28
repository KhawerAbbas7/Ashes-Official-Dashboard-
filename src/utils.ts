export const getResultText = (match: any) => {
  const w = match?.winner || "—";
  if (["drawn", "—", "tie", "tied"].includes(w.toLowerCase())) return w;
  const inns = match?.innings || [];
  if (!inns.length) return w;
  const maxWick = Math.max(...inns.map((i: any) => i.wickets || 0));
  if (inns.length > 2) {
    const l = w === match.teamAName ? match.teamBName : match.teamAName;
    const wr = inns.filter((i: any) => i.battingTeam === w).reduce((acc: number, i: any) => acc + (i.runs || 0), 0);
    const lr = inns.filter((i: any) => i.battingTeam === l).reduce((acc: number, i: any) => acc + (i.runs || 0), 0);
    if (inns.length === 3 && inns.filter((i: any) => i.battingTeam === w).length === 1) {
      return `${w} won by an innings and ${wr - lr} run(s)`;
    }
    if (inns[inns.length - 1].battingTeam === w) {
      return `${w} won by ${maxWick - (inns[inns.length - 1].wickets || 0)} wicket(s)`;
    }
    return `${w} won by ${wr - lr} runs`;
  }
  return w;
};

export const getScoreString = (inn: any) => {
  const w = inn.wickets || 0;
  let score = w === 10 ? `${inn.runs || 0}` : `${inn.runs || 0}/${w}`;
  if (inn.isDeclared) score += "d";
  return score;
};

export type MatchFormat = "test" | "t15";

export type StatFormat = "all" | MatchFormat;

/**
 * Resolves the format of a match. The API returns `format` for recent, live,
 * and single-match responses. The ball-count fallback keeps older cached
 * responses working: T15 is a 90-ball match.
 */
export const getMatchFormat = (match: any): MatchFormat => {
  const raw = String(match?.format ?? "").trim().toLowerCase();
  if (raw === "t15" || raw === "t10") return "t15";
  if (raw === "test") return "test";

  const maxBalls = Number(match?.maxBalls ?? match?.matchMaximumBalls ?? 0);
  return maxBalls === 90 ? "t15" : "test";
};

