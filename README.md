# JuggleBall

JuggleBall es un minijuego ligero para superponer sobre una página web mientras ocurre una carga o espera. Usa HTML5 Canvas y JavaScript nativo. No requiere Unity, frameworks ni dependencias de runtime.

El sitio integrador decide cuándo iniciar, detener o destruir el overlay.

## Estructura

```text
src/
  JuggleBall.js
  ball.js
  input.js
  player.js
demo/
  index.html
  style.css
README.md
QuickIntegration.txt
```

## Ejecutar la demo

Por usar ES Modules, abre la demo desde un servidor local:

```bash
npx serve .
```

Después visita `http://localhost:3000/demo/` con la barra final.

## Archivos para integrar

Copia la carpeta `src/` a tu proyecto web y conserva sus archivos juntos:

```text
src/
  JuggleBall.js
  ball.js
  input.js
  player.js
```

`JuggleBall.js` importa los otros módulos mediante rutas relativas, por eso esa estructura debe mantenerse.

```js
import { JuggleBall } from "./src/JuggleBall.js";
```

La ruta anterior es solo un ejemplo. Ajústala según la ubicación donde copies `src/` dentro de tu proyecto.

## Integración mínima

```js
import { JuggleBall } from "./src/JuggleBall.js";

const game = new JuggleBall();
game.start();

try {
    await loadAppData();
} finally {
    game.destroy();
}
```

`loadAppData()` representa el proceso real de carga de tu aplicación. No es una función proporcionada por JuggleBall.

JuggleBall no detecta cuándo terminó de cargar tu página o aplicación. Tu sitio debe llamar `game.stop()` o `game.destroy()` cuando su proceso de carga haya terminado.

## API pública

```js
const game = new JuggleBall();

game.start();
game.stop();
game.destroy();
```

`start()` inicia o reactiva JuggleBall, crea el canvas si hace falta, registra los listeners necesarios y arranca `requestAnimationFrame`. Si se llama dos veces seguidas, evita crear loops duplicados.

`stop()` detiene y oculta JuggleBall, remueve listeners activos y permite llamar `start()` posteriormente en la misma instancia.

`destroy()` detiene JuggleBall, elimina el canvas y limpia sus referencias internas. La implementación actual permite volver a llamar `start()` en la misma instancia después de `destroy()`, recreando el canvas y el estado necesario.

## Overlay

JuggleBall crea un `<canvas>` con posición `fixed`, cubriendo el viewport. Mientras está activo usa `pointer-events: auto` para recibir Pointer Events y normalmente bloquea la interacción con el contenido situado debajo. Cuando está detenido usa `pointer-events: none`.

Por defecto usa un `z-index` alto. Puedes ajustarlo si tu página ya tiene overlays, modales o headers con valores altos:

```js
const game = new JuggleBall({
    zIndex: 10000
});
```

## Resize y Pointer Events

El componente escucha `resize` solo mientras está activo y ajusta el canvas al viewport. El control del player usa Pointer Events sobre el canvas.

## Sin dependencias de runtime

- JavaScript nativo
- HTML5 Canvas
- ES Modules
- Pointer Events
- `requestAnimationFrame`
- Sin Unity
- Sin frameworks
- Sin bundler obligatorio
