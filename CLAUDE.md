# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

pnpm + Turborepo monorepo of two stacked products. `nikkierp/` is a **git submodule**
(`git@github.com:sky-as-code/nikki-erp-frontend-react`) — edits there are commits in a different repo.

- `nikkierp/` — base platform: UI system, MFE shell, auth, view engine.
- `coremart/` — business layer that extends nikkierp.

Both use the same subfolder convention (`pnpm-workspace.yaml` globs `coremart/apps/*`,
`coremart/modules/*`, `nikkierp/apps/*`, `nikkierp/libs/*`, `nikkierp/modules/*`):

| Folder | Meaning |
| --- | --- |
| `apps/` | Hosting app; declares which feature modules go into the bundle |
| `libs/` | Reusable libraries (nikkierp only) |
| `modules/` | Feature modules, each an MFE micro-app lazily loaded by the shell |
| `nikkierp/packages/` | **Deprecated** — do not add to it |
| `nikkierp/scaffold/` | tsconfig samples to copy when creating a new module folder |

Libraries: `libs/common` (framework-free core), `libs/shell` (MFE shell support),
`libs/ui` (React components, theme, i18n, micro-app runtime), `libs/viewengine`
(implementation-free view engine core), `libs/viewkit-mantine` (the Mantine implementations).

`ai-prompts/architecture.md` is the authoritative architecture description — read it before
non-trivial work. `ai-prompts/ui-design-principles.md` holds the agreed UI layouts (listing page
toolbar, filter panel, view settings). `ai-prompts/{feature}/` holds per-feature plans; see
`.cursor/rules/04-progress-update.mdc` for the `00-progress.md` / `01-plans.md` workflow.

## Commands

Node >= 22.19, pnpm >= 10.32 (`packageManager` pinned). Run from the repo root:

```bash
pnpm dev:coremart      # turbo run dev --filter=@coremart/webapp
pnpm check-types       # turbo run check-types across the workspace
pnpm lint              # eslint --fix over the whole tree
```

Per-package (`cd` into the package first, or `pnpm --filter <pkg> <script>`):

```bash
pnpm build             # apps: tsc + vite build; modules: clean && tsc && vite build
pnpm typecheck         # tsc --noEmit
pnpm eslint            # eslint . --cache
pnpm stylelint         # stylelint '**/*.css' --cache
pnpm dev               # serves this package through the shell BFF (see below)
```

Tests use **Vitest**, configured inline in each package's `vite.config.ts`. Only a few packages
have a `test` script (e.g. `@coremart/microapp-vending-machine`: `vitest run` / `vitest`).
Elsewhere run it directly:

```bash
pnpm vitest run                                   # whole package
pnpm vitest run src/features/payment/commands.test.ts   # single file
pnpm vitest run -t 'renders the split view'       # single test by name
```

Note `webapp`/`common` define `test` as the full gate (`typecheck && lint && vitest && build`),
not just unit tests.

### Dev servers

Every `dev` script boots `nikkierp/apps/shellbff` (an Express BFF) with
`NIKKI_BFF_CLIENT_ROOT_PATH` pointed at the package. Modules pick distinct
`NIKKI_BFF_HTTP_PORT`s (identity 3001, inventory 3002, …). The scripts are `bash -c` wrappers
using `realpath` — on Windows run them through Git Bash, not PowerShell. BFF env vars use the
`NIKKI_BFF_` prefix; vars exposed to the browser use `NIKKI_PUBLIC_`.

Which micro-apps a host loads is declared in the app's `src/main.tsx` (`MicroAppMetadata[]`),
with `src/modules.json` reserved for remote/out-of-repo apps.

Commits are conventional-commit enforced (commitlint + husky); `lint-staged` runs `eslint --fix`
on staged TS/JS.

## Architecture

### Modules never import each other

Cross-module communication goes through the **command bus** (`@nikkierp/common/commandBus`).
A module registers handlers synchronously in its `init` (see
`nikkierp/modules/identity/src/features/user/commands.ts`) under namespaced names
(`{module}.{schema}.{action}`), and callers `publish` a `Command` and get back a
`CommandResponse` — `{ data, error }` where exactly one side is non-null (`ok()` / `fail()`
helpers). The bus can lazily load an unloaded owning module via its `ModuleLoader`.

