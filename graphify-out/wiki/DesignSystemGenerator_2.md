# DesignSystemGenerator

> God node · 35 connections · `.agents/skills/ui-ux-pro-max/scripts/design_system.py`

**Community:** [DesignSystemGenerator](DesignSystemGenerator.md)

## Connections by Relation

### calls
- generate_design_system() `EXTRACTED`
- .test_constraints_reach_domain_queries() `EXTRACTED`
- .test_every_exact_product_label_resolves_to_itself() `EXTRACTED`
- .test_every_known_product_generates_a_traceable_landing_pattern() `EXTRACTED`
- .test_generator_matches_reasoning_exactly_and_defaults_only_for_unknown() `EXTRACTED`
- .test_representative_new_products_generate_traceable_sources() `EXTRACTED`
- .test_dark_query_foreground_is_lighter_than_background() `EXTRACTED`
- .test_dark_query_gets_a_dark_background() `EXTRACTED`
- .test_generator_exports_every_semantic_foreground_pair() `EXTRACTED`
- .test_light_query_keeps_a_light_background() `EXTRACTED`
- .test_known_category_matches_exactly() `EXTRACTED`
- .test_unknown_category_falls_back_gracefully() `EXTRACTED`
- .test_canonical_style_priority_is_not_limited_to_bm25_top_three() `EXTRACTED`
- .test_style_aliases_have_one_exact_owner() `EXTRACTED`
- .test_dark_query_does_not_advise_against_dark_mode() `EXTRACTED`

### contains
- [design_system.py](design_system.py.md) `EXTRACTED`

### imports
- [test_design_system_mode.py](test_design_system_mode.py.md) `EXTRACTED`
- test_core.py `EXTRACTED`
- [test_data_contracts.py](test_data_contracts.py.md) `EXTRACTED`

### method
- .generate() `EXTRACTED`
- ._apply_reasoning() `EXTRACTED`
- .__init__() `EXTRACTED`
- ._multi_domain_search() `EXTRACTED`
- ._select_best_match() `EXTRACTED`
- ._load_reasoning() `EXTRACTED`
- ._resolve_style() `EXTRACTED`
- ._find_reasoning_rule() `EXTRACTED`
- ._extract_results() `EXTRACTED`
- ._load_styles() `EXTRACTED`
- ._load_landing_patterns() `EXTRACTED`
- ._build_style_lookup() `EXTRACTED`

### rationale_for
- Generates design system recommendations from aggregated searches. `EXTRACTED`

### uses
- TestReasoningContract `INFERRED`
- TestEndToEndCoherence `INFERRED`
- TestReasoningMatch `INFERRED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*