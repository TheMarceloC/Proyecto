import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/features/marketplace/notifications-page";
export const Route = createFileRoute("/notificaciones")({
  head: () => ({ meta: [{ title: "Notificaciones | ProtoLab" }] }),
  component: NotificationsPage,
});
