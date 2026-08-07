# Personal-Only GitHub Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Present the public `julismo` GitHub profile solely as Julismo's personal developer portfolio, with no company references.

**Architecture:** `README.md` is the versioned public profile surface because the `julismo/julismo` special repository is shared on the account profile. Account-level company metadata and pinned repositories are non-versioned GitHub settings, so they are changed only after the README is merged and then verified in an anonymous browser session. The Astro site source, deployment configuration, and public website links are intentionally untouched.

**Tech Stack:** Markdown, Git, GitHub pull requests, GitHub REST API through `gh`, Playwright CLI.

## Global Constraints

- Work only in `C:\dev\julismo\.worktrees\profile-personal-only` on branch `profile/personal-only`, based on `origin/main`.
- Modify only `README.md` and implementation-plan documentation; do not edit `src/`, `public/`, deployment configuration, or the published personal website.
- The public profile README must contain no references to ARM Solutions, Trion Scale, `Trion-Site`, companies, branch status, internal documentation, local verification instructions, or QR-code generation.
- Keep the existing bio exactly: `Building reliable AI-assisted operations software.`
- Retain exactly one pinned repository: `document-ops-workbench`.
- Never include, print, or commit credentials, tokens, or other secrets.
- Publish changes via a pull request to `main`; apply account UI/API settings only after the merged README is visible on `main`.

---

## File Structure

- `README.md` — concise profile README rendered on `https://github.com/julismo`.
- `docs/superpowers/specs/2026-08-07-personal-only-github-profile-design.md` — approved scope and copy constraints; no modification required.
- `docs/superpowers/plans/2026-08-07-personal-only-github-profile.md` — this executable implementation record.

### Task 1: Replace the public profile README with personal developer copy

**Files:**
- Modify: `README.md`
- Test: terminal content-contract commands against `README.md`

**Interfaces:**
- Consumes: the approved constraints in `docs/superpowers/specs/2026-08-07-personal-only-github-profile-design.md`.
- Produces: the exact Markdown rendered by GitHub's profile README surface.

- [ ] **Step 1: Record the current failing content contract**

Run:

```powershell
Set-Location 'C:\dev\julismo\.worktrees\profile-personal-only'
rg -n -i 'ARM|Trion|company|branch|QR code|Verifica' README.md
```

Expected: matches for ARM, Trion, branch/process material, verification instructions, or QR material; this proves the current README does not meet the approved public-profile scope.

- [ ] **Step 2: Replace `README.md` with the approved minimal public copy**

Replace the complete file with:

```markdown
# Julismo

Developer building practical TypeScript applications and reliable AI-assisted workflows.

## Engineering focus

- **Document operations:** transparent review workflows, deterministic evidence, and useful financial insight.
- **Reliable AI workflows:** human-guided automation with clear controls, traceability, and dependable handoffs.
- **Operational software:** practical TypeScript systems that turn repeatable work into maintainable tools.

## Selected work

- [document-ops-workbench](https://github.com/julismo/document-ops-workbench) — local-first document review and cash-flow insight tooling.

## Contact

- [Open a GitHub issue](https://github.com/julismo/julismo/issues/new?title=Profile%20contact)
```

- [ ] **Step 3: Verify the green content contract**

Run:

```powershell
Set-Location 'C:\dev\julismo\.worktrees\profile-personal-only'
$forbidden = 'ARM|Trion|company|branch|QR code|Verifica'
rg -n -i $forbidden README.md
if ($LASTEXITCODE -ne 1) { throw 'Forbidden public-profile copy remains in README.md.' }
rg -n '^# Julismo$|Developer building practical TypeScript applications|document-ops-workbench|Open a GitHub issue' README.md
if ($LASTEXITCODE -ne 0) { throw 'Required personal profile copy is missing from README.md.' }
```

Expected: the forbidden search returns no matches; the required-copy search returns four matching lines.

- [ ] **Step 4: Inspect the file diff for scope control**

Run:

```powershell
Set-Location 'C:\dev\julismo\.worktrees\profile-personal-only'
git diff --check
git diff -- README.md
```

Expected: no whitespace errors; the diff replaces only public-profile README material and contains no site-source changes.

- [ ] **Step 5: Commit the README change**

Run:

```powershell
Set-Location 'C:\dev\julismo\.worktrees\profile-personal-only'
git add README.md
git commit -m 'docs: focus profile on personal developer work'
```

Expected: one commit containing only `README.md` for this task.

### Task 2: Validate and publish the versioned profile README

**Files:**
- Modify: no additional source files
- Test: existing project quality commands and GitHub pull-request checks

**Interfaces:**
- Consumes: the committed personal README from Task 1.
- Produces: a merged `main` commit whose README GitHub can render on the profile.

- [ ] **Step 1: Run the static and unit checks**

Run:

```powershell
Set-Location 'C:\dev\julismo\.worktrees\profile-personal-only'
npm run check
npm run test:unit
```

