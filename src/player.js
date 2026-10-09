export class Player {
    constructor(input, options = {}) {
        this.input = input;
        this.touchOffsetY = options.touchOffsetY ?? 180;

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
        // Seguir el dedo con offset constante siempre que sea posible.
        // Si el dedo sobrepasa un borde, mover la raqueta inmediatamente
        // al invertir el gesto y recuperar suavemente el offset deseado.
        const deltaX = this.input.x - this.lastPointerX;
        const deltaY = this.input.y - this.lastPointerY;
        const idealX = this.input.x;
        const idealY = this.input.y - offsetY;
        const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
        let targetX = clamp(idealX, minX, maxX);
        let targetY = clamp(idealY, minY, maxY);
        if (!newSession) {
            const relativeX = clamp(this.x + deltaX, minX, maxX);
            const relativeY = clamp(this.y + deltaY, minY, maxY);
            // Cuando el puntero esta fuera de los limites, el movimiento
            // relativo evita una zona muerta al invertir la direccion.
            if (idealX < minX || idealX > maxX) targetX = relativeX;
            if (idealY < minY || idealY > maxY) targetY = relativeY;
        }
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