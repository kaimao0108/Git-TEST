// Game Entities: Player, Enemy, Projectile, ExpGem, Chest, FloatingText, ParticleSystem

class Particle {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.vx = config.vx || 0;
        this.vy = config.vy || 0;
        this.color = config.color || '#ffd700';
        this.radius = config.radius || 3;
        this.shape = config.shape || 'circle'; // 'circle', 'spark', 'star', 'leaf', 'ring', 'cross'
        this.lifetime = config.lifetime || 0.6;
        this.timer = 0;
        this.decay = config.decay || 1.0;
        this.rotation = config.rotation || 0;
        this.rotSpeed = config.rotSpeed || (Math.random() * 6 - 3);
        this.dead = false;
    }

    update(dt) {
        this.timer += dt;
        if (this.timer >= this.lifetime) {
            this.dead = true;
            return;
        }
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vx *= Math.max(0, 1 - dt * 2.5);
        this.vy *= Math.max(0, 1 - dt * 2.5);
        this.rotation += this.rotSpeed * dt;
    }

    render(ctx) {
        const progress = this.timer / this.lifetime;
        const alpha = Math.max(0, 1 - progress);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;

        if (this.shape === 'spark') {
            ctx.beginPath();
            ctx.moveTo(0, -this.radius * 1.8);
            ctx.lineTo(this.radius * 0.5, 0);
            ctx.lineTo(0, this.radius * 1.8);
            ctx.lineTo(-this.radius * 0.5, 0);
            ctx.closePath();
            ctx.fill();
        } else if (this.shape === 'star') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-this.radius * 2, 0); ctx.lineTo(this.radius * 2, 0);
            ctx.moveTo(0, -this.radius * 2); ctx.lineTo(0, this.radius * 2);
            ctx.stroke();
        } else if (this.shape === 'leaf') {
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius * 1.5, this.radius * 0.7, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.shape === 'ring') {
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * (1 + progress * 2), 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.shape === 'cross') {
            ctx.fillRect(-this.radius * 1.5, -this.radius * 0.5, this.radius * 3, this.radius);
            ctx.fillRect(-this.radius * 0.5, -this.radius * 1.5, this.radius, this.radius * 3);
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(0.5, this.radius * (1 - progress * 0.5)), 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    add(config) {
        if (this.particles.length < 400) {
            this.particles.push(new Particle(config));
        }
    }

    burst(x, y, count, color = '#ffd700', speed = 120, shape = 'circle', lifetime = 0.5) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = (Math.random() * 0.8 + 0.4) * speed;
            this.add({
                x,
                y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                color,
                radius: Math.random() * 3 + 2,
                shape,
                lifetime: Math.random() * 0.3 + lifetime
            });
        }
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (this.particles[i].dead) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(ctx) {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].render(ctx);
        }
    }
}

class Player {
    constructor(characterId, x = 0, y = 0) {
        this.character = GAME_DATA.characters[characterId] || GAME_DATA.characters.hero;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;

        // 8-Direction System (0: S, 1: SE, 2: E, 3: NE, 4: N, 5: NW, 6: W, 7: SW)
        this.dirIndex = 0; // Default facing South (Down)
        this.facing = 1;   // Legacy: 1 (right), -1 (left)
        this.isMoving = false;
        this.walkTimer = 0;
        this.walkFrame = 0; // 0, 1, 2, 3
        this.dustTimer = 0;
        this.radius = 13;

        this.level = 1;
        this.exp = 0;
        this.expToNext = GAME_DATA.getExpToNextLevel(1);
        this.kills = 0;
        this.coins = 0;
        this.damageDealt = 0;

        this.invincibleTimer = 0;
        this.regenAccumulator = 0;

        // Weapons and Passives
        this.weapons = [];  // { id, level, timer, isEvolved }
        this.passives = []; // { id, level }

        // Initialize starting weapon
        this.addWeapon(this.character.startingWeapon);

        // Compute effective stats
        this.recalculateStats();
        this.hp = this.maxHp;
    }

