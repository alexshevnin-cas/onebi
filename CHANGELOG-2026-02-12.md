# Changelog — 2026-02-12

## A. Архитектура и Layout (A1–A4, без A5)

### A1. Quick View / Reports / Glossary
- Заменён `activeTab` на `activeScreen` (`quickview | reports | glossary`)
- Навигация: 3 вкладки в header
- Report Type Selection перенесён внутрь Quick View
- Контейнер расширяется до 1400px для Reports

### A2. Sidebar с категориями метрик
- Левая панель 224px (sticky) с поиском
- **Dimensions**: Common (Activity Date, Country, OS, Device Type), Monetization (Ad Type, Network, Placement), Version (Package Version, SDK Version)
- **Measures**: Monetization, Session, Impressions, Retention, Cohort, UA
- Категории сворачиваемые, активные items подсвечены синим
- Клик на dimension → добавляет split, клик на measure → добавляет метрику

### A3. Chip-based FILTERS / SPLIT / MEASURES
- **Filters row** (синие chips): Period, App, Country + "+ Add"
- **Split row** (cyan chips): выбранные dimensions + "+ Add Split"
- **Measures row** (violet chips): выбранные метрики + "+ Measure"
- Все chips с кнопкой × для удаления

### A4. Controls Row + Action Buttons
- Слева: Apply | Reset | Share
- Справа: Density toggle, View toggle (Table/Chart/Line), Export ▾, Views ▾

---

## B. Quick View (B1–B4)

### B1. Metric Cards по типу клиента
- Селектор `PubC | L1 | L2 | Pub` в header Quick View
- Карточки по спеку: PubC (4), L1 (5), L2 (6), Pub (6)
- Анатомия: название uppercase, значение крупно, дельта % (зелёный ▲ / красный ▼)
- `planned` карточки → placeholder "--" с пометкой "Planned"
- Клик → переход в Reports с этой метрикой
- Compare mode показывает "vs {prev}"

### B2. Trend Chart
- Bar chart Revenue по месяцам из `monetisationTable`
- Hover tooltip с точным значением ($)
- Compare legend (current vs previous)

### B3. Breakdown Charts
- Revenue by Ad Type — горизонтальные progress bars (Banner/Interstitial/Rewarded)
- Revenue by Country — горизонтальные progress bars (US/DE/UK/JP/Other)

### B4. Period Bar
- Dropdown: Today, Last 7 days, Last 30 days, This month, Custom
- Checkbox "Compare"
- App selector вынесен в header Quick View (кнопки по приложениям)

---

## C. Reports — Data Table (C1–C7)

### C1. Hierarchical grouping
- Split по `adType` → группировка по периоду (жирный заголовок), подстроки Banner/Interstitial/Rewarded с indent
- Группы сворачиваются по клику, показывая "(N rows)"

### C2. Totals Row (sticky footer)
- Sticky `<tfoot>` "Total"
- Sum для абсолютных (DAU, Revenue, Installs)
- Average для rates (eCPM, ARPDAU, Retention, Fill Rate)
- "—" для нечисловых

### C3. Anomaly Highlight
- Нулевое значение → красный фон `bg-red-500/15`
- Падение >50% → жёлтый `bg-amber-500/15`
- Отсутствие данных → серый italic
- Рост >100% → зелёный `bg-emerald-500/15`
- Tooltip с описанием аномалии

### C4. Search in Table
- Поле поиска фильтрует строки в реальном времени
- Совпадения подсвечены жёлтым `<mark>`

### C5. Copy Cell Value
- Hover → иконка ⧉
- Клик → копирует в буфер, feedback ✓ на 1 сек

### C6. Density Toggle
- Compact / Comfortable в Controls Row
- Compact: `py-1`, `text-[11px]`
- Comfortable: `py-2.5`, `text-xs`

### C7. Status Bar
- "Data updated: 3 min ago" + "Rows: N of M"

---

## D. Reports — Charts (D1–D3)

### D1. Stacked/Grouped Bar Chart
- Режим Chart: вертикальные бары по периодам
- Split по adType → stacked bars (Banner/Interstitial/Rewarded)
- Без split → обычные бары
- Hover tooltip с breakdown
- Отдельная секция на каждую видимую метрику

### D2. Multi-line Chart
- Режим Line: SVG polyline график
- Каждая метрика нормализована в свой min–max диапазон
- Маркеры-точки с `<title>` tooltip
- Разные цвета серий (8 цветов)

### D3. Legend Component
- Цветные квадраты/линии с toggle видимости по клику
- line-through для скрытых серий
- Show All / Hide All кнопки

---

## E. Фильтры и Selectors (E1–E3)

### E1. App Selector Dropdown
- Dropdown с поиском по имени
- Иконки платформ (🤖/🍎)
- Галочка текущего выбора
- Счётчик приложений внизу

### E2. Deep URL
- Share → `pushStateToUrl()` + копирование URL в буфер
- Формат: `?s=splits&m=metrics&app=...&country=...&screen=...`
- `useEffect([], loadStateFromUrl)` при загрузке страницы

