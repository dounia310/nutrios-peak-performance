import { Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";

export function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <nav className="glass rounded-2xl flex items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-emerald grid place-items-center shadow-glow">
              <Activity className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-extrabold tracking-tight text-lg">
              Nutri<span className="text-gradient-accent">Os</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground" }}>Accueil</Link>
            <Link to="/diagnostic" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Diagnostic</Link>
            <Link to="/science" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>L'approche</Link>
          </div>
          <Link
            to="/diagnostic"
            className="rounded-xl bg-gradient-accent text-accent-foreground px-4 py-2 text-sm font-semibold shadow-accent hover:scale-[1.03] transition-transform"
          >
            Démarrer
          </Link>
        </nav>
      </div>
    </header>
  );
}
