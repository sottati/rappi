# Estado de implementación

Documento vivo para trackear qué falta implementar en código vs. documentación y requerimientos funcionales.

**Última revisión:** 2026-06-08  
**Fuentes:** `docs/REQUERIMENTOS_FUNCIONALES.csv`, `docs/GAPS.md`, `docs/HANDOFF.md`, `docs/MODELO_DATOS.md`, `AGENTS.md`, código en `app/` y `lib/db/`.

---

## Resumen ejecutivo


| Área                                                    | Estado                                                                       |
| ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Base técnica multibase (clientes, queries, mocks, seed) | ✅ Listo                                                                      |
| Catálogo público (`/restaurantes/`*)                    | ✅ Postgres + Mongo                                                           |
| Login y sesión por rol                                  | ✅ Funcional (+ callback `?next=`)                                            |
| Flujo de compra end-to-end                              | ✅ Checkout persiste en Postgres                                              |
| Detalle de pedidos por rol                              | ❌ Mayormente mock                                                            |
| CRUD operativo (productos, direcciones, estados)        | ⚠️ Parcial (admin catálogo + local ✅; direcciones usuario ✅; pedidos/estados pendiente) |
| Analytics / Cassandra en UI                             | ❌ Sin pantallas                                                              |
| Sincronización multibase post-checkout                  | ❌ Pendiente (Fase 1.5)                                                       |
|                                                         |                                                                              |


---

## Leyenda

- ✅ Implementado y conectado a queries reales (o decisión cerrada)
- ⚠️ Parcial / mock / desalineado con docs
- ❌ No implementado
- 🔄 En progreso (actualizar manualmente)

---

## Cambios recientes (Fase 1 — checkout)


| Ítem                                           | Estado | Notas                                                         |
| ---------------------------------------------- | ------ | ------------------------------------------------------------- |
| Migración `0002_detalle_pedido_snapshot.sql`   | ✅      | `id_producto_catalogo`, `nombre_producto`, sin FK al catálogo |
| `createPedidoFromCartSnapshot`                 | ✅      | Conectada vía `confirmCartAction`                             |
| `getDireccionesByCliente`                      | ✅      | `/usuario` + `/carrito`; selector de dirección en checkout    |
| `confirmCartAction` (`lib/cart/actions.ts`)    | ✅      | Requiere sesión `usuario`; total = Σ ítems                    |
| Login con callback `?next=`                    | ✅      | `sanitizeNextPath` + hidden field en form                     |
| `/carrito` con gate de auth                    | ✅      | Anónimo → login; admin/repartidor → bloqueado                 |
| `/carrito/confirmacion?idPedido=`              | ✅      | Pedido real + ownership check + limpia carrito                |
| Snapshot Drizzle de migración `0002`           | ⚠️     | SQL en repo; verificar journal/meta commiteado                |
| Sync Mongo / Redis / Cassandra al crear pedido | ❌      | Dejado para Fase 1.5                                          |


---

## Cambios recientes (Admin operativo — catálogo y local)


| Ítem                                          | Estado    | Notas                                                        |
| --------------------------------------------- | --------- | ------------------------------------------------------------ |
| Panel scoped 1:1 (`ADR-022`)                  | ✅         | `session.idEstablecimiento` en páginas y Server Actions      |
| `/admin/local`                                | ✅         | Postgres (`establecimiento`) + Mongo (`restaurant_profiles`) |
| `/admin/productos` (+ nuevo / `[idProducto]`) | ✅         | CRUD sobre `restaurant_catalogs` (`ADR-023`)                 |
| `lib/admin/scope.ts`                          | ✅         | `getAdminScope()` — auth + rol + establecimiento             |
| `lib/admin/actions.ts`                        | ✅         | Server Actions con `revalidatePath`                          |
| `lib/admin/catalog-helpers.ts`                | ✅         | IDs, categorías, flatten para listado                        |
| Sync PG → Mongo al editar local               | ✅         | `syncCatalogHeader` + `upsertRestaurantProfile` (nombre)     |
| Soft delete producto                          | ✅         | `setCatalogProductAvailability` (`disponible: false`)        |
| Redirect post-alta producto                   | ✅         | `redirect(/admin/productos/[id])` tras crear                 |
| Tabla `producto` en Postgres (panel admin)    | ⚠️ legacy | Seed/demo; el panel ya no la usa para CRUD                   |


