import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Clock, Star, Package } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const activities = [
  { title: "Number Line Hop", desc: "Students hop along a floor number line counting aloud.", materials: ["Floor mat", "Number cards"], duration: "15 min", difficulty: "Easy", age: "3-5", topic: "Math" },
  { title: "Letter Tracing Sandbox", desc: "Trace letter shapes in a sand tray with fingers.", materials: ["Sand tray", "Letter cards"], duration: "20 min", difficulty: "Easy", age: "4-5", topic: "Literacy" },
  { title: "Cooperative Building Challenge", desc: "Small groups build a structure together using blocks.", materials: ["Building blocks", "Timer"], duration: "25 min", difficulty: "Medium", age: "3-4", topic: "Social" },
  { title: "Cutting Carnival", desc: "Cut along dotted paths of increasing difficulty.", materials: ["Safety scissors", "Path sheets"], duration: "15 min", difficulty: "Medium", age: "4-6", topic: "Motor Skills" },
  { title: "Color Mixing Lab", desc: "Experiment mixing primary colors to discover new colors.", materials: ["Paint", "Cups", "Paper"], duration: "20 min", difficulty: "Easy", age: "3-5", topic: "Art" },
  { title: "Story Sequencing", desc: "Arrange picture cards to tell a story in order.", materials: ["Picture cards", "Story board"], duration: "20 min", difficulty: "Hard", age: "5-6", topic: "Literacy" },
];

const diffColor: Record<string, string> = {
  Easy: "bg-success/10 text-success",
  Medium: "bg-warning/20 text-warning-foreground",
  Hard: "bg-accent/10 text-accent",
};

export default function ActivityLibrary() {
  const [ageFilter, setAgeFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [diffFilter, setDiffFilter] = useState("all");

  const filtered = activities.filter((a) =>
    (ageFilter === "all" || a.age === ageFilter) &&
    (topicFilter === "all" || a.topic === topicFilter) &&
    (diffFilter === "all" || a.difficulty === diffFilter)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Activity Library</h1>
        <p className="text-muted-foreground mt-1">Suggested for you — AI-generated classroom activities.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={ageFilter} onValueChange={setAgeFilter}>
          <SelectTrigger className="w-36 rounded-xl"><SelectValue placeholder="Age Group" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ages</SelectItem>
            <SelectItem value="3-4">3-4 years</SelectItem>
            <SelectItem value="3-5">3-5 years</SelectItem>
            <SelectItem value="4-5">4-5 years</SelectItem>
            <SelectItem value="4-6">4-6 years</SelectItem>
            <SelectItem value="5-6">5-6 years</SelectItem>
          </SelectContent>
        </Select>
        <Select value={topicFilter} onValueChange={setTopicFilter}>
          <SelectTrigger className="w-36 rounded-xl"><SelectValue placeholder="Topic" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Topics</SelectItem>
            <SelectItem value="Math">Math</SelectItem>
            <SelectItem value="Literacy">Literacy</SelectItem>
            <SelectItem value="Social">Social</SelectItem>
            <SelectItem value="Motor Skills">Motor Skills</SelectItem>
            <SelectItem value="Art">Art</SelectItem>
          </SelectContent>
        </Select>
        <Select value={diffFilter} onValueChange={setDiffFilter}>
          <SelectTrigger className="w-36 rounded-xl"><SelectValue placeholder="Difficulty" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((a, i) => (
          <motion.div key={a.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-5 bg-card border border-border rounded-3xl shadow-soft flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-sidebar-accent rounded-xl">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${diffColor[a.difficulty]}`}>
                {a.difficulty}
              </span>
            </div>
            <h3 className="font-display font-semibold text-foreground text-lg">{a.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 flex-1">{a.desc}</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> {a.duration}
                <span className="mx-1">·</span>
                <Star className="h-3.5 w-3.5" /> {a.age}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {a.materials.map((m) => (
                  <span key={m} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted text-xs text-muted-foreground">
                    <Package className="h-3 w-3" /> {m}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
