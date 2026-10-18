# Cotizador de impresión: criterios y fuentes

Actualizado: 18 de octubre de 2026. Continúa la corrección de costos de material y
la visibilidad de las muestras del catálogo.

El usuario indicó como referencia https://www.comunidaderexit3d.com/platform/calculator.
La página redirigió a `/login`; no se accedió a sus campos ni fórmulas internas.
Esta implementación no copia ni afirma reproducir esa calculadora. Incorpora un
desglose verificable de material, electricidad y costos opcionales.

## Fórmulas

```text
Material = gramos por pieza × cantidad × costo del kilo / 1000
Material con recargo = material × 1.75
Horas totales = horas por pieza × cantidad, o las horas del lote completo
Energía (kWh) = potencia media (W) / 1000 × horas totales
Electricidad = energía × tarifa (L/kWh)
Máquina y mantenimiento = tarifa por hora × horas totales
Trabajo manual = minutos totales del pedido / 60 × tarifa por hora
Total = material con recargo + electricidad + máquina + trabajo manual + otros
```

Se conserva expresamente el factor del usuario sobre material; no se vuelve a
aplicar a energía u otros costos. Recargo no es utilidad neta. El precio definitivo
requiere revisar el proyecto y confirmar los conceptos incluidos.

El tiempo inicial de 2 h por pieza y el peso de 50 g son referencias editables,
no análisis del CAD. Si el laminador indica el tiempo del lote, debe seleccionarse
«Todo el lote» para no multiplicarlo otra vez por la cantidad. Los extras y el
trabajo manual siempre son por pedido. Costos opcionales empiezan en 0 porque
no se conoce el precio de compra, vida útil ni tarifas laborales del equipo.

## Impresoras

[Bambu Lab: Printer and AMS power parameters](https://wiki.bambulab.com/en/general/power-consumption),
consultado directamente en el navegador el 18/10/2026 (página editada 31/07/2026):

- A1 con PLA: potencia media de 95 W.
- X1/X1C con PLA: potencia media de 105 W.
- X1/X1C con ABS: potencia media de 150 W.

Son ensayos del fabricante, no mediciones de las máquinas de ProtoLab ni máximos
de la fuente. La página no da medias PETG/TPU para estos dos modelos: en esos casos
se usa el valor de PLA como aproximación explícita, reemplazable por un wattímetro.
No se suman consumos AMS/secado porque no se ha confirmado uso de esos accesorios.

ABS se asigna a X1 Carbon: la [ficha A1 de Bambu Lab](https://us.store.bambulab.com/products/a1)
no recomienda ABS en ese modelo. Elegir otro material vuelve a permitir ambas.

## Electricidad en Honduras

[CREE: Tarifas Vigentes ENEE](https://www.cree.gob.hn/tarifas-vigentes-enee/),
consultado 18/10/2026, estructura a partir de octubre de 2026:

| Servicio | Energía (L/kWh) |
|---|---:|
| General en baja tensión (predeterminado comercial) | 6.5115 |
| Residencial: primeros 50 kWh mensuales | 5.0031 |
| Residencial: siguientes kWh | 6.5102 |

El usuario puede reemplazar la tarifa por la de su factura. El cálculo por pedido
no pretende reproducir una factura mensual por bloques, subsidios, impuestos ni
cargos fijos. El cargo fijo no se añade completo a cada impresión. Actualizar los
valores al cambiar la estructura tarifaria.

## Archivos

- `src/lib/material-pricing.ts`: costos del usuario y factor 1.75.
- `src/lib/print-pricing.ts`: energía y demás costos, referencias de perfiles/tarifas.
- `src/components/site/PrintCostControls.tsx`: parámetros editables en Fabricación.
- `src/components/site/MaterialEstimate.tsx`: desglose del pedido en todas las etapas.

Los parámetros se adjuntan a `quotes.specifications` como estimación del cliente;
no fijan `quotes.price` ni sustituyen la autorización del personal para cotizar.
