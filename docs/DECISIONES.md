# Registro de decisiones de diseño

Cada entrada sigue formato ligero de ADR (Architecture Decision Record).

---

## ADR-001: Separar cada motor de DB en su propio modulo

- **Estado:** Aceptada
- **Contexto:** El proyecto integra 4 motores de DB distintos: PostgreSQL via Supabase, Redis, MongoDB y Cassandra via DataStax Astra DB. Cada uno tiene su propio driver, esquema de conexion y semantica de queries.
- **Decision:** Cada motor vive en `lib/db/<motor>/` con su propio `client.ts`, `queries.ts` y `types.ts`.
- **Consecuencias:** +Modularidad, +facil de testear por separado, +simple de desactivar/agregar motores. Como contra, hay codigo repetido en la inicializacion de cada cliente, pero se aisla en cada modulo.

---

## ADR-002: Server Components por defecto

- **Estado:** Aceptada
- **Contexto:** Next.js App Router permite Server y Client Components.
- **Decision:** Toda pagina y componente es Server Component por defecto. Solo se marca `"use client"` cuando necesita estado, efectos, o acceso a APIs del navegador.
- **Consecuencias:** -Menos JavaScript en el cliente, +rendimiento, +seguridad (las queries a DB nunca se exponen al bundle del cliente). Los componentes que solo renderizan datos (tablas, cards, listas) siguen siendo servidor.

---

## ADR-003: No hardcodear credenciales

- **Estado:** Aceptada
- **Contexto:** Las bases de datos son servicios cloud con credenciales sensibles.
- **Decision:** Usar variables de entorno (`process.env.*`). Crear `.env.example` con valores placeholder. `.env` y `.env.local` estan en `.gitignore`.
- **Consecuencias:** +Seguridad, +portabilidad (cada miembro usa sus propias credenciales). Como contra, hay que mantener el `.env.example` sincronizado con las variables reales.

---

## ADR-004: Funciones de acceso a datos reutilizables y tipadas

- **Estado:** Aceptada
- **Contexto:** Las consultas a DB no deben estar acopladas a componentes de UI.
- **Decision:** Cada motor exporta funciones pequenas y tipadas que reciben parametros y devuelven datos. Los componentes las importan y llaman, sin saber que motor hay detras.
- **Consecuencias:** +Testeabilidad, +cambio de motor sin tocar UI, +claridad. Las funciones pueden componerse si un componente necesita datos de multiples motores.

---

## ADR-005: Manejo explicito de errores de conexion

- **Estado:** Aceptada
- **Contexto:** Las conexiones cloud pueden fallar (timeout, auth, red).
- **Decision:** Cada funcion devuelve un objeto con `{ data, error }` en lugar de lanzar excepciones. La UI renderiza el estado de error si `error` no es null.
- **Consecuencias:** +Predecible, +la UI puede mostrar mensajes amigables, -un poco mas de boilerplate en las funciones de acceso.

---

## ADR-006: Uso de shadcn/ui + Hugeicons

- **Estado:** Aceptada
- **Contexto:** Se necesita una libreria de componentes base y una de iconos.
- **Decision:** Usar shadcn/ui (componentes copiados al proyecto, personalizables) con Hugeicons como icon library configurada via `components.json`.
- **Consecuencias:** +Total control sobre los componentes (no es una dependencia oculta), +tema consistente via CSS variables, -hay que mantener los componentes actualizados manualmente si se quiere actualizar.

---

## ADR-007: Cassandra con DataStax Astra DB

- **Estado:** Aceptada
- **Contexto:** Se necesita una tercera base no relacional para modelar datos de alta escritura y consultas por clave, como eventos de pedido o tracking historico.
- **Decision:** Usar Cassandra via DataStax Astra DB como proveedor cloud administrado.
- **Consecuencias:** +Evita operar clusters Cassandra propios, +mantiene modelo CQL compatible con Cassandra, +sirve para explicar particionamiento y consultas orientadas a escritura. Como contra, hay que configurar secure connect bundle y credenciales locales.

---

## ADR-008: Evitar HTTP interno para consultas de DB

