// Game Entities: Player, Enemy, Projectile, ExpGem, Chest, FloatingText

class Player {
    constructor(characterId, x = 0, y = 0) {
        this.character = GAME_DATA.characters[characterId] || GAME_DATA.characters.hero;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.facing = 1; // 1: right, -1: left
        this.isMoving = false;
        this.radius = 12;

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
            if (pData.stat === 'cooldown') cooldownMod += lvlInfo.value; // e.g. -0.08
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
        this.pickupRange = (c.pickupRange || 120) * magnetMod;
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
        this.invincibleTimer = 0.45; // 0.45s invulnerability frames
        window.soundFx.playHurt();
        return actualDmg;
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    update(dt, inputDir) {
        // Handle input direction
        this.vx = inputDir.x * this.speed;
        this.vy = inputDir.y * this.speed;
        this.isMoving = inputDir.x !== 0 || inputDir.y !== 0;

        if (inputDir.x > 0.05) this.facing = 1;
        else if (inputDir.x < -0.05) this.facing = -1;

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

    update(dt, playerX, playerY) {
        if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;

        // Apply knockback decay
        this.x += this.kbX * dt;
        this.y += this.kbY * dt;
        this.kbX *= Math.max(0, 1 - dt * 8);
        this.kbY *= Math.max(0, 1 - dt * 8);

        // Move towards player
        let dx = playerX - this.x;
        let dy = playerY - this.y;

        if (this.data.erratic) {
            this.erraticTimer += dt * 3;
            dx += Math.cos(this.erraticTimer) * 50;
            dy += Math.sin(this.erraticTimer) * 50;
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

        // Special parameters for types
        this.behavior = config.behavior || 'straight'; // 'straight', 'arc', 'boomerang', 'orbit', 'strike_area', 'aura', 'slash'
        this.originX = config.originX || config.x;
        this.originY = config.originY || config.y;
        this.targetX = config.targetX;
        this.targetY = config.targetY;
        this.orbitRadius = config.orbitRadius || 80;
        this.orbitAngle = config.orbitAngle || 0;
        this.orbitSpeed = config.orbitSpeed || 3.0;

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
            // Locks relative to player
            this.x = playerX + this.vx;
            this.y = playerY + this.vy;

        } else if (this.behavior === 'arc') {
            // High throw with gravity
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.vy += 850 * dt; // Gravity

        } else if (this.behavior === 'boomerang') {
            // Moves forward, decelerates, then speeds back toward player
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
                this.x += (dx / dist) * 450 * dt;
                this.y += (dy / dist) * 450 * dt;
                // If it reached player on return
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
            this.speed += 900 * dt;
            this.x += (dx / dist) * this.speed * dt;
            this.y += (dy / dist) * this.speed * dt;
            if (dist < 20) {
                this.dead = true;
                return true; // Picked up!
            }
        }
        return false;
    }
}

class Chest {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 18;
        this.dead = false;
    }

    checkPickup(playerX, playerY) {
        const dist = Math.hypot(this.x - playerX, this.y - playerY);
        return dist < this.radius + 16;
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
        this.lifetime = 0.8;
        this.timer = 0;
        this.dead = false;
    }

    update(dt) {
        this.timer += dt;
        this.y -= 35 * dt;
        if (this.timer >= this.lifetime) {
            this.dead = true;
        }
    }
}

window.Player = Player;
window.Enemy = Enemy;
window.Projectile = Projectile;
window.ExpGem = ExpGem;
window.Chest = Chest;
window.FloatingText = FloatingText;
