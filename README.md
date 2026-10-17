# ProtoLab

Comunidad de diseños 3D y fabricación bajo pedido. React, TanStack Start,
TypeScript, Tailwind CSS y Nitro en Vercel. Cuentas, datos y archivos con Supabase.

## Qué cambió

- Catálogo público con categorías, búsqueda y páginas de diseño.
- Publicación con archivo 3D, portada, licencia y revisión por el equipo.
- Una aportación aprobada desbloquea las descargas; la regla se valida en el servidor.
- Cotizaciones y mensajes persistidos, pedidos por cuenta y administración protegida.
- Botón de cotizar más visible y visual del mecanismo por capas en el cotizador.
- Se eliminaron las tecnologías futuras, pedidos inventados, contactos de muestra
  y confirmaciones de guardado que no contactaban un servidor.
- Los precios y plazos se asignan después de revisar el proyecto.

## Activación

Sigue [ACTIVAR_SUPABASE.md](ACTIVAR_SUPABASE.md). Contiene el SQL, las variables
de Vercel, la configuración de correo y el alta del administrador.
Hasta conectar ese servicio, no se pueden registrar cuentas ni guardar solicitudes.
El catálogo empieza vacío; solo mostrará publicaciones aprobadas realmente cargadas.

El [modelo de negocio](MODELO_NEGOCIO_PROTOLAB.md) recoge el intercambio acordado,
los ingresos propuestos y los costos y decisiones que faltan validar.

## Desarrollo

Necesitas Node.js 24.x y Bun. Copia .env.example a .env y configura TU proyecto
de Supabase para desarrollo; no subas .env a Git.

```powershell
bun install --frozen-lockfile
bun run dev
```

Verificación:

```powershell
bun run build
bun run test:policies
bun run test:api
bun run preview
```

test:api usa la compilación de producción previa. Las pruebas de permisos SQL
usan PostgreSQL embebido; las de API usan respuestas controladas. Debe comprobarse
el recorrido real de dos cuentas en el Supabase conectado antes de abrir el registro.

## Vercel

Importa TheMarceloC/Proyecto desde GitHub: framework TanStack Start, Node.js 24.x,
instalación bun install --frozen-lockfile, build bun run build, salida automática.
El wrapper de Lovable ya registra Nitro; vite.config.ts selecciona el preset vercel.
La compilación genera .vercel/output con servidor y recursos estáticos.

Las variables de Supabase solo se leen en el servidor. Los CAD se cargan directamente
a Storage con enlaces temporales y no pasan por el cuerpo de una función de Vercel.

Se mantiene el parche de TanStack Start para CVE-2026-102989. No omitas
el bloqueo de seguridad del proveedor.
El repositorio mantiene su integración con Lovable; no reescribas historial publicado.

## Referencias oficiales

- [TanStack Start en Vercel](https://vercel.com/docs/frameworks/full-stack/tanstack-start)
- [RLS de Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage/security/access-control)
- [Claves de Supabase](https://supabase.com/docs/guides/getting-started/api-keys)
- [SMTP de Supabase](https://supabase.com/docs/guides/auth/auth-smtp)
- [Licencias Creative Commons](https://creativecommons.org/cc-licenses/)