- **Estado:** Aceptada
- **Contexto:** Next.js App Router permite leer datos directamente desde Server Components. Crear endpoints internos para que la misma app consulte sus propias DB agrega una capa extra.
- **Decision:** Las pantallas consultan datos desde Server Components llamando a `lib/db/<motor>/queries`. `app/api/` se reserva para webhooks, integraciones externas, exports o health checks.
- **Consecuencias:** +Menos boilerplate, +menos superficie expuesta, +flujo mas simple para explicar. Como contra, si aparece un consumidor externo habra que crear un Route Handler especifico.

---

## ADR-009: Mocks por motor como fixture opt-in

- **Estado:** Aceptada
- **Contexto:** La entrega debe usar bases reales. Los mocks siguen sirviendo como fixture local puntual, pero no deben ser el comportamiento por defecto.
- **Decision:** Cada motor puede conservar `mock.ts` con datos tipados. Las funciones en `queries.ts` solo devuelven mocks cuando `MOCK_DB=true`; sin esa variable o con `MOCK_DB=false`, usan clientes reales.
- **Consecuencias:** +La demo falla rapido si faltan credenciales, +evita pantallas aparentemente integradas con datos falsos, +mantiene fixtures para desarrollo aislado. Como contra, levantar el proyecto sin servicios cloud requiere activar mocks explicitamente.

---

## ADR-010: El DLR define el dominio relacional

- **Estado:** Aceptada
- **Contexto:** El equipo definio el modelo relacional con tablas en castellano para la operatoria tipo Rappi.
- **Decision:** Los tipos compartidos y queries PostgreSQL usan ese vocabulario: `Pedido`, `Establecimiento`, `Repartidor`, `DetallePedido`, etc.
- **Consecuencias:** +La implementacion coincide con la documentacion de entrega, +reduce traducciones mentales entre diagrama y codigo. Como contra, integraciones no relacionales pueden seguir usando nombres tecnicos propios si modelan otro tipo de dato.

---

## ADR-011: Routing por rol visible

- **Estado:** Aceptada
- **Contexto:** La aplicacion tendra tres roles principales: admin como duenio/gestor de establecimiento, repartidor y usuario consumidor final. Cada rol tiene permisos y vistas distintas.
- **Decision:** Usar rutas explicitas por rol: `/admin`, `/repartidor`, `/usuario`. Cada rol tiene su propio `layout.tsx` y sus paginas. No se crea una seccion navegable `/clientes`; los clientes se muestran como datos asociados a pedidos o perfil de usuario.
- **Consecuencias:** +Permisos y navegacion faciles de explicar, +layouts especificos por rol, +URLs claras para la demo. Como contra, algunas pantallas comparten componentes pero viven en rutas distintas, por lo que hay que evitar duplicar UI moviendo piezas comunes a `components/features`.

---

## ADR-012: PostgreSQL como fuente de verdad relacional/transaccional

- **Estado:** Aceptada
- **Contexto:** El TPO necesita mostrar varias bases elegidas segun el tipo de dato. PostgreSQL sigue siendo el mejor motor para entidades con relaciones fuertes, constraints y transacciones.
- **Decision:** PostgreSQL/Supabase mantiene la fuente de verdad relacional/transaccional: establecimientos, clientes, direcciones, repartidores, pedidos, detalles, calificaciones y cuentas internas. Los datos documentales del catalogo publico no se modelan primero aca; viven en MongoDB.
- **Consecuencias:** +Consistencia clara para pedidos y permisos, +facil de explicar en la defensa, +queries transaccionales tipadas con Drizzle. Como contra, los flujos que cruzan catalogo y pedido deben coordinar MongoDB con PostgreSQL.

---

## ADR-013: Cassandra modelada por query

- **Estado:** Aceptada
- **Contexto:** Cassandra no esta pensada para joins ni consultas ad hoc como PostgreSQL. Conviene partir de las preguntas que la app necesita responder.
- **Decision:** Las tablas Cassandra se modelan por patron de acceso: pedidos por cliente, pedidos por local, pedidos por repartidor, metricas diarias, calificaciones y rankings. Se acepta duplicar datos descriptivos como nombres o totales para evitar joins.
- **Consecuencias:** +Lecturas rapidas y explicables, +muestra correctamente el criterio NoSQL, -requiere coordinar la escritura de datos historicos/denormalizados.

