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

        // 1. Cape (Billowing Crimson Cape with folds)
        const capeWave = isMoving ? Math.sin(animTime * 12) * 6 : Math.sin(animTime * 3) * 2;
        if (!isNorth) {
            ctx.fillStyle = '#0a0a0a'; // Dark Outline
            ctx.beginPath();
            ctx.moveTo(-11, -5); ctx.lineTo(-19 - capeWave, 21); ctx.lineTo(19 + capeWave, 21); ctx.lineTo(11, -5);
            ctx.closePath(); ctx.fill();

            // Rich Crimson Gradient Cape
            const capeGrad = ctx.createLinearGradient(0, -5, 0, 22);
            capeGrad.addColorStop(0, '#9e0c1b'); capeGrad.addColorStop(1, '#e63946');
            ctx.fillStyle = capeGrad;
            ctx.beginPath();
            ctx.moveTo(-9, -4); ctx.lineTo(-17 - capeWave, 19); ctx.lineTo(17 + capeWave, 19); ctx.lineTo(9, -4);
            ctx.closePath(); ctx.fill();

            // Wavy Cape Creases
            ctx.strokeStyle = '#780016'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(-6, -2); ctx.lineTo(-10 - capeWave * 0.6, 18); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(6, -2); ctx.lineTo(10 + capeWave * 0.6, 18); ctx.stroke();
        }

        // 2. Armored Legs & Leather Greaves
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(-7, 8 + stepL, 6, 12); ctx.fillRect(1, 8 + stepR, 6, 12);
        ctx.fillStyle = '#543015'; // Dark leather boots
        ctx.fillRect(-6, 9 + stepL, 4, 10); ctx.fillRect(2, 9 + stepR, 4, 10);
        ctx.fillStyle = '#ffd700'; // Golden knee guard plates
        ctx.fillRect(-6, 8 + stepL, 4, 3); ctx.fillRect(2, 8 + stepR, 4, 3);

        // 3. Torso / Royal Loto Blue Cuirass with Gold Trim
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(-10, -6, 20, 17);
        ctx.fillStyle = '#155ac4'; // Royal Blue
        ctx.fillRect(-8, -5, 16, 15);
        ctx.fillStyle = '#ffd700'; // Gold chainmail border
        ctx.strokeRect(-8.5, -5.5, 17, 16);

        // Emblazoned Golden Loto Phoenix (羅德之紋)
        if (isSouth) {
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            // Winged Phoenix symbol on chest
            ctx.moveTo(0, -4); ctx.lineTo(6, -1); ctx.lineTo(4, 2); ctx.lineTo(0, 5); ctx.lineTo(-4, 2); ctx.lineTo(-6, -1);
            ctx.closePath(); ctx.fill();
            // Central Red Loto Core Gem
            ctx.fillStyle = '#e63946';
            ctx.beginPath(); ctx.arc(0, 0.5, 2.2, 0, Math.PI * 2); ctx.fill();
        }

        // Belt & Golden Lion Buckle
        ctx.fillStyle = '#3a200a'; ctx.fillRect(-8, 6, 16, 4);
        ctx.fillStyle = '#ffd700'; ctx.fillRect(-3, 6, 6, 4);
        ctx.fillStyle = '#111'; ctx.fillRect(-1, 7, 2, 2);

        // 4. Head, Spiky Hair & Toriyama Anime Expression
        ctx.fillStyle = '#0a0a0a'; ctx.fillRect(-8, -19, 16, 14); // Head outline
        ctx.fillStyle = '#ffdfba'; ctx.fillRect(-6, -18, 12, 12); // Peach skin

        // Spiky Brown Anime Hair (鳥山明經典刺蝟髮型)
        ctx.fillStyle = '#4a2810';
        ctx.beginPath();
        ctx.moveTo(-9, -18);
        ctx.lineTo(-12, -25); ctx.lineTo(-7, -22);
        ctx.lineTo(-4, -28); ctx.lineTo(0, -23);
        ctx.lineTo(4, -28); ctx.lineTo(7, -22);
        ctx.lineTo(12, -25); ctx.lineTo(9, -18);
        ctx.closePath(); ctx.fill();

        // Winged Silver-Gold Helmet & Diadem (羅德之盔 - 雙翼展翅與額前藍寶石)
        ctx.fillStyle = '#ffd700'; // Golden Circlet
        ctx.fillRect(-7, -17, 14, 4);
        // Center Brilliant Sapphire
        ctx.fillStyle = '#00d2ff';
        ctx.beginPath(); ctx.arc(0, -15, 2.8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.fillRect(-0.8, -16, 1.2, 1.2); // Gem glint

        // Winged Ears on Helmet
        ctx.fillStyle = '#e0e0e0'; // Silver Feathers
        ctx.beginPath(); ctx.moveTo(-7, -17); ctx.lineTo(-13, -24); ctx.lineTo(-9, -14); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(7, -17); ctx.lineTo(13, -24); ctx.lineTo(9, -14); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1;
        ctx.stroke();

        // Anime Eyes & Eyebrows
        ctx.fillStyle = '#0a0a0a';
        if (dir === 0) { // South (Front)
            // Confident Eyebrows
            ctx.fillRect(-5, -15, 4, 1.5); ctx.fillRect(1, -15, 4, 1.5);
            // Expressive Eyes
            ctx.fillRect(-4, -13, 3, 4); ctx.fillRect(1, -13, 3, 4);
            ctx.fillStyle = '#ffffff'; ctx.fillRect(-3, -13, 1.5, 1.5); ctx.fillRect(2, -13, 1.5, 1.5); // Highlight
        } else if (dir === 1) { // SE
            ctx.fillRect(-2, -13, 3, 4); ctx.fillRect(3, -13, 3, 4);
            ctx.fillStyle = '#fff'; ctx.fillRect(-1, -13, 1.5, 1.5);
        } else if (dir === 7) { // SW
            ctx.fillRect(-6, -13, 3, 4); ctx.fillRect(-1, -13, 3, 4);
            ctx.fillStyle = '#fff'; ctx.fillRect(-5, -13, 1.5, 1.5);
        } else if (dir === 2) { // East
            ctx.fillRect(2, -13, 3, 4); ctx.fillStyle = '#fff'; ctx.fillRect(3, -13, 1.5, 1.5);
        } else if (dir === 6) { // West
            ctx.fillRect(-5, -13, 3, 4); ctx.fillStyle = '#fff'; ctx.fillRect(-4, -13, 1.5, 1.5);
        } else { // North (Back view)
            ctx.fillStyle = '#4a2810'; ctx.fillRect(-7, -18, 14, 12); // Back hair
            // Sword Scabbard strapped across back
            ctx.fillStyle = '#3a200a'; ctx.fillRect(-3, -17, 6, 26);
            ctx.fillStyle = '#ffd700'; ctx.fillRect(-5, -10, 10, 4); ctx.fillRect(-4, 6, 8, 3);
        }

        // 5. Sword of Loto & Shield of Loto (羅德之劍與羅德之盾)
        if (!isNorth) {
            if (isEast || dir === 0) {
                // Shield on Left Arm (Right side from viewer in mirror)
                this.drawLotoShield(ctx, -14, -2);
                this.drawLotoSword(ctx, 11, -5);
            } else if (isWest) {
                this.drawLotoShield(ctx, 14, -2);
                this.drawLotoSword(ctx, -11, -5);
            }
        }
    }

    // Legendary Shield of Loto (羅德之盾 - 藍色底、黃金雙翼鳥紋章、朱紅邊框)
    drawLotoShield(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        // Outer Rim (Crimson with Gold Studs)
        ctx.fillStyle = '#9e0c1b';
        ctx.beginPath();
        ctx.moveTo(0, -9); ctx.lineTo(7, -6); ctx.lineTo(6, 4); ctx.lineTo(0, 10); ctx.lineTo(-6, 4); ctx.lineTo(-7, -6);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1.2; ctx.stroke();

        // Inner Royal Blue Shield Field
        ctx.fillStyle = '#155ac4';
        ctx.beginPath();
        ctx.moveTo(0, -7); ctx.lineTo(5, -4.5); ctx.lineTo(4.5, 3); ctx.lineTo(0, 8); ctx.lineTo(-4.5, 3); ctx.lineTo(-5, -4.5);
        ctx.closePath(); ctx.fill();

        // Golden Double-Winged Loto Phoenix (黃金雙翼)
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(0, -4); ctx.lineTo(3.5, -2); ctx.lineTo(2, 0); ctx.lineTo(0, 4); ctx.lineTo(-2, 0); ctx.lineTo(-3.5, -2);
        ctx.closePath(); ctx.fill();
        ctx.restore();
    }

    // Legendary Sword of Loto (羅德之劍 - 黃金飛翼護手、神聖符文雙刃長劍)
    drawLotoSword(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        // Gleaming Steel Blade
        ctx.fillStyle = '#e8edf3';
        ctx.beginPath();
        ctx.moveTo(0, -16); ctx.lineTo(2.5, -3); ctx.lineTo(-2.5, -3);
        ctx.closePath(); ctx.fill();
        // Central Fuller Groove
        ctx.strokeStyle = '#9aa5b1'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(0, -3); ctx.stroke();

        // Golden Winged Crossguard
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(-6, -2); ctx.lineTo(6, -2); ctx.lineTo(4, 1); ctx.lineTo(0, 2); ctx.lineTo(-4, 1);
        ctx.closePath(); ctx.fill();

        // Red Ruby Center Gem
        ctx.fillStyle = '#e63946'; ctx.beginPath(); ctx.arc(0, 0, 1.5, 0, Math.PI * 2); ctx.fill();

        // Hilt & Pommel Jewel
        ctx.fillStyle = '#3a200a'; ctx.fillRect(-1, 1, 2, 5); // Grip
        ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(0, 7, 2, 0, Math.PI * 2); ctx.fill(); // Pommel
        ctx.restore();
    }

    // --- 2. MAGE HD (DQ3 經典皇家女魔導士 - 尖頂星月巫師帽、雙馬尾、符文法袍) ---
    drawMageHD(ctx, dir, stepL, stepR, isMoving, animTime) {
        const isNorth = (dir === 4 || dir === 3 || dir === 5);

        // Purple Robe with Golden Mystic Runes
        ctx.fillStyle = '#0a0a0a';
        ctx.beginPath(); ctx.moveTo(-11, -4); ctx.lineTo(-16, 18); ctx.lineTo(16, 18); ctx.lineTo(11, -4); ctx.fill();
        ctx.fillStyle = '#6b1d7d';
        ctx.beginPath(); ctx.moveTo(-9, -4); ctx.lineTo(-14, 16); ctx.lineTo(14, 16); ctx.lineTo(9, -4); ctx.fill();
        // Fluffy White Cowl Collar
        ctx.fillStyle = '#f8f9fa'; ctx.fillRect(-8, -4, 16, 4);
        // Golden Robe Hem with Runes
        ctx.fillStyle = '#ffd700'; ctx.fillRect(-14, 13, 28, 3);

        // Face & Hair
        ctx.fillStyle = '#ffdfba'; ctx.fillRect(-6, -15, 12, 10);
        // Twin Blonde Pigtails (金髮雙馬尾)
        ctx.fillStyle = '#f9c74f';
        const hairWave = isMoving ? Math.sin(animTime * 10) * 3 : 0;
        ctx.beginPath(); ctx.moveTo(-7, -13); ctx.lineTo(-12, -7 + hairWave); ctx.lineTo(-8, -5); ctx.fill();
        ctx.beginPath(); ctx.moveTo(7, -13); ctx.lineTo(12, -7 + hairWave); ctx.lineTo(8, -5); ctx.fill();
        // Red Ribbon Ties
        ctx.fillStyle = '#e63946'; ctx.fillRect(-9, -12, 3, 2); ctx.fillRect(6, -12, 3, 2);

        // Expressive Anime Eyes
        if (!isNorth) {
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(-4, -12, 2.5, 3.5); ctx.fillRect(1.5, -12, 2.5, 3.5);
            ctx.fillStyle = '#fff'; ctx.fillRect(-3.5, -12, 1, 1.5); ctx.fillRect(2, -12, 1, 1.5);
        }

        // Classic Floppy Pointed Wizard Hat with Moon Crest (星月巫師帽)
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(-15, -17, 30, 5);
        ctx.beginPath(); ctx.moveTo(-10, -17); ctx.lineTo(-4, -36); ctx.lineTo(8, -17); ctx.fill();
        ctx.fillStyle = '#4a0e57';
        ctx.fillRect(-13, -16, 26, 3.5);
        ctx.beginPath(); ctx.moveTo(-8, -16); ctx.lineTo(-4, -34); ctx.lineTo(6, -16); ctx.fill();
        // Golden Crescent Moon Badge
        ctx.fillStyle = '#ffd700';
        ctx.beginPath(); ctx.arc(-1, -21, 3, 0.4, Math.PI * 1.6); ctx.stroke();

        // Carved Magic Staff with Radiant Crimson Orb
        const staffX = (dir === 6 || dir === 5 || dir === 7) ? -14 : 14;
        ctx.fillStyle = '#543015'; ctx.fillRect(staffX - 1.5, -16, 3, 30);
        ctx.fillStyle = '#ffd700'; ctx.fillRect(staffX - 3, -17, 6, 2); // Staff crown
        // Glowing Orb with pulsing magic light
        const glow = 0.5 + Math.sin(animTime * 10) * 0.3;
        ctx.fillStyle = `rgba(255, 0, 100, ${glow})`;
        ctx.beginPath(); ctx.arc(staffX, -20, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ff0055';
        ctx.beginPath(); ctx.arc(staffX, -20, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.fillRect(staffX - 1.5, -21.5, 2, 2);
    }

    // --- 3. MARTIAL ARTIST HD (DQ3 經典拳聖武道家 - 飄逸紅色英雄頭帶、格鬥護腕) ---
    drawMartialHD(ctx, dir, stepL, stepR, isMoving, animTime) {
        const isNorth = (dir === 4 || dir === 3 || dir === 5);

        // White Kung-Fu Pants & Step Movement
        ctx.fillStyle = '#0a0a0a'; ctx.fillRect(-7, 8 + stepL, 5, 10); ctx.fillRect(2, 8 + stepR, 5, 10);
        ctx.fillStyle = '#eaeaea'; ctx.fillRect(-6, 8 + stepL, 4, 9); ctx.fillRect(2, 8 + stepR, 4, 9);

        // Orange/Red Martial Arts Gi (經典武道服)
        ctx.fillStyle = '#0a0a0a'; ctx.fillRect(-10, -6, 20, 16);
        ctx.fillStyle = '#e65c00'; ctx.fillRect(-8, -5, 16, 14);
        ctx.fillStyle = '#ffdfba'; // V-Neck Skin
        ctx.beginPath(); ctx.moveTo(-3, -5); ctx.lineTo(3, -5); ctx.lineTo(0, -1); ctx.fill();
        ctx.fillStyle = '#111'; ctx.fillRect(-8, 3, 16, 3.5); // Black Belt

        // Head & Wild Spiky Hair
        ctx.fillStyle = '#ffdfba'; ctx.fillRect(-6, -16, 12, 11);
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.moveTo(-9, -17); ctx.lineTo(-12, -26); ctx.lineTo(-6, -23);
        ctx.lineTo(-2, -29); ctx.lineTo(2, -24); ctx.lineTo(8, -28); ctx.lineTo(10, -17);
        ctx.fill();

        // Fluttering Hero Headband (英雄紅色頭帶與隨風飄逸長緞帶)
        ctx.fillStyle = '#dc143c';
        ctx.fillRect(-7, -16, 14, 4);
        const ribbonWave = isMoving ? Math.sin(animTime * 16) * 6 : Math.sin(animTime * 4) * 2;
        ctx.beginPath();
        const ribbonX = (dir >= 4) ? -7 : 7;
        ctx.moveTo(ribbonX, -15);
        ctx.quadraticCurveTo(ribbonX + (dir >= 4 ? -8 : 8), -18 + ribbonWave, ribbonX + (dir >= 4 ? -16 : 16), -12 + ribbonWave * 1.5);
        ctx.lineTo(ribbonX + (dir >= 4 ? -14 : 14), -9 + ribbonWave * 1.5);
        ctx.closePath(); ctx.fill();

        // Determined Martial Expression & Wrapped Fists
        if (!isNorth) {
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(-4, -13, 3, 3); ctx.fillRect(1, -13, 3, 3);
            ctx.fillStyle = '#fff'; ctx.fillRect(-3, -13, 1, 1); ctx.fillRect(2, -13, 1, 1);
            // White Wrapped Bandage Fists
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(-11, 0, 4, 5); ctx.fillRect(7, 0, 4, 5);
        }
    }

    // --- 4. PRIEST HD (DQ 經典神聖引導者僧侶 - 主教冠冕、十字金繡法袍、神聖權杖) ---
    drawPriestHD(ctx, dir, stepL, stepR, isMoving, animTime) {
        const isNorth = (dir === 4 || dir === 3 || dir === 5);

        // White & Teal Clerical Vestments
        ctx.fillStyle = '#0a0a0a'; ctx.fillRect(-10, -5, 20, 23);
        ctx.fillStyle = '#20b2aa'; ctx.fillRect(-9, -4, 18, 21); // Emerald Teal
        ctx.fillStyle = '#f8f9fa'; ctx.fillRect(-4, -4, 8, 21);  // White Stole
        // Embroidered Golden Solar Cross
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-1, 0, 2, 7); ctx.fillRect(-3, 2, 6, 2);

        // Head & Bishop Mitre Hat (主教冠冕)
        ctx.fillStyle = '#ffdfba'; ctx.fillRect(-5, -14, 10, 10);
        ctx.fillStyle = '#0a0a0a'; ctx.fillRect(-8, -28, 16, 15);
        ctx.fillStyle = '#f8f9fa'; ctx.fillRect(-7, -27, 14, 13);
        // Golden Radiant Cross on Mitre
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-1, -25, 2, 9); ctx.fillRect(-4, -22, 8, 2);

        if (!isNorth) {
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(-3, -11, 2, 2.5); ctx.fillRect(2, -11, 2, 2.5);
            // Holy Silver Flanged Mace
            const maceX = (dir === 6 || dir === 5 || dir === 7) ? -13 : 13;
            ctx.fillStyle = '#543015'; ctx.fillRect(maceX, -8, 2.5, 20); // Handle
            ctx.fillStyle = '#c0c0c0';
            ctx.beginPath(); ctx.arc(maceX + 1.2, -10, 4.5, 0, Math.PI * 2); ctx.fill(); // Mace Head
            ctx.fillStyle = '#ffd700'; ctx.fillRect(maceX - 1, -11, 4.5, 2);
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

        // Authentic Akira Toriyama Dragon Quest Monster Rendering
        if (type === 'slime') {
            this.drawSlimeDQ(ctx, r, enemy.data.color || '#00b4d8', animTime);
        } else if (type === 'bubble_slime') {
            this.drawBubbleSlimeDQ(ctx, r, animTime);
        } else if (type === 'metal_slime') {
            this.drawMetalSlimeDQ(ctx, r, false, false, animTime);
        } else if (type === 'liquid_metal_slime') {
            this.drawMetalSlimeDQ(ctx, r, false, true, animTime);
        } else if (type === 'king_metal_slime') {
            this.drawMetalSlimeDQ(ctx, r, true, false, animTime);
        } else if (type === 'healslime') {
            this.drawHealslimeDQ(ctx, r, animTime);
        } else if (type === 'dracky') {
            this.drawDrackyDQ(ctx, r, animTime);
        } else if (type === 'hammerhood') {
            this.drawHammerhoodDQ(ctx, r, animTime);
        } else if (type === 'ghost') {
            this.drawGhostDQ(ctx, r, animTime);
        } else if (type === 'mud_hand') {
            this.drawMudHandDQ(ctx, r, animTime);
        } else if (type === 'skeleton') {
            this.drawSkeletonDQ(ctx, r, animTime);
        } else if (type === 'restless_armour') {
            this.drawRestlessArmourDQ(ctx, r, animTime);
        } else if (type === 'golem') {
            this.drawGolemDQ(ctx, r, animTime);
        } else if (type === 'mimic_king') {
            this.drawMimicKingDQ(ctx, r, animTime);
        } else if (type === 'slime_knight') {
            this.drawSlimeKnightDQ(ctx, r, animTime);
        } else if (type === 'killer_machine') {
            this.drawKillerMachineDQ(ctx, r, animTime);
        } else if (type === 'cyclops') {
            this.drawCyclopsDQ(ctx, r, animTime);
        } else if (type === 'chimera') {
            this.drawChimeraDQ(ctx, r, animTime);
        } else if (type === 'hellion') {
            this.drawHellionDQ(ctx, r, animTime);
        } else if (type === 'archdemon') {
            this.drawArchdemonDQ(ctx, r, animTime);
        } else if (type === 'great_dragon') {
            this.drawGreatDragonDQ(ctx, r, animTime);
        } else if (type === 'baramos') {
            this.drawBaramosDQ(ctx, r, animTime);
        } else if (type === 'zoma') {
            this.drawZomaDQ(ctx, r, animTime);
        } else {
            this.drawSlimeDQ(ctx, r, enemy.data.color || '#ff0000', animTime);
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
    // AUTHENTIC AKIRA TORIYAMA DRAGON QUEST MONSTER RENDERING (鳥山明經典魔物繪圖)
    // =========================================================================

    // 1. 史萊姆 (Slime) - 鳥山明經典水滴洋蔥外型、大圓眼與招牌開懷笑容
    drawSlimeDQ(ctx, r, color, animTime) {
        // Dark Outer Contour
        ctx.fillStyle = '#062038';
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.38);
        ctx.bezierCurveTo(r * 0.98, -r * 0.55, r * 1.35, r * 0.45, r * 0.98, r * 0.98);
        ctx.bezierCurveTo(r * 0.52, r * 1.28, -r * 0.52, r * 1.28, -r * 0.98, r * 0.98);
        ctx.bezierCurveTo(-r * 1.35, r * 0.45, -r * 0.98, -r * 0.55, 0, -r * 1.38);
        ctx.fill();

        // Main Body with Gradient
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.30);
        ctx.bezierCurveTo(r * 0.90, -r * 0.50, r * 1.25, r * 0.40, r * 0.90, r * 0.90);
        ctx.bezierCurveTo(r * 0.48, r * 1.18, -r * 0.48, r * 1.18, -r * 0.90, r * 0.90);
        ctx.bezierCurveTo(-r * 1.25, r * 0.40, -r * 0.90, -r * 0.50, 0, -r * 1.30);
        ctx.fill();

        // Glossy Specular Highlight (左上方水滴弧形高光)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.ellipse(-r * 0.38, -r * 0.45, r * 0.28, r * 0.13, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Big Round Toriyama Cartoon Eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(-r * 0.36, -r * 0.05, r * 0.26, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.36, -r * 0.05, r * 0.26, 0, Math.PI * 2); ctx.fill();

        // Black Pupils (Looking slightly inward - iconic cute derp)
        ctx.fillStyle = '#0a1128';
        ctx.beginPath(); ctx.arc(-r * 0.30, -r * 0.05, r * 0.12, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.30, -r * 0.05, r * 0.12, 0, Math.PI * 2); ctx.fill();

        // White Pupil Glint
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(-r * 0.32, -r * 0.09, r * 0.045, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.28, -r * 0.09, r * 0.045, 0, Math.PI * 2); ctx.fill();

        // Cheerful Smile with Pink Tongue (經典鳥山明式微笑)
        ctx.fillStyle = '#0a0a0a';
        ctx.beginPath();
        ctx.moveTo(-r * 0.32, r * 0.28);
        ctx.quadraticCurveTo(0, r * 0.65, r * 0.32, r * 0.28);
        ctx.quadraticCurveTo(0, r * 0.38, -r * 0.32, r * 0.28);
        ctx.fill();

        ctx.fillStyle = '#ff4d6d'; // Tongue
        ctx.beginPath();
        ctx.arc(0, r * 0.45, r * 0.13, 0, Math.PI);
        ctx.fill();
    }

    // 2. 斑點史萊姆 / 氣泡史萊姆 (Bubble Slime) - 融化水窪狀三峰波浪身形
    drawBubbleSlimeDQ(ctx, r, animTime) {
        ctx.fillStyle = '#0f381e'; // Dark Contour
        ctx.beginPath();
        ctx.ellipse(0, r * 0.4, r * 1.35, r * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#2d6a4f'; // Slime Green
        ctx.beginPath();
        ctx.ellipse(0, r * 0.4, r * 1.25, r * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3 Bubbly Mounds
        ctx.beginPath();
        ctx.arc(-r * 0.5, r * 0.1, r * 0.45, 0, Math.PI * 2);
        ctx.arc(0, -r * 0.15, r * 0.55, 0, Math.PI * 2);
        ctx.arc(r * 0.5, r * 0.1, r * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Spots on back
        ctx.fillStyle = '#1b4332';
        ctx.beginPath();
        ctx.arc(-r * 0.4, r * 0.4, r * 0.12, 0, Math.PI * 2);
        ctx.arc(r * 0.35, r * 0.35, r * 0.14, 0, Math.PI * 2);
        ctx.fill();

        // Toriyama Eyes & Smile
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(-r * 0.25, -r * 0.1, r * 0.18, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.25, -r * 0.1, r * 0.18, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(-r * 0.22, -r * 0.1, r * 0.08, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.22, -r * 0.1, r * 0.08, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(0, r * 0.12, r * 0.22, 0.2, Math.PI - 0.2); ctx.stroke();
    }

    // 3. 金屬史萊姆系列 (Metal Slime / Liquid Metal / King Metal Slime) - 白金鏡面與閃耀星光
    drawMetalSlimeDQ(ctx, r, isKing, isLiquid, animTime) {
        const chromeGrad = ctx.createLinearGradient(-r, -r, r, r);
        chromeGrad.addColorStop(0, '#ffffff');
        chromeGrad.addColorStop(0.35, '#cfd8dc');
        chromeGrad.addColorStop(0.7, '#78909c');
        chromeGrad.addColorStop(1, '#ffffff');

        if (isLiquid) {
            ctx.fillStyle = chromeGrad;
            ctx.beginPath();
            ctx.ellipse(0, r * 0.3, r * 1.35, r * 0.5, 0, 0, Math.PI * 2);
            ctx.arc(-r * 0.2, -r * 0.1, r * 0.45, 0, Math.PI * 2);
            ctx.fill();
        } else {
            this.drawSlimeDQ(ctx, r, chromeGrad, animTime);
        }

        // Sparkling Star Glints (白金閃光十字星)
        const glintA = (Math.sin(animTime * 12) + 1) * 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${glintA})`;
        ctx.beginPath();
        const gx = -r * 0.6, gy = -r * 0.6;
        ctx.moveTo(gx, gy - 6); ctx.lineTo(gx + 2, gy); ctx.lineTo(gx + 6, gy); ctx.lineTo(gx + 2, gy + 2);
        ctx.lineTo(gx, gy + 6); ctx.lineTo(gx - 2, gy + 2); ctx.lineTo(gx - 6, gy); ctx.lineTo(gx - 2, gy);
        ctx.closePath(); ctx.fill();

        // King Metal Slime Golden Crown (金屬史萊姆王之黃金紅寶石王冠)
        if (isKing) {
            ctx.fillStyle = '#ffd700'; // Crown Base
            ctx.fillRect(-r * 0.55, -r * 1.35, r * 1.1, 7);
            // 3 Crown Spikes
            ctx.beginPath();
            ctx.moveTo(-r * 0.55, -r * 1.35); ctx.lineTo(-r * 0.55, -r * 1.85); ctx.lineTo(-r * 0.25, -r * 1.45);
            ctx.lineTo(0, -r * 2.0); ctx.lineTo(r * 0.25, -r * 1.45); ctx.lineTo(r * 0.55, -r * 1.85); ctx.lineTo(r * 0.55, -r * 1.35);
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 1.5; ctx.stroke();
            // Center Ruby
            ctx.fillStyle = '#e63946';
            ctx.beginPath(); ctx.arc(0, -r * 1.55, 4.5, 0, Math.PI * 2); ctx.fill();
        }
    }

    // 4. 荷伊米史萊姆 (Healslime) - 水母形貝殼冠與波浪飄逸觸手
    drawHealslimeDQ(ctx, r, animTime) {
        // Yellow Cap with Blue Bell
        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.arc(0, -r * 0.25, r * 0.75, Math.PI, 0);
        ctx.quadraticCurveTo(r * 0.8, 0, 0, r * 0.1);
        ctx.quadraticCurveTo(-r * 0.8, 0, -r * 0.75, -r * 0.25);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#062038'; ctx.lineWidth = 2; ctx.stroke();

        // Eyes & Smile
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.25, 4, 0, Math.PI * 2); ctx.arc(r * 0.3, -r * 0.25, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(-r * 0.25, -r * 0.25, 2, 0, Math.PI * 2); ctx.arc(r * 0.25, -r * 0.25, 2, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(0, -r * 0.1, 4, 0.2, Math.PI - 0.2); ctx.stroke();

        // 6 Wavy Animated Blue Tentacles
        ctx.strokeStyle = '#00b4d8'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        for (let i = -2; i <= 3; i++) {
            const tx = i * (r * 0.24) - (r * 0.12);
            const wave = Math.sin(animTime * 10 + i * 1.2) * 6;
            ctx.beginPath();
            ctx.moveTo(tx, r * 0.05);
            ctx.bezierCurveTo(tx + wave, r * 0.5, tx - wave, r * 0.9, tx + wave * 0.7, r * 1.35);
            ctx.stroke();
        }
    }

    // 5. 朵拉奇 (Dracky) - 鳥山明經典紫蝙蝠、吸血鬼小尖牙與扇形翅膀
    drawDrackyDQ(ctx, r, animTime) {
        const flap = Math.sin(animTime * 14) * 10;
        // Flapping Yellow-Orange Scalloped Bat Wings
        ctx.fillStyle = '#f77f00';
        ctx.strokeStyle = '#0a0a0a'; ctx.lineWidth = 1.5;
        // Left Wing
        ctx.beginPath();
        ctx.moveTo(-r * 0.4, 0); ctx.lineTo(-r * 1.8, -r * 0.8 + flap);
        ctx.quadraticCurveTo(-r * 1.4, flap, -r * 1.2, r * 0.4 + flap);
        ctx.quadraticCurveTo(-r * 0.8, r * 0.2 + flap, -r * 0.4, r * 0.2);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        // Right Wing
        ctx.beginPath();
        ctx.moveTo(r * 0.4, 0); ctx.lineTo(r * 1.8, -r * 0.8 + flap);
        ctx.quadraticCurveTo(r * 1.4, flap, r * 1.2, r * 0.4 + flap);
        ctx.quadraticCurveTo(r * 0.8, r * 0.2 + flap, r * 0.4, r * 0.2);
        ctx.closePath(); ctx.fill(); ctx.stroke();

        // Round Purple Torso
        ctx.fillStyle = '#6a0dad';
        ctx.beginPath(); ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#0a0a0a'; ctx.lineWidth = 2; ctx.stroke();

        // Pointed Bat Ears with Pink Inner Ear
        ctx.fillStyle = '#6a0dad';
        ctx.beginPath(); ctx.moveTo(-r * 0.7, -r * 0.4); ctx.lineTo(-r * 0.8, -r * 1.2); ctx.lineTo(-r * 0.2, -r * 0.7); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(r * 0.7, -r * 0.4); ctx.lineTo(r * 0.8, -r * 1.2); ctx.lineTo(r * 0.2, -r * 0.7); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ff758f';
        ctx.beginPath(); ctx.moveTo(-r * 0.65, -r * 0.5); ctx.lineTo(-r * 0.72, -r * 1.05); ctx.lineTo(-r * 0.3, -r * 0.7); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(r * 0.65, -r * 0.5); ctx.lineTo(r * 0.72, -r * 1.05); ctx.lineTo(r * 0.3, -r * 0.7); ctx.closePath(); ctx.fill();

        // Big Round Eyes & Vampire Fangs
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(-r * 0.32, -r * 0.1, r * 0.25, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.32, -r * 0.1, r * 0.25, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(-r * 0.30, -r * 0.1, r * 0.12, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.30, -r * 0.1, r * 0.12, 0, Math.PI * 2); ctx.fill();

        // Smiling Mouth with 2 White Fangs
        ctx.fillStyle = '#9e0c1b';
        ctx.beginPath(); ctx.arc(0, r * 0.22, r * 0.26, 0.1, Math.PI - 0.1); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.moveTo(-r * 0.2, r * 0.22); ctx.lineTo(-r * 0.13, r * 0.42); ctx.lineTo(-r * 0.06, r * 0.22); ctx.fill();
        ctx.beginPath(); ctx.moveTo(r * 0.06, r * 0.22); ctx.lineTo(r * 0.13, r * 0.42); ctx.lineTo(r * 0.2, r * 0.22); ctx.fill();
    }

    // 6. 大木槌 (Hammerhood) - 棕色兜帽、藍色臉龐與雙手沉重巨型大木槌
    drawHammerhoodDQ(ctx, r, animTime) {
        // Brown Furry Hood with Bear Ears
        ctx.fillStyle = '#7f4f24';
        ctx.beginPath(); ctx.arc(0, -r * 0.1, r * 0.88, 0, Math.PI * 2); ctx.fill();
        // Ears
        ctx.beginPath(); ctx.arc(-r * 0.75, -r * 0.7, r * 0.3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.75, -r * 0.7, r * 0.3, 0, Math.PI * 2); ctx.fill();

        // Blue Face
        ctx.fillStyle = '#2a6f97';
        ctx.beginPath(); ctx.arc(0, -r * 0.05, r * 0.52, 0, Math.PI * 2); ctx.fill();
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(-r * 0.22, -r * 0.1, 4, 0, Math.PI * 2); ctx.arc(r * 0.22, -r * 0.1, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(-r * 0.2, -r * 0.1, 2, 0, Math.PI * 2); ctx.arc(r * 0.2, -r * 0.1, 2, 0, Math.PI * 2); ctx.fill();

        // Massive Wooden Mallet with Iron Bands (雙手巨大木槌)
        ctx.fillStyle = '#543015'; // Handle
        ctx.fillRect(r * 0.55, -r * 1.1, 4.5, r * 2.1);
        // Hammer Block
        ctx.fillStyle = '#936639';
        ctx.fillRect(r * 0.25, -r * 1.35, 16, 12);
        ctx.strokeStyle = '#2b2d42'; ctx.lineWidth = 1.5; ctx.strokeRect(r * 0.25, -r * 1.35, 16, 12);
        // Iron rings on hammer
        ctx.fillStyle = '#495057';
        ctx.fillRect(r * 0.25, -r * 1.35, 3, 12); ctx.fillRect(r * 0.25 + 13, -r * 1.35, 3, 12);
    }

    // 7. 鬼魂 (Ghost) - 白色飄浮幽靈、黃色尖頂法師帽、吐舌頭
    drawGhostDQ(ctx, r, animTime) {
        const floatTail = Math.sin(animTime * 8) * 5;
        // White Spectral Sheet Body
        ctx.fillStyle = 'rgba(235, 245, 255, 0.92)';
        ctx.beginPath();
        ctx.arc(0, -r * 0.2, r * 0.72, Math.PI, 0);
        ctx.quadraticCurveTo(r * 0.8, r * 0.6, r * 0.2 + floatTail, r * 1.2);
        ctx.quadraticCurveTo(-r * 0.3 + floatTail, r * 0.8, -r * 0.72, -r * 0.2);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#062038'; ctx.lineWidth = 1.5; ctx.stroke();

        // Pointed Yellow Wizard Hat with Red Pom-pom
        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.moveTo(-r * 0.6, -r * 0.55); ctx.lineTo(r * 0.2 + floatTail * 0.5, -r * 1.5); ctx.lineTo(r * 0.5, -r * 0.55);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#e63946'; // Pom-pom
        ctx.beginPath(); ctx.arc(r * 0.2 + floatTail * 0.5, -r * 1.52, 4.5, 0, Math.PI * 2); ctx.fill();

        // Eyes & Long Red Dangling Tongue
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(-r * 0.24, -r * 0.2, 3.5, 0, Math.PI * 2); ctx.arc(r * 0.24, -r * 0.2, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ff4d6d';
        ctx.beginPath();
        ctx.moveTo(-3, r * 0.1); ctx.lineTo(-2, r * 0.45); ctx.lineTo(3, r * 0.45); ctx.lineTo(3, r * 0.1);
        ctx.closePath(); ctx.fill();
    }

    // 8. 泥手 (Mud Hand) - 從泥沼中猛然竄出的泥土魔掌
    drawMudHandDQ(ctx, r, animTime) {
        // Mud Puddle Ripple Base
        ctx.fillStyle = '#4a3525';
        ctx.beginPath(); ctx.ellipse(0, r * 0.8, r * 1.2, r * 0.4, 0, 0, Math.PI * 2); ctx.fill();

        // Mud Arm and 5 Knobby Fingers
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(-r * 0.45, -r * 0.5, r * 0.9, r * 1.3);
        // Fingers reaching upward
        ctx.fillRect(-r * 0.55, -r * 1.15, 4.5, r * 0.7);
        ctx.fillRect(-r * 0.28, -r * 1.45, 5, r * 1.0);
        ctx.fillRect(0, -r * 1.55, 5.5, r * 1.1);
        ctx.fillRect(r * 0.28, -r * 1.35, 5, r * 0.9);
        ctx.fillRect(r * 0.55, -r * 0.95, 4.5, r * 0.6);
        ctx.strokeStyle = '#382313'; ctx.lineWidth = 1.5; ctx.strokeRect(-r * 0.45, -r * 0.5, r * 0.9, r * 1.3);
    }

    // 9. 骷髏戰士 (Skeleton) - 鳥山明俐落骷髏頭、骨骼肋骨、鏽鐵彎刀與小圓盾
    drawSkeletonDQ(ctx, r, animTime) {
        // Skull
        ctx.fillStyle = '#e9ecef';
        ctx.beginPath(); ctx.arc(0, -r * 0.55, r * 0.45, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#111'; // Eye Sockets
        ctx.fillRect(-r * 0.28, -r * 0.62, 5, 6); ctx.fillRect(r * 0.12, -r * 0.62, 5, 6);
        ctx.fillStyle = '#ff0033'; // Glowing Red Pupil Dots
        ctx.fillRect(-r * 0.22, -r * 0.58, 2.5, 2.5); ctx.fillRect(r * 0.18, -r * 0.58, 2.5, 2.5);

        // Ribcage
        ctx.strokeStyle = '#e9ecef'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(0, -r * 0.15); ctx.lineTo(0, r * 0.5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-r * 0.4, 0); ctx.lineTo(r * 0.4, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-r * 0.35, r * 0.25); ctx.lineTo(r * 0.35, r * 0.25); ctx.stroke();

        // Broadsword & Shield
        ctx.fillStyle = '#adb5bd'; ctx.fillRect(r * 0.45, -r * 0.9, 4, r * 1.7);
        ctx.fillStyle = '#7f4f24'; ctx.beginPath(); ctx.arc(-r * 0.5, 0, r * 0.4, 0, Math.PI * 2); ctx.fill();
    }

    // 10. 死靈騎士 / 徬徨之鎧 (Restless Armour) - 重裝深藍重騎士鎧甲與橫向赤紅眼縫
    drawRestlessArmourDQ(ctx, r, animTime) {
        // Heavy Cobalt Plate
        ctx.fillStyle = '#1d3557';
        ctx.fillRect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.4);
        ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1.5; ctx.strokeRect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.4);

        // Horned Knight Helmet
        ctx.fillStyle = '#457b9d'; ctx.fillRect(-r * 0.55, -r * 1.25, r * 1.1, r * 0.6);
        // Horizontal Glowing Crimson Visor Slit (經典橫向紅色眼光)
        ctx.fillStyle = '#ff0033'; ctx.fillRect(-r * 0.4, -r * 0.95, r * 0.8, 3.5);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(-2, -r * 0.95, 4, 3.5);

        // Massive Tower Shield & Broadsword
        ctx.fillStyle = '#457b9d'; ctx.fillRect(-r * 1.1, -r * 0.5, 6, r * 1.2);
        ctx.fillStyle = '#ffd700'; ctx.fillRect(-r * 1.1, -r * 0.1, 6, 2);
        ctx.fillStyle = '#f1faee'; ctx.fillRect(r * 0.7, -r * 0.9, 4, r * 1.8);
    }

    // 11. 巨石魔像 (Golem) - 磚塊砌合方正軀體、黃色條狀眼與巨石重拳
    drawGolemDQ(ctx, r, animTime) {
        // Terracotta Brick Masonry Blocks
        ctx.fillStyle = '#a0522d';
        ctx.fillRect(-r * 0.85, -r * 0.75, r * 1.7, r * 1.5);
        // Mortar Lines
        ctx.strokeStyle = '#543015'; ctx.lineWidth = 2;
        ctx.strokeRect(-r * 0.85, -r * 0.75, r * 1.7, r * 1.5);
        ctx.beginPath(); ctx.moveTo(-r * 0.85, 0); ctx.lineTo(r * 0.85, 0); ctx.stroke();

        // Rectangular Brick Head
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(-r * 0.5, -r * 1.35, r, r * 0.65);
        ctx.strokeStyle = '#543015'; ctx.strokeRect(-r * 0.5, -r * 1.35, r, r * 0.65);
        // Yellow Slit Eyes
        ctx.fillStyle = '#ffea00';
        ctx.fillRect(-r * 0.35, -r * 1.05, 5, 3); ctx.fillRect(r * 0.15, -r * 1.05, 5, 3);

        // Giant Boulder Fists
        ctx.fillStyle = '#6f3711';
        ctx.beginPath(); ctx.arc(-r * 0.95, r * 0.2, r * 0.38, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.95, r * 0.2, r * 0.38, 0, Math.PI * 2); ctx.fill();
    }

    // 12. 寶箱怪王 (Mimic King) - 敞開的鐵皮寶箱、滿口交錯尖銳利齒與巨型紫舌頭
    drawMimicKingDQ(ctx, r, animTime) {
        // Wooden Chest Bottom
        ctx.fillStyle = '#543015';
        ctx.fillRect(-r * 0.9, -r * 0.3, r * 1.8, r * 1.1);
        ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2; ctx.strokeRect(-r * 0.9, -r * 0.3, r * 1.8, r * 1.1);

        // Chest Lid Open at Angle
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.moveTo(-r * 0.9, -r * 0.3); ctx.lineTo(-r * 0.95, -r * 1.2); ctx.lineTo(r * 0.95, -r * 1.2); ctx.lineTo(r * 0.9, -r * 0.3);
        ctx.closePath(); ctx.fill(); ctx.stroke();

        // Black Mouth with Crazy Bloodshot Red Eyes
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(-r * 0.8, -r * 0.35, r * 1.6, r * 0.5);
        ctx.fillStyle = '#ff0033';
        ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.2, 5, 0, Math.PI * 2); ctx.arc(r * 0.35, -r * 0.2, 5, 0, Math.PI * 2); ctx.fill();

        // Interlocking Sharp Shark Teeth (上下交錯的利齒)
        ctx.fillStyle = '#ffffff';
        for (let i = -3; i <= 3; i++) {
            ctx.beginPath(); ctx.moveTo(i * 6, -r * 0.3); ctx.lineTo(i * 6 + 3, -r * 0.6); ctx.lineTo(i * 6 + 6, -r * 0.3); ctx.fill();
            ctx.beginPath(); ctx.moveTo(i * 6, 0); ctx.lineTo(i * 6 + 3, -r * 0.25); ctx.lineTo(i * 6 + 6, 0); ctx.fill();
        }

        // Long Floppy Purple Tongue Drooping Out (紫長舌頭)
        const tongueWobble = Math.sin(animTime * 10) * 4;
        ctx.fillStyle = '#7209b7';
        ctx.beginPath();
        ctx.moveTo(-6, -r * 0.2); ctx.quadraticCurveTo(-10 + tongueWobble, r * 0.6, 0 + tongueWobble, r * 1.1);
        ctx.quadraticCurveTo(8 + tongueWobble, r * 0.6, 6, -r * 0.2);
        ctx.closePath(); ctx.fill();
    }

    // 13. 史萊姆騎士 (Slime Knight) - 綠色史萊姆坐騎 ＋ 銀甲赤翎小騎士
    drawSlimeKnightDQ(ctx, r, animTime) {
        // Green Slime Mount
        ctx.save();
        ctx.translate(0, r * 0.35);
        this.drawSlimeDQ(ctx, r * 0.72, '#38b000', animTime);
        ctx.restore();

        // Miniature Silver Knight Mounted on Top
        ctx.fillStyle = '#ced4da'; // Silver Armor
        ctx.fillRect(-r * 0.32, -r * 0.65, r * 0.64, r * 0.65);
        ctx.fillStyle = '#e9ecef'; // Silver Helmet
        ctx.beginPath(); ctx.arc(0, -r * 0.75, r * 0.32, Math.PI, 0); ctx.fill();
        // Red Plume Feather (赤色頭盔羽翎)
        ctx.fillStyle = '#e63946';
        ctx.beginPath(); ctx.moveTo(-3, -r * 1.05); ctx.lineTo(0, -r * 1.45); ctx.lineTo(4, -r * 1.05); ctx.fill();

        // Golden Crest Shield & Gleaming Lance
        ctx.fillStyle = '#ffd700'; ctx.fillRect(-r * 0.65, -r * 0.5, 5, r * 0.6);
        ctx.fillStyle = '#e63946'; ctx.fillRect(-r * 0.65, -r * 0.3, 5, 2);
        ctx.fillStyle = '#f8f9fa'; ctx.fillRect(r * 0.45, -r * 1.1, 3.5, r * 1.4);
    }

    // 14. 殺人機器 (Killer Machine) - 經典藍色單眼機器人、掃描紅眼、雙持利刃與弩槍
    drawKillerMachineDQ(ctx, r, animTime) {
        // Cobalt Blue Dome Chassis
        ctx.fillStyle = '#1d3557';
        ctx.beginPath(); ctx.arc(0, -r * 0.15, r * 0.75, Math.PI, 0); ctx.lineTo(r * 0.75, r * 0.4); ctx.lineTo(-r * 0.75, r * 0.4); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1.5; ctx.stroke();

        // Yellow Shoulder Exhaust Pipes
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-r * 0.85, -r * 0.65, 4.5, 8); ctx.fillRect(r * 0.75, -r * 0.65, 4.5, 8);

        // Glowing Red Cyclops Sensor Eye with Crosshairs (中心紅色標記感應眼)
        ctx.fillStyle = '#0a0a0a'; ctx.beginPath(); ctx.arc(0, -r * 0.15, r * 0.28, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ff0033'; ctx.beginPath(); ctx.arc(0, -r * 0.15, r * 0.18, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(-r * 0.22, -r * 0.15); ctx.lineTo(r * 0.22, -r * 0.15); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -r * 0.37); ctx.lineTo(0, 0.05); ctx.stroke();

        // Dual Arms: Curved Steel Falchion & Bowgun
        ctx.fillStyle = '#e9ecef';
        ctx.beginPath(); ctx.moveTo(-r * 0.8, -r * 0.1); ctx.lineTo(-r * 1.35, -r * 0.9); ctx.lineTo(-r * 1.1, 0.4); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#495057';
        ctx.fillRect(r * 0.8, -r * 0.2, 5, r * 0.8);
        ctx.fillStyle = '#ffd700'; ctx.fillRect(r * 0.7, -r * 0.25, 9, 3);
    }

    // 15. 獨眼巨人 (Cyclops) - 肌肉藍膚巨人、單眼巨目、豹皮圍裙與狼牙棒
    drawCyclopsDQ(ctx, r, animTime) {
        // Muscular Blue Torso
        ctx.fillStyle = '#1e3f66';
        ctx.beginPath(); ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2); ctx.fill();

        // Giant Bloodshot Eye on Forehead
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(0, -r * 0.32, r * 0.36, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#d90429'; // Bloodshot Iris
        ctx.beginPath(); ctx.arc(0, -r * 0.32, r * 0.18, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0a0a0a'; // Pupil
        ctx.beginPath(); ctx.arc(0, -r * 0.32, r * 0.08, 0, Math.PI * 2); ctx.fill();

        // Horn Nubs & Snarl Mouth
        ctx.fillStyle = '#e9ecef';
        ctx.beginPath(); ctx.moveTo(-r * 0.4, -r * 0.7); ctx.lineTo(-r * 0.5, -r * 0.95); ctx.lineTo(-r * 0.25, -r * 0.75); ctx.fill();
        ctx.beginPath(); ctx.moveTo(r * 0.4, -r * 0.7); ctx.lineTo(r * 0.5, -r * 0.95); ctx.lineTo(r * 0.25, -r * 0.75); ctx.fill();

        // Spotted Beast Loincloth
        ctx.fillStyle = '#cc8b3c'; ctx.fillRect(-r * 0.6, r * 0.35, r * 1.2, r * 0.5);

        // Giant Spiked Wooden Club (巨大狼牙棒)
        ctx.fillStyle = '#543015'; ctx.fillRect(r * 0.75, -r * 1.2, 8, r * 2.2);
        ctx.fillStyle = '#e9ecef'; // Spikes
        ctx.fillRect(r * 0.7, -r * 1.1, 3, 3); ctx.fillRect(r * 1.1, -r * 0.8, 3, 3); ctx.fillRect(r * 0.7, -r * 0.5, 3, 3);
    }

    // 16. 奇美拉 (Chimera) - 鳥頭羽翼蛇尾怪物
    drawChimeraDQ(ctx, r, animTime) {
        const flap = Math.sin(animTime * 10) * 8;
        // Blue Feathered Wings
        ctx.fillStyle = '#1d3557';
        ctx.beginPath(); ctx.moveTo(-r * 0.4, 0); ctx.lineTo(-r * 1.6, -r * 0.6 + flap); ctx.lineTo(-r * 0.8, r * 0.6); ctx.fill();
        ctx.beginPath(); ctx.moveTo(r * 0.4, 0); ctx.lineTo(r * 1.6, -r * 0.6 + flap); ctx.lineTo(r * 0.8, r * 0.6); ctx.fill();

        // Purple Bird Body
        ctx.fillStyle = '#7209b7'; ctx.beginPath(); ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2); ctx.fill();
        // Vulture Head & Hooked Yellow Beak
        ctx.fillStyle = '#ffd166';
        ctx.beginPath(); ctx.moveTo(0, -r * 0.3); ctx.lineTo(r * 0.5, -r * 0.1); ctx.lineTo(0, 0.1); ctx.fill();
        // Curved Horns
        ctx.fillStyle = '#e63946';
        ctx.beginPath(); ctx.moveTo(-4, -r * 0.6); ctx.lineTo(-r * 0.4, -r * 1.1); ctx.lineTo(0, -r * 0.7); ctx.fill();
    }

    // 17. 地獄炎魔 (Hellion) - 烈焰魔獸與利齒
    drawHellionDQ(ctx, r, animTime) {
        // Red Flame Mane
        ctx.fillStyle = '#e63946';
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.75, Math.sin(a) * r * 0.75, r * 0.35, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#f77f00'; ctx.beginPath(); ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffea00'; ctx.fillRect(-r * 0.35, -r * 0.15, 6, 4); ctx.fillRect(r * 0.15, -r * 0.15, 6, 4);
    }

    // 18. 惡魔神官 / 大惡魔 (Archdemon) - 羊角金翼魔王、持黃金三叉戟
    drawArchdemonDQ(ctx, r, animTime) {
        // Purple Body
        ctx.fillStyle = '#4a0e4e'; ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2); ctx.fill();
        // Golden Ram Horns
        ctx.fillStyle = '#ffd700';
        ctx.beginPath(); ctx.arc(-r * 0.5, -r * 0.6, r * 0.28, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.5, -r * 0.6, r * 0.28, 0, Math.PI * 2); ctx.fill();
        // Golden Trident (三叉戟)
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(r * 0.75, -r * 1.3, 4, r * 2.3);
        ctx.beginPath(); ctx.moveTo(r * 0.5, -r * 1.3); ctx.lineTo(r * 1.1, -r * 1.3); ctx.stroke();
    }

    // 19. 巨龍 (Great Dragon) - 赤紅巨龍、黃金胸鱗、噴煙咆哮
    drawGreatDragonDQ(ctx, r, animTime) {
        const wingFlap = Math.sin(animTime * 8) * 12;
        // Giant Bat Wings
        ctx.fillStyle = '#9e0c1b';
        ctx.beginPath(); ctx.moveTo(-r * 0.4, 0); ctx.lineTo(-r * 1.9, -r * 0.9 + wingFlap); ctx.lineTo(-r * 0.9, r * 0.6); ctx.fill();
        ctx.beginPath(); ctx.moveTo(r * 0.4, 0); ctx.lineTo(r * 1.9, -r * 0.9 + wingFlap); ctx.lineTo(r * 0.9, r * 0.6); ctx.fill();

        // Crimson Dragon Torso & Golden Belly Plates
        ctx.fillStyle = '#c1121f'; ctx.beginPath(); ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.ellipse(0, r * 0.2, r * 0.45, r * 0.5, 0, 0, Math.PI * 2); ctx.fill();

        // Horned Dragon Snout
        ctx.fillStyle = '#e63946';
        ctx.beginPath(); ctx.moveTo(-r * 0.4, -r * 0.4); ctx.lineTo(0, -r * 1.2); ctx.lineTo(r * 0.4, -r * 0.4); ctx.fill();
        ctx.fillStyle = '#ffea00'; ctx.fillRect(-r * 0.25, -r * 0.65, 4, 3); ctx.fillRect(r * 0.15, -r * 0.65, 4, 3);
    }

    // 20. 巴拉莫斯 (Baramos) - 綠鱗爬蟲魔王、巨型盤旋羊角、紫袍骨鏈
    drawBaramosDQ(ctx, r, animTime) {
        // Dark Void Flame Aura
        ctx.fillStyle = 'rgba(114, 9, 183, 0.25)';
        ctx.beginPath(); ctx.arc(0, 0, r * 1.25, 0, Math.PI * 2); ctx.fill();

        // Reptilian Lizard Body
        ctx.fillStyle = '#2d6a4f'; ctx.beginPath(); ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2); ctx.fill();
        // Royal Purple Robe with Golden Collar
        ctx.fillStyle = '#4a0e4e'; ctx.fillRect(-r * 0.75, -r * 0.4, r * 1.5, r * 1.1);
        ctx.fillStyle = '#ffd700'; ctx.fillRect(-r * 0.75, -r * 0.4, r * 1.5, 4);

        // Huge Curling Golden Ram Horns
        ctx.fillStyle = '#ffd700';
        ctx.beginPath(); ctx.arc(-r * 0.65, -r * 0.75, r * 0.35, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.65, -r * 0.75, r * 0.35, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2d6a4f';
        ctx.beginPath(); ctx.arc(-r * 0.65, -r * 0.75, r * 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.65, -r * 0.75, r * 0.2, 0, Math.PI * 2); ctx.fill();

        // Glowing Emerald Eyes & Snarl
        ctx.fillStyle = '#00ffcc';
        ctx.fillRect(-r * 0.3, -r * 0.45, 5, 4); ctx.fillRect(r * 0.15, -r * 0.45, 5, 4);
    }

    // 21. 大魔王 索瑪 (Zoma) - 終極大魔王！深藍紫法袍、三叉魔角頭骨冠冕、極凍暴風雪
    drawZomaDQ(ctx, r, animTime) {
        // Swirling Frost Blizzard Aura with Ice Crystals (極致暴風雪靈氣)
        const auraR = r * (1.15 + Math.sin(animTime * 6) * 0.12);
        const frostGrad = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, auraR);
        frostGrad.addColorStop(0, 'rgba(0, 210, 255, 0.4)');
        frostGrad.addColorStop(1, 'rgba(0, 50, 150, 0.0)');
        ctx.fillStyle = frostGrad;
        ctx.beginPath(); ctx.arc(0, 0, auraR, 0, Math.PI * 2); ctx.fill();

        // Towering Dark-Indigo Robes with Ragged Hem
        ctx.fillStyle = '#10172a'; ctx.beginPath(); ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.moveTo(-r * 1.25, -r * 0.2); ctx.lineTo(-r * 0.6, -r * 0.9); ctx.lineTo(0, -r * 0.4);
        ctx.lineTo(r * 0.6, -r * 0.9); ctx.lineTo(r * 1.25, -r * 0.2); ctx.lineTo(0, r * 0.85);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1.5; ctx.stroke();

        // Triple-Horned Demonic Skull Headdress (三叉魔角冠冕)
        ctx.fillStyle = '#f8f9fa';
        // Left Horn
        ctx.beginPath(); ctx.moveTo(-r * 0.45, -r * 0.7); ctx.lineTo(-r * 1.15, -r * 1.6); ctx.lineTo(-r * 0.25, -r * 0.95); ctx.fill();
        // Right Horn
        ctx.beginPath(); ctx.moveTo(r * 0.45, -r * 0.7); ctx.lineTo(r * 1.15, -r * 1.6); ctx.lineTo(r * 0.25, -r * 0.95); ctx.fill();
        // Center Horn
        ctx.beginPath(); ctx.moveTo(-r * 0.2, -r * 0.9); ctx.lineTo(0, -r * 1.85); ctx.lineTo(r * 0.2, -r * 0.9); ctx.fill();

        // Piercing Glowing Cyan Eyes in Dark Shadowy Face
        ctx.fillStyle = '#020617'; ctx.beginPath(); ctx.ellipse(0, -r * 0.35, r * 0.45, r * 0.3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(-r * 0.3, -r * 0.4, 7, 4.5); ctx.fillRect(r * 0.12, -r * 0.4, 7, 4.5);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(-r * 0.24, -r * 0.4, 2, 2); ctx.fillRect(r * 0.18, -r * 0.4, 2, 2);

        // Raised Skeletal Clawed Hands with Crackling Frost Magic
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(-r * 1.15, -r * 0.2, 7, 12); ctx.fillRect(r * 0.95, -r * 0.2, 7, 12);
        // Frost Sparks
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(-r * 1.25, -r * 0.35, 3, 3); ctx.fillRect(r * 1.15, -r * 0.35, 3, 3);
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