### Archivos clave


| Capa                 | Archivos                                                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Rutas                | `app/admin/local/page.tsx`, `app/admin/productos/page.tsx`, `app/admin/productos/nuevo/page.tsx`, `app/admin/productos/[idProducto]/page.tsx`                                              |
| Redirect legacy      | `app/admin/establecimientos/page.tsx` → `/admin/local`                                                                                                                                     |
| Formularios (client) | `components/features/admin/admin-local-forms.tsx`, `admin-product-form.tsx`                                                                                                                |
| Listado (client)     | `components/features/admin/admin-product-list.tsx`                                                                                                                                         |
| Mutaciones (server)  | `lib/admin/actions.ts`                                                                                                                                                                     |
| Queries Mongo        | `addCatalogProduct`, `updateCatalogProduct`, `setCatalogProductAvailability`, `getRestaurantCatalogProduct`, `upsertRestaurantProfile`, `syncCatalogHeader` en `lib/db/mongodb/queries.ts` |
| Queries Postgres     | `updateEstablecimiento`, `getEstablecimientoById` en `lib/db/postgres/queries.ts`                                                                                                          |


### Server Actions (`lib/admin/actions.ts`)


| Action                          | Formulario                       | Motor                       | Comportamiento post-éxito                                                         |
| ------------------------------- | -------------------------------- | --------------------------- | --------------------------------------------------------------------------------- |
| `updateEstablecimientoAction`   | `AdminEstablecimientoForm`       | Postgres + sync Mongo       | Mensaje en pantalla (`success`)                                                   |
| `updateRestaurantProfileAction` | `AdminPerfilComercialForm`       | Mongo `restaurant_profiles` | Mensaje en pantalla                                                               |
| `saveCatalogProductAction`      | `AdminProductForm`               | Mongo `restaurant_catalogs` | **Alta:** `redirect` a `/admin/productos/[id]` · **Edición:** mensaje en pantalla |
| `setProductAvailabilityAction`  | `AdminProductAvailabilityToggle` | Mongo (soft delete)         | Mensaje en pantalla                                                               |


Los formularios usan `useActionState(action, initialState)` de React 19: el `<form action={formAction}>` invoca la Server Action en el servidor; `state` muestra `error` / `success`; `pending` deshabilita el botón. Patrón análogo a `components/features/auth/login-form.tsx`.

Cuenta demo admin: `admin@burger.example` / `test123` → Burger Palermo (`id_establecimiento: 1`).

---

## Cambios recientes (Usuario — direcciones de entrega)


| Ítem                                           | Estado | Notas                                                                 |
| ---------------------------------------------- | ------ | --------------------------------------------------------------------- |
| CRUD `direccion_entrega` en Postgres           | ✅      | `create` / `update` / `delete` + `getDireccionEntregaById` scoped     |
| `/usuario` — sección direcciones               | ✅      | Listado + alta/edición/eliminación en la misma página (sin ruta extra) |
| `lib/usuario/scope.ts`                         | ✅      | `getUsuarioScope()` — auth + rol + `id_cliente`                       |
| `lib/usuario/actions.ts`                       | ✅      | `saveDireccionAction`, `deleteDireccionAction`                        |
| `UsuarioDirecciones` (server + Suspense)       | ✅      | Fetch en `usuario-direcciones.tsx`; UI client en `usuario-direcciones-view.tsx` |
| Selector de dirección en `/carrito`            | ✅      | `CartAddressPicker` + `selectedDireccionId` en Zustand                |
| `confirmCartAction` con `idDireccion` elegida  | ✅      | Valida ownership con `getDireccionEntregaById` antes de crear pedido  |
| Delete bloqueado si dirección usada en pedido  | ✅      | `direccionHasPedidos` + mensaje de error en UI                        |


