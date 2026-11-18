import { rowData } from "./rows";

const STEP_LABELS = ["Instant", "1 step", "2 step", "3 step"];
const STEP_POINTS = [3, 2, 1, 0];

const cls = (v: number | null) => (v === null ? "cq" : v === 1 ? "c1" : v === 0.5 ? "c5" : "c0");
const sym = (v: number | null) => (v === null ? "?" : v === 1 ? "\u25CF" : v === 0.5 ? "\u25D0" : "\u25CB");
const money = (v: number) => "$" + (Number.isInteger(v) ? v : v.toFixed(2));

const HEADERS: Array<[string, string?]> = [
  ["Firm", "firm"], ["Plan", "plan"], ["Size", "size"], ["Price", "price"], ["List", "list"], ["Code", "code"], ["Step", "steps"],
  ["EA"], ["Own copy"], ["No consist."], ["Static DD"], ["Few rules"], ["Swap-free"], ["Overnight/WE"], ["News"],
  ["Score", "score"], ["$ per 1K", "ppk"], ["Notes"],
];

type SortKey = "firm" | "plan" | "size" | "price" | "list" | "code" | "steps" | "score" | "ppk";

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Wires the sortable comparison table inside `root`. Returns a cleanup function. */
export function initComparisonTable(root: HTMLElement): () => void {
  const rows = rowData
    .filter((r) => r.price <= 200)
    .map((r) => ({
      ...r,
      score: STEP_POINTS[r.steps] + r.c.reduce<number>((a, b) => a + (b ?? 0), 0),
      ppk: r.price / parseFloat(r.size),
    }));

  const thead = root.querySelector<HTMLTableSectionElement>("#t thead");
  const tbody = root.querySelector<HTMLTableSectionElement>("#t tbody");
  const counter = root.querySelector<HTMLElement>("#cnt");
  const firmBox = root.querySelector<HTMLElement>("#flt");
  if (!thead || !tbody || !counter || !firmBox) return () => {};

  let sortKey: SortKey = "score";
  let dir = -1;
  const firms = new Set(rows.map((r) => r.firm));
  const stepSel = new Set<number>();
  const sizeSel = new Set<string>();
  const max = Math.max(...rows.map((r) => r.score));

  thead.innerHTML = "<tr>" + HEADERS.map(([label, key]) => `<th ${key ? `data-k="${key}"` : ""}>${label}</th>`).join("") + "</tr>";
  thead.onclick = (e) => {
    const key = (e.target as HTMLElement).dataset.k as SortKey | undefined;
    if (!key) return;
    dir = sortKey === key ? -dir : key === "score" ? -1 : 1;
    sortKey = key;
    draw();
  };

  for (const firm of [...firms]) {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" checked> ${escapeHtml(firm)}`;
    label.querySelector("input")!.onchange = (e) => {
      (e.target as HTMLInputElement).checked ? firms.add(firm) : firms.delete(firm);
      draw();
    };
    firmBox.appendChild(label);
  }

  function chips<T extends string | number>(hostId: string, items: Array<[T, string]>, selected: Set<T>) {
    const box = root.querySelector<HTMLElement>(`#${hostId}`);
    if (!box) return;
    const render = () => {
      box.innerHTML = "";
      const all = document.createElement("button");
      all.type = "button";
      all.className = "chip" + (selected.size ? "" : " on");
      all.textContent = "All";
      all.onclick = () => { selected.clear(); render(); draw(); };
      box.appendChild(all);
      for (const [value, text] of items) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "chip" + (selected.has(value) ? " on" : "");
        b.setAttribute("aria-pressed", String(selected.has(value)));
        b.textContent = text;
        b.onclick = () => { selected.has(value) ? selected.delete(value) : selected.add(value); render(); draw(); };
        box.appendChild(b);
      }
    };
    render();
  }

  chips("fstep", [...new Set(rows.map((r) => r.steps))].sort((a, b) => a - b).map((s): [number, string] => [s, STEP_LABELS[s]]), stepSel);
  chips("fsize", [...new Set(rows.map((r) => r.size))].sort((a, b) => parseFloat(a) - parseFloat(b)).map((s): [string, string] => [s, s]), sizeSel);

  function draw() {
    const shown = rows
      .filter((r) => firms.has(r.firm) && (!stepSel.size || stepSel.has(r.steps)) && (!sizeSel.size || sizeSel.has(r.size)))
      .sort((a, b) => {
        const x = a[sortKey];
        const y = b[sortKey];
        return (x > y ? 1 : x < y ? -1 : 0) * dir || b.score - a.score;
      });
    counter!.textContent = `${shown.length} combinations of ${rows.length}` + (shown.length ? "" : " - no plan matches these filters");
    tbody!.innerHTML = shown
      .map(
        (r) => `<tr><td class="l"><b>${escapeHtml(r.firm)}</b></td><td class="l">${escapeHtml(r.plan)}</td><td>${r.size}</td>
 <td class="num"><b>${money(r.price)}</b></td><td class="num mut">${r.list !== r.price ? '<span class="old">' + money(r.list) + "</span>" : money(r.list)}</td><td>${escapeHtml(r.code)}</td>
 <td>${["instant", "1", "2", "3"][r.steps]}</td>${r.c.map((v) => `<td class="${cls(v)}">${sym(v)}</td>`).join("")}
 <td class="num"><b>${r.score.toFixed(1)}</b><div class="bar" style="width:${(r.score / max) * 100}%"></div></td><td class="num">$${r.ppk.toFixed(1)}</td>
 <td class="small mut l" style="white-space:normal;min-width:280px">${escapeHtml(r.note)}</td></tr>`,
      )
      .join("");
  }

  draw();
  return () => {
    thead.onclick = null;
  };
}
