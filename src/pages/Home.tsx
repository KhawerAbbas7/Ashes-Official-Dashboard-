import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { fetchLiveMatches, fetchMatches } from "../api";
import { getResultText, getScoreString } from "../utils";
import { FormatBadge } from "../components/MatchFormat";

const INVITE_URL = "https://top.gg/bot/1443165621100740668";
const SUPPORT_URL = "https://discord.gg/7fXmznW9sB";

const TEAM_MEMBERS = [
  {
    userId: "759713678013890560",
    name: "Lead Developer",
    username: "@92.97",
    role: "Creator & Lead Developer",
    avatarUrl: "https://cdn.discordapp.com/avatars/759713678013890560/2a996d48677d0c921786f3250859697c.png?size=1024"
  },
  {
    userId: "882228764237508628",
    name: "Zuhair Asif",
    username: "@zuhair_asif",
    role: "Graphic Designer & Moderator",
    avatarUrl: "https://cdn.discordapp.com/avatars/882228764237508628/47ff74cdc7fd0e5c0075672057fae9ae.webp?size=4096"
  },
  {
    userId: "1244979225924993094",
    name: "Dani",
    username: "@no._.one15",
    role: "Moderator & STUMPEX Developer",
    avatarUrl: "https://cdn.discordapp.com/avatars/1244979225924993094/2fcc2cddd62c0cb3f4f7031e5c950de3.webp?size=1024"
  },
  {
    userId: "707195158864855112",
    name: "SLAYER",
    username: "@slay3r699",
    role: "Moderator",
    avatarUrl: "https://cdn.discordapp.com/avatars/707195158864855112/b976343b71ede81998b9dada19403ded.webp?size=4096"
  },
  {
    userId: "700032580744904754",
    name: "Hamza",
    username: "@hamzaaalalala",
    role: "Moderator",
    avatarUrl: "https://cdn.discordapp.com/avatars/700032580744904754/f041b68c32fe2d06069cebe28b2e6e0d.webp?size=4096"
  },
  {
    userId: "915415308565622874",
    name: "Aatiq",
    username: "@.aatiq_",
    role: "Moderator",
    avatarUrl: "https://cdn.discordapp.com/avatars/915415308565622874/d86dafcf4c208eeedef02ab67ae70c26.webp?size=4096"
  },
  {
    userId: "1269703650494644387",
    name: "Bondu Khan",
    username: "@kondubhan",
    role: "Moderator",
    avatarUrl: ""
  }
];

const STEPS = [
  {
    command: "create",
    title: "Create a lobby",
    description: "Start a new match and share the lobby with your server.",
  },
  {
    command: "join",
    title: "Assemble the teams",
    description: "Four players are required. Check who has joined with the pl command.",
  },
  {
    command: "toss",
    title: "Call the toss",
    description: "Decide who bats first and set the tone for the match.",
  },
  {
    command: "start",
    title: "Take the field",
    description: "Begin the simulation and play out every innings ball by ball.",
  },
];

const ADVANCED_RULES = [
  "In Test matches, each game has four innings — three if a team wins by an innings.",
  "Bowlers cannot choose 0.",
  "The number 5 does not exist.",
  "In Test matches, a batter may score a boundary (4 or 6) only once per over. This applies per batter, so the striker and non-striker can each hit one in the same over.",
  "A batter cannot choose 0 more than three times in a row, even across overs.",
];

export const hydrateTeamMembers = async () => {
  const ids = TEAM_MEMBERS.map((member) => member.userId).filter(Boolean).join(",");
  const url = new URL("/api/users", window.location.origin);
  url.searchParams.append("userIds", ids);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch team members");

  const data = await res.json();
  return TEAM_MEMBERS.map((member) => {
    const apiUser = data[member.userId];
    if (!apiUser) return member;
    return {
      ...member,
      name: apiUser.displayName || member.name,
      avatarUrl: apiUser.avatar || member.avatarUrl,
    };
  });
};