Expected: `check` completes with zero errors, warnings, and hints; all unit tests pass.

- [ ] **Step 2: Run browser regression checks**

Run:

```powershell
Set-Location 'C:\dev\julismo\.worktrees\profile-personal-only'
npm run test:e2e
```

Expected: all applicable Playwright tests pass; explicitly report any suite-provided skips separately from failures.

- [ ] **Step 3: Confirm a clean, intentional branch state**

Run:

```powershell
Set-Location 'C:\dev\julismo\.worktrees\profile-personal-only'
git status --short --branch
git log --oneline origin/main..HEAD
```

Expected: no uncommitted changes and the branch contains the approved design-spec commit plus the README commit.

- [ ] **Step 4: Push the branch and open a pull request to `main`**

Run:

```powershell
Set-Location 'C:\dev\julismo\.worktrees\profile-personal-only'
git push --set-upstream origin profile/personal-only
gh pr create --base main --head profile/personal-only --title 'docs: focus profile on personal developer work' --body '## Summary`n- replaces the public profile README with a concise personal developer presentation`n- removes company and unrelated implementation references from the profile surface`n`n## Validation`n- npm run check`n- npm run test:unit`n- npm run test:e2e'
```

Expected: a pull-request URL whose base is `main`; its description names the exact validation commands.

- [ ] **Step 5: Verify required pull-request checks, merge, and confirm `main`**

Run:

```powershell
Set-Location 'C:\dev\julismo\.worktrees\profile-personal-only'
gh pr checks --watch
gh pr merge --merge
git fetch --prune origin
git log -1 --oneline origin/main
```

Expected: required PR checks pass, the PR is merged to `main`, and `origin/main` contains the README change. Keep the local feature branch because this worktree remains needed for account-level verification; delete it only after that work is complete from a safe checkout.

### Task 3: Apply and verify GitHub account-level profile settings

**Files:**
- Modify: GitHub account metadata and pinned-repository settings only
- Test: authenticated and anonymous GitHub browser snapshots

**Interfaces:**
- Consumes: the merged `main` README from Task 2 and a logged-in GitHub session named `github-curation`.
- Produces: a public profile with an empty company field and exactly one displayed pin.

- [ ] **Step 1: Clear only the account company field through the authenticated GitHub API**

Run:

```powershell
gh api --method PATCH user -f company=''
gh api user --jq '{login: .login, bio: .bio, company: .company}'
```

Expected: the response identifies login `julismo`, retains bio `Building reliable AI-assisted operations software.`, and reports `company` as `null` or an empty value. Do not print authentication configuration or token values.

- [ ] **Step 2: Remove `Trion-Site` from pinned repositories through the authenticated GitHub UI**

Run:

```powershell
& 'C:\Program Files\nodejs\npx.cmd' --package @playwright/cli playwright-cli --session github-curation tab-new 'https://github.com/julismo'
& 'C:\Program Files\nodejs\npx.cmd' --package @playwright/cli playwright-cli --session github-curation snapshot
```

Use the fresh snapshot references to click **Customize your pins**, uncheck only `Trion-Site`, leave `document-ops-workbench` selected, click **Save**, and take a fresh snapshot. Do not change any other repository visibility or profile field in this dialog.

Expected: authenticated profile shows one pinned repository, `document-ops-workbench`.

- [ ] **Step 3: Verify the public profile anonymously**

Run:

```powershell
& 'C:\Program Files\nodejs\npx.cmd' --package @playwright/cli playwright-cli --session github-public-verify open 'https://github.com/julismo'
& 'C:\Program Files\nodejs\npx.cmd' --package @playwright/cli playwright-cli --session github-public-verify snapshot
```

Expected: the anonymous page renders the new personal README, has no ARM/Trion/company presentation, and shows only `document-ops-workbench` in the pinned area.

- [ ] **Step 4: Record final local evidence without sensitive output**

Run:

```powershell
Set-Location 'C:\dev\julismo\.worktrees\profile-personal-only'
git status --short --branch
git log -1 --oneline origin/main
```

Expected: local profile branch remains clean after the merged work and the latest remote `main` commit is identifiable.

## Self-Review

- Spec coverage: Task 1 implements the exact README restrictions; Task 2 verifies and merges it; Task 3 clears the company field, retains the required bio, reduces pins to one, and validates the anonymous profile. The Astro site, organizations, credential rotation, repository visibility, and history remain explicitly out of scope.
- Placeholder scan: every task names its exact files, full replacement copy or commands, expected result, and commit boundary.
- Interface consistency: Task 1 produces `README.md`; Task 2 merges that exact file to `main`; Task 3 only acts after `origin/main` contains it and verifies GitHub's rendered profile.

## Execution Handoff

Use `superpowers:executing-plans` for inline execution. The work consists of one versioned documentation edit followed by ordered GitHub account settings, so it must not be parallelized or applied from a stale branch.
