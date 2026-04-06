import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar, Tag, ArrowRight, Award } from "lucide-react";
import type { Metadata } from "next";
import {
  getAllPosts,
  getBlogPost,
  type BlogCategory,
} from "@/lib/blog-data";
import CopyLinkButton from "@/components/CopyLinkButton";

type Props = {
  params: Promise<{ slug: string }>;
};

const categoryColors: Record<BlogCategory, string> = {
  "Physical AI": "bg-neon-blue/15 text-neon-blue",
  "Digital AI": "bg-purple-500/15 text-purple-400",
  Industry: "bg-amber-500/15 text-amber-400",
  Career: "bg-neon-green/15 text-neon-green",
  Company: "bg-rose-500/15 text-rose-400",
};

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: `${post.title} | EDWartens UK Blog`,
    description: post.excerpt,
    keywords: post.seoKeywords || post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: post.image ? [{ url: post.image, width: 1200, height: 630, alt: post.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.image ? [post.image] : undefined,
    },
    alternates: {
      canonical: `https://edwartens.co.uk/blog/${slug}`,
    },
  };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

/** Simple markdown-like renderer: headings, bold, lists, paragraphs */
function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];
  let currentList: string[] = [];
  let key = 0;

  function flushParagraph() {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(" ");
      elements.push(
        <p key={key++} className="text-text-secondary leading-relaxed mb-4">
          {renderInline(text)}
        </p>
      );
      currentParagraph = [];
    }
  }

  function flushList() {
    if (currentList.length > 0) {
      elements.push(
        <ul
          key={key++}
          className="list-disc list-inside space-y-1.5 mb-4 text-text-secondary"
        >
          {currentList.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  }

  function renderInline(text: string): React.ReactNode {
    // Handle markdown links [text](url) and bold **text**
    const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="text-white font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-neon-blue hover:underline">
            {linkMatch[1]}
          </a>
        );
      }
      return part;
    });
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "") {
      flushParagraph();
      flushList();
      continue;
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      elements.push(
        <h4 key={key++} className="text-lg font-bold text-white mt-8 mb-3">
          {trimmed.slice(4)}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      elements.push(
        <h3
          key={key++}
          className="text-xl font-bold text-white mt-10 mb-4"
        >
          {trimmed.slice(3)}
        </h3>
      );
      continue;
    }

    // List items
    if (trimmed.startsWith("- ")) {
      flushParagraph();
      currentList.push(trimmed.slice(2));
      continue;
    }

    // Numbered list items
    if (/^\d+\.\s/.test(trimmed)) {
      flushParagraph();
      if (currentList.length === 0) {
        flushList();
      }
      currentList.push(trimmed.replace(/^\d+\.\s/, ""));
      continue;
    }

    // Regular text
    flushList();
    currentParagraph.push(trimmed);
  }

  flushParagraph();
  flushList();

  return elements;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  // Related articles: other posts from same category, excluding current
  const allPosts = getAllPosts();
  const related = allPosts
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 2);

  // If not enough in same category, backfill from other posts
  const backfill =
    related.length < 2
      ? allPosts
          .filter(
            (p) =>
              p.slug !== post.slug &&
              !related.find((r) => r.slug === p.slug)
          )
          .slice(0, 2 - related.length)
      : [];

  const relatedPosts = [...related, ...backfill];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.image || undefined,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": "Organization", name: "EDWartens UK" },
    publisher: {
      "@type": "Organization",
      name: "EDWartens UK",
      logo: { "@type": "ImageObject", url: "https://edwartens.co.uk/images/EDWARTENS LOGO UK.png" },
    },
    url: `https://edwartens.co.uk/blog/${slug}`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://edwartens.co.uk/blog/${slug}` },
    keywords: (post.seoKeywords || post.tags).join(", "),
  };

  return (
    <div className="pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      {/* Hero */}
      <section className="mesh-gradient-hero py-16 sm:py-24 relative">
        <div className="dot-grid absolute inset-0 opacity-20" />
        <div className="max-w-4xl mx-auto px-3 sm:px-5 lg:px-6 relative z-10">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            Back to Blog
          </Link>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span
              className={`text-[11px] uppercase tracking-widest font-medium px-2.5 py-1 rounded-full ${
                categoryColors[post.category]
              }`}
            >
              {post.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-text-muted">
              <Calendar size={12} />
              {formatDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-text-muted">
              <Clock size={12} />
              {post.readTime}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 text-xs text-text-muted bg-white/[0.06] px-3 py-1 rounded-full"
              >
                <Tag size={10} />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {post.image && (
        <section className="max-w-4xl mx-auto px-3 sm:px-5 lg:px-6 -mt-8 relative z-10">
          <div className="rounded-2xl overflow-hidden border border-white/[0.06]">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-64 sm:h-80 object-cover"
            />
          </div>
        </section>
      )}

      {/* Content */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="glass-card rounded-2xl p-6 sm:p-10">
            <div className="text-sm text-text-muted mb-8">
              By {post.author}
            </div>
            <article className="prose-custom">
              {renderContent(post.content)}
            </article>
          </div>
        </div>
      </section>

      {/* Share Buttons */}
      <section className="pb-8">
        <div className="max-w-4xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="glass-card rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-text-muted">Share this article</p>
            <div className="flex items-center gap-2">
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://edwartens.co.uk/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0A66C2]/10 border border-[#0A66C2]/20 text-[#0A66C2] text-xs font-medium hover:bg-[#0A66C2]/20 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://edwartens.co.uk/blog/${post.slug}`)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-text-secondary text-xs font-medium hover:bg-white/[0.08] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                X / Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://edwartens.co.uk/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1877F2]/10 border border-[#1877F2]/20 text-[#1877F2] text-xs font-medium hover:bg-[#1877F2]/20 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </a>
              <CopyLinkButton url={`https://edwartens.co.uk/blog/${post.slug}`} />
            </div>
          </div>
        </div>
      </section>

      {/* Related Courses */}
      <section className="py-16 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-3 sm:px-5 lg:px-6">
          <h2 className="text-2xl font-bold text-white mb-8">
            Related <span className="gradient-text">Courses</span>
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              href="/courses/professional"
              className="glass-card rounded-xl p-5 hover:border-neon-blue/20 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-purple/10 flex items-center justify-center mb-3">
                <Award size={18} className="text-purple-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1 group-hover:text-neon-blue transition-colors">
                Professional Module
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Siemens PLC, HMI & WinCC SCADA. 5-day CPD Accredited programme
                with career support.
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-neon-blue font-medium mt-3">
                View course <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              href="/courses/ai-module"
              className="glass-card rounded-xl p-5 hover:border-neon-blue/20 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-neon-blue/10 flex items-center justify-center mb-3">
                <Tag size={18} className="text-neon-blue" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1 group-hover:text-neon-blue transition-colors">
                AI Module
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                AI & ML for industrial automation. Predictive maintenance,
                computer vision & digital twins.
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-neon-blue font-medium mt-3">
                View course <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              href="/training"
              className="glass-card rounded-xl p-5 hover:border-neon-blue/20 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-neon-green/10 flex items-center justify-center mb-3">
                <Clock size={18} className="text-neon-green" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1 group-hover:text-neon-blue transition-colors">
                How Training Works
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Day-by-day syllabus, delivery modes, tools, and what to expect
                from our programmes.
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-neon-blue font-medium mt-3">
                Learn more <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 mesh-gradient-alt">
        <div className="max-w-4xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="glass-card rounded-2xl p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to Start Your{" "}
              <span className="gradient-text">Automation Career</span>?
            </h2>
            <p className="text-text-secondary mb-6 max-w-xl mx-auto">
              Explore our CPD Accredited PLC, SCADA, and AI automation courses.
              Hands-on training with real industrial hardware and dedicated
              career support.
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-neon-blue to-neon-green text-dark-primary font-semibold text-sm hover:shadow-lg hover:shadow-neon-blue/25 active:scale-[0.98] transition-all"
            >
              Explore our courses
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-3 sm:px-5 lg:px-6">
            <h2 className="text-2xl font-bold text-white mb-8">
              Related <span className="gradient-text">Articles</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/blog/${rp.slug}`}
                  className="glass-card rounded-xl p-6 hover:border-white/[0.12] transition-all group"
                >
                  <span
                    className={`text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded-full ${
                      categoryColors[rp.category]
                    }`}
                  >
                    {rp.category}
                  </span>
                  <h3 className="text-base font-bold text-white mt-3 mb-2 group-hover:text-neon-blue transition-colors line-clamp-2">
                    {rp.title}
                  </h3>
                  <p className="text-sm text-text-secondary line-clamp-2">
                    {rp.excerpt}
                  </p>
                  <div className="flex items-center gap-1.5 text-sm text-neon-blue font-medium mt-3">
                    Read article
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
