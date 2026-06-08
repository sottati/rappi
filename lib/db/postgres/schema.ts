import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { EstadoPedido, TipoCalificacion } from '@/types/domain'

const money = (name: string) =>
  numeric(name, { precision: 12, scale: 2, mode: 'number' })

export const estadoPedidoEnum = pgEnum('estado_pedido', [
  EstadoPedido.Pendiente,
  EstadoPedido.Confirmado,
  EstadoPedido.Preparando,
  EstadoPedido.EnCamino,
  EstadoPedido.Entregado,
  EstadoPedido.Cancelado,
])

export const tipoCalificacionEnum = pgEnum('tipo_calificacion', [
  TipoCalificacion.Establecimiento,
  TipoCalificacion.Repartidor,
])

export const appRolEnum = pgEnum('app_rol', ['admin', 'repartidor', 'usuario'])

export const establecimiento = pgTable('establecimiento', {
  idEstablecimiento: serial('id_establecimiento').primaryKey(),
  nombre: text('nombre').notNull(),
  tipo: text('tipo').notNull(),
  direccion: text('direccion').notNull(),
  email: text('email').notNull().unique(),
  telefono: text('telefono').notNull(),
})

export const producto = pgTable(
  'producto',
  {
    idProducto: serial('id_producto').primaryKey(),
    idEstablecimiento: integer('id_establecimiento')
      .notNull()
      .references(() => establecimiento.idEstablecimiento, { onDelete: 'cascade' }),
    nombre: text('nombre').notNull(),
    descripcion: text('descripcion').notNull(),
    precio: money('precio').notNull(),
    promocionPorcentaje: integer('promocion_porcentaje').notNull().default(0),
    disponible: boolean('disponible').notNull().default(true),
    foto: text('foto').notNull().default(''),
  },
  (table) => [index('producto_id_establecimiento_idx').on(table.idEstablecimiento)],
)

export const cliente = pgTable('cliente', {
  idCliente: serial('id_cliente').primaryKey(),
  nombre: text('nombre').notNull(),
  apellido: text('apellido').notNull(),
  email: text('email').notNull().unique(),
  telefono: text('telefono').notNull(),
})

export const direccionEntrega = pgTable(
  'direccion_entrega',
  {
    idDireccion: serial('id_direccion').primaryKey(),
    idCliente: integer('id_cliente')
      .notNull()
      .references(() => cliente.idCliente, { onDelete: 'cascade' }),
    calle: text('calle').notNull(),
    numero: text('numero').notNull(),
    ciudad: text('ciudad').notNull(),
    codigoPostal: text('codigo_postal').notNull(),
  },
  (table) => [index('direccion_entrega_id_cliente_idx').on(table.idCliente)],
)

export const repartidor = pgTable('repartidor', {
  idRepartidor: serial('id_repartidor').primaryKey(),
  nombre: text('nombre').notNull(),
  apellido: text('apellido').notNull(),
  email: text('email').notNull().unique(),
  telefono: text('telefono').notNull(),
  disponible: boolean('disponible').notNull().default(true),
  coordenadaActual: numeric('coordenada_actual', {
    precision: 10,
    scale: 6,
    mode: 'number',
  }).notNull(),
})

export const pedido = pgTable(
  'pedido',
  {
    idPedido: serial('id_pedido').primaryKey(),
    idCliente: integer('id_cliente')
      .notNull()
      .references(() => cliente.idCliente, { onDelete: 'restrict' }),
    idEstablecimiento: integer('id_establecimiento')
      .notNull()
      .references(() => establecimiento.idEstablecimiento, { onDelete: 'restrict' }),
    idRepartidor: integer('id_repartidor').references(() => repartidor.idRepartidor, {
      onDelete: 'set null',
    }),
    idDireccion: integer('id_direccion')
      .notNull()
      .references(() => direccionEntrega.idDireccion, { onDelete: 'restrict' }),
    fechaHora: timestamp('fecha_hora', { withTimezone: true }).notNull().defaultNow(),
    estado: estadoPedidoEnum('estado').notNull().default(EstadoPedido.Pendiente),
    total: money('total').notNull(),
  },
  (table) => [
    index('pedido_id_cliente_idx').on(table.idCliente),
    index('pedido_id_establecimiento_idx').on(table.idEstablecimiento),
    index('pedido_id_repartidor_idx').on(table.idRepartidor),
    index('pedido_estado_idx').on(table.estado),
  ],
)

