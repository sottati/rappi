ALTER TABLE "detalle_pedido" DROP CONSTRAINT IF EXISTS "detalle_pedido_id_producto_producto_id_producto_fk";
--> statement-breakpoint
ALTER TABLE "detalle_pedido" RENAME COLUMN "id_producto" TO "id_producto_catalogo";
--> statement-breakpoint
ALTER TABLE "detalle_pedido" ADD COLUMN "nombre_producto" text;
--> statement-breakpoint
UPDATE "detalle_pedido"
SET "nombre_producto" = COALESCE(
  (
    SELECT "producto"."nombre"
    FROM "producto"
    WHERE "producto"."id_producto" = "detalle_pedido"."id_producto_catalogo"
  ),
  'Producto de catalogo'
);
--> statement-breakpoint
ALTER TABLE "detalle_pedido" ALTER COLUMN "nombre_producto" SET NOT NULL;
