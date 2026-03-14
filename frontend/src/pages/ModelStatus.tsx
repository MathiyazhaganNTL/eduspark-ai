import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import ModelStatusCard from "@/components/ModelStatusCard";
import { fetchHealth, HealthResponse } from "@/services/api";

const fallbackModels: Record<string, string> = {
  "Ollama (LLM)": "available",
  "Whisper (Speech-to-Text)": "available",
  "NLLB (Translation)": "available",
  "Tesseract (OCR)": "not installed",
};

export default function ModelStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = async () => {
    try {
      const data = await fetchHealth();
      setHealth(data);
      setError(false);
    } catch {
      setError(true);
      setHealth({ status: "demo", models: fallbackModels });
    }
    setLastRefresh(new Date());
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const models = health?.models || fallbackModels;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Model Status</h1>
          <p className="text-muted-foreground mt-1">Real-time AI model health monitoring — refreshes every 10s.</p>
        </div>
        <div className="flex items-center gap-3">
          {error ? (
            <span className="flex items-center gap-2 text-xs text-destructive"><WifiOff className="h-4 w-4" /> Demo mode</span>
          ) : (
            <span className="flex items-center gap-2 text-xs text-success"><Wifi className="h-4 w-4" /> Connected</span>
          )}
          <button onClick={load} className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors">
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="p-4 bg-card border border-border rounded-3xl shadow-soft">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className={`h-3 w-3 rounded-full ${health?.status === "healthy" ? "bg-success" : "bg-warning"}`} />
          <span className="font-display font-semibold text-foreground capitalize">
            System: {health?.status || "checking…"}
          </span>
          <span className="text-xs text-muted-foreground ml-auto">
            Last check: {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(models).map(([name, status], i) => (
          <ModelStatusCard key={name} name={name} status={status} delay={i * 0.05} />
        ))}
      </div>
    </div>
  );
}
