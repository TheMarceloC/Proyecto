# Costos internos y cotización sin cuenta

Actualización: 19/10/2026. Este documento describe la implementación actual;
reemplaza las descripciones anteriores de peso/tiempo predeterminados y contacto
antes del presupuesto. Ninguna referencia representa mediciones nuevas del taller.

## Motor de costos

- Costos proporcionados por el propietario: PLA 375, PETG 338, TPU 600 y ABS 640 HNL/kg.
- `wastePercent`: reserva de filamento, 15% inicial, configurable entre 0 y 100.
  Consumo presupuestado = gramos netos por pieza × cantidad × (1 + porcentaje/100).
  No es 15% de margen ni una tasa de fallos medida. Evitar duplicar soportes o purgas
  ya incluidos en un consumo del laminador: ajustar a cero o a la reserva adicional.
- El factor 1.75 aplica al costo del material incluido el desperdicio presupuestado.
  Se redondea en centavos y el cliente ve solo el total redondeado a lempiras.
- Electricidad = W medios / 1000 × horas de máquina × tarifa. Se mantienen las
  referencias energéticas anteriores, pendientes de comparar con factura y medición.
- `machineHourly`: uso/mantenimiento por hora, excluyendo depreciación.
- `depreciationHourly`: recuperación presupuestada del equipo por hora.
  `equipmentDepreciationHourly(costo, residual, horasProductivasPresupuestadas)`
  devuelve (costo − residual) / horas. Las horas son una decisión financiera, no
  una vida útil garantizada por el fabricante. No se inventa precio de compra ni duración.
- Mano de obra = minutos por pedido / 60 × tarifa por hora.
- `packaging`, `logistics` y `extras`: importes por pedido, sin multiplicar por cantidad.
- Tiempo por pieza multiplica la cantidad; tiempo por lote no. Depreciación, energía
  y uso de máquina emplean esas mismas horas totales.

Total = material con recargo + energía + uso de máquina + depreciación + trabajo
manual + empaque + logística + extras. Los datos opcionales sin presupuesto se
mantienen vacíos y se calculan provisionalmente como cero. `unconfiguredCosts`
los enumera para el equipo: un costo sin configurar **no es un costo real cero**.
No se presenta el recargo ni la diferencia precio−costos parciales como utilidad neta.
Faltan costos fijos, impuestos aplicables, validación de ocupación y costos reales
para medir rentabilidad. Estas cifras internas no aparecen en el desglose al cliente.

## Presupuesto orientativo sin datos técnicos

`quick-estimate.ts` ofrece escenarios explícitos, inicialmente sin seleccionar:

| Referencia | Consumo neto usado | Horas por pieza usadas |
| ---------- | -----------------: | ---------------------: |
| Pequeña    |               25 g |                    1 h |
| Mediana    |              100 g |                    4 h |
| Grande     |              250 g |                   10 h |

Son referencias comerciales a calibrar con pedidos y laminador, no conversiones
geométricas de tamaño a peso ni resultados del archivo seleccionado. No se parsea
CAD. La interfaz identifica los gramos y horas utilizados y el material provisional.
No se promete precisión, adecuación técnica o fecha por elegir una referencia.

Un peso u horas introducidos por el visitante reemplazan solo ese valor del escenario.
Un número inválido bloquea el importe, sin usar una referencia para encubrirlo.
El tiempo asumido siempre es por pieza. Si se conocen ambos datos, no hace falta
elegir tamaño. Sin tamaño ni datos, se puede solicitar revisión de la idea sin precio
inventado ni obligación de conocer peso/horas.

El flujo es Proyecto / Tu idea / Tu pieza / Estimación / Guardar y enviar. Solo el
último muestra contacto y cuenta. La estimación funciona sin Supabase ni red. Los
archivos no se suben hasta confirmar el envío autenticado. En servidor continúan
los límites y los requisitos de cuenta, contacto y descripción/archivo. No se acepta
un precio aprobado del navegador: el equipo confirma precio y alcance.

## Configuración y pruebas

Ajustar bases internas en `DEFAULT_PRINT_SETTINGS` con datos presupuestados reales.
Los campos técnicos públicos no ofrecen editar márgenes, mano de obra o depreciación.
Registrar el contexto antes de cambiar los escenarios, costos y tarifas.

```powershell
bun run test:pricing
bun run test:quick-estimate
bun run test:client-api
bun run build
bun run test:api
bun run test:catalog
bun run test:policies
```

La API y las páginas renderizadas se prueban sobre el build recién generado. Los
mocks y PostgreSQL embebido no sustituyen la activación real de Supabase y SMTP.