---

## ADR-014: MongoDB como fuente documental del catalogo

- **Estado:** Aceptada
- **Contexto:** La materia prioriza elegir la base adecuada para cada dato. El catalogo de un local se lee naturalmente como documento completo: categorias, productos embebidos, tags, opciones, fotos y metadata visual.
- **Decision:** MongoDB es fuente de verdad para `restaurant_catalogs`, `restaurant_profiles`, reviews enriquecidas, actividad y documentos flexibles. Los documentos guardan ids compartidos (`idPedido`, `idCliente`, `idEstablecimiento`, etc.) para vincularse con flujos relacionales, pero el catalogo publico no es una proyeccion subordinada de PostgreSQL.
- **Consecuencias:** +MongoDB tiene un rol fuerte y defendible para la entrega, +muestra modelado documental real con datos embebidos, +evita joins en lecturas de catalogo/detalle. Como contra, los pedidos deben copiar al cierre los importes/items necesarios para mantener trazabilidad transaccional en PostgreSQL.

---

## ADR-015: Redis no es fuente de verdad

- **Estado:** Aceptada
- **Contexto:** Redis es ideal para baja latencia, TTL, cache y geolocalizacion, pero no para persistir el ciclo completo de pedidos.
- **Decision:** Redis guarda estado vivo: ubicacion actual, disponibilidad rapida y cache de estado de pedido. Si una key expira o se pierde, se reconstruye desde PostgreSQL o historico/eventos.
- **Consecuencias:** +Menor latencia para vistas operativas, +fallos recuperables, -hay que definir TTLs y fallback al conectar datos reales.

---

## ADR-016: Documentar gaps antes de seguir escalando codigo

- **Estado:** Aceptada
- **Contexto:** El repo ya tiene base tecnica, pero faltaban gaps explicitados para orientar el trabajo siguiente.
- **Decision:** Mantener `docs/GAPS.md` como backlog tecnico/documental de alto nivel: integraciones cloud, pantallas pendientes, auth, seeds, esquemas fisicos e indices.
- **Consecuencias:** +El equipo sabe que falta, +los agentes pueden continuar sin pedir contexto oral, -hay que actualizar el documento cuando se cierre un gap.

---

## ADR-017: Rutas publicas de autenticacion (`/login`, `/signin`)

- **Estado:** Aceptada
- **Contexto:** Se necesita un ingreso simple por rol para la demo y para filtrar pantallas por entidad del dominio.
- **Decision:** Exponer `/login` como inicio de sesion funcional contra `cuenta_app` mediante Server Actions. Mantener `/signin` como pantalla publica de registro visual hasta definir alta real de cuentas.
- **Consecuencias:** +Login suficiente para demo, +layouts protegidos por rol, +no se depende de Supabase Auth. Como contra, la seguridad de passwords queda a cargo del proyecto y debe mejorarse con hashing.

---

## ADR-018: `cuenta_app` como identidad interna permanente

- **Estado:** Aceptada
- **Contexto:** El proyecto necesita vincular usuarios de la app con entidades del DLR (`cliente`, `repartidor`, `establecimiento`) y el equipo decidio no implementar Supabase Auth.
- **Decision:** Mantener `cuenta_app` en PostgreSQL como tabla permanente de identidad interna. Cada fila tiene `email`, `contrasenia`, `rol`, `nombre_visible` y una FK nullable segun rol: `id_cliente`, `id_repartidor` o `id_establecimiento`.
- **Consecuencias:** +Modelo de permisos explicable, +queries por rol pueden usar ids del DLR, +no se agrega otro proveedor de auth. Como contra, hay que implementar hashing, validaciones por rol y controles de sesion propios.

---

## ADR-019: Seed demo multibase con ids compartidos

