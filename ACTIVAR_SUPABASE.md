# Actualización comercial del 27 de octubre de 2026

La venta individual de archivos sustituye el desbloqueo por aportes. Sigue primero [VENTA_DE_DISENOS.md](VENTA_DE_DISENOS.md): se requiere la migración incremental `202610270001_design_commerce.sql` después de la migración inicial. Los pagos se coordinan y verifican manualmente; no hay pasarela conectada.

# Activar las funciones de ProtoLab

El código de la comunidad está preparado para Supabase Auth, PostgreSQL y Storage.
Crear la página en Vercel no crea estos servicios. Sin estas variables, la web
permite recorrer sus páginas, pero no registra cuentas ni confirma solicitudes.

## 1. Crear el proyecto

1. Entra en [Supabase Dashboard](https://supabase.com/dashboard) y crea un proyecto.
2. Usa el nombre ProtoLab, elige una región disponible cercana a tus usuarios y
   guarda la contraseña de la base de datos en tu gestor de contraseñas.
3. Espera a que el proyecto esté listo. No necesitas compartir la contraseña en el chat.

## 2. Crear las tablas y los permisos

1. Abre **SQL Editor → New query** en Supabase.
2. Copia TODO el archivo
   [202610170001_community.sql](supabase/migrations/202610170001_community.sql).
3. Pulsa **Run**. El script crea perfiles, diseños, solicitudes de fabricación,
   mensajes, reservas de carga, políticas RLS y tres buckets privados.
4. Comprueba que no aparece un error. El script se ejecuta dentro de una transacción.

No hagas públicos los buckets y no añadas una política de lectura general.
Las imágenes de diseños publicados se muestran con enlaces temporales. Los archivos
CAD requieren comprobar autoría, administración o compra verificada de ese diseño antes de firmar su descarga.

## 3. Conectar Vercel

Busca en Supabase la URL del proyecto y sus claves en **Project Settings → API Keys**
(o en **Connect**, según la versión del Dashboard).

En Vercel abre tu proyecto → **Settings → Environment Variables** y añade:

| Nombre                   | Valor                                                     |
| ------------------------ | --------------------------------------------------------- |
| SUPABASE_URL             | La URL de tu proyecto, con formato https://...supabase.co |
| SUPABASE_PUBLISHABLE_KEY | La clave publishable de Supabase                          |
| SUPABASE_SECRET_KEY      | La clave secret del servidor                              |

Selecciona **Production**. Si también pruebas ramas, utiliza un proyecto separado de
Supabase para **Preview**, con sus propias claves, evitando mezclar pruebas y datos reales.

La clave secret se guarda solo en Vercel; no se pega en GitHub, en el chat, ni en
una variable con prefijo VITE_. La contraseña de la base de datos no es una API key.

El código también admite las claves legacy anon/service_role mediante
SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY si tu proyecto todavía las utiliza.
Usa una pareja coherente del mismo proyecto. Las claves modernas son la opción preferente.

Después de añadir las variables, despliega el commit más reciente de la rama main.
Guardar las variables no modifica una función que ya está desplegada: debes generar
un nuevo deployment o volver a desplegar la versión actual.

## 4. Configurar el registro y los correos

En Supabase → **Authentication → URL Configuration**:

- **Site URL:** la URL pública exacta de ProtoLab en Vercel, con https.
- **Redirect URLs:** añade esa misma URL seguida de /cuenta.
- Para desarrollo local puedes añadir http://localhost:8080/cuenta si usas ese puerto;
  revisa la dirección que realmente indica Vite.

Mantén la confirmación de correo. Para que puedan registrarse personas ajenas
al equipo del proyecto, configura **Authentication → Email → SMTP Settings**
con un proveedor de correo SMTP y un remitente autorizado. El correo por defecto
de Supabase está limitado a los miembros del proyecto y no sirve para abrir el registro
al público. El código no ha contratado ni configurado un proveedor SMTP.

**Dos circuitos diferentes:** el SMTP configurado en Supabase Auth entrega correos
de autenticación (por ejemplo, confirmar cuentas). No convierte un registro en
`quotes` o `messages` en un correo al taller o al cliente. Para correos reales de
solicitudes hay que integrar en el servidor un envío transaccional SMTP o API,
remitente autorizado, credenciales solo de servidor y una cola/outbox con reintentos
e idempotencia. Esa integración no está implementada en esta versión: el éxito del
formulario confirma almacenamiento, no entrega de correo. No añadas claves SMTP
al navegador ni a variables `VITE_*`.

Consulta las [instrucciones oficiales de SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
y los [redirects de autenticación](https://supabase.com/docs/guides/auth/redirect-urls).

## 5. Dar acceso al administrador

1. Crea tu cuenta en la página /cuenta y confirma el correo.
2. Ejecuta esta consulta en SQL Editor, sustituyendo el correo por el de TU cuenta:

```sql
update public.profiles
set is_admin = true
where id = (
  select id from auth.users where email = 'TU-CORREO'
);
```

3. Vuelve a entrar en tu cuenta y abre /admin.

Solo una operación privilegiada en la base de datos puede habilitar ese rol.
El formulario de registro no permite crearse una cuenta administradora.

## 6. Probar el recorrido con dos cuentas

1. Sin iniciar sesión, abre /disenos. El catálogo inicial está vacío:
   no se añadieron creadores, descargas ni publicaciones inventadas.
2. Registra una cuenta de creador y otra cuenta para comprobar el bloqueo.
3. Con la cuenta de creador, publica un archivo 3D propio y una portada real.
   Elige una licencia compatible y aporta instrucciones de fabricación.
4. Confirma en /panel que el diseño queda En revisión y que no se ve en el catálogo público.
5. Como administrador, descarga y revisa el archivo, la descripción y los derechos.
   Escribe las notas y aprueba la publicación solo cuando corresponda.
6. El visitante puede ver el diseño y su precio. Cada comprador solicita y paga el archivo por separado.
7. El administrador verifica el pago real desde Compras. Solo entonces el comprador puede descargar ese archivo. Publicar no habilita descargas de otros diseños.
8. Desde el detalle, pulsa Fabricar con ProtoLab. Comprueba que la solicitud
   conserve el diseño elegido, los datos de contacto y los requisitos.
9. Revisa la solicitud en /admin, guarda un precio y actualiza el estado.
   El cliente debe ver los cambios desde otro dispositivo con su misma cuenta.
10. Prueba también contacto y asesoría. Los mensajes se guardan para el equipo:
    no se envía una respuesta automática ni se cobran pagos.

## Alcance y operación

- Las cargas van directamente a Supabase mediante URLs firmadas: los CAD no atraviesan
  el límite de cuerpo de las funciones de Vercel.
- Archivo 3D/adjunto: hasta 50 MB. Portada JPG/PNG/WEBP: hasta 5 MB.
- Se reservan como máximo 20 cargas y 100 MB declarados por cuenta cada 24 horas.
  Al asociar un archivo a un registro, el servidor verifica su existencia y tamaño.
  Revisa el consumo global y elimina con cuidado cargas huérfanas sin registro,
  después de que expire el enlace de carga; nunca borres archivos referenciados.
- Los enlaces de descarga CAD caducan en 60 segundos; los de portada, en una hora.
  Son enlaces temporales compartibles durante su vigencia, no DRM.
- Se muestran hasta las 100 publicaciones/solicitudes más recientes por consulta.
- La aprobación valida la publicación. No acredita que una pieza haya sido impresa,
  ensayada o certificada. Las piezas funcionales necesitan revisión y pruebas físicas.
- Define con el equipo precios, disponibilidad, transporte, política de cancelación,
  atención y condiciones de uso antes de recibir pedidos comerciales.
- Cotización y coordinación de aprobación/pago se realizan con el equipo.
  No se implementaron cobros automáticos, regalías ni un sistema de mensajería de ida y vuelta.

## Verificación de código

```powershell
bun install --frozen-lockfile
bun run build
bun run test:policies
bun run test:api
bun run preview
```

Las pruebas SQL usan PostgreSQL embebido (PGlite) con roles de prueba.
Las pruebas de API verifican permisos con respuestas controladas de Supabase.
No sustituyen la prueba de registro, carga y descarga en TU proyecto conectado.

## Estimación sin cuenta y servicio sin configurar

`/cotizar` permite calcular localmente una referencia antes de pedir contacto o
cuenta. El paso final **Guardar y enviar** conserva autenticación y validación en
el servidor. Los adjuntos permanecen seleccionados en el navegador hasta ese envío.

Sin las tres variables (o con URL inválida), `GET /api/session` devuelve
`{ configured: false, user: null }`. El catálogo público devuelve una lista vacía
con las muestras locales disponibles. Los endpoints que requieren almacenamiento
devuelven HTTP 503 y JSON con `configured: false`, sin fabricar un código de solicitud.
Los formularios desactivan envío/registro y explican que se puede seguir estimando.
Una sesión inaccesible por fallo de red muestra una opción de reintento. Que la
configuración exista no prueba conectividad ni que se haya aplicado la migración.

Modelo de costos y supuestos: [COSTOS_Y_COTIZACION.md](COSTOS_Y_COTIZACION.md).

Referencias: [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security),
[claves API](https://supabase.com/docs/guides/getting-started/api-keys),
[Storage](https://supabase.com/docs/guides/storage/security/access-control),
[límite de Vercel](https://vercel.com/docs/errors/function_payload_too_large).
