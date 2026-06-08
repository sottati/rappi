# Estado de implementación

Documento vivo para trackear qué falta implementar en código vs. documentación y requerimientos funcionales.

**Última revisión:** 2026-06-08  
**Fuentes:** `docs/REQUERIMENTOS_FUNCIONALES.csv`, `docs/GAPS.md`, `docs/HANDOFF.md`, `docs/MODELO_DATOS.md`, `AGENTS.md`, código en `app/` y `lib/db/`.

---

## Resumen ejecutivo

| Área | Estado |
|------|--------|
| Base técnica multibase (clientes, queries, mocks, seed) | ✅ Listo |
| Catálogo público (`/restaurantes/*`) | ✅ Postgres + Mongo |
| Login y sesión por rol | ✅ Funcional (+ callback `?next=`) |
| Flujo de compra end-to-end | ✅ Checkout persiste en Postgres |
| Detalle de pedidos por rol | ❌ Mayormente mock |
| CRUD operativo (productos, direcciones, estados) | ❌ Pendiente |
| Analytics / Cassandra en UI | ❌ Sin pantallas |
| Sincronización multibase post-checkout | ❌ Pendiente (Fase 1.5) |
| Seguridad producción (hash, constraints, tests) | ❌ Pendiente |

---

## Leyenda

- ✅ Implementado y conectado a queries reales (o decisión cerrada)
- ⚠️ Parcial / mock / desalineado con docs
- ❌ No implementado
- 🔄 En progreso (actualizar manualmente)

---

## Cambios recientes (Fase 1 — checkout)

| Ítem | Estado | Notas |
|------|--------|-------|
| Migración `0002_detalle_pedido_snapshot.sql` | ✅ | `id_producto_catalogo`, `nombre_producto`, sin FK al catálogo |
| `createPedidoFromCartSnapshot` | ✅ | Conectada vía `confirmCartAction` |
| `getDireccionesByCliente` | ✅ | Usada en checkout; MVP: primera dirección del cliente |
| `confirmCartAction` (`lib/cart/actions.ts`) | ✅ | Requiere sesión `usuario`; total = Σ ítems |
| Login con callback `?next=` | ✅ | `sanitizeNextPath` + hidden field en form |
| `/carrito` con gate de auth | ✅ | Anónimo → login; admin/repartidor → bloqueado |
| `/carrito/confirmacion?idPedido=` | ✅ | Pedido real + ownership check + limpia carrito |
| Snapshot Drizzle de migración `0002` | ⚠️ | SQL en repo; verificar journal/meta commiteado |
| Sync Mongo / Redis / Cassandra al crear pedido | ❌ | Dejado para Fase 1.5 |

---

## Rutas

### Implementadas con datos reales

| Ruta | Motor(es) | Notas |
|------|-----------|-------|
| `/login` | Postgres (`cuenta_app`) | Server Action; soporta `?next=` |
| `/restaurantes` | Postgres | Listado establecimientos |
| `/restaurantes/[idEstablecimiento]` | Postgres + Mongo | Catálogo Mongo |
| `/restaurantes/.../productos/[idProducto]` | Postgres + Mongo | Detalle producto |
| `/carrito` | Zustand + Postgres (checkout) | Público para ver; confirmar requiere `usuario` |
| `/carrito/confirmacion` | Postgres | `getPedidoById` scoped por `id_cliente` |
| `/admin/pedidos` | Postgres | Scoped por `id_establecimiento` |
| `/admin/productos` | Postgres | Scoped; **lee `producto` PG, no catálogo Mongo** |
| `/usuario` | Postgres | Resumen scoped por `id_cliente` |
| `/repartidor/disponibilidad` | Postgres + Redis | Solo lectura |

### Existen pero siguen en mock o parcial

