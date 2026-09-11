# Пресеты Reports по user stories — предложение

Разобраны все 83 истории из `cas-docs/03-product/user-stories.md` против текущих возможностей прототипа (81 метрика, 10 разбивок, 8 фильтров, 12 пресетов). Для каждой истории — либо конфигурация пресета и что зритель увидит на демо, либо причина, почему история живёт не в Reports.

**Итог:** 32 истории закрываются пресетом на текущих данных, 35 — пресет собирается, но нужны данные или фича, 13 живут на других экранах, 3 не показать на фейковых данных.

Формат конфигурации: `App · Filters · Split · Measures · View`. Activity date есть всегда и не указывается. Compare отмечен только там, где по смыслу нужен, — в прототипе это пока визуальный флаг (см. «Что нужно добавить»).

---

## Демо-набор: 10 пресетов для показа

Отобраны по контрасту в данных (есть число, на которое можно показать пальцем) и разнообразию ролей — не больше двух на роль. Порядок — сценарий демо: от «всё ли в порядке» к причине, решению и совместной работе.

### 1. L1-02 · Monetisation efficiency — «здоровое приложение»
> «Каждый пользователь приносит почти вдвое больше, чем полгода назад — и за счёт цены показа, и за счёт количества показов».

`Idle Tycoon · — · Activity Date · Ad ARPDAU, eCPM, Impressions / DAU, Fill Rate, Ad Revenue, DAU · Lines`

Линии по месяцам: Ad ARPDAU $0.0388 → $0.0716, eCPM $5.12 → $7.58, Impressions/DAU 7.5 → 9.4, Fill Rate 90.8% → 94.8%. Эталон, с которым L1-клиент сравнивает своё приложение.

### 2. PO-01 · Revenue drop cause — «упала цена, а не трафик»
> «С ноября выручка DriveCSX упала на 14%, пользователей при этом на 10% больше и рекламу они смотрят столько же — упала цена показа: eCPM минус 22%. Это не продукт, это сети».

`DriveCSX · — · Activity Date · Ad Revenue, DAU, Impressions / DAU, eCPM, Fill Rate · Table`

Порядок колонок — дерево причин слева направо: выручка упала → DAU растёт (не трафик) → показов на пользователя столько же (не поведение) → eCPM 5.42 → 4.68 → 4.21 (причина) → Fill Rate 96.4 → 94.2. Таблица идёт от нового к старому — пик в ноябре (третья строка) ведущий показывает явно. Оба критика: ok, 4/5. Это тот самый кейс DriveCSX из истории, где аналитика и медиация видели разное.

### 3. L2-03 · App version comparison — «релиз сломал монетизацию» *(есть, улучшен)*
> «Новый релиз 4.2.0 снизил ARPDAU на 25% относительно 4.1.3 при большем числе показов — упала цена показа, а не нагрузка; заодно короче стала сессия».

`DriveCSX · SDK Version: all · App Version · Ad ARPDAU, eCPM, Fill Rate, Impressions / DAU, AVG Session Duration, DAU, Ad Revenue · Table`

Строки: 4.2.0 ($0.0324 / $3.68 / 92.5% / 8.7 / 7.8 мин / 74.7K), 4.1.3 ($0.0431 / $5.14 / 96.2% / 8.4 / 8.4 мин / 50.3K), 4.0.7, 3.9.5. Изменение к текущему пресету: ARPDAU и eCPM — первыми, добавлены Fill Rate и длительность сессии. Продолжение истории №2: причина падения eCPM найдена.

### 4. PO-03 · App version cohort eCPM — «то же самое, но честно»
> «Одна и та же SDK 3.9.2, одна когорта установок — и релиз 4.2.0 даёт eCPM $3.62 против $5.14 у 4.1.3. Снимаю фильтр SDK — и таблица тут же врёт: 4.2.0 склеивается с бетой».

`DriveCSX · SDK Version = CAS 3.9.2, Install date on · App Version · eCPM, DAU, Ad ARPDAU, Fill Rate, Impressions / DAU · Table`

Две строки на одной SDK: 4.2.0 — eCPM $3.62 на 68,204 DAU; 4.1.3 — $5.14 на 50,300. Второй шаг демо — снять чип SDK: появляются 4.0.7 и 3.9.5 (CAS 3.7.1, $2.41), а 4.2.0 сливается с beta4 — сравнение перестаёт быть честным. Показывает, зачем в истории «когорта vs срез». *Оговорка:* Install date здесь пока декоративный — строки версий берутся напрямую из таблицы версий, окно установки их не меняет; на демо чип держать включённым, но не трогать.

### 5. L2-05 · Retention quality — «чем больше закупаем, тем хуже качество» *(есть, улучшен)*
> «Каждый месяц масштабирования UA стоит около 0.3 п.п. D1 и D7 — пора смотреть на источники трафика, а не на общий объём».

`DriveCSX · — · Activity Date · Retention D1, Retention D7, Retention D30, Installs, CPI, Stickiness, DAU · Table`

D1 сползает 43.6% → 41.8%, D7 26.1% → 24.1%, D30 12.8% → 11.2%, при этом Installs 33.1K → 54.2K и CPI $0.067 → $0.071. Изменение к текущему: приложение DriveCSX вместо All Apps, добавлены Installs и CPI — без них сползание retention не с чем связать.

