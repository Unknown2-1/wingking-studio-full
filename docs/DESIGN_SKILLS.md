# Design skills for Wingking Studio team

These four **third-party Agent Skills** provide repeatable workflows for poster design, print typography, art direction, and anti-generic web design. They **do not** grant any new privileges, bypass website testing, or automatically install into ChatGPT conversations.

## Skill set

| Skill | Purpose | Upstream |
| --- | --- | --- |
| `canvas-design` | Graphic design philosophy, intentional composition, poster artwork | https://github.com/anthropics/skills/tree/main/skills/canvas-design |
| `poster-design` | Print poster hierarchy, grid, export requirements | https://github.com/ArnavPuri/designskills/tree/main/skills/poster-design |
| `visual-design` | Critique typography, spacing, contrast, composition | https://github.com/nimadorostkar/Claude-Skills-collection/tree/main/skills/design/visual-design |
| `design-taste-frontend` | Editorial anti-slop web design + browser screenshot checks | https://github.com/Leonxlnx/taste-skill |

Source licensing: canvas-design Apache 2.0; poster-design, visual-design and taste-skill MIT. Vendor text/scripts/resources retain their copyright and license files. Do not distribute vendor font files separately.

## Where they are installed

The repository stores project-scoped vendor Agent Skills under `.agents/skills/<skill-name>/` for Codex and universal agents. They are generated from the official upstream sources by `.github/workflows/install-design-skills.yml` using the `skills` CLI (non-interactive, copy mode). This workflow is a one-time setup; manually rerun only when an update is desired.

For agents that do not recognize `.agents/skills/`, install to the expected location using the local installer below.

## Local installation on Windows (PowerShell)

In the **project root**, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-design-skills.ps1
```

This script installs the four skills to the **current project**, not globally to your PC. Requires Node.js 22.20+ and internet access. It uses `npx` to download sources from GitHub, and can ask for antivirus/security confirmation depending on your local setup.

## Manual installation in Codex or Claude Code

```bash
npx -y skills@1.7.6 add anthropics/skills -s canvas-design -a codex -y --copy
npx -y skills@1.7.6 add ArnavPuri/designskills -s poster-design -a codex -y --copy
npx -y skills@1.7.6 add nimadorostkar/Claude-Skills-collection -s visual-design -a codex -y --copy
npx -y skills@1.7.6 add Leonxlnx/taste-skill -s design-taste-frontend -a codex -y --copy
```

Substitute `-a claude-code` for Claude Code. If the skills already exist, the install command may update them. Start a **new agent session** so the skills are discovered.

## How to apply to Wingking client work

1. **Before designing:** read `.agents/design-context.md` and actual Wingking website/brand assets.
2. **For A4 poster:** start with `visual-design` for hierarchy, `poster-design` for grid + print specification, `canvas-design` for art direction and finishing.
3. **For website redesign:** use `design-taste-frontend` to audit the current site and review browser screenshots before/after.
4. **Review final output:** compare with real brand colors, original logo, exact Indonesian copy, and A4 sizing. Reject cluttered generic templates.

### Notes / limitations
- `poster-design` references a Gemini image-generation workflow and related skills that may not be installed; use its universal composition guidance or available rendering tools if you do not have access to that model/service.
- `design-taste-frontend` may require Chrome/Chromium and Node.js for its optional browser audits; it does not execute automatically just because the skill file exists.
- No secret keys, passwords, or billing accounts are installed by these skills.
- GitHub project installation is **not** the same as installing account-wide plugins in ChatGPT.