### Archivos clave (direcciones)


| Capa                 | Archivos                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| Rutas                | `app/usuario/page.tsx`, `app/carrito/page.tsx`                                                                |
| Formularios (client) | `components/features/usuario/usuario-direcciones-view.tsx`, `components/features/cart/cart-address-picker.tsx` |
| Mutaciones (server)  | `lib/usuario/actions.ts`, `lib/cart/actions.ts` (`confirmCartAction`)                                         |
| Queries Postgres     | `getDireccionesByCliente`, `getDireccionEntregaById`, `createDireccionEntrega`, `updateDireccionEntrega`, `deleteDireccionEntrega` en `lib/db/postgres/queries.ts` |
| Store carrito        | `lib/cart/store.ts` — `selectedDireccionId` (persistido; excepción aceptada para checkout)                  |


### Server Actions (`lib/usuario/actions.ts`)


| Action                   | Componente              | Motor                    | Comportamiento post-éxito      |
| ------------------------ | ----------------------- | ------------------------ | ------------------------------ |
| `saveDireccionAction`    | `DireccionForm`         | Postgres `direccion_entrega` | `revalidatePath('/usuario')` |
| `deleteDireccionAction`  | `DireccionDeleteButton` | Postgres `direccion_entrega` | `revalidatePath('/usuario')` |


Cuenta demo usuario: `ana.perez@example.com` / `test123` (`id_cliente: 1`).

---

## Rutas

### Implementadas con datos reales


| Ruta                                       | Motor(es)                     | Notas                                                    |
| ------------------------------------------ | ----------------------------- | -------------------------------------------------------- |
| `/login`                                   | Postgres (`cuenta_app`)       | Server Action; soporta `?next=`                          |
| `/restaurantes`                            | Postgres                      | Listado establecimientos                                 |
| `/restaurantes/[idEstablecimiento]`        | Postgres + Mongo              | Catálogo Mongo                                           |
| `/restaurantes/.../productos/[idProducto]` | Postgres + Mongo              | Detalle producto                                         |
| `/carrito`                                 | Zustand + Postgres (checkout) | Público para ver; confirmar requiere `usuario` + dirección |
| `/carrito/confirmacion`                    | Postgres                      | `getPedidoById` scoped por `id_cliente`                  |
| `/admin/local`                             | Postgres + Mongo              | `AdminEstablecimientoForm` + `AdminPerfilComercialForm`  |
| `/admin/productos`                         | Mongo                         | Listado scoped; link a alta y edición                    |
| `/admin/productos/nuevo`                   | Mongo                         | Alta vía `saveCatalogProductAction` → redirect a detalle |
| `/admin/productos/[idProducto]`            | Mongo                         | Edición + toggle disponibilidad                          |
| `/admin/pedidos`                           | Postgres                      | Scoped por `id_establecimiento`                          |
| `/usuario`                                 | Postgres                      | Perfil + CRUD `direccion_entrega` scoped por `id_cliente` |
| `/repartidor/disponibilidad`               | Postgres + Redis              | Solo lectura                                             |


### Existen pero siguen en mock o parcial


