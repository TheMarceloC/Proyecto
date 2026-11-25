# Customer Journey Map de ProtoLab

Nuevo apartado público en `/customer-journey`, accesible desde el menú,
el pie de página y «Cómo funciona».

Incluye dos recorridos: fabricación de una pieza y compra de un archivo 3D.
Cada uno tiene seis etapas con objetivos, acciones, puntos de contacto,
pensamientos, emociones previstas, fricciones y oportunidades. El selector
permite explorar las etapas; la tabla desplegable permite compararlas.

Los contenidos se editan en `src/lib/customer-journey.ts`. La interfaz está
en `src/routes/customer-journey.tsx`. No se agregaron dependencias ni se
modificaron pagos, cuentas, pedidos o permisos.

Los perfiles y las emociones son hipótesis, no resultados de entrevistas.
El recorrido de compra identifica el modo demostración actual del catálogo.

## Integración

Este proyecto conserva su configuración de TanStack Start, Lovable y Vercel.
La ruta se incorpora al árbol generado automáticamente al ejecutar Vite.

Para usar el parche en una copia del repositorio basada en el commit
`05ae92c0e5f9b7687ce34ac6d3b8f551d54e2d36`:

```powershell
git apply --check customer-journey.patch
git apply customer-journey.patch
bun install --frozen-lockfile
bun run build
bun run dev
```

Abre la dirección local que indique Vite y añade `/customer-journey`.
Publica los cambios mediante el flujo GitHub/Vercel ya utilizado por el proyecto.
