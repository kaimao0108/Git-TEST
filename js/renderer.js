// Dragon Quest Pixel & Procedural Graphics Renderer (8-Direction & Deluxe VFX)

class GameRenderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.patternCanvas = document.createElement('canvas');
        this.initTiles();
    }

    initTiles() {
        this.patternCanvas.width = 64;
        this.patternCanvas.height = 64;
        const pCtx = this.patternCanvas.getContext('2d');

        // Lush DQ green field
        pCtx.fillStyle = '#48982a';
        pCtx.fillRect(0, 0, 64, 64);

        // Grass clusters
        pCtx.fillStyle = '#56aa32';
        pCtx.fillRect(8, 12, 4, 8);
        pCtx.fillRect(12, 16, 4, 4);
        pCtx.fillRect(40, 36, 4, 8);
        pCtx.fillRect(44, 40, 4, 4);

        pCtx.fillStyle = '#3a8020';
        pCtx.fillRect(24, 48, 4, 4);
        pCtx.fillRect(52, 18, 4, 4);

        // Tiny flowers
        pCtx.fillStyle = '#ffffff';
        pCtx.fillRect(20, 24, 4, 4);
        pCtx.fillStyle = '#ffd700';
        pCtx.fillRect(22, 26, 2, 2);

        this.bgPattern = this.ctx.createPattern(this.patternCanvas, 'repeat');
    }

    renderBackground(cameraX, cameraY, width, height) {
        this.ctx.save();
        this.ctx.translate(-cameraX, -cameraY);
        this.ctx.fillStyle = this.bgPattern;
        this.ctx.fillRect(cameraX, cameraY, width, height);
        this.ctx.restore();
    }

    // =========================================================
    // 8-DIRECTION PLAYER RENDERING (S, SE, E, NE, N, NW, W, SW)
    // =========================================================

    drawPlayer(player, animTime) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(player.x, player.y);

        // Invincibility flashing
        if (player.invincibleTimer > 0 && Math.floor(animTime * 18) % 2 === 0) {
            ctx.globalAlpha = 0.45;
        }

        const charId = player.character.id;
        const dir = player.dirIndex; // 0:S, 1:SE, 2:E, 3:NE, 4:N, 5:NW, 6:W, 7:SW
        const isMoving = player.isMoving;
        const frame = player.walkFrame; // 0, 1, 2, 3
        const bob = isMoving ? (frame % 2 === 1 ? -2.5 : 0) : Math.sin(animTime * 3) * 0.8;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
        ctx.beginPath();
        ctx.ellipse(0, 16, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.translate(0, bob);

        // 8-direction stepping offset
        const stepL = isMoving ? (frame === 1 ? 4 : (frame === 3 ? -3 : 0)) : 0;
        const stepR = isMoving ? (frame === 3 ? 4 : (frame === 1 ? -3 : 0)) : 0;

        if (charId === 'hero') {
            this.drawHero8Dir(ctx, dir, stepL, stepR, isMoving, animTime);
        } else if (charId === 'mage') {
            this.drawMage8Dir(ctx, dir, stepL, stepR, isMoving, animTime);
        } else if (charId === 'martial') {
            this.drawMartial8Dir(ctx, dir, stepL, stepR, isMoving, animTime);
        } else {
            this.drawPriest8Dir(ctx, dir, stepL, stepR, isMoving, animTime);
        }

        ctx.restore();
    }

    // 1. HERO (8-DIR)
    drawHero8Dir(ctx, dir, stepL, stepR, isMoving, animTime) {
        const isNorth = (dir === 4 || dir === 3 || dir === 5);
        const isSouth = (dir === 0 || dir === 1 || dir === 7);
        const isEast = (dir === 2 || dir === 1 || dir === 3);
        const isWest = (dir === 6 || dir === 5 || dir === 7);

        // Cape (Draw behind if facing South/East/West, draw in front if facing North)
        const capeWave = isMoving ? Math.sin(animTime * 12) * 4 : 0;
        if (!isNorth) {
            ctx.fillStyle = '#c02222';
            ctx.beginPath();
            ctx.moveTo(-9, -4);
            ctx.lineTo(-15 - capeWave, 16);
            ctx.lineTo(15 + capeWave, 16);
            ctx.lineTo(9, -4);
            ctx.closePath();
            ctx.fill();
        }

        // Legs / Boots
        ctx.fillStyle = '#654321'; // Leather Boots
        if (dir === 0 || dir === 4) { // Pure South or North
            ctx.fillRect(-6, 8 + stepL, 5, 8);
            ctx.fillRect(1, 8 + stepR, 5, 8);
        } else if (dir === 2) { // Pure East
            ctx.fillRect(-3, 8 + stepL, 6, 8);
        } else if (dir === 6) { // Pure West
            ctx.fillRect(-3, 8 + stepR, 6, 8);
        } else { // Diagonals
            ctx.fillRect(-5, 8 + stepL, 5, 8);
            ctx.fillRect(1, 8 + stepR, 5, 8);
        }

        // Blue Tunic Body Armor
        ctx.fillStyle = '#1e6fd9';
        ctx.fillRect(-8, -6, 16, 15);

        // Belt & Buckle
        ctx.fillStyle = '#442200';
        ctx.fillRect(-8, 4, 16, 3);
        ctx.fillStyle = '#ffd700';
        if (isSouth) ctx.fillRect(-2, 4, 4, 3);

        // Head / Skin
        ctx.fillStyle = '#ffe0bd';
        ctx.fillRect(-6, -16, 12, 11);

        // Hair / Helmet
        ctx.fillStyle = '#4a2912'; // Spiky brown hair
        ctx.fillRect(-8, -21, 16, 6);
        ctx.fillRect(-9, -17, 3, 6);
        ctx.fillRect(6, -17, 3, 6);

        // Circlet & Eyes based on direction
        ctx.fillStyle = '#ffd700';
        if (dir === 0) { // South (Front)
            ctx.fillRect(-7, -15, 14, 3);
            ctx.fillStyle = '#111';
            ctx.fillRect(-4, -12, 2, 3);
            ctx.fillRect(2, -12, 2, 3);
        } else if (dir === 1) { // South-East
            ctx.fillRect(-6, -15, 13, 3);
            ctx.fillStyle = '#111';
            ctx.fillRect(-1, -12, 2, 3);
            ctx.fillRect(4, -12, 2, 3);
        } else if (dir === 7) { // South-West
            ctx.fillRect(-7, -15, 13, 3);
            ctx.fillStyle = '#111';
            ctx.fillRect(-6, -12, 2, 3);
            ctx.fillRect(-1, -12, 2, 3);
        } else if (dir === 2) { // East (Right)
            ctx.fillRect(-4, -15, 10, 3);
            ctx.fillStyle = '#111';
            ctx.fillRect(3, -12, 2, 3);
        } else if (dir === 6) { // West (Left)
            ctx.fillRect(-6, -15, 10, 3);
            ctx.fillStyle = '#111';
            ctx.fillRect(-5, -12, 2, 3);
        } else { // North / Back view
            ctx.fillStyle = '#4a2912';
            ctx.fillRect(-7, -17, 14, 11); // Full hair on back
            // Sword strapped on back
            ctx.fillStyle = '#c0c0c0';
            ctx.fillRect(-3, -14, 4, 24);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(-6, -6, 10, 3);
        }

        // Sword in hand (Front / Side views)
        if (!isNorth) {
            ctx.fillStyle = '#c0c0c0';
            if (isEast) {
                ctx.fillRect(8, -8, 3, 16);
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(6, -2, 7, 3);
            } else if (isWest) {
                ctx.fillRect(-11, -8, 3, 16);
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(-13, -2, 7, 3);
            }
        }
    }

    // 2. MAGE (8-DIR)
    drawMage8Dir(ctx, dir, stepL, stepR, isMoving, animTime) {
        const isNorth = (dir === 4 || dir === 3 || dir === 5);
        const isSouth = (dir === 0 || dir === 1 || dir === 7);

        // Purple Robe
        ctx.fillStyle = '#7a288a';
        ctx.beginPath();
        ctx.moveTo(-9, -4);
        ctx.lineTo(-14, 16);
        ctx.lineTo(14, 16);
        ctx.lineTo(9, -4);
        ctx.closePath();
        ctx.fill();

        // Face & Eyes
        if (!isNorth) {
            ctx.fillStyle = '#ffe0bd';
            ctx.fillRect(-6, -14, 12, 10);
            ctx.fillStyle = '#111';
            if (dir === 0) { ctx.fillRect(-3, -10, 2, 2); ctx.fillRect(2, -10, 2, 2); }
            else if (dir === 2 || dir === 1) { ctx.fillRect(2, -10, 2, 2); }
            else { ctx.fillRect(-4, -10, 2, 2); }
        }

        // Wizard Hat
        ctx.fillStyle = '#5c166d';
        ctx.fillRect(-12, -16, 24, 4);
        ctx.beginPath();
        ctx.moveTo(-9, -16);
        ctx.lineTo(0, -31);
        ctx.lineTo(9, -16);
        ctx.closePath();
        ctx.fill();

        // Glowing Staff
        const staffX = (dir === 6 || dir === 5 || dir === 7) ? -10 : 10;
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(staffX, -12, 3, 26);
        // Gem on staff
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(staffX + 1.5, -14, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    // 3. MARTIAL ARTIST (8-DIR)
    drawMartial8Dir(ctx, dir, stepL, stepR, isMoving, animTime) {
        const isNorth = (dir === 4 || dir === 3 || dir === 5);

        // Legs / Pants
        ctx.fillStyle = '#e8e8e8';
        ctx.fillRect(-6, 8 + stepL, 4, 8);
        ctx.fillRect(2, 8 + stepR, 4, 8);

        // Orange Gi
        ctx.fillStyle = '#e65c00';
        ctx.fillRect(-8, -6, 16, 15);
        // Black belt
        ctx.fillStyle = '#111';
        ctx.fillRect(-8, 3, 16, 3);

        // Head
        ctx.fillStyle = '#ffe0bd';
        ctx.fillRect(-6, -16, 12, 11);

        // Spiky Hair
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(-8, -22, 16, 7);

        // Red Headband
        ctx.fillStyle = '#dc143c';
        ctx.fillRect(-7, -15, 14, 3);
        // Headband tails fluttering
        const tailWave = isMoving ? Math.sin(animTime * 14) * 4 : 0;
        ctx.fillRect(dir >= 4 ? -12 : 7, -15, 6 + tailWave, 2);

        // Eyes
        if (!isNorth) {
            ctx.fillStyle = '#111';
            if (dir === 0) { ctx.fillRect(-3, -11, 2, 3); ctx.fillRect(2, -11, 2, 3); }
            else if (dir === 2 || dir === 1) { ctx.fillRect(3, -11, 2, 3); }
            else { ctx.fillRect(-5, -11, 2, 3); }
        }
    }

    // 4. PRIEST (8-DIR)
    drawPriest8Dir(ctx, dir, stepL, stepR, isMoving, animTime) {
        const isNorth = (dir === 4 || dir === 3 || dir === 5);

        // Teal / White Habit
        ctx.fillStyle = '#20b2aa';
        ctx.fillRect(-9, -4, 18, 20);
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(-5, -4, 10, 20);

        // Head
        ctx.fillStyle = '#ffe0bd';
        ctx.fillRect(-6, -14, 12, 10);

        // Mitre Hat with Gold Cross
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(-7, -25, 14, 12);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-1, -23, 2, 8);
        ctx.fillRect(-4, -20, 8, 2);

        // Eyes
        if (!isNorth) {
            ctx.fillStyle = '#111';
            if (dir === 0) { ctx.fillRect(-3, -10, 2, 2); ctx.fillRect(2, -10, 2, 2); }
            else if (dir === 2 || dir === 1) { ctx.fillRect(2, -10, 2, 2); }
            else { ctx.fillRect(-4, -10, 2, 2); }
        }
    }

    // =========================================================
    // ENEMY RENDERING (20+ DQ MONSTERS & BOSSES)
    // =========================================================

    drawEnemy(enemy, animTime) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(enemy.x, enemy.y);

        // Hit flash
        if (enemy.hitFlashTimer > 0) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, enemy.radius + 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return;
        }

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.beginPath();
        ctx.ellipse(0, enemy.radius * 0.85, enemy.radius * 0.8, enemy.radius * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        const type = enemy.type;
        const r = enemy.radius;
        const bob = Math.sin(animTime * 8 + enemy.id) * 2;
        ctx.translate(0, bob);

        // 1. Slime Types (Slime, Bubble Slime, Metal Slime, Liquid Metal Slime, King Metal Slime)
        if (type === 'slime' || type === 'bubble_slime' || type === 'metal_slime') {
            let bodyColor = enemy.data.color;
            if (type === 'metal_slime') {
                const grad = ctx.createLinearGradient(-r, -r, r, r);
                grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.5, '#a6b0b8'); grad.addColorStop(1, '#ffffff');
                bodyColor = grad;
            }
            ctx.fillStyle = bodyColor;
            ctx.beginPath();
            ctx.moveTo(0, -r * 1.3);
            ctx.bezierCurveTo(r * 0.9, -r * 0.5, r * 1.25, r * 0.4, r * 0.9, r * 0.9);
            ctx.bezierCurveTo(r * 0.5, r * 1.2, -r * 0.5, r * 1.2, -r * 0.9, r * 0.9);
            ctx.bezierCurveTo(-r * 1.25, r * 0.4, -r * 0.9, -r * 0.5, 0, -r * 1.3);
            ctx.closePath();
            ctx.fill();

            // Eyes & Smile
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-r * 0.35, -r * 0.05, r * 0.28, 0, Math.PI * 2);
            ctx.arc(r * 0.35, -r * 0.05, r * 0.28, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(-r * 0.32, -r * 0.05, r * 0.13, 0, Math.PI * 2);
            ctx.arc(r * 0.38, -r * 0.05, r * 0.13, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#e63946'; ctx.lineWidth = 1.8;
            ctx.beginPath(); ctx.arc(0, r * 0.25, r * 0.32, 0.2, Math.PI - 0.2); ctx.stroke();

        } else if (type === 'healslime') {
            // Healslime (荷伊米史萊姆): Yellow bell with waving blue tentacles
            ctx.fillStyle = '#ffd166';
            ctx.beginPath();
            ctx.arc(0, -r * 0.3, r * 0.7, Math.PI, 0);
            ctx.lineTo(r * 0.7, 0); ctx.lineTo(-r * 0.7, 0);
            ctx.closePath();
            ctx.fill();
            // Cute eyes
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(-4, -r * 0.3, 3.5, 0, Math.PI * 2); ctx.arc(4, -r * 0.3, 3.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#111';
            ctx.fillRect(-4, -r * 0.3, 2, 2); ctx.fillRect(4, -r * 0.3, 2, 2);
            // Tentacles waving
            ctx.strokeStyle = '#00b4d8'; ctx.lineWidth = 2.5;
            for (let i = -2; i <= 2; i++) {
                const tw = Math.sin(animTime * 10 + i) * 4;
                ctx.beginPath();
                ctx.moveTo(i * 5, 0);
                ctx.quadraticCurveTo(i * 5 + tw, r * 0.6, i * 6 - tw, r * 1.2);
                ctx.stroke();
            }

        } else if (type === 'liquid_metal_slime') {
            // Liquid Metal Slime (迷路金屬史萊姆 / はぐれメタル)
            const grad = ctx.createLinearGradient(-r, -r, r, r);
            grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.5, '#adb5bd'); grad.addColorStop(1, '#ffffff');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(0, r * 0.2, r * 1.3, r * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            // Tiny liquid mound
            ctx.beginPath(); ctx.arc(-r * 0.2, -r * 0.2, r * 0.5, 0, Math.PI * 2); ctx.fill();
            // Eyes
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.2, 4, 0, Math.PI * 2); ctx.arc(r * 0.05, -r * 0.2, 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#111';
            ctx.fillRect(-r * 0.35, -r * 0.2, 2, 2); ctx.fillRect(r * 0.05, -r * 0.2, 2, 2);

        } else if (type === 'king_metal_slime') {
            // King Metal Slime (金屬史萊姆王)
            const grad = ctx.createLinearGradient(-r, -r, r, r);
            grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.5, '#ced4da'); grad.addColorStop(1, '#ffffff');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, r * 0.2, r * 0.85, 0, Math.PI * 2);
            ctx.fill();
            // Royal Golden Crown
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(-r * 0.5, -r * 1.1, r, 6);
            ctx.beginPath();
            ctx.moveTo(-r * 0.5, -r * 1.1); ctx.lineTo(-r * 0.5, -r * 1.5); ctx.lineTo(-r * 0.2, -r * 1.1);
            ctx.lineTo(0, -r * 1.6); ctx.lineTo(r * 0.2, -r * 1.1); ctx.lineTo(r * 0.5, -r * 1.5); ctx.lineTo(r * 0.5, -r * 1.1);
            ctx.closePath(); ctx.fill();
            // Ruby gem on crown
            ctx.fillStyle = '#e63946'; ctx.fillRect(-2, -r * 1.3, 4, 4);

        } else if (type === 'ghost') {
            // Ghost (鬼魂)
            ctx.fillStyle = 'rgba(224, 247, 250, 0.85)';
            ctx.beginPath();
            ctx.arc(0, -r * 0.2, r * 0.7, Math.PI, 0);
            ctx.quadraticCurveTo(r * 0.8, r * 0.8, 0, r * 1.1);
            ctx.quadraticCurveTo(-r * 0.8, r * 0.8, -r * 0.7, -r * 0.2);
            ctx.closePath();
            ctx.fill();
            // Hollow dark eyes & tongue
            ctx.fillStyle = '#111';
            ctx.fillRect(-5, -r * 0.3, 3, 4); ctx.fillRect(2, -r * 0.3, 3, 4);
            ctx.fillStyle = '#e63946';
            ctx.fillRect(-1, 0, 3, 5); // Tongue

        } else if (type === 'dracky') {
            // Dracky
            const flap = Math.sin(animTime * 14) * 8;
            ctx.fillStyle = '#4a0072';
            ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-r * 1.7, -flap); ctx.lineTo(-r * 1.2, flap + 4); ctx.closePath(); ctx.fill();
            ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(r * 1.7, -flap); ctx.lineTo(r * 1.2, flap + 4); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#8b008b'; ctx.beginPath(); ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff'; ctx.fillRect(-7, -r, 3, 4); ctx.fillRect(4, -r, 3, 4);
            ctx.fillStyle = '#ffff00'; ctx.beginPath(); ctx.arc(-4, -2, 3.5, 0, Math.PI * 2); ctx.arc(4, -2, 3.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#111'; ctx.fillRect(-4, -2, 2, 2); ctx.fillRect(4, -2, 2, 2);

        } else if (type === 'hammerhood') {
            // Hammerhood
            ctx.fillStyle = '#a0522d'; ctx.beginPath(); ctx.arc(0, -2, r * 0.9, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#8b4513'; ctx.fillRect(-r, -r * 0.7, 5, 8); ctx.fillRect(r - 5, -r * 0.7, 5, 8);
            ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.fillRect(-4, -2, 2, 3); ctx.fillRect(2, -2, 2, 3);
            ctx.fillStyle = '#654321'; ctx.fillRect(r * 0.6, -r * 0.8, 4, r * 1.6);
            ctx.fillStyle = '#8b4513'; ctx.fillRect(r * 0.3, -r * 1.1, 10, 8);

        } else if (type === 'mud_hand') {
            // Mud Hand
            ctx.fillStyle = '#8b5a2b'; ctx.fillRect(-r * 0.4, -r * 0.8, r * 0.8, r * 1.6);
            ctx.fillRect(-r * 0.6, -r * 1.2, 3, 6); ctx.fillRect(-r * 0.2, -r * 1.4, 3, 8);
            ctx.fillRect(r * 0.2, -r * 1.3, 3, 7); ctx.fillRect(r * 0.5, -r * 1.0, 3, 5);
            ctx.fillStyle = '#5c3818'; ctx.fillRect(-r, r * 0.6, r * 2, 4);

        } else if (type === 'skeleton') {
            // Skeleton Warrior
            ctx.fillStyle = '#f0f0f0'; ctx.beginPath(); ctx.arc(0, -r * 0.5, r * 0.45, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ff0000'; ctx.fillRect(-4, -r * 0.5, 2, 3); ctx.fillRect(2, -r * 0.5, 2, 3);
            ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 2; ctx.strokeRect(-r * 0.4, 0, r * 0.8, r * 0.6);
            ctx.fillStyle = '#888888'; ctx.fillRect(r * 0.5, -r * 0.8, 3, r * 1.5);

        } else if (type === 'restless_armour') {
            // Restless Armour (死靈騎士)
            ctx.fillStyle = '#4682b4';
            ctx.fillRect(-r * 0.6, -r * 0.6, r * 1.2, r * 1.2);
            // Horned helmet
            ctx.fillStyle = '#2b547e'; ctx.fillRect(-r * 0.5, -r * 1.1, r, 7);
            ctx.fillStyle = '#ff0033'; ctx.fillRect(-4, -r * 0.8, 3, 2); ctx.fillRect(1, -r * 0.8, 3, 2);
            // Steel shield & sword
            ctx.fillStyle = '#adb5bd'; ctx.fillRect(-r * 0.9, -r * 0.4, 5, r * 0.9);
            ctx.fillStyle = '#ffd700'; ctx.fillRect(r * 0.6, -r * 0.7, 3, r * 1.4);

        } else if (type === 'cyclops') {
            // Cyclops (獨眼巨人)
            ctx.fillStyle = '#1e3f66'; ctx.beginPath(); ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2); ctx.fill();
            // Loincloth
            ctx.fillStyle = '#8b5a2b'; ctx.fillRect(-r * 0.6, r * 0.3, r * 1.2, r * 0.5);
            // Singular Big Eye
            ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, -r * 0.2, r * 0.35, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ff0000'; ctx.beginPath(); ctx.arc(0, -r * 0.2, r * 0.16, 0, Math.PI * 2); ctx.fill();
            // Giant Studded Club
            ctx.fillStyle = '#654321'; ctx.fillRect(r * 0.7, -r * 1.1, 8, r * 1.8);

        } else if (type === 'mimic_king') {
            // Mimic King (寶箱怪王 BOSS)
            ctx.fillStyle = '#5c2c16'; ctx.fillRect(-r * 0.85, -r * 0.4, r * 1.7, r * 1.0);
            // Open Lid
            ctx.beginPath(); ctx.moveTo(-r * 0.85, -r * 0.4); ctx.lineTo(-r * 0.9, -r * 1.1); ctx.lineTo(r * 0.9, -r * 1.1); ctx.lineTo(r * 0.85, -r * 0.4); ctx.closePath(); ctx.fill();
            // Sharp white fangs
            ctx.fillStyle = '#ffffff';
            for (let i = -3; i <= 3; i++) {
                ctx.beginPath(); ctx.moveTo(i * 6, -r * 0.4); ctx.lineTo(i * 6 + 3, -r * 0.7); ctx.lineTo(i * 6 + 6, -r * 0.4); ctx.fill();
            }
            // Glowing demonic red eye inside
            ctx.fillStyle = '#ff0000'; ctx.beginPath(); ctx.arc(0, -r * 0.75, 5, 0, Math.PI * 2); ctx.fill();

        } else if (type === 'slime_knight') {
            // Slime Knight BOSS
            ctx.fillStyle = '#00fa9a'; ctx.beginPath(); ctx.arc(0, r * 0.3, r * 0.65, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#c0c0c0'; ctx.fillRect(-r * 0.3, -r * 0.7, r * 0.6, r * 0.7);
            ctx.fillStyle = '#ff0000'; ctx.fillRect(-2, -r * 1.0, 4, 5);
            ctx.fillStyle = '#ffd700'; ctx.fillRect(r * 0.35, -r * 1.1, 3, r * 1.6);

        } else if (type === 'killer_machine') {
            // Killer Machine BOSS
            ctx.fillStyle = '#4169e1'; ctx.fillRect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.2);
            ctx.fillStyle = '#222'; ctx.fillRect(-r * 0.6, r * 0.5, 4, r * 0.5); ctx.fillRect(r * 0.4, r * 0.5, 4, r * 0.5);
            ctx.fillStyle = '#ff0033'; ctx.beginPath(); ctx.arc(0, -r * 0.1, r * 0.25, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#e0e0e0'; ctx.fillRect(-r * 1.1, -r * 0.9, 4, r * 1.8); ctx.fillRect(r * 0.9, -r * 0.9, 4, r * 1.8);

        } else if (type === 'baramos') {
            // Baramos BOSS (大魔王先鋒 巴拉莫斯)
            ctx.fillStyle = '#7b1113'; ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2); ctx.fill();
            // Imperial purple mantle
            ctx.fillStyle = '#4a0e4e'; ctx.fillRect(-r * 0.7, -r * 0.5, r * 1.4, r * 1.1);
            // Lizard horns
            ctx.fillStyle = '#ffd700'; ctx.fillRect(-r * 0.6, -r * 1.1, 4, 8); ctx.fillRect(r * 0.4, -r * 1.1, 4, 8);
            // Glowing crimson eyes
            ctx.fillStyle = '#00ffcc'; ctx.fillRect(-6, -r * 0.3, 4, 4); ctx.fillRect(2, -r * 0.3, 4, 4);

        } else if (type === 'zoma') {
            // Zoma (大魔王 索瑪 FINAL BOSS)
            // Frost blizzard aura
            const auraR = r * (1.1 + Math.sin(animTime * 6) * 0.12);
            ctx.fillStyle = 'rgba(0, 210, 255, 0.22)';
            ctx.beginPath(); ctx.arc(0, 0, auraR, 0, Math.PI * 2); ctx.fill();

            // Dark Indigo body
            ctx.fillStyle = '#1d2d50'; ctx.beginPath(); ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2); ctx.fill();
            // Spiked shoulder mantle
            ctx.fillStyle = '#133b5c';
            ctx.beginPath();
            ctx.moveTo(-r * 1.2, -r * 0.2); ctx.lineTo(-r * 0.5, -r * 0.9); ctx.lineTo(0, -r * 0.4);
            ctx.lineTo(r * 0.5, -r * 0.9); ctx.lineTo(r * 1.2, -r * 0.2); ctx.lineTo(0, r * 0.7);
            ctx.closePath(); ctx.fill();
            // Great Horns of Destruction
            ctx.fillStyle = '#f8f9fa';
            ctx.beginPath(); ctx.moveTo(-r * 0.4, -r * 0.7); ctx.lineTo(-r * 0.9, -r * 1.4); ctx.lineTo(-r * 0.2, -r * 0.9); ctx.fill();
            ctx.beginPath(); ctx.moveTo(r * 0.4, -r * 0.7); ctx.lineTo(r * 0.9, -r * 1.4); ctx.lineTo(r * 0.2, -r * 0.9); ctx.fill();
            // Cold penetrating eyes
            ctx.fillStyle = '#00ffff'; ctx.fillRect(-8, -r * 0.3, 5, 4); ctx.fillRect(3, -r * 0.3, 5, 4);

        } else if (type === 'great_dragon') {
            // Great Dragon BOSS
            ctx.fillStyle = '#c1121f';
            const wingFlap = Math.sin(animTime * 8) * 12;
            ctx.beginPath(); ctx.moveTo(-r * 0.5, 0); ctx.lineTo(-r * 1.8, -r * 0.8 + wingFlap); ctx.lineTo(-r * 0.8, r * 0.5); ctx.fill();
            ctx.beginPath(); ctx.moveTo(r * 0.5, 0); ctx.lineTo(r * 1.8, -r * 0.8 + wingFlap); ctx.lineTo(r * 0.8, r * 0.5); ctx.fill();
            ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#f4a261'; ctx.beginPath(); ctx.ellipse(0, r * 0.2, r * 0.45, r * 0.4, 0, 0, Math.PI * 2); ctx.fill();

        } else {
            ctx.fillStyle = enemy.data.color || '#ff0000';
            ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
        }

        // Boss Health Bar
        if (enemy.data.isBoss) {
            const barW = r * 2.6;
            const barH = 6;
            const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(-barW / 2, -r - 14, barW, barH);
            ctx.fillStyle = enemy.data.isFinalBoss ? '#00ffff' : '#e63946';
            ctx.fillRect(-barW / 2, -r - 14, barW * hpRatio, barH);
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2;
            ctx.strokeRect(-barW / 2, -r - 14, barW, barH);
        }

        ctx.restore();
    }

    // =========================================================
    // DELUXE WEAPONS & SKILL EFFECTS RENDERING
    // =========================================================

    drawProjectile(proj, animTime) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(proj.x, proj.y);

        const id = proj.weaponId;

        if (id === 'sword_loto' || id === 'true_loto_blade') {
            ctx.rotate(proj.angle);
            const isEvo = id === 'true_loto_blade';
            const arcR = proj.radius || 45;

            // Multi-layered divine sword arc
            ctx.strokeStyle = isEvo ? '#ffd700' : '#4cc9f0';
            ctx.lineWidth = isEvo ? 10 : 6;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(0, 0, arcR, -Math.PI * 0.38, Math.PI * 0.38);
            ctx.stroke();

            // Inner hot white core
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = isEvo ? 4 : 2;
            ctx.beginPath();
            ctx.arc(0, 0, arcR, -Math.PI * 0.35, Math.PI * 0.35);
            ctx.stroke();

            // True Loto Blade: Radiant Sunburst Cross
            if (isEvo) {
                ctx.fillStyle = '#ffffff';
                ctx.beginPath(); ctx.arc(arcR * 0.85, 0, 8, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(arcR * 0.85 - 20, 0); ctx.lineTo(arcR * 0.85 + 20, 0);
                ctx.moveTo(arcR * 0.85, -20); ctx.lineTo(arcR * 0.85, 20);
                ctx.stroke();
            }

        } else if (id === 'wand_frizz' || id === 'wand_kafrizz') {
            const isEvo = id === 'wand_kafrizz';
            const r = isEvo ? 16 : 9;

            // Fiery Demon Orb / Skull
            ctx.fillStyle = isEvo ? '#ff0055' : '#ff5400';
            ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();

            // Inner white/yellow core
            ctx.fillStyle = '#ffea00';
            ctx.beginPath(); ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2); ctx.fill();

            // Fiery corona
            ctx.strokeStyle = isEvo ? '#ff00ff' : '#ffaa00';
            ctx.lineWidth = 2.5;
            ctx.stroke();

        } else if (id === 'dagger_poison' || id === 'thousand_needles') {
            ctx.rotate(proj.angle);
            const isEvo = id === 'thousand_needles';

            // Blade body
            ctx.fillStyle = isEvo ? '#9d4edd' : '#ced4da';
            ctx.fillRect(-12, -2.5, 24, 5);
            // Sharp tip
            ctx.beginPath();
            ctx.moveTo(12, -4); ctx.lineTo(20, 0); ctx.lineTo(12, 4);
            ctx.closePath(); ctx.fill();

            // Purple poison trail
            if (isEvo) {
                ctx.strokeStyle = 'rgba(157, 78, 221, 0.6)';
                ctx.lineWidth = 3;
                ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-30, 0); ctx.stroke();
            }

        } else if (id === 'axe_battle' || id === 'death_scythe') {
            ctx.rotate(proj.rotation);
            const isEvo = id === 'death_scythe';

            if (isEvo) {
                // Giant Void-Black Death Scythe
                ctx.fillStyle = '#7209b7';
                ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 0.75); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
                ctx.strokeStyle = '#ff00ff'; ctx.lineWidth = 3; ctx.stroke();
                ctx.fillStyle = '#ffd700'; ctx.fillRect(-2, -22, 4, 44);
            } else {
                ctx.fillStyle = '#6c757d';
                ctx.beginPath(); ctx.arc(-12, -6, 14, 0, Math.PI); ctx.arc(12, -6, 14, 0, Math.PI); ctx.fill();
                ctx.fillStyle = '#8b5a2b'; ctx.fillRect(-2, -16, 4, 32);
            }

        } else if (id === 'boomerang' || id === 'sacred_boomerang') {
            ctx.rotate(proj.rotation);
            const isEvo = id === 'sacred_boomerang';

            ctx.fillStyle = isEvo ? '#ffd700' : '#e76f51';
            ctx.fillRect(-16, -3.5, 32, 7); ctx.fillRect(-3.5, -16, 7, 32);

            // Sacred golden electricity
            if (isEvo) {
                ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5;
                ctx.strokeRect(-16, -3.5, 32, 7); ctx.strokeRect(-3.5, -16, 7, 32);
                ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
            }

        } else if (id === 'tome_sizz' || id === 'halo_kasizz') {
            ctx.rotate(proj.rotation || 0);
            const isEvo = id === 'halo_kasizz';

            ctx.fillStyle = isEvo ? '#f72585' : '#4361ee';
            ctx.fillRect(-9, -12, 18, 24);
            ctx.fillStyle = '#ffffff'; ctx.fillRect(-7, -10, 14, 20);
            ctx.fillStyle = isEvo ? '#ffea00' : '#4cc9f0';
            ctx.fillRect(-3, -5, 6, 10);

        } else if (id === 'wand_bang' || id === 'wrath_kaboom') {
            const isEvo = id === 'wrath_kaboom';
            const progress = proj.timer / proj.lifetime;
            const currentR = proj.radius * Math.sin(progress * Math.PI);

            ctx.fillStyle = isEvo ? 'rgba(255, 0, 100, 0.45)' : 'rgba(255, 140, 0, 0.45)';
            ctx.beginPath(); ctx.arc(0, 0, Math.max(1, currentR), 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.stroke();

        } else if (id === 'aura_herb' || id === 'domain_yggdrasil') {
            const isEvo = id === 'domain_yggdrasil';
            const r = proj.radius;
            const alpha = 0.16 + Math.sin(animTime * 5) * 0.08;

            ctx.fillStyle = isEvo ? `rgba(46, 204, 113, ${alpha + 0.1})` : `rgba(76, 175, 80, ${alpha})`;
            ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = isEvo ? '#2ecc71' : '#81c784'; ctx.lineWidth = isEvo ? 3.5 : 1.8; ctx.stroke();

            // Rotating sacred runes
            for (let i = 0; i < 8; i++) {
                const angle = animTime * 0.9 + (i * Math.PI / 4);
                const rx = Math.cos(angle) * r;
                const ry = Math.sin(angle) * r;
                ctx.fillStyle = '#ffffff'; ctx.fillRect(rx - 2.5, ry - 2.5, 5, 5);
            }
        }

        ctx.restore();
    }

    drawGem(gem, animTime) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(gem.x, gem.y);
        const bob = Math.sin(animTime * 6 + gem.x) * 2;
        ctx.translate(0, bob);

        if (gem.val >= 400) {
            // Crown Rainbow Gem (King Metal / Baramos)
            ctx.fillStyle = '#ff00ff'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5; ctx.stroke();
        } else if (gem.val >= 100) {
            // Gold Super Gem
            ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();
        } else if (gem.val >= 10) {
            // Red Ruby
            ctx.fillStyle = '#e63946'; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(6, 0); ctx.lineTo(0, 6); ctx.lineTo(-6, 0); ctx.closePath(); ctx.fill();
        } else if (gem.val >= 2) {
            // Green Emerald
            ctx.fillStyle = '#2a9d8f'; ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(5, 0); ctx.lineTo(0, 5); ctx.lineTo(-5, 0); ctx.closePath(); ctx.fill();
        } else {
            // Classic Blue Waterdrop
            ctx.fillStyle = '#00b4d8'; ctx.beginPath(); ctx.arc(0, 1, 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff'; ctx.fillRect(-1, -2, 2, 2);
        }

        ctx.restore();
    }

    drawChest(chest, animTime) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(chest.x, chest.y);
        const bob = Math.sin(animTime * 6) * 3;
        ctx.translate(0, bob);

        const glow = 18 + Math.sin(animTime * 10) * 5;
        ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
        ctx.beginPath(); ctx.arc(0, 0, glow, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#8b4513'; ctx.fillRect(-13, -9, 26, 18);
        ctx.fillStyle = '#ffd700'; ctx.fillRect(-13, -9, 26, 4); ctx.fillRect(-13, 5, 26, 4); ctx.fillRect(-2, -3, 4, 6);
        ctx.restore();
    }

    drawFloatingText(fText) {
        const ctx = this.ctx;
        ctx.save();
        ctx.font = fText.isCrit ? 'bold 17px monospace' : (fText.isEvo ? 'bold 20px monospace' : 'bold 13px monospace');
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000000';
        ctx.fillText(fText.text, fText.x + 1, fText.y + 1);
        ctx.fillStyle = fText.color;
        ctx.fillText(fText.text, fText.x, fText.y);
        ctx.restore();
    }
}

window.GameRenderer = GameRenderer;
