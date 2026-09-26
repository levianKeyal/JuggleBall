export class Player {
    constructor(input) {
        this.input = input;

        this.x = 0;
        this.y = 0;

        this.previousX = 0;
        this.previousY = 0;
        this.pointerSession = -1;
        this.radius = 20;
    }

    update() {
        if (!this.input.active) {
            return;
        }

        const newSession = this.pointerSession !== this.input.pointerSession;
        this.previousX = newSession ? this.input.x : this.x;
        this.previousY = newSession ? this.input.y : this.y;
        this.x = this.input.x;
        this.y = this.input.y;
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