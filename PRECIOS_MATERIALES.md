# Costo de material y recargo

Actualizado: 18 de octubre de 2026. Se sustituyeron las referencias de tiendas por
los costos por kg y el multiplicador indicados directamente por el usuario.
Se utilizan L 375 exactos para PLA conforme a su instrucción; la imagen adjunta
mostraba un precio ligeramente distinto y no reemplaza ese valor explícito.

| Material | Costo / kg | Costo / g | Precio / g, factor 1.75 | Precio de 50 g |
|---|---:|---:|---:|---:|
| PLA | L 375.00 | L 0.375 | L 0.65625 | L 32.81 |
| PETG | L 338.00 | L 0.338 | L 0.5915 | L 29.58 |
| ABS | L 640.00 | L 0.640 | L 1.12 | L 56.00 |
| TPU | L 600.00 | L 0.600 | L 1.05 | L 52.50 |

```text
Consumo total (g) = gramos por pieza × cantidad
Costo de material = consumo total × costo por kg / 1000
Subtotal = costo de material × 1.75
Recargo = subtotal - costo de material (75 % sobre costo)
```

Ejemplo: 100 g de PLA para dos piezas consumen 200 g. Costo: L 75.00;
recargo: L 56.25; subtotal: L 131.25.

El 75 % es un recargo sobre costo, no un margen del 75 % sobre ventas.
La diferencia es contribución antes de descontar máquina, energía, mano de obra,
mermas no declaradas, comisiones y otros gastos: no es utilidad neta comprobada.
En la ampliación solicitada después se incorporó electricidad para A1/X1C, y campos
opcionales de máquina, mano de obra y extras. Ver [CALCULADORA_COSTOS.md](CALCULADORA_COSTOS.md).
Consultoría/diseño y envío se acuerdan aparte.

Los precios por gramo se conservan sin redondear (hasta cinco decimales en la UI).
Los importes del pedido se redondean a centavos. El recargo mostrado es la diferencia
entre subtotal y costo redondeados para que el desglose sume exactamente.

El peso inicial de 50 g es editable y no representa medición del archivo.
El equipo confirma el consumo en el laminador, incluidos soportes y purga.
La estimación del cliente no establece `quotes.price`, reservado al personal.

La configuración está centralizada en `src/lib/material-pricing.ts` y alimenta
inicio, materiales, servicios, cotizador y tarjetas de muestra.

## Catálogo

Las tres muestras usan imágenes locales y pesos ilustrativos, sin archivos
descargables ni autores inventados. Se renderizan desde el servidor y permanecen
visibles mientras cargan las publicaciones, si falla Supabase y si ya hay diseños
reales. Los filtros afectan ambas colecciones. Los errores de publicaciones se
informan por separado, sin ocultar las muestras.
