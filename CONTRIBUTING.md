# Contributing to AstroDeck

Thank you for your interest in contributing to AstroDeck! We're excited to have you join our community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
- [For AI Assistants](#for-ai-assistants)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

## How Can I Contribute?

### Ways to Contribute

- 🐛 **Report bugs** - Help us identify issues
- 💡 **Suggest features** - Share ideas for improvements
- 📝 **Improve documentation** - Help others understand the project
- 🎨 **Add components** - Create new section components
- 🔧 **Fix issues** - Submit pull requests
- ⭐ **Star the repo** - Show your support
- 🐦 **Share** - Spread the word

## Development Setup

### Prerequisites

- Node.js 22.0.0 or higher
- npm (comes with Node.js)
- Git

### Getting Started

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/astrodeck.git
   cd astrodeck
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:4321 in your browser

4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

### Project Structure

```
src/
├── components/
│   ├── sections/      # Page sections (Hero, CTA, etc.)
│   ├── ui/            # shadcn/ui components
│   └── *.astro        # Shared components
├── layouts/           # Page templates
├── pages/             # Routes (file-based routing)
├── styles/            # Global styles
└── lib/               # Utilities
```

## Coding Guidelines

### General Principles

- **Keep it simple** - Don't over-engineer solutions
- **Follow existing patterns** - Consistency is key
- **Mobile-first** - Always design for mobile, then scale up
- **Accessible** - Use semantic HTML and ARIA labels
- **TypeScript** - Add types for all props and functions

### File Naming Conventions

- **Components**: PascalCase (e.g., `Hero.astro`, `ThemeToggle.astro`)
- **Pages**: kebab-case (e.g., `index.astro`, `about-us.astro`)
- **Utilities**: camelCase (e.g., `utils.ts`)

### Import Guidelines

✅ **Always use the `@/` alias:**
```astro
import Hero from "@/components/sections/Hero.astro";
import { Button } from "@/components/ui/button";
```

❌ **Don't use relative imports:**
```astro
import Hero from "../components/sections/Hero.astro"; // Wrong!
```

### Styling Rules

✅ **DO:**
- Use Tailwind utility classes exclusively
- Use CSS variables for colors (supports theming)
- Make components responsive with breakpoints
- Test in both light and dark mode

❌ **DON'T:**
- Use inline styles (`style="..."`)
- Create component-specific CSS files
- Hardcode colors (`bg-blue-500`)
- Use CSS-in-JS libraries

**Example - Correct styling:**
```astro
<section class="py-20 px-6 bg-background">
  <h1 class="text-4xl md:text-6xl font-bold text-foreground">
    Title
  </h1>
  <p class="text-muted-foreground">Description</p>
</section>
```

### TypeScript Guidelines

Always add type annotations for component props:

```astro
---
interface Props {
  title: string;
  description?: string;
  variant?: 'default' | 'centered';
}

const {
  title,
  description = "",
  variant = 'default'
} = Astro.props;
---
```

### Component Structure

Follow this pattern for section components:

```astro
---
// 1. Imports
import { Button } from "@/components/ui/button";

// 2. Props interface
interface Props {
  title?: string;
}

// 3. Props with defaults
const { title = "Default" } = Astro.props;
---

<!-- 4. Semantic HTML -->
<section class="py-20 px-6">
  <!-- 5. Container -->
  <div class="max-w-7xl mx-auto">
    <!-- 6. Content -->
    <h2>{title}</h2>
  </div>
</section>
```

### Responsive Design

Use mobile-first approach with Tailwind breakpoints:

```astro
<!-- ✅ Correct: Mobile-first -->
<h1 class="text-3xl md:text-5xl lg:text-6xl">

<!-- ❌ Wrong: Desktop-first -->
<h1 class="text-6xl lg:text-3xl">
```

**Breakpoints:**
- `sm:` 640px - Small tablets
- `md:` 768px - Tablets
- `lg:` 1024px - Laptops
- `xl:` 1280px - Desktops
- `2xl:` 1536px - Large screens

### Accessibility Guidelines

- Use semantic HTML elements (`<section>`, `<article>`, `<nav>`, etc.)
- Add `alt` attributes to all images
- Ensure proper heading hierarchy (h1 → h2 → h3)
- Use ARIA labels for icon buttons
- Test keyboard navigation
- Maintain color contrast ratios

**Example:**
```astro
<!-- ✅ Good accessibility -->
<button aria-label="Close menu" class="...">
  <svg aria-hidden="true">...</svg>
</button>

<!-- ❌ Poor accessibility -->
<div onclick="closeMenu()">
  <svg>...</svg>
</div>
```

## For AI Assistants

**👋 If you're an AI coding assistant (Claude, ChatGPT, Cursor, Copilot, etc.) helping a developer contribute to AstroDeck, please read this section carefully.**

### Quick Context for AI

**Project Type:** Component library for Astro.js
**Stack:** Astro v7.x (latest) + Tailwind CSS v4.x (latest) + shadcn/ui + TypeScript (latest)
**Purpose:** Pre-built sections for landing pages

**CRITICAL:**
- Always use the latest versions of Astro and Tailwind CSS v4
- This project uses **@tailwindcss/vite** plugin (NOT @astrojs/tailwind)
- Theme configuration is in CSS using `@theme` directive
- Colors use OKLCH format (NOT HSL)
- No `tailwind.config.mjs` file (v4 uses CSS-based configuration)

### Key Rules When Generating Code

1. **✅ ALWAYS:**
   - Use `@/` import alias for src/ directory
   - Use Tailwind utility classes only (no inline styles)
   - Use CSS variables for colors (`bg-primary`, not `bg-blue-500`)
   - Add TypeScript types for props
   - Make components responsive (mobile-first)
   - Test in both light and dark mode
   - Follow existing component patterns
   - Use semantic HTML

2. **❌ NEVER:**
   - Create inline styles or separate CSS files
   - Hardcode colors (breaks dark mode)
   - Use relative imports (`../components`)
   - Create .tsx files for static content (use .astro)
   - Skip TypeScript types
   - Ignore responsive design
   - Use `any` type

### File Locations Guide

When helping developers add features:

- **New page** → `src/pages/your-page.astro`
- **New section** → `src/components/sections/YourSection.astro`
- **New UI component** → `src/components/ui/your-component.tsx`
- **Layout changes** → `src/layouts/`
- **Theme customization** → `src/styles/globals.css`

### Component Generation Template

When creating new sections, use this template:

```astro
---
interface Props {
  title?: string;
  description?: string;
}

const {
  title = "Default Title",
  description = "Default description"
} = Astro.props;
---

<section class="py-20 px-6">
  <div class="max-w-7xl mx-auto">
    <h2 class="text-4xl font-bold mb-4">{title}</h2>
    {description && (
      <p class="text-muted-foreground">{description}</p>
    )}
  </div>
</section>
```

### Common Patterns

**Page creation:**
```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import Hero from "@/components/sections/Hero.astro";
---

<BaseLayout title="Page Title" description="SEO description">
  <Hero />
</BaseLayout>
```

**Using shadcn/ui components:**
```astro
---
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
---

<div>
  <Card>
    <h3>Card Title</h3>
    <Button>Click me</Button>
  </Card>
</div>
```

### Layout Selection

Help developers choose the right layout:

- **BaseLayout** - Most pages (centered, max-w-5xl)
- **FullWidthLayout** - Showcase pages (full viewport width)
- **AuthLayout** - Login/signup (no header/footer)

### Debugging Checklist

Before suggesting a fix, check:

- [ ] Imports use `@/` alias?
- [ ] Colors use CSS variables?
- [ ] Component responsive on mobile?
- [ ] TypeScript types defined?
- [ ] Works in dark mode?
- [ ] Using correct layout?
- [ ] Following existing patterns?

### Additional Resources for AI

- **AI Guide**: See [`AI.md`](./AI.md) for comprehensive AI assistant documentation
- **Code Rules**: See [`.cursorrules`](./.cursorrules) for detailed coding conventions
- **Examples**: Browse `/sections` page in development server for component examples

## Submitting Changes

### Pull Request Process

1. **Ensure your code works**
   ```bash
   # Test in dev mode
   npm run dev

   # Build successfully
   npm run build

   # Preview build
   npm run preview
   ```

2. **Test thoroughly**
   - [ ] Component displays correctly
   - [ ] Responsive on mobile, tablet, desktop
   - [ ] Works in light mode
   - [ ] Works in dark mode
   - [ ] No TypeScript errors
   - [ ] No console errors

3. **Commit with clear messages**
   ```bash
   git add .
   git commit -m "Add: Newsletter section component"
   # or
   git commit -m "Fix: Hero component responsive layout"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill in the PR template
   - Link related issues

### Pull Request Guidelines

**Title Format:**
- `Add: New feature description`
- `Fix: Bug description`
- `Update: What was updated`
- `Docs: Documentation changes`

**Description Should Include:**
- What changes were made
- Why the changes were needed
- Screenshots (for UI changes)
- How to test the changes
- Related issue numbers

**Example PR Description:**
```markdown
## Changes
Added a new Newsletter section component with email input and subscribe button.

## Why
Requested in issue #42. Many users need newsletter signup sections.

## Screenshots
[Include screenshot]

## Testing
1. Visit http://localhost:4321/sections
2. Scroll to Newsletter section
3. Verify responsive layout
4. Test dark mode toggle

Closes #42
```

## Reporting Bugs

### Before Submitting a Bug Report

- Check if the issue already exists in [Issues](https://github.com/holger1411/astrodeck/issues)
- Ensure it's actually a bug (not a configuration issue)
- Collect information about the bug

### How to Submit a Bug Report

1. Go to [Issues](https://github.com/holger1411/astrodeck/issues)
2. Click "New Issue"
3. Choose "Bug Report" template
4. Fill in all sections:

```markdown
## Description
Brief description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots
If applicable

## Environment
- OS: [e.g., macOS 14.1]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 22.0.0]
- AstroDeck version: [e.g., 1.0.0]

