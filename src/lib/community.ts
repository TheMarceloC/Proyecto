export type Member = {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
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
  complexity: "basic" | "intermediate" | "advanced";
  complexity_notes: string;
  proposed_price?: number | null;
  price: number | null;
  commercial_consent?: boolean;
  commercial_reviewed?: boolean;
};
export type DesignPurchase = {
  id: string;
  owner_id: string;
  design_id: string;
  design_title: string;
  amount: number;
  currency: "HNL";
  license: string;
  status: "pending" | "paid" | "revoked";
  created_at: string;
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
export class CommunityApiError extends Error {
  status: number;
  configured: boolean | undefined;
  constructor(message: string, status: number, configured?: boolean) {
    super(message);
    this.name = "CommunityApiError";
    this.status = status;
    this.configured = configured;
  }
}
export async function api<T>(path: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch("/api/" + path, {
      method: body === undefined ? "GET" : "POST",
      credentials: "same-origin",
      cache: "no-store",
      ...(body === undefined
        ? {}
        : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    });
  } catch {
    throw new CommunityApiError(
      "No pudimos conectar con el servicio. Revisa tu conexión e intenta de nuevo.",
      0,
    );
  }
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new CommunityApiError(
      "El servicio no está disponible ahora. Intenta de nuevo más tarde.",
      response.status,
    );
  }
  if (!response.ok) {
    const payload = data as { error?: unknown; configured?: unknown } | null;
    throw new CommunityApiError(
      typeof payload?.error === "string" ? payload.error : "No se pudo completar la solicitud.",
      response.status,
      typeof payload?.configured === "boolean" ? payload.configured : undefined,
    );
  }
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
