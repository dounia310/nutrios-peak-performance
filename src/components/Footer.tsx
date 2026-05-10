import { Activity } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-32">
      <div className="mx-auto max-w-7xl px-6 py-12 grid md:grid-cols-3 gap-8 items-start">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-emerald grid place-items-center">
              <Activity className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-extrabold text-lg">Nutri<span className="text-gradient-accent">Os</span></span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Diagnostic nutritionnel de qualité médicale pour athlètes de haut niveau.
          </p>
        </div>
        <div className="text-sm space-y-2">
          <p className="font-semibold text-foreground">Navigation</p>
          <Link to="/diagnostic" className="block text-muted-foreground hover:text-foreground">Diagnostic</Link>
          <Link to="/science" className="block text-muted-foreground hover:text-foreground">L'approche scientifique</Link>
        </div>
        <div className="text-sm space-y-2">
          <p className="font-semibold text-foreground">Conformité</p>
          <p className="text-muted-foreground">Méthodologie validée Mifflin-St Jeor</p>
          <p className="text-muted-foreground">Données chiffrées, hébergement européen</p>
        </div>
      </div>
      <div className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} NutriOs · Performance Nutrition Diagnostics
      </div>
    </footer>
  );
}
