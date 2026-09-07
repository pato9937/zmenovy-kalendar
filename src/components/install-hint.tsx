import { useEffect, useState } from "react";
import { Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";

const KEY = "zmeny-install-hint";

type Platform = "ios" | "android" | "other";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  const touch = navigator.maxTouchPoints || 0;
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && touch > 1);
  if (isIOS) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

export function InstallHint() {
  const [visible, setVisible] = useState(false);
  const [howto, setHowto] = useState(false);
  const [platform, setPlatform] = useState<Platform>("other");

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((window.navigator as { standalone?: boolean }).standalone);
    setPlatform(detectPlatform());
    setVisible(!standalone && localStorage.getItem(KEY) !== "1");
  }, []);

  if (!visible || platform === "other") return null;

  function dismiss() {
    localStorage.setItem(KEY, "1");
    setVisible(false);
  }

  const title = platform === "ios" ? "Pridať na plochu iPhonu" : "Pridať na plochu (Android)";
  const subtitle =
    platform === "ios"
      ? "Otvor v Safari a ulož ako appku. Dáta ostanú len v telefóne."
      : "Otvor v Chrome a ulož ako appku. Dáta ostanú len v telefóne.";

  return (
    <>
      <div className="flex items-start gap-3 rounded-2xl bg-card p-3 shadow-border">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-morning">
          <Smartphone className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{subtitle}</p>
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
        description={
          platform === "ios"
            ? "Na iPhone to funguje ako samostatná appka, bez App Store."
            : "Na Androide to funguje ako samostatná appka, bez Obchodu Play."
        }
      >
        {platform === "ios" ? (
          <ol className="list-decimal space-y-3 pb-4 pl-5 text-sm leading-relaxed text-foreground">
            <li>Otvor túto stránku v Safari (nie v Chrome).</li>
            <li>Ťukni na ikonu Zdieľať (štvorček so šípkou hore).</li>
            <li>Zvoľ „Pridať na plochu“ a potvrď.</li>
          </ol>
        ) : (
          <ol className="list-decimal space-y-3 pb-4 pl-5 text-sm leading-relaxed text-foreground">
            <li>Otvor túto stránku v Chrome.</li>
            <li>Ťukni na ⋮ (tri bodky vpravo hore).</li>
            <li>Zvoľ „Inštalovať appku“ alebo „Pridať na plochu“ a potvrď.</li>
          </ol>
        )}
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
