---
name: add-ui-component
description: Add or modify UI components in this repo using shadcn/ui (base-rhea style, Tailwind CSS v4, Base UI primitives). Use when a new UI primitive is needed in components/ui/ or when styling/theming pages.
---

# Adding UI components

## New shadcn/ui primitives

The `shadcn` CLI is a local dependency — generate primitives instead of hand-writing them:

```bash
bunx shadcn add <component>
```

Per `components.json`: style **base-rhea** (components are built on `@base-ui/react`, not Radix), base color neutral, icons from **lucide-react**, output to `components/ui/`, `cn()` util at `lib/utils.ts`.

## Conventions

- Tailwind CSS **v4**: there is no `tailwind.config.*`; theme configuration lives in CSS at `app/globals.css` (`@theme`, CSS variables). Don't create a tailwind config file.
- Use semantic token classes (`text-muted-foreground`, `bg-card`, `text-foreground`) rather than raw palette colors, so dark mode keeps working.
- Import aliases: `@/components`, `@/components/ui`, `@/lib`, `@/hooks`.
- Icons: lucide-react, sized with Tailwind classes, `aria-hidden="true"` on decorative icons.
- Accessibility is a project feature (README): interactive states need `aria-live` regions, `role="alert"` for errors, and label associations — match the existing forms in `components/auth/`.
- Compose variants with `class-variance-authority` (cva) + `cn()`, matching the existing `components/ui/button.tsx` pattern.
