import React, { useState } from 'react';
export default function MetricTree() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedApp, setSelectedApp] = useState('puzzle');
  const [expandedNodes, setExpandedNodes] = useState(new Set(['mrr', 'app1', 'ad_revenue_1', 'ua_cost_1', 'dau_1', 'arpdau_1']));
  const [editingId, setEditingId] = useState(null);
  const [filterSection, setFilterSection] = useState('all');
  const [groupByManager, setGroupByManager] = useState(false);

  const apps = [
    { id: 'puzzle', name: 'Puzzle Game' },
    { id: 'idle', name: 'Idle Tycoon' },
    { id: 'stack', name: 'Stack Tower' },
    { id: 'clevel', name: 'C-Level Report' },
  ];

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
      ]
    },
  };

  const treeData = {
    id: 'mrr',
    title: 'MRR',
    subtitle: 'Monthly Recurring Revenue',
    value: '$850K',
    change: '+22% MoM',
    formula: 'Σ (App Revenue − UA Cost)',
    color: 'bg-purple-500',
    headerColor: 'bg-purple-600',
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
    const prevFormatted = format ? format(prev) : prev;
    const delta = calcDelta(value, prev);
    const isUp = value >= prev;
    return (
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="text-slate-400 text-xs uppercase mb-2">{label}</div>
        <div className="text-2xl font-bold text-white">{formatted}{suffix}</div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-slate-500 text-sm">{prevFormatted}{suffix}</span>
          <span className={`text-sm font-medium ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>{delta}</span>
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
        {/* Node Card */}
        <div 
          onClick={() => hasChildren && toggleNode(node.id)}
          className={`relative rounded-xl overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform ${hasChildren ? '' : 'cursor-default'}`}
          style={{ minWidth: level === 0 ? 200 : level === 1 ? 180 : 140 }}
        >
          {/* Header */}
          <div className={`${node.headerColor} px-4 py-2 text-center`}>
            <div className="text-white font-semibold text-sm">{node.title}</div>
            {node.subtitle && <div className="text-white/70 text-xs">{node.subtitle}</div>}
          </div>
          {/* Body */}
          <div className="bg-slate-800 px-4 py-3 text-center">
            <div className="text-white text-2xl font-bold">{node.value}</div>
            <div className={`text-sm ${node.change.startsWith('+') || node.change.startsWith('-2') ? 'text-emerald-400' : 'text-red-400'}`}>
              {node.change}
            </div>
            {node.formula && (
              <div className="text-slate-400 text-xs mt-2 border-t border-slate-700 pt-2">{node.formula}</div>
            )}
            {/* Zone Label */}
            <div className="mt-2 pt-2 border-t border-slate-700">
              <span className="text-slate-500 text-xs">{zoneLabel}</span>
            </div>
          </div>
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-slate-700 border-2 border-slate-600 rounded-full flex items-center justify-center text-white text-xs z-10">
              {isExpanded ? '−' : '+'}
            </div>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col items-center mt-6">
            {/* Vertical Line */}
            <div className="w-px h-6 bg-slate-600" />
            {/* Horizontal Line + Children */}
            <div className="relative flex items-start gap-4">
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
                  <div className="w-px h-6 bg-slate-600" />
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
          <p className="text-slate-400 text-sm mt-1">CAS Mediation · Рекламная монетизация · UA</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-slate-800 rounded-xl p-1 flex gap-1">
            <button onClick={() => setActiveTab('tree')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'tree' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}>
              🌳 Metric Tree
            </button>
            <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'dashboard' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}>
              📈 Dashboard
            </button>
            <button onClick={() => setActiveTab('glossary')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'glossary' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}>
              📖 Глоссарий
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <>
            <div className="flex justify-center gap-2 mb-6 flex-wrap">
              {apps.map(app => (
                <button
                  key={app.id}
                  onClick={() => setSelectedApp(app.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedApp === app.id ? (app.id === 'clevel' ? 'bg-amber-600' : 'bg-blue-600') : 'bg-slate-800 hover:bg-slate-700'}`}
                >
                  {app.id === 'clevel' ? '👔 ' : ''}{app.name}
                </button>
              ))}
            </div>

            <div className={`border rounded-xl p-4 mb-6 ${data.isPortfolio ? 'bg-gradient-to-r from-amber-900/40 to-orange-900/40 border-amber-800/50' : 'bg-slate-800/50 border-slate-700'}`}>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{data.name}</h2>
                <span className="text-slate-400 text-sm">Январь 2026 vs Декабрь 2025</span>
              </div>
            </div>

            {/* C-Level Portfolio Metrics */}
            {data.isPortfolio ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-amber-900/50 to-orange-900/50 border border-amber-700/50 rounded-xl p-4">
                    <div className="text-amber-400 text-xs uppercase mb-2">MRR</div>
                    <div className="text-2xl font-bold text-white">${(data.current.mrr/1000000).toFixed(2)}M</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-slate-500 text-sm">${(data.previous.mrr/1000000).toFixed(2)}M</span>
                      <span className="text-sm font-medium text-emerald-400">{calcDelta(data.current.mrr, data.previous.mrr)}</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-900/50 to-orange-900/50 border border-amber-700/50 rounded-xl p-4">
                    <div className="text-amber-400 text-xs uppercase mb-2">ARR</div>
                    <div className="text-2xl font-bold text-white">${(data.current.arr/1000000).toFixed(1)}M</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-slate-500 text-sm">${(data.previous.arr/1000000).toFixed(1)}M</span>
                      <span className="text-sm font-medium text-emerald-400">{calcDelta(data.current.arr, data.previous.arr)}</span>
                    </div>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                    <div className="text-slate-400 text-xs uppercase mb-2">Apps</div>
                    <div className="text-2xl font-bold text-white">{data.current.apps}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-slate-500 text-sm">{data.previous.apps}</span>
                      <span className="text-sm font-medium text-emerald-400">+{data.current.apps - data.previous.apps}</span>
                    </div>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                    <div className="text-slate-400 text-xs uppercase mb-2">Total DAU</div>
                    <div className="text-2xl font-bold text-white">{formatNum(data.current.totalDau)}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-slate-500 text-sm">{formatNum(data.previous.totalDau)}</span>
                      <span className="text-sm font-medium text-emerald-400">{calcDelta(data.current.totalDau, data.previous.totalDau)}</span>
                    </div>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                    <div className="text-slate-400 text-xs uppercase mb-2">Avg ARPDAU</div>
                    <div className="text-2xl font-bold text-white">${data.current.avgArpdau.toFixed(3)}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-slate-500 text-sm">${data.previous.avgArpdau.toFixed(3)}</span>
                      <span className="text-sm font-medium text-emerald-400">{calcDelta(data.current.avgArpdau, data.previous.avgArpdau)}</span>
                    </div>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                    <div className="text-slate-400 text-xs uppercase mb-2">Avg ROAS</div>
                    <div className="text-2xl font-bold text-white">{data.current.avgRoas}%</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-slate-500 text-sm">{data.previous.avgRoas}%</span>
                      <span className="text-sm font-medium text-emerald-400">{calcDelta(data.current.avgRoas, data.previous.avgRoas)}</span>
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
              </>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <MetricCard label="DAU" value={data.current.dau} prev={data.previous.dau} format={formatNum} />
                <MetricCard label="ARPDAU" value={data.current.arpdau} prev={data.previous.arpdau} format={(v) => '$'+v.toFixed(3)} />
                <MetricCard label="Retention D7" value={data.current.retention_d7} prev={data.previous.retention_d7} suffix="%" />
                <MetricCard label="LTV" value={data.current.ltv} prev={data.previous.ltv} format={(v) => '$'+v.toFixed(2)} />
                <MetricCard label="ROAS" value={data.current.roas} prev={data.previous.roas} suffix="%" />
              </div>
            )}

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>📊</span> Publisher Dashboard — Monthly Cohort Table
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-3 px-3 text-slate-400 font-medium">Activity Month</th>
                      <th className="text-right py-3 px-3 text-slate-400 font-medium">Installs</th>
                      <th className="text-right py-3 px-3 text-slate-400 font-medium">DAU</th>
                      <th className="text-right py-3 px-3 text-slate-400 font-medium">D1 Retention</th>
                      <th className="text-right py-3 px-3 text-slate-400 font-medium">D7 Retention</th>
                      <th className="text-right py-3 px-3 text-slate-400 font-medium">Impressions</th>
                      <th className="text-right py-3 px-3 text-slate-400 font-medium">Clicks</th>
                      <th className="text-right py-3 px-3 text-slate-400 font-medium">CTR</th>
                      <th className="text-right py-3 px-3 text-slate-400 font-medium">eCPM ($)</th>
                      <th className="text-right py-3 px-3 text-slate-400 font-medium">Total Revenue ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.cohortTable.map((row, i) => (
                      <tr key={row.month} className={`border-b border-slate-700/50 ${i % 2 === 0 ? '' : 'bg-slate-900/30'}`}>
                        <td className="py-3 px-3 font-medium text-white">{row.month}</td>
                        <td className="py-3 px-3 text-right text-slate-300">{row.installs.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-slate-300">{row.dau.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-slate-300">{row.d1Retention}%</td>
                        <td className="py-3 px-3 text-right text-slate-300">{row.d7Retention}%</td>
                        <td className="py-3 px-3 text-right text-slate-300">{row.impressions.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-slate-300">{row.clicks}</td>
                        <td className="py-3 px-3 text-right text-slate-300">{row.ctr}%</td>
                        <td className="py-3 px-3 text-right text-slate-300">{row.ecpm.toFixed(4)}</td>
                        <td className="py-3 px-3 text-right text-white font-medium">{row.revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monetisation Table */}
            {data.monetisationTable && (
              <div className="mt-6 bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-emerald-400">💰</span> Monetisation Metrics
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="text-left py-3 px-3 text-slate-400 font-medium">Month</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">Ad Revenue ($)</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">ARPDAU ($)</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">Impr/DAU</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">Banner/Sess</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">Inter/Sess</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">Reward/Sess</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">eCPM ($)</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">Fill Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.monetisationTable.map((row, i) => (
                        <tr key={row.month} className={`border-b border-slate-700/50 ${i % 2 === 0 ? '' : 'bg-slate-900/30'}`}>
                          <td className="py-3 px-3 font-medium text-white">{row.month}</td>
                          <td className="py-3 px-3 text-right text-emerald-400 font-medium">{row.adRevenue.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right text-slate-300">{row.arpdau.toFixed(4)}</td>
                          <td className="py-3 px-3 text-right text-slate-300">{row.imprPerDau}</td>
                          <td className="py-3 px-3 text-right text-slate-300">{row.imprBanner}</td>
                          <td className="py-3 px-3 text-right text-slate-300">{row.imprInter}</td>
                          <td className="py-3 px-3 text-right text-slate-300">{row.imprReward}</td>
                          <td className="py-3 px-3 text-right text-slate-300">{row.ecpm.toFixed(2)}</td>
                          <td className="py-3 px-3 text-right text-slate-300">{row.fillRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* UA Table */}
            {data.uaTable && (
              <div className="mt-6 bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-pink-400">📢</span> UA Performance
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="text-left py-3 px-3 text-slate-400 font-medium">Month</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">UA Cost ($)</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">Installs</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">CPI ($)</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">Organic</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">Paid</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">ROAS D7</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">ROAS D30</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">Payback (d)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.uaTable.map((row, i) => (
                        <tr key={row.month} className={`border-b border-slate-700/50 ${i % 2 === 0 ? '' : 'bg-slate-900/30'}`}>
                          <td className="py-3 px-3 font-medium text-white">{row.month}</td>
                          <td className="py-3 px-3 text-right text-pink-400 font-medium">{row.uaCost.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right text-slate-300">{row.installs.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right text-slate-300">{row.cpi.toFixed(3)}</td>
                          <td className="py-3 px-3 text-right text-slate-300">{row.organic.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right text-slate-300">{row.paid.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right">
                            <span className={row.roasD7 >= 100 ? 'text-emerald-400' : 'text-red-400'}>{row.roasD7}%</span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className={row.roasD30 >= 100 ? 'text-emerald-400' : 'text-red-400'}>{row.roasD30}%</span>
                          </td>
                          <td className="py-3 px-3 text-right text-slate-300">{row.payback}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Engagement Table */}
            {data.engagementTable && (
              <div className="mt-6 bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-purple-400">🎮</span> Engagement Metrics
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="text-left py-3 px-3 text-slate-400 font-medium">Month</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">DAU</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">Avg Sessions</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">Avg Duration (min)</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">DAV/DAU (%)</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">PAU Conversion (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.engagementTable.map((row, i) => (
                        <tr key={row.month} className={`border-b border-slate-700/50 ${i % 2 === 0 ? '' : 'bg-slate-900/30'}`}>
                          <td className="py-3 px-3 font-medium text-white">{row.month}</td>
                          <td className="py-3 px-3 text-right text-purple-400 font-medium">{row.dau.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right text-slate-300">{row.avgSessions}</td>
                          <td className="py-3 px-3 text-right text-slate-300">{row.avgDuration}</td>
                          <td className="py-3 px-3 text-right text-slate-300">{row.davDau}%</td>
                          <td className="py-3 px-3 text-right text-slate-300">{row.pauConversion}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Networks Table */}
            {data.networksTable && (
              <div className="mt-6 bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-cyan-400">🌐</span> Ad Networks Performance
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="text-left py-3 px-3 text-slate-400 font-medium">Network</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">Revenue ($)</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">Impressions</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">eCPM ($)</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">Fill Rate (%)</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">SoV (%)</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">Win Rate (%)</th>
                        <th className="text-right py-3 px-3 text-slate-400 font-medium">Latency (ms)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.networksTable.map((row, i) => {
                        const networkColors = {
                          'AppLovin': 'text-blue-400',
                          'AdMob': 'text-yellow-400',
                          'Unity Ads': 'text-slate-300',
                          'ironSource': 'text-violet-400',
                        };
                        return (
                          <tr key={row.network} className={`border-b border-slate-700/50 ${i % 2 === 0 ? '' : 'bg-slate-900/30'}`}>
                            <td className={`py-3 px-3 font-medium ${networkColors[row.network] || 'text-white'}`}>{row.network}</td>
                            <td className="py-3 px-3 text-right text-emerald-400 font-medium">{row.revenue.toLocaleString()}</td>
                            <td className="py-3 px-3 text-right text-slate-300">{row.impressions.toLocaleString()}</td>
                            <td className="py-3 px-3 text-right text-slate-300">{row.ecpm.toFixed(2)}</td>
                            <td className="py-3 px-3 text-right">
                              <span className={row.fillRate >= 96 ? 'text-emerald-400' : row.fillRate >= 94 ? 'text-yellow-400' : 'text-red-400'}>{row.fillRate}%</span>
                            </td>
                            <td className="py-3 px-3 text-right text-slate-300">{row.sov}%</td>
                            <td className="py-3 px-3 text-right text-slate-300">{row.winRate}%</td>
                            <td className="py-3 px-3 text-right">
                              <span className={row.latency <= 130 ? 'text-emerald-400' : row.latency <= 160 ? 'text-yellow-400' : 'text-red-400'}>{row.latency}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-slate-600 bg-slate-900/50">
                        <td className="py-3 px-3 font-semibold text-white">Total</td>
                        <td className="py-3 px-3 text-right text-emerald-400 font-bold">{data.networksTable.reduce((s, r) => s + r.revenue, 0).toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-slate-300 font-medium">{data.networksTable.reduce((s, r) => s + r.impressions, 0).toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-slate-400">—</td>
                        <td className="py-3 px-3 text-right text-slate-400">—</td>
                        <td className="py-3 px-3 text-right text-white font-medium">100%</td>
                        <td className="py-3 px-3 text-right text-slate-400">—</td>
                        <td className="py-3 px-3 text-right text-slate-400">—</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'tree' && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 overflow-x-auto">
            <p className="text-slate-400 text-sm mb-6 text-center">Кликните на карточку для раскрытия детализации. Роль указана внизу каждой карточки.</p>
            <div className="flex justify-center min-w-max pb-4">
              <TreeNode node={treeData} />
            </div>
          </div>
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
