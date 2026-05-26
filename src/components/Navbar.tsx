import { Link } from "@tanstack/react-router";
import { LogOut, User, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import logonut from "@/assets/logonut.png";


export function Navbar() {
  const { user, loading, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      isScrolled ? "bg-white/80 backdrop-blur-md" : "bg-white/60 backdrop-blur-sm"
    }`}>
      <div className="mx-auto max-w-7xl px-6 py-4">
        {/* Ajout de items-center pour l'alignement vertical parfait */}
        < nav className="rounded-2xl flex items-center justify-between h-16">
          
          {/* Logo - aligné verticalement */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <img 
              src={logonut} 
              alt="NutriOs Logo" 
              className="h-12 md:h-14 w-auto object-contain"
            />
            </Link>
          
           {/* Desktop Menu - avec meilleur contraste pour l'élément actif */}
          <div className="hidden md:flex items-center gap-8 text-sm">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-primary transition-colors font-medium py-1" 
              activeOptions={{ exact: true }} 
              activeProps={{ className: "text-green-700 font-semibold" }} // Vert plus foncé pour l'élément actif
            >
              Accueil
            </Link>
            <Link 
              to="/diagnostic" 
              className="text-gray-700 hover:text-primary transition-colors font-medium py-1" 
              activeProps={{ className: "text-green-700 font-semibold" }}
            >
              Diagnostic
            </Link>
            <Link 
              to="/demo" 
              className="text-gray-700 hover:text-primary transition-colors font-medium py-1" 
              activeProps={{ className: "text-green-700 font-semibold" }}
            >
              Démo
            </Link>
          </div>

          {/* Boutons - alignés verticalement avec items-center */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 hidden lg:block">
                  <User className="w-3 h-3 inline mr-1" />
                  {user.email?.split("@")[0]}
                </span>
                <Link
                  to="/results"
                  className="text-sm font-semibold text-gray-700 hover:text-primary transition hidden md:block"
                >
                  Mon plan
                </Link>
                <button
                  onClick={signOut}
                  className="text-sm text-gray-600 hover:text-destructive transition flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden md:inline">Déco</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-gradient-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold shadow-accent hover:scale-[1.02] transition-transform inline-flex items-center"
              >
                Connexion
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-border/50 bg-white/90 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-primary transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
                activeOptions={{ exact: true }}
                activeProps={{ className: "text-green-700 font-semibold" }}
              >
                Accueil
              </Link>
              <Link
                to="/diagnostic"
                className="text-gray-700 hover:text-primary transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
                activeProps={{ className: "text-green-700 font-semibold" }}
              >
                Diagnostic
              </Link>
              <Link
                to="/demo"
                className="text-gray-700 hover:text-primary transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
                activeProps={{ className: "text-green-700 font-semibold" }}
              >
                Démo
              </Link>
              {user && (
                <>
                  <Link
                    to="/results"
                    className="text-gray-700 hover:text-primary transition-colors font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Mon plan
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left text-gray-600 hover:text-destructive transition-colors font-medium py-2 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}