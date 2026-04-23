import React from "react";
import { useState, useEffect } from "react";
import { adminManagers, adminCustomersInitial, adminApps } from './adminData.js';
import { storeData } from './storeData.js';

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
  const [selectedMetrics, setSelectedMetrics] = useState(['dau', 'revenue', 'sessions', 'd1_retention', 'd7_retention', 'impr_per_dau']);
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
  const [qvPeriod, setQvPeriod] = useState('last7'); // today, last7, last30, thisMonth, custom
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

  // Superadmin filter states
  const [filterCustomer, setFilterCustomer] = useState('all');
  const [filterManager, setFilterManager] = useState('all');
  const [filterDateCreatedFrom, setFilterDateCreatedFrom] = useState('');
  const [filterDateCreatedTo, setFilterDateCreatedTo] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const [showDateCreatedDropdown, setShowDateCreatedDropdown] = useState(false);
  const [activeReportFilters, setActiveReportFilters] = useState([]); // which filter chips are visible: 'app', 'country', 'manager', 'customer', 'dateCreated'
  const [showFilterPickerDropdown, setShowFilterPickerDropdown] = useState(false);
  const [customerDropdownSearch, setCustomerDropdownSearch] = useState('');
  const [managerDropdownSearch, setManagerDropdownSearch] = useState('');

  // Profile states
  const [profileTab, setProfileTab] = useState('personal'); // personal, payment, security, apikeys
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileToast, setProfileToast] = useState(null);
  const [profileData, setProfileData] = useState({
    firstName: 'Oleg',
    lastName: 'Shlyamovych',
    email: 'oleg@psvgames.com',
    emailVerified: true,
    company: 'PSV Game Studio',
    phone: '+380999990010',
    country: 'Ukraine',
    messenger: 'Telegram',
    timezone: 'UTC+2 (Kyiv)',
    language: 'English',
    registered: 'Jun 12, 2024',
    accountId: 'PSV-00412',
  });
  const [profileDraft, setProfileDraft] = useState(null);

  const startProfileEdit = () => { setProfileDraft({ ...profileData }); setProfileEditing(true); };
  const cancelProfileEdit = () => { setProfileDraft(null); setProfileEditing(false); };
  const saveProfile = () => {
    setProfileSaving(true);
    setTimeout(() => {
      setProfileData({ ...profileDraft });
      setProfileEditing(false);
      setProfileDraft(null);
      setProfileSaving(false);
      setProfileToast('Changes saved');
      setTimeout(() => setProfileToast(null), 3000);
    }, 800);
  };

  // Payment Details states
  const [paymentEditing, setPaymentEditing] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentData, setPaymentData] = useState({
    method: 'bank', // bank, crypto
    beneficiary: 'PSV Game Studio LLC',
    iban: 'UA21 3223 1300 0002 6007 2335 6600 1',
    swift: 'UNJSUAUKXXX',
    bank: 'Monobank (Universal Bank)',
    bankAddress: 'Kyiv, Ukraine',
    cryptoWallet: '',
    cryptoNetwork: 'TRC-20',
    threshold: '$500',
    balance: '$12,450.20',
    nextPayout: '~Apr 27, 2026',
    taxId: 'UA123456789',
    w8ben: 'uploaded', // uploaded, expired, none
    w8benExpiry: 'Dec 2027',
  });
  const [paymentDraft, setPaymentDraft] = useState(null);

  const startPaymentEdit = () => { setPaymentDraft({ ...paymentData }); setPaymentEditing(true); };
  const cancelPaymentEdit = () => { setPaymentDraft(null); setPaymentEditing(false); };
  const savePayment = () => {
    setPaymentSaving(true);
    setTimeout(() => {
      setPaymentData({ ...paymentDraft });
      setPaymentEditing(false);
      setPaymentDraft(null);
      setPaymentSaving(false);
      setProfileToast('Payment details saved');
      setTimeout(() => setProfileToast(null), 3000);
    }, 800);
  };

  // API Keys states
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [sdkKeyVisible, setSdkKeyVisible] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [apiKey, setApiKey] = useState('c8f2a91d-4e6b-47f3-b12c-9a8d5e3f1b7c');
  const [sdkKey] = useState('cas_sdk_k7m2p9x4w1n6v3j8');
  const [apiKeyCreated, setApiKeyCreated] = useState('Jan 15, 2026');

  // Security states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPw: '', confirm: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [showTwoFaSetup, setShowTwoFaSetup] = useState(false);
  const [twoFaStep, setTwoFaStep] = useState(1); // 1=QR, 2=verify, 3=backup codes
  const [twoFaCode, setTwoFaCode] = useState('');
  const [sessions] = useState([
    { id: 1, browser: 'Chrome', os: 'macOS', location: 'Kyiv, UA', time: 'Current session', current: true },
    { id: 2, browser: 'Safari', os: 'iOS', location: 'Kyiv, UA', time: '2 days ago', current: false },
    { id: 3, browser: 'Firefox', os: 'Windows', location: 'Lviv, UA', time: '5 days ago', current: false },
  ]);
  const [revokedSessions, setRevokedSessions] = useState(new Set());

  const savePassword = () => {
    setPasswordSaving(true);
    setTimeout(() => {
      setPasswordSaving(false);
      setShowChangePassword(false);
      setPasswordForm({ current: '', newPw: '', confirm: '' });
      setProfileToast('Password changed');
      setTimeout(() => setProfileToast(null), 3000);
    }, 800);
  };

  const completeTwoFa = () => {
    setTwoFaEnabled(true);
    setShowTwoFaSetup(false);
    setTwoFaStep(1);
    setTwoFaCode('');
    setProfileToast('2FA enabled');
    setTimeout(() => setProfileToast(null), 3000);
  };

  // Header states
  const [showNotificationsDD, setShowNotificationsDD] = useState(false);
  const [showProfileDD, setShowProfileDD] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'critical', icon: '!', text: 'app-ads.txt not verified (2 apps)', time: '3 hours ago', read: false },
    { id: 2, type: 'info', icon: 'i', text: 'SDK 4.6.0 available', time: 'Yesterday', read: false },
    { id: 3, type: 'finance', icon: '$', text: 'Payment $5,200 processed', time: 'Mar 27', read: false },
  ]);

  // Admin panel states
  const [adminSelectedManager, setAdminSelectedManager] = useState(null);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminSortBy, setAdminSortBy] = useState('name');
  const [adminSortDir, setAdminSortDir] = useState('asc');
  const [adminExpandedCustomer, setAdminExpandedCustomer] = useState(null);
  const [adminManagerDropdown, setAdminManagerDropdown] = useState(null);
  const [adminFilterPlatform, setAdminFilterPlatform] = useState('all');
  const [adminFilterStatus, setAdminFilterStatus] = useState('all');
  const [adminPage, setAdminPage] = useState(1);
  const [adminSelectedApp, setAdminSelectedApp] = useState(null);
  const [adminSelectedCustomerId, setAdminSelectedCustomerId] = useState(null);
  const [adminAppTab, setAdminAppTab] = useState('main');
  const [historyEventFilter, setHistoryEventFilter] = useState('all');
  const [historyAuthorFilter, setHistoryAuthorFilter] = useState('all');
  const [historyPeriodFilter, setHistoryPeriodFilter] = useState('all');
  const [adminAppOverrides, setAdminAppOverrides] = useState({});
  const [adminSection, setAdminSection] = useState(null); // null = hub, 'apps' | 'mediation' | 'aso' | 'creatives' | 'networks' | 'users' | 'organizations' | ...
  // Users & Roles filters
  const [usersSearch, setUsersSearch] = useState('');
  const [usersFilterGroup, setUsersFilterGroup] = useState('all');
  const [usersFilterStatus, setUsersFilterStatus] = useState('all');
  const [usersShowPermissions, setUsersShowPermissions] = useState(null); // userId — open permissions modal
  // Organizations filters
  const [orgsSearch, setOrgsSearch] = useState('');
  const [orgsFilterType, setOrgsFilterType] = useState('all');
  const [orgsFilterTier, setOrgsFilterTier] = useState('all');
  const [orgsFilterMgr, setOrgsFilterMgr] = useState('all');
  const [orgsPage, setOrgsPage] = useState(1);
  // Impersonation
  const [impSearch, setImpSearch] = useState('');
  // Audit log
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilterType, setAuditFilterType] = useState('all');
  const [auditFilterActor, setAuditFilterActor] = useState('all');
  // Role templates
  const [selectedTemplate, setSelectedTemplate] = useState('pub_standard');

  // Admin data from adminData.js (adminManagers, adminApps imported at top)
  const [adminCustomers, setAdminCustomers] = useState(adminCustomersInitial);

  const reassignManager = (customerId, newManagerId) => {
    setAdminCustomers(prev => prev.map(c => c.id === customerId ? { ...c, managerId: newManagerId } : c));
    setAdminManagerDropdown(null);
  };

  const updateAppOverride = (bundleId, updates) => {
    setAdminAppOverrides(prev => ({ ...prev, [bundleId]: { ...(prev[bundleId] || {}), ...updates } }));
  };

  const reassignCustomerManager = (customerId, newManagerId) => {
    // Update customer-level manager
    setAdminCustomers(prev => prev.map(c => c.id === customerId ? { ...c, managerId: newManagerId } : c));
    // Update all apps of this customer via overrides
    const customerApps = adminApps.filter(a => a.userId === customerId);
    setAdminAppOverrides(prev => {
      const next = { ...prev };
      customerApps.forEach(a => { next[a.bundleId] = { ...(next[a.bundleId] || {}), managerId: newManagerId }; });
      return next;
    });
  };

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
        setAdminManagerDropdown(null);
        setShowCustomerDropdown(false);
        setShowManagerDropdown(false);
        setShowDateCreatedDropdown(false);
        setShowFilterPickerDropdown(false);
        setShowNotificationsDD(false);
        setShowProfileDD(false);
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
      { id: 'impressions', label: 'Impressions', key: 'impressions', format: v => formatNum(v) },
      { id: 'revenue', label: 'Revenue', key: 'revenue', format: v => '$' + formatNum(v) },
      { id: 'arpdau', label: 'ARPDAU', key: 'arpdau', format: v => '$' + v.toFixed(4) },
      { id: 'ecpm', label: 'eCPM', key: 'ecpm', format: v => '$' + v.toFixed(2) },
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
    { id: 'today', label: 'Last actual day' },
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
      current: { dau: cur.dau, impressions: cur.impressions, revenue: cur.adRevenue || cur.revenue, arpdau: cur.arpdau, ecpm: cur.ecpm, fillRate: cur.fillRate, d1Retention: cur.d1Retention, ltv: cur.ltv, roas: cur.roas || cur.roasD30, iapRevenue: (cur.adRevenue || cur.revenue || 0) * 0.12 },
      previous: { dau: prev.dau, impressions: prev.impressions, revenue: prev.adRevenue || prev.revenue, arpdau: prev.arpdau, ecpm: prev.ecpm, fillRate: prev.fillRate, d1Retention: prev.d1Retention, ltv: prev.ltv, roas: prev.roas || prev.roasD30, iapRevenue: (prev.adRevenue || prev.revenue || 0) * 0.12 },
    };
  };

  const getQvCardValues = (appId) => {
    if (appId !== 'all') return getQvCardValuesSingle(appId);
    // Sum across all real apps
    const allVals = realAppIds.map(id => getQvCardValuesSingle(id));
    const sumKeys = ['dau', 'impressions', 'revenue', 'iapRevenue'];
    const avgKeys = ['arpdau', 'ecpm', 'fillRate', 'd1Retention', 'ltv', 'roas'];
    const merge = (period) => {
      const result = {};
      sumKeys.forEach(k => { result[k] = allVals.reduce((s, v) => s + (v[period][k] || 0), 0); });
      avgKeys.forEach(k => { const vals = allVals.map(v => v[period][k]).filter(v => v != null); result[k] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null; });
      return result;
    };
    return { current: merge('current'), previous: merge('previous') };
  };

  // Quick View — trend data: daily revenue line
  const qvTrendDays = { today: 1, last7: 7, last30: 30, thisMonth: 30, custom: 14 };
  const getQvTrendDataSingle = (appId) => {
    const d = dashboardData[appId];
    if (!d) return [];
    const mon = d.monetisationTable || [];
    const latestRev = (mon[0]?.adRevenue || 1000);
    const dailyBase = latestRev / 30;
    const numDays = qvTrendDays[qvPeriod] || 7;
    const days = [];
    for (let i = numDays - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayLabel = `${date.getMonth() + 1}/${date.getDate()}`;
      const seed = (date.getDate() * 7 + appId.charCodeAt(0) * 13 + i * 3) % 100;
      const variance = 0.85 + (seed / 100) * 0.3;
      const weekendDip = (date.getDay() === 0 || date.getDay() === 6) ? 0.88 : 1.0;
      const dropFactor = i === 2 ? 0.82 : i === 1 ? 0.62 : i === 0 ? 0.72 : 1.0;
      const baseVal = i <= 2 ? dailyBase * weekendDip * dropFactor : dailyBase * variance * weekendDip;
      days.push({ label: dayLabel, value: Math.round(baseVal) });
    }
    return days;
  };

  // Market benchmark: genre-average revenue line for comparison
  const genreBenchmarks = {
    puzzle: { label: 'Puzzle Avg (Market)', dailyRev: 410 },
    idle:   { label: 'Idle Avg (Market)',   dailyRev: 480 },
    stack:  { label: 'Hyper-casual Avg (Market)', dailyRev: 1050 },
  };
  const getMarketBenchmark = (appId) => {
    const bench = genreBenchmarks[appId];
    if (!bench) return null;
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayLabel = `${date.getMonth() + 1}/${date.getDate()}`;
      // Small stable variance ±5% around market average
      const seed = (date.getDate() * 11 + i * 7) % 100;
      const variance = 0.95 + (seed / 100) * 0.10;
      const weekendDip = (date.getDay() === 0 || date.getDay() === 6) ? 0.93 : 1.0;
      days.push({ label: dayLabel, value: Math.round(bench.dailyRev * variance * weekendDip) });
    }
    return { label: bench.label, data: days };
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

    // Filter-based multipliers for fake data variation
    const managerMultipliers = { m1: 1.0, m2: 0.78, m3: 1.22, m4: 0.65, m5: 0.91 };
    const customerSeeds = { 1554: 1.15, 7561: 0.82, 208: 0.95, 2850: 0.70, 12: 1.35, 6226: 0.58, 1084: 0.73, 492: 0.44, 841: 0.88, 2: 1.48, 875: 0.62, 2316: 0.38, 166: 0.52, 142: 0.47 };

    let dauScale = 1.0;
    let revScale = 1.0;
    if (filterManager !== 'all') {
      const mm = managerMultipliers[filterManager] || 1.0;
      dauScale *= mm;
      revScale *= mm * 1.08;
    }
    if (filterCustomer !== 'all') {
      const cm = customerSeeds[Number(filterCustomer)] || 0.5;
      dauScale *= cm;
      revScale *= cm * 0.95;
    }
    if (filterDateCreatedFrom || filterDateCreatedTo) {
      const matched = adminCustomers.filter(c => {
        if (filterManager !== 'all' && c.managerId !== filterManager) return false;
        if (filterCustomer !== 'all' && c.id !== Number(filterCustomer)) return false;
        if (filterDateCreatedFrom && c.onboardingDate < filterDateCreatedFrom) return false;
        if (filterDateCreatedTo && c.onboardingDate > filterDateCreatedTo) return false;
        return true;
      });
      const ratio = matched.length / Math.max(adminCustomers.length, 1);
      dauScale *= Math.max(ratio, 0.1);
      revScale *= Math.max(ratio * 0.9, 0.08);
    }

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
      // Apply filter-based scaling to DAU and revenue fields
      if (dauScale !== 1.0 || revScale !== 1.0) {
        if (base.dau) base.dau = Math.round(base.dau * dauScale);
        if (base.wau) base.wau = Math.round(base.wau * dauScale);
        if (base.mau) base.mau = Math.round(base.mau * dauScale);
        if (base.installs) base.installs = Math.round(base.installs * dauScale);
        if (base.sessions) base.sessions = Math.round(base.sessions * dauScale);
        if (base.impressions) base.impressions = Math.round(base.impressions * dauScale);
        if (base.clicks) base.clicks = Math.round(base.clicks * dauScale);
        if (base.revenue) base.revenue = +(base.revenue * revScale).toFixed(2);
        if (base.adRevenue) base.adRevenue = +(base.adRevenue * revScale).toFixed(2);
        if (base.ecpm) base.ecpm = +(base.ecpm * (revScale / dauScale || 1)).toFixed(2);
        if (base.arpdau) base.arpdau = base.dau ? +(base.revenue || base.adRevenue || 0) / base.dau : base.arpdau;
      }
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

        {/* Nav Items — main */}
        <nav className="py-3 flex flex-col gap-0.5 px-2">
          {[
            { id: 'analytics', label: 'Analytics', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 5-9"/></svg>,
              sub: [{ id: 'quickview', label: 'Quick View' }, { id: 'reports', label: 'Reports' }] },
            { id: 'apps', label: 'Applications', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg> },
            { id: 'payments', label: 'Payments', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg> },
            { id: 'profile', label: 'Profile', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
          ].map(item => (
            <div key={item.id}>
              <button
                onClick={() => { setActiveNavItem(item.id); if (item.id === 'analytics') setActiveScreen('quickview'); }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap overflow-hidden ${
                  activeNavItem === item.id
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
                title={!navExpanded ? item.label : undefined}
              >
                <span className="shrink-0 w-5 h-5 flex items-center justify-center">{item.icon}</span>
                {navExpanded && <span>{item.label}</span>}
              </button>
              {/* Sub-navigation */}
              {item.sub && activeNavItem === item.id && navExpanded && (
                <div className="ml-7 mt-0.5 flex flex-col gap-0.5">
                  {item.sub.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setActiveScreen(s.id)}
                      className={`text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors ${
                        activeScreen === s.id ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >{s.label}</button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Separator + Admin (superadmin only) */}
          <div className="border-t border-slate-800 my-2"></div>
          <button
            onClick={() => { setActiveNavItem('admin'); setAdminSection(null); }}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap overflow-hidden ${
              activeNavItem === 'admin'
                ? 'bg-blue-600/20 text-blue-400'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
            title={!navExpanded ? 'Admin' : undefined}
          >
            <span className="shrink-0 w-5 h-5 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/><path d="M9 12l2 2 4-4"/></svg>
            </span>
            {navExpanded && <span>Admin</span>}
          </button>
          {/* Admin sub-navigation */}
          {activeNavItem === 'admin' && navExpanded && (
            <div className="ml-7 mt-0.5 flex flex-col gap-0.5">
              {[
                { id: 'apps', label: 'Apps Management' },
                { id: 'mediation', label: 'Default Mediation' },
                { id: 'aso', label: 'ASO' },
                { id: 'creatives', label: 'Creatives' },
                { id: 'networks', label: 'Networks' },
                { id: 'users', label: 'Users & Roles' },
                { id: 'organizations', label: 'Organizations' },
                { id: 'impersonation', label: 'Impersonation' },
                { id: 'audit', label: 'Audit Log' },
                { id: 'templates', label: 'Role Templates' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setAdminSection(s.id)}
                  className={`text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors ${
                    adminSection === s.id ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >{s.label}</button>
              ))}
            </div>
          )}
        </nav>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Human Touch — Your CAS Team */}
        <div className="px-2 py-2 border-t border-slate-800">
          <div className={`px-2.5 py-2 ${navExpanded ? '' : 'flex justify-center'}`}>
            {navExpanded ? (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold mb-2">Your CAS Team</div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white shrink-0">SS</div>
                  <div>
                    <div className="text-xs text-slate-200 font-medium">Serhii</div>
                    <div className="text-[10px] text-slate-500">Personal Manager</div>
                  </div>
                </div>
                <div className="flex gap-1.5 mb-1.5">
                  <a href="#" className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors" title="Telegram">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224l-1.84 8.684c-.127.6-.48.746-.972.464l-2.688-1.98-1.296 1.248c-.144.144-.264.264-.54.264l.192-2.724 4.968-4.488c.216-.192-.048-.3-.336-.108L8.632 13.308l-2.616-.816c-.564-.18-.576-.564.12-.84l10.236-3.948c.468-.168.876.108.72.84l.024-.32z"/></svg>
                    <span className="text-[10px] text-slate-400">Chat</span>
                  </a>
                  <a href="#" className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors" title="WhatsApp">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-green-400"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.558 4.143 1.534 5.886L0 24l6.305-1.654A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-1.98 0-3.82-.562-5.39-1.527l-.386-.23-4.006 1.05 1.07-3.91-.252-.4A9.716 9.716 0 012.25 12c0-5.385 4.365-9.75 9.75-9.75S21.75 6.615 21.75 12s-4.365 9.75-9.75 9.75z"/></svg>
                    <span className="text-[10px] text-slate-400">Chat</span>
                  </a>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-[10px] text-slate-500">Need help?</span>
                </div>
              </div>
            ) : (
              <a href="#" className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white" title="Your manager: Serhii">SS</a>
            )}
          </div>
        </div>

        {/* Resources */}
        <div className="px-2 py-2 border-t border-slate-800">
          {[
            { label: 'API Docs', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg> },
            { label: 'Resources', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0022 16z"/></svg> },
          ].map(r => (
            <a key={r.label} href="#" className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors text-xs whitespace-nowrap overflow-hidden ${navExpanded ? '' : 'justify-center'}`} title={!navExpanded ? r.label : undefined}>
              <span className="shrink-0 w-4 h-4 flex items-center justify-center">{r.icon}</span>
              {navExpanded && <span>{r.label}</span>}
            </a>
          ))}
        </div>
      </div>

      {/* ===== Main Area (Header + Content) ===== */}
      <div className="flex-1 min-w-0 flex flex-col">

      {/* ===== Header ===== */}
      <div className="h-12 shrink-0 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm flex items-center justify-between px-5">
        {/* Left: breadcrumb / page title */}
        <div className="text-sm text-slate-400">
          {activeNavItem === 'analytics' && <span className="text-slate-200 font-medium">Analytics</span>}
          {activeNavItem === 'admin' && (
            adminSection ? (
              <span className="flex items-center gap-2">
                <button onClick={() => setAdminSection(null)} className="text-slate-400 hover:text-slate-200 transition-colors">Admin</button>
                <span className="text-slate-600">/</span>
                <span className="text-slate-200 font-medium">{
                  { apps: 'Apps Management', mediation: 'Default Mediation Setup', aso: 'ASO', creatives: 'Creatives', networks: 'Networks Management', users: 'Users & Roles', organizations: 'Organizations & Assignments', impersonation: 'Impersonation', audit: 'Audit Log', templates: 'Role Templates' }[adminSection]
                }</span>
              </span>
            ) : (
              <span className="text-slate-200 font-medium">Admin</span>
            )
          )}
          {activeNavItem === 'apps' && <span className="text-slate-200 font-medium">Applications</span>}
          {activeNavItem === 'payments' && <span className="text-slate-200 font-medium">Payments</span>}
          {activeNavItem === 'profile' && <span className="text-slate-200 font-medium">Profile</span>}
        </div>

        {/* Right: Balance + Notifications + Profile */}
        <div className="flex items-center gap-3">
          {/* Balance */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors" title="Current balance — click to view Payments">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            <span className="text-sm font-semibold text-emerald-400">$12,450</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setShowNotificationsDD(!showNotificationsDD); setShowProfileDD(false); }}
              className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors"
              title="Notifications"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white">{notifications.filter(n => !n.read).length}</span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotificationsDD && (
              <div className="absolute right-0 top-10 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                  <span className="text-sm font-semibold text-slate-100">Notifications</span>
                  <button
                    onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                    className="text-[11px] text-blue-400 hover:text-blue-300"
                  >Dismiss All</button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-slate-700/50 hover:bg-slate-750 cursor-pointer ${n.read ? 'opacity-50' : ''}`}>
                      <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${
                        n.type === 'critical' ? 'bg-red-500/20 text-red-400' :
                        n.type === 'info' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-200">{n.text}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{n.time}</div>
                      </div>
                      {!n.read && (
                        <button onClick={(e) => { e.stopPropagation(); setNotifications(notifications.map(x => x.id === n.id ? { ...x, read: true } : x)); }} className="text-slate-500 hover:text-slate-300 text-xs shrink-0 mt-0.5">&times;</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => { setShowProfileDD(!showProfileDD); setShowNotificationsDD(false); }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-[10px] font-bold text-white">O</div>
              <span className="text-xs text-slate-300 font-medium">Oleg</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500"><path d="M6 9l6 6 6-6"/></svg>
            </button>

            {/* Profile Dropdown */}
            {showProfileDD && (
              <div className="absolute right-0 top-10 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-700">
                  <div className="text-sm font-medium text-slate-100">Oleg Shlyamovych</div>
                  <div className="text-[11px] text-slate-500">oleg@psvgames.com</div>
                </div>
                <div className="py-1">
                  <div className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-750 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/></svg>
                      <span className="text-xs text-slate-300">Dark Mode</span>
                    </div>
                    <div className="w-8 h-4.5 bg-blue-600 rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-3.5 h-3.5 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <button className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-750 text-left">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    <span className="text-xs text-slate-300">Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== Content Area ===== */}
      <div className="flex-1 min-w-0 p-6 overflow-y-auto">
      <div className="mx-auto max-w-screen-lg">

        {/* ===== Admin Hub (tile grid) ===== */}
        {activeNavItem === 'admin' && adminSection === null && (() => {
          const uniqueCustomers = new Set(adminApps.map(a => a.userId)).size;
          const operational = [
            {
              id: 'apps',
              title: 'Apps Management',
              desc: 'Manage apps, customers, managers',
              stat: `${adminApps.length.toLocaleString()} apps · ${uniqueCustomers} customers`,
              ready: true,
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
            },
            {
              id: 'mediation',
              title: 'Default Mediation Setup',
              desc: 'Default waterfalls & bidding configs',
              stat: 'In development',
              ready: false,
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>,
            },
            {
              id: 'aso',
              title: 'ASO',
              desc: 'Keywords, rankings, store assets',
              stat: 'In development',
              ready: false,
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>,
            },
            {
              id: 'creatives',
              title: 'Creatives',
              desc: 'Banners, videos, playables library',
              stat: 'In development',
              ready: false,
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>,
            },
            {
              id: 'networks',
              title: 'Networks Management',
              desc: 'Ad networks, keys, integration status',
              stat: 'In development',
              ready: false,
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="M9.5 9.5L6.5 6.5M14.5 9.5l3-3M9.5 14.5l-3 3M14.5 14.5l3 3"/></svg>,
            },
          ];
          const governance = [
            {
              id: 'users',
              title: 'Users & Roles',
              desc: 'Internal staff, invites, role assignment, deactivation',
              stat: 'In development',
              ready: false,
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
            },
            {
              id: 'organizations',
              title: 'Organizations & Assignments',
              desc: 'All tenants (studios + publishers) with managers and assignment history',
              stat: 'In development',
              ready: false,
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9h0M9 12h0M9 15h0M9 18h0"/></svg>,
            },
            {
              id: 'impersonation',
              title: 'Impersonation',
              desc: 'Sign in as a client, active and past sessions',
              stat: 'In development',
              ready: false,
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>,
            },
            {
              id: 'audit',
              title: 'Audit Log',
              desc: 'Chronological feed of critical events with filters',
              stat: 'In development',
              ready: false,
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><line x1="8" y1="9" x2="10" y2="9"/></svg>,
            },
            {
              id: 'templates',
              title: 'Role Templates',
              desc: 'Tier templates (standard / analytics / full) layered on top of base roles',
              stat: 'In development',
              ready: false,
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
            },
          ];
          const renderTile = (t) => (
            <button
              key={t.id}
              onClick={() => setAdminSection(t.id)}
              className={`text-left p-4 rounded-xl border transition-colors flex flex-col gap-3 min-h-[150px] ${
                t.ready
                  ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-blue-500/40 cursor-pointer'
                  : 'bg-slate-800/30 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700 cursor-pointer'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${t.ready ? 'bg-blue-500/15 text-blue-400' : 'bg-slate-700/30 text-slate-500'}`}>
                {t.icon}
              </div>
              <div className="flex-1">
                <div className={`text-sm font-medium mb-1 ${t.ready ? 'text-slate-100' : 'text-slate-300'}`}>{t.title}</div>
                <div className="text-[11px] text-slate-500 leading-snug">{t.desc}</div>
              </div>
              <div className={`text-[10px] pt-2 border-t ${t.ready ? 'text-slate-400 border-slate-700/60' : 'text-slate-600 border-slate-800 italic'}`}>
                {t.ready ? t.stat : `— ${t.stat}`}
              </div>
            </button>
          );
          return (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm font-semibold text-slate-100 leading-tight tracking-tight">Internal Services и Configuration</span>
                </div>
              </div>

              {/* Group: Operational */}
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Operational</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {operational.map(renderTile)}
              </div>

              {/* Group: Access & Governance */}
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Access & Governance</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {governance.map(renderTile)}
              </div>
            </>
          );
        })()}

        {/* ===== Users & Roles (PSVPortal-style) ===== */}
        {activeNavItem === 'admin' && adminSection === 'users' && (() => {
          // Real users from PSVPortal
          const ALL_GROUPS = ['Super User', 'User', 'Admin CAS', 'ASO User', 'Translates Users', 'Sound Manager Users', 'Report Users', 'Admob Users', 'Shops', 'Conversion Group', 'CAS Users', 'Downloader Users', 'BigQuery', 'SuperSet Group'];
          const SUPER_GROUPS = ['Super User', 'User', 'ASO User', 'Translates Users', 'Sound Manager Users', 'Report Users', 'Admob Users', 'Shops', 'Conversion Group', 'CAS Users', 'Admin CAS', 'Downloader Users', 'BigQuery', 'SuperSet Group'];
          const internalUsers = [
            { id: 'u01', name: 'Alexei Shevnin', email: 'alexei.shevnin@cas.ai', groups: SUPER_GROUPS, lastLogin: '', active: true },
            { id: 'u02', name: 'Valeriia', email: 'Valeriia.Zhuk@cas.ai', groups: ['Shops'], lastLogin: '2026-02-18 15:34:15', active: true },
            { id: 'u03', name: 'Ruslan Novikov', email: 'ruslan.novikov@cas.ai', groups: ['Super User', 'User', 'ASO User', 'Translates Users', 'Sound Manager Users', 'Report Users', 'Admob Users', 'Shops', 'Conversion Group', 'CAS Users', 'Admin CAS', 'Downloader Users', 'BigQuery'], lastLogin: '2026-04-23 08:52:26', active: true },
            { id: 'u04', name: 'Aleksandr Osyka', email: 'aleksandr.osyka@cas.ai', groups: ['User', 'CAS Users'], lastLogin: '2026-01-21 09:02:31', active: true },
            { id: 'u05', name: 'Evgeniy Chuyko', email: 'evgeniy.chuyko@cas.ai', groups: ['Shops', 'Super User', 'User', 'ASO User', 'Translates Users', 'Sound Manager Users', 'Report Users', 'Admob Users', 'Conversion Group', 'CAS Users', 'Admin CAS', 'Downloader Users', 'BigQuery', 'SuperSet Group'], lastLogin: '2026-01-23 13:03:00', active: true },
            { id: 'u06', name: 'Denys Drahanov', email: 'denys.drahanov@cas.ai', groups: ['Shops'], lastLogin: '2026-01-21 15:05:24', active: true },
            { id: 'u07', name: 'V_Kapatsyn', email: 'vladimir.kapatsyn@cas.ai', groups: ['Shops'], lastLogin: '2026-04-14 12:52:21', active: true },
            { id: 'u08', name: 'Андрей ГД', email: 'andrew.sokolov@cas.ai', groups: ['Shops'], lastLogin: '2026-01-21 11:42:08', active: true },
            { id: 'u09', name: 'Dmytro Vielikanov', email: 'dmytro.vielikanov@cas.ai', groups: ['Shops'], lastLogin: '2026-01-22 13:14:22', active: true },
            { id: 'u10', name: 'Anastasiia Moroz', email: 'anastasiia.moroz@cas.ai', groups: ['Admob Users', 'CAS Users'], lastLogin: '2025-10-29 07:46:50', active: true },
            { id: 'u11', name: 'Anton Smirnov', email: 'anton.smirnov@cas.ai', groups: ['User', 'Admob Users', 'Report Users', 'CAS Users'], lastLogin: '2026-04-22 17:21:55', active: true },
            { id: 'u12', name: 'Serhii Shcherbyna', email: 'serhii.shcherbyna@cas.ai', groups: ['User', 'Admob Users', 'CAS Users', 'BigQuery'], lastLogin: '2026-04-23 09:11:08', active: true },
            { id: 'u13', name: 'Igor Belov', email: 'igor.belov@cas.ai', groups: ['User', 'Conversion Group', 'CAS Users'], lastLogin: '2026-04-22 16:08:42', active: true },
            { id: 'u14', name: 'Mikhail Orlov', email: 'mikhail.orlov@cas.ai', groups: ['User'], lastLogin: '2025-12-15 10:18:00', active: false },
          ];
          // Group color palette — pastel/distinct
          const groupColor = (g) => {
            const map = {
              'Super User': 'bg-purple-900/40 border-purple-700/50 text-purple-200',
              'Admin CAS': 'bg-rose-900/40 border-rose-700/50 text-rose-200',
              'User': 'bg-slate-700/50 border-slate-600 text-slate-200',
              'ASO User': 'bg-cyan-900/40 border-cyan-700/50 text-cyan-200',
              'Translates Users': 'bg-blue-900/40 border-blue-700/50 text-blue-200',
              'Sound Manager Users': 'bg-indigo-900/40 border-indigo-700/50 text-indigo-200',
              'Report Users': 'bg-emerald-900/40 border-emerald-700/50 text-emerald-200',
              'Admob Users': 'bg-amber-900/40 border-amber-700/50 text-amber-200',
              'Shops': 'bg-pink-900/40 border-pink-700/50 text-pink-200',
              'Conversion Group': 'bg-teal-900/40 border-teal-700/50 text-teal-200',
              'CAS Users': 'bg-sky-900/40 border-sky-700/50 text-sky-200',
              'Downloader Users': 'bg-orange-900/40 border-orange-700/50 text-orange-200',
              'BigQuery': 'bg-violet-900/40 border-violet-700/50 text-violet-200',
              'SuperSet Group': 'bg-fuchsia-900/40 border-fuchsia-700/50 text-fuchsia-200',
            };
            return map[g] || 'bg-slate-700/50 border-slate-600 text-slate-200';
          };
          const filtered = internalUsers
            .filter(u => usersFilterGroup === 'all' || u.groups.includes(usersFilterGroup))
            .filter(u => usersFilterStatus === 'all' || (usersFilterStatus === 'active' ? u.active : !u.active))
            .filter(u => !usersSearch || u.name.toLowerCase().includes(usersSearch.toLowerCase()) || u.email.toLowerCase().includes(usersSearch.toLowerCase()));
          const groupCounts = ALL_GROUPS.map(g => ({ g, count: internalUsers.filter(u => u.groups.includes(g)).length })).sort((a, b) => b.count - a.count).slice(0, 7);
          const selectedUserPerms = usersShowPermissions ? internalUsers.find(u => u.id === usersShowPermissions) : null;
          return (
            <>
              {/* Header — title + Manage buttons */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm font-semibold text-slate-100 leading-tight tracking-tight">Users</span>
                  <span className="text-[10px] text-slate-500 ml-2">{internalUsers.length} users · {ALL_GROUPS.length} groups</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-medium text-white transition-colors uppercase tracking-wide">
                    Manage Permissions
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-medium text-white transition-colors uppercase tracking-wide">
                    Manage Groups
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                  </button>
                </div>
              </div>

              {/* Stat strip — top groups by membership */}
              <div className="grid grid-cols-7 gap-2 mb-3">
                {groupCounts.map(({ g, count }) => (
                  <button key={g} onClick={() => setUsersFilterGroup(g === usersFilterGroup ? 'all' : g)} className={`text-left p-2 border rounded-lg transition-colors ${usersFilterGroup === g ? groupColor(g) : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800'}`}>
                    <div className="text-base font-semibold text-slate-100">{count}</div>
                    <div className="text-[9px] uppercase tracking-wide truncate">{g}</div>
                  </button>
                ))}
              </div>

              {/* Filters */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                    <input type="text" placeholder="Search by name or email..." value={usersSearch} onChange={(e) => setUsersSearch(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"/>
                  </div>
                  <select value={usersFilterGroup} onChange={(e) => setUsersFilterGroup(e.target.value)}
                    className="bg-slate-900/50 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer">
                    <option value="all">All groups</option>
                    {ALL_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <select value={usersFilterStatus} onChange={(e) => setUsersFilterStatus(e.target.value)}
                    className="bg-slate-900/50 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer">
                    <option value="all">All status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-medium text-white transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                    Add user
                  </button>
                </div>
              </div>

              {/* Table — PSVPortal layout */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-800/80">
                      <th className="text-left py-2.5 px-3 text-slate-400 font-medium w-20 uppercase tracking-wide text-[10px]">Action</th>
                      <th className="text-left py-2.5 px-3 text-slate-400 font-medium w-44 uppercase tracking-wide text-[10px]">Name</th>
                      <th className="text-left py-2.5 px-3 text-slate-400 font-medium w-56 uppercase tracking-wide text-[10px]">Email</th>
                      <th className="text-left py-2.5 px-3 text-slate-400 font-medium w-24 uppercase tracking-wide text-[10px]">Permissions</th>
                      <th className="text-left py-2.5 px-3 text-slate-400 font-medium uppercase tracking-wide text-[10px]">Groups</th>
                      <th className="text-left py-2.5 px-3 text-slate-400 font-medium w-40 uppercase tracking-wide text-[10px]">Last Login</th>
                      <th className="text-center py-2.5 px-3 text-slate-400 font-medium w-16 uppercase tracking-wide text-[10px]">Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => (
                      <tr key={u.id} className="border-b border-slate-700/30 hover:bg-slate-700/15 transition-colors">
                        {/* Action */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <button className="w-7 h-7 rounded-full bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-400 flex items-center justify-center transition-colors" title="Edit">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button className="w-7 h-7 rounded-full bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 flex items-center justify-center transition-colors" title="Delete">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                            </button>
                          </div>
                        </td>
                        {/* Name */}
                        <td className="py-2.5 px-3 text-slate-200">{u.name}</td>
                        {/* Email */}
                        <td className="py-2.5 px-3 text-slate-400">{u.email}</td>
                        {/* Permissions — SHOW button */}
                        <td className="py-2.5 px-3">
                          <button onClick={() => setUsersShowPermissions(u.id)} className="px-3 py-1 bg-slate-800 border border-slate-600 hover:bg-slate-700 rounded text-[10px] font-medium text-slate-300 uppercase tracking-wide transition-colors">
                            Show
                          </button>
                        </td>
                        {/* Groups — multi-badge */}
                        <td className="py-2.5 px-3">
                          <div className="flex flex-wrap gap-1">
                            {u.groups.map(g => (
                              <span key={g} className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${groupColor(g)}`}>{g}</span>
                            ))}
                          </div>
                        </td>
                        {/* Last Login */}
                        <td className="py-2.5 px-3 text-slate-500 text-[11px] font-mono">{u.lastLogin}</td>
                        {/* Active — green check */}
                        <td className="py-2.5 px-3 text-center">
                          {u.active ? (
                            <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-700">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={7} className="py-12 text-center text-slate-500 text-xs">No users matching filters</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Permissions modal */}
              {selectedUserPerms && (
                <>
                  <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setUsersShowPermissions(null)} />
                  <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] max-h-[80vh] bg-slate-900 border border-slate-600 rounded-2xl shadow-2xl z-50 flex flex-col">
                    <div className="shrink-0 px-5 py-3 border-b border-slate-700 flex items-center justify-between rounded-t-2xl">
                      <div>
                        <div className="text-sm text-slate-100 font-semibold">{selectedUserPerms.name}</div>
                        <div className="text-[10px] text-slate-500">{selectedUserPerms.email} · permissions</div>
                      </div>
                      <button onClick={() => setUsersShowPermissions(null)} className="text-slate-500 hover:text-slate-200 p-1">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                    <div className="overflow-y-auto p-5">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Effective permissions (from groups)</div>
                      <div className="space-y-1">
                        {(() => {
                          const allPerms = {
                            'Super User': ['*.read', '*.write', '*.delete', 'system.*'],
                            'Admin CAS': ['users.manage', 'roles.manage', 'orgs.manage', 'audit.view'],
                            'User': ['profile.read', 'profile.write'],
                            'ASO User': ['aso.read', 'aso.write', 'keywords.manage'],
                            'Translates Users': ['translates.read', 'translates.write'],
                            'Sound Manager Users': ['sounds.read', 'sounds.write'],
                            'Report Users': ['reports.read', 'reports.export'],
                            'Admob Users': ['admob.read', 'admob.write', 'admob.accounts'],
                            'Shops': ['shops.read', 'shops.write', 'shops.publish'],
                            'Conversion Group': ['conversion.read', 'conversion.write'],
                            'CAS Users': ['apps.read', 'mediation.read'],
                            'Downloader Users': ['downloader.read', 'downloader.execute'],
                            'BigQuery': ['bigquery.read', 'bigquery.query'],
                            'SuperSet Group': ['superset.read', 'superset.dashboards'],
                          };
                          const perms = new Set();
                          selectedUserPerms.groups.forEach(g => (allPerms[g] || []).forEach(p => perms.add(p)));
                          return Array.from(perms).sort().map(p => (
                            <div key={p} className="flex items-center justify-between px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded">
                              <span className="text-[11px] font-mono text-slate-300">{p}</span>
                              <span className="text-emerald-400 text-[10px]">✓</span>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                    <div className="shrink-0 px-5 py-3 border-t border-slate-700 flex justify-end">
                      <button onClick={() => setUsersShowPermissions(null)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200">Close</button>
                    </div>
                  </div>
                </>
              )}
            </>
          );
        })()}

        {/* ===== Organizations & Assignments ===== */}
        {activeNavItem === 'admin' && adminSection === 'organizations' && (() => {
          // Studios — fake additions on top of publishers
          const fakeStudios = [
            { id: 's1', name: 'Voodoo Lite', managerId: 'm1', onboardingDate: '2025-08-12', isStudio: true },
            { id: 's2', name: 'Plarium Indie', managerId: 'm2', onboardingDate: '2025-11-03', isStudio: true },
            { id: 's3', name: 'Habby Garage', managerId: 'm3', onboardingDate: '2026-01-22', isStudio: true },
            { id: 's4', name: 'Lion Studios EU', managerId: 'm1', onboardingDate: '2025-05-18', isStudio: true },
            { id: 's5', name: 'AppQuantum Labs', managerId: 'm4', onboardingDate: '2025-10-09', isStudio: true },
            { id: 's6', name: 'Belka Games', managerId: 'm2', onboardingDate: '2026-02-14', isStudio: true },
            { id: 's7', name: 'Azur Interactive', managerId: 'm5', onboardingDate: '2025-06-30', isStudio: true },
            { id: 's8', name: 'Boombit Mini', managerId: 'm3', onboardingDate: '2026-03-01', isStudio: true },
          ];
          // Build organizations list
          const tiers = ['standard', 'analytics', 'full'];
          const studioTiers = ['standard', 'full'];
          const allOrgs = [
            ...fakeStudios.map(s => {
              const h = (s.id.charCodeAt(1) * 31) >>> 0;
              return {
                id: s.id, name: s.name, type: 'studio',
                managerId: s.managerId, onboardingDate: s.onboardingDate,
                tier: studioTiers[h % studioTiers.length],
                users: (h % 8) + 2,
                items: (h % 12) + 3, // games count
              };
            }),
            ...adminCustomers.map(c => {
              const h = (c.id * 17) >>> 0;
              return {
                id: 'p' + c.id, name: c.name, type: 'publisher',
                managerId: c.managerId, onboardingDate: c.onboardingDate,
                tier: tiers[h % tiers.length],
                users: (h % 6) + 1,
                items: c.bundles.length, // apps count
              };
            }),
          ];
          const filtered = allOrgs
            .filter(o => orgsFilterType === 'all' || o.type === orgsFilterType)
            .filter(o => orgsFilterTier === 'all' || o.tier === orgsFilterTier)
            .filter(o => orgsFilterMgr === 'all' || o.managerId === orgsFilterMgr)
            .filter(o => !orgsSearch || o.name.toLowerCase().includes(orgsSearch.toLowerCase()));
          const PAGE = 50;
          const totalPages = Math.ceil(filtered.length / PAGE);
          const safePage = Math.min(orgsPage, totalPages || 1);
          const paged = filtered.slice((safePage - 1) * PAGE, safePage * PAGE);
          const tierColors = {
            standard: 'bg-slate-500/15 text-slate-300 border-slate-500/25',
            analytics: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
            full: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
          };
          const studioCount = allOrgs.filter(o => o.type === 'studio').length;
          const publisherCount = allOrgs.filter(o => o.type === 'publisher').length;
          return (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm font-semibold text-slate-100 leading-tight tracking-tight">Organizations & Assignments</span>
                  <span className="text-[10px] text-slate-500 ml-2">{filtered.length.toLocaleString()} of {allOrgs.length.toLocaleString()} tenants</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>{studioCount} studios</span>
                  <span className="text-slate-600">|</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>{publisherCount.toLocaleString()} publishers</span>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                    <input type="text" placeholder="Search organizations..." value={orgsSearch} onChange={(e) => { setOrgsSearch(e.target.value); setOrgsPage(1); }}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"/>
                  </div>
                  <select value={orgsFilterType} onChange={(e) => { setOrgsFilterType(e.target.value); setOrgsPage(1); }}
                    className="bg-slate-900/50 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer">
                    <option value="all">All types</option>
                    <option value="studio">Studios</option>
                    <option value="publisher">Publishers</option>
                  </select>
                  <select value={orgsFilterTier} onChange={(e) => { setOrgsFilterTier(e.target.value); setOrgsPage(1); }}
                    className="bg-slate-900/50 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer">
                    <option value="all">All tiers</option>
                    <option value="standard">standard</option>
                    <option value="analytics">analytics</option>
                    <option value="full">full</option>
                  </select>
                  <select value={orgsFilterMgr} onChange={(e) => { setOrgsFilterMgr(e.target.value); setOrgsPage(1); }}
                    className="bg-slate-900/50 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer">
                    <option value="all">All managers</option>
                    {adminManagers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-800/80">
                      <th className="text-left py-2.5 px-3 text-slate-400 font-medium">Organization</th>
                      <th className="text-left py-2.5 px-3 text-slate-400 font-medium w-24">Type</th>
                      <th className="text-left py-2.5 px-3 text-slate-400 font-medium w-28">Tier</th>
                      <th className="text-left py-2.5 px-3 text-slate-400 font-medium">Account Manager</th>
                      <th className="text-center py-2.5 px-3 text-slate-400 font-medium w-16">Users</th>
                      <th className="text-center py-2.5 px-3 text-slate-400 font-medium w-16">Items</th>
                      <th className="text-left py-2.5 px-3 text-slate-400 font-medium w-24">Onboarded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map(o => {
                      const mgr = adminManagers.find(m => m.id === o.managerId);
                      return (
                        <tr key={o.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 cursor-pointer transition-colors">
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold shrink-0 ${o.type === 'studio' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                {o.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                              </div>
                              <div className="text-slate-200 font-medium truncate">{o.name}</div>
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${o.type === 'studio' ? 'text-cyan-400' : 'text-emerald-400'}`}>{o.type}</span>
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${tierColors[o.tier]}`}>{o.tier}</span>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-[7px] font-bold text-white shrink-0">
                                {mgr ? mgr.name.split(' ').map(n => n[0]).join('') : '?'}
                              </div>
                              <span className="text-slate-400">{mgr ? mgr.name : '—'}</span>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-center text-slate-300">{o.users}</td>
                          <td className="py-2 px-3 text-center text-slate-300">{o.items}</td>
                          <td className="py-2 px-3 text-slate-500">{o.onboardingDate}</td>
                        </tr>
                      );
                    })}
                    {paged.length === 0 && (
                      <tr><td colSpan={7} className="py-12 text-center text-slate-500 text-xs">No organizations matching filters</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[10px] text-slate-500">
                    {((safePage - 1) * PAGE + 1).toLocaleString()}–{Math.min(safePage * PAGE, filtered.length).toLocaleString()} of {filtered.length.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <button disabled={safePage <= 1} onClick={() => setOrgsPage(p => p - 1)}
                      className="px-2 py-1 rounded text-xs text-slate-400 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed">Prev</button>
                    <span className="px-3 text-xs text-slate-400">{safePage} / {totalPages}</span>
                    <button disabled={safePage >= totalPages} onClick={() => setOrgsPage(p => p + 1)}
                      className="px-2 py-1 rounded text-xs text-slate-400 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed">Next</button>
                  </div>
                </div>
              )}
            </>
          );
        })()}

        {/* ===== Impersonation ===== */}
        {activeNavItem === 'admin' && adminSection === 'impersonation' && (() => {
          const activeSessions = [
            { id: 'is1', op: 'Anton Smirnov', opRole: 'account_manager', org: 'Pixel Labs', orgType: 'publisher', startedAt: '2026-04-23 09:42', idleMin: 3, expiresMin: 27, actions: 5 },
            { id: 'is2', op: 'Serhii Shcherbyna', opRole: 'account_manager', org: 'Hyper Games', orgType: 'publisher', startedAt: '2026-04-23 10:15', idleMin: 0, expiresMin: 30, actions: 1 },
          ];
          const recent = [
            { id: 'rs1', op: 'Anton Smirnov', org: 'Star Studio', orgType: 'studio', startedAt: '2026-04-22 14:20', endedAt: '2026-04-22 14:48', duration: '28m', actions: 7, endReason: 'manual' },
            { id: 'rs2', op: 'Rashid Sabirov', org: 'Mega Apps', orgType: 'publisher', startedAt: '2026-04-22 11:05', endedAt: '2026-04-22 11:38', duration: '33m', actions: 12, endReason: 'manual' },
            { id: 'rs3', op: 'Buha Maksym', org: 'Cube Tech', orgType: 'publisher', startedAt: '2026-04-22 09:14', endedAt: '2026-04-22 09:46', duration: '32m', actions: 4, endReason: 'timeout' },
            { id: 'rs4', op: 'Dmytro Dubniak', org: 'Idle World', orgType: 'publisher', startedAt: '2026-04-21 16:50', endedAt: '2026-04-21 17:14', duration: '24m', actions: 9, endReason: 'manual' },
            { id: 'rs5', op: 'Anton Smirnov', org: 'Voodoo Lite', orgType: 'studio', startedAt: '2026-04-21 13:22', endedAt: '2026-04-21 13:55', duration: '33m', actions: 18, endReason: 'manual' },
            { id: 'rs6', op: 'Serhii Shcherbyna', org: 'Plarium Indie', orgType: 'studio', startedAt: '2026-04-21 10:08', endedAt: '2026-04-21 10:38', duration: '30m', actions: 6, endReason: 'timeout' },
            { id: 'rs7', op: 'Rashid Sabirov', org: 'Bolt Forge', orgType: 'publisher', startedAt: '2026-04-20 15:40', endedAt: '2026-04-20 16:02', duration: '22m', actions: 3, endReason: 'manual' },
            { id: 'rs8', op: 'Buha Maksym', org: 'Neon Verse', orgType: 'publisher', startedAt: '2026-04-20 12:11', endedAt: '2026-04-20 12:44', duration: '33m', actions: 11, endReason: 'manual' },
          ];
          // Filter "Start new" — search through customers
          const matchedOrgs = impSearch
            ? adminCustomers.filter(c => c.name.toLowerCase().includes(impSearch.toLowerCase())).slice(0, 8)
            : [];
          return (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm font-semibold text-slate-100 leading-tight tracking-tight">Impersonation</span>
                  <span className="text-[10px] text-slate-500 ml-2">Sign in as a client · 30 min idle timeout</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {activeSessions.length} active
                  </span>
                  <span className="text-slate-600">|</span>
                  <span>{recent.length} past (today)</span>
                </div>
              </div>

              {/* Start new impersonation */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-4">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Start new session</div>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                  <input type="text" placeholder="Search organization to sign in as..." value={impSearch} onChange={(e) => setImpSearch(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"/>
                </div>
                {matchedOrgs.length > 0 && (
                  <div className="mt-2 border border-slate-700 rounded-lg overflow-hidden">
                    {matchedOrgs.map(org => (
                      <div key={org.id} className="flex items-center justify-between px-3 py-2 hover:bg-slate-700/30 border-b border-slate-700/50 last:border-b-0">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[9px] font-bold">{org.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</div>
                          <div>
                            <div className="text-xs text-slate-200">{org.name}</div>
                            <div className="text-[9px] text-slate-500">publisher · {org.bundles.length} apps</div>
                          </div>
                        </div>
                        <button className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-medium rounded transition-colors">
                          Sign in as
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active sessions */}
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Active sessions</div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden mb-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-800/80">
                      <th className="text-left py-2.5 px-3 text-slate-400 font-medium">Operator</th>
                      <th className="text-left py-2.5 px-3 text-slate-400 font-medium">Acting as</th>
                      <th className="text-left py-2.5 px-3 text-slate-400 font-medium w-32">Started</th>
                      <th className="text-center py-2.5 px-3 text-slate-400 font-medium w-20">Idle</th>
                      <th className="text-center py-2.5 px-3 text-slate-400 font-medium w-24">Expires in</th>
                      <th className="text-center py-2.5 px-3 text-slate-400 font-medium w-20">Actions</th>
                      <th className="text-right py-2.5 px-3 text-slate-400 font-medium w-28">Control</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeSessions.map(s => (
                      <tr key={s.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-[8px] font-bold text-white">{s.op.split(' ').map(n => n[0]).join('')}</div>
                            <div>
                              <div className="text-slate-200 text-xs">{s.op}</div>
                              <div className="text-[9px] text-slate-500">{s.opRole}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded flex items-center justify-center text-[8px] font-bold ${s.orgType === 'studio' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-emerald-500/20 text-emerald-300'}`}>{s.org.split(' ').map(n => n[0]).slice(0, 2).join('')}</div>
                            <div>
                              <div className="text-slate-200 text-xs">{s.org}</div>
                              <div className="text-[9px] text-slate-500">{s.orgType}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-slate-400 text-[11px] font-mono">{s.startedAt}</td>
                        <td className="py-2 px-3 text-center text-slate-400 text-[11px]">{s.idleMin}m</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`text-[11px] font-medium ${s.expiresMin < 5 ? 'text-amber-400' : 'text-slate-400'}`}>{s.expiresMin}m</span>
                        </td>
                        <td className="py-2 px-3 text-center text-slate-300 text-[11px]">{s.actions}</td>
                        <td className="py-2 px-3 text-right">
                          <button className="px-2.5 py-1 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-[10px] font-medium rounded transition-colors">
                            Force end
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Recent sessions */}
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Recent sessions (last 48h)</div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-800/80">
                      <th className="text-left py-2.5 px-3 text-slate-400 font-medium">Operator</th>
                      <th className="text-left py-2.5 px-3 text-slate-400 font-medium">Acted as</th>
                      <th className="text-left py-2.5 px-3 text-slate-400 font-medium w-32">Started</th>
                      <th className="text-left py-2.5 px-3 text-slate-400 font-medium w-32">Ended</th>
                      <th className="text-center py-2.5 px-3 text-slate-400 font-medium w-20">Duration</th>
                      <th className="text-center py-2.5 px-3 text-slate-400 font-medium w-20">Actions</th>
                      <th className="text-center py-2.5 px-3 text-slate-400 font-medium w-20">End</th>
                      <th className="w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map(s => (
                      <tr key={s.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                        <td className="py-2 px-3 text-slate-200 text-[11px]">{s.op}</td>
                        <td className="py-2 px-3">
                          <span className={`text-[11px] ${s.orgType === 'studio' ? 'text-cyan-400' : 'text-emerald-400'}`}>{s.org}</span>
                        </td>
                        <td className="py-2 px-3 text-slate-500 text-[10px] font-mono">{s.startedAt}</td>
                        <td className="py-2 px-3 text-slate-500 text-[10px] font-mono">{s.endedAt}</td>
                        <td className="py-2 px-3 text-center text-slate-300 text-[11px]">{s.duration}</td>
                        <td className="py-2 px-3 text-center text-slate-300 text-[11px]">{s.actions}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`text-[10px] ${s.endReason === 'timeout' ? 'text-amber-400' : 'text-slate-500'}`}>{s.endReason}</span>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button className="text-[10px] text-blue-400 hover:text-blue-300">View log →</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          );
        })()}

        {/* ===== Audit Log ===== */}
        {activeNavItem === 'admin' && adminSection === 'audit' && (() => {
          const events = [
            { id: 'e1', ts: '2026-04-23 10:15:32', actor: 'Serhii Shcherbyna', actorRole: 'account_manager', type: 'impersonation_start', target: 'Hyper Games', details: 'Started impersonation session, expires 10:45' },
            { id: 'e2', ts: '2026-04-23 09:48:11', actor: 'Igor Belov', actorRole: 'finance', type: 'payout_approve', target: 'Pixel Labs · $4,820', details: 'Payout for March 2026 approved' },
            { id: 'e3', ts: '2026-04-23 09:42:08', actor: 'Anton Smirnov', actorRole: 'account_manager', type: 'impersonation_start', target: 'Pixel Labs', details: 'Started impersonation session, expires 10:12' },
            { id: 'e4', ts: '2026-04-23 09:30:00', actor: 'Roman Petrov', actorRole: 'platform_admin', type: 'role_change', target: 'mikhail@cas.io', details: 'support · status: active → inactive' },
            { id: 'e5', ts: '2026-04-23 08:55:14', actor: 'Igor Belov', actorRole: 'finance', type: 'payout_execute', target: 'Star Studio · $2,140', details: 'Wire transfer issued · ref TX-8821' },
            { id: 'e6', ts: '2026-04-22 17:14:02', actor: 'Dmytro Dubniak', actorRole: 'account_manager', type: 'impersonation_end', target: 'Idle World', details: 'Session ended manually · 9 actions' },
            { id: 'e7', ts: '2026-04-22 16:48:33', actor: 'Anton Smirnov', actorRole: 'account_manager', type: 'sdk_key_regen', target: 'Pixel Labs · com.pixel.puzzle', details: 'SDK key regenerated · old key revoked' },
            { id: 'e8', ts: '2026-04-22 15:22:18', actor: 'Alex Shevnin', actorRole: 'super_admin', type: 'user_invite', target: 'pavel@cas.io', details: 'Invite sent · role: ua_manager' },
            { id: 'e9', ts: '2026-04-22 14:48:55', actor: 'Anton Smirnov', actorRole: 'account_manager', type: 'impersonation_end', target: 'Star Studio', details: 'Session ended manually · 7 actions' },
            { id: 'e10', ts: '2026-04-22 14:20:11', actor: 'Anton Smirnov', actorRole: 'account_manager', type: 'impersonation_start', target: 'Star Studio', details: 'Started impersonation session' },
            { id: 'e11', ts: '2026-04-22 13:05:42', actor: 'Roman Petrov', actorRole: 'platform_admin', type: 'org_create', target: 'Boombit Mini', details: 'Studio organization created, owner: contact@boombit.com' },
            { id: 'e12', ts: '2026-04-22 11:38:09', actor: 'Rashid Sabirov', actorRole: 'account_manager', type: 'impersonation_end', target: 'Mega Apps', details: 'Session ended manually · 12 actions' },
            { id: 'e13', ts: '2026-04-22 10:14:00', actor: 'Igor Belov', actorRole: 'finance', type: 'invoice_generate', target: 'Hyper Games · INV-4421', details: 'Invoice generated for Q1 2026' },
            { id: 'e14', ts: '2026-04-22 09:46:33', actor: 'Buha Maksym', actorRole: 'account_manager', type: 'impersonation_end', target: 'Cube Tech', details: 'Session timed out · 4 actions' },
            { id: 'e15', ts: '2026-04-21 17:14:21', actor: 'Roman Petrov', actorRole: 'platform_admin', type: 'role_change', target: 'rashid@cas.io', details: 'Senior AM → AM' },
            { id: 'e16', ts: '2026-04-21 15:30:00', actor: 'Alex Shevnin', actorRole: 'super_admin', type: 'template_update', target: 'client.full', details: 'Added analytics.shops to template' },
            { id: 'e17', ts: '2026-04-21 12:18:44', actor: 'Iryna Volkova', actorRole: 'platform_admin', type: 'org_create', target: 'Voodoo Lite', details: 'Studio organization created' },
            { id: 'e18', ts: '2026-04-21 10:38:12', actor: 'Serhii Shcherbyna', actorRole: 'account_manager', type: 'impersonation_end', target: 'Plarium Indie', details: 'Session timed out · 6 actions' },
          ];
          const typeColors = {
            impersonation_start: 'bg-purple-500/15 text-purple-300 border-purple-500/25',
            impersonation_end: 'bg-purple-500/10 text-purple-400/70 border-purple-500/20',
            payout_approve: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
            payout_execute: 'bg-emerald-600/20 text-emerald-200 border-emerald-500/30',
            role_change: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
            sdk_key_regen: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
            user_invite: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
            org_create: 'bg-pink-500/15 text-pink-300 border-pink-500/25',
            invoice_generate: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
            template_update: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
          };
          const allTypes = Array.from(new Set(events.map(e => e.type)));
          const allActors = Array.from(new Set(events.map(e => e.actor))).sort();
          const filtered = events
            .filter(e => auditFilterType === 'all' || e.type === auditFilterType)
            .filter(e => auditFilterActor === 'all' || e.actor === auditFilterActor)
            .filter(e => !auditSearch || e.target.toLowerCase().includes(auditSearch.toLowerCase()) || e.details.toLowerCase().includes(auditSearch.toLowerCase()));
          return (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm font-semibold text-slate-100 leading-tight tracking-tight">Audit Log</span>
                  <span className="text-[10px] text-slate-500 ml-2">{filtered.length} of {events.length} events · last 48h</span>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-lg text-xs text-slate-300 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                  Export CSV
                </button>
              </div>

              {/* Filters */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                    <input type="text" placeholder="Search target or details..." value={auditSearch} onChange={(e) => setAuditSearch(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"/>
                  </div>
                  <select value={auditFilterType} onChange={(e) => setAuditFilterType(e.target.value)}
                    className="bg-slate-900/50 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer">
                    <option value="all">All event types</option>
                    {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select value={auditFilterActor} onChange={(e) => setAuditFilterActor(e.target.value)}
                    className="bg-slate-900/50 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer">
                    <option value="all">All actors</option>
                    {allActors.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <select className="bg-slate-900/50 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer" defaultValue="48h">
                    <option value="1h">Last hour</option>
                    <option value="24h">Last 24h</option>
                    <option value="48h">Last 48h</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                  </select>
                </div>
              </div>

              {/* Event feed */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-800/80">
                      <th className="text-left py-2.5 px-3 text-slate-400 font-medium w-40">Timestamp</th>
                      <th className="text-left py-2.5 px-3 text-slate-400 font-medium w-44">Actor</th>
                      <th className="text-left py-2.5 px-3 text-slate-400 font-medium w-44">Event</th>
                      <th className="text-left py-2.5 px-3 text-slate-400 font-medium w-44">Target</th>
                      <th className="text-left py-2.5 px-3 text-slate-400 font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(e => (
                      <tr key={e.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                        <td className="py-2 px-3 text-slate-500 text-[10px] font-mono">{e.ts}</td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-[7px] font-bold text-white">{e.actor.split(' ').map(n => n[0]).join('')}</div>
                            <div>
                              <div className="text-slate-200 text-[11px]">{e.actor}</div>
                              <div className="text-[9px] text-slate-500">{e.actorRole}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${typeColors[e.type] || 'bg-slate-500/15 text-slate-300 border-slate-500/25'}`}>{e.type}</span>
                        </td>
                        <td className="py-2 px-3 text-slate-300 text-[11px]">{e.target}</td>
                        <td className="py-2 px-3 text-slate-400 text-[11px]">{e.details}</td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={5} className="py-12 text-center text-slate-500 text-xs">No events matching filters</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          );
        })()}

        {/* ===== Role Templates ===== */}
        {activeNavItem === 'admin' && adminSection === 'templates' && (() => {
          const templates = [
            { id: 'pub_standard', name: 'client.standard', for: 'publisher', orgs: 1247, desc: 'Базовый набор: SDK + медиация + платежи' },
            { id: 'pub_analytics', name: 'client.analytics', for: 'publisher', orgs: 423, desc: 'Standard + расширенная аналитика (BigQuery, conversion, shops)' },
            { id: 'pub_full', name: 'client.full', for: 'publisher', orgs: 175, desc: 'Полный набор: analytics + UA + creatives + ASO + publishing' },
            { id: 'studio_standard', name: 'studio.standard', for: 'studio', orgs: 5, desc: 'Базовый набор: игры + просмотр кампаний и метрик' },
            { id: 'studio_full', name: 'studio.full', for: 'studio', orgs: 3, desc: 'Standard + Tenjin/BigQuery analytics + payouts request' },
          ];
          const featureMatrix = {
            pub_standard: { 'apps.read': true, 'apps.write': true, 'mediation.read': true, 'mediation.write': true, 'admob.read': true, 'payments.read': true, 'analytics.bigquery': false, 'analytics.conversion': false, 'analytics.shops': false, 'campaigns.read': false, 'campaigns.write': false, 'creatives.read': false, 'creatives.write': false, 'aso.read': false, 'aso.write': false, 'publishing.read': false, 'publishing.write': false, 'shops.read': false, 'shops.write': false },
            pub_analytics: { 'apps.read': true, 'apps.write': true, 'mediation.read': true, 'mediation.write': true, 'admob.read': true, 'payments.read': true, 'analytics.bigquery': true, 'analytics.conversion': true, 'analytics.shops': true, 'campaigns.read': false, 'campaigns.write': false, 'creatives.read': false, 'creatives.write': false, 'aso.read': false, 'aso.write': false, 'publishing.read': false, 'publishing.write': false, 'shops.read': false, 'shops.write': false },
            pub_full: { 'apps.read': true, 'apps.write': true, 'mediation.read': true, 'mediation.write': true, 'admob.read': true, 'payments.read': true, 'analytics.bigquery': true, 'analytics.conversion': true, 'analytics.shops': true, 'campaigns.read': true, 'campaigns.write': true, 'creatives.read': true, 'creatives.write': true, 'aso.read': true, 'aso.write': true, 'publishing.read': true, 'publishing.write': true, 'shops.read': true, 'shops.write': true },
            studio_standard: { 'games.read': true, 'games.write': true, 'ua_campaigns.view': true, 'revenue.view_own': true, 'payouts.view': true, 'analytics.tenjin': false, 'analytics.bigquery': false, 'revenue.export': false, 'payouts.request': false },
            studio_full: { 'games.read': true, 'games.write': true, 'ua_campaigns.view': true, 'revenue.view_own': true, 'payouts.view': true, 'analytics.tenjin': true, 'analytics.bigquery': true, 'revenue.export': true, 'payouts.request': true },
          };
          const featureGroups = {
            publisher: [
              { group: 'Apps & SDK', items: ['apps.read', 'apps.write', 'mediation.read', 'mediation.write', 'admob.read'] },
              { group: 'Payments', items: ['payments.read'] },
              { group: 'Analytics', items: ['analytics.bigquery', 'analytics.conversion', 'analytics.shops'] },
              { group: 'UA & Creatives', items: ['campaigns.read', 'campaigns.write', 'creatives.read', 'creatives.write'] },
              { group: 'Publishing & ASO', items: ['publishing.read', 'publishing.write', 'aso.read', 'aso.write', 'shops.read', 'shops.write'] },
            ],
            studio: [
              { group: 'Games', items: ['games.read', 'games.write'] },
              { group: 'UA & Revenue', items: ['ua_campaigns.view', 'revenue.view_own', 'revenue.export'] },
              { group: 'Payouts', items: ['payouts.view', 'payouts.request'] },
              { group: 'Analytics', items: ['analytics.tenjin', 'analytics.bigquery'] },
            ],
          };
          const sel = templates.find(t => t.id === selectedTemplate) || templates[0];
          const features = featureMatrix[sel.id];
          const groups = featureGroups[sel.for];
          const enabledCount = Object.values(features).filter(Boolean).length;
          const totalCount = Object.keys(features).length;
          return (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm font-semibold text-slate-100 leading-tight tracking-tight">Role Templates</span>
                  <span className="text-[10px] text-slate-500 ml-2">Tier templates layered on top of base roles</span>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-medium text-white transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                  New template
                </button>
              </div>

              <div className="grid grid-cols-12 gap-3">
                {/* Left: list of templates */}
                <div className="col-span-4 flex flex-col gap-2">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Publisher templates</div>
                  {templates.filter(t => t.for === 'publisher').map(t => (
                    <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
                      className={`text-left p-3 rounded-xl border transition-colors ${
                        selectedTemplate === t.id
                          ? 'bg-blue-500/10 border-blue-500/40'
                          : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800'
                      }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-mono ${selectedTemplate === t.id ? 'text-blue-300' : 'text-slate-200'}`}>{t.name}</span>
                        <span className="text-[10px] text-slate-500">{t.orgs.toLocaleString()} orgs</span>
                      </div>
                      <div className="text-[10px] text-slate-500 leading-snug">{t.desc}</div>
                    </button>
                  ))}
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1 mt-3">Studio templates</div>
                  {templates.filter(t => t.for === 'studio').map(t => (
                    <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
                      className={`text-left p-3 rounded-xl border transition-colors ${
                        selectedTemplate === t.id
                          ? 'bg-cyan-500/10 border-cyan-500/40'
                          : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800'
                      }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-mono ${selectedTemplate === t.id ? 'text-cyan-300' : 'text-slate-200'}`}>{t.name}</span>
                        <span className="text-[10px] text-slate-500">{t.orgs} orgs</span>
                      </div>
                      <div className="text-[10px] text-slate-500 leading-snug">{t.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Right: editor */}
                <div className="col-span-8">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    {/* Template header */}
                    <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-700">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base font-semibold text-slate-100 font-mono">{sel.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${sel.for === 'studio' ? 'bg-cyan-500/15 text-cyan-300' : 'bg-emerald-500/15 text-emerald-300'}`}>{sel.for}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{sel.desc}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-semibold text-slate-100">{enabledCount}<span className="text-slate-500 text-xs"> / {totalCount}</span></div>
                        <div className="text-[10px] text-slate-500">features enabled</div>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="p-2.5 bg-slate-900/40 rounded-lg border border-slate-700 text-center">
                        <div className="text-sm font-semibold text-slate-100">{sel.orgs.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-500">Organizations</div>
                      </div>
                      <div className="p-2.5 bg-slate-900/40 rounded-lg border border-slate-700 text-center">
                        <div className="text-sm font-semibold text-emerald-400">{enabledCount}</div>
                        <div className="text-[10px] text-slate-500">Enabled</div>
                      </div>
                      <div className="p-2.5 bg-slate-900/40 rounded-lg border border-slate-700 text-center">
                        <div className="text-sm font-semibold text-slate-500">{totalCount - enabledCount}</div>
                        <div className="text-[10px] text-slate-500">Disabled</div>
                      </div>
                    </div>

                    {/* Feature groups */}
                    <div className="space-y-3">
                      {groups.map(g => (
                        <div key={g.group}>
                          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">{g.group}</div>
                          <div className="grid grid-cols-2 gap-1.5">
                            {g.items.map(item => {
                              const enabled = features[item];
                              return (
                                <div key={item} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${enabled ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900/30 border-slate-700/50'}`}>
                                  <span className={`text-[11px] font-mono ${enabled ? 'text-slate-200' : 'text-slate-500'}`}>{item}</span>
                                  <button className={`w-8 h-4 rounded-full relative transition-colors ${enabled ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                                    <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`}></span>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer actions */}
                    <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between">
                      <div className="text-[10px] text-slate-500 italic">Changes apply to all {sel.orgs.toLocaleString()} organizations on this template</div>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 text-[11px] text-slate-400 hover:text-slate-200">Cancel</button>
                        <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium rounded transition-colors">Save changes</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          );
        })()}

        {/* ===== Admin placeholder (in-development sections) ===== */}
        {activeNavItem === 'admin' && adminSection && !['apps', 'users', 'organizations', 'impersonation', 'audit', 'templates'].includes(adminSection) && (() => {
          const labels = { mediation: 'Default Mediation Setup', aso: 'ASO', creatives: 'Creatives', networks: 'Networks Management' };
          return (
            <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-700/30 flex items-center justify-center text-slate-500 mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <div className="text-sm font-medium text-slate-200 mb-1">{labels[adminSection]}</div>
              <div className="text-[11px] text-slate-500 mb-4">In development</div>
              <button onClick={() => setAdminSection(null)} className="text-[11px] text-blue-400 hover:text-blue-300">← Back to Admin</button>
            </div>
          );
        })()}

        {activeNavItem === 'admin' && adminSection === 'apps' && (() => {
          // Filter apps with overrides applied
          const appsWithOverrides = adminApps.map(a => ({ ...a, ...(adminAppOverrides[a.bundleId] || {}) }));

          const filteredApps = appsWithOverrides
            .filter(a => !adminSelectedManager || a.managerId === adminSelectedManager)
            .filter(a => adminFilterPlatform === 'all' || a.platform === adminFilterPlatform)
            .filter(a => adminFilterStatus === 'all' || a.status === adminFilterStatus)
            .filter(a => {
              if (!adminSearch) return true;
              const q = adminSearch.toLowerCase();
              return a.bundleId.toLowerCase().includes(q) || a.customerName.toLowerCase().includes(q) || String(a.userId).includes(q)
                || (storeData[a.bundleId]?.appName || '').toLowerCase().includes(q)
                || (storeData[a.bundleId]?.publisher || '').toLowerCase().includes(q);
            });

          const PAGE_SIZE = 50;
          const totalPages = Math.ceil(filteredApps.length / PAGE_SIZE);
          const safePage = Math.min(adminPage, totalPages || 1);
          const pagedApps = filteredApps.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

          const uniqueCustomerIds = new Set(filteredApps.map(a => a.userId));

          // Sorting
          const toggleSort = (col) => {
            if (adminSortBy === col) setAdminSortDir(adminSortDir === 'asc' ? 'desc' : 'asc');
            else { setAdminSortBy(col); setAdminSortDir('asc'); }
          };
          const sortIcon = (col) => adminSortBy === col ? (adminSortDir === 'asc' ? ' ↑' : ' ↓') : '';

          const sortedApps = [...pagedApps].sort((a, b) => {
            let va, vb;
            if (adminSortBy === 'bundleId') { va = (storeData[a.bundleId]?.appName || a.bundleId).toLowerCase(); vb = (storeData[b.bundleId]?.appName || b.bundleId).toLowerCase(); }
            else if (adminSortBy === 'customer') { va = a.customerName; vb = b.customerName; }
            else if (adminSortBy === 'manager') { va = (adminManagers.find(m => m.id === a.managerId) || {}).name || ''; vb = (adminManagers.find(m => m.id === b.managerId) || {}).name || ''; }
            else if (adminSortBy === 'status') { va = a.status; vb = b.status; }
            else if (adminSortBy === 'platform') { va = a.platform; vb = b.platform; }
            else if (adminSortBy === 'date') { va = a.dateAdded; vb = b.dateAdded; }
            else { va = a.bundleId; vb = b.bundleId; }
            if (typeof va === 'string') return adminSortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
            return adminSortDir === 'asc' ? va - vb : vb - va;
          });

          // Pagination helper
          const pageNumbers = (() => {
            if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
            const p = [1];
            if (safePage > 3) p.push('...');
            for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) p.push(i);
            if (safePage < totalPages - 2) p.push('...');
            if (totalPages > 1) p.push(totalPages);
            return p;
          })();

          // Platform icon SVGs
          const PlatformIcon = ({ platform, size }) => {
            const s = size || 14;
            return platform === 'ios' ? (
              <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" className="text-slate-400 shrink-0"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            ) : (
              <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" className="text-emerald-500/70 shrink-0"><path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.27-.86-.31-.16-.69-.04-.86.27l-1.86 3.22c-1.44-.65-3.02-1.01-4.65-1.01s-3.21.36-4.65 1.01L5.29 5.71c-.16-.31-.54-.43-.86-.27-.31.16-.43.54-.27.86l1.84 3.18C2.86 11.58.83 14.94 0 18h24c-.83-3.06-2.86-6.42-6.4-8.52zM7 15.25a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm10 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z"/></svg>
            );
          };

          const statusColors = {
            active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
            paused: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
            pending: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
            review: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
          };

          const selectedAppData = adminSelectedApp ? appsWithOverrides.find(a => a.bundleId === adminSelectedApp) : null;
          const selectedAppCustomer = selectedAppData ? adminCustomers.find(c => c.id === selectedAppData.userId) : null;

          return (
            <>
              {/* Admin Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm font-semibold text-slate-100 leading-tight tracking-tight">Admin</span>
                  <span className="text-[10px] text-slate-500 ml-2">Apps Management</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{filteredApps.length.toLocaleString()} apps</span>
                  <span className="text-slate-600">|</span>
                  <span>{uniqueCustomerIds.size.toLocaleString()} customers</span>
                  <span className="text-slate-600">|</span>
                  <span>{adminManagers.length} managers</span>
                </div>
              </div>

              {/* Filters bar */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Search */}
                  <div className="relative flex-1 min-w-[200px]">
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                    <input
                      type="text"
                      placeholder="Search bundle, app name, customer..."
                      value={adminSearch}
                      onChange={(e) => { setAdminSearch(e.target.value); setAdminPage(1); }}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    {adminSearch && (
                      <button onClick={() => { setAdminSearch(''); setAdminPage(1); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    )}
                  </div>

                  {/* Manager filter */}
                  <select value={adminSelectedManager || ''} onChange={(e) => { setAdminSelectedManager(e.target.value || null); setAdminPage(1); }}
                    className="bg-slate-900/50 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer">
                    <option value="">All managers</option>
                    {adminManagers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>

                  {/* Platform filter */}
                  <select value={adminFilterPlatform} onChange={(e) => { setAdminFilterPlatform(e.target.value); setAdminPage(1); }}
                    className="bg-slate-900/50 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer">
                    <option value="all">All platforms</option>
                    <option value="android">Android</option>
                    <option value="ios">iOS</option>
                  </select>

                  {/* Active filter chips */}
                  {(adminSearch || adminSelectedManager || adminFilterPlatform !== 'all') && (
                    <button onClick={() => { setAdminSearch(''); setAdminSelectedManager(null); setAdminFilterPlatform('all'); setAdminPage(1); }}
                      className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors px-2 py-1">Reset all</button>
                  )}
                </div>
              </div>

              {/* Apps table */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-800/80">
                      <th onClick={() => toggleSort('bundleId')} className="text-left py-2.5 px-3 text-slate-400 font-medium cursor-pointer hover:text-slate-200 select-none">App{sortIcon('bundleId')}</th>
                      <th onClick={() => toggleSort('platform')} className="text-center py-2.5 px-2 text-slate-400 font-medium cursor-pointer hover:text-slate-200 select-none w-10">OS{sortIcon('platform')}</th>
                      <th onClick={() => toggleSort('customer')} className="text-left py-2.5 px-3 text-slate-400 font-medium cursor-pointer hover:text-slate-200 select-none">Customer{sortIcon('customer')}</th>
                      <th onClick={() => toggleSort('manager')} className="text-left py-2.5 px-3 text-slate-400 font-medium cursor-pointer hover:text-slate-200 select-none">Manager{sortIcon('manager')}</th>
                      <th onClick={() => toggleSort('date')} className="text-left py-2.5 px-3 text-slate-400 font-medium cursor-pointer hover:text-slate-200 select-none w-24">Added{sortIcon('date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedApps.map(app => {
                      const mgr = adminManagers.find(m => m.id === app.managerId);
                      const sd = storeData[app.bundleId];
                      return (
                        <tr key={app.bundleId}
                          onClick={() => setAdminSelectedApp(app.bundleId)}
                          className="border-b border-slate-700/30 hover:bg-slate-700/20 cursor-pointer group transition-colors"
                        >
                          {/* App: icon + name/bundle */}
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              {sd?.iconUrl ? (
                                <img src={sd.iconUrl} alt="" className="w-7 h-7 rounded-lg shrink-0" loading="lazy" />
                              ) : (
                                <div className="w-7 h-7 rounded-lg bg-slate-700/40 flex items-center justify-center shrink-0"><PlatformIcon platform={app.platform} size={12} /></div>
                              )}
                              <div className="min-w-0">
                                {sd?.appName ? (
                                  <>
                                    <div className="text-slate-200 font-medium truncate max-w-[220px] group-hover:text-white">{sd.appName}</div>
                                    <div className="text-[10px] font-mono text-slate-500 truncate max-w-[220px]">{app.bundleId}</div>
                                  </>
                                ) : (
                                  <div className="text-[10px] font-mono text-slate-400 truncate max-w-[220px] group-hover:text-slate-300">{app.bundleId}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          {/* Platform */}
                          <td className="py-2 px-2 text-center"><PlatformIcon platform={app.platform} size={12} /></td>
                          {/* Customer */}
                          <td className="py-2 px-3">
                            <button onClick={(e) => { e.stopPropagation(); setAdminSelectedCustomerId(app.userId); }}
                              className="text-left hover:text-blue-400 transition-colors group/cust">
                              <div className="text-slate-300 truncate max-w-[140px] group-hover/cust:text-blue-400">{app.customerName}</div>
                              <div className="text-[10px] text-slate-600">#{app.userId}</div>
                            </button>
                          </td>
                          {/* Manager */}
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-[7px] font-bold text-white shrink-0">
                                {mgr ? mgr.name.split(' ').map(n => n[0]).join('') : '?'}
                              </div>
                              <span className="text-slate-400 truncate">{mgr ? mgr.name.split(' ')[0] : '—'}</span>
                            </div>
                          </td>
                          {/* Date */}
                          <td className="py-2 px-3 text-slate-500">{app.dateAdded}</td>
                        </tr>
                      );
                    })}
                    {sortedApps.length === 0 && (
                      <tr><td colSpan={5} className="py-12 text-center text-slate-500 text-xs">No apps found matching your filters</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[10px] text-slate-500">
                    {((safePage - 1) * PAGE_SIZE + 1).toLocaleString()}–{Math.min(safePage * PAGE_SIZE, filteredApps.length).toLocaleString()} of {filteredApps.length.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <button disabled={safePage <= 1} onClick={() => setAdminPage(p => p - 1)}
                      className="px-2 py-1 rounded text-xs text-slate-400 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed">Prev</button>
                    {pageNumbers.map((p, i) =>
                      p === '...'
                        ? <span key={'e' + i} className="px-1.5 text-slate-600 text-xs">...</span>
                        : <button key={p} onClick={() => setAdminPage(p)}
                            className={`w-7 h-7 rounded text-xs ${p === safePage ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>{p}</button>
                    )}
                    <button disabled={safePage >= totalPages} onClick={() => setAdminPage(p => p + 1)}
                      className="px-2 py-1 rounded text-xs text-slate-400 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed">Next</button>
                  </div>
                </div>
              )}

              {/* Detail popup modal — 1C-style form */}
              {selectedAppData && (() => {
                const sd = storeData[selectedAppData.bundleId];
                const storeUrl = sd?.storeUrl || (selectedAppData.platform === 'ios' ? `https://apps.apple.com/app/id${selectedAppData.bundleId}` : `https://play.google.com/store/apps/details?id=${selectedAppData.bundleId}`);
                const mgr = adminManagers.find(m => m.id === selectedAppData.managerId);
                // Deterministic fake data from bundleId hash
                const h = selectedAppData.bundleId.split('').reduce((s, c) => (s * 31 + c.charCodeAt(0)) & 0x7fffffff, 0);
                const fakeCode = (h % 9000) + 1000;
                const fakeCasVer = `${3 + (h % 3)}.${h % 10}.${(h * 7) % 100}`;
                const fakeProtoVer100 = `${1 + (h % 5)}.${(h * 3) % 10}.${(h * 13) % 100}`;
                const fakeProtoVer99 = `${1 + (h % 5)}.${(h * 3) % 10}.${((h * 13) % 100) - 1}`;
                const fakeAppId = `ca-app-pub-${(h % 9000000000 + 1000000000)}`;
                const fakeAdmob = `${(h % 9000000000 + 1000000000)}/${(h * 3) % 9000000000 + 1000000000}`;
                const fakeBannerRefresh = [30, 45, 60, -1][(h * 11) % 4];
                const fakeInterDelay = [-1, 0, 15, 30][(h * 7) % 4];
                const fakeOrientation = ['Portrait', 'Landscape', 'All'][(h * 3) % 3];
                const fakeGenre = ['Casual', 'Puzzle', 'Arcade', 'Simulation', 'Strategy', 'Action', 'Racing', 'Educational', 'Board', 'Trivia'][(h * 13) % 10];
                const fakeBrand = selectedAppData.platform === 'ios' ? 'CAS iOS' : 'CAS Android';
                const fakeRating = ['Everyone', 'Everyone 10+', 'Teen', 'Mature(up to 21)'][(h * 17) % 4];
                const fakePriority = (h % 5) + 1;
                const fakeCategory = ['Games', 'Entertainment', 'Tools', 'Education', 'Lifestyle', 'Social', 'Productivity', 'Health'][(h * 11) % 8];
                const fakePublishDate = selectedAppData.dateAdded;
                const fakeNetworksDate = (() => { const d = new Date(selectedAppData.dateAdded); d.setDate(d.getDate() + (h % 30) + 5); return d.toISOString().slice(0, 10); })();
                const fakeServerUpdate = (() => { const d = new Date(); d.setDate(d.getDate() - (h % 7)); return d.toISOString().slice(0, 10); })();
                const fakeFirebase = (h % 3) !== 0;
                const fakeMediation = (h % 4) !== 0;
                const fakeReports = (h % 5) !== 0;
                const fakeAudit = (h % 6) === 0;
                const fakeNoAudit = !fakeAudit && (h % 3) === 0;
                // CAS Events flags
                const evFlags = { load: (h % 7) > 2, loadFail: (h % 11) > 8, loaded: (h % 5) > 1, impression: (h % 3) !== 0, click: (h % 9) > 5, reward: (h % 4) === 0, startSession: (h % 6) > 3, show: (h % 5) > 2, showFail: (h % 13) > 10, showed: (h % 7) > 4 };
                const fakeEventBatch = (h % 5) + 1;
                // Ad networks
                const networks = ['AppLovin', 'AdMob', 'Unity Ads', 'ironSource', 'Meta AN', 'Pangle', 'Mintegral', 'Vungle', 'InMobi', 'Chartboost'];
                const activeNets = networks.filter((_, i) => ((h >> i) & 1) || i < 3);
                // Form field component
                const F = ({ label, val, w, mono }) => (
                  <div className={`${w || ''}`}>
                    <div className="text-[10px] text-slate-500 mb-0.5">{label}</div>
                    <div className={`bg-slate-800 border border-slate-700 rounded px-2 py-1 text-[11px] ${mono ? 'font-mono' : ''} text-slate-300 truncate min-h-[26px]`}>{val || ''}</div>
                  </div>
                );
                const Chk = ({ label, checked }) => (
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-default">
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${checked ? 'bg-blue-600 border-blue-500' : 'border-slate-600 bg-slate-800'}`}>
                      {checked && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                    </div>
                    {label}
                  </label>
                );

                return (
                  <>
                    <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setAdminSelectedApp(null)} />
                    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] max-h-[90vh] bg-slate-900 border border-slate-600 rounded-2xl shadow-2xl z-50 flex flex-col">

                      {/* Title bar */}
                      <div className="shrink-0 px-5 py-3 border-b border-slate-700 flex items-center justify-between rounded-t-2xl">
                        <div className="flex items-center gap-3">
                          {sd?.iconUrl ? (
                            <img src={sd.iconUrl} alt="" className="w-8 h-8 rounded-lg shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center shrink-0"><PlatformIcon platform={selectedAppData.platform} size={16} /></div>
                          )}
                          <div>
                            <div className="text-sm text-slate-100 font-semibold">{sd?.appName || selectedAppData.bundleId} <span className="text-slate-500 font-normal">(Приложения)</span></div>
                          </div>
                        </div>
                        <button onClick={() => setAdminSelectedApp(null)} className="text-slate-500 hover:text-slate-200 transition-colors p-1">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                      </div>

                      {/* Action buttons row */}
                      <div className="shrink-0 px-5 py-2 border-b border-slate-700/50 flex items-center gap-1.5 flex-wrap">
                        <a href={storeUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 bg-slate-700/50 border border-slate-600 rounded-lg text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-1.5">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                          Перейти на маркет
                        </a>
                        <button onClick={() => { setAdminSelectedApp(null); setAdminSelectedCustomerId(selectedAppData.userId); }}
                          className="px-3 py-1.5 bg-slate-700/50 border border-slate-600 rounded-lg text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                          Клиент
                        </button>
                        <div className="ml-auto flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">Менеджер:</span>
                          <div className="relative">
                            <select value={selectedAppData.managerId}
                              onChange={(e) => updateAppOverride(selectedAppData.bundleId, { managerId: e.target.value })}
                              className="bg-slate-800 border border-slate-600 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer appearance-none pr-7">
                              {adminManagers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                            <svg className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                          </div>
                        </div>
                      </div>

                      {/* Tabs */}
                      <div className="shrink-0 px-5 border-b border-slate-700/50 flex gap-0">
                        {[['main', 'Основная'], ['networks', 'Рекламные сети'], ['history', 'History']].map(([id, label]) => (
                          <button key={id} onClick={() => setAdminAppTab(id)}
                            className={`px-4 py-2 text-[11px] font-medium border-b-2 transition-colors ${
                              adminAppTab === id ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'
                            }`}>{label}</button>
                        ))}
                      </div>

                      {/* Tab content */}
                      <div className="overflow-y-auto p-5 flex-1">
                        {adminAppTab === 'main' && (
                          <div className="space-y-3">
                            {/* Row 1: Наименование */}
                            <F label="Наименование" val={sd?.appName || selectedAppData.bundleId} />
                            {/* Row 2: Код, даты */}
                            <div className="flex gap-2">
                              <F label="Код" val={fakeCode} w="w-20" />
                              <F label="Дата обновл. на сервере" val={fakeServerUpdate} w="flex-1" />
                            </div>
                            {/* Row 3: Bundle ID, platform, store */}
                            <div className="flex gap-2">
                              <F label="Bundle ID" val={selectedAppData.bundleId} w="flex-1" mono />
                              {selectedAppData.platform === 'ios' && <F label="ID пакета iOS" val={selectedAppData.bundleId} w="w-32" mono />}
                              <F label="Платформа" val={selectedAppData.platform === 'ios' ? 'iOS' : 'Android'} w="w-24" />
                              <F label="Магазин" val={selectedAppData.platform === 'ios' ? 'App Store' : 'Google Play'} w="w-28" />
                            </div>
                            {/* Row 4: Versions */}
                            <div className="flex gap-2">
                              <F label="Версия прототипа, 100%" val={fakeProtoVer100} w="flex-1" mono />
                              <F label="Версия прототипа, 99%" val={fakeProtoVer99} w="flex-1" mono />
                              <F label="Версия CAS" val={fakeCasVer} w="w-28" mono />
                              <F label="Ориентация" val={fakeOrientation} w="w-24" />
                            </div>
                            {/* Row 5: App IDs, ad settings */}
                            <div className="flex gap-2">
                              <F label="App ID" val={fakeAppId} w="flex-1" mono />
                              <F label="Admob App ID" val={fakeAdmob} w="flex-1" mono />
                              <F label="Banner refresh, сек" val={fakeBannerRefresh} w="w-28" />
                              <F label="Inter delay, сек" val={fakeInterDelay} w="w-24" />
                            </div>
                            {/* Row 6: Checkboxes */}
                            <div className="flex gap-4 py-1">
                              <Chk label="Показывать в отчёте" checked={fakeReports} />
                              <Chk label="Аналитика Firebase" checked={fakeFirebase} />
                              <Chk label="Сервер медиации" checked={fakeMediation} />
                            </div>
                            {/* Row 7: Brand, genre */}
                            <div className="flex gap-2">
                              <F label="Бренд" val={fakeBrand} w="flex-1" />
                              <F label="Жанр" val={fakeGenre} w="flex-1" />
                              <F label="Категория" val={fakeCategory} w="flex-1" />
                            </div>
                          </div>
                        )}

                        {adminAppTab === 'networks' && (
                          <div className="space-y-3">
                            <div className="text-xs text-slate-400 mb-3">Рекламные сети, подключённые к приложению</div>
                            <div className="bg-slate-800/40 border border-slate-700 rounded-lg overflow-hidden">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="border-b border-slate-700 bg-slate-800/60">
                                    <th className="text-left py-2 px-3 text-slate-500 font-medium">Сеть</th>
                                    <th className="text-center py-2 px-3 text-slate-500 font-medium w-20">Активна</th>
                                    <th className="text-left py-2 px-3 text-slate-500 font-medium">App Key</th>
                                    <th className="text-left py-2 px-3 text-slate-500 font-medium w-28">Формат</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {networks.map((net, i) => {
                                    const active = activeNets.includes(net);
                                    return (
                                      <tr key={net} className="border-b border-slate-700/20">
                                        <td className="py-1.5 px-3 text-slate-300">{net}</td>
                                        <td className="py-1.5 px-3 text-center">
                                          <div className={`w-3 h-3 rounded-full mx-auto ${active ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                                        </td>
                                        <td className="py-1.5 px-3 text-slate-500 font-mono text-[10px]">{active ? `${(h * (i + 1) * 17) % 9000000 + 1000000}` : '—'}</td>
                                        <td className="py-1.5 px-3 text-slate-500 text-[10px]">{active ? ['Banner, Inter', 'Inter, Reward', 'Banner', 'Inter', 'Reward, Inter', 'Banner, Inter, Reward'][i % 6] : '—'}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {adminAppTab === 'history' && (() => {
                          // Generate deterministic history events across app's entire lifetime
                          const mgrNames = adminManagers.map(m => m.name);
                          const initialMgr = mgrNames[(h * 3) % mgrNames.length];
                          const commission = [10, 12, 15, 8][(h * 7) % 4];
                          const engineName = ['Unity', 'Native Android', 'Native iOS', 'Flutter', 'Unreal'][(h * 11) % 5];
                          const startDate = new Date(selectedAppData.dateAdded);
                          const now = new Date('2026-04-06');
                          const daysDiff = Math.floor((now - startDate) / 86400000);
                          const addD = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
                          // Deterministic pseudo-random from seed
                          const prng = (seed) => ((seed * 1103515245 + 12345) & 0x7fffffff);

                          const allEvents = [];
                          const push = (dayOffset, type, title, detail, author, flags) => {
                            if (dayOffset >= 0 && dayOffset <= daysDiff) allEvents.push({ date: addD(startDate, dayOffset), type, title, detail, author, ...flags });
                          };

                          // === ONBOARDING (day 0-3) ===
                          push(0, 'lifecycle', 'App added to CAS', null, 'Admin');
                          push(0, 'finance', `Commission: ${commission}%`, null, 'Admin');
                          push(0, 'people', `Manager: ${initialMgr}`, null, 'Admin');
                          push(0, 'monetization', `Networks: ${activeNets.slice(0, 3).join(', ')}`, null, initialMgr);
                          const sdkMajor = 3 + (h % 2);
                          const sdkMinor0 = h % 6;
                          const sdkPatch0 = (h * 7) % 20;
                          push(1, 'integration', `CAS SDK ${sdkMajor}.${sdkMinor0}.${sdkPatch0} integrated (${engineName})`, null, 'auto');
                          push(1 + (h % 2), 'integration', 'First impression', null, 'auto');
                          push(2 + (h % 2), 'integration', `First revenue: $${(((h % 900) + 10) / 100).toFixed(2)}`, null, 'auto');

                          // MMP connected
                          const mmpName = ['Adjust', 'AppsFlyer', 'Singular', 'Branch'][(h * 19) % 4];
                          push(15 + (h % 10), 'integration', `MMP connected: ${mmpName}`, null, 'auto');

                          // User added to team
                          const domain = selectedAppData.bundleId.split('.')[1] || 'studio';
                          const addedUser = ['dev@' + domain + '.com', 'pm@studio.io', 'analytics@team.co'][(h * 13) % 3];
                          push(50 + (h % 30), 'people', `User added to team: ${addedUser}`, 'Developer role', 'Admin');

                          // === RECURRING EVENTS across lifetime ===
                          // SDK updates every ~90 days
                          let curMinor = sdkMinor0, curPatch = sdkPatch0;
                          for (let d = 60 + (h % 40); d < daysDiff; d += 80 + prng(h + d) % 50) {
                            const prevVer = `${sdkMajor}.${curMinor}.${curPatch}`;
                            curPatch = (curPatch + 1 + prng(h + d) % 5) % 30;
                            if (prng(h + d * 3) % 4 === 0) { curMinor = curMinor + 1; curPatch = 0; }
                            const newVer = `${sdkMajor}.${curMinor}.${curPatch}`;
                            push(d, 'integration', `SDK updated: ${prevVer} → ${newVer}`, null, 'auto');
                          }

                          // Waterfall / monetization changes every ~60 days
                          const wfActions = ['Waterfall config updated', 'Floor price adjusted', 'Bidding priority reordered', 'eCPM floors updated'];
                          const wfDetails = [
                            (s) => `Added ${networks[prng(s) % networks.length]} (server bidding)`,
                            (s) => `Interstitial: $${((prng(s) % 30 + 5) / 10).toFixed(2)} → $${((prng(s) % 30 + 10) / 10).toFixed(2)}`,
                            (s) => `${networks[prng(s + 1) % networks.length]} moved to position #${prng(s) % 3 + 1}`,
                            (s) => `Tier 1 countries, ${['Banner', 'Interstitial', 'Rewarded'][prng(s) % 3]} format`,
                          ];
                          for (let d = 40 + (h % 25); d < daysDiff; d += 50 + prng(h + d * 7) % 40) {
                            const idx = prng(h + d) % wfActions.length;
                            push(d, 'monetization', wfActions[idx], wfDetails[idx](h + d), mgrNames[prng(h + d * 3) % mgrNames.length]);
                          }

                          // A/B tests every ~120 days
                          const testNames = ['Interstitial cap', 'Banner refresh rate', 'Reward frequency', 'Floor price optimization', 'Cross-promo placement', 'Ad frequency cap', 'Reward cooldown', 'Banner position', 'Mediation priority', 'GDPR consent flow'];
                          let testIdx = 0;
                          for (let d = 55 + (h % 30); d < daysDiff; d += 100 + prng(h + d * 11) % 60) {
                            const tName = testNames[(h + testIdx) % testNames.length];
                            const variants = [2, 3][prng(h + d) % 2];
                            const dur = 10 + prng(h + d) % 18;
                            const mgrAuthor = mgrNames[prng(h + d * 5) % mgrNames.length];
                            push(d, 'ab_test', `A/B test started: "${tName}"`, `${variants} variants, ${variants === 2 ? '50/50' : 'equal'} split`, mgrAuthor);
                            const winVar = ['A', 'B', 'C'][prng(h + d + 1) % variants];
                            const delta = 3 + prng(h + d + 2) % 15;
                            const metric = ['revenue', 'eCPM', 'fill rate', 'ARPDAU'][prng(h + d + 3) % 4];
                            push(d + dur, 'ab_test', `A/B test completed: "${tName}"`, `\u2192 Variant ${winVar} wins (+${delta}% ${metric})`, mgrAuthor);
                            testIdx++;
                          }

                          // Alerts (revenue / fill rate) every ~130 days
                          const alertReasons = ['Pangle outage', 'AdMob policy update', 'Unity Ads timeout', 'Network config sync issue', 'Regional traffic drop', 'Seasonal traffic shift', 'Bidding API error'];
                          for (let d = 80 + (h % 40); d < daysDiff; d += 110 + prng(h + d * 13) % 60) {
                            const isRevenue = prng(h + d) % 2 === 0;
                            if (isRevenue) {
                              push(d, 'alert', `Revenue -${18 + prng(h + d) % 30}% vs 7d avg`, null, 'auto', { isWarning: true });
                            } else {
                              push(d, 'alert', `Fill rate drop: -${10 + prng(h + d) % 20}% on ${['Banner', 'Interstitial', 'Rewarded'][prng(h + d) % 3]}`, null, 'auto', { isWarning: true });
                            }
                            const resolveDelay = 1 + prng(h + d + 1) % 3;
                            push(d + resolveDelay, 'alert', `Resolved: ${alertReasons[prng(h + d + 2) % alertReasons.length]}`, null, prng(h + d) % 3 === 0 ? 'auto' : mgrNames[prng(h + d + 3) % mgrNames.length], { isResolved: true });
                          }

                          // Manager changes every ~200 days
                          let prevMgr = initialMgr;
                          for (let d = 100 + (h % 50); d < daysDiff; d += 160 + prng(h + d * 17) % 80) {
                            const nextMgr = mgrNames[prng(h + d * 19) % mgrNames.length];
                            if (nextMgr !== prevMgr) {
                              push(d, 'people', `Manager changed: ${prevMgr.split(' ')[0]} \u2192 ${nextMgr.split(' ')[0]}`, null, 'Admin');
                              prevMgr = nextMgr;
                            }
                          }

                          // Finance events every ~180 days
                          let curComm = commission;
                          for (let d = 200 + (h % 60); d < daysDiff; d += 150 + prng(h + d * 23) % 80) {
                            const ev = prng(h + d) % 3;
                            if (ev === 0) {
                              const newComm = Math.max(5, curComm - 1 - prng(h + d) % 3);
                              push(d, 'finance', `Commission changed: ${curComm}% \u2192 ${newComm}%`, 'Performance tier upgrade', 'Admin');
                              curComm = newComm;
                            } else if (ev === 1) {
                              const types = ['Standard', 'Basic', 'Starter', 'Premium', 'Enterprise', 'Growth'];
                              push(d, 'finance', `Client type changed: ${types[prng(h + d) % 3]} \u2192 ${types[3 + prng(h + d + 1) % 3]}`, null, 'Admin');
                            } else {
                              const amt = (prng(h + d) % 20000) + 500;
                              push(d, 'finance', `Payout: $${amt.toLocaleString()}`, null, 'auto');
                            }
                          }

                          // Ad format enables every ~150 days
                          const formats = ['Rewarded Interstitial', 'App Open', 'Native Ads', 'MRec Banner', 'Collapsible Banner', 'Rewarded Playable'];
                          let fmtIdx = 0;
                          for (let d = 180 + (h % 50); d < daysDiff; d += 130 + prng(h + d * 29) % 60) {
                            push(d, 'monetization', `Ad format enabled: ${formats[(h + fmtIdx) % formats.length]}`, null, mgrNames[prng(h + d) % mgrNames.length]);
                            fmtIdx++;
                          }

                          // Network add/remove every ~100 days
                          for (let d = 250 + (h % 40); d < daysDiff; d += 90 + prng(h + d * 31) % 50) {
                            const net = networks[prng(h + d) % networks.length];
                            if (prng(h + d) % 3 === 0) {
                              push(d, 'monetization', `Network removed: ${net}`, 'Low fill rate in target geos', mgrNames[prng(h + d + 1) % mgrNames.length]);
                            } else {
                              push(d, 'monetization', `Network added: ${net}`, ['Server bidding', 'Waterfall', 'Hybrid'][prng(h + d + 2) % 3], mgrNames[prng(h + d + 1) % mgrNames.length]);
                            }
                          }

                          // Server bidding toggles
                          push(190 + (h % 50), 'monetization', 'Server bidding enabled for all networks', null, mgrNames[(h * 7) % mgrNames.length]);

                          // Sort descending
                          allEvents.sort((a, b) => b.date - a.date);

                          // Apply period filter
                          const periodDays = { '30d': 30, '90d': 90, '1y': 365, 'all': Infinity }[historyPeriodFilter] || 90;
                          const cutoff = periodDays === Infinity ? new Date(0) : addD(now, -periodDays);
                          const afterPeriod = allEvents.filter(e => e.date >= cutoff);

                          // Apply event type filter
                          const afterType = historyEventFilter === 'all' ? afterPeriod : afterPeriod.filter(e => e.type === historyEventFilter);

                          // Collect unique authors
                          const allAuthors = [...new Set(allEvents.map(e => e.author))].sort();

                          // Apply author filter
                          const filtered = historyAuthorFilter === 'all' ? afterType : afterType.filter(e => e.author === historyAuthorFilter);

                          // Group by month
                          const groups = [];
                          let currentGroup = null;
                          filtered.forEach(ev => {
                            const key = ev.date.toLocaleString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
                            if (!currentGroup || currentGroup.key !== key) {
                              currentGroup = { key, events: [] };
                              groups.push(currentGroup);
                            }
                            currentGroup.events.push(ev);
                          });

                          // Summary stats (from all events, not filtered)
                          const totalDays = daysDiff;
                          const configChanges = allEvents.filter(e => e.type === 'monetization').length;
                          const abTests = allEvents.filter(e => e.type === 'ab_test' && e.title.includes('started')).length;
                          const mgrChanges = allEvents.filter(e => e.title.includes('Manager changed')).length;
                          const incidents = allEvents.filter(e => e.isWarning).length;

                          // Event type styles
                          const typeStyles = {
                            lifecycle: { color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/25', icon: '●' },
                            integration: { color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/25', icon: '⚡' },
                            monetization: { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/25', icon: '💰' },
                            ab_test: { color: 'text-cyan-400', bg: 'bg-cyan-500/15 border-cyan-500/25', icon: '⚗' },
                            people: { color: 'text-indigo-400', bg: 'bg-indigo-500/15 border-indigo-500/25', icon: '👤' },
                            finance: { color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/25', icon: '₿' },
                            alert: { color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/25', icon: '⚠' },
                          };

                          const typeLabels = {
                            lifecycle: 'Lifecycle', integration: 'Integration', monetization: 'Monetization',
                            ab_test: 'A/B Tests', people: 'People', finance: 'Finance', alert: 'Alerts',
                          };

                          return (
                            <div className="space-y-4">
                              {/* Filters */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <select value={historyEventFilter} onChange={(e) => setHistoryEventFilter(e.target.value)}
                                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer">
                                  <option value="all">All events</option>
                                  {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                                <select value={historyAuthorFilter} onChange={(e) => setHistoryAuthorFilter(e.target.value)}
                                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer">
                                  <option value="all">All authors</option>
                                  {allAuthors.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                                <select value={historyPeriodFilter} onChange={(e) => setHistoryPeriodFilter(e.target.value)}
                                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer">
                                  <option value="30d">Last 30 days</option>
                                  <option value="90d">Last 90 days</option>
                                  <option value="1y">Last year</option>
                                  <option value="all">All time</option>
                                </select>
                                <span className="text-[10px] text-slate-600 ml-auto">{filtered.length} events</span>
                              </div>

                              {/* Timeline */}
                              {groups.length === 0 && (
                                <div className="py-12 text-center text-slate-500 text-xs">No events match your filters</div>
                              )}
                              {groups.map(group => (
                                <div key={group.key}>
                                  {/* Month separator */}
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="h-px flex-1 bg-slate-700/50" />
                                    <span className="text-[10px] font-semibold text-slate-500 tracking-wider">{group.key}</span>
                                    <div className="h-px flex-1 bg-slate-700/50" />
                                  </div>
                                  {/* Events */}
                                  <div className="space-y-0">
                                    {group.events.map((ev, idx) => {
                                      const st = ev.isResolved
                                        ? { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/25', icon: '✓' }
                                        : ev.isWarning
                                          ? { color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/25', icon: '⚠' }
                                          : typeStyles[ev.type] || typeStyles.lifecycle;
                                      const dayStr = ev.date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
                                      return (
                                        <div key={idx} className="flex items-start gap-3 py-2 group/evt hover:bg-slate-800/30 rounded-lg px-2 -mx-2 transition-colors">
                                          {/* Date */}
                                          <div className="w-14 shrink-0 text-[11px] text-slate-500 pt-0.5 text-right">{dayStr}</div>
                                          {/* Timeline dot + line */}
                                          <div className="flex flex-col items-center shrink-0 pt-1">
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${st.bg}`}>
                                              <span className={st.color}>{st.icon}</span>
                                            </div>
                                            {idx < group.events.length - 1 && <div className="w-px h-full min-h-[12px] bg-slate-700/40 mt-1" />}
                                          </div>
                                          {/* Content */}
                                          <div className="flex-1 min-w-0 pt-0.5">
                                            <div className="text-[11px] text-slate-200">{ev.title}</div>
                                            {ev.detail && <div className="text-[10px] text-slate-500 mt-0.5">{ev.detail}</div>}
                                          </div>
                                          {/* Author */}
                                          <div className="shrink-0 pt-0.5">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${ev.author === 'auto' ? 'bg-slate-700/50 text-slate-500' : 'bg-slate-700/30 text-slate-400'}`}>
                                              {ev.author === 'auto' ? 'auto' : ev.author.split(' ')[0]}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}

                              {/* Summary */}
                              <div className="mt-4 pt-3 border-t border-slate-700/50">
                                <div className="text-[10px] text-slate-500 flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-slate-400">Summary:</span>
                                  <span>{totalDays} days</span>
                                  <span className="text-slate-700">·</span>
                                  <span>{configChanges} config changes</span>
                                  <span className="text-slate-700">·</span>
                                  <span>{abTests} A/B tests</span>
                                  <span className="text-slate-700">·</span>
                                  <span>{mgrChanges} manager changes</span>
                                  <span className="text-slate-700">·</span>
                                  <span>{incidents} incidents</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Customer popup modal */}
              {adminSelectedCustomerId && (() => {
                const cust = adminCustomers.find(c => c.id === adminSelectedCustomerId);
                if (!cust) return null;
                const custApps = appsWithOverrides.filter(a => a.userId === adminSelectedCustomerId);
                const custMgr = adminManagers.find(m => m.id === cust.managerId);
                const iosCount = custApps.filter(a => a.platform === 'ios').length;
                const androidCount = custApps.filter(a => a.platform === 'android').length;
                const activeCount = custApps.filter(a => a.status === 'active').length;
                const pausedCount = custApps.filter(a => a.status === 'paused').length;
                const pendingCount = custApps.filter(a => a.status === 'pending').length;
                const reviewCount = custApps.filter(a => a.status === 'review').length;
                return (
                  <>
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setAdminSelectedCustomerId(null)} />
                    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] max-h-[85vh] bg-slate-900 border border-slate-600 rounded-2xl shadow-2xl z-50 flex flex-col">
                      {/* Header */}
                      <div className="shrink-0 border-b border-slate-700 px-5 py-4 flex items-center justify-between rounded-t-2xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-sm font-bold text-white shrink-0">
                            {cust.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="text-sm text-slate-100 font-semibold">{cust.name}</div>
                            <div className="text-[10px] text-slate-500">ID #{cust.id} · {custApps.length} apps · since {cust.onboardingDate}</div>
                          </div>
                        </div>
                        <button onClick={() => setAdminSelectedCustomerId(null)} className="text-slate-500 hover:text-slate-200 transition-colors p-1">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                      </div>

                      {/* Body */}
                      <div className="overflow-y-auto p-5 space-y-4">
                        {/* Stats row */}
                        <div className="grid grid-cols-4 gap-2">
                          <div className="p-2.5 bg-slate-800/60 rounded-lg border border-slate-700 text-center">
                            <div className="text-lg font-semibold text-slate-100">{custApps.length}</div>
                            <div className="text-[10px] text-slate-500">Total Apps</div>
                          </div>
                          <div className="p-2.5 bg-slate-800/60 rounded-lg border border-slate-700 text-center">
                            <div className="text-lg font-semibold text-emerald-400">{androidCount}</div>
                            <div className="text-[10px] text-slate-500">Android</div>
                          </div>
                          <div className="p-2.5 bg-slate-800/60 rounded-lg border border-slate-700 text-center">
                            <div className="text-lg font-semibold text-slate-300">{iosCount}</div>
                            <div className="text-[10px] text-slate-500">iOS</div>
                          </div>
                          <div className="p-2.5 bg-slate-800/60 rounded-lg border border-slate-700 text-center">
                            <div className="text-lg font-semibold text-emerald-400">{activeCount}</div>
                            <div className="text-[10px] text-slate-500">Active</div>
                          </div>
                        </div>

                        {/* Manager assignment (bulk) */}
                        <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700">
                          <div className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider mb-2">Account Manager <span className="normal-case text-slate-600">(applies to all apps)</span></div>
                          <div className="grid grid-cols-2 gap-1">
                            {adminManagers.map(m => (
                              <button
                                key={m.id}
                                onClick={() => reassignCustomerManager(cust.id, m.id)}
                                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                                  m.id === cust.managerId ? 'bg-blue-600/15 text-blue-400 ring-1 ring-blue-500/30' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                                }`}
                              >
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-[7px] font-bold text-white shrink-0">
                                  {m.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span className="truncate">{m.name}</span>
                                {m.id === cust.managerId && <span className="text-blue-400 ml-auto">&#10003;</span>}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Status summary */}
                        {(pausedCount > 0 || pendingCount > 0 || reviewCount > 0) && (
                          <div className="flex gap-2 text-[10px]">
                            {activeCount > 0 && <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">{activeCount} active</span>}
                            {pausedCount > 0 && <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">{pausedCount} paused</span>}
                            {pendingCount > 0 && <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20">{pendingCount} pending</span>}
                            {reviewCount > 0 && <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/20">{reviewCount} review</span>}
                          </div>
                        )}

                        {/* Apps list */}
                        <div>
                          <div className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider mb-2">Apps ({custApps.length})</div>
                          <div className="bg-slate-800/40 border border-slate-700 rounded-lg overflow-hidden">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-slate-700 bg-slate-800/60">
                                  <th className="text-left py-2 px-3 text-slate-500 font-medium">App</th>
                                  <th className="text-center py-2 px-2 text-slate-500 font-medium w-8">OS</th>
                                  <th className="text-left py-2 px-3 text-slate-500 font-medium w-16">Status</th>
                                  <th className="text-left py-2 px-3 text-slate-500 font-medium w-20">Added</th>
                                </tr>
                              </thead>
                              <tbody>
                                {custApps.map(app => {
                                  const sd = storeData[app.bundleId];
                                  return (
                                    <tr key={app.bundleId}
                                      onClick={() => { setAdminSelectedCustomerId(null); setAdminSelectedApp(app.bundleId); }}
                                      className="border-b border-slate-700/20 hover:bg-slate-700/20 cursor-pointer transition-colors">
                                      <td className="py-1.5 px-3">
                                        <div className="flex items-center gap-2">
                                          {sd?.iconUrl ? (
                                            <img src={sd.iconUrl} alt="" className="w-5 h-5 rounded shrink-0" loading="lazy" />
                                          ) : (
                                            <div className="w-5 h-5 rounded bg-slate-700/40 flex items-center justify-center shrink-0"><PlatformIcon platform={app.platform} size={10} /></div>
                                          )}
                                          <div className="min-w-0">
                                            {sd?.appName ? (
                                              <div className="text-slate-300 truncate max-w-[250px]">{sd.appName}</div>
                                            ) : null}
                                            <div className="text-[10px] font-mono text-slate-500 truncate max-w-[250px]">{app.bundleId}</div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-1.5 px-2 text-center"><PlatformIcon platform={app.platform} size={10} /></td>
                                      <td className="py-1.5 px-3">
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${statusColors[app.status] || 'text-slate-400'}`}>{app.status}</span>
                                      </td>
                                      <td className="py-1.5 px-3 text-slate-500 text-[10px]">{app.dateAdded}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </>
          );
        })()}

        {activeNavItem === 'analytics' && <>
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
            {/* Quick View Header: App chip selector + Period Bar */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              {/* Left: App chip selector */}
              <div className="relative">
                <button
                  onClick={() => setShowAppSelector(!showAppSelector)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/25 hover:bg-blue-500/25 cursor-pointer"
                >
                  App: {selectedApp === 'all' ? 'All Apps' : apps.find(a => a.id === selectedApp)?.name}
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
                          onClick={() => { setSelectedApp(app.id); setShowAppSelector(false); setAppSelectorSearch(''); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-800 ${selectedApp === app.id ? 'text-blue-400 bg-slate-800/50' : 'text-slate-300'}`}
                        >
                          {app.name}
                          {selectedApp === app.id && <span className="ml-auto text-blue-500">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Period Bar — inline buttons */}
              <div className="flex bg-slate-800 rounded-lg p-0.5 gap-0.5">
                {qvPeriodOptions.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setQvPeriod(p.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium ${qvPeriod === p.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* B1: Metric Cards — L1: 4 cards */}
            {(() => {
              const cards = qvCardDefs['L1'] || [];
              const vals = getQvCardValues(selectedApp);
              return (
                <div className="grid gap-3 mb-6 grid-cols-5">
                  {cards.map(card => {
                    const cur = vals.current[card.key];
                    const prev = vals.previous[card.key];
                    const hasCur = cur != null && cur !== undefined;
                    const hasPrev = prev != null && prev !== undefined;
                    const delta = hasCur && hasPrev && prev !== 0 ? ((cur - prev) / prev * 100) : 0;
                    const isUp = delta >= 0;
                    return (
                      <div
                        key={card.id}
                        className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition"
                      >
                        <div className="text-slate-400 text-xs uppercase tracking-wider" title={metricTooltips[card.id] ? `${metricTooltips[card.id].desc}\n= ${metricTooltips[card.id].formula}` : undefined}>{card.label}</div>
                        <div className="text-xl font-bold text-white mt-1">{hasCur ? card.format(cur) : '--'}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className={`text-xs font-medium ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isUp ? '+' : ''}{delta.toFixed(1)}%
                          </span>
                          <span className={`text-[10px] ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>{isUp ? '▲' : '▼'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* B2: Trend Chart + Revenue by Network */}
            {(() => {
              const trend = getQvTrendData(selectedApp);
              const numDays = qvTrendDays[qvPeriod] || 7;
              // Network breakdown
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
              return (
                <div className="space-y-4 mb-6">
                  {/* Revenue Trend (Daily) — single line */}
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h4 className="text-sm font-medium text-slate-300">Revenue Trend (Daily)</h4>
                      <div className="text-[10px] text-slate-500">{numDays} days · {selectedApp === 'all' ? 'All Apps' : apps.find(a => a.id === selectedApp)?.name}</div>
                    </div>
                    {(() => {
                      const lineColor = '#3b82f6';
                      const lineName = selectedApp === 'all' ? 'All Apps' : apps.find(a => a.id === selectedApp)?.name || selectedApp;
                      const allVals = trend.map(d => d.value);
                      const gMin = Math.min(...allVals);
                      const gMax = Math.max(...allVals, 1);
                      const gFloor = Math.floor(gMin * 0.85);
                      const gRange = gMax - gFloor || 1;
                      const gLines = 4;
                      const gVals = Array.from({ length: gLines + 1 }, (_, i) => gFloor + (gRange * i / gLines));

                      const W = 900, H = 200, padL = 52, padR = 12, padT = 16, padB = 20;
                      const cW = W - padL - padR, cH = H - padT - padB;

                      const pts = trend.map((d, i) => ({
                        x: padL + (trend.length > 1 ? (i / (trend.length - 1)) * cW : cW / 2),
                        y: padT + cH - ((d.value - gFloor) / gRange) * cH,
                        value: d.value,
                        label: d.label,
                      }));
                      const areaPath = pts.length > 0 ? `M${pts.map(p => `${p.x},${p.y}`).join(' L')} L${pts[pts.length - 1].x},${padT + cH} L${pts[0].x},${padT + cH} Z` : '';

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
                            {/* Line + area */}
                            <path d={areaPath} fill={lineColor} fillOpacity="0.06" />
                            <polyline fill="none" stroke={lineColor} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points={pts.map(p => `${p.x},${p.y}`).join(' ')} />
                            {pts.map((p, i) => (
                              <g key={i}>
                                <circle cx={p.x} cy={p.y} r="3.5" fill="#1e293b" stroke={lineColor} strokeWidth="1.5" />
                                <title>{`${lineName} · ${p.label}: $${p.value.toLocaleString()}`}</title>
                              </g>
                            ))}
                            {/* X-axis */}
                            {trend.map((d, i) => {
                              const x = padL + (trend.length > 1 ? (i / (trend.length - 1)) * cW : cW / 2);
                              return <text key={i} x={x} y={H - 3} fill="#64748b" fontSize="9" textAnchor="middle">{d.label}</text>;
                            })}
                          </svg>
                          {/* Legend */}
                          <div className="flex items-center gap-5 mt-3 pt-3 border-t border-slate-700/50">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-0.5 rounded" style={{ backgroundColor: lineColor }} />
                              <span className="text-[11px] text-slate-400">{lineName}</span>
                              <span className="text-[11px] text-slate-300 font-medium">${trend.reduce((s, d) => s + d.value, 0).toLocaleString()}</span>
                            </div>
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

                      {/* App filter chip */}
                      {activeReportFilters.includes('app') && (
                        <div className="relative">
                          <button
                            onClick={() => { setShowAppSelector(!showAppSelector); setAppSelectorSearch(''); }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/25 hover:bg-blue-500/25 cursor-pointer"
                          >
                            App: {apps.find(a => a.id === selectedApp)?.name || selectedApp}
                            <span className="text-blue-500">▾</span>
                            <button onClick={(e) => { e.stopPropagation(); setActiveReportFilters(activeReportFilters.filter(f => f !== 'app')); setSelectedApp('all'); }} className="hover:text-blue-200 ml-0.5">×</button>
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
                                    {app.name}
                                    {selectedApp === app.id && <span className="ml-auto text-blue-500">✓</span>}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Country filter chip */}
                      {activeReportFilters.includes('country') && (
                        <div className="relative">
                          <button
                            onClick={() => setOpenFilterValue(openFilterValue === 'country' ? null : 'country')}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/25 hover:bg-blue-500/25 cursor-pointer"
                          >
                            Country: {filterCountry === 'all' ? 'All' : filterCountry}
                            <span className="text-blue-500">▾</span>
                            <button onClick={(e) => { e.stopPropagation(); setActiveReportFilters(activeReportFilters.filter(f => f !== 'country')); setFilterCountry('all'); }} className="hover:text-blue-200 ml-0.5">×</button>
                          </button>
                          {openFilterValue === 'country' && (
                            <div className="absolute left-0 top-full mt-1 bg-slate-900 border border-slate-600 rounded-lg shadow-xl z-50 min-w-[160px] max-h-48 overflow-y-auto">
                              {countries.map(c => (
                                <button
                                  key={c}
                                  onClick={() => { setFilterCountry(c); setOpenFilterValue(null); }}
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-800 ${filterCountry === c ? 'text-blue-400 bg-slate-800/50' : 'text-slate-300'}`}
                                >
                                  {c === 'all' ? 'All countries' : c}
                                  {filterCountry === c && <span className="ml-auto text-blue-500">✓</span>}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Manager filter chip */}
                      {activeReportFilters.includes('manager') && (
                        <div className="relative">
                          <button
                            onClick={() => { setShowManagerDropdown(!showManagerDropdown); setManagerDropdownSearch(''); setShowCustomerDropdown(false); setShowDateCreatedDropdown(false); }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/25 hover:bg-amber-500/25 cursor-pointer"
                          >
                            Manager: {filterManager !== 'all' ? adminManagers.find(m => m.id === filterManager)?.name || filterManager : 'All'}
                            <span className="text-amber-500">▾</span>
                            <button onClick={(e) => { e.stopPropagation(); setActiveReportFilters(activeReportFilters.filter(f => f !== 'manager')); setFilterManager('all'); }} className="hover:text-amber-200 ml-0.5">×</button>
                          </button>
                          {showManagerDropdown && (
                            <div className="absolute left-0 top-full mt-1 bg-slate-900 border border-slate-600 rounded-lg shadow-xl z-50 min-w-[220px]">
                              <div className="p-2 border-b border-slate-700">
                                <input
                                  type="text"
                                  placeholder="Search managers..."
                                  value={managerDropdownSearch}
                                  onChange={(e) => setManagerDropdownSearch(e.target.value)}
                                  className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                  autoFocus
                                />
                              </div>
                              <div className="max-h-48 overflow-y-auto">
                                <button
                                  onClick={() => { setFilterManager('all'); setShowManagerDropdown(false); }}
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-800 ${filterManager === 'all' ? 'text-amber-400 bg-slate-800/50' : 'text-slate-300'}`}
                                >
                                  All managers
                                  {filterManager === 'all' && <span className="ml-auto text-amber-500">✓</span>}
                                </button>
                                {adminManagers.filter(m => !managerDropdownSearch || m.name.toLowerCase().includes(managerDropdownSearch.toLowerCase())).map(mgr => {
                                  const mgrCustCount = adminCustomers.filter(c => c.managerId === mgr.id).length;
                                  const mgrBundleCount = adminCustomers.filter(c => c.managerId === mgr.id).reduce((s, c) => s + c.bundles.length, 0);
                                  return (
                                    <button
                                      key={mgr.id}
                                      onClick={() => { setFilterManager(mgr.id); setFilterCustomer('all'); setShowManagerDropdown(false); }}
                                      className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-800 ${filterManager === mgr.id ? 'text-amber-400 bg-slate-800/50' : 'text-slate-300'}`}
                                    >
                                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-[7px] font-bold text-white shrink-0">
                                        {mgr.name.split(' ').map(n => n[0]).join('')}
                                      </div>
                                      <div>
                                        <div>{mgr.name}</div>
                                        <div className="text-[10px] text-slate-500">{mgrCustCount} customers · {mgrBundleCount} bundles</div>
                                      </div>
                                      {filterManager === mgr.id && <span className="ml-auto text-amber-500">✓</span>}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Customer filter chip */}
                      {activeReportFilters.includes('customer') && (
                        <div className="relative">
                          <button
                            onClick={() => { setShowCustomerDropdown(!showCustomerDropdown); setCustomerDropdownSearch(''); setShowManagerDropdown(false); setShowDateCreatedDropdown(false); }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 cursor-pointer"
                          >
                            Customer: {filterCustomer !== 'all' ? adminCustomers.find(c => c.id === Number(filterCustomer))?.name || filterCustomer : 'All'}
                            <span className="text-emerald-500">▾</span>
                            <button onClick={(e) => { e.stopPropagation(); setActiveReportFilters(activeReportFilters.filter(f => f !== 'customer')); setFilterCustomer('all'); }} className="hover:text-emerald-200 ml-0.5">×</button>
                          </button>
                          {showCustomerDropdown && (() => {
                            const visibleCustomers = adminCustomers
                              .filter(c => filterManager === 'all' || c.managerId === filterManager)
                              .filter(c => !customerDropdownSearch || c.name.toLowerCase().includes(customerDropdownSearch.toLowerCase()) || String(c.id).includes(customerDropdownSearch));
                            const shownCustomers = visibleCustomers.slice(0, 50);
                            return (
                              <div className="absolute left-0 top-full mt-1 bg-slate-900 border border-slate-600 rounded-lg shadow-xl z-50 w-[320px]">
                                <div className="p-2 border-b border-slate-700">
                                  <input
                                    type="text"
                                    placeholder="Search by name or ID..."
                                    value={customerDropdownSearch}
                                    onChange={(e) => setCustomerDropdownSearch(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                    autoFocus
                                  />
                                </div>
                                <div className="max-h-[280px] overflow-y-auto">
                                  <button
                                    onClick={() => { setFilterCustomer('all'); setShowCustomerDropdown(false); }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-800 ${filterCustomer === 'all' ? 'text-emerald-400 bg-slate-800/50' : 'text-slate-300'}`}
                                  >
                                    All customers
                                    {filterCustomer === 'all' && <span className="ml-auto text-emerald-500">✓</span>}
                                  </button>
                                  {shownCustomers.map(cust => {
                                    const mgr = adminManagers.find(m => m.id === cust.managerId);
                                    return (
                                      <button
                                        key={cust.id}
                                        onClick={() => { setFilterCustomer(String(cust.id)); setShowCustomerDropdown(false); }}
                                        className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-800 ${filterCustomer === String(cust.id) ? 'text-emerald-400 bg-slate-800/50' : 'text-slate-300'}`}
                                      >
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-mono text-slate-500 text-[10px]">#{cust.id}</span>
                                            <span>{cust.name}</span>
                                          </div>
                                          <div className="text-[10px] text-slate-500 truncate">{mgr?.name} · {cust.bundles.length} bundles · {cust.bundles[0]}{cust.bundles.length > 1 ? `, +${cust.bundles.length - 1}` : ''}</div>
                                        </div>
                                        {filterCustomer === String(cust.id) && <span className="ml-auto text-emerald-500 shrink-0">✓</span>}
                                      </button>
                                    );
                                  })}
                                </div>
                                <div className="px-3 py-1.5 border-t border-slate-700 text-[10px] text-slate-500">
                                  {visibleCustomers.length > 50 ? `Showing 50 of ${visibleCustomers.length} — type to search` : `${visibleCustomers.length} customers`}{filterManager !== 'all' ? ` (filtered by ${adminManagers.find(m => m.id === filterManager)?.name})` : ''}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* Date Created filter chip */}
                      {activeReportFilters.includes('dateCreated') && (
                        <div className="relative">
                          <button
                            onClick={() => { setShowDateCreatedDropdown(!showDateCreatedDropdown); setShowManagerDropdown(false); setShowCustomerDropdown(false); }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-500/15 text-purple-400 border border-purple-500/25 hover:bg-purple-500/25 cursor-pointer"
                          >
                            Date Created{filterDateCreatedFrom || filterDateCreatedTo ? `: ${filterDateCreatedFrom || '...'} — ${filterDateCreatedTo || '...'}` : ': All'}
                            <span className="text-purple-500">▾</span>
                            <button onClick={(e) => { e.stopPropagation(); setActiveReportFilters(activeReportFilters.filter(f => f !== 'dateCreated')); setFilterDateCreatedFrom(''); setFilterDateCreatedTo(''); }} className="hover:text-purple-200 ml-0.5">×</button>
                          </button>
                          {showDateCreatedDropdown && (
                            <div className="absolute left-0 top-full mt-1 bg-slate-900 border border-slate-600 rounded-lg shadow-xl z-50 p-3 min-w-[260px]">
                              <div className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider mb-2">Date Created Range</div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex-1">
                                  <label className="text-[10px] text-slate-500 mb-0.5 block">From</label>
                                  <input
                                    type="date"
                                    value={filterDateCreatedFrom}
                                    onChange={(e) => setFilterDateCreatedFrom(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                  />
                                </div>
                                <div className="flex-1">
                                  <label className="text-[10px] text-slate-500 mb-0.5 block">To</label>
                                  <input
                                    type="date"
                                    value={filterDateCreatedTo}
                                    onChange={(e) => setFilterDateCreatedTo(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-1.5 mb-2">
                                <button onClick={() => { setFilterDateCreatedFrom('2026-01-01'); setFilterDateCreatedTo('2026-12-31'); }} className="px-2 py-1 rounded bg-slate-800 border border-slate-600 text-[10px] text-slate-300 hover:bg-slate-700">2026</button>
                                <button onClick={() => { setFilterDateCreatedFrom('2025-01-01'); setFilterDateCreatedTo('2025-12-31'); }} className="px-2 py-1 rounded bg-slate-800 border border-slate-600 text-[10px] text-slate-300 hover:bg-slate-700">2025</button>
                                <button onClick={() => { setFilterDateCreatedFrom('2024-01-01'); setFilterDateCreatedTo('2024-12-31'); }} className="px-2 py-1 rounded bg-slate-800 border border-slate-600 text-[10px] text-slate-300 hover:bg-slate-700">2024</button>
                                <button onClick={() => { setFilterDateCreatedFrom(''); setFilterDateCreatedTo(''); }} className="px-2 py-1 rounded bg-slate-800 border border-slate-600 text-[10px] text-slate-400 hover:bg-slate-700">Clear</button>
                              </div>
                              <button
                                onClick={() => setShowDateCreatedDropdown(false)}
                                className="w-full px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-xs text-white font-medium"
                              >
                                Apply
                              </button>
                              {(filterDateCreatedFrom || filterDateCreatedTo) && (() => {
                                const matched = adminCustomers.filter(c => {
                                  if (filterDateCreatedFrom && c.onboardingDate < filterDateCreatedFrom) return false;
                                  if (filterDateCreatedTo && c.onboardingDate > filterDateCreatedTo) return false;
                                  return true;
                                });
                                return <div className="mt-2 text-[10px] text-slate-500">{matched.length} customers matched · {matched.reduce((s, c) => s + c.bundles.length, 0)} bundles</div>;
                              })()}
                            </div>
                          )}
                        </div>
                      )}

                      {/* + Filter button with dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setShowFilterPickerDropdown(!showFilterPickerDropdown)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-700/50 text-slate-400 hover:bg-slate-700 border border-slate-600/50"
                        >
                          + Filter
                        </button>
                        {showFilterPickerDropdown && (
                          <div className="absolute left-0 top-full mt-1 bg-slate-900 border border-slate-600 rounded-lg shadow-xl z-50 min-w-[200px] py-1">
                            {[
                              { id: 'app', label: 'App' },
                              { id: 'country', label: 'Country' },
                              { id: 'manager', label: 'Manager' },
                              { id: 'customer', label: 'Customer' },
                              { id: 'dateCreated', label: 'Date Created' },
                            ].filter(f => !activeReportFilters.includes(f.id)).map(f => (
                              <button
                                key={f.id}
                                onClick={() => { setActiveReportFilters([...activeReportFilters, f.id]); setShowFilterPickerDropdown(false); }}
                                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                              >
                                {f.label}
                              </button>
                            ))}
                            {activeReportFilters.length >= 5 && (
                              <div className="px-3 py-2 text-[10px] text-slate-500">All filters added</div>
                            )}
                          </div>
                        )}
                      </div>
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
                    onClick={() => { setReportsSplits(['date']); setSelectedMetrics(['dau', 'revenue', 'sessions', 'd1_retention', 'd7_retention', 'impr_per_dau']); setFilterCountry('all'); setReportsSearch(''); setFilterManager('all'); setFilterCustomer('all'); setFilterDateCreatedFrom(''); setFilterDateCreatedTo(''); setActiveReportFilters([]); setSelectedApp('all'); }}
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

        </>}

        {/* ===== Profile ===== */}
        {activeNavItem === 'profile' && (
          <div>
            {/* Profile Tabs */}
            <div className="flex items-center gap-1 mb-6 bg-slate-800 rounded-xl p-1 w-fit">
              {[
                { id: 'personal', label: 'Personal Data' },
                { id: 'payment', label: 'Payment Details' },
                { id: 'security', label: 'Security' },
                { id: 'apikeys', label: 'API Keys' },
              ].map(t => (
                <button key={t.id} onClick={() => { setProfileTab(t.id); setProfileEditing(false); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${profileTab === t.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}>{t.label}</button>
              ))}
            </div>

            {/* Tab: Personal Data */}
            {profileTab === 'personal' && (() => {
              const d = profileEditing ? profileDraft : profileData;
              const countries = ['Ukraine', 'United States', 'Germany', 'United Kingdom', 'Poland', 'Turkey', 'India', 'Brazil', 'Japan', 'South Korea'];
              const timezones = ['UTC-8 (LA)', 'UTC-5 (NY)', 'UTC+0 (London)', 'UTC+1 (Berlin)', 'UTC+2 (Kyiv)', 'UTC+3 (Istanbul)', 'UTC+5:30 (Mumbai)', 'UTC+9 (Tokyo)'];
              const messengers = ['Telegram', 'WhatsApp', 'Email'];

              const Field = ({ label, value, field, type, options, readOnly }) => (
                <div className="flex items-start py-3 border-b border-slate-800/50">
                  <div className="w-40 shrink-0 text-xs text-slate-500 pt-1">{label}</div>
                  <div className="flex-1">
                    {profileEditing && !readOnly ? (
                      type === 'select' ? (
                        <select value={value} onChange={e => setProfileDraft({ ...profileDraft, [field]: e.target.value })} disabled={profileSaving} className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-200 w-full max-w-xs focus:outline-none focus:border-blue-500">
                          {options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input type={type || 'text'} value={value} onChange={e => setProfileDraft({ ...profileDraft, [field]: e.target.value })} disabled={profileSaving} className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-200 w-full max-w-xs focus:outline-none focus:border-blue-500" />
                      )
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-200">{value}</span>
                        {field === 'email' && profileData.emailVerified && <span className="text-emerald-400 text-xs">&#10003;</span>}
                        {field === 'email' && !profileData.emailVerified && <span className="text-amber-400 text-xs">&#9888;</span>}
                      </div>
                    )}
                  </div>
                </div>
              );

              return (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
                    <span className="text-sm font-semibold text-slate-100">Personal Data</span>
                    {!profileEditing ? (
                      <button onClick={startProfileEdit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-400 hover:bg-blue-600/10 transition-colors">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={cancelProfileEdit} disabled={profileSaving} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-700 transition-colors">Cancel</button>
                        <button onClick={saveProfile} disabled={profileSaving} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50">
                          {profileSaving ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Saving...</> : 'Save'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="px-6 py-2">
                    {/* Avatar + Name row */}
                    <div className="flex items-center gap-4 py-4 border-b border-slate-800/50">
                      <div className="relative group">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xl font-bold text-white">
                          {d.firstName[0]}{d.lastName[0]}
                        </div>
                        {profileEditing && (
                          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-base font-semibold text-slate-100">{d.firstName} {d.lastName}</div>
                        <div className="text-xs text-slate-500">{d.company}</div>
                      </div>
                    </div>

                    <Field label="First Name" value={d.firstName} field="firstName" />
                    <Field label="Last Name" value={d.lastName} field="lastName" />
                    <Field label="Email" value={d.email} field="email" type="email" />
                    <Field label="Company" value={d.company} field="company" />
                    <Field label="Phone" value={d.phone} field="phone" type="tel" />
                    <Field label="Country" value={d.country} field="country" type="select" options={countries} />
                    <Field label="Preferred Messenger" value={d.messenger} field="messenger" type="select" options={messengers} />
                    <Field label="Timezone" value={d.timezone} field="timezone" type="select" options={timezones} />
                    <Field label="Language" value={d.language} field="language" type="select" options={['English']} />
                    <Field label="Registered" value={d.registered} field="registered" readOnly />
                    <Field label="Account ID" value={d.accountId} field="accountId" readOnly />
                  </div>

                  {/* Email verification warning */}
                  {!profileData.emailVerified && (
                    <div className="mx-6 mb-4 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
                      <span className="text-amber-400 text-sm">&#9888;</span>
                      <span className="text-xs text-amber-300">Email not verified.</span>
                      <button className="text-xs text-blue-400 hover:text-blue-300 ml-1">Resend verification &rarr;</button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Stubs for other profile tabs */}
            {profileTab === 'payment' && (() => {
              const d = paymentEditing ? paymentDraft : paymentData;
              const PField = ({ label, value, field, type, options, readOnly, show = true }) => {
                if (!show) return null;
                return (
                  <div className="flex items-start py-3 border-b border-slate-800/50">
                    <div className="w-40 shrink-0 text-xs text-slate-500 pt-1">{label}</div>
                    <div className="flex-1">
                      {paymentEditing && !readOnly ? (
                        type === 'select' ? (
                          <select value={value} onChange={e => setPaymentDraft({ ...paymentDraft, [field]: e.target.value })} disabled={paymentSaving} className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-200 w-full max-w-xs focus:outline-none focus:border-blue-500">
                            {options.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input type="text" value={value} onChange={e => setPaymentDraft({ ...paymentDraft, [field]: e.target.value })} disabled={paymentSaving} className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-200 w-full max-w-xs focus:outline-none focus:border-blue-500" />
                        )
                      ) : (
                        <span className="text-sm text-slate-200">{value}</span>
                      )}
                    </div>
                  </div>
                );
              };

              return (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
                    <span className="text-sm font-semibold text-slate-100">Payment Details</span>
                    {!paymentEditing ? (
                      <button onClick={startPaymentEdit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-400 hover:bg-blue-600/10 transition-colors">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={cancelPaymentEdit} disabled={paymentSaving} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-700 transition-colors">Cancel</button>
                        <button onClick={savePayment} disabled={paymentSaving} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50">
                          {paymentSaving ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Saving...</> : 'Save'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-2">
                    {/* Payment Method selector */}
                    <div className="py-4 border-b border-slate-800/50">
                      <div className="text-xs text-slate-500 mb-3">Payment Method</div>
                      <div className="flex gap-3">
                        {[
                          { id: 'bank', label: 'Bank Transfer', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg> },
                          { id: 'crypto', label: 'Crypto (USDT)', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg> },
                        ].map(m => (
                          <button
                            key={m.id}
                            onClick={() => paymentEditing && setPaymentDraft({ ...paymentDraft, method: m.id })}
                            className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors ${
                              d.method === m.id
                                ? 'border-blue-500/50 bg-blue-500/10'
                                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                            } ${paymentEditing ? 'cursor-pointer' : 'cursor-default'}`}
                          >
                            <span className={d.method === m.id ? 'text-blue-400' : 'text-slate-500'}>{m.icon}</span>
                            <div>
                              <div className="text-sm font-medium text-slate-200">{m.label}</div>
                              <div className="text-[10px] text-slate-500">{d.method === m.id ? 'Active' : 'Available'}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bank Details */}
                    {d.method === 'bank' && (
                      <div className="py-2">
                        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider pt-3 pb-1">Bank Details</div>
                        <PField label="Beneficiary" value={d.beneficiary} field="beneficiary" />
                        <PField label="IBAN" value={d.iban} field="iban" />
                        <PField label="SWIFT / BIC" value={d.swift} field="swift" />
                        <PField label="Bank" value={d.bank} field="bank" />
                        <PField label="Bank Address" value={d.bankAddress} field="bankAddress" />
                      </div>
                    )}

                    {/* Crypto Details */}
                    {d.method === 'crypto' && (
                      <div className="py-2">
                        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider pt-3 pb-1">Crypto Wallet</div>
                        <PField label="Network" value={d.cryptoNetwork} field="cryptoNetwork" type="select" options={['TRC-20', 'ERC-20']} />
                        <PField label="Wallet Address" value={d.cryptoWallet || '—'} field="cryptoWallet" />
                      </div>
                    )}

                    {/* Payment Threshold */}
                    <div className="py-2">
                      <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider pt-3 pb-1">Payment Threshold</div>
                      <PField label="Minimum payout" value={d.threshold} field="threshold" type="select" options={['$100', '$500', '$1,000', '$5,000']} />
                      <PField label="Current balance" value={d.balance} field="balance" readOnly />
                      <PField label="Next payout" value={d.nextPayout} field="nextPayout" readOnly />
                    </div>

                    {/* Tax Information */}
                    <div className="py-2">
                      <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider pt-3 pb-1">Tax Information</div>
                      <PField label="Tax ID" value={d.taxId} field="taxId" />
                      <div className="flex items-start py-3 border-b border-slate-800/50">
                        <div className="w-40 shrink-0 text-xs text-slate-500 pt-1">W-8BEN</div>
                        <div className="flex-1 flex items-center gap-2">
                          {d.w8ben === 'uploaded' && (
                            <>
                              <span className="text-emerald-400 text-xs">&#10003;</span>
                              <span className="text-sm text-slate-200">Uploaded</span>
                              <span className="text-xs text-slate-500">(expires {d.w8benExpiry})</span>
                            </>
                          )}
                          {d.w8ben === 'expired' && (
                            <>
                              <span className="text-red-400 text-xs">&#9888;</span>
                              <span className="text-sm text-red-300">Expired</span>
                            </>
                          )}
                          {d.w8ben === 'none' && (
                            <span className="text-sm text-slate-500">Not uploaded</span>
                          )}
                          <button className="ml-2 text-xs text-blue-400 hover:text-blue-300">Upload new document</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info footer */}
                  <div className="mx-6 mb-4 px-4 py-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                    <span className="text-xs text-blue-300">Changes to payment details require verification and take up to 3 business days to process.</span>
                  </div>
                </div>
              );
            })()}
            {profileTab === 'security' && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700/50">
                  <span className="text-sm font-semibold text-slate-100">Security</span>
                </div>

                <div className="px-6 py-2">
                  {/* Password */}
                  <div className="py-4 border-b border-slate-800/50">
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">Password</div>
                    {!showChangePassword ? (
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-400">Last changed: <span className="text-slate-300">14 days ago</span></div>
                        <button onClick={() => setShowChangePassword(true)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors">Change Password</button>
                      </div>
                    ) : (
                      <div className="max-w-xs space-y-3">
                        <div>
                          <label className="text-xs text-slate-500 block mb-1">Current Password</label>
                          <input type="password" value={passwordForm.current} onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 block mb-1">New Password</label>
                          <input type="password" value={passwordForm.newPw} onChange={e => setPasswordForm({ ...passwordForm, newPw: e.target.value })} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
                          <div className="text-[10px] text-slate-600 mt-1">Min 8 characters, letters + numbers</div>
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 block mb-1">Confirm Password</label>
                          <input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
                          {passwordForm.confirm && passwordForm.newPw !== passwordForm.confirm && (
                            <div className="text-[10px] text-red-400 mt-1">Passwords do not match</div>
                          )}
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => { setShowChangePassword(false); setPasswordForm({ current: '', newPw: '', confirm: '' }); }} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-700 transition-colors">Cancel</button>
                          <button
                            onClick={savePassword}
                            disabled={passwordSaving || !passwordForm.current || !passwordForm.newPw || passwordForm.newPw !== passwordForm.confirm}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50"
                          >
                            {passwordSaving ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Saving...</> : 'Save'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="py-4 border-b border-slate-800/50">
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">Two-Factor Authentication</div>
                    {!showTwoFaSetup ? (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400">Status:</span>
                            {twoFaEnabled ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                                <span>&#10003;</span> Enabled
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                                &#9888; Not enabled
                              </span>
                            )}
                          </div>
                          {!twoFaEnabled ? (
                            <button onClick={() => setShowTwoFaSetup(true)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors">Enable 2FA</button>
                          ) : (
                            <button onClick={() => { setTwoFaEnabled(false); setProfileToast('2FA disabled'); setTimeout(() => setProfileToast(null), 3000); }} className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors">Disable</button>
                          )}
                        </div>
                        {!twoFaEnabled && (
                          <div className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                            <span className="text-[11px] text-blue-300">We recommend enabling 2FA for all accounts with access to payment settings.</span>
                          </div>
                        )}
                        {twoFaEnabled && (
                          <div className="text-xs text-slate-500">Connected with authenticator app. <button className="text-blue-400 hover:text-blue-300">View backup codes</button></div>
                        )}
                      </div>
                    ) : (
                      /* 2FA Setup Flow */
                      <div className="max-w-xs">
                        {/* Step indicators */}
                        <div className="flex items-center gap-2 mb-4">
                          {[1, 2, 3].map(s => (
                            <div key={s} className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${twoFaStep >= s ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-500'}`}>{s}</div>
                              {s < 3 && <div className={`w-8 h-0.5 ${twoFaStep > s ? 'bg-blue-600' : 'bg-slate-700'}`}></div>}
                            </div>
                          ))}
                        </div>

                        {twoFaStep === 1 && (
                          <div>
                            <div className="text-xs text-slate-400 mb-3">Scan this QR code with your authenticator app:</div>
                            <div className="w-36 h-36 bg-white rounded-lg p-2 mb-3 mx-auto flex items-center justify-center">
                              <div className="w-full h-full bg-[repeating-conic-gradient(#000_0%_25%,#fff_0%_50%)] bg-[length:12px_12px] rounded opacity-80"></div>
                            </div>
                            <div className="text-[10px] text-slate-600 text-center mb-3">Google Authenticator / Authy</div>
                            <button onClick={() => setTwoFaStep(2)} className="w-full px-4 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">Next</button>
                          </div>
                        )}

                        {twoFaStep === 2 && (
                          <div>
                            <div className="text-xs text-slate-400 mb-3">Enter the 6-digit code from your app:</div>
                            <input
                              type="text" maxLength={6} value={twoFaCode} onChange={e => setTwoFaCode(e.target.value.replace(/\D/g, ''))}
                              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-lg text-center text-slate-200 tracking-[0.5em] font-mono focus:outline-none focus:border-blue-500 mb-3"
                              placeholder="000000"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => setTwoFaStep(1)} className="flex-1 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-700 transition-colors">Back</button>
                              <button onClick={() => setTwoFaStep(3)} disabled={twoFaCode.length !== 6} className="flex-1 px-4 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50">Verify</button>
                            </div>
                          </div>
                        )}

                        {twoFaStep === 3 && (
                          <div>
                            <div className="text-xs text-slate-400 mb-2">Save these backup codes in a safe place:</div>
                            <div className="bg-slate-700 rounded-lg p-3 mb-3 font-mono text-xs text-slate-300 grid grid-cols-2 gap-1">
                              {['a4f2-8b1c', 'k9d3-2e7f', 'p5h1-6j4m', 'r8n2-3c9a', 'w7t5-1b6d', 'x3k8-9f2g', 'z6m4-7h1e', 'c2j9-5a8b', 'v1p7-4d3f', 'y5s6-8k2n'].map(code => (
                                <div key={code} className="py-0.5">{code}</div>
                              ))}
                            </div>
                            <div className="flex gap-2 mb-3">
                              <button className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors">Copy All</button>
                              <button className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors">Download</button>
                            </div>
                            <button onClick={completeTwoFa} className="w-full px-4 py-2 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">Done — Enable 2FA</button>
                          </div>
                        )}

                        <button onClick={() => { setShowTwoFaSetup(false); setTwoFaStep(1); setTwoFaCode(''); }} className="w-full mt-2 text-xs text-slate-500 hover:text-slate-400 text-center">Cancel setup</button>
                      </div>
                    )}
                  </div>

                  {/* Active Sessions */}
                  <div className="py-4">
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">Active Sessions</div>
                    <div className="space-y-2">
                      {sessions.filter(s => !revokedSessions.has(s.id)).map(s => (
                        <div key={s.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-800/50">
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400">
                              {s.browser === 'Chrome' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>}
                              {s.browser === 'Safari' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>}
                              {s.browser === 'Firefox' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>}
                            </span>
                            <div>
                              <div className="text-xs text-slate-200">
                                {s.browser} &middot; {s.location}
                                {s.current && <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-medium">Current session</span>}
                              </div>
                              <div className="text-[10px] text-slate-500">{s.time}</div>
                            </div>
                          </div>
                          {!s.current && (
                            <button onClick={() => setRevokedSessions(new Set([...revokedSessions, s.id]))} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors">Revoke</button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => { setRevokedSessions(new Set(sessions.filter(s => !s.current).map(s => s.id))); setProfileToast('All other sessions revoked'); setTimeout(() => setProfileToast(null), 3000); }}
                      className="mt-3 text-xs text-slate-500 hover:text-slate-400 transition-colors"
                    >Sign out of all other sessions</button>
                  </div>
                </div>
              </div>
            )}
            {profileTab === 'apikeys' && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700/50">
                  <span className="text-sm font-semibold text-slate-100">API Keys</span>
                </div>

                <div className="px-6 py-2">
                  {/* Reporting API Key */}
                  <div className="py-4 border-b border-slate-800/50">
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">Reporting API Key</div>
                    <div className="flex items-center gap-2 mb-2">
                      <code className="flex-1 bg-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-300 select-all">
                        {apiKeyVisible ? apiKey : apiKey.substring(0, 8) + '-xxxx-xxxx-xxxx-' + apiKey.slice(-4)}
                      </code>
                      <button
                        onClick={() => setApiKeyVisible(!apiKeyVisible)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-200"
                        title={apiKeyVisible ? 'Hide' : 'Show'}
                      >
                        {apiKeyVisible ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                      <button
                        onClick={() => { navigator.clipboard.writeText(apiKey); setProfileToast('Copied!'); setTimeout(() => setProfileToast(null), 2000); }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-200"
                        title="Copy"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] text-slate-500">Created: {apiKeyCreated}</div>
                      <button onClick={() => setShowRegenerateConfirm(true)} className="text-xs text-amber-400 hover:text-amber-300 transition-colors">Regenerate</button>
                    </div>
                  </div>

                  {/* SDK Key */}
                  <div className="py-4 border-b border-slate-800/50">
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">SDK Key</div>
                    <div className="flex items-center gap-2 mb-2">
                      <code className="flex-1 bg-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-300 select-all">
                        {sdkKeyVisible ? sdkKey : sdkKey.substring(0, 12) + '····' + sdkKey.slice(-4)}
                      </code>
                      <button
                        onClick={() => setSdkKeyVisible(!sdkKeyVisible)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-200"
                        title={sdkKeyVisible ? 'Hide' : 'Show'}
                      >
                        {sdkKeyVisible ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                      <button
                        onClick={() => { navigator.clipboard.writeText(sdkKey); setProfileToast('Copied!'); setTimeout(() => setProfileToast(null), 2000); }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-200"
                        title="Copy"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-500">Created: Jun 12, 2024</div>
                  </div>

                  {/* Info */}
                  <div className="py-4">
                    <div className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-2 mb-4">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                      <span className="text-[11px] text-blue-300">SDK Key is read-only and tied to your account. Reporting API Key can be regenerated — old key will stop working immediately.</span>
                    </div>
                    <a href="#" className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
                      API Documentation &rarr;
                    </a>
                  </div>
                </div>

                {/* Regenerate Confirmation Modal */}
                {showRegenerateConfirm && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowRegenerateConfirm(false)}>
                    <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-96 p-6" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-100">Regenerate API Key?</div>
                          <div className="text-xs text-slate-400">This action cannot be undone</div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 mb-4">The old key will stop working <strong className="text-slate-300">immediately</strong>. Any integrations using the current key will break until updated.</div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setShowRegenerateConfirm(false)} className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-700 transition-colors">Cancel</button>
                        <button
                          onClick={() => {
                            const newKey = 'r' + Math.random().toString(36).substring(2, 10) + '-' + Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 14);
                            setApiKey(newKey);
                            setApiKeyCreated('Apr 2, 2026');
                            setShowRegenerateConfirm(false);
                            setApiKeyVisible(true);
                            setProfileToast('New key generated');
                            setTimeout(() => setProfileToast(null), 3000);
                          }}
                          className="px-4 py-2 rounded-lg text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                        >Regenerate</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===== Applications (client view) ===== */}
        {activeNavItem === 'apps' && !(['admin'].includes(activeNavItem)) && (() => {
          const clientApps = [
            { bundleId: '1174039276', platform: 'ios', sdkVersion: '4.6.0', sdkStatus: 'active', dateAdded: '2024-06-12', revenue7d: 1420, dau7d: 28500 },
            { bundleId: 'com.multicraft.block', platform: 'android', sdkVersion: '4.6.0', sdkStatus: 'active', dateAdded: '2024-06-15', revenue7d: 2180, dau7d: 45200 },
            { bundleId: '973082633', platform: 'ios', sdkVersion: '4.5.2', sdkStatus: 'update', dateAdded: '2024-08-03', revenue7d: 680, dau7d: 12300 },
            { bundleId: '1436151665', platform: 'ios', sdkVersion: '4.6.0', sdkStatus: 'active', dateAdded: '2025-01-10', revenue7d: 890, dau7d: 15800 },
            { bundleId: '1464689959', platform: 'ios', sdkVersion: '4.4.0', sdkStatus: 'outdated', dateAdded: '2024-11-20', revenue7d: 340, dau7d: 5600 },
            { bundleId: '1419918066', platform: 'ios', sdkVersion: '—', sdkStatus: 'pending', dateAdded: '2026-03-28', revenue7d: 0, dau7d: 0 },
          ];

          return (
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-xs text-slate-500">{clientApps.length} applications</div>
                </div>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add Application
                </button>
              </div>

              {/* App cards */}
              <div className="space-y-3">
                {clientApps.map((app, i) => {
                  const store = storeData[app.bundleId];
                  const appName = store?.appName || app.bundleId;
                  const iconUrl = store?.iconUrl;

                  return (
                    <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-colors">
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-700 shrink-0 flex items-center justify-center">
                          {iconUrl ? (
                            <img src={iconUrl} alt={appName} className="w-full h-full object-cover" />
                          ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-500"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 8h8M8 12h6M8 16h4"/></svg>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-slate-200 truncate">{appName}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${app.platform === 'ios' ? 'bg-slate-700 text-slate-300' : 'bg-emerald-900/50 text-emerald-400'}`}>
                              {app.platform === 'ios' ? 'iOS' : 'Android'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 font-mono">{app.bundleId}</div>
                        </div>

                        {/* SDK Status */}
                        <div className="text-center px-4">
                          <div className="text-[10px] text-slate-500 mb-1">SDK</div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-300 font-mono">{app.sdkVersion}</span>
                            <span className={`w-2 h-2 rounded-full ${
                              app.sdkStatus === 'active' ? 'bg-emerald-400' :
                              app.sdkStatus === 'update' ? 'bg-amber-400' :
                              app.sdkStatus === 'outdated' ? 'bg-red-400' :
                              'bg-slate-500'
                            }`} title={app.sdkStatus}></span>
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="text-center px-4">
                          <div className="text-[10px] text-slate-500 mb-1">Revenue 7d</div>
                          <div className="text-sm font-medium text-slate-200">{app.revenue7d ? '$' + app.revenue7d.toLocaleString() : '—'}</div>
                        </div>

                        <div className="text-center px-4">
                          <div className="text-[10px] text-slate-500 mb-1">DAU 7d</div>
                          <div className="text-sm font-medium text-slate-200">{app.dau7d ? app.dau7d.toLocaleString() : '—'}</div>
                        </div>

                        {/* Status badge */}
                        <div>
                          {app.sdkStatus === 'active' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live
                            </span>
                          )}
                          {app.sdkStatus === 'update' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 text-[11px] font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Update SDK
                            </span>
                          )}
                          {app.sdkStatus === 'outdated' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 text-[11px] font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Outdated
                            </span>
                          )}
                          {app.sdkStatus === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-500/15 text-slate-400 text-[11px] font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Pending
                            </span>
                          )}
                        </div>

                        {/* Arrow */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-600 shrink-0"><path d="M9 18l6-6-6-6"/></svg>
                      </div>

                      {/* Integration warning for pending */}
                      {app.sdkStatus === 'pending' && (
                        <div className="mt-3 px-4 py-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                          <span className="text-[11px] text-blue-300">SDK not integrated yet.</span>
                          <a href="#" className="text-[11px] text-blue-400 hover:text-blue-300 font-medium ml-1">Integration guide &rarr;</a>
                        </div>
                      )}

                      {/* SDK update notice */}
                      {(app.sdkStatus === 'update' || app.sdkStatus === 'outdated') && (
                        <div className="mt-3 px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400 shrink-0"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                          <span className="text-[11px] text-amber-300">SDK {app.sdkVersion} is {app.sdkStatus === 'outdated' ? 'outdated' : 'not the latest'}. Latest: 4.6.0</span>
                          <a href="#" className="text-[11px] text-amber-400 hover:text-amber-300 font-medium ml-1">Changelog &rarr;</a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ===== Payments ===== */}
        {activeNavItem === 'payments' && (
          <div>
            {/* Balance cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Available Balance', value: '$12,450.20', color: 'emerald', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
                { label: 'Pending', value: '$3,200.00', color: 'amber', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
                { label: 'Total Earned', value: '$87,640.50', color: 'blue', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
              ].map(c => (
                <div key={c.label} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-500">{c.label}</span>
                    <span className={`text-${c.color}-400`}>{c.icon}</span>
                  </div>
                  <div className={`text-2xl font-bold text-${c.color}-400`}>{c.value}</div>
                </div>
              ))}
            </div>

            {/* Payout info */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Next Payout</div>
                  <div className="text-sm font-semibold text-slate-200">~Apr 27, 2026</div>
                </div>
                <div className="w-px h-8 bg-slate-700"></div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Payment Method</div>
                  <div className="text-sm text-slate-200">Bank Transfer (Monobank)</div>
                </div>
                <div className="w-px h-8 bg-slate-700"></div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Threshold</div>
                  <div className="text-sm text-slate-200">$500</div>
                </div>
              </div>
              <button onClick={() => { setActiveNavItem('profile'); setProfileTab('payment'); }} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Edit payment details &rarr;</button>
            </div>

            {/* Payment History */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-100">Payment History</span>
                <div className="flex items-center gap-2">
                  <select className="bg-slate-700 border border-slate-600 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none">
                    <option>All time</option>
                    <option>Last 12 months</option>
                    <option>Last 6 months</option>
                    <option>Last 3 months</option>
                  </select>
                  <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:bg-slate-700 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Export
                  </button>
                </div>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-700/50 text-xs text-slate-500">
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Period</th>
                    <th className="px-4 py-3 font-medium">Method</th>
                    <th className="px-4 py-3 font-medium text-right">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { date: 'Mar 27, 2026', period: 'Feb 2026', method: 'Bank Transfer', amount: '$5,200.00', status: 'processed', ref: 'PAY-2026-0312' },
                    { date: 'Feb 25, 2026', period: 'Jan 2026', amount: '$4,850.30', method: 'Bank Transfer', status: 'processed', ref: 'PAY-2026-0225' },
                    { date: 'Jan 28, 2026', period: 'Dec 2025', amount: '$6,120.00', method: 'Bank Transfer', status: 'processed', ref: 'PAY-2026-0128' },
                    { date: 'Dec 26, 2025', period: 'Nov 2025', amount: '$5,480.50', method: 'Bank Transfer', status: 'processed', ref: 'PAY-2025-1226' },
                    { date: 'Nov 27, 2025', period: 'Oct 2025', amount: '$4,930.20', method: 'Bank Transfer', status: 'processed', ref: 'PAY-2025-1127' },
                    { date: 'Oct 28, 2025', period: 'Sep 2025', amount: '$5,710.00', method: 'Bank Transfer', status: 'processed', ref: 'PAY-2025-1028' },
                    { date: 'Sep 26, 2025', period: 'Aug 2025', amount: '$4,200.00', method: 'Bank Transfer', status: 'processed', ref: 'PAY-2025-0926' },
                    { date: 'Aug 27, 2025', period: 'Jul 2025', amount: '$3,890.50', method: 'Bank Transfer', status: 'processed', ref: 'PAY-2025-0827' },
                  ].map((p, i) => (
                    <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-3 text-xs text-slate-300">{p.date}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{p.period}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{p.method}</td>
                      <td className="px-4 py-3 text-xs text-slate-200 font-medium text-right">{p.amount}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          p.status === 'processed' ? 'bg-emerald-500/20 text-emerald-400' :
                          p.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            p.status === 'processed' ? 'bg-emerald-400' :
                            p.status === 'pending' ? 'bg-amber-400' :
                            'bg-blue-400'
                          }`}></span>
                          {p.status === 'processed' ? 'Processed' : p.status === 'pending' ? 'Pending' : 'Scheduled'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-500 font-mono">{p.ref}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Toast notification */}
        {profileToast && (
          <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-lg shadow-emerald-900/30 text-sm font-medium flex items-center gap-2 z-50 animate-pulse">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
            {profileToast}
          </div>
        )}

      </div>
      {/* ===== Footer ===== */}
      <div className="border-t border-slate-800 px-6 py-4 flex items-center justify-between text-[11px] text-slate-600">
        <span>&copy; 2026 CAS.AI</span>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-slate-400 transition-colors">Terms</a>
          <a href="#" className="hover:text-slate-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-slate-400 transition-colors">Support</a>
          <a href="#" className="hover:text-slate-400 transition-colors">API Docs</a>
          <span className="text-slate-700">v2.4.1</span>
        </div>
      </div>
      </div>
      </div>
      </div>
    </div>
  );
}