| Ruta                             | Estado     | Debería usar                                         |
| -------------------------------- | ---------- | ---------------------------------------------------- |
| `/admin`                         | ⚠️ Mock    | Postgres scoped + Cassandra métricas                 |
| `/admin/establecimientos`        | ✅ Redirect | Redirige a `/admin/local`                            |
| `/admin/pedidos/[idPedido]`      | ❌ Mock     | `getPedidoById` + autorización + update estado       |
| `/repartidor`                    | ❌ Mock     | Postgres + Redis                                     |
| `/repartidor/pedidos`            | ❌ Mock     | `getPedidosByRepartidor`                             |
| `/repartidor/pedidos/[idPedido]` | ❌ Mock     | `getPedidoById` + check `id_repartidor`              |
| `/usuario/pedidos`               | ❌ Mock     | `getPedidosByCliente` (inconsistente con `/usuario`) |
| `/usuario/pedidos/[idPedido]`    | ❌ Mock     | `getPedidoById` + check `id_cliente`                 |
| `/signin`                        | ❌ Visual   | Alta en `cliente` + `cuenta_app`                     |


### Documentadas pero no creadas (404)


| Ruta                                          | Referencia                     |
| --------------------------------------------- | ------------------------------ |
| `/admin/analytics`                            | `AGENTS.md`, `MODELO_DATOS.md` |
| `/admin/establecimientos/[idEstablecimiento]` | `README.md`, links legacy      |
| `/usuario/establecimientos`                   | Link en `/usuario` (sin ruta dedicada aún) |
| `/usuario/direcciones`                        | ⚠️ No existe; CRUD vive en `/usuario`      |


---

## Queries y backend por motor

### PostgreSQL


| Query / capacidad                                  | Estado    | Usado en UI                                   |
| -------------------------------------------------- | --------- | --------------------------------------------- |
| `authenticateCuenta`                               | ✅         | `/login`                                      |
| `getEstablecimientos` / `getEstablecimientoById`   | ✅         | Público + admin + confirmación                |
| `getProductosByEstablecimiento`                    | ⚠️ legacy | Ya no usada en admin; catálogo admin en Mongo |
| `updateEstablecimiento`                            | ✅         | `/admin/local`                                |
| `getPedidos` / `getPedidoById` / filtros por rol   | ✅ queries | ⚠️ Listado admin + confirmación; resto mock   |
| `createPedidoFromCartSnapshot`                     | ✅         | `/carrito` → `confirmCartAction`              |
| `getDireccionesByCliente`                          | ✅         | `/usuario`, `/carrito`, confirmación          |
| `getDireccionEntregaById`                          | ✅         | Checkout (validación ownership)               |
| `createDireccionEntrega` / `updateDireccionEntrega` | ✅      | `/usuario` (`saveDireccionAction`)            |
| `deleteDireccionEntrega`                           | ✅         | `/usuario` (bloquea si hay pedidos)           |
| `getRepartidorById` / `getRepartidoresDisponibles` | ✅         | Disponibilidad (lectura)                      |
| Cliente: get / update perfil                       | ❌         | —                                             |
| `updatePedidoEstado` / asignar repartidor          | ❌         | —                                             |
| Calificación: create / promedio por local          | ❌         | —                                             |
| Hash de `cuenta_app.contrasenia`                   | ❌         | Texto plano (demo)                            |
| Constraints de negocio (montos, checks por rol)    | ❌         | `docs/GAPS.md`                                |


### MongoDB


| Colección / query                            | Estado    | Usado en UI                      |
| -------------------------------------------- | --------- | -------------------------------- |
| `getRestaurantCatalog`                       | ✅         | `/restaurantes/[id]`             |
| `getRestaurantCatalogProduct`                | ✅         | Detalle producto                 |
| `getRestaurantReviews` / `createReview`      | ✅ queries | ❌ Sin pantalla                   |
| `getUserActivity`                            | ✅ query   | ❌ Sin pantalla                   |
| `getRestaurantProfile`                       | ✅         | `/admin/local`                   |
| `upsertRestaurantProfile`                    | ✅         | `/admin/local`                   |
| `syncCatalogHeader`                          | ✅         | Sync nombre/tipo al editar local |
| `addCatalogProduct` / `updateCatalogProduct` | ✅         | `/admin/productos/`*             |
| `setCatalogProductAvailability`              | ✅         | Soft delete / reactivar producto |
| CRUD catálogo (alta / editar / disponible)   | ✅         | Admin panel Mongo                |
| `order_documents` post-checkout              | ❌         | Fase 1.5                         |


