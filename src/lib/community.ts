export type Member = {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  canDownload: boolean;
};
export type SessionState = { configured: boolean; user: Member | null };
export type Design = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  category: string;
  material: string;
  license: string;
  author_name: string;
  image_url: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  review_note?: string;
};
export type Quote = {
  id: string;
  code: string;
  project: string;
  material: string;
  quantity: number;
  priority: string;
  status_index: number;
  created_at: string;
  price: number | null;
  estimated_delivery: string | null;
  client_name: string;
  email: string;
  phone: string;
  city: string;
  detail: string;
  file_path: string | null;
  design_id: string | null;
  specifications: Record<string, unknown>;
};
export const DESIGN_CATEGORIES = [
  "Todos",
  "Organización",
  "Mecánica",
  "Electrónica",
  "Hogar",
  "Arte y accesorios",
  "Educación",
] as const;
export const LICENSES = ["CC BY 4.0", "CC BY-SA 4.0", "CC0 1.0"] as const;
export async function api<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch("/api/" + path, {
    method: body === undefined ? "GET" : "POST",
    credentials: "same-origin",
    cache: "no-store",
    ...(body === undefined
      ? {}
      : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "No se pudo completar la solicitud.");
  return data as T;
}
export async function uploadFile(file: File, kind: "design" | "preview" | "quote") {
  const ticket = await api<{ url: string; path: string }>("uploads", {
    name: file.name,
    size: file.size,
    type: file.type,
    kind,
  });
  const response = await fetch(ticket.url, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream", "x-upsert": "false" },
    body: file,
  });
  if (!response.ok) throw new Error("No se pudo guardar el archivo. Intenta de nuevo.");
  return ticket.path;
}
export const errorText = (error: unknown) =>
  error instanceof Error ? error.message : "Ocurrió un problema. Intenta de nuevo.";
