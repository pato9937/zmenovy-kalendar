import { createFileRoute } from "@tanstack/react-router";
import { CalendarApp } from "@/components/calendar-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <CalendarApp />;
}
