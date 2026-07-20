import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageShell, PageHeader } from "@/components/page-shell";
import { toast } from "sonner";
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  Upload,
  UploadCloud,
  Monitor,
  Camera,
  Link2,
  Cloud,
  X,
  ChevronLeft,
  MoreHorizontal,
} from "lucide-react";

export const Route = createFileRoute("/documents")({
  component: DocumentsPage,
  head: () => ({ meta: [{ title: "Documents — Harwick & Sterne" }] }),
});

type Doc = {
  name: string;
  type: "pdf" | "sheet" | "img";
  size: string;
  updated: string;
  by: string;
};

type Folder = {
  id: string;
  name: string;
  description: string;
  docs: Doc[];
};

const seedFolders: Folder[] = [
  {
    id: "contracts",
    name: "Contracts",
    description: "MSAs, SOWs and executed agreements.",
    docs: [
      { name: "Acme — Master Service Agreement.pdf", type: "pdf", size: "1.4 MB", updated: "2m ago", by: "Avery" },
      { name: "Northwind — SOW v3.pdf", type: "pdf", size: "612 KB", updated: "yesterday", by: "Avery" },
      { name: "Helios — Renewal.pdf", type: "pdf", size: "480 KB", updated: "3d ago", by: "Syra" },
    ],
  },
  {
    id: "financials",
    name: "Financials",
    description: "Forecasts, pipeline and ledgers.",
    docs: [
      { name: "Q2 Pipeline Forecast.xlsx", type: "sheet", size: "248 KB", updated: "1h ago", by: "Syra" },
      { name: "FY26 Budget.xlsx", type: "sheet", size: "512 KB", updated: "1w ago", by: "Marcus" },
    ],
  },
  {
    id: "brand",
    name: "Brand",
    description: "Guidelines, logos and creative assets.",
    docs: [
      { name: "Brand Guidelines v3.pdf", type: "pdf", size: "8.2 MB", updated: "yesterday", by: "Jenna" },
      { name: "Onboarding flow.png", type: "img", size: "612 KB", updated: "2d ago", by: "Marcus" },
      { name: "Logo lockup.png", type: "img", size: "180 KB", updated: "5d ago", by: "Jenna" },
    ],
  },
  {
    id: "discovery",
    name: "Discovery",
    description: "Notes and research from client calls.",
    docs: [
      { name: "Northwind — Discovery Notes.pdf", type: "pdf", size: "320 KB", updated: "3d ago", by: "Syra" },
      { name: "Acme — Intro Call.pdf", type: "pdf", size: "210 KB", updated: "1w ago", by: "Avery" },
    ],
  },
];

const icon = (t: string) =>
  t === "sheet" ? FileSpreadsheet : t === "img" ? FileImage : FileText;

const deriveType = (name: string): Doc["type"] => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["xlsx", "xls", "csv", "numbers"].includes(ext)) return "sheet";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "heic"].includes(ext)) return "img";
  return "pdf";
};

const formatBytes = (bytes: number) => {
  if (!bytes) return "—";
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  if (bytes >= 1e3) return `${Math.round(bytes / 1e3)} KB`;
  return `${bytes} B`;
};

/** Apple-style folder glyph — light gray, tabbed top, soft depth. */
function FolderGlyph({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 128"
      className={className}
      aria-hidden
      role="presentation"
    >
      <defs>
        <linearGradient id="fldr-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DFE1E5" />
          <stop offset="100%" stopColor="#B8BBC2" />
        </linearGradient>
        <linearGradient id="fldr-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9CCD2" />
          <stop offset="100%" stopColor="#A5A9B1" />
        </linearGradient>
      </defs>
      {/* back panel with tab */}
      <path
        d="M8 22 Q8 14 16 14 H60 L72 26 H144 Q152 26 152 34 V108 Q152 116 144 116 H16 Q8 116 8 108 Z"
        fill="url(#fldr-back)"
      />
      {/* front pocket */}
      <path
        d="M8 42 Q8 34 16 34 H144 Q152 34 152 42 V108 Q152 116 144 116 H16 Q8 116 8 108 Z"
        fill="url(#fldr-body)"
      />
      {/* subtle highlight */}
      <path
        d="M8 42 Q8 34 16 34 H144 Q152 34 152 42 V44 H8 Z"
        fill="rgba(255,255,255,0.35)"
      />
    </svg>
  );
}