    recalculateStats() {
        const c = this.character;
        let hpBonus = 0;
        let might = c.might || 1.0;
        let cooldownMod = c.cooldownMod || 1.0;
        let speedMod = 1.0;
        let areaMod = c.areaMod || 1.0;
        let durationMod = 1.0;
        let critBonus = c.critRate || 0.05;
        let armor = c.armor || 0;
        let regen = c.hpRegen || 0;
        let magnetMod = 1.0;
        let amountBonus = 0;

        for (const p of this.passives) {
            const pData = GAME_DATA.passives[p.id];
            if (!pData) continue;
            const lvlInfo = pData.levels[p.level - 1];
            if (!lvlInfo) continue;

            if (pData.stat === 'might') might += lvlInfo.value;
            if (pData.stat === 'cooldown') cooldownMod += lvlInfo.value;
            if (pData.stat === 'speed') speedMod += lvlInfo.value;
            if (pData.stat === 'area') areaMod += lvlInfo.value;
            if (pData.stat === 'duration') durationMod += lvlInfo.value;
            if (pData.stat === 'crit') critBonus += lvlInfo.value;
            if (pData.stat === 'magnet') magnetMod += lvlInfo.value;
            if (pData.stat === 'amount') amountBonus += lvlInfo.value;
        }

        this.maxHp = c.baseHp + hpBonus;
        this.speed = c.speed * speedMod;
        this.might = Math.max(0.2, might);
        this.cooldownMod = Math.max(0.3, cooldownMod);
        this.areaMod = areaMod;
        this.durationMod = durationMod;
        this.critChance = critBonus;
        this.armor = armor;
        this.hpRegen = regen;
        this.pickupRange = (c.pickupRange || 130) * magnetMod;
        this.amountBonus = amountBonus;
    }

    addWeapon(weaponId) {
        if (this.weapons.some(w => w.id === weaponId)) return false;
        if (this.weapons.length >= 6) return false;
        this.weapons.push({
            id: weaponId,
            level: 1,
            timer: 0,
            isEvolved: false
        });
        return true;
    }

    upgradeWeapon(weaponId) {
        const w = this.weapons.find(item => item.id === weaponId);
        if (w) {
            const data = GAME_DATA.weapons[w.id];
            if (w.level < data.maxLevel) {
                w.level++;
                return true;
            }
        }
        return false;
    }

    evolveWeapon(baseWeaponId, evoId) {
        const idx = this.weapons.findIndex(w => w.id === baseWeaponId);
        if (idx !== -1) {
            this.weapons[idx] = {
                id: evoId,
                level: 1,
                timer: 0,
                isEvolved: true
            };
            return true;
        }
        return false;
    }

    addPassive(passiveId) {
        if (this.passives.some(p => p.id === passiveId)) return false;
        if (this.passives.length >= 6) return false;
        this.passives.push({
            id: passiveId,
            level: 1
        });
        this.recalculateStats();
        return true;
    }

    upgradePassive(passiveId) {
        const p = this.passives.find(item => item.id === passiveId);
        if (p) {
            const data = GAME_DATA.passives[p.id];
            if (p.level < data.maxLevel) {
                p.level++;
                this.recalculateStats();
                return true;
            }
        }
        return false;
    }

    gainExp(amount) {
        this.exp += amount;
        let leveledUp = false;
        while (this.exp >= this.expToNext) {
            this.exp -= this.expToNext;
            this.level++;
            this.expToNext = GAME_DATA.getExpToNextLevel(this.level);
            leveledUp = true;
        }
        return leveledUp;
    }

