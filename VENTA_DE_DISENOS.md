# Venta de diseños de ProtoLab

## Presentación pública demostrativa

Por solicitud del usuario, `src/lib/demo-designs.ts` activa `CATALOG_DEMO_MODE` para mostrar tres diseños locales con precios de ejemplo de L 100, L 250 y L 500. El catálogo, los detalles, filtros y vista previa de compra no requieren Supabase ni cuenta. El botón de compra muestra únicamente un resumen: no guarda compras, no cobra ni entrega archivos. El formulario de publicación permite previsualizar el envío sin subir archivos. Las referencias demo del cotizador no se envían como pedidos reales.

Esta versión se puede desplegar sin ejecutar la migración comercial. Para activar ventas reales, configurar y comprobar primero la infraestructura indicada abajo y después desactivar `CATALOG_DEMO_MODE`. No quitar las etiquetas de demostración mientras los datos sigan siendo ejemplos.

Cambio del 27 de octubre de 2026. Sustituye el intercambio y cualquier instrucción anterior que indique que un aporte habilita todas las descargas.

## Modelo implementado

- Catálogo público; cada archivo comercial tiene un precio entero en HNL aprobado por el equipo.
- Complejidad básica, intermedia o avanzada como clasificación editorial. Se evalúan modelado, componentes, ensambles y documentación; no hay tarifas ni ingresos inventados.
- El creador propone precio, justifica complejidad, declara derechos y envía condiciones comerciales. El administrador debe acordar precio, permisos y compensación con el creador antes de publicar. No se impone una comisión automática.
- Licencia propuesta al comprador: `Uso personal · ProtoLab v1`. Permite impresión para uso propio; excluye redistribuir archivos o vender piezas sin autorización específica. Revisar estas condiciones comerciales con el equipo antes de operar.
- Comprar una pieza física no incluye el archivo. La fabricación se solicita en el cotizador y se cotiza por separado, contemplando las condiciones acordadas con el titular del diseño.
- Los ejemplos de catálogo se conservan como referencias visuales: no tienen un archivo disponible ni un precio de venta ficticio.

## Activación en Supabase y Vercel

1. Respalda los datos existentes. En SQL Editor aplica primero `supabase/migrations/202610170001_community.sql` si aún no existe, y después **una sola vez** `supabase/migrations/202610270001_design_commerce.sql`. La segunda migración es incremental; no vuelvas a ejecutar la primera después de ella.
2. Los diseños previamente aprobados vuelven a revisión: se conserva su licencia original, no se les asigna un precio ni consentimiento ficticios. Deben recibir una nueva propuesta comercial del titular; no basta con marcar una casilla para convertir una licencia anterior.
3. Conserva las variables de servidor de `ACTIVAR_SUPABASE.md`. Publica el código y vuelve a desplegar en Vercel después de la migración. Sin ella las consultas comerciales no funcionarán.
4. Con una cuenta de creador envía un diseño, precio y condiciones. Con una cuenta administradora revisa el archivo y acuerda expresamente los términos con el creador antes de aprobar.
5. Usa otra cuenta para solicitar la compra y aceptar la licencia. Coordina el medio de pago real con el comprador utilizando la referencia de la solicitud.
6. Solo después de comprobar el ingreso completo, registra la referencia real en Administración → Compras → Confirmar pago. El comprador encontrará el archivo en Mis proyectos → Mis compras de diseños.

## Alcance del pago

No se ha conectado una pasarela, cuenta bancaria ni un proveedor de tarjetas. Registrar una compra **no cobra dinero**. La interfaz lo explica y permite coordinar con el equipo. Tampoco envía automáticamente instrucciones por correo: el SMTP de Auth solo cubre los mensajes de autenticación. La configuración comercial del medio de pago y un proveedor de cobro automatizado quedan pendientes.

El precio y la licencia de cada compra se capturan desde la base de datos, no desde el navegador. Solicitudes repetidas devuelven la misma compra, incluso si cambia posteriormente el precio publicado. El precio de la solicitud se muestra antes de coordinar el pago; no se cobra automáticamente. Una compra revocada requiere atención del equipo; no se permite crear otra para sortear la revocación.

Las tablas de compras no permiten escrituras REST del usuario. Las funciones SQL validan identidad y permisos, capturan precio y licencia, limitan solicitudes y registran eventos de confirmación/revocación. Una referencia de pago no puede usarse para confirmar dos compras. El archivo se firma durante 60 segundos solo para su autor, un administrador o el comprador con pago verificado de **ese diseño**. Un diseño retirado no se puede descargar; se requiere atención del equipo. Revocar acceso no recupera copias previamente descargadas ni reembolsa dinero.

## Verificación local

Compilación y TypeScript, pruebas de API con Supabase simulado, políticas y funciones de las dos migraciones en PGlite. No equivalen a pruebas contra el proyecto Supabase o un medio de pago real. Prueba el flujo completo en un entorno de revisión antes de habilitar ventas reales.