function WireRow({ match }: { match: any; key?: string | number }) {
  const teamA = match.teamAName || "Team A";
  const teamB = match.teamBName || "Team B";
  const taScores: string[] = [];
  const tbScores: string[] = [];

  (match.innings || []).forEach((inn: any) => {
    const score = getScoreString(inn);
    if (inn.battingTeam === teamA) taScores.push(score);
    else if (inn.battingTeam === teamB) tbScores.push(score);
  });

  const date = match.timestamp
    ? new Date(match.timestamp * 1000).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
    : null;

  return (
    <Link
      to={`/match/${match.id}`}
      className="group grid gap-2 border-b border-rule-soft py-4 transition-colors hover:bg-ink-raised sm:grid-cols-[110px_minmax(0,1fr)_auto] sm:items-baseline sm:gap-5"
    >
      <div className="flex items-center gap-2 sm:block">
        <FormatBadge match={match} />
        {date && <span className="label sm:mt-1.5 sm:block">{date}</span>}
      </div>
      <div className="min-w-0">
        <p className="display text-xl leading-tight sm:text-2xl">
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
}

export function Home() {
  const [members, setMembers] = useState(TEAM_MEMBERS);
  const [wire, setWire] = useState<any[]>([]);
  const [live, setLive] = useState<any[]>([]);
  const [wireState, setWireState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;

    hydrateTeamMembers()
      .then((data) => {
        if (active) setMembers(data);
      })
      .catch(() => {
        // Keep the static team data if the API is unavailable.
      });

    Promise.allSettled([fetchMatches(), fetchLiveMatches()]).then(([recent, liveMatches]) => {
      if (!active) return;
      if (recent.status === "fulfilled") {
        setWire(recent.value.slice(0, 5));
        setWireState("ready");
      } else {
        setWireState("error");
      }
      if (liveMatches.status === "fulfilled") setLive(liveMatches.value.slice(0, 3));
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Ashes · Test &amp; T15 Cricket for Discord</title>
        <meta
          name="description"
          content="Ashes is a real-time Test and T15 cricket simulator for Discord. Host matches, follow live scorecards, and compete on global leaderboards."
        />
        <meta property="og:title" content="Ashes · Test &amp; T15 Cricket for Discord" />
        <meta
          property="og:description"
          content="Host live Test and T15 cricket matches in your Discord server, track every delivery, and compete on global leaderboards."
        />
      </Helmet>

      <div className="flex flex-col">
        <section className="border-b border-rule pb-12 pt-4 md:pb-16 md:pt-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
            <div className="min-w-0">
              <p className="label">A cricket almanac for Discord</p>
              <h1 className="display mt-4 text-[2.5rem] leading-[0.92] sm:text-6xl md:text-7xl">
                The long form,
                <br />
                <em className="italic text-ball">and the short.</em>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-paper-soft">
                Test cricket&rsquo;s patience and T15&rsquo;s hurry, played out ball by ball in your
                server. Every innings kept, every result on the record.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={INVITE_URL} target="_blank" rel="noopener noreferrer" className="btn btn-solid">
                  Add to Discord
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <Link to="/matches" className="btn btn-quiet">
                  Open the scorebook
                </Link>
              </div>
            </div>

            <aside className="min-w-0 border-t border-rule pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <p className="label">How a delivery resolves</p>
              <div className="mt-4 border-t border-rule">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 border-b border-rule-soft py-3">
                  <div>
                    <p className="label">Batter 2 · Bowler 3</p>
                    <p className="mt-1 text-sm leading-snug text-paper-soft">Numbers differ. The batter is safe.</p>
                  </div>
                  <span className="num text-2xl text-paper">2</span>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 border-b border-rule-soft py-3">
                  <div>
                    <p className="label">Batter 3 · Bowler 3</p>
                    <p className="mt-1 text-sm leading-snug text-paper-soft">Numbers match. The batter is out.</p>
                  </div>
                  <span className="num text-2xl text-ball">W</span>
                </div>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-paper-mute">
                Valid numbers are 0, 1, 2, 3, 4 and 6. There is no 5.
              </p>
            </aside>
          </div>
        </section>

        {live.length > 0 && (
          <section aria-labelledby="live-now-heading" className="border-b border-rule py-6">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-live" aria-hidden="true" />
              <h2 id="live-now-heading" className="label text-live">
                Live now
              </h2>
            </div>
            <div className="mt-3 border-y border-rule">
              {live.map((match) => {
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
                    to={`/live/${match.id}`}
                    className="group flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-rule-soft py-3 last:border-b-0 hover:bg-ink-raised"
                  >
                    <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <FormatBadge match={match} />
                      <span className="display text-lg leading-none">{teamA}</span>
                      <span className="num text-sm text-ball">{taScores.join(" & ") || "—"}</span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-paper-mute">v</span>
                      <span className="display text-lg leading-none">{teamB}</span>
                      <span className="num text-sm text-ball">{tbScores.join(" & ") || "—"}</span>
                    </span>
                    <span className="label group-hover:text-paper">
                      {match.state === "live" ? "Follow →" : "Lobby →"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section aria-labelledby="formats-heading" className="border-b border-rule py-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)]">
            <div className="min-w-0">
              <p className="label">01 / Formats</p>
              <h2 id="formats-heading" className="display mt-3 text-3xl sm:text-4xl">
                Two ways to play.
              </h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-2">
              <article>
                <FormatBadge format="test" detail />
                <p className="mt-3 text-sm leading-relaxed text-paper-soft">
                  Four innings. Declarations, the follow-on and draws are all in play. The host sets
                  the overs before the toss.
                </p>
              </article>
              <article>
                <FormatBadge format="t15" detail />
                <p className="mt-3 text-sm leading-relaxed text-paper-soft">
                  Two innings of 15 overs. Boundary limits change by phase: two per batter in the
                  powerplay, one in the middle, two in the death.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section aria-labelledby="wire-heading" className="border-b border-rule py-12 md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="label">02 / The wire</p>
              <h2 id="wire-heading" className="display mt-3 text-3xl sm:text-4xl">
                Latest results.
              </h2>
            </div>
            <Link to="/matches" className="label transition-colors hover:text-paper">
              All matches →
            </Link>
          </div>

          <div className="mt-6 border-t border-rule">
            {wireState === "loading" && <p className="label py-6">Reading the scorebook…</p>}
            {wireState === "error" && (
              <p className="py-6 text-sm text-paper-mute">
                The wire is unavailable right now.{" "}
                <Link to="/matches" className="link">
                  Try the matches page
                </Link>
                .
              </p>
            )}
            {wireState === "ready" && wire.length === 0 && (
              <p className="py-6 text-sm text-paper-mute">No completed matches on the wire yet.</p>
            )}
            {wire.map((match) => (
              <WireRow key={match.id} match={match} />
            ))}
          </div>
        </section>

        <section aria-labelledby="start-heading" className="border-b border-rule py-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)]">
            <div className="min-w-0">
              <p className="label">03 / First over</p>
              <h2 id="start-heading" className="display mt-3 text-3xl sm:text-4xl">
                Four commands to the toss.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-paper-mute">
                Four players are enough. Run these in order and the match begins.
              </p>
            </div>
            <ol className="border-t border-rule">
              {STEPS.map((step, index) => (
                <li
                  key={step.command}
                  className="grid gap-2 border-b border-rule-soft py-4 sm:grid-cols-[40px_minmax(0,1fr)_auto] sm:items-baseline sm:gap-4"
                >
                  <span className="num text-sm text-paper-mute">{String(index + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <h3 className="display text-xl">{step.title}</h3>
                    <p className="mt-1 text-sm leading-snug text-paper-mute">{step.description}</p>
                  </div>
                  <code className="w-fit border border-ball/30 bg-ball/10 px-2 py-1 font-mono text-[11px] text-ball">
                    {step.command}
                  </code>
                </li>
              ))}
            </ol>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-paper-mute">
            Can&rsquo;t find enough players? Join the{" "}
            <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="link">
              official support server
            </a>{" "}
            and ping the <span className="font-mono text-xs text-paper-soft">regular players</span> role.
          </p>
        </section>

        <section aria-labelledby="rules-heading" className="border-b border-rule py-12 md:py-16">
          <div className="min-w-0">
            <p className="label">04 / Rules</p>
            <h2 id="rules-heading" className="display mt-3 text-3xl sm:text-4xl">
              The game in two columns.
            </h2>
          </div>

          <div className="mt-6 grid gap-10 lg:grid-cols-2">
            <article>
              <h3 className="display text-2xl">The basics</h3>
              <p className="mt-3 text-sm leading-relaxed text-paper-soft">
                The bot asks both the batter and the bowler for a number. Valid numbers are{" "}
                <span className="font-mono text-paper">0, 1, 2, 3, 4</span> and{" "}
                <span className="font-mono text-paper">6</span>. If both choose the same number, the
                batter is out. Otherwise the batter is safe and scores the number they chose.
              </p>

              <div className="mt-5 border-t border-rule">
                <div className="border-b border-rule-soft py-3">
                  <p className="label">Example · Safe</p>
                  <p className="mt-1 text-sm text-paper-soft">
                    Batter chooses <span className="font-mono text-paper">2</span>, bowler chooses{" "}
                    <span className="font-mono text-paper">3</span> — the batter scores two runs.
                  </p>
                </div>
                <div className="border-b border-rule-soft py-3">
                  <p className="label">Example · Out</p>
                  <p className="mt-1 text-sm text-paper-soft">
                    Batter chooses <span className="font-mono text-paper">3</span>, bowler chooses{" "}
                    <span className="font-mono text-paper">3</span> — the batter is out.
                  </p>
                </div>
              </div>
            </article>

            <article>
              <h3 className="display text-2xl">Advanced rules</h3>
              <p className="mt-3 text-sm leading-relaxed text-paper-soft">
                A small set of rules sits on top of the basics to keep matches competitive.
              </p>
              <ul className="mt-4 border-t border-rule">
                {ADVANCED_RULES.map((rule) => (
                  <li key={rule} className="border-b border-rule-soft py-2.5 text-sm leading-relaxed text-paper-soft">
                    {rule}
                  </li>
                ))}
              </ul>
              <div className="mt-5 border-l-2 border-t15 pl-4">
                <p className="label text-t15">T15 format</p>
                <p className="mt-2 text-sm leading-relaxed text-paper-soft">
                  Two innings of 15 overs. Boundary limits change by phase: two per batter in the
                  powerplay, one in the middle, and two in the death overs.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section aria-labelledby="team-heading" className="border-b border-rule py-12 md:py-16">
          <div className="min-w-0">
            <p className="label">05 / The team</p>
            <h2 id="team-heading" className="display mt-3 text-3xl sm:text-4xl">
              Behind the scorebook.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-paper-mute">
              Development, design and moderation — the people keeping the game running.
            </p>
          </div>

          <ul className="mt-6 grid gap-x-8 border-t border-rule sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <li key={member.userId} className="flex items-center gap-3 border-b border-rule-soft py-3">
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt=""
                    width={40}
                    height={40}
                    loading="lazy"
                    className="h-10 w-10 shrink-0 border border-rule object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center border border-rule bg-ink-raised font-display text-lg text-paper"
                  >
                    {member.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold leading-tight text-paper">{member.name}</p>
                  <p className="mt-0.5 truncate font-mono text-[10px] leading-tight text-paper-mute">{member.username}</p>
                  <p className="label mt-1 truncate text-[9px] tracking-[0.14em]">{member.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="py-12 md:py-16">
          <div className="grid gap-6 border-y border-rule py-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="min-w-0">
              <h2 className="display text-3xl sm:text-4xl">Ready for the first ball?</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-paper-mute">
                Add Ashes, invite three friends, and start a match in your server.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href={INVITE_URL} target="_blank" rel="noopener noreferrer" className="btn btn-solid">
                Add to Discord
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="btn btn-quiet">
                Support server
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
