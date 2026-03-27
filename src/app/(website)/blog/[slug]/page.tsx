import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar, Tag, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import {
  getAllPosts,
  getBlogPost,
  type BlogCategory,
} from "@/lib/blog-data";

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
  };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
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
    // Handle bold **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="text-white font-semibold">
            {part.slice(2, -2)}
          </strong>
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

  return (
    <div className="pt-20">
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

      {/* CTA */}
      <section className="py-16 mesh-gradient-alt">
        <div className="max-w-4xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="glass-card rounded-2xl p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to Start Your{" "}
              <span className="gradient-text">Automation Career</span>?
            </h2>
            <p className="text-text-secondary mb-6 max-w-xl mx-auto">
              Join thousands of engineers who have launched their careers with
              EDWartens. Get hands-on training with real industrial hardware and
              VR simulation.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-neon-blue text-white font-medium hover:opacity-90 transition-opacity"
            >
              Get in Touch
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
