import React from "react";
import Link from "next/link";

export default function Nav({path,title,desc}) {

    return(
      <Link
        className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
        href={path}
      >
        <h3 className="text-2xl font-bold text-[hsl(210,70%,70%)]">{title} →</h3>
        <div className="text-lg">
            {desc}
        </div>
      </Link>
    )
}