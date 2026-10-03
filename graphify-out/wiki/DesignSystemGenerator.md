# DesignSystemGenerator

> 23 nodes · cohesion 0.13

## Key Concepts

- **DesignSystemGenerator** (35 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **.generate()** (11 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **.__init__()** (5 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **._multi_domain_search()** (4 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **._select_best_match()** (4 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **TestReasoningMatch** (4 connections) — `.agents/skills/ui-ux-pro-max/scripts/tests/test_core.py`
- **._extract_results()** (3 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **._load_reasoning()** (3 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **._resolve_style()** (3 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **_resolve_dial()** (3 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **._build_style_lookup()** (2 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **._load_landing_patterns()** (2 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **._load_styles()** (2 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **.test_known_category_matches_exactly()** (2 connections) — `.agents/skills/ui-ux-pro-max/scripts/tests/test_core.py`
- **.test_unknown_category_falls_back_gracefully()** (2 connections) — `.agents/skills/ui-ux-pro-max/scripts/tests/test_core.py`
- **.test_style_aliases_have_one_exact_owner()** (2 connections) — `.agents/skills/ui-ux-pro-max/scripts/tests/test_data_contracts.py`
- **Generates design system recommendations from aggregated searches.** (1 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **Load reasoning rules from CSV.** (1 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **Execute searches across multiple domains.** (1 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **Select best matching result based on priority keywords.** (1 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **Extract results list from search result dict.** (1 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **Generate complete design system recommendation. variance/motion/density are…** (1 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **Bucket a 1-10 dial value into its tier config. Returns None if value is None.** (1 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`

## Relationships

- [test_data_contracts.py](test_data_contracts.py.md) (8 shared connections)
- [_palette_is_dark](_palette_is_dark.md) (5 shared connections)
- [parse_decision_rules](parse_decision_rules.md) (4 shared connections)
- [test_design_system_mode.py](test_design_system_mode.py.md) (3 shared connections)
- [_select_palette_for_mode](_select_palette_for_mode.md) (2 shared connections)
- [BM25](BM25.md) (2 shared connections)
- [design_system.py](design_system.py.md) (2 shared connections)
- [search](search.md) (2 shared connections)
- [generate_design_system](generate_design_system.md) (1 shared connections)
- [patch](patch.md) (1 shared connections)

## Source Files

- `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- `.agents/skills/ui-ux-pro-max/scripts/tests/test_core.py`
- `.agents/skills/ui-ux-pro-max/scripts/tests/test_data_contracts.py`

## Audit Trail

- EXTRACTED: 59 (95%)
- INFERRED: 3 (5%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*