### Host-owned services

The shell creates the `MicroAppManager`, command bus, view engine and menu registry **once**
(`nikkierp/libs/shell/src/microApp/MicroAppHostProvider.tsx`) and hands them to each micro-app as
`HostServices` on `MicroAppBundleInitOptions.host`. A module must use those instances — never
construct its own, never import `defaultViewEngine` (that singleton exists only for tests,
Storybook and standalone dev servers). At render time use `useViewEngine()`.

### Menus

A module contributes its menu in `init` via `host.menuRegistry.register(buildXMenu(slug))`
(`nikkierp/libs/ui/src/menu/`, see `nikkierp/modules/identity/src/menu.ts`). Contributions are
keyed by micro-app slug, so modules cannot clobber each other; re-registering a slug throws
unless `{ override: true }` is passed. Registration is permanent — `initPack` caches `init` per
slug, so unregistering on unmount would make re-registration impossible.

Items carry **i18n keys, not labels** (`labelKey`), plus a `translationNs` on the contribution:
`init` runs outside React and possibly before the namespace loads, so the Shell's `MenuBar`
translates at render time. Use the owning module's real namespace and key style — they differ
per module (`iam` uses `menu.users`, `drive`/`inventory` use `menu_overview`), and the source of
truth is `backend/nikkierp/modules/essential/infra/langJson/{locale}/{module}.json`.

`shell.layout.register_menu` / `unregister_menu` delegate to the same registry, for out-of-repo
bundles handed only a bus. In-repo modules should call the registry directly.