### Redis


| Capacidad                                   | Estado    | Usado en UI                          |
| ------------------------------------------- | --------- | ------------------------------------ |
| `getDeliveryLocation`                       | ✅         | `/repartidor/disponibilidad`         |
| `setDeliveryLocation`                       | ✅ query   | ❌ Sin Server Action                  |
| `cacheOrderStatus` / `getCachedOrderStatus` | ✅ queries | ❌ Sin wiring al crear/cambiar estado |
| Frescura GEO `delivery:location:fresh:<id>` | ❌         | `docs/GAPS.md`                       |
| Toggle disponibilidad repartidor            | ❌         | Pantalla solo lectura                |


### Cassandra


| Query                                                      | Estado | Usado en UI |
| ---------------------------------------------------------- | ------ | ----------- |
| `getPedidosPorCliente`                                     | ✅      | ❌           |
| `getPedidosPorLocal` / `getPedidosPorLocalEstado`          | ✅      | ❌           |
| `getPedidosPorRepartidor`                                  | ✅      | ❌           |
| `getCalificacionesLocal` / `getCalificacionesRepartidor`   | ✅      | ❌           |
| `getMetricasDiariasLocal` / `getMetricasDiariasRepartidor` | ✅      | ❌           |
| `getMetricasGlobalesDiarias` / `getRankingLocalesPorMes`   | ✅      | ❌           |


---

## Requerimientos funcionales (`docs/REQUERIMENTOS_FUNCIONALES.csv`)


| #     | Requerimiento                                          | Estado | Notas                                                         |
| ----- | ------------------------------------------------------ | ------ | ------------------------------------------------------------- |
| 1     | Comentario en calificación                             | ✅ N/A  | Eliminado por decisión del equipo                             |
| 2     | Fecha automática de calificación                       | ❌      | Sin flujo de calificación                                     |
| 3     | Calificar pedido entregado (1–5, local y/o repartidor) | ❌      | `createReview` sin UI                                         |
| 4     | Promedio de puntajes del establecimiento               | ❌      | Sin query ni pantalla                                         |
| 5     | Total pedido = Σ (precio × cantidad)                   | ✅      | `createPedidoFromCartSnapshot` en checkout                    |
| 6     | Registrar establecimiento                              | ❌      | Sin CRUD UI                                                   |
| 7     | `fecha_hora` automática en pedido                      | ✅      | Default en schema / insert                                    |
| 8     | Flujo de estados + `cancelado`                         | ⚠️     | Enum en schema; sin mutación ni validación de transiciones    |
| 9     | Crear pedido (productos + dirección)                   | ✅      | Checkout con dirección elegida en `/carrito`                   |
| 10    | Historial pedidos cliente (Cassandra)                  | ❌      | Mock en `/usuario/pedidos`                                    |
| 11    | Repartidor: detalle pedido asignado                    | ❌      | Mock                                                          |
| 12    | Admin: ver pedidos y confirmar/rechazar                | ⚠️     | Lista real; detalle y cambio estado mock                      |
| 13–15 | Promociones como entidad                               | ✅ N/A  | Eliminadas; `promocion_porcentaje` en producto                |
| 16    | Asignar repartidor disponible                          | ❌      | Sin lógica                                                    |
| 17    | Repartidor: en camino / entregado                      | ❌      | Sin persistencia                                              |
| 18    | Consultar pedidos del repartidor                       | ❌      | Mock; query Cassandra sin UI                                  |
| 19    | Admin: agregar productos al menú                       | ✅      | Mongo `addCatalogProduct`                                     |
| 20    | Marcar producto no disponible                          | ✅      | `setCatalogProductAvailability` (soft)                        |
| 21    | Editar producto (precio, promo, disponible)            | ✅      | `/admin/productos/[idProducto]`                               |
| 22    | Cliente: explorar catálogo                             | ✅      | Mongo; falta filtro por tipo en UI                            |
| 23–27 | Promociones CRUD / vigencia / monto mínimo             | ✅ N/A  | No aplica                                                     |
| 28    | Registrar repartidor                                   | ❌      | Sin UI                                                        |
| 29    | Disponibilidad repartidor en tiempo real               | ⚠️     | Solo lectura                                                  |
| 30    | Registrar cliente                                      | ❌      | `/signin` visual                                              |
| 31–32 | Seleccionar dirección en pedido                        | ✅      | `CartAddressPicker` en `/carrito`; `idDireccion` en checkout  |
| 33    | Eliminar dirección (sin pedido activo)                 | ✅      | `deleteDireccionEntrega` en `/usuario`; bloquea si hay pedido |
| 34    | Login email + contraseña                               | ✅      | `cuenta_app`; checkout exige sesión `usuario`                 |
| 35    | Editar perfil cliente                                  | ❌      | Solo datos de sesión                                          |
| 36    | Registrar direcciones de entrega                       | ✅      | CRUD en `/usuario` vía `saveDireccionAction`                    |


