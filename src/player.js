export class Player {
    constructor(input, options = {}) {
        this.input = input;
        this.touchOffsetY = options.touchOffsetY ?? 80;

        this.x = 0;
        this.y = 0;

        this.previousX = 0;
        this.previousY = 0;
        this.pointerSession = -1;
        this.lastPointerX = 0;
        this.lastPointerY = 0;
        this.radius = 20;
    }

    update() {
        if (!this.input.active) {
            return;
        }

        const offsetY = this.input.pointerType === "touch" ? this.touchOffsetY : 0;
        // Mantener la raqueta y el marcador visibles dentro del canvas.
        // La misma posicion limitada se utiliza para dibujo y colisiones.
        const canvas = this.input.canvas;
        const scoreSpace = 32;
        const minX = this.radius;
        const maxX = Math.max(minX, canvas.width - this.radius);
        const minY = this.radius;
        const maxY = Math.max(minY, canvas.height - this.radius - scoreSpace);
        const newSession = this.pointerSession !== this.input.pointerSession;
        // Al iniciar el contacto, colocar la raqueta con su offset habitual.
        // Despues, usar deltas del puntero para evitar la zona muerta al
        // invertir el movimiento cuando la raqueta esta contra un borde.
        const desiredX = newSession
            ? this.input.x
            : this.x + (this.input.x - this.lastPointerX);
        const desiredY = newSession
            ? this.input.y - offsetY
            : this.y + (this.input.y - this.lastPointerY);
        const targetX = Math.max(minX, Math.min(maxX, desiredX));
        const targetY = Math.max(minY, Math.min(maxY, desiredY));
        this.previousX = newSession ? targetX : this.x;
        this.previousY = newSession ? targetY : this.y;
        this.x = targetX;
        this.y = targetY;
        this.lastPointerX = this.input.x;
        this.lastPointerY = this.input.y;
        this.pointerSession = this.input.pointerSession;
    }

    draw(context, score = 0) {
        if (!this.input.active) {
            return;
        }

        context.beginPath();

        context.arc(
            this.x,
            this.y,
            this.radius,
            0,
            Math.PI * 2
        );

        context.fillStyle = "white";
        context.fill();

        context.lineWidth = 3;
        context.strokeStyle = "black";
        context.stroke();

        context.save();
        context.font = "bold 18px Arial, sans-serif";
        context.textAlign = "center";
        context.textBaseline = "top";
        context.lineWidth = 3;
        context.strokeText(String(score), this.x, this.y + this.radius + 8);
        context.fillText(String(score), this.x, this.y + this.radius + 8);
        context.restore();
    }
}