### 6. MON-01 · SDK A/B decision — «цифра зелёная, кнопка красная» *(есть)*
> «+2.6% на 5.7K юзерах — тот самый случай „прирост 2 цента, катим“: вероятность 70%, и на этом трафике тест не станет значимым никогда».

`DriveCSX · SDK Version = CAS 3.9.2 + CAS 4.8.1 beta4, Install date on · A/B Group · Ad ARPU, Ad ARPDAU, eCPM, Impressions / DAU, Impressions per Session, Impressions per User, Sessions per User, AVG Session Duration, Fill Rate, Display Rate, Active Users per Ad, DAU, Impressions, Ad Revenue · Table / Lines / Bars`

Три клика по App — три исхода: DriveCSX `inconclusive · never at this traffic`; Stack Tower `worse · hold` (−3.65%, p = 0.004); Idle Tycoon `invalid · split skewed`. Lines — 14 графиков по дням, Bars — дневная дельта и «выше контроля N из 14 дней».

### 7. PM-02 · SDK upgrade argument — «с чем идти к клиенту»
> «315 тысяч пользователей Stack Tower до сих пор на SDK 3.8 и старше, и каждый приносит на 27% меньше, чем на 3.9.2. Обновление — это +$0.01 ARPDAU на 315K DAU, около $3K в день, которые клиент не забирает».

`Stack Tower · SDK Version = CAS 3.9.2, CAS 3.9.0, CAS 3.8.x, CAS 3.6.x (бета исключена) · SDK Version · DAU, Ad ARPDAU, Impressions / DAU, Fill Rate, eCPM · Table`

Четыре строки с монотонным ARPDAU $0.0356 → $0.0318 → $0.0263 → $0.0257: чем старше, тем меньше. По замечанию критиков: бета исключена фильтром (у неё ARPDAU ниже стабильной, и тезис «обновись — заработаешь» ломался бы первой же строкой), Ad Revenue убран — в данных Stack Tower выручка по версиям не сходится с DAU × ARPDAU (см. правки данных). Половина истории «какие клиенты не обновили» без разбивки по клиенту не закрывается — приложение выступает прокси клиента.

### 8. UA-02 · Scale decision — «увеличивать ли бюджет: нет»
> «Закупка выросла на 64% по установкам, а LTV упал на 13% и CPI подорожал на 6% — ROAS съехал на 15 пунктов. Юнит-экономика ухудшается по мере масштабирования».

`DriveCSX · — · Activity Date · LTV, CPI, ROAS D7 / D30, ROAS, To-Date, Installs, eCPM, Ad Revenue · Table`

LTV $0.38 → $0.33, CPI $0.067 → $0.071, ROAS 133% → 118%, Installs 33.1K → 54.2K. Связка с №2–3: пока eCPM не восстановится после релиза 4.2.0, доливать трафик нельзя.

### 9. Pub-06 · ARPU forecast curve — «решение через неделю, а не через месяц»
> «Уже прогноз D7 покрывает CPI в 2.6 раза — решение масштабировать закупку можно принимать через неделю после старта когорты».

`Stack Tower · — · Activity Date · ARPU Forecast D7, ARPU Forecast D14, ARPU Forecast D30, LTV, CPI, Installs · Lines`

D7 $0.049 → $0.084, D14 $0.077 → $0.132, D30 $0.109 → $0.187; CPI $0.039 → $0.032 лежит ниже всех кривых.

### 10. INT-01 · Shared report link — «отчёт — это URL»
> «Это не скриншот — это ссылка: открой её сам и увидишь ровно тот же eCPM по DriveCSX, что и я. Спорить, чьи цифры правильные, больше не о чем».

`DriveCSX · — · Activity Date · eCPM, Ad Revenue, DAU, Impressions / DAU · Table`

Ведущий жмёт Share, открывает ссылку в новой вкладке — восстанавливаются приложение, разбивка и метрики. По замечанию критиков: eCPM первой колонкой (та самая спорная цифра из кейса), Compare выключен — он в ссылку не попадает, и обещание «тот же вид» сломалось бы на глазах у зрителя. Хороший закрывающий пресет: после историй №2–4 показывает, что PO, монетизатор и аналитик смотрят в одну таблицу.

**Резерв демо-набора** (готовы, но пересекаются с основными): L2-04 Ad load balance, L1-05 Revenue by country, PubC-05 Prototype monetisation, GM-03 Shared source of truth, RND-01 SDK revenue impact, UA-05 ROAS forecast early.

---

## Все пресеты по ролям

Статусы: **готов** — собирается на текущих данных; **нужны данные** — конфигурация есть, но без доработки прототипа история не читается; **другой экран**; **не показать**.

### L1 — базовый клиент медиации

