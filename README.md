# JuggleBall

JuggleBall es un minijuego ligero para superponer sobre una pagina web mientras ocurre una carga o espera. Usa HTML5 Canvas y JavaScript nativo. No requiere Unity, frameworks, bundlers ni dependencias de runtime.

El integrador decide cuando iniciar, detener o destruir el overlay.

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
```


## Ejecutar la demo

Por usar modulos ES, abre la demo desde un servidor local:

```bash
npx serve .
```

Despues visita `http://localhost:3000/demo/` con la barra final.

Tambien puedes usar cualquier servidor estatico equivalente.

## Archivos para integrar

Copia la carpeta `src/` o sirve esos archivos desde tu proyecto. La clase publica vive en `src/JuggleBall.js`.

```html
<script type="module">
    import { JuggleBall } from "./src/JuggleBall.js";

    const game = new JuggleBall();
    game.start();
</script>
```

## API publica

```js
const game = new JuggleBall();

game.start();
game.stop();
game.destroy();
```

`start()` crea el canvas si aun no existe, lo muestra como overlay, registra los listeners necesarios, reinicia el estado de juego y arranca `requestAnimationFrame`. Llamarlo dos veces seguidas no crea loops duplicados.

`stop()` cancela el loop, retira listeners de pointer y resize, oculta el canvas y desactiva sus Pointer Events para no bloquear la pagina. Puedes llamar `start()` despues de `stop()`.

`destroy()` llama internamente a `stop()`, remueve el canvas creado por JuggleBall y libera referencias razonables.

## Overlay

JuggleBall crea un `<canvas>` con posicion `fixed`, cubriendo el viewport. Mientras esta activo usa `pointer-events: auto` para recibir Pointer Events y bloquea normalmente la interaccion con el contenido situado debajo. Cuando esta detenido usa `pointer-events: none`.

Por defecto usa un `z-index` alto para quedar por encima de la pagina. Puedes ajustarlo:

```js
const game = new JuggleBall({
    zIndex: 10000
});
```

Si tu pagina ya usa overlays, modales o headers con z-index alto, elige un valor que encaje con tu stack visual.

## Resize y Pointer Events

El componente escucha `resize` solo mientras esta activo y ajusta el canvas al viewport. El control del player usa Pointer Events sobre el canvas; navegadores modernos de escritorio y movil soportan este modelo.

## Detener al terminar la carga

Cuando tu pagina termina de cargar o el proceso que estabas esperando concluye, llama `stop()` si quieres poder volver a usar JuggleBall mas tarde:

```js
const game = new JuggleBall();
game.start();

loadAppData().finally(() => {
    game.stop();
});
```

Si ya no lo vas a necesitar, llama `destroy()`:

```js
loadAppData().finally(() => {
    game.destroy();
});
```

El integrador es responsable de llamar `stop()` o `destroy()` cuando corresponda.

## Compatibilidad

JuggleBall espera navegadores modernos con soporte de ES modules, Canvas, Pointer Events y `requestAnimationFrame`.