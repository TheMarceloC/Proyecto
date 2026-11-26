import { Link } from "@tanstack/react-router";
import { ArrowRight, Bell, Check, Mail, MessageCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { dateLabel, useMarket } from "./store";
import { Empty, PageTitle } from "./ui";

export function NotificationsPage() {
  const { account, notifications, state, ready, dispatch } = useMarket();
  const preferences = state.preferences[account.id] ?? { email: true, whatsapp: false };
  const unread = notifications.filter((item) => !item.read).length;
  return (
    <div className="market-container market-page">
      <PageTitle
        title="Notificaciones"
        breadcrumb="Notificaciones"
        description={
          unread
            ? unread + (unread === 1 ? " notificación sin leer" : " notificaciones sin leer")
            : "Estás al día con tus notificaciones."
        }
      />
      <div className="commerce-layout">
        <section>
          <div className="group-heading">
            <h2>Actividad</h2>
            {unread > 0 && (
              <button
                type="button"
                className="text-action"
                disabled={!ready}
                onClick={() => dispatch({ type: "read" })}
              >
                <Check size={17} /> Marcar todas como leídas
              </button>
            )}
          </div>
          {notifications.length ? (
            <div className="surface notification-list">
              {[...notifications]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((item) => (
                  <article key={item.id} className={!item.read ? "unread" : ""}>
                    <span className="notification-icon">
                      <Bell size={19} />
                    </span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.detail}</p>
                      <small>{dateLabel(item.date)}</small>
                      <Link
                        to={item.href.startsWith("/admin") ? "/admin" : "/cuenta"}
                        search={{
                          seccion:
                            new URLSearchParams(item.href.split("?")[1]).get("seccion") ??
                            undefined,
                        }}
                        className="text-action"
                        onClick={() => dispatch({ type: "read", id: item.id })}
                      >
                        Ver actividad <ArrowRight size={15} />
                      </Link>
                    </div>
                    {!item.read && (
                      <button
                        type="button"
                        className="round-icon"
                        aria-label={"Marcar como leída: " + item.title}
                        onClick={() => dispatch({ type: "read", id: item.id })}
                      >
                        <Check size={18} />
                      </button>
                    )}
                  </article>
                ))}
            </div>
          ) : (
            <Empty title="Todavía no hay notificaciones" />
          )}
        </section>
        <aside className="surface preferences-card">
          <h2>Preferencias</h2>
          <div className="preference-row">
            <Mail size={19} />
            <span>Correo electrónico</span>
            <Switch
              checked={preferences.email}
              disabled={!ready}
              aria-label="Correo electrónico"
              onCheckedChange={(enabled) =>
                dispatch({ type: "preferences", field: "email", enabled })
              }
            />
          </div>
          <div className="preference-row">
            <MessageCircle size={19} />
            <span>WhatsApp</span>
            <Switch
              checked={preferences.whatsapp}
              disabled={!ready}
              aria-label="WhatsApp"
              onCheckedChange={(enabled) =>
                dispatch({ type: "preferences", field: "whatsapp", enabled })
              }
            />
          </div>
          <p className="muted">Estas preferencias se guardan en este navegador.</p>
        </aside>
      </div>
    </div>
  );
}
