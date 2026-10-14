import React, { useState, useEffect } from 'react';
import {
  Users,
  Eye,
  Calendar,
  BarChart3,
  Download,
  Trash2,
  Lock,
  LogOut,
  RefreshCw,
  Sun,
  Moon,
  ArrowLeft,
  PieChart,
} from 'lucide-react';

export default function AdminVisitorsDashboard({ isDark, onToggleDark }) {
  const [adminKey, setAdminKey] = useState(() => {
    try {
      return sessionStorage.getItem('kesav_admin_key') || '';
    } catch {
      return '';
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Telemetry data
  const [metrics, setMetrics] = useState({ total: 0, unique: 0, today: 0 });
  const [last7Days, setLast7Days] = useState([]);
  const [purposeBreakdown, setPurposeBreakdown] = useState({});
  const [visitors, setVisitors] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Set noindex, nofollow for this route
  useEffect(() => {
    let robotsMeta = document.querySelector('meta[name="robots"]');
    const previousContent = robotsMeta?.getAttribute('content') || null;

    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex, nofollow');

    return () => {
      if (previousContent) {
        robotsMeta.setAttribute('content', previousContent);
      } else {
        robotsMeta.remove();
      }
    };
  }, []);

  // Fetch telemetry if key exists
  const fetchDashboardData = async (key, page = 1) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/admin-visitors?page=${page}&limit=50`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${key}`,
        },
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        setErrorMsg('Unauthorized: Incorrect admin key.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.message || 'Failed to load telemetry data');
        setLoading(false);
        return;
      }

      const data = await res.json();
      setMetrics(data.metrics || { total: 0, unique: 0, today: 0 });
      setLast7Days(data.last7Days || []);
      setPurposeBreakdown(data.purposeBreakdown || {});
      setVisitors(data.visitors || []);
      setPagination(data.pagination || { page: 1, limit: 50, total: 0, totalPages: 1 });
      setIsAuthenticated(true);

      try {
        sessionStorage.setItem('kesav_admin_key', key);
      } catch {
        // ignore
      }
    } catch (err) {
      setErrorMsg('Network error while fetching dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminKey) {
      fetchDashboardData(adminKey, 1);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    setAdminKey(keyInput.trim());
    fetchDashboardData(keyInput.trim(), 1);
  };

  const handleLogout = () => {
    setAdminKey('');
    setIsAuthenticated(false);
    setKeyInput('');
    try {
      sessionStorage.removeItem('kesav_admin_key');
    } catch {
      // ignore
    }
  };

  const handleDeleteVisitor = async (visitorId) => {
    if (!window.confirm(`Delete telemetry record for visitor ${visitorId.slice(0, 8)}...?`)) {
      return;
    }

    setActionLoadingId(visitorId);
    try {
      const res = await fetch(`/api/admin-visitors?visitorId=${visitorId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminKey}`,
        },
      });

      if (res.ok) {
        setVisitors((prev) => prev.filter((v) => v.visitorId !== visitorId));
        setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      } else {
        alert('Failed to delete visitor');
      }
    } catch {
      alert('Network error while deleting visitor');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleExportCSV = () => {
    if (!visitors || visitors.length === 0) {
      alert('No visitor data to export.');
      return;
    }

    const headers = ['Visitor ID', 'Name', 'Purpose', 'Country', 'Device', 'First Seen', 'Last Seen', 'Consent'];
    const rows = visitors.map((v) => [
      `"${v.visitorId}"`,
      `"${(v.name || 'Anonymous').replace(/"/g, '""')}"`,
      `"${(v.purpose || 'Skipped').replace(/"/g, '""')}"`,
      `"${v.country}"`,
      `"${v.device}"`,
      `"${v.firstSeen}"`,
      `"${v.lastSeen}"`,
      `"${v.consent ? 'Yes' : 'No'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kesav-visitors-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const max7DayCount = Math.max(1, ...last7Days.map((d) => d.count));

  // 1. Password / Key Auth Form
  if (!isAuthenticated) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 transition-colors font-body ${
          isDark ? 'bg-[#0E0D0C] text-[#FFF8EC]' : 'bg-[#FFF8EC] text-[#111111]'
        }`}
      >
        <div
          className={`w-full max-w-md p-6 sm:p-8 rounded-xl border-3 ${
            isDark
              ? 'bg-[#181715] border-[#FFD60A] shadow-[6px_6px_0px_#FFD60A]'
              : 'bg-white border-[#111111] shadow-[6px_6px_0px_#111111]'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Site</span>
            </a>
            {onToggleDark && (
              <button
                onClick={onToggleDark}
                className="p-1.5 rounded border border-current text-xs font-mono cursor-pointer"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
          </div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#FFD60A] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] mb-3">
              <Lock className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h1 className="font-headline text-3xl uppercase tracking-tight">
              Admin Telemetry
            </h1>
            <p className="font-mono text-xs opacity-75 mt-1">
              Private access requires ADMIN_KEY authorization
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-lg bg-pink/20 border-2 border-pink text-pink font-mono text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="admin-key-input"
                className="block font-mono text-xs font-bold uppercase tracking-wider mb-1"
              >
                Enter Admin Key
              </label>
              <input
                id="admin-key-input"
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Secret key"
                required
                className={`w-full px-3.5 py-2.5 rounded-lg font-mono text-sm border-2 transition-colors focus:outline-none ${
                  isDark
                    ? 'bg-[#0E0D0C] text-[#FFF8EC] border-[#3E3A33] focus:border-[#FFD60A]'
                    : 'bg-[#FFF8EC] text-[#111111] border-[#111111] focus:border-[#2F5BFF]'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-mono text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#FFD60A] text-[#111111] border-[#FFD60A] hover:bg-yellow-400 shadow-[3px_3px_0px_#FFFFFF]'
                  : 'bg-[#2F5BFF] text-white border-[#111111] hover:bg-blue-600 shadow-[3px_3px_0px_#111111]'
              }`}
            >
              {loading ? 'Authenticating...' : 'Unlock Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Unlocked Dashboard View
  return (
    <div
      className={`min-h-screen p-4 sm:p-6 lg:p-8 font-body transition-colors ${
        isDark ? 'bg-[#0E0D0C] text-[#FFF8EC]' : 'bg-[#FFF8EC] text-[#111111]'
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Navbar */}
        <header
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border-3 ${
            isDark
              ? 'bg-[#181715] border-[#FFD60A] shadow-[4px_4px_0px_#FFD60A]'
              : 'bg-white border-[#111111] shadow-[4px_4px_0px_#111111]'
          }`}
        >
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="p-2 rounded-lg border-2 border-current hover:bg-neutral-500/10 cursor-pointer"
              title="Return to public portfolio"
            >
              <ArrowLeft className="w-5 h-5" />
            </a>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-mono text-[10px] font-black uppercase tracking-wider bg-[#FF3D81] text-[#111111] border border-[#111111]">
                  ADMIN PORTAL
                </span>
                <span className="font-mono text-xs opacity-75">Private Telemetry</span>
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl uppercase tracking-tight">
                Visitor Insights
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchDashboardData(adminKey, pagination.page)}
              disabled={loading}
              className="p-2 rounded-lg border-2 border-current font-mono text-xs font-bold flex items-center gap-1.5 hover:bg-neutral-500/10 cursor-pointer"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {onToggleDark && (
              <button
                onClick={onToggleDark}
                className="p-2 rounded-lg border-2 border-current hover:bg-neutral-500/10 cursor-pointer"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-lg bg-mint text-[#111111] border-2 border-[#111111] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_#111111] hover:bg-emerald-400 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-pink text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-rose-400 cursor-pointer"
              title="Lock & Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            className={`p-5 rounded-xl border-3 ${
              isDark
                ? 'bg-[#181715] border-[#FFD60A] shadow-[4px_4px_0px_#FFD60A]'
                : 'bg-white border-[#111111] shadow-[4px_4px_0px_#111111]'
            }`}
          >
            <div className="flex items-center justify-between text-yellow">
              <span className="font-mono text-xs font-bold uppercase tracking-wider">
                Total Visits
              </span>
              <Eye className="w-5 h-5 text-current" />
            </div>
            <p className="font-headline text-4xl sm:text-5xl mt-2 tracking-tight">
              {metrics.total.toLocaleString()}
            </p>
            <p className="font-mono text-xs opacity-75 mt-1">Cumulative views</p>
          </div>

          <div
            className={`p-5 rounded-xl border-3 ${
              isDark
                ? 'bg-[#181715] border-[#3DDC97] shadow-[4px_4px_0px_#3DDC97]'
                : 'bg-white border-[#111111] shadow-[4px_4px_0px_#3DDC97]'
            }`}
          >
            <div className="flex items-center justify-between text-mint">
              <span className="font-mono text-xs font-bold uppercase tracking-wider">
                Unique Visitors
              </span>
              <Users className="w-5 h-5 text-current" />
            </div>
            <p className="font-headline text-4xl sm:text-5xl mt-2 tracking-tight">
              {metrics.unique.toLocaleString()}
            </p>
            <p className="font-mono text-xs opacity-75 mt-1">Distinct client devices</p>
          </div>

          <div
            className={`p-5 rounded-xl border-3 ${
              isDark
                ? 'bg-[#181715] border-[#FF3D81] shadow-[4px_4px_0px_#FF3D81]'
                : 'bg-white border-[#111111] shadow-[4px_4px_0px_#FF3D81]'
            }`}
          >
            <div className="flex items-center justify-between text-pink">
              <span className="font-mono text-xs font-bold uppercase tracking-wider">
                Visits Today
              </span>
              <Calendar className="w-5 h-5 text-current" />
            </div>
            <p className="font-headline text-4xl sm:text-5xl mt-2 tracking-tight">
              {metrics.today.toLocaleString()}
            </p>
            <p className="font-mono text-xs opacity-75 mt-1">Recorded past 24 hrs</p>
          </div>
        </div>

        {/* Charts Grid: 7-Day Bar Chart & Purpose Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Last 7 Days Bar Chart (7 cols) */}
          <div
            className={`lg:col-span-7 p-6 rounded-xl border-3 ${
              isDark
                ? 'bg-[#181715] border-[#3E3A33] shadow-[4px_4px_0px_#FFD60A]'
                : 'bg-white border-[#111111] shadow-[4px_4px_0px_#111111]'
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-yellow" />
              <h2 className="font-headline text-xl uppercase tracking-tight">
                Last 7 Days Activity
              </h2>
            </div>

            <div className="h-44 flex items-end justify-between gap-2 pt-4 pb-2 border-b-2 border-current/20">
              {last7Days.map((d) => {
                const heightPercent = Math.max(8, Math.round((d.count / max7DayCount) * 100));
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="font-mono text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.count}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[40px] rounded-t border-2 border-current transition-all ${
                        d.count > 0 ? 'bg-[#FFD60A]' : 'bg-transparent opacity-20'
                      }`}
                    />
                    <span className="font-mono text-[10px] uppercase font-bold opacity-75 mt-1">
                      {d.date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Purpose Breakdown (5 cols) */}
          <div
            className={`lg:col-span-5 p-6 rounded-xl border-3 ${
              isDark
                ? 'bg-[#181715] border-[#3E3A33] shadow-[4px_4px_0px_#3DDC97]'
                : 'bg-white border-[#111111] shadow-[4px_4px_0px_#111111]'
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-mint" />
              <h2 className="font-headline text-xl uppercase tracking-tight">
                Purpose Breakdown
              </h2>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {Object.entries(purposeBreakdown).map(([purposeName, count]) => {
                const totalPurposes = Object.values(purposeBreakdown).reduce((a, b) => a + b, 0) || 1;
                const pct = Math.round((count / totalPurposes) * 100);
                return (
                  <div key={purposeName} className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>{purposeName}</span>
                      <span>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-3 rounded bg-current/10 border border-current/30 overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-mint transition-all"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Visitors Table */}
        <div
          className={`rounded-xl border-3 overflow-hidden ${
            isDark
              ? 'bg-[#181715] border-[#3E3A33] shadow-[4px_4px_0px_#FFD60A]'
              : 'bg-white border-[#111111] shadow-[4px_4px_0px_#111111]'
          }`}
        >
          <div className="p-5 border-b-2 border-current/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-headline text-xl uppercase tracking-tight">
                Visitor Records ({pagination.total})
              </h2>
              <p className="font-mono text-xs opacity-75">
                Newest first &bull; 50 per page &bull; Expirable after 12 months
              </p>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center gap-2 font-mono text-xs font-bold">
                <button
                  onClick={() => fetchDashboardData(adminKey, Math.max(1, pagination.page - 1))}
                  disabled={pagination.page <= 1}
                  className="px-2.5 py-1 rounded border-2 border-current disabled:opacity-40 cursor-pointer"
                >
                  &larr; Prev
                </button>
                <span>
                  Page {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    fetchDashboardData(
                      adminKey,
                      Math.min(pagination.totalPages, pagination.page + 1)
                    )
                  }
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-2.5 py-1 rounded border-2 border-current disabled:opacity-40 cursor-pointer"
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-current/20 bg-current/5 uppercase tracking-wider font-bold">
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Purpose</th>
                  <th className="p-3.5">Country</th>
                  <th className="p-3.5">Device</th>
                  <th className="p-3.5">First Seen</th>
                  <th className="p-3.5">Last Seen</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-current/10">
                {visitors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center opacity-60">
                      No visitor records recorded yet.
                    </td>
                  </tr>
                ) : (
                  visitors.map((v) => (
                    <tr key={v.visitorId} className="hover:bg-current/5 transition-colors">
                      <td className="p-3.5 font-bold">
                        {v.name ? (
                          <span className="text-yellow">{v.name}</span>
                        ) : (
                          <span className="opacity-50 italic">(Anonymous)</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-bold uppercase text-[10px] border ${
                            v.purpose === 'Hiring a designer'
                              ? 'bg-mint/20 text-mint border-mint'
                              : v.purpose === 'Packaging project'
                              ? 'bg-pink/20 text-pink border-pink'
                              : v.purpose === 'Need an app or SaaS'
                              ? 'bg-yellow/20 text-yellow border-yellow'
                              : 'bg-neutral-500/20 opacity-70 border-current/30'
                          }`}
                        >
                          {v.purpose || 'Skipped'}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold uppercase">{v.country}</td>
                      <td className="p-3.5 capitalize">{v.device}</td>
                      <td className="p-3.5 opacity-80">
                        {v.firstSeen ? new Date(v.firstSeen).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-3.5 opacity-80">
                        {v.lastSeen ? new Date(v.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDeleteVisitor(v.visitorId)}
                          disabled={actionLoadingId === v.visitorId}
                          className="p-1.5 rounded text-pink hover:bg-pink/20 transition-colors cursor-pointer"
                          title="Delete visitor record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
