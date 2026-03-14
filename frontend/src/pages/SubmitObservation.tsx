import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Mic, Image, FileText, Send, Loader2, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { analyzeObservation, uploadFile, InsightResult } from "@/services/api";
import ResultCard from "@/components/ResultCard";
import { AlertTriangle, BookOpen, Clock, Package, Users } from "lucide-react";
import { toast } from "sonner";

const thinkingMessages = [
  "Transcribing audio...",
  "Identifying curriculum topics...",
  "Analyzing learning patterns...",
  "Generating activities...",
];

export default function SubmitObservation() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [thinkingIdx, setThinkingIdx] = useState(0);
  const [results, setResults] = useState<InsightResult[] | null>(null);

  const onDrop = useCallback((files: File[]) => {
    if (files.length > 0) setFile(files[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a"],
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!text.trim() && !file) {
      toast.error("Please enter an observation or upload a file.");
      return;
    }
    setLoading(true);
    setResults(null);
    setThinkingIdx(0);

    const interval = setInterval(() => {
      setThinkingIdx((i) => (i + 1) % thinkingMessages.length);
    }, 2000);

    try {
      let data: InsightResult[];
      if (file) {
        data = await uploadFile(file, language);
      } else {
        data = await analyzeObservation({ text, language });
      }
      setResults(data);
      toast.success("Analysis complete! We found insights for you.");
    } catch {
      toast.error("Could not reach the AI server. Please check your connection.");
      // Demo fallback
      setResults([
        {
          identified_issue: "Student struggles with number counting 1-10",
          curriculum_topic: "Early Mathematics",
          age_group: "3-5 years",
          suggested_activity: "Number Line Hop — students physically hop along a floor number line while counting aloud",
          required_materials: ["Floor number line mat", "Number flashcards", "Stickers"],
          activity_duration: "15 minutes",
        },
      ]);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
          What did you observe in the classroom today?
        </h1>
        <p className="text-muted-foreground mt-1">Describe what you noticed, or upload a recording, image, or document.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-card border border-border rounded-3xl shadow-soft space-y-5">
        <Textarea
          placeholder="e.g. Student struggles to count numbers from 1 to 10…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[140px] text-lg rounded-2xl border-border resize-none focus-visible:ring-primary/30"
        />

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-primary bg-sidebar-accent" : "border-border bg-muted/30 hover:bg-sidebar-accent/50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-3">
              <div className="p-2.5 rounded-xl bg-sidebar-accent"><Mic className="h-5 w-5 text-primary" /></div>
              <div className="p-2.5 rounded-xl bg-success/10"><Image className="h-5 w-5 text-success" /></div>
              <div className="p-2.5 rounded-xl bg-warning/20"><FileText className="h-5 w-5 text-warning-foreground" /></div>
            </div>
            <p className="text-sm text-muted-foreground">
              {isDragActive ? "Drop your file here…" : "Drag & drop audio, image, or PDF — or click to browse"}
            </p>
          </div>
        </div>

        {file && (
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground flex-1 truncate">{file.name}</span>
            <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-48 rounded-xl">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ar">Arabic</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground shadow-elevated hover:scale-[1.02] active:scale-[0.98] transition-all text-base font-semibold"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Send className="h-5 w-5 mr-2" />}
            {loading ? "Analyzing…" : "Analyze Observation"}
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-4">
            <p className="text-sm text-muted-foreground text-center font-medium">
              {thinkingMessages[thinkingIdx]}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-40 rounded-3xl animate-shimmer" />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {results && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium text-sm">We found insights for you</span>
            </div>
            {results.map((r, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ResultCard title={r.identified_issue} label="Identified Issue" icon={AlertTriangle} delay={0}>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full bg-sidebar-accent text-primary text-xs font-medium">
                    {r.curriculum_topic}
                  </span>
                </ResultCard>
                <ResultCard title={r.suggested_activity} label="Suggested Activity" icon={BookOpen} delay={0.05}>
                  <></>
                </ResultCard>
                <ResultCard title={r.age_group} label="Age Group" icon={Users} delay={0.1}>
                  <></>
                </ResultCard>
                <ResultCard title={r.activity_duration} label="Duration" icon={Clock} delay={0.15}>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {r.required_materials.map((m) => (
                      <span key={m} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-xs text-muted-foreground">
                        <Package className="h-3 w-3" /> {m}
                      </span>
                    ))}
                  </div>
                </ResultCard>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
