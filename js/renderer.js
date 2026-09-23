// Dragon Quest Pixel & Procedural Graphics Renderer (Deluxe High-Definition Edition)

class GameRenderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.patternCanvas = document.createElement('canvas');
        this.initTiles();
    }

    // 1. EXQUISITE DRAGON QUEST TERRAIN (精緻原野磁磚與古道石磚)
    initTiles() {
        this.patternCanvas.width = 128;
        this.patternCanvas.height = 128;
        const p = this.patternCanvas.getContext('2d');

        // Multi-layered lush pasture green
        p.fillStyle = '#429324';
        p.fillRect(0, 0, 128, 128);

        // Rich grass blade tufts with shading
        p.fillStyle = '#53aa2e';
        const tufts = [
            [12, 16], [16, 20], [20, 16], [48, 40], [52, 44],
            [80, 12], [84, 16], [110, 56], [114, 60], [28, 96],
            [32, 100], [76, 88], [80, 92], [104, 108], [108, 112]
        ];
        tufts.forEach(([tx, ty]) => {
            p.fillRect(tx, ty, 4, 8);
            p.fillRect(tx + 4, ty + 2, 4, 4);
        });

        // Deep shadow grass
        p.fillStyle = '#2f6e18';
        const shadows = [[8, 48], [40, 72], [96, 32], [64, 116], [120, 80]];
        shadows.forEach(([sx, sy]) => {
            p.fillRect(sx, sy, 6, 6);
        });

        // Cobblestone Path / Flagstones (古石路磚)
        p.fillStyle = '#7a8275';
        p.fillRect(60, 0, 16, 128);
        p.fillStyle = '#9aa394'; // Stone highlight
        for (let y = 4; y < 128; y += 18) {
            p.fillRect(62, y, 12, 14);
            p.fillStyle = '#596055'; // Stone seam
            p.fillRect(60, y + 14, 16, 2);
            p.fillStyle = '#9aa394';
        }

        // Stepping rocks on grass
        p.fillStyle = '#838c7f';
        p.beginPath(); p.arc(24, 64, 5, 0, Math.PI * 2); p.fill();
        p.beginPath(); p.arc(106, 24, 6, 0, Math.PI * 2); p.fill();
        p.fillStyle = '#adb8a7';
        p.fillRect(23, 62, 3, 3);
        p.fillRect(104, 22, 3, 3);

        // Wildflowers (White Daisies & Blue Forget-Me-Nots)
        p.fillStyle = '#ffffff';
        p.fillRect(18, 32, 4, 4); p.fillRect(24, 30, 4, 4);
        p.fillStyle = '#ffd700'; p.fillRect(20, 34, 2, 2); p.fillRect(26, 32, 2, 2);

        p.fillStyle = '#00d2ff'; // Blue flower
        p.fillRect(92, 74, 4, 4);
        p.fillStyle = '#ffffff'; p.fillRect(93, 75, 2, 2);

        this.bgPattern = this.ctx.createPattern(this.patternCanvas, 'repeat');
    }

    renderBackground(cameraX, cameraY, width, height) {
        this.ctx.save();
        this.ctx.translate(-cameraX, -cameraY);
        this.ctx.fillStyle = this.bgPattern;
        this.ctx.fillRect(cameraX, cameraY, width, height);
        this.ctx.restore();

        // Subtle atmospheric vignette overlay (邊緣暗角營造史詩冒險深度)
        const vigGrad = this.ctx.createRadialGradient(
            width / 2, height / 2, Math.min(width, height) * 0.45,
            width / 2, height / 2, Math.max(width, height) * 0.75
        );
        vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
        this.ctx.fillStyle = vigGrad;
        this.ctx.fillRect(0, 0, width, height);
    }

    // =========================================================================
    // 2. CLEAR, SHARP, HIGH-DEFINITION 8-DIRECTION CHARACTERS (加強輪廓與細節)
    // =========================================================================

    drawPlayer(player, animTime) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(player.x, player.y);

        // Invincibility flash
        if (player.invincibleTimer > 0 && Math.floor(animTime * 18) % 2 === 0) {
            ctx.globalAlpha = 0.45;
        }

        const charId = player.character.id;
        const dir = player.dirIndex;
        const isMoving = player.isMoving;
        const frame = player.walkFrame;
        const bob = isMoving ? (frame % 2 === 1 ? -3 : 0) : Math.sin(animTime * 3) * 1.0;

        // Soft ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 18, 16, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.translate(0, bob);

        // Step offsets for 4-phase walk cycle
        const stepL = isMoving ? (frame === 1 ? 5 : (frame === 3 ? -4 : 0)) : 0;
        const stepR = isMoving ? (frame === 3 ? 5 : (frame === 1 ? -4 : 0)) : 0;

        // Render with defined outline pass
        if (charId === 'hero') {
            this.drawHeroHD(ctx, dir, stepL, stepR, isMoving, animTime);
        } else if (charId === 'mage') {
            this.drawMageHD(ctx, dir, stepL, stepR, isMoving, animTime);
        } else if (charId === 'martial') {
            this.drawMartialHD(ctx, dir, stepL, stepR, isMoving, animTime);
        } else {
            this.drawPriestHD(ctx, dir, stepL, stepR, isMoving, animTime);
        }

        ctx.restore();
    }

    // --- 1. HERO HD (羅德傳奇勇者 - 飛翼頭盔、羅德之盾、神聖佩劍) ---
    drawHeroHD(ctx, dir, stepL, stepR, isMoving, animTime) {
        const isNorth = (dir === 4 || dir === 3 || dir === 5);
        const isSouth = (dir === 0 || dir === 1 || dir === 7);
        const isEast = (dir === 2 || dir === 1 || dir === 3);
        const isWest = (dir === 6 || dir === 5 || dir === 7);

        // 1. Cape (Fluttering)
        const capeWave = isMoving ? Math.sin(animTime * 12) * 5 : 0;
        if (!isNorth) {
            ctx.fillStyle = '#111'; // Outline
            ctx.beginPath(); ctx.moveTo(-11, -4); ctx.lineTo(-19 - capeWave, 19); ctx.lineTo(19 + capeWave, 19); ctx.lineTo(11, -4); ctx.fill();
            ctx.fillStyle = '#b81414'; // Crimson Cape
            ctx.beginPath(); ctx.moveTo(-9, -4); ctx.lineTo(-17 - capeWave, 17); ctx.lineTo(17 + capeWave, 17); ctx.lineTo(9, -4); ctx.fill();
            ctx.fillStyle = '#e63946'; // Highlight fold
            ctx.fillRect(-6, -2, 12, 18);
        }

        // 2. Armored Legs & Leather Greaves
        ctx.fillStyle = '#111'; // Outline
        ctx.fillRect(-7, 8 + stepL, 6, 11);
        ctx.fillRect(1, 8 + stepR, 6, 11);
        ctx.fillStyle = '#654321'; // Leather boots
        ctx.fillRect(-6, 9 + stepL, 4, 9);
        ctx.fillRect(2, 9 + stepR, 4, 9);
        ctx.fillStyle = '#d4af37'; // Golden knee guards
        ctx.fillRect(-6, 9 + stepL, 4, 3);
        ctx.fillRect(2, 9 + stepR, 4, 3);

        // 3. Torso / Royal Blue Armor
        ctx.fillStyle = '#111'; // Outline
        ctx.fillRect(-10, -6, 20, 17);
        ctx.fillStyle = '#155ac4'; // Royal Loto Blue
        ctx.fillRect(-8, -5, 16, 15);
        // Golden Crest on chest
        ctx.fillStyle = '#ffd700';
        if (isSouth) {
            ctx.fillRect(-3, -3, 6, 6);
            ctx.fillStyle = '#ff0033'; ctx.fillRect(-1, -1, 2, 2); // Center gem
        }

        // Belt & Buckle
        ctx.fillStyle = '#3a200a'; ctx.fillRect(-8, 5, 16, 4);
        ctx.fillStyle = '#ffd700'; ctx.fillRect(-3, 5, 6, 4);

        // 4. Head & Face
        ctx.fillStyle = '#111'; // Head outline
        ctx.fillRect(-8, -19, 16, 14);
        ctx.fillStyle = '#ffe0bd'; // Skin
        ctx.fillRect(-6, -17, 12, 12);

        // Spiky Brown Hair
        ctx.fillStyle = '#4a2810';
        ctx.fillRect(-8, -23, 16, 7);
        ctx.fillRect(-9, -19, 3, 7);
        ctx.fillRect(6, -19, 3, 7);

        // Winged Silver Helmet & Golden Diadem (羅德之盔)
        ctx.fillStyle = '#ffd700'; // Gold Diadem
        ctx.fillRect(-7, -17, 14, 4);
        ctx.fillStyle = '#e0e0e0'; // Silver Helmet Wings
        ctx.fillRect(-10, -21, 3, 6);
        ctx.fillRect(7, -21, 3, 6);

        // Eyes & Expression
        ctx.fillStyle = '#111';
        if (dir === 0) { // South (Front)
            ctx.fillRect(-4, -13, 3, 4); ctx.fillRect(1, -13, 3, 4);
            ctx.fillStyle = '#fff'; ctx.fillRect(-3, -14, 1, 1); ctx.fillRect(2, -14, 1, 1); // Eye twinkle
        } else if (dir === 1) { // SE
            ctx.fillRect(-1, -13, 3, 4); ctx.fillRect(4, -13, 2, 4);
        } else if (dir === 7) { // SW
            ctx.fillRect(-6, -13, 2, 4); ctx.fillRect(-2, -13, 3, 4);
        } else if (dir === 2) { // East
            ctx.fillRect(3, -13, 3, 4);
        } else if (dir === 6) { // West
            ctx.fillRect(-6, -13, 3, 4);
        } else { // North (Back view)
            ctx.fillStyle = '#4a2810'; ctx.fillRect(-7, -18, 14, 12);
            // Sword Sheath on back
            ctx.fillStyle = '#c0c0c0'; ctx.fillRect(-2, -16, 4, 24);
            ctx.fillStyle = '#ffd700'; ctx.fillRect(-5, -8, 10, 4);
        }

        // 5. Shield & Weapon on Sides
        if (!isNorth) {
            // Loto Shield (Blue with Gold Cross) on off-hand
            if (isEast) {
                // Shield on Left arm
                ctx.fillStyle = '#111'; ctx.fillRect(-13, -4, 6, 14);
                ctx.fillStyle = '#1e6fd9'; ctx.fillRect(-12, -3, 4, 12);
                ctx.fillStyle = '#ffd700'; ctx.fillRect(-11, 1, 2, 4);
                // Sword on Right hand
                ctx.fillStyle = '#c0c0c0'; ctx.fillRect(9, -8, 4, 18);
                ctx.fillStyle = '#ffd700'; ctx.fillRect(7, -2, 8, 3);
            } else if (isWest) {
                // Shield on Right arm
                ctx.fillStyle = '#111'; ctx.fillRect(7, -4, 6, 14);
                ctx.fillStyle = '#1e6fd9'; ctx.fillRect(8, -3, 4, 12);
                ctx.fillStyle = '#ffd700'; ctx.fillRect(9, 1, 2, 4);
                // Sword on Left hand
                ctx.fillStyle = '#c0c0c0'; ctx.fillRect(-13, -8, 4, 18);
                ctx.fillStyle = '#ffd700'; ctx.fillRect(-15, -2, 8, 3);
            }
        }
    }

    // --- 2. MAGE HD (皇家大魔導士) ---
    drawMageHD(ctx, dir, stepL, stepR, isMoving, animTime) {
        const isNorth = (dir === 4 || dir === 3 || dir === 5);

        // Robe with outline
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.moveTo(-11, -4); ctx.lineTo(-16, 18); ctx.lineTo(16, 18); ctx.lineTo(11, -4); ctx.fill();
        ctx.fillStyle = '#6b1d7d'; ctx.beginPath(); ctx.moveTo(-9, -4); ctx.lineTo(-14, 16); ctx.lineTo(14, 16); ctx.lineTo(9, -4); ctx.fill();
        // Golden Robe Hem
        ctx.fillStyle = '#ffd700'; ctx.fillRect(-14, 13, 28, 3);

        // Face
        if (!isNorth) {
            ctx.fillStyle = '#111'; ctx.fillRect(-7, -15, 14, 11);
            ctx.fillStyle = '#ffe0bd'; ctx.fillRect(-5, -14, 10, 9);
            ctx.fillStyle = '#111';
            if (dir === 0) { ctx.fillRect(-3, -11, 2, 3); ctx.fillRect(2, -11, 2, 3); }
            else if (dir === 2 || dir === 1) { ctx.fillRect(2, -11, 2, 3); }
            else { ctx.fillRect(-4, -11, 2, 3); }
        }

        // Wizard Hat
        ctx.fillStyle = '#111'; ctx.fillRect(-14, -17, 28, 6);
        ctx.beginPath(); ctx.moveTo(-10, -17); ctx.lineTo(0, -34); ctx.lineTo(10, -17); ctx.fill();
        ctx.fillStyle = '#4a0e57'; ctx.fillRect(-12, -16, 24, 4);
        ctx.beginPath(); ctx.moveTo(-8, -16); ctx.lineTo(0, -32); ctx.lineTo(8, -16); ctx.fill();
        // Gold band on hat
        ctx.fillStyle = '#ffd700'; ctx.fillRect(-8, -18, 16, 3);

        // Glowing Mage Staff
        const staffX = (dir === 6 || dir === 5 || dir === 7) ? -12 : 12;
        ctx.fillStyle = '#8b5a2b'; ctx.fillRect(staffX, -14, 4, 28);
        ctx.fillStyle = '#00ffff';
        ctx.beginPath(); ctx.arc(staffX + 2, -16, 5, 0, Math.PI * 2); ctx.fill();
    }

    // --- 3. MARTIAL ARTIST HD (拳聖與刺客大師) ---
    drawMartialHD(ctx, dir, stepL, stepR, isMoving, animTime) {
        const isNorth = (dir === 4 || dir === 3 || dir === 5);

        // Pants & Boots
        ctx.fillStyle = '#111'; ctx.fillRect(-7, 8 + stepL, 5, 9); ctx.fillRect(2, 8 + stepR, 5, 9);
        ctx.fillStyle = '#dcdcdc'; ctx.fillRect(-6, 8 + stepL, 4, 8); ctx.fillRect(2, 8 + stepR, 4, 8);

        // Orange Gi Body
        ctx.fillStyle = '#111'; ctx.fillRect(-10, -6, 20, 16);
        ctx.fillStyle = '#e65c00'; ctx.fillRect(-8, -5, 16, 14);
        ctx.fillStyle = '#111'; ctx.fillRect(-8, 3, 16, 3); // Black belt

        // Head
        ctx.fillStyle = '#111'; ctx.fillRect(-8, -18, 16, 13);
        ctx.fillStyle = '#ffe0bd'; ctx.fillRect(-6, -16, 12, 11);
        ctx.fillStyle = '#1a1a1a'; ctx.fillRect(-8, -24, 16, 8); // Spiky Hair

        // Red Headband
        ctx.fillStyle = '#dc143c'; ctx.fillRect(-7, -16, 14, 4);
        const tailWave = isMoving ? Math.sin(animTime * 14) * 5 : 0;
        ctx.fillRect(dir >= 4 ? -14 : 8, -16, 8 + tailWave, 3);

        // Eyes
        if (!isNorth) {
            ctx.fillStyle = '#111';
            if (dir === 0) { ctx.fillRect(-3, -12, 2, 3); ctx.fillRect(2, -12, 2, 3); }
            else if (dir === 2 || dir === 1) { ctx.fillRect(3, -12, 2, 3); }
            else { ctx.fillRect(-5, -12, 2, 3); }
        }
    }

    // --- 4. PRIEST HD (神聖引導者) ---
    drawPriestHD(ctx, dir, stepL, stepR, isMoving, animTime) {
        const isNorth = (dir === 4 || dir === 3 || dir === 5);

        ctx.fillStyle = '#111'; ctx.fillRect(-10, -5, 20, 22);
        ctx.fillStyle = '#20b2aa'; ctx.fillRect(-9, -4, 18, 20);
        ctx.fillStyle = '#f5f5f5'; ctx.fillRect(-4, -4, 8, 20);

        // Head
        ctx.fillStyle = '#111'; ctx.fillRect(-7, -15, 14, 11);
        ctx.fillStyle = '#ffe0bd'; ctx.fillRect(-5, -14, 10, 10);

        // Mitre Hat
        ctx.fillStyle = '#111'; ctx.fillRect(-8, -27, 16, 14);
        ctx.fillStyle = '#f5f5f5'; ctx.fillRect(-7, -26, 14, 12);
        ctx.fillStyle = '#ffd700'; ctx.fillRect(-1, -24, 2, 8); ctx.fillRect(-4, -21, 8, 2);

        if (!isNorth) {
            ctx.fillStyle = '#111';
            if (dir === 0) { ctx.fillRect(-3, -11, 2, 2); ctx.fillRect(2, -11, 2, 2); }
            else if (dir === 2 || dir === 1) { ctx.fillRect(2, -11, 2, 2); }
            else { ctx.fillRect(-4, -11, 2, 2); }
        }
    }

    // =========================================================================
    // 3. ULTRA-VISIBLE RADIANT EXP GEMS (超顯眼光環與發光寶石)
    // =========================================================================

    drawGem(gem, animTime) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(gem.x, gem.y);

        const bob = Math.sin(animTime * 6 + gem.x) * 3;
        ctx.translate(0, bob);

        // Pulsing light halo (呼吸感光暈)
        const pulse = 0.25 + Math.sin(animTime * 8) * 0.12;

        if (gem.val >= 400) {
            // Rainbow Crown Diamond (金屬史萊姆王 / 索瑪巨型彩虹鑽石)
            const haloR = 24 + Math.sin(animTime * 10) * 4;
            ctx.fillStyle = `rgba(255, 0, 255, ${pulse + 0.15})`;
            ctx.beginPath(); ctx.arc(0, 0, haloR, 0, Math.PI * 2); ctx.fill();

            // Diamond
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(12, 0); ctx.lineTo(0, 12); ctx.lineTo(-12, 0); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#ff00ff';
            ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(8, 0); ctx.lineTo(0, 8); ctx.lineTo(-8, 0); ctx.closePath(); ctx.fill();
            // Upward beacon of light
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.fillRect(-2, -50, 4, 45);

        } else if (gem.val >= 100) {
            // Gigantic Golden Sun Star (金幣 / 金屬史萊姆 100+ EXP)
            const haloR = 20 + Math.sin(animTime * 8) * 4;
            ctx.fillStyle = `rgba(255, 215, 0, ${pulse + 0.1})`;
            ctx.beginPath(); ctx.arc(0, 0, haloR, 0, Math.PI * 2); ctx.fill();

            // Golden 6-Point Star
            ctx.fillStyle = '#ffd700';
            ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(0, 0, 4.5, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5; ctx.stroke();

            // Upward light beacon
            ctx.fillStyle = 'rgba(255, 215, 0, 0.22)';
            ctx.fillRect(-1.5, -40, 3, 35);

        } else if (gem.val >= 10) {
            // Fiery Cut Ruby (10-50 EXP)
            const haloR = 16 + Math.sin(animTime * 7) * 3;
            ctx.fillStyle = `rgba(230, 57, 70, ${pulse})`;
            ctx.beginPath(); ctx.arc(0, 0, haloR, 0, Math.PI * 2); ctx.fill();

            // Ruby Hexagon
            ctx.fillStyle = '#e63946';
            ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(9, -2); ctx.lineTo(6, 8); ctx.lineTo(-6, 8); ctx.lineTo(-9, -2); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#ff758f'; // Facet highlight
            ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(5, -2); ctx.lineTo(0, 4); ctx.lineTo(-5, -2); ctx.closePath(); ctx.fill();

        } else if (gem.val >= 2) {
            // Luminous Emerald Jewel (3-5 EXP)
            const haloR = 14 + Math.sin(animTime * 6) * 3;
            ctx.fillStyle = `rgba(42, 157, 143, ${pulse})`;
            ctx.beginPath(); ctx.arc(0, 0, haloR, 0, Math.PI * 2); ctx.fill();

            // Emerald Diamond
            ctx.fillStyle = '#2a9d8f';
            ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(8, 0); ctx.lineTo(0, 8); ctx.lineTo(-8, 0); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#52b788'; // Inner facet
            ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(5, 0); ctx.lineTo(0, 5); ctx.lineTo(-5, 0); ctx.closePath(); ctx.fill();

        } else {
            // Radiant Azure Crystal Drop (1 EXP - 普通史萊姆經驗)
            const haloR = 12 + Math.sin(animTime * 6) * 2.5;
            ctx.fillStyle = `rgba(0, 180, 216, ${pulse})`;
            ctx.beginPath(); ctx.arc(0, 0, haloR, 0, Math.PI * 2); ctx.fill();

            // Crisp Cyan Jewel Drop
            ctx.fillStyle = '#0077b6';
            ctx.beginPath(); ctx.arc(0, 2, 6.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#00b4d8';
            ctx.beginPath(); ctx.arc(0, 2, 5, 0, Math.PI * 2); ctx.fill();
            // Sparkling glint
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-2, -1, 3, 3);
        }

        ctx.restore();
    }

    // =========================================================================
    // 4. ENEMY RENDERING
    // =========================================================================

    drawEnemy(enemy, animTime) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(enemy.x, enemy.y);

        if (enemy.hitFlashTimer > 0) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(0, 0, enemy.radius + 2, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
            return;
        }

        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.beginPath(); ctx.ellipse(0, enemy.radius * 0.85, enemy.radius * 0.8, enemy.radius * 0.35, 0, 0, Math.PI * 2); ctx.fill();

        const type = enemy.type;
        const r = enemy.radius;
        const bob = Math.sin(animTime * 8 + enemy.id) * 2;
        ctx.translate(0, bob);

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
            ctx.closePath(); ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.05, r * 0.28, 0, Math.PI * 2); ctx.arc(r * 0.35, -r * 0.05, r * 0.28, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#111';
            ctx.beginPath(); ctx.arc(-r * 0.32, -r * 0.05, r * 0.13, 0, Math.PI * 2); ctx.arc(r * 0.38, -r * 0.05, r * 0.13, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#e63946'; ctx.lineWidth = 1.8;
            ctx.beginPath(); ctx.arc(0, r * 0.25, r * 0.32, 0.2, Math.PI - 0.2); ctx.stroke();

        } else if (type === 'healslime') {
            ctx.fillStyle = '#ffd166';
            ctx.beginPath(); ctx.arc(0, -r * 0.3, r * 0.7, Math.PI, 0); ctx.lineTo(r * 0.7, 0); ctx.lineTo(-r * 0.7, 0); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(-4, -r * 0.3, 3.5, 0, Math.PI * 2); ctx.arc(4, -r * 0.3, 3.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#111'; ctx.fillRect(-4, -r * 0.3, 2, 2); ctx.fillRect(4, -r * 0.3, 2, 2);
            ctx.strokeStyle = '#00b4d8'; ctx.lineWidth = 2.5;
            for (let i = -2; i <= 2; i++) {
                const tw = Math.sin(animTime * 10 + i) * 4;
                ctx.beginPath(); ctx.moveTo(i * 5, 0); ctx.quadraticCurveTo(i * 5 + tw, r * 0.6, i * 6 - tw, r * 1.2); ctx.stroke();
            }

        } else if (type === 'liquid_metal_slime') {
            const grad = ctx.createLinearGradient(-r, -r, r, r);
            grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.5, '#adb5bd'); grad.addColorStop(1, '#ffffff');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.ellipse(0, r * 0.2, r * 1.3, r * 0.5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(-r * 0.2, -r * 0.2, r * 0.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.2, 4, 0, Math.PI * 2); ctx.arc(r * 0.05, -r * 0.2, 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#111'; ctx.fillRect(-r * 0.35, -r * 0.2, 2, 2); ctx.fillRect(r * 0.05, -r * 0.2, 2, 2);

        } else if (type === 'king_metal_slime') {
            const grad = ctx.createLinearGradient(-r, -r, r, r);
            grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.5, '#ced4da'); grad.addColorStop(1, '#ffffff');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(0, r * 0.2, r * 0.85, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffd700'; ctx.fillRect(-r * 0.5, -r * 1.1, r, 6);
            ctx.beginPath();
            ctx.moveTo(-r * 0.5, -r * 1.1); ctx.lineTo(-r * 0.5, -r * 1.5); ctx.lineTo(-r * 0.2, -r * 1.1);
            ctx.lineTo(0, -r * 1.6); ctx.lineTo(r * 0.2, -r * 1.1); ctx.lineTo(r * 0.5, -r * 1.5); ctx.lineTo(r * 0.5, -r * 1.1);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#e63946'; ctx.fillRect(-2, -r * 1.3, 4, 4);

        } else if (type === 'ghost') {
            ctx.fillStyle = 'rgba(224, 247, 250, 0.85)';
            ctx.beginPath(); ctx.arc(0, -r * 0.2, r * 0.7, Math.PI, 0); ctx.quadraticCurveTo(r * 0.8, r * 0.8, 0, r * 1.1); ctx.quadraticCurveTo(-r * 0.8, r * 0.8, -r * 0.7, -r * 0.2); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#111'; ctx.fillRect(-5, -r * 0.3, 3, 4); ctx.fillRect(2, -r * 0.3, 3, 4);
            ctx.fillStyle = '#e63946'; ctx.fillRect(-1, 0, 3, 5);

        } else if (type === 'dracky') {
            const flap = Math.sin(animTime * 14) * 8;
            ctx.fillStyle = '#4a0072';
            ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-r * 1.7, -flap); ctx.lineTo(-r * 1.2, flap + 4); ctx.closePath(); ctx.fill();
            ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(r * 1.7, -flap); ctx.lineTo(r * 1.2, flap + 4); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#8b008b'; ctx.beginPath(); ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff'; ctx.fillRect(-7, -r, 3, 4); ctx.fillRect(4, -r, 3, 4);
            ctx.fillStyle = '#ffff00'; ctx.beginPath(); ctx.arc(-4, -2, 3.5, 0, Math.PI * 2); ctx.arc(4, -2, 3.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#111'; ctx.fillRect(-4, -2, 2, 2); ctx.fillRect(4, -2, 2, 2);

        } else if (type === 'hammerhood') {
            ctx.fillStyle = '#a0522d'; ctx.beginPath(); ctx.arc(0, -2, r * 0.9, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#8b4513'; ctx.fillRect(-r, -r * 0.7, 5, 8); ctx.fillRect(r - 5, -r * 0.7, 5, 8);
            ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.fillRect(-4, -2, 2, 3); ctx.fillRect(2, -2, 2, 3);
            ctx.fillStyle = '#654321'; ctx.fillRect(r * 0.6, -r * 0.8, 4, r * 1.6);
            ctx.fillStyle = '#8b4513'; ctx.fillRect(r * 0.3, -r * 1.1, 10, 8);

        } else if (type === 'mud_hand') {
            ctx.fillStyle = '#8b5a2b'; ctx.fillRect(-r * 0.4, -r * 0.8, r * 0.8, r * 1.6);
            ctx.fillRect(-r * 0.6, -r * 1.2, 3, 6); ctx.fillRect(-r * 0.2, -r * 1.4, 3, 8);
            ctx.fillRect(r * 0.2, -r * 1.3, 3, 7); ctx.fillRect(r * 0.5, -r * 1.0, 3, 5);
            ctx.fillStyle = '#5c3818'; ctx.fillRect(-r, r * 0.6, r * 2, 4);

        } else if (type === 'skeleton') {
            ctx.fillStyle = '#f0f0f0'; ctx.beginPath(); ctx.arc(0, -r * 0.5, r * 0.45, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ff0000'; ctx.fillRect(-4, -r * 0.5, 2, 3); ctx.fillRect(2, -r * 0.5, 2, 3);
            ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 2; ctx.strokeRect(-r * 0.4, 0, r * 0.8, r * 0.6);
            ctx.fillStyle = '#888888'; ctx.fillRect(r * 0.5, -r * 0.8, 3, r * 1.5);

        } else if (type === 'restless_armour') {
            ctx.fillStyle = '#4682b4'; ctx.fillRect(-r * 0.6, -r * 0.6, r * 1.2, r * 1.2);
            ctx.fillStyle = '#2b547e'; ctx.fillRect(-r * 0.5, -r * 1.1, r, 7);
            ctx.fillStyle = '#ff0033'; ctx.fillRect(-4, -r * 0.8, 3, 2); ctx.fillRect(1, -r * 0.8, 3, 2);
            ctx.fillStyle = '#adb5bd'; ctx.fillRect(-r * 0.9, -r * 0.4, 5, r * 0.9);
            ctx.fillStyle = '#ffd700'; ctx.fillRect(r * 0.6, -r * 0.7, 3, r * 1.4);

        } else if (type === 'cyclops') {
            ctx.fillStyle = '#1e3f66'; ctx.beginPath(); ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#8b5a2b'; ctx.fillRect(-r * 0.6, r * 0.3, r * 1.2, r * 0.5);
            ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, -r * 0.2, r * 0.35, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ff0000'; ctx.beginPath(); ctx.arc(0, -r * 0.2, r * 0.16, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#654321'; ctx.fillRect(r * 0.7, -r * 1.1, 8, r * 1.8);

        } else if (type === 'mimic_king') {
            ctx.fillStyle = '#5c2c16'; ctx.fillRect(-r * 0.85, -r * 0.4, r * 1.7, r * 1.0);
            ctx.beginPath(); ctx.moveTo(-r * 0.85, -r * 0.4); ctx.lineTo(-r * 0.9, -r * 1.1); ctx.lineTo(r * 0.9, -r * 1.1); ctx.lineTo(r * 0.85, -r * 0.4); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#ffffff';
            for (let i = -3; i <= 3; i++) {
                ctx.beginPath(); ctx.moveTo(i * 6, -r * 0.4); ctx.lineTo(i * 6 + 3, -r * 0.7); ctx.lineTo(i * 6 + 6, -r * 0.4); ctx.fill();
            }
            ctx.fillStyle = '#ff0000'; ctx.beginPath(); ctx.arc(0, -r * 0.75, 5, 0, Math.PI * 2); ctx.fill();

        } else if (type === 'slime_knight') {
            ctx.fillStyle = '#00fa9a'; ctx.beginPath(); ctx.arc(0, r * 0.3, r * 0.65, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#c0c0c0'; ctx.fillRect(-r * 0.3, -r * 0.7, r * 0.6, r * 0.7);
            ctx.fillStyle = '#ff0000'; ctx.fillRect(-2, -r * 1.0, 4, 5);
            ctx.fillStyle = '#ffd700'; ctx.fillRect(r * 0.35, -r * 1.1, 3, r * 1.6);

        } else if (type === 'killer_machine') {
            ctx.fillStyle = '#4169e1'; ctx.fillRect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.2);
            ctx.fillStyle = '#222'; ctx.fillRect(-r * 0.6, r * 0.5, 4, r * 0.5); ctx.fillRect(r * 0.4, r * 0.5, 4, r * 0.5);
            ctx.fillStyle = '#ff0033'; ctx.beginPath(); ctx.arc(0, -r * 0.1, r * 0.25, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#e0e0e0'; ctx.fillRect(-r * 1.1, -r * 0.9, 4, r * 1.8); ctx.fillRect(r * 0.9, -r * 0.9, 4, r * 1.8);

        } else if (type === 'baramos') {
            ctx.fillStyle = '#7b1113'; ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#4a0e4e'; ctx.fillRect(-r * 0.7, -r * 0.5, r * 1.4, r * 1.1);
            ctx.fillStyle = '#ffd700'; ctx.fillRect(-r * 0.6, -r * 1.1, 4, 8); ctx.fillRect(r * 0.4, -r * 1.1, 4, 8);
            ctx.fillStyle = '#00ffcc'; ctx.fillRect(-6, -r * 0.3, 4, 4); ctx.fillRect(2, -r * 0.3, 4, 4);

        } else if (type === 'zoma') {
            const auraR = r * (1.1 + Math.sin(animTime * 6) * 0.12);
            ctx.fillStyle = 'rgba(0, 210, 255, 0.22)';
            ctx.beginPath(); ctx.arc(0, 0, auraR, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = '#1d2d50'; ctx.beginPath(); ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#133b5c';
            ctx.beginPath();
            ctx.moveTo(-r * 1.2, -r * 0.2); ctx.lineTo(-r * 0.5, -r * 0.9); ctx.lineTo(0, -r * 0.4);
            ctx.lineTo(r * 0.5, -r * 0.9); ctx.lineTo(r * 1.2, -r * 0.2); ctx.lineTo(0, r * 0.7);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#f8f9fa';
            ctx.beginPath(); ctx.moveTo(-r * 0.4, -r * 0.7); ctx.lineTo(-r * 0.9, -r * 1.4); ctx.lineTo(-r * 0.2, -r * 0.9); ctx.fill();
            ctx.beginPath(); ctx.moveTo(r * 0.4, -r * 0.7); ctx.lineTo(r * 0.9, -r * 1.4); ctx.lineTo(r * 0.2, -r * 0.9); ctx.fill();
            ctx.fillStyle = '#00ffff'; ctx.fillRect(-8, -r * 0.3, 5, 4); ctx.fillRect(3, -r * 0.3, 5, 4);

        } else if (type === 'great_dragon') {
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

    // =========================================================================
    // 5. WEAPONS & PROJECTILES RENDERING
    // =========================================================================

    drawProjectile(proj, animTime) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(proj.x, proj.y);

        const id = proj.weaponId;

        if (id === 'sword_loto' || id === 'true_loto_blade') {
            ctx.rotate(proj.angle);
            const isEvo = id === 'true_loto_blade';
            const arcR = proj.radius || 45;

            ctx.strokeStyle = isEvo ? '#ffd700' : '#4cc9f0';
            ctx.lineWidth = isEvo ? 10 : 6;
            ctx.lineCap = 'round';
            ctx.beginPath(); ctx.arc(0, 0, arcR, -Math.PI * 0.38, Math.PI * 0.38); ctx.stroke();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = isEvo ? 4 : 2;
            ctx.beginPath(); ctx.arc(0, 0, arcR, -Math.PI * 0.35, Math.PI * 0.35); ctx.stroke();

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

            ctx.fillStyle = isEvo ? '#ff0055' : '#ff5400';
            ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffea00';
            ctx.beginPath(); ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = isEvo ? '#ff00ff' : '#ffaa00'; ctx.lineWidth = 2.5; ctx.stroke();

        } else if (id === 'dagger_poison' || id === 'thousand_needles') {
            ctx.rotate(proj.angle);
            const isEvo = id === 'thousand_needles';

            ctx.fillStyle = isEvo ? '#9d4edd' : '#ced4da';
            ctx.fillRect(-12, -2.5, 24, 5);
            ctx.beginPath(); ctx.moveTo(12, -4); ctx.lineTo(20, 0); ctx.lineTo(12, 4); ctx.closePath(); ctx.fill();

            if (isEvo) {
                ctx.strokeStyle = 'rgba(157, 78, 221, 0.6)'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-30, 0); ctx.stroke();
            }

        } else if (id === 'axe_battle' || id === 'death_scythe') {
            ctx.rotate(proj.rotation);
            const isEvo = id === 'death_scythe';

            if (isEvo) {
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
            ctx.fillStyle = isEvo ? '#ffea00' : '#4cc9f0'; ctx.fillRect(-3, -5, 6, 10);

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

            for (let i = 0; i < 8; i++) {
                const angle = animTime * 0.9 + (i * Math.PI / 4);
                const rx = Math.cos(angle) * r;
                const ry = Math.sin(angle) * r;
                ctx.fillStyle = '#ffffff'; ctx.fillRect(rx - 2.5, ry - 2.5, 5, 5);
            }
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
