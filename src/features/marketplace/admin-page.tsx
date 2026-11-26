import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Banknote,
  Box,
  CircleDollarSign,
  ClipboardList,
  LayoutDashboard,
  Users,
  WalletCards,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { SalesTable, SettingsPanel, Settlements } from "./account-page";
import { accounts, categories, kinds, sellers } from "./catalog";
import { months, roundMoney, sellerFor, type Order } from "./model";
import { useMarket } from "./store";
import { MediaImage, PageTitle, SellerAvailability, money } from "./ui";

const sections = [
  { id: "resumen", label: "Resumen", Icon: LayoutDashboard },
  { id: "usuarios", label: "Usuarios", Icon: Users },
  { id: "publicaciones", label: "Publicaciones", Icon: Box },
  { id: "ventas", label: "Ventas", Icon: ClipboardList },
  { id: "comisiones", label: "Comisiones", Icon: CircleDollarSign },
  { id: "liquidaciones", label: "Liquidaciones", Icon: WalletCards },
  { id: "configuracion", label: "Configuración", Icon: Activity },
];

const chartColors = [
  "#3e60eb",
  "#18a58b",
  "#f0aa68",
  "#8d77d1",
  "#43afd3",
  "#b66e96",
  "#68758a",
] as const;
type Point = { label: string; value: number };
const chartSize = { width: 435, height: 250 };
const totalFor = (orders: Order[], key: "total" | "commission") =>
  roundMoney(orders.reduce((sum, order) => sum + order[key], 0));