## Additional Context
Any other relevant information
```

## Suggesting Features

### Before Suggesting a Feature

- Check if the feature already exists
- Check if it's already requested in [Issues](https://github.com/holger1411/astrodeck/issues)
- Consider if it fits AstroDeck's scope (component library for landing pages)

### How to Suggest a Feature

1. Go to [Issues](https://github.com/holger1411/astrodeck/issues)
2. Click "New Issue"
3. Choose "Feature Request" template
4. Fill in details:

```markdown
## Feature Description
Clear description of the feature

## Use Case
Why is this feature needed? What problem does it solve?

## Proposed Solution
How should it work?

## Alternatives Considered
Other ways to achieve the same goal

## Additional Context
Mockups, examples, related features
```

## Community

### Getting Help

- **Documentation**: Start with [README.md](./README.md)
- **AI Guide**: Check [AI.md](./AI.md) for development help
- **Issues**: Search existing issues
- **Discussions**: Use GitHub Discussions for questions

### Recognition

Contributors will be:
- Listed in the GitHub contributors page
- Mentioned in release notes (for significant contributions)
- Appreciated in our community

## License

By contributing to AstroDeck, you agree that your contributions will be licensed under the MIT License.

---

## Quick Links

- 📝 [AI Developer Guide](./AI.md) - For AI assistants
- 📋 [Code Rules](./.cursorrules) - Detailed coding conventions
- 🐛 [Report Bug](https://github.com/holger1411/astrodeck/issues/new)
- 💡 [Request Feature](https://github.com/holger1411/astrodeck/issues/new)
- ⭐ [Star the Repo](https://github.com/holger1411/astrodeck)

---

**Thank you for contributing to AstroDeck! 🚀**

Every contribution, no matter how small, helps make AstroDeck better for everyone.
