import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Server, User, Globe, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getBaseUrl, setBaseUrl } from "@/services/api";
import { toast } from "sonner";

export default function Settings() {
  const [apiUrl, setApiUrl] = useState(getBaseUrl());
  const [name, setName] = useState("Ms. Sarah");
  const [language, setLanguage] = useState("en");
  const [notifs, setNotifs] = useState(true);

  const handleSave = () => {
    setBaseUrl(apiUrl);
    toast.success("Settings saved!");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your EduAI platform.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-card border border-border rounded-3xl shadow-soft space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-sidebar-accent rounded-xl"><Server className="h-5 w-5 text-primary" /></div>
          <h2 className="font-display font-semibold text-foreground">Backend API</h2>
        </div>
        <div className="space-y-2">
          <Label htmlFor="api">API URL</Label>
          <Input id="api" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)}
            placeholder="http://192.168.1.15:8000" className="rounded-xl" />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="p-6 bg-card border border-border rounded-3xl shadow-soft space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-success/10 rounded-xl"><User className="h-5 w-5 text-success" /></div>
          <h2 className="font-display font-semibold text-foreground">Teacher Profile</h2>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Display Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="p-6 bg-card border border-border rounded-3xl shadow-soft space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-warning/20 rounded-xl"><Globe className="h-5 w-5 text-warning-foreground" /></div>
          <h2 className="font-display font-semibold text-foreground">Preferences</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Preferred Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <Label>Notifications</Label>
            </div>
            <Switch checked={notifs} onCheckedChange={setNotifs} />
          </div>
        </div>
      </motion.div>

      <Button onClick={handleSave}
        className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground shadow-elevated hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold">
        <Save className="h-4 w-4 mr-2" /> Save Settings
      </Button>
    </div>
  );
}
