import { useEffect } from "react";
import {
  Palette, Sparkles, Bell, BarChart3, Shield, Download, Languages, Loader2,
} from "lucide-react";

import AppShell, { NavButton } from "../layout/AppShell";

import useSettings from "../hooks/useSettings";
import useTheme from "../hooks/useTheme";
import { downloadExport } from "../services/settingsService";
import { Section, Row, Toggle, SegmentedControl, Select, SoonBadge, SavedTick } from "../features/settings/controls";
import ProfileCard from "../features/settings/ProfileCard";
import DevicesSection from "../features/settings/DevicesSection";
import DangerZone from "../features/settings/DangerZone";

const Settings = () => {
  const { settings, isLoading, isError, update, isSaving } = useSettings();
  const { preference, setPreference } = useTheme();

  // The server owns the theme preference; keep the local ThemeContext in step
  // so the choice follows the user across devices.
  useEffect(() => {
    if (settings?.theme && settings.theme !== preference) setPreference(settings.theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.theme]);

  const setTheme = (value) => {
    setPreference(value);        // apply instantly
    update({ theme: value });    // persist
  };

  if (isLoading) {
    return (
      <Shell saving={false}>
        <div className="grid gap-4 xl:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-[var(--surface-subtle)]" />
          ))}
        </div>
      </Shell>
    );
  }

  if (isError || !settings) {
    return (
      <Shell saving={false}>
        <p className="rounded-xl bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
          Couldn't load your settings. Please refresh.
        </p>
      </Shell>
    );
  }

  const { ai, notifications, analysis, privacy } = settings;

  return (
    <Shell saving={isSaving}>
      <ProfileCard />

      {/*
       * Two balanced columns from xl up.
       *
       * Deliberately two flex COLUMNS rather than a CSS grid: grid aligns row
       * heights, so a one-row card beside a five-row card leaves an obvious gap.
       * Independent columns let each card sit directly under the previous one,
       * and the sections are split so both columns end at a similar height.
       */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">

      <Section icon={<Palette size={16} className="text-[var(--accent)]" />} title="Appearance"
               description="Choose how Reflect AI looks. 'System' follows your device setting.">
        <Row label="Theme" hint="Applies immediately and syncs to your account.">
          <SegmentedControl
            value={preference}
            onChange={setTheme}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "system", label: "System" },
            ]}
          />
        </Row>
      </Section>

      <Section icon={<Sparkles size={16} className="text-[var(--accent)]" />} title="AI Preferences"
               description="These genuinely change how your companion responds — they're written into every prompt.">
        <Row label="Tone" hint="How the AI speaks to you.">
          <SegmentedControl
            value={ai.tone}
            onChange={(v) => update({ ai: { tone: v } })}
            options={[
              { value: "warm", label: "Warm" },
              { value: "direct", label: "Direct" },
              { value: "gentle", label: "Gentle" },
            ]}
          />
        </Row>
        <Row label="Reply length" hint="How much the AI writes back.">
          <SegmentedControl
            value={ai.replyLength}
            onChange={(v) => update({ ai: { replyLength: v } })}
            options={[
              { value: "short", label: "Short" },
              { value: "medium", label: "Medium" },
              { value: "long", label: "Long" },
            ]}
          />
        </Row>
        <Row label="Ask follow-up questions" hint="When off, the AI reflects without prompting you further.">
          <Toggle checked={ai.followUpQuestions} onChange={(v) => update({ ai: { followUpQuestions: v } })} />
        </Row>
        <Row label="Long-term memory" hint="Lets the AI remember your journey across conversations. Off means each chat starts fresh.">
          <Toggle checked={ai.memoryEnabled} onChange={(v) => update({ ai: { memoryEnabled: v } })} />
        </Row>
        <Row label="Reference past entries" hint="Allows the AI to bring up things you wrote before.">
          <Toggle checked={ai.referencePastEntries} onChange={(v) => update({ ai: { referencePastEntries: v } })} />
        </Row>
      </Section>

      <Section icon={<BarChart3 size={16} className="text-[var(--accent)]" />} title="Analysis Preferences"
               description="What Reflect AI tracks and looks for in your entries.">
        <Row label="Track stress levels">
          <Toggle checked={analysis.trackStress} onChange={(v) => update({ analysis: { trackStress: v } })} />
        </Row>
        <Row label="Track energy levels">
          <Toggle checked={analysis.trackEnergy} onChange={(v) => update({ analysis: { trackEnergy: v } })} />
        </Row>
        <Row label="Detect patterns" hint="Trends, recurring emotions and gentle burnout check-ins.">
          <Toggle checked={analysis.detectPatterns} onChange={(v) => update({ analysis: { detectPatterns: v } })} />
        </Row>
      </Section>

        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">

      <Section icon={<Bell size={16} className="text-[var(--accent)]" />} title="Notifications"
               description="Preferences are saved now; delivery needs the scheduler that arrives with deployment.">
        <Row label="Daily reminder" badge={<SoonBadge />}>
          <Toggle checked={notifications.dailyReminder} onChange={(v) => update({ notifications: { dailyReminder: v } })} />
        </Row>
        <Row label="Reminder time" badge={<SoonBadge />}>
          <input
            type="time"
            value={notifications.reminderTime}
            onChange={(e) => update({ notifications: { reminderTime: e.target.value } })}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-card)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
        </Row>
        <Row label="Weekly summary" badge={<SoonBadge />}>
          <Toggle checked={notifications.weeklySummary} onChange={(v) => update({ notifications: { weeklySummary: v } })} />
        </Row>
        <Row label="Achievement alerts" badge={<SoonBadge />}>
          <Toggle checked={notifications.achievementAlerts} onChange={(v) => update({ notifications: { achievementAlerts: v } })} />
        </Row>
      </Section>

      <Section icon={<Shield size={16} className="text-[var(--accent)]" />} title="Privacy & Security"
               description="Your journal is private to your account. Nothing is shared without your explicit choice.">
        <Row label="Store conversation history"
             hint="Off means only your entries are kept, not the full back-and-forth.">
          <Toggle checked={privacy.storeConversationHistory}
                  onChange={(v) => update({ privacy: { storeConversationHistory: v } })} />
        </Row>
        <Row label="Contribute anonymous insights" badge={<SoonBadge />}
             hint="Opt in to share fully anonymised, aggregated trends. Off by default.">
          <Toggle checked={privacy.allowAnonymousInsights}
                  onChange={(v) => update({ privacy: { allowAnonymousInsights: v } })} />
        </Row>
      </Section>

      <Section icon={<Languages size={16} className="text-[var(--accent)]" />} title="Language"
               description="Interface translation is not built yet — this saves your choice for when it is.">
        <Row label="Preferred language" badge={<SoonBadge />}>
          <Select
            value={settings.language}
            onChange={(v) => update({ language: v })}
            options={[
              { value: "en", label: "English" },
              { value: "hi", label: "हिन्दी" },
              { value: "es", label: "Español" },
              { value: "fr", label: "Français" },
              { value: "de", label: "Deutsch" },
            ]}
          />
        </Row>
      </Section>

      <Section icon={<Download size={16} className="text-[var(--accent)]" />} title="Export Your Journal"
               description="Download everything we hold: entries, conversations, insights, summaries and achievements.">
        <button
          onClick={downloadExport}
          className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-fg)] transition hover:bg-[var(--accent-hover)]"
        >
          Download JSON export
        </button>
        <p className="mt-2 text-xs text-[var(--text-faint)]">
          For a spreadsheet-friendly CSV, use Export on the Trend Analysis page.
        </p>
      </Section>

        </div>
      </div>

      <DevicesSection />
      <DangerZone />

      <p className="pb-4 text-center text-xs leading-relaxed text-[var(--text-faint)]">
        Reflect AI offers supportive reflection and is not a substitute for a licensed
        mental-health professional.
      </p>
    </Shell>
  );
};

const Shell = ({ children, saving }) => (
  <AppShell
    header={({ openNav }) => (
      <header className="flex shrink-0 items-center gap-2 border-b border-[var(--border)] px-4 py-3 lg:px-6 xl:px-8">
        <NavButton onClick={openNav} />
        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold">Settings</h1>
        {saving && (
          <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Loader2 size={13} className="animate-spin" /> Saving…
          </span>
        )}
      </header>
    )}
  >
    <main className="flex-1 overflow-y-auto px-4 py-5 lg:px-6 xl:px-8">
      <div className="mx-auto w-full max-w-[1400px] space-y-4">{children}</div>
    </main>
  </AppShell>
);

export default Settings;
