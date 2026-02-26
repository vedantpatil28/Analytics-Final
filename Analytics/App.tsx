import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'animate.css';
import './App.css';
import {
    PieChart, Pie, Cell,
    BarChart, Bar,
    LineChart, Line,
    XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import * as API from './restapi';
import type { IReport, GraphResponseDTO } from './interfaces';

// ── Types ──────────────────────────────────────────────────────────────────
type ChartDataPoint = { name: string; value: number };
type ChartType = 'pie' | 'bar' | 'line';

interface SelectedChart {
    type: ChartType;
    data: ChartDataPoint[];
    label: string;
}

interface Toast {
    message: string;
    type: 'success' | 'error' | 'info';
    visible: boolean;
}

// ── Color palette aligned with design tokens ───────────────────────────────
const COLORS = [
    '#355872', '#7aaace', '#9cd5ff', '#27ae60',
    '#e67e22', '#6f42c1', '#e74c3c', '#f4a923'
];

// ── Helper: convert API DTO → Recharts-compatible array ───────────────────
const toChartData = (dto: GraphResponseDTO<string, number>): ChartDataPoint[] =>
    dto.data.map(d => ({ name: d.x, value: d.y }));

// ── Recharts custom tooltip ────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
        return (
            <div style={{
                background: '#fff',
                border: '1px solid rgba(122,170,206,0.25)',
                borderRadius: 10,
                padding: '8px 14px',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#355872',
                boxShadow: '0 4px 12px rgba(53,88,114,0.12)'
            }}>
                <div style={{ color: '#8a9bb0', marginBottom: 2 }}>{label}</div>
                <div>{payload[0].name ?? 'Value'}: <strong>{payload[0].value}</strong></div>
            </div>
        );
    }
    return null;
};

