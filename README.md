# ProtoLab

Prototipo académico de fabricación digital y prototipado bajo demanda.
Conserva la interfaz desarrollada con Lovable: React, TanStack Start, TypeScript
y Tailwind CSS. Nitro prepara el servidor y los archivos estáticos para Vercel.

## Desarrollo local

Requisitos: Node.js 24.x y Bun (gestor de paquetes). Las versiones de las
dependencias están fijadas en `bun.lock`; no es necesario migrar a npm.

```powershell
git clone https://github.com/TheMarceloC/Proyecto.git
cd Proyecto
bun install --frozen-lockfile
bun run dev
```

Abre la dirección que indique Vite. Para comprobar la compilación de producción:

```powershell
bun run build
bun run preview
```

El preset `vercel` está definido en `vite.config.ts` mediante el wrapper
`@lovable.dev/vite-tanstack-config`. Ese wrapper ya incluye Nitro, React,
TanStack Start y Tailwind; no dupliques sus plugins.

## Publicar en Vercel desde GitHub

Primero, asegúrate de que los cambios de configuración estén en la rama `main`
de GitHub. Vercel descarga el repositorio remoto, no los archivos del equipo.
Si recibiste los cambios en otra rama, revísalos y fusiónalos a `main` antes
de importar el proyecto.

1. Entra en https://vercel.com/new e inicia sesión con GitHub.
2. Autoriza a Vercel a acceder al repositorio `TheMarceloC/Proyecto` y pulsa
   **Import**. Si no aparece, revisa los permisos de la integración con GitHub.
3. Usa `protolab` u otro nombre disponible para el proyecto.
4. Revisa estos ajustes:

   | Ajuste            | Valor                                                       |
   | ----------------- | ----------------------------------------------------------- |
   | Framework Preset  | TanStack Start                                              |
   | Root Directory    | Raíz del repositorio (`./`), donde está `package.json`      |
   | Install Command   | `bun install --frozen-lockfile` (definido en `vercel.json`) |
   | Build Command     | `bun run build` (definido en `vercel.json`)                 |
   | Output Directory  | Automático; dejar desactivado el override                   |
   | Node.js Version   | 24.x (también indicado en `package.json`)                   |
   | Production Branch | `main`                                                      |

5. Para este prototipo no se identificaron variables de entorno obligatorias
   en el código de la aplicación. No necesitas inventar claves ni configurar
   una base de datos para mostrar la demostración.
6. Pulsa **Deploy**. Cuando el despliegue indique **Ready**, abre la URL asignada.
7. Prueba la página principal y abre directamente `/cotizar`, `/seguimiento`,
   `/materiales` y `/contacto`. Recarga cada ruta y comprueba imágenes, estilos
   y navegación. Completa una cotización de prueba y busca su código en el
   mismo navegador. Comprueba también el diseño desde un teléfono.

Después de conectar GitHub, los nuevos cambios en la rama de producción
generan despliegues automáticos. Los cambios en otras ramas pueden generar
despliegues de preview. En **Deployments** puedes consultar los logs y el commit
de cada versión. La URL pertenece al hosting de Vercel: servir la web no
depende de mantener este equipo encendido.

### Si falla el despliegue

- Confirma que Vercel está construyendo el commit que incluye `vercel.json`
  y `nitro: { preset: "vercel" }`.
- Confirma que el framework es **TanStack Start** y que no existe un override
  antiguo de la carpeta de salida. Nitro genera `.vercel/output`, con recursos
  estáticos y una función de servidor; no publiques solo `dist`.
- Si un proyecto ya importado tiene `NITRO_PRESET` o `SERVER_PRESET` configurados
  para Cloudflare, retira esos valores obsoletos. No copies variables internas
  de Lovable a Vercel.
- Si falla la instalación, conserva `bun.lock` y revisa el primer error en los
  logs. Si falla una página con HTTP 500, consulta los logs de la función.

## Alcance de la demostración

- `src/lib/protolab.ts` guarda pedidos en el `localStorage` del navegador.
  No se comparten entre dispositivos o navegadores y pueden perderse al borrar
  sus datos. No hay una base de datos compartida implementada en ese módulo.
- El adjunto de archivos del cotizador simula la carga en la interfaz; no
  transmite ni almacena el archivo en un servidor.
- `/admin` es una pantalla demostrativa sin autenticación. Sus cambios de
  estado son temporales en la vista. No usarla para operar pedidos reales.
- Los precios, tiempos, contactos, pedidos y estadísticas de ejemplo no
  acreditan actividad comercial real.

Publicar el prototipo no implementa pagos, correos, autenticación ni
almacenamiento de archivos. Usa datos de prueba al recorrerlo.

## Archivos privados y generados

`.gitignore` excluye dependencias, builds, `.vercel`, herramientas temporales
y archivos `.env`. Se permite una futura plantilla `.env.example` sin secretos.
Si se agregan servicios reales, sus claves privadas van en **Settings →
Environment Variables** de Vercel. El prefijo `VITE_` expone valores al navegador;
solo debe usarse para información pública.

## Verificación local de esta adaptación (16 de octubre de 2026)

### Actualización de seguridad de TanStack Start

Se actualizó `@tanstack/react-start` a `1.168.60`, con `@tanstack/start-server-core`
resuelto en `1.169.39` dentro de `bun.lock`, para corregir CVE-2026-102989.
Router y su plugin se alinearon con las dependencias de esa versión.
Referencia: [aviso oficial de TanStack](https://tanstack.com/blog/tanstack-start-security-update-cve-2026-102989).

Si Vercel bloqueó una versión anterior, despliega el commit que incluye esta
actualización. Volver a desplegar el commit antiguo conserva la dependencia
vulnerable. No es necesario activar la variable que omite el bloqueo de seguridad.

### Comprobaciones

- Instalación con `bun install --frozen-lockfile` y compilación con `bun run build`: correctas.
- `tsc --noEmit`: correcto. Formato y lint de los archivos de configuración modificados: correctos.
- Vista previa de Nitro sobre `.vercel/output`: las 12 rutas existentes respondieron HTTP 200;
  una ruta inexistente respondió HTTP 404. Los recursos referenciados por la portada respondieron HTTP 200.
- El lint general conserva errores de formato en los archivos originales y advertencias de Fast Refresh.
  No se reformateó toda la aplicación como parte de esta adaptación.
- Estas comprobaciones no sustituyen la verificación de la URL pública tras desplegar en Vercel.

## Referencias oficiales

- [TanStack Start: hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting)
- [TanStack Start en Vercel](https://vercel.com/docs/frameworks/full-stack/tanstack-start)
- [Preset de Vercel en Nitro](https://nitro.build/deploy/providers/vercel)
- [Versiones de Node.js en Vercel](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)
- [Integración de GitHub con Vercel](https://vercel.com/docs/git/vercel-for-github)

El repositorio mantiene la integración original con Lovable. Los commits de
la rama conectada pueden sincronizarse con su editor. No reescribas el historial
publicado con force push.
