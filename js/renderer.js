// Dragon Quest Pixel & Procedural Graphics Renderer
class GameRenderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.patternCanvas = document.createElement('canvas');
        this.initTiles();
    }

    initTiles() {
        // Pre-render a retro DQ overworld grass tile pattern (64x64)
        this.patternCanvas.width = 64;
        this.patternCanvas.height = 64;
        const pCtx = this.patternCanvas.getContext('2d');

        // Lush DQ green field
        pCtx.fillStyle = '#48982a';
        pCtx.fillRect(0, 0, 64, 64);

        // Subtle grass pixel clusters
        pCtx.fillStyle = '#56aa32';
        pCtx.fillRect(8, 12, 4, 8);
        pCtx.fillRect(12, 16, 4, 4);
        pCtx.fillRect(40, 36, 4, 8);
        pCtx.fillRect(44, 40, 4, 4);

        pCtx.fillStyle = '#3a8020';
        pCtx.fillRect(24, 48, 4, 4);
        pCtx.fillRect(52, 18, 4, 4);

        // Tiny cute flower
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

        // Optional decorative grid / subtle dirt trail
        this.ctx.restore();
    }

    // --- Entity Drawing Methods ---

    drawPlayer(player, animTime) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(player.x, player.y);

        // Flash white when invincible / hurt
        if (player.invincibleTimer > 0 && Math.floor(animTime * 15) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // Face direction
        if (player.facing === -1) {
            ctx.scale(-1, 1);
        }

        const bob = player.isMoving ? Math.sin(animTime * 12) * 2.5 : 0;
        const charId = player.character.id;

        // Draw Player Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.beginPath();
        ctx.ellipse(0, 16, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.translate(0, bob);

        if (charId === 'hero') {
            // DQ Hero: Red Cape, Blue Tunic, Helmet with gold circlet, Sword
            // Cape
            ctx.fillStyle = '#c02222';
            ctx.beginPath();
            ctx.moveTo(-10, -4);
            ctx.lineTo(-18, 14);
            ctx.lineTo(-4, 12);
            ctx.closePath();
            ctx.fill();

            // Legs
            ctx.fillStyle = '#f0d090';
            ctx.fillRect(-6, 8, 4, 8);
            ctx.fillRect(2, 8, 4, 8);
            // Boots
            ctx.fillStyle = '#654321';
            ctx.fillRect(-7, 13, 5, 4);
            ctx.fillRect(1, 13, 5, 4);

            // Body / Blue Armor
            ctx.fillStyle = '#1e6fd9';
            ctx.fillRect(-8, -6, 16, 15);
            // Belt with gold buckle
            ctx.fillStyle = '#442200';
            ctx.fillRect(-8, 4, 16, 3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(-2, 4, 4, 3);

            // Head / Face
            ctx.fillStyle = '#ffe0bd';
            ctx.fillRect(-6, -16, 12, 11);
            // Hero Spiky Hair
            ctx.fillStyle = '#4a2912';
            ctx.fillRect(-8, -20, 16, 6);
            ctx.fillRect(-9, -17, 3, 5);
            // Gold Circlet
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(-7, -15, 14, 3);
            // Eye
            ctx.fillStyle = '#111';
            ctx.fillRect(2, -12, 2, 3);

            // Sheathed Sword or Weapon
            ctx.fillStyle = '#c0c0c0';
            ctx.fillRect(-12, -10, 3, 16);
            ctx.fillStyle = '#d4af37';
            ctx.fillRect(-14, -4, 7, 3);

        } else if (charId === 'mage') {
            // DQ Mage: Purple Robe & Wizard Hat, Wand
            // Robe
            ctx.fillStyle = '#7a288a';
            ctx.beginPath();
            ctx.moveTo(-9, -4);
            ctx.lineTo(-14, 16);
            ctx.lineTo(14, 16);
            ctx.lineTo(9, -4);
            ctx.closePath();
            ctx.fill();

            // Face
            ctx.fillStyle = '#ffe0bd';
            ctx.fillRect(-6, -14, 12, 10);
            ctx.fillStyle = '#111';
            ctx.fillRect(2, -10, 2, 2);

            // Wizard Hat
            ctx.fillStyle = '#5c166d';
            ctx.fillRect(-12, -16, 24, 4);
            ctx.beginPath();
            ctx.moveTo(-9, -16);
            ctx.lineTo(0, -30);
            ctx.lineTo(9, -16);
            ctx.closePath();
            ctx.fill();

            // Staff
            ctx.fillStyle = '#8b5a2b';
            ctx.fillRect(8, -12, 3, 26);
            // Glowing Crystal on staff
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.arc(9, -14, 4, 0, Math.PI * 2);
            ctx.fill();

        } else if (charId === 'martial') {
            // DQ Martial Artist: Orange Gi, Black Belt, Headband
            ctx.fillStyle = '#e65c00';
            ctx.fillRect(-8, -6, 16, 15);
            // Black belt
            ctx.fillStyle = '#111';
            ctx.fillRect(-8, 3, 16, 3);
            // Legs
            ctx.fillStyle = '#dcdcdc';
            ctx.fillRect(-6, 8, 4, 8);
            ctx.fillRect(2, 8, 4, 8);

            // Head
            ctx.fillStyle = '#ffe0bd';
            ctx.fillRect(-6, -16, 12, 11);
            // Spiky Hair
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(-8, -21, 16, 6);
            ctx.fillRect(5, -23, 4, 5);
            // Red Headband
            ctx.fillStyle = '#dc143c';
            ctx.fillRect(-7, -15, 14, 3);
            ctx.fillRect(-12, -14, 6, 2);
            // Eye
            ctx.fillStyle = '#111';
            ctx.fillRect(2, -11, 2, 3);

        } else {
            // DQ Priest: White / Teal habit & Mitre
            ctx.fillStyle = '#20b2aa';
            ctx.fillRect(-9, -4, 18, 20);
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(-5, -4, 10, 20);

            // Head
            ctx.fillStyle = '#ffe0bd';
            ctx.fillRect(-6, -14, 12, 10);
            ctx.fillStyle = '#111';
            ctx.fillRect(2, -10, 2, 2);

            // Mitre Hat
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(-7, -24, 14, 11);
            ctx.fillStyle = '#ffd700';
            // Cross on hat
            ctx.fillRect(-1, -22, 2, 7);
            ctx.fillRect(-4, -19, 8, 2);
        }

        ctx.restore();
    }

    drawEnemy(enemy, animTime) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(enemy.x, enemy.y);

        // Flash white on hit
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

        if (type === 'slime' || type === 'bubble_slime' || type === 'metal_slime') {
            // Classic DQ Slime Teardrop Shape!
            let bodyColor = enemy.data.color;
            if (type === 'metal_slime') {
                // Shiny metallic silver gradient
                const grad = ctx.createLinearGradient(-r, -r, r, r);
                grad.addColorStop(0, '#f0f0f0');
                grad.addColorStop(0.5, '#a6b0b8');
                grad.addColorStop(1, '#ffffff');
                bodyColor = grad;
            }

            ctx.fillStyle = bodyColor;
            ctx.beginPath();
            // Teardrop top tip
            ctx.moveTo(0, -r * 1.3);
            ctx.bezierCurveTo(r * 0.9, -r * 0.5, r * 1.25, r * 0.4, r * 0.9, r * 0.9);
            ctx.bezierCurveTo(r * 0.5, r * 1.2, -r * 0.5, r * 1.2, -r * 0.9, r * 0.9);
            ctx.bezierCurveTo(-r * 1.25, r * 0.4, -r * 0.9, -r * 0.5, 0, -r * 1.3);
            ctx.closePath();
            ctx.fill();

            // Slime Big Eyes
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-r * 0.35, -r * 0.05, r * 0.28, 0, Math.PI * 2);
            ctx.arc(r * 0.35, -r * 0.05, r * 0.28, 0, Math.PI * 2);
            ctx.fill();

            // Pupils
            ctx.fillStyle = '#111111';
            ctx.beginPath();
            ctx.arc(-r * 0.32, -r * 0.05, r * 0.13, 0, Math.PI * 2);
            ctx.arc(r * 0.38, -r * 0.05, r * 0.13, 0, Math.PI * 2);
            ctx.fill();

            // Smiling mouth
            ctx.strokeStyle = '#e63946';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(0, r * 0.25, r * 0.32, 0.2, Math.PI - 0.2);
            ctx.stroke();

            // Metal slime sparkles
            if (type === 'metal_slime' && Math.floor(animTime * 12) % 3 === 0) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(r * 0.4, -r * 0.8, 3, 3);
                ctx.fillRect(-r * 0.5, -r * 0.4, 2, 2);
            }

        } else if (type === 'dracky') {
            // Bat wings flapping
            const flap = Math.sin(animTime * 14) * 8;
            ctx.fillStyle = '#4a0072';
            // Left wing
            ctx.beginPath();
            ctx.moveTo(-8, 0);
            ctx.lineTo(-r * 1.7, -flap);
            ctx.lineTo(-r * 1.2, flap + 4);
            ctx.closePath();
            ctx.fill();
            // Right wing
            ctx.beginPath();
            ctx.moveTo(8, 0);
            ctx.lineTo(r * 1.7, -flap);
            ctx.lineTo(r * 1.2, flap + 4);
            ctx.closePath();
            ctx.fill();

            // Body
            ctx.fillStyle = '#8b008b';
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
            ctx.fill();

            // Devil Horns
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-7, -r, 3, 4);
            ctx.fillRect(4, -r, 3, 4);

            // Big Yellow Eyes
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(-4, -2, 3.5, 0, Math.PI * 2);
            ctx.arc(4, -2, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#111';
            ctx.fillRect(-4, -2, 2, 2);
            ctx.fillRect(4, -2, 2, 2);

            // Fangs
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-3, 4, 2, 3);
            ctx.fillRect(2, 4, 2, 3);

        } else if (type === 'hammerhood') {
            // Hooded brown beast with mallet
            ctx.fillStyle = '#a0522d';
            ctx.beginPath();
            ctx.arc(0, -2, r * 0.9, 0, Math.PI * 2);
            ctx.fill();

            // Floppy ears
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(-r, -r * 0.7, 5, 8);
            ctx.fillRect(r - 5, -r * 0.7, 5, 8);

            // Face opening
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
            ctx.fill();
            // Eyes
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-4, -2, 2, 3);
            ctx.fillRect(2, -2, 2, 3);

            // Giant wooden hammer
            ctx.fillStyle = '#654321';
            ctx.fillRect(r * 0.6, -r * 0.8, 4, r * 1.6);
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(r * 0.3, -r * 1.1, 10, 8);

        } else if (type === 'mud_hand') {
            // Mud hand reaching out
            ctx.fillStyle = '#8b5a2b';
            ctx.fillRect(-r * 0.4, -r * 0.8, r * 0.8, r * 1.6);
            // Fingers
            ctx.fillRect(-r * 0.6, -r * 1.2, 3, 6);
            ctx.fillRect(-r * 0.2, -r * 1.4, 3, 8);
            ctx.fillRect(r * 0.2, -r * 1.3, 3, 7);
            ctx.fillRect(r * 0.5, -r * 1.0, 3, 5);
            // Mud ripples
            ctx.fillStyle = '#5c3818';
            ctx.fillRect(-r, r * 0.6, r * 2, 4);

        } else if (type === 'skeleton') {
            // Skeleton ribcage & skull
            ctx.fillStyle = '#f0f0f0';
            ctx.beginPath();
            ctx.arc(0, -r * 0.5, r * 0.45, 0, Math.PI * 2);
            ctx.fill();
            // Eye sockets with red glow
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(-4, -r * 0.5, 2, 3);
            ctx.fillRect(2, -r * 0.5, 2, 3);

            // Ribs
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 2;
            ctx.strokeRect(-r * 0.4, 0, r * 0.8, r * 0.6);
            ctx.beginPath();
            ctx.moveTo(-r * 0.3, r * 0.2);
            ctx.lineTo(r * 0.3, r * 0.2);
            ctx.moveTo(-r * 0.3, r * 0.4);
            ctx.lineTo(r * 0.3, r * 0.4);
            ctx.stroke();

            // Rusty sword
            ctx.fillStyle = '#888888';
            ctx.fillRect(r * 0.5, -r * 0.8, 3, r * 1.5);

        } else if (type === 'golem') {
            // Blocky brick titan
            ctx.fillStyle = '#b8860b';
            ctx.fillRect(-r * 0.85, -r * 0.9, r * 1.7, r * 1.7);
            // Brick lines
            ctx.strokeStyle = '#7c5a00';
            ctx.lineWidth = 2;
            ctx.strokeRect(-r * 0.85, -r * 0.9, r * 1.7, r * 1.7);
            ctx.beginPath();
            ctx.moveTo(-r * 0.85, 0); ctx.lineTo(r * 0.85, 0);
            ctx.moveTo(0, -r * 0.9); ctx.lineTo(0, 0);
            ctx.moveTo(-r * 0.4, 0); ctx.lineTo(-r * 0.4, r * 0.8);
            ctx.moveTo(r * 0.4, 0); ctx.lineTo(r * 0.4, r * 0.8);
            ctx.stroke();

            // Glowing yellow eyes
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(-6, -r * 0.4, 4, 4);
            ctx.fillRect(2, -r * 0.4, 4, 4);

        } else if (type === 'slime_knight') {
            // Slime Mount
            ctx.fillStyle = '#00fa9a';
            ctx.beginPath();
            ctx.arc(0, r * 0.3, r * 0.65, 0, Math.PI * 2);
            ctx.fill();
            // Tiny knight rider
            ctx.fillStyle = '#c0c0c0';
            ctx.fillRect(-r * 0.3, -r * 0.7, r * 0.6, r * 0.7);
            // Helmet visor with red plume
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(-2, -r * 1.0, 4, 5);
            ctx.fillStyle = '#111';
            ctx.fillRect(-r * 0.2, -r * 0.5, r * 0.4, 2);
            // Lance
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(r * 0.35, -r * 1.1, 3, r * 1.6);

        } else if (type === 'killer_machine') {
            // DQ Killer Machine: Dual robotic swords, blue plating, red cyclops lens
            ctx.fillStyle = '#4169e1';
            ctx.fillRect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.2);
            // Mechanical legs
            ctx.fillStyle = '#222';
            ctx.fillRect(-r * 0.6, r * 0.5, 4, r * 0.5);
            ctx.fillRect(r * 0.4, r * 0.5, 4, r * 0.5);

            // Cyclops red laser eye
            ctx.fillStyle = '#ff0033';
            ctx.beginPath();
            ctx.arc(0, -r * 0.1, r * 0.25, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-1, -r * 0.1 - 1, 2, 2);

            // Dual blades
            ctx.fillStyle = '#e0e0e0';
            ctx.fillRect(-r * 1.1, -r * 0.9, 4, r * 1.8);
        } else if (type === 'chimera') {
            // DQ Chimera: Winged mythical beast with eagle beak & horns
            ctx.fillStyle = '#ff6b35';
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
            ctx.fill();

            // Feathered wings
            const wingFlap = Math.sin(animTime * 12) * 6;
            ctx.fillStyle = '#f7c59f';
            ctx.beginPath();
            ctx.moveTo(-6, 0); ctx.lineTo(-r * 1.5, -wingFlap - 4); ctx.lineTo(-r * 0.8, 8); ctx.closePath(); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(6, 0); ctx.lineTo(r * 1.5, -wingFlap - 4); ctx.lineTo(r * 0.8, 8); ctx.closePath(); ctx.fill();

            // Beak
            ctx.fillStyle = '#ffd166';
            ctx.beginPath();
            ctx.moveTo(r * 0.4, -4); ctx.lineTo(r * 1.1, 0); ctx.lineTo(r * 0.4, 4); ctx.closePath(); ctx.fill();

            // Fierce Eyes
            ctx.fillStyle = '#111';
            ctx.fillRect(r * 0.1, -5, 3, 3);

        } else if (type === 'archdemon') {
            // DQ Archdemon: Purple winged devil holding trident
            ctx.fillStyle = '#5a189a';
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
            ctx.fill();

            // Bat wings
            ctx.fillStyle = '#3c096c';
            ctx.beginPath();
            ctx.moveTo(-6, 0); ctx.lineTo(-r * 1.4, -8); ctx.lineTo(-r * 0.7, 10); ctx.closePath(); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(6, 0); ctx.lineTo(r * 1.4, -8); ctx.lineTo(r * 0.7, 10); ctx.closePath(); ctx.fill();

            // Curved Horns
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(-r * 0.6, -r * 1.1, 4, 7);
            ctx.fillRect(r * 0.35, -r * 1.1, 4, 7);

            // Red glowing eyes
            ctx.fillStyle = '#ff0055';
            ctx.fillRect(-5, -3, 3, 3);
            ctx.fillRect(2, -3, 3, 3);

            // Demon Trident
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(r * 0.8, -r * 1.0, 3, r * 1.8);
            ctx.fillRect(r * 0.6, -r * 1.2, 7, 3);

        } else if (type === 'great_dragon' || type === 'dragonlord') {
            // Boss Dragon / Dragonlord
            const isLord = type === 'dragonlord';
            ctx.fillStyle = isLord ? '#3a0ca3' : '#c1121f';

            // Huge wings
            const wingFlap = Math.sin(animTime * 8) * 12;
            ctx.beginPath();
            ctx.moveTo(-r * 0.5, 0);
            ctx.lineTo(-r * 1.8, -r * 0.8 + wingFlap);
            ctx.lineTo(-r * 0.8, r * 0.5);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(r * 0.5, 0);
            ctx.lineTo(r * 1.8, -r * 0.8 + wingFlap);
            ctx.lineTo(r * 0.8, r * 0.5);
            ctx.closePath();
            ctx.fill();

            // Heavy Body
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
            ctx.fill();

            // Belly Scales
            ctx.fillStyle = isLord ? '#ffd166' : '#f4a261';
            ctx.beginPath();
            ctx.ellipse(0, r * 0.2, r * 0.45, r * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Horns
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-r * 0.5, -r * 1.1, 4, 8);
            ctx.fillRect(r * 0.35, -r * 1.1, 4, 8);

            // Fierce Demonic Eyes
            ctx.fillStyle = isLord ? '#00ffff' : '#ffff00';
            ctx.fillRect(-8, -r * 0.3, 5, 4);
            ctx.fillRect(4, -r * 0.3, 5, 4);

            // Boss Crown for Dragonlord
            if (isLord) {
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(-r * 0.4, -r * 1.3, r * 0.8, 6);
                ctx.fillRect(-r * 0.4, -r * 1.5, 3, 5);
                ctx.fillRect(-2, -r * 1.6, 4, 6);
                ctx.fillRect(r * 0.4 - 3, -r * 1.5, 3, 5);
            }
        } else {
            // Default monster fallback
            ctx.fillStyle = enemy.data.color || '#ff0000';
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw Health Bar for Mini-boss / Bosses
        if (enemy.data.isBoss) {
            const barW = r * 2.4;
            const barH = 5;
            const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(-barW / 2, -r - 12, barW, barH);
            ctx.fillStyle = enemy.data.isFinalBoss ? '#9d4edd' : '#e63946';
            ctx.fillRect(-barW / 2, -r - 12, barW * hpRatio, barH);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(-barW / 2, -r - 12, barW, barH);
        }

        ctx.restore();
    }

    drawProjectile(proj, animTime) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(proj.x, proj.y);

        const id = proj.weaponId;

        if (id === 'sword_loto' || id === 'true_loto_blade') {
            // Sword Slash Arc
            ctx.rotate(proj.angle);
            const isEvo = id === 'true_loto_blade';
            const arcR = proj.radius || 40;

            ctx.strokeStyle = isEvo ? '#ffd700' : '#4cc9f0';
            ctx.lineWidth = isEvo ? 8 : 5;
            ctx.beginPath();
            ctx.arc(0, 0, arcR, -Math.PI * 0.35, Math.PI * 0.35);
            ctx.stroke();

            // Holy gleam
            if (isEvo) {
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(arcR * 0.8, 0, 6, 0, Math.PI * 2);
                ctx.fill();
            }

        } else if (id === 'wand_frizz' || id === 'wand_kafrizz') {
            // Fireball
            const isEvo = id === 'wand_kafrizz';
            const r = isEvo ? 14 : 8;

            ctx.fillStyle = isEvo ? '#ff0055' : '#ff5400';
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();

            // Inner hot core
            ctx.fillStyle = '#ffea00';
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
            ctx.fill();

            // Smoke / fire trail
            ctx.fillStyle = 'rgba(255, 100, 0, 0.4)';
            ctx.beginPath();
            ctx.arc(-proj.vx * 0.04, -proj.vy * 0.04, r * 0.7, 0, Math.PI * 2);
            ctx.fill();

        } else if (id === 'dagger_poison' || id === 'thousand_needles') {
            // Dagger / Needles
            ctx.rotate(proj.angle);
            const isEvo = id === 'thousand_needles';

            ctx.fillStyle = isEvo ? '#9d4edd' : '#ced4da';
            ctx.fillRect(-10, -2, 20, 4);
            // Tip
            ctx.beginPath();
            ctx.moveTo(10, -3);
            ctx.lineTo(16, 0);
            ctx.lineTo(10, 3);
            ctx.closePath();
            ctx.fill();

        } else if (id === 'axe_battle' || id === 'death_scythe') {
            // Spinning Battle Axe / Death Scythe
            ctx.rotate(proj.rotation);
            const isEvo = id === 'death_scythe';

            if (isEvo) {
                // Giant Purple Death Scythe
                ctx.fillStyle = '#7209b7';
                ctx.beginPath();
                ctx.arc(0, 0, 22, 0, Math.PI * 0.7);
                ctx.lineTo(0, 0);
                ctx.closePath();
                ctx.fill();
                // Golden handle
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(-2, -18, 4, 36);
            } else {
                // Double-edged Battle Axe
                ctx.fillStyle = '#6c757d';
                ctx.beginPath();
                ctx.arc(-10, -6, 12, 0, Math.PI);
                ctx.arc(10, -6, 12, 0, Math.PI);
                ctx.fill();
                ctx.fillStyle = '#8b5a2b';
                ctx.fillRect(-2, -14, 4, 28);
            }

        } else if (id === 'boomerang' || id === 'sacred_boomerang') {
            // Spinning Boomerang
            ctx.rotate(proj.rotation);
            const isEvo = id === 'sacred_boomerang';

            ctx.fillStyle = isEvo ? '#ffd700' : '#e76f51';
            // Cross shape / Curved Boomerang
            ctx.fillRect(-14, -3, 28, 6);
            ctx.fillRect(-3, -14, 6, 28);

            if (isEvo) {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.strokeRect(-14, -3, 28, 6);
                ctx.strokeRect(-3, -14, 6, 28);
            }

        } else if (id === 'tome_sizz' || id === 'halo_kasizz') {
            // Orbiting Holy Script Book / Blaze Wall
            ctx.rotate(proj.rotation || 0);
            const isEvo = id === 'halo_kasizz';

            ctx.fillStyle = isEvo ? '#f72585' : '#4361ee';
            ctx.fillRect(-8, -10, 16, 20);
            // Spine & pages
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-6, -8, 12, 16);
            // Glowing rune
            ctx.fillStyle = isEvo ? '#ffea00' : '#4cc9f0';
            ctx.fillRect(-2, -4, 4, 8);

        } else if (id === 'wand_bang' || id === 'wrath_kaboom') {
            // Explosion Ring
            const isEvo = id === 'wrath_kaboom';
            const progress = proj.timer / proj.lifetime;
            const currentR = proj.radius * Math.sin(progress * Math.PI);

            ctx.fillStyle = isEvo ? 'rgba(255, 0, 100, 0.45)' : 'rgba(255, 140, 0, 0.45)';
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(1, currentR), 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.stroke();

        } else if (id === 'aura_herb' || id === 'domain_yggdrasil') {
            // Pulsing Herb Ring / Yggdrasil Domain
            const isEvo = id === 'domain_yggdrasil';
            const r = proj.radius;
            const alpha = 0.15 + Math.sin(animTime * 5) * 0.08;

            ctx.fillStyle = isEvo ? `rgba(46, 204, 113, ${alpha + 0.1})` : `rgba(76, 175, 80, ${alpha})`;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = isEvo ? '#2ecc71' : '#81c784';
            ctx.lineWidth = isEvo ? 3 : 1.5;
            ctx.stroke();

            // Runes around boundary
            for (let i = 0; i < 6; i++) {
                const angle = animTime * 0.8 + (i * Math.PI / 3);
                const rx = Math.cos(angle) * r;
                const ry = Math.sin(angle) * r;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(rx - 2, ry - 2, 4, 4);
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

        if (gem.val >= 100) {
            // Gold Super Gem
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(0, 0, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else if (gem.val >= 10) {
            // Red Ruby
            ctx.fillStyle = '#e63946';
            ctx.beginPath();
            ctx.moveTo(0, -6);
            ctx.lineTo(6, 0);
            ctx.lineTo(0, 6);
            ctx.lineTo(-6, 0);
            ctx.closePath();
            ctx.fill();
        } else if (gem.val >= 2) {
            // Green Emerald
            ctx.fillStyle = '#2a9d8f';
            ctx.beginPath();
            ctx.moveTo(0, -5);
            ctx.lineTo(5, 0);
            ctx.lineTo(0, 5);
            ctx.lineTo(-5, 0);
            ctx.closePath();
            ctx.fill();
        } else {
            // Classic Blue Waterdrop
            ctx.fillStyle = '#00b4d8';
            ctx.beginPath();
            ctx.arc(0, 1, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-1, -2, 2, 2);
        }

        ctx.restore();
    }

    drawChest(chest, animTime) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(chest.x, chest.y);

        const bob = Math.sin(animTime * 6) * 3;
        ctx.translate(0, bob);

        // Golden shining aura
        const glow = 16 + Math.sin(animTime * 10) * 4;
        ctx.fillStyle = 'rgba(255, 215, 0, 0.35)';
        ctx.beginPath();
        ctx.arc(0, 0, glow, 0, Math.PI * 2);
        ctx.fill();

        // Classic DQ Wooden Chest
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(-12, -8, 24, 16);
        // Golden trims & lock
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-12, -8, 24, 3);
        ctx.fillRect(-12, 5, 24, 3);
        ctx.fillRect(-2, -3, 4, 6);

        ctx.restore();
    }

    drawFloatingText(fText) {
        const ctx = this.ctx;
        ctx.save();
        ctx.font = fText.isCrit ? 'bold 16px monospace' : (fText.isEvo ? 'bold 18px monospace' : 'bold 12px monospace');
        ctx.textAlign = 'center';

        // Shadow outline
        ctx.fillStyle = '#000000';
        ctx.fillText(fText.text, fText.x + 1, fText.y + 1);

        // Text fill
        ctx.fillStyle = fText.color;
        ctx.fillText(fText.text, fText.x, fText.y);

        ctx.restore();
    }
}

window.GameRenderer = GameRenderer;
