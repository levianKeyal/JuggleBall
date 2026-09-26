export class Ball {
    constructor(canvas) {
        this.canvas = canvas;
        this.radius = 12;
        this.gravity = 850;
        this.spawnXRatio = 0.5;
        this.spawnYRatio = 0.35;
        this.initialVelocityX = 180;
        this.initialVelocityY = 0;
        this.color = "#ff5252";
        this.impactColor = "#ffe66d";
        this.pulseMaxScale = 1.35;
        this.pulseDuration = 0.18;
        this.pulseAttackDuration = 0.03;
        // La correccion de penetracion no debe rearmar el mismo contacto.
        this.contactReleaseGap = 1;
        this.respawn();
    }

    respawn() {
        this.x = Math.max(this.radius, Math.min(
            this.canvas.width - this.radius,
            this.canvas.width * this.spawnXRatio
        ));
        this.y = Math.max(this.radius, this.canvas.height * this.spawnYRatio);
        this.velocityX = this.initialVelocityX;
        this.velocityY = this.initialVelocityY;
        this.pulseTimeRemaining = 0;
        this.playerContact = false;
        this.hitThisFrame = false;
        this.hitNormalX = 0;
        this.hitNormalY = -1;
    }

    update(deltaTime) {
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime
            + 0.5 * this.gravity * deltaTime * deltaTime;
        this.velocityY += this.gravity * deltaTime;
        this.pulseTimeRemaining = Math.max(0, this.pulseTimeRemaining - deltaTime);
        this.checkWallCollision();
    }

    checkWallCollision() {
        if (this.x - this.radius <= 0) {
            this.x = this.radius;
            this.velocityX = Math.abs(this.velocityX);
        } else if (this.x + this.radius >= this.canvas.width) {
            this.x = this.canvas.width - this.radius;
            this.velocityX = -Math.abs(this.velocityX);
        }
        if (this.y - this.radius <= 0) {
            this.y = this.radius;
            this.velocityY = Math.abs(this.velocityY);
        }
    }

    isBelowCanvas() {
        return this.y - this.radius > this.canvas.height;
    }

    beginPlayerFrame(player) {
        this.hitThisFrame = false;
        if (!player.input.active || this.pointerSession !== player.pointerSession) {
            this.playerContact = false;
        }
        this.pointerSession = player.pointerSession;
    }

    checkPlayerCollision(player, sweep, speed, deltaTime) {
        if (!player.input.active) {
            this.playerContact = false;
            return false;
        }

        const radius = this.radius + player.radius;
        const startX = sweep.ballStartX - sweep.playerStartX;
        const startY = sweep.ballStartY - sweep.playerStartY;
        const moveX = (this.x - sweep.ballStartX)
            - (sweep.playerEndX - sweep.playerStartX);
        const moveY = (this.y - sweep.ballStartY)
            - (sweep.playerEndY - sweep.playerStartY);

        // Solo una separacion observada antes de un nuevo contacto permite rearmar.
        // Nunca rearmar despues de un golpe dentro del mismo frame.
        if (!this.hitThisFrame
            && Math.hypot(startX, startY) > radius + this.contactReleaseGap) {
            this.playerContact = false;
        }

        // |start + move * t|^2 = (radio Ball + radio Player)^2, t en [0, 1].
        const a = moveX * moveX + moveY * moveY;
        const b = startX * moveX + startY * moveY;
        const c = startX * startX + startY * startY - radius * radius;
        let time = 0;
        if (c > 1e-7) {
            const discriminant = b * b - a * c;
            if (a === 0 || b >= 0 || discriminant < 0) {
                return false;
            }
            time = -c / (b - Math.sqrt(discriminant));
            if (time < 0 || time > 1) {
                return false;
            }
        } else if (c >= -1e-7 && b >= 0) {
            // Estar justo en la superficie y alejarse no es una nueva entrada.
            return false;
        }

        const contactX = startX + moveX * time;
        const contactY = startY + moveY * time;
        const distance = Math.hypot(contactX, contactY);
        const normalX = distance > 1e-7 ? contactX / distance : 0;
        const normalY = distance > 1e-7 ? contactY / distance : -1;
        const newHit = !this.playerContact && !this.hitThisFrame;

        if (newHit) {
            this.hitNormalX = normalX;
            this.hitNormalY = normalY;
            this.hit(speed);
            this.playerContact = true;
            this.hitThisFrame = true;

            // Resolver en el punto de impacto y avanzar solo el tiempo restante.
            this.x = sweep.playerStartX
                + (sweep.playerEndX - sweep.playerStartX) * time + normalX * radius;
            this.y = sweep.playerStartY
                + (sweep.playerEndY - sweep.playerStartY) * time + normalY * radius;
            this.update(deltaTime * (1 - time));
        }

        // El Player es cinematico: si sigue atravesando el contacto, apartar Ball
        // por el lado de impacto sin agregar otro impulso ni invertir la normal.
        const separation = (this.x - sweep.playerEndX) * this.hitNormalX
            + (this.y - sweep.playerEndY) * this.hitNormalY;
        if (separation < radius) {
            this.x += this.hitNormalX * (radius - separation);
            this.y += this.hitNormalY * (radius - separation);
        }
        return newHit;
    }

    hit(speed) {
        // Direccion geometrica; magnitud controlada por el juego.
        this.velocityX = this.hitNormalX * speed;
        this.velocityY = this.hitNormalY * speed;
        this.pulseTimeRemaining = this.pulseDuration;
    }

    draw(context) {
        let scale = 1;
        const pulsing = this.pulseTimeRemaining > 0;
        if (pulsing) {
            const elapsed = this.pulseDuration - this.pulseTimeRemaining;
            const attackDuration = Math.min(this.pulseAttackDuration, this.pulseDuration);
            let strength;
            if (elapsed < attackDuration) {
                const progress = elapsed / attackDuration;
                strength = 1 - (1 - progress) ** 3;
            } else {
                const progress = (elapsed - attackDuration)
                    / (this.pulseDuration - attackDuration);
                strength = (1 - progress) ** 2;
            }
            scale += (this.pulseMaxScale - 1) * strength;
        }
        context.beginPath();
        context.arc(this.x, this.y, this.radius * scale, 0, Math.PI * 2);
        context.fillStyle = pulsing ? this.impactColor : this.color;
        context.fill();
    }
}