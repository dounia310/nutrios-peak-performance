import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Chrome, Apple, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/diagnostic` },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: { redirectTo: `${window.location.origin}/diagnostic` },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: `${window.location.origin}/diagnostic` },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto max-w-md px-6 w-full py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white p-8 shadow-xl"
        >
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Se connecter
          </h1>

          {/* Boutons OAuth */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 py-2.5 font-medium flex items-center justify-center gap-3 transition-all"
            >
              <Chrome className="w-5 h-5" />
              <span>Continuer avec Google</span>
            </button>

            <button
              onClick={handleMicrosoftLogin}
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 py-2.5 font-medium flex items-center justify-center gap-3 transition-all"
            >
              <Briefcase className="w-5 h-5" />
              <span>Continuer avec Microsoft</span>
            </button>

            <button
              onClick={handleAppleLogin}
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 py-2.5 font-medium flex items-center justify-center gap-3 transition-all"
            >
              <Apple className="w-5 h-5" />
              <span>Continuer avec Apple</span>
            </button>
          </div>

          {/* Séparateur */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-400">ou</span>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Email ou nom d'utilisateur
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  required
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 rounded-lg p-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-orange-500 hover:bg-orange-600 text-white py-2.5 font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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

          {/* Liens d'aide */}
          <div className="mt-6 text-center space-y-2">
            <Link to="/help" className="text-sm text-gray-500 hover:text-orange-500 block">
              Vous rencontrez des difficultés ? Obtenir de l'aide
            </Link>
            <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-orange-500 block">
              Mot de passe oublié ?
            </Link>
            <p className="text-sm text-gray-500">
              Vous n'avez pas encore de compte ?{" "}
              <Link to="/signup" className="text-orange-500 font-semibold hover:underline">
                Inscription
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}