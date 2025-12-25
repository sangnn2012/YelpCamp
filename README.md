# YelpCamp - Modular Full-Stack Learning Platform

## Overview

YelpCamp is a comprehensive reference architecture designed for learning and experimenting with modern web technologies. It serves as a living codebase where any frontend can communicate with any backend through standardized contracts, enabling rapid exploration of new frameworks and patterns.

## Philosophy

This project employs a **decoupled, modular architecture**:

- **Interchangeable Frontends**: Multiple UI implementations using different frameworks (Nuxt 4, React, Vue, Svelte, etc.)
- **Interchangeable Backends**: Various API server implementations (Hono, Express, Fastify, Nest, etc.)
- **Universal Compatibility**: Any UI module can connect to any API module through consistent interfaces

When a new technology emerges, simply add a new implementation module without disrupting existing code. This approach facilitates comparative learning and real-world practice across the entire web development landscape.

## Project Structure

### Naming Convention
```
YelpCamp/
├── .claude/CLAUDE.md           # Claude Code instructions
├── README.md                   # This file
├── SPECS.md                    # Universal specification
│
├── YelpCamp_UI_Nuxt4/          # Frontend: Nuxt 4
├── YelpCamp_UI_React/          # Frontend: React
├── YelpCamp_API_Hono/          # Backend: Hono
├── YelpCamp_API_Express/       # Backend: Express
└── YelpCamp_Server_Nitro/      # Standalone: Nitro
```

- **Frontend modules**: `YelpCamp_UI_<Framework>`
- **Backend modules**: `YelpCamp_API_<Framework>`
- **Standalone services**: `YelpCamp_Server_<Service>` (e.g., Nitro extracted from Nuxt)

### Documentation

- **`SPECS.md`** (root level): Universal specification covering essential frontend and backend concepts, patterns, and best practices—your reference guide when learning any new stack
- **`.claude/CLAUDE.md`** (per module): Module-specific documentation including setup instructions, implementation notes, and framework-specific patterns

## Key Benefits

✅ **Technology Agnostic** - Learn new frameworks without rewriting entire applications
✅ **Comparative Learning** - Compare implementations and patterns across different tech stacks
✅ **Future-Proof** - Seamlessly integrate emerging technologies as they arrive
✅ **Production Standards** - Maintain professional code organization and documentation practices
✅ **Rapid Prototyping** - Quickly test ideas with your preferred frontend/backend combination

## Getting Started

1. Choose any UI module and any API module
2. Review the root `SPECS.md` for universal patterns
3. Check the module's `.claude/CLAUDE.md` for setup instructions
4. Start the API server
5. Start the UI application
6. Begin experimenting!

---

**Note**: This is a learning platform—experiment freely, break things, and iterate. Each module is independent and can be developed, tested, and deployed separately.
