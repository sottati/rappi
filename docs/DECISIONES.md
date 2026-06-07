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

## ADR-009: Mocks por motor hasta conectar DB cloud

- **Estado:** Aceptada
- **Contexto:** La UI necesita avanzar antes de tener credenciales y esquemas finales de Supabase, Redis, MongoDB y DataStax.
- **Decision:** Cada motor puede tener `mock.ts` con datos tipados. Las funciones en `queries.ts` devuelven mocks cuando `MOCK_DB=true`.
- **Consecuencias:** +Permite desarrollar pantallas sin credenciales, +mantiene el contrato real de queries, +facilita demos tempranas. Como contra, hay que mantener los mocks parecidos al esquema real para no generar una falsa sensacion de integracion terminada.

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

## ADR-012: PostgreSQL como fuente de verdad del DLR

- **Estado:** Aceptada
- **Contexto:** El TPO necesita mostrar varias bases, pero el dominio base de Rappi ya esta definido como DLR con entidades y relaciones fuertes.
- **Decision:** PostgreSQL/Supabase mantiene la fuente de verdad relacional: establecimientos, productos, clientes, direcciones, repartidores, pedidos, detalles y calificaciones. Los motores NoSQL pueden duplicar, enriquecer o materializar documentos derivados, pero no reemplazan la integridad transaccional del DLR.
- **Consecuencias:** +Consistencia clara, +facil de explicar en la defensa, +queries principales tipadas con Drizzle. Como contra, algunos datos se duplican en Cassandra/MongoDB y requieren sincronizacion desde la fuente transaccional.

---

## ADR-013: Cassandra modelada por query

- **Estado:** Aceptada
- **Contexto:** Cassandra no esta pensada para joins ni consultas ad hoc como PostgreSQL. Conviene partir de las preguntas que la app necesita responder.
- **Decision:** Las tablas Cassandra se modelan por patron de acceso: pedidos por cliente, pedidos por local, pedidos por repartidor, metricas diarias, calificaciones y rankings. Se acepta duplicar datos descriptivos como nombres o totales para evitar joins.
- **Consecuencias:** +Lecturas rapidas y explicables, +muestra correctamente el criterio NoSQL, -requiere sincronizar datos derivados desde la fuente transaccional.

---

## ADR-014: MongoDB como capa documental enriquecida del DLR

- **Estado:** Aceptada
- **Contexto:** La materia prioriza bases NoSQL y el reparto anterior dejaba a MongoDB limitado a reviews y actividad. Al mismo tiempo, el DLR consolidado necesita seguir siendo la base transaccional para preservar claves, relaciones y consistencia.
- **Decision:** MongoDB no reemplaza el DLR, pero materializa proyecciones documentales enriquecidas derivadas de PostgreSQL: catalogos de establecimientos con productos embebidos, perfiles flexibles de locales, snapshots documentales de pedidos, perfiles/preferencias de usuario, reviews enriquecidas y actividad. Los documentos guardan ids del DLR (`idPedido`, `idCliente`, `idEstablecimiento`, etc.) y pueden duplicar nombres, fotos, direcciones o precios como snapshot de lectura.
- **Consecuencias:** +MongoDB tiene un rol mas fuerte y defendible para la entrega, +muestra modelado documental real con datos embebidos, +evita joins en lecturas de catalogo/detalle. Como contra, aparece sincronizacion entre PostgreSQL y MongoDB; hay que explicar que los documentos son derivados y que la verdad transaccional sigue en PostgreSQL.

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

## ADR-019: Seed demo multibase derivado desde PostgreSQL

- **Estado:** Aceptada
- **Contexto:** El proyecto usa cuatro motores y necesita datos consistentes para mostrar la demo. Si cada motor inventa ids propios, la UI no puede combinar datos de forma confiable.
- **Decision:** `scripts/seed-test-users.ts` carga primero PostgreSQL, resuelve los ids reales del DLR y proyecta esos datos a MongoDB, Redis y Cassandra. PostgreSQL es obligatorio; los motores no relacionales se omiten si no tienen variables de entorno configuradas.
- **Consecuencias:** +Dataset reproducible, +ids consistentes entre motores, +facil validar la demo de punta a punta. Como contra, el seed crece en responsabilidad y debe mantenerse cuando cambie el modelo.

---

## ADR-020: Zustand solo para carrito cliente

- **Estado:** Aceptada
- **Contexto:** El carrito debe actualizarse en tiempo real entre navbar, catalogo, detalle de producto y checkout. Ese estado es temporal de UI y no es fuente de verdad de pedidos.
- **Decision:** Usar Zustand con persistencia local (`localStorage`) solo para el carrito publico (`lib/cart/store.ts`). Mantener la regla de no usar stores globales para datos de DB, sesiones, pedidos persistidos ni entidades del dominio.
- **Consecuencias:** +Menos boilerplate que Context, +navbar y checkout se sincronizan facil, +el carrito sobrevive refresh. Como contra, hay que evitar que el store se expanda a responsabilidades de backend; la compra real debe persistirse luego via Server Action/PostgreSQL.
