import { createFileRoute } from "@tanstack/solid-router";
import { Home } from "../features/Home.tsx";

export const Route = createFileRoute("/")({
  component: Home,
});
