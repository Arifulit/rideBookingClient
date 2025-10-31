/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import type { Location } from '@/types/rider';

interface Props {
  value?: Location | null;
  onChange: (loc: Location) => void;
  placeholder?: string;
  recentLocations?: Location[];
}

export default function LocationSearch({ value, onChange, placeholder = 'Search...', recentLocations = [] }: Props) {
  const [text, setText] = useState(value?.address ?? '');

  useEffect(() => {
    setText(value?.address ?? '');
  }, [value]);

  // NOTE: replace with real autocomplete / place picker
  const handleSelect = (address: string) => {
    const loc: Location = {
      address,
      latitude: 0,   // replace with actual coords when available
      longitude: 0,
    };
    onChange(loc);
  };

  return (
    <div>
      <Input
        value={text}
        placeholder={placeholder}
        onChange={(e: any) => setText(e.target.value)}
        onBlur={() => handleSelect(text)}
      />
      {recentLocations.length > 0 && (
        <div className="mt-2 space-y-1">
          {recentLocations.map((r, i) => (
            <button
              key={i}
              type="button"
              className="text-sm text-muted-foreground block w-full text-left"
              onClick={() => handleSelect(r.address)}
            >
              {r.address}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}