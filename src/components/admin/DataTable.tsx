/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface Column<T = any> {
  key: string;
  title: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, record: T, index: number) => React.ReactNode;
  className?: string;
}

export interface ActionItem<T = any> {
  key: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (record: T, index: number) => void;
  variant?: 'default' | 'destructive' | 'secondary';
  show?: (record: T) => boolean;
}

export interface Pagination {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showTotal?: boolean;
  onChange?: (page: number, pageSize: number) => void;
}

export interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: Pagination;
  actions?: ActionItem<T>[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  rowKey?: string | ((record: T) => string);
  onRowClick?: (record: T, index: number) => void;
  className?: string;
  title?: string;
  emptyText?: string;
  showHeader?: boolean;
  striped?: boolean;
  bordered?: boolean;
  hover?: boolean;
  size?: 'small' | 'default' | 'large';
}

export function DataTable<T = any>({
  columns,
  data,
  loading = false,
  pagination,
  actions = [],
  sortBy,
  sortOrder = 'asc',
  onSort,
  rowKey = 'id',
  onRowClick,
  className = '',
  title,
  emptyText = 'No data available',
  showHeader = true,
  striped = true,
  bordered = false,
  hover = true,
  size = 'default'
}: DataTableProps<T>) {
  const [internalSortBy, setInternalSortBy] = useState(sortBy);
  const [internalSortOrder, setInternalSortOrder] = useState<'asc' | 'desc'>(sortOrder);

  // Get row key
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return (record as any)[rowKey] || String(index);
  };

  // Handle sorting
  const handleSort = (key: string) => {
    let newOrder: 'asc' | 'desc' = 'asc';
    
    if (internalSortBy === key && internalSortOrder === 'asc') {
      newOrder = 'desc';
    }

    setInternalSortBy(key);
    setInternalSortOrder(newOrder);

    if (onSort) {
      onSort(key, newOrder);
    }
  };

  // Sort data if no external sorting
  const sortedData = useMemo(() => {
    if (onSort || !internalSortBy) return data;

    return [...data].sort((a, b) => {
      const aVal = (a as any)[internalSortBy];
      const bVal = (b as any)[internalSortBy];

      if (aVal === bVal) return 0;
      
      const compareResult = aVal < bVal ? -1 : 1;
      return internalSortOrder === 'asc' ? compareResult : -compareResult;
    });
  }, [data, internalSortBy, internalSortOrder, onSort]);

  // Get table size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-base';
      default:
        return '';
    }
  };

  // Render sort icon
  const renderSortIcon = (columnKey: string) => {
    if (internalSortBy !== columnKey) {
      return <ChevronsUpDown className="h-4 w-4" />;
    }
    return internalSortOrder === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />;
  };

  // Render actions dropdown
  const renderActions = (record: T, index: number) => {
    const visibleActions = actions.filter(action => 
      !action.show || action.show(record)
    );

    if (visibleActions.length === 0) return null;

    if (visibleActions.length === 1) {
      const action = visibleActions[0];
      const Icon = action.icon || Eye;
      
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            action.onClick(record, index);
          }}
        >
          <Icon className="h-4 w-4" />
        </Button>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {visibleActions.map((action, actionIndex) => {
            const Icon = action.icon || Eye;
            
            return (
              <DropdownMenuItem
                key={action.key}
                onClick={() => action.onClick(record, index)}
                className={action.variant === 'destructive' ? 'text-destructive' : ''}
              >
                <Icon className="h-4 w-4 mr-2" />
                {action.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Render cell content
  const renderCell = (column: Column<T>, record: T, index: number) => {
    const value = (record as any)[column.key];
    
    if (column.render) {
      return column.render(value, record, index);
    }

    // Default rendering based on value type
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">—</span>;
    }

    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      );
    }

    if (typeof value === 'number') {
      return <span className="font-mono">{value.toLocaleString()}</span>;
    }

    return String(value);
  };

  // Render pagination
  const renderPagination = () => {
    if (!pagination) return null;

    const { current, pageSize, total, showSizeChanger = true, showTotal = true, onChange } = pagination;
    const totalPages = Math.ceil(total / pageSize);
    const startItem = (current - 1) * pageSize + 1;
    const endItem = Math.min(current * pageSize, total);

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t">
        <div className="flex items-center gap-4">
          {/* Page Size Selector */}
          {showSizeChanger && onChange && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => onChange(1, Number(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Total Info */}
          {showTotal && (
            <span className="text-sm text-muted-foreground">
              {total > 0 ? `${startItem}-${endItem} of ${total} items` : 'No items'}
            </span>
          )}
        </div>

        {/* Pagination Controls */}
        {onChange && totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange(current - 1, pageSize)}
              disabled={current <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {current} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange(current + 1, pageSize)}
              disabled={current >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={`glass ${className}`}>
      {title && showHeader && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className={getSizeClasses()}>
            {/* Table Header */}
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    style={column.width ? { width: column.width } : undefined}
                    className={`${column.align ? `text-${column.align}` : ''} ${column.className || ''}`}
                  >
                    {column.sortable ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort(column.key)}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        {column.title}
                        {renderSortIcon(column.key)}
                      </Button>
                    ) : (
                      column.title
                    )}
                  </TableHead>
                ))}
                
                {actions.length > 0 && (
                  <TableHead className="text-right w-20">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody>
              {loading ? (
                // Loading rows
                [...Array(5)].map((_, index) => (
                  <TableRow key={`loading-${index}`}>
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </TableCell>
                    ))}
                    {actions.length > 0 && (
                      <TableCell>
                        <div className="h-8 w-8 bg-muted animate-pulse rounded ml-auto" />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : sortedData.length === 0 ? (
                // Empty state
                <TableRow>
                  <TableCell 
                    colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                    className="text-center py-12 text-muted-foreground"
                  >
                    {emptyText}
                  </TableCell>
                </TableRow>
              ) : (
                // Data rows
                <AnimatePresence>
                  {sortedData.map((record, index) => (
                    <motion.tr
                      key={getRowKey(record, index)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`
                        ${striped && index % 2 === 1 ? 'bg-muted/30' : ''}
                        ${hover ? 'hover:bg-muted/50' : ''}
                        ${onRowClick ? 'cursor-pointer' : ''}
                        ${bordered ? 'border-b' : ''}
                        transition-colors
                      `}
                      onClick={() => onRowClick?.(record, index)}
                    >
                      {columns.map((column) => (
                        <TableCell
                          key={column.key}
                          className={`${column.align ? `text-${column.align}` : ''} ${column.className || ''}`}
                        >
                          {renderCell(column, record, index)}
                        </TableCell>
                      ))}
                      
                      {actions.length > 0 && (
                        <TableCell className="text-right">
                          {renderActions(record, index)}
                        </TableCell>
                      )}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {renderPagination()}
      </CardContent>
    </Card>
  );
}

export default DataTable;