| Код | Статус | Пресет |
|---|---|---|
| L1-01 | готов *(есть, улучшен)* | **Revenue health check** — `DriveCSX · Activity Date · Ad Revenue, DAU, Ad ARPDAU, eCPM, Impressions · Table`. Вместо All Apps — конкретное приложение с сюжетом, добавлен eCPM. Для контраста переключить на Stack Tower: ровный рост $3.3K → $23K. |
| L1-02 | готов | **Monetisation efficiency** — демо-набор №1 |
| L1-03 | готов | **Revenue by ad type** — `Stack Tower · Ad Type · Ad Revenue, Impressions · Bars`. Interstitial ≈ 40%, Banner ≈ 35%, Rewarded ≈ 25%. *Только аддитивные метрики — см. правку B.* |
| L1-04 | нужны данные | **App comparison** — `All Apps · App · Ad Revenue, DAU, Ad ARPDAU, eCPM, Fill Rate, Impressions · Table`. Stack Tower зарабатывает объёмом ($74K, но ARPDAU $0.02–0.03), Idle Tycoon — ценой пользователя ($0.07, eCPM $7.6). **Нужна разбивка App (правка A).** |
| L1-05 | готов | **Revenue by country** — `Puzzle Game · Country · Ad Revenue, DAU, Impressions, Ad ARPDAU, eCPM · Table`. US — 38% выручки; Tier-1 вместе > 80%. |
| L1-06 | нужны данные | **eCPM by ad format** — `DriveCSX · Ad Type · eCPM, Ad Revenue, Impressions, Fill Rate · Table`. Должно быть: Rewarded ≈ $12, Interstitial ≈ $6–7, Banner ≈ $1–1.5. **Сейчас eCPM Rewarded получается НИЖЕ Banner — на демо выглядит ошибкой (правка B).** |
| L1-07 | готов *(есть, улучшен)* | **Revenue by network** — `Stack Tower · Network · Ad Revenue, eCPM, Impressions, Bidding vs Waterfall · Table`. AppLovin 30%, AdMob 24% — две сети дают половину денег. Fill Rate и Render Rate убраны: при масштабировании по доле у лидеров они выходят > 100% (правка B). |
| L1-08 | нужны данные | **Network health** — `Puzzle Game · Activity Date + Network · Impressions, eCPM, Ad Revenue, Network Data Gap, Anomaly Flag · Table`. Задумано: у Meta AN в ноябре ноль показов (красная ячейка), Data Gap 100%, Flag Yes; внизу Bigo Ads и Kidoz с нулями — подключены, но не крутятся. **Нужны инъекции отвалов и нулевые сети в разбивке (правка C).** |
| L1-09 | не показать | Группы приложений: в прототипе 4 приложения и нет сущности «группа». Имеет смысл после разбивки App и при портфеле > 15. |
| L1-10 | готов | **My weekly check** — демонстрация Save preset: собрать `DriveCSX · SDK Version = CAS 3.9.2 · Activity Date · Ad Revenue, DAU, Ad ARPDAU, eCPM`, сохранить, уйти в другой пресет, вернуться из списка. Фильтр SDK меняет цифры — восстановление заметно. |
| L1-11 | другой экран | Индикатор свежести уже в шапке: «Data through Sep 8, 2026 · up to date». Показать на первом же пресете. |

### L2 — продвинутый клиент медиации

| Код | Статус | Пресет |
|---|---|---|
| L2-01 | готов *(есть, улучшен)* | **SDK version impact** — `DriveCSX · SDK Version: all · SDK Version · Ad Revenue, eCPM, Ad ARPDAU, Fill Rate, Impressions / DAU, DAU · Table`. Переход 3.8.5 → 3.9.2 не улучшил монетизацию: eCPM $5.21 → $4.27; бета возвращает лишь до $4.32. |
| L2-02 | готов | **Build issue detection** — `DriveCSX · SDK Version: all · App Version · Impressions, Impressions / DAU, Fill Rate, eCPM, Ad Revenue, DAU · Table`. В билде 4.2.0 показов больше (8.7 vs 8.4), а Fill и eCPM провалились — релиз ломает качество показов, не частоту. |
| L2-03 | готов *(есть, улучшен)* | **App version comparison** — демо-набор №3 |
| L2-04 | готов *(есть, улучшен)* | **Ad load balance** — `Idle Tycoon · Activity Date · Impressions per Session, Impressions / DAU, AVG Session Duration, AVG Session Count, Ad ARPDAU, Retention D7 · Table`. Показов на сессию ~2.0 не меняется — рост показов пришёл из роста числа и длины сессий; ARPDAU удвоился без ущерба UX. |
| L2-05 | готов *(есть, улучшен)* | **Retention quality** — демо-набор №5 |
| L2-06 | готов | **Engagement trend** — `Stack Tower · Activity Date · AVG Session Duration, AVG Session Count, Sessions per User, Time per User, Session Count (Total), DAU · Table`. Аудитория ×3.4, сессия +40% — новые играют не хуже старых. |
| L2-07 | нужны данные | **Revenue loss points** — `DriveCSX · Network · Fill Rate, Render Rate, Impressions, eCPM, Ad Revenue · Table`. Задумано: Meta AN заполняет 89.6% при лучшем eCPM $4.97, Bigo Ads с нулями. **Нужны реальные строки networksTable в разбивке и метрики NoFill / Requests (правки B, H).** |
| L2-08 | готов | **DAU verification** — `Stack Tower · Activity Date · DAU Discrepancy, DAU, WAU, MAU, Installs · Bars`. Расхождение CAS vs Firebase 4.5% → 2.1% — в допуске, сверять вручную не нужно. |
| L2-09 | нужны данные | **Version rollout tracking** — `DriveCSX · Activity Date + App Version · DAU, AVG Session Count, Ad Revenue, Ad ARPDAU · Lines`. Должна быть кривая adoption 4.2.0 с нуля до 46%. **Доли версий сейчас одинаковы во всех месяцах (правка F).** |
| L2-10 | другой экран | Export CSV/Excel — кнопка в тулбаре, показать поверх L2-03. PDF нет. |
| L2-11 | другой экран | Поиск по таблице — поле над таблицей, показать поверх L2-09: ввести «4.2». |
| L2-12 | нужны данные | **Unified spend revenue** — `Idle Tycoon · Country · Ad Revenue, Profit (Calendar), Installs, CPI, ROAS, MMP Installs · Table`. Три сервиса в одной таблице. **Нужны UA Spend, разбивка по источникам, реальные CPI/ROAS по странам (правки B, H).** |
| L2-13 | другой экран | Интеграция CAS ↔ MMP — карточка приложения (Applications). В Reports только следствие — колонка MMP Installs. |

