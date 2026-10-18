# Bases provisionales de materiales

Actualizado: 17 de octubre de 2026. El usuario pidió precios orientativos que solo
consideren material y añadir «+ consultoría» cuando falte diseño. Estos valores
son bases de referencia elegidas para la interfaz, no costos de compra medidos
del inventario de ProtoLab ni una tarifa completa de fabricación.

| Material | Base elegida por gramo | Referencia de 50 g |
|---|---:|---:|
| PLA | L 0.80 | L 40.00 |
| PETG | L 1.00 | L 50.00 |
| ABS | L 1.45 | L 72.50 |
| TPU | L 1.40 | L 70.00 |

## Referencias consultadas

Precios publicados de bobinas de 1 kg, consultados el 17/10/2026. Son productos
de marcas y presentaciones concretas; el precio cambia por proveedor y variante.
No se verificó una compra ni se incluye envío al laboratorio.

- PLA: [C&D, eSUN PLA básico de 1 kg](https://test.cdtechnologia.net/tecnologias-3d/4842-5208-filamento-pla-basico-esun-175mm-1kg.html), L 800 → L 0.80/g.
- PETG: [Yaxa Honduras, PETG negro de 1 kg](https://honduras.yaxa.co/products/impresion-material-negra-del-filamento-5-7-ft-m-2-2-lbs-3d-de-petg-de-la-impresora-3d), L 989.77 → L 0.98977/g; referencia redondeada a L 1.00/g.
- ABS: [Yaxa Honduras, Hatchbox ABS de 1 kg](https://honduras.yaxa.co/products/hatchbox-filamento-para-impresora-3d-abs-precision-dimensional-0-3-mm-carrete-de-1-kg-1-75-mm-azul), L 1,430.77 → L 1.43077/g; base provisional L 1.45/g.
- TPU: [C&D, eSUN TPU de 1 kg](https://cdtechnologia.net/5262-filamento-tpu-esun-175mm-1kg-negro.html), L 1,400 → L 1.40/g.

## Cálculo y alcance

`Estimación de materiales = gramos por pieza × cantidad × base por gramo`.

El peso inicial de 50 g es una referencia editable, no una medición del archivo.
No se deduce masa de las dimensiones exteriores ni del tamaño del archivo.
El equipo debe confirmar el consumo en el laminador, incluyendo soportes y purga.

La interfaz separa fabricación y envío, y muestra «+ consultoría y diseño por
cotizar» cuando el usuario parte de una idea, boceto o pieza física. No se inventa
una tarifa de consultoría. Un diseño real enlazado desde la comunidad no requiere
modelado por defecto. Ajustes adicionales se acuerdan después.

El importe mostrado no modifica `quotes.price`, reservado al personal autorizado.
La solicitud guarda gramos declarados y si se usó el peso inicial en specifications;
se consideran información del cliente, nunca un precio validado por el servidor.

## Cambiar los valores

Editar `src/lib/material-pricing.ts`: la misma tabla alimenta materiales, servicios,
cotizador y muestras del catálogo. Reemplazar las bases por el costo real de cada
bobina dividido entre sus gramos netos al disponer de facturas.

Las tarjetas de muestra tienen pesos ilustrativos, no archivos CAD descargables.
Solo aparecen si la consulta del catálogo terminó correctamente y no hay diseños
publicados. No sustituyen errores de conexión ni se cuentan como aportaciones.
