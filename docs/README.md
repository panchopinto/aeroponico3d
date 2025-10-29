# Aeropónicos 3D — Tienda v2 (con App IoT)
- Checkout simulado con generación de **Licencia** (reemplaza por Flow/MercadoPago reales).
- **App IoT** en `/app/` (gated): requiere licencia. Lee telemetría desde `app/config.json`:
  - `telemetry_endpoint`: URL JSON (Google Apps Script / Firebase).
  - `fallback`: `app/mock/telemetry.json`.
- **Firmware** de ejemplo: `app/firmware/esp8266_dht11_iot.ino`.

## Para restringir acceso real
1. Cambia `data/licenses.json` con claves reales generadas al pagar (server-side).
2. O valida contra un Apps Script (`/validate?key=...`) y devuelve `{ "ok": true }`.

## Pagos reales
- **Flow**: crea preferencia/orden en tu backend y redirige a su checkout.
- **MercadoPago**: usa Checkout Pro para redirección simple.

## SEO
- `index.html` incluye JSON-LD de `Product` y `FAQPage`.
