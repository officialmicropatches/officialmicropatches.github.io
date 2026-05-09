import React from 'react';

const GRADE_STYLES = {
  A: 'bg-green-100 text-grade-a',
  B: 'bg-lime-100 text-grade-b',
  C: 'bg-amber-100 text-grade-c',
  D: 'bg-orange-100 text-grade-d',
  F: 'bg-red-100 text-grade-f',
};

export default function GradeBadge({ grade, size = 'md' }) {
  if (!grade) return null;
  const sizeClasses = size === 'lg' ? 'text-2xl px-4 py-1.5' : size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';
  return (
    <span className={`inline-flex items-center justify-center font-bold rounded-full ${sizeClasses} ${GRADE_STYLES[grade] || 'bg-gray-100 text-gray-600'}`}>
      {grade}
    </span>
  );
}
