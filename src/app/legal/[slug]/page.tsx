import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteNav } from "../../site";
import { DOCS, UPDATED } from "../content";

export function generateStaticParams() {
  return Object.keys(DOCS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: DOCS[slug]?.title ?? "Legal" };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = DOCS[slug];
  if (!doc) notFound();
  return (
    <div className="site">
      <SiteNav />
      <main id="main" className="legal">
        <nav className="legal-nav" aria-label="Legal documents">
          {Object.entries(DOCS).map(([k, d]) => <Link key={k} href={`/legal/${k}`} aria-current={k === slug ? "page" : undefined}>{d.title}</Link>)}
        </nav>
        <article className="legal-body">
          <h1>{doc.title}</h1>
          <p className="muted">{doc.intro}</p>
          <p className="small faint">Last updated {UPDATED}</p>
          {doc.body}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