### E3. Saved Views
- Dropdown "Views" с данными из `localStorage('onebi_saved_views')`
- "+ Save current view" → prompt → сохраняет splits + metrics + app + country
- Загрузка по клику, удаление hover → ×

---

## F. Недостающие метрики (F1–F8)

### F1–F8. 65 метрик всего
- Добавлены IAP метрики (F1): iapRevenue, iapArpdau, payingUsers, purchases, iapArppu
- Session extended (F2): sessionsPerUser, timePerUser, adSessionLength, imprPerSession, sessionCount
- Retention extended (F3): D14, D30, D60, D90, Rolling Ret D7/D30, Churn D7/D30, Stickiness, Avg Lifetime
- Cohort Session (F4): timePerUserLt, sessionsPerUserLt, timePerUserDaily, sessionsPerUserDaily
- Impressions by Ad Type (F5): imprMrec, ctrInter, ctrReward, ctrBanner
- Network advanced (F6): renderRate, bidPrice, ctrNetwork, biddingShare
- Diagnostic (F7): revBySdk, revByPlatform, ecpmByPlatform, anomalyFlag, networkGap, dauDiscrepancy
- UA extended (F8): roasTodate, profitCal, attOptin, mmpInstalls, eroasD60, eroasD365, arpuD7..D30
- Синтетические данные генерируются в `buildReportsRows` из коэффициентов от основных таблиц
- `metricKeyMap` расширен до 65 записей, `sidebarMeasures` — 8 категорий, `allMetricsOptions` — полный список

---

## G. Роли и Views (G1–G7)

### G1. PubC View
- Карточки PubC (4): DAU, Revenue (planned), ARPDAU (planned), D1 Retention

### G2. Pub View — profit & health
- Net Income (Revenue – CAS 15% commission)
- Health indicator (green/yellow/red)
- Top Creative card (CTR, impressions)

### G3. Admin — gross/net toggle
- Переключатель Gross / Net (–15%) в Quick View для Admin
- State `adminGrossNet`

### G4. Admin — anomaly detection
- Summary badge: "2 apps with Revenue drop >20%"
- Animated red dot

### G5. BD Dashboard
- Client Portfolio table: Client, Manager, Revenue, DAU, Trend, Churn Risk
- 7 mock clients, risk badges (low/medium/high)

### G6. Payments View
- Current Balance (large number) + Withdraw button
- Payment History table (Date, Amount, Method, Status)
- Balance Change Warning (amber)

### G7. RnD — cross-client SDK view
- SDK Adoption table: Version, Adoption %, Clients, Rev Delta, Status, Distribution bar
- 5 SDK versions (beta/latest/stable/outdated/deprecated)

### Общее для G
- Селектор клиентских типов расширен: PubC | L1 | L2 | Pub | Admin | BD | Payments | RnD
- `qvCardDefs` расширен на Admin (6), BD (3), Payments (1), RnD (3)

---

## H. UX Polish (H1–H5)

### H1. Export функциональность
- CSV — скачивание файла с данными таблицы
- Excel — CSV с BOM для корректного UTF-8 в Excel
- Copy to Clipboard — tab-separated данные

### H2. Data Freshness Indicator
- "Data updated: 3 min ago" + "Source: CAS Analytics Pipeline v2.4" под Quick View
- Status bar в Reports (уже C7)

### H3. Responsive + Desktop First
- `<1024px` → сообщение "Desktop Required" с иконкой
- Tailwind `lg:hidden` / `hidden lg:block`

### H4. Tooltip'ы с формулами
- `metricTooltips` — описание + формула для 16 ключевых метрик
- title-атрибуты на: Sidebar measures, Quick View card labels, Table column headers

### H5. Keyboard Shortcuts
- Escape → закрытие всех dropdown'ов
- `useEffect` с `keydown` listener

---

## Технические детали

- **Файл**: `src/onebi.jsx` (единственный изменённый файл, ~3210 строк)
- **Импорт**: добавлен `useEffect` из React
- **Новые states**: `clientType`, `adminGrossNet`, `hoveredTooltip`, `qvPeriod`, `qvCompare`, `showPeriodDropdown`, `reportsDensity`, `reportsSearch`, `copiedCell`, `collapsedGroups`, `hiddenSeries`, `savedViews`, `showSavedViewsDD`, `showExportDD`, `showAppSelector`, `appSelectorSearch`
- **Новые функции**: `getQvCardValues`, `getQvTrendData`, `getQvBreakdownAdType`, `getQvBreakdownCountry`, `buildReportsRows`, `getAnomaly`, `handleCopyCell`, `toggleGroup`, `toggleSeries`, `pushStateToUrl`, `loadStateFromUrl`, `saveCurrentView`, `loadSavedView`, `deleteSavedView`
- **Новые данные**: `qvCardDefs` (8 типов клиентов), `qvPeriodOptions`, `metricKeyMap` (65 метрик), `seriesColors`, `anomalyStyle/Tooltip`, `sidebarDimensions`, `sidebarMeasures`, `metricTooltips`, `bdClients`, `rndSdkData`
- **Bundle size**: 305 KB JS (88 KB gzip)
- **Build**: `npm run build` проходит успешно на каждом этапе
