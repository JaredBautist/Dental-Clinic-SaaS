# test_design_system_mode.py

> 21 nodes · cohesion 0.14

## Key Concepts

- **test_design_system_mode.py** (16 connections) — `.agents/skills/ui-ux-pro-max/scripts/tests/test_design_system_mode.py`
- **_filter_anti_patterns_for_mode()** (8 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **_style_is_dark_primary()** (8 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **_resolve_color_mode()** (7 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **_query_wants_dark()** (5 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **TestAntiPatternGating** (5 connections) — `.agents/skills/ui-ux-pro-max/scripts/tests/test_design_system_mode.py`
- **TestModeResolution** (5 connections) — `.agents/skills/ui-ux-pro-max/scripts/tests/test_design_system_mode.py`
- **.test_dark_clause_dropped_others_kept()** (2 connections) — `.agents/skills/ui-ux-pro-max/scripts/tests/test_design_system_mode.py`
- **.test_empty_input()** (2 connections) — `.agents/skills/ui-ux-pro-max/scripts/tests/test_design_system_mode.py`
- **.test_light_mode_is_a_no_op()** (2 connections) — `.agents/skills/ui-ux-pro-max/scripts/tests/test_design_system_mode.py`
- **.test_unrelated_anti_patterns_survive_dark_mode()** (2 connections) — `.agents/skills/ui-ux-pro-max/scripts/tests/test_design_system_mode.py`
- **.test_dark_primary_style_detected()** (2 connections) — `.agents/skills/ui-ux-pro-max/scripts/tests/test_design_system_mode.py`
- **.test_dual_mode_style_is_not_dark_primary()** (2 connections) — `.agents/skills/ui-ux-pro-max/scripts/tests/test_design_system_mode.py`
- **.test_either_signal_resolves_dark()** (2 connections) — `.agents/skills/ui-ux-pro-max/scripts/tests/test_design_system_mode.py`
- **.test_query_keywords()** (2 connections) — `.agents/skills/ui-ux-pro-max/scripts/tests/test_design_system_mode.py`
- **.test_claim_fields_use_controlled_non_guarantee_language()** (2 connections) — `.agents/skills/ui-ux-pro-max/scripts/tests/test_style_taxonomy.py`
- **True when a styles.csv row describes itself as dark-first.** (1 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **True when the query explicitly asks for a dark theme.** (1 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **Resolve the mode the rest of the output has to agree with.** (1 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **Drop "avoid dark mode" advice once dark mode is the resolved answer.** (1 connections) — `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- **Regression tests for color-mode coherence in design_system.py (issue #428).…** (1 connections) — `.agents/skills/ui-ux-pro-max/scripts/tests/test_design_system_mode.py`

## Relationships

- [design_system.py](design_system.py.md) (5 shared connections)
- [_palette_is_dark](_palette_is_dark.md) (4 shared connections)
- [DesignSystemGenerator](DesignSystemGenerator.md) (3 shared connections)
- [_select_palette_for_mode](_select_palette_for_mode.md) (3 shared connections)
- [search](search.md) (2 shared connections)

## Source Files

- `.agents/skills/ui-ux-pro-max/scripts/design_system.py`
- `.agents/skills/ui-ux-pro-max/scripts/tests/test_design_system_mode.py`
- `.agents/skills/ui-ux-pro-max/scripts/tests/test_style_taxonomy.py`

## Audit Trail

- EXTRACTED: 47 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*