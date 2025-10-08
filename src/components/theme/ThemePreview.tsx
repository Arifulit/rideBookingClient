import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/hooks/useTheme";
import { Theme } from "@/providers/theme.provider";
import { Monitor, Moon, Sun, Check, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemePreviewProps {
  className?: string;
  showCurrentBadge?: boolean;
}

export function ThemePreview({ className, showCurrentBadge = true }: ThemePreviewProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themes: Array<{
    value: Theme;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    preview: {
      background: string;
      foreground: string;
      card: string;
      border: string;
      primary: string;
    };
  }> = [
    {
      value: "light",
      name: "Light",
      description: "Clean and bright theme perfect for daytime use",
      icon: Sun,
      preview: {
        background: "bg-white",
        foreground: "text-gray-900",
        card: "bg-gray-50",
        border: "border-gray-200",
        primary: "bg-blue-600",
      },
    },
    {
      value: "dark",
      name: "Dark",
      description: "Easy on the eyes for extended use and low-light environments",
      icon: Moon,
      preview: {
        background: "bg-slate-950",
        foreground: "text-slate-50",
        card: "bg-slate-900",
        border: "border-slate-800",
        primary: "bg-blue-600",
      },
    },
    {
      value: "system",
      name: "System",
      description: "Automatically follows your system's theme preference",
      icon: Monitor,
      preview: {
        background: resolvedTheme === "dark" ? "bg-slate-950" : "bg-white",
        foreground: resolvedTheme === "dark" ? "text-slate-50" : "text-gray-900",
        card: resolvedTheme === "dark" ? "bg-slate-900" : "bg-gray-50",
        border: resolvedTheme === "dark" ? "border-slate-800" : "border-gray-200",
        primary: "bg-blue-600",
      },
    },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 mb-6">
        <Palette className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Theme Preferences</h3>
        {showCurrentBadge && (
          <Badge variant="secondary" className="ml-auto">
            Current: {theme}
          </Badge>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          const isSelected = theme === themeOption.value;

          return (
            <Card
              key={themeOption.value}
              className={cn(
                "relative cursor-pointer transition-all duration-200 hover:shadow-md",
                "hover:border-primary/50 hover:scale-[1.02]",
                isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
              )}
              onClick={() => setTheme(themeOption.value)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">{themeOption.name}</CardTitle>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary animate-in fade-in-0 zoom-in-95 duration-200" />
                  )}
                </div>
                <CardDescription className="text-sm">
                  {themeOption.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Theme Preview */}
                <div
                  className={cn(
                    "relative rounded-lg border p-3 transition-all duration-200",
                    themeOption.preview.background,
                    themeOption.preview.border
                  )}
                >
                  <div className="space-y-2">
                    {/* Header Bar */}
                    <div
                      className={cn(
                        "flex items-center justify-between rounded border p-2",
                        themeOption.preview.card,
                        themeOption.preview.border
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full",
                            themeOption.preview.primary
                          )}
                        />
                        <div
                          className={cn(
                            "h-2 w-8 rounded",
                            themeOption.preview.foreground.replace("text-", "bg-"),
                            "opacity-50"
                          )}
                        />
                      </div>
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          themeOption.preview.foreground.replace("text-", "bg-"),
                          "opacity-30"
                        )}
                      />
                    </div>

                    {/* Content Area */}
                    <div className="space-y-1">
                      <div
                        className={cn(
                          "h-2 w-full rounded",
                          themeOption.preview.foreground.replace("text-", "bg-"),
                          "opacity-40"
                        )}
                      />
                      <div
                        className={cn(
                          "h-2 w-3/4 rounded",
                          themeOption.preview.foreground.replace("text-", "bg-"),
                          "opacity-30"
                        )}
                      />
                      <div
                        className={cn(
                          "h-2 w-1/2 rounded",
                          themeOption.preview.foreground.replace("text-", "bg-"),
                          "opacity-20"
                        )}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  className="w-full transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTheme(themeOption.value);
                  }}
                >
                  {isSelected ? "Active" : "Select Theme"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
        <p className="text-sm text-muted-foreground">
          <strong>Tip:</strong> Your theme preference is automatically saved and will be 
          remembered across browser sessions. The system theme option will automatically 
          switch based on your operating system's dark mode setting.
        </p>
      </div>
    </div>
  );
}

// Compact theme selector for settings
export function CompactThemeSelector() {
  const { theme, setTheme } = useTheme();
  
  const options = [
    { value: "light" as Theme, label: "Light", icon: Sun },
    { value: "dark" as Theme, label: "Dark", icon: Moon },
    { value: "system" as Theme, label: "System", icon: Monitor },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      {options.map((option) => {
        const Icon = option.icon;
        const isSelected = theme === option.value;
        
        return (
          <Button
            key={option.value}
            variant={isSelected ? "default" : "ghost"}
            size="sm"
            onClick={() => setTheme(option.value)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 transition-all duration-200",
              isSelected && "shadow-sm"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{option.label}</span>
          </Button>
        );
      })}
    </div>
  );
}