### PubC — кандидат в паблишинг

| Код | Статус | Пресет |
|---|---|---|
| PubC-01 | готов | **SDK data flowing** — `DriveCSX · Activity Date · Impressions, DAU, Ad Revenue, Fill Rate · Table`. Ни одной красной ячейки — данные пошли с первого месяца; сломалась бы интеграция — в первой строке был бы красный ноль. |
| PubC-02 | готов *(с оговоркой)* | **CPI by country** — `Puzzle Game · Country · Installs, Ad Revenue, CPI, ROAS D7 / D30, Retention D1 · Table`. *Оговорка:* CPI и ROAS по странам масштабируются одной формулой, поэтому у US одновременно самый высокий CPI и самый высокий ROAS — правдоподобно, но не по данным (правка B). |
| PubC-03 | нужны данные | **Prototype retention** — `Puzzle Game · Activity Date · Retention D1, Retention D7, Stickiness, Installs, DAU · Lines`. D1 39.8% → 45.1%. **Для PubC ключевая пара D1/D3 — нужна метрика Retention D3 (r2, правка H).** |
| PubC-04 | готов | **Session engagement** — `Idle Tycoon · Activity Date · AVG Session Duration, AVG Session Count, Time per User, DAU · Lines`. 10.8 → 14.5 мин при ×3 аудитории — масштабируемый прототип, а не «ядро фанатов». |
| PubC-05 | готов | **Prototype monetisation** — `Puzzle Game · Activity Date · Ad Revenue, Ad ARPDAU, eCPM, Impressions, DAU, Fill Rate · Table`. ARPDAU +69% — монетизация улучшается на пользователя, не только за счёт DAU. |
| PubC-06 | другой экран | Креативы и их перформанс — экран Creatives. |
| PubC-07 | другой экран | Self-service тест прототипа — онбординг в Applications. |

### Pub — паблишинг

| Код | Статус | Пресет |
|---|---|---|
| Pub-01 | нужны данные | **Publisher profit** — `Stack Tower · Activity Date · Profit (Calendar), Ad Revenue, ROAS D7 / D30, ROAS, To-Date, Installs, CPI · Table`. Profit −$715 (Jul) → +$13,000 (Jan): два месяца в минус, выход в плюс в сентябре. **Нужны UA Cost, App Profit (m4), Net Income после комиссии (правка H).** |
| Pub-02 | нужны данные | **ROAS payback trend** — `Stack Tower · Activity Date · ROAS D7 / D30, ROAS, To-Date, eROAS Forecast D60, CPI, Installs, Profit (Calendar) · Lines`. То, что в июле возвращалось к D30, в январе — к D7. **История просит «по дням и источникам» — нужна разбивка UA Source (правка H).** |
| Pub-03 | нужны данные | **App economics overview** — `Idle Tycoon · Activity Date · Ad Revenue, IAP Revenue, Ad ARPDAU, LTV, ROAS D7 / D30, ROAS, To-Date, Retention D30 · Table`. LTV, ROAS и удержание растут одновременно — проект, в который стоит доливать. **Нужны Payback Days (m35), Total Revenue (m41), разбивка App для сравнения проектов.** |
| Pub-04 | готов | **Lifetime cohort behaviour** — `Idle Tycoon · Install date on · Activity Date · Time per User (Lifetime), Sessions per User — Lifetime, Avg Lifetime Days, Retention D30, Time per User — Daily, Sessions per User — Daily · Table`. Свежие когорты живут на 17 дней дольше и проводят в игре на 6 часов больше за жизнь. |
| Pub-05 | не показать | Воронки по событиям — нет event-level данных и представления «воронка». Отдельный экран Funnels. |
| Pub-06 | готов | **ARPU forecast curve** — демо-набор №9 |
| Pub-07 | нужны данные | **LTV trend signal** — `DriveCSX · Activity Date · LTV, eROAS Forecast D365, Ad ARPDAU, Retention D30, DAU · Lines`. LTV вниз три месяца подряд при растущем DAU — сигнал перераспределить команду. **Для сути решения нужна разбивка App: растущий Idle рядом с падающим DriveCSX (правка A).** |
| Pub-08 | другой экран | Светофор здоровья проекта — бейдж на карточке приложения / Home. |
| Pub-09 | готов | **A/B test verdict** — `Stack Tower · SDK Version = CAS 3.9.2 + CAS 4.8.1 beta4 · A/B Group · Outcome, ARPU uplift %, Probability to be better, p-value, Ad ARPU, Active Users per Ad, DAU Parity, SRM p-value · Table`. `worse · hold`, −3.65%, p ≈ 0.004, сплит честный. Вариант MON-01 глазами паблишера — вердикт первой колонкой. |
| Pub-10 | не показать | Тренды рынка — нужны внешние сторовые данные (Sensor Tower / Mira). |
| Pub-11 | другой экран | Креативы × сети — экран Creatives; разбивка Network в Reports — сети медиации, не UA-каналы. |

