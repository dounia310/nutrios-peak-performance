import { Activity } from "lucide-react";
import { Link } from "@tanstack/react-router";
import logonut from "@/assets/logonut.png";
export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-32">
      <div className="mx-auto max-w-7xl px-6 py-12 grid md:grid-cols-3 gap-8 items-start">
        <div>
          <div className="flex items-center gap-2 mb-3">
            {/* Logo - aligné verticalement */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <img 
              src={logonut} 
              alt="NutriOs Logo" 
              className="h-12 md:h-14 w-auto object-contain"
            />
            </Link>
            </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Diagnostic nutritionnel de qualité médicale pour athlètes de haut niveau.
          </p>
        </div>
        <div className="text-sm space-y-2">
          <p className="font-semibold text-foreground">Navigation</p>
          <Link to="/diagnostic" className="block text-muted-foreground hover:text-foreground">Diagnostic</Link>
          <Link to="/demo" className="block text-muted-foreground hover:text-foreground">Demo</Link>
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