// ── Main Component ─────────────────────────────────────────────────────────
const AnalyticsApp: React.FC = () => {
    const [view, setView] = useState<'dashboard' | 'reports'>('dashboard');
    const [reports, setReports] = useState<IReport[]>([]);
    const [selectedChart, setSelectedChart] = useState<SelectedChart | null>(null);
    const [navOpen, setNavOpen] = useState(false);

    // Form state
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentReport, setCurrentReport] = useState<IReport>({ scope: '', metrics: '' });

    // Chart data
    const [partData, setPartData] = useState<ChartDataPoint[]>([]);
    const [deptData, setDeptData] = useState<ChartDataPoint[]>([]);
    const [trendData, setTrendData] = useState<ChartDataPoint[]>([]);
    const [catData, setCatData] = useState<ChartDataPoint[]>([]);

    // UI state
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<Toast>({ message: '', type: 'info', visible: false });

    useEffect(() => {
        fetchAnalytics();
        fetchReports();
    }, []);

    // ── Toast helper ────────────────────────────────────────────────────────
    const showToast = (message: string, type: Toast['type']) => {
        setToast({ message, type, visible: true });
        setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500);
    };

    // ── Data fetching ───────────────────────────────────────────────────────
    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const [p, d, t, c] = await Promise.all([
                API.getParticipationStatus(),
                API.getDeptParticipation(),
                API.getMonthlyTrend(),
                API.getCategoryParticipation(),
            ]);
            setPartData(toChartData(p.data));
            setDeptData(toChartData(d.data));
            setTrendData(toChartData(t.data));
            setCatData(toChartData(c.data));
        } catch {
            showToast('Failed to load analytics data. Please check your token.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchReports = () =>
        API.getAllReports()
            .then(res => setReports(res.data))
            .catch(() => showToast('Failed to load reports.', 'error'));

    // ── Report CRUD ─────────────────────────────────────────────────────────
    const handleReportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editMode && currentReport.reportId) {
                await API.updateReport(currentReport.reportId, currentReport);
                showToast('Report updated successfully!', 'success');
            } else {
                await API.createReport(currentReport);
                showToast('Report created successfully!', 'success');
            }
            setShowModal(false);
            fetchReports();
        } catch {
            showToast('Failed to save report.', 'error');
        }
    };

    const deleteReport = async (id: number) => {
        if (!window.confirm('Delete this report? This action cannot be undone.')) return;
        try {
            await API.deleteReport(id);
            showToast('Report deleted.', 'info');
            fetchReports();
        } catch {
            showToast('Failed to delete report.', 'error');
        }
    };

    const openNewReport = () => {
        setEditMode(false);
        setCurrentReport({ scope: '', metrics: '' });
        setShowModal(true);
    };

    const openEditReport = (r: IReport) => {
        setEditMode(true);
        setCurrentReport(r);
        setShowModal(true);
    };

    // ── Token helper ────────────────────────────────────────────────────────
    const [showTokenModal, setShowTokenModal] = useState(false);
    const [tokenInput, setTokenInput] = useState('');

    const storeToken = () => {
        const existing = localStorage.getItem('JWT-Token') ?? '';
        setTokenInput(existing);
        setShowTokenModal(true);
    };

    const handleTokenSave = () => {
        const t = tokenInput.trim();
        if (!t) { showToast('Please paste a valid JWT token.', 'error'); return; }
        localStorage.setItem('JWT-Token', t);
        setShowTokenModal(false);
        showToast('Token stored! Refreshing data…', 'success');
        fetchAnalytics();
        fetchReports();
    };

    // ── Toast classes ───────────────────────────────────────────────────────
    const toastCls =
        toast.type === 'success' ? 'toast-success'
        : toast.type === 'error' ? 'toast-error'
        : 'toast-info';
    const toastIcon =
        toast.type === 'success' ? 'bi-check-circle-fill'
        : toast.type === 'error' ? 'bi-x-circle-fill'
        : 'bi-info-circle-fill';

    // ── Chart open helper ───────────────────────────────────────────────────
    const openChart = (type: ChartType, data: ChartDataPoint[], label: string) => {
        if (data.length) setSelectedChart({ type, data, label });
    };

    // ── Reusable chart card wrapper ─────────────────────────────────────────
    const ChartCard: React.FC<{
        title: string;
        badgeIcon: string;
        badgeLabel: string;
        type: ChartType;
        data: ChartDataPoint[];
    }> = ({ title, badgeIcon, badgeLabel, type, data }) => (
        <div
            className="prod-card chart-card-clickable"
            onClick={() => openChart(type, data, title)}
        >
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">{title}</h6>
                <span className="program-badge">
                    <i className={`bi ${badgeIcon} me-1`}></i>{badgeLabel}
                </span>
            </div>

            {loading ? (
                <div className="empty-state">
                    <i className="bi bi-arrow-repeat spin" style={{ fontSize: '1.6rem', display: 'block', marginBottom: '0.5rem' }}></i>
                    Loading data…
                </div>
            ) : data.length === 0 ? (
                <div className="empty-state">
                    <i className="bi bi-exclamation-circle" style={{ fontSize: '1.6rem', display: 'block', marginBottom: '0.5rem' }}></i>
                    No data available
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={260}>
                    {type === 'pie' ? (
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={95}
                                label={({ name, percent }) =>
                                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                                }
                                labelLine={false}
                            >
                                {data.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                        </PieChart>
                    ) : type === 'line' ? (
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8a9bb0' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#8a9bb0' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#355872"
                                strokeWidth={2.5}
                                dot={{ fill: '#7aaace', r: 4, strokeWidth: 0 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    ) : (
                        <BarChart data={data} barSize={28}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8a9bb0' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#8a9bb0' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                {data.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    )}
                </ResponsiveContainer>
            )}
        </div>
    );

    // ── Enlarged chart renderer (inside modal) ──────────────────────────────
    const renderEnlargedChart = (chart: SelectedChart) => (
        <ResponsiveContainer width="100%" height={420}>
            {chart.type === 'pie' ? (
                <PieChart>
                    <Pie
                        data={chart.data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={170}
                        label={({ name, value }) => `${name}: ${value}`}
                    >
                        {chart.data.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                </PieChart>
            ) : chart.type === 'line' ? (
                <LineChart data={chart.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#8a9bb0' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#8a9bb0' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#355872"
                        strokeWidth={3}
                        dot={{ fill: '#7aaace', r: 5, strokeWidth: 0 }}
                        activeDot={{ r: 8 }}
                    />
                </LineChart>
            ) : (
                <BarChart data={chart.data} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#8a9bb0' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#8a9bb0' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {chart.data.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            )}
        </ResponsiveContainer>
    );

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <div className="app-wrapper">

            {/* ════════════════ MOBILE TOGGLE ════════════════ */}
            <button className="mobile-nav-toggle" onClick={() => setNavOpen(o => !o)}>
                <i className={`bi ${navOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
            </button>

            {/* Overlay to close nav on mobile */}
            <div
                className={`nav-overlay ${navOpen ? 'nav-open' : ''}`}
                onClick={() => setNavOpen(false)}
            />

            {/* ════════════════ SIDEBAR ════════════════ */}
            <nav className={`modern-nav d-flex flex-column ${navOpen ? 'nav-open' : ''}`}>
                {/* Brand */}
                <div className="nav-brand mb-4">
                    <div className="brand-icon">
                        <i className="bi bi-bar-chart-fill"></i>
                    </div>
                    <span className="brand-name">Wellness Hub</span>
                </div>

                {/* Role badge */}
                <div className="role-badge role-admin mb-3">
                    <i className="bi bi-shield-fill me-2"></i>Admin Panel
                </div>

                {/* Nav items */}
                <button
                    className={`nav-item ${view === 'dashboard' ? 'active' : ''}`}
                    onClick={() => { setView('dashboard'); setNavOpen(false); }}
                >
                    <i className="bi bi-speedometer2"></i> Dashboard
                </button>

                <button
                    className={`nav-item ${view === 'reports' ? 'active' : ''}`}
                    onClick={() => { setView('reports'); setNavOpen(false); }}
                >
                    <i className="bi bi-file-earmark-bar-graph"></i> Reports
                    {reports.length > 0 && (
                        <span className="ms-auto badge-count" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                            {reports.length}
                        </span>
                    )}
                </button>

                <button className="nav-item" onClick={fetchAnalytics}>
                    <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i> Refresh
                </button>

                {/* Token button pinned to bottom */}
                <div className="mt-auto">
                    <div style={{ height: '1px', background: 'var(--border-light)', margin: '1rem 0' }} />
                    <button className="nav-item logout-btn" onClick={storeToken}>
                        <i className="bi bi-key-fill"></i> Store Token
                    </button>
                </div>
            </nav>

            {/* ════════════════ MAIN CONTENT ════════════════ */}
            <div className="main-content">

                {/* ── DASHBOARD VIEW ── */}
                {view === 'dashboard' && (
                    <>
                        {/* Page header */}
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <div className="header-icon">
                                <i className="bi bi-graph-up-arrow"></i>
                            </div>
                            <div>
                                <h1 className="fw-bold mb-0" style={{ letterSpacing: '-0.03em' }}>
                                    Analytics Dashboard
                                </h1>
                                <p className="mb-0" style={{ color: '#8a9bb0', fontSize: '0.9rem' }}>
                                    Wellness program insights &amp; participation overview
                                </p>
                            </div>
                        </div>

                        {/* Stat cards */}
                        <div className="row g-3 mb-5">
                            {[
                                {
                                    icon: 'bi-people-fill',
                                    cls: '',
                                    value: reports.length * 12,
                                    label: 'Total Participation',
                                },
                                {
                                    icon: 'bi-grid-fill',
                                    cls: 'programs',
                                    value: 8,
                                    label: 'Active Programs',
                                },
                                {
                                    icon: 'bi-building',
                                    cls: 'total',
                                    value: 5,
                                    label: 'Departments',
                                },
                                {
                                    icon: 'bi-file-text-fill',
                                    cls: 'closed',
                                    value: reports.length,
                                    label: 'Saved Reports',
                                },
                            ].map((s, i) => (
                                <div className="col-md-3 col-sm-6" key={i}>
                                    <div className="prod-card stat-card text-center">
                                        <div className={`stat-icon ${s.cls} mb-2 mx-auto`}>
                                            <i className={`bi ${s.icon}`}></i>
                                        </div>
                                        <div className="stat-number">{s.value}</div>
                                        <div className="stat-label">{s.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Section title */}
                        <h5 className="fw-bold mb-4" style={{ letterSpacing: '-0.02em' }}>
                            <i className="bi bi-bar-chart-line me-2" style={{ color: 'var(--soft-blue)' }}></i>
                            Visual Insights
                            <span className="ms-2" style={{ fontSize: '0.78rem', color: '#8a9bb0', fontWeight: 500 }}>
                                — click any chart to enlarge
                            </span>
                        </h5>

                        {/* Chart grid */}
                        <div className="row g-4">
                            <div className="col-lg-6">
                                <ChartCard
                                    title="Participation Status"
                                    badgeIcon="bi-pie-chart-fill"
                                    badgeLabel="Pie"
                                    type="pie"
                                    data={partData}
                                />
                            </div>
                            <div className="col-lg-6">
                                <ChartCard
                                    title="Departmental Reach"
                                    badgeIcon="bi-bar-chart-fill"
                                    badgeLabel="Bar"
                                    type="bar"
                                    data={deptData}
                                />
                            </div>
                            <div className="col-lg-6">
                                <ChartCard
                                    title="Monthly Trend"
                                    badgeIcon="bi-graph-up"
                                    badgeLabel="Line"
                                    type="line"
                                    data={trendData}
                                />
                            </div>
                            <div className="col-lg-6">
                                <ChartCard
                                    title="Category Participation"
                                    badgeIcon="bi-bar-chart-steps"
                                    badgeLabel="Bar"
                                    type="bar"
                                    data={catData}
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* ── REPORTS VIEW ── */}
                {view === 'reports' && (
                    <>
                        {/* Page header */}
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <div className="header-icon">
                                <i className="bi bi-file-earmark-bar-graph"></i>
                            </div>
                            <div>
                                <h1 className="fw-bold mb-0" style={{ letterSpacing: '-0.03em' }}>
                                    Management Reports
                                </h1>
                                <p className="mb-0" style={{ color: '#8a9bb0', fontSize: '0.9rem' }}>
                                    Create, view and manage analytics reports
                                </p>
                            </div>
                        </div>

                        <div className="prod-card">
                            {/* Toolbar */}
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <span className="badge-count">
                                    {reports.length} report{reports.length !== 1 ? 's' : ''}
                                </span>
                                <button className="btn-grad" onClick={openNewReport}>
                                    <i className="bi bi-plus-lg"></i> New Report
                                </button>
                            </div>

                            {/* Empty state */}
                            {reports.length === 0 ? (
                                <div className="empty-state">
                                    <i
                                        className="bi bi-file-earmark-x"
                                        style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}
                                    ></i>
                                    No reports yet. Create your first report!
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead>
                                            <tr>
                                                {['ID', 'Metric', 'Scope', 'Date', 'Actions'].map(h => (
                                                    <th
                                                        key={h}
                                                        style={{
                                                            color: '#8a9bb0',
                                                            fontSize: '0.72rem',
                                                            fontWeight: 700,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.06em',
                                                            borderBottom: '2px solid #f0f4f8',
                                                            paddingBottom: '0.75rem',
                                                        }}
                                                    >
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reports.map(r => (
                                                <tr key={r.reportId} className="survey-row">
                                                    <td>
                                                        <span className="badge-count">#{r.reportId}</span>
                                                    </td>
                                                    <td
                                                        className="fw-semibold"
                                                        style={{ fontSize: '0.9rem', maxWidth: 220 }}
                                                    >
                                                        {r.metrics}
                                                    </td>
                                                    <td>
                                                        <span className="program-badge">{r.scope}</span>
                                                    </td>
                                                    <td style={{ color: '#8a9bb0', fontSize: '0.85rem' }}>
                                                        {r.generatedDate ?? '—'}
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-2">
                                                            <button
                                                                className="action-btn view"
                                                                title="Edit"
                                                                onClick={() => openEditReport(r)}
                                                            >
                                                                <i className="bi bi-pencil-fill"></i>
                                                            </button>
                                                            <button
                                                                className="action-btn delete"
                                                                title="Delete"
                                                                onClick={() => deleteReport(r.reportId!)}
                                                            >
                                                                <i className="bi bi-trash-fill"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* ════════════════ ENLARGED CHART MODAL ════════════════ */}
            {selectedChart && (
                <div className="modal-backdrop" onClick={() => setSelectedChart(null)}>
                    <div
                        className="results-modal animate__animated animate__zoomIn"
                        style={{ animationDuration: '0.25s' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="results-modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <div
                                    className="header-icon"
                                    style={{ width: 40, height: 40, fontSize: '1rem', borderRadius: 10 }}
                                >
                                    <i
                                        className={`bi ${
                                            selectedChart.type === 'pie'
                                                ? 'bi-pie-chart-fill'
                                                : selectedChart.type === 'line'
                                                ? 'bi-graph-up'
                                                : 'bi-bar-chart-fill'
                                        }`}
                                    ></i>
                                </div>
                                <h4 className="mb-0 fw-bold">{selectedChart.label}</h4>
                            </div>
                            <button
                                className="btn-icon"
                                onClick={() => setSelectedChart(null)}
                                title="Close"
                            >
                                <i className="bi bi-x-lg" style={{ fontSize: '1rem' }}></i>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="results-modal-body" style={{ height: 480, overflowY: 'visible' }}>
                            {renderEnlargedChart(selectedChart)}
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════ REPORT FORM MODAL ════════════════ */}
            {showModal && (
                <div className="modal-backdrop">
                    <div
                        className="results-modal animate__animated animate__fadeInDown"
                        style={{ maxWidth: 520, animationDuration: '0.25s' }}
                    >
                        {/* Header */}
                        <div className="results-modal-header">
                            <h4 className="mb-0 fw-bold">
                                {editMode ? 'Edit Report' : 'Generate New Report'}
                            </h4>
                            <button className="btn-icon" onClick={() => setShowModal(false)}>
                                <i className="bi bi-x-lg" style={{ fontSize: '1rem' }}></i>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="results-modal-body">
                            <form onSubmit={handleReportSubmit}>
                                <div className="form-group mb-3">
                                    <label>Scope</label>
                                    <input
                                        className="input-field"
                                        value={currentReport.scope}
                                        onChange={e =>
                                            setCurrentReport({ ...currentReport, scope: e.target.value })
                                        }
                                        placeholder="e.g. Q1 2025, Department-wide…"
                                        required
                                    />
                                </div>

                                <div className="form-group mb-4">
                                    <label>Metrics</label>
                                    <textarea
                                        className="input-field"
                                        rows={4}
                                        value={currentReport.metrics}
                                        onChange={e =>
                                            setCurrentReport({ ...currentReport, metrics: e.target.value })
                                        }
                                        placeholder="Describe the metrics to capture…"
                                        required
                                    />
                                </div>

                                <div className="d-flex gap-2 justify-content-end">
                                    <button
                                        type="button"
                                        className="btn btn-light"
                                        style={{ borderRadius: 10 }}
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-grad">
                                        <i className={`bi ${editMode ? 'bi-pencil-fill' : 'bi-plus-lg'}`}></i>
                                        {editMode ? ' Update Report' : ' Create Report'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════ TOKEN INPUT MODAL ════════════════ */}
            {showTokenModal && (
                <div className="modal-backdrop">
                    <div
                        className="results-modal animate__animated animate__fadeInDown"
                        style={{ maxWidth: 540, animationDuration: '0.22s' }}
                    >
                        <div className="results-modal-header">
                            <div className="d-flex align-items-center gap-2">
                                <div className="header-icon" style={{ width: 38, height: 38, fontSize: '0.95rem', borderRadius: 10 }}>
                                    <i className="bi bi-key-fill"></i>
                                </div>
                                <h4 className="mb-0 fw-bold">Set JWT Token</h4>
                            </div>
                            <button className="btn-icon" onClick={() => setShowTokenModal(false)}>
                                <i className="bi bi-x-lg" style={{ fontSize: '1rem' }}></i>
                            </button>
                        </div>
                        <div className="results-modal-body">
                            <div className="form-group mb-3">
                                <label>Paste your Bearer Token</label>
                                <textarea
                                    className="input-field"
                                    rows={4}
                                    value={tokenInput}
                                    onChange={e => setTokenInput(e.target.value)}
                                    placeholder="eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiUk9MRV9BRE1JTiIsInN1YiI6ImhAZ21haWwuY29tIiwiaWF0IjoxNzcyMDg1OTYzLCJleHAiOjE3NzIwODg5NjN9.jSNL34enJZffb8y7_8XPfJPKYUEdD4NWp2qiCosjweQ"
                                    style={{ fontFamily: 'monospace', fontSize: '0.78rem', wordBreak: 'break-all' }}
                                    autoFocus
                                />
                            </div>
                            <p style={{ fontSize: '0.78rem', color: '#8a9bb0' }}>
                                <i className="bi bi-info-circle me-1"></i>
                                Get a fresh token by logging in via your backend's <code>/api/auth/login</code> endpoint.
                            </p>
                            <div className="d-flex gap-2 justify-content-end">
                                <button
                                    type="button"
                                    className="btn btn-light"
                                    style={{ borderRadius: 10 }}
                                    onClick={() => setShowTokenModal(false)}
                                >
                                    Cancel
                                </button>
                                <button className="btn-grad" onClick={handleTokenSave}>
                                    <i className="bi bi-check-lg"></i> Save &amp; Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════ TOAST ════════════════ */}
            {toast.visible && (
                <div
                    className={`toast-notification ${toastCls} animate__animated animate__fadeInRight`}
                    style={{ animationDuration: '0.35s' }}
                >
                    <i className={`bi ${toastIcon}`} style={{ fontSize: '1rem' }}></i>
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default AnalyticsApp;
