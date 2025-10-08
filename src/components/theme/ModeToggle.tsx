import { Moon, Sun, Monitor, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";
import { Theme } from "@/providers/theme.provider";
import { cn } from "@/lib/utils";

interface ModeToggleProps {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  align?: "start" | "center" | "end";
  showLabel?: boolean;
  className?: string;
}

export function ModeToggle({
  variant = "outline",
  size = "default",
  align = "end",
  showLabel = false,
  className,
}: ModeToggleProps) {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();

  const themeOptions: Array<{
    value: Theme;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description?: string;
  }> = [
    {
      value: "light",
      label: "Light",
      icon: Sun,
      description: "Use light theme",
    },
    {
      value: "dark",
      label: "Dark",
      icon: Moon,
      description: "Use dark theme",
    },
    {
      value: "system",
      label: "System",
      icon: Monitor,
      description: `Follow system theme (${systemTheme})`,
    },
  ];

  const currentThemeOption = themeOptions.find((option) => option.value === theme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(
            "relative transition-all duration-200",
            className
          )}
          aria-label="Toggle theme"
        >
          <div className="relative flex items-center justify-center">
            {/* Light Mode Icon */}
            <Sun
              className={cn(
                "h-[1.2rem] w-[1.2rem] transition-all duration-300 ease-in-out",
                resolvedTheme === "dark"
                  ? "scale-0 rotate-90 opacity-0"
                  : "scale-100 rotate-0 opacity-100"
              )}
            />
            
            {/* Dark Mode Icon */}
            <Moon
              className={cn(
                "absolute h-[1.2rem] w-[1.2rem] transition-all duration-300 ease-in-out",
                resolvedTheme === "dark"
                  ? "scale-100 rotate-0 opacity-100"
                  : "scale-0 -rotate-90 opacity-0"
              )}
            />
          </div>
          
          {showLabel && (
            <span className="ml-2 text-sm font-medium">
              {currentThemeOption?.label}
            </span>
          )}
          
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align={align} 
        className="w-56 p-2"
        sideOffset={8}
      >
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1">
          Theme Preference
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = theme === option.value;
          
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={cn(
                "flex items-center justify-between cursor-pointer rounded-md px-3 py-2.5",
                "transition-all duration-200 hover:bg-accent/80",
                isSelected && "bg-accent text-accent-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon 
                  className={cn(
                    "h-4 w-4 transition-colors duration-200",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )} 
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  )}
                </div>
              </div>
              
              {isSelected && (
                <Check className="h-4 w-4 text-primary animate-in fade-in-0 zoom-in-95 duration-200" />
              )}
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        
        <div className="px-3 py-2 text-xs text-muted-foreground">
          Currently using <span className="font-medium">{resolvedTheme}</span> theme
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact version for space-constrained areas
// Compact version for space-constrained areas
export function CompactModeToggle({ className }: { className?: string }) {
  return (
    <ModeToggle
      variant="ghost"
      size="sm"
      className={cn("h-8 w-8 p-0", className)}
    />
  );
}
// Version with label for settings pages
export function LabeledModeToggle({ className }: { className?: string }) {
  return (
    <ModeToggle
      variant="outline"
      showLabel
      className={className}
    />
  );
}