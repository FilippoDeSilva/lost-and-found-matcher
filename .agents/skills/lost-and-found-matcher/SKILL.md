---
name: lost-and-found-matcher
description: Matcher algorithm and evaluation guidelines for campus lost and found reports.
---

# Lost & Found Matcher Skill

## Overview
This skill defines the multi-factor scoring architecture for matching Lost and Found item reports across campus.

## Match Scoring Weights
- **Category Match (25%)**: Structural category comparison (e.g., Electronics, Bags, Clothing, Keys, ID/Cards).
- **Text & Keyword Similarity (35%)**: Synonym expansion, fuzzy token overlap, and color/brand identification.
- **Location Proximity (20%)**: Campus zone proximity graph lookup (e.g., Cafeteria <-> Coffee Shop proximity = 0.85).
- **Temporal Relevance (20%)**: Time delta scoring function. Items found shortly after being lost score higher; items found before lost date score 0.

## Evaluation Test Cases
1. **AirPods Scenario**: "Black AirPods case lost near cafeteria" vs "Dark wireless earbud case found beside coffee shop" -> Expected: High match score (> 75%).
2. **Library Backpack Scenario**: Same-day backpack lost/found near library (High match > 80%) vs 2 weeks later at football field (Lower match ~ 40-50%).
3. **Impossibility Test**: Found date 3 days prior to Lost date -> Expected: Time decay score 0.
