import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
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
  MoreHorizontal,
  Monitor,
  Camera,
  Link2,
  Cloud,
  X,
} from "lucide-react";

export const Route = createFileRoute("/documents")({
  component: DocumentsPage,
  head: () => ({ meta: [{ title: "Documents — Harwick & Sterne" }] }),
});

type Doc = { name: string; type: string; size: string; updated: string; by: string };

const seedDocs: Doc[] = [
  { name: "Acme — Master Service Agreement.pdf", type: "pdf", size: "1.4 MB", updated: "2m ago", by: "Avery" },
  { name: "Q2 Pipeline Forecast.xlsx", type: "sheet", size: "248 KB", updated: "1h ago", by: "Syra" },
  { name: "Brand Guidelines v3.pdf", type: "pdf", size: "8.2 MB", updated: "yesterday", by: "Jenna" },
  { name: "Onboarding flow.png", type: "img", size: "612 KB", updated: "2d ago", by: "Marcus" },
  { name: "Northwind — Discovery Notes.pdf", type: "pdf", size: "320 KB", updated: "3d ago", by: "Syra" },
];

const icon = (t: string) =>
  t === "sheet" ? FileSpreadsheet : t === "img" ? FileImage : FileText;

const deriveType = (name: string) => {
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

function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>(seedDocs);

  const addDocs = (incoming: Doc[]) => setDocs((prev) => [...incoming, ...prev]);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Knowledge"
        title="Documents"
        description="Contracts, briefs and assets — all searchable by Syra."
        actions={<UploadDialog onUpload={addDocs} />}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {docs.map((d) => {
          const Icon = icon(d.type);
          return (
            <Card key={d.name} className="bento p-5 hover:bg-foreground/[0.02] transition-colors">
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-md grid place-items-center border border-border/60 bg-foreground/[0.03] text-foreground/70 shrink-0">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold truncate">{d.name}</div>
                  <div className="text-xs text-muted-foreground">{d.size} · updated {d.updated}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">by {d.by}</div>
                </div>
                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
              </div>
            </Card>
          );
        })}
      </div>
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

/**
 * UploadDialog — upload from anywhere. Local device (drag-drop, browse, paste)
 * is the primary path since that's where most uploads originate; Camera, URL
 * import, and cloud providers (Google Drive / Dropbox / OneDrive) round it out.
 */
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

        {/* Source picker */}
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

        {/* Source panel */}
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

        {/* Hidden native inputs */}
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

        {/* Staged files */}
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
