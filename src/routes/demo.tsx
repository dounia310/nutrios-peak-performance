import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Pause, Maximize2, Volume2, VolumeX } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState, useRef } from "react";

 const demoVideo = "/demo-video.mp4";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Démo — NutriOs en action" },
      { name: "description", content: "Vidéo de démonstration : découvrez comment NutriOs transforme votre diagnostic nutritionnel en un plan personnalisé complet." },
      { property: "og:title", content: "Démo — NutriOs en action" },
      { property: "og:description", content: "Vidéo de démonstration : découvrez comment NutriOs transforme votre diagnostic nutritionnel en un plan personnalisé complet." },
      { property: "og:url", content: "https://plannutrios.lovable.app/demo" },
    ],
    links: [{ rel: "canonical", href: "https://plannutrios.lovable.app/demo" }],
  }),
  component: DemoPage,
});

function DemoPage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-accent mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-glow" />
              Démonstration
            </span>
            <h1 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight mb-4">
              Découvrez NutriOs{" "}
              <span className="text-gradient">en action</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Regardez comment notre plateforme transforme votre diagnostic nutritionnel en plan personnalisé
            </p>
          </motion.div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-8 pb-24" aria-labelledby="demo-video-heading">
        <div className="mx-auto max-w-6xl px-6">
          <h2 id="demo-video-heading" className="sr-only">Vidéo de démonstration</h2>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative rounded-3xl overflow-hidden shadow-glow border border-border bg-black/5"
          >
            {/* Video Player */}
            <video
              ref={videoRef}
              className="w-full aspect-video object-cover"
              autoPlay
              loop
              muted={isMuted}
              playsInline
            >
              <source src={demoVideo} type="video/mp4" />
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>

            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-linear from-black/80 via-black/40 to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Mettre la vidéo en pause" : "Lancer la lecture de la vidéo"}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={toggleMute}
                    aria-label={isMuted ? "Réactiver le son" : "Couper le son"}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>
                <button
                  onClick={handleFullscreen}
                  aria-label="Passer la vidéo en plein écran"
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Play Button Centered */}
            {!isPlaying && (
          <button
            onClick={togglePlay}
            aria-label="Lancer la lecture de la vidéo"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 rounded-full bg-gradient-accent text-accent-foreground shadow-accent hover:scale-110 transition-transform"
              >
                <Play className="w-8 h-8" fill="currentColor" />
              </button>
            )}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 text-center"
          >
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-accent text-accent-foreground px-8 py-4 font-bold shadow-accent hover:scale-[1.03] transition-transform"
            >
              Commencer mon diagnostic gratuit
              <ArrowLeft className="w-5 h-5 rotate-180 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}