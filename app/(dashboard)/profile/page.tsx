"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, CreditCard, Zap, Shield, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const { user, profile, loading } = useUser();
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name);
  }, [profile]);

  const handleSave = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() })
      .eq("id", user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const generationsUsed = profile?.generations_used ?? 0;
  const generationsLimit = profile?.generations_limit ?? 3;
  const usagePercent = Math.min((generationsUsed / generationsLimit) * 100, 100);
  const tier = (profile?.subscription_tier ?? "free") as string;

  const displayName = profile?.full_name ?? user?.email?.split("@")[0] ?? "User";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and subscription</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-5">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={profile?.avatar_url ?? undefined} />
                      <AvatarFallback className="text-lg bg-violet-500/20 text-violet-400">
                        {loading ? "…" : initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" size="sm" type="button" disabled>Upload photo</Button>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 2MB</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={user?.email ?? ""}
                        disabled
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Email changes require re-authentication.</p>
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    loading={saving}
                    disabled={loading || saving}
                    className="w-full sm:w-auto"
                  >
                    {saved ? "Saved!" : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Security */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Password</p>
                    <p className="text-xs text-muted-foreground">Managed via Supabase Auth</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>Change Password</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Two-factor authentication</p>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>Enable 2FA</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Danger zone */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible and destructive actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Delete account</p>
                    <p className="text-xs text-muted-foreground">Permanently remove your account and all data</p>
                  </div>
                  <Button variant="destructive" size="sm" disabled>Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Subscription card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4" />
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current plan</span>
                  <Badge variant={tier === "free" ? "outline" : "violet"} className="capitalize">
                    {loading ? "…" : tier}
                  </Badge>
                </div>

                {tier === "free" && (
                  <Button variant="gradient" size="sm" className="w-full" asChild>
                    <a href="/pricing">Upgrade to Pro</a>
                  </Button>
                )}

                {tier !== "free" && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Billing</span>
                      <span>Managed via Stripe</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full gap-2" disabled>
                      <ExternalLink className="h-3.5 w-3.5" />
                      Manage Billing
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Usage card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="h-4 w-4" />
                  Monthly Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Generations</span>
                    <span className="text-sm font-semibold">
                      {loading ? "…" : `${generationsUsed} / ${generationsLimit}`}
                    </span>
                  </div>
                  <Progress value={usagePercent} className="h-2" />
                  {usagePercent >= 80 && !loading && (
                    <p className="text-xs text-amber-400 mt-2">
                      You&apos;re almost at your limit. Upgrade for more generations.
                    </p>
                  )}
                </div>

                <Separator />

                <div className="text-xs text-muted-foreground">
                  Resets monthly. Upgrade for unlimited access.
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
