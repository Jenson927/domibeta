# Vue 3 全量重构计划 — domibeta 积分管理系统

## TL;DR

> **Quick Summary**: 将 domibeta 从单文件 vanilla JS (9071行) 全量重构为 Vue 3 + Vite + Pinia + TypeScript + Tailwind CSS 现代应用，1:1保留所有14个功能模块，重写样式并允许视觉重新设计，完整测试覆盖。
> 
> **Deliverables**:
> - Vue 3 + Vite 项目骨架
> - 5个 Pinia stores (kids, rewards, addReasons, deductReasons, systemConfig)
> - 30+ Vue 组件 (覆盖所有14个功能模块)
> - Tailwind CSS 样式系统
> - Vitest 单元/组件测试 + Playwright E2E 测试
> - localStorage 数据兼容层
> - GitHub Pages 自动部署 workflow
> 
> **Estimated Effort**: XL
> **Parallel Execution**: YES - 5 waves
> **Critical Path**: Task 1 -> Task 3 -> Task 4 -> Task 8 -> Task 11 -> Task 18 -> Task 20 -> F1-F4

---

## Context

### Original Request
用户希望将 domibeta (儿童积分管理系统) 从单文件 vanilla HTML/JS/CSS 架构重构为 Vue 3 现代框架应用。

### Interview Summary
**Key Discussions**:
- 重构策略: 全量一次性重构 (非渐进式)
- 功能范围: 1:1保留所有14个功能模块
- 样式方案: Tailwind CSS 重写，允许视觉重新设计
- 测试策略: 完整测试 (Vitest + Playwright)，tests-after + per-module QA gates
- 数据兼容: 必须兼容现有 localStorage 数据
- 分支策略: dev 分支开发，验证通过合并到 main

**Research Findings**:
- 项目为单文件 index.html，9071行 (CSS ~2200行 + HTML ~800行 + JS ~6000行)
- 数据存储在 localStorage，全局变量：kids, rewards, addReasons, deductReasons, systemConfig
- ~30处 innerHTML 拼接，~50处 onclick 内联事件，5处重复的 emoji 选择框
- 轮播拖拽、转盘动画、头像裁剪 Canvas 等复杂交互
- 数据模型字段不一致：points / pointsUsed / totalPoints / pointsConsumed

### Metis Review
**Identified Gaps** (addressed):
- 性能预算未定义 -> 默认: bundle <300KB gzipped, FCP <2s
- 浏览器支持未定义 -> Chrome/Safari/Firefox last 2 versions
- 测试策略未明确 -> tests-after + per-module QA gates
- Canvas + Vue 兼容性 -> Canvas 保持 imperative，通过 refs 挂载
- 数据模型不一致 -> TypeScript 类型镜像当前格式，不规范化
- 多标签页 localStorage -> 不处理 (与当前行为一致)

---

## Work Objectives

### Core Objective
将 domibeta 从单文件 vanilla JS 应用全量重构为 Vue 3 + Vite + Pinia + TypeScript + Tailwind CSS 应用，所有功能1:1保留，样式 Tailwind 重写允许重新设计，数据兼容现有 localStorage，完整测试覆盖。

### Concrete Deliverables
- src/ 目录下完整的 Vue 3 项目结构
- package.json + vite.config.ts + tsconfig.json + tailwind.config.ts
- 5个 Pinia stores
- 30+ Vue 组件
- Vitest + Playwright 测试套件
- GitHub Actions 部署 workflow
- localStorage 数据迁移兼容层

### Definition of Done
- [ ] npm run build 成功输出到 dist/
- [ ] npm run test 所有 Vitest 测试通过
- [ ] Playwright E2E 测试覆盖所有14个功能模块
- [ ] 现有 localStorage 数据可正常加载
- [ ] GitHub Pages 可访问并功能完整
- [ ] 所有 Must NOT Have 条目不存在于代码中

### Must Have
- 所有14个功能模块1:1行为保留
- localStorage 旧数据兼容
- Pinia 状态管理 (5个store)
- TypeScript 类型定义
- Tailwind CSS 样式
- Vitest 单元测试
- Playwright E2E 测试
- GitHub Pages 部署
- 通用 Modal 组件 (替代15个重复模态框结构)
- 通用 EmojiSelect 组件 (替代5处重复)
- 轮播拖拽交互保留 (useSwipe composable)
- 转盘抽奖动画保留 (Canvas imperative)
- 头像裁剪保留 (Canvas imperative)
- 数据导入导出功能保留

### Must NOT Have (Guardrails)
- Vue Router (当前 SPA + 模态框，不加路由)
- 新 npm 依赖超出约定栈 (vue, vite, pinia, typescript, tailwindcss, vitest, playwright 及 peer deps)
- 数据模型规范化 (TypeScript 类型镜像当前 localStorage 格式，含不一致字段名)
- IndexedDB (保持 localStorage)
- PWA / Service Worker
- i18n 系统 (中文 only)
- 暗黑模式
- 新功能模块
- pinia-plugin-persistedstate (自定义 localStorage 同步，匹配当前格式)
- Canvas 动画改 Vue reactive 模板 (保持 imperative + refs)
- Tailwind @apply 抽象层 (utility-first 直用)
- 视觉重新设计改变布局位置/模态框层级/信息层级/点击目标大小

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: NO (new project)
- **Automated tests**: YES (tests-after + per-module QA gates)
- **Framework**: Vitest (unit/component) + Playwright (E2E)
- **Test approach**: 每个模块先实现 -> 再写测试 -> agent 验证 -> 标记完成

### QA Policy
Evidence saved to .omo/evidence/task-{N}-{scenario-slug}.{ext}.
- **Frontend/UI**: Playwright
- **Business logic**: Vitest
- **E2E flows**: Playwright
- **Data compatibility**: Vitest

---

## Execution Strategy

### Parallel Execution Waves

