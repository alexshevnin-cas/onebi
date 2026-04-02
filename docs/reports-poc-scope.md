# Reports — POC v1 (scope)

Что входит в первую версию Reports (Step 2 по кикоффу).
Данные — мок API (тот же JSON). Без бэкенда.

---

## 1. Sidebar (левая панель, 224px, sticky)

Два раздела с поиском по названию метрик.

### Split (Dimensions)
Клик добавляет/убирает dimension из row-чипов. Активные подсвечены.

| Группа | Элементы |
|--------|----------|
| Common | Activity Date, Country, OS, Device Type |
| Monetization | Ad Type, Network, Placement |
| Version | Package Version, SDK Version |

### Measures
Клик добавляет метрику в chips. Тултип с описанием и формулой.

| Группа | Метрики |
|--------|---------|
| Monetization | Revenue, ARPDAU, eCPM, Fill Rate, Impressions |
| Session | DAU, Sessions, Duration |
| Impressions | Impr/DAU |
| Retention | D1 Retention, D7 Retention |

Кнопка collapse/expand сайдбара.

---

## 2. Chip-строки (3 ряда)

Блок над таблицей с тремя рядами чипов, разделёнными линиями.

### Row 1: Filters (синие чипы)
- **Period** — всегда виден: "Period: 2025-12-01 — 2025-12-31"
- **App** — дропдаун с поиском: All Apps / конкретное приложение, чекмарк, кнопка ×
- **Country** — дропдаун: All / US / DE / UK / JP / Other, кнопка ×
- **+ Filter** — кнопка, открывает список доступных фильтров для добавления

### Row 2: Split (бирюзовые чипы)
- Список активных dimensions в виде чипов: "Activity Date ×", "Ad Type ×"
- **+ Add Split** — кнопка

### Row 3: Measures (фиолетовые чипы)
- Список выбранных метрик: "DAU ×", "Revenue ×", "Sessions ×", ...
- Каждый чип удаляем по ×
- **+ Measure** — кнопка, открывает дропдаун выбора метрик

---

## 3. Controls Row (строка управления)

### Левая часть
- **Apply** — применить фильтры (синяя кнопка)
- **Reset** — сбросить всё к дефолтам
- **Share** — скопировать URL с текущим состоянием фильтров в буфер

### Правая часть
- **Density** — toggle: Compact / Comfortable
- **View** — toggle: Table / Chart / Line
- **Export** — дропдаун: CSV, Excel, Copy to Clipboard
- **Views** — дропдаун: список сохранённых пресетов, "+ Save current view"

---

## 4. Поиск по таблице

Поле ввода "Search in table..." — фильтрует строки и подсвечивает совпадения жёлтым.

---

## 5. Таблица (режим Table)

- **Sticky header** — первая строка зафиксирована при скролле
- **Первая колонка**: Period (или "Period / Ad Type" при split по ad type), sticky слева
- **Колонки метрик**: по одной на каждую выбранную метрику, выравнивание вправо
- **Drag-and-drop** колонок — перетаскивание для смены порядка
- **Тултипы** в заголовках — описание метрики + формула

### Группировка (при split по Ad Type)
- Строки-заголовки групп (Period) — кликабельные, сворачивают/разворачивают подстроки
- При сворачивании: "(N rows)" рядом с названием

### Аномалии — подсветка ячеек
| Цвет | Условие | Тултип |
|------|---------|--------|
| Красный фон | Нулевое/пустое значение | "Zero or missing data" |
| Жёлтый фон | Падение >50% к предыдущей строке | "Drop >50%" |
| Зелёный фон | Рост >100% к предыдущей строке | "Spike >100%" |

### Copy ячейки
- При наведении — иконка копирования слева от значения
- Клик → значение в буфер, иконка меняется на ✓ на 1 сек

### Sticky footer — строка Total
- Суммы для абсолютных метрик (DAU, Revenue, Impressions, Installs)
- Средние для относительных (eCPM, ARPDAU, Fill Rate, Retention, ROAS)

### Status bar (под таблицей)
- "Data updated: 3 min ago"
- "Rows: N of M" (если есть фильтрация/поиск)

---

## 6. Bar Chart (режим Chart)

- Вертикальные бары по периодам, один блок на метрику
- При split по Ad Type: **stacked bars** (Banner / Interstitial / Rewarded)
- Без split: обычные бары (синие)
- Тултипы при наведении на бар: breakdown по сегментам
- Легенда с toggle: клик по метрике скрывает/показывает; Show All / Hide All

---

## 7. Line Chart (режим Line)

- Мульти-линейный график: каждая метрика — своя линия, свой цвет
- Нормализация: каждая метрика к своему min–max диапазону (чтобы разные масштабы были сравнимы)
- Точки на линиях с тултипами: "Метрика: значение"
- Горизонтальная сетка (4 уровня)
- Легенда с toggle: клик скрывает/показывает линию; Show All / Hide All

---

## 8. Deep URL / Share

- Кнопка Share записывает текущее состояние в URL: `?s=splits&m=metrics&app=...&country=...&screen=...`
- При открытии URL — автозагрузка состояния

---

## 9. Saved Views

- Сохранение текущей конфигурации (splits, metrics, app, country) в localStorage
- Загрузка / удаление из дропдауна Views
- Prompt для названия при сохранении

---

## Дефолтные метрики при открытии

DAU, Revenue, Sessions, D1 Retention, D7 Retention, Impr/DAU
Split: Activity Date

---

## Не входит в POC v1

- Superadmin-фильтры (Manager, Customer, Date Created)
- Расширенные метрики: IAP (5), Session extended (5), Retention extended (6), Cohort (5), UA (12), Network (4), Diagnostic (6)
- Сортировка по клику на заголовок колонки
- Drag-and-drop чипов (reorder splits/measures)
- Пагинация таблицы
- Real API / бэкенд
- Мобильная адаптация
