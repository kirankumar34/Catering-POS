'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/* ============================================================
   TYPES
   ============================================================ */

export interface ColumnDef<T> {
  /** Column header label */
  header: string;
  /** Key to access data, or custom render function */
  accessor: keyof T | ((row: T) => React.ReactNode);
  /** Tailwind classes for the <th>/<td> (e.g., 'text-right', 'hidden lg:table-cell') */
  className?: string;
  /** Header cell class overrides */
  headerClassName?: string;
}

export interface CardFieldDef<T> {
  /** Label shown on the card */
  label: string;
  /** Accessor for the value */
  accessor: keyof T | ((row: T) => React.ReactNode);
  /** Optional: 'badge' renders as a colored badge, 'prominent' makes it bold/large */
  variant?: 'default' | 'badge' | 'prominent';
}

export interface PaginationMeta {
  total: number;
  page: number;
  totalPages: number;
}

export interface ResponsiveDataListProps<T> {
  /** Data array */
  data: T[];
  /** Column definitions for desktop table view */
  columns: ColumnDef<T>[];
  /** Fields to display on mobile card */
  cardTitle: keyof T | ((row: T) => React.ReactNode);
  cardSubtitle?: keyof T | ((row: T) => React.ReactNode);
  cardFields: CardFieldDef<T>[];
  /** Badge/status shown prominently on card */
  cardBadge?: (row: T) => React.ReactNode;
  /** Unique key extractor */
  keyExtractor: (row: T) => string;
  /** Click handler for rows/cards */
  onRowClick?: (row: T) => void;
  /** Optional action buttons per row (desktop: last column, mobile: card footer) */
  actions?: (row: T) => React.ReactNode;
  /** Pagination */
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  /** Items per page (for showing range text) */
  pageSize?: number;
  /** Loading state */
  isLoading?: boolean;
  /** Empty state */
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}

/* ============================================================
   HELPERS
   ============================================================ */

function getCellValue<T>(row: T, accessor: keyof T | ((row: T) => React.ReactNode)): React.ReactNode {
  if (typeof accessor === 'function') {
    return accessor(row);
  }
  const value = row[accessor];
  if (value === null || value === undefined) return '—';
  return String(value);
}

/* ============================================================
   COMPONENT
   ============================================================ */

export default function ResponsiveDataList<T>({
  data,
  columns,
  cardTitle,
  cardSubtitle,
  cardFields,
  cardBadge,
  keyExtractor,
  onRowClick,
  actions,
  pagination,
  onPageChange,
  pageSize = 12,
  isLoading,
  emptyIcon,
  emptyTitle = 'No data found',
  emptyDescription,
  emptyAction,
}: ResponsiveDataListProps<T>) {
  /* ---- Loading ---- */
  if (isLoading) {
    return (
      <div className="card-base p-8">
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  /* ---- Empty ---- */
  if (!data || data.length === 0) {
    return (
      <div className="card-base p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
          {emptyIcon && <div className="text-muted-foreground/50">{emptyIcon}</div>}
          <p className="text-sm font-semibold text-muted-foreground">{emptyTitle}</p>
          {emptyDescription && (
            <p className="text-xs text-muted-foreground/70 max-w-sm">{emptyDescription}</p>
          )}
          {emptyAction}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* ================================================================
          DESKTOP TABLE VIEW (≥ 768px)
          ================================================================ */}
      <div className="hidden md:block card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {columns.map((col, i) => (
                  <th
                    key={i}
                    className={`text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-5 py-3.5 ${col.headerClassName || col.className || ''}`}
                  >
                    {col.header}
                  </th>
                ))}
                {actions && (
                  <th className="text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-5 py-3.5">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className={`hover:bg-secondary/50 transition-colors group ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col, i) => (
                    <td key={i} className={`px-5 py-4 text-sm ${col.className || ''}`}>
                      {getCellValue(row, col.accessor)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination — desktop */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing {(pagination.page - 1) * pageSize + 1}–
              {Math.min(pagination.page * pageSize, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => onPageChange?.(pagination.page - 1)}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-muted-foreground font-semibold">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => onPageChange?.(pagination.page + 1)}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================
          MOBILE CARD VIEW (< 768px)
          ================================================================ */}
      <div className="md:hidden space-y-3">
        {data.map((row) => (
          <div
            key={keyExtractor(row)}
            className={`card-base p-4 space-y-3 ${onRowClick ? 'cursor-pointer active:bg-secondary/50' : ''}`}
            onClick={() => onRowClick?.(row)}
          >
            {/* Card header: title + badge */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">
                  {getCellValue(row, cardTitle)}
                </p>
                {cardSubtitle && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {getCellValue(row, cardSubtitle)}
                  </p>
                )}
              </div>
              {cardBadge && (
                <div className="shrink-0">{cardBadge(row)}</div>
              )}
            </div>

            {/* Card fields */}
            <div className="space-y-1.5">
              {cardFields.map((field, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground text-xs">{field.label}</span>
                  <span
                    className={`${
                      field.variant === 'prominent'
                        ? 'font-bold text-foreground'
                        : 'text-foreground/80'
                    }`}
                  >
                    {getCellValue(row, field.accessor)}
                  </span>
                </div>
              ))}
            </div>

            {/* Card actions */}
            {actions && (
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                {actions(row)}
              </div>
            )}
          </div>
        ))}

        {/* Pagination — mobile */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-1 py-3">
            <p className="text-xs text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={(e) => { e.stopPropagation(); onPageChange?.(pagination.page - 1); }}
                className="px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground text-xs font-semibold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px]"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={(e) => { e.stopPropagation(); onPageChange?.(pagination.page + 1); }}
                className="px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground text-xs font-semibold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
