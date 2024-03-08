import Link from 'next/link';
import React from 'react';

export default function Nav({ description, path, title }) {
  return (
    <Link
      className="flex max-w-xs flex-col gap-2 rounded-xl bg-white/10 p-3 pl-4 pr-4 text-white hover:bg-white/20"
      href={path}
    >
      <h3 className="text-xl font-bold text-[hsl(210,70%,70%)]">{title} →</h3>
      <div className="text-md">{description}</div>
    </Link>
  );
}
