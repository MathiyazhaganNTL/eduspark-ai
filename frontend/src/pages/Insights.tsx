import { motion } from "framer-motion";
import ResultCard from "@/components/ResultCard";
import { AlertTriangle, BookOpen, Users, Clock, Package } from "lucide-react";

const demoInsights = [
  {
    issue: "Difficulty recognizing letter shapes",
    topic: "Literacy",
    age: "4-5 years",
    activity: "Letter Tracing Sandbox — trace letters in a sand tray with fingers",
    materials: ["Sand tray", "Letter cards", "Stylus sticks"],
    duration: "20 minutes",
  },
  {
    issue: "Limited social interaction during free play",
    topic: "Social-Emotional Development",
    age: "3-4 years",
    activity: "Cooperative Building Challenge — small groups build a structure together",
    materials: ["Building blocks", "Timer", "Task cards"],
    duration: "25 minutes",
  },
  {
    issue: "Struggles with fine motor scissors skills",
    topic: "Physical Development",
    age: "4-6 years",
    activity: "Cutting Carnival — cut along dotted paths of increasing difficulty",
    materials: ["Safety scissors", "Printed path sheets", "Glue sticks"],
    duration: "15 minutes",
  },
];

export default function Insights() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">AI Insights</h1>
        <p className="text-muted-foreground mt-1">Structured analysis from your recent observations.</p>
      </div>

      <div className="space-y-6">
        {demoInsights.map((r, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResultCard title={r.issue} label="Identified Issue" icon={AlertTriangle}>
              <span className="inline-block mt-2 px-3 py-1 rounded-full bg-sidebar-accent text-primary text-xs font-medium">{r.topic}</span>
            </ResultCard>
            <ResultCard title={r.activity} label="Suggested Activity" icon={BookOpen}><></></ResultCard>
            <ResultCard title={r.age} label="Age Group" icon={Users}><></></ResultCard>
            <ResultCard title={r.duration} label="Duration" icon={Clock}>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {r.materials.map((m) => (
                  <span key={m} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-xs text-muted-foreground">
                    <Package className="h-3 w-3" /> {m}
                  </span>
                ))}
              </div>
            </ResultCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
