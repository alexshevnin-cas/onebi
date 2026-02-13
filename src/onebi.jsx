import React from "react";
import { useState, useEffect } from "react";

export default function MetricTree() {
  const [activeScreen, setActiveScreen] = useState('quickview'); // quickview, reports, glossary
  const [selectedApp, setSelectedApp] = useState('all');
  const [expandedNodes, setExpandedNodes] = useState(new Set(['mrr', 'manager_anton', 'manager_rashid', 'app1', 'ad_revenue_1', 'ua_cost_1', 'dau_1', 'arpdau_1']));
  const [editingId, setEditingId] = useState(null);
  const [filterSection, setFilterSection] = useState('all');
  const [groupByManager, setGroupByManager] = useState(false);
  const [dateRange, setDateRange] = useState('3m'); // 1m, 3m
  const [periodRange, setPeriodRange] = useState('3m'); // 1m или 3m для фильтра
  const [periodType, setPeriodType] = useState('month'); // week, month
  const [showMetricPicker, setShowMetricPicker] = useState(null); // null or table name
  const [appsSortBy, setAppsSortBy] = useState('profitDelta'); // profitDelta, revenueDelta, dauDelta, manager
  const [appsSortDir, setAppsSortDir] = useState('desc'); // asc, desc
  const [customColumns, setCustomColumns] = useState({
    cohortTable: [],
    monetisationTable: [],
    uaTable: [],
    engagementTable: [],
  });

  // BI Filter States
  const [filterDateFrom, setFilterDateFrom] = useState('2025-12-01');
  const [filterDateTo, setFilterDateTo] = useState('2025-12-31');
  const [filterAppVersion, setFilterAppVersion] = useState('all');
  const [filterSdkVersion, setFilterSdkVersion] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [breakdownType, setBreakdownType] = useState('month');
  const [selectedMetrics, setSelectedMetrics] = useState(['dau', 'sessions', 'd1_retention', 'd7_retention', 'impr_per_dau']);
  const [showMetricsDropdown, setShowMetricsDropdown] = useState(false);
  const [activeFilters, setActiveFilters] = useState(['app']); // по умолчанию только приложение
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [openFilterValue, setOpenFilterValue] = useState(null); // какой фильтр сейчас раскрыт для выбора значения
  const [activeBreakdowns, setActiveBreakdowns] = useState([]); // активные разбивки
  const [showBreakdownDropdown, setShowBreakdownDropdown] = useState(false);
  const [showMetricAddDropdown, setShowMetricAddDropdown] = useState(false);
  const [breakdownByAppVersion, setBreakdownByAppVersion] = useState(false);
  const [breakdownByCasVersion, setBreakdownByCasVersion] = useState(false);
  const [viewType, setViewType] = useState('table'); // table, bar, line
  const [draggedColumn, setDraggedColumn] = useState(null);

  // Left nav (cabinet)
  const [navExpanded, setNavExpanded] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('analytics');

  // Sidebar state (Reports)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [collapsedSections, setCollapsedSections] = useState(new Set());
  const [reportsSplits, setReportsSplits] = useState(['date']);

  const toggleSidebarSection = (id) => {
    const next = new Set(collapsedSections);
    next.has(id) ? next.delete(id) : next.add(id);
    setCollapsedSections(next);
  };

  const addSplit = (id) => {
    if (!reportsSplits.includes(id)) setReportsSplits([...reportsSplits, id]);
  };
  const removeSplit = (id) => setReportsSplits(reportsSplits.filter(s => s !== id));

  const addMeasure = (id) => {
    if (!selectedMetrics.includes(id)) setSelectedMetrics([...selectedMetrics, id]);
  };

  // Quick View states (B1-B4)
  const [clientType, setClientType] = useState('L1'); // PubC, L1, L2, Pub, Admin, BD, Payments, RnD
  const [adminGrossNet, setAdminGrossNet] = useState('gross'); // G3: gross/net toggle
  const [hoveredTooltip, setHoveredTooltip] = useState(null); // H4: metric formula tooltips
  const [qvPeriod, setQvPeriod] = useState('last30'); // today, last7, last30, thisMonth, custom
  const [qvCompare, setQvCompare] = useState(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  // Reports table states (C1-C7)
  const [reportsDensity, setReportsDensity] = useState('comfortable'); // compact, comfortable
  const [reportsSearch, setReportsSearch] = useState('');
  const [copiedCell, setCopiedCell] = useState(null); // {row, col} for feedback
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());
  const [hiddenSeries, setHiddenSeries] = useState(new Set()); // D3: legend toggle
  const [savedViews, setSavedViews] = useState(() => { try { return JSON.parse(localStorage.getItem('onebi_saved_views') || '[]'); } catch { return []; } }); // E3
  const [showSavedViewsDD, setShowSavedViewsDD] = useState(false);
  const [showExportDD, setShowExportDD] = useState(false);
  const [showAppSelector, setShowAppSelector] = useState(false);
  const [appSelectorSearch, setAppSelectorSearch] = useState('');

  // E2: Load state from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('s')) setReportsSplits(params.get('s').split(',').filter(Boolean));
    if (params.has('m')) setSelectedMetrics(params.get('m').split(',').filter(Boolean));
    if (params.has('app')) setSelectedApp(params.get('app'));
    if (params.has('country')) setFilterCountry(params.get('country'));
    if (params.has('screen')) setActiveScreen(params.get('screen'));
  }, []);

  // H5: Keyboard shortcuts — Escape closes dropdowns
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setShowPeriodDropdown(false);
        setShowAppSelector(false);
        setShowExportDD(false);
        setShowSavedViewsDD(false);
        setShowMetricAddDropdown(false);
        setShowFilterDropdown(false);
        setShowBreakdownDropdown(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Sidebar category definitions
  const sidebarDimensions = [
    { group: 'Common', items: [
      { id: 'date', label: 'Activity Date' },
      { id: 'country', label: 'Country' },
      { id: 'os', label: 'OS' },
      { id: 'deviceType', label: 'Device Type' },
    ]},
    { group: 'Monetization', items: [
      { id: 'adType', label: 'Ad Type' },
      { id: 'network', label: 'Network' },
      { id: 'placement', label: 'Placement' },
    ]},
    { group: 'Version', items: [
      { id: 'appVersion', label: 'Package Version' },
      { id: 'sdkVersion', label: 'SDK Version' },
    ]},
  ];

  const sidebarMeasures = [
    { group: 'Monetization', items: [
      { id: 'revenue', label: 'Revenue' },
      { id: 'arpdau', label: 'ARPDAU' },
      { id: 'ecpm', label: 'eCPM' },
      { id: 'fill_rate', label: 'Fill Rate' },
      { id: 'impressions', label: 'Impressions' },
      { id: 'iap_revenue', label: 'IAP Revenue' },
      { id: 'iap_arpdau', label: 'IAP ARPDAU' },
      { id: 'paying_users', label: 'Paying Users' },
      { id: 'purchases', label: 'Purchases' },
      { id: 'iap_arppu', label: 'IAP ARPPU' },
    ]},
    { group: 'Session', items: [
      { id: 'dau', label: 'DAU' },
      { id: 'sessions', label: 'Sessions' },
      { id: 'session_duration', label: 'Duration' },
      { id: 'sessions_per_user', label: 'Sessions/User' },
      { id: 'time_per_user', label: 'Time/User' },
      { id: 'ad_session_length', label: 'Ad Session Len' },
      { id: 'impr_per_session', label: 'Impr/Session' },
      { id: 'session_count', label: 'Session Count' },
    ]},
    { group: 'Impressions', items: [
      { id: 'impr_per_dau', label: 'Impr/DAU' },
      { id: 'impr_inter_daily', label: 'Inter Impr/Day' },
      { id: 'impr_reward_daily', label: 'Reward Impr/Day' },
      { id: 'impr_banner_daily', label: 'Banner Impr/Day' },
      { id: 'impr_mrec_daily', label: 'MREC Impr/Day' },
      { id: 'ctr_inter', label: 'CTR Inter' },
      { id: 'ctr_reward', label: 'CTR Reward' },
      { id: 'ctr_banner', label: 'CTR Banner' },
    ]},
    { group: 'Retention', items: [
      { id: 'd1_retention', label: 'D1 Retention' },
      { id: 'd7_retention', label: 'D7 Retention' },
      { id: 'd14_retention', label: 'D14 Retention' },
      { id: 'd30_retention', label: 'D30 Retention' },
      { id: 'd60_retention', label: 'D60 Retention' },
      { id: 'd90_retention', label: 'D90 Retention' },
      { id: 'rolling_ret_d7', label: 'Rolling Ret D7' },
      { id: 'rolling_ret_d30', label: 'Rolling Ret D30' },
      { id: 'churn_d7', label: 'Churn D7' },
      { id: 'churn_d30', label: 'Churn D30' },
      { id: 'stickiness', label: 'Stickiness' },
      { id: 'avg_lifetime', label: 'Avg Lifetime' },
    ]},
    { group: 'Cohort', items: [
      { id: 'ltv', label: 'LTV' },
      { id: 'time_per_user_lt', label: 'Time/User LT' },
      { id: 'sessions_per_user_lt', label: 'Sess/User LT' },
      { id: 'time_per_user_daily', label: 'Time/User Daily' },
      { id: 'sessions_per_user_daily', label: 'Sess/User Daily' },
    ]},
    { group: 'UA', items: [
      { id: 'installs', label: 'Installs' },
      { id: 'cpi', label: 'CPI' },
      { id: 'roas', label: 'ROAS' },
      { id: 'roas_todate', label: 'ROAS To-Date' },
      { id: 'profit_cal', label: 'Profit Calendar' },
      { id: 'att_optin', label: 'ATT Opt-In' },
      { id: 'mmp_installs', label: 'MMP Installs' },
      { id: 'eroas_d60', label: 'eROAS D60' },
      { id: 'eroas_d365', label: 'eROAS D365' },
      { id: 'arpu_d7', label: 'ARPU D7' },
      { id: 'arpu_d14', label: 'ARPU D14' },
      { id: 'arpu_d30', label: 'ARPU D30' },
    ]},
    { group: 'Network', items: [
      { id: 'render_rate', label: 'Render Rate' },
      { id: 'bid_price', label: 'Bid Price' },
      { id: 'ctr_network', label: 'CTR Network' },
      { id: 'bidding_share', label: 'Bidding %' },
    ]},
    { group: 'Diagnostic', items: [
      { id: 'rev_by_sdk', label: 'Rev by SDK' },
      { id: 'rev_by_platform', label: 'Rev by Platform' },
      { id: 'ecpm_by_platform', label: 'eCPM by Platform' },
      { id: 'anomaly_flag', label: 'Anomaly Flag' },
      { id: 'network_gap', label: 'Network Gap' },
      { id: 'dau_discrepancy', label: 'DAU Discrep.' },
    ]},
  ];

  // Quick View — metric cards per client type
  const qvCardDefs = {
    PubC: [
      { id: 'dau', label: 'DAU', key: 'dau', format: v => formatNum(v) },
      { id: 'revenue', label: 'Revenue', key: 'revenue', format: v => '$' + formatNum(v), planned: true },
      { id: 'arpdau', label: 'ARPDAU', key: 'arpdau', format: v => '$' + v.toFixed(4), planned: true },
      { id: 'd1_ret', label: 'Retention D1', key: 'd1Retention', format: v => v.toFixed(1) + '%' },
    ],
    L1: [
      { id: 'dau', label: 'DAU', key: 'dau', format: v => formatNum(v) },
      { id: 'revenue', label: 'Revenue', key: 'revenue', format: v => '$' + formatNum(v) },
      { id: 'arpdau', label: 'ARPDAU', key: 'arpdau', format: v => '$' + v.toFixed(4) },
      { id: 'ecpm', label: 'eCPM', key: 'ecpm', format: v => '$' + v.toFixed(2) },
      { id: 'fill_rate', label: 'Fill Rate', key: 'fillRate', format: v => v.toFixed(1) + '%' },
    ],
    L2: [
      { id: 'dau', label: 'DAU', key: 'dau', format: v => formatNum(v) },
      { id: 'revenue', label: 'Revenue', key: 'revenue', format: v => '$' + formatNum(v) },
      { id: 'arpdau', label: 'ARPDAU', key: 'arpdau', format: v => '$' + v.toFixed(4) },
      { id: 'ecpm', label: 'eCPM', key: 'ecpm', format: v => '$' + v.toFixed(2) },
      { id: 'fill_rate', label: 'Fill Rate', key: 'fillRate', format: v => v.toFixed(1) + '%' },
      { id: 'd1_ret', label: 'Retention D1', key: 'd1Retention', format: v => v.toFixed(1) + '%' },
    ],
    Pub: [
      { id: 'dau', label: 'DAU', key: 'dau', format: v => formatNum(v) },
      { id: 'revenue', label: 'Revenue', key: 'revenue', format: v => '$' + formatNum(v) },
      { id: 'arpdau', label: 'ARPDAU', key: 'arpdau', format: v => '$' + v.toFixed(4) },
      { id: 'ecpm', label: 'eCPM', key: 'ecpm', format: v => '$' + v.toFixed(2) },
      { id: 'ltv', label: 'LTV', key: 'ltv', format: v => '$' + v.toFixed(2) },
      { id: 'roas', label: 'ROAS', key: 'roas', format: v => v + '%' },
    ],
    Admin: [
      { id: 'dau', label: 'DAU', key: 'dau', format: v => formatNum(v) },
      { id: 'revenue', label: 'Revenue', key: 'revenue', format: v => '$' + formatNum(v) },
      { id: 'arpdau', label: 'ARPDAU', key: 'arpdau', format: v => '$' + v.toFixed(4) },
      { id: 'ecpm', label: 'eCPM', key: 'ecpm', format: v => '$' + v.toFixed(2) },
      { id: 'fill_rate', label: 'Fill Rate', key: 'fillRate', format: v => v.toFixed(1) + '%' },
      { id: 'iap_revenue', label: 'IAP Revenue', key: 'iapRevenue', format: v => '$' + formatNum(v) },
    ],
    BD: [
      { id: 'revenue', label: 'Total Revenue', key: 'revenue', format: v => '$' + formatNum(v) },
      { id: 'dau', label: 'Total DAU', key: 'dau', format: v => formatNum(v) },
      { id: 'arpdau', label: 'Avg ARPDAU', key: 'arpdau', format: v => '$' + v.toFixed(4) },
    ],
    Payments: [
      { id: 'revenue', label: 'Current Balance', key: 'revenue', format: v => '$' + formatNum(v) },
    ],
    RnD: [
      { id: 'dau', label: 'DAU', key: 'dau', format: v => formatNum(v) },
      { id: 'ecpm', label: 'eCPM', key: 'ecpm', format: v => '$' + v.toFixed(2) },
      { id: 'fill_rate', label: 'Fill Rate', key: 'fillRate', format: v => v.toFixed(1) + '%' },
    ],
  };

  // H4: Metric tooltips with formulas
  const metricTooltips = {
    dau: { desc: 'Daily Active Users', formula: 'Unique users per day' },
    revenue: { desc: 'Ad Revenue', formula: 'Impressions × eCPM / 1000' },
    arpdau: { desc: 'Average Revenue Per DAU', formula: 'Revenue / DAU' },
    ecpm: { desc: 'Effective Cost Per Mille', formula: 'Revenue / Impressions × 1000' },
    fill_rate: { desc: 'Fill Rate', formula: 'Filled Requests / Total Requests × 100' },
    impressions: { desc: 'Total Ad Impressions', formula: 'Sum of all ad views' },
    d1_retention: { desc: 'Day 1 Retention', formula: 'Users D1 / Installs × 100' },
    d7_retention: { desc: 'Day 7 Retention', formula: 'Users D7 / Installs × 100' },
    d30_retention: { desc: 'Day 30 Retention', formula: 'Users D30 / Installs × 100' },
    ltv: { desc: 'Lifetime Value', formula: 'Cumulative ARPU over user lifetime' },
    roas: { desc: 'Return on Ad Spend', formula: 'Revenue / UA Cost × 100' },
    cpi: { desc: 'Cost Per Install', formula: 'UA Cost / Installs' },
    iap_revenue: { desc: 'In-App Purchase Revenue', formula: 'Sum of all IAP transactions' },
    iap_arpdau: { desc: 'IAP ARPDAU', formula: 'IAP Revenue / DAU' },
    stickiness: { desc: 'Stickiness', formula: 'DAU / MAU × 100' },
    impr_per_dau: { desc: 'Impressions per DAU', formula: 'Impressions / DAU' },
  };

  // G5: BD mock client data
  const bdClients = [
    { name: 'GameStudio Pro', manager: 'Anton', revenue: 18420, dau: 890000, trend: +12, risk: 'low' },
    { name: 'Idle Games Inc', manager: 'Anton', revenue: 12890, dau: 520000, trend: +8, risk: 'low' },
    { name: 'PuzzleCraft', manager: 'Rashid', revenue: 8540, dau: 342000, trend: -5, risk: 'medium' },
    { name: 'Stack Studios', manager: 'Rashid', revenue: 6210, dau: 218000, trend: -22, risk: 'high' },
    { name: 'Merge World', manager: 'Anton', revenue: 4870, dau: 165000, trend: +3, risk: 'low' },
    { name: 'CasualPlay', manager: 'Rashid', revenue: 2140, dau: 78000, trend: -8, risk: 'medium' },
    { name: 'HyperRun', manager: 'Anton', revenue: 1560, dau: 52000, trend: -35, risk: 'high' },
  ];

  // G7: RnD SDK adoption mock
  const rndSdkData = [
    { version: 'CAS 4.0.1', adoption: 8, clients: 3, revDelta: '+15%', status: 'beta' },
    { version: 'CAS 3.9.2', adoption: 48, clients: 42, revDelta: '+5.2%', status: 'latest' },
    { version: 'CAS 3.8.5', adoption: 28, clients: 31, revDelta: 'baseline', status: 'stable' },
    { version: 'CAS 3.7.1', adoption: 11, clients: 18, revDelta: '-3.1%', status: 'outdated' },
    { version: 'CAS 3.6.0', adoption: 5, clients: 9, revDelta: '-8.4%', status: 'deprecated' },
  ];

  const qvPeriodOptions = [
    { id: 'today', label: 'Today' },
    { id: 'last7', label: 'Last 7 days' },
    { id: 'last30', label: 'Last 30 days' },
    { id: 'thisMonth', label: 'This month' },
    { id: 'custom', label: 'Custom' },
  ];

  // Quick View — derive card values from latest month data
  const getQvCardValuesSingle = (appId) => {
    const d = dashboardData[appId];
    if (!d) return { current: {}, previous: {} };
    const cohort = d.cohortTable || [];
    const mon = d.monetisationTable || [];
    const eng = d.engagementTable || [];
    const cur = { ...cohort[0], ...mon[0], ...eng[0] };
    const prev = { ...cohort[1], ...mon[1], ...eng[1] };
    return {
      current: { dau: cur.dau, revenue: cur.adRevenue || cur.revenue, arpdau: cur.arpdau, ecpm: cur.ecpm, fillRate: cur.fillRate, d1Retention: cur.d1Retention, ltv: cur.ltv, roas: cur.roas || cur.roasD30, iapRevenue: (cur.adRevenue || cur.revenue || 0) * 0.12 },
      previous: { dau: prev.dau, revenue: prev.adRevenue || prev.revenue, arpdau: prev.arpdau, ecpm: prev.ecpm, fillRate: prev.fillRate, d1Retention: prev.d1Retention, ltv: prev.ltv, roas: prev.roas || prev.roasD30, iapRevenue: (prev.adRevenue || prev.revenue || 0) * 0.12 },
    };
  };

  const getQvCardValues = (appId) => {
    if (appId !== 'all') return getQvCardValuesSingle(appId);
    // Sum across all real apps
    const allVals = realAppIds.map(id => getQvCardValuesSingle(id));
    const sumKeys = ['dau', 'revenue', 'iapRevenue'];
    const avgKeys = ['arpdau', 'ecpm', 'fillRate', 'd1Retention', 'ltv', 'roas'];
    const merge = (period) => {
      const result = {};
      sumKeys.forEach(k => { result[k] = allVals.reduce((s, v) => s + (v[period][k] || 0), 0); });
      avgKeys.forEach(k => { const vals = allVals.map(v => v[period][k]).filter(v => v != null); result[k] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null; });
      return result;
    };
    return { current: merge('current'), previous: merge('previous') };
  };

  // Quick View — trend data: 30 daily revenue bars
  const getQvTrendDataSingle = (appId) => {
    const d = dashboardData[appId];
    if (!d) return [];
    const mon = d.monetisationTable || [];
    // Latest month revenue as baseline, generate 30 daily values with variance
    const latestRev = (mon[0]?.adRevenue || 1000);
    const dailyBase = latestRev / 30;
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayLabel = `${date.getMonth() + 1}/${date.getDate()}`;
      const seed = (date.getDate() * 7 + appId.charCodeAt(0) * 13 + i * 3) % 100;
      const variance = 0.85 + (seed / 100) * 0.3;
      const weekendDip = (date.getDay() === 0 || date.getDay() === 6) ? 0.88 : 1.0;
      // Last 3 days: drop then partial recovery on last day
      const dropFactor = i === 2 ? 0.82 : i === 1 ? 0.62 : i === 0 ? 0.72 : 1.0;
      const baseVal = i <= 2 ? dailyBase * weekendDip * dropFactor : dailyBase * variance * weekendDip;
      days.push({ label: dayLabel, value: Math.round(baseVal) });
    }
    return days;
  };

  const getQvTrendData = (appId) => {
    if (appId !== 'all') return getQvTrendDataSingle(appId);
    // Sum daily values across all apps
    const allTrends = realAppIds.map(id => getQvTrendDataSingle(id));
    if (allTrends[0].length === 0) return [];
    return allTrends[0].map((day, i) => ({
      label: day.label,
      value: allTrends.reduce((s, t) => s + (t[i]?.value || 0), 0),
    }));
  };

  // Quick View — breakdown data
  const getQvBreakdownAdType = (appId) => {
    const ids = appId === 'all' ? realAppIds : [appId];
    let totalBanner = 0, totalInter = 0, totalReward = 0;
    ids.forEach(id => {
      const mon = (dashboardData[id]?.monetisationTable || [])[0];
      if (mon) { totalBanner += mon.imprBanner || 0; totalInter += mon.imprInter || 0; totalReward += mon.imprReward || 0; }
    });
    const total = totalBanner + totalInter + totalReward;
    if (!total) return [];
    return [
      { label: 'Banner', value: totalBanner, pct: ((totalBanner / total) * 100).toFixed(0), color: '#94a3b8' },
      { label: 'Interstitial', value: totalInter, pct: ((totalInter / total) * 100).toFixed(0), color: '#cbd5e1' },
      { label: 'Rewarded', value: totalReward, pct: ((totalReward / total) * 100).toFixed(0), color: '#e2e8f0' },
    ];
  };

  const getQvBreakdownCountry = () => {
    return [
      { label: 'US', pct: 38, color: '#e2e8f0' },
      { label: 'DE', pct: 22, color: '#cbd5e1' },
      { label: 'UK', pct: 15, color: '#94a3b8' },
      { label: 'JP', pct: 12, color: '#64748b' },
      { label: 'Other', pct: 13, color: '#475569' },
    ];
  };

  // Reports table — build rows from dashboardData based on splits & measures
  const pctFmt = v => v?.toFixed(1) + '%';
  const dolFmt = v => '$' + v?.toFixed(2);
  const numFmt = v => formatNum(v);
  const decFmt = v => v?.toFixed(1);
  const mk = (key, fmt, isNum = true) => ({ key, fmt, isNum });

  const metricKeyMap = {
    // Engagement / Session
    dau: mk('dau', numFmt),
    wau: mk('wau', numFmt),
    mau: mk('mau', numFmt),
    sessions: mk('avgSessions', decFmt),
    session_duration: mk('avgDuration', v => v?.toFixed(1) + 'm'),
    sessions_per_user: mk('sessionsPerUser', decFmt),
    time_per_user: mk('timePerUser', v => v?.toFixed(1) + 'm'),
    ad_session_length: mk('adSessionLength', v => v?.toFixed(1) + 's'),
    impr_per_session: mk('imprPerSession', decFmt),
    session_count: mk('sessionCount', numFmt),
    // Monetisation
    revenue: mk('revenue', v => '$' + (v >= 1000 ? formatNum(v) : v?.toFixed(2))),
    arpdau: mk('arpdau', v => '$' + v?.toFixed(4)),
    ecpm: mk('ecpm', dolFmt),
    fill_rate: mk('fillRate', pctFmt),
    impressions: mk('impressions', numFmt),
    impr_per_dau: mk('imprPerDau', decFmt),
    // F1: IAP
    iap_revenue: mk('iapRevenue', dolFmt),
    iap_arpdau: mk('iapArpdau', v => '$' + v?.toFixed(4)),
    paying_users: mk('payingUsers', numFmt),
    purchases: mk('purchases', numFmt),
    iap_arppu: mk('iapArppu', dolFmt),
    // F5: Impressions by Ad Type
    impr_inter_daily: mk('imprInter', decFmt),
    impr_reward_daily: mk('imprReward', decFmt),
    impr_banner_daily: mk('imprBanner', decFmt),
    impr_mrec_daily: mk('imprMrec', decFmt),
    ctr_inter: mk('ctrInter', pctFmt),
    ctr_reward: mk('ctrReward', pctFmt),
    ctr_banner: mk('ctrBanner', pctFmt),
    // Retention / Cohort
    d1_retention: mk('d1Retention', pctFmt),
    d7_retention: mk('d7Retention', pctFmt),
    d14_retention: mk('d14Retention', pctFmt),
    d30_retention: mk('d30Retention', pctFmt),
    d60_retention: mk('d60Retention', pctFmt),
    d90_retention: mk('d90Retention', pctFmt),
    rolling_ret_d7: mk('rollingRetD7', pctFmt),
    rolling_ret_d30: mk('rollingRetD30', pctFmt),
    churn_d7: mk('churnD7', pctFmt),
    churn_d30: mk('churnD30', pctFmt),
    stickiness: mk('stickiness', pctFmt),
    avg_lifetime: mk('avgLifetime', v => v?.toFixed(0) + 'd'),
    ltv: mk('ltv', dolFmt),
    // F4: Cohort Session
    time_per_user_lt: mk('timePerUserLt', v => v?.toFixed(1) + 'h'),
    sessions_per_user_lt: mk('sessionsPerUserLt', decFmt),
    time_per_user_daily: mk('timePerUserDaily', v => v?.toFixed(1) + 'm'),
    sessions_per_user_daily: mk('sessionsPerUserDaily', decFmt),
    // UA
    installs: mk('installs', numFmt),
    cpi: mk('cpi', v => '$' + v?.toFixed(3)),
    roas: mk('roas', v => v + '%'),
    // F8: UA extended
    roas_todate: mk('roasTodate', v => v + '%'),
    profit_cal: mk('profitCal', dolFmt),
    att_optin: mk('attOptin', pctFmt),
    mmp_installs: mk('mmpInstalls', numFmt),
    eroas_d60: mk('eroasD60', v => v + '%'),
    eroas_d365: mk('eroasD365', v => v + '%'),
    arpu_d7: mk('arpuD7', v => '$' + v?.toFixed(3)),
    arpu_d14: mk('arpuD14', v => '$' + v?.toFixed(3)),
    arpu_d30: mk('arpuD30', v => '$' + v?.toFixed(3)),
    // F6: Network advanced
    render_rate: mk('renderRate', pctFmt),
    bid_price: mk('bidPrice', dolFmt),
    ctr_network: mk('ctrNetwork', pctFmt),
    bidding_share: mk('biddingShare', pctFmt),
    // F7: Diagnostic
    rev_by_sdk: mk('revBySdk', dolFmt),
    rev_by_platform: mk('revByPlatform', dolFmt),
    ecpm_by_platform: mk('ecpmByPlatform', dolFmt),
    anomaly_flag: mk('anomalyFlag', v => v ? 'Yes' : 'No', false),
    network_gap: mk('networkGap', pctFmt),
    dau_discrepancy: mk('dauDiscrepancy', pctFmt),
  };

  const buildReportsRows = () => {
    const appId = selectedApp === 'all' ? 'puzzle' : selectedApp;
    const d = dashboardData[appId];
    if (!d) return [];

    // Merge all table data by month
    const cohort = d.cohortTable || [];
    const mon = d.monetisationTable || [];
    const eng = d.engagementTable || [];
    const ua = d.uaTable || [];

    const merged = cohort.map((c, i) => {
      const m = mon[i] || {};
      const e = eng[i] || {};
      const u = ua[i] || {};
      const base = { ...c, ...m, ...e, ...u, _month: c.month || c.period || `Row ${i}` };
      // F1: IAP (synthetic)
      base.iapRevenue = (base.adRevenue || base.revenue || 0) * 0.12;
      base.iapArpdau = base.dau ? base.iapRevenue / base.dau : 0;
      base.payingUsers = Math.round((base.dau || 0) * (e.pauConversion || 2.2) / 100);
      base.purchases = Math.round(base.payingUsers * 1.8);
      base.iapArppu = base.payingUsers ? base.iapRevenue / base.payingUsers : 0;
      // F2: Session extended
      base.sessionsPerUser = e.avgSessions || 3.2;
      base.timePerUser = (e.avgDuration || 8) * (e.avgSessions || 3.2);
      base.adSessionLength = (e.avgDuration || 8) * 0.65;
      base.imprPerSession = m.imprPerDau ? m.imprPerDau / (e.avgSessions || 3.2) : 2.5;
      base.sessionCount = Math.round((base.dau || 0) * (e.avgSessions || 3.2));
      // F3: Retention extended
      base.d14Retention = (c.d7Retention || 28) * 0.72;
      base.d60Retention = (c.d30Retention || 14) * 0.62;
      base.d90Retention = (c.d30Retention || 14) * 0.45;
      base.rollingRetD7 = (c.d7Retention || 28) + 5.2;
      base.rollingRetD30 = (c.d30Retention || 14) + 3.8;
      base.churnD7 = 100 - (c.d7Retention || 28) - 5.2;
      base.churnD30 = 100 - (c.d30Retention || 14) - 3.8;
      base.stickiness = base.dau && base.wau ? (base.dau / (base.wau / 7) * 100) : 28;
      base.avgLifetime = (c.d30Retention || 14) * 2.8;
      // F4: Cohort Session
      base.timePerUserLt = base.avgLifetime * 0.35;
      base.sessionsPerUserLt = base.avgLifetime * 2.8;
      base.timePerUserDaily = e.avgDuration || 8.5;
      base.sessionsPerUserDaily = e.avgSessions || 3.2;
      // F5: Impressions detail
      base.imprMrec = (m.imprBanner || 3) * 0.15;
      base.ctrInter = (c.ctr || 0.52) * 0.6;
      base.ctrReward = (c.ctr || 0.52) * 1.8;
      base.ctrBanner = (c.ctr || 0.52) * 0.25;
      // F8: UA extended
      base.roasTodate = (u.roasD30 || c.roas || 145) * 1.15;
      base.profitCal = (base.adRevenue || base.revenue || 0) - (u.uaCost || 0);
      base.attOptin = 38 + i * 1.2;
      base.mmpInstalls = Math.round((c.installs || 0) * 0.92);
      base.eroasD60 = (u.roasD30 || c.roas || 145) * 1.35;
      base.eroasD365 = (u.roasD30 || c.roas || 145) * 2.8;
      base.arpuD7 = (c.ltv || 0.4) * 0.35;
      base.arpuD14 = (c.ltv || 0.4) * 0.55;
      base.arpuD30 = (c.ltv || 0.4) * 0.78;
      // F6: Network advanced (aggregated)
      base.renderRate = (m.fillRate || 95) * 0.98;
      base.bidPrice = (m.ecpm || 5) * 0.85;
      base.ctrNetwork = c.ctr || 0.52;
      base.biddingShare = 62 + i * 1.5;
      // F7: Diagnostic
      base.revBySdk = base.adRevenue || base.revenue || 0;
      base.revByPlatform = (base.adRevenue || base.revenue || 0) * 0.55;
      base.ecpmByPlatform = (m.ecpm || 5) * 1.08;
      base.anomalyFlag = false;
      base.networkGap = 1.2 + i * 0.3;
      base.dauDiscrepancy = 2.1 + i * 0.4;
      return base;
    });

    // Build split column label
    const splitLabel = reportsSplits.includes('date') ? 'Period' : reportsSplits[0] || 'Period';

    // For now: date split = month, adType split = synthetic sub-rows
    const hasAdTypeSplit = reportsSplits.includes('adType');
    const rows = [];

    merged.forEach((row, idx) => {
      const period = row._month;
      if (hasAdTypeSplit) {
        // Group header
        rows.push({ _type: 'group', _label: period, _idx: idx });
        // Sub-rows per ad type
        ['Banner', 'Interstitial', 'Rewarded'].forEach(adType => {
          const factor = adType === 'Banner' ? 0.35 : adType === 'Interstitial' ? 0.40 : 0.25;
          const subRow = {};
          selectedMetrics.forEach(mid => {
            const mk = metricKeyMap[mid];
            if (!mk) return;
            const val = row[mk.key];
            subRow[mid] = val != null ? (mk.isNum ? val * factor : val) : null;
          });
          subRow._type = 'data';
          subRow._label = adType;
          subRow._group = period;
          subRow._idx = idx;
          rows.push(subRow);
        });
      } else {
        const dataRow = { _type: 'data', _label: period, _idx: idx };
        selectedMetrics.forEach(mid => {
          const mk = metricKeyMap[mid];
          if (!mk) return;
          dataRow[mid] = row[mk.key] ?? null;
        });
        rows.push(dataRow);
      }
    });
    return rows;
  };

  // Anomaly detection (C3)
  const getAnomaly = (value, prevValue) => {
    if (value === null || value === undefined) return 'missing';
    if (value === 0) return 'zero';
    if (prevValue && prevValue !== 0) {
      const change = ((value - prevValue) / prevValue) * 100;
      if (change <= -50) return 'drop';
      if (change >= 100) return 'spike';
    }
    return null;
  };

  const anomalyStyle = {
    zero: 'bg-red-500/15 text-red-400',
    drop: 'bg-amber-500/15 text-amber-400',
    missing: 'italic text-slate-600',
    spike: 'bg-emerald-500/15 text-emerald-400',
  };

  const anomalyTooltip = {
    zero: 'Zero value — check data pipeline',
    drop: 'Sharp drop >50%',
    missing: 'No data available',
    spike: 'Sharp growth >100%',
  };

  // Copy cell (C5)
  const handleCopyCell = (value, rowIdx, colIdx) => {
    navigator.clipboard.writeText(String(value));
    setCopiedCell(`${rowIdx}-${colIdx}`);
    setTimeout(() => setCopiedCell(null), 1000);
  };

  // D3: Chart series colors
  const seriesColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

  const toggleSeries = (id) => {
    const next = new Set(hiddenSeries);
    next.has(id) ? next.delete(id) : next.add(id);
    setHiddenSeries(next);
  };

  // E2: Deep URL — sync state to URL
  const pushStateToUrl = () => {
    const params = new URLSearchParams();
    params.set('s', reportsSplits.join(','));
    params.set('m', selectedMetrics.join(','));
    params.set('app', selectedApp);
    if (filterCountry !== 'all') params.set('country', filterCountry);
    params.set('screen', activeScreen);
    window.history.replaceState(null, '', '?' + params.toString());
  };

  const loadStateFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('s')) setReportsSplits(params.get('s').split(',').filter(Boolean));
    if (params.has('m')) setSelectedMetrics(params.get('m').split(',').filter(Boolean));
    if (params.has('app')) setSelectedApp(params.get('app'));
    if (params.has('country')) setFilterCountry(params.get('country'));
    if (params.has('screen')) setActiveScreen(params.get('screen'));
  };

  // E3: Saved Views — persist to localStorage
  const saveCurrentView = (name) => {
    const view = { name, splits: [...reportsSplits], metrics: [...selectedMetrics], app: selectedApp, country: filterCountry, ts: Date.now() };
    const updated = [...savedViews, view];
    setSavedViews(updated);
    localStorage.setItem('onebi_saved_views', JSON.stringify(updated));
  };

  const loadSavedView = (view) => {
    setReportsSplits(view.splits);
    setSelectedMetrics(view.metrics);
    setSelectedApp(view.app);
    if (view.country) setFilterCountry(view.country);
    setShowSavedViewsDD(false);
  };

  const deleteSavedView = (idx) => {
    const updated = savedViews.filter((_, i) => i !== idx);
    setSavedViews(updated);
    localStorage.setItem('onebi_saved_views', JSON.stringify(updated));
  };

  // Toggle group collapse (C1)
  const toggleGroup = (label) => {
    const next = new Set(collapsedGroups);
    next.has(label) ? next.delete(label) : next.add(label);
    setCollapsedGroups(next);
  };

  // Drag-and-drop handlers for columns
  const handleColumnDragStart = (e, metricId) => {
    setDraggedColumn(metricId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColumnDragOver = (e, metricId) => {
    e.preventDefault();
    if (draggedColumn && draggedColumn !== metricId) {
      const draggedIndex = selectedMetrics.indexOf(draggedColumn);
      const targetIndex = selectedMetrics.indexOf(metricId);
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newMetrics = [...selectedMetrics];
        newMetrics.splice(draggedIndex, 1);
        newMetrics.splice(targetIndex, 0, draggedColumn);
        setSelectedMetrics(newMetrics);
      }
    }
  };

  const handleColumnDragEnd = () => {
    setDraggedColumn(null);
  };

  // Доступные фильтры
  const availableFilters = [
    { id: 'app', label: 'Приложение' },
    { id: 'period', label: 'Период' },
    { id: 'appVersion', label: 'Версия приложения' },
    { id: 'sdkVersion', label: 'Версия SDK' },
    { id: 'country', label: 'Страна' },
  ];

  // Доступные разбивки
  const availableBreakdowns = [
    { id: 'appVersion', label: 'По версии приложения' },
    { id: 'sdkVersion', label: 'По версии SDK' },
  ];

  // Filter options
  const appVersions = ['all', '2.4.1', '2.4.0', '2.3.8', '2.3.5', '2.2.0'];
  const sdkVersionsFilter = ['all', '4.5.4', '4.5.2', '4.4.8', '4.4.5', '4.3.0'];
  const countries = ['all', 'US', 'GB', 'DE', 'FR', 'JP', 'KR', 'BR', 'IN', 'RU'];
  const allMetricsOptions = [
    // Engagement
    { id: 'dau', name: 'DAU', section: 'engagement' },
    { id: 'wau', name: 'WAU', section: 'engagement' },
    { id: 'mau', name: 'MAU', section: 'engagement' },
    { id: 'sessions', name: 'Sessions', section: 'engagement' },
    { id: 'session_duration', name: 'Duration', section: 'engagement' },
    // F2: Session extended
    { id: 'sessions_per_user', name: 'Sessions/User', section: 'engagement' },
    { id: 'time_per_user', name: 'Time/User', section: 'engagement' },
    { id: 'ad_session_length', name: 'Ad Session Len', section: 'engagement' },
    { id: 'impr_per_session', name: 'Impr/Session', section: 'engagement' },
    { id: 'session_count', name: 'Session Count', section: 'engagement' },
    // Monetisation
    { id: 'revenue', name: 'Revenue', section: 'monetisation' },
    { id: 'arpdau', name: 'ARPDAU', section: 'monetisation' },
    { id: 'ecpm', name: 'eCPM', section: 'monetisation' },
    { id: 'fill_rate', name: 'Fill Rate', section: 'monetisation' },
    { id: 'impressions', name: 'Impr', section: 'monetisation' },
    { id: 'impr_per_dau', name: 'Impr/DAU', section: 'monetisation' },
    // F1: IAP
    { id: 'iap_revenue', name: 'IAP Revenue', section: 'monetisation' },
    { id: 'iap_arpdau', name: 'IAP ARPDAU', section: 'monetisation' },
    { id: 'paying_users', name: 'Paying Users', section: 'monetisation' },
    { id: 'purchases', name: 'Purchases', section: 'monetisation' },
    { id: 'iap_arppu', name: 'IAP ARPPU', section: 'monetisation' },
    // F5: Impressions by Ad Type
    { id: 'impr_inter_daily', name: 'Inter Impr/Day', section: 'impressions' },
    { id: 'impr_reward_daily', name: 'Reward Impr/Day', section: 'impressions' },
    { id: 'impr_banner_daily', name: 'Banner Impr/Day', section: 'impressions' },
    { id: 'impr_mrec_daily', name: 'MREC Impr/Day', section: 'impressions' },
    { id: 'ctr_inter', name: 'CTR Inter', section: 'impressions' },
    { id: 'ctr_reward', name: 'CTR Reward', section: 'impressions' },
    { id: 'ctr_banner', name: 'CTR Banner', section: 'impressions' },
    // Cohort / Retention
    { id: 'd1_retention', name: 'D1 Ret', section: 'cohort' },
    { id: 'd7_retention', name: 'D7 Ret', section: 'cohort' },
    { id: 'd30_retention', name: 'D30 Ret', section: 'cohort' },
    { id: 'ltv', name: 'LTV', section: 'cohort' },
    // F3: Retention extended
    { id: 'd14_retention', name: 'D14 Ret', section: 'cohort' },
    { id: 'd60_retention', name: 'D60 Ret', section: 'cohort' },
    { id: 'd90_retention', name: 'D90 Ret', section: 'cohort' },
    { id: 'rolling_ret_d7', name: 'Roll Ret D7', section: 'cohort' },
    { id: 'rolling_ret_d30', name: 'Roll Ret D30', section: 'cohort' },
    { id: 'churn_d7', name: 'Churn D7', section: 'cohort' },
    { id: 'churn_d30', name: 'Churn D30', section: 'cohort' },
    { id: 'stickiness', name: 'Stickiness', section: 'cohort' },
    { id: 'avg_lifetime', name: 'Avg Lifetime', section: 'cohort' },
    // F4: Cohort Session
    { id: 'time_per_user_lt', name: 'Time/User LT', section: 'cohort' },
    { id: 'sessions_per_user_lt', name: 'Sess/User LT', section: 'cohort' },
    { id: 'time_per_user_daily', name: 'Time/User Daily', section: 'cohort' },
    { id: 'sessions_per_user_daily', name: 'Sess/User Daily', section: 'cohort' },
    // UA
    { id: 'installs', name: 'Installs', section: 'ua' },
    { id: 'cpi', name: 'CPI', section: 'ua' },
    { id: 'roas', name: 'ROAS', section: 'ua' },
    // F8: UA extended
    { id: 'roas_todate', name: 'ROAS To-Date', section: 'ua' },
    { id: 'profit_cal', name: 'Profit Calendar', section: 'ua' },
    { id: 'att_optin', name: 'ATT Opt-In', section: 'ua' },
    { id: 'mmp_installs', name: 'MMP Installs', section: 'ua' },
    { id: 'eroas_d60', name: 'eROAS D60', section: 'ua' },
    { id: 'eroas_d365', name: 'eROAS D365', section: 'ua' },
    { id: 'arpu_d7', name: 'ARPU D7', section: 'ua' },
    { id: 'arpu_d14', name: 'ARPU D14', section: 'ua' },
    { id: 'arpu_d30', name: 'ARPU D30', section: 'ua' },
    // F6: Network advanced (displayed in network table, also selectable)
    { id: 'render_rate', name: 'Render Rate', section: 'network' },
    { id: 'bid_price', name: 'Bid Price', section: 'network' },
    { id: 'ctr_network', name: 'CTR Network', section: 'network' },
    { id: 'bidding_share', name: 'Bidding %', section: 'network' },
    // F7: Diagnostic
    { id: 'rev_by_sdk', name: 'Rev by SDK', section: 'diagnostic' },
    { id: 'rev_by_platform', name: 'Rev by Platform', section: 'diagnostic' },
    { id: 'ecpm_by_platform', name: 'eCPM by Platform', section: 'diagnostic' },
    { id: 'anomaly_flag', name: 'Anomaly Flag', section: 'diagnostic' },
    { id: 'network_gap', name: 'Network Gap', section: 'diagnostic' },
    { id: 'dau_discrepancy', name: 'DAU Discrep.', section: 'diagnostic' },
  ];

  // Available metrics that can be added to tables
  const availableMetrics = {
    cohortTable: [
      { id: 'wau', name: 'WAU', description: 'Weekly Active Users' },
      { id: 'mau', name: 'MAU', description: 'Monthly Active Users' },
      { id: 'd3Retention', name: 'D3 Retention', description: 'Day 3 retention rate' },
      { id: 'd14Retention', name: 'D14 Retention', description: 'Day 14 retention rate' },
      { id: 'd30Retention', name: 'D30 Retention', description: 'Day 30 retention rate' },
      { id: 'ltv', name: 'LTV', description: 'Lifetime Value' },
      { id: 'arpu', name: 'ARPU', description: 'Average Revenue Per User' },
      { id: 'churnRate', name: 'Churn Rate', description: 'Процент ушедших пользователей' },
    ],
    monetisationTable: [
      { id: 'revenuePerSession', name: 'Rev/Session', description: 'Revenue per session' },
      { id: 'adsPerSession', name: 'Ads/Session', description: 'Ads shown per session' },
      { id: 'davDau', name: 'DAV/DAU', description: 'Daily Ad Viewers / DAU' },
      { id: 'noFillRate', name: 'NoFill Rate', description: '1 - Fill Rate' },
      { id: 'renderRate', name: 'Render Rate', description: 'Rendered / Loaded ads' },
      { id: 'iapRevenue', name: 'IAP Revenue', description: 'In-App Purchase revenue' },
      { id: 'hybridArpdau', name: 'Hybrid ARPDAU', description: 'Ads + IAP ARPDAU' },
    ],
    uaTable: [
      { id: 'organicShare', name: 'Organic %', description: 'Organic installs share' },
      { id: 'paidShare', name: 'Paid %', description: 'Paid installs share' },
      { id: 'roasD14', name: 'ROAS D14', description: 'Return on ad spend D14' },
      { id: 'roasD60', name: 'ROAS D60', description: 'Return on ad spend D60' },
      { id: 'ipm', name: 'IPM', description: 'Installs per mille (1000 impressions)' },
      { id: 'ctr', name: 'CTR', description: 'Click-through rate' },
      { id: 'cvr', name: 'CVR', description: 'Conversion rate (clicks to installs)' },
    ],
    engagementTable: [
      { id: 'sessionDepth', name: 'Session Depth', description: 'Avg levels/actions per session' },
      { id: 'daysActive', name: 'Days Active', description: 'Avg days active per user' },
      { id: 'stickiness', name: 'Stickiness', description: 'DAU/MAU ratio' },
      { id: 'timeToFirstPurchase', name: 'Time to 1st Purchase', description: 'Avg days to first IAP' },
      { id: 'tutorialCompletion', name: 'Tutorial %', description: 'Tutorial completion rate' },
      { id: 'socialShares', name: 'Social Shares', description: 'Shares per DAU' },
    ],
  };

  // Generate mock data for custom metrics
  const getCustomMetricValue = (metricId, rowIndex) => {
    const mockData = {
      wau: [620000, 680000, 750000, 790000],
      mau: [1850000, 2100000, 2350000, 2480000],
      d3Retention: [36.2, 37.1, 37.8, 38.2],
      d14Retention: [18.5, 19.2, 19.8, 20.1],
      d30Retention: [12.4, 13.1, 13.6, 14.0],
      ltv: [0.38, 0.41, 0.44, 0.46],
      arpu: [0.082, 0.088, 0.092, 0.095],
      churnRate: [72.5, 71.8, 71.2, 70.6],
      revenuePerSession: [0.018, 0.019, 0.020, 0.021],
      adsPerSession: [2.4, 2.5, 2.6, 2.6],
      davDau: [78.2, 80.5, 82.1, 83.4],
      noFillRate: [5.8, 4.9, 3.7, 3.4],
      renderRate: [94.2, 95.1, 95.8, 96.2],
      iapRevenue: [420, 485, 540, 580],
      hybridArpdau: [0.058, 0.062, 0.066, 0.069],
      organicShare: [27.4, 26.9, 27.4, 27.6],
      paidShare: [72.6, 73.1, 72.6, 72.4],
      roasD14: [112, 118, 124, 128],
      roasD60: [168, 178, 186, 192],
      ipm: [8.2, 8.5, 8.8, 9.0],
      ctr: [2.8, 2.9, 3.0, 3.1],
      cvr: [28.5, 29.2, 29.8, 30.2],
      sessionDepth: [12.4, 12.8, 13.2, 13.5],
      daysActive: [4.2, 4.4, 4.6, 4.8],
      stickiness: [0.32, 0.33, 0.34, 0.35],
      timeToFirstPurchase: [3.2, 3.0, 2.9, 2.8],
      tutorialCompletion: [68.5, 70.2, 71.8, 72.5],
      socialShares: [0.08, 0.09, 0.10, 0.11],
    };
    return mockData[metricId]?.[rowIndex] || 0;
  };

  const formatMetricValue = (metricId, value) => {
    if (['ltv', 'arpu', 'revenuePerSession', 'hybridArpdau'].includes(metricId)) return '$' + value.toFixed(3);
    if (['d3Retention', 'd14Retention', 'd30Retention', 'churnRate', 'davDau', 'noFillRate', 'renderRate', 'organicShare', 'paidShare', 'ctr', 'cvr', 'tutorialCompletion'].includes(metricId)) return value.toFixed(1) + '%';
    if (['roasD14', 'roasD60'].includes(metricId)) return value + '%';
    if (['wau', 'mau', 'iapRevenue'].includes(metricId)) return value.toLocaleString();
    if (['stickiness', 'socialShares'].includes(metricId)) return value.toFixed(2);
    return value.toFixed(1);
  };

  const addMetricToTable = (tableName, metric) => {
    setCustomColumns(prev => ({
      ...prev,
      [tableName]: [...prev[tableName], metric]
    }));
    setShowMetricPicker(null);
  };

  const removeMetricFromTable = (tableName, metricId) => {
    setCustomColumns(prev => ({
      ...prev,
      [tableName]: prev[tableName].filter(m => m.id !== metricId)
    }));
  };

  const apps = [
    { id: 'all', name: 'All Apps' },
    { id: 'puzzle', name: 'Puzzle Game' },
    { id: 'idle', name: 'Idle Tycoon' },
    { id: 'stack', name: 'Stack Tower' },
  ];
  const realAppIds = ['puzzle', 'idle', 'stack'];

  // Weekly data for all apps
  const weeklyData = {
    puzzle: {
      cohortTable: [
        { period: 'Dec 2-8', installs: 14200, dau: 162400, d1Retention: 43.8, d7Retention: 27.6, impressions: 324000, clicks: 1685, ctr: 0.52, ecpm: 5.28, revenue: 1710.72 },
        { period: 'Dec 9-15', installs: 15100, dau: 165200, d1Retention: 44.0, d7Retention: 27.9, impressions: 338000, clicks: 1791, ctr: 0.53, ecpm: 5.35, revenue: 1808.30 },
        { period: 'Dec 16-22', installs: 15800, dau: 168800, d1Retention: 44.3, d7Retention: 28.2, impressions: 352000, clicks: 1866, ctr: 0.53, ecpm: 5.42, revenue: 1907.84 },
        { period: 'Dec 23-29', installs: 16300, dau: 172100, d1Retention: 44.5, d7Retention: 28.5, impressions: 362000, clicks: 1919, ctr: 0.53, ecpm: 5.48, revenue: 1983.76 },
      ],
      monetisationTable: [
        { period: 'Dec 2-8', adRevenue: 1711, arpdau: 0.0421, imprPerDau: 7.9, imprBanner: 3.1, imprInter: 1.4, imprReward: 0.9, ecpm: 5.28, fillRate: 95.8 },
        { period: 'Dec 9-15', adRevenue: 1808, arpdau: 0.0438, imprPerDau: 8.0, imprBanner: 3.2, imprInter: 1.5, imprReward: 1.0, ecpm: 5.35, fillRate: 96.1 },
        { period: 'Dec 16-22', adRevenue: 1908, arpdau: 0.0452, imprPerDau: 8.1, imprBanner: 3.2, imprInter: 1.5, imprReward: 1.0, ecpm: 5.42, fillRate: 96.4 },
        { period: 'Dec 23-29', adRevenue: 1984, arpdau: 0.0461, imprPerDau: 8.2, imprBanner: 3.3, imprInter: 1.5, imprReward: 1.0, ecpm: 5.48, fillRate: 96.6 },
      ],
      uaTable: [
        { period: 'Dec 2-8', uaCost: 924, installs: 14200, cpi: 0.065, organic: 3900, paid: 10300, roasD7: 138, roasD30: 175, payback: 15 },
        { period: 'Dec 9-15', uaCost: 982, installs: 15100, cpi: 0.065, organic: 4100, paid: 11000, roasD7: 141, roasD30: 184, payback: 14 },
        { period: 'Dec 16-22', uaCost: 1027, installs: 15800, cpi: 0.065, organic: 4400, paid: 11400, roasD7: 144, roasD30: 186, payback: 14 },
        { period: 'Dec 23-29', uaCost: 1060, installs: 16300, cpi: 0.065, organic: 4500, paid: 11800, roasD7: 146, roasD30: 187, payback: 14 },
      ],
      engagementTable: [
        { period: 'Dec 2-8', dau: 162400, avgSessions: 3.4, avgDuration: 8.9, davDau: 81.2, pauConversion: 2.3 },
        { period: 'Dec 9-15', dau: 165200, avgSessions: 3.5, avgDuration: 9.0, davDau: 81.6, pauConversion: 2.3 },
        { period: 'Dec 16-22', dau: 168800, avgSessions: 3.5, avgDuration: 9.1, davDau: 82.0, pauConversion: 2.4 },
        { period: 'Dec 23-29', dau: 172100, avgSessions: 3.6, avgDuration: 9.3, davDau: 82.4, pauConversion: 2.4 },
      ],
    },
    idle: {
      cohortTable: [
        { period: 'Dec 2-8', installs: 9800, dau: 108200, d1Retention: 48.0, d7Retention: 31.4, impressions: 245000, clicks: 1323, ctr: 0.54, ecpm: 7.05, revenue: 1727.25 },
        { period: 'Dec 9-15', installs: 10200, dau: 110400, d1Retention: 48.3, d7Retention: 31.8, impressions: 256000, clicks: 1408, ctr: 0.55, ecpm: 7.12, revenue: 1822.72 },
        { period: 'Dec 16-22', installs: 10600, dau: 112200, d1Retention: 48.5, d7Retention: 32.0, impressions: 268000, clicks: 1474, ctr: 0.55, ecpm: 7.18, revenue: 1924.24 },
        { period: 'Dec 23-29', installs: 10600, dau: 114800, d1Retention: 48.7, d7Retention: 32.3, impressions: 276000, clicks: 1518, ctr: 0.55, ecpm: 7.24, revenue: 1998.24 },
      ],
      monetisationTable: [
        { period: 'Dec 2-8', adRevenue: 1727, arpdau: 0.0640, imprPerDau: 9.0, imprBanner: 3.5, imprInter: 2.1, imprReward: 1.4, ecpm: 7.05, fillRate: 93.8 },
        { period: 'Dec 9-15', adRevenue: 1823, arpdau: 0.0660, imprPerDau: 9.2, imprBanner: 3.6, imprInter: 2.2, imprReward: 1.5, ecpm: 7.12, fillRate: 94.0 },
        { period: 'Dec 16-22', adRevenue: 1924, arpdau: 0.0686, imprPerDau: 9.4, imprBanner: 3.6, imprInter: 2.2, imprReward: 1.5, ecpm: 7.18, fillRate: 94.2 },
        { period: 'Dec 23-29', adRevenue: 1998, arpdau: 0.0696, imprPerDau: 9.5, imprBanner: 3.7, imprInter: 2.3, imprReward: 1.5, ecpm: 7.24, fillRate: 94.4 },
      ],
      uaTable: [
        { period: 'Dec 2-8', uaCost: 764, installs: 9800, cpi: 0.078, organic: 2700, paid: 7100, roasD7: 162, roasD30: 192, payback: 12 },
        { period: 'Dec 9-15', uaCost: 795, installs: 10200, cpi: 0.078, organic: 2850, paid: 7350, roasD7: 166, roasD30: 196, payback: 12 },
        { period: 'Dec 16-22', uaCost: 826, installs: 10600, cpi: 0.078, organic: 2950, paid: 7650, roasD7: 169, roasD30: 199, payback: 12 },
        { period: 'Dec 23-29', uaCost: 826, installs: 10600, cpi: 0.078, organic: 2950, paid: 7650, roasD7: 172, roasD30: 202, payback: 11 },
      ],
      engagementTable: [
        { period: 'Dec 2-8', dau: 108200, avgSessions: 4.4, avgDuration: 13.6, davDau: 87.5, pauConversion: 4.2 },
        { period: 'Dec 9-15', dau: 110400, avgSessions: 4.4, avgDuration: 13.8, davDau: 87.8, pauConversion: 4.3 },
        { period: 'Dec 16-22', dau: 112200, avgSessions: 4.5, avgDuration: 13.9, davDau: 88.0, pauConversion: 4.3 },
        { period: 'Dec 23-29', dau: 114800, avgSessions: 4.5, avgDuration: 14.1, davDau: 88.3, pauConversion: 4.4 },
      ],
    },
    stack: {
      cohortTable: [
        { period: 'Dec 2-8', installs: 64000, dau: 620000, d1Retention: 34.8, d7Retention: 16.8, impressions: 1240000, clicks: 5208, ctr: 0.42, ecpm: 3.32, revenue: 4116.80 },
        { period: 'Dec 9-15', installs: 66500, dau: 635000, d1Retention: 35.0, d7Retention: 17.0, impressions: 1285000, clicks: 5526, ctr: 0.43, ecpm: 3.35, revenue: 4304.75 },
        { period: 'Dec 16-22', installs: 68500, dau: 648000, d1Retention: 35.2, d7Retention: 17.2, impressions: 1328000, clicks: 5710, ctr: 0.43, ecpm: 3.38, revenue: 4488.64 },
        { period: 'Dec 23-29', installs: 69000, dau: 660000, d1Retention: 35.4, d7Retention: 17.4, impressions: 1360000, clicks: 5848, ctr: 0.43, ecpm: 3.42, revenue: 4651.20 },
      ],
      monetisationTable: [
        { period: 'Dec 2-8', adRevenue: 4117, arpdau: 0.0265, imprPerDau: 7.8, imprBanner: 4.6, imprInter: 2.7, imprReward: 0.5, ecpm: 3.32, fillRate: 90.8 },
        { period: 'Dec 9-15', adRevenue: 4305, arpdau: 0.0271, imprPerDau: 7.9, imprBanner: 4.7, imprInter: 2.7, imprReward: 0.6, ecpm: 3.35, fillRate: 91.0 },
        { period: 'Dec 16-22', adRevenue: 4489, arpdau: 0.0277, imprPerDau: 8.0, imprBanner: 4.8, imprInter: 2.8, imprReward: 0.6, ecpm: 3.38, fillRate: 91.2 },
        { period: 'Dec 23-29', adRevenue: 4651, arpdau: 0.0282, imprPerDau: 8.0, imprBanner: 4.8, imprInter: 2.8, imprReward: 0.6, ecpm: 3.42, fillRate: 91.4 },
      ],
      uaTable: [
        { period: 'Dec 2-8', uaCost: 2112, installs: 64000, cpi: 0.033, organic: 18600, paid: 45400, roasD7: 125, roasD30: 195, payback: 19 },
        { period: 'Dec 9-15', uaCost: 2195, installs: 66500, cpi: 0.033, organic: 19200, paid: 47300, roasD7: 127, roasD30: 196, payback: 18 },
        { period: 'Dec 16-22', uaCost: 2261, installs: 68500, cpi: 0.033, organic: 19800, paid: 48700, roasD7: 129, roasD30: 198, payback: 18 },
        { period: 'Dec 23-29', uaCost: 2277, installs: 69000, cpi: 0.033, organic: 20000, paid: 49000, roasD7: 131, roasD30: 204, payback: 17 },
      ],
      engagementTable: [
        { period: 'Dec 2-8', dau: 620000, avgSessions: 2.5, avgDuration: 4.6, davDau: 93.8, pauConversion: 0.9 },
        { period: 'Dec 9-15', dau: 635000, avgSessions: 2.6, avgDuration: 4.7, davDau: 93.9, pauConversion: 0.9 },
        { period: 'Dec 16-22', dau: 648000, avgSessions: 2.6, avgDuration: 4.8, davDau: 94.0, pauConversion: 1.0 },
        { period: 'Dec 23-29', dau: 660000, avgSessions: 2.6, avgDuration: 4.8, davDau: 94.2, pauConversion: 1.0 },
      ],
    },
  };

  // Helper to get data based on period type
  // Версии приложений для разбивки
  const appVersionsList = {
    puzzle: ['2.4.1', '2.4.0', '2.3.8'],
    idle: ['1.8.0', '1.7.5', '1.6.0'],
    stack: ['3.2.1', '3.1.8', '3.0.0'],
    merge: ['1.2.0', '1.1.5', '1.0.8'],
    clevel: ['Portfolio'],
  };

  const versionColors = {
    '2.4.1': '#3b82f6', '2.4.0': '#8b5cf6', '2.3.8': '#ec4899',
    '1.8.0': '#3b82f6', '1.7.5': '#8b5cf6', '1.6.0': '#ec4899',
    '3.2.1': '#3b82f6', '3.1.8': '#8b5cf6', '3.0.0': '#ec4899',
    '1.2.0': '#3b82f6', '1.1.5': '#8b5cf6', '1.0.8': '#ec4899',
    'Portfolio': '#3b82f6',
  };

  // Версии CAS SDK для разбивки
  const sdkVersionsList = ['4.5.4', '4.5.2', '4.4.8'];

  const sdkVersionColors = {
    '4.5.4': '#10b981',
    '4.5.2': '#f59e0b',
    '4.4.8': '#ef4444',
  };

  // Генерация данных с разбивкой по версиям приложения
  const expandByVersion = (data, app) => {
    const versions = appVersionsList[app] || [];
    if (versions.length === 0) return data;

    const expanded = [];
    data.forEach(row => {
      versions.forEach((version, vIdx) => {
        const factor = vIdx === 0 ? 0.55 : vIdx === 1 ? 0.30 : 0.15;
        expanded.push({
          ...row,
          month: row.month || row.period,
          period: row.month || row.period,
          appVersion: version,
          installs: Math.round((row.installs || 0) * factor),
          dau: Math.round((row.dau || 0) * factor),
          wau: Math.round((row.wau || 0) * factor),
          mau: Math.round((row.mau || 0) * factor),
          impressions: Math.round((row.impressions || 0) * factor),
          revenue: (row.revenue || 0) * factor,
          d1Retention: row.d1Retention ? +(row.d1Retention * (1 + (0.05 - vIdx * 0.03))).toFixed(1) : null,
          d7Retention: row.d7Retention ? +(row.d7Retention * (1 + (0.05 - vIdx * 0.03))).toFixed(1) : null,
          d30Retention: row.d30Retention ? +(row.d30Retention * (1 + (0.05 - vIdx * 0.03))).toFixed(1) : null,
          ecpm: row.ecpm ? +(row.ecpm * (1 + (0.08 - vIdx * 0.04))).toFixed(2) : null,
          ltv: row.ltv ? +(row.ltv * (1 + (0.06 - vIdx * 0.03))).toFixed(2) : null,
          arpdau: row.arpdau ? +(row.arpdau * (1 + (0.06 - vIdx * 0.03))).toFixed(4) : null,
          cpi: row.cpi ? +(row.cpi * (1 - (0.05 - vIdx * 0.02))).toFixed(3) : null,
          roas: row.roas ? Math.round(row.roas * (1 + (0.08 - vIdx * 0.04))) : null,
        });
      });
    });
    return expanded;
  };

  // Генерация данных с разбивкой по версиям SDK
  const expandBySdkVersion = (data) => {
    const expanded = [];
    data.forEach(row => {
      sdkVersionsList.forEach((sdkVersion, vIdx) => {
        // Коэффициенты: новый SDK = лучше метрики, больше пользователей
        const userFactor = vIdx === 0 ? 0.50 : vIdx === 1 ? 0.35 : 0.15;
        const perfFactor = 1 + (0.10 - vIdx * 0.05); // SDK влияет на производительность
        expanded.push({
          ...row,
          month: row.month || row.period,
          period: row.month || row.period,
          sdkVersion: sdkVersion,
          installs: Math.round((row.installs || 0) * userFactor),
          dau: Math.round((row.dau || 0) * userFactor),
          wau: Math.round((row.wau || 0) * userFactor),
          mau: Math.round((row.mau || 0) * userFactor),
          impressions: Math.round((row.impressions || 0) * userFactor * perfFactor),
          revenue: +((row.revenue || 0) * userFactor * perfFactor).toFixed(2),
          d1Retention: row.d1Retention ? +(row.d1Retention * perfFactor).toFixed(1) : null,
          d7Retention: row.d7Retention ? +(row.d7Retention * perfFactor).toFixed(1) : null,
          d30Retention: row.d30Retention ? +(row.d30Retention * perfFactor).toFixed(1) : null,
          ecpm: row.ecpm ? +(row.ecpm * perfFactor).toFixed(2) : null,
          ltv: row.ltv ? +(row.ltv * perfFactor).toFixed(2) : null,
          arpdau: row.arpdau ? +(row.arpdau * perfFactor).toFixed(4) : null,
          cpi: row.cpi ? +(row.cpi * (1 / perfFactor)).toFixed(3) : null,
          roas: row.roas ? Math.round(row.roas * perfFactor) : null,
        });
      });
    });
    return expanded;
  };

  // Переключатели разбивки (взаимоисключающие)
  const toggleAppVersionBreakdown = () => {
    if (!breakdownByAppVersion) {
      setBreakdownByAppVersion(true);
      setBreakdownByCasVersion(false);
    } else {
      setBreakdownByAppVersion(false);
    }
  };

  const toggleSdkVersionBreakdown = () => {
    if (!breakdownByCasVersion) {
      setBreakdownByCasVersion(true);
      setBreakdownByAppVersion(false);
    } else {
      setBreakdownByCasVersion(false);
    }
  };

  const getTableData = (app, tableName) => {
    const appData = dashboardData[app];
    if (!appData) return [];

    let data;
    if (periodType === 'week' && weeklyData[app] && weeklyData[app][tableName]) {
      data = weeklyData[app][tableName];
    } else {
      data = appData[tableName] || [];
    }

    // Фильтр по периоду: 1m = 1 запись, 3m = 3 записи, 6m = 6 записей
    if (activeFilters.includes('period')) {
      const limit = periodRange === '1m' ? 1 : periodRange === '3m' ? 3 : 6;
      data = data.slice(0, limit);
    }

    // Разбивка по версии приложения
    if (breakdownByAppVersion && tableName === 'cohortTable') {
      return expandByVersion(data, app);
    }

    // Разбивка по версии SDK
    if (breakdownByCasVersion && tableName === 'cohortTable') {
      return expandBySdkVersion(data);
    }

    return data;
  };

  const getPeriodLabel = () => periodType === 'week' ? 'period' : 'month';

  const dashboardData = {
    puzzle: {
      name: 'Puzzle Game',
      current: { dau: 890000, arpdau: 0.054, retention_d7: 28, ltv: 0.42, roas: 145 },
      previous: { dau: 795000, arpdau: 0.051, retention_d7: 26, ltv: 0.38, roas: 132 },
      cohortTable: [
        { month: 'January 2026', installs: 68200, dau: 185400, wau: 462000, mau: 1320000, d1Retention: 45.1, d7Retention: 28.9, d30Retention: 14.5, impressions: 1520000, clicks: 8210, ctr: 0.54, ecpm: 5.6200, revenue: 8542.40, ltv: 0.44, cpi: 0.064, roas: 152 },
        { month: 'December 2025', installs: 61400, dau: 168500, wau: 420000, mau: 1200000, d1Retention: 44.2, d7Retention: 28.1, d30Retention: 13.8, impressions: 1356000, clicks: 7120, ctr: 0.52, ecpm: 5.3800, revenue: 7295.28, ltv: 0.42, cpi: 0.065, roas: 145 },
        { month: 'November 2025', installs: 52800, dau: 148200, wau: 368000, mau: 1050000, d1Retention: 43.5, d7Retention: 27.4, d30Retention: 13.1, impressions: 1124000, clicks: 5620, ctr: 0.50, ecpm: 5.1200, revenue: 5754.88, ltv: 0.40, cpi: 0.065, roas: 135 },
        { month: 'October 2025', installs: 45200, dau: 125600, wau: 312000, mau: 890000, d1Retention: 42.1, d7Retention: 26.8, d30Retention: 12.4, impressions: 892000, clicks: 4280, ctr: 0.48, ecpm: 4.8500, revenue: 4326.20, ltv: 0.38, cpi: 0.066, roas: 128 },
        { month: 'September 2025', installs: 38500, dau: 108400, wau: 268000, mau: 765000, d1Retention: 41.2, d7Retention: 25.9, d30Retention: 11.8, impressions: 756000, clicks: 3480, ctr: 0.46, ecpm: 4.5200, revenue: 3417.12, ltv: 0.35, cpi: 0.068, roas: 118 },
        { month: 'August 2025', installs: 32100, dau: 92800, wau: 228000, mau: 652000, d1Retention: 40.5, d7Retention: 25.2, d30Retention: 11.2, impressions: 628000, clicks: 2760, ctr: 0.44, ecpm: 4.2800, revenue: 2687.84, ltv: 0.32, cpi: 0.070, roas: 108 },
        { month: 'July 2025', installs: 26800, dau: 78200, wau: 195000, mau: 553000, d1Retention: 39.8, d7Retention: 24.6, d30Retention: 10.8, impressions: 532000, clicks: 2280, ctr: 0.43, ecpm: 4.0200, revenue: 2138.64, ltv: 0.29, cpi: 0.072, roas: 98 },
      ],
      monetisationTable: [
        { month: 'January 2026', adRevenue: 8542, arpdau: 0.0461, imprPerDau: 8.2, imprBanner: 3.4, imprInter: 1.6, imprReward: 1.1, ecpm: 5.62, fillRate: 97.1 },
        { month: 'December 2025', adRevenue: 7295, arpdau: 0.0433, imprPerDau: 8.0, imprBanner: 3.2, imprInter: 1.5, imprReward: 1.0, ecpm: 5.38, fillRate: 96.3 },
        { month: 'November 2025', adRevenue: 5755, arpdau: 0.0388, imprPerDau: 7.6, imprBanner: 3.0, imprInter: 1.4, imprReward: 0.9, ecpm: 5.12, fillRate: 95.1 },
        { month: 'October 2025', adRevenue: 4326, arpdau: 0.0344, imprPerDau: 7.1, imprBanner: 2.8, imprInter: 1.2, imprReward: 0.8, ecpm: 4.85, fillRate: 94.2 },
        { month: 'September 2025', adRevenue: 3417, arpdau: 0.0315, imprPerDau: 6.8, imprBanner: 2.6, imprInter: 1.1, imprReward: 0.7, ecpm: 4.52, fillRate: 93.5 },
        { month: 'August 2025', adRevenue: 2688, arpdau: 0.0290, imprPerDau: 6.5, imprBanner: 2.4, imprInter: 1.0, imprReward: 0.6, ecpm: 4.28, fillRate: 92.8 },
        { month: 'July 2025', adRevenue: 2139, arpdau: 0.0273, imprPerDau: 6.8, imprBanner: 2.5, imprInter: 1.0, imprReward: 0.5, ecpm: 4.02, fillRate: 92.1 },
      ],
      uaTable: [
        { month: 'January 2026', uaCost: 4368, installs: 68200, cpi: 0.064, organic: 18600, paid: 49600, roasD7: 148, roasD30: 196, payback: 13 },
        { month: 'December 2025', uaCost: 3980, installs: 61400, cpi: 0.065, organic: 16800, paid: 44600, roasD7: 142, roasD30: 183, payback: 14 },
        { month: 'November 2025', uaCost: 3420, installs: 52800, cpi: 0.065, organic: 14200, paid: 38600, roasD7: 135, roasD30: 168, payback: 16 },
        { month: 'October 2025', uaCost: 2980, installs: 45200, cpi: 0.066, organic: 12400, paid: 32800, roasD7: 128, roasD30: 145, payback: 18 },
        { month: 'September 2025', uaCost: 2618, installs: 38500, cpi: 0.068, organic: 10800, paid: 27700, roasD7: 118, roasD30: 132, payback: 20 },
        { month: 'August 2025', uaCost: 2247, installs: 32100, cpi: 0.070, organic: 9200, paid: 22900, roasD7: 108, roasD30: 118, payback: 23 },
        { month: 'July 2025', uaCost: 1928, installs: 26800, cpi: 0.072, organic: 7700, paid: 19100, roasD7: 98, roasD30: 108, payback: 26 },
      ],
      engagementTable: [
        { month: 'January 2026', dau: 185400, avgSessions: 3.6, avgDuration: 9.5, davDau: 83.8, pauConversion: 2.5 },
        { month: 'December 2025', dau: 168500, avgSessions: 3.5, avgDuration: 9.2, davDau: 82.1, pauConversion: 2.4 },
        { month: 'November 2025', dau: 148200, avgSessions: 3.4, avgDuration: 8.8, davDau: 80.5, pauConversion: 2.3 },
        { month: 'October 2025', dau: 125600, avgSessions: 3.2, avgDuration: 8.4, davDau: 78.2, pauConversion: 2.1 },
        { month: 'September 2025', dau: 108400, avgSessions: 3.1, avgDuration: 8.1, davDau: 76.5, pauConversion: 2.0 },
        { month: 'August 2025', dau: 92800, avgSessions: 3.0, avgDuration: 7.8, davDau: 74.8, pauConversion: 1.9 },
        { month: 'July 2025', dau: 78200, avgSessions: 2.9, avgDuration: 7.5, davDau: 73.2, pauConversion: 1.8 },
      ],
      networksTable: [
        { network: 'AppLovin', revenue: 2335, impressions: 449000, ecpm: 5.20, fillRate: 98.2, sov: 32, winRate: 38, latency: 145 },
        { network: 'AdMob', revenue: 1561, impressions: 380500, ecpm: 4.10, fillRate: 97.8, sov: 28, winRate: 32, latency: 120 },
        { network: 'Unity Ads', revenue: 1167, impressions: 303200, ecpm: 3.85, fillRate: 94.5, sov: 22, winRate: 24, latency: 180 },
        { network: 'ironSource', revenue: 1103, impressions: 239800, ecpm: 4.60, fillRate: 96.1, sov: 18, winRate: 21, latency: 155 },
        { network: 'Meta AN', revenue: 892, impressions: 198400, ecpm: 4.50, fillRate: 91.2, sov: 12, winRate: 15, latency: 210 },
        { network: 'Mintegral', revenue: 645, impressions: 172000, ecpm: 3.75, fillRate: 89.6, sov: 9, winRate: 11, latency: 195 },
        { network: 'Pangle', revenue: 478, impressions: 134500, ecpm: 3.55, fillRate: 88.1, sov: 7, winRate: 8, latency: 220 },
        { network: 'InMobi', revenue: 312, impressions: 98200, ecpm: 3.18, fillRate: 85.4, sov: 5, winRate: 6, latency: 190 },
        { network: 'Vungle', revenue: 245, impressions: 72800, ecpm: 3.36, fillRate: 82.7, sov: 4, winRate: 5, latency: 175 },
        { network: 'Chartboost', revenue: 189, impressions: 61400, ecpm: 3.08, fillRate: 79.3, sov: 3, winRate: 4, latency: 200 },
        { network: 'DT Exchange', revenue: 134, impressions: 48200, ecpm: 2.78, fillRate: 76.8, sov: 2, winRate: 3, latency: 185 },
        { network: 'Yandex Ads', revenue: 98, impressions: 35600, ecpm: 2.75, fillRate: 74.2, sov: 2, winRate: 2, latency: 240 },
        { network: 'MyTarget', revenue: 52, impressions: 18900, ecpm: 2.75, fillRate: 68.5, sov: 1, winRate: 1, latency: 260 },
        { network: 'Bigo Ads', revenue: 0, impressions: 0, ecpm: 0, fillRate: 0, sov: 0, winRate: 0, latency: 0 },
        { network: 'Kidoz', revenue: 0, impressions: 0, ecpm: 0, fillRate: 0, sov: 0, winRate: 0, latency: 0 },
      ],
      sdkVersionTable: [
        { version: 'CAS 3.9.2', appVersion: '2.4.1', dau: 89200, dauShare: 53, sessions: 3.6, duration: 9.4, revenue: 4125, arpdau: 0.0463, imprPerDau: 8.2, ecpm: 5.65, fillRate: 97.2 },
        { version: 'CAS 3.8.5', appVersion: '2.3.8', dau: 52400, dauShare: 31, sessions: 3.4, duration: 9.0, revenue: 2280, arpdau: 0.0435, imprPerDau: 7.8, ecpm: 5.58, fillRate: 96.8 },
        { version: 'CAS 3.7.1', appVersion: '2.2.0', dau: 18600, dauShare: 11, sessions: 3.2, duration: 8.5, revenue: 695, arpdau: 0.0374, imprPerDau: 7.2, ecpm: 5.19, fillRate: 95.1 },
        { version: 'CAS 3.6.0', appVersion: '2.1.x', dau: 8300, dauShare: 5, sessions: 3.0, duration: 8.1, revenue: 195, arpdau: 0.0235, imprPerDau: 6.5, ecpm: 3.62, fillRate: 91.4 },
      ]
    },
    idle: {
      name: 'Idle Tycoon',
      current: { dau: 520000, arpdau: 0.075, retention_d7: 32, ltv: 0.58, roas: 168 },
      previous: { dau: 433000, arpdau: 0.072, retention_d7: 30, ltv: 0.52, roas: 155 },
      cohortTable: [
        { month: 'January 2026', installs: 48500, dau: 128600, wau: 321000, mau: 858000, d1Retention: 49.2, d7Retention: 33.2, d30Retention: 18.4, impressions: 1215000, clicks: 6680, ctr: 0.55, ecpm: 7.5800, revenue: 9209.70, ltv: 0.61, cpi: 0.076, roas: 178 },
        { month: 'December 2025', installs: 41200, dau: 112800, wau: 282000, mau: 752000, d1Retention: 48.5, d7Retention: 32.1, d30Retention: 17.6, impressions: 1028000, clicks: 5540, ctr: 0.54, ecpm: 7.2100, revenue: 7411.88, ltv: 0.58, cpi: 0.078, roas: 168 },
        { month: 'November 2025', installs: 34600, dau: 95400, wau: 238000, mau: 634000, d1Retention: 47.8, d7Retention: 30.8, d30Retention: 16.4, impressions: 812000, clicks: 4220, ctr: 0.52, ecpm: 6.8500, revenue: 5562.20, ltv: 0.55, cpi: 0.080, roas: 158 },
        { month: 'October 2025', installs: 28400, dau: 78200, wau: 195000, mau: 520000, d1Retention: 46.2, d7Retention: 29.5, d30Retention: 15.2, impressions: 624000, clicks: 3120, ctr: 0.50, ecpm: 6.2400, revenue: 3893.76, ltv: 0.52, cpi: 0.082, roas: 142 },
        { month: 'September 2025', installs: 23200, dau: 64500, wau: 160000, mau: 428000, d1Retention: 45.1, d7Retention: 28.2, d30Retention: 14.1, impressions: 498000, clicks: 2390, ctr: 0.48, ecpm: 5.8200, revenue: 2898.36, ltv: 0.48, cpi: 0.085, roas: 128 },
        { month: 'August 2025', installs: 18800, dau: 52100, wau: 128000, mau: 345000, d1Retention: 44.2, d7Retention: 27.1, d30Retention: 13.2, impressions: 392000, clicks: 1820, ctr: 0.46, ecpm: 5.4500, revenue: 2136.40, ltv: 0.44, cpi: 0.088, roas: 115 },
        { month: 'July 2025', installs: 15600, dau: 43400, wau: 108000, mau: 289000, d1Retention: 43.2, d7Retention: 26.1, d30Retention: 12.4, impressions: 328000, clicks: 1480, ctr: 0.45, ecpm: 5.1200, revenue: 1680.96, ltv: 0.40, cpi: 0.091, roas: 105 },
      ],
      monetisationTable: [
        { month: 'January 2026', adRevenue: 9210, arpdau: 0.0716, imprPerDau: 9.4, imprBanner: 3.8, imprInter: 2.4, imprReward: 1.6, ecpm: 7.58, fillRate: 94.8 },
        { month: 'December 2025', adRevenue: 7412, arpdau: 0.0657, imprPerDau: 9.1, imprBanner: 3.6, imprInter: 2.2, imprReward: 1.5, ecpm: 7.21, fillRate: 94.2 },
        { month: 'November 2025', adRevenue: 5562, arpdau: 0.0583, imprPerDau: 8.5, imprBanner: 3.4, imprInter: 2.0, imprReward: 1.4, ecpm: 6.85, fillRate: 93.5 },
        { month: 'October 2025', adRevenue: 3894, arpdau: 0.0498, imprPerDau: 8.0, imprBanner: 3.2, imprInter: 1.8, imprReward: 1.2, ecpm: 6.24, fillRate: 92.8 },
        { month: 'September 2025', adRevenue: 2898, arpdau: 0.0449, imprPerDau: 7.5, imprBanner: 3.0, imprInter: 1.6, imprReward: 1.1, ecpm: 5.82, fillRate: 92.1 },
        { month: 'August 2025', adRevenue: 2136, arpdau: 0.0410, imprPerDau: 7.2, imprBanner: 2.8, imprInter: 1.5, imprReward: 1.0, ecpm: 5.45, fillRate: 91.4 },
        { month: 'July 2025', adRevenue: 1681, arpdau: 0.0388, imprPerDau: 7.5, imprBanner: 2.9, imprInter: 1.5, imprReward: 0.9, ecpm: 5.12, fillRate: 90.8 },
      ],
      uaTable: [
        { month: 'January 2026', uaCost: 3686, installs: 48500, cpi: 0.076, organic: 13200, paid: 35300, roasD7: 178, roasD30: 215, payback: 11 },
        { month: 'December 2025', uaCost: 3214, installs: 41200, cpi: 0.078, organic: 11400, paid: 29800, roasD7: 168, roasD30: 198, payback: 12 },
        { month: 'November 2025', uaCost: 2768, installs: 34600, cpi: 0.080, organic: 9800, paid: 24800, roasD7: 158, roasD30: 185, payback: 13 },
        { month: 'October 2025', uaCost: 2320, installs: 28400, cpi: 0.082, organic: 8200, paid: 20200, roasD7: 142, roasD30: 168, payback: 15 },
        { month: 'September 2025', uaCost: 1972, installs: 23200, cpi: 0.085, organic: 6800, paid: 16400, roasD7: 128, roasD30: 148, payback: 17 },
        { month: 'August 2025', uaCost: 1654, installs: 18800, cpi: 0.088, organic: 5600, paid: 13200, roasD7: 115, roasD30: 132, payback: 19 },
        { month: 'July 2025', uaCost: 1420, installs: 15600, cpi: 0.091, organic: 4700, paid: 10900, roasD7: 105, roasD30: 122, payback: 21 },
      ],
      engagementTable: [
        { month: 'January 2026', dau: 128600, avgSessions: 4.6, avgDuration: 14.5, davDau: 89.5, pauConversion: 4.6 },
        { month: 'December 2025', dau: 112800, avgSessions: 4.5, avgDuration: 14.0, davDau: 88.2, pauConversion: 4.4 },
        { month: 'November 2025', dau: 95400, avgSessions: 4.3, avgDuration: 13.2, davDau: 86.8, pauConversion: 4.1 },
        { month: 'October 2025', dau: 78200, avgSessions: 4.1, avgDuration: 12.5, davDau: 85.2, pauConversion: 3.8 },
        { month: 'September 2025', dau: 64500, avgSessions: 3.9, avgDuration: 11.8, davDau: 83.6, pauConversion: 3.5 },
        { month: 'August 2025', dau: 52100, avgSessions: 3.8, avgDuration: 11.2, davDau: 82.1, pauConversion: 3.2 },
        { month: 'July 2025', dau: 43400, avgSessions: 3.7, avgDuration: 10.8, davDau: 80.8, pauConversion: 3.0 },
      ],
      networksTable: [
        { network: 'AppLovin', revenue: 2890, impressions: 401400, ecpm: 7.20, fillRate: 97.5, sov: 35, winRate: 42, latency: 142 },
        { network: 'AdMob', revenue: 1854, impressions: 308800, ecpm: 6.00, fillRate: 96.2, sov: 27, winRate: 30, latency: 118 },
        { network: 'Unity Ads', revenue: 1408, impressions: 246700, ecpm: 5.70, fillRate: 93.8, sov: 21, winRate: 22, latency: 175 },
        { network: 'ironSource', revenue: 1260, impressions: 185300, ecpm: 6.80, fillRate: 95.4, sov: 17, winRate: 19, latency: 160 },
        { network: 'Meta AN', revenue: 1020, impressions: 168200, ecpm: 6.07, fillRate: 90.8, sov: 11, winRate: 14, latency: 205 },
        { network: 'Mintegral', revenue: 780, impressions: 145600, ecpm: 5.36, fillRate: 88.4, sov: 8, winRate: 10, latency: 188 },
        { network: 'Pangle', revenue: 560, impressions: 112300, ecpm: 4.99, fillRate: 86.2, sov: 6, winRate: 7, latency: 215 },
        { network: 'InMobi', revenue: 385, impressions: 82400, ecpm: 4.67, fillRate: 83.9, sov: 5, winRate: 5, latency: 192 },
        { network: 'Vungle', revenue: 298, impressions: 64100, ecpm: 4.65, fillRate: 81.5, sov: 4, winRate: 4, latency: 170 },
        { network: 'Chartboost', revenue: 210, impressions: 52800, ecpm: 3.98, fillRate: 78.1, sov: 3, winRate: 3, latency: 198 },
        { network: 'DT Exchange', revenue: 155, impressions: 41200, ecpm: 3.76, fillRate: 75.6, sov: 2, winRate: 3, latency: 182 },
        { network: 'Yandex Ads', revenue: 112, impressions: 30800, ecpm: 3.64, fillRate: 72.8, sov: 2, winRate: 2, latency: 235 },
        { network: 'MyTarget', revenue: 64, impressions: 16500, ecpm: 3.88, fillRate: 67.2, sov: 1, winRate: 1, latency: 255 },
        { network: 'Bigo Ads', revenue: 0, impressions: 0, ecpm: 0, fillRate: 0, sov: 0, winRate: 0, latency: 0 },
        { network: 'Kidoz', revenue: 0, impressions: 0, ecpm: 0, fillRate: 0, sov: 0, winRate: 0, latency: 0 },
      ],
      sdkVersionTable: [
        { version: 'CAS 3.9.2', appVersion: '1.8.0', dau: 62400, dauShare: 55, sessions: 4.6, duration: 14.2, revenue: 4520, arpdau: 0.0724, imprPerDau: 9.4, ecpm: 7.70, fillRate: 95.8 },
        { version: 'CAS 3.9.0', appVersion: '1.7.5', dau: 31200, dauShare: 28, sessions: 4.4, duration: 13.8, revenue: 2105, arpdau: 0.0675, imprPerDau: 9.0, ecpm: 7.50, fillRate: 94.5 },
        { version: 'CAS 3.8.2', appVersion: '1.6.x', dau: 14100, dauShare: 12, sessions: 4.2, duration: 13.2, revenue: 682, arpdau: 0.0484, imprPerDau: 8.4, ecpm: 5.76, fillRate: 92.8 },
        { version: 'CAS 3.7.x', appVersion: '1.5.x', dau: 5100, dauShare: 5, sessions: 3.9, duration: 12.5, revenue: 105, arpdau: 0.0206, imprPerDau: 7.2, ecpm: 2.86, fillRate: 88.2 },
      ]
    },
    stack: {
      name: 'Stack Tower',
      current: { dau: 2100000, arpdau: 0.034, retention_d7: 18, ltv: 0.22, roas: 128 },
      previous: { dau: 1615000, arpdau: 0.032, retention_d7: 16, ltv: 0.19, roas: 112 },
      cohortTable: [
        { month: 'January 2026', installs: 312000, dau: 782000, wau: 1955000, mau: 3910000, d1Retention: 36.4, d7Retention: 18.5, d30Retention: 8.8, impressions: 6420000, clicks: 27540, ctr: 0.43, ecpm: 3.5800, revenue: 22983.60, ltv: 0.24, cpi: 0.032, roas: 138 },
        { month: 'December 2025', installs: 268000, dau: 645000, wau: 1612000, mau: 3225000, d1Retention: 35.2, d7Retention: 17.2, d30Retention: 8.0, impressions: 5160000, clicks: 21672, ctr: 0.42, ecpm: 3.3800, revenue: 17440.80, ltv: 0.22, cpi: 0.033, roas: 128 },
        { month: 'November 2025', installs: 224000, dau: 518000, wau: 1295000, mau: 2590000, d1Retention: 33.8, d7Retention: 15.9, d30Retention: 7.1, impressions: 3885000, clicks: 15540, ctr: 0.40, ecpm: 3.1200, revenue: 12121.20, ltv: 0.21, cpi: 0.034, roas: 118 },
        { month: 'October 2025', installs: 185000, dau: 420000, wau: 1050000, mau: 2100000, d1Retention: 32.4, d7Retention: 14.8, d30Retention: 6.2, impressions: 2940000, clicks: 11760, ctr: 0.40, ecpm: 2.8500, revenue: 8379.00, ltv: 0.19, cpi: 0.035, roas: 108 },
        { month: 'September 2025', installs: 152000, dau: 345000, wau: 862000, mau: 1724000, d1Retention: 31.2, d7Retention: 13.6, d30Retention: 5.5, impressions: 2280000, clicks: 8890, ctr: 0.39, ecpm: 2.6200, revenue: 5973.60, ltv: 0.17, cpi: 0.036, roas: 98 },
        { month: 'August 2025', installs: 124000, dau: 278000, wau: 695000, mau: 1390000, d1Retention: 30.1, d7Retention: 12.5, d30Retention: 4.9, impressions: 1752000, clicks: 6660, ctr: 0.38, ecpm: 2.4200, revenue: 4239.84, ltv: 0.15, cpi: 0.038, roas: 88 },
        { month: 'July 2025', installs: 102000, dau: 228000, wau: 570000, mau: 1140000, d1Retention: 29.2, d7Retention: 11.8, d30Retention: 4.5, impressions: 1432000, clicks: 5424, ctr: 0.38, ecpm: 2.2800, revenue: 3263.36, ltv: 0.14, cpi: 0.039, roas: 78 },
      ],
      monetisationTable: [
        { month: 'January 2026', adRevenue: 22984, arpdau: 0.0294, imprPerDau: 8.2, imprBanner: 4.9, imprInter: 2.9, imprReward: 0.7, ecpm: 3.58, fillRate: 91.8 },
        { month: 'December 2025', adRevenue: 17441, arpdau: 0.0270, imprPerDau: 8.0, imprBanner: 4.8, imprInter: 2.8, imprReward: 0.6, ecpm: 3.38, fillRate: 91.2 },
        { month: 'November 2025', adRevenue: 12121, arpdau: 0.0234, imprPerDau: 7.5, imprBanner: 4.5, imprInter: 2.6, imprReward: 0.5, ecpm: 3.12, fillRate: 90.8 },
        { month: 'October 2025', adRevenue: 8379, arpdau: 0.0199, imprPerDau: 7.0, imprBanner: 4.2, imprInter: 2.4, imprReward: 0.4, ecpm: 2.85, fillRate: 89.5 },
        { month: 'September 2025', adRevenue: 5974, arpdau: 0.0173, imprPerDau: 6.6, imprBanner: 4.0, imprInter: 2.2, imprReward: 0.4, ecpm: 2.62, fillRate: 88.8 },
        { month: 'August 2025', adRevenue: 4240, arpdau: 0.0152, imprPerDau: 6.3, imprBanner: 3.8, imprInter: 2.1, imprReward: 0.3, ecpm: 2.42, fillRate: 88.1 },
        { month: 'July 2025', adRevenue: 3263, arpdau: 0.0143, imprPerDau: 6.3, imprBanner: 3.8, imprInter: 2.0, imprReward: 0.3, ecpm: 2.28, fillRate: 87.5 },
      ],
      uaTable: [
        { month: 'January 2026', uaCost: 9984, installs: 312000, cpi: 0.032, organic: 92000, paid: 220000, roasD7: 138, roasD30: 218, payback: 16 },
        { month: 'December 2025', uaCost: 8844, installs: 268000, cpi: 0.033, organic: 78000, paid: 190000, roasD7: 128, roasD30: 197, payback: 18 },
        { month: 'November 2025', uaCost: 7616, installs: 224000, cpi: 0.034, organic: 64000, paid: 160000, roasD7: 118, roasD30: 159, payback: 21 },
        { month: 'October 2025', uaCost: 6475, installs: 185000, cpi: 0.035, organic: 52000, paid: 133000, roasD7: 108, roasD30: 129, payback: 24 },
        { month: 'September 2025', uaCost: 5472, installs: 152000, cpi: 0.036, organic: 42000, paid: 110000, roasD7: 98, roasD30: 112, payback: 27 },
        { month: 'August 2025', uaCost: 4712, installs: 124000, cpi: 0.038, organic: 34000, paid: 90000, roasD7: 88, roasD30: 98, payback: 30 },
        { month: 'July 2025', uaCost: 3978, installs: 102000, cpi: 0.039, organic: 28000, paid: 74000, roasD7: 78, roasD30: 88, payback: 33 },
      ],
      engagementTable: [
        { month: 'January 2026', dau: 782000, avgSessions: 2.7, avgDuration: 5.0, davDau: 94.8, pauConversion: 1.1 },
        { month: 'December 2025', dau: 645000, avgSessions: 2.6, avgDuration: 4.8, davDau: 94.1, pauConversion: 1.0 },
        { month: 'November 2025', dau: 518000, avgSessions: 2.5, avgDuration: 4.5, davDau: 93.2, pauConversion: 0.9 },
        { month: 'October 2025', dau: 420000, avgSessions: 2.4, avgDuration: 4.2, davDau: 92.5, pauConversion: 0.8 },
        { month: 'September 2025', dau: 345000, avgSessions: 2.3, avgDuration: 4.0, davDau: 91.8, pauConversion: 0.7 },
        { month: 'August 2025', dau: 278000, avgSessions: 2.2, avgDuration: 3.8, davDau: 91.2, pauConversion: 0.6 },
        { month: 'July 2025', dau: 228000, avgSessions: 2.1, avgDuration: 3.5, davDau: 90.5, pauConversion: 0.5 },
      ],
      networksTable: [
        { network: 'AppLovin', revenue: 5580, impressions: 1548000, ecpm: 3.60, fillRate: 96.8, sov: 30, winRate: 35, latency: 138 },
        { network: 'AdMob', revenue: 5232, impressions: 1806200, ecpm: 2.90, fillRate: 98.2, sov: 35, winRate: 38, latency: 112 },
        { network: 'Unity Ads', revenue: 3488, impressions: 1238600, ecpm: 2.82, fillRate: 92.5, sov: 24, winRate: 26, latency: 165 },
        { network: 'ironSource', revenue: 3140, impressions: 980100, ecpm: 3.20, fillRate: 94.8, sov: 19, winRate: 18, latency: 152 },
        { network: 'Meta AN', revenue: 2410, impressions: 842000, ecpm: 2.86, fillRate: 89.5, sov: 14, winRate: 16, latency: 208 },
        { network: 'Mintegral', revenue: 1680, impressions: 620000, ecpm: 2.71, fillRate: 87.2, sov: 10, winRate: 12, latency: 192 },
        { network: 'Pangle', revenue: 1245, impressions: 498000, ecpm: 2.50, fillRate: 84.8, sov: 8, winRate: 9, latency: 218 },
        { network: 'InMobi', revenue: 820, impressions: 342000, ecpm: 2.40, fillRate: 82.1, sov: 5, winRate: 6, latency: 195 },
        { network: 'Vungle', revenue: 615, impressions: 256000, ecpm: 2.40, fillRate: 80.4, sov: 4, winRate: 5, latency: 172 },
        { network: 'Chartboost', revenue: 445, impressions: 192000, ecpm: 2.32, fillRate: 77.6, sov: 3, winRate: 4, latency: 202 },
        { network: 'DT Exchange', revenue: 310, impressions: 138000, ecpm: 2.25, fillRate: 74.2, sov: 2, winRate: 3, latency: 188 },
        { network: 'Yandex Ads', revenue: 220, impressions: 95000, ecpm: 2.32, fillRate: 71.8, sov: 2, winRate: 2, latency: 242 },
        { network: 'MyTarget', revenue: 125, impressions: 52000, ecpm: 2.40, fillRate: 66.5, sov: 1, winRate: 1, latency: 258 },
        { network: 'Bigo Ads', revenue: 0, impressions: 0, ecpm: 0, fillRate: 0, sov: 0, winRate: 0, latency: 0 },
        { network: 'Kidoz', revenue: 0, impressions: 0, ecpm: 0, fillRate: 0, sov: 0, winRate: 0, latency: 0 },
      ],
      sdkVersionTable: [
        { version: 'CAS 3.9.2', appVersion: '3.2.1', dau: 1260000, dauShare: 60, sessions: 2.7, duration: 5.0, revenue: 11200, arpdau: 0.0356, imprPerDau: 8.4, ecpm: 4.24, fillRate: 93.5 },
        { version: 'CAS 3.9.0', appVersion: '3.1.8', dau: 525000, dauShare: 25, sessions: 2.5, duration: 4.6, revenue: 4180, arpdau: 0.0318, imprPerDau: 7.8, ecpm: 4.08, fillRate: 92.1 },
        { version: 'CAS 3.8.x', appVersion: '3.0.x', dau: 231000, dauShare: 11, sessions: 2.4, duration: 4.4, revenue: 1520, arpdau: 0.0263, imprPerDau: 7.2, ecpm: 3.65, fillRate: 89.8 },
        { version: 'CAS 3.6.x', appVersion: '2.x', dau: 84000, dauShare: 4, sessions: 2.2, duration: 4.0, revenue: 540, arpdau: 0.0257, imprPerDau: 6.8, ecpm: 3.78, fillRate: 87.2 },
      ]
    },
    merge: {
      name: 'Merge Kingdom',
      current: { dau: 280000, arpdau: 0.136, retention_d7: 38, ltv: 1.24, roas: 195 },
      previous: { dau: 259000, arpdau: 0.128, retention_d7: 35, ltv: 1.08, roas: 172 },
      cohortTable: [
        { month: 'January 2026', installs: 21400, dau: 94200, wau: 235500, mau: 471000, d1Retention: 57.2, d7Retention: 38.8, d30Retention: 22.5, impressions: 858000, clicks: 6435, ctr: 0.75, ecpm: 14.1200, revenue: 12114.96, ltv: 1.32, cpi: 0.108, roas: 208 },
        { month: 'December 2025', installs: 18200, dau: 78600, wau: 196500, mau: 393000, d1Retention: 55.8, d7Retention: 37.4, d30Retention: 21.2, impressions: 692000, clicks: 5190, ctr: 0.75, ecpm: 13.2800, revenue: 9187.76, ltv: 1.24, cpi: 0.112, roas: 195 },
        { month: 'November 2025', installs: 15400, dau: 64200, wau: 160500, mau: 321000, d1Retention: 54.1, d7Retention: 35.8, d30Retention: 19.8, impressions: 545000, clicks: 3978, ctr: 0.73, ecpm: 12.4500, revenue: 6785.25, ltv: 1.16, cpi: 0.118, roas: 184 },
        { month: 'October 2025', installs: 12800, dau: 52400, wau: 131000, mau: 262000, d1Retention: 52.4, d7Retention: 34.2, d30Retention: 18.5, impressions: 418000, clicks: 2926, ctr: 0.70, ecpm: 11.2400, revenue: 4698.32, ltv: 1.08, cpi: 0.124, roas: 172 },
        { month: 'September 2025', installs: 10500, dau: 42800, wau: 107000, mau: 214000, d1Retention: 51.1, d7Retention: 32.8, d30Retention: 17.2, impressions: 328000, clicks: 2230, ctr: 0.68, ecpm: 10.4800, revenue: 3437.44, ltv: 0.98, cpi: 0.132, roas: 158 },
        { month: 'August 2025', installs: 8600, dau: 34800, wau: 87000, mau: 174000, d1Retention: 49.8, d7Retention: 31.5, d30Retention: 16.1, impressions: 258000, clicks: 1720, ctr: 0.67, ecpm: 9.8200, revenue: 2533.56, ltv: 0.88, cpi: 0.142, roas: 145 },
        { month: 'July 2025', installs: 7200, dau: 29200, wau: 73000, mau: 146000, d1Retention: 48.6, d7Retention: 30.2, d30Retention: 15.1, impressions: 216000, clicks: 1440, ctr: 0.67, ecpm: 9.2400, revenue: 1996.20, ltv: 0.79, cpi: 0.150, roas: 132 },
      ],
      monetisationTable: [
        { month: 'January 2026', adRevenue: 12115, arpdau: 0.1286, imprPerDau: 9.1, imprBanner: 2.2, imprInter: 2.8, imprReward: 2.4, ecpm: 14.12, fillRate: 96.8 },
        { month: 'December 2025', adRevenue: 9188, arpdau: 0.1169, imprPerDau: 8.8, imprBanner: 2.1, imprInter: 2.6, imprReward: 2.2, ecpm: 13.28, fillRate: 96.2 },
        { month: 'November 2025', adRevenue: 6785, arpdau: 0.1057, imprPerDau: 8.5, imprBanner: 2.0, imprInter: 2.4, imprReward: 2.0, ecpm: 12.45, fillRate: 95.5 },
        { month: 'October 2025', adRevenue: 4698, arpdau: 0.0897, imprPerDau: 8.0, imprBanner: 1.9, imprInter: 2.2, imprReward: 1.8, ecpm: 11.24, fillRate: 94.8 },
        { month: 'September 2025', adRevenue: 3437, arpdau: 0.0803, imprPerDau: 7.7, imprBanner: 1.8, imprInter: 2.0, imprReward: 1.6, ecpm: 10.48, fillRate: 94.1 },
        { month: 'August 2025', adRevenue: 2534, arpdau: 0.0728, imprPerDau: 7.4, imprBanner: 1.7, imprInter: 1.9, imprReward: 1.5, ecpm: 9.82, fillRate: 93.5 },
        { month: 'July 2025', adRevenue: 1996, arpdau: 0.0684, imprPerDau: 7.4, imprBanner: 1.8, imprInter: 1.8, imprReward: 1.4, ecpm: 9.24, fillRate: 92.8 },
      ],
      engagementTable: [
        { month: 'January 2026', dau: 94200, avgSessions: 5.8, avgDuration: 22.5, davDau: 92.8, pauConversion: 8.2 },
        { month: 'December 2025', dau: 78600, avgSessions: 5.6, avgDuration: 21.2, davDau: 91.5, pauConversion: 7.8 },
        { month: 'November 2025', dau: 64200, avgSessions: 5.4, avgDuration: 19.8, davDau: 90.2, pauConversion: 7.4 },
        { month: 'October 2025', dau: 52400, avgSessions: 5.2, avgDuration: 18.5, davDau: 88.8, pauConversion: 6.9 },
        { month: 'September 2025', dau: 42800, avgSessions: 5.0, avgDuration: 17.2, davDau: 87.5, pauConversion: 6.4 },
        { month: 'August 2025', dau: 34800, avgSessions: 4.8, avgDuration: 16.1, davDau: 86.2, pauConversion: 6.0 },
        { month: 'July 2025', dau: 29200, avgSessions: 4.7, avgDuration: 15.2, davDau: 85.1, pauConversion: 5.8 },
      ],
      uaTable: [
        { month: 'January 2026', uaCost: 2311, installs: 21400, cpi: 0.108, organic: 5820, paid: 15580, roasD7: 208, roasD30: 272, payback: 9 },
        { month: 'December 2025', uaCost: 2040, installs: 18200, cpi: 0.112, organic: 4960, paid: 13240, roasD7: 195, roasD30: 251, payback: 10 },
        { month: 'November 2025', uaCost: 1819, installs: 15400, cpi: 0.118, organic: 4180, paid: 11220, roasD7: 184, roasD30: 228, payback: 11 },
        { month: 'October 2025', uaCost: 1590, installs: 12800, cpi: 0.124, organic: 3460, paid: 9340, roasD7: 172, roasD30: 205, payback: 12 },
        { month: 'September 2025', uaCost: 1386, installs: 10500, cpi: 0.132, organic: 2860, paid: 7640, roasD7: 158, roasD30: 185, payback: 13 },
        { month: 'August 2025', uaCost: 1221, installs: 8600, cpi: 0.142, organic: 2320, paid: 6280, roasD7: 145, roasD30: 162, payback: 15 },
        { month: 'July 2025', uaCost: 1080, installs: 7200, cpi: 0.150, organic: 1950, paid: 5250, roasD7: 132, roasD30: 148, payback: 17 },
      ]
    },
    clevel: {
      name: 'Portfolio Overview',
      isPortfolio: true,
      current: { mrr: 2850000, arr: 34200000, apps: 8, totalDau: 3790000, avgArpdau: 0.062, avgRoas: 152 },
      previous: { mrr: 2340000, arr: 28080000, apps: 7, totalDau: 3102000, avgArpdau: 0.058, avgRoas: 138 },
      cohortTable: [
        { month: 'January 2026', installs: 450100, dau: 1190400, wau: 2976000, mau: 5952000, d1Retention: 42.5, d7Retention: 25.9, d30Retention: 13.2, impressions: 10013000, clicks: 48562, ctr: 0.49, ecpm: 6.12, revenue: 61279.56, ltv: 0.60, cpi: 0.046, roas: 162 },
        { month: 'December 2025', installs: 388800, dau: 1004900, wau: 2512250, mau: 5024500, d1Retention: 41.2, d7Retention: 24.8, d30Retention: 12.4, impressions: 8236000, clicks: 39522, ctr: 0.48, ecpm: 5.68, revenue: 46780.48, ltv: 0.56, cpi: 0.048, roas: 152 },
        { month: 'November 2025', installs: 326800, dau: 825800, wau: 2064500, mau: 4129000, d1Retention: 39.8, d7Retention: 23.6, d30Retention: 11.6, impressions: 6366000, clicks: 29364, ctr: 0.46, ecpm: 5.24, revenue: 33357.84, ltv: 0.52, cpi: 0.050, roas: 145 },
        { month: 'October 2025', installs: 271400, dau: 676200, wau: 1690500, mau: 3381000, d1Retention: 38.2, d7Retention: 22.4, d30Retention: 10.8, impressions: 4874000, clicks: 22082, ctr: 0.45, ecpm: 4.82, revenue: 23492.68, ltv: 0.48, cpi: 0.052, roas: 138 },
        { month: 'September 2025', installs: 224200, dau: 560400, wau: 1401000, mau: 2802000, d1Retention: 36.8, d7Retention: 21.2, d30Retention: 10.1, impressions: 3862000, clicks: 17150, ctr: 0.44, ecpm: 4.42, revenue: 17066.04, ltv: 0.44, cpi: 0.055, roas: 128 },
        { month: 'August 2025', installs: 183500, dau: 457700, wau: 1144250, mau: 2288500, d1Retention: 35.5, d7Retention: 20.1, d30Retention: 9.4, impressions: 3030000, clicks: 13180, ctr: 0.43, ecpm: 4.08, revenue: 12362.40, ltv: 0.40, cpi: 0.058, roas: 118 },
        { month: 'July 2025', installs: 151200, dau: 378600, wau: 946500, mau: 1893000, d1Retention: 34.5, d7Retention: 19.2, d30Retention: 8.8, impressions: 2476000, clicks: 10728, ctr: 0.43, ecpm: 3.82, revenue: 9457.32, ltv: 0.36, cpi: 0.060, roas: 108 },
      ],
      appsBreakdown: [
        { name: 'Puzzle Game', profit: 320000, dau: 890000, share: 11.2, manager: 'Anton Smirnov' },
        { name: 'Idle Tycoon', profit: 280000, dau: 520000, share: 9.8, manager: 'Anton Smirnov' },
        { name: 'Stack Tower', profit: 250000, dau: 2100000, share: 8.8, manager: 'Serhii Shcherbyna' },
        { name: 'Word Master', profit: 220000, dau: 380000, share: 7.7, manager: 'Serhii Shcherbyna' },
        { name: 'Color Fill', profit: 180000, dau: 450000, share: 6.3, manager: 'Serhii Shcherbyna' },
        { name: 'Merge Kingdom', profit: 420000, dau: 280000, share: 14.7, manager: 'Rashid Sabirov' },
        { name: 'Tower Defense', profit: 380000, dau: 120000, share: 13.3, manager: 'Rashid Sabirov' },
        { name: 'Racing Rivals', profit: 800000, dau: 50000, share: 28.1, manager: 'Rashid Sabirov' },
      ],
      managers: [
        { name: 'Anton Smirnov', apps: 2, profit: 600000, dau: 1410000, share: 21.0 },
        { name: 'Serhii Shcherbyna', apps: 3, profit: 650000, dau: 2930000, share: 22.8 },
        { name: 'Rashid Sabirov', apps: 3, profit: 1600000, dau: 450000, share: 56.1 },
      ],
      managersCohortTable: {
        'Anton Smirnov': [
          { month: 'October 2025', installs: 73600, dau: 203800, d1Retention: 44.2, d7Retention: 28.2, impressions: 1516000, clicks: 7400, ctr: 0.49, ecpm: 5.54, revenue: 8398.64 },
          { month: 'November 2025', installs: 87400, dau: 243600, d1Retention: 45.6, d7Retention: 29.1, impressions: 1936000, clicks: 9842, ctr: 0.51, ecpm: 5.98, revenue: 11577.28 },
          { month: 'December 2025', installs: 102600, dau: 281300, d1Retention: 46.4, d7Retention: 30.1, impressions: 2384000, clicks: 12660, ctr: 0.53, ecpm: 6.30, revenue: 15019.20 },
        ],
        'Serhii Shcherbyna': [
          { month: 'October 2025', installs: 156200, dau: 382400, d1Retention: 34.8, d7Retention: 18.2, impressions: 2456000, clicks: 10292, ctr: 0.42, ecpm: 3.42, revenue: 8399.52 },
          { month: 'November 2025', installs: 189400, dau: 468200, d1Retention: 36.2, d7Retention: 19.4, impressions: 3218000, clicks: 13514, ctr: 0.42, ecpm: 3.78, revenue: 12164.04 },
          { month: 'December 2025', installs: 224800, dau: 578600, d1Retention: 37.6, d7Retention: 20.6, impressions: 4124000, clicks: 18145, ctr: 0.44, ecpm: 4.12, revenue: 16990.88 },
        ],
        'Rashid Sabirov': [
          { month: 'October 2025', installs: 41600, dau: 90000, d1Retention: 48.6, d7Retention: 32.8, impressions: 902000, clicks: 4390, ctr: 0.49, ecpm: 7.42, revenue: 6692.84 },
          { month: 'November 2025', installs: 50000, dau: 114000, d1Retention: 50.2, d7Retention: 34.2, impressions: 1212000, clicks: 6008, ctr: 0.50, ecpm: 7.92, revenue: 9599.04 },
          { month: 'December 2025', installs: 61400, dau: 145000, d1Retention: 51.8, d7Retention: 35.6, impressions: 1728000, clicks: 8717, ctr: 0.50, ecpm: 8.54, revenue: 14757.12 },
        ]
      },
      managersMonetisation: {
        'Anton Smirnov': [
          { month: 'October 2025', adRevenue: 8399, arpdau: 0.0412, imprPerDau: 7.4, ecpm: 5.54, fillRate: 95.8 },
          { month: 'November 2025', adRevenue: 11577, arpdau: 0.0475, imprPerDau: 7.9, ecpm: 5.98, fillRate: 96.4 },
          { month: 'December 2025', adRevenue: 15019, arpdau: 0.0534, imprPerDau: 8.5, ecpm: 6.30, fillRate: 97.1 },
        ],
        'Serhii Shcherbyna': [
          { month: 'October 2025', adRevenue: 8400, arpdau: 0.0220, imprPerDau: 6.4, ecpm: 3.42, fillRate: 91.2 },
          { month: 'November 2025', adRevenue: 12164, arpdau: 0.0260, imprPerDau: 6.9, ecpm: 3.78, fillRate: 92.1 },
          { month: 'December 2025', adRevenue: 16991, arpdau: 0.0294, imprPerDau: 7.1, ecpm: 4.12, fillRate: 93.0 },
        ],
        'Rashid Sabirov': [
          { month: 'October 2025', adRevenue: 6693, arpdau: 0.0744, imprPerDau: 10.0, ecpm: 7.42, fillRate: 94.5 },
          { month: 'November 2025', adRevenue: 9599, arpdau: 0.0842, imprPerDau: 10.6, ecpm: 7.92, fillRate: 95.2 },
          { month: 'December 2025', adRevenue: 14757, arpdau: 0.1018, imprPerDau: 11.9, ecpm: 8.54, fillRate: 95.8 },
        ]
      },
      managersUA: {
        'Anton Smirnov': [
          { month: 'October 2025', uaCost: 5300, installs: 73600, cpi: 0.072, roasD7: 136, roasD30: 158 },
          { month: 'November 2025', uaCost: 6188, installs: 87400, cpi: 0.071, roasD7: 148, roasD30: 187 },
          { month: 'December 2025', uaCost: 7194, installs: 102600, cpi: 0.070, roasD7: 156, roasD30: 209 },
        ],
        'Serhii Shcherbyna': [
          { month: 'October 2025', uaCost: 5468, installs: 156200, cpi: 0.035, roasD7: 112, roasD30: 154 },
          { month: 'November 2025', uaCost: 6384, installs: 189400, cpi: 0.034, roasD7: 124, roasD30: 191 },
          { month: 'December 2025', uaCost: 7418, installs: 224800, cpi: 0.033, roasD7: 135, roasD30: 229 },
        ],
        'Rashid Sabirov': [
          { month: 'October 2025', uaCost: 4576, installs: 41600, cpi: 0.110, roasD7: 152, roasD30: 146 },
          { month: 'November 2025', uaCost: 5500, installs: 50000, cpi: 0.110, roasD7: 168, roasD30: 175 },
          { month: 'December 2025', uaCost: 6754, installs: 61400, cpi: 0.110, roasD7: 182, roasD30: 219 },
        ]
      },
      appsCohortComparison: [
        { name: 'Puzzle Game', manager: 'Anton Smirnov', 
          current: { profit: 320000, revenue: 480000, dau: 890000, installs: 61400, d1Ret: 44.2, d7Ret: 28.1, arpdau: 0.054, roas: 183 },
          previous: { profit: 275000, revenue: 412000, dau: 795000, installs: 52800, d1Ret: 43.5, d7Ret: 27.4, arpdau: 0.051, roas: 168 }
        },
        { name: 'Idle Tycoon', manager: 'Anton Smirnov',
          current: { profit: 280000, revenue: 410000, dau: 520000, installs: 41200, d1Ret: 48.5, d7Ret: 32.1, arpdau: 0.075, roas: 198 },
          previous: { profit: 218000, revenue: 325000, dau: 433000, installs: 34600, d1Ret: 47.8, d7Ret: 30.8, arpdau: 0.072, roas: 185 }
        },
        { name: 'Stack Tower', manager: 'Serhii Shcherbyna',
          current: { profit: 185000, revenue: 485000, dau: 1980000, installs: 245000, d1Ret: 33.1, d7Ret: 14.8, arpdau: 0.031, roas: 168 },
          previous: { profit: 210000, revenue: 520000, dau: 2100000, installs: 268000, d1Ret: 35.2, d7Ret: 17.2, arpdau: 0.034, roas: 197 }
        },
        { name: 'Word Master', manager: 'Serhii Shcherbyna',
          current: { profit: 220000, revenue: 285000, dau: 380000, installs: 42000, d1Ret: 38.5, d7Ret: 21.2, arpdau: 0.048, roas: 165 },
          previous: { profit: 198000, revenue: 258000, dau: 342000, installs: 38500, d1Ret: 37.2, d7Ret: 20.1, arpdau: 0.046, roas: 152 }
        },
        { name: 'Color Fill', manager: 'Serhii Shcherbyna',
          current: { profit: 145000, revenue: 208000, dau: 385000, installs: 48000, d1Ret: 30.2, d7Ret: 13.1, arpdau: 0.033, roas: 118 },
          previous: { profit: 180000, revenue: 245000, dau: 450000, installs: 58000, d1Ret: 32.8, d7Ret: 15.4, arpdau: 0.038, roas: 142 }
        },
        { name: 'Merge Kingdom', manager: 'Rashid Sabirov',
          current: { profit: 420000, revenue: 580000, dau: 280000, installs: 18200, d1Ret: 55.8, d7Ret: 37.4, arpdau: 0.128, roas: 218 },
          previous: { profit: 318000, revenue: 445000, dau: 212000, installs: 15400, d1Ret: 54.1, d7Ret: 35.8, arpdau: 0.122, roas: 195 }
        },
        { name: 'Tower Defense', manager: 'Rashid Sabirov',
          current: { profit: 358000, revenue: 465000, dau: 105000, installs: 7200, d1Ret: 50.8, d7Ret: 33.5, arpdau: 0.112, roas: 188 },
          previous: { profit: 380000, revenue: 485000, dau: 120000, installs: 8500, d1Ret: 52.4, d7Ret: 35.2, arpdau: 0.118, roas: 205 }
        },
        { name: 'Racing Rivals', manager: 'Rashid Sabirov',
          current: { profit: 800000, revenue: 920000, dau: 50000, installs: 3200, d1Ret: 48.2, d7Ret: 32.5, arpdau: 0.185, roas: 245 },
          previous: { profit: 620000, revenue: 725000, dau: 38000, installs: 2800, d1Ret: 46.8, d7Ret: 30.8, arpdau: 0.178, roas: 225 }
        },
      ]
    },
    rnd: {
      name: 'RnD отдел — A/B Тесты',
      isRnd: true,
      current: { activeTests: 12, completedThisMonth: 8, avgLift: 4.2, successRate: 67 },
      previous: { activeTests: 9, completedThisMonth: 6, avgLift: 3.8, successRate: 62 },
      activeTests: [
        { id: 'AB-147', app: 'Puzzle Game', name: 'Bidding vs Waterfall', type: 'Networks', status: 'running', startDate: '2025-12-15', traffic: 50, control: { arpdau: 0.0412, ecpm: 5.24, fillRate: 95.8 }, variant: { arpdau: 0.0458, ecpm: 5.72, fillRate: 97.1 }, lift: '+11.2%', confidence: 94, daysLeft: 5 },
        { id: 'AB-152', app: 'Idle Tycoon', name: 'Rewarded frequency cap 3→5', type: 'Settings', status: 'running', startDate: '2025-12-18', traffic: 30, control: { arpdau: 0.0685, ecpm: 7.12, fillRate: 94.2 }, variant: { arpdau: 0.0742, ecpm: 7.08, fillRate: 93.8 }, lift: '+8.3%', confidence: 87, daysLeft: 8 },
        { id: 'AB-155', app: 'Stack Tower', name: 'AppLovin MAX vs CAS', type: 'SDK', status: 'running', startDate: '2025-12-20', traffic: 20, control: { arpdau: 0.0318, ecpm: 3.85, fillRate: 91.2 }, variant: { arpdau: 0.0295, ecpm: 3.62, fillRate: 89.5 }, lift: '-7.2%', confidence: 82, daysLeft: 12 },
        { id: 'AB-158', app: 'Puzzle Game', name: 'Interstitial cooldown 45s→30s', type: 'Settings', status: 'running', startDate: '2025-12-22', traffic: 40, control: { arpdau: 0.0412, ecpm: 5.24, fillRate: 95.8 }, variant: { arpdau: 0.0438, ecpm: 5.18, fillRate: 95.2 }, lift: '+6.3%', confidence: 71, daysLeft: 14 },
        { id: 'AB-161', app: 'Idle Tycoon', name: 'Unity Ads priority boost', type: 'Networks', status: 'paused', startDate: '2025-12-10', traffic: 25, control: { arpdau: 0.0685, ecpm: 7.12, fillRate: 94.2 }, variant: { arpdau: 0.0658, ecpm: 6.85, fillRate: 92.8 }, lift: '-3.9%', confidence: 78, daysLeft: 0 },
      ],
      completedTests: [
        { id: 'AB-138', app: 'Puzzle Game', name: 'Banner refresh 30s→45s', type: 'Settings', status: 'winner', completedDate: '2025-12-14', traffic: 50, controlArpdau: 0.0398, variantArpdau: 0.0425, lift: '+6.8%', confidence: 96, revenue: '+$2,840/mo', deployed: true },
        { id: 'AB-141', app: 'Stack Tower', name: 'ironSource bidding enabled', type: 'Networks', status: 'winner', completedDate: '2025-12-12', traffic: 50, controlArpdau: 0.0285, variantArpdau: 0.0312, lift: '+9.5%', confidence: 98, revenue: '+$5,120/mo', deployed: true },
        { id: 'AB-144', app: 'Idle Tycoon', name: 'CAS SDK 3.8→3.9', type: 'SDK', status: 'winner', completedDate: '2025-12-08', traffic: 30, controlArpdau: 0.0642, variantArpdau: 0.0698, lift: '+8.7%', confidence: 95, revenue: '+$3,650/mo', deployed: true },
        { id: 'AB-135', app: 'Puzzle Game', name: 'AdMob priority reduce', type: 'Networks', status: 'loser', completedDate: '2025-12-05', traffic: 40, controlArpdau: 0.0398, variantArpdau: 0.0372, lift: '-6.5%', confidence: 91, revenue: '-$1,920/mo', deployed: false },
        { id: 'AB-132', app: 'Stack Tower', name: 'Rewarded opt-in popup', type: 'Settings', status: 'inconclusive', completedDate: '2025-12-01', traffic: 50, controlArpdau: 0.0285, variantArpdau: 0.0289, lift: '+1.4%', confidence: 52, revenue: '+$680/mo', deployed: false },
        { id: 'AB-128', app: 'Idle Tycoon', name: 'Vungle integration test', type: 'Networks', status: 'loser', completedDate: '2025-11-28', traffic: 25, controlArpdau: 0.0642, variantArpdau: 0.0598, lift: '-6.9%', confidence: 89, revenue: '-$2,180/mo', deployed: false },
      ],
      networkTests: [
        { network: 'AppLovin', testsRun: 8, wins: 5, avgLift: '+5.2%', bestResult: 'Bidding +11.2%' },
        { network: 'ironSource', testsRun: 6, wins: 4, avgLift: '+4.8%', bestResult: 'Bidding +9.5%' },
        { network: 'AdMob', testsRun: 5, wins: 2, avgLift: '-1.2%', bestResult: 'Refresh rate +3.1%' },
        { network: 'Unity Ads', testsRun: 4, wins: 1, avgLift: '-2.4%', bestResult: 'Priority test +1.8%' },
      ],
      sdkTests: [
        { sdk: 'CAS 3.9.2', testsRun: 3, avgLiftVsPrev: '+7.8%', adopted: '58%', recommendation: 'Rollout to all' },
        { sdk: 'CAS 3.9.0', testsRun: 2, avgLiftVsPrev: '+4.2%', adopted: '25%', recommendation: 'Update available' },
        { sdk: 'MAX 12.1', testsRun: 2, avgLiftVsPrev: '-3.5%', adopted: '0%', recommendation: 'Not recommended' },
      ]
    },
  };

  const treeData = {
    id: 'mrr',
    title: 'MRR',
    subtitle: 'Monthly Recurring Revenue',
    value: '$2.85M',
    change: '+22% MoM',
    formula: 'Σ (App Revenue − UA Cost)',
    color: 'bg-purple-500',
    headerColor: 'bg-purple-600',
    zone: 'clevel',
    children: [
      {
        id: 'manager_anton',
        title: 'Anton Smirnov',
        subtitle: 'Account Manager',
        value: '$600K',
        change: '+18%',
        formula: '2 apps',
        color: 'bg-amber-400',
        headerColor: 'bg-amber-500',
        zone: 'clevel',
        children: [
          {
            id: 'app1',
            title: 'Puzzle Game',
            subtitle: 'Casual',
            value: '$320K',
            change: '+15%',
            formula: 'Ad Rev − UA Cost',
            color: 'bg-purple-400',
            headerColor: 'bg-purple-500',
            zone: 'producer',
            children: [
              {
                id: 'ad_revenue_1',
                title: 'Ad Revenue',
                value: '$480K',
                change: '+18%',
                formula: 'DAU × ARPDAU',
                color: 'bg-emerald-400',
                headerColor: 'bg-emerald-500',
                zone: 'monetisation',
                children: [
                  { 
                    id: 'dau_1', 
                    title: 'DAU', 
                    value: '890K', 
                    change: '+12%', 
                    color: 'bg-teal-400',
                    headerColor: 'bg-teal-500',
                    zone: 'producer',
                    children: [
                      { id: 'new_users_1', title: 'New Users', value: '45K/day', change: '+8%', color: 'bg-cyan-400', headerColor: 'bg-cyan-500', zone: 'ua' },
                      { id: 'retention_1', title: 'D7 Retention', value: '28%', change: '+2%', color: 'bg-cyan-400', headerColor: 'bg-cyan-500', zone: 'producer' },
                    ]
                  },
                  { 
                    id: 'arpdau_1', 
                    title: 'ARPDAU', 
                    value: '$0.054', 
                    change: '+5%', 
                    color: 'bg-amber-400',
                    headerColor: 'bg-amber-500',
                    zone: 'monetisation',
                    children: [
                      { id: 'impr_dau_1', title: 'Impr/DAU', value: '12.4', change: '+3%', color: 'bg-orange-400', headerColor: 'bg-orange-500', zone: 'monetisation' },
                      { 
                        id: 'ecpm_1', 
                        title: 'eCPM', 
                        value: '$4.35', 
                        change: '+2%', 
                        color: 'bg-orange-400', 
                        headerColor: 'bg-orange-500', 
                        zone: 'monetisation',
                        children: [
                          { id: 'ecpm_applovin', title: 'AppLovin', value: '$5.20', change: '+4%', color: 'bg-blue-400', headerColor: 'bg-blue-500', zone: 'monetisation' },
                          { id: 'ecpm_admob', title: 'AdMob', value: '$4.10', change: '+1%', color: 'bg-yellow-400', headerColor: 'bg-yellow-500', zone: 'monetisation' },
                          { id: 'ecpm_unity', title: 'Unity Ads', value: '$3.85', change: '-2%', color: 'bg-slate-400', headerColor: 'bg-slate-500', zone: 'monetisation' },
                          { id: 'ecpm_ironsrc', title: 'ironSource', value: '$4.60', change: '+3%', color: 'bg-violet-400', headerColor: 'bg-violet-500', zone: 'monetisation' },
                        ]
                      },
                      { 
                        id: 'fill_rate_1', 
                        title: 'Fill Rate', 
                        value: '96.3%', 
                        change: '+1.2%', 
                        color: 'bg-lime-400', 
                        headerColor: 'bg-lime-500', 
                        zone: 'monetisation',
                        children: [
                          { id: 'fill_applovin', title: 'AppLovin', value: '98.2%', change: '+0.5%', color: 'bg-blue-400', headerColor: 'bg-blue-500', zone: 'monetisation' },
                          { id: 'fill_admob', title: 'AdMob', value: '97.8%', change: '+0.8%', color: 'bg-yellow-400', headerColor: 'bg-yellow-500', zone: 'monetisation' },
                          { id: 'fill_unity', title: 'Unity Ads', value: '94.5%', change: '-0.5%', color: 'bg-slate-400', headerColor: 'bg-slate-500', zone: 'monetisation' },
                          { id: 'fill_ironsrc', title: 'ironSource', value: '96.1%', change: '+1.0%', color: 'bg-violet-400', headerColor: 'bg-violet-500', zone: 'monetisation' },
                        ]
                      },
                      { 
                        id: 'sov_1', 
                        title: 'SoV Networks', 
                        value: '100%', 
                        change: '', 
                        color: 'bg-indigo-400', 
                        headerColor: 'bg-indigo-500', 
                        zone: 'monetisation',
                        children: [
                          { id: 'sov_applovin', title: 'AppLovin', value: '32%', change: '+2%', color: 'bg-blue-400', headerColor: 'bg-blue-500', zone: 'monetisation' },
                          { id: 'sov_admob', title: 'AdMob', value: '28%', change: '-1%', color: 'bg-yellow-400', headerColor: 'bg-yellow-500', zone: 'monetisation' },
                          { id: 'sov_unity', title: 'Unity Ads', value: '22%', change: '-2%', color: 'bg-slate-400', headerColor: 'bg-slate-500', zone: 'monetisation' },
                          { id: 'sov_ironsrc', title: 'ironSource', value: '18%', change: '+1%', color: 'bg-violet-400', headerColor: 'bg-violet-500', zone: 'monetisation' },
                        ]
                      },
                    ]
                  },
                ]
              },
              {
                id: 'ua_cost_1',
                title: 'UA Cost',
                value: '$160K',
                change: '+22%',
                formula: 'Installs × CPI',
                color: 'bg-red-400',
                headerColor: 'bg-red-500',
                zone: 'ua',
                children: [
                  { 
                    id: 'installs_1', 
                    title: 'Installs', 
                    value: '1.4M', 
                    change: '+18%', 
                    color: 'bg-pink-400', 
                    headerColor: 'bg-pink-500',
                    zone: 'ua',
                    children: [
                      { id: 'organic_1', title: 'Organic', value: '420K', change: '+5%', color: 'bg-pink-300', headerColor: 'bg-pink-400', zone: 'ua' },
                      { id: 'paid_1', title: 'Paid', value: '980K', change: '+24%', color: 'bg-pink-300', headerColor: 'bg-pink-400', zone: 'ua' },
                    ]
                  },
                  { 
                    id: 'cpi_1', 
                    title: 'CPI', 
                    value: '$0.11', 
                    change: '+3%', 
                    color: 'bg-pink-400', 
                    headerColor: 'bg-pink-500',
                    zone: 'ua',
                    children: [
                      { id: 'cpi_ios_1', title: 'CPI iOS', value: '$0.18', change: '+5%', color: 'bg-pink-300', headerColor: 'bg-pink-400', zone: 'ua' },
                      { id: 'cpi_android_1', title: 'CPI Android', value: '$0.08', change: '+1%', color: 'bg-pink-300', headerColor: 'bg-pink-400', zone: 'ua' },
                    ]
                  },
                  { 
                    id: 'roas_1', 
                    title: 'ROAS D7', 
                    value: '145%', 
                    change: '+12%', 
                    color: 'bg-rose-400', 
                    headerColor: 'bg-rose-500',
                    zone: 'ua'
                  },
                  { 
                    id: 'payback_1', 
                    title: 'Payback', 
                    value: '14 days', 
                    change: '-2d', 
                    color: 'bg-rose-400', 
                    headerColor: 'bg-rose-500',
                    zone: 'ua'
                  },
                ]
              },
            ]
          },
          {
            id: 'app_idle',
            title: 'Idle Tycoon',
            subtitle: 'Idle/Clicker',
            value: '$280K',
            change: '+28%',
            formula: 'Ad Rev − UA Cost',
            color: 'bg-teal-400',
            headerColor: 'bg-teal-500',
            zone: 'producer',
          },
        ]
      },
      {
        id: 'manager_rashid',
        title: 'Rashid Sabirov',
        subtitle: 'Account Manager',
        value: '$1.6M',
        change: '+25%',
        formula: '4 apps',
        color: 'bg-amber-400',
        headerColor: 'bg-amber-500',
        zone: 'clevel',
        children: [
          {
            id: 'app_merge',
            title: 'Merge Kingdom',
            subtitle: 'Merge/Puzzle',
            value: '$420K',
            change: '+32%',
            formula: 'Ad Rev − UA Cost',
            color: 'bg-indigo-400',
            headerColor: 'bg-indigo-500',
            zone: 'producer',
          },
          {
            id: 'app_tower',
            title: 'Tower Defense',
            subtitle: 'Strategy',
            value: '$380K',
            change: '+22%',
            formula: 'Ad Rev − UA Cost',
            color: 'bg-rose-400',
            headerColor: 'bg-rose-500',
            zone: 'producer',
          },
          {
            id: 'app_racing',
            title: 'Racing Rivals',
            subtitle: 'Racing',
            value: '$520K',
            change: '+35%',
            formula: 'Ad Rev − UA Cost',
            color: 'bg-orange-400',
            headerColor: 'bg-orange-500',
            zone: 'producer',
          },
          {
            id: 'app_word',
            title: 'Word Master',
            subtitle: 'Word Game',
            value: '$280K',
            change: '+18%',
            formula: 'Ad Rev − UA Cost',
            color: 'bg-cyan-400',
            headerColor: 'bg-cyan-500',
            zone: 'producer',
          },
        ]
      },
    ]
  };

  const sections = [
    { id: 'northstar', name: 'North Star', bg: 'bg-blue-900/20', text: 'text-blue-400' },
    { id: 'app', name: 'Приложение', bg: 'bg-purple-900/20', text: 'text-purple-400' },
    { id: 'adrevenue', name: 'Монетизация', bg: 'bg-green-900/20', text: 'text-green-400' },
    { id: 'networks', name: 'Ad Networks', bg: 'bg-cyan-900/20', text: 'text-cyan-400' },
    { id: 'experiment', name: 'Эксперименты', bg: 'bg-orange-900/20', text: 'text-orange-400' },
    { id: 'ua', name: 'UA', bg: 'bg-pink-900/20', text: 'text-pink-400' },
  ];

  const initialMetrics = [
    // North Star
    { id: 'm1', name: 'MRR', description: 'Monthly Recurring Revenue = Σ App Revenue (net)', role: 'C-Level', sources: ['BI', 'CAS Core'], question: 'Сколько мы зарабатываем в месяц?', section: 'northstar', version: 'MVP' },
    { id: 'm2', name: 'ARR', description: 'Annual Run Rate = MRR × 12', role: 'C-Level', sources: ['BI'], question: 'Куда мы идём по году?', section: 'northstar', version: 'MVP' },
    { id: 'm3', name: 'Revenue Growth %', description: '(MRR_t − MRR_t-1) / MRR_t-1', role: 'C-Level', sources: ['BI'], question: 'Растём ли мы и с какой скоростью?', section: 'northstar', version: 'v1.xx' },
    
    // App / Producer
    { id: 'm4', name: 'App Profit', description: 'Ad Revenue − UA Cost', role: 'Producer', sources: ['CAS', 'MMP'], question: 'Приложение прибыльно?', section: 'app', version: 'MVP' },
    { id: 'm5', name: 'DAU', description: 'Daily Active Users', role: 'Producer', sources: ['Firebase', 'Amplitude'], question: 'Сколько людей играет?', section: 'app', version: 'MVP' },
    { id: 'm6', name: 'AVG Session Count', description: 'Avg Sessions per User per Day', role: 'Producer', sources: ['SDK'], question: 'Как часто пользователь заходит в игру?', section: 'app', version: 'MVP' },
    { id: 'm7', name: 'AVG Session Duration', description: 'Avg Session Length', role: 'Producer', sources: ['SDK'], question: 'Насколько «залипают» в игре?', section: 'app', version: 'MVP' },
    { id: 'm8', name: 'DAV / DAU', description: 'Daily Active Viewers / DAU', role: 'Producer, Monetisation', sources: ['SDK', 'CAS'], question: 'Какой % DAU видит рекламу?', section: 'app', version: 'v1.xx' },
    { id: 'm9', name: 'conversion_PAU', description: 'Paying Active Users / DAU', role: 'Producer', sources: ['SDK', 'IAP'], question: 'Конвертируем ли DAU в платящих?', section: 'app', version: 'v1.xx' },
    { id: 'm10', name: 'Retention D1', description: 'Users D1 / Users D0', role: 'Producer', sources: ['Firebase'], question: 'Зацепила ли игра?', section: 'app', version: 'MVP' },
    { id: 'm11', name: 'Retention D7', description: 'Users D7 / Users D0', role: 'Producer', sources: ['Firebase'], question: 'Есть ли устойчивое удержание?', section: 'app', version: 'v1.xx' },
    { id: 'm12', name: 'LTV', description: 'ARPDAU × Lifetime Days', role: 'Producer, UA', sources: ['BI', 'AppsFlyer'], question: 'Сколько приносит юзер за жизнь?', section: 'app', version: 'v1.xx' },
    
    // Monetisation
    { id: 'm13', name: 'Ad Revenue', description: 'Σ Ad Revenue', role: 'Monetisation', sources: ['CAS', 'Ad Networks'], question: 'Сколько приносит реклама?', section: 'adrevenue', version: 'MVP' },
    { id: 'm14', name: 'ARPDAU', description: 'Revenue ÷ DAU', role: 'Monetisation', sources: ['CAS'], question: 'Эффективна ли монетизация?', section: 'adrevenue', version: 'MVP' },
    { id: 'm15', name: 'Impressions / DAU', description: 'Impressions ÷ DAU', role: 'Monetisation', sources: ['CAS'], question: 'Достаточно ли рекламы на юзера?', section: 'adrevenue', version: 'MVP' },
    { id: 'm16', name: 'Impr / Sess Banner', description: 'Banner Impressions ÷ Sessions', role: 'Monetisation', sources: ['CAS', 'SDK'], question: 'Достаточно ли баннеров?', section: 'adrevenue', version: 'MVP' },
    { id: 'm17', name: 'Impr / Sess Inter', description: 'Interstitial Impressions ÷ Sessions', role: 'Monetisation', sources: ['CAS', 'SDK'], question: 'Не теряем ли interstitial показы?', section: 'adrevenue', version: 'MVP' },
    { id: 'm18', name: 'Impr / Sess Reward', description: 'Rewarded Impressions ÷ Sessions', role: 'Monetisation', sources: ['CAS', 'SDK'], question: 'Достаточно ли rewarded возможностей?', section: 'adrevenue', version: 'MVP' },
    { id: 'm19', name: 'Ads / Session', description: 'Ads shown ÷ Sessions', role: 'Monetisation', sources: ['SDK'], question: 'Не перегружаем ли UX рекламой?', section: 'adrevenue', version: 'v1.xx' },
    { id: 'm20', name: 'eCPM', description: 'Revenue ÷ Impressions × 1000', role: 'Monetisation', sources: ['CAS', 'Networks'], question: 'Сколько платят рекламодатели?', section: 'adrevenue', version: 'MVP' },
    { id: 'm21', name: 'Fill Rate', description: 'Filled ÷ Requests', role: 'Monetisation', sources: ['CAS'], question: 'Теряем ли показы?', section: 'adrevenue', version: 'MVP' },
    { id: 'm22', name: 'NoFill Rate', description: '1 − Fill Rate', role: 'Monetisation', sources: ['CAS'], question: 'Где потери выручки?', section: 'adrevenue', version: 'v1.xx' },
    { id: 'm23', name: 'SoV by Network', description: 'Impr_network ÷ total impr', role: 'Monetisation', sources: ['CAS'], question: 'Есть ли зависимость от одной сети?', section: 'adrevenue', version: 'v1.xx' },
    
    // Ad Networks
    { id: 'n1', name: 'Network Revenue', description: 'Revenue from specific ad network', role: 'Monetisation', sources: ['CAS', 'Network Dashboard'], question: 'Сколько приносит сеть?', section: 'networks', version: 'MVP' },
    { id: 'n2', name: 'Network eCPM', description: 'eCPM per network = Revenue_net ÷ Impr_net × 1000', role: 'Monetisation', sources: ['CAS', 'Network API'], question: 'Какая сеть платит лучше?', section: 'networks', version: 'MVP' },
    { id: 'n3', name: 'Network Fill Rate', description: 'Filled_net ÷ Requests_net', role: 'Monetisation', sources: ['CAS'], question: 'Какая сеть заполняет лучше?', section: 'networks', version: 'MVP' },
    { id: 'n4', name: 'Network SoV', description: 'Share of Voice = Impr_net ÷ Total_impr', role: 'Monetisation', sources: ['CAS'], question: 'Какая доля показов у сети?', section: 'networks', version: 'MVP' },
    { id: 'n5', name: 'Network Latency', description: 'Avg response time in ms', role: 'Monetisation', sources: ['CAS', 'SDK'], question: 'Тормозит ли сеть показы?', section: 'networks', version: 'v1.xx' },
    { id: 'n6', name: 'Network Win Rate', description: 'Auctions won ÷ Auctions participated', role: 'Monetisation', sources: ['CAS'], question: 'Как часто сеть выигрывает аукцион?', section: 'networks', version: 'v1.xx' },
    { id: 'n7', name: 'Network Bid Price', description: 'Avg bid in auction', role: 'Monetisation', sources: ['CAS'], question: 'Сколько сеть готова платить?', section: 'networks', version: 'v1.xx' },
    { id: 'n8', name: 'Network CTR', description: 'Clicks_net ÷ Impr_net', role: 'Monetisation', sources: ['CAS', 'Network'], question: 'Качественный ли трафик сети?', section: 'networks', version: 'v1.xx' },
    { id: 'n9', name: 'Network Render Rate', description: 'Rendered ÷ Loaded', role: 'Monetisation', sources: ['SDK'], question: 'Показывается ли загруженная реклама?', section: 'networks', version: 'v2.xx' },
    { id: 'n10', name: 'Bidding vs Waterfall', description: 'Revenue split by auction type', role: 'Monetisation', sources: ['CAS'], question: 'Что эффективнее — bidding или waterfall?', section: 'networks', version: 'v2.xx' },
    
    // Experiments
    { id: 'm24', name: 'Experiment ID', description: 'Experiment identifier', role: 'Monetisation', sources: ['Experiment Service'], question: 'К какому тесту относятся данные?', section: 'experiment', version: 'v1.xx' },
    { id: 'm25', name: 'Cohort ID', description: 'User → Test / Control', role: 'Monetisation', sources: ['SDK', 'Server'], question: 'Пользователь в одной когорте?', section: 'experiment', version: 'v1.xx' },
    { id: 'm26', name: 'ARPDAU uplift %', description: '(Test − Control) / Control', role: 'Monetisation', sources: ['BI'], question: 'Дал ли тест прирост?', section: 'experiment', version: 'v1.xx' },
    { id: 'm27', name: 'Revenue uplift $', description: 'ARPDAU uplift × DAU', role: 'Monetisation, C-Level', sources: ['BI'], question: 'Сколько денег дал тест?', section: 'experiment', version: 'v1.xx' },
    { id: 'm28', name: 'DAU Parity', description: 'DAU_test vs control', role: 'Monetisation', sources: ['BI'], question: 'Валиден ли эксперимент?', section: 'experiment', version: 'v1.xx' },
    { id: 'm29', name: 'Stability D1/D3/D7', description: 'Uplift over time', role: 'Monetisation', sources: ['BI'], question: 'Устойчив ли результат?', section: 'experiment', version: 'v2.xx' },
    { id: 'm30', name: 'Rollback Flag', description: 'Auto yes/no', role: 'Monetisation', sources: ['BI Rules'], question: 'Нужно ли откатить тест?', section: 'experiment', version: 'v2.xx' },
    
    // UA
    { id: 'm31', name: 'UA Cost', description: 'Installs × CPI', role: 'UA Manager', sources: ['AppsFlyer', 'Ad Platforms'], question: 'Сколько тратим на трафик?', section: 'ua', version: 'MVP' },
    { id: 'm32', name: 'Installs', description: 'New Users', role: 'UA Manager', sources: ['AppsFlyer'], question: 'Сколько привели юзеров?', section: 'ua', version: 'MVP' },
    { id: 'm33', name: 'CPI', description: 'Cost ÷ Installs', role: 'UA Manager', sources: ['Ad Platforms'], question: 'Сколько стоит юзер?', section: 'ua', version: 'MVP' },
    { id: 'm34', name: 'ROAS D7 / D30', description: 'Revenue ÷ Cost', role: 'UA Manager', sources: ['BI'], question: 'Окупается ли трафик?', section: 'ua', version: 'v1.xx' },
    { id: 'm35', name: 'Payback Days', description: 'Day when ROAS = 100%', role: 'UA Manager', sources: ['BI'], question: 'Когда вернём инвестиции?', section: 'ua', version: 'v2.xx' },
  ];

  const [metrics, setMetrics] = useState(initialMetrics);

  const updateMetric = (id, field, value) => {
    setMetrics(metrics.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const toggleNode = (id) => {
    const newSet = new Set(expandedNodes);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedNodes(newSet);
  };

  const formatNum = (n) => n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(0)+'K' : n;
  const calcDelta = (c, p) => { const d = ((c-p)/p*100).toFixed(1); return d > 0 ? '+'+d+'%' : d+'%'; };

  const data = dashboardData[selectedApp];

  const MetricCard = ({ label, value, prev, format, suffix }) => {
    const formatted = format ? format(value) : value;
    const delta = calcDelta(value, prev);
    const isUp = value >= prev;
    return (
      <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-slate-400 text-xs uppercase">{label}</div>
            <div className="text-xl font-bold text-white">{formatted}{suffix}</div>
          </div>
          <span className={`text-xs font-medium ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>{delta}</span>
        </div>
      </div>
    );
  };

  const zoneLabels = {
    clevel: 'C-Level',
    producer: 'Producer',
    monetisation: 'Monetisation',
    ua: 'UA Manager',
  };

  const TreeNode = ({ node, level = 0 }) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const zoneLabel = zoneLabels[node.zone] || 'Producer';

    return (
      <div className="flex flex-col items-center">
        {/* Node Card - Compact */}
        <div 
          onClick={() => hasChildren && toggleNode(node.id)}
          className={`relative rounded-lg overflow-hidden shadow-md cursor-pointer hover:scale-105 transition-transform ${hasChildren ? '' : 'cursor-default'}`}
          style={{ minWidth: level === 0 ? 140 : level === 1 ? 120 : 100 }}
        >
          {/* Header - Compact */}
          <div className={`${node.headerColor} px-2 py-1 text-center`}>
            <div className="text-white font-medium text-xs truncate">{node.title}</div>
          </div>
          {/* Body - Compact */}
          <div className="bg-slate-800 px-2 py-1.5 text-center">
            <div className="text-white text-base font-bold">{node.value}</div>
            <div className={`text-xs ${node.change.startsWith('+') ? 'text-emerald-400' : node.change.startsWith('-') ? 'text-red-400' : 'text-slate-400'}`}>
              {node.change}
            </div>
            {/* Zone Label - small dot */}
            <div className="flex justify-center mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${
                node.zone === 'clevel' ? 'bg-purple-500' : 
                node.zone === 'monetisation' ? 'bg-emerald-500' : 
                node.zone === 'ua' ? 'bg-pink-500' : 'bg-blue-500'
              }`} title={zoneLabel}></span>
            </div>
          </div>
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center text-white text-xs z-10">
              {isExpanded ? '−' : '+'}
            </div>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col items-center mt-4">
            {/* Vertical Line */}
            <div className="w-px h-4 bg-slate-600" />
            {/* Horizontal Line + Children */}
            <div className="relative flex items-start gap-2">
              {/* Horizontal connector */}
              {node.children.length > 1 && (
                <div 
                  className="absolute top-0 h-px bg-slate-600" 
                  style={{ 
                    left: '50%', 
                    right: '50%',
                    marginLeft: `-${(node.children.length - 1) * 50}%`,
                    marginRight: `-${(node.children.length - 1) * 50}%`,
                    width: `${(node.children.length - 1) * 100}%`,
                    transform: 'translateX(-50%)'
                  }}
                />
              )}
              {node.children.map((child, idx) => (
                <div key={child.id} className="flex flex-col items-center">
                  {/* Vertical line to child */}
                  <div className="w-px h-4 bg-slate-600" />
                  <TreeNode node={child} level={level + 1} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* H3: Responsive — "Use desktop" for <1024px */}
      <div className="lg:hidden flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8">
          <div className="text-4xl mb-4">🖥️</div>
          <h2 className="text-lg font-semibold text-slate-200 mb-2">Desktop Required</h2>
          <p className="text-sm text-slate-400 max-w-xs">This BI dashboard is optimized for desktop screens. Please use a device with a screen width of 1024px or more.</p>
        </div>
      </div>
      <div className="hidden lg:flex min-h-screen">

      {/* ===== Left Navigation (Cabinet) ===== */}
      <div
        className={`shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col transition-all duration-200 ${navExpanded ? 'w-52' : 'w-14'}`}
        onMouseEnter={() => setNavExpanded(true)}
        onMouseLeave={() => setNavExpanded(false)}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-3 py-4 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-500/20 shrink-0">CAS</div>
          {navExpanded && <span className="text-sm font-semibold text-slate-100 whitespace-nowrap overflow-hidden">CAS Mediation</span>}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2">
          {[
            { id: 'analytics', label: 'Analytics', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 5-9"/></svg> },
            { id: 'apps', label: 'Applications', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg> },
            { id: 'docs', label: 'Documentation', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h6M8 16h4"/></svg> },
            { id: 'support', label: 'Support', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 115 2c0 2-3 2-3 4"/><circle cx="12" cy="18" r="0.5" fill="currentColor"/></svg> },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveNavItem(item.id)}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap overflow-hidden ${
                activeNavItem === item.id
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
              title={!navExpanded ? item.label : undefined}
            >
              <span className="shrink-0 w-5 h-5 flex items-center justify-center">{item.icon}</span>
              {navExpanded && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-3 border-t border-slate-800">
          <div className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg ${navExpanded ? '' : 'justify-center'}`}>
            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0">U</div>
            {navExpanded && (
              <div className="overflow-hidden">
                <div className="text-xs text-slate-200 font-medium truncate">User</div>
                <div className="text-[10px] text-slate-500 truncate">Publisher</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== Main Area ===== */}
      <div className="flex-1 min-w-0 p-6">
      <div className="mx-auto max-w-screen-lg">

        {/* ===== Header: Title + Nav ===== */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-sm font-semibold text-slate-100 leading-tight tracking-tight">Analytics</span>
            <span className="text-[10px] text-slate-500 ml-2">v2.4.1</span>
          </div>
          <div className="bg-slate-800 rounded-xl p-1 flex gap-1">
            <button onClick={() => setActiveScreen('quickview')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeScreen === 'quickview' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}>
              Quick View
            </button>
            <button onClick={() => setActiveScreen('reports')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeScreen === 'reports' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}>
              Reports
            </button>
            {/* Glossary hidden */}
          </div>
        </div>

        {activeScreen === 'quickview' && (
          <>
            {/* Quick View Header: App selector + Client Type + Period Bar */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              {/* Left: App selector */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-xs uppercase tracking-wider">App:</span>
                <div className="flex bg-slate-800 rounded-lg p-0.5 gap-0.5">
                  {apps.map(app => (
                    <button
                      key={app.id}
                      onClick={() => setSelectedApp(app.id)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium ${selectedApp === app.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      {app.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Center: Client Type */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-xs uppercase tracking-wider">View:</span>
                <div className="flex bg-slate-800 rounded-lg p-0.5 gap-0.5">
                  {['PubC', 'L1', 'L2', 'Pub', 'Payments'].map(ct => (
                    <button
                      key={ct}
                      onClick={() => setClientType(ct)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium ${clientType === ct ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      {ct}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Period Bar */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                  >
                    {qvPeriodOptions.find(p => p.id === qvPeriod)?.label} ▾
                  </button>
                  {showPeriodDropdown && (
                    <div className="absolute right-0 top-full mt-1 bg-slate-900 border border-slate-600 rounded-lg shadow-xl z-50 min-w-[150px]">
                      {qvPeriodOptions.map(p => (
                        <button
                          key={p.id}
                          onClick={() => { setQvPeriod(p.id); setShowPeriodDropdown(false); }}
                          className={`w-full px-3 py-2 text-left text-xs hover:bg-slate-800 ${qvPeriod === p.id ? 'text-blue-400 bg-slate-800/50' : 'text-slate-300'}`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={qvCompare}
                    onChange={(e) => setQvCompare(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <span className="text-xs text-slate-400">Compare</span>
                </label>
              </div>
            </div>

            {/* B1: Metric Cards (hidden for Payments — has its own layout) */}
            {clientType !== 'Payments' && (() => {
              const cards = qvCardDefs[clientType] || [];
              const vals = getQvCardValues(selectedApp);
              return (
                <div className={`grid gap-3 mb-6 ${cards.length <= 4 ? 'grid-cols-4' : cards.length === 5 ? 'grid-cols-5' : 'grid-cols-6'}`}>
                  {cards.map(card => {
                    const cur = vals.current[card.key];
                    const prev = vals.previous[card.key];
                    const hasCur = cur != null && cur !== undefined;
                    const hasPrev = prev != null && prev !== undefined;
                    if (card.planned && !hasCur) {
                      return (
                        <div key={card.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 border-dashed">
                          <div className="text-slate-500 text-xs uppercase tracking-wider">{card.label}</div>
                          <div className="text-lg font-bold text-slate-600 mt-1">--</div>
                          <div className="text-[10px] text-slate-600 mt-0.5">Planned</div>
                        </div>
                      );
                    }
                    const delta = hasCur && hasPrev && prev !== 0 ? ((cur - prev) / prev * 100) : 0;
                    const isUp = delta >= 0;
                    return (
                      <div
                        key={card.id}
                        className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 cursor-pointer transition"
                        onClick={() => { setActiveScreen('reports'); addMeasure(card.id); }}
                        title={`Click to open in Reports`}
                      >
                        <div className="text-slate-400 text-xs uppercase tracking-wider" title={metricTooltips[card.id] ? `${metricTooltips[card.id].desc}\n= ${metricTooltips[card.id].formula}` : undefined}>{card.label}</div>
                        <div className="text-xl font-bold text-white mt-1">{hasCur ? card.format(cur) : '--'}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className={`text-xs font-medium ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isUp ? '+' : ''}{delta.toFixed(1)}%
                          </span>
                          <span className={`text-[10px] ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>{isUp ? '▲' : '▼'}</span>
                          {qvCompare && hasPrev && (
                            <span className="text-[10px] text-slate-500 ml-1">vs {card.format(prev)}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* B2: Trend Chart + B3: Breakdown Charts (hidden for Payments) */}
            {clientType !== 'Payments' && (() => {
              const trend = getQvTrendData(selectedApp);
              const minTrend = Math.min(...trend.map(t => t.value));
              const maxTrend = Math.max(...trend.map(t => t.value), 1);
              // Scale from 80% of min to show variance better
              const chartFloor = Math.floor(minTrend * 0.8);
              const chartRange = maxTrend - chartFloor || 1;
              // Network breakdown for right panel
              const netAppIds = selectedApp === 'all' ? realAppIds : [selectedApp];
              const netMap = {};
              netAppIds.forEach(id => {
                (dashboardData[id]?.networksTable || []).forEach(n => {
                  if (!netMap[n.network]) netMap[n.network] = { network: n.network, revenue: 0, ecpm: 0, fillRate: 0, impressions: 0, _count: 0 };
                  netMap[n.network].revenue += n.revenue;
                  netMap[n.network].ecpm += n.ecpm;
                  netMap[n.network].fillRate += n.fillRate;
                  netMap[n.network].impressions += (n.impressions || Math.round(n.revenue / (n.ecpm || 5) * 1000));
                  netMap[n.network]._count += 1;
                });
              });
              const panelNets = Object.values(netMap).map(n => ({ ...n, ecpm: n.ecpm / n._count, fillRate: n.fillRate / n._count })).sort((a, b) => b.revenue - a.revenue);
              const panelActive = panelNets.filter(n => n.revenue > 0);
              const panelDead = panelNets.filter(n => n.revenue === 0);
              const panelTotal = panelActive.reduce((s, n) => s + n.revenue, 0);
              const trendTotalRev = trend.reduce((s, t) => s + t.value, 0);
              const trendAvgRev = Math.round(trendTotalRev / (trend.length || 1));
              const bestDay = trend.reduce((best, t) => t.value > best.value ? t : best, trend[0] || { label: '-', value: 0 });
              const worstDay = trend.reduce((worst, t) => t.value < worst.value ? t : worst, trend[0] || { label: '-', value: 0 });
              const gridLines = 4;
              const gridVals = Array.from({ length: gridLines + 1 }, (_, i) => chartFloor + (chartRange * i / gridLines));
              return (
                <div className="space-y-4 mb-6">
                  {/* Revenue Trend (Daily) — 3 apps multi-line */}
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h4 className="text-sm font-medium text-slate-300">Revenue Trend (Daily)</h4>
                      <div className="text-[10px] text-slate-500">14 days · {selectedApp === 'all' ? '3 apps' : apps.find(a => a.id === selectedApp)?.name}</div>
                    </div>
                    {(() => {
                      const allAppLines = [
                        { id: 'puzzle', name: 'Puzzle Game', color: '#3b82f6', data: getQvTrendDataSingle('puzzle') },
                        { id: 'idle', name: 'Idle Tycoon', color: '#8b5cf6', data: getQvTrendDataSingle('idle') },
                        { id: 'stack', name: 'Stack Tower', color: '#10b981', data: getQvTrendDataSingle('stack') },
                      ];
                      const appLines = selectedApp === 'all' ? allAppLines : allAppLines.filter(a => a.id === selectedApp);
                      const allVals = appLines.flatMap(a => a.data.map(d => d.value));
                      const gMin = Math.min(...allVals);
                      const gMax = Math.max(...allVals, 1);
                      const gFloor = Math.floor(gMin * 0.85);
                      const gRange = gMax - gFloor || 1;
                      const gLines = 4;
                      const gVals = Array.from({ length: gLines + 1 }, (_, i) => gFloor + (gRange * i / gLines));

                      const W = 900, H = 200, padL = 52, padR = 12, padT = 16, padB = 20;
                      const cW = W - padL - padR, cH = H - padT - padB;
                      const labels = appLines[0].data.map(d => d.label);

                      return (
                        <>
                          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: '220px' }}>
                            {/* Grid */}
                            {gVals.map((gv, gi) => {
                              const y = padT + cH - (gi / gLines) * cH;
                              return (
                                <g key={gi}>
                                  <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#334155" strokeWidth="0.5" />
                                  <text x={padL - 6} y={y + 3} fill="#475569" fontSize="8" textAnchor="end">${Math.round(gv).toLocaleString()}</text>
                                </g>
                              );
                            })}
                            {/* Lines + points per app */}
                            {appLines.map(app => {
                              const pts = app.data.map((d, i) => ({
                                x: padL + (app.data.length > 1 ? (i / (app.data.length - 1)) * cW : cW / 2),
                                y: padT + cH - ((d.value - gFloor) / gRange) * cH,
                                value: d.value,
                                label: d.label,
                              }));
                              const areaPath = `M${pts.map(p => `${p.x},${p.y}`).join(' L')} L${pts[pts.length - 1].x},${padT + cH} L${pts[0].x},${padT + cH} Z`;
                              return (
                                <g key={app.id}>
                                  <path d={areaPath} fill={app.color} fillOpacity="0.06" />
                                  <polyline fill="none" stroke={app.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points={pts.map(p => `${p.x},${p.y}`).join(' ')} />
                                  {pts.map((p, i) => (
                                    <g key={i}>
                                      <circle cx={p.x} cy={p.y} r="3.5" fill="#1e293b" stroke={app.color} strokeWidth="1.5" />
                                      <title>{`${app.name} · ${p.label}: $${p.value.toLocaleString()}`}</title>
                                    </g>
                                  ))}
                                </g>
                              );
                            })}
                            {/* X-axis */}
                            {labels.map((label, i) => {
                              const x = padL + (labels.length > 1 ? (i / (labels.length - 1)) * cW : cW / 2);
                              return <text key={i} x={x} y={H - 3} fill="#64748b" fontSize="9" textAnchor="middle">{label}</text>;
                            })}
                          </svg>
                          {/* Legend */}
                          <div className="flex items-center gap-5 mt-3 pt-3 border-t border-slate-700/50">
                            {appLines.map(app => {
                              const total = app.data.reduce((s, d) => s + d.value, 0);
                              return (
                                <div key={app.id} className="flex items-center gap-2">
                                  <span className="w-3 h-0.5 rounded" style={{ backgroundColor: app.color }} />
                                  <span className="text-[11px] text-slate-400">{app.name}</span>
                                  <span className="text-[11px] text-slate-300 font-medium">${total.toLocaleString()}</span>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Revenue by Network — full width, horizontal */}
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-slate-300">Revenue by Network</h4>
                      <span className="text-[10px] text-slate-500">{panelActive.length} active · {panelDead.length} inactive</span>
                    </div>
                    {/* Stacked bar */}
                    <div className="flex rounded-lg overflow-hidden h-6 mb-4">
                      {panelActive.map((n, i) => {
                        const pct = panelTotal ? (n.revenue / panelTotal * 100) : 0;
                        const lightness = 85 - (i / panelActive.length) * 45;
                        return (
                          <div
                            key={n.network}
                            className="h-full relative group transition-opacity hover:opacity-80"
                            style={{ width: `${pct}%`, backgroundColor: `hsl(215, 15%, ${lightness}%)`, minWidth: pct > 0 ? '2px' : '0' }}
                          >
                            <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-600 px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                              {n.network}: ${n.revenue.toLocaleString()} ({pct.toFixed(1)}%)
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Network grid — 5 columns */}
                    <div className="grid grid-cols-5 gap-x-4 gap-y-2.5">
                      {panelActive.map((n, i) => {
                        const pct = panelTotal ? (n.revenue / panelTotal * 100) : 0;
                        const lightness = 85 - (i / panelActive.length) * 45;
                        return (
                          <div key={n.network} className="flex items-start gap-2">
                            <span className="w-2 h-2 rounded mt-0.5 shrink-0" style={{ backgroundColor: `hsl(215, 15%, ${lightness}%)` }} />
                            <div className="min-w-0">
                              <div className="text-[11px] font-medium text-slate-200 truncate">{n.network}</div>
                              <div className="text-xs font-bold text-white">${n.revenue.toLocaleString()}</div>
                              <div className="text-[10px] text-slate-500">{pct.toFixed(1)}% · ${n.ecpm.toFixed(2)} eCPM</div>
                            </div>
                          </div>
                        );
                      })}
                      {panelDead.map(n => (
                        <div key={n.network} className="flex items-start gap-2 opacity-60">
                          <span className="w-2 h-2 rounded mt-0.5 shrink-0 bg-red-500/50" />
                          <div className="min-w-0">
                            <div className="text-[11px] font-medium text-red-400/70 truncate">{n.network}</div>
                            <div className="text-[10px] text-red-400/50">No data · 0 impr</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* G3: Admin — gross/net toggle */}
            {clientType === 'Admin' && (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Revenue mode:</span>
                  <div className="flex bg-slate-800 rounded-lg p-0.5">
                    <button onClick={() => setAdminGrossNet('gross')} className={`px-3 py-1 rounded-md text-xs font-medium ${adminGrossNet === 'gross' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Gross</button>
                    <button onClick={() => setAdminGrossNet('net')} className={`px-3 py-1 rounded-md text-xs font-medium ${adminGrossNet === 'net' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Net (–15%)</button>
                  </div>
                </div>
                {/* G4: anomaly detection summary */}
                <div className="flex items-center gap-2 ml-auto">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs text-red-400">2 apps with Revenue drop &gt;20%</span>
                </div>
              </div>
            )}

            {/* G2: Pub — profit & health */}
            {clientType === 'Pub' && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4">
                  <div className="text-emerald-400 text-xs uppercase tracking-wider">Net Income</div>
                  <div className="text-xl font-bold text-emerald-300 mt-1">$6,234</div>
                  <div className="text-[10px] text-slate-500 mt-1">Revenue – CAS commission (15%)</div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <div className="text-slate-400 text-xs uppercase tracking-wider">Health</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full" />
                    <span className="text-sm font-medium text-emerald-400">Good</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">All metrics within normal range</div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <div className="text-slate-400 text-xs uppercase tracking-wider">Top Creative</div>
                  <div className="text-sm font-bold text-white mt-1">banner_v3_holiday</div>
                  <div className="text-[10px] text-slate-500 mt-1">CTR 3.2% · 12K impressions</div>
                </div>
              </div>
            )}

            {/* G5: BD Dashboard */}
            {clientType === 'BD' && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden mb-6">
                <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-300">Client Portfolio</h4>
                  <span className="text-[10px] text-slate-500">{bdClients.length} clients</span>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-800/80">
                      <th className="text-left py-2 px-3 text-slate-400 font-medium">Client</th>
                      <th className="text-left py-2 px-3 text-slate-400 font-medium">Manager</th>
                      <th className="text-right py-2 px-3 text-slate-400 font-medium">Revenue</th>
                      <th className="text-right py-2 px-3 text-slate-400 font-medium">DAU</th>
                      <th className="text-right py-2 px-3 text-slate-400 font-medium">Trend</th>
                      <th className="text-center py-2 px-3 text-slate-400 font-medium">Churn Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bdClients.map(c => (
                      <tr key={c.name} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                        <td className="py-2 px-3 text-slate-200 font-medium">{c.name}</td>
                        <td className="py-2 px-3 text-slate-400">{c.manager}</td>
                        <td className="py-2 px-3 text-right text-slate-300">${c.revenue.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right text-slate-300">{formatNum(c.dau)}</td>
                        <td className={`py-2 px-3 text-right font-medium ${c.trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{c.trend > 0 ? '+' : ''}{c.trend}%</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            c.risk === 'low' ? 'bg-emerald-500/20 text-emerald-400' :
                            c.risk === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>{c.risk}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* G6: Payments View */}
            {clientType === 'Payments' && (
              <div className="mb-6 space-y-4">
                <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/20 border border-blue-700/30 rounded-xl p-6 text-center">
                  <div className="text-blue-400 text-xs uppercase tracking-wider mb-2">Current Balance</div>
                  <div className="text-4xl font-bold text-white">$12,847.32</div>
                  <div className="text-sm text-slate-400 mt-2">Available for withdrawal</div>
                  <button className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium text-white">Withdraw</button>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300">Payment History</h4>
                  </div>
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-slate-700"><th className="text-left py-2 px-3 text-slate-400">Date</th><th className="text-right py-2 px-3 text-slate-400">Amount</th><th className="text-left py-2 px-3 text-slate-400">Method</th><th className="text-center py-2 px-3 text-slate-400">Status</th></tr></thead>
                    <tbody>
                      {[
                        { date: 'Jan 15, 2026', amount: 8420, method: 'Wire Transfer', status: 'completed' },
                        { date: 'Dec 15, 2025', amount: 7180, method: 'Wire Transfer', status: 'completed' },
                        { date: 'Nov 15, 2025', amount: 5920, method: 'PayPal', status: 'completed' },
                        { date: 'Oct 15, 2025', amount: 4350, method: 'Wire Transfer', status: 'completed' },
                      ].map(p => (
                        <tr key={p.date} className="border-b border-slate-700/30">
                          <td className="py-2 px-3 text-slate-300">{p.date}</td>
                          <td className="py-2 px-3 text-right text-white font-medium">${p.amount.toLocaleString()}</td>
                          <td className="py-2 px-3 text-slate-400">{p.method}</td>
                          <td className="py-2 px-3 text-center"><span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400">{p.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-3 flex items-center gap-2">
                  <span className="text-amber-400 text-sm">!</span>
                  <span className="text-xs text-amber-300">Balance dropped 12% vs last month. Check revenue trends.</span>
                </div>
              </div>
            )}

            {/* G7: RnD — cross-client SDK view */}
            {clientType === 'RnD' && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden mb-6">
                <div className="px-4 py-3 border-b border-slate-700">
                  <h4 className="text-sm font-medium text-slate-300">SDK Adoption (Cross-Client)</h4>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-800/80">
                      <th className="text-left py-2 px-3 text-slate-400 font-medium">Version</th>
                      <th className="text-right py-2 px-3 text-slate-400 font-medium">Adoption %</th>
                      <th className="text-right py-2 px-3 text-slate-400 font-medium">Clients</th>
                      <th className="text-right py-2 px-3 text-slate-400 font-medium">Rev Delta</th>
                      <th className="text-center py-2 px-3 text-slate-400 font-medium">Status</th>
                      <th className="text-left py-2 px-3 text-slate-400 font-medium w-40">Distribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rndSdkData.map(s => (
                      <tr key={s.version} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                        <td className="py-2 px-3 text-slate-200 font-medium">{s.version}</td>
                        <td className="py-2 px-3 text-right text-slate-300">{s.adoption}%</td>
                        <td className="py-2 px-3 text-right text-slate-300">{s.clients}</td>
                        <td className={`py-2 px-3 text-right font-medium ${s.revDelta.startsWith('+') ? 'text-emerald-400' : s.revDelta.startsWith('-') ? 'text-red-400' : 'text-slate-400'}`}>{s.revDelta}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            s.status === 'latest' ? 'bg-emerald-500/20 text-emerald-400' :
                            s.status === 'beta' ? 'bg-blue-500/20 text-blue-400' :
                            s.status === 'stable' ? 'bg-slate-600/50 text-slate-300' :
                            s.status === 'outdated' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>{s.status}</span>
                        </td>
                        <td className="py-2 px-3">
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${s.status === 'deprecated' ? 'bg-red-500' : s.status === 'outdated' ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${s.adoption}%` }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* H2: Data Freshness */}
            <div className="flex items-center justify-between text-[10px] text-slate-600 mt-2">
              <span>Data updated: 3 min ago</span>
              <span>Source: CAS Analytics Pipeline v2.4</span>
            </div>

          </>
        )}

        {activeScreen === 'reports' && (
          <div className="flex gap-4">
            {/* Sidebar — Dimensions & Measures */}
            <div className={`shrink-0 transition-all duration-200 relative ${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-56'}`}>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 sticky top-6 w-56">
                <input
                  type="text"
                  placeholder="Search metrics..."
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-md px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 mb-3"
                />

                {/* DIMENSIONS */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">Split</div>
                  <button
                    onClick={() => setSidebarCollapsed(true)}
                    className="w-5 h-5 flex items-center justify-center rounded bg-slate-700/50 border border-slate-600/50 hover:bg-slate-600 hover:border-blue-500/50 transition-colors group"
                    title="Collapse sidebar"
                  >
                    <svg width="8" height="10" viewBox="0 0 8 10" className="text-slate-400 group-hover:text-blue-400 transition-colors">
                      <path d="M6 1 L1.5 5 L6 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                {sidebarDimensions.map(group => {
                  const filtered = group.items.filter(i => !sidebarSearch || i.label.toLowerCase().includes(sidebarSearch.toLowerCase()));
                  if (filtered.length === 0) return null;
                  const key = 'dim_' + group.group;
                  return (
                    <div key={key} className="mb-1">
                      <button
                        onClick={() => toggleSidebarSection(key)}
                        className="w-full flex items-center gap-1 px-1 py-1 text-xs text-slate-400 hover:text-slate-200 font-medium"
                      >
                        <span className="text-[10px]">{collapsedSections.has(key) ? '▸' : '▾'}</span>
                        {group.group}
                      </button>
                      {!collapsedSections.has(key) && (
                        <div className="ml-3">
                          {filtered.map(item => (
                            <button
                              key={item.id}
                              onClick={() => reportsSplits.includes(item.id) ? removeSplit(item.id) : addSplit(item.id)}
                              className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-slate-700/50 ${
                                reportsSplits.includes(item.id) ? 'text-blue-400' : 'text-slate-400'
                              }`}
                            >
                              {item.label}
                              {reportsSplits.includes(item.id) && <span className="ml-1 text-[10px] text-blue-500">✓</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="border-t border-slate-700 my-2" />

                {/* MEASURES */}
                <div className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider mb-1.5">Measures</div>
                {sidebarMeasures.map(group => {
                  const filtered = group.items.filter(i => !sidebarSearch || i.label.toLowerCase().includes(sidebarSearch.toLowerCase()));
                  if (filtered.length === 0) return null;
                  const key = 'meas_' + group.group;
                  return (
                    <div key={key} className="mb-1">
                      <button
                        onClick={() => toggleSidebarSection(key)}
                        className="w-full flex items-center gap-1 px-1 py-1 text-xs text-slate-400 hover:text-slate-200 font-medium"
                      >
                        <span className="text-[10px]">{collapsedSections.has(key) ? '▸' : '▾'}</span>
                        {group.group}
                      </button>
                      {!collapsedSections.has(key) && (
                        <div className="ml-3">
                          {filtered.map(item => {
                            const tip = metricTooltips[item.id];
                            return (
                            <button
                              key={item.id}
                              onClick={() => addMeasure(item.id)}
                              className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-slate-700/50 ${
                                selectedMetrics.includes(item.id) ? 'text-blue-400' : 'text-slate-400'
                              }`}
                              title={tip ? `${tip.desc}\n= ${tip.formula}` : undefined}
                            >
                              {item.label}
                              {selectedMetrics.includes(item.id) && <span className="ml-1 text-[10px] text-blue-500">+</span>}
                            </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar expand button (visible when collapsed) */}
            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="shrink-0 w-6 h-6 mt-1 flex items-center justify-center rounded bg-slate-700/60 border border-slate-600/50 hover:bg-slate-600 hover:border-blue-500/50 transition-colors group cursor-pointer"
                title="Expand sidebar"
              >
                <svg width="8" height="10" viewBox="0 0 8 10" className="text-slate-400 group-hover:text-blue-400 transition-colors">
                  <path d="M2 1 L6.5 5 L2 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Chip Rows: Filters / Splits / Measures */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl mb-4 divide-y divide-slate-700/50">

                {/* Row 1: Filters */}
                <div className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-xs font-medium uppercase tracking-wider shrink-0 w-16">Filters</span>
                    <div className="flex flex-wrap gap-2 flex-1">
                      {/* Period — always visible */}
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/25">
                        Period: {filterDateFrom} — {filterDateTo}
                      </span>
                      {/* E1: App Selector */}
                      <div className="relative">
                        <button
                          onClick={() => { setShowAppSelector(!showAppSelector); setAppSelectorSearch(''); }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/25 hover:bg-blue-500/25 cursor-pointer"
                        >
                          App: {apps.find(a => a.id === selectedApp)?.name || selectedApp}
                          <span className="text-blue-500">▾</span>
                        </button>
                        {showAppSelector && (
                          <div className="absolute left-0 top-full mt-1 bg-slate-900 border border-slate-600 rounded-lg shadow-xl z-50 min-w-[220px]">
                            <div className="p-2 border-b border-slate-700">
                              <input
                                type="text"
                                placeholder="Search apps..."
                                value={appSelectorSearch}
                                onChange={(e) => setAppSelectorSearch(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                autoFocus
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {apps.filter(a => !appSelectorSearch || a.name.toLowerCase().includes(appSelectorSearch.toLowerCase())).map(app => (
                                <button
                                  key={app.id}
                                  onClick={() => { setSelectedApp(app.id); setShowAppSelector(false); }}
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-800 ${selectedApp === app.id ? 'text-blue-400 bg-slate-800/50' : 'text-slate-300'}`}
                                >
                                  <span className="text-[10px]">{app.id === 'puzzle' || app.id === 'stack' ? '🤖' : '🍎'}</span>
                                  {app.name}
                                  {selectedApp === app.id && <span className="ml-auto text-blue-500">✓</span>}
                                </button>
                              ))}
                            </div>
                            <div className="px-3 py-1.5 border-t border-slate-700 text-[10px] text-slate-500">
                              {apps.length} apps
                            </div>
                          </div>
                        )}
                      </div>
                      {filterCountry !== 'all' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/25">
                          Country: {filterCountry}
                          <button onClick={() => setFilterCountry('all')} className="hover:text-blue-200 ml-0.5">×</button>
                        </span>
                      )}
                      <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-700/50 text-slate-400 hover:bg-slate-700 border border-slate-600/50">
                        + Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Row 2: Splits */}
                <div className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-xs font-medium uppercase tracking-wider shrink-0 w-16">Split</span>
                    <div className="flex flex-wrap gap-2 flex-1">
                      {reportsSplits.map(splitId => {
                        const allDims = sidebarDimensions.flatMap(g => g.items);
                        const dim = allDims.find(d => d.id === splitId);
                        return (
                          <span key={splitId} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-cyan-500/15 text-cyan-400 border border-cyan-500/25">
                            {dim?.label || splitId}
                            <button onClick={() => removeSplit(splitId)} className="hover:text-cyan-200 ml-0.5">×</button>
                          </span>
                        );
                      })}
                      <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-700/50 text-slate-400 hover:bg-slate-700 border border-slate-600/50">
                        + Add Split
                      </button>
                    </div>
                  </div>
                </div>

                {/* Row 3: Measures */}
                <div className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-xs font-medium uppercase tracking-wider shrink-0 w-16">Measures</span>
                    <div className="flex flex-wrap gap-2 flex-1">
                      {selectedMetrics.map(metricId => {
                        const metric = allMetricsOptions.find(m => m.id === metricId);
                        return (
                          <span key={metricId} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-violet-500/15 text-violet-400 border border-violet-500/25">
                            {metric?.name || metricId}
                            <button onClick={() => setSelectedMetrics(selectedMetrics.filter(m => m !== metricId))} className="hover:text-violet-200 ml-0.5">×</button>
                          </span>
                        );
                      })}
                      <button
                        onClick={() => setShowMetricAddDropdown(!showMetricAddDropdown)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-700/50 text-slate-400 hover:bg-slate-700 border border-slate-600/50"
                      >
                        + Measure
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button className="px-4 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white">
                    Apply
                  </button>
                  <button
                    onClick={() => { setReportsSplits(['date']); setSelectedMetrics(['dau', 'sessions', 'd1_retention', 'd7_retention', 'impr_per_dau']); setFilterCountry('all'); setReportsSearch(''); }}
                    className="px-4 py-1.5 rounded-md text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-300"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => { pushStateToUrl(); navigator.clipboard.writeText(window.location.href); }}
                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-300"
                    title="Copy shareable URL"
                  >
                    Share
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {/* C6: Density toggle */}
                  <div className="flex bg-slate-800 rounded-lg p-0.5">
                    <button
                      onClick={() => setReportsDensity('compact')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-medium ${reportsDensity === 'compact' ? 'bg-slate-600 text-white' : 'text-slate-500 hover:text-white'}`}
                    >
                      Compact
                    </button>
                    <button
                      onClick={() => setReportsDensity('comfortable')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-medium ${reportsDensity === 'comfortable' ? 'bg-slate-600 text-white' : 'text-slate-500 hover:text-white'}`}
                    >
                      Comfortable
                    </button>
                  </div>
                  {/* View toggle */}
                  <div className="flex bg-slate-800 rounded-lg p-0.5">
                    <button
                      onClick={() => setViewType('table')}
                      className={`px-3 py-1 rounded-md text-xs font-medium ${viewType === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      Table
                    </button>
                    <button
                      onClick={() => setViewType('bar')}
                      className={`px-3 py-1 rounded-md text-xs font-medium ${viewType === 'bar' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      Chart
                    </button>
                    <button
                      onClick={() => setViewType('line')}
                      className={`px-3 py-1 rounded-md text-xs font-medium ${viewType === 'line' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      Line
                    </button>
                  </div>
                  {/* Export dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => { setShowExportDD(!showExportDD); setShowSavedViewsDD(false); }}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-300"
                    >
                      Export ▾
                    </button>
                    {showExportDD && (
                      <div className="absolute right-0 top-full mt-1 bg-slate-900 border border-slate-600 rounded-lg shadow-xl z-50 min-w-[140px]">
                        {['CSV', 'Excel', 'Copy to Clipboard'].map(opt => (
                          <button
                            key={opt}
                            onClick={() => {
                              const rows = buildReportsRows().filter(r => r._type === 'data');
                              const metricNames = selectedMetrics.map(mid => allMetricsOptions.find(m => m.id === mid)?.name || mid);
                              const header = ['Period', ...metricNames];
                              const body = rows.map(r => [r._label, ...selectedMetrics.map(mid => {
                                const mk = metricKeyMap[mid];
                                const v = r[mid];
                                return v != null && mk ? mk.fmt(v) : '';
                              })]);
                              if (opt === 'Copy to Clipboard') {
                                const text = [header.join('\t'), ...body.map(r => r.join('\t'))].join('\n');
                                navigator.clipboard.writeText(text);
                              } else if (opt === 'CSV' || opt === 'Excel') {
                                const escapeCsv = v => { const s = String(v); return s.includes(',') || s.includes('"') || s.includes('\n') ? '"' + s.replace(/"/g, '""') + '"' : s; };
                                const bom = opt === 'Excel' ? '\uFEFF' : '';
                                const csv = bom + [header.map(escapeCsv).join(','), ...body.map(r => r.map(escapeCsv).join(','))].join('\n');
                                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a'); a.href = url; a.download = `report_${selectedApp}_${new Date().toISOString().slice(0,10)}.csv`; a.click();
                                URL.revokeObjectURL(url);
                              }
                              setShowExportDD(false);
                            }}
                            className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-800"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* E3: Saved Views dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => { setShowSavedViewsDD(!showSavedViewsDD); setShowExportDD(false); }}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-300"
                    >
                      Views ▾
                    </button>
                    {showSavedViewsDD && (
                      <div className="absolute right-0 top-full mt-1 bg-slate-900 border border-slate-600 rounded-lg shadow-xl z-50 min-w-[200px]">
                        {savedViews.length === 0 && (
                          <div className="px-3 py-2 text-xs text-slate-500">No saved views</div>
                        )}
                        {savedViews.map((view, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800 group">
                            <button
                              onClick={() => loadSavedView(view)}
                              className="flex-1 text-left text-xs text-slate-300"
                            >
                              {view.name}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteSavedView(i); }}
                              className="text-[10px] text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <div className="border-t border-slate-700">
                          <button
                            onClick={() => {
                              const name = prompt('View name:');
                              if (name) { saveCurrentView(name); setShowSavedViewsDD(false); }
                            }}
                            className="w-full px-3 py-2 text-left text-xs text-blue-400 hover:bg-slate-800"
                          >
                            + Save current view
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* C4: Search in Table */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Search in table..."
                  value={reportsSearch}
                  onChange={(e) => setReportsSearch(e.target.value)}
                  className="w-64 bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Reports Data Table (C1-C5) — only in table mode */}
              {viewType === 'table' && (() => {
                const rows = buildReportsRows();
                const searchLower = reportsSearch.toLowerCase();
                const hasAdTypeSplit = reportsSplits.includes('adType');

                // Filter by search (C4)
                const filtered = rows.filter(row => {
                  if (row._type === 'group') {
                    // Keep group if any child matches
                    return !searchLower || rows.some(r => r._group === row._label && (
                      r._label.toLowerCase().includes(searchLower) ||
                      selectedMetrics.some(mid => {
                        const mk = metricKeyMap[mid];
                        return mk && String(r[mid] ?? '').toLowerCase().includes(searchLower);
                      })
                    ));
                  }
                  if (!searchLower) return true;
                  if (row._label.toLowerCase().includes(searchLower)) return true;
                  return selectedMetrics.some(mid => String(row[mid] ?? '').toLowerCase().includes(searchLower));
                });

                // Hide children of collapsed groups (C1)
                const visible = filtered.filter(row => {
                  if (row._type === 'data' && row._group && collapsedGroups.has(row._group)) return false;
                  return true;
                });

                // Totals (C2)
                const dataRows = visible.filter(r => r._type === 'data');
                const totals = {};
                selectedMetrics.forEach(mid => {
                  const mk = metricKeyMap[mid];
                  if (!mk || !mk.isNum) { totals[mid] = null; return; }
                  const vals = dataRows.map(r => r[mid]).filter(v => v != null);
                  // For rates/percentages, average; for absolutes, sum
                  const isRate = ['d1_retention', 'd7_retention', 'd30_retention', 'fill_rate', 'ecpm', 'arpdau', 'cpi', 'impr_per_dau', 'roas', 'ltv'].includes(mid);
                  totals[mid] = vals.length ? (isRate ? vals.reduce((a, b) => a + b, 0) / vals.length : vals.reduce((a, b) => a + b, 0)) : null;
                });

                const totalDataRows = dataRows.length;
                const totalAllRows = rows.filter(r => r._type === 'data').length;
                const cellPy = reportsDensity === 'compact' ? 'py-1' : 'py-2.5';
                const cellText = reportsDensity === 'compact' ? 'text-[11px]' : 'text-xs';

                // Highlight helper (C4)
                const highlight = (text) => {
                  if (!searchLower || !text) return text;
                  const str = String(text);
                  const idx = str.toLowerCase().indexOf(searchLower);
                  if (idx === -1) return str;
                  return <>{str.slice(0, idx)}<mark className="bg-yellow-500/30 text-yellow-300 rounded px-0.5">{str.slice(idx, idx + searchLower.length)}</mark>{str.slice(idx + searchLower.length)}</>;
                };

                return (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className={`w-full ${cellText}`}>
                        <thead>
                          <tr className="border-b border-slate-600 bg-slate-800/80">
                            <th className={`text-left ${cellPy} px-3 text-slate-400 font-medium sticky left-0 bg-slate-800/80 z-10`}>
                              {hasAdTypeSplit ? 'Period / Ad Type' : 'Period'}
                            </th>
                            {selectedMetrics.map(mid => {
                              const metric = allMetricsOptions.find(m => m.id === mid);
                              const tip = metricTooltips[mid];
                              return (
                                <th
                                  key={mid}
                                  draggable
                                  onDragStart={(e) => handleColumnDragStart(e, mid)}
                                  onDragOver={(e) => handleColumnDragOver(e, mid)}
                                  onDragEnd={handleColumnDragEnd}
                                  className={`text-right ${cellPy} px-3 text-slate-400 font-medium whitespace-nowrap cursor-grab active:cursor-grabbing select-none ${draggedColumn === mid ? 'opacity-40' : ''} ${tip ? 'cursor-help' : ''}`}
                                  title={tip ? `${tip.desc}\n= ${tip.formula}` : undefined}
                                >
                                  {metric?.name || mid}
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {visible.map((row, ri) => {
                            if (row._type === 'group') {
                              // C1: Group header row
                              const isCollapsed = collapsedGroups.has(row._label);
                              return (
                                <tr
                                  key={'g-' + row._label}
                                  className="bg-slate-700/30 cursor-pointer hover:bg-slate-700/50"
                                  onClick={() => toggleGroup(row._label)}
                                >
                                  <td className={`${cellPy} px-3 font-semibold text-slate-200 sticky left-0 bg-slate-700/30 z-10`} colSpan={selectedMetrics.length + 1}>
                                    <span className="text-[10px] mr-1.5">{isCollapsed ? '▸' : '▾'}</span>
                                    {highlight(row._label)}
                                    {isCollapsed && (
                                      <span className="ml-2 text-[10px] text-slate-500 font-normal">
                                        ({rows.filter(r => r._group === row._label).length} rows)
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            }

                            // C1: Data row (possibly indented)
                            const prevDataRow = visible.slice(0, ri).reverse().find(r => r._type === 'data');
                            return (
                              <tr key={'d-' + ri} className="border-b border-slate-700/30 hover:bg-slate-700/20 group/row">
                                <td className={`${cellPy} px-3 text-slate-300 sticky left-0 bg-slate-800/50 z-10 group-hover/row:bg-slate-700/20`}>
                                  {row._group && <span className="ml-4" />}
                                  {highlight(row._label)}
                                </td>
                                {selectedMetrics.map((mid, ci) => {
                                  const mk = metricKeyMap[mid];
                                  const val = row[mid];
                                  const prevVal = prevDataRow?.[mid];
                                  const anomaly = getAnomaly(val, prevVal);
                                  const anomalyCls = anomaly ? anomalyStyle[anomaly] : '';
                                  const formatted = val != null && mk ? mk.fmt(val) : '—';
                                  const cellKey = `${ri}-${ci}`;
                                  const isCopied = copiedCell === cellKey;

                                  return (
                                    <td
                                      key={mid}
                                      className={`${cellPy} px-3 text-right text-slate-300 whitespace-nowrap relative group/cell ${anomalyCls}`}
                                      title={anomaly ? anomalyTooltip[anomaly] : undefined}
                                    >
                                      {/* C5: Copy button */}
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleCopyCell(val ?? '', ri, ci); }}
                                        className="absolute left-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover/cell:opacity-100 text-[9px] text-slate-500 hover:text-slate-300 transition-opacity"
                                        title="Copy"
                                      >
                                        {isCopied ? '✓' : '⧉'}
                                      </button>
                                      {highlight(formatted)}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                        {/* C2: Totals row (sticky) */}
                        <tfoot className="sticky bottom-0">
                          <tr className="bg-slate-800 border-t border-slate-600 font-semibold">
                            <td className={`${cellPy} px-3 text-slate-400 sticky left-0 bg-slate-800 z-10`}>Total</td>
                            {selectedMetrics.map(mid => {
                              const mk = metricKeyMap[mid];
                              const val = totals[mid];
                              return (
                                <td key={mid} className={`${cellPy} px-3 text-right text-slate-200 whitespace-nowrap`}>
                                  {val != null && mk ? mk.fmt(val) : '—'}
                                </td>
                              );
                            })}
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* C7: Status Bar */}
                    <div className="flex items-center justify-between px-3 py-2 border-t border-slate-700 text-[10px] text-slate-500">
                      <span>Data updated: 3 min ago</span>
                      <span>Rows: {totalDataRows}{totalDataRows !== totalAllRows ? ` of ${totalAllRows}` : ''}</span>
                    </div>
                  </div>
                );
              })()}

              {/* D1: Stacked/Grouped Bar Chart */}
              {viewType === 'bar' && (() => {
                const rows = buildReportsRows().filter(r => r._type === 'data');
                const hasAdTypeSplit = reportsSplits.includes('adType');
                const segments = hasAdTypeSplit ? ['Banner', 'Interstitial', 'Rewarded'] : ['Total'];
                const periods = [...new Set(rows.map(r => r._group || r._label))];

                return (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                    {selectedMetrics.filter(mid => !hiddenSeries.has(mid)).map((mid, mi) => {
                      const mk = metricKeyMap[mid];
                      const metric = allMetricsOptions.find(m => m.id === mid);
                      if (!mk) return null;

                      const periodData = periods.map(period => {
                        const periodRows = rows.filter(r => (r._group || r._label) === period);
                        if (hasAdTypeSplit) {
                          return { period, segments: periodRows.map(r => ({ label: r._label, value: r[mid] || 0 })) };
                        }
                        return { period, segments: [{ label: 'Total', value: periodRows[0]?.[mid] || 0 }] };
                      });
                      const maxVal = Math.max(...periodData.flatMap(p => {
                        return hasAdTypeSplit ? [p.segments.reduce((a, s) => a + s.value, 0)] : p.segments.map(s => s.value);
                      }), 1);

                      return (
                        <div key={mid} className={mi > 0 ? 'mt-6 pt-6 border-t border-slate-700' : ''}>
                          <h4 className="text-sm font-medium text-slate-300 mb-3">{metric?.name}</h4>
                          <div className="flex items-end gap-2" style={{ height: '160px' }}>
                            {periodData.map((pd, pi) => (
                              <div key={pi} className="flex-1 flex flex-col items-center gap-1 group relative">
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-600 px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                                  {pd.segments.map(s => `${s.label}: ${mk.fmt(s.value)}`).join(' · ')}
                                </div>
                                {hasAdTypeSplit ? (
                                  <div className="w-full flex flex-col-reverse" style={{ height: `${(pd.segments.reduce((a, s) => a + s.value, 0) / maxVal) * 100}%`, minHeight: '4px' }}>
                                    {pd.segments.map((seg, si) => (
                                      <div
                                        key={si}
                                        className="w-full"
                                        style={{
                                          flex: seg.value,
                                          backgroundColor: seriesColors[si % seriesColors.length],
                                          borderRadius: si === pd.segments.length - 1 ? '4px 4px 0 0' : '0',
                                        }}
                                      />
                                    ))}
                                  </div>
                                ) : (
                                  <div
                                    className="w-full bg-blue-500/80 rounded-t hover:bg-blue-400 transition-colors"
                                    style={{ height: `${(pd.segments[0].value / maxVal) * 100}%`, minHeight: '4px' }}
                                  />
                                )}
                                <span className="text-[9px] text-slate-500 truncate max-w-full">{pd.period.split(' ')[0]?.slice(0, 3)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {/* D3: Legend */}
                    <div className="mt-4 pt-3 border-t border-slate-700 flex items-center gap-3 flex-wrap">
                      {reportsSplits.includes('adType') && ['Banner', 'Interstitial', 'Rewarded'].map((seg, i) => (
                        <span key={seg} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: seriesColors[i] }} />
                          {seg}
                        </span>
                      ))}
                      <span className="text-slate-600 text-[10px]">|</span>
                      {selectedMetrics.map(mid => {
                        const metric = allMetricsOptions.find(m => m.id === mid);
                        const isHidden = hiddenSeries.has(mid);
                        return (
                          <button
                            key={mid}
                            onClick={() => toggleSeries(mid)}
                            className={`flex items-center gap-1 text-[10px] ${isHidden ? 'text-slate-600 line-through' : 'text-slate-300'}`}
                          >
                            <span className={`w-2 h-2 rounded ${isHidden ? 'bg-slate-700' : 'bg-blue-500'}`} />
                            {metric?.name}
                          </button>
                        );
                      })}
                      <button onClick={() => setHiddenSeries(new Set())} className="text-[10px] text-slate-500 hover:text-slate-300 ml-2">Show All</button>
                      <button onClick={() => setHiddenSeries(new Set(selectedMetrics))} className="text-[10px] text-slate-500 hover:text-slate-300">Hide All</button>
                    </div>
                  </div>
                );
              })()}

              {/* D2: Multi-line Chart */}
              {viewType === 'line' && (() => {
                const rows = buildReportsRows().filter(r => r._type === 'data' && !r._group);
                const fallbackRows = rows.length === 0 ? buildReportsRows().filter(r => r._type === 'data') : rows;
                const periods = fallbackRows.map(r => r._label);
                const visibleMetrics = selectedMetrics.filter(mid => !hiddenSeries.has(mid) && metricKeyMap[mid]);

                // Normalize each metric to 0-100 range for multi-line
                const metricRanges = {};
                visibleMetrics.forEach(mid => {
                  const vals = fallbackRows.map(r => r[mid] ?? 0);
                  metricRanges[mid] = { min: Math.min(...vals), max: Math.max(...vals) || 1 };
                });

                const svgW = 600;
                const svgH = 180;
                const padL = 10;
                const padR = 10;
                const padT = 10;
                const padB = 25;
                const chartW = svgW - padL - padR;
                const chartH = svgH - padT - padB;

                return (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                    <h4 className="text-sm font-medium text-slate-300 mb-3">Metrics Trend</h4>
                    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: '220px' }}>
                      {/* Grid lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map(f => (
                        <line key={f} x1={padL} y1={padT + chartH * (1 - f)} x2={svgW - padR} y2={padT + chartH * (1 - f)} stroke="#334155" strokeWidth="0.5" />
                      ))}
                      {/* Lines */}
                      {visibleMetrics.map((mid, mi) => {
                        const range = metricRanges[mid];
                        const points = fallbackRows.map((row, i) => {
                          const val = row[mid] ?? 0;
                          const x = periods.length > 1 ? padL + (i / (periods.length - 1)) * chartW : svgW / 2;
                          const norm = range.max !== range.min ? (val - range.min) / (range.max - range.min) : 0.5;
                          const y = padT + chartH * (1 - norm);
                          return { x, y, val };
                        });
                        const color = seriesColors[mi % seriesColors.length];
                        return (
                          <g key={mid}>
                            <polyline
                              fill="none"
                              stroke={color}
                              strokeWidth="2"
                              points={points.map(p => `${p.x},${p.y}`).join(' ')}
                            />
                            {points.map((p, i) => (
                              <g key={i}>
                                <circle cx={p.x} cy={p.y} r="3.5" fill={color} />
                                <title>{`${allMetricsOptions.find(m => m.id === mid)?.name}: ${metricKeyMap[mid]?.fmt(p.val)}`}</title>
                              </g>
                            ))}
                          </g>
                        );
                      })}
                      {/* X labels */}
                      {periods.map((label, i) => {
                        const x = periods.length > 1 ? padL + (i / (periods.length - 1)) * chartW : svgW / 2;
                        return <text key={i} x={x} y={svgH - 4} fill="#94a3b8" fontSize="8" textAnchor="middle">{label.split(' ')[0]?.slice(0, 3)}</text>;
                      })}
                    </svg>

                    {/* D3: Legend */}
                    <div className="mt-3 flex items-center gap-3 flex-wrap">
                      {selectedMetrics.map((mid, mi) => {
                        const metric = allMetricsOptions.find(m => m.id === mid);
                        const isHidden = hiddenSeries.has(mid);
                        return (
                          <button
                            key={mid}
                            onClick={() => toggleSeries(mid)}
                            className={`flex items-center gap-1.5 text-[10px] ${isHidden ? 'text-slate-600 line-through' : 'text-slate-300'}`}
                          >
                            <span className="w-3 h-0.5 rounded" style={{ backgroundColor: isHidden ? '#475569' : seriesColors[mi % seriesColors.length] }} />
                            {metric?.name}
                          </button>
                        );
                      })}
                      <button onClick={() => setHiddenSeries(new Set())} className="text-[10px] text-slate-500 hover:text-slate-300 ml-2">Show All</button>
                      <button onClick={() => setHiddenSeries(new Set(selectedMetrics))} className="text-[10px] text-slate-500 hover:text-slate-300">Hide All</button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {activeScreen === 'glossary' && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">📖 Глоссарий метрик</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newMetric = { id: 'm'+Date.now(), name: 'Новая метрика', description: '', formula: '', role: '🎮', sources: [], question: '', section: 'app' };
                    setMetrics([...metrics, newMetric]);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded text-sm"
                >
                  + Добавить
                </button>
                <button
                  onClick={() => {
                    const json = JSON.stringify(metrics, null, 2);
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'metrics.json';
                    a.click();
                  }}
                  className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm"
                >
                  ↓ Export
                </button>
              </div>
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
              <button onClick={() => setFilterSection('all')} className={`px-3 py-1 rounded text-xs ${filterSection === 'all' ? 'bg-white text-slate-900' : 'bg-slate-700'}`}>Все</button>
              {sections.map(s => (
                <button key={s.id} onClick={() => setFilterSection(s.id)} className={`px-3 py-1 rounded text-xs ${filterSection === s.id ? 'bg-white text-slate-900' : 'bg-slate-700'}`}>{s.name}</button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-2 px-2">Метрика</th>
                    <th className="text-center py-2 px-2 w-24">Роль</th>
                    <th className="text-left py-2 px-2">Источники</th>
                    <th className="text-left py-2 px-2">Бизнес-вопрос</th>
                    <th className="text-center py-2 px-2 w-16">Версия</th>
                    <th className="w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map(section => {
                    const sectionMetrics = metrics.filter(m => m.section === section.id);
                    if (sectionMetrics.length === 0 || (filterSection !== 'all' && filterSection !== section.id)) return null;
                    return (
                      <React.Fragment key={section.id}>
                        <tr className={section.bg}>
                          <td colSpan="6" className={`py-1 px-2 ${section.text} text-xs font-semibold uppercase`}>{section.name}</td>
                        </tr>
                        {sectionMetrics.map(m => (
                          <tr key={m.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 group">
                            <td className="py-2 px-2">
                              {editingId === m.id ? (
                                <div className="space-y-1">
                                  <input value={m.name} onChange={(e) => updateMetric(m.id, 'name', e.target.value)} className="w-full bg-slate-700 rounded px-2 py-1 text-white text-sm" />
                                  <input value={m.description} onChange={(e) => updateMetric(m.id, 'description', e.target.value)} className="w-full bg-slate-700 rounded px-2 py-1 text-slate-300 text-xs" placeholder="Описание" />
                                  <input value={m.formula} onChange={(e) => updateMetric(m.id, 'formula', e.target.value)} className="w-full bg-slate-700 rounded px-2 py-1 text-slate-400 text-xs font-mono" placeholder="Формула" />
                                </div>
                              ) : (
                                <>
                                  <div className="font-medium text-white">{m.name}</div>
                                  <div className="text-slate-400 text-xs">{m.description}</div>
                                  {m.formula && <div className="text-slate-500 text-xs font-mono">= {m.formula}</div>}
                                </>
                              )}
                            </td>
                            <td className="py-2 px-2 text-center">
                              <span className={`text-xs px-2 py-1 rounded ${
                                m.role.includes('C-Level') ? 'bg-blue-900/50 text-blue-300' :
                                m.role.includes('Producer') ? 'bg-purple-900/50 text-purple-300' :
                                m.role.includes('Monetisation') ? 'bg-green-900/50 text-green-300' :
                                m.role.includes('UA') ? 'bg-pink-900/50 text-pink-300' :
                                'bg-slate-700 text-slate-300'
                              }`}>{m.role}</span>
                            </td>
                            <td className="py-2 px-2">
                              {editingId === m.id ? (
                                <input value={m.sources.join(', ')} onChange={(e) => updateMetric(m.id, 'sources', e.target.value.split(',').map(s => s.trim()))} className="w-full bg-slate-700 rounded px-2 py-1 text-xs" />
                              ) : (
                                <div className="flex flex-wrap gap-1">
                                  {m.sources.map((s, i) => <span key={i} className="bg-slate-700 px-1.5 py-0.5 rounded text-xs">{s}</span>)}
                                </div>
                              )}
                            </td>
                            <td className="py-2 px-2 text-slate-300 text-xs">
                              {editingId === m.id ? (
                                <input value={m.question} onChange={(e) => updateMetric(m.id, 'question', e.target.value)} className="w-full bg-slate-700 rounded px-2 py-1 text-xs" />
                              ) : m.question}
                            </td>
                            <td className="py-2 px-2 text-center">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                m.version === 'MVP' ? 'bg-emerald-900/50 text-emerald-300' :
                                m.version === 'v1.xx' ? 'bg-blue-900/50 text-blue-300' :
                                m.version === 'v2.xx' ? 'bg-purple-900/50 text-purple-300' :
                                'bg-slate-700 text-slate-300'
                              }`}>{m.version || 'MVP'}</span>
                            </td>
                            <td className="py-2 px-2">
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                {editingId === m.id ? (
                                  <button onClick={() => setEditingId(null)} className="bg-emerald-600 px-2 py-1 rounded text-xs">✓</button>
                                ) : (
                                  <button onClick={() => setEditingId(m.id)} className="bg-slate-600 px-2 py-1 rounded text-xs">✎</button>
                                )}
                                <button onClick={() => setMetrics(metrics.filter(x => x.id !== m.id))} className="bg-red-600 px-2 py-1 rounded text-xs">×</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
      </div>
      </div>
    </div>
  );
}
