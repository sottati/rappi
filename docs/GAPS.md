# Gaps y roadmap

Estado actual: la base tecnica ya consume clouds con un dataset demo multibase.
Hay App Router por rol, componentes compartidos, tipos de dominio, clientes por
motor, mocks, queries reales y seed canónico. El trabajo pendiente principal es
reemplazar pantallas mock restantes, endurecer constraints/seguridad y completar
flujos de UI.

## Gaps de documentacion cerrados

- La tematica Rappi queda documentada en `AGENTS.md`, `README.md` y
  `docs/ARQUITECTURA.md`.
- El reparto de datos por motor queda explicitado en `docs/MODELO_DATOS.md`.
- Los modelos fisicos iniciales quedan documentados por motor:
  `docs/POSTGRES_MODELO_FISICO.md`, `docs/CASSANDRA_MODELO_FISICO.cql`,
  `docs/MONGODB_MODELO_FISICO.md`, `docs/REDIS_MODELO_FISICO.md`.
- El flujo de consumo server -> queries -> UI queda documentado como regla.
- `cuenta_app` queda documentada como identidad interna permanente.
- El dataset demo multibase queda documentado en `docs/MODELO_DATOS.md` y
  `docs/HANDOFF.md`.

## Gaps tecnicos abiertos

| Gap                                      | Impacto                                                            | Proximo paso                                                       |
| ---------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Passwords en texto plano en `cuenta_app` | Riesgo si se trata como produccion                                 | guardar hash y validar con comparacion segura                      |
| Constraints de negocio incompletas       | Datos invalidos pueden entrar por seed/manual SQL                  | agregar checks de rangos, montos positivos y FK por rol            |
| Pantallas navegadas incompletas o mock   | Parte de la demo todavia no muestra datos reales                   | migrar rutas pendientes al patron Server Component -> query scoped |
| Detalles de pedido por rol               | Algunas rutas `[idPedido]` siguen con mocks o autorizacion parcial | usar `getPedidoById` + check contra id de sesion                   |
| Proyecciones MongoDB poco consumidas     | Los documentos existen pero pocas pantallas los leen               | agregar queries para catalogos, perfiles y snapshots               |
| Redis sin frescura por ubicacion         | GEO no expira por miembro                                          | agregar key auxiliar `delivery:location:fresh:<id>`                |
| Tests ausentes                           | Cambios futuros pueden romper contratos de queries/seed            | agregar tests unitarios de mappers y smoke tests de seed           |
| Snapshot Drizzle `0001` faltante         | Futuras migraciones pueden duplicar `cuenta_app`                   | regenerar/commitear snapshot de Drizzle correspondiente            |

## Prioridad sugerida

1. Hashear `cuenta_app.contrasenia`.
2. Agregar constraints de dominio en PostgreSQL.
3. Migrar rutas de detalle/listados pendientes a queries reales y scoped.
4. Consumir MongoDB en pantallas donde aporte valor documental.
5. Usar Cassandra en analytics/historicos.
6. Mejorar Redis con frescura/TTL operacional.
7. Agregar tests de queries, mappers y seed.

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
