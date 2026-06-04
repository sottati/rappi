# Gaps y roadmap

Estado al relevar el repo: la base tecnica esta creada. Hay App Router por rol,
componentes compartidos, tipos de dominio, clientes por motor, mocks y queries
iniciales. El trabajo pendiente es cerrar integraciones reales y completar
pantallas.

## Gaps de documentacion cerrados

- La tematica Rappi queda documentada en `AGENTS.md`, `README.md` y
  `docs/ARQUITECTURA.md`.
- El reparto de datos por motor queda explicitado en `docs/MODELO_DATOS.md`.
- Los modelos fisicos iniciales quedan documentados por motor:
  `docs/POSTGRES_MODELO_FISICO.md`, `docs/CASSANDRA_MODELO_FISICO.cql`,
  `docs/MONGODB_MODELO_FISICO.md`, `docs/REDIS_MODELO_FISICO.md`.
- El flujo de consumo server -> queries -> UI queda documentado como regla.
- Se elimina la contradiccion documental de `/login`: no se crea hasta que el
  equipo tome una decision explicita.

## Gaps tecnicos abiertos

| Gap                                    | Impacto                                                     | Proximo paso                                                   |
| -------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------- |
| Credenciales cloud reales no validadas | Las queries reales pueden fallar aunque los mocks funcionen | configurar `.env.local`, probar `MOCK_DB=false` por motor      |
| Pantallas navegadas incompletas        | La sidebar apunta a rutas todavia no implementadas          | crear paginas por rol siguiendo patron existente               |
| Auth real pendiente                    | Los filtros por usuario/rol son mock                        | integrar Supabase Auth o documentar alternativa                |
| Seeds/datos demo por motor             | Dificil demostrar integracion real de punta a punta         | crear scripts o migraciones de seed coherentes entre motores   |
| Modelos fisicos sin validar en cloud   | El DDL/doc puede requerir ajustes del proveedor             | ejecutar Supabase/Astra/Mongo/Redis reales con `MOCK_DB=false` |
| Proyecciones MongoDB sin implementar   | MongoDB queda documentado pero no consultable desde la UI    | agregar mocks/queries para catalogos, perfiles y snapshots     |
| Redis sin politica completa de TTL     | Puede haber estados vivos obsoletos                         | implementar key auxiliar de frescura para ubicacion            |
| Tests ausentes                         | Cambios futuros pueden romper contratos de queries          | agregar tests unitarios de mappers y mocks                     |

## Prioridad sugerida

1. Validar modelos fisicos contra servicios cloud reales.
2. Conectar Supabase/PostgreSQL real y validar DLR con Drizzle.
3. Crear seeds/datos demo coherentes entre motores.
4. Implementar proyecciones MongoDB para catalogos, perfiles, snapshots de
   pedidos, reviews y actividad.
5. Crear pantallas principales pendientes: pedidos admin, pedidos repartidor,
   establecimientos usuario.
6. Integrar Cassandra para historiales/analytics.
7. Integrar Redis para disponibilidad/ubicacion/estado vivo.
8. Reemplazar sesion mock por auth real si el alcance final lo requiere.

## Criterio para pasar a desarrollo

Antes de implementar una pantalla nueva debe estar claro:

- que rol la usa;
- que pregunta responde;
- que motor devuelve los datos;
- que query existe o hay que crear;
- que mock acompania esa query;
- que estado de error/vacio renderiza.

Si no se puede responder eso, primero documentar la decision en
`docs/DECISIONES.md` o ampliar `docs/MODELO_DATOS.md`.
