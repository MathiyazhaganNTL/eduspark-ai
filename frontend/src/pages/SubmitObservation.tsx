import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Mic, Image, FileText, Send, Loader2, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { analyzeObservation, uploadFiles, InsightResult } from "@/services/api";
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
  const [text, setText] = useState(() => localStorage.getItem("eduai_tmp_text") || "");
  const [files, setFiles] = useState<File[]>([]);
  const [language, setLanguage] = useState(() => localStorage.getItem("eduai_tmp_language") || "en");
  const [loading, setLoading] = useState(false);
  const [thinkingIdx, setThinkingIdx] = useState(0);
  const [results, setResults] = useState<InsightResult[] | null>(() => {
    try {
      const saved = localStorage.getItem("eduai_tmp_results");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Preserve state on navigation
  useEffect(() => {
    localStorage.setItem("eduai_tmp_text", text);
  }, [text]);

  useEffect(() => {
    localStorage.setItem("eduai_tmp_language", language);
  }, [language]);

  useEffect(() => {
    if (results) {
      localStorage.setItem("eduai_tmp_results", JSON.stringify(results));
    } else {
      localStorage.removeItem("eduai_tmp_results");
    }
  }, [results]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const audioDrop = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a", ".ogg", ".flac"],
      "video/mp4": [".m4a", ".mp4"],
      "audio/mp4": [".m4a", ".mp4"],
      "audio/x-m4a": [".m4a"],
      "audio/mpeg": [".mp3"],
    },
    multiple: true,
  });

  const imageDrop = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".webp"],
    },
    multiple: true,
  });

  const docDrop = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt", ".csv", ".md"],
    },
    multiple: true,
  });

  const handleAnalyze = async () => {
    if (!text.trim() && files.length === 0) {
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
      if (files.length > 0) {
        data = await uploadFiles(files, language, text.trim() || undefined);
      } else {
        data = await analyzeObservation({ text, language });
      }
      setResults(data);
      // Automatically clear out the text/files on successful submission to prepare for next
      setText("");
      setFiles([]);
      toast.success("Analysis complete! We found insights for you.");
    } catch {
      toast.error("Could not reach the AI server. Please check your connection.");
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Audio Upload */}
          <div
            {...audioDrop.getRootProps()}
            className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-3xl cursor-pointer transition-colors ${
              audioDrop.isDragActive ? "border-primary bg-sidebar-accent" : "border-border bg-muted/30 hover:bg-sidebar-accent/50"
            }`}
          >
            <input {...audioDrop.getInputProps()} />
            <div className="p-3 rounded-xl bg-sidebar-accent mb-3"><Mic className="h-6 w-6 text-primary" /></div>
            <p className="text-sm font-medium text-foreground">Add Audio</p>
            <p className="text-xs text-muted-foreground mt-1 text-center">.mp3, .wav, .m4a, .mp4</p>
          </div>

          {/* Image Upload */}
          <div
            {...imageDrop.getRootProps()}
            className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-3xl cursor-pointer transition-colors ${
              imageDrop.isDragActive ? "border-success bg-success/10" : "border-border bg-muted/30 hover:bg-success/5"
            }`}
          >
            <input {...imageDrop.getInputProps()} />
            <div className="p-3 rounded-xl bg-success/10 mb-3"><Image className="h-6 w-6 text-success" /></div>
            <p className="text-sm font-medium text-foreground">Add Image</p>
            <p className="text-xs text-muted-foreground mt-1 text-center">.jpg, .png, .webp</p>
          </div>

          {/* Document Upload */}
          <div
            {...docDrop.getRootProps()}
            className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-3xl cursor-pointer transition-colors ${
              docDrop.isDragActive ? "border-warning bg-warning/10" : "border-border bg-muted/30 hover:bg-warning/5"
            }`}
          >
            <input {...docDrop.getInputProps()} />
            <div className="p-3 rounded-xl bg-warning/20 mb-3"><FileText className="h-6 w-6 text-warning-foreground" /></div>
            <p className="text-sm font-medium text-foreground">Add Document</p>
            <p className="text-xs text-muted-foreground mt-1 text-center">.pdf, .txt</p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((f, i) => (
              <div key={`${f.name}-${i}`} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground flex-1 truncate">{f.name}</span>
                <span className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span>
                <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-48 rounded-xl">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ta">Tamil</SelectItem>
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

            {/* Display individually extracted files */}
            {results.some(r => r.extracted_files && r.extracted_files.length > 0) && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="mt-8 space-y-4"
              >
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Extracted Document Details
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {results.find(r => r.extracted_files && r.extracted_files.length > 0)?.extracted_files?.map((extFile, idx) => (
                    <div key={idx} className="p-5 bg-muted/30 border border-border rounded-2xl">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-md">
                          Document {idx + 1}
                        </span>
                        <span className="text-sm font-medium text-foreground">{extFile.file_name}</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans">
                          {extFile.content}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
