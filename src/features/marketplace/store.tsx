import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { accounts, type AccountId } from "./catalog";
import { clearMedia } from "./media";
import { applyMarketAction, initialMarket, type MarketAction, type MarketState } from "./model";

const key = "protolab-test-show-v1";
const MarketContext = createContext<{
  state: MarketState;
  ready: boolean;
  dispatch: (action: MarketAction) => boolean;
  reset: () => Promise<void>;
} | null>(null);

function restore() {
  const raw = localStorage.getItem(key);
  if (!raw) return initialMarket();
  const saved = JSON.parse(raw) as MarketState;
  const lists = [
    saved.products,
    saved.requests,
    saved.offers,
    saved.orders,
    saved.reviews,
    saved.notifications,
  ];
  if (
    !lists.every(Array.isArray) ||
    !saved.carts ||
    !saved.preferences ||
    !saved.availability ||
    !saved.favorites ||
    !accounts.some((account) => account.id === saved.activeAccount)
  )
    return initialMarket();
  return saved;
}

export function MarketProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialMarket);
  const current = useRef(state);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      current.current = restore();
      setState(current.current);
    } catch {
      toast.error("No se pudieron recuperar los datos guardados en este navegador.");
    }
    setReady(true);
  }, []);

  const dispatch = (action: MarketAction) => {
    // Resolve sequential clicks from the latest snapshot, before React batches the render.
    if (!ready) return false;
    const next = applyMarketAction(current.current, action);
    if (next === current.current) return false;
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      toast.error("No hay espacio disponible para guardar el cambio en este navegador.");
      return false;
    }
    current.current = next;
    setState(next);
    return true;
  };

  async function reset() {
    await clearMedia();
    localStorage.removeItem(key);
    current.current = initialMarket();
    setState(current.current);
  }

  return (
    <MarketContext.Provider value={{ state, ready, dispatch, reset }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const market = useContext(MarketContext);
  if (!market) throw new Error("MarketProvider is required");
  const account = accounts.find((entry) => entry.id === market.state.activeAccount)!;
  const favorites = market.state.favorites[account.id] ?? [];
  const cart = market.state.carts[account.id] ?? [];
  const notifications = market.state.notifications.filter(
    (entry) => entry.accountId === account.id,
  );
  const switchAccount = (id: AccountId) => {
    if (market.dispatch({ type: "account", id }))
      toast.success("Cuenta activa: " + accounts.find((entry) => entry.id === id)?.name);
  };
  return { ...market, account, favorites, cart, notifications, switchAccount };
}

export const makeId = (prefix: string) =>
  prefix + "-" + crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase();
export const dateLabel = (date: string) =>
  new Intl.DateTimeFormat("es-HN", { dateStyle: "medium", timeZone: "America/Tegucigalpa" }).format(
    new Date(date),
  );
