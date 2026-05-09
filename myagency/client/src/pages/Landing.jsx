import React from 'react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-[680px]">
          <h1 className="text-5xl font-bold text-navy tracking-tight mb-4">MyAgency</h1>
          <p className="text-text-secondary text-lg leading-relaxed mb-10 max-w-xl">
            The first-ever police leadership accountability tool — empowering current officers, laterals, and those pursuing a career in law enforcement.
          </p>
          <SearchBar />
        </div>
      </main>
    </div>
  );
}
