# JuggleBall

JuggleBall es un minijuego ligero que se muestra como overlay durante una carga o espera en una página web. Está construido con HTML5 Canvas, JavaScript nativo y ES Modules. No requiere Unity, frameworks ni dependencias de ejecución.

**La página integradora controla su ciclo de vida**: cuándo mostrar el minijuego y cuándo ocultarlo al terminar la operación.

## Estado de esta versión

La versión actual de `main` incluye las mejoras validadas en escritorio y en Android:

- Control por mouse y por eventos táctiles (`Pointer Events`).
- En pantallas táctiles, la raqueta se sitúa por defecto **110 unidades del Canvas por encima del dedo** para no quedar oculta; con mouse no se aplica desplazamiento.
- Conversión de las coordenadas del puntero a las coordenadas internas del Canvas, incluso cuando la escala visual difiere.
- Posicionamiento absoluto y límites para mantener la raqueta y el marcador dentro del Canvas. Cerca de los bordes, el límite tiene prioridad sobre la separación de 110 unidades.
- Colisiones por barrido para detectar golpes durante el movimiento, rebotes, puntuación y aumento progresivo de velocidad.
- La demo usa un mapa de importaciones con parámetros de versión para reducir problemas de caché durante las pruebas.

El panel de diagnóstico táctil utilizado durante el desarrollo fue retirado.

## Estructura del repositorio

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

## Integración nueva

**Copia los cuatro archivos de `src/` juntos** a tu proyecto web, conservando sus nombres y rutas relativas. El archivo `JuggleBall.js` importa los otros tres módulos.

En un módulo JavaScript de tu sitio:

```js
import { JuggleBall } from "./src/JuggleBall.js";

const game = new JuggleBall({
    touchOffsetY: 110 // Opcional: este es el valor predeterminado
});

game.start();

try {
    await loadAppData();
} finally {
    game.destroy();
}
```

`loadAppData()` es un **ejemplo**, no forma parte de JuggleBall. Sustitúyelo por la operación asíncrona real de tu aplicación. Ajusta la ruta de importación según dónde hayas colocado `src/`. El bloque `try/finally` debe ejecutarse dentro de una función `async` o un módulo que admita `await` de nivel superior.

El overlay cubre la ventana y captura el puntero mientras está activo, por lo que normalmente impide interactuar con el contenido situado debajo.

## Actualizar una integración de la primera versión

Si tu sitio ya utiliza JuggleBall:

1. Identifica dónde está la copia actual de `src/` en el proyecto web.
2. **Reemplaza juntos** `JuggleBall.js`, `ball.js`, `input.js` y `player.js` por los archivos de `src/` de `main`. No mezcles archivos de versiones distintas.
3. Conserva el código de integración que llama a `start()`, `stop()` y `destroy()`: la API pública sigue siendo compatible.
4. Si tu sitio establece opciones de configuración, revisa `touchOffsetY` y `zIndex`.
5. Publica los nuevos archivos y **renueva la caché de todos los módulos** (mediante archivos con hash, versiones de despliegue o una política de caché adecuada).
6. Comprueba la integración en un navegador de escritorio y en un teléfono real, especialmente movimiento, separación táctil, bordes, colisiones, puntuación y cierre del overlay.

**Importante sobre la caché:** el `importmap` que aparece en `demo/index.html` sirve para **esa demo**; no se instala automáticamente al copiar `src/`. Si el sitio utiliza un bundler, deja que este gestione los nombres versionados. Si sirve los módulos como archivos estáticos, asegúrate de invalidar también las importaciones transitivas de `JuggleBall.js` (`input.js`, `player.js`, `ball.js`). Añadir `?v=...` únicamente al HTML o al módulo principal no garantiza que se renueven todos los módulos.

## API pública y configuración

```js
import { JuggleBall } from "./src/JuggleBall.js";

const game = new JuggleBall({
    parent: document.body,       // Contenedor del Canvas
    zIndex: 2147483000,          // Orden de superposición
    className: "juggle-ball-overlay",
    touchOffsetY: 110            // Offset vertical táctil, en unidades del Canvas
});

game.start();   // Mostrar e iniciar; si ya está activo, no crea otro loop
game.stop();    // Detener y ocultar; permite volver a llamar start()
game.destroy(); // Detener y retirar el Canvas
```

`start()` crea el Canvas si es necesario, registra listeners y arranca `requestAnimationFrame`. Al reiniciarlo, el juego comienza con una partida nueva.

`stop()` detiene la animación, retira los listeners activos y oculta el Canvas. `destroy()` además retira el Canvas y limpia las referencias. La implementación actual permite llamar `start()` nuevamente incluso después de `destroy()`.

El valor `touchOffsetY` afecta **solo** a entradas de tipo `touch`; en mouse la raqueta sigue el cursor. La distancia visible en píxeles CSS puede diferir de 110 si la escala interna del Canvas y su tamaño visual son distintos.

## Consideraciones de integración

- **Overlay:** se crea un Canvas con `position: fixed`, `inset: 0`, `touch-action: none` y `pointer-events: auto` mientras está activo. Ajusta `zIndex` si existen otros overlays o controles que deban mostrarse encima.
- **Eventos:** el componente escucha `pointermove`, `pointerleave`, `pointercancel` y `resize` mientras corresponde.
- **Redimensionamiento:** el Canvas se ajusta al viewport; se normalizan las coordenadas del puntero con `getBoundingClientRect()`.
- **Responsabilidad del sitio:** JuggleBall no detecta por sí mismo cuándo termina una petición, navegación o carga. La aplicación debe detenerlo también ante errores o cancelaciones.
- **Navegador:** requiere soporte para ES Modules, Pointer Events y Canvas 2D. La demo usa adicionalmente `importmap`.
- **Sin dependencias:** no requiere bundler ni instalación de paquetes en tiempo de ejecución.

## Ejecutar la demo

Desde la raíz del repositorio, levanta un servidor local (no abras el HTML directamente mediante `file://`):

```bash
npx serve .
```

Visita `http://localhost:3000/demo/` (el puerto puede variar). La demo incluye botones Start, Stop y Destroy.

Demo publicada: https://leviankeyal.github.io/JuggleBall/demo/

## Lista de verificación para el desarrollador web

- [ ] Se copiaron los cuatro módulos de la misma revisión de `main`.
- [ ] El navegador carga los módulos sin errores de importación ni versiones antiguas en caché.
- [ ] El sitio muestra JuggleBall al iniciar la espera y lo oculta al terminar, incluso si hay error.
- [ ] El mouse mueve la raqueta sin desplazamiento vertical adicional.
- [ ] En Android, la raqueta sigue el dedo con offset y permanece dentro del Canvas.
- [ ] Los golpes suman puntos, la pelota rebota y el juego se reinicia al caer.
- [ ] Stop y Destroy no dejan un overlay bloqueando la página.
