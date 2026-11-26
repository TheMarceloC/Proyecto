import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { accounts } from "@/features/marketplace/catalog";
import { SearchBox } from "@/features/marketplace/ui";
import { useMarket } from "@/features/marketplace/store";

const navigation = [
  { to: "/", label: "Inicio" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/fabricantes", label: "Fabricantes" },
  { to: "/solicitar-fabricacion", label: "Solicitar fabricación" },
  { to: "/servicios-diseno", label: "Servicios de diseño" },
  { to: "/calculadora", label: "Calculadora de costos" },
  { to: "/vender", label: "Conviértete en vendedor" },
] as const;

export function Logo() {
  return (
    <Link to="/" className="market-logo" aria-label="ProtoLab, inicio">
      <img src="/protolab-symbol.svg" alt="" width={34} height={34} />
      <span>
        Proto<span>Lab</span>
      </span>
    </Link>
  );
}

export function Navbar() {
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [profile, setProfile] = useState(false);
  const { account, cart, notifications, ready, switchAccount } = useMarket();
  const location = useLocation();
  const navigate = useNavigate();
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);
  const unread = notifications.filter((item) => !item.read).length;
  const homeProfile = account.id === "admin" ? "/admin" : "/cuenta";
  const isMarketplace =
    location.pathname === "/marketplace" || location.pathname.startsWith("/producto/");
  const navItems = navigation.map((item) => (
    <Link
      key={item.to}
      to={item.to}
      onClick={() => {
        setMenu(false);
        setSearch(false);
      }}
      className={[
        item.to === "/marketplace" && isMarketplace && "nav-active",
        item.to === "/solicitar-fabricacion" && "desktop-request",
      ]
        .filter(Boolean)
        .join(" ")}
      activeOptions={{ exact: item.to === "/" }}
      activeProps={{ className: "nav-active" }}
    >
      {item.label}
    </Link>
  ));
  return (
    <header className="market-header">
      <div className="market-container header-top">
        <Logo />
        <div className="desktop-search">
          <SearchBox />
        </div>
        <div className="utility-nav">
          <button
            className="round-icon mobile-search"
            type="button"
            aria-label={search ? "Cerrar búsqueda" : "Buscar"}
            aria-expanded={search}
            onClick={() => {
              setSearch(!search);
              setMenu(false);
            }}
          >
            {search ? <X size={19} /> : <Search size={19} />}
          </button>
          <Link className="round-icon" aria-label="Favoritos" title="Favoritos" to="/favoritos">
            <Heart size={20} />
          </Link>
          <Link
            className="round-icon"
            aria-label={"Carrito" + (count ? " (" + count + ")" : "")}
            title="Carrito"
            to="/carrito"
          >
            <ShoppingBag size={20} />
            {count > 0 && <span className="utility-count">{count}</span>}
          </Link>
          <Link
            className="round-icon"
            aria-label={"Notificaciones" + (unread ? " (" + unread + " sin leer)" : "")}
            title="Notificaciones"
            to="/notificaciones"
          >
            <Bell size={20} />
            {unread > 0 && <span className="utility-dot" />}
          </Link>
          <Popover open={profile} onOpenChange={setProfile}>
            <PopoverTrigger asChild>
              <button type="button" className="profile-trigger" aria-label="Perfil de usuario">
                <UserRound size={19} />
                <span>{account.id === "daniel" ? "Mi cuenta" : account.name}</span>
                <ChevronDown className="profile-chevron" size={14} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="market-popover" align="end" sideOffset={10}>
              <div className="profile-current">
                <strong>{account.name}</strong>
                <small>{account.role}</small>
              </div>
              <Link
                className="profile-home-link"
                to={homeProfile}
                onClick={() => setProfile(false)}
              >
                {account.id === "admin" ? "Panel de administración" : "Ir a mi cuenta"}{" "}
                <ArrowUpRight size={15} />
              </Link>
              <div className="profile-list">
                <p>Cambiar cuenta</p>
                {accounts.map((entry) => (
                  <button
                    type="button"
                    key={entry.id}
                    disabled={!ready}
                    onClick={() => {
                      switchAccount(entry.id);
                      setProfile(false);
                      void navigate({ to: entry.id === "admin" ? "/admin" : "/cuenta" });
                    }}
                  >
                    <span>
                      <strong>{entry.name}</strong>
                      <small>{entry.role}</small>
                    </span>
                    {entry.id === account.id && <Check size={17} />}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <button
            className="round-icon mobile-menu"
            type="button"
            aria-label={menu ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menu}
            onClick={() => {
              setMenu(!menu);
              setSearch(false);
            }}
          >
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <div className="header-nav-row">
        <div className="market-container nav-inner">
          <nav className="desktop-nav" aria-label="Navegación principal">
            {navItems}
          </nav>
          <Link
            className="nav-request"
            to="/solicitar-fabricacion"
            onClick={() => {
              setMenu(false);
              setSearch(false);
            }}
          >
            Solicitar fabricación <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
      {search && (
        <div className="market-container mobile-search-panel" key={location.href}>
          <SearchBox />
        </div>
      )}
      {menu && (
        <nav className="market-container mobile-nav" aria-label="Navegación principal">
          {navItems}
        </nav>
      )}
    </header>
  );
}
