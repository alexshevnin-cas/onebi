import React from "react";
import { useState } from "react";

export default function MetricTree() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedApp, setSelectedApp] = useState('puzzle');
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
  const [filterCountry, setFilterCountry] = useState('all');
  const [breakdownType, setBreakdownType] = useState('month');
  const [selectedMetrics, setSelectedMetrics] = useState(['installs', 'dau', 'sessions', 'session_duration', 'd1_retention', 'd7_retention', 'impressions', 'impr_per_dau', 'ecpm', 'fill_rate', 'arpdau', 'revenue']);
  const [showMetricsDropdown, setShowMetricsDropdown] = useState(false);
  const [activeFilters, setActiveFilters] = useState(['app']); // по умолчанию только приложение
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeBreakdowns, setActiveBreakdowns] = useState([]); // активные разбивки
  const [showBreakdownDropdown, setShowBreakdownDropdown] = useState(false);
  const [showMetricAddDropdown, setShowMetricAddDropdown] = useState(false);
  const [breakdownByAppVersion, setBreakdownByAppVersion] = useState(false);
  const [breakdownByCasVersion, setBreakdownByCasVersion] = useState(false);
  const [viewType, setViewType] = useState('table'); // table, bar, line
  const [draggedColumn, setDraggedColumn] = useState(null);

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
    { id: 'country', label: 'Страна' },
  ];

  // Filter options
  const appVersions = ['all', '2.4.1', '2.4.0', '2.3.8', '2.3.5', '2.2.0'];
  const countries = ['all', 'US', 'GB', 'DE', 'FR', 'JP', 'KR', 'BR', 'IN', 'RU'];
  const breakdownOptions = [
    { id: 'day', label: 'По дням' },
    { id: 'week', label: 'По неделям' },
    { id: 'month', label: 'По месяцам' },
    { id: 'app_version', label: 'По версии' },
  ];
  const allMetricsOptions = [
    { id: 'installs', name: 'Installs', section: 'ua' },
    { id: 'dau', name: 'DAU', section: 'engagement' },
    { id: 'wau', name: 'WAU', section: 'engagement' },
    { id: 'mau', name: 'MAU', section: 'engagement' },
    { id: 'sessions', name: 'Sessions', section: 'engagement' },
    { id: 'session_duration', name: 'Duration', section: 'engagement' },
    { id: 'd1_retention', name: 'D1 Ret', section: 'cohort' },
    { id: 'd7_retention', name: 'D7 Ret', section: 'cohort' },
    { id: 'd30_retention', name: 'D30 Ret', section: 'cohort' },
    { id: 'impressions', name: 'Impr', section: 'monetisation' },
    { id: 'impr_per_dau', name: 'Impr/DAU', section: 'monetisation' },
    { id: 'ecpm', name: 'eCPM', section: 'monetisation' },
    { id: 'fill_rate', name: 'Fill Rate', section: 'monetisation' },
    { id: 'arpdau', name: 'ARPDAU', section: 'monetisation' },
    { id: 'revenue', name: 'Revenue', section: 'monetisation' },
    { id: 'cpi', name: 'CPI', section: 'ua' },
    { id: 'roas', name: 'ROAS', section: 'ua' },
    { id: 'ltv', name: 'LTV', section: 'cohort' },
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
    { id: 'puzzle', name: 'Puzzle Game' },
    { id: 'idle', name: 'Idle Tycoon' },
    { id: 'stack', name: 'Stack Tower' },
    { id: 'clevel', name: 'C-Level Report' },
    { id: 'rnd', name: 'RnD отдел' },
  ];

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
  const getTableData = (app, tableName) => {
    const appData = dashboardData[app];
    if (!appData) return [];

    let data;
    if (periodType === 'week' && weeklyData[app] && weeklyData[app][tableName]) {
      data = weeklyData[app][tableName];
    } else {
      data = appData[tableName] || [];
    }

    // Фильтр по периоду: 1m = 1 запись, 3m = 3 записи
    if (activeFilters.includes('period')) {
      const limit = periodRange === '1m' ? 1 : 3;
      return data.slice(0, limit);
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
        { month: 'October 2025', installs: 45200, dau: 125600, d1Retention: 42.1, d7Retention: 26.8, impressions: 892000, clicks: 4280, ctr: 0.48, ecpm: 4.8500, revenue: 4326.20 },
        { month: 'November 2025', installs: 52800, dau: 148200, d1Retention: 43.5, d7Retention: 27.4, impressions: 1124000, clicks: 5620, ctr: 0.50, ecpm: 5.1200, revenue: 5754.88 },
        { month: 'December 2025', installs: 61400, dau: 168500, d1Retention: 44.2, d7Retention: 28.1, impressions: 1356000, clicks: 7120, ctr: 0.52, ecpm: 5.3800, revenue: 7295.28 },
      ],
      monetisationTable: [
        { month: 'October 2025', adRevenue: 4326, arpdau: 0.0344, imprPerDau: 7.1, imprBanner: 2.8, imprInter: 1.2, imprReward: 0.8, ecpm: 4.85, fillRate: 94.2 },
        { month: 'November 2025', adRevenue: 5755, arpdau: 0.0388, imprPerDau: 7.6, imprBanner: 3.0, imprInter: 1.4, imprReward: 0.9, ecpm: 5.12, fillRate: 95.1 },
        { month: 'December 2025', adRevenue: 7295, arpdau: 0.0433, imprPerDau: 8.0, imprBanner: 3.2, imprInter: 1.5, imprReward: 1.0, ecpm: 5.38, fillRate: 96.3 },
      ],
      uaTable: [
        { month: 'October 2025', uaCost: 2980, installs: 45200, cpi: 0.066, organic: 12400, paid: 32800, roasD7: 128, roasD30: 145, payback: 18 },
        { month: 'November 2025', uaCost: 3420, installs: 52800, cpi: 0.065, organic: 14200, paid: 38600, roasD7: 135, roasD30: 168, payback: 16 },
        { month: 'December 2025', uaCost: 3980, installs: 61400, cpi: 0.065, organic: 16800, paid: 44600, roasD7: 142, roasD30: 183, payback: 14 },
      ],
      engagementTable: [
        { month: 'October 2025', dau: 125600, avgSessions: 3.2, avgDuration: 8.4, davDau: 78.2, pauConversion: 2.1 },
        { month: 'November 2025', dau: 148200, avgSessions: 3.4, avgDuration: 8.8, davDau: 80.5, pauConversion: 2.3 },
        { month: 'December 2025', dau: 168500, avgSessions: 3.5, avgDuration: 9.2, davDau: 82.1, pauConversion: 2.4 },
      ],
      networksTable: [
        { network: 'AppLovin', revenue: 2335, impressions: 449000, ecpm: 5.20, fillRate: 98.2, sov: 32, winRate: 38, latency: 145 },
        { network: 'AdMob', revenue: 1561, impressions: 380500, ecpm: 4.10, fillRate: 97.8, sov: 28, winRate: 32, latency: 120 },
        { network: 'Unity Ads', revenue: 1167, impressions: 303200, ecpm: 3.85, fillRate: 94.5, sov: 22, winRate: 24, latency: 180 },
        { network: 'ironSource', revenue: 1103, impressions: 239800, ecpm: 4.60, fillRate: 96.1, sov: 18, winRate: 21, latency: 155 },
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
        { month: 'October 2025', installs: 28400, dau: 78200, d1Retention: 46.2, d7Retention: 29.5, impressions: 624000, clicks: 3120, ctr: 0.50, ecpm: 6.2400, revenue: 3893.76 },
        { month: 'November 2025', installs: 34600, dau: 95400, d1Retention: 47.8, d7Retention: 30.8, impressions: 812000, clicks: 4220, ctr: 0.52, ecpm: 6.8500, revenue: 5562.20 },
        { month: 'December 2025', installs: 41200, dau: 112800, d1Retention: 48.5, d7Retention: 32.1, impressions: 1028000, clicks: 5540, ctr: 0.54, ecpm: 7.2100, revenue: 7411.88 },
      ],
      monetisationTable: [
        { month: 'October 2025', adRevenue: 3894, arpdau: 0.0498, imprPerDau: 8.0, imprBanner: 3.2, imprInter: 1.8, imprReward: 1.2, ecpm: 6.24, fillRate: 92.8 },
        { month: 'November 2025', adRevenue: 5562, arpdau: 0.0583, imprPerDau: 8.5, imprBanner: 3.4, imprInter: 2.0, imprReward: 1.4, ecpm: 6.85, fillRate: 93.5 },
        { month: 'December 2025', adRevenue: 7412, arpdau: 0.0657, imprPerDau: 9.1, imprBanner: 3.6, imprInter: 2.2, imprReward: 1.5, ecpm: 7.21, fillRate: 94.2 },
      ],
      uaTable: [
        { month: 'October 2025', uaCost: 2320, installs: 28400, cpi: 0.082, organic: 8200, paid: 20200, roasD7: 142, roasD30: 168, payback: 15 },
        { month: 'November 2025', uaCost: 2768, installs: 34600, cpi: 0.080, organic: 9800, paid: 24800, roasD7: 158, roasD30: 185, payback: 13 },
        { month: 'December 2025', uaCost: 3214, installs: 41200, cpi: 0.078, organic: 11400, paid: 29800, roasD7: 168, roasD30: 198, payback: 12 },
      ],
      engagementTable: [
        { month: 'October 2025', dau: 78200, avgSessions: 4.1, avgDuration: 12.5, davDau: 85.2, pauConversion: 3.8 },
        { month: 'November 2025', dau: 95400, avgSessions: 4.3, avgDuration: 13.2, davDau: 86.8, pauConversion: 4.1 },
        { month: 'December 2025', dau: 112800, avgSessions: 4.5, avgDuration: 14.0, davDau: 88.2, pauConversion: 4.4 },
      ],
      networksTable: [
        { network: 'AppLovin', revenue: 2890, impressions: 401400, ecpm: 7.20, fillRate: 97.5, sov: 35, winRate: 42, latency: 142 },
        { network: 'AdMob', revenue: 1854, impressions: 308800, ecpm: 6.00, fillRate: 96.2, sov: 27, winRate: 30, latency: 118 },
        { network: 'Unity Ads', revenue: 1408, impressions: 246700, ecpm: 5.70, fillRate: 93.8, sov: 21, winRate: 22, latency: 175 },
        { network: 'ironSource', revenue: 1260, impressions: 185300, ecpm: 6.80, fillRate: 95.4, sov: 17, winRate: 19, latency: 160 },
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
        { month: 'October 2025', installs: 185000, dau: 420000, d1Retention: 32.4, d7Retention: 14.8, impressions: 2940000, clicks: 11760, ctr: 0.40, ecpm: 2.8500, revenue: 8379.00 },
        { month: 'November 2025', installs: 224000, dau: 518000, d1Retention: 33.8, d7Retention: 15.9, impressions: 3885000, clicks: 15540, ctr: 0.40, ecpm: 3.1200, revenue: 12121.20 },
        { month: 'December 2025', installs: 268000, dau: 645000, d1Retention: 35.2, d7Retention: 17.2, impressions: 5160000, clicks: 21672, ctr: 0.42, ecpm: 3.3800, revenue: 17440.80 },
      ],
      monetisationTable: [
        { month: 'October 2025', adRevenue: 8379, arpdau: 0.0199, imprPerDau: 7.0, imprBanner: 4.2, imprInter: 2.4, imprReward: 0.4, ecpm: 2.85, fillRate: 89.5 },
        { month: 'November 2025', adRevenue: 12121, arpdau: 0.0234, imprPerDau: 7.5, imprBanner: 4.5, imprInter: 2.6, imprReward: 0.5, ecpm: 3.12, fillRate: 90.8 },
        { month: 'December 2025', adRevenue: 17441, arpdau: 0.0270, imprPerDau: 8.0, imprBanner: 4.8, imprInter: 2.8, imprReward: 0.6, ecpm: 3.38, fillRate: 91.2 },
      ],
      uaTable: [
        { month: 'October 2025', uaCost: 6475, installs: 185000, cpi: 0.035, organic: 52000, paid: 133000, roasD7: 108, roasD30: 129, payback: 24 },
        { month: 'November 2025', uaCost: 7616, installs: 224000, cpi: 0.034, organic: 64000, paid: 160000, roasD7: 118, roasD30: 159, payback: 21 },
        { month: 'December 2025', uaCost: 8844, installs: 268000, cpi: 0.033, organic: 78000, paid: 190000, roasD7: 128, roasD30: 197, payback: 18 },
      ],
      engagementTable: [
        { month: 'October 2025', dau: 420000, avgSessions: 2.4, avgDuration: 4.2, davDau: 92.5, pauConversion: 0.8 },
        { month: 'November 2025', dau: 518000, avgSessions: 2.5, avgDuration: 4.5, davDau: 93.2, pauConversion: 0.9 },
        { month: 'December 2025', dau: 645000, avgSessions: 2.6, avgDuration: 4.8, davDau: 94.1, pauConversion: 1.0 },
      ],
      networksTable: [
        { network: 'AppLovin', revenue: 5580, impressions: 1548000, ecpm: 3.60, fillRate: 96.8, sov: 30, winRate: 35, latency: 138 },
        { network: 'AdMob', revenue: 5232, impressions: 1806200, ecpm: 2.90, fillRate: 98.2, sov: 35, winRate: 38, latency: 112 },
        { network: 'Unity Ads', revenue: 3488, impressions: 1238600, ecpm: 2.82, fillRate: 92.5, sov: 24, winRate: 26, latency: 165 },
        { network: 'ironSource', revenue: 3140, impressions: 980100, ecpm: 3.20, fillRate: 94.8, sov: 19, winRate: 18, latency: 152 },
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
        { month: 'October 2025', installs: 12800, dau: 52400, d1Retention: 52.4, d7Retention: 34.2, impressions: 418000, clicks: 2926, ctr: 0.70, ecpm: 11.2400, revenue: 4698.32 },
        { month: 'November 2025', installs: 15400, dau: 64200, d1Retention: 54.1, d7Retention: 35.8, impressions: 545000, clicks: 3978, ctr: 0.73, ecpm: 12.4500, revenue: 6785.25 },
        { month: 'December 2025', installs: 18200, dau: 78600, d1Retention: 55.8, d7Retention: 37.4, impressions: 692000, clicks: 5190, ctr: 0.75, ecpm: 13.2800, revenue: 9187.76 },
      ]
    },
    clevel: {
      name: 'Portfolio Overview',
      isPortfolio: true,
      current: { mrr: 2850000, arr: 34200000, apps: 8, totalDau: 3790000, avgArpdau: 0.062, avgRoas: 152 },
      previous: { mrr: 2340000, arr: 28080000, apps: 7, totalDau: 3102000, avgArpdau: 0.058, avgRoas: 138 },
      cohortTable: [
        { month: 'October 2025', installs: 271400, dau: 676200, d1Retention: 38.2, d7Retention: 22.4, impressions: 4874000, clicks: 22082, ctr: 0.45, ecpm: 4.82, revenue: 23492.68 },
        { month: 'November 2025', installs: 326800, dau: 825800, d1Retention: 39.8, d7Retention: 23.6, impressions: 6366000, clicks: 29364, ctr: 0.46, ecpm: 5.24, revenue: 33357.84 },
        { month: 'December 2025', installs: 388800, dau: 1004900, d1Retention: 41.2, d7Retention: 24.8, impressions: 8236000, clicks: 39522, ctr: 0.48, ecpm: 5.68, revenue: 46780.48 },
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
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">📊 Mobile Publishing Metrics</h1>
          <p className="text-slate-400 text-sm mt-1">CAS Mediation · Рекламная монетизация · UA · <span className="text-slate-500">BI v2.4.1</span></p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-slate-800 rounded-xl p-1 flex gap-1">
            <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'dashboard' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}>
              📈 Dashboard
            </button>
            <button onClick={() => setActiveTab('glossary')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'glossary' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}>
              📖 Глоссарий
            </button>
          </div>
        </div>

        {/* Report Type Selection */}
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setSelectedApp('puzzle')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${!['clevel', 'rnd'].includes(selectedApp) ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            📱 App Report
          </button>
          <button
            onClick={() => setSelectedApp('clevel')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedApp === 'clevel' ? 'bg-amber-600' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            👔 C-Level Report
          </button>
          <button
            onClick={() => setSelectedApp('rnd')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedApp === 'rnd' ? 'bg-violet-600' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            🧪 RnD отдел
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <>
            {/* Query Strip - Compact Report Settings */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl mb-6 divide-y divide-slate-700/50">

              {/* Row 1: Filters (Green chips) */}
              <div className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="text-slate-500 text-xs font-medium uppercase tracking-wider pt-1.5 shrink-0 w-20">Фильтры</span>
                  <div className="flex flex-wrap gap-2 flex-1">
                    {/* Active filter chips */}
                    {activeFilters.includes('app') && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {apps.find(a => a.id === selectedApp)?.name}
                        <button onClick={() => setActiveFilters(activeFilters.filter(f => f !== 'app'))} className="hover:text-emerald-200 ml-0.5">×</button>
                      </span>
                    )}
                    {activeFilters.includes('period') && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {periodRange === '1m' ? '1 месяц' : '3 месяца'}
                        <button onClick={() => setActiveFilters(activeFilters.filter(f => f !== 'period'))} className="hover:text-emerald-200 ml-0.5">×</button>
                      </span>
                    )}
                    {activeFilters.includes('appVersion') && filterAppVersion !== 'all' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        v{filterAppVersion}
                        <button onClick={() => { setActiveFilters(activeFilters.filter(f => f !== 'appVersion')); setFilterAppVersion('all'); }} className="hover:text-emerald-200 ml-0.5">×</button>
                      </span>
                    )}
                    {activeFilters.includes('country') && filterCountry !== 'all' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {filterCountry}
                        <button onClick={() => { setActiveFilters(activeFilters.filter(f => f !== 'country')); setFilterCountry('all'); }} className="hover:text-emerald-200 ml-0.5">×</button>
                      </span>
                    )}

                    {/* Add filter dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-300 border border-slate-600/50"
                      >
                        <span>+</span> Фильтр
                      </button>
                      {showFilterDropdown && (
                        <div className="absolute left-0 top-full mt-1 bg-slate-900 border border-slate-600 rounded-lg shadow-xl z-50 min-w-[200px] max-h-60 overflow-y-auto">
                          <div className="p-2 border-b border-slate-700">
                            <input type="text" placeholder="Поиск..." className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-500" />
                          </div>
                          {availableFilters.filter(f => !activeFilters.includes(f.id)).map(filter => (
                            <button
                              key={filter.id}
                              onClick={() => { setActiveFilters([...activeFilters, filter.id]); setShowFilterDropdown(false); }}
                              className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800"
                            >
                              {filter.label}
                            </button>
                          ))}
                          {availableFilters.filter(f => !activeFilters.includes(f.id)).length === 0 && (
                            <div className="px-3 py-2 text-sm text-slate-500">Все добавлены</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Period selector inline */}
                    {activeFilters.includes('period') && (
                      <div className="flex gap-0.5 bg-slate-900/50 rounded p-0.5 ml-2">
                        <button onClick={() => setPeriodRange('1m')} className={`px-2 py-1 rounded text-xs ${periodRange === '1m' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>1м</button>
                        <button onClick={() => setPeriodRange('3m')} className={`px-2 py-1 rounded text-xs ${periodRange === '3m' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>3м</button>
                      </div>
                    )}

                    {/* App selector inline */}
                    {activeFilters.includes('app') && (
                      <select
                        value={selectedApp}
                        onChange={(e) => setSelectedApp(e.target.value)}
                        className="bg-slate-900/50 border border-slate-600/50 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none ml-2"
                      >
                        {apps.filter(a => !['clevel', 'rnd'].includes(a.id)).map(app => (
                          <option key={app.id} value={app.id}>{app.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 2: Breakdown (Gray chips) */}
              <div className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="text-slate-500 text-xs font-medium uppercase tracking-wider pt-1.5 shrink-0 w-20">Разбивка</span>
                  <div className="flex flex-wrap gap-2 flex-1">
                    {/* Time breakdown toggle */}
                    <div className="flex gap-0.5 bg-slate-900/50 rounded p-0.5">
                      <button
                        onClick={() => setPeriodType('week')}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition ${periodType === 'week' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        Недели
                      </button>
                      <button
                        onClick={() => setPeriodType('month')}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition ${periodType === 'month' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        Месяцы
                      </button>
                    </div>

                    {/* Additional breakdowns */}
                    <button
                      onClick={() => setBreakdownByAppVersion(!breakdownByAppVersion)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition border ${
                        breakdownByAppVersion
                          ? 'bg-slate-600/50 text-slate-200 border-slate-500'
                          : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:border-slate-600'
                      }`}
                    >
                      App Version
                      {breakdownByAppVersion && <span className="text-slate-400">×</span>}
                    </button>

                    <button
                      onClick={() => setBreakdownByCasVersion(!breakdownByCasVersion)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition border ${
                        breakdownByCasVersion
                          ? 'bg-slate-600/50 text-slate-200 border-slate-500'
                          : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:border-slate-600'
                      }`}
                    >
                      CAS SDK
                      {breakdownByCasVersion && <span className="text-slate-400">×</span>}
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3: Metrics (Dark gray chips) */}
              <div className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="text-slate-500 text-xs font-medium uppercase tracking-wider pt-1.5 shrink-0 w-20">Метрики</span>
                  <div className="flex flex-wrap gap-2 flex-1">
                    {/* Selected metrics */}
                    {selectedMetrics.map(metricId => {
                      const metric = allMetricsOptions.find(m => m.id === metricId);
                      return (
                        <span
                          key={metricId}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/50"
                        >
                          {metric?.name}
                          <button onClick={() => setSelectedMetrics(selectedMetrics.filter(m => m !== metricId))} className="hover:text-white ml-0.5">×</button>
                        </span>
                      );
                    })}

                    {/* Add metric dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setShowMetricAddDropdown(!showMetricAddDropdown)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-300 border border-slate-600/50"
                      >
                        <span>+</span> Метрика
                      </button>
                      {showMetricAddDropdown && (
                        <div className="absolute left-0 top-full mt-1 bg-slate-900 border border-slate-600 rounded-lg shadow-xl z-50 min-w-[220px] max-h-60 overflow-y-auto">
                          <div className="p-2 border-b border-slate-700">
                            <input type="text" placeholder="Поиск метрики..." className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-500" />
                          </div>
                          {['engagement', 'monetisation', 'cohort', 'ua'].map(section => {
                            const sectionMetrics = allMetricsOptions.filter(m => m.section === section && !selectedMetrics.includes(m.id));
                            if (sectionMetrics.length === 0) return null;
                            return (
                              <div key={section}>
                                <div className="px-3 py-1.5 text-[10px] text-slate-500 uppercase bg-slate-800/50 sticky top-0">{section}</div>
                                {sectionMetrics.map(metric => (
                                  <button
                                    key={metric.id}
                                    onClick={() => { setSelectedMetrics([...selectedMetrics, metric.id]); setShowMetricAddDropdown(false); }}
                                    className="w-full px-3 py-1.5 text-left text-xs text-slate-300 hover:bg-slate-800"
                                  >
                                    {metric.name}
                                  </button>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 4: Summary + Apply */}
              <div className="px-4 py-2.5 bg-slate-900/30 flex items-center gap-3">
                <span className="text-slate-600 text-xs shrink-0">Сводка:</span>
                <div className="flex flex-wrap gap-1.5 flex-1 text-[10px]">
                  <span className="text-slate-500">{apps.find(a => a.id === selectedApp)?.name}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-500">{periodRange === '1m' ? '1 мес' : '3 мес'}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-500">{periodType === 'week' ? 'недели' : 'месяцы'}</span>
                  {breakdownByAppVersion && <><span className="text-slate-600">•</span><span className="text-slate-500">+app ver</span></>}
                  {breakdownByCasVersion && <><span className="text-slate-600">•</span><span className="text-slate-500">+sdk ver</span></>}
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-500">{selectedMetrics.length} метрик</span>
                </div>
                <button className="px-4 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition shrink-0">
                  Применить
                </button>
              </div>
            </div>

            {/* View Type Switcher */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-slate-400 text-sm">Вид:</span>
              <div className="flex bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setViewType('table')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
                    viewType === 'table'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>📋</span> Таблица
                </button>
                <button
                  onClick={() => setViewType('bar')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
                    viewType === 'bar'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>📊</span> Диаграммы
                </button>
                <button
                  onClick={() => setViewType('line')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
                    viewType === 'line'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>📈</span> Графики
                </button>
              </div>
            </div>

            {/* RnD A/B Tests */}
            {data.isRnd ? (
              <>
                {/* KPI Widgets */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <div className="bg-gradient-to-br from-violet-900/50 to-purple-900/50 border border-violet-700/50 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-violet-400 text-xs uppercase">Active Tests</div>
                        <div className="text-xl font-bold text-white">{data.current.activeTests}</div>
                      </div>
                      <span className="text-xs font-medium text-emerald-400">+{data.current.activeTests - data.previous.activeTests}</span>
                    </div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-slate-400 text-xs uppercase">Completed (Dec)</div>
                        <div className="text-xl font-bold text-white">{data.current.completedThisMonth}</div>
                      </div>
                      <span className="text-xs font-medium text-emerald-400">+{data.current.completedThisMonth - data.previous.completedThisMonth}</span>
                    </div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-slate-400 text-xs uppercase">Avg Lift</div>
                        <div className="text-xl font-bold text-white">+{data.current.avgLift}%</div>
                      </div>
                      <span className="text-xs font-medium text-emerald-400">+{(data.current.avgLift - data.previous.avgLift).toFixed(1)}pp</span>
                    </div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-slate-400 text-xs uppercase">Success Rate</div>
                        <div className="text-xl font-bold text-white">{data.current.successRate}%</div>
                      </div>
                      <span className="text-xs font-medium text-emerald-400">+{data.current.successRate - data.previous.successRate}pp</span>
                    </div>
                  </div>
                </div>

                {/* Active Tests Table */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-violet-400">🔬</span> Active A/B Tests
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-600">
                          <th className="text-left py-3 px-2 text-slate-400 font-medium">Test ID</th>
                          <th className="text-left py-3 px-2 text-slate-400 font-medium">App</th>
                          <th className="text-left py-3 px-2 text-slate-400 font-medium">Test Name</th>
                          <th className="text-left py-3 px-2 text-slate-400 font-medium">Type</th>
                          <th className="text-right py-3 px-2 text-slate-400 font-medium">Traffic</th>
                          <th className="text-right py-3 px-2 text-slate-400 font-medium">Control</th>
                          <th className="text-right py-3 px-2 text-slate-400 font-medium">Variant</th>
                          <th className="text-right py-3 px-2 text-slate-400 font-medium">Lift</th>
                          <th className="text-right py-3 px-2 text-slate-400 font-medium">Confidence</th>
                          <th className="text-right py-3 px-2 text-slate-400 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.activeTests.map((test, i) => {
                          const typeColors = { Networks: 'text-cyan-400', Settings: 'text-amber-400', SDK: 'text-violet-400' };
                          const isPositive = test.lift.startsWith('+');
                          return (
                            <tr key={test.id} className={`border-b border-slate-700/50 ${i % 2 === 0 ? '' : 'bg-slate-900/30'}`}>
                              <td className="py-3 px-2 font-mono text-violet-400">{test.id}</td>
                              <td className="py-3 px-2 text-white">{test.app}</td>
                              <td className="py-3 px-2 text-white font-medium">{test.name}</td>
                              <td className={`py-3 px-2 ${typeColors[test.type] || 'text-slate-300'}`}>{test.type}</td>
                              <td className="py-3 px-2 text-right text-slate-300">{test.traffic}%</td>
                              <td className="py-3 px-2 text-right text-slate-400">${test.control.arpdau.toFixed(4)}</td>
                              <td className="py-3 px-2 text-right text-white">${test.variant.arpdau.toFixed(4)}</td>
                              <td className={`py-3 px-2 text-right font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>{test.lift}</td>
                              <td className="py-3 px-2 text-right">
                                <span className={`${test.confidence >= 95 ? 'text-emerald-400' : test.confidence >= 80 ? 'text-amber-400' : 'text-slate-400'}`}>{test.confidence}%</span>
                              </td>
                              <td className="py-3 px-2 text-right">
                                {test.status === 'running' ? (
                                  <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-xs">{test.daysLeft}d left</span>
                                ) : (
                                  <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-xs">Paused</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Completed Tests Table */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-emerald-400">✅</span> Completed Tests (Last 30 days)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-600">
                          <th className="text-left py-3 px-2 text-slate-400 font-medium">Test ID</th>
                          <th className="text-left py-3 px-2 text-slate-400 font-medium">App</th>
                          <th className="text-left py-3 px-2 text-slate-400 font-medium">Test Name</th>
                          <th className="text-left py-3 px-2 text-slate-400 font-medium">Type</th>
                          <th className="text-right py-3 px-2 text-slate-400 font-medium">Lift</th>
                          <th className="text-right py-3 px-2 text-slate-400 font-medium">Confidence</th>
                          <th className="text-right py-3 px-2 text-slate-400 font-medium">Revenue Impact</th>
                          <th className="text-right py-3 px-2 text-slate-400 font-medium">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.completedTests.map((test, i) => {
                          const typeColors = { Networks: 'text-cyan-400', Settings: 'text-amber-400', SDK: 'text-violet-400' };
                          const statusConfig = {
                            winner: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: '✓ Winner' },
                            loser: { bg: 'bg-red-500/20', text: 'text-red-400', label: '✗ Loser' },
                            inconclusive: { bg: 'bg-slate-500/20', text: 'text-slate-400', label: '~ Inconclusive' },
                          };
                          const status = statusConfig[test.status];
                          const isPositive = test.lift.startsWith('+');
                          return (
                            <tr key={test.id} className={`border-b border-slate-700/50 ${i % 2 === 0 ? '' : 'bg-slate-900/30'}`}>
                              <td className="py-3 px-2 font-mono text-slate-500">{test.id}</td>
                              <td className="py-3 px-2 text-white">{test.app}</td>
                              <td className="py-3 px-2 text-white">{test.name}</td>
                              <td className={`py-3 px-2 ${typeColors[test.type] || 'text-slate-300'}`}>{test.type}</td>
                              <td className={`py-3 px-2 text-right font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>{test.lift}</td>
                              <td className="py-3 px-2 text-right text-slate-300">{test.confidence}%</td>
                              <td className={`py-3 px-2 text-right font-medium ${test.revenue.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>{test.revenue}</td>
                              <td className="py-3 px-2 text-right">
                                <span className={`${status.bg} ${status.text} px-2 py-0.5 rounded text-xs`}>{status.label}</span>
                                {test.deployed && <span className="ml-1 text-blue-400 text-xs">🚀</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Network & SDK Performance side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Network Tests Summary */}
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className="text-cyan-400">🌐</span> Network Tests Summary
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-600">
                            <th className="text-left py-2 px-2 text-slate-400 font-medium">Network</th>
                            <th className="text-right py-2 px-2 text-slate-400 font-medium">Tests</th>
                            <th className="text-right py-2 px-2 text-slate-400 font-medium">Wins</th>
                            <th className="text-right py-2 px-2 text-slate-400 font-medium">Avg Lift</th>
                            <th className="text-left py-2 px-2 text-slate-400 font-medium">Best Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.networkTests.map((net, i) => {
                            const isPositive = net.avgLift.startsWith('+');
                            return (
                              <tr key={net.network} className={`border-b border-slate-700/50 ${i % 2 === 0 ? '' : 'bg-slate-900/30'}`}>
                                <td className="py-2 px-2 text-white font-medium">{net.network}</td>
                                <td className="py-2 px-2 text-right text-slate-300">{net.testsRun}</td>
                                <td className="py-2 px-2 text-right text-emerald-400">{net.wins}</td>
                                <td className={`py-2 px-2 text-right font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>{net.avgLift}</td>
                                <td className="py-2 px-2 text-slate-400 text-xs">{net.bestResult}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* SDK Tests Summary */}
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className="text-violet-400">📦</span> SDK Tests Summary
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-600">
                            <th className="text-left py-2 px-2 text-slate-400 font-medium">SDK</th>
                            <th className="text-right py-2 px-2 text-slate-400 font-medium">Tests</th>
                            <th className="text-right py-2 px-2 text-slate-400 font-medium">Lift vs Prev</th>
                            <th className="text-right py-2 px-2 text-slate-400 font-medium">Adopted</th>
                            <th className="text-left py-2 px-2 text-slate-400 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.sdkTests.map((sdk, i) => {
                            const isPositive = sdk.avgLiftVsPrev.startsWith('+');
                            return (
                              <tr key={sdk.sdk} className={`border-b border-slate-700/50 ${i % 2 === 0 ? '' : 'bg-slate-900/30'}`}>
                                <td className="py-2 px-2 text-white font-medium">{sdk.sdk}</td>
                                <td className="py-2 px-2 text-right text-slate-300">{sdk.testsRun}</td>
                                <td className={`py-2 px-2 text-right font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>{sdk.avgLiftVsPrev}</td>
                                <td className="py-2 px-2 text-right text-slate-300">{sdk.adopted}</td>
                                <td className="py-2 px-2">
                                  <span className={`text-xs px-2 py-0.5 rounded ${
                                    sdk.recommendation === 'Rollout to all' ? 'bg-emerald-500/20 text-emerald-400' :
                                    sdk.recommendation === 'Update available' ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-red-500/20 text-red-400'
                                  }`}>{sdk.recommendation}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            ) : data.isPortfolio ? (
              <>
                {/* Apps Cohort Comparison - Main Table First */}
                {data.appsCohortComparison && (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <span>📈</span> Apps Performance Comparison (Dec vs Nov 2025)
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-xs">Сортировка:</span>
                        <select
                          value={appsSortBy}
                          onChange={(e) => setAppsSortBy(e.target.value)}
                          className="bg-slate-700 text-white text-xs px-2 py-1 rounded border border-slate-600"
                        >
                          <option value="profitDelta">Δ Profit</option>
                          <option value="revenueDelta">Δ Revenue</option>
                          <option value="dauDelta">Δ DAU</option>
                          <option value="roasDelta">Δ ROAS</option>
                          <option value="manager">Manager</option>
                        </select>
                        <button
                          onClick={() => setAppsSortDir(appsSortDir === 'desc' ? 'asc' : 'desc')}
                          className="px-2 py-1 bg-slate-700 text-white text-xs rounded border border-slate-600"
                        >
                          {appsSortDir === 'desc' ? '↓' : '↑'}
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-600">
                            <th className="text-left py-3 px-2 text-slate-400 font-medium">App</th>
                            <th className="text-left py-3 px-2 text-slate-400 font-medium">Manager</th>
                            <th className="text-right py-3 px-2 text-slate-400 font-medium">Profit</th>
                            <th className="text-right py-3 px-2 text-slate-400 font-medium">Δ Profit</th>
                            <th className="text-right py-3 px-2 text-slate-400 font-medium">Revenue</th>
                            <th className="text-right py-3 px-2 text-slate-400 font-medium">Δ Revenue</th>
                            <th className="text-right py-3 px-2 text-slate-400 font-medium">DAU</th>
                            <th className="text-right py-3 px-2 text-slate-400 font-medium">Δ DAU</th>
                            <th className="text-right py-3 px-2 text-slate-400 font-medium">D7 Ret</th>
                            <th className="text-right py-3 px-2 text-slate-400 font-medium">Δ D7</th>
                            <th className="text-right py-3 px-2 text-slate-400 font-medium">ARPDAU</th>
                            <th className="text-right py-3 px-2 text-slate-400 font-medium">ROAS</th>
                            <th className="text-right py-3 px-2 text-slate-400 font-medium">Δ ROAS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...data.appsCohortComparison].sort((a, b) => {
                            const getDelta = (item, field) => {
                              if (field === 'manager') return item.manager;
                              const curr = item.current[field.replace('Delta', '')];
                              const prev = item.previous[field.replace('Delta', '')];
                              return ((curr - prev) / prev) * 100;
                            };
                            const aVal = getDelta(a, appsSortBy);
                            const bVal = getDelta(b, appsSortBy);
                            if (appsSortBy === 'manager') {
                              return appsSortDir === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
                            }
                            return appsSortDir === 'desc' ? bVal - aVal : aVal - bVal;
                          }).map((app, i) => {
                            const profitDelta = ((app.current.profit - app.previous.profit) / app.previous.profit * 100).toFixed(1);
                            const revDelta = ((app.current.revenue - app.previous.revenue) / app.previous.revenue * 100).toFixed(1);
                            const dauDelta = ((app.current.dau - app.previous.dau) / app.previous.dau * 100).toFixed(1);
                            const d7Delta = (app.current.d7Ret - app.previous.d7Ret).toFixed(1);
                            const roasDelta = (app.current.roas - app.previous.roas);
                            const managerColor = {
                              'Anton Smirnov': 'text-amber-400',
                              'Serhii Shcherbyna': 'text-blue-400',
                              'Rashid Sabirov': 'text-purple-400',
                            };
                            return (
                              <tr key={app.name} className={`border-b border-slate-700/50 ${i % 2 === 0 ? '' : 'bg-slate-900/30'}`}>
                                <td className="py-3 px-2 font-medium text-white">{app.name}</td>
                                <td className={`py-3 px-2 ${managerColor[app.manager] || 'text-slate-300'}`}>{app.manager.split(' ')[0]}</td>
                                <td className="py-3 px-2 text-right text-white font-medium">${(app.current.profit/1000).toFixed(0)}K</td>
                                <td className={`py-3 px-2 text-right font-medium ${parseFloat(profitDelta) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {parseFloat(profitDelta) >= 0 ? '+' : ''}{profitDelta}%
                                </td>
                                <td className="py-3 px-2 text-right text-slate-300">${(app.current.revenue/1000).toFixed(0)}K</td>
                                <td className={`py-3 px-2 text-right ${parseFloat(revDelta) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {parseFloat(revDelta) >= 0 ? '+' : ''}{revDelta}%
                                </td>
                                <td className="py-3 px-2 text-right text-slate-300">{formatNum(app.current.dau)}</td>
                                <td className={`py-3 px-2 text-right ${parseFloat(dauDelta) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {parseFloat(dauDelta) >= 0 ? '+' : ''}{dauDelta}%
                                </td>
                                <td className="py-3 px-2 text-right text-slate-300">{app.current.d7Ret}%</td>
                                <td className={`py-3 px-2 text-right ${parseFloat(d7Delta) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {parseFloat(d7Delta) >= 0 ? '+' : ''}{d7Delta}pp
                                </td>
                                <td className="py-3 px-2 text-right text-slate-300">${app.current.arpdau.toFixed(3)}</td>
                                <td className="py-3 px-2 text-right text-slate-300">{app.current.roas}%</td>
                                <td className={`py-3 px-2 text-right font-medium ${roasDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {roasDelta >= 0 ? '+' : ''}{roasDelta}pp
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Compact KPI Widgets - 4 in one row */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <div className="bg-gradient-to-br from-amber-900/50 to-orange-900/50 border border-amber-700/50 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-amber-400 text-xs uppercase">MRR</div>
                        <div className="text-xl font-bold text-white">${(data.current.mrr/1000000).toFixed(2)}M</div>
                      </div>
                      <span className="text-xs font-medium text-emerald-400">{calcDelta(data.current.mrr, data.previous.mrr)}</span>
                    </div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-slate-400 text-xs uppercase">Total DAU</div>
                        <div className="text-xl font-bold text-white">{formatNum(data.current.totalDau)}</div>
                      </div>
                      <span className="text-xs font-medium text-emerald-400">{calcDelta(data.current.totalDau, data.previous.totalDau)}</span>
                    </div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-slate-400 text-xs uppercase">Avg ARPDAU</div>
                        <div className="text-xl font-bold text-white">${data.current.avgArpdau.toFixed(3)}</div>
                      </div>
                      <span className="text-xs font-medium text-emerald-400">{calcDelta(data.current.avgArpdau, data.previous.avgArpdau)}</span>
                    </div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-slate-400 text-xs uppercase">Avg ROAS</div>
                        <div className="text-xl font-bold text-white">{data.current.avgRoas}%</div>
                      </div>
                      <span className="text-xs font-medium text-emerald-400">{calcDelta(data.current.avgRoas, data.previous.avgRoas)}</span>
                    </div>
                  </div>
                </div>

                {/* Apps Breakdown */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <span>🎮</span> {groupByManager ? 'Account Managers Performance' : 'Apps Profit Breakdown'}
                    </h3>
                    <button
                      onClick={() => setGroupByManager(!groupByManager)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${groupByManager ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                      👤 {groupByManager ? 'Show Apps' : 'Group by Manager'}
                    </button>
                  </div>
                  
                  {groupByManager ? (
                    <div className="space-y-4">
                      {data.managers.map((manager) => (
                        <div key={manager.name} className="bg-slate-900/50 rounded-xl p-4">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                                {manager.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <div className="text-white font-semibold">{manager.name}</div>
                                <div className="text-slate-500 text-xs">{manager.apps} apps</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-white">${(manager.profit/1000).toFixed(0)}K</div>
                              <div className="text-emerald-400 text-sm">{manager.share}% of portfolio</div>
                            </div>
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                            <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full" style={{ width: manager.share + '%' }} />
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-slate-500 text-xs">Apps</div>
                              <div className="text-white font-semibold">{manager.apps}</div>
                            </div>
                            <div>
                              <div className="text-slate-500 text-xs">Total DAU</div>
                              <div className="text-white font-semibold">{formatNum(manager.dau)}</div>
                            </div>
                            <div>
                              <div className="text-slate-500 text-xs">Avg per App</div>
                              <div className="text-white font-semibold">${(manager.profit/manager.apps/1000).toFixed(0)}K</div>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-700">
                            <div className="text-slate-500 text-xs mb-2">Apps:</div>
                            <div className="flex flex-wrap gap-2">
                              {data.appsBreakdown.filter(a => a.manager === manager.name).map(app => (
                                <span key={app.name} className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs">
                                  {app.name} · ${(app.profit/1000).toFixed(0)}K
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {data.appsBreakdown.map((app) => (
                        <div key={app.name} className="bg-slate-900/50 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-white font-medium text-sm">{app.name}</span>
                            <span className="text-emerald-400 text-xs">{app.share}%</span>
                          </div>
                          <div className="text-xl font-bold text-white">${(app.profit/1000).toFixed(0)}K</div>
                          <div className="text-slate-500 text-xs mt-1">DAU: {formatNum(app.dau)}</div>
                          <div className="text-amber-400 text-xs mt-1">👤 {app.manager.split(' ')[0]}</div>
                          <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: app.share + '%' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Manager Tables */}
                {data.managers.map((manager) => (
                  <div key={manager.name} className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                        {manager.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{manager.name}</h3>
                        <p className="text-slate-400 text-sm">{manager.apps} apps · ${(manager.profit/1000).toFixed(0)}K profit · {manager.share}% portfolio</p>
                      </div>
                    </div>

                    {/* Cohort Table */}
                    {data.managersCohortTable && data.managersCohortTable[manager.name] && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-slate-400 mb-2">📊 Monthly Cohort</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-600">
                                <th className="text-left py-2 px-2 text-slate-500 font-medium">Month</th>
                                <th className="text-right py-2 px-2 text-slate-500 font-medium">Installs</th>
                                <th className="text-right py-2 px-2 text-slate-500 font-medium">DAU</th>
                                <th className="text-right py-2 px-2 text-slate-500 font-medium">D1 Ret</th>
                                <th className="text-right py-2 px-2 text-slate-500 font-medium">D7 Ret</th>
                                <th className="text-right py-2 px-2 text-slate-500 font-medium">Impr</th>
                                <th className="text-right py-2 px-2 text-slate-500 font-medium">eCPM</th>
                                <th className="text-right py-2 px-2 text-slate-500 font-medium">Revenue</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.managersCohortTable[manager.name].map((row, i) => (
                                <tr key={row.month} className={`border-b border-slate-700/50 ${i % 2 === 0 ? '' : 'bg-slate-900/30'}`}>
                                  <td className="py-2 px-2 text-white">{row.month.split(' ')[0]}</td>
                                  <td className="py-2 px-2 text-right text-slate-300">{row.installs.toLocaleString()}</td>
                                  <td className="py-2 px-2 text-right text-slate-300">{row.dau.toLocaleString()}</td>
                                  <td className="py-2 px-2 text-right text-slate-300">{row.d1Retention}%</td>
                                  <td className="py-2 px-2 text-right text-slate-300">{row.d7Retention}%</td>
                                  <td className="py-2 px-2 text-right text-slate-300">{(row.impressions/1000000).toFixed(2)}M</td>
                                  <td className="py-2 px-2 text-right text-slate-300">${row.ecpm.toFixed(2)}</td>
                                  <td className="py-2 px-2 text-right text-emerald-400 font-medium">${row.revenue.toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Monetisation & UA side by side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Monetisation */}
                      {data.managersMonetisation && data.managersMonetisation[manager.name] && (
                        <div>
                          <h4 className="text-sm font-medium text-emerald-400 mb-2">💰 Monetisation</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-slate-600">
                                  <th className="text-left py-2 px-2 text-slate-500 font-medium">Month</th>
                                  <th className="text-right py-2 px-2 text-slate-500 font-medium">ARPDAU</th>
                                  <th className="text-right py-2 px-2 text-slate-500 font-medium">Impr/DAU</th>
                                  <th className="text-right py-2 px-2 text-slate-500 font-medium">Fill</th>
                                </tr>
                              </thead>
                              <tbody>
                                {data.managersMonetisation[manager.name].map((row, i) => (
                                  <tr key={row.month} className={`border-b border-slate-700/50 ${i % 2 === 0 ? '' : 'bg-slate-900/30'}`}>
                                    <td className="py-2 px-2 text-white">{row.month.split(' ')[0]}</td>
                                    <td className="py-2 px-2 text-right text-emerald-400">${row.arpdau.toFixed(4)}</td>
                                    <td className="py-2 px-2 text-right text-slate-300">{row.imprPerDau}</td>
                                    <td className="py-2 px-2 text-right text-slate-300">{row.fillRate}%</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* UA */}
                      {data.managersUA && data.managersUA[manager.name] && (
                        <div>
                          <h4 className="text-sm font-medium text-pink-400 mb-2">📢 UA Performance</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-slate-600">
                                  <th className="text-left py-2 px-2 text-slate-500 font-medium">Month</th>
                                  <th className="text-right py-2 px-2 text-slate-500 font-medium">Cost</th>
                                  <th className="text-right py-2 px-2 text-slate-500 font-medium">CPI</th>
                                  <th className="text-right py-2 px-2 text-slate-500 font-medium">ROAS D7</th>
                                </tr>
                              </thead>
                              <tbody>
                                {data.managersUA[manager.name].map((row, i) => (
                                  <tr key={row.month} className={`border-b border-slate-700/50 ${i % 2 === 0 ? '' : 'bg-slate-900/30'}`}>
                                    <td className="py-2 px-2 text-white">{row.month.split(' ')[0]}</td>
                                    <td className="py-2 px-2 text-right text-pink-400">${row.uaCost.toLocaleString()}</td>
                                    <td className="py-2 px-2 text-right text-slate-300">${row.cpi.toFixed(3)}</td>
                                    <td className="py-2 px-2 text-right">
                                      <span className={row.roasD7 >= 100 ? 'text-emerald-400' : 'text-red-400'}>{row.roasD7}%</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="grid grid-cols-5 gap-3 mb-6">
                <MetricCard label="DAU" value={data.current.dau} prev={data.previous.dau} format={formatNum} />
                <MetricCard label="ARPDAU" value={data.current.arpdau} prev={data.previous.arpdau} format={(v) => '$'+v.toFixed(3)} />
                <MetricCard label="Retention D7" value={data.current.retention_d7} prev={data.previous.retention_d7} suffix="%" />
                <MetricCard label="LTV" value={data.current.ltv} prev={data.previous.ltv} format={(v) => '$'+v.toFixed(2)} />
                <MetricCard label="ROAS" value={data.current.roas} prev={data.previous.roas} suffix="%" />
              </div>
            )}

            {/* Table View */}
            {viewType === 'table' && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span>📊</span> Publisher Dashboard — {periodType === 'week' ? 'Weekly' : 'Monthly'} Cohort Table
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="text-left py-3 px-2 text-slate-400 font-medium">{periodType === 'week' ? 'Week' : 'Period'}</th>
                        {selectedMetrics.map(metricId => {
                          const metric = allMetricsOptions.find(m => m.id === metricId);
                          return (
                            <th
                              key={metricId}
                              className={`text-right py-3 px-2 text-slate-400 font-medium cursor-grab select-none transition-all ${draggedColumn === metricId ? 'opacity-50 bg-slate-700' : 'hover:bg-slate-700/50'}`}
                              draggable
                              onDragStart={(e) => handleColumnDragStart(e, metricId)}
                              onDragOver={(e) => handleColumnDragOver(e, metricId)}
                              onDragEnd={handleColumnDragEnd}
                            >
                              {metric?.name || metricId}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {getTableData(selectedApp, 'cohortTable').map((row, i) => {
                        const monRow = getTableData(selectedApp, 'monetisationTable')[i] || {};
                        const engRow = getTableData(selectedApp, 'engagementTable')[i] || {};

                        const getMetricValue = (metricId) => {
                          switch(metricId) {
                            case 'installs': return row.installs?.toLocaleString() || '-';
                            case 'dau': return row.dau?.toLocaleString() || '-';
                            case 'sessions': return engRow.avgSessions || '-';
                            case 'session_duration': return engRow.avgDuration ? `${engRow.avgDuration}m` : '-';
                            case 'd1_retention': return row.d1Retention ? `${row.d1Retention}%` : '-';
                            case 'd7_retention': return row.d7Retention ? `${row.d7Retention}%` : '-';
                            case 'd30_retention': return row.d30Retention ? `${row.d30Retention}%` : '-';
                            case 'impressions': return row.impressions?.toLocaleString() || '-';
                            case 'impr_per_dau': return monRow.imprPerDau || '-';
                            case 'ecpm': return row.ecpm ? `$${row.ecpm.toFixed(2)}` : '-';
                            case 'fill_rate': return monRow.fillRate ? `${monRow.fillRate}%` : '-';
                            case 'arpdau': return monRow.arpdau ? `$${monRow.arpdau.toFixed(4)}` : '-';
                            case 'revenue': return row.revenue ? `$${row.revenue.toFixed(2)}` : '-';
                            case 'ltv': return row.ltv ? `$${row.ltv.toFixed(2)}` : '-';
                            case 'cpi': return row.cpi ? `$${row.cpi.toFixed(2)}` : '-';
                            case 'roas': return row.roas ? `${row.roas}%` : '-';
                            case 'wau': return row.wau?.toLocaleString() || '-';
                            case 'mau': return row.mau?.toLocaleString() || '-';
                            default: return '-';
                          }
                        };

                        const getMetricStyle = (metricId) => {
                          switch(metricId) {
                            case 'dau': return 'text-purple-400 font-medium';
                            case 'revenue': return 'text-emerald-400 font-medium';
                            case 'arpdau': return 'text-emerald-400';
                            default: return 'text-slate-300';
                          }
                        };

                        return (
                          <tr key={row.month || row.period} className={`border-b border-slate-700/50 ${i % 2 === 0 ? '' : 'bg-slate-900/30'}`}>
                            <td className="py-3 px-2 font-medium text-white">{row.month || row.period}</td>
                            {selectedMetrics.map(metricId => (
                              <td key={metricId} className={`py-3 px-2 text-right ${getMetricStyle(metricId)}`}>
                                {getMetricValue(metricId)}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bar Chart View */}
            {viewType === 'bar' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(() => {
                  const tableData = getTableData(selectedApp, 'cohortTable');
                  const monData = getTableData(selectedApp, 'monetisationTable');
                  const engData = getTableData(selectedApp, 'engagementTable');

                  const metricConfigs = {
                    installs: { color: 'bg-blue-500', getValue: (row) => row.installs || 0 },
                    dau: { color: 'bg-purple-500', getValue: (row) => row.dau || 0 },
                    sessions: { color: 'bg-indigo-500', getValue: (row, i) => engData[i]?.avgSessions || 0 },
                    session_duration: { color: 'bg-violet-500', getValue: (row, i) => engData[i]?.avgDuration || 0 },
                    d1_retention: { color: 'bg-amber-500', getValue: (row) => row.d1Retention || 0 },
                    d7_retention: { color: 'bg-orange-500', getValue: (row) => row.d7Retention || 0 },
                    d30_retention: { color: 'bg-red-500', getValue: (row) => row.d30Retention || 0 },
                    impressions: { color: 'bg-cyan-500', getValue: (row) => row.impressions || 0 },
                    impr_per_dau: { color: 'bg-sky-500', getValue: (row, i) => monData[i]?.imprPerDau || 0 },
                    ecpm: { color: 'bg-emerald-500', getValue: (row) => row.ecpm || 0 },
                    fill_rate: { color: 'bg-lime-500', getValue: (row, i) => monData[i]?.fillRate || 0 },
                    arpdau: { color: 'bg-teal-500', getValue: (row, i) => monData[i]?.arpdau || 0 },
                    revenue: { color: 'bg-green-500', getValue: (row) => row.revenue || 0 },
                  };

                  return selectedMetrics.filter(id => metricConfigs[id]).map(metricId => {
                    const metric = allMetricsOptions.find(m => m.id === metricId);
                    const config = metricConfigs[metricId];
                    const values = tableData.map((row, i) => config.getValue(row, i));
                    const maxValue = Math.max(...values) || 1;

                    return (
                      <div key={metricId} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-slate-300 mb-3">{metric?.name}</h4>
                        <div className="flex items-end justify-between gap-1 h-32">
                          {tableData.map((row, i) => {
                            const value = config.getValue(row, i);
                            const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                            return (
                              <div key={row.month || row.period} className="flex flex-col items-center flex-1 h-full">
                                <span className="text-[10px] text-slate-300 mb-1">
                                  {typeof value === 'number' ? (value >= 1000 ? (value/1000).toFixed(1)+'k' : value.toFixed(1)) : value}
                                </span>
                                <div className="flex-1 w-full flex items-end justify-center">
                                  <div className={`w-full max-w-8 ${config.color} rounded-t transition-all duration-300`} style={{ height: `${height}%` }} />
                                </div>
                                <span className="text-[9px] text-slate-400 mt-1 truncate w-full text-center">{row.month || row.period}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}

            {/* Line Chart View */}
            {viewType === 'line' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(() => {
                  const tableData = getTableData(selectedApp, 'cohortTable');
                  const monData = getTableData(selectedApp, 'monetisationTable');
                  const engData = getTableData(selectedApp, 'engagementTable');

                  const metricConfigs = {
                    installs: { color: '#3b82f6', getValue: (row) => row.installs || 0 },
                    dau: { color: '#a855f7', getValue: (row) => row.dau || 0 },
                    sessions: { color: '#6366f1', getValue: (row, i) => engData[i]?.avgSessions || 0 },
                    session_duration: { color: '#8b5cf6', getValue: (row, i) => engData[i]?.avgDuration || 0 },
                    d1_retention: { color: '#f59e0b', getValue: (row) => row.d1Retention || 0 },
                    d7_retention: { color: '#f97316', getValue: (row) => row.d7Retention || 0 },
                    d30_retention: { color: '#ef4444', getValue: (row) => row.d30Retention || 0 },
                    impressions: { color: '#06b6d4', getValue: (row) => row.impressions || 0 },
                    impr_per_dau: { color: '#0ea5e9', getValue: (row, i) => monData[i]?.imprPerDau || 0 },
                    ecpm: { color: '#10b981', getValue: (row) => row.ecpm || 0 },
                    fill_rate: { color: '#84cc16', getValue: (row, i) => monData[i]?.fillRate || 0 },
                    arpdau: { color: '#14b8a6', getValue: (row, i) => monData[i]?.arpdau || 0 },
                    revenue: { color: '#22c55e', getValue: (row) => row.revenue || 0 },
                  };

                  return selectedMetrics.filter(id => metricConfigs[id]).map(metricId => {
                    const metric = allMetricsOptions.find(m => m.id === metricId);
                    const config = metricConfigs[metricId];
                    const values = tableData.map((row, i) => config.getValue(row, i));
                    const maxValue = Math.max(...values) || 1;
                    const minValue = Math.min(...values);
                    const range = maxValue - minValue || 1;
                    const points = values.map((v, i) => {
                      const x = tableData.length > 1 ? (i / (tableData.length - 1)) * 280 + 10 : 150;
                      const y = 80 - ((v - minValue) / range) * 60;
                      return `${x},${y}`;
                    }).join(' ');

                    return (
                      <div key={metricId} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-slate-300 mb-3">{metric?.name}</h4>
                        <svg viewBox="0 0 300 100" className="w-full h-28">
                          <line x1="10" y1="20" x2="290" y2="20" stroke="#334155" strokeWidth="0.5" />
                          <line x1="10" y1="50" x2="290" y2="50" stroke="#334155" strokeWidth="0.5" />
                          <line x1="10" y1="80" x2="290" y2="80" stroke="#334155" strokeWidth="0.5" />
                          <polyline fill="none" stroke={config.color} strokeWidth="2" points={points} />
                          {values.map((v, i) => {
                            const x = tableData.length > 1 ? (i / (tableData.length - 1)) * 280 + 10 : 150;
                            const y = 80 - ((v - minValue) / range) * 60;
                            return <circle key={i} cx={x} cy={y} r="3" fill={config.color} />;
                          })}
                          {tableData.map((row, i) => {
                            const x = tableData.length > 1 ? (i / (tableData.length - 1)) * 280 + 10 : 150;
                            return <text key={i} x={x} y="95" fill="#94a3b8" fontSize="8" textAnchor="middle">{row.month || row.period}</text>;
                          })}
                        </svg>
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                          <span>{minValue >= 1000 ? minValue.toLocaleString() : minValue.toFixed(2)}</span>
                          <span>{maxValue >= 1000 ? maxValue.toLocaleString() : maxValue.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}

            {/* SDK Version Table */}
            {data.sdkVersionTable && (
              <div className="mt-6 bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-orange-400">📦</span> Performance by SDK Version
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="text-left py-3 px-2 text-slate-400 font-medium">CAS SDK</th>
                        <th className="text-left py-3 px-2 text-slate-400 font-medium">App Version</th>
                        <th className="text-right py-3 px-2 text-slate-400 font-medium">DAU</th>
                        <th className="text-right py-3 px-2 text-slate-400 font-medium">Share</th>
                        <th className="text-right py-3 px-2 text-slate-400 font-medium">Sessions</th>
                        <th className="text-right py-3 px-2 text-slate-400 font-medium">Duration</th>
                        <th className="text-right py-3 px-2 text-slate-400 font-medium">Revenue</th>
                        <th className="text-right py-3 px-2 text-slate-400 font-medium">ARPDAU</th>
                        <th className="text-right py-3 px-2 text-slate-400 font-medium">Impr/DAU</th>
                        <th className="text-right py-3 px-2 text-slate-400 font-medium">eCPM</th>
                        <th className="text-right py-3 px-2 text-slate-400 font-medium">Fill Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.sdkVersionTable.map((row, i) => {
                        const isLatest = i === 0;
                        const isOld = i >= 2;
                        return (
                          <tr key={row.version} className={`border-b border-slate-700/50 ${i % 2 === 0 ? '' : 'bg-slate-900/30'}`}>
                            <td className={`py-3 px-2 font-medium ${isLatest ? 'text-emerald-400' : isOld ? 'text-amber-400' : 'text-white'}`}>
                              {row.version}
                              {isLatest && <span className="ml-2 text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">Latest</span>}
                              {isOld && <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">Update</span>}
                            </td>
                            <td className="py-3 px-2 text-slate-400">{row.appVersion}</td>
                            <td className="py-3 px-2 text-right text-slate-300">{row.dau.toLocaleString()}</td>
                            <td className="py-3 px-2 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${isLatest ? 'bg-emerald-500' : isOld ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${row.dauShare}%` }} />
                                </div>
                                <span className="text-slate-300 w-8">{row.dauShare}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-right text-slate-300">{row.sessions}</td>
                            <td className="py-3 px-2 text-right text-slate-300">{row.duration}m</td>
                            <td className="py-3 px-2 text-right text-emerald-400 font-medium">${row.revenue.toLocaleString()}</td>
                            <td className={`py-3 px-2 text-right font-medium ${isLatest ? 'text-emerald-400' : isOld ? 'text-amber-400' : 'text-slate-300'}`}>${row.arpdau.toFixed(4)}</td>
                            <td className="py-3 px-2 text-right text-slate-300">{row.imprPerDau}</td>
                            <td className={`py-3 px-2 text-right ${isLatest ? 'text-emerald-400' : isOld ? 'text-amber-400' : 'text-slate-300'}`}>${row.ecpm.toFixed(2)}</td>
                            <td className={`py-3 px-2 text-right ${row.fillRate >= 95 ? 'text-emerald-400' : row.fillRate >= 90 ? 'text-slate-300' : 'text-amber-400'}`}>{row.fillRate}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 flex gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Latest SDK — best performance</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-500 rounded-full"></span> Outdated — recommend update</span>
                </div>
              </div>
            )}

          </>
        )}

        {activeTab === 'glossary' && (
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
  );
}
