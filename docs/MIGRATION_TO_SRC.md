# Migration to `src/` Directory

This document describes the concrete steps and file list to move all application source code into a `src/` directory, following common Vite/React conventions.

---

## 1. Files to Move (into `src/`)

Move the following files and directories. **Relative imports between these files do not change** (e.g. `../types` from `components/X.tsx` still points to `src/types.ts` after the move).

### 1.1 Root-level source files

| Current path (root) | New path |
|---------------------|----------|
| `App.tsx`           | `src/App.tsx` |
| `index.tsx`         | `src/main.tsx` *(rename)* |
| `index.css`         | `src/index.css` |
| `types.ts`          | `src/types.ts` |
| `firebase.ts`       | `src/firebase.ts` |

### 1.2 Directories (move entire folder)

| Current path | New path |
|--------------|----------|
| `components/` | `src/components/` |
| `contexts/`   | `src/contexts/` |
| `hooks/`     | `src/hooks/` |
| `store/`     | `src/store/` |
| `services/`  | `src/services/` |
| `utils/`     | `src/utils/` |

### 1.3 Do not move (stay at repo root)

- `index.html` – Vite entry HTML (update script `src` only)
- `vite.config.ts`, `tsconfig.json`, `vitest.config.ts`
- `tailwind.config.js`, `eslint.config.js`
- `tests/` – keep at root; tests will import from `../src/...`
- `public/` – Vite convention
- `package.json`, `package-lock.json`, `.env`, `.gitignore`, etc.

---

## 2. Config Changes

### 2.1 `index.html`

**Change:** Point the script to the new entry inside `src/`.

```diff
-    <script type="module" src="/index.tsx"></script>
+    <script type="module" src="/src/main.tsx"></script>
```

### 2.2 `vite.config.ts`

**Change:** Set alias `@` to `src` so that `@/components/X` resolves to `src/components/X`.

```diff
      resolve: {
        alias: {
-          '@': path.resolve(__dirname, '.'),
+          '@': path.resolve(__dirname, 'src'),
        }
      },
```

Optional: you can set an explicit `root` (default is project root). Leaving it unset is fine; the script in `index.html` already targets `src/main.tsx`.

### 2.3 `tsconfig.json`

**Change:** Update `paths` so that `@/*` maps to `src/*`.

```diff
    "paths": {
      "@/*": [
-        "./*"
+        "./src/*"
      ]
    },
```

### 2.4 `vitest.config.ts`

**Change:** Align alias with Vite so tests can use `@/...` or resolve `src` correctly.

```diff
  resolve: {
    alias: {
-      '@': path.resolve(__dirname, '.'),
+      '@': path.resolve(__dirname, 'src'),
    },
  },
```

### 2.5 `tailwind.config.js`

**Change:** Include `src` in `content` so Tailwind scans components under `src/`.

```diff
  content: [
    "./index.html",
-    "./**/*.{js,ts,jsx,tsx}",
+    "./src/**/*.{js,ts,jsx,tsx}",
  ],
```

---

## 3. Test imports

Tests under `tests/` currently use paths like `../utils/...` and `../components/...`. After the move, those modules live under `src/`, so update imports to `../src/...`.

### 3.1 `tests/achievementData.test.ts`

```diff
-import { ACHIEVEMENTS } from '../utils/achievementData';
-import { GameState, Habit, RetiredPet } from '../types';
+import { ACHIEVEMENTS } from '../src/utils/achievementData';
+import { GameState, Habit, RetiredPet } from '../src/types';
```

### 3.2 `tests/dateUtils.test.ts`

```diff
-import { getTodayString, getCalendarDays, formatMonthYear } from '../utils/dateUtils';
+import { getTodayString, getCalendarDays, formatMonthYear } from '../src/utils/dateUtils';
```

### 3.3 `tests/gameLogic.test.ts`

```diff
-import { calculateLevel, calculateStreak, getStageConfig, STAGE_THRESHOLDS } from '../utils/gameLogic';
-import { PetStage, DayLog } from '../types';
+import { calculateLevel, calculateStreak, getStageConfig, STAGE_THRESHOLDS } from '../src/utils/gameLogic';
+import { PetStage, DayLog } from '../src/types';
```

### 3.4 `tests/ErrorBoundary.test.tsx`

```diff
-import ErrorBoundary from '../components/ErrorBoundary';
+import ErrorBoundary from '../src/components/ErrorBoundary';
```

Use the same pattern for any other test file that imports from `../utils/`, `../components/`, `../types`, or `../firebase`: change to `../src/...`.

---

## 4. Entry file: `index.tsx` → `src/main.tsx`

After moving, the entry file is `src/main.tsx`. Its imports are already relative to the file, so they stay the same:

- `./index.css` → still `./index.css` (same folder)
- `./App` → still `./App`
- `./components/ErrorBoundary` → still `./components/ErrorBoundary`
- `./contexts/ThemeContext` → still `./contexts/ThemeContext`
- `./contexts/AuthContext` → still `./contexts/AuthContext`

No edits needed inside `src/main.tsx` for these paths.

---

## 5. Imports inside `src/`

All moved files live under `src/`. Relative imports between them (e.g. `../types`, `../firebase`, `./X`) stay as they are; only the physical location of the files changes. **No changes are required** for imports inside `src/`.

If you use the `@/` alias (e.g. `import x from '@/types'`), it will now resolve to `src/types.ts` after the config changes above.

---

## 6. Suggested execution order

1. **Create `src/` and move files**
   - Create `src/`.
   - Move root files: `App.tsx`, `index.css`, `types.ts`, `firebase.ts` into `src/`.
   - Move `index.tsx` to `src/main.tsx`.
   - Move directories: `components/`, `contexts/`, `hooks/`, `store/`, `services/`, `utils/` into `src/`.

2. **Update config files**
   - `index.html`: script `src` → `/src/main.tsx`.
   - `vite.config.ts`: alias `@` → `path.resolve(__dirname, 'src')`.
   - `tsconfig.json`: `paths["@/*"]` → `["./src/*"]`.
   - `vitest.config.ts`: alias `@` → `path.resolve(__dirname, 'src')`.
   - `tailwind.config.js`: `content` → include `./src/**/*.{js,ts,jsx,tsx}`.

3. **Update tests**
   - In each file under `tests/`, replace `../utils/`, `../components/`, `../types`, `../firebase`, etc. with `../src/...` as needed.

4. **Verify**
   - `npm run build`
   - `npm test -- --run`
   - `npm run dev` and quick manual check

---

## 7. Optional: use `@/` in source

After migration, you can gradually replace relative imports with the `@/` alias for consistency, e.g.:

- `import { GameState } from '../types'` → `import { GameState } from '@/types'`
- `import { useAuth } from '../contexts/AuthContext'` → `import { useAuth } from '@/contexts/AuthContext'`

This is optional; relative imports continue to work.

---

## 8. Checklist summary

- [ ] Create `src/` and move all files/dirs from §1.
- [ ] Rename `src/index.tsx` to `src/main.tsx`.
- [ ] `index.html`: script `src="/src/main.tsx"`.
- [ ] `vite.config.ts`: alias `@` → `src`.
- [ ] `tsconfig.json`: `@/*` → `./src/*`.
- [ ] `vitest.config.ts`: alias `@` → `src`.
- [ ] `tailwind.config.js`: `content` includes `./src/**/*.{js,ts,jsx,tsx}`.
- [ ] All test imports updated to `../src/...` where applicable.
- [ ] `npm run build` succeeds.
- [ ] `npm test -- --run` passes.
- [ ] `npm run dev` runs and app loads.
