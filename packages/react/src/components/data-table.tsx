"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak, mq } from "../tokens.stylex";
import { rs } from "../rs";
import { Icon } from "./icon";
import { Checkbox } from "./checkbox";
import { Input } from "./input";

export interface DataTableColumn<Row> {
  key: string;
  header: React.ReactNode;
  /** Cell renderer; defaults to the row's value at `key`. */
  render?: (row: Row) => React.ReactNode;
  sortable?: boolean;
  /** Sort accessor; defaults to the row's value at `key`. */
  sortValue?: (row: Row) => string | number;
}

export interface DataTableProps<Row> extends React.HTMLAttributes<HTMLDivElement> {
  columns: Array<DataTableColumn<Row>>;
  rows: Row[];
  rowKey?: (row: Row, index: number) => React.Key;
  emptyLabel?: React.ReactNode;
  caption?: string;
  sort?: DataTableSort | null;
  defaultSort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort | null) => void;
  selectable?: boolean;
  selectedKeys?: React.Key[];
  defaultSelectedKeys?: React.Key[];
  onSelectionChange?: (keys: React.Key[]) => void;
  filterable?: boolean;
  filter?: string;
  defaultFilter?: string;
  onFilterChange?: (filter: string) => void;
  filterRow?: (row: Row, filter: string) => boolean;
}

export interface DataTableSort { key: string; dir: "asc" | "desc" }

const styles = stylex.create({
  scroll: { width: "100%", overflowX: "auto" },
  table: {
    width: {
      default: "100%",
      [mq.phone]: "100%",
    },
    borderCollapse: "collapse",
    marginTop: "1rem",
    marginBottom: "1.5rem",
    marginInlineStart: {
      default: 0,
      [mq.phone]: 0,
    },
    marginInlineEnd: {
      default: 0,
      [mq.phone]: 0,
    },
    fontSize: {
      default: "0.875rem",
      [mq.phone]: "1rem",
    },
  },
  th: {
    textAlign: {
      default: "start",
      ":last-child": "end",
    },
    fontWeight: 600,
    color: vlak.ink,
    letterSpacing: "-0.01em",
    paddingTop: {
      default: "0.625rem",
      [mq.phone]: "0.875rem",
    },
    paddingInlineEnd: {
      default: "1rem",
      [mq.phone]: "0.75rem",
      ":last-child": {
        default: 20,
        [mq.phone]: vlak.pad,
      },
    },
    paddingBottom: {
      default: "0.625rem",
      [mq.phone]: "0.875rem",
    },
    paddingInlineStart: {
      default: "0.75rem",
      [mq.phone]: "0.75rem",
      ":first-child": {
        default: 20,
        [mq.phone]: vlak.pad,
      },
    },
    borderBottomWidth: 2,
    borderBottomStyle: "solid",
    borderBottomColor: vlak.divider,
    fontSize: {
      default: "0.8125rem",
      [mq.phone]: "0.9375rem",
    },
  },
  td: {
    paddingTop: {
      default: "0.625rem",
      [mq.phone]: "0.875rem",
    },
    paddingInlineEnd: {
      default: "1rem",
      [mq.phone]: "0.75rem",
      ":last-child": {
        default: 20,
        [mq.phone]: vlak.pad,
      },
    },
    paddingBottom: {
      default: "0.625rem",
      [mq.phone]: "0.875rem",
    },
    paddingInlineStart: {
      default: "0.75rem",
      [mq.phone]: "0.75rem",
      ":first-child": {
        default: 20,
        [mq.phone]: vlak.pad,
      },
    },
    color: vlak.gray,
    fontWeight: 500,
    letterSpacing: "-0.01em",
    borderBottomWidth: vlak.hairline,
    borderBottomStyle: "solid",
    borderBottomColor: vlak.divider,
    verticalAlign: "top",
    fontSize: {
      default: null,
      [mq.phone]: "1rem",
    },
    textAlign: {
      default: null,
      ":last-child": "end",
    },
  },
  tdAlt: {
    backgroundColor: vlak.tableAlt,
  },
  selected: { backgroundColor: vlak.controlFill, color: vlak.ink },
  sort: {
    backgroundColor: "transparent",
    borderWidth: 0,
    borderStyle: "none",
    padding: 0,
    fontFamily: "inherit",
    fontSize: "inherit",
    fontWeight: 600,
    letterSpacing: "inherit",
    color: "inherit",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3125rem",
    minHeight: vlak.hit,
    minWidth: vlak.hit,
    outlineWidth: {
      default: null,
      ":focus-visible": 2,
    },
    outlineStyle: {
      default: null,
      ":focus-visible": "solid",
    },
    outlineColor: {
      default: null,
      ":focus-visible": vlak.ink,
    },
    outlineOffset: {
      default: null,
      ":focus-visible": 2,
    },
  },
  /* Unsorted columns show a neutral sort mark in gray; the active one is an ink arrow. */
  sortIcon: {
    color: vlak.gray,
    opacity: 1,
  },
  sortIconOn: {
    color: vlak.ink,
  },
  empty: {
    paddingTop: "1.5rem",
    paddingBottom: "1.5rem",
    paddingInline: "1.25rem",
    textAlign: "center",
    fontSize: "0.8125rem",
    letterSpacing: "-0.01em",
    color: vlak.gray,
  },
});