| Ruta | Estado | Debería usar |
|------|--------|--------------|
| `/admin` | ⚠️ Mock | Postgres scoped + Cassandra métricas |
| `/admin/establecimientos` | ⚠️ Lista real sin scope de sesión | Filtrar por `session.idEstablecimiento` |
| `/admin/pedidos/[idPedido]` | ❌ Mock | `getPedidoById` + autorización + update estado |
| `/repartidor` | ❌ Mock | Postgres + Redis |
| `/repartidor/pedidos` | ❌ Mock | `getPedidosByRepartidor` |
| `/repartidor/pedidos/[idPedido]` | ❌ Mock | `getPedidoById` + check `id_repartidor` |
| `/usuario/pedidos` | ❌ Mock | `getPedidosByCliente` (inconsistente con `/usuario`) |
| `/usuario/pedidos/[idPedido]` | ❌ Mock | `getPedidoById` + check `id_cliente` |
| `/signin` | ❌ Visual | Alta en `cliente` + `cuenta_app` |

### Documentadas pero no creadas (404)

| Ruta | Referencia |
|------|------------|
| `/admin/analytics` | `AGENTS.md`, `MODELO_DATOS.md` |
| `/admin/establecimientos/[idEstablecimiento]` | `README.md`, links desde listado admin |
| `/admin/productos/[idProducto]` | `README.md` |
| `/usuario/establecimientos` | Nav en `usuario/layout.tsx` |
| `/usuario/direcciones` | Nav en `usuario/layout.tsx` |

---

## Queries y backend por motor

### PostgreSQL

| Query / capacidad | Estado | Usado en UI |
|-------------------|--------|-------------|
| `authenticateCuenta` | ✅ | `/login` |
| `getEstablecimientos` / `getEstablecimientoById` | ✅ | Público + admin + confirmación |
| `getProductosByEstablecimiento` | ✅ | `/admin/productos` |
| `getPedidos` / `getPedidoById` / filtros por rol | ✅ queries | ⚠️ Listado admin + confirmación; resto mock |
| `createPedidoFromCartSnapshot` | ✅ | `/carrito` → `confirmCartAction` |
| `getDireccionesByCliente` | ✅ | Checkout (primera dirección) |
| `getRepartidorById` / `getRepartidoresDisponibles` | ✅ | Disponibilidad (lectura) |
| Cliente: get / update perfil | ❌ | — |
| `direccion_entrega`: create / delete | ❌ | — |
| `updatePedidoEstado` / asignar repartidor | ❌ | — |
| Calificación: create / promedio por local | ❌ | — |
| Hash de `cuenta_app.contrasenia` | ❌ | Texto plano (demo) |
| Constraints de negocio (montos, checks por rol) | ❌ | `docs/GAPS.md` |

### MongoDB

| Colección / query | Estado | Usado en UI |
|-------------------|--------|-------------|
| `getRestaurantCatalog` | ✅ | `/restaurantes/[id]` |
| `getRestaurantCatalogProduct` | ✅ | Detalle producto |
| `getRestaurantReviews` / `createReview` | ✅ queries | ❌ Sin pantalla |
| `getUserActivity` | ✅ query | ❌ Sin pantalla |
| `getRestaurantProfile` | ❌ | Hero con datos hardcodeados |
| `getOrderDocument` | ❌ | — |
| `getUserProfile` | ❌ | — |
| CRUD catálogo (alta / editar / disponible) | ❌ | Admin usa Postgres |
| `order_documents` post-checkout | ❌ | Fase 1.5 |

### Redis

| Capacidad | Estado | Usado en UI |
|-----------|--------|-------------|
| `getDeliveryLocation` | ✅ | `/repartidor/disponibilidad` |
| `setDeliveryLocation` | ✅ query | ❌ Sin Server Action |
| `cacheOrderStatus` / `getCachedOrderStatus` | ✅ queries | ❌ Sin wiring al crear/cambiar estado |
| Frescura GEO `delivery:location:fresh:<id>` | ❌ | `docs/GAPS.md` |
| Toggle disponibilidad repartidor | ❌ | Pantalla solo lectura |

