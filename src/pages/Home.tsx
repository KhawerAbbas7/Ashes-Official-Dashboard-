import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  ExternalLink,
  ListChecks,
  Radio,
  Trophy,
  Users,
} from "lucide-react";

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

const FEATURES = [
  {
    icon: Radio,
    title: "Live commentary",
    description:
      "Follow every delivery as it happens. Matches unfold in real time inside your Discord channels, with instant score updates.",
  },
  {
    icon: BarChart3,
    title: "Complete scorecards",
    description:
      "Every innings is recorded in detail — batting, bowling, partnerships, and player-of-the-match awards — and available to revisit anytime.",
  },
  {
    icon: Trophy,
    title: "Global leaderboards",
    description:
      "Compete across every server for the most runs, wickets, and MVP awards. Climb the rankings and build a lasting record.",
  },
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
  "Each match has four innings — three if a team wins by an innings.",
  "Bowlers cannot choose 0.",
  "The number 5 does not exist.",
  "A batter may score a boundary (4 or 6) only once per over. This applies per batter, so the striker and non-striker can each hit one in the same over.",
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

export function Home() {
  const [members, setMembers] = useState(TEAM_MEMBERS);

  useEffect(() => {
    let active = true;
    hydrateTeamMembers()
      .then((data) => {
        if (active) setMembers(data);
      })
      .catch(() => {
        // Keep the static team data if the API is unavailable.
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Ashes · Test Cricket for Discord</title>
        <meta
          name="description"
          content="Ashes is a real-time Test cricket simulator for Discord. Host matches, follow live scorecards, and compete on global leaderboards."
        />
        <meta property="og:title" content="Ashes · Test Cricket for Discord" />
        <meta
          property="og:description"
          content="Host live Test matches in your Discord server, track every delivery, and compete on global leaderboards."
        />
      </Helmet>

      <div className="flex flex-col">
        {/* Hero */}
        <section className="relative flex flex-col items-center pb-16 pt-6 text-center md:pb-24 md:pt-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[440px] bg-[radial-gradient(55%_100%_at_50%_0%,rgba(99,102,241,0.16),transparent_70%)]"
          />

          <span className="inline-flex items-center gap-2 rounded-full border border-ashes-border bg-white/[0.03] px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ashes-muted">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Live Test cricket on Discord
          </span>

          <h1 className="mt-7 max-w-4xl text-balance font-bebas text-4xl leading-[1.05] tracking-wide text-white sm:text-6xl md:text-7xl">
            Test cricket, <span className="italic text-ashes-red">ball by ball.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-zinc-400 sm:text-lg">
            Ashes brings the tension of Test cricket to your Discord server — live simulations,
            complete scorecards, and a global stage for every player.
          </p>

          <div className="mt-9 flex w-full flex-col gap-3 px-2 sm:w-auto sm:flex-row sm:px-0">
            <a
              href={INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 rounded-sm bg-ashes-red px-7 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_0_24px_rgba(99,102,241,0.25)] transition-colors hover:bg-ashes-red-hover"
            >
              Add to Discord
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-ashes-border bg-white/[0.03] px-7 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:border-ashes-border-light hover:bg-white/[0.06]"
            >
              Join the community
              <ExternalLink className="h-3.5 w-3.5 text-ashes-muted" aria-hidden="true" />
            </a>
          </div>

          <dl className="mt-14 grid w-full max-w-3xl grid-cols-1 divide-y divide-ashes-border overflow-hidden rounded-lg border border-ashes-border bg-ashes-card/70 text-left sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              { icon: Activity, label: "Simulation", value: "Ball by ball" },
              { icon: ListChecks, label: "Format", value: "Full Test match" },
              { icon: Trophy, label: "Competition", value: "Global rankings" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 px-5 py-4">
                <Icon className="h-4 w-4 shrink-0 text-ashes-red" aria-hidden="true" />
                <div>
                  <dt className="font-mono text-[9px] uppercase tracking-[0.22em] text-ashes-very-muted">{label}</dt>
                  <dd className="mt-0.5 font-bebas text-lg tracking-wide text-white">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </section>

        {/* Features */}
        <section aria-labelledby="features-heading" className="border-t border-ashes-border py-14 md:py-20">
          <div className="mb-8 max-w-2xl">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-ashes-red">What you get</p>
            <h2 id="features-heading" className="mt-2 font-bebas text-3xl tracking-wide text-white md:text-4xl">
              Built for the crease
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ashes-muted">
              Everything you need to run a competitive cricket league — without leaving Discord.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="group rounded-lg border border-ashes-border bg-ashes-card p-6 transition-colors hover:border-ashes-red/30 hover:bg-ashes-card-light"
              >
                <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-sm border border-ashes-border bg-white/[0.03] text-ashes-red transition-colors group-hover:border-ashes-red/30">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-bebas text-2xl tracking-wide text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ashes-muted">{description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section aria-labelledby="how-heading" className="border-t border-ashes-border py-14 md:py-20">
          <div className="mb-8 max-w-2xl">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-ashes-red">Getting started</p>
            <h2 id="how-heading" className="mt-2 font-bebas text-3xl tracking-wide text-white md:text-4xl">
              From lobby to first ball
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ashes-muted">
              Four players are all you need. Run these commands in order and the match begins.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <div key={step.command} className="relative rounded-lg border border-ashes-border bg-ashes-card p-5">
                <span className="font-mono text-[10px] font-semibold tracking-[0.2em] text-ashes-very-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-bebas text-xl tracking-wide text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ashes-muted">{step.description}</p>
                <code className="mt-4 inline-block rounded-sm border border-ashes-red/20 bg-ashes-red/10 px-2 py-1 font-mono text-[11px] font-medium text-ashes-red">
                  {step.command}
                </code>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm leading-relaxed text-ashes-muted">
            Can&rsquo;t find enough players? Join the{" "}
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-white underline decoration-ashes-red/50 decoration-2 underline-offset-4 transition-colors hover:text-ashes-red"
            >
              official support server
            </a>{" "}
            and ping the <span className="font-mono text-xs text-zinc-300">regular players</span> role.
          </p>
        </section>

        {/* Rules */}
        <section aria-labelledby="rules-heading" className="border-t border-ashes-border py-14 md:py-20">
          <div className="mb-8 max-w-2xl">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-ashes-red">Rules of the game</p>
            <h2 id="rules-heading" className="mt-2 font-bebas text-3xl tracking-wide text-white md:text-4xl">
              Simple to learn, hard to master
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-lg border border-ashes-border bg-ashes-card p-6 md:p-8">
              <h3 className="font-bebas text-2xl tracking-wide text-white">The basics</h3>
              <p className="mt-3 text-sm leading-relaxed text-ashes-muted">
                The bot asks both the batter and the bowler for a number. Valid numbers are{" "}
                <span className="font-mono text-zinc-300">0, 1, 2, 3, 4</span> and{" "}
                <span className="font-mono text-zinc-300">6</span>. If both choose the same number, the
                batter is out. Otherwise the batter is safe and scores the number they chose.
              </p>

              <div className="mt-6 space-y-3">
                <div className="rounded-sm border border-ashes-border bg-white/[0.02] p-4">
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-ashes-very-muted">Example · Safe</p>
                  <p className="mt-2 text-sm text-zinc-300">
                    Batter chooses <span className="font-mono text-white">2</span>, bowler chooses{" "}
                    <span className="font-mono text-white">3</span> — batter scores{" "}
                    <span className="font-medium text-white">2 runs</span>.
                  </p>
                </div>
                <div className="rounded-sm border border-ashes-border bg-white/[0.02] p-4">
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-ashes-very-muted">Example · Out</p>
                  <p className="mt-2 text-sm text-zinc-300">
                    Batter chooses <span className="font-mono text-white">3</span>, bowler chooses{" "}
                    <span className="font-mono text-white">3</span> — the batter is{" "}
                    <span className="font-medium text-white">out</span>.
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-lg border border-ashes-border bg-ashes-card p-6 md:p-8">
              <h3 className="font-bebas text-2xl tracking-wide text-white">Advanced rules</h3>
              <p className="mt-3 text-sm leading-relaxed text-ashes-muted">
                Ashes adds a small set of rules on top of the basics to keep matches competitive.
              </p>
              <ul className="mt-5 space-y-3">
                {ADVANCED_RULES.map((rule) => (
                  <li key={rule} className="flex gap-3 text-sm leading-relaxed text-ashes-muted">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ashes-red" aria-hidden="true" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        {/* Team */}
        <section aria-labelledby="team-heading" className="border-t border-ashes-border py-14 md:py-20">
          <div className="mb-8 max-w-2xl">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-ashes-red">Behind the scenes</p>
            <h2 id="team-heading" className="mt-2 font-bebas text-3xl tracking-wide text-white md:text-4xl">
              The team behind Ashes
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ashes-muted">
              Development, design, and moderation — the people keeping the game running.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <li
                key={member.userId}
                className="flex items-center gap-4 rounded-lg border border-ashes-border bg-ashes-card p-4 transition-colors hover:border-ashes-red/30"
              >
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt=""
                    width={48}
                    height={48}
                    loading="lazy"
                    className="h-12 w-12 shrink-0 rounded-full border border-ashes-border object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ashes-border bg-ashes-card-light font-bebas text-xl text-white"
                  >
                    {member.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold leading-tight text-white">{member.name}</p>
                  <p className="mt-0.5 truncate font-mono text-[10px] leading-tight text-ashes-very-muted">{member.username}</p>
                  <p className="mt-1.5 truncate font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-ashes-red">
                    {member.role}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden rounded-lg border border-ashes-border bg-ashes-card px-6 py-12 text-center md:px-12 md:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_120%_at_50%_0%,rgba(99,102,241,0.16),transparent_70%)]"
          />
          <div className="relative">
            <h2 className="font-bebas text-3xl tracking-wide text-white md:text-4xl">Ready to take the field?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ashes-muted">
              Add Ashes to your server, invite three friends, and play your first Test match in minutes.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href={INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 rounded-sm bg-ashes-red px-7 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-ashes-red-hover"
              >
                Add to Discord
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-ashes-border bg-white/[0.03] px-7 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:border-ashes-border-light hover:bg-white/[0.06]"
              >
                <Users className="h-4 w-4 text-ashes-muted" aria-hidden="true" />
                Support server
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
