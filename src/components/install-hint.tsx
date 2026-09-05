import { useEffect, useState } from "react";
import { Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";

const KEY = "zmeny-install-hint";

export function InstallHint() {
  const [visible, setVisible] = useState(false);
  const [howto, setHowto] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((window.navigator as { standalone?: boolean }).standalone);
    setVisible(!standalone && localStorage.getItem(KEY) !== "1");
  }, []);

  if (!visible) return null;

  function dismiss() {
    localStorage.setItem(KEY, "1");
    setVisible(false);
  }

  return (
    <>
      <div className="flex items-start gap-3 rounded-2xl bg-card p-3 shadow-border">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-morning">
          <Smartphone className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Pridať na plochu iPhonu</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            Otvor v Safari a ulož ako appku. Dáta ostanú len v telefóne.
          </p>
          <button
            type="button"
            onClick={() => setHowto(true)}
            className="mt-2 text-sm font-medium text-morning"
          >
            Ako na to
          </button>
        </div>
        <button
          type="button"
          aria-label="Zavrieť"
          onClick={dismiss}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
      <Drawer
        open={howto}
        onOpenChange={setHowto}
        title="Pridať na plochu"
        description="Na iPhone to funguje ako samostatná appka, bez App Store."
      >
        <ol className="list-decimal space-y-3 pb-4 pl-5 text-sm leading-relaxed text-foreground">
          <li>Otvor túto stránku v Safari (nie v Chrome).</li>
          <li>Ťukni na ikonu Zdieľať (štvorček so šípkou hore).</li>
          <li>Zvoľ „Pridať na plochu“ a potvrď.</li>
        </ol>
        <Button
          className="w-full"
          onClick={() => {
            setHowto(false);
            dismiss();
          }}
        >
          Rozumiem
        </Button>
      </Drawer>
    </>
  );
}
