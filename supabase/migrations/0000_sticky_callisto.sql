CREATE TYPE "public"."estado_pedido" AS ENUM('pendiente', 'confirmado', 'preparando', 'en_camino', 'entregado', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."tipo_calificacion" AS ENUM('establecimiento', 'repartidor');--> statement-breakpoint
CREATE TABLE "calificacion" (
	"id_calificacion" serial PRIMARY KEY NOT NULL,
	"id_pedido" integer NOT NULL,
	"tipo" "tipo_calificacion" NOT NULL,
	"puntaje" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cliente" (
	"id_cliente" serial PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"apellido" text NOT NULL,
	"email" text NOT NULL,
	"telefono" text NOT NULL,
	CONSTRAINT "cliente_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "detalle_pedido" (
	"id_detalle" serial PRIMARY KEY NOT NULL,
	"id_pedido" integer NOT NULL,
	"id_producto" integer NOT NULL,
	"cantidad" integer NOT NULL,
	"precio_unitario" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "direccion_entrega" (
	"id_direccion" serial PRIMARY KEY NOT NULL,
	"id_cliente" integer NOT NULL,
	"calle" text NOT NULL,
	"numero" text NOT NULL,
	"ciudad" text NOT NULL,
	"codigo_postal" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "establecimiento" (
	"id_establecimiento" serial PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"tipo" text NOT NULL,
	"direccion" text NOT NULL,
	"email" text NOT NULL,
	"telefono" text NOT NULL,
	CONSTRAINT "establecimiento_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "pedido" (
	"id_pedido" serial PRIMARY KEY NOT NULL,
	"id_cliente" integer NOT NULL,
	"id_establecimiento" integer NOT NULL,
	"id_repartidor" integer,
	"id_direccion" integer NOT NULL,
	"fecha_hora" timestamp with time zone DEFAULT now() NOT NULL,
	"estado" "estado_pedido" DEFAULT 'pendiente' NOT NULL,
	"total" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "producto" (
	"id_producto" serial PRIMARY KEY NOT NULL,
	"id_establecimiento" integer NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text NOT NULL,
	"precio" numeric(12, 2) NOT NULL,
	"promocion_porcentaje" integer DEFAULT 0 NOT NULL,
	"disponible" boolean DEFAULT true NOT NULL,
	"foto" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repartidor" (
	"id_repartidor" serial PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"apellido" text NOT NULL,
	"email" text NOT NULL,
	"telefono" text NOT NULL,
	"disponible" boolean DEFAULT true NOT NULL,
	"coordenada_actual" numeric(10, 6) NOT NULL,
	CONSTRAINT "repartidor_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "calificacion" ADD CONSTRAINT "calificacion_id_pedido_pedido_id_pedido_fk" FOREIGN KEY ("id_pedido") REFERENCES "public"."pedido"("id_pedido") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "detalle_pedido" ADD CONSTRAINT "detalle_pedido_id_pedido_pedido_id_pedido_fk" FOREIGN KEY ("id_pedido") REFERENCES "public"."pedido"("id_pedido") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "detalle_pedido" ADD CONSTRAINT "detalle_pedido_id_producto_producto_id_producto_fk" FOREIGN KEY ("id_producto") REFERENCES "public"."producto"("id_producto") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "direccion_entrega" ADD CONSTRAINT "direccion_entrega_id_cliente_cliente_id_cliente_fk" FOREIGN KEY ("id_cliente") REFERENCES "public"."cliente"("id_cliente") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_id_cliente_cliente_id_cliente_fk" FOREIGN KEY ("id_cliente") REFERENCES "public"."cliente"("id_cliente") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_id_establecimiento_establecimiento_id_establecimiento_fk" FOREIGN KEY ("id_establecimiento") REFERENCES "public"."establecimiento"("id_establecimiento") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_id_repartidor_repartidor_id_repartidor_fk" FOREIGN KEY ("id_repartidor") REFERENCES "public"."repartidor"("id_repartidor") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_id_direccion_direccion_entrega_id_direccion_fk" FOREIGN KEY ("id_direccion") REFERENCES "public"."direccion_entrega"("id_direccion") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "producto" ADD CONSTRAINT "producto_id_establecimiento_establecimiento_id_establecimiento_fk" FOREIGN KEY ("id_establecimiento") REFERENCES "public"."establecimiento"("id_establecimiento") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "calificacion_id_pedido_idx" ON "calificacion" USING btree ("id_pedido");--> statement-breakpoint
CREATE INDEX "detalle_pedido_id_pedido_idx" ON "detalle_pedido" USING btree ("id_pedido");--> statement-breakpoint
CREATE INDEX "detalle_pedido_id_producto_idx" ON "detalle_pedido" USING btree ("id_producto");--> statement-breakpoint
CREATE INDEX "direccion_entrega_id_cliente_idx" ON "direccion_entrega" USING btree ("id_cliente");--> statement-breakpoint
CREATE INDEX "pedido_id_cliente_idx" ON "pedido" USING btree ("id_cliente");--> statement-breakpoint
CREATE INDEX "pedido_id_establecimiento_idx" ON "pedido" USING btree ("id_establecimiento");--> statement-breakpoint
CREATE INDEX "pedido_id_repartidor_idx" ON "pedido" USING btree ("id_repartidor");--> statement-breakpoint
CREATE INDEX "pedido_estado_idx" ON "pedido" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "producto_id_establecimiento_idx" ON "producto" USING btree ("id_establecimiento");