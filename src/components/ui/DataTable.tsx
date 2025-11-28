import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { Button } from './Button';
import { Input } from './Input';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  emptyMessage?: string;
  className?: string;
  loading?: boolean;
  onSearch?: (query: string) => void;
  searchTerm?: string; // controlled search
  currentPage?: number; // backend-controlled
  totalPages?: number; // backend-controlled
  onPageChange?: (page: number) => void; // backend pagination handler
}

export function DataTable<T extends { id: number | string }>({
  data,
  columns,
  searchable = true,
  sortable = true,
  filterable = false,
  pagination = true,
  pageSize = 10,
  selectable = false,
  onSelectionChange,
  emptyMessage = 'No data available',
  className = '',
  loading = false,
  onSearch,
  searchTerm,
  currentPage: currentPageProp,
  totalPages: totalPagesProp,
  onPageChange,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState(searchTerm ?? '');
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(
    null
  );
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const isBackendPaginated = !!onPageChange && !!totalPagesProp;

  // Sync controlled search term if provided
  useEffect(() => {
    if (searchTerm !== undefined) setSearchQuery(searchTerm);
  }, [searchTerm]);

  // Handle sorting
  const handleSort = (key: keyof T) => {
    if (!sortable) return;
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  // Process data (search + sort) only for local mode
  const processedData = useMemo(() => {
    let result = [...data];

    if (!isBackendPaginated) {
      if (searchQuery && searchable) {
        result = result.filter(item =>
          Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      }

      if (sortConfig) {
        result.sort((a, b) => {
          const aValue = a[sortConfig.key];
          const bValue = b[sortConfig.key];
          if (aValue === bValue) return 0;
          return sortConfig.direction === 'asc'
            ? aValue > bValue
              ? 1
              : -1
            : aValue < bValue
            ? 1
            : -1;
        });
      }
    }

    return result;
  }, [data, searchQuery, sortConfig, isBackendPaginated]);

  const effectiveCurrentPage = isBackendPaginated ? currentPageProp! : currentPage;
  const effectiveTotalPages = isBackendPaginated
    ? totalPagesProp!
    : Math.ceil(processedData.length / pageSize);

  const paginatedData = isBackendPaginated
    ? processedData
    : processedData.slice((effectiveCurrentPage - 1) * pageSize, effectiveCurrentPage * pageSize);

  const handleSelectRow = (row: T) => {
    const isSelected = selectedRows.includes(row);
    const newSelected = isSelected ? selectedRows.filter(r => r !== row) : [...selectedRows, row];
    setSelectedRows(newSelected);
    onSelectionChange?.(newSelected);
  };

  const handlePageChange = (page: number) => {
    if (isBackendPaginated) {
      onPageChange?.(page);
    } else {
      setCurrentPage(page);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Search Bar */}
      {searchable && (
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-full max-w-sm">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => {
                const value = e.target.value;
                setSearchQuery(value);
                onSearch?.(value);
              }}
              className="pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  onSearch?.('');
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-900 shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {selectable && <th className="px-4 py-2"></th>}
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 ${
                    col.sortable ? 'cursor-pointer select-none' : ''
                  }`}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && typeof col.key !== 'string' && handleSort(col.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{col.label}</span>
                    {sortConfig?.key === col.key ? (
                      sortConfig.direction === 'asc' ? (
                        <ChevronUpIcon className="w-4 h-4" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4" />
                      )
                    ) : col.sortable ? (
                      <FunnelIcon className="w-4 h-4 text-gray-400" />
                    ) : null}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="text-center py-6 text-gray-500"
                >
                  Loading...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)}>
                  <EmptyState message={emptyMessage} title="" icon={UsersIcon} />
                </td>
              </tr>
            ) : (
              paginatedData.map(row => (
                <tr
                  key={String(row.id)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  {selectable && (
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row)}
                        onChange={() => handleSelectRow(row)}
                      />
                    </td>
                  )}
                  {columns.map(col => (
                    <td
                      key={String(col.key)}
                      className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
                    >
                      {col.render
                        ? col.render(col.key in row ? row[col.key as keyof T] : undefined, row)
                        : String(col.key in row ? row[col.key as keyof T] ?? '' : '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && effectiveTotalPages > 1 && (
        <div className="flex items-center justify-end mt-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(effectiveCurrentPage - 1, 1))}
              disabled={effectiveCurrentPage === 1}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Page {effectiveCurrentPage} of {effectiveTotalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handlePageChange(Math.min(effectiveCurrentPage + 1, effectiveTotalPages))
              }
              disabled={effectiveCurrentPage === effectiveTotalPages}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
