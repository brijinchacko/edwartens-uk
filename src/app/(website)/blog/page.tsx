"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, ArrowRight, Tag } from "lucide-react";
import { getAllPosts, categories, type BlogCategory } from "@/lib/blog-data";

const allPosts = getAllPosts();

const categoryColors: Record<BlogCategory, string> = {
  "Physical AI": "bg-neon-blue/15 text-neon-blue",
  "Digital AI": "bg-purple-500/15 text-purple-400",
  Industry: "bg-amber-500/15 text-amber-400",
  Career: "bg-neon-green/15 text-neon-green",
  Company: "bg-rose-500/15 text-rose-400",
};

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<
    "All" | BlogCategory
  >("All");

  const filtered =
    activeCategory === "All"
      ? allPosts
      : allPosts.filter((p) => p.category === activeCategory);

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="mesh-gradient-hero py-24 sm:py-32 relative">
        <div className="dot-grid absolute inset-0 opacity-20" />
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 relative z-10">
          <p className="text-[11px] uppercase tracking-widest text-neon-blue mb-3">
            Blog
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
            Insights &amp; <span className="gradient-text">Resources</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl leading-relaxed">
            Expert articles on industrial automation, PLC programming, SCADA
            systems, career advice, and the latest in Physical AI and Digital AI
            education.
          </p>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-8 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory("All")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === "All"
                  ? "bg-neon-blue text-white"
                  : "glass-card text-text-secondary hover:text-white"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-neon-blue text-white"
                    : "glass-card text-text-secondary hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-muted text-lg">
                No articles in this category yet.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="glass-card rounded-xl p-6 flex flex-col hover:border-white/[0.12] transition-all group"
                >
                  {/* Category + Read Time */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-[11px] uppercase tracking-widest font-medium px-2.5 py-1 rounded-full ${
                        categoryColors[post.category]
                      }`}
                    >
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-text-muted">
                      <Clock size={12} />
                      {post.readTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-bold text-white mb-3 group-hover:text-neon-blue transition-colors line-clamp-2">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-sm text-text-secondary leading-relaxed mb-4 flex-1 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 text-[10px] text-text-muted bg-white/[0.04] px-2 py-0.5 rounded"
                      >
                        <Tag size={8} />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Read link */}
                  <div className="flex items-center gap-1.5 text-sm text-neon-blue font-medium">
                    Read article
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
