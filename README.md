# ProtoLab · Test & Show GEN 2

ProtoLab presenta un marketplace de fabricación digital en Honduras. Reúne diseños descargables, productos físicos, fabricación personalizada y servicios de diseño y asesoría. **Esta versión es un prototipo académico.** Los perfiles, reseñas, precios, ventas e indicadores ilustran el recorrido comercial para la exposición. Las cifras no representan tracción de ProtoLab. La comisión del 12% es un parámetro ilustrativo de los datos iniciales.

## Inicio local

Requisitos del repositorio: Node.js 24.x y Bun. Desde la carpeta del proyecto:

```powershell
bun install --frozen-lockfile
bun run dev
```

Abre la dirección que imprime Vite. Las imágenes, tipografías, datos iniciales y descargas se sirven desde el proyecto. El Linktree del pie es un enlace externo opcional. El recorrido funciona sin configurar servicios, variables de entorno o cuentas externas.

En Windows, con las dependencias instaladas, también puedes iniciar la vista previa local con un ejecutable portátil de Bun. Sustituye la ruta del ejemplo por la de tu `bun.exe` y ejecuta el comando desde la carpeta del proyecto.

```powershell
& 'C:\ruta\a\bun.exe' '.\node_modules\vite\bin\vite.js' dev --host 127.0.0.1 --port 4175 --strictPort
```

Para verificar la compilación:

```powershell
bun run check
bun run build
bun run test
bun run preview
```

El build usa TanStack Start, React, TypeScript, Vite, Tailwind 4, Recharts y Nitro con el preset Vercel del repositorio. La compilación produce .vercel/output. Las pruebas de catálogo y rutas usan esa salida. Las pruebas de API y permisos históricos ejecutan su código de forma aislada con respuestas y datos controlados.

## Despliegue en Vercel

El proyecto existente está conectado a [TheMarceloC/Proyecto](https://github.com/TheMarceloC/Proyecto) y su dominio público es [proyecto-beta-lilac.vercel.app](https://proyecto-beta-lilac.vercel.app/). La raíz de compilación es la raíz del repositorio. `vercel.json` fija TanStack Start, `bun install --frozen-lockfile` y `bun run build`. Node.js 24.x se declara en `package.json` y Nitro genera la salida para Vercel.

Valida primero el despliegue de Preview de la rama de cambios. Al integrar el commit en la rama de producción, verifica el dominio público y las redirecciones de `/disenos` y `/cotizar`, que también reciben visitas desde el Linktree. Para recuperar un despliegue anterior desde el mismo proyecto, usa [Instant Rollback en Vercel](https://vercel.com/docs/instant-rollback).

## Recorrido de la exposición

1. Abre **Inicio** y elige **Explorar marketplace**. Filtra por **Diseños digitales** y busca **Reductor planetario didáctico**. Abre su ficha, cambia de vista, amplía la imagen y revisa **Especificaciones**.
2. Agrega el diseño al carrito, elige **Comprar a ProtoLab Studio** y confirma. En **Mi cuenta → Mis diseños**, descarga el ZIP. Puedes escribir una reseña desde **Mis compras**.
3. Abre **Fabricantes**, elige **Forma3D** y selecciona **Solicitar fabricación**. Describe el proyecto, selecciona un archivo opcional y elige el fabricante. La ficha de solicitud conserva el nombre, tamaño y extensión del archivo.
4. Abre **Mi cuenta → Ofertas**. Encuentra la oferta precargada para **Cubierta de terminales para banco**, acéptala y confirma el pago. También puedes generar una oferta para la solicitud que acabas de enviar siguiendo el paso 5.
5. En el menú de perfil, selecciona **Cambiar cuenta → Forma3D**. Abre **Solicitudes** y usa **Preparar oferta** para indicar el precio total, el material y el plazo. Cambia la disponibilidad desde **Mi perfil** y comprueba el resultado en el perfil público.
6. En **Mis publicaciones**, crea una ficha con una imagen o edita **Soporte orientable para sensor**. En **Calculadora de costos**, pulsa **Cargar ejemplo** y modifica peso, tiempo o multiplicador para recalcular. Revisa **Ventas** y **Saldo y liquidaciones**.
7. Cambia a **Administración** para mostrar los ocho gráficos. En **Liquidaciones**, marca una operación como procesada.

**Cambiar de cuenta.** Abre el icono de perfil en la barra superior y usa **Cambiar cuenta**. Están disponibles Daniel Martínez, Nova CAD Studio, Forma3D, ProtoLab Studio y Administración. La cuenta se conserva al recargar en el mismo navegador.

**Restablecer el recorrido.** En **Mi cuenta → Configuración → Restablecer datos locales**, confirma el restablecimiento. Desde Administración, la acción está en **Configuración** del panel. Se restauran el catálogo, las cuentas y las operaciones iniciales y se eliminan los archivos añadidos en el navegador. Usa el mismo host y puerto para recuperar el estado entre sesiones.

## Implementación comercial futura

| Área                       | Implementación en esta versión                                                                                     | Integración pendiente para uso comercial                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Perfiles y catálogo        | Cuentas y publicaciones iniciales en TypeScript. Disponibilidad, edición y moderación en el navegador.             | Autenticación, control de acceso por rol, base de datos y revisión de fichas.            |
| Compras y solicitudes      | Carrito por vendedor, pedidos, ofertas, reseñas y actividad local. El vendedor fija el precio de su oferta.        | Órdenes transaccionales, control de autorización y validación de importes.               |
| Imágenes, video y adjuntos | IndexedDB conserva archivos de publicaciones. Las solicitudes conservan metadatos del adjunto.                     | Almacenamiento privado, validación de archivos y enlaces temporales.                     |
| Pagos y liquidaciones      | Confirmación local con métodos visuales. Los registros alimentan GMV, comisión y saldo.                            | Proveedor de pagos, conciliación, procesamiento idempotente y política de liquidaciones. |
| Comunicación               | Notificaciones y preferencias en el navegador.                                                                     | Servicio transaccional con preferencias verificadas.                                     |
| Calculadora                | Costos directos y desgaste por hora. El precio sugerido usa un multiplicador y el margen toma el precio como base. | Calibración con los costos documentados de cada vendedor.                                |

Nitro renderiza la interfaz. El API de comunidad de la aplicación anterior queda desconectado en esta rama. Los documentos comerciales, el código anterior y las migraciones históricas se conservan como antecedentes.

## Estructura y recursos

- src/features/marketplace contiene el catálogo tipado, operaciones de estado, flujos de usuario y estilos.
- src/routes define las páginas y las redirecciones de compatibilidad. Por ejemplo, /cotizar abre /solicitar-fabricacion.
- src/components/site contiene la navegación y el pie compartidos.
- public/marketplace reúne dos vistas para cada una de las 28 publicaciones, tres escenas de talleres, nueve marcas de colaboradores, tipografías con sus licencias y nueve ZIP con geometrías OBJ y su documentación. Los OBJ son geometrías originales de referencia académica con dimensiones aproximadas.
- ImageGen generó la portada a partir de una escena editorial de un cabezal FDM sobre un conjunto planetario azul. Las tres escenas de taller representan espacios de FDM, resina y CAD. Los renders de producto y marcas de colaboradores se crearon para esta versión.
