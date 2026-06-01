import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Mot de passe oublié — NutriOs" },
      { name: "description", content: "Réinitialisez votre mot de passe NutriOs en quelques secondes grâce au lien de récupération envoyé par email." },
      { property: "og:title", content: "Mot de passe oublié — NutriOs" },
      { property: "og:description", content: "Réinitialisez votre mot de passe NutriOs en quelques secondes grâce au lien de récupération envoyé par email." },
      { property: "og:url", content: "https://plannutrios.lovable.app/forgot-password" },
    ],
    links: [{ rel: "canonical", href: "https://plannutrios.lovable.app/forgot-password" }],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess("✅ Email envoyé ! Vérifiez votre boîte mail pour réinitialiser votre mot de passe.");
    }
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
          <button
            onClick={() => navigate({ to: "/login" })}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Retour à la connexion</span>
          </button>

          <h1 className="text-2xl font-black text-center text-gray-900 mb-2 tracking-tight">
            Mot de passe oublié ?
          </h1>
          <p className="text-gray-500 text-center text-sm mb-8">
            Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-[0.15em] font-bold text-gray-400 mb-1.5 block">
                Email
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

            {error && (
              <p className="text-red-500 text-sm bg-red-50 rounded-xl p-3.5 font-medium border border-red-100">
                {error}
              </p>
            )}
            {success && (
              <p className="text-emerald-600 text-sm bg-emerald-50 rounded-xl p-3.5 font-medium border border-emerald-500/20">
                {success}
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
                  Envoyer le lien
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-6 text-gray-500">
            Vous vous souvenez de votre mot de passe ?{" "}
            <Link to="/login" className="text-orange-500 font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}