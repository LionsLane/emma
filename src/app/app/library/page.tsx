"use client";

import { useState } from "react";
import { useEmma } from "@/lib/store";
import { num, shortDate } from "@/lib/metrics";
import type { AssetType } from "@/lib/types";
import { PageIntro, Sheet } from "@/components/ui";
import { IconDoc, IconImage, IconPalette, IconPen, IconSlides, IconTrash, IconVideo, IconFolder } from "@/components/icons";

const TYPE_ICON: Record<AssetType, typeof IconDoc> = {
  image: IconImage, video: IconVideo, document: IconDoc, presentation: IconSlides, design: IconPalette, copy: IconPen, template: IconFolder,
};
const TYPES: AssetType[] = ["copy", "image", "video", "document", "presentation", "design", "template"];

export default function Library() {
  const ws = useEmma((s) => s.ws);
  const patch = useEmma((s) => s.patch);
  const remove = useEmma((s) => s.remove);
  const send = useEmma((s) => s.send);
  const setDrawer = useEmma((s) => s.setDrawer);
  const [type, setType] = useState<AssetType | "">("");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const open = ws.library.find((a) => a.id === openId) ?? null;

  const items = ws.library.filter((a) => (!type || a.type === type) && (!q || `${a.title} ${a.tags.join(" ")} ${a.body ?? ""}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <div>
      <PageIntro
        title="Content Library"
        right={
          <div className="row">
            <input className="input sm" style={{ width: 220 }} placeholder="Search titles, tags, copy" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search library" />
            <select className="select sm" value={type} onChange={(e) => setType(e.target.value as AssetType | "")} aria-label="Filter by type">
              <option value="">All types</option>{TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <button className="btn ai sm" onClick={() => { setDrawer(true); void send("Take our best-performing recent content and repurpose it: one blog becomes a reel script, three posts, an email section and a carousel. Save them to the library."); }}><IconPen />Repurpose with EMMA</button>
          </div>
        }
      />
      <div className="tiles">
        {items.map((a) => {
          const Icon = TYPE_ICON[a.type] ?? IconDoc;
          return (
            <button key={a.id} className="glass tile" onClick={() => setOpenId(a.id)}>
              <div className={`tile-art ${a.owner === "EMMA" ? "ai" : ""}`}><Icon /></div>
              <div className="ttl">{a.title}</div>
              <div className="meta">
                <span className="chip">{a.type}</span>
                {a.owner === "EMMA" && <span className="chip ai">EMMA</span>}
                <span>{shortDate(a.updated)}</span>
                <span>{num(a.downloads)} downloads</span>
              </div>
              {a.tags.length > 0 && <div className="meta">{a.tags.map((t) => <span key={t}>#{t}</span>)}</div>}
            </button>
          );
        })}
      </div>
      {items.length === 0 && <div className="empty">Nothing matches.</div>}

      <Sheet open={Boolean(open)} onClose={() => setOpenId(null)} kicker={open ? `${open.type} · ${open.owner}` : ""} title={open?.title ?? ""}
        foot={open && <div className="row"><button className="btn ghost sm danger right" onClick={() => { remove("library", open.id); setOpenId(null); }}><IconTrash />Delete</button></div>}
      >
        {open && (
          <div className="stack">
            <div className="row small muted">Updated {shortDate(open.updated)} · {num(open.downloads)} downloads{open.platform ? ` · ${open.platform}` : ""}</div>
            {open.body !== undefined ? (
              <div className="field">
                <label htmlFor="body">Copy</label>
                <textarea id="body" className="textarea" rows={16} value={open.body} onChange={(e) => patch("library", open.id, { body: e.target.value })} />
                <button className="btn sm" style={{ alignSelf: "flex-start" }} onClick={() => navigator.clipboard?.writeText(open.body ?? "")}>Copy to clipboard</button>
              </div>
            ) : (
              <p className="muted small">This is a file asset. Connect storage (Google Drive, Dropbox) to preview and download it from here.</p>
            )}
          </div>
        )}
      </Sheet>
    </div>
  );
}
