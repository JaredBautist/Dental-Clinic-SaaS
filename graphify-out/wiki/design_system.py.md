# design_system.py

> 25 nodes · cohesion 0.11

## Key Concepts

- **design_system.py** (34 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **persist_design_system()** (8 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **format_ascii_box()** (6 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **_generate_intelligent_overrides()** (5 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **format_page_override_md()** (4 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **_write_persisted_file()** (4 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **ansi_ljust()** (3 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **_detect_page_type()** (3 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **format_master_md()** (3 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **hex_to_ansi()** (3 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **safe_slug()** (3 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **section_header()** (3 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **Path** (2 connections)
- **Format design system as MASTER.md with hierarchical override logic.** (1 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **Format a page-specific override file with intelligent AI-generated content.** (1 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **Generate intelligent overrides based on page type using layered search. Uses…** (1 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **Detect page type from context and search results.** (1 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **Design System Generator - Aggregates search results and applies reasoning to…** (1 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **Convert hex color to ANSI True Color swatch (██) with fallback.** (1 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **Like str.ljust but accounts for zero-width ANSI escape sequences.** (1 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **Create a Unicode section separator: ├─── NAME ───...┤** (1 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **Format design system as Unicode box with ANSI color swatches.** (1 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **Slugify a name into a single safe path segment. Only [a-z0-9_-] survives; every…** (1 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **Write fully to a temp file, then publish atomically.** (1 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **Persist design system to design-system/<project>/ folder using Master +…** (1 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`

## Relationships

- [generate_design_system](generate_design_system.md) (5 shared connections)
- [test_design_system_mode.py](test_design_system_mode.py.md) (5 shared connections)
- [search](search.md) (3 shared connections)
- [parse_decision_rules](parse_decision_rules.md) (3 shared connections)
- [_select_palette_for_mode](_select_palette_for_mode.md) (3 shared connections)
- [_palette_is_dark](_palette_is_dark.md) (2 shared connections)
- [DesignSystemGenerator](DesignSystemGenerator.md) (2 shared connections)
- [BM25](BM25.md) (1 shared connections)
- [test_data_contracts.py](test_data_contracts.py.md) (1 shared connections)

## Source Files

- `.agents/skills/ui-ux-pro-max/scripts/design_system.py`

## Audit Trail

- EXTRACTED: 59 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*