### INT · PM · PO — партнёрство и продакт-оунеры

| Код | Статус | Пресет |
|---|---|---|
| INT-01 | готов | **Shared report link** — демо-набор №10 |
| PM-01 | нужны данные | **Manager portfolio: app drill-down** — `DriveCSX · Manager = Rashid Sabirov · Activity Date · Ad Revenue, eCPM, DAU, Ad ARPDAU · Table`. Менеджер без 1С видит: DAU клиента растёт, а eCPM с ноября падает (под коэффициентом менеджера ≈ 5.95 → 4.55). По замечанию критиков: было копией GM-01 с мёртвой колонкой Anomaly Flag (всегда «No»); All Apps в Reports показывает данные Puzzle, а не сумму портфеля. **Суть истории «какое из приложений просело» — нужна разбивка App (правка A).** |
| PM-02 | готов *(с оговоркой)* | **SDK upgrade argument** — демо-набор №7 |
| PO-01 | готов | **Revenue drop cause** — демо-набор №2 |
| PO-02 | нужны данные | **Changes timeline — DriveCSX 4.2.0** — `DriveCSX · Activity Date · eCPM, Ad Revenue, Impressions, DAU · Lines`. Излом eCPM ровно на отметке «Релиз 4.2.0». **Нужен слой событий на графике (правка D) и хронологический порядок оси X (правка I).** По данным излом между ноябрём и декабрём — событие датировать концом ноября. |
| PO-03 | готов *(с оговоркой)* | **App version cohort eCPM** — демо-набор №4 |
| PO-04 | готов | **Single source of truth** — `DriveCSX · Activity Date · Ad Revenue, eCPM, DAU, DAU Discrepancy, Network Data Gap, Revenue by SDK Version · Table`. Бизнес-метрики и сверка источников в одной строке; те же строки открывают AN-01 и MON-01. Anomaly Flag убран — он захардкожен «No». |

### MON · AN — монетизаторы и аналитики

| Код | Статус | Пресет |
|---|---|---|
| MON-01 | готов *(есть)* | **SDK A/B decision** — демо-набор №6 |
| MON-02 | нужны данные | **Config change timeline** — `DriveCSX · Activity Date · eCPM, Fill Rate, Ad Revenue, Impressions, DAU · Lines`. eCPM ровно держится 5.39–5.51 до октября и ломается. **Нужны вертикальные маркеры «поменяли флоры для US/DE 12 ноя» (правка D) — иначе монетизатор видит только следствие.** |
| MON-03 | нужны данные *(есть)* | **Revenue drop decomposition** — `DriveCSX · Activity Date + Ad Type · Ad Revenue, Impressions, eCPM, Impressions / DAU, Fill Rate, DAU · Table`. Дерево: DAU и показы растут → упала цена. Изменение к текущему: DriveCSX вместо Puzzle. **Подстроки Ad Type масштабируют eCPM от доли — падение одинаково во всех форматах, шаг «по какому формату» ничего не даёт; нужны свои eCPM по форматам, где просадка в Interstitial (правка B).** |
| MON-04 | готов | **Fill rate losses** — `Stack Tower · SDK Version: all · SDK Version · Fill Rate, Impressions / DAU, Impressions, eCPM, Ad Revenue, DAU · Table`. Дырка в заполняемости сидит на старых SDK: 87–90% у 315K DAU против 93.5% — аргумент за апдейт, не за тюнинг waterfall. |
| AN-01 | нужны данные *(есть)* | **Network drop detection** — `DriveCSX · Activity Date + Network · Impressions, eCPM, Ad Revenue, Network Data Gap, Anomaly Flag · Table`. Задумано: Meta AN в декабре — ноль показов, флаг Yes, gap 100%. **Сейчас все флаги «No», gap плавный 1–3%, отвалившихся сетей нет (правка C).** Подсветка аномалий сравнивает с предыдущей строкой — при подстроках это другая сеть; сравнивать нужно с той же сетью за прошлый месяц. |
| AN-02 | нужны данные | **Source consistency check** — `Stack Tower · Activity Date · DAU Discrepancy, Anomaly Flag, DAU, Impressions, Ad Revenue · Table`. Должна быть норма 2–3% и один выброс 12–15% с флагом. **Ряд сейчас монотонный (правка C); нужна метрика Impressions Discrepancy — CAS Events vs отчёты сетей (правка H).** |
| AN-03 | нужны данные | **1C revenue reconciliation** — `All Apps · Activity Date · Ad Revenue, Revenue (1C), Δ vs 1C, Δ vs 1C %, Anomaly Flag · Table`. Шесть месяцев Δ = 0, один — −$412 / −1.8% с подсветкой. **Метрик раздела finance нет вовсе (правка H); нужен gross/net-тумблер (Admin-06).** |

