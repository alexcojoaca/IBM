"use client";

import type { LegalBlock } from "./content";

export default function Doc({ title, blocks }: { title: string; blocks: LegalBlock[] }) {
  return (
    <>
      <h1>{title}</h1>
      {blocks.map((block) => (
        <section key={block.h}>
          <h2>{block.h}</h2>
          {block.p.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ))}
    </>
  );
}