- **Estado:** Aceptada
- **Contexto:** El proyecto usa cuatro motores y necesita datos consistentes para mostrar la demo. Si cada motor inventa ids propios, la UI no puede combinar datos de forma confiable.
- **Decision:** `scripts/seed-test-users.ts` carga datos en cada motor segun su responsabilidad y reutiliza ids compartidos para vincular documentos, pedidos y metricas. PostgreSQL conserva las entidades transaccionales; MongoDB conserva el catalogo y documentos flexibles. Los motores no relacionales se omiten si no tienen variables de entorno configuradas.
- **Consecuencias:** +Dataset reproducible, +ids consistentes entre motores, +facil validar la demo de punta a punta. Como contra, el seed crece en responsabilidad y debe mantenerse cuando cambie el modelo.

---

## ADR-020: Zustand solo para carrito cliente

- **Estado:** Aceptada
- **Contexto:** El carrito debe actualizarse en tiempo real entre navbar, catalogo, detalle de producto y checkout. Ese estado es temporal de UI y no es fuente de verdad de pedidos.
- **Decision:** Usar Zustand con persistencia local (`localStorage`) solo para el carrito publico (`lib/cart/store.ts`). Mantener la regla de no usar stores globales para datos de DB, sesiones, pedidos persistidos ni entidades del dominio.
- **Consecuencias:** +Menos boilerplate que Context, +navbar y checkout se sincronizan facil, +el carrito sobrevive refresh. Como contra, hay que evitar que el store se expanda a responsabilidades de backend; la compra real debe persistirse luego via Server Action/PostgreSQL.

---

## ADR-021: `detalle_pedido` como snapshot transaccional

- **Estado:** Aceptada
- **Contexto:** El catalogo publico y sus productos viven en MongoDB como fuente documental. Mantener `detalle_pedido.id_producto` como FK obligatoria contra PostgreSQL fuerza a duplicar el catalogo en dos motores y contradice el reparto de responsabilidades.
- **Decision:** `detalle_pedido` debe guardar un snapshot del item comprado: `id_producto_catalogo`, `nombre_producto`, `cantidad` y `precio_unitario`. Ese snapshot se persiste al confirmar el pedido y queda como evidencia transaccional aunque el catalogo MongoDB cambie luego. En esta etapa, checkout no agrega una query extra para revalidar los productos contra MongoDB: si el item llego al carrito desde el catalogo, se considera valido para la demo.
- **Consecuencias:** +Evita duplicar el catalogo como fuente de verdad en PostgreSQL, +preserva trazabilidad de precios/nombres al momento de compra, +simplifica checkout. Como contra, las pantallas historicas deben usar el snapshot del detalle y no asumir que pueden reconstruir el item desde `producto`.

---

## ADR-022: Panel admin scoped 1:1 con establecimiento

- **Estado:** Aceptada
- **Contexto:** Cada cuenta `admin` en `cuenta_app` tiene `id_establecimiento`. El panel debe operar solo sobre ese local, no listar ni editar establecimientos ajenos.
- **Decision:** El admin gestiona un unico local via `/admin/local` (datos operativos + perfil comercial) y rutas hijas scoped (`/admin/productos`, `/admin/pedidos`). `/admin/establecimientos` redirige a `/admin/local`. Toda mutacion valida `session.idEstablecimiento` en Server Actions (`lib/admin/scope.ts`).
- **Consecuencias:** +Modelo de permisos simple y explicable, +UI alineada al DLR. Como contra, alta de nuevos establecimientos queda fuera del panel (seed o rol futuro).

---

## ADR-023: CRUD admin de catalogo y perfil en MongoDB

- **Estado:** Aceptada
- **Contexto:** ADR-014 define MongoDB como fuente del catalogo publico. El panel admin editaba la tabla `producto` en PostgreSQL, desalineada con `/restaurantes/[id]`.
- **Decision:** El admin CRUD de productos opera sobre `restaurant_catalogs` (MongoDB): alta, edicion, soft delete via `disponible: false`. El perfil enriquecido del local vive en `restaurant_profiles`. Los datos core (`nombre`, `tipo`, `direccion`, `telefono`) se editan en PostgreSQL `establecimiento`; al guardar se sincroniza `nombre`/`tipo` al header del catalogo Mongo. El email del establecimiento queda read-only en UI (unique en PG). La tabla `producto` en Postgres queda legacy del seed; no se usa en el panel admin.
- **Consecuencias:** +Cambios del admin se ven en el catalogo publico, +demuestra multibase con responsabilidades claras. Como contra, hay que mantener sync acotado PG→Mongo en nombre/tipo del catalogo.

