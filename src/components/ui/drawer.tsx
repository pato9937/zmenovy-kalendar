import type { ReactNode } from "react";
import { Drawer as Vaul } from "vaul";
import { cn } from "@/lib/utils";

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  title: string;
  description?: string;
}

export function Drawer({
  open,
  onOpenChange,
  children,
  title,
  description,
}: DrawerProps) {
  return (
    <Vaul.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <Vaul.Portal>
        <Vaul.Overlay className="fixed inset-0 z-50 bg-background/70" />
        <Vaul.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] w-full max-w-lg flex-col",
            "rounded-t-3xl bg-card pb-[max(1rem,env(safe-area-inset-bottom))] shadow-border",
            "outline-none",
          )}
        >
          <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-border-strong" />
          <Vaul.Title className="px-5 pt-4 text-lg font-semibold tracking-tight text-foreground text-balance">
            {title}
          </Vaul.Title>
          {description ? (
            <Vaul.Description className="px-5 pt-1 text-sm text-muted-foreground text-pretty">
              {description}
            </Vaul.Description>
          ) : (
            <Vaul.Description className="sr-only">{title}</Vaul.Description>
          )}
          <div className="mt-4 min-h-0 overflow-y-auto px-5 pb-2">{children}</div>
        </Vaul.Content>
      </Vaul.Portal>
    </Vaul.Root>
  );
}
