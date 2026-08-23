# AGENTS.md - Lost & Found Matcher Guidelines

## Project Context
"The Lost & Found Matcher" is an intelligent campus lost-and-found matching application designed for a university assessment.

## Principles & Code Standards
1. **Explainable Matching**: Every match score must be backed by a clear breakdown (Category, Text/Keywords, Location Proximity, Time Decay) so users understand *why* items were matched.
2. **Robust & Edge-Case Resilient**: Handle incomplete user descriptions, missing dates, fuzzy locations, and inverted time sequences gracefully.
3. **Visually Stunning UI**: Modern Glassmorphism dark mode, responsive cards, interactive confidence meters, clear visual hierarchy.
4. **Clean Code & Typings**: Strict TypeScript interfaces, pure modular functions for matching logic, and testable unit suites.