---

## Gaps técnicos transversales (`docs/GAPS.md`)


| Gap                                         | Estado | Prioridad sugerida                           |
| ------------------------------------------- | ------ | -------------------------------------------- |
| Passwords texto plano en `cuenta_app`       | ❌      | Alta                                         |
| Constraints de negocio en PostgreSQL        | ❌      | Alta                                         |
| Pantallas mock → queries scoped             | 🔄     | Alta (checkout ✅; pedidos por rol pendiente) |
| Detalles `[idPedido]` con autorización real | ❌      | Alta                                         |
| Consumo MongoDB (perfiles, order_documents) | ❌      | Media                                        |
| Redis frescura / TTL operacional            | ❌      | Media                                        |
| Cassandra en analytics / historial          | ❌      | Media                                        |
| Tests (mappers, seed, queries)              | ❌      | Media                                        |
| Snapshots Drizzle post-`0000`               | ⚠️     | Baja                                         |
| Sincronización multibase al crear pedido    | ❌      | Media (Fase 1.5)                             |


---

## Desalineaciones conocidas (documentar o corregir)


| Tema                      | Docs dicen                                      | Código hace                                                     |
| ------------------------- | ----------------------------------------------- | --------------------------------------------------------------- |
| Catálogo admin            | MongoDB fuente de verdad (`ADR-014`, `ADR-022`) | `/admin/productos` lee/escribe `restaurant_catalogs`            |
| Admin establecimientos    | Un admin = un local (`ADR-022`)                 | `/admin/local` scoped; `/admin/establecimientos` redirige       |
| Signin                    | Pantalla pública pendiente (`ADR-017`)          | Form sin Server Action; copy menciona Supabase Auth             |
| Componentes de pedido     | `PedidoConDetalle` (`types/domain.ts`)          | Listados/detalle por rol usan `MockPedidoVista`                 |
| Total vs fees en checkout | `pedido.total` transaccional                    | Total PG = solo ítems; envío/tarifa simulados en UI del carrito |
| Dirección en checkout     | Cliente elige dirección                         | Selector en `/carrito`; validación server con `getDireccionEntregaById` |
| Ruta `/usuario/direcciones` | Nav o ruta dedicada                           | CRUD integrado en `/usuario` (perfil)                           |


---

## Prioridad sugerida de implementación

