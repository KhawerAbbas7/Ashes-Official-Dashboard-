import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";

const INVITE_URL = "https://top.gg/bot/1443165621100740668";
const SUPPORT_URL = "https://discord.gg/7fXmznW9sB";

const NAV_ITEMS = [
  { to: "/", label: "Home", matches: (path: string) => path === "/" },
  { to: "/matches", label: "Matches", matches: (path: string) => path.startsWith("/match") || path.startsWith("/live") },
  { to: "/leaderboard", label: "Leaderboard", matches: (path: string) => path.startsWith("/leaderboard") },
  { to: "/players", label: "Players", matches: (path: string) => path.startsWith("/player") },
  { to: "/rankings", label: "Rankings", matches: (path: string) => path.startsWith("/rankings") },
];

export function Layout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:bg-ashes-red focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 border-b border-ashes-border bg-ashes-dark/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between gap-6 px-4 md:h-20 md:px-8">
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <img
              src="https://cdn.discordapp.com/avatars/1443165621100740668/40ef4cf2ee6a72db2a5af55c231192bd.png?size=64"
              alt="Ashes logo"
              width={40}
              height={40}
              className="h-9 w-9 rounded-full border border-ashes-border md:h-10 md:w-10"
            />
            <span className="font-bebas text-2xl font-bold tracking-tight text-white">ASHES</span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = item.matches(location.pathname);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={`relative py-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] transition-colors ${
                    active ? "text-white" : "text-ashes-very-muted hover:text-white"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute inset-x-0 -bottom-[21px] h-px bg-ashes-red transition-opacity ${
                      active ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-sm bg-ashes-red px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-ashes-red-hover sm:inline-flex"
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
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-ashes-border text-ashes-muted transition-colors hover:border-ashes-border-light hover:text-white md:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav id="mobile-nav" aria-label="Mobile" className="border-t border-ashes-border bg-ashes-dark/95 px-4 py-3 md:hidden">
            <div className="mx-auto flex max-w-[1120px] flex-col">
              {NAV_ITEMS.map((item) => {
                const active = item.matches(location.pathname);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center justify-between rounded-sm px-3 py-3 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
                      active ? "bg-white/5 text-white" : "text-ashes-muted hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {item.label}
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-ashes-red" aria-hidden="true" />}
                  </Link>
                );
              })}
              <a
                href={INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-sm bg-ashes-red px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white sm:hidden"
              >
                Add to Discord
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </nav>
        )}
      </header>

      <main id="main" className="mx-auto w-full max-w-[1120px] flex-1 px-4 py-8 md:px-8 md:py-12">
        <Outlet />
      </main>

      <footer className="border-t border-ashes-border bg-black/20">
        <div className="mx-auto w-full max-w-[1120px] px-4 py-10 md:px-8 md:py-14">
          <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
            <div className="max-w-sm">
              <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
                <img
                  src="https://cdn.discordapp.com/avatars/1443165621100740668/40ef4cf2ee6a72db2a5af55c231192bd.png?size=64"
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full border border-ashes-border"
                />
                <span className="font-bebas text-xl font-bold tracking-tight text-white">ASHES</span>
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-ashes-muted">
                A real-time Test cricket simulator for Discord. Host matches, track every delivery, and compete on global leaderboards.
              </p>
            </div>

            <div>
              <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-ashes-very-muted">Explore</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><Link to="/matches" className="text-ashes-muted transition-colors hover:text-white">Matches</Link></li>
                <li><Link to="/leaderboard" className="text-ashes-muted transition-colors hover:text-white">Leaderboard</Link></li>
                <li><Link to="/players" className="text-ashes-muted transition-colors hover:text-white">Players</Link></li>
                <li><Link to="/rankings" className="text-ashes-muted transition-colors hover:text-white">Rankings</Link></li>
              </ul>
            </div>

            <div>
              <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-ashes-very-muted">Community</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <a href={INVITE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-ashes-muted transition-colors hover:text-white">
                    Add to Discord <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-ashes-muted transition-colors hover:text-white">
                    Support server <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                  </a>
                </li>
                <li><Link to="/" className="text-ashes-muted transition-colors hover:text-white">How to play</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-ashes-border pt-6 text-[11px] text-ashes-very-muted sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {new Date().getFullYear()} Ashes. All rights reserved.</p>
            <p>Not affiliated with Discord Inc.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