---

## ADR-024: Redis como pool operacional de pedidos disponibles

- **Estado:** Aceptada
- **Contexto:** El flujo operativo necesita que repartidores vean rapido pedidos que el comercio ya acepto y que solo un repartidor pueda tomar cada pedido. PostgreSQL sigue siendo la fuente de verdad del pedido, pero no conviene usarlo como mecanismo de carrera/descubrimiento rapido.
- **Decision:** El comercio confirma/rechaza desde Postgres. Cuando un pedido pasa a `confirmado` o `preparando`, se publica su id en Redis (`delivery:available_orders`). Cuando un repartidor lo toma, primero reclama `order:claim:<idPedido>` con `SET NX`; si gana, se asigna `pedido.id_repartidor` en Postgres y se remueve del pool Redis. Los cambios de estado tambien actualizan `order:status:<idPedido>`.
- **Consecuencias:** +Redis aporta baja latencia y claim atomico, +Postgres mantiene consistencia e historial operativo, +el flujo queda explicable para la demo. Como contra, si Redis pierde el pool se puede reconstruir desde Postgres con pedidos `confirmado/preparando` sin repartidor.

---

## ADR-025: Proyecciones a Cassandra post-commit, best-effort, con read-modify-write

- **Estado:** Aceptada
- **Contexto:** Las tablas Cassandra (ADR-013) se poblaban solo desde el seed. Los flujos reales (crear pedido, confirmar/cancelar, claim, entregar, calificar) debian alimentar el keyspace. La app usa la Data API de Astra (`@datastax/astra-db-ts`), que no soporta columnas `counter` ni incrementos atomicos (`$inc`); usar counters CQL exigiria un segundo cliente (`cassandra-driver` + secure bundle) y reescribir las tablas de metricas (counter solo admite bigint).
- **Decision:** Cada Server Action proyecta a Cassandra despues del commit en Postgres via `lib/db/cassandra/projections.ts`. Las proyecciones son best-effort: si fallan se loguea y la accion devuelve exito igual (Postgres es la fuente de verdad; Cassandra es vista de lectura con consistencia eventual). Las metricas se actualizan con read-modify-write (`findOne` + `insertOne` upsert, mismo primary key sobreescribe). El ranking mensual, con `total_pedidos` como clustering key, se actualiza con delete + insert. Al calificar, se recalcula el promedio mensual del local desde `calificaciones_local` y se reescribe `ranking_locales_por_mes.promedio_calificacion`. Las transiciones de estado en `pedidos_por_local_estado` (estado en la partition key) hacen move de particion: delete en la particion vieja + insert en la nueva. Con `MOCK_DB=true` las proyecciones son no-op. El bucket de `metricas_globales_diarias` es el mes (`YYYY-MM`) y `/admin/analytics` lo selecciona por query param `?mes=YYYY-MM`. En `/admin`, los charts semanales leen `metricas_diarias_local` y fusionan `pedidos_por_local` como fallback cuando la metrica agregada todavia no refleja pedidos recientes; la serie se normaliza a los ultimos 7 dias terminando hoy, y el KPI de calificacion usa el ranking del mes corriente.
- **Consecuencias:** +El keyspace se alimenta desde transacciones reales de la app, +un solo cliente Cassandra, +patron defendible (proyeccion CQRS-like). Como contras aceptados: el read-modify-write tiene condiciones de carrera bajo concurrencia (en produccion irian counters CQL: `UPDATE ... SET x = x + 1`, vistos en la teoria Clase 5); `locales_activos`/`repartidores_activos` no se mantienen en vivo (quedan del seed o en su valor inicial).
