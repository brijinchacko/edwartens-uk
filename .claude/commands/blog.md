---
description: Write and publish a new SEO blog post for edwartens.co.uk
---

# /blog — Automated Blog Post Publisher

You are writing a blog post for **EDWartens UK** (edwartens.co.uk) — a CPD-accredited PLC/SCADA/industrial automation training provider based in Milton Keynes.

## User's argument

The user typed: `/blog $ARGUMENTS`

Parse `$ARGUMENTS`:
- **Empty** → pick next topic from `content/topic-queue.md` and write one post
- **`queue`** → show the remaining topics in queue, do not write
- **`review`** → list drafts awaiting review (posts added in last 24h), do not publish
- **`bulk N`** (e.g. `bulk 3`) → write N posts from the queue
- **Anything else** → treat as a custom topic title and write a post about it

## Workflow

### Step 1 — Understand the brand voice
Read these files first:
- `content/blog-style-guide.md` (brand voice, tone, internal linking rules, CTAs)
- `src/lib/blog-seo-2025.ts` (existing post format — replicate this EXACTLY)
- `src/lib/blog-data.ts` (to understand how posts are aggregated)

### Step 2 — Pick the topic
If the user gave a custom topic, use it. Otherwise:
- Read `content/topic-queue.md`
- Pick the FIRST topic marked `[ ]` (unused)
- After writing, mark it `[x]` with today's date

### Step 3 — Research internal links
Find relevant pages to link to by globbing:
- `src/app/(website)/courses/*/page.tsx` (course pages)
- `src/app/(website)/[city]*/page.tsx` or similar (city pages)
- Recent posts in `src/lib/blog-seo-2025.ts`

Pick 4-6 internal links that fit the topic naturally.

### Step 4 — Write the post
Follow `content/blog-style-guide.md` strictly. Target:
- **1200-1500 words**
- **H2 and H3 headings** (no H1 — the page component renders the title)
- **4-6 internal links** to courses, city pages, salary/career guides
- **1-2 CTAs** (one mid-post, one at the end)
- **HTML content** (use `<h2>`, `<h3>`, `<p>`, `<ul>`, `<li>`, `<strong>`, `<a>`)
- **Genuine authority** — specific names (Siemens S7-1200, Allen Bradley CompactLogix, TIA Portal, Studio 5000), real statistics, concrete examples
- **UK/EU context** — mention specific UK/EU cities, salary ranges in GBP/EUR, visa/sponsorship where relevant

### Step 5 — Format as BlogPost entry
Append to `src/lib/blog-seo-2025.ts` following the existing pattern:

```typescript
{
  slug: "kebab-case-slug",
  title: "Exact Title As It Appears",
  excerpt: "140-160 char meta description, compelling, includes primary keyword",
  category: "Career" | "Training" | "Industry" | "Career Guide",
  author: "EDWartens UK",
  date: "YYYY-MM-DD",  // today's date
  readTime: "8 min read",  // 1200 words ≈ 6-7 min, 1500 ≈ 8 min
  image: "/images/stock/[pick-suitable-existing-image].jpg",
  keywords: ["keyword 1", "keyword 2", ...], // 5-8 keywords
  content: `<p>Opening hook paragraph...</p><h2>...</h2>...`
}
```

**Image selection:** Pick an existing image from `/public/images/stock/` or `/public/images/blog/` that matches the topic. If unsure, use `/images/stock/hero-automation.jpg`.

### Step 6 — Update topic queue
Mark the topic as done in `content/topic-queue.md`:
```
- [x] 2026-04-05 — Topic Title
```

### Step 7 — Build and deploy
Run the publish script:
```bash
bash scripts/publish-blog.sh
```

This will: `npm run build` → rsync `.next` + `src/lib/blog-seo-2025.ts` to production → restart PM2.

### Step 8 — Verify
After deploy, curl the new post URL:
```bash
curl -sS -o /dev/null -w "%{http_code}" https://edwartens.co.uk/blog/[slug]
```

Should return 200. Share the live URL with the user.

## Output format
When done, reply with:
```
✓ Published: [Title]
→ https://edwartens.co.uk/blog/[slug]
→ Category: [Category] · [readTime] · [N] internal links
→ Topics remaining in queue: [N]
```

## Rules (strict)
- **Never invent URLs** — only link to paths that exist in the repo
- **Never use em-dashes to imitate AI style** — use regular punctuation
- **Never add AI-disclosure** ("as an AI...", "written by AI") — it's ghostwritten for EDWartens
- **Never exceed 1600 words** — keep focused
- **Always include** at least one link to `/courses/professional` or `/courses/ai-module`
- **Always include** one CTA paragraph at the end pointing to `/contact` or a phone number
- **Never commit to git or push** — just build and deploy via the script
- **If bulk N**, write all N posts in the same session, then deploy once at the end