/** Document thumbnail — page-shaped card with faux content lines. */
function DocThumb({ doc }: { doc: Doc }) {
  const Icon = icon(doc.type);
  const tint =
    doc.type === "sheet"
      ? "bg-emerald-500/10 text-emerald-300"
      : doc.type === "img"
        ? "bg-violet-500/10 text-violet-300"
        : "bg-rose-500/10 text-rose-300";
  return (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden rounded-md border border-white/10 bg-gradient-to-b from-neutral-100 to-neutral-300 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.7)] transition-transform group-hover:-translate-y-0.5 aspect-[3/4]">
        {doc.type === "img" ? (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#c4b5fd,#6d28d9_60%,#1e1b4b)]" />
        ) : doc.type === "sheet" ? (
          <div className="absolute inset-3 grid grid-cols-4 grid-rows-6 gap-[2px]">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-[1px] ${
                  i < 4 ? "bg-neutral-500/60" : i % 3 === 0 ? "bg-neutral-400/40" : "bg-neutral-300/60"
                }`}
              />
            ))}
          </div>
        ) : (
          <div className="absolute inset-4 space-y-1.5">
            <div className="h-2 w-2/3 rounded-sm bg-neutral-500/70" />
            <div className="h-1 w-full rounded-sm bg-neutral-400/50" />
            <div className="h-1 w-11/12 rounded-sm bg-neutral-400/50" />
            <div className="h-1 w-10/12 rounded-sm bg-neutral-400/50" />
            <div className="h-1 w-full rounded-sm bg-neutral-400/50" />
            <div className="h-1 w-9/12 rounded-sm bg-neutral-400/50" />
            <div className="h-1 w-11/12 rounded-sm bg-neutral-400/50" />
            <div className="mt-2 h-1 w-8/12 rounded-sm bg-neutral-400/50" />
            <div className="h-1 w-10/12 rounded-sm bg-neutral-400/50" />
            <div className="h-1 w-7/12 rounded-sm bg-neutral-400/50" />
          </div>
        )}
        <div className={`absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider backdrop-blur-md ${tint}`}>
          <Icon className="h-2.5 w-2.5" />
          {doc.type}
        </div>
      </div>
      <div className="mt-2 px-0.5">
        <div className="truncate text-[12.5px] font-medium text-foreground/90">{doc.name}</div>
        <div className="text-[11px] text-muted-foreground">{doc.size} · {doc.updated}</div>
      </div>
    </div>
  );
}

function DocumentsPage() {
  const [folders, setFolders] = useState<Folder[]>(seedFolders);
  const [openId, setOpenId] = useState<string | null>(null);

  const open = openId ? folders.find((f) => f.id === openId) ?? null : null;

  const addDocs = (incoming: Doc[]) => {
    setFolders((prev) => {
      const targetId = openId ?? prev[0].id;
      return prev.map((f) =>
        f.id === targetId ? { ...f, docs: [...incoming, ...f.docs] } : f,
      );
    });
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Knowledge"
        title="Documents"
        description="Contracts, briefs and assets — organized into folders, searchable by Syra."
        actions={<UploadDialog onUpload={addDocs} />}
      />

      {!open ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8 pt-2">
          {folders.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setOpenId(f.id)}
              className="group flex flex-col items-center text-center focus:outline-none"
            >
              <div className="relative w-full max-w-[180px] transition-transform group-hover:-translate-y-0.5 group-focus-visible:-translate-y-0.5">
                <FolderGlyph className="w-full drop-shadow-[0_16px_28px_rgba(0,0,0,0.55)]" />
                <span className="absolute right-3 top-9 rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
                  {f.docs.length}
                </span>
              </div>
              <div className="mt-3 text-[13px] font-medium text-foreground/90 group-hover:text-foreground">
                {f.name}
              </div>
              <div className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                {f.description}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setOpenId(null)}
              className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 -ml-2 text-[12.5px] text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" /> All folders
            </button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 shrink-0">
              <FolderGlyph className="w-full" />
            </div>
            <div>
              <div className="font-serif-display text-2xl leading-tight tracking-tight">
                {open.name}
              </div>
              <div className="text-[12px] text-muted-foreground">
                {open.docs.length} items · {open.description}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-6">
            {open.docs.map((d) => (
              <DocThumb key={d.name} doc={d} />
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
}

type Source = "device" | "camera" | "link" | "gdrive" | "dropbox" | "onedrive";
type Staged = { id: string; name: string; bytes: number; kind: "file" | "link" };

const SOURCES: { id: Source; label: string; Icon: typeof Monitor; brand?: string }[] = [
  { id: "device", label: "My Device", Icon: Monitor },
  { id: "camera", label: "Camera", Icon: Camera },
  { id: "link", label: "Link (URL)", Icon: Link2 },
  { id: "gdrive", label: "Google Drive", Icon: Cloud, brand: "#1FA463" },
  { id: "dropbox", label: "Dropbox", Icon: Cloud, brand: "#0061FF" },
  { id: "onedrive", label: "OneDrive", Icon: Cloud, brand: "#0078D4" },
];

const CLOUD: Record<string, string> = {
  gdrive: "Google Drive",
  dropbox: "Dropbox",
  onedrive: "OneDrive",
};

function UploadDialog({ onUpload }: { onUpload: (docs: Doc[]) => void }) {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<Source>("device");
  const [staged, setStaged] = useState<Staged[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [url, setUrl] = useState("");

  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);

  const reset = () => {
    setSource("device");
    setStaged([]);
    setDragOver(false);
    setUrl("");
  };

  const addFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const next: Staged[] = Array.from(list).map((f) => ({
      id: `f-${idRef.current++}`,
      name: f.name,
      bytes: f.size,
      kind: "file",
    }));
    setStaged((prev) => [...prev, ...next]);
  };

  const addLink = () => {
    const u = url.trim();
    if (!u) return;
    let name = u;
    try {
      const parsed = new URL(u);
      name = parsed.pathname.split("/").filter(Boolean).pop() || parsed.hostname;
    } catch {
      toast.error("Enter a valid URL");
      return;
    }
    setStaged((prev) => [...prev, { id: `l-${idRef.current++}`, name, bytes: 0, kind: "link" }]);
    setUrl("");
    toast.success("Link added");
  };

  const removeStaged = (id: string) => setStaged((prev) => prev.filter((s) => s.id !== id));

  const commit = () => {
    if (!staged.length) return;
    onUpload(
      staged.map((s) => ({
        name: s.name,
        type: s.kind === "link" ? "pdf" : deriveType(s.name),
        size: s.kind === "link" ? "Link" : formatBytes(s.bytes),
        updated: "just now",
        by: "You",
      })),
    );
    toast.success(`Uploaded ${staged.length} ${staged.length === 1 ? "item" : "items"}`);
    reset();
    setOpen(false);
  };

  const isCloud = source === "gdrive" || source === "dropbox" || source === "onedrive";

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" /> Upload
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-lg max-h-[88vh] overflow-y-auto"
        onPaste={(e) => {
          if (e.clipboardData?.files?.length) {
            addFiles(e.clipboardData.files);
            setSource("device");
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Upload files</DialogTitle>
          <DialogDescription>From your device, camera, a link, or a cloud drive.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2">
          {SOURCES.map((s) => {
            const active = source === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSource(s.id)}
                aria-pressed={active}
                className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors ${
                  active ? "border-foreground/40 bg-foreground/[0.06]" : "border-border hover:bg-foreground/[0.03]"
                }`}
              >
                <s.Icon className="h-5 w-5" style={s.brand ? { color: s.brand } : undefined} />
                <span className="text-[11px] font-medium leading-tight">{s.label}</span>
              </button>
            );
          })}
        </div>

        <div className="py-1">
          {source === "device" && (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                addFiles(e.dataTransfer.files);
              }}
              className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
                dragOver
                  ? "border-primary bg-primary/[0.06]"
                  : "border-border hover:border-foreground/30 hover:bg-foreground/[0.02]"
              }`}
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-foreground/[0.06] text-foreground/70">
                <UploadCloud className="h-6 w-6" />
              </span>
              <span className="text-[13px] font-medium">
                Drag &amp; drop files here, or <span className="text-primary">browse</span>
              </span>
              <span className="text-[11px] text-muted-foreground">
                Any file type · you can also paste (⌘/Ctrl + V)
              </span>
            </button>
          )}

          {source === "camera" && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border px-6 py-10 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-foreground/[0.06] text-foreground/70">
                <Camera className="h-6 w-6" />
              </span>
              <span className="text-[13px] font-medium">Capture a photo to upload</span>
              <Button variant="outline" onClick={() => cameraInput.current?.click()}>
                <Camera className="h-4 w-4 mr-2" /> Open camera
              </Button>
            </div>
          )}

          {source === "link" && (
            <div className="space-y-2 rounded-xl border border-border p-4">
              <label htmlFor="up-url" className="text-[12px] font-medium">
                Paste a file or page URL
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="up-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addLink()}
                  placeholder="https://example.com/report.pdf"
                  autoComplete="off"
                />
                <Button variant="outline" onClick={addLink} disabled={!url.trim()}>
                  Add
                </Button>
              </div>
            </div>
          )}

          {isCloud && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border px-6 py-10 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-foreground/[0.06]">
                <Cloud
                  className="h-6 w-6"
                  style={{ color: SOURCES.find((s) => s.id === source)?.brand }}
                />
              </span>
              <span className="text-[13px] font-medium">Import from {CLOUD[source]}</span>
              <span className="max-w-[260px] text-[11px] text-muted-foreground">
                Connect your {CLOUD[source]} account to browse and import files.
              </span>
              <Button
                variant="outline"
                onClick={() =>
                  toast.message(`Connect ${CLOUD[source]}`, {
                    description: "Cloud import isn't wired up in this demo yet.",
                  })
                }
              >
                Connect {CLOUD[source]}
              </Button>
            </div>
          )}
        </div>

        <input
          ref={fileInput}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={cameraInput}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {staged.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {staged.length} ready to upload
            </div>
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {staged.map((s) => {
                const Icon = s.kind === "link" ? Link2 : icon(deriveType(s.name));
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-2.5 rounded-md border border-border/60 bg-foreground/[0.02] px-2.5 py-1.5"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-[12px]">{s.name}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {s.kind === "link" ? "Link" : formatBytes(s.bytes)}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${s.name}`}
                      onClick={() => removeStaged(s.id)}
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              reset();
            }}
          >
            Cancel
          </Button>
          <Button onClick={commit} disabled={!staged.length}>
            <Upload className="h-4 w-4 mr-2" />
            Upload{staged.length ? ` ${staged.length}` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
