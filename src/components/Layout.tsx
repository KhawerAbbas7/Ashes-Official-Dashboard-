import { Link, Outlet, useLocation } from "react-router-dom";

export function Layout() {
  const location = useLocation();
  const getNavClass = (path: string, exact: boolean = false) => {
    const isActive = exact ? location.pathname === path : location.pathname.startsWith(path);
    return isActive 
      ? "text-white border-b border-ashes-red pb-1"
      : "hover:text-white transition-colors";
  };

  return (
    <div className="min-h-screen bg-ashes-dark flex justify-center pb-12 selection:bg-ashes-red/30">
      <div className="w-full max-w-[1080px] flex flex-col mt-4">
        <header className="flex flex-col md:flex-row items-center justify-between px-4 md:px-12 py-6 md:py-8 border-b border-ashes-border mb-6 md:mb-8 gap-6 md:gap-0">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-ashes-red rounded-full flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45"></div>
            </div>
            <span className="font-bebas text-xl font-bold tracking-tight text-white m-0 p-0">ASHES</span>
          </Link>
          <nav className="flex flex-wrap justify-center gap-4 md:gap-10 font-sans text-[10px] md:text-xs font-medium uppercase tracking-[0.2em] text-ashes-very-muted">
            <Link to="/" className={getNavClass("/", true)}>Home</Link>
            <Link to="/matches" className={getNavClass("/match")}>Matches</Link>
            <Link to="/leaderboard" className={getNavClass("/leaderboard")}>Leaderboard</Link>
          </nav>
        </header>
        <div className="flex-1 px-4 md:px-12">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
