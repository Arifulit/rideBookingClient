/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'dateRange' | 'boolean' | 'multiSelect';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface SearchAndFilterProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange: (value: string) => void;
  filters?: FilterOption[];
  filterValues?: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters?: () => void;
  onExport?: () => void;
  className?: string;
  showExport?: boolean;
  exportLabel?: string;
  resultCount?: number;
  loading?: boolean;
}

export function SearchAndFilter({
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  filters = [],
  filterValues = {},
  onFilterChange,
  onClearFilters,
  onExport,
  className = "",
  showExport = true,
  exportLabel = "Export",
  resultCount,
  loading = false
}: SearchAndFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(searchValue);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSearch !== searchValue) {
        onSearchChange(debouncedSearch);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedSearch, searchValue, onSearchChange]);

  // Update local search state when prop changes
  useEffect(() => {
    setDebouncedSearch(searchValue);
  }, [searchValue]);

  const activeFilters = Object.entries(filterValues).filter(([_, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'boolean') return value;
    return value && value !== 'all' && value !== '';
  });

  const clearFilter = (key: string) => {
    const filter = filters.find(f => f.key === key);
    if (filter?.type === 'multiSelect') {
      onFilterChange(key, []);
    } else if (filter?.type === 'boolean') {
      onFilterChange(key, false);
    } else {
      onFilterChange(key, '');
    }
  };

  const handleClearAll = () => {
    if (onClearFilters) {
      onClearFilters();
    } else {
      filters.forEach(filter => {
        clearFilter(filter.key);
      });
    }
    setDebouncedSearch('');
    setIsFilterOpen(false);
  };

  const getFilterDisplayValue = (filter: FilterOption, value: any): string => {
    if (!value || value === 'all' || value === '') return '';
    
    switch (filter.type) {
      case 'select':
        const option = filter.options?.find(opt => opt.value === value);
        return option?.label || value;
      
      case 'multiSelect':
        if (Array.isArray(value) && value.length > 0) {
          if (value.length === 1) {
            const option = filter.options?.find(opt => opt.value === value[0]);
            return option?.label || value[0];
          }
          return `${value.length} selected`;
        }
        return '';
      
      case 'boolean':
        return value ? 'Yes' : 'No';
      
      case 'dateRange':
        if (value?.from && value?.to) {
          return `${new Date(value.from).toLocaleDateString()} - ${new Date(value.to).toLocaleDateString()}`;
        } else if (value?.from) {
          return `From ${new Date(value.from).toLocaleDateString()}`;
        } else if (value?.to) {
          return `Until ${new Date(value.to).toLocaleDateString()}`;
        }
        return '';
      
      default:
        return String(value);
    }
  };

  const renderFilterControl = (filter: FilterOption) => {
    const value = filterValues[filter.key];

    switch (filter.type) {
      case 'select':
        return (
          <Select
            value={value || 'all'}
            onValueChange={(newValue) => onFilterChange(filter.key, newValue === 'all' ? '' : newValue)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={filter.placeholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filter.label}</SelectItem>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiSelect':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                {value && Array.isArray(value) && value.length > 0
                  ? `${value.length} selected`
                  : filter.placeholder || `Select ${filter.label}`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0">
              <div className="p-3 space-y-2">
                {filter.options?.map((option) => (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Array.isArray(value) && value.includes(option.value)}
                      onChange={(e) => {
                        const currentValues = Array.isArray(value) ? value : [];
                        if (e.target.checked) {
                          onFilterChange(filter.key, [...currentValues, option.value]);
                        } else {
                          onFilterChange(filter.key, currentValues.filter(v => v !== option.value));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        );

      case 'boolean':
        return (
          <Select
            value={value ? 'true' : 'false'}
            onValueChange={(newValue) => onFilterChange(filter.key, newValue === 'true')}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">No</SelectItem>
              <SelectItem value="true">Yes</SelectItem>
            </SelectContent>
          </Select>
        );

      case 'dateRange':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                {value?.from ? (
                  value.to ? (
                    <>
                      {new Date(value.from).toLocaleDateString()} - {new Date(value.to).toLocaleDateString()}
                    </>
                  ) : (
                    new Date(value.from).toLocaleDateString()
                  )
                ) : (
                  filter.placeholder || "Select date range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="date-from">From</Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={value?.from || ''}
                    onChange={(e) => onFilterChange(filter.key, { ...value, from: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="date-to">To</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={value?.to || ''}
                    onChange={(e) => onFilterChange(filter.key, { ...value, to: e.target.value })}
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onFilterChange(filter.key, {})}
                  className="w-full"
                >
                  Clear Dates
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={`glass ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          
          {/* Main Search and Action Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={searchPlaceholder}
                value={debouncedSearch}
                onChange={(e) => setDebouncedSearch(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>

            {/* Filter Toggle and Export */}
            <div className="flex items-center gap-2">
              
              {/* Filter Toggle */}
              {filters.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`${activeFilters.length > 0 ? 'border-primary text-primary' : ''}`}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
                      {activeFilters.length}
                    </Badge>
                  )}
                </Button>
              )}

              {/* Export Button */}
              {showExport && onExport && (
                <Button onClick={onExport} size="sm" className="btn-primary">
                  <Download className="h-4 w-4 mr-2" />
                  {exportLabel}
                </Button>
              )}
            </div>
          </div>

          {/* Result Count */}
          {resultCount !== undefined && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {loading ? 'Loading...' : `${resultCount} result${resultCount !== 1 ? 's' : ''} found`}
              </span>
            </div>
          )}

          {/* Active Filter Badges */}
          <AnimatePresence>
            {activeFilters.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 items-center"
              >
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {activeFilters.map(([key, value]) => {
                  const filter = filters.find(f => f.key === key);
                  if (!filter) return null;
                  
                  const displayValue = getFilterDisplayValue(filter, value);
                  if (!displayValue) return null;

                  return (
                    <Badge
                      key={key}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      <span className="text-xs">
                        {filter.label}: {displayValue}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearFilter(key)}
                        className="h-auto p-0.5 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filter Controls */}
          <AnimatePresence>
            {isFilterOpen && filters.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Separator className="mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filters.map((filter) => (
                    <div key={filter.key} className="space-y-2">
                      <Label className="text-sm font-medium">{filter.label}</Label>
                      {renderFilterControl(filter)}
                    </div>
                  ))}
                </div>
                
                {/* Filter Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                  >
                    Clear All Filters
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Close Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

export default SearchAndFilter;