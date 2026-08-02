import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Download, CreditCard, Plus, Trash2, Send } from "lucide-react";

export const Route = createFileRoute("/billing")({
  component: BillingPage,
  head: () => ({ meta: [{ title: "Billing — strategent" }] }),
});

type Invoice = { id: string; client: string; amount: string; status: string; date: string };

const seedInvoices: Invoice[] = [
  { id: "INV-1042", client: "Acme Corp", amount: "$12,000", status: "Paid", date: "May 12" },
  { id: "INV-1041", client: "Northwind", amount: "$4,800", status: "Paid", date: "May 09" },
  { id: "INV-1040", client: "Helios Solar", amount: "$3,200", status: "Pending", date: "May 04" },
  { id: "INV-1039", client: "Lumen Health", amount: "$6,400", status: "Overdue", date: "Apr 28" },
  { id: "INV-1038", client: "Pulse Media", amount: "$9,200", status: "Paid", date: "Apr 22" },
];

const statusClass = (status: string) =>
  status === "Paid"
    ? "bg-primary/15 text-primary border-primary/30"
    : status === "Pending"
      ? "bg-accent/15 text-accent border-accent/30"
      : status === "Draft"
        ? "bg-foreground/5 text-muted-foreground border-border/60"
        : "bg-destructive/15 text-destructive border-destructive/30";

