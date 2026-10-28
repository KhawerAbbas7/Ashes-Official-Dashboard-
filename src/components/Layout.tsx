import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";

const INVITE_URL = "https://top.gg/bot/1443165621100740668";
const SUPPORT_URL = "https://discord.gg/7fXmznW9sB";

const NAV_ITEMS = [
  { to: "/", label: "Home", matches: (path: string) => path === "/" },
  { to: "/matches", label: "Matches", matches: (path: string) => path.startsWith("/match") || path.startsWith("/live") },
  { to: "/leaderboard", label: "Leaderboard", matches: (path: string) => path.startsWith("/leaderboard") },
  { to: "/rankings", label: "Rankings", matches: (path: string) => path.startsWith("/rankings") },
  { to: "/players", label: "Players", matches: (path: string) => path.startsWith("/player") },
];

export function Layout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date());

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:border focus:border-ball focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-paper"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 border-b border-rule bg-ink">
        <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-4 md:h-[72px] md:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-80">
            <img
              src="https://cdn.discordapp.com/avatars/1443165621100740668/40ef4cf2ee6a72db2a5af55c231192bd.png?size=64"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 border border-rule object-cover"
            />
            <span className="min-w-0">
              <span className="display block text-xl leading-none">Ashes</span>
              <span className="label mt-1 hidden text-[8px] tracking-[0.2em] sm:block">
                Test &amp; T15 cricket
              </span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = item.matches(location.pathname);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className="group inline-flex items-center gap-2"
                >
                  <span
                    aria-hidden="true"
                    className={`h-1 w-1 transition-colors ${
                      active ? "bg-ball" : "bg-transparent group-hover:bg-paper-mute"
                    }`}
                  />
                  <span
                    className={`font-mono text-[10px] font-medium uppercase tracking-[0.18em] transition-colors ${
                      active ? "text-paper" : "text-paper-mute group-hover:text-paper"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <span className="label hidden lg:block">{today}</span>
            <a
              href={INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-solid hidden py-2 sm:inline-flex"
            >
              Add to Discord
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="inline-flex h-10 w-10 items-center justify-center border border-rule text-paper-soft transition-colors hover:border-paper-mute hover:text-paper md:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            id="mobile-nav"
            aria-label="Mobile"
            className="border-t border-rule bg-ink px-4 pb-5 pt-2 md:hidden"
          >
            <div className="mx-auto flex max-w-[1200px] flex-col">
              {NAV_ITEMS.map((item) => {
                const active = item.matches(location.pathname);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className="flex items-center justify-between gap-4 border-b border-rule-soft py-3.5"
                  >
                    <span
                      className={`display whitespace-nowrap text-xl leading-none ${
                        active ? "text-paper" : "text-paper-soft"
                      }`}
                    >
                      {item.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 shrink-0 ${active ? "bg-ball" : "bg-rule"}`}
                    />
                  </Link>
                );
              })}
              <a
                href={INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-solid mt-5"
              >
                Add to Discord
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </nav>
        )}
      </header>

      <main id="main" className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 md:px-8 md:py-12">
        <Outlet />
      </main>

      <footer className="border-t border-rule bg-ink-sunken">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-12 md:px-8 md:py-16">
          <div className="grid gap-10 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <div className="max-w-sm">
              <Link to="/" className="inline-flex items-center gap-3 transition-opacity hover:opacity-80">
                <img
                  src="https://cdn.discordapp.com/avatars/1443165621100740668/40ef4cf2ee6a72db2a5af55c231192bd.png?size=64"
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 border border-rule object-cover"
                />
                <span className="display text-xl leading-none">Ashes</span>
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-paper-mute">
                A real-time Test and T15 cricket simulator for Discord. Host matches, follow every
                delivery, and keep a permanent record of the game.
              </p>
            </div>

            <div>
              <h2 className="label">Scorebook</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><Link to="/matches" className="text-paper-mute transition-colors hover:text-paper">Matches</Link></li>
                <li><Link to="/leaderboard" className="text-paper-mute transition-colors hover:text-paper">Leaderboard</Link></li>
                <li><Link to="/rankings" className="text-paper-mute transition-colors hover:text-paper">Rankings</Link></li>
                <li><Link to="/players" className="text-paper-mute transition-colors hover:text-paper">Players</Link></li>
              </ul>
            </div>

            <div>
              <h2 className="label">Community</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <a href={INVITE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-paper-mute transition-colors hover:text-paper">
                    Add to Discord <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-paper-mute transition-colors hover:text-paper">
                    Support server <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                  </a>
                </li>
                <li><Link to="/" className="text-paper-mute transition-colors hover:text-paper">How to play</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-rule pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="label">&copy; {new Date().getFullYear()} Ashes</p>
            <p className="label">Not affiliated with Discord Inc.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