Wave 1 (Foundation - 7 tasks):
  1. Project scaffold + Vite config + Tailwind setup [quick]
  2. TypeScript type definitions [quick]
  3. Pinia stores + localStorage sync layer [deep]
  4. Core layout shell (App.vue + Header) [visual-engineering]
  5. Generic Modal + FormGroup + EmojiSelect [quick]
  6. Login screen + password logic [quick]
  7. Data import/export module [unspecified-high]

Wave 2 (Core features - 7 tasks):
  8. Member carousel + useSwipe composable [deep]
  9. Add points modal + reason management [unspecified-high]
  10. Deduct points modal + reason management [unspecified-high]
  11. Exchange system [deep]
  12. Week stats + progress bar [quick]
  13. Daily quote + riddle modules [quick]
  14. Recent activity panel [quick]

Wave 3 (Complex features - 5 tasks):
  15. Draw/lottery system [deep]
  16. Avatar upload + Canvas crop [unspecified-high]
  17. History records [deep]
  18. Settings panel [unspecified-high]
  19. Reward pool management [unspecified-high]

Wave 4 (Integration + Testing + Deploy - 3 tasks):
  20. Cross-module integration testing [deep]
  21. Full Vitest unit test suite [unspecified-high]
  22. GitHub Pages deployment workflow + rollback [quick]

Wave FINAL (4 parallel reviews):
  F1. Plan compliance audit (oracle)
  F2. Code quality review (unspecified-high)
  F3. Real manual QA (unspecified-high + playwright)
  F4. Scope fidelity check (deep)

### Dependency Matrix

| Task | Blocked By | Blocks |
|------|-----------|--------|
| 1 | - | 2-7, all subsequent |
| 2 | 1 | 3, 8-22 |
| 3 | 1, 2 | 6-22 |
| 4 | 1 | 6, 8, 14 |
| 5 | 1 | 9-22 |
| 6 | 3, 4 | 18 |
| 7 | 3 | 18 |
| 8 | 3, 4 | 12, 14 |
| 9 | 3, 5 | 12 |
| 10 | 3, 5 | 12 |
| 11 | 3, 5 | 12 |
| 12 | 8-11 | 20 |
| 13 | 3 | 20 |
| 14 | 3, 8 | 20 |
| 15 | 3, 5 | 20 |
| 16 | 3, 5 | 20 |
| 17 | 3 | 20 |
| 18 | 6, 7 | 20 |
| 19 | 3, 5 | 20 |
| 20 | 12-19 | 21 |
| 21 | 20 | F1-F4 |
| 22 | 1 | F1-F4 |

### Agent Dispatch Summary

- Wave 1: 7 - T1 quick, T2 quick, T3 deep, T4 visual-engineering, T5 quick, T6 quick, T7 unspecified-high
- Wave 2: 7 - T8 deep, T9 unspecified-high, T10 unspecified-high, T11 deep, T12 quick, T13 quick, T14 quick
- Wave 3: 5 - T15 deep, T16 unspecified-high, T17 deep, T18 unspecified-high, T19 unspecified-high
- Wave 4: 3 - T20 deep, T21 unspecified-high, T22 quick
- FINAL: 4 - F1 oracle, F2 unspecified-high, F3 unspecified-high, F4 deep
- [ ] 1. Project scaffold + Vite config + Tailwind setup

  **What to do**: Initialize Vite+Vue3+TS project. Configure vite.config.ts (Vue plugin, @ alias, base '/domibeta/', build). Install+configure Tailwind CSS v4. Install Pinia, Vitest, @vue/test-utils, @playwright/test, ESLint, Prettier. Create src/main.ts, src/App.vue shell, src/styles/main.css with @tailwind directives. Move old index.html to legacy/index.html. Create .gitignore, package.json scripts (dev/build/test/test:e2e/lint/typecheck).

  **Must NOT do**: No Vue Router, no UI component lib, no animation lib, no pinia-plugin-persistedstate

  **Recommended Agent Profile**: Category: quick. Skills: []

  **Parallelization**: Blocks: 2-7 and ALL subsequent. Blocked By: None. Wave 1.

  **References**: index.html (current 9071-line source for colors/structure), .github/workflows/auto-version.yml (CI patterns)

  **Acceptance Criteria**: npm run dev starts, npm run build outputs dist/, npm run test runs Vitest, legacy/index.html exists, Tailwind utilities render, ESLint/Prettier pass

  **QA Scenarios**:
  Scenario 1 (Bash): npm run dev -> verify Vite server starts. Evidence: .omo/evidence/task-1-dev-server.txt
  Scenario 2 (Bash): npm run build -> verify dist/ created, measure gzip size < 300KB. Evidence: .omo/evidence/task-1-build-output.txt

  **Commit**: YES - Message: feat: add Vue 3 project scaffold. Files: package.json, vite.config.ts, tsconfig.json, tailwind.config.ts, src/main.ts, src/App.vue, src/styles/main.css, .gitignore, legacy/index.html. Pre-commit: npm run build && npm run lint

