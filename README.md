# compactor

Un botón en el pie del cuadro de escribir de Claude Code con el límite semanal y el contexto usado, que compacta la conversación con un clic: `📅21 🗜️34`.

- `📅`: porcentaje usado del límite semanal. Muestra `–` hasta la primera respuesta de Claude, o siempre con una clave de API, que no tiene límite semanal. Puede ir hasta un punto por debajo del popup de límites de la app.
- `🗜️`: porcentaje del contexto usado.
- Se activa cuando el contexto pasa del 75 % y Claude no está trabajando. Antes se ve en gris.
- Activo, al pulsarlo compacta la conversación, igual que `/compact`.
- En gris, al pulsarlo muestra los tokens en un aviso (por ejemplo `144.7k / 1M tokens`).

## Instalación

En una sesión de Claude Code en la terminal:

```
/plugin install compactor --marketplace manuelfp88/compactor
```

Responde `y` para añadir el catálogo y elige dónde instalarlo.

## Licencia

MIT
