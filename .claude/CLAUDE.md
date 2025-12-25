# YelpCamp - Claude Code Instructions

> For project overview and philosophy, see `../README.md`

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         YelpCamp                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐          │
│   │   UI_Nuxt4  │   │  UI_React   │   │  UI_Svelte  │   ...    │
│   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘          │
│          │                 │                 │                   │
│          └────────────┬────┴────────────────┘                   │
│                       │                                          │
│               ┌───────▼───────┐                                 │
│               │   API Layer   │  (tRPC / REST / GraphQL)        │
│               └───────┬───────┘                                 │
│                       │                                          │
│   ┌─────────────┐   ┌─┴───────────┐   ┌─────────────┐          │
│   │  API_Hono   │   │Server_Nitro │   │ API_Express │   ...    │
│   └─────────────┘   └─────────────┘   └─────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Current State

| Module | Type | Framework | Port | Status |
|--------|------|-----------|------|--------|
| YelpCamp_UI_Nuxt4 | UI | Nuxt 4 + Vue 3 | 3000 | Active |
| YelpCamp_API_Hono | API | Hono + Bun | 3001 | Active |
| YelpCamp_Server_Nitro | Server | Nitro (standalone) | 3002 | Active |

## Naming Convention

```
YelpCamp_<Type>_<Framework>

Types:
  UI     → Frontend applications
  API    → Backend API servers
  Server → Standalone services (e.g., Nitro extracted from Nuxt)
```

## Key Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview for humans |
| `SPECS.md` | Complete application specification (data models, API, validation, UI specs) |
| `<Module>/.claude/CLAUDE.md` | Module-specific setup and patterns |

## Working with This Codebase

### When Adding a New Frontend
1. Create `YelpCamp_UI_<Framework>/` directory
2. Follow `SPECS.md` Section 8 (UI Specifications) and Appendix B (Frontend Guide)
3. Use Appendix E.1 (Frontend Checklist) to track progress
4. Create `.claude/CLAUDE.md` with framework-specific docs

### When Adding a New Backend
1. Create `YelpCamp_API_<Framework>/` directory
2. Follow `SPECS.md` Section 5 (API Endpoints) and Appendix C (Backend Guide)
3. Use Appendix E.2 (Backend Checklist) to track progress
4. Create `.claude/CLAUDE.md` with framework-specific docs

### When Modifying Existing Modules
1. Check the module's `.claude/CLAUDE.md` for setup instructions
2. Reference `SPECS.md` for expected behavior
3. Ensure changes maintain compatibility with other modules

## Quick Commands

```bash
# Hono API (port 3001)
cd YelpCamp_API_Hono
bun install && bun run db:push && bun run db:seed && bun run dev

# Nitro Server (port 3002)
cd YelpCamp_Server_Nitro
npm install && npm run db:push && npm run db:seed && npm run dev

# Nuxt UI (port 3000)
cd YelpCamp_UI_Nuxt4
npm install && npm run dev
```

## SPECS.md Reference

| Section | Content |
|---------|---------|
| 1-2 | System overview, core concepts |
| 3 | Data models (User, Campground, Comment) |
| 4 | Authentication & authorization |
| 5 | API endpoints |
| 6 | Validation rules |
| 7 | Business logic & workflows |
| 8 | UI specifications |
| 9-10 | Security, error handling |
| 11-12 | Seed data, configuration |
| Appendix B | Frontend implementation guide |
| Appendix C | Backend implementation guide |
| Appendix D | Technology comparison matrix |
| Appendix E | Implementation checklists |
| Appendix F | Quick start templates |

## Module Documentation Links

- [YelpCamp_UI_Nuxt4/.claude/CLAUDE.md](../YelpCamp_UI_Nuxt4/.claude/CLAUDE.md)
- [YelpCamp_API_Hono/.claude/CLAUDE.md](../YelpCamp_API_Hono/.claude/CLAUDE.md)
- [YelpCamp_Server_Nitro/.claude/CLAUDE.md](../YelpCamp_Server_Nitro/.claude/CLAUDE.md)