### GM · Admin — руководители и администраторы

| Код | Статус | Пресет |
|---|---|---|
| GM-01 | нужны данные *(есть)* | **Portfolio by manager** — `All Apps · Manager = Anton Smirnov · Activity Date · Ad Revenue, DAU, Ad ARPDAU, eCPM, Impressions, Fill Rate · Table`. Ведущий переключает App на DriveCSX — там просадка. **All Apps подставляет данные Puzzle; портфельная картина «что растёт, что проседает» требует разбивки App (правка A).** |
| GM-02 | нужны данные | **Holding revenue rollup** — `All Apps · Activity Date · Ad Revenue, IAP Revenue, DAU, Ad ARPDAU · Table`. **MRR / ARR / Revenue Growth % (m1–m3) в наборе нет, разбивки по бизнес-юнитам нет (правка H); сходимость сумм показать нечем.** |
| GM-03 | готов | **Shared source of truth** — `DriveCSX · Activity Date · eCPM, Ad Revenue, Impressions, DAU, Fill Rate, DAU Discrepancy · Table`. Тот самый спор «аналитика видит падение CPM, медиация — всё в порядке»: упала цена, не трафик, данные не битые (Discrepancy < 5%). Глава BU в разбор не нужен. |
| Admin-01 | нужны данные | **All clients revenue trend** — `All Apps · Activity Date · Ad Revenue, DAU, Ad ARPDAU, Impressions, eCPM · Lines`. Сужение «все → менеджер → клиент». **All Apps не суммирует; история просит по дням, а есть месяцы (правки A, F).** |
| Admin-02 | нужны данные | **Client comparison table** — `All Apps · Manager = Rashid Sabirov · Customer · Ad Revenue, DAU, eCPM, Ad ARPDAU, Impressions, Fill Rate · Table`. **Нужна разбивка Customer (правка G).** |
| Admin-03 | нужны данные | **Portfolio anomaly scan** — `All Apps · Activity Date · Ad Revenue, DAU, Ad ARPDAU, Anomaly Flag, DAU Discrepancy, Network Data Gap · Table`. **Ряды растут плавно, флаг всегда false — зрителю нечего поймать; нужны инъекции (правка C) и разбивка Customer (G).** |
| Admin-04 | другой экран | Экспорт для руководства — Export поверх GM-01. PDF нет. |
| Admin-05 | нужны данные | **Client all apps** — `All Apps · Customer = #2 · Activity Date · Ad Revenue, DAU, Ad ARPDAU, eCPM, Impressions · Table`. **Мультивыбор Customer/App с Select All и связка клиент → его приложения (правка G).** |
| Admin-06 | нужны данные | **Gross vs net eCPM** — `DriveCSX · Network · eCPM, Ad Revenue, Impressions, Network Bid Price · Table`. **Нужен тоггл Gross / Net в тулбаре (состояние adminGrossNet в коде есть) и комиссия per app (правка J).** |
| Admin-07 | другой экран | Карточка приложения — Applications; в Reports её часть покрыта фильтром Manager. |

### RND — R&D

| Код | Статус | Пресет |
|---|---|---|
| RND-01 | готов | **SDK revenue impact** — `Stack Tower · SDK Version: all · SDK Version · Ad ARPDAU, eCPM, Fill Rate, Impressions / DAU, DAU, AVG Session Count · Table`. Бета не даёт обещанных +3%: на самой большой аудитории ARPDAU на 3.65% ниже 3.9.2; 84K DAU на бете далеко от критерия 500K. Зато 3.8.x → 3.9.2 поднял ARPDAU с $0.0263 до $0.0356 — вот где аргумент. Ad Revenue убран (см. правку данных Stack Tower). |
| RND-02 | нужны данные *(есть)* | **SDK adoption speed** — `Stack Tower · SDK Version: all · Activity Date + SDK Version · DAU, Ad ARPDAU, eCPM, Fill Rate · Table / Bars`. **Доли версий одинаковы во всех месяцах — кривой адопшена нет; нужны помесячные доли и метрика «DAU share %» (правки F, H).** |
| RND-03 | нужны данные | **Clients on old SDK** — `All Apps · SDK Version = CAS 3.7.1, CAS 3.6.0 · SDK Version · DAU, Ad ARPDAU, eCPM, Fill Rate · Table`. Видно, сколько денег «зависло» на старых SDK, но не у каких клиентов. **Нужна разбивка Customer и поле sdkVersion у клиентов (правка G); метрика «Revenue loss vs latest SDK» (H).** |
| RND-04 | готов | **A/B config compare** — `Stack Tower · SDK Version: all · A/B Group · eCPM, Fill Rate, Ad Revenue, Ad ARPU, ARPU uplift %, Probability to be better, p-value, DAU Parity · Table`. Гипотеза «новая конфигурация улучшит монетизацию» не подтвердилась — и это не шум. *A/B пока только по версиям SDK; для конфигураций медиации нужны тесты типа Config (H).* |
| RND-05 | готов | **Client diagnostics** — `All Apps · Customer = #1554 · Activity Date + Network · DAU, DAU Discrepancy, Impressions, Fill Rate, eCPM, Network Data Gap, Anomaly Flag · Table`. Один выбор клиента — полный L2-scope без запроса к аналитике; ссылку через Share. |
| RND-06 | нужны данные | **VIP setup uplift** — `Idle Tycoon · Activity Date · Ad Revenue, eCPM, Fill Rate, Ad ARPDAU, Impressions / DAU, DAU · Lines`. eCPM +39%, Impr/DAU +25%. **Без отметки «VIP setup applied» зритель не видит границу до/после (правка D); Compare должен считать дельту (E).** |
| RND-07 | нужны данные | **Mediation platform compare** — `Stack Tower · Mediation Platform · Ad Revenue, eCPM, Fill Rate, Impressions · Table`. **Измерения «платформа медиации» нет; rev_by_platform / ecpm_by_platform — синтетика 55% и ×1.08 (правка H).** |