### Cassandra

| Query | Estado | Usado en UI |
|-------|--------|-------------|
| `getPedidosPorCliente` | ✅ | ❌ |
| `getPedidosPorLocal` / `getPedidosPorLocalEstado` | ✅ | ❌ |
| `getPedidosPorRepartidor` | ✅ | ❌ |
| `getCalificacionesLocal` / `getCalificacionesRepartidor` | ✅ | ❌ |
| `getMetricasDiariasLocal` / `getMetricasDiariasRepartidor` | ✅ | ❌ |
| `getMetricasGlobalesDiarias` / `getRankingLocalesPorMes` | ✅ | ❌ |

---

## Requerimientos funcionales (`docs/REQUERIMENTOS_FUNCIONALES.csv`)

| # | Requerimiento | Estado | Notas |
|---|---------------|--------|-------|
| 1 | Comentario en calificación | ✅ N/A | Eliminado por decisión del equipo |
| 2 | Fecha automática de calificación | ❌ | Sin flujo de calificación |
| 3 | Calificar pedido entregado (1–5, local y/o repartidor) | ❌ | `createReview` sin UI |
| 4 | Promedio de puntajes del establecimiento | ❌ | Sin query ni pantalla |
| 5 | Total pedido = Σ (precio × cantidad) | ✅ | `createPedidoFromCartSnapshot` en checkout |
| 6 | Registrar establecimiento | ❌ | Sin CRUD UI |
| 7 | `fecha_hora` automática en pedido | ✅ | Default en schema / insert |
| 8 | Flujo de estados + `cancelado` | ⚠️ | Enum en schema; sin mutación ni validación de transiciones |
| 9 | Crear pedido (productos + dirección) | ⚠️ | Checkout funcional; dirección = primera en PG, no selector UI |
| 10 | Historial pedidos cliente (Cassandra) | ❌ | Mock en `/usuario/pedidos` |
| 11 | Repartidor: detalle pedido asignado | ❌ | Mock |
| 12 | Admin: ver pedidos y confirmar/rechazar | ⚠️ | Lista real; detalle y cambio estado mock |
| 13–15 | Promociones como entidad | ✅ N/A | Eliminadas; `promocion_porcentaje` en producto |
| 16 | Asignar repartidor disponible | ❌ | Sin lógica |
| 17 | Repartidor: en camino / entregado | ❌ | Sin persistencia |
| 18 | Consultar pedidos del repartidor | ❌ | Mock; query Cassandra sin UI |
| 19 | Admin: agregar productos al menú | ❌ | Sin CRUD; admin lee Postgres no Mongo |
| 20 | Marcar producto no disponible | ❌ | Sin UI |
| 21 | Editar producto (precio, promo, disponible) | ❌ | Sin UI |
| 22 | Cliente: explorar catálogo | ✅ | Mongo; falta filtro por tipo en UI |
| 23–27 | Promociones CRUD / vigencia / monto mínimo | ✅ N/A | No aplica |
| 28 | Registrar repartidor | ❌ | Sin UI |
| 29 | Disponibilidad repartidor en tiempo real | ⚠️ | Solo lectura |
| 30 | Registrar cliente | ❌ | `/signin` visual |
| 31–32 | Seleccionar dirección en pedido | ⚠️ | Usa primera dirección del cliente; sin selector en carrito |
| 33 | Eliminar dirección (sin pedido activo) | ❌ | Sin rutas ni queries |
| 34 | Login email + contraseña | ✅ | `cuenta_app`; checkout exige sesión `usuario` |
| 35 | Editar perfil cliente | ❌ | Solo datos de sesión |
| 36 | Registrar direcciones de entrega | ❌ | Sin rutas ni queries |

---

## Gaps técnicos transversales (`docs/GAPS.md`)