export const detallePedido = pgTable(
  'detalle_pedido',
  {
    idDetalle: serial('id_detalle').primaryKey(),
    idPedido: integer('id_pedido')
      .notNull()
      .references(() => pedido.idPedido, { onDelete: 'cascade' }),
    idProductoCatalogo: integer('id_producto_catalogo').notNull(),
    nombreProducto: text('nombre_producto').notNull(),
    cantidad: integer('cantidad').notNull(),
    precioUnitario: money('precio_unitario').notNull(),
  },
  (table) => [
    index('detalle_pedido_id_pedido_idx').on(table.idPedido),
    index('detalle_pedido_id_producto_idx').on(table.idProductoCatalogo),
  ],
)

export const calificacion = pgTable(
  'calificacion',
  {
    idCalificacion: serial('id_calificacion').primaryKey(),
    idPedido: integer('id_pedido')
      .notNull()
      .references(() => pedido.idPedido, { onDelete: 'cascade' }),
    tipo: tipoCalificacionEnum('tipo').notNull(),
    puntaje: integer('puntaje').notNull(),
  },
  (table) => [index('calificacion_id_pedido_idx').on(table.idPedido)],
)

/** Cuentas de acceso a la app (auth de prueba; no reemplaza Supabase Auth). */
export const cuentaApp = pgTable('cuenta_app', {
  idCuenta: serial('id_cuenta').primaryKey(),
  email: text('email').notNull().unique(),
  contrasenia: text('contrasenia').notNull(),
  rol: appRolEnum('rol').notNull(),
  nombreVisible: text('nombre_visible').notNull(),
  idCliente: integer('id_cliente').references(() => cliente.idCliente, {
    onDelete: 'set null',
  }),
  idRepartidor: integer('id_repartidor').references(() => repartidor.idRepartidor, {
    onDelete: 'set null',
  }),
  idEstablecimiento: integer('id_establecimiento').references(
    () => establecimiento.idEstablecimiento,
    { onDelete: 'set null' },
  ),
})

export const establecimientoRelations = relations(establecimiento, ({ many }) => ({
  productos: many(producto),
  pedidos: many(pedido),
}))

export const productoRelations = relations(producto, ({ one }) => ({
  establecimiento: one(establecimiento, {
    fields: [producto.idEstablecimiento],
    references: [establecimiento.idEstablecimiento],
  }),
}))

export const clienteRelations = relations(cliente, ({ many }) => ({
  direcciones: many(direccionEntrega),
  pedidos: many(pedido),
}))

export const direccionEntregaRelations = relations(direccionEntrega, ({ one, many }) => ({
  cliente: one(cliente, {
    fields: [direccionEntrega.idCliente],
    references: [cliente.idCliente],
  }),
  pedidos: many(pedido),
}))

export const repartidorRelations = relations(repartidor, ({ many }) => ({
  pedidos: many(pedido),
}))

export const pedidoRelations = relations(pedido, ({ one, many }) => ({
  cliente: one(cliente, {
    fields: [pedido.idCliente],
    references: [cliente.idCliente],
  }),
  establecimiento: one(establecimiento, {
    fields: [pedido.idEstablecimiento],
    references: [establecimiento.idEstablecimiento],
  }),
  repartidor: one(repartidor, {
    fields: [pedido.idRepartidor],
    references: [repartidor.idRepartidor],
  }),
  direccion: one(direccionEntrega, {
    fields: [pedido.idDireccion],
    references: [direccionEntrega.idDireccion],
  }),
  detalles: many(detallePedido),
  calificaciones: many(calificacion),
}))

export const detallePedidoRelations = relations(detallePedido, ({ one }) => ({
  pedido: one(pedido, {
    fields: [detallePedido.idPedido],
    references: [pedido.idPedido],
  }),
}))

export const calificacionRelations = relations(calificacion, ({ one }) => ({
  pedido: one(pedido, {
    fields: [calificacion.idPedido],
    references: [pedido.idPedido],
  }),
}))

export const cuentaAppRelations = relations(cuentaApp, ({ one }) => ({
  cliente: one(cliente, {
    fields: [cuentaApp.idCliente],
    references: [cliente.idCliente],
  }),
  repartidor: one(repartidor, {
    fields: [cuentaApp.idRepartidor],
    references: [repartidor.idRepartidor],
  }),
  establecimiento: one(establecimiento, {
    fields: [cuentaApp.idEstablecimiento],
    references: [establecimiento.idEstablecimiento],
  }),
}))

export type EstablecimientoSelect = typeof establecimiento.$inferSelect
export type ProductoSelect = typeof producto.$inferSelect
export type ClienteSelect = typeof cliente.$inferSelect
export type DireccionEntregaSelect = typeof direccionEntrega.$inferSelect
export type RepartidorSelect = typeof repartidor.$inferSelect
export type PedidoSelect = typeof pedido.$inferSelect
export type DetallePedidoSelect = typeof detallePedido.$inferSelect
export type CalificacionSelect = typeof calificacion.$inferSelect
export type CuentaAppSelect = typeof cuentaApp.$inferSelect
