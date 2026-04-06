"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface AnalyticsData {
  summary: {
    totalViews: number;
    todayViews: number;
    weekViews: number;
    monthViews: number;
    uniqueSessionsToday: number;
    uniqueSessionsWeek: number;
    uniqueSessionsMonth: number;
  };
  daily: { date: string; count: number }[];
  topPages: { path: string; count: number }[];
  topReferrers: { host: string | null; count: number }[];
  topCountries: { country: string | null; countryCode: string | null; count: number }[];
  topCities: { city: string | null; country: string | null; count: number }[];
  devices: { device: string | null; count: number }[];
  browsers: { browser: string | null; count: number }[];
  os: { os: string | null; count: number }[];
  utmSources: { source: string | null; count: number }[];
  topPaths24h: { path: string; count: number }[];
}

const COLORS = ["#7BC142", "#2891FF", "#F59E0B", "#EF4444", "#A855F7", "#10B981", "#EC4899"];

function flagEmoji(code: string | null): string {
  if (!code || code.length !== 2) return "🌐";
  const A = 0x1f1e6;
  const a = "A".charCodeAt(0);
  return String.fromCodePoint(A + code.toUpperCase().charCodeAt(0) - a, A + code.toUpperCase().charCodeAt(1) - a);
}

export default function AnalyticsClient() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);
    fetch(`/api/admin/analytics?days=${days}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setErr(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-text-muted">Loading analytics…</div>
      </div>
    );
  }

  if (err || !data) {
    return (
      <div className="p-6">
        <div className="text-red-400">Error: {err || "No data"}</div>
      </div>
    );
  }

  const maxDaily = Math.max(...data.daily.map((d) => d.count), 1);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Site Analytics</h1>
          <p className="text-sm text-text-muted mt-1">
            Traffic, sources, and visitor breakdown for edwartens.co.uk
          </p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-sm rounded-md border ${
                days === d
                  ? "bg-neon-green/10 border-neon-green/40 text-neon-green"
                  : "border-white/10 text-text-muted hover:text-white"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Page Views Today" value={data.summary.todayViews} accent="#7BC142" />
        <StatCard label="Unique Visitors Today" value={data.summary.uniqueSessionsToday} accent="#2891FF" />
        <StatCard label="7-Day Visitors" value={data.summary.uniqueSessionsWeek} accent="#A855F7" />
        <StatCard label="30-Day Visitors" value={data.summary.uniqueSessionsMonth} accent="#F59E0B" />
      </div>

      {/* Daily traffic chart */}
      <div className="rounded-lg border border-white/[0.06] bg-dark-secondary p-4">
        <h2 className="text-sm font-semibold text-white mb-3">
          Page views — last {days} days ({data.summary.totalViews.toLocaleString()} total)
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis
                dataKey="date"
                stroke="#888"
                fontSize={11}
                tickFormatter={(v) => v.slice(5)}
              />
              <YAxis stroke="#888" fontSize={11} allowDecimals={false} domain={[0, Math.ceil(maxDaily * 1.1)]} />
              <Tooltip
                contentStyle={{
                  background: "#0F1115",
                  border: "1px solid #ffffff20",
                  borderRadius: 6,
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="count" stroke="#7BC142" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-column: Countries + Referrers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Top Countries">
          {data.topCountries.length === 0 ? (
            <Empty />
          ) : (
            <ul className="space-y-2">
              {data.topCountries.map((c) => (
                <ListRow
                  key={(c.countryCode || "") + (c.country || "")}
                  left={
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{flagEmoji(c.countryCode)}</span>
                      <span className="text-sm text-white">{c.country}</span>
                    </span>
                  }
                  value={c.count}
                  max={data.topCountries[0].count}
                />
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Top Referrers">
          {data.topReferrers.length === 0 ? (
            <Empty hint="Most visitors are direct/organic — referrer data appears when someone clicks a link from another site." />
          ) : (
            <ul className="space-y-2">
              {data.topReferrers.map((r) => (
                <ListRow
                  key={r.host || ""}
                  left={<span className="text-sm text-white truncate">{r.host}</span>}
                  value={r.count}
                  max={data.topReferrers[0].count}
                />
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Top Pages + Cities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Top Pages">
          <ul className="space-y-2">
            {data.topPages.map((p) => (
              <ListRow
                key={p.path}
                left={
                  <span className="text-sm text-white truncate font-mono text-xs" title={p.path}>
                    {p.path}
                  </span>
                }
                value={p.count}
                max={data.topPages[0]?.count || 1}
              />
            ))}
          </ul>
        </Panel>

        <Panel title="Top Cities">
          {data.topCities.length === 0 ? (
            <Empty />
          ) : (
            <ul className="space-y-2">
              {data.topCities.map((c, i) => (
                <ListRow
                  key={i}
                  left={
                    <span className="text-sm text-white">
                      {c.city}
                      <span className="text-text-muted ml-1">· {c.country}</span>
                    </span>
                  }
                  value={c.count}
                  max={data.topCities[0].count}
                />
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Device / Browser / OS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Panel title="Devices">
          <DonutChart items={data.devices.map((d) => ({ name: d.device || "Unknown", count: d.count }))} />
        </Panel>
        <Panel title="Browsers">
          <DonutChart items={data.browsers.map((b) => ({ name: b.browser || "Unknown", count: b.count }))} />
        </Panel>
        <Panel title="Operating Systems">
          <DonutChart items={data.os.map((o) => ({ name: o.os || "Unknown", count: o.count }))} />
        </Panel>
      </div>

      {/* UTM sources + Trending 24h */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Campaign Sources (UTM)">
          {data.utmSources.length === 0 ? (
            <Empty hint="No UTM-tagged links tracked yet. Tag your ad/email links with ?utm_source=…" />
          ) : (
            <ul className="space-y-2">
              {data.utmSources.map((u) => (
                <ListRow
                  key={u.source || ""}
                  left={<span className="text-sm text-white">{u.source}</span>}
                  value={u.count}
                  max={data.utmSources[0].count}
                />
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Trending (last 24h)">
          {data.topPaths24h.length === 0 ? (
            <Empty />
          ) : (
            <ul className="space-y-2">
              {data.topPaths24h.map((p) => (
                <ListRow
                  key={p.path}
                  left={
                    <span className="text-sm text-white truncate font-mono text-xs" title={p.path}>
                      {p.path}
                    </span>
                  }
                  value={p.count}
                  max={data.topPaths24h[0].count}
                />
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-dark-secondary p-4">
      <div className="text-xs text-text-muted uppercase tracking-wider">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-bold" style={{ color: accent }}>
          {value.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-dark-secondary p-4">
      <h2 className="text-sm font-semibold text-white mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Empty({ hint }: { hint?: string }) {
  return (
    <div className="text-sm text-text-muted py-4">
      No data yet.{hint ? ` ${hint}` : ""}
    </div>
  );
}

function ListRow({
  left,
  value,
  max,
}: {
  left: React.ReactNode;
  value: number;
  max: number;
}) {
  const pct = Math.max(2, (value / max) * 100);
  return (
    <li>
      <div className="flex items-center justify-between gap-3 mb-1">
        <div className="min-w-0 flex-1 truncate">{left}</div>
        <span className="text-sm font-medium text-white tabular-nums">
          {value.toLocaleString()}
        </span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#7BC142] to-[#2891FF] rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </li>
  );
}

function DonutChart({ items }: { items: { name: string; count: number }[] }) {
  if (items.length === 0) return <Empty />;
  const total = items.reduce((a, b) => a + b.count, 0);
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={items}
            dataKey="count"
            nameKey="name"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={2}
          >
            {items.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#0F1115",
              border: "1px solid #ffffff20",
              borderRadius: 6,
              fontSize: 12,
            }}
            formatter={(v, n) => {
              const num = typeof v === "number" ? v : Number(v);
              return [`${num.toLocaleString()} (${((num / total) * 100).toFixed(0)}%)`, String(n)];
            }}
          />
          <Legend
            verticalAlign="bottom"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, color: "#999" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
