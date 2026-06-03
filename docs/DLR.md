# Diagrama lógico relacional (DLR)

Diagrama en [Mermaid](https://mermaid.js.org/syntax/entityRelationshipDiagram.html) (`erDiagram`). Renderizable en GitHub, Obsidian o editores con soporte Mermaid.

```mermaid
erDiagram
    ESTABLECIMIENTO {
        int id_establecimiento PK
        string nombre
        string tipo
        string direccion
        string email
        string telefono
        string contrasenia
    }

    PRODUCTO {
        int id_producto PK
        int id_establecimiento FK
        string nombre
        string descripcion
        float precio
        float promocion_porcentaje
        boolean disponible
        string foto
    }

    CLIENTE {
        int id_cliente PK
        string nombre
        string apellido
        string email
        string telefono
        string contrasenia
    }

    DIRECCION_ENTREGA {
        int id_direccion PK
        int id_cliente FK
        string calle
        string numero
        string ciudad
        string codigo_postal
    }

    REPARTIDOR {
        int id_repartidor PK
        string nombre
        string apellido
        string email
        string telefono
        boolean disponible
        float coordenada_actual
        string contrasenia
    }

    PEDIDO {
        int id_pedido PK
        int id_cliente FK
        int id_establecimiento FK
        int id_repartidor FK "nullable"
        int id_direccion FK
        datetime fecha_hora
        string estado
        float total
    }

    DETALLE_PEDIDO {
        int id_detalle PK
        int id_pedido FK
        int id_producto FK
        int cantidad
        float precio_unitario
    }

    CALIFICACION {
        int id_calificacion PK
        int id_pedido FK
        string tipo
        int puntaje
    }

    ESTABLECIMIENTO ||--o{ PRODUCTO : ofrece
    ESTABLECIMIENTO ||--o{ PEDIDO : gestiona
    CLIENTE ||--o{ DIRECCION_ENTREGA : tiene
    CLIENTE ||--o{ PEDIDO : realiza
    REPARTIDOR ||--o{ PEDIDO : entrega
    DIRECCION_ENTREGA ||--o{ PEDIDO : recibe
    PEDIDO ||--o{ DETALLE_PEDIDO : contiene
    PEDIDO ||--o| CALIFICACION : recibe
    PRODUCTO ||--o{ DETALLE_PEDIDO : incluido_en
```

## Entidades

| Entidad | Descripción |
|---------|-------------|
| `ESTABLECIMIENTO` | Comercio que publica productos y recibe pedidos |
| `PRODUCTO` | Ítem del catálogo de un establecimiento |
| `CLIENTE` | Usuario consumidor |
| `DIRECCION_ENTREGA` | Direcciones asociadas a un cliente |
| `REPARTIDOR` | Repartidor asignable a pedidos |
| `PEDIDO` | Orden; `id_repartidor` opcional hasta asignación |
| `DETALLE_PEDIDO` | Líneas de un pedido (producto, cantidad, precio) |
| `CALIFICACION` | Valoración ligada a un pedido (0..1 por pedido) |

## Cardinalidades (resumen)

- Un establecimiento tiene muchos productos y muchos pedidos.
- Un cliente tiene muchas direcciones y muchos pedidos.
- Un repartidor puede entregar muchos pedidos.
- Una dirección puede usarse en muchos pedidos.
- Un pedido tiene muchos detalles; cada detalle referencia un producto.
- Un pedido puede tener como máximo una calificación.