| Gap | Estado | Prioridad sugerida |
|-----|--------|-------------------|
| Passwords texto plano en `cuenta_app` | ❌ | Alta |
| Constraints de negocio en PostgreSQL | ❌ | Alta |
| Pantallas mock → queries scoped | 🔄 | Alta (checkout ✅; pedidos por rol pendiente) |
| Detalles `[idPedido]` con autorización real | ❌ | Alta |
| Consumo MongoDB (perfiles, order_documents) | ❌ | Media |
| Redis frescura / TTL operacional | ❌ | Media |
| Cassandra en analytics / historial | ❌ | Media |
| Tests (mappers, seed, queries) | ❌ | Media |
| Snapshots Drizzle post-`0000` | ⚠️ | Baja |
| Sincronización multibase al crear pedido | ❌ | Media (Fase 1.5) |

---

## Desalineaciones conocidas (documentar o corregir)

| Tema | Docs dicen | Código hace |
|------|------------|-------------|
| Catálogo admin | MongoDB fuente de verdad (`ADR-014`) | `/admin/productos` lee tabla `producto` en Postgres |
| Admin establecimientos | Scoped por sesión (`HANDOFF.md`) | Lista todos los establecimientos |
| Signin | Pantalla pública pendiente (`ADR-017`) | Form sin Server Action; copy menciona Supabase Auth |
| Componentes de pedido | `PedidoConDetalle` (`types/domain.ts`) | Listados/detalle por rol usan `MockPedidoVista` |
| Total vs fees en checkout | `pedido.total` transaccional | Total PG = solo ítems; envío/tarifa simulados en UI del carrito |
| Dirección en checkout | Cliente elige dirección | Primera fila de `direccion_entrega` en PG |

---

## Prioridad sugerida de implementación

1. [x] Commitear y migrar snapshot `detalle_pedido` + snapshot Drizzle `0002`
2. [x] Conectar checkout → `createPedidoFromCartSnapshot` (Server Action + auth `usuario`)
3. [ ] Migrar `[idPedido]` y listados en admin / usuario / repartidor a queries reales + autorización
4. [ ] Server Actions: cambio de estado pedido + cache Redis
5. [ ] Direcciones: CRUD + `/usuario/direcciones` + selector en checkout
6. [ ] Fase 1.5: sync post-checkout (Mongo `order_documents`, Redis status, Cassandra evento)
7. [ ] Admin productos contra Mongo (CRUD) o documentar excepción Postgres
8. [ ] Rutas faltantes: `/usuario/establecimientos`, `/admin/analytics`
9. [ ] Calificaciones + historial Cassandra en UI
10. [ ] Hash passwords, constraints SQL, tests básicos

---

## Flujo de checkout (referencia)

```
/restaurantes → carrito (Zustand, público)
     ↓
/carrito → sin sesión: /login?next=/carrito
     ↓
confirmCartAction → getDireccionesByCliente → createPedidoFromCartSnapshot
     ↓
/carrito/confirmacion?idPedido=N → getPedidoById + ownership → ClearCartOnMount
```

Cuenta demo: `ana.perez@example.com` / `test123` (`id_cliente` en sesión).

---

## Bitácora de avances

| Fecha | Cambio |
|-------|--------|
| 2026-06-08 | Documento inicial generado desde análisis de docs + código + diff local |
| 2026-06-08 | **Fase 1 checkout:** snapshot `detalle_pedido`, `createPedidoFromCartSnapshot`, `getDireccionesByCliente`, `confirmCartAction`, login `?next=`, gate auth en `/carrito`, confirmación real con ownership |

---

## Cómo actualizar este archivo

1. Al cerrar un ítem, cambiar ❌/⚠️/🔄 por ✅ en la tabla correspondiente.
2. Si una ruta pasa de mock a real, moverla de sección en **Rutas**.
3. Agregar fila en **Bitácora de avances** con fecha y resumen breve.
4. Si se toma una decisión de diseño (ej. admin productos queda en Postgres), actualizar **Desalineaciones** y `docs/DECISIONES.md`.