export function AdminPage({ section }: { section?: string | undefined }) {
  const { state, account, ready, dispatch, switchAccount } = useMarket();
  const active = sections.find((item) => item.id === section) ?? sections[0]!;
  if (account.id !== "admin")
    return (
      <div className="market-container market-page">
        <PageTitle title="Administración" breadcrumb="Administración" />
        <div className="surface setting-row">
          <div>
            <h3>Abre la cuenta de administración</h3>
            <p>Consulta indicadores, publicaciones y liquidaciones.</p>
          </div>
          <button
            type="button"
            disabled={!ready}
            className="market-button primary"
            onClick={() => switchAccount("admin")}
          >
            Cambiar a Administración <ArrowRight size={17} />
          </button>
        </div>
      </div>
    );
  const orders = [...state.orders].sort((a, b) => b.date.localeCompare(a.date));
  const commissions = orders.filter((order) => order.commission > 0);
  return (
    <div className="market-container market-page">
      <PageTitle
        title="Administración de ProtoLab"
        breadcrumb="Administración"
        description="Actividad del marketplace y operaciones comerciales."
      />
      <div className="account-layout admin-layout">
        <nav className="surface account-nav" aria-label="Administración">
          {sections.map(({ id, label, Icon }) => (
            <Link
              key={id}
              to="/admin"
              search={{ seccion: id }}
              aria-current={active.id === id ? "page" : undefined}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="account-content" key={active.id}>
          <div className="group-heading account-heading">
            <h2>{active.label}</h2>
          </div>
          {active.id === "resumen" && <Dashboard orders={orders} />}
          {active.id === "usuarios" && (
            <div className="surface table-scroll">
              <table className="market-table">
                <thead>
                  <tr>
                    <th scope="col">Cuenta</th>
                    <th scope="col">Tipo</th>
                    <th scope="col">Ciudad</th>
                    <th scope="col">Disponibilidad</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts
                    .filter((item) => !item.sellerId)
                    .map((item) => (
                      <tr key={item.id}>
                        <th scope="row">{item.name}</th>
                        <td>{item.role}</td>
                        <td>—</td>
                        <td>—</td>
                      </tr>
                    ))}
                  {sellers.map((seller) => (
                    <tr key={seller.id}>
                      <th scope="row">
                        <Link to="/fabricante/$id" params={{ id: seller.id }}>
                          {seller.name}
                        </Link>
                      </th>
                      <td>Colaborador</td>
                      <td>{seller.city}</td>
                      <td>
                        <SellerAvailability available={!!state.availability[seller.id]} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {active.id === "publicaciones" && (
            <div className="surface list-surface">
              {state.products.map((product) => (
                <div className="managed-product" key={product.id}>
                  <span className="line-media">
                    <MediaImage media={product.images[0]} alt="" />
                  </span>
                  <div>
                    <strong>{product.name}</strong>
                    <small>
                      {sellerFor(product.sellerId)?.name} · {product.hidden ? "Pausada" : "Visible"}
                    </small>
                  </div>
                  <button
                    type="button"
                    className="market-button secondary"
                    disabled={!ready}
                    onClick={() => {
                      if (dispatch({ type: "moderate", id: product.id }))
                        toast.success(
                          product.hidden ? "Publicación activada" : "Publicación pausada",
                        );
                    }}
                  >
                    {product.hidden ? "Activar" : "Pausar"}
                  </button>
                </div>
              ))}
            </div>
          )}
          {active.id === "ventas" && <SalesTable orders={orders} admin />}
          {active.id === "comisiones" && (
            <div className="stack">
              <div className="surface setting-row">
                <div>
                  <h3>Ingresos por comisiones</h3>
                  <p>Comisiones registradas en ventas de colaboradores.</p>
                </div>
                <strong className="summary-amount">
                  {money(totalFor(commissions, "commission"))}
                </strong>
              </div>
              <div className="surface table-scroll">
                <table className="market-table">
                  <thead>
                    <tr>
                      <th scope="col">Pedido</th>
                      <th scope="col">Vendedor</th>
                      <th scope="col">Venta</th>
                      <th scope="col">Comisión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map((order) => (
                      <tr key={order.id}>
                        <th scope="row">{order.id}</th>
                        <td>{sellerFor(order.sellerId)?.name}</td>
                        <td className="money-cell">{money(order.total)}</td>
                        <td className="money-cell">{money(order.commission)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {active.id === "liquidaciones" && <Settlements orders={orders} admin />}
          {active.id === "configuracion" && <SettingsPanel />}
        </div>
      </div>
    </div>
  );
}

function Dashboard({ orders }: { orders: Order[] }) {
  const { state } = useMarket();
  const gmv = totalFor(orders, "total");
  const commissions = totalFor(orders, "commission");
  const activeSellers = sellers.filter((seller) => state.availability[seller.id]).length;
  const pending = orders.filter((order) => !order.processed);
  const metrics = [
    { label: "GMV", value: money(gmv), title: "Valor total de las operaciones", Icon: Banknote },
    {
      label: "Ingresos por comisiones",
      value: money(commissions),
      title: "Comisiones sobre ventas de terceros",
      Icon: CircleDollarSign,
    },
    {
      label: "Transacciones",
      value: orders.length,
      title: "Operaciones confirmadas",
      Icon: ClipboardList,
    },
    {
      label: "Usuarios registrados",
      value: months.at(-1)!.users,
      title: "Registro del periodo de referencia",
      Icon: Users,
    },
    {
      label: "Vendedores activos",
      value: activeSellers,
      title: "Disponibles para nuevas solicitudes",
      Icon: Activity,
    },
    {
      label: "Publicaciones",
      value: state.products.filter((product) => !product.hidden).length,
      title: "Publicaciones visibles",
      Icon: Box,
    },
    {
      label: "Ticket promedio",
      value: money(roundMoney(orders.length ? gmv / orders.length : 0)),
      title: "GMV dividido entre transacciones",
      Icon: Banknote,
    },
    {
      label: "Liquidaciones pendientes",
      value: money(
        roundMoney(pending.reduce((sum, order) => sum + order.total - order.commission, 0)),
      ),
      title: pending.length + " operaciones",
      Icon: WalletCards,
    },
  ];
  const currentMonths = new Map(months.map(({ key, month }) => [key, month]));
  [...new Set(orders.map((order) => order.date.slice(0, 7)))].sort().forEach((key) => {
    if (!currentMonths.has(key)) {
      const label = new Intl.DateTimeFormat("es-HN", {
        month: "short",
        year: "2-digit",
        timeZone: "UTC",
      }).format(new Date(key + "-01"));
      currentMonths.set(key, label);
    }
  });
  const monthly = [...currentMonths].map(([key, label]) => {
    const slice = orders.filter((order) => order.date.startsWith(key));
    return { label, gmv: totalFor(slice, "total"), commission: totalFor(slice, "commission") };
  });
  const items = orders.flatMap((order) => order.lines);
  const byCategory = categories
    .map((category) => ({
      label: category,
      value: roundMoney(
        items
          .filter((line) => line.category === category)
          .reduce((sum, line) => sum + line.price * line.quantity, 0),
      ),
    }))
    .sort((a, b) => b.value - a.value);
  const kindOf = (order: Order) => {
    const types = new Set(order.lines.map((line) => line.kind));
    return types.size === 1 ? order.lines[0]?.kind : "mixed";
  };
  const byKind = Object.entries({ ...kinds, mixed: "Compra mixta" })
    .map(([id, label]) => ({ label, value: orders.filter((order) => kindOf(order) === id).length }))
    .filter((point) => point.value > 0);
  const byCity = [...new Set(sellers.map((seller) => seller.city))]
    .map((city) => ({
      label: city,
      value: sellers.filter((seller) => seller.city === city).length,
    }))
    .sort((a, b) => b.value - a.value);
  return (
    <>
      <div className="metric-grid dashboard-metrics">
        {metrics.map(({ label, value, title, Icon }) => (
          <div key={label} className="surface metric">
            <div>
              <span>{label}</span>
              <span className="metric-icon">
                <Icon size={17} />
              </span>
            </div>
            <strong>{value}</strong>
            <small>{title}</small>
          </div>
        ))}
      </div>
      <div className="group-heading chart-heading">
        <div>
          <h2>Actividad comercial</h2>
          <p>Junio a noviembre de 2026 y operaciones registradas durante la sesión.</p>
        </div>
      </div>
      <div className="dashboard-charts">
        <Trend
          title="Evolución mensual de ventas"
          id="sales"
          color={chartColors[0]}
          currency
          points={monthly.map(({ label, gmv: value }) => ({ label, value }))}
        />
        <Trend
          title="Ingresos por comisiones"
          id="fees"
          color={chartColors[1]}
          currency
          points={monthly.map(({ label, commission: value }) => ({ label, value }))}
        />
        <Bars
          title="Crecimiento de usuarios"
          color={chartColors[0]}
          points={months.map(({ month: label, users: value }) => ({ label, value }))}
        />
        <Bars
          title="Crecimiento de vendedores"
          color={chartColors[3]}
          points={months.map(({ month: label, vendors: value }) => ({ label, value }))}
        />
        <Distribution title="Ventas por categoría" currency points={byCategory} />
        <Distribution title="Transacciones por tipo de producto" points={byKind} />
        <Distribution
          title="Disponibilidad de colaboradores"
          points={[
            { label: "Disponible", value: activeSellers },
            { label: "No disponible", value: sellers.length - activeSellers },
          ]}
          colors={["#18a58b", "#8895a8"]}
        />
        <Distribution title="Colaboradores por ciudad" points={byCity} />
      </div>
    </>
  );
}
const fmt = (value: number, currency: boolean) => (currency ? money(value) : String(value));

function Trend({
  title,
  id,
  color,
  currency = false,
  points,
}: {
  title: string;
  id: string;
  color: string;
  currency?: boolean;
  points: Point[];
}) {
  return (
    <section className="surface chart-card">
      <h3>{title}</h3>
      <div className="chart-plot">
        <ResponsiveContainer width="100%" height={235} initialDimension={chartSize}>
          <AreaChart data={points} margin={{ left: 0, right: 10, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#e5eaf2" strokeDasharray="3 4" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#516079" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              width={56}
              tick={{ fontSize: 11, fill: "#516079" }}
              tickFormatter={(value) =>
                currency && value >= 1000
                  ? "L " + (value / 1000).toFixed(0) + "k"
                  : fmt(value, currency)
              }
              axisLine={false}
              tickLine={false}
            />
            <Tooltip formatter={(value: number) => [fmt(value, currency), title]} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={"url(#" + id + ")"}
              strokeWidth={3}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <ChartData points={points} currency={currency} />
    </section>
  );
}
function Bars({ title, color, points }: { title: string; color: string; points: Point[] }) {
  return (
    <section className="surface chart-card">
      <h3>{title}</h3>
      <div className="chart-plot">
        <ResponsiveContainer width="100%" height={235} initialDimension={chartSize}>
          <BarChart data={points} margin={{ left: 0, right: 10, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e5eaf2" strokeDasharray="3 4" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#516079" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              width={34}
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#516079" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip formatter={(value: number) => [value, title]} />
            <Bar
              dataKey="value"
              fill={color}
              radius={[5, 5, 0, 0]}
              maxBarSize={34}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ChartData points={points} />
    </section>
  );
}
function Distribution({
  title,
  points,
  currency = false,
  colors = chartColors,
}: {
  title: string;
  points: Point[];
  currency?: boolean;
  colors?: readonly string[];
}) {
  const colorsAt = (index: number) => colors[index % colors.length];
  const wide = points.length > 5;
  const max = Math.max(...points.map((point) => point.value), 1);
  return (
    <section className="surface chart-card">
      <h3>{title}</h3>
      {wide ? (
        <div className="chart-list" aria-label={title}>
          {points.map((point, index) => (
            <div key={point.label}>
              <div>
                <span>{point.label}</span>
                <strong>{fmt(point.value, currency)}</strong>
              </div>
              <span className="chart-list-track" aria-hidden="true">
                <i
                  style={{
                    width: (point.value / max) * 100 + "%",
                    backgroundColor: colorsAt(index),
                  }}
                />
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="donut-layout">
          <div className="donut">
            <ResponsiveContainer
              width="100%"
              height={180}
              initialDimension={{ width: 160, height: 180 }}
            >
              <PieChart>
                <Tooltip formatter={(value: number) => fmt(value, currency)} />
                <Pie
                  data={points}
                  dataKey="value"
                  nameKey="label"
                  innerRadius="58%"
                  outerRadius="90%"
                  paddingAngle={3}
                  isAnimationActive={false}
                >
                  {points.map((point, index) => (
                    <Cell key={point.label} fill={colorsAt(index)} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <dl className="chart-legend">
            {points.map((point, index) => (
              <div key={point.label}>
                <dt>
                  <i style={{ backgroundColor: colorsAt(index) }} />
                  {point.label}
                </dt>
                <dd>{fmt(point.value, currency)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}

function ChartData({ points, currency = false }: { points: Point[]; currency?: boolean }) {
  return (
    <details className="chart-data">
      <summary>Ver valores</summary>
      <dl className="fact-list">
        {points.map((point) => (
          <div key={point.label}>
            <dt>{point.label}</dt>
            <dd>{fmt(point.value, currency)}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
