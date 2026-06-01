import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion — NutriOs" },
      { name: "description", content: "Connectez-vous à votre compte NutriOs pour accéder à votre diagnostic nutritionnel et à votre plan personnalisé." },
      { property: "og:title", content: "Connexion — NutriOs" },
      { property: "og:description", content: "Connectez-vous à votre compte NutriOs pour accéder à votre diagnostic nutritionnel et à votre plan personnalisé." },
      { property: "og:url", content: "https://plannutrios.lovable.app/login" },
    ],
    links: [{ rel: "canonical", href: "https://plannutrios.lovable.app/login" }],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      navigate({ to: "/diagnostic" });
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/diagnostic` },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] pt-44 pb-20">
      <div className="mx-auto max-w-md px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] bg-white p-8 md:p-10 shadow-xl shadow-gray-100/50 border border-gray-100/80"
        >
          <h1 className="text-2xl font-black text-center text-gray-900 mb-8 tracking-tight">
            Se connecter
          </h1>

          {/* Bouton Google */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 py-3 font-semibold flex items-center justify-center gap-3 transition-colors text-sm shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Continuer avec Google</span>
            </button>
          </div>

          {/* Séparateur */}
          <div className="relative mb-6 flex items-center justify-center">
            <div className="w-full border-t border-gray-100 absolute"></div>
            <span className="px-4 bg-white text-gray-400 text-xs font-bold uppercase tracking-wider relative z-10">ou</span>
          </div>

          {/* Formulaire email/password */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="text-xs uppercase tracking-[0.15em] font-bold text-gray-400 mb-1.5 block">
                Email ou nom d'utilisateur
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  required
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 pl-11 pr-4 py-3 focus:outline-none focus:border-orange-500 focus:bg-white text-gray-800 placeholder-gray-400 text-sm font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="text-xs uppercase tracking-[0.15em] font-bold text-gray-400 mb-1.5 block">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 pl-11 pr-4 py-3 focus:outline-none focus:border-orange-500 focus:bg-white text-gray-800 placeholder-gray-400 text-sm font-medium transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 rounded-xl p-3.5 font-medium border border-red-100">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3.5 font-bold shadow-md hover:shadow-orange-200/80 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  CONNEXION
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4">
            <Link to="/forgot-password" className="font-medium text-gray-500 hover:text-orange-500 transition-colors">
              Mot de passe oublié ?
            </Link>
            <p className="text-gray-500 font-medium mt-2">
              Vous n'avez pas encore de compte ?{" "}
              <Link to="/signup" className="text-orange-500 font-bold underline hover:text-orange-600 ml-1">
                Inscription
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}