1. [x] Commitear y migrar snapshot `detalle_pedido` + snapshot Drizzle `0002`
2. [x] Conectar checkout → `createPedidoFromCartSnapshot` (Server Action + auth `usuario`)
3. [ ] Migrar `[idPedido]` y listados en admin / usuario / repartidor a queries reales + autorización
4. [ ] Server Actions: cambio de estado pedido + cache Redis
5. [x] Direcciones: CRUD en `/usuario` + selector en checkout
6. [ ] Fase 1.5: sync post-checkout (Mongo `order_documents`, Redis status, Cassandra evento)
7. [x] Admin productos contra Mongo (CRUD) — ver ADR-022
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
/carrito (usuario) → CartAddressPicker → selectedDireccionId (Zustand)
     ↓
confirmCartAction → getDireccionEntregaById (ownership) → createPedidoFromCartSnapshot
     ↓
/carrito/confirmacion?idPedido=N → getPedidoById + ownership → ClearCartOnMount
```

Cuenta demo: `ana.perez@example.com` / `test123` (`id_cliente` en sesión).

---

## Flujo admin — catálogo y local (referencia)

```
/login (admin@burger.example) → /admin
     ↓
/admin/local
  AdminEstablecimientoForm → updateEstablecimientoAction
    → Postgres establecimiento
    → syncCatalogHeader (Mongo restaurant_catalogs)
    → upsertRestaurantProfile nombre (Mongo)
  AdminPerfilComercialForm → updateRestaurantProfileAction
    → Mongo restaurant_profiles
     ↓
/admin/productos (Server Component → getRestaurantCatalog)
  AdminProductList + AdminProductAvailabilityToggle
     ↓
/admin/productos/nuevo
  AdminProductForm → saveCatalogProductAction → addCatalogProduct
    → revalidatePath(/admin/productos, /restaurantes/[id])
    → redirect(/admin/productos/[idProducto])
     ↓
/admin/productos/[idProducto]
  AdminProductForm (edit) → saveCatalogProductAction → updateCatalogProduct
  Toggle → setProductAvailabilityAction (disponible true/false)
     ↓
/restaurantes/[idEstablecimiento]  ← catálogo público lee el mismo documento Mongo
```

Fotos de producto: campo `foto` (URL externa, típicamente CDN `images.rappi.com.ar`). No hay upload de archivos; el admin pega la URL en el formulario.

---

## Bitácora de avances


| Fecha      | Cambio                                                                                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-08 | Documento inicial generado desde análisis de docs + código + diff local                                                                                                                                  |
| 2026-06-08 | **Admin CRUD scoped:** `/admin/local`, catálogo Mongo, Server Actions, sync PG→Mongo, soft delete productos                                                                                              |
| 2026-06-08 | **Fase 1 checkout:** snapshot `detalle_pedido`, `createPedidoFromCartSnapshot`, `getDireccionesByCliente`, `confirmCartAction`, login `?next=`, gate auth en `/carrito`, confirmación real con ownership |
| 2026-06-08 | **IMPLEMENTACION.md:** sección admin operativo (archivos, Server Actions, `useActionState`, flujo catálogo/local, redirect post-alta)                                                                    |
| 2026-06-08 | **Direcciones usuario:** CRUD Postgres en `/usuario`, `lib/usuario/*`, selector en `/carrito`, `confirmCartAction` con `idDireccion` validado                                                            |
| 2026-06-08 | **Direcciones Suspense:** fetch movido a `UsuarioDirecciones` (server); UI interactiva en `UsuarioDireccionesView`; skeleton en `/usuario`                                                             |


---

## Cómo actualizar este archivo

1. Al cerrar un ítem, cambiar ❌/⚠️/🔄 por ✅ en la tabla correspondiente.
2. Si una ruta pasa de mock a real, moverla de sección en **Rutas**.
3. Agregar fila en **Bitácora de avances** con fecha y resumen breve.
4. Si se toma una decisión de diseño (ej. admin productos queda en Postgres), actualizar **Desalineaciones** y `docs/DECISIONES.md`.

