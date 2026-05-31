import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion — NutriOs" },
      { name: "description", content: "Connectez-vous à votre compte NutriOs" },
    ],
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

  const handleOAuthLogin = async (provider: "google" | "azure" | "apple") => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/diagnostic` },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    // 1. pt-44 permet de descendre complètement la boîte pour qu'elle ne touche plus la Navbar
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

          {/* Boutons OAuth avec vrais logos de marques */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleOAuthLogin("google")}
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

            <button
              onClick={() => handleOAuthLogin("azure")}
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 py-3 font-semibold flex items-center justify-center gap-3 transition-colors text-sm shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 23 23">
                <path fill="#f35325" d="M0 0h11v11H0z"/>
                <path fill="#81bc06" d="M12 0h11v11H12z"/>
                <path fill="#05a6f0" d="M0 12h11v11H0z"/>
                <path fill="#ffba08" d="M12 12h11v11H12z"/>
              </svg>
              <span>Continuer avec Microsoft</span>
            </button>

            <button
              onClick={() => handleOAuthLogin("apple")}
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 py-3 font-semibold flex items-center justify-center gap-3 transition-colors text-sm shadow-sm"
            >
              <svg className="w-4 h-4 fill-black" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.04-1.92-14.11-6.12-3.32-2.63-7.23-7.3-11.73-14-5.01-7.41-9.23-16.11-12.67-26.13-3.44-10.02-5.17-19.57-5.17-28.64 0-14.34 3.73-25.76 11.21-34.25 7.47-8.49 16.59-12.77 27.35-12.82 5.06 0 10.59 1.5 16.57 4.52 5.99 3.01 10.01 4.52 12.06 4.52 1.7 0 5.89-1.63 12.56-4.87 6.67-3.24 12.24-4.75 17.31-4.52 12.63.51 22.56 5.21 29.8 14.1-11.21 6.83-16.66 15.93-16.34 27.29.32 9.04 3.78 16.6 10.37 22.68 6.59 6.08 14.19 9.35 22.8 9.81-2.5 7.42-5.74 14.42-9.73 20.98zm-23.51-105.7c0-7.36 2.62-14.11 7.87-20.25 5.24-6.14 11.83-9.53 19.78-10.17.11 1.02.17 1.93.17 2.73 0 7.02-2.71 13.6-8.13 19.73-5.42 6.13-12.02 9.69-19.8 10.66-.46-1.81-.89-3.71-.89-5.71z"/>
              </svg>
              <span>Continuer avec Apple</span>
            </button>
          </div>

          {/* Séparateur */}
          <div className="relative mb-6 flex items-center justify-center">
            <div className="w-full border-t border-gray-100 absolute"></div>
            <span className="px-4 bg-white text-gray-400 text-xs font-bold uppercase tracking-wider relative z-10">ou</span>
          </div>

          {/* Formulaire aux bords arrondis fluides */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-[0.15em] font-bold text-gray-400 mb-1.5 block">
                Email ou nom d'utilisateur
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
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
              <label className="text-xs uppercase tracking-[0.15em] font-bold text-gray-400 mb-1.5 block">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
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
              className="w-full rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3.5 font-bold shadow-md hover:shadow-orange-200/80 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
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
          <div>
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
