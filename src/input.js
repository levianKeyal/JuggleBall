export class InputController {
    constructor(canvas) {
        this.canvas = canvas;

        this.x = 0;
        this.y = 0;

        // Identifica entradas nuevas para no barrer desde una posicion obsoleta.
        this.pointerSession = 0;
        this.active = false;
        this.pointerType = null;
        this.attached = false;

        this.handlePointerMove = this.handlePointerMove.bind(this);
        this.handlePointerLeave = this.handlePointerLeave.bind(this);
    }

    attach() {
        if (this.attached) {
            return;
        }

        this.canvas.addEventListener("pointermove", this.handlePointerMove);
        this.canvas.addEventListener("pointerleave", this.handlePointerLeave);
        this.canvas.addEventListener("pointercancel", this.handlePointerLeave);
        this.attached = true;
    }

    detach() {
        if (!this.attached) {
            return;
        }

        this.canvas.removeEventListener("pointermove", this.handlePointerMove);
        this.canvas.removeEventListener("pointerleave", this.handlePointerLeave);
        this.canvas.removeEventListener("pointercancel", this.handlePointerLeave);
        this.active = false;
        this.pointerType = null;
        this.attached = false;
    }

    handlePointerMove(event) {
        if (!this.active || this.pointerType !== event.pointerType) {
            this.pointerSession += 1;
        }
        // Los eventos reportan posicion; Player conserva el historial del frame.
        this.pointerType = event.pointerType;
        const rect = this.canvas.getBoundingClientRect();
        this.x = (event.clientX - rect.left) * (this.canvas.width / rect.width);
        this.y = (event.clientY - rect.top) * (this.canvas.height / rect.height);
        this.active = true;
    }

    handlePointerLeave() {
        this.active = false;
    }
}