### UA · BD — закупка и бизнес-девелопмент

| Код | Статус | Пресет |
|---|---|---|
| UA-01 | нужны данные *(есть)* | **ROAS payback by app** — `Stack Tower · Activity Date · ROAS D7 / D30, ROAS, To-Date, CPI, Installs, Profit (Calendar), Ad Revenue · Table`. Точка окупаемости в сентябре (ROAS 98 → 108%). **«Все приложения в одной таблице» — нужна разбивка App: Idle 178% / Puzzle 152% / Stack 138% / DriveCSX 118% (правка A).** |
| UA-02 | готов | **Scale decision LTV CPI** — демо-набор №8 |
| UA-03 | нужны данные | **UA spend control** — `Stack Tower · Activity Date · Installs, CPI, Profit (Calendar), Ad Revenue · Bars`. Спенд виден только косвенно через Profit. **Нужна метрика UA Cost (m31; поле uaCost в данных есть) и дневная гранулярность (правки H, F).** |
| UA-04 | нужны данные | **Traffic source comparison** — `Idle Tycoon · Country · Installs, Ad Revenue, ROAS D7 / D30, CPI, LTV · Table`. Страны как временный прокси источников. **Нужна разбивка UA Source / Campaign из Tenjin с независимыми CPI/ROAS (правки B, H).** |
| UA-05 | готов | **ROAS forecast early** — `Idle Tycoon · Activity Date · ARPU Forecast D7, ARPU Forecast D14, ARPU Forecast D30, eROAS Forecast D60, eROAS Forecast D365, ROAS D7 / D30, CPI · Table`. eROAS D60 почти 300% в январе — окупаемость подтверждается на первой неделе. |
| BD-01 | нужны данные | **My clients health** — `All Apps · Manager = Serhii Shcherbyna · Activity Date · Ad Revenue, DAU, Ad ARPDAU, eCPM, Installs · Lines`. Пересекается с GM-01. **Строки-клиенты (правка G) — без них «заметить проблему у конкретного клиента» нельзя.** |
| BD-02 | другой экран | Кандидаты на upsell — фильтр в Admin Hub → Customers: Client Type = L1, DAU > 100K, growth > 0. |
| BD-03 | нужны данные | **Churn risk watch** — `DriveCSX · Activity Date · Ad Revenue, eCPM, DAU, Ad ARPDAU · Table`. Выручка клиента падает два месяца при растущей аудитории — ломается монетизация, не продукт. **Подсветка ловит только > 50%, а −14% и −22% остаются незамеченными; нужна метрика Churn Risk Score и разбивка Customer (правки G, H).** |
| BD-04 | другой экран | Брендированный PDF — диалог в карточке клиента (Admin Hub). |
| BD-05 | другой экран | Воронка лидов HubSpot — виджет в Admin Hub, не аналитика приложений. |

---

## Что нужно добавить в прототип

По убыванию числа разблокируемых историй.

**A. Разбивка App и реальный агрегат All Apps** — сейчас All Apps в Reports подставляет данные Puzzle Game, разбивки по приложению нет. Разблокирует L1-04, PM-01, GM-01, GM-02, Admin-01, Admin-03, Admin-05, UA-01, UA-03, Pub-03, Pub-07, BD-01 и кросс-клиентский RND-01. **Самая ценная правка: без неё не показать ни одну портфельную историю.**

**B. Собственные значения ставок по сегментам** для разбивок Ad Type, Network, Country (и будущих UA Source). Сейчас неаддитивные метрики (eCPM, Fill Rate, ARPDAU, CPI, ROAS) считаются как `база × (0.82 + доля × 1.15)` — отсюда eCPM Rewarded ниже Banner, Fill Rate > 100% у AppLovin, у US одновременно самый дорогой CPI и самый высокий ROAS. Для сетей значения уже есть в `networksTable` (включая Bigo Ads и Kidoz с нулями) — брать их, как сделано для версий. Разблокирует L1-06, L1-07 (ставки), L2-07, L2-12, MON-03, MON-04 по сетям, PubC-02, UA-04.

**C. Сюжеты аномалий в данных**: `anomaly_flag` захардкожен `false`, `network_gap` и `dau_discrepancy` — плавная синтетика. Нужны: отвал Meta AN у DriveCSX в декабре (0 показов, gap 100%, флаг Yes), просадка eCPM ironSource −55% в январе, выброс DAU Discrepancy 13.8% у Stack Tower в ноябре; флаг считать из падений, а не хранить константой; подсветку в подстроках сравнивать с той же сетью за прошлый месяц. Разблокирует L1-08, AN-01, AN-02, Admin-03, BD-03.