/** Sortable rows over the plain rs-table. */
export const DataTable = React.forwardRef(function DataTable<Row extends Record<string, unknown>>({
  columns,
  rows,
  rowKey = (_, i) => i,
  emptyLabel = "Nothing here yet.",
  caption,
  sort: controlledSort,
  defaultSort = null,
  onSortChange,
  selectable = false,
  selectedKeys,
  defaultSelectedKeys = [],
  onSelectionChange,
  filterable = false,
  filter,
  defaultFilter = "",
  onFilterChange,
  filterRow,
  className,
  style,
  ...props
}: DataTableProps<Row>, ref: React.ForwardedRef<HTMLDivElement>) {
  const [innerSort, setInnerSort] = React.useState<DataTableSort | null>(defaultSort);
  const sort = controlledSort === undefined ? innerSort : controlledSort;
  const [innerKeys, setInnerKeys] = React.useState<React.Key[]>(defaultSelectedKeys);
  const selected = new Set(selectedKeys ?? innerKeys);
  const [innerFilter, setInnerFilter] = React.useState(defaultFilter);
  const query = filter ?? innerFilter;
  const getRowKey = (row: Row, index: number): React.Key => {
    const key = rowKey(row, index);
    return typeof key === "symbol" ? String(key) : key;
  };
  const records: Array<{ row: Row; key: React.Key }> = rows.map((row, index) => ({ row, key: getRowKey(row, index) }));
  const filtered: Array<{ row: Row; key: React.Key }> = records.filter(({ row }) => !query || (filterRow ? filterRow(row, query) :
    columns.some((column) => String(row[column.key] ?? "").toLocaleLowerCase().includes(query.toLocaleLowerCase()))));
  const column = sort ? columns.find((c) => c.key === sort.key && c.sortable) : undefined;
  const sorted: Array<{ row: Row; key: React.Key }> = column && sort ? [...filtered].sort((a, b) => {
    const get = column.sortValue ?? ((row: Row) => row[column.key] as string | number);
    const av = get(a.row);
    const bv = get(b.row);
    const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
    return sort.dir === "asc" ? cmp : -cmp;
  }) : filtered;
  const toggle = (key: string) => {
    const next: DataTableSort | null = sort?.key === key ? (sort.dir === "asc" ? { key, dir: "desc" } : null) : { key, dir: "asc" };
    if (controlledSort === undefined) setInnerSort(next);
    onSortChange?.(next);
  };
  const selectKeys = (next: Set<React.Key>) => {
    const keys = [...next];
    if (selectedKeys === undefined) setInnerKeys(keys);
    onSelectionChange?.(keys);
  };
  const allSelected = filtered.length > 0 && filtered.every(({ key }) => selected.has(key));
  const someSelected = filtered.some(({ key }) => selected.has(key));
  const scroll = rs(["rs-datatable-scroll"], styles.scroll);

  const table = rs(["rs-table", "rs-datatable-table"], styles.table);
  const th = rs(["rs-datatable-th"], styles.th);
  const empty = rs(["rs-datatable-empty"], styles.empty);

  return (
    <div ref={ref} {...props} className={className} style={style}>
      {filterable && <Input type="search" aria-label="Filter rows" placeholder="Filter rows" value={query} onChange={(event) => { if (filter === undefined) setInnerFilter(event.target.value); onFilterChange?.(event.target.value); }} />}
      <div className={scroll.className} style={scroll.style}>
      <table className={table.className} style={table.style}>
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            {selectable && <th scope="col" className={th.className} style={th.style}><Checkbox aria-label="Select all visible rows" checked={allSelected} indeterminate={!allSelected && someSelected} disabled={!filtered.length} onCheckedChange={(checked) => { const next = new Set(selected); for (const { key } of filtered) { if (checked) next.add(key); else next.delete(key); } selectKeys(next); }} /></th>}
            {columns.map((column) => {
              const active = sort?.key === column.key;
              const sortBtn = rs(["rs-datatable-sort"], styles.sort);
              const sortIcon = rs(["rs-datatable-sort-icon", active && "rs-datatable-sort-icon-on"], styles.sortIcon, active && styles.sortIconOn);
              return (
                <th
                  scope="col"
                  key={column.key}
                  className={th.className}
                  style={th.style}
                  aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      className={sortBtn.className}
                      style={sortBtn.style}
                      data-active={active}
                      onClick={() => toggle(column.key)}
                    >
                      {column.header}
                      <Icon
                        name={active ? (sort.dir === "desc" ? "arrow-down" : "arrow-up") : "sort"}
                        size={12}
                        className={sortIcon.className}
                        style={sortIcon.style}
                      />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map(({ row, key }, index) => (
            <tr key={key} data-selected={selected.has(key) || undefined}>
              {selectable && <td className={th.className} style={th.style}><Checkbox aria-label={`Select row ${index + 1}`} checked={selected.has(key)} onCheckedChange={(checked) => { const next = new Set(selected); if (checked) next.add(key); else next.delete(key); selectKeys(next); }} /></td>}
              {columns.map((column) => {
                const cell = rs(["rs-datatable-td", index % 2 === 1 && "rs-datatable-td-alt", selected.has(key) && "rs-datatable-td-selected"], styles.td, index % 2 === 1 && styles.tdAlt, selected.has(key) && styles.selected);
                return (
                  <td key={column.key} className={cell.className} style={cell.style}>
                    {column.render ? column.render(row) : (row[column.key] as React.ReactNode)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {sorted.length === 0 && (
        <div role="status" className={empty.className} style={empty.style}>
          {emptyLabel}
        </div>
      )}
    </div>
  );
  /* forwardRef cannot carry the row type parameter, so the export restates it. */
}) as <Row extends Record<string, unknown>>(
  props: DataTableProps<Row> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement;