    takeDamage(amount) {
        if (this.invincibleTimer > 0) return 0;
        const actualDmg = Math.max(1, Math.round(amount - this.armor));
        this.hp -= actualDmg;
        this.invincibleTimer = 0.45;
        window.soundFx.playHurt();
        return actualDmg;
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    update(dt, inputDir, particleSystem) {
        this.vx = inputDir.x * this.speed;
        this.vy = inputDir.y * this.speed;
        this.isMoving = inputDir.x !== 0 || inputDir.y !== 0;

        // Calculate 8 Directions
        if (this.isMoving) {
            const angle = Math.atan2(inputDir.y, inputDir.x); // -PI to PI
            // Normalized to 0..7: 0: East, 1: SE, 2: S, 3: SW, 4: W, 5: NW, 6: N, 7: NE
            let octant = Math.round(angle / (Math.PI / 4));
            if (octant < 0) octant += 8;

            // Map to standard game 8-dir: 0:S, 1:SE, 2:E, 3:NE, 4:N, 5:NW, 6:W, 7:SW
            const dirMapping = [2, 1, 0, 7, 6, 5, 4, 3];
            this.dirIndex = dirMapping[octant % 8];

            if (inputDir.x > 0.05) this.facing = 1;
            else if (inputDir.x < -0.05) this.facing = -1;

            // Walk animation cycle
            this.walkTimer += dt * 10;
            this.walkFrame = Math.floor(this.walkTimer) % 4;

            // Running dust particles
            if (particleSystem) {
                this.dustTimer += dt;
                if (this.dustTimer > 0.12) {
                    this.dustTimer = 0;
                    particleSystem.add({
                        x: this.x + (Math.random() * 8 - 4),
                        y: this.y + 12,
                        vx: -inputDir.x * 20 + (Math.random() * 10 - 5),
                        vy: -inputDir.y * 20 - 10,
                        color: '#65a840',
                        radius: 2.5,
                        lifetime: 0.35
                    });
                }
            }
        } else {
            this.walkFrame = 0;
            this.walkTimer = 0;
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Invincibility
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= dt;
        }

        // HP Regeneration
        if (this.hpRegen > 0 && this.hp < this.maxHp) {
            this.regenAccumulator += this.hpRegen * dt;
            if (this.regenAccumulator >= 1.0) {
                const healAmt = Math.floor(this.regenAccumulator);
                this.heal(healAmt);
                this.regenAccumulator -= healAmt;
            }
        }
    }
}

class Enemy {
    constructor(id, type, x, y) {
        this.id = id;
        this.type = type;
        this.data = GAME_DATA.monsters[type] || GAME_DATA.monsters.slime;
        this.x = x;
        this.y = y;
        this.maxHp = this.data.hp;
        this.hp = this.maxHp;
        this.speed = this.data.speed;
        this.damage = this.data.damage;
        this.radius = this.data.radius;
        this.hitFlashTimer = 0;
        this.kbX = 0;
        this.kbY = 0;
        this.erraticTimer = Math.random() * 2;
        this.healCooldown = 2.5;
    }

    takeDamage(amount, knockbackDist = 0, fromX = 0, fromY = 0) {
        const armor = this.data.armor || 0;
        const actualDmg = Math.max(1, Math.round(amount - armor));
        this.hp -= actualDmg;
        this.hitFlashTimer = 0.08;

        if (knockbackDist > 0 && !this.data.isBoss) {
            const dx = this.x - fromX;
            const dy = this.y - fromY;
            const len = Math.hypot(dx, dy) || 1;
            this.kbX = (dx / len) * knockbackDist * 20;
            this.kbY = (dy / len) * knockbackDist * 20;
        }

        window.soundFx.playHit();
        return actualDmg;
    }

    update(dt, playerX, playerY, spatialGrid, particleSystem) {
        if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;

        // Apply knockback decay
        this.x += this.kbX * dt;
        this.y += this.kbY * dt;
        this.kbX *= Math.max(0, 1 - dt * 8);
        this.kbY *= Math.max(0, 1 - dt * 8);

        // Healslime support ability
        if (this.data.isHealer && spatialGrid) {
            this.healCooldown -= dt;
            if (this.healCooldown <= 0) {
                this.healCooldown = 2.5;
                const allies = spatialGrid.queryRadius(this.x, this.y, this.data.healRadius || 150);
                for (const a of allies) {
                    if (a.hp < a.maxHp) {
                        a.hp = Math.min(a.maxHp, a.hp + 25);
                        if (particleSystem) {
                            particleSystem.add({
                                x: a.x,
                                y: a.y - 10,
                                vy: -40,
                                color: '#00fa9a',
                                radius: 4,
                                shape: 'cross',
                                lifetime: 0.5
                            });
                        }
                    }
                }
            }
        }

        // Move towards player
        let dx = playerX - this.x;
        let dy = playerY - this.y;

        if (this.data.erratic) {
            this.erraticTimer += dt * 3.5;
            dx += Math.cos(this.erraticTimer) * 55;
            dy += Math.sin(this.erraticTimer) * 55;
        }

        const dist = Math.hypot(dx, dy) || 1;
        this.x += (dx / dist) * this.speed * dt;
        this.y += (dy / dist) * this.speed * dt;
    }
}

class Projectile {
    constructor(config) {
        this.weaponId = config.weaponId;
        this.x = config.x;
        this.y = config.y;
        this.vx = config.vx || 0;
        this.vy = config.vy || 0;
        this.damage = config.damage;
        this.radius = config.radius || 12;
        this.lifetime = config.lifetime || 2.0;
        this.timer = 0;
        this.pierce = config.pierce || 1;
        this.hitEnemies = new Set();
        this.rotation = config.rotation || 0;
        this.rotSpeed = config.rotSpeed || 0;
        this.angle = config.angle || 0;
        this.knockback = config.knockback || 4;
        this.isCrit = config.isCrit || false;

        this.behavior = config.behavior || 'straight';
        this.originX = config.originX || config.x;
        this.originY = config.originY || config.y;
        this.targetX = config.targetX;
        this.targetY = config.targetY;
        this.orbitRadius = config.orbitRadius || 80;
        this.orbitAngle = config.orbitAngle || 0;
        this.orbitSpeed = config.orbitSpeed || 3.0;
        this.instantKillChance = config.instantKillChance || 0;

        this.hasReturned = false;
        this.dead = false;
    }

