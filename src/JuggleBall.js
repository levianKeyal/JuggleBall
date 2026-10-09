import { InputController } from "./input.js";
import { Player } from "./player.js";
import { Ball } from "./ball.js";

export class JuggleBall {
    constructor(options = {}) {
        this.parent = options.parent || document.body;
        this.zIndex = options.zIndex ?? 2147483000;
        this.className = options.className || "juggle-ball-overlay";
        this.touchOffsetY = options.touchOffsetY ?? 180;

        this.canvas = null;
        this.context = null;
        this.input = null;
        this.player = null;
        this.ball = null;

        this.score = 0;
        this.previousTime = 0;
        this.animationFrameId = null;
        this.running = false;

        this.baseHitSpeed = 520;
        this.speedIncreasePerHit = 12;
        this.maxHitSpeed = 720;
        this.maxPhysicsStep = 1 / 120;

        this.resizeCanvas = this.resizeCanvas.bind(this);
        this.gameLoop = this.gameLoop.bind(this);
    }

    start() {
        if (this.running) {
            return;
        }

        this.ensureCanvas();
        this.canvas.hidden = false;
        this.canvas.style.pointerEvents = "auto";
        this.resizeCanvas();

        this.score = 0;
        this.previousTime = 0;
        this.input = new InputController(this.canvas);
        this.input.attach();
        this.player = new Player(this.input, { touchOffsetY: this.touchOffsetY });
        this.ball = new Ball(this.canvas);

        window.addEventListener("resize", this.resizeCanvas);

        this.running = true;
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    stop() {
        if (!this.running) {
            if (this.canvas) {
                this.canvas.hidden = true;
                this.canvas.style.pointerEvents = "none";
            }
            return;
        }

        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
        this.running = false;
        this.previousTime = 0;

        window.removeEventListener("resize", this.resizeCanvas);

        if (this.input) {
            this.input.detach();
        }

        if (this.canvas) {
            this.canvas.hidden = true;
            this.canvas.style.pointerEvents = "none";
        }
    }

    destroy() {
        this.stop();

        if (this.canvas) {
            this.canvas.remove();
        }

        this.canvas = null;
        this.context = null;
        this.input = null;
        this.player = null;
        this.ball = null;
    }

    ensureCanvas() {
        if (this.canvas) {
            return;
        }

        this.canvas = document.createElement("canvas");
        this.canvas.className = this.className;
        this.canvas.setAttribute("aria-label", "JuggleBall");
        this.canvas.style.position = "fixed";
        this.canvas.style.inset = "0";
        this.canvas.style.width = "100vw";
        this.canvas.style.height = "100vh";
        this.canvas.style.zIndex = String(this.zIndex);
        this.canvas.style.cursor = "none";
        this.canvas.style.display = "block";
        this.canvas.style.touchAction = "none";
        this.canvas.style.background = "transparent";
        this.canvas.style.pointerEvents = "none";

        this.context = this.canvas.getContext("2d");
        this.parent.appendChild(this.canvas);
    }

    resizeCanvas() {
        if (!this.canvas) {
            return;
        }

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    gameLoop(currentTime) {
        if (!this.running) {
            return;
        }

        const deltaTime = this.previousTime === 0
            ? 0
            : (currentTime - this.previousTime) / 1000;

        this.previousTime = currentTime;

        const safeDeltaTime = Math.min(deltaTime, 0.05);

        this.update(safeDeltaTime);
        this.draw();

        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime) {
        this.player.update();

        this.ball.beginPlayerFrame(this.player);
        let remainingTime = deltaTime;
        while (remainingTime > 0) {
            const step = Math.min(remainingTime, this.maxPhysicsStep);
            const startFraction = (deltaTime - remainingTime) / deltaTime;
            const endFraction = Math.min(1, startFraction + step / deltaTime);
            const sweep = {
                playerStartX: this.player.previousX
                    + (this.player.x - this.player.previousX) * startFraction,
                playerStartY: this.player.previousY
                    + (this.player.y - this.player.previousY) * startFraction,
                playerEndX: this.player.previousX
                    + (this.player.x - this.player.previousX) * endFraction,
                playerEndY: this.player.previousY
                    + (this.player.y - this.player.previousY) * endFraction,
                ballStartX: this.ball.x,
                ballStartY: this.ball.y
            };

            this.ball.update(step);
            if (this.ball.isBelowCanvas()) {
                this.score = 0;
                this.ball.respawn();
                break;
            }

            const nextScore = this.score + 1;
            const targetHitSpeed = Math.min(
                this.baseHitSpeed + nextScore * this.speedIncreasePerHit,
                this.maxHitSpeed
            );
            // true significa que Ball ya aplico velocidad y pulse.
            if (this.ball.checkPlayerCollision(
                this.player,
                sweep,
                targetHitSpeed,
                step
            )) {
                this.score = nextScore;
            }
            remainingTime -= step;
        }
    }

    draw() {
        this.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        this.ball.draw(this.context);
        this.player.draw(this.context, this.score);
    }
}

window.JuggleBall = JuggleBall;