**D. Слой событий на линейном графике**: массив `events` на приложение `{date, type: release|sdk|config|ua, label}` и вертикальные маркеры с подписью. Для DriveCSX: «CAS 3.9.2 rollout» (сен), «Релиз 4.2.0» (конец ноября — излом eCPM между ноябрём и декабрём), «Правка флоров» (дек), «Бета 4.8.1» (янв). Разблокирует PO-02, MON-02, RND-06.

**E. Compare должен считать**: сейчас переключатель только меняет подпись, колонок Δ% нет. Все пресеты с `compare` обещают зрителю то, чего экран не показывает. Пока — не включать на демо.

**F. Помесячные доли версий и дневная гранулярность**: доли версий одинаковы во всех месяцах — кривой адопшена нет (L2-09, RND-02). Дневные ряды есть только у A/B (14 дней); Admin-01, UA-03, L2-09 просят «по дням».

**G. Разбивка Customer** (строки-клиенты из adminData с DAU/Revenue) и мультивыбор в Customer/App с Select All. Разблокирует PM-01, Admin-02, Admin-03, Admin-05, RND-03, BD-01, BD-03.

**H. Новые метрики** (с ID словаря): UA Cost (m31), App Profit (m4), Payback Days (m35, поле payback в данных есть), Retention D3 (r2), Total Revenue (m41), MRR/ARR/Revenue Growth % (m1–m3), NoFill Rate (m22), Requests (m49); без ID в словаре — Net Income после комиссии, Churn Risk Score, Revenue (1C) / Δ vs 1C, Impressions Discrepancy, DAU share % by SDK, Revenue loss vs latest SDK. Новые измерения: Mediation Platform, UA Source / Campaign, Business Unit.

**I. Правки поведения**: `applyStoryPreset` всегда ставит вид Table — поле `view` пресетов игнорируется (ломает все Lines/Bars-пресеты); линейный график вне A/B рисует месяцы от нового к старому — ось времени задом наперёд; Install date не влияет на строки версий (значения берутся напрямую из таблицы версий).

**J. Gross / Net** тумблер в тулбаре (состояние `adminGrossNet` уже есть) и комиссия per app — Admin-06, AN-03.

**Правки данных**: у Stack Tower выручка по версиям SDK не сходится с DAU × ARPDAU (3.9.2: $11,200 при расчётных $41,900) — привести к правилу `revenue = dau × arpdau`; у DriveCSX нет блока UA-метрик — UA-02 и L2-05 работают, но Payback Days показать нечем.

---

## Истории вне Reports

| Код | Где живёт |
|---|---|
| L1-11 Data Freshness | шапка кабинета — уже есть |
| L2-10 Export Excel, Admin-04 отчёт руководству | тулбар Reports — Export CSV/Excel есть, PDF нет |
| L2-11 поиск по таблице | поле Search над таблицей — есть |
| L2-13 интеграция CAS ↔ MMP | карточка приложения (Applications) |
| PubC-06, Pub-11 креативы | экран Creatives |
| PubC-07 self-service тест | онбординг в Applications |
| Pub-08 светофор проекта | бейдж на карточке приложения / Home |
| Admin-07 карточка приложения | Applications |
| BD-02 кандидаты на upsell | Admin Hub → Customers, сохранённый фильтр |
| BD-04 брендированный PDF | диалог в карточке клиента |
| BD-05 воронка лидов | виджет Admin Hub, данные HubSpot |

**Не показать на фейковых данных:** L1-09 (группы приложений — нет сущности), Pub-05 (воронки по событиям — нет event-level данных), Pub-10 (тренды рынка — нет внешних сторовых данных).

---

## Замечания критиков, которые стоит обсудить

1. **Три пресета выглядят одинаково.** L1-01, INT-01, PO-01 и GM-03 — все «DriveCSX по месяцам с Revenue/eCPM/DAU». На демо зритель решит, что снова открыли дефолтный отчёт. Разведены порядком колонок и назначением: PO-01 — дерево причин, INT-01 — действие Share, GM-03 — колонки сверки. Стоит показывать не больше двух из них.
2. **Compare обещает то, чего нет.** Проектировщики включили его в 12 пресетов; критики сняли везде, где он не считает. Либо реализовать Δ%, либо не включать на демо.
3. **All Apps — это Puzzle Game.** Восемь предложений исходили из того, что All Apps суммирует портфель. Пока правка A не сделана, все портфельные пресеты показывают данные одного приложения, умноженные на коэффициент менеджера.
4. **Мёртвые метрики дискредитируют экран.** Anomaly Flag всегда «No», Network Data Gap плавный — колонка из семи «No» на демо выглядит как неработающая фича. До правки C эти метрики из пресетов убраны.
5. **Формулы масштабирования дают абсурд там, где зритель знает правильный ответ.** eCPM Rewarded ниже Banner и Fill Rate > 100% заметит любой из зала. Это блокер для L1-06 и всех разбивок по сетям со ставками.
6. **Половина «ready»-историй закрыта наполовину.** PM-02 показывает «сколько теряют», но не «какие клиенты»; RND-03 — «сколько зависло на старых SDK», но не у кого. Клиентская ось (разбивка Customer) — второй по важности пробел после App.
