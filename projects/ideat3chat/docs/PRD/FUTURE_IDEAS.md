# PRD - Future Ideas and Roadmap

## Summary
This document outlines the planned evolution of the ideas board into a lightweight "universal startup" for creators. The short-term focus is a free plan where humans post and vote. The next tier adds AI support for curation, rewrites, and dedupe, plus automated scouting from X, Reddit, and YouTube.

## Vision
Give creators a single place to capture, rank, and refine content ideas. Start simple, then grow into an AI-assisted pipeline that turns raw ideas and external signals into high-quality, actionable topics.

## Current state (v0)
- Static HTML, no backend.
- LocalStorage only; ideas live in the browser.
- No accounts, no sharing across users, no moderation tools.

## Goals
- Make it easy for humans to post and vote on ideas (free plan).
- Build an upgrade path where AI improves quality and reduces noise.
- Provide structured scouting from external sources without breaking focus or usability.

## Non-goals (for now)
- No full social network features.
- No heavy analytics dashboard.
- No paid subscriptions until the AI tier is real and valuable.

## Personas
- Creator: wants a steady pipeline of good topics.
- Editor/producer: wants ranked, deduped, and concise briefs.
- Scout: wants to surface trends from external sources quickly.

## Product principles
- Keep the core flow fast: submit -> vote -> review.
- Reduce noise before adding features.
- AI should be assistive, not mandatory.

## Phase 1: Free plan (humans only)
Core features:
- Public idea submission with title, description, source URL, timeliness, effort.
- Voting (up/down) and basic sorting (top, newest).
- Comments per idea.
- Lightweight tagging for timeliness (breaking, semi-recent, evergreen).
- Simple moderation controls (hide, remove) for the owner.

Nice-to-have:
- Basic sharing links for individual ideas.
- Export to CSV or JSON.
- Simple email intake (one-way import).

## Phase 2: Paid tier - AI support for human ideas
AI features:
- Curation: summarize long ideas into 1-2 sentences.
- Rewrites: title variants optimized for clarity and curiosity.
- Dedupe: detect near-duplicate ideas and suggest merges.
- Clustering: group related ideas with an auto-generated label.
- Quality hints: suggest missing context, source links, or angles.

UX concepts:
- "Improve" button on each idea that generates a refined version.
- "Merge suggestions" panel that shows duplicates.
- "Editor view" that lists the top 10 ideas with AI summaries.

## Phase 3: AI scouting (X, Reddit, YouTube)
Source ingestion:
- X: track lists, keywords, or creators.
- Reddit: track subreddits and recurring themes.
- YouTube: track channels and trending topics.

Pipeline outline:
1) Ingest sources and normalize metadata (title, author, date, engagement).
2) Extract candidate ideas (short summary + primary claim).
3) Dedupe and cluster with existing ideas.
4) Score by recency, engagement, and relevance.
5) Surface a daily or weekly "scout queue".

Output formats:
- Daily digest (top 5 to 10 external signals).
- "New ideas" feed that can be accepted or dismissed.
- Suggested follow-up angles ("what is missing", "counterpoint", "explainer").

## Data model (target)
- Idea: id, title, description, tags, source URLs, votes, comments.
- Source: platform, url, author, timestamp, engagement metrics.
- Cluster: canonical idea id, duplicates, score, label.
- User: role (viewer, editor, admin), plan (free, AI).

## Architecture sketch (target)
- Frontend: static or SSR UI with authenticated user sessions.
- Backend: simple API for ideas, votes, comments, and ingest.
- Jobs: scheduled workers for scouting, dedupe, and clustering.
- Storage: relational DB for ideas + a vector index for similarity.

## Metrics
- Free plan: ideas submitted per week, votes per idea, retention of submitters.
- AI tier: percent of ideas improved, time saved per editor, upgrade rate.
- Scouting: accepted vs dismissed external ideas, time-to-first-use.

## Risks and constraints
- Source terms of service may limit scraping or API use.
- Noise and spam increase with open submissions.
- AI costs must be controlled by batching and caching.

## Open questions
- How public should the free plan be (open to all vs invite-only)?
- What is the right pricing unit (per seat, per team, per volume)?
- Which sources matter most for early adopters?
- What is the minimum viable moderation stack?
