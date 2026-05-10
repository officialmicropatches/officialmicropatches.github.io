import React from 'react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-5 py-12 sm:py-20">
        <div className="w-full max-w-[640px]">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-navy/5 border border-navy/10 rounded-full px-3.5 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-navy shrink-0" />
            <span className="text-xs font-medium text-navy tracking-wide">
              Anonymous. Free. For law enforcement.
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-navy tracking-tight leading-[1.1] mb-4">
            Search an agency<br />before you join it.
          </h1>

          {/* Subheadline */}
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed mb-10 max-w-lg">
            Anonymous leadership reviews for police departments and sheriff's offices across the United States.
          </p>

          {/* Search */}
          <SearchBar />

          {/* Example links */}
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-xs text-text-secondary">Try:</span>
            {[
              { label: 'Chandler PD', slug: 'chandler-police-department-az' },
              { label: 'NYPD', slug: 'new-york-police-department-ny' },
              { label: 'LAPD', slug: 'los-angeles-police-department-ca' },
              { label: 'Chicago PD', slug: 'chicago-police-department-il' },
            ].map(({ label, slug }) => (
              <a
                key={slug}
                href={`/agency/${slug}`}
                className="text-xs font-medium text-navy hover:text-navy-hover underline underline-offset-2 decoration-navy/30 transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="px-5 py-6 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-secondary">
          <span>© 2026 RateMyAgency</span>
          <span>Anonymous platform for law enforcement professionals. No badge numbers. No department emails.</span>
        </div>
      </footer>
    </div>
  );
}