const fmtMoney = (n: number) =>
  `$${(Math.round(n * 100) / 100).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const fmtDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const nextInvoiceId = (invs: Invoice[]) => {
  const max = invs.reduce((m, i) => {
    const n = parseInt(i.id.replace(/\D/g, ""), 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 1042);
  return `INV-${max + 1}`;
};

// Generate a clean, branded invoice document and trigger a download — what
// high-tier billing tools expose behind the per-row download control.
const downloadInvoice = (inv: Invoice) => {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${inv.id}</title>
<style>body{font-family:ui-sans-serif,system-ui,Arial;margin:48px;color:#111}
.head{display:flex;justify-content:space-between;border-bottom:2px solid #111;padding-bottom:16px}
h1{margin:0;font-size:22px}.muted{color:#666}table{width:100%;border-collapse:collapse;margin-top:28px}
td,th{padding:10px 0;border-bottom:1px solid #eee;text-align:left}.r{text-align:right}
.total{font-size:18px;font-weight:700}</style></head><body>
<div class="head"><div><h1>Harwick &amp; Sterne</h1><div class="muted">Private Wealth Advisory</div></div>
<div class="r"><h1>${inv.id}</h1><div class="muted">${inv.date}</div></div></div>
<p style="margin-top:24px">Billed to<br><strong>${inv.client}</strong></p>
<table><tr><th>Description</th><th class="r">Amount</th></tr>
<tr><td>Advisory services — ${inv.client}</td><td class="r">${inv.amount}</td></tr>
<tr><td class="total">Total (${inv.status})</td><td class="r total">${inv.amount}</td></tr></table>
<p class="muted" style="margin-top:32px">Thank you for your business.</p></body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${inv.id}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast.success(`Downloaded ${inv.id}`);
};

function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(seedInvoices);
  const nextId = useMemo(() => nextInvoiceId(invoices), [invoices]);

  const addInvoice = (inv: Invoice) => setInvoices((prev) => [inv, ...prev]);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Revenue"
        title="Billing"
        description="Subscriptions, invoices and payouts."
        actions={<NewInvoiceDialog nextId={nextId} onCreate={addInvoice} />}
      />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "MRR", value: "$128,400" },
          { label: "Outstanding", value: "$8,210", accent: true },
          { label: "Next payout", value: "May 30" },
          { label: "Churn (30d)", value: "0.9%" },
        ].map((s) => (
          <Card key={s.label} className="bento p-5">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className={`mt-2 text-2xl font-semibold tracking-tight ${s.accent ? "text-accent" : ""}`}>{s.value}</div>
          </Card>
        ))}
      </div>
      <Card className="bento p-0">
        <div className="px-5 py-3 border-b border-border/60 text-sm font-semibold">Recent invoices</div>
        <div className="divide-y divide-border/60">
          {invoices.map((inv) => (
            <div key={inv.id} className="grid grid-cols-12 items-center px-5 py-3 text-[13px] hover:bg-white/[0.03]">
              <div className="col-span-3 font-mono text-muted-foreground">{inv.id}</div>
              <div className="col-span-4 font-medium">{inv.client}</div>
              <div className="col-span-2">{inv.amount}</div>
              <div className="col-span-2">
                <Badge className={`border ${statusClass(inv.status)}`}>{inv.status}</Badge>
              </div>
              <div className="col-span-1 flex justify-end gap-1 text-muted-foreground">
                <span className="mr-2 text-xs">{inv.date}</span>
                <Button variant="ghost" size="icon" onClick={() => downloadInvoice(inv)} aria-label={`Download ${inv.id}`}>
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}

type LineItem = { id: number; description: string; qty: string; unit: string };

const TERMS: { id: string; label: string; days: number }[] = [
  { id: "receipt", label: "Due on receipt", days: 0 },
  { id: "net7", label: "Net 7", days: 7 },
  { id: "net15", label: "Net 15", days: 15 },
  { id: "net30", label: "Net 30", days: 30 },
];

const num = (s: string) => {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

/**
 * NewInvoiceDialog — create an invoice the way high-tier billing tools do:
 * auto invoice number, client, line items with live totals, payment terms /
 * due date, tax, then Save as draft or Send.
 */
function NewInvoiceDialog({ nextId, onCreate }: { nextId: string; onCreate: (inv: Invoice) => void }) {
  const [open, setOpen] = useState(false);
  const [client, setClient] = useState("");
  const [terms, setTerms] = useState("net15");
  const [taxRate, setTaxRate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ id: 1, description: "", qty: "1", unit: "" }]);
  const nextItemId = useRef(2);

  const reset = () => {
    setClient("");
    setTerms("net15");
    setTaxRate("");
    setNotes("");
    setItems([{ id: 1, description: "", qty: "1", unit: "" }]);
    nextItemId.current = 2;
  };

  const addItem = () =>
    setItems((prev) => [...prev, { id: nextItemId.current++, description: "", qty: "1", unit: "" }]);
  const removeItem = (id: number) => setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));
  const updateItem = (id: number, patch: Partial<LineItem>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const { subtotal, tax, total } = useMemo(() => {
    const sub = items.reduce((s, i) => s + num(i.qty) * num(i.unit), 0);
    const t = sub * (num(taxRate) / 100);
    return { subtotal: sub, tax: t, total: sub + t };
  }, [items, taxRate]);

  const issueDate = useMemo(() => new Date(), [open]); // re-stamp each time the dialog opens
  const dueDate = useMemo(() => {
    const days = TERMS.find((t) => t.id === terms)?.days ?? 0;
    const d = new Date(issueDate);
    d.setDate(d.getDate() + days);
    return d;
  }, [issueDate, terms]);

  const canCreate = client.trim().length > 0 && total > 0;

  const create = (status: "Draft" | "Pending") => {
    if (!canCreate) {
      toast.error("Add a client and at least one priced line item");
      return;
    }
    onCreate({
      id: nextId,
      client: client.trim(),
      amount: fmtMoney(total),
      status,
      date: fmtDate(issueDate),
    });
    toast.success(
      status === "Draft" ? `${nextId} saved as draft` : `${nextId} sent to ${client.trim()}`,
      { description: `${fmtMoney(total)} · due ${fmtDate(dueDate)}` },
    );
    reset();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button className="text-white border-0" style={{ background: "var(--gradient-primary)" }}>
          <CreditCard className="h-4 w-4 mr-2" /> New Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-2">
            <span>New invoice</span>
            <span className="font-mono text-xs text-muted-foreground">{nextId}</span>
          </DialogTitle>
          <DialogDescription>
            Issued {fmtDate(issueDate)} · due {fmtDate(dueDate)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Client */}
          <div className="space-y-1.5">
            <Label htmlFor="inv-client">
              Bill to <span className="text-muted-foreground">*</span>
            </Label>
            <Input
              id="inv-client"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Acme Corp"
              autoComplete="off"
            />
          </div>

          {/* Payment terms */}
          <div className="space-y-1.5">
            <Label>Payment terms</Label>
            <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-muted/50 p-0.5">
              {TERMS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTerms(t.id)}
                  className={`h-7 flex-1 rounded-full px-2 text-[11px] font-medium transition-colors ${
                    terms === t.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Line items */}
          <div className="space-y-2">
            <Label>Line items</Label>
            <div className="space-y-2">
              {items.map((item) => {
                const amount = num(item.qty) * num(item.unit);
                return (
                  <div key={item.id} className="space-y-2 rounded-md border border-border/60 p-2">
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, { description: e.target.value })}
                      placeholder="Advisory retainer — May"
                      autoComplete="off"
                      className="h-8"
                    />
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Qty</span>
                        <Input
                          type="number"
                          min="0"
                          value={item.qty}
                          onChange={(e) => updateItem(item.id, { qty: e.target.value })}
                          className="h-8 w-14 text-center"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[12px] text-muted-foreground">$</span>
                        <Input
                          type="number"
                          min="0"
                          value={item.unit}
                          onChange={(e) => updateItem(item.id, { unit: e.target.value })}
                          placeholder="0.00"
                          className="h-8 w-24"
                        />
                      </div>
                      <div className="ml-auto text-right">
                        <div className="text-[9.5px] uppercase tracking-wide text-muted-foreground">Amount</div>
                        <div className="text-[12.5px] font-medium tabular-nums">{fmtMoney(amount)}</div>
                      </div>
                      {items.length > 1 && (
                        <button
                          type="button"
                          aria-label="Remove line item"
                          onClick={() => removeItem(item.id)}
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <Button variant="outline" size="sm" onClick={addItem} className="h-8">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add line item
            </Button>
          </div>

          {/* Tax + totals */}
          <div className="space-y-2 rounded-lg border border-border bg-foreground/[0.02] p-3">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">{fmtMoney(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                Tax
                <Input
                  type="number"
                  min="0"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  placeholder="0"
                  className="h-6 w-14 px-2 text-center"
                />
                %
              </span>
              <span className="tabular-nums">{fmtMoney(tax)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border/60 pt-2 text-[14px] font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{fmtMoney(total)}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="inv-notes">
              Memo <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="inv-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Thanks for your business."
              autoComplete="off"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => create("Draft")} disabled={!canCreate}>
            Save as draft
          </Button>
          <Button
            onClick={() => create("Pending")}
            disabled={!canCreate}
            className="text-white border-0"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Send className="h-4 w-4 mr-2" /> Send invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
