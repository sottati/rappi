CREATE TYPE "public"."app_rol" AS ENUM('admin', 'repartidor', 'usuario');--> statement-breakpoint
CREATE TABLE "cuenta_app" (
	"id_cuenta" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"contrasenia" text NOT NULL,
	"rol" "app_rol" NOT NULL,
	"nombre_visible" text NOT NULL,
	"id_cliente" integer,
	"id_repartidor" integer,
	"id_establecimiento" integer,
	CONSTRAINT "cuenta_app_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "cuenta_app" ADD CONSTRAINT "cuenta_app_id_cliente_cliente_id_cliente_fk" FOREIGN KEY ("id_cliente") REFERENCES "public"."cliente"("id_cliente") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cuenta_app" ADD CONSTRAINT "cuenta_app_id_repartidor_repartidor_id_repartidor_fk" FOREIGN KEY ("id_repartidor") REFERENCES "public"."repartidor"("id_repartidor") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cuenta_app" ADD CONSTRAINT "cuenta_app_id_establecimiento_establecimiento_id_establecimiento_fk" FOREIGN KEY ("id_establecimiento") REFERENCES "public"."establecimiento"("id_establecimiento") ON DELETE set null ON UPDATE no action;