A module's entry point default-exports a `MicroAppBundle` whose `init({ htmlTag,
registerReducer, host })` calls `defineWebComponent`, registers its reducer, registers its
dynamic-model schemas and subscribes its commands. `nikkierp/modules/identity` is the reference
implementation of the whole pattern; other modules are being migrated to it one at a time.

### View engine

Pages are authored as **plain JSON metadata**, not JSX: `definePage({ routePath, template, props })`
from `@nikkierp/viewengine/metadata` with type-safe builders from `@nikkierp/viewkit-mantine/props`
(a React-free entry point). See `nikkierp/modules/identity/src/pages/user.ts`.

- A **view kit** contributes page templates, component renderers and field renderers to the host
  engine (`contributeMantineViewKit(engine)`).
- Contribution ids are `{vendor}.{kit}.{kind}.{name}.v{major}` (`nikkierp/libs/viewkit-mantine/src/ids.ts`).
  A breaking props change ships as a new `.v2` id, never as a mutation. Duplicate ids throw unless
  `override: true`; a third-party kit may override a `nikkierp.*` id but never create one.
- Props are plain JSON validated against the template's `propsSchema` (Standard Schema v1). No
  classes, no `instanceof` — a page definition must survive a bundle boundary. Invalid props render
  a diagnostic panel rather than throwing.
- Route shapes come from the template's own `routePattern(node)`; `compilePage.tsx` knows no
  template id.
- Field renderers resolve at render time from serializable `FieldRendererSpec`s, so a
  later-loading kit can still contribute one.

`@nikkierp/ui/viewEngine` is a deprecated type shim awaiting deletion — import from
`@nikkierp/viewengine` or `@nikkierp/viewkit-mantine`.

#### Appending sections to a resource detail page

Pass `childrenNodes` (`ComponentNode[]`, plain JSON) to `resourceDetailProps()`. They render
**after** the form as its siblings, and **only in update mode** — `ResourceDetail` gives them to
`ResourceUpdate` and not to `ResourceCreate`, which is correct, since during create there is no
record id to filter related records by.

Wrap each section in `collapsible_section` (`collapsibleSectionNode`) with a `header` and its
`translationNs`, which makes it a titled, collapsible block. It reads no form context, so it is
safe here. **Not** `resource_form__section`: that is the resource form's own section, it always
renders a `SectionActionBar` bound to the enclosing form, and `ResourceUpdate` is its only emitter.

Embed a related-records table with `resource_table` (`resourceTableNode`). Its `filterGraph` is a
plain-JSON search graph in which any whole `${param}` string is replaced by the current route
param, and `linkRoutePath` points rows at a *different* page than the current one:

```ts
collapsibleSectionNode({ header: 'role_sections_assignedUsers', translationNs: c.IAM_MODULE }, [
    resourceTableNode({
        schemaName: c.USER_SCHEMA_NAME, translationNs: c.IAM_MODULE,
        searchCommand: UserCommands.SEARCH,
        filterGraph: { if: ['roles', 'linked', '${id}'] },   // `linked` filters across a many edge
        linkField: 'id', linkRoutePath: 'users',
    }),
])
```

See `nikkierp/modules/identity/src/pages/role.ts`.

### Dynamic-model schema names

A frontend `schemaName` must equal the backend Go constant **verbatim** — `SchemaRegistry` throws
if the registered name differs from what the server returns. The form is `{module}_{entity}` in
snake_case, never dotted: `iam_user`, `iam_group`, `iam_org`, `iam_orgunit`, `iam_role`,
`iam_entitlement`, `iam_role_user_assignment`, … They are declared as `XSchemaName` in
`backend-coremart26-mono/nikkierp/modules/{module}/domain/models/{entity}.go`; read the constant
there rather than guessing from the resource path.

Note the frontend micro-app is still called `identity` while the backend module is `iam`; the
rename is pending and will be done by hand.

### Enforced boundaries

`eslint.config.mjs` encodes the architecture as lint zones; a violation fails the build rather
than relying on convention. Do not work around them:

- `libs/viewengine` may not import any kit, `@nikkierp/ui`, the shell or any module.
- `libs/ui` may not import a view kit (kits depend on ui, never the reverse) and may not import
  the `@nikkierp/viewengine/engine` barrel (it exposes `defaultViewEngine`) — use `./core`,
  `./metadata` or `./render`.
- Modules may not import `@nikkierp/microapp-*` / `@coremart/microapp-*`.

## Code style

From `.cursor/rules/00-way-of-work.mdc` and the lint config:

- Tabs for indent; single quotes (JSX too); semicolons; trailing commas on multiline;
  stroustrup braces; max line 120 chars.
- Function body <= 25 lines (35 for React components); file <= 500 lines. ESLint warns at 50 / 80.
- `import/order` is enforced with alphabetized groups, `newlines-between: always`, CSS imports
  last, and **two** blank lines after the import block.
- One-line imports; wrap into a braced multi-line block only when over the limit.
- Function declaration syntax for module-level functions and components; lambdas only for inline
  callbacks.
- Strict camel/Pascal with no acronym exceptions: `MySql`, `DbClient`/`dbClient` — not `MySQL`,
  `DBClient`. Variable names > 2 chars except loop `i`/`j`.
- `clsx` for conditional class names, never string interpolation.
- Tailwind for layout, shape and positioning; **Mantine CSS variables in CSS modules for colors**.
- Anything marked `@deprecated {advice}` must not be used — follow the advice.

Before writing new code, search for an existing pattern to reuse; if nothing fits, say why.
Flag missing inputs and offer options rather than silently picking one; push back on
over-engineering.

## Way of work
When I tell you to plan or when you are in plan mode, you must write your plan to a file then stop the session without implementing.

If it's necessary to create a `git stash push`, you must `git stash pop` before you stop working.
**Never** leave a stash alive across multiple working phases (of the same session), or worse, across
sessions. A stash sweeps up my uncommitted work along with yours, and popping it later resurrects
files I had already deleted.

## Code Search & Symbol Queries
- You MUST use the `vscode-lsp` MCP tools for all symbol queries (finding definitions, finding callers, or mapping function/class usages): `search_workspace_symbols` to find where a symbol is defined, `find_symbol_locations` for its definition/references, `document_symbols` to outline a file, `rename_symbol` for renames.
- These tools are deferred: load their schemas via ToolSearch (`select:mcp__vscode-lsp__...`) before the first code-navigation task.
- DO NOT run `grep` or `rg` for symbol lookup or code navigation.
- If you are unsure whether a query requires LSP or grep, default to using the LSP MCP server first. Fall back to grep only when the language server has not indexed the target (e.g. a submodule or secondary workspace root).

## Text & String Queries
- Use `grep` or `rg` ONLY for literal text searches (e.g., specific log messages, comments, configurations, or error message strings).
