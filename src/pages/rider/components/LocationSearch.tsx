import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';
import { useLazySearchPlacesQuery } from '@/redux/features/rider/riderApi';
import type { Location } from '@/types/rider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface LocationSearchProps {
  value?: Location;
  onChange: (location: Location) => void;
  placeholder?: string;
  recentLocations?: Location[];
  className?: string;
}

export function LocationSearch({
  value,
  onChange,
  placeholder = "Search location...",
  recentLocations = [],
  className = ""
}: LocationSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value?.address || '');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);
  const [searchPlaces, { data: suggestions = [], isLoading }] = useLazySearchPlacesQuery();

  // Search for locations when query changes
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 2 && isOpen) {
      // searchPlaces expects a plain string (q)
      searchPlaces(debouncedQuery);
    }
  }, [debouncedQuery, isOpen, searchPlaces]);

  // Update input when value changes externally
  useEffect(() => {
    if (value?.address && value.address !== query) {
      setQuery(value.address);
    }
  }, [value, query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const allOptions = [...recentLocations, ...suggestions];
    
    if (!isOpen || allOptions.length === 0) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < allOptions.length - 1 ? prev + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : allOptions.length - 1
        );
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && allOptions[selectedIndex]) {
          handleLocationSelect(allOptions[selectedIndex]);
        }
        break;
        
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleLocationSelect = (location: Location) => {
    setQuery(location.address);
    onChange(location);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    if (newQuery.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
    
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const clearInput = () => {
    setQuery('');
    // Create empty location object for clearing
    const emptyLocation: Location = {
      address: '',
      latitude: 0,
      longitude: 0,
      placeId: ''
    };
    onChange(emptyLocation);
    setIsOpen(false);
    inputRef.current?.focus();
  };



  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>
        
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10 input-field"
          autoComplete="off"
        />
        
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearInput}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-50 mt-1"
          >
            <Card className="glass max-h-80 overflow-y-auto">
              {/* Loading State */}
              {isLoading && (
                <div className="p-4 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    Searching...
                  </div>
                </div>
              )}

              {/* Recent Locations */}
              {!isLoading && recentLocations.length > 0 && (
                <div className="border-b border-border">
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Recent
                  </div>
                  {recentLocations.map((location, index) => (
                    <motion.button
                      key={`recent-${index}`}
                      type="button"
                      onClick={() => handleLocationSelect(location)}
                      className={`w-full text-left px-3 py-3 hover:bg-accent transition-colors ${
                        selectedIndex === index ? 'bg-accent' : ''
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-start gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground truncate">
                            {location.address}
                          </div>
                          {location.placeId && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Recent location
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Search Results */}
              {!isLoading && suggestions.length > 0 && (
                <div>
                  {recentLocations.length > 0 && (
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Search Results
                    </div>
                  )}
                  {suggestions.map((location: Location, index: number) => {
                    const actualIndex = recentLocations.length + index;
                    return (
                      <motion.button
                        key={`suggestion-${index}`}
                        type="button"
                        onClick={() => handleLocationSelect(location)}
                        className={`w-full text-left px-3 py-3 hover:bg-accent transition-colors ${
                          selectedIndex === actualIndex ? 'bg-accent' : ''
                        }`}
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-foreground truncate">
                              {location.address}
                            </div>
                            {location.placeId && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {location.placeId}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* No Results */}
              {!isLoading && query.length >= 2 && suggestions.length === 0 && recentLocations.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm">No locations found</p>
                  <p className="text-xs mt-1">Try adjusting your search terms</p>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && query.length < 2 && recentLocations.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm">Start typing to search locations</p>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LocationSearch;