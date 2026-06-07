import { Helmet } from "react-helmet-async";

export function Home() {
  return (
    <>
      <Helmet>
        <title>Ashes · Discord Cricket Bot</title>
        <meta name="description" content="Ashes is the ultimate cricket simulation bot for Discord. Host matches, track leaderboards, and manage your servers cricket leagues." />
        <meta property="og:title" content="Ashes · Discord Cricket Bot" />
        <meta property="og:description" content="Ashes is the ultimate cricket simulation bot for Discord." />
      </Helmet>
      <div className="flex flex-col items-center justify-center py-8 md:py-16 px-2 text-center relative">
        <div className="absolute inset-0 bg-ashes-red/20 blur-[120px] rounded-full z-0 h-48 w-48 md:h-64 md:w-64 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        <h2 className="font-bebas text-4xl sm:text-5xl md:text-7xl text-white leading-tight mb-4 tracking-wider relative z-10 font-medium">
          THE <span className="text-ashes-red italic">ULTIMATE</span> CRICKET EXPERIENCE
        </h2>
        <p className="max-w-2xl text-ashes-muted text-lg mb-12 relative z-10 leading-relaxed text-zinc-400">
          Ashes brings real-time cricket simulation directly to your Discord server.
          Track stats, follow live games, and compete on global leaderboards.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-16 relative z-10">
          <div className="bg-ashes-card border border-ashes-border hover:border-ashes-red/30 transition-colors p-6 text-left">
            <h3 className="font-bebas text-2xl text-white tracking-wide mb-2">Live Matches</h3>
            <p className="text-ashes-muted text-sm">Follow ball-by-ball commentary and real-time scorecards as matches unfold in your Discord channels.</p>
          </div>
          <div className="bg-ashes-card border border-ashes-border hover:border-ashes-red/30 transition-colors p-6 text-left">
            <h3 className="font-bebas text-2xl text-white tracking-wide mb-2">Detailed Scorecards</h3>
            <p className="text-ashes-muted text-sm">Every match is recorded with deep statistical data, giving you a complete overview of team and player performance.</p>
          </div>
          <div className="bg-ashes-card border border-ashes-border hover:border-ashes-red/30 transition-colors p-6 text-left">
            <h3 className="font-bebas text-2xl text-white tracking-wide mb-2">Global Leaderboards</h3>
            <p className="text-ashes-muted text-sm">Compete across all servers to become the top run scorer, wicket taker, or most valuable player globally.</p>
          </div>
        </div>

        <div className="w-full max-w-4xl bg-ashes-card border border-ashes-border p-6 md:p-8 text-left relative z-10">
          <h3 className="font-bebas text-3xl tracking-wider mb-6 border-b border-ashes-border pb-4 text-white">Meet the Team</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col">
              <span className="font-bold text-white">Creator</span>
              <span className="font-mono text-[10px] text-ashes-very-muted uppercase tracking-[0.2em] mt-1">Lead Developer</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white">Contributors</span>
              <span className="font-mono text-[10px] text-ashes-very-muted uppercase tracking-[0.2em] mt-1">Community Team</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
