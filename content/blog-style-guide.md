# EDWartens UK — Blog Style Guide

## Brand voice
- **Authoritative but not academic** — like a senior automation engineer explaining to a junior
- **Specific, not generic** — "Siemens S7-1500 with TIA Portal V18" not "modern PLCs"
- **UK-centric** — prices in £, "petrol" not "gas", "CV" not "resume", "qualified" not "credentialed"
- **Actionable** — every post should answer "so what do I do now?"
- **Confident** — we're the "Best PLC Training Provider UK 2025". Write like it.

## Who we are
- **EDWartens UK** — training division of Wartens Ltd
- **Based in** Milton Keynes (8 Lyon Road, MK1 1EX)
- **Accredited by** CPD (The CPD Group), UKRLP registered
- **Awards** — UK Startup National Winner 2025, Best PLC Training Provider UK 2025, Great British Entrepreneur Awards 2025 Finalist
- **Courses** — Professional Module (£2,140) and AI Module (£2,140), both 5 days, CPD certified
- **Trainers** — practicing automation engineers, not career academics
- **Serve** — UK + 17 EU countries, sponsorship support for skilled worker visas

## Tone rules
- First person plural ("we", "our trainers") when referring to EDWartens
- Second person ("you") when addressing the reader
- No em-dashes — use commas, periods, or colons instead
- No "in today's fast-paced world" or similar filler
- No "Let's dive in!" or "Buckle up" — start with substance
- Contractions are fine ("you're", "don't", "we've")

## Technical credibility — always mention specifics
- **PLC brands:** Siemens (S7-1200, S7-1500), Allen Bradley (CompactLogix, ControlLogix), Mitsubishi, Omron, Schneider
- **Software:** TIA Portal (V17, V18), Studio 5000 (Logix Designer), WinCC, FactoryTalk View
- **Protocols:** Profinet, EtherNet/IP, Modbus TCP, OPC UA
- **Industries:** pharmaceuticals, automotive, food & beverage, packaging, warehouse automation
- **Real salary ranges:** Junior PLC engineer £28-35k, mid-level £40-55k, senior £55-75k, contractors £400-600/day

## Structure template (1200-1500 words)

```
<p>Opening hook — surprising fact, common misconception, or direct question the reader has.</p>
<p>Promise what they'll learn in this post (1-2 sentences).</p>

<h2>First main point (descriptive, not clickbaity)</h2>
<p>...</p>
<p>...</p>

<h2>Second main point</h2>
<p>...</p>
<ul>
  <li><strong>Specific claim:</strong> supporting detail</li>
  <li><strong>Specific claim:</strong> supporting detail</li>
</ul>

<h3>Sub-point</h3>
<p>...</p>

<h2>Third main point</h2>
<p>...</p>

<h2>What this means for you</h2>
<p>Actionable advice based on the above.</p>

<h2>Next steps</h2>
<p>CTA paragraph pointing to /courses/professional or /contact. One sentence about EDWartens' credentials (CPD, awards, 100% placement support) + specific action link.</p>
```

## Internal link targets (always available)
- `/courses/professional` — Professional Automation Module (£2,140)
- `/courses/ai-module` — AI & ML in Industrial Automation (£2,140)
- `/courses` — all courses
- `/plc-training-uk` — UK training locations
- `/plc-training-europe` — EU training locations
- `/automation-engineer-career-guide` — career guide
- `/plc-engineer-salary-uk` — salary guide
- `/placements` — placement stats
- `/reviews` — student reviews
- `/contact` — contact form
- `/faq` — FAQ
- **City pages** — `/plc-training-london`, `/plc-training-manchester`, `/plc-training-birmingham`, `/plc-training-leeds`, `/plc-training-glasgow`, `/plc-training-munich`, `/plc-training-amsterdam`, `/plc-training-warsaw`, `/plc-training-berlin`, etc. (85 cities total — check `src/app/(website)/[citySlug]/` for full list)

## CTA pattern (use near end of every post)

Variants (rotate between them):

**Variant A — course-focused:**
```html
<p>If you're ready to move from reading about PLC engineering to actually doing it, our <a href="/courses/professional">Professional Automation Engineering Module</a> covers Siemens TIA Portal, WinCC SCADA, and real industrial projects across 5 days — with 15 hours of recorded sessions and career support until you're placed. <a href="/contact">Speak to our admissions team</a> to book a free consultation.</p>
```

**Variant B — career-focused:**
```html
<p>EDWartens UK is CPD accredited and ranked Best PLC Training Provider UK 2025. If you want dedicated career support alongside technical training, check our <a href="/placements">placement record</a> or <a href="/contact">book a call</a> to discuss your goals.</p>
```

**Variant C — location-specific:**
```html
<p>We run <a href="/plc-training-uk">training across the UK</a> and <a href="/plc-training-europe">17 EU countries</a>, with our main centre in Milton Keynes. Call <strong>+44 333 33 98 394</strong> or <a href="/contact">send us a message</a> to find a cohort near you.</p>
```

## SEO rules
- **Primary keyword** in title, first paragraph, and one H2
- **Secondary keywords** naturally in H2s and body (2-3 mentions)
- **Excerpt/meta description** 140-160 chars, includes primary keyword, ends with benefit
- **Keywords array** 5-8 entries, mix of core terms + long-tail
- **Never keyword-stuff** — if it reads awkwardly, rewrite

## Image naming convention
Pick from existing images in `/public/images/stock/` or `/public/images/blog/`:
- Technical content → `hero-automation.jpg`, `plc-wiring.jpg`, `scada-screen.jpg`
- Career content → `engineer-career.jpg`, `team-meeting.jpg`
- Training content → `classroom.jpg`, `student-hands-on.jpg`
- City/location → city-specific if available, else `uk-map.jpg`

## Things to avoid
- Fake statistics ("90% of engineers say...")
- Unverified claims ("we've trained 50,000 engineers" — use our actual numbers)
- Generic advice ("work hard, network, be passionate")
- American spelling ("organization", "color", "specialize")
- Oxford commas (UK style: no comma before "and" in lists)
- Superlatives without backing ("the best", "the most amazing" unless backed by award)