    update(dt, playerX, playerY) {
        this.timer += dt;
        if (this.timer >= this.lifetime) {
            this.dead = true;
            return;
        }

        this.rotation += this.rotSpeed * dt;

        if (this.behavior === 'straight') {
            this.x += this.vx * dt;
            this.y += this.vy * dt;

        } else if (this.behavior === 'slash') {
            this.x = playerX + this.vx;
            this.y = playerY + this.vy;

        } else if (this.behavior === 'arc') {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.vy += 850 * dt;

        } else if (this.behavior === 'boomerang') {
            if (!this.hasReturned) {
                this.x += this.vx * dt;
                this.y += this.vy * dt;
                this.vx *= (1 - dt * 2.5);
                this.vy *= (1 - dt * 2.5);
                if (this.timer > this.lifetime * 0.45) {
                    this.hasReturned = true;
                }
            } else {
                const dx = playerX - this.x;
                const dy = playerY - this.y;
                const dist = Math.hypot(dx, dy) || 1;
                this.x += (dx / dist) * 480 * dt;
                this.y += (dy / dist) * 480 * dt;
                if (dist < 25) {
                    this.dead = true;
                }
            }

        } else if (this.behavior === 'orbit') {
            this.orbitAngle += this.orbitSpeed * dt;
            this.x = playerX + Math.cos(this.orbitAngle) * this.orbitRadius;
            this.y = playerY + Math.sin(this.orbitAngle) * this.orbitRadius;

        } else if (this.behavior === 'aura') {
            this.x = playerX;
            this.y = playerY;

        } else if (this.behavior === 'strike_area') {
            // Stationary strike explosion
        }
    }
}

class ExpGem {
    constructor(x, y, val = 1) {
        this.x = x;
        this.y = y;
        this.val = val;
        this.beingPulled = false;
        this.speed = 0;
        this.dead = false;
    }

    update(dt, playerX, playerY, magnetDist) {
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const dist = Math.hypot(dx, dy);

        if (!this.beingPulled && dist < magnetDist) {
            this.beingPulled = true;
        }

        if (this.beingPulled) {
            this.speed += 950 * dt;
            this.x += (dx / dist) * this.speed * dt;
            this.y += (dy / dist) * this.speed * dt;
            if (dist < 22) {
                this.dead = true;
                return true;
            }
        }
        return false;
    }
}

class Chest {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.dead = false;
    }

    checkPickup(playerX, playerY) {
        const dist = Math.hypot(this.x - playerX, this.y - playerY);
        return dist < this.radius + 18;
    }
}

class FloatingText {
    constructor(x, y, text, color = '#ffd700', isCrit = false, isEvo = false) {
        this.x = x + (Math.random() * 16 - 8);
        this.y = y;
        this.text = text;
        this.color = color;
        this.isCrit = isCrit;
        this.isEvo = isEvo;
        this.lifetime = 0.85;
        this.timer = 0;
        this.dead = false;
    }

    update(dt) {
        this.timer += dt;
        this.y -= 38 * dt;
        if (this.timer >= this.lifetime) {
            this.dead = true;
        }
    }
}

window.ParticleSystem = ParticleSystem;
window.Player = Player;
window.Enemy = Enemy;
window.Projectile = Projectile;
window.ExpGem = ExpGem;
window.Chest = Chest;
window.FloatingText = FloatingText;