- [ ] 2. TypeScript type definitions (mirror current localStorage schema)

  **What to do**: Read all localStorage data structures from index.html JS (search localStorage.setItem/getItem, global vars). Create src/types/ with: kid.ts (Kid interface with ALL fields including inconsistencies like pointsUsed/totalPoints/pointsConsumed), reward.ts (Reward: id/name/icon/weight), reason.ts (AddReason+DeductReason: id/name/icon/category), history.ts (PointsRecord/DrawRecord/ExchangeRecord mirroring current fields), config.ts (SystemConfig: exchangeRate/exchangeOptions/passwordHash), exchange.ts (ExchangeOption: name/description/points/unit/category/icon/builtin), index.ts (barrel export). Add JSDoc comments on inconsistent field names.

  **Must NOT do**: No data normalization, no field renaming, no new fields

  **Recommended Agent Profile**: Category: quick. Skills: []

  **Parallelization**: Blocks: 3, 8-22. Blocked By: 1. Wave 1.

  **References**: index.html:3044-6000 (JS with all data structures, localStorage ops). Search for localStorage.setItem, let kids/rewards/etc.

  **Acceptance Criteria**: src/types/*.ts created, types/index.ts exports all, npx vue-tsc --noEmit passes, every localStorage key+field has TS property

  **QA Scenarios**:
  Scenario 1 (Bash): npx vue-tsc --noEmit -> 0 errors. Evidence: .omo/evidence/task-2-typecheck.txt
  Scenario 2 (Bash grep): Grep localStorage.setItem calls, verify each key has type file. Evidence: .omo/evidence/task-2-coverage.txt

  **Commit**: YES - Wave 1 group. Files: src/types/*.ts

- [ ] 3. Pinia stores + localStorage sync layer

  **What to do**: Create src/stores/ with 5 Pinia stores: kidsStore (kids array, selectedKidId, actions: addKid/removeKid/addPoints/deductPoints/addExchange/addDraw/updateAvatar/updateChances, computed: currentKid/weekStats/totalPointsSummary), rewardsStore (rewards array, actions: add/edit/remove, computed: allRewards=DEFAULT+custom), addReasonsStore (addReasons, actions: add/edit/remove, computed: allAddReasons), deductReasonsStore (deductReasons, actions: add/edit/remove, computed: allDeductReasons), configStore (systemConfig, actions: updateExchangeRate/setPassword/clearPassword/verifyPassword/addExchangeOption/removeExchangeOption). Create src/stores/localStorageSync.ts (custom utility reading/writing current localStorage format, handle: empty state/corrupted data/missing keys with defaults). Create src/data/ with 4 default data files: defaultRewards.ts (reward pool), defaultReasons.ts (add reasons), defaultDeductReasons.ts (deduct reasons), defaultExchangeOptions.ts (exchange options). Quotes and riddles data files are created in Task 13..

  **Must NOT do**: No pinia-plugin-persistedstate, no data normalization, no IndexedDB, no field renaming

  **Recommended Agent Profile**: Category: deep. Skills: []

  **Parallelization**: Blocks: 6-22. Blocked By: 1,2. Wave 1.

  **References**: index.html:3044-6000 (all state mutation logic, localStorage read/write). Search DEFAULT_REWARDS, DEFAULT_ADD_REASONS, etc. src/types/*.ts (Task 2 interfaces).

  **Acceptance Criteria**: 5 stores with all actions, localStorageSync works (read/write current format), empty localStorage->defaults, corrupted->fallback, default data files extracted, Vitest store tests pass

  **QA Scenarios**:
  Scenario 1 (Vitest): Inject localStorage data, init stores, verify data matches. Evidence: .omo/evidence/task-3-store-load.txt
  Scenario 2 (Vitest): Clear localStorage, init stores, verify defaults. Evidence: .omo/evidence/task-3-empty-init.txt
  Scenario 3 (Vitest): Store write -> read localStorage -> verify format matches current app. Evidence: .omo/evidence/task-3-write-format.txt

  **Commit**: YES - Wave 1 group. Files: src/stores/*.ts, src/data/defaultRewards.ts, src/data/defaultReasons.ts, src/data/defaultDeductReasons.ts, src/data/defaultExchangeOptions.ts

- [ ] 4. Core layout shell (App.vue + Header + container)

  **What to do**: Create src/App.vue with layout matching current: header(top) -> carousel(center) -> info-panel(below) -> activity-list(bottom) -> settings-button. Create src/components/layout/AppHeader.vue (title, points summary, settings button). Create src/components/layout/SettingsButton.vue. Apply Tailwind CSS. Preserve layout positions. Add conditional rendering for login screen vs main app.

  **Must NOT do**: No layout position changes, no sidebar/navigation, no info hierarchy changes

  **Recommended Agent Profile**: Category: visual-engineering. Skills: []

  **Parallelization**: Blocks: 6,8,14. Blocked By: 1. Wave 1.

  **References**: index.html:2222-2309 (HTML body structure showing layout hierarchy)

  **Acceptance Criteria**: App.vue renders with header, carousel area, info panel, activity area, settings button. Layout positions match current. Login conditional rendering works.

  **QA Scenarios**:
  Scenario 1 (Playwright): Navigate, verify layout structure matches current spatial arrangement. Evidence: .omo/evidence/task-4-layout.png

  **Commit**: YES - Wave 1. Files: src/App.vue, src/components/layout/*.vue

- [ ] 5. Generic Modal + FormGroup + EmojiSelect

  **What to do**: Create src/components/common/AppModal.vue (generic modal wrapper: header with title+close, content slot, active/inactive via prop, click-outside-to-close, z-index stacking. Replace ~15 duplicate modal structures). Create src/components/common/FormGroup.vue (label+input/select wrapper with focus styling). Create src/components/common/EmojiSelect.vue (reusable emoji dropdown, props: modelValue, options, placeholder, uses v-model. Replace 5x duplication).

  **Must NOT do**: No shared component library, no @apply CSS, no micro-component over-splitting

  **Recommended Agent Profile**: Category: quick. Skills: []

  **Parallelization**: Blocks: 9-22. Blocked By: 1. Wave 1.

  **References**: index.html:851-960 (Modal CSS), :2516-2560 (Emoji select example), :2658-2684 (Another emoji select), :903-928 (FormGroup CSS)

  **Acceptance Criteria**: AppModal renders with slot content, opens/closes via prop, click-outside works. FormGroup renders label+input. EmojiSelect renders options, emits v-model update. No more than 3 common components.

  **QA Scenarios**:
  Scenario 1 (Playwright): Open modal, verify content visible, click close, verify hidden. Evidence: .omo/evidence/task-5-modal.png
  Scenario 2 (Vitest): Mount EmojiSelect, select option, verify emitted value. Evidence: .omo/evidence/task-5-emoji-select.txt

  **Commit**: YES - Wave 1. Files: src/components/common/*.vue

- [ ] 6. Login screen + password logic

  **What to do**: Create src/components/login/LoginScreen.vue (full-screen overlay with password input, submit button, hint text). Implement password logic in configStore (verifyMainPassword, setPassword, clearPassword actions). First-time detection: no password -> no login screen. Password stored in systemConfig.passwordHash (current format).

  **Must NOT do**: No real auth system, no JWT, no session management

  **Recommended Agent Profile**: Category: quick. Skills: []

  **Parallelization**: Blocks: 18. Blocked By: 3,4. Wave 1.

  **References**: index.html:2208-2220 (Login screen HTML), JS: verifyMainPassword(), handleMainLogin()

  **Acceptance Criteria**: LoginScreen renders. First-time (no password) -> auto-login. Password set -> login shown, correct password -> access, wrong -> rejection.

  **QA Scenarios**:
  Scenario 1 (Playwright): Clear localStorage, navigate, verify auto-login. Evidence: .omo/evidence/task-6-auto-login.png
  Scenario 2 (Playwright): Set password, navigate, enter wrong -> rejection, correct -> access. Evidence: .omo/evidence/task-6-password.png

  **Commit**: YES - Wave 1. Files: src/components/login/LoginScreen.vue, src/stores/configStore.ts (password actions)

- [ ] 7. Data import/export module

  **What to do**: Create src/utils/importExport.ts (exportAllData/importAllData matching current JSON format EXACTLY). Create src/components/settings/ImportExport.vue (UI for download JSON + file upload + parse). Import validates JSON structure and shows error for malformed data. Export produces identical JSON to current.

  **Must NOT do**: No CSV format, no cloud sync, no new export formats

  **Recommended Agent Profile**: Category: unspecified-high. Skills: []

  **Parallelization**: Blocks: 18. Blocked By: 3. Wave 1.

  **References**: index.html JS: exportData/importData/handleImportFile functions

  **Acceptance Criteria**: Export JSON matches current format. Import validates and restores. Malformed JSON -> error (not crash).

  **QA Scenarios**:
  Scenario 1 (Vitest): Export JSON, compare structure with current format. Evidence: .omo/evidence/task-7-export.txt
  Scenario 2 (Vitest): Import malformed JSON, verify error handling. Evidence: .omo/evidence/task-7-import-error.txt

  **Commit**: YES - Wave 1. Files: src/utils/importExport.ts, src/components/settings/ImportExport.vue

- [ ] 8. Member carousel + useSwipe composable

  **What to do**: Create src/composables/useSwipe.ts (touch/mouse drag handler: grab cursor, transform, 0.45s ease transition, grab/grabbing states, pointer-events:none for images). Create src/components/carousel/MemberCarousel.vue (carousel container with viewport, track, hint). Create src/components/carousel/MemberCard.vue (name, avatar, points, chances badge, action buttons). Current member via kidsStore.currentKid computed.

  **Must NOT do**: No carousel npm package, no simplified swipe (must match current drag feel)

  **Recommended Agent Profile**: Category: deep. Skills: []

  **Parallelization**: Blocks: 12,14. Blocked By: 3,4. Wave 2.

  **References**: index.html:88-300 (Carousel CSS), JS: carousel init, touch/mouse handlers, render function

  **Acceptance Criteria**: Carousel renders all cards. Swipe switches member with 0.45s ease. Touch+mouse drag work. Current member state updates. Hint text shows. Images not draggable during swipe.

  **QA Scenarios**:
  Scenario 1 (Playwright): 2+ members, swipe left -> verify member changes, swipe back -> verify original. Evidence: .omo/evidence/task-8-carousel.png
  Scenario 2 (Playwright): 1 member -> verify single card, no swipe confusion. Evidence: .omo/evidence/task-8-single-member.png

  **Commit**: YES - Wave 2. Files: src/composables/useSwipe.ts, src/components/carousel/*.vue

- [ ] 9. Add points modal + reason management

  **What to do**: Create src/components/points/AddPointsModal.vue (points input, reason select from addReasonsStore, custom reason toggle, time input). Uses AppModal, FormGroup, EmojiSelect. Create src/components/settings/AddReasonsManagement.vue (list/add/edit/delete reasons). Implement addPoints in kidsStore. Reason dropdown from addReasonsStore.allAddReasons.

  **Must NOT do**: No form validation library, no new validation rules

  **Recommended Agent Profile**: Category: unspecified-high. Skills: []

  **Parallelization**: Blocks: 12. Blocked By: 3,5. Wave 2.

  **References**: index.html:2311-2342 (Add points modal HTML), JS: addPoints() function

  **Acceptance Criteria**: Modal renders all fields. Points added correctly. Reason select populated (default+custom). Custom reason toggle. Time optional.

  **QA Scenarios**:
  Scenario 1 (Playwright+Vitest): Add 10 points with reason -> verify kid.points incremented, history recorded. Evidence: .omo/evidence/task-9-add-points.png
  Scenario 2 (Playwright): Select custom reason -> verify field appears, submit with custom reason. Evidence: .omo/evidence/task-9-custom-reason.png

  **Commit**: YES - Wave 2. Files: src/components/points/AddPointsModal.vue, src/components/settings/AddReasonsManagement.vue

- [ ] 10. Deduct points modal + reason management

  **What to do**: Create src/components/points/DeductPointsModal.vue (similar to AddPoints but red styling, deduct-reason select, negative points handling with confirm dialog per commit e8f75e5). Create src/components/settings/DeductReasonsManagement.vue. Implement deductPoints in kidsStore. Red warning for negative credits.

  **Must NOT do**: No preventing negative points if current app allows them

  **Recommended Agent Profile**: Category: unspecified-high. Skills: []

  **Parallelization**: Blocks: 12. Blocked By: 3,5. Wave 2.

  **References**: index.html:2344-2375 (Deduct modal), commit e8f75e5 (negative credits feature)

  **Acceptance Criteria**: Modal renders with red styling. Deduction works. Negative credits allowed with confirm. Red warning shown.

  **QA Scenarios**:
  Scenario 1 (Playwright): Kid with 50 points, deduct 10 -> verify 40. Evidence: .omo/evidence/task-10-deduct.png
  Scenario 2 (Playwright): Kid with 5 points, deduct 10 -> confirm dialog -> verify -5 with red warning. Evidence: .omo/evidence/task-10-negative.png

  **Commit**: YES - Wave 2. Files: src/components/points/DeductPointsModal.vue, src/components/settings/DeductReasonsManagement.vue

- [ ] 11. Exchange system

  **What to do**: Create src/components/exchange/ExchangeModal.vue (current points display, exchange options list with cost+description+quantity+exchange button). Create src/components/exchange/ExchangeOptionCard.vue. Create src/components/settings/ExchangeManagement.vue (list builtin+custom, add/edit/delete). Implement exchange action in kidsStore (deduction+history). Exchange options from configStore (DEFAULT_EXCHANGE_OPTIONS+custom).

  **Must NOT do**: No new exchange categories, no changing calculation logic

  **Recommended Agent Profile**: Category: deep. Skills: []

  **Parallelization**: Blocks: 12. Blocked By: 3,5. Wave 2.

  **References**: index.html:2376-2463 (Exchange modal+management), JS: exchange logic, DEFAULT_EXCHANGE_OPTIONS

  **Acceptance Criteria**: ExchangeModal shows current points + options. Exchange deducts correct points + records history. Insufficient points -> disabled/warning. Management CRUD works.

  **QA Scenarios**:
  Scenario 1 (Vitest+Playwright): Kid 200pts, exchange 100pt option -> verify 100pts, history recorded. Evidence: .omo/evidence/task-11-exchange.png
  Scenario 2 (Playwright): Kid 50pts, option costs 100 -> disabled. Evidence: .omo/evidence/task-11-insufficient.png

  **Commit**: YES - Wave 2. Files: src/components/exchange/*.vue, src/components/settings/ExchangeManagement.vue

- [ ] 12. Week stats + progress bar

  **What to do**: Create src/components/stats/WeekStats.vue (weekly display: add/consume/exchange/draw/net). Create src/components/stats/ProgressBar.vue (points-to-next-reward progress). Implement weekStats computed in kidsStore (week date range, sum by category). Week starts Monday (timezone matching current).

  **Must NOT do**: No charts/graphs, no changing week start day

  **Recommended Agent Profile**: Category: quick. Skills: []

  **Parallelization**: Blocks: 20. Blocked By: 8-11. Wave 2.

  **References**: index.html:2272-2298 (Week stats HTML), :2264-2271 (Progress bar), JS: updateWeekStats(), updateProgress()

  **Acceptance Criteria**: WeekStats shows correct current week values. ProgressBar shows percentage. Week range starts Monday.

  **QA Scenarios**:
  Scenario 1 (Vitest): Known pointsHistory for current week -> verify weekStats computed values. Evidence: .omo/evidence/task-12-week-stats.txt

  **Commit**: YES - Wave 2. Files: src/components/stats/*.vue

- [ ] 13. Daily quote + riddle modules

  **References**: index.html:3391 (DAILY_QUOTES array, ~550 quotes), :3940 (DAILY_RIDDLES array, ~500 riddles), :5459 (quote daily selection logic: dayIndex = date-based deterministic), :5475 (riddle selection logic), :5525 (nextRiddle() function), :5540 (toggleRiddleAnswer() function), :2240-2257 (daily content HTML), :2877-2901 (riddles management modal), :2903-2923 (quotes management modal)

  **What to do**: Create src/components/daily/DailyQuote.vue (blue gradient box with title+content). Create src/components/daily/RiddleBox.vue (question, answer toggle, change button, reveal animation). Create src/components/settings/QuotesManagement.vue + RiddlesManagement.vue (add/delete custom). Extract ALL default quotes (~550+ items) and ALL default riddles (~500+ items) to src/data/defaultQuotes.ts + defaultRiddles.ts. Daily selection: date-based deterministic (same content same day).

  **Must NOT do**: No API calls, no new content beyond current

  **Recommended Agent Profile**: Category: quick. Skills: []

  **Parallelization**: Blocks: 20. Blocked By: 3. Wave 2.

  **Acceptance Criteria**: DailyQuote shows today's quote. RiddleBox toggles answer. Change button loads next. Management allows custom CRUD.

  **QA Scenarios**:
  Scenario 1 (Playwright): Navigate, verify quote non-empty, same quote same day. Evidence: .omo/evidence/task-13-quote.png
  Scenario 2 (Playwright): Click answer toggle -> verify shown, click change -> new riddle. Evidence: .omo/evidence/task-13-riddle.png

  **Commit**: YES - Wave 2. Files: src/components/daily/*.vue, src/components/settings/QuotesManagement.vue, RiddlesManagement.vue, src/data/defaultQuotes.ts, defaultRiddles.ts

- [ ] 14. Recent activity panel

  **What to do**: Create src/components/activity/RecentActivity.vue (activity list with icon, text, time, points). "View history" button opens HistoryModal. Max-height scrollable.

  **Must NOT do**: No infinite scroll, no pagination in recent activity

  **Recommended Agent Profile**: Category: quick. Skills: []

  **Parallelization**: Blocks: 20. Blocked By: 3,8. Wave 2.

  **References**: index.html:2303-2306 (Activity HTML), JS: renderRecentActivity()

  **Acceptance Criteria**: Shows latest operations. Items have icon, text, time, points. History button present.

  **QA Scenarios**:
  Scenario 1 (Playwright): Add points -> verify activity updated. Evidence: .omo/evidence/task-14-activity.png

  **Commit**: YES - Wave 2. Files: src/components/activity/RecentActivity.vue

- [ ] 15. Draw/lottery system (wheel animation + probability)

  **What to do**: Create src/components/draw/DrawModal.vue (scroll container, start button, chances display, time input). Create src/components/draw/DrawScroll.vue (3-row scroll animation: top, middle highlighted, bottom — imperative DOM via refs, NOT Vue reactive). Create src/components/draw/DrawResult.vue (icon, text, celebrate animation). Create src/components/draw/DrawParticles.vue (particle effect via Canvas/requestAnimationFrame refs). Implement draw in kidsStore: weighted random, chances=points/exchangeRate, history recording. Weighted probability matching current.

  **Must NOT do**: No animation library, no Vue reactive template for animations, Canvas stays imperative

  **Recommended Agent Profile**: Category: deep. Skills: []

  **Parallelization**: Blocks: 20. Blocked By: 3,5. Wave 3.

  **References**: index.html:2465-2498 (Draw modal), :1030-1083 (Draw scroll CSS), :1100-1274 (Wheel/particle/result CSS), JS: startDraw(), weighted random, particle creation

  **Acceptance Criteria**: DrawModal with chances+start. Scroll animation plays+stops. Particles on win. Points deducted. Probability distribution matches current (statistical test).

  **QA Scenarios**:
  Scenario 1 (Vitest+Playwright): Test weighted random distribution. Playwright: draw -> verify result, points deducted, history recorded. Evidence: .omo/evidence/task-15-draw.png
  Scenario 2 (Playwright): Kid 50pts, rate=100 -> chances=0, start disabled. Evidence: .omo/evidence/task-15-no-chances.png

  **Commit**: YES - Wave 3. Files: src/components/draw/*.vue

- [ ] 16. Avatar upload + Canvas crop

  **What to do**: Create src/components/member/AvatarUpload.vue (file input, preview with draggable/resizable crop circle via Canvas imperative refs, crop preview, save). Canvas crop stays imperative: mount via ref, mouse/touch drag for position, resize handle for size, render cropped result. Save avatar as base64 to kidsStore (current localStorage format).

  **Must NOT do**: No third-party crop library, no Vue reactive template for canvas

  **Recommended Agent Profile**: Category: unspecified-high. Skills: []

  **Parallelization**: Blocks: 20. Blocked By: 3,5. Wave 3.

  **References**: index.html:2925-2953 (Avatar modal), JS: handleAvatarFileSelect, cropAvatar, drag/resize logic

  **Acceptance Criteria**: File upload accepted. Crop circle draggable+resizable. Crop preview works. Save stores base64.

  **QA Scenarios**:
  Scenario 1 (Playwright): Upload image, drag crop, preview, save -> verify avatar updated. Evidence: .omo/evidence/task-16-avatar.png

  **Commit**: YES - Wave 3. Files: src/components/member/AvatarUpload.vue

- [ ] 17. History records (filter + pagination + edit)

  **What to do**: Create src/components/history/HistoryModal.vue (tabs: all/add/deduct/exchange/draw, member filter, pagination). HistoryFilter.vue (member+type select, apply/reset). HistoryList.vue (paginated items with icon/reason/points/date/edit button). HistoryPagination.vue (prev/next, page info). EditRecordModal.vue (change type/points/reason/reward/date, show original info, delete option). Implement filter+pagination logic.

  **Must NOT do**: No virtual scrolling, no new filter types, no CSV export of history

  **Recommended Agent Profile**: Category: deep. Skills: []

  **Parallelization**: Blocks: 20. Blocked By: 3. Wave 3.

  **References**: index.html:2843-2860 (History modal), :1945-2000 (Filter CSS), JS: historyModalFilter, renderHistoryModalList, edit record (8379-8900)

  **Acceptance Criteria**: History shows all records sorted newest-first. Filter by type/member works. Pagination (20/page). EditRecord saves correctly. Delete works. Edited mark shown.

  **QA Scenarios**:
  Scenario 1 (Playwright): Open history, filter "加分", select member, navigate pages. Evidence: .omo/evidence/task-17-history.png
  Scenario 2 (Playwright): Edit record -> modify -> save -> verify updated + "(已编辑)" mark. Evidence: .omo/evidence/task-17-edit.png

  **Commit**: YES - Wave 3. Files: src/components/history/*.vue

- [ ] 18. Settings panel

  **What to do**: Create src/components/settings/SettingsModal.vue (8 sections: password/exchange/draw-rewards/add-reasons/deduct-reasons/members/riddles/quotes/import-export). PasswordManager.vue (status/set/change/clear). MemberManagement.vue (member list+add/edit/delete/avatar). AddMemberModal.vue (name input). Settings password verification gate. Integrate all management sub-components from earlier tasks.

  **Must NOT do**: No new sections, no settings search

  **Recommended Agent Profile**: Category: unspecified-high. Skills: []

  **Parallelization**: Blocks: 20. Blocked By: 6,7 and all management components. Wave 3.

  **References**: index.html:2955-3043 (Settings modal), JS: settings password verification

  **Acceptance Criteria**: Settings shows all 8 sections. Password gate works. All management modals integrate. Settings button opens modal.

  **QA Scenarios**:
  Scenario 1 (Playwright): Click settings -> verify password gate -> verify all sections visible. Evidence: .omo/evidence/task-18-settings.png

  **Commit**: YES - Wave 3. Files: src/components/settings/*.vue, src/components/member/*.vue

- [ ] 19. Reward pool management

  **What to do**: Create src/components/settings/RewardManagement.vue (list builtin+custom, add with name/emoji/weight slider, edit, delete). Create src/components/draw/EditRewardModal.vue (edit name/icon/weight). Reward CRUD in rewardsStore. Weight slider 1-100 range.

  **Must NOT do**: No probability visualization, no new reward attributes

  **Recommended Agent Profile**: Category: unspecified-high. Skills: []

  **Parallelization**: Blocks: 20. Blocked By: 3,5. Wave 3.

  **References**: index.html:2500-2570 (Rewards management), :2572-2640 (Edit reward), JS: reward CRUD

  **Acceptance Criteria**: Reward list shows builtin+custom. Add/edit/delete works. Weight slider saves correctly.

  **QA Scenarios**:
  Scenario 1 (Playwright): Add reward -> verify in list -> edit weight -> save -> verify updated. Evidence: .omo/evidence/task-19-rewards.png

  **Commit**: YES - Wave 3. Files: src/components/settings/RewardManagement.vue, src/components/draw/EditRewardModal.vue

- [ ] 20. Cross-module integration testing

  **What to do**: Write comprehensive Playwright E2E tests: Login->add points->verify stats/progress/activity; Add->exchange->verify history; Add->draw->verify draw history; Settings->manage rewards->draw with new reward; Import->verify all modules; Export->verify JSON matches current. Write Vitest integration tests: addPoints->weekStats update; exchange->points deducted+history; draw->points deducted+history+chances.

  **Must NOT do**: No testing trivial formatters, no testing CSS styling

  **Recommended Agent Profile**: Category: deep. Skills: [playwright]

  **Parallelization**: Blocks: 21. Blocked By: 12-19. Wave 4.

  **Acceptance Criteria**: 5+ E2E scenarios, 5+ Vitest integration tests, all pass.

  **QA Scenarios**:
  Scenario 1 (Playwright): Full user flow: login, add 100pts, verify stats, exchange 50, verify history, draw with remaining, open history. Evidence: .omo/evidence/task-20-integration.png

  **Commit**: YES - Wave 4. Files: tests/e2e/*.spec.ts, tests/unit/integration/*.spec.ts

- [ ] 21. Full Vitest unit test suite

  **What to do**: Write Vitest unit tests for all business logic: kidsStore (addPoints/deductPoints/exchange/draw/weekStats/chances), rewardsStore (weighted random probability), configStore (password/rate), localStorageSync (read/write/empty/corrupted), importExport (format/validation/malformed), date utils (formatTime/week range). Concrete numeric assertions only.

  **Must NOT do**: No testing trivial formatters beyond formatTime/week range

  **Recommended Agent Profile**: Category: unspecified-high. Skills: []

  **Parallelization**: Blocks: F1-F4. Blocked By: 20. Wave 4.

  **Acceptance Criteria**: Tests for all 5 stores, localStorage compat tests (old-data-read/new-data-old-read), >50 test cases, all pass with concrete assertions.

  **QA Scenarios**:
  Scenario 1 (Bash): npm run test -> verify all pass, >50 cases. Evidence: .omo/evidence/task-21-test-results.txt

  **Commit**: YES - Wave 4. Files: tests/unit/*.spec.ts

- [ ] 22. GitHub Pages deployment workflow + rollback plan

  **What to do**: Create .github/workflows/deploy.yml (checkout->Node 20->npm ci->npm run build->deploy dist/ to Pages). Trigger: push to main only. Keep existing auto-version.yml. Configure vite base '/domibeta/'. Create rollback documentation: restore legacy/index.html if new app breaks.

  **Must NOT do**: No changing auto-version.yml, no Docker, no CDN beyond Pages

  **Recommended Agent Profile**: Category: quick. Skills: []

  **Parallelization**: Blocks: F1-F4. Blocked By: 1. Wave 4.

  **Acceptance Criteria**: deploy.yml valid. Push to main triggers deploy. Pages accessible at https://jenson927.github.io/domibeta/. Rollback docs exist.

  **QA Scenarios**:
  Scenario 1 (Bash): Verify deploy.yml syntax, trigger on push to main, build step uses npm ci&&npm run build. Evidence: .omo/evidence/task-22-deploy-workflow.txt

  **Commit**: YES - Wave 4. Files: .github/workflows/deploy.yml, vite.config.ts (base URL), ROLLBACK.md


- [ ] F1. Plan compliance audit

  **What to do**: Read the plan at .omo/plans/vue-refactor.md end-to-end. For each "Must Have" item: verify implementation exists by reading source files, running commands, checking components. For each "Must NOT Have" item: search the entire src/ codebase for forbidden patterns (vue-router imports, pinia-plugin-persistedstate, @apply in CSS, IndexedDB usage, i18n setup, dark mode classes, Canvas-in-Vue-template). Reject with file:line if found. Check all evidence files exist in .omo/evidence/. Compare deliverables list against actual files produced. Verify all 14 modules are functional.

  **Must NOT do**: No subjective "looks good" verdicts - every check must be binary pass/fail with evidence

  **Recommended Agent Profile**: Category: oracle (read-only). Skills: []

  **Parallelization**: Wave FINAL, parallel with F2-F4. Blocked By: ALL implementation tasks.

  **References**: .omo/plans/vue-refactor.md (Must Have/Must NOT Have lists), src/ (entire codebase to audit)

  **Acceptance Criteria**: Must Have checklist [N/N] all verified. Must NOT Have [N/N] all absent (grep finds 0 matches). Tasks [22/22] all have evidence files. Deliverables [N/N] all exist.

  **QA Scenarios**:
  Scenario: Must NOT Have absent from codebase
    Tool: Bash (grep)
    Steps:
      1. grep src/ for "vue-router" -> 0 matches
      2. grep src/ for "pinia-plugin-persistedstate" -> 0 matches
      3. grep src/ for "@apply" in .css files -> 0 matches
      4. grep src/ for "IndexedDB" or "idb" -> 0 matches
      5. grep src/ for "createI18n" or "useI18n" -> 0 matches
      6. grep src/ for "dark:" (Tailwind dark mode) -> 0 matches
    Expected Result: All forbidden patterns absent
    Evidence: .omo/evidence/F1-guardrails.txt

  **Commit**: YES - Message: docs: add plan compliance audit evidence. Files: .omo/evidence/F1-compliance.md

- [ ] F2. Code quality review

  **What to do**: Run vue-tsc --noEmit (0 errors required). Run ESLint on all src/ files (0 errors required). Run npm run test (all Vitest tests pass). Review ALL changed files for: as any casts, @ts-ignore comments, empty catch blocks, console.log in production code, commented-out code, unused imports, excessive JSDoc comments (AI slop indicator), over-abstraction (components < 20 lines or > 150 lines), generic variable names (data/result/item/temp), unnecessary wrappers. Flag each issue with file:line.

  **Must NOT do**: No stylistic opinions without concrete rule violations, no subjective preferences

  **Recommended Agent Profile**: Category: unspecified-high. Skills: []

  **Parallelization**: Wave FINAL, parallel with F1, F3, F4. Blocked By: ALL implementation tasks.

  **References**: src/ (all source files to review), .omo/plans/vue-refactor.md (Must NOT Have guardrails)

  **Acceptance Criteria**: vue-tsc 0 errors. ESLint 0 errors. Vitest all pass. Files review: 0 as-any, 0 @ts-ignore, 0 empty catches, 0 console.log in prod, 0 commented-out code. Component sizes all within 20-150 lines range. VERDICT: APPROVE or REJECT with specific file:line citations.

  **QA Scenarios**:
  Scenario: Build and lint pass
    Tool: Bash
    Steps:
      1. Run npx vue-tsc --noEmit -> 0 errors
      2. Run npm run lint -> 0 errors
      3. Run npm run test -> all pass
    Expected Result: Clean build, lint, test
    Evidence: .omo/evidence/F2-build-lint-test.txt

  **Commit**: YES - Message: docs: add code quality review evidence. Files: .omo/evidence/F2-quality.md

- [ ] F3. Real manual QA

  **What to do**: Start from clean state (clear localStorage). Execute EVERY QA scenario from EVERY task (1-22) - follow exact steps, capture evidence (screenshots for UI, terminal output for CLI/API). Test cross-module integration: login -> add points -> verify stats/progress/activity -> exchange -> draw -> check history -> export data -> import data -> verify restored. Test edge cases: empty localStorage first-time, corrupted JSON in localStorage (inject malformed data), negative points, localStorage quota warning, single-member app, rapid consecutive operations. Save all evidence to .omo/evidence/final-qa/. Use Playwright for all UI interactions.

  **Must NOT do**: No skipping scenarios, no "verified visually" without screenshot evidence, no manual-only testing without agent execution

  **Recommended Agent Profile**: Category: unspecified-high. Skills: [playwright]

  **Parallelization**: Wave FINAL, parallel with F1, F2, F4. Blocked By: ALL implementation tasks.

  **References**: .omo/plans/vue-refactor.md (all QA scenarios from Tasks 1-22), src/ (running application)

  **Acceptance Criteria**: All task QA scenarios [N/N] pass. Cross-module integration [5/5] flows pass. Edge cases [N] tested and handled gracefully. Each scenario has evidence file in .omo/evidence/final-qa/.

  **QA Scenarios**:
  Scenario: Full cross-module E2E flow
    Tool: Playwright
    Steps:
      1. Clear localStorage -> navigate -> verify first-time setup
      2. Add 100 points -> verify stats update, progress bar, activity list
      3. Exchange 50 points -> verify deduction, exchange history
      4. Draw with remaining points -> verify draw result, draw history
      5. Open history modal -> verify all records present, filter/pagination
      6. Export data -> verify JSON download
      7. Clear localStorage -> import exported data -> verify all restored
    Expected Result: Complete user flow works end-to-end without errors
    Evidence: .omo/evidence/F3-e2e-flow.png

  Scenario: Edge case - corrupted localStorage
    Tool: Playwright
    Steps:
      1. Inject malformed JSON into localStorage key 'kids'
      2. Navigate -> verify app handles gracefully (fallback to defaults, no crash)
    Expected Result: No JavaScript errors, app shows default state
    Evidence: .omo/evidence/F3-corrupted-data.png

  **Commit**: YES - Message: docs: add manual QA evidence. Files: .omo/evidence/final-qa/*.png, .omo/evidence/F3-qa-report.md

- [ ] F4. Scope fidelity check

  **What to do**: For each of the 22 tasks: read the "What to do" section, then read the actual git diff (git log --stat, git diff dev). Verify 1:1 mapping - everything specified was built (no missing features), nothing beyond spec was built (no scope creep). Check "Must NOT do" compliance per task - verify each exclusion was honored. Detect cross-task contamination: Task N should only touch files belonging to its scope, not Task M's files. Flag any unaccounted changes (files modified/added that no task claims). Verify no new npm dependencies beyond agreed stack (check package.json).

  **Must NOT do**: No lenient judgment - every unaccounted file is a scope creep flag

  **Recommended Agent Profile**: Category: deep. Skills: []

  **Parallelization**: Wave FINAL, parallel with F1, F2, F3. Blocked By: ALL implementation tasks.

  **References**: .omo/plans/vue-refactor.md (all 22 task specs), git diff (actual changes), package.json (dependencies)

  **Acceptance Criteria**: Tasks [22/22] compliant (each task built exactly what it specified, nothing extra). Contamination [CLEAN] (no task touching other task's files). Unaccounted [CLEAN] (no files modified without a task claiming them). package.json dependencies match agreed stack only. VERDICT: APPROVE or REJECT with specific file/task citations.

  **QA Scenarios**:
  Scenario: No unaccounted npm dependencies
    Tool: Bash
    Steps:
      1. Read package.json dependencies and devDependencies
      2. Compare against agreed stack: vue, @vitejs/plugin-vue, vite, pinia, typescript, tailwindcss, postcss, autoprefixer, vitest, @vue/test-utils, @playwright/test, eslint, prettier
      3. Flag any dependency NOT in agreed stack
    Expected Result: All dependencies within agreed stack
    Evidence: .omo/evidence/F4-dependencies.txt

  Scenario: No cross-task contamination
    Tool: Bash (git diff)
    Steps:
      1. For each task, identify its claimed files from commit section
      2. Check git diff for each task's changes
      3. Verify each changed file is claimed by only one task
    Expected Result: Clean separation, no overlapping file ownership
    Evidence: .omo/evidence/F4-contamination.txt

  **Commit**: YES - Message: docs: add scope fidelity check evidence. Files: .omo/evidence/F4-fidelity.md

