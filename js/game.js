// Game Orchestrator & State Machine (30 Minutes Deluxe Edition)

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.renderer = new GameRenderer(this.canvas, this.ctx);
        this.ui = new UIController();
        this.grid = new SpatialGrid(96);
        this.particles = new ParticleSystem();

        this.state = 'INIT';
        this.gameTime = 0;
        this.lastFrameTime = performance.now();

        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.gems = [];
        this.chests = [];
        this.floatingTexts = [];

        this.camera = { x: 0, y: 0 };
        this.screenShake = 0;
        this.nextEnemyId = 1;
        this.enemySpawnTimer = 0;
        this.announcedWaves = new Set();

        this.keys = {};
        this.touchInput = { x: 0, y: 0, active: false };
        this.mouseInput = { x: 0, y: 0, active: false };

        this.initCanvasSize();
        this.initInputListeners();
        this.initUIEvents();
    }

    initCanvasSize() {
        const resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();
    }

    initInputListeners() {
        window.addEventListener('keydown', e => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === 'p' || e.key === 'Escape') {
                this.togglePause();
            }
        });

        window.addEventListener('keyup', e => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // Mouse Drag to Move
        window.addEventListener('mousedown', e => {
            if (e.button === 0 && this.state === 'PLAYING') {
                this.mouseInput.active = true;
                this.updateMousePos(e.clientX, e.clientY);
            }
        });
        window.addEventListener('mousemove', e => {
            if (this.mouseInput.active && this.state === 'PLAYING') {
                this.updateMousePos(e.clientX, e.clientY);
            }
        });
        window.addEventListener('mouseup', () => {
            this.mouseInput.active = false;
        });

        // Touch Joystick
        const joystickZone = document.getElementById('virtual-joystick-zone');
        const stick = document.getElementById('joystick-stick');
        let touchOrigin = null;

        window.addEventListener('touchstart', e => {
            if (this.state !== 'PLAYING') return;
            const t = e.touches[0];
            touchOrigin = { x: t.clientX, y: t.clientY };
            this.touchInput.active = true;
            joystickZone.style.display = 'block';
            joystickZone.style.left = `${t.clientX - 65}px`;
            joystickZone.style.top = `${t.clientY - 65}px`;
        }, { passive: false });

        window.addEventListener('touchmove', e => {
            if (!this.touchInput.active || !touchOrigin) return;
            const t = e.touches[0];
            const dx = t.clientX - touchOrigin.x;
            const dy = t.clientY - touchOrigin.y;
            const dist = Math.hypot(dx, dy);
            const maxR = 45;
            const clampedDist = Math.min(dist, maxR);
            const angle = Math.atan2(dy, dx);

            this.touchInput.x = Math.cos(angle) * (clampedDist / maxR);
            this.touchInput.y = Math.sin(angle) * (clampedDist / maxR);

            stick.style.transform = `translate(${Math.cos(angle) * clampedDist}px, ${Math.sin(angle) * clampedDist}px)`;
        }, { passive: false });

        window.addEventListener('touchend', () => {
            this.touchInput.active = false;
            this.touchInput.x = 0;
            this.touchInput.y = 0;
            joystickZone.style.display = 'none';
            stick.style.transform = 'translate(0, 0)';
            touchOrigin = null;
        });
    }

    updateMousePos(clientX, clientY) {
        const screenCenterX = this.canvas.width / 2;
        const screenCenterY = this.canvas.height / 2;
        const dx = clientX - screenCenterX;
        const dy = clientY - screenCenterY;
        const dist = Math.hypot(dx, dy);
        if (dist > 25) {
            this.mouseInput.x = dx / dist;
            this.mouseInput.y = dy / dist;
        } else {
            this.mouseInput.x = 0;
            this.mouseInput.y = 0;
        }
    }

    initUIEvents() {
        this.ui.dom.btnPause.addEventListener('click', () => {
            this.togglePause();
        });
    }

    start() {
        this.state = 'SELECT_CHAR';
        this.ui.showCharacterSelect(charId => {
            this.initGame(charId);
        });
    }

    initGame(charId) {
        this.player = new Player(charId, 0, 0);
        this.enemies = [];
        this.projectiles = [];
        this.gems = [];
        this.chests = [];
        this.floatingTexts = [];
        this.particles = new ParticleSystem();
        this.gameTime = 0;
        this.enemySpawnTimer = 0;
        this.announcedWaves.clear();
        this.screenShake = 0;

        this.state = 'PLAYING';
        this.lastFrameTime = performance.now();
        window.soundFx.switchToField();

        this.ui.showBanner(`⚔️ 冒險啟程！勇者【${this.player.character.name}】踏上 30 分鐘討伐魔王壯烈史詩！`);
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            this.ui.showPause(this.player, this.gameTime, () => {
                this.state = 'PLAYING';
                this.lastFrameTime = performance.now();
            });
        }
    }

    addScreenShake(intensity) {
        this.screenShake = Math.min(25, this.screenShake + intensity);
    }

    getInputDirection() {
        let dx = 0;
        let dy = 0;

        if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
        if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
        if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
        if (this.keys['d'] || this.keys['arrowright']) dx += 1;

        if (dx !== 0 || dy !== 0) {
            const len = Math.hypot(dx, dy);
            return { x: dx / len, y: dy / len };
        }

        if (this.touchInput.active) {
            return { x: this.touchInput.x, y: this.touchInput.y };
        }

        if (this.mouseInput.active) {
            return { x: this.mouseInput.x, y: this.mouseInput.y };
        }

        return { x: 0, y: 0 };
    }

    // --- Main Loop ---
    loop(timestamp) {
        requestAnimationFrame(t => this.loop(t));

        const dt = Math.min((timestamp - this.lastFrameTime) / 1000, 0.1);
        this.lastFrameTime = timestamp;

        if (this.state === 'PLAYING') {
            this.update(dt);
        }

        this.render(timestamp / 1000);
    }

    // --- Update Systems ---
    update(dt) {
        this.gameTime += dt;

        // Screen Shake decay
        if (this.screenShake > 0) {
            this.screenShake = Math.max(0, this.screenShake - dt * 25);
        }

        // 1. Player Update (8-direction & particle dust)
        const inputDir = this.getInputDirection();
        this.player.update(dt, inputDir, this.particles);

        // Update Camera centered on player
        this.camera.x = this.player.x - this.canvas.width / 2;
        this.camera.y = this.player.y - this.canvas.height / 2;

        // 2. Weapon Attack Timers
        this.updateWeapons(dt);

        // 3. Enemy Spawning & Waves
        this.updateSpawner(dt);

        // 4. Update Spatial Grid with all enemies
        this.grid.clear();
        for (let i = 0; i < this.enemies.length; i++) {
            this.grid.insert(this.enemies[i]);
        }

        // 5. Update Projectiles & Check Collisions
        this.updateProjectiles(dt);

        // 6. Update Enemies AI & Player Damage
        this.updateEnemies(dt);

        // 7. Dynamic BGM Transition (Field <-> BOSS Battle Theme)
        const hasBoss = this.enemies.some(e => e.data.isBoss);
        if (hasBoss) {
            window.soundFx.switchToBoss();
        } else {
            window.soundFx.switchToField();
        }

        // 8. Update Exp Gems & Chests
        this.updatePickups(dt);

        // 9. Update Particles & Floating Text
        this.particles.update(dt);
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            this.floatingTexts[i].update(dt);
            if (this.floatingTexts[i].dead) {
                this.floatingTexts.splice(i, 1);
            }
        }

        // 10. Update UI HUD
        this.ui.updateHUD(this.player, this.gameTime);

        // 11. Check Player Death
        if (this.player.hp <= 0) {
            this.state = 'GAME_OVER';
            window.soundFx.stopBgm();
            this.ui.showGameOver(this.player, this.gameTime, () => {
                this.start();
            });
        }
    }

    // --- Weapons Logic (8-Directional Precision) ---
    updateWeapons(dt) {
        const p = this.player;

        for (const w of p.weapons) {
            w.timer -= dt;
            if (w.timer <= 0) {
                this.fireWeapon(w);
            }
        }
    }

    getPlayerAimAngle() {
        // Map 8-direction index to angle: 0:S, 1:SE, 2:E, 3:NE, 4:N, 5:NW, 6:W, 7:SW
        const angles = [
            Math.PI / 2,        // 0: South (Down)
            Math.PI / 4,        // 1: South-East
            0,                  // 2: East (Right)
            -Math.PI / 4,       // 3: North-East
            -Math.PI / 2,       // 4: North (Up)
            -Math.PI * 3 / 4,   // 5: North-West
            Math.PI,            // 6: West (Left)
            Math.PI * 3 / 4     // 7: South-West
        ];
        return angles[this.player.dirIndex % 8];
    }

    fireWeapon(weaponSlot) {
        const p = this.player;
        const wId = weaponSlot.id;
        const isEvo = weaponSlot.isEvolved;
        const data = isEvo ? GAME_DATA.evolutions[wId] : GAME_DATA.weapons[wId];
        const lvl = weaponSlot.level;
        const lvlData = isEvo ? data : data.levels[lvl - 1];

        const baseDmg = isEvo ? data.damage : lvlData.damage;
        const damage = baseDmg * p.might;
        const cd = (isEvo ? data.cooldown : lvlData.cooldown) * p.cooldownMod;
        const count = (isEvo ? data.projectiles : (lvlData.projectiles || 1)) + p.amountBonus;
        const isCrit = Math.random() < (isEvo && data.critChance ? data.critChance : p.critChance);
        const critMult = isEvo && data.critMultiplier ? data.critMultiplier : 2.0;
        const finalDmg = isCrit ? damage * critMult : damage;
        const aimAngle = this.getPlayerAimAngle();

        weaponSlot.timer = Math.max(0.1, cd);

        // 1. Sword Loto / True Loto Blade (8-Directional Slash)
        if (wId === 'sword_loto' || wId === 'true_loto_blade') {
            window.soundFx.playSlash();
            const slashR = (isEvo ? data.area : lvlData.area) * p.areaMod;
            const forwardX = Math.cos(aimAngle) * 30;
            const forwardY = Math.sin(aimAngle) * 30;

            // Primary slash in aim direction
            this.projectiles.push(new Projectile({
                weaponId: wId,
                behavior: 'slash',
                x: p.x + forwardX,
                y: p.y + forwardY,
                vx: forwardX,
                vy: forwardY,
                radius: slashR,
                damage: finalDmg,
                lifetime: 0.18,
                angle: aimAngle,
                knockback: 10,
                isCrit
            }));

            // Backward slash
            if (count >= 2 || isEvo) {
                this.projectiles.push(new Projectile({
                    weaponId: wId,
                    behavior: 'slash',
                    x: p.x - forwardX,
                    y: p.y - forwardY,
                    vx: -forwardX,
                    vy: -forwardY,
                    radius: slashR * 0.9,
                    damage: finalDmg,
                    lifetime: 0.18,
                    angle: aimAngle + Math.PI,
                    knockback: 10,
                    isCrit
                }));
            }

            // True Loto Blade: 4-Way Holy Cross Beams + Particles!
            if (isEvo) {
                this.addScreenShake(3);
                const angles = [aimAngle, aimAngle + Math.PI / 2, aimAngle + Math.PI, aimAngle + Math.PI * 1.5];
                angles.forEach(ang => {
                    this.projectiles.push(new Projectile({
                        weaponId: wId,
                        behavior: 'straight',
                        x: p.x,
                        y: p.y,
                        vx: Math.cos(ang) * 500,
                        vy: Math.sin(ang) * 500,
                        radius: 38,
                        damage: finalDmg * 0.85,
                        lifetime: 1.25,
                        pierce: 999,
                        isCrit: true
                    }));
                });
                this.particles.burst(p.x, p.y, 16, '#ffd700', 160, 'star');
            }

        // 2. Wand Frizz / Wand Kafrizz
        } else if (wId === 'wand_frizz' || wId === 'wand_kafrizz') {
            window.soundFx.playMagic();
            for (let i = 0; i < count; i++) {
                setTimeout(() => {
                    if (this.state !== 'PLAYING') return;
                    const target = this.grid.queryClosest(p.x, p.y, 650);
                    let angle = target ? Math.atan2(target.y - p.y, target.x - p.x) : aimAngle;
                    angle += (Math.random() - 0.5) * 0.35;
                    const speed = isEvo ? data.speed : data.speed;

                    this.projectiles.push(new Projectile({
                        weaponId: wId,
                        behavior: 'straight',
                        x: p.x,
                        y: p.y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        radius: isEvo ? 16 : 9,
                        damage: finalDmg,
                        lifetime: 2.2,
                        pierce: isEvo ? data.pierce : 1,
                        isCrit
                    }));
                }, i * 60);
            }

        // 3. Dagger Poison / Thousand Needles (8-Directional Fan)
        } else if (wId === 'dagger_poison' || wId === 'thousand_needles') {
            window.soundFx.playSlash();
            const spread = 0.12;
            const startAngle = aimAngle - ((count - 1) * spread) / 2;

            for (let i = 0; i < count; i++) {
                const angle = startAngle + i * spread;
                const speed = isEvo ? data.speed : data.speed;
                this.projectiles.push(new Projectile({
                    weaponId: wId,
                    behavior: 'straight',
                    x: p.x,
                    y: p.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    angle: angle,
                    radius: 7,
                    damage: finalDmg,
                    lifetime: 1.5,
                    pierce: isEvo ? data.pierce : (lvlData.pierce || 1),
                    isCrit,
                    instantKillChance: isEvo ? data.instantKillChance : 0
                }));
            }

        // 4. Axe Battle / Death Scythe
        } else if (wId === 'axe_battle' || wId === 'death_scythe') {
            window.soundFx.playSlash();
            if (isEvo) {
                this.addScreenShake(4);
                const totalScythes = 8 + p.amountBonus;
                for (let i = 0; i < totalScythes; i++) {
                    const ang = (i * Math.PI * 2) / totalScythes;
                    this.projectiles.push(new Projectile({
                        weaponId: wId,
                        behavior: 'straight',
                        x: p.x,
                        y: p.y,
                        vx: Math.cos(ang) * data.speed,
                        vy: Math.sin(ang) * data.speed,
                        rotSpeed: 14,
                        radius: 26,
                        damage: finalDmg,
                        lifetime: 2.6,
                        pierce: 999,
                        isCrit
                    }));
                }
                this.particles.burst(p.x, p.y, 20, '#9d4edd', 180, 'spark');
            } else {
                for (let i = 0; i < count; i++) {
                    const vx = (Math.cos(aimAngle) * (180 + i * 40)) + (Math.random() - 0.5) * 80;
                    const vy = -480 - (Math.random() * 80);
                    this.projectiles.push(new Projectile({
                        weaponId: wId,
                        behavior: 'arc',
                        x: p.x,
                        y: p.y,
                        vx: vx,
                        vy: vy,
                        rotSpeed: 10,
                        radius: 18,
                        damage: finalDmg,
                        lifetime: 1.7,
                        pierce: 999,
                        isCrit
                    }));
                }
            }

        // 5. Boomerang / Sacred Boomerang (8-Directional Throw)
        } else if (wId === 'boomerang' || wId === 'sacred_boomerang') {
            window.soundFx.playBoomerang();
            for (let i = 0; i < count; i++) {
                const angle = aimAngle + (i - (count - 1) / 2) * 0.32;
                const speed = isEvo ? data.speed : data.speed;
                this.projectiles.push(new Projectile({
                    weaponId: wId,
                    behavior: 'boomerang',
                    x: p.x,
                    y: p.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    rotSpeed: 18,
                    radius: isEvo ? 22 : 15,
                    damage: finalDmg,
                    lifetime: 2.4,
                    pierce: 999,
                    isCrit
                }));
            }

        // 6. Tome Sizz / Kasizz Halo
        } else if (wId === 'tome_sizz' || wId === 'halo_kasizz') {
            this.projectiles = this.projectiles.filter(pr => pr.weaponId !== wId);
            const duration = (isEvo ? 999999 : lvlData.duration) * p.durationMod;
            const orbitR = 95 * p.areaMod;
            const orbSpeed = isEvo ? data.orbitSpeed : data.orbitSpeed;

            for (let i = 0; i < count; i++) {
                const ang = (i * Math.PI * 2) / count;
                this.projectiles.push(new Projectile({
                    weaponId: wId,
                    behavior: 'orbit',
                    x: p.x + Math.cos(ang) * orbitR,
                    y: p.y + Math.sin(ang) * orbitR,
                    orbitAngle: ang,
                    orbitRadius: orbitR,
                    orbitSpeed: orbSpeed,
                    rotSpeed: 8,
                    radius: isEvo ? 20 : 13,
                    damage: finalDmg,
                    lifetime: duration,
                    pierce: 999,
                    knockback: 8,
                    isCrit
                }));
            }

        // 7. Wand Bang / Wrath Kaboom
        } else if (wId === 'wand_bang' || wId === 'wrath_kaboom') {
            window.soundFx.playExplosion();
            this.addScreenShake(isEvo ? 6 : 3);
            const radius = (isEvo ? data.radius : lvlData.radius) * p.areaMod;

            for (let i = 0; i < count; i++) {
                const nearby = this.grid.queryRadius(p.x, p.y, 480);
                let targetPos = {
                    x: p.x + (Math.random() - 0.5) * 520,
                    y: p.y + (Math.random() - 0.5) * 520
                };
                if (nearby.length > 0) {
                    const picked = nearby[Math.floor(Math.random() * nearby.length)];
                    targetPos.x = picked.x;
                    targetPos.y = picked.y;
                }

                this.projectiles.push(new Projectile({
                    weaponId: wId,
                    behavior: 'strike_area',
                    x: targetPos.x,
                    y: targetPos.y,
                    radius: radius,
                    damage: finalDmg,
                    lifetime: 0.35,
                    pierce: 999,
                    isCrit
                }));
                this.particles.burst(targetPos.x, targetPos.y, 14, isEvo ? '#ff0055' : '#ffaa00', 140, 'spark');
            }

        // 8. Aura Herb / Domain Yggdrasil
        } else if (wId === 'aura_herb' || wId === 'domain_yggdrasil') {
            const radius = (isEvo ? data.radius : lvlData.radius) * p.areaMod;
            const tickRate = isEvo ? data.tickRate : lvlData.tickRate;
            weaponSlot.timer = tickRate;

            const inRange = this.grid.queryRadius(p.x, p.y, radius);
            for (const enemy of inRange) {
                const dealt = enemy.takeDamage(finalDmg, 3, p.x, p.y);
                p.damageDealt += dealt;
                this.floatingTexts.push(new FloatingText(enemy.x, enemy.y, dealt, isCrit ? '#ffd700' : '#81c784', isCrit));

                if (isEvo && data.lifeSteal) {
                    p.heal(data.lifeSteal);
                }
            }

            this.projectiles.push(new Projectile({
                weaponId: wId,
                behavior: 'aura',
                x: p.x,
                y: p.y,
                radius: radius,
                damage: 0,
                lifetime: 0.25,
                pierce: 999
            }));

            // Floating green leaves for Yggdrasil
            if (isEvo && Math.random() < 0.4) {
                this.particles.add({
                    x: p.x + (Math.random() * radius - radius / 2),
                    y: p.y + (Math.random() * radius - radius / 2),
                    vy: -25,
                    color: '#2ecc71',
                    radius: 3,
                    shape: 'leaf',
                    lifetime: 0.8
                });
            }
        }
    }

    // --- Enemy Spawning & Waves (30 Minutes Engine) ---
    updateSpawner(dt) {
        this.enemySpawnTimer += dt;

        let currentWave = GAME_DATA.waves[0];
        for (let i = 0; i < GAME_DATA.waves.length; i++) {
            const w = GAME_DATA.waves[i];
            if (this.gameTime >= w.startTime && this.gameTime < w.endTime) {
                currentWave = w;
                if (w.announce && !this.announcedWaves.has(i)) {
                    this.announcedWaves.add(i);
                    this.ui.showBanner(w.announce, 5000);
                    if (w.boss) {
                        this.spawnEnemy(w.boss, true);
                    }
                }
                break;
            }
        }

        const interval = currentWave.spawnInterval || 0.5;
        const maxActive = currentWave.maxActive || 120;

        if (this.enemySpawnTimer >= interval && this.enemies.length < maxActive && currentWave.enemies) {
            this.enemySpawnTimer = 0;
            const enemyType = currentWave.enemies[Math.floor(Math.random() * currentWave.enemies.length)];
            this.spawnEnemy(enemyType);

            // Rare metal spawns
            if (currentWave.special === 'metal_slime_chance' && Math.random() < 0.05) {
                this.spawnEnemy('metal_slime');
            } else if (currentWave.special === 'liquid_metal_chance' && Math.random() < 0.04) {
                this.spawnEnemy('liquid_metal_slime');
            } else if (currentWave.special === 'king_metal_chance' && Math.random() < 0.02) {
                this.spawnEnemy('king_metal_slime');
            }
        }
    }

    spawnEnemy(type, isBoss = false) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.max(this.canvas.width, this.canvas.height) * 0.65 + (Math.random() * 80);
        const x = this.player.x + Math.cos(angle) * dist;
        const y = this.player.y + Math.sin(angle) * dist;

        const enemy = new Enemy(this.nextEnemyId++, type, x, y);
        this.enemies.push(enemy);

        if (isBoss) {
            this.addScreenShake(8);
        }
    }

    // --- Projectile Physics & Collisions ---
    updateProjectiles(dt) {
        const p = this.player;

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.update(dt, p.x, p.y);

            if (proj.damage > 0 && !proj.dead) {
                const candidates = this.grid.queryRadius(proj.x, proj.y, proj.radius + 18);

                for (let j = 0; j < candidates.length; j++) {
                    const enemy = candidates[j];
                    if (proj.hitEnemies.has(enemy.id)) continue;

                    proj.hitEnemies.add(enemy.id);

                    // Check instant-kill
                    let dmgToDeal = proj.damage;
                    let isInstantKill = false;
                    if (proj.instantKillChance && Math.random() < proj.instantKillChance && !enemy.data.isBoss) {
                        dmgToDeal = enemy.hp + 999;
                        isInstantKill = true;
                        window.soundFx.playInstantKill();
                        this.particles.burst(enemy.x, enemy.y, 20, '#ff0055', 200, 'spark');
                    }

                    const dealt = enemy.takeDamage(dmgToDeal, proj.knockback, proj.x, proj.y);
                    p.damageDealt += dealt;

                    if (proj.isCrit) {
                        window.soundFx.playCritical();
                        this.particles.burst(enemy.x, enemy.y, 8, '#ffd700', 120, 'star');
                    }

                    // True Loto Blade lifesteal on crit
                    if (proj.weaponId === 'true_loto_blade' && proj.isCrit) {
                        p.heal(3);
                        this.particles.add({ x: p.x, y: p.y - 12, vy: -30, color: '#00ffff', radius: 4, shape: 'cross', lifetime: 0.5 });
                    }

                    const txt = isInstantKill ? '即死!!' : dealt;
                    this.floatingTexts.push(new FloatingText(enemy.x, enemy.y, txt, proj.isCrit ? '#ffd700' : '#ffffff', proj.isCrit));

                    proj.pierce--;
                    if (proj.pierce <= 0) {
                        proj.dead = true;
                        break;
                    }
                }
            }

            if (proj.dead) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    // --- Enemies Update ---
    updateEnemies(dt) {
        const p = this.player;

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(dt, p.x, p.y, this.grid, this.particles);

            // Player contact damage
            const dist = Math.hypot(p.x - enemy.x, p.y - enemy.y);
            if (dist < p.radius + enemy.radius) {
                const hurt = p.takeDamage(enemy.damage);
                if (hurt > 0) {
                    this.addScreenShake(4);
                    this.floatingTexts.push(new FloatingText(p.x, p.y, `-${hurt}`, '#e63946'));
                }
            }

            // Check Enemy Death
            if (enemy.hp <= 0) {
                p.kills++;
                p.coins += Math.floor(enemy.data.points / 10);

                // Death burst particles
                this.particles.burst(enemy.x, enemy.y, enemy.data.isBoss ? 24 : 8, enemy.data.color, 100);

                // Drop Exp Gem
                this.gems.push(new ExpGem(enemy.x, enemy.y, enemy.data.exp));

                // Drop Chest if boss
                if (enemy.data.chestDrop) {
                    this.chests.push(new Chest(enemy.x, enemy.y));
                }

                // Check Victory condition (Zoma defeated at 30:00!)
                if (enemy.data.isFinalBoss) {
                    this.state = 'VICTORY';
                    window.soundFx.stopBgm();
                    this.ui.showVictory(p, this.gameTime, () => {
                        this.start();
                    });
                    return;
                }

                this.enemies.splice(i, 1);
            }
        }
    }

    // --- Pickups Update (Gems & Chests) ---
    updatePickups(dt) {
        const p = this.player;

        // Exp Gems
        for (let i = this.gems.length - 1; i >= 0; i--) {
            const gem = this.gems[i];
            const collected = gem.update(dt, p.x, p.y, p.pickupRange);
            if (collected) {
                window.soundFx.playExp();
                const leveledUp = p.gainExp(gem.val);
                if (leveledUp) {
                    this.triggerLevelUp();
                }
            }
            if (gem.dead) {
                this.gems.splice(i, 1);
            }
        }

        // Chests
        for (let i = this.chests.length - 1; i >= 0; i--) {
            const chest = this.chests[i];
            if (chest.checkPickup(p.x, p.y)) {
                chest.dead = true;
                this.chests.splice(i, 1);
                this.triggerChestOpen();
                break;
            }
        }
    }

    // --- Level Up Generation ---
    triggerLevelUp() {
        this.state = 'LEVEL_UP';
        const p = this.player;
        const options = [];

        // 1. Existing weapon upgrades
        for (const w of p.weapons) {
            if (!w.isEvolved) {
                const wData = GAME_DATA.weapons[w.id];
                if (w.level < wData.maxLevel) {
                    const nextLvlData = wData.levels[w.level];
                    options.push({
                        type: 'weapon_upgrade',
                        id: w.id,
                        name: wData.name,
                        icon: wData.icon,
                        levelText: `Lv.${w.level} ➔ Lv.${w.level + 1}`,
                        desc: nextLvlData.desc,
                        ref: w
                    });
                }
            }
        }

        // 2. Existing passive upgrades
        for (const pass of p.passives) {
            const pData = GAME_DATA.passives[pass.id];
            if (pass.level < pData.maxLevel) {
                const nextLvlData = pData.levels[pass.level];
                options.push({
                    type: 'passive_upgrade',
                    id: pass.id,
                    name: pData.name,
                    icon: pData.icon,
                    levelText: `Lv.${pass.level} ➔ Lv.${pass.level + 1}`,
                    desc: nextLvlData.desc,
                    ref: pass
                });
            }
        }

        // 3. New weapons (if slots available < 6)
        if (p.weapons.length < 6) {
            for (const [wId, wData] of Object.entries(GAME_DATA.weapons)) {
                if (!p.weapons.some(w => w.id === wId)) {
                    options.push({
                        type: 'weapon_new',
                        id: wId,
                        name: wData.name,
                        icon: wData.icon,
                        levelText: '【新獲得武器】',
                        desc: wData.levels[0].desc,
                        ref: wData
                    });
                }
            }
        }

        // 4. New passives (if slots available < 6)
        if (p.passives.length < 6) {
            for (const [pId, pData] of Object.entries(GAME_DATA.passives)) {
                if (!p.passives.some(pass => pass.id === pId)) {
                    options.push({
                        type: 'passive_new',
                        id: pId,
                        name: pData.name,
                        icon: pData.icon,
                        levelText: '【新獲得飾品】',
                        desc: pData.levels[0].desc,
                        ref: pData
                    });
                }
            }
        }

        // Fallback
        if (options.length === 0) {
            options.push({
                type: 'coin_bag',
                id: 'coins',
                name: '傳說金幣袋',
                icon: '💰',
                levelText: '+150 金幣',
                desc: '裝備庫已達極限，獲得 150 枚冒險金幣！'
            });
        }

        const shuffled = options.sort(() => 0.5 - Math.random());
        const chosenCards = shuffled.slice(0, Math.min(3, shuffled.length));

        this.ui.showLevelUp(chosenCards, selected => {
            if (selected.type === 'weapon_upgrade') {
                p.upgradeWeapon(selected.id);
            } else if (selected.type === 'passive_upgrade') {
                p.upgradePassive(selected.id);
            } else if (selected.type === 'weapon_new') {
                p.addWeapon(selected.id);
            } else if (selected.type === 'passive_new') {
                p.addPassive(selected.id);
            } else if (selected.type === 'coin_bag') {
                p.coins += 150;
            }

            this.state = 'PLAYING';
            this.lastFrameTime = performance.now();
        });
    }

    // --- Chest Opening & Super Evolution System ---
    triggerChestOpen() {
        this.state = 'CHEST_OPEN';
        const p = this.player;

        let evoFound = null;
        for (const w of p.weapons) {
            if (!w.isEvolved && w.level >= 8) {
                for (const [evoId, evoData] of Object.entries(GAME_DATA.evolutions)) {
                    if (evoData.baseWeapon === w.id) {
                        const hasPassive = p.passives.some(pass => pass.id === evoData.requiredPassive);
                        if (hasPassive) {
                            evoFound = {
                                evoId: evoId,
                                baseWeaponId: w.id,
                                evoData: evoData,
                                baseData: GAME_DATA.weapons[w.id]
                            };
                            break;
                        }
                    }
                }
                if (evoFound) break;
            }
        }

        if (evoFound) {
            p.evolveWeapon(evoFound.baseWeaponId, evoFound.evoId);
            this.floatingTexts.push(new FloatingText(p.x, p.y, 'SUPER EVOLUTION!!', '#ff00ff', true, true));
            this.addScreenShake(12);

            this.ui.showChest({
                type: 'evolution',
                evo: evoFound.evoData,
                baseWeapon: evoFound.baseData
            }, () => {
                this.state = 'PLAYING';
                this.lastFrameTime = performance.now();
            });
            return;
        }

        // Regular upgrade
        const upgradeCandidates = [];
        for (const w of p.weapons) {
            if (!w.isEvolved && w.level < GAME_DATA.weapons[w.id].maxLevel) {
                upgradeCandidates.push({ type: 'weapon', item: GAME_DATA.weapons[w.id], ref: w });
            }
        }
        for (const pass of p.passives) {
            if (pass.level < GAME_DATA.passives[pass.id].maxLevel) {
                upgradeCandidates.push({ type: 'passive', item: GAME_DATA.passives[pass.id], ref: pass });
            }
        }

        if (upgradeCandidates.length > 0) {
            const picked = upgradeCandidates[Math.floor(Math.random() * upgradeCandidates.length)];
            let newLvl = 1;
            let desc = '';

            if (picked.type === 'weapon') {
                picked.ref.level++;
                newLvl = picked.ref.level;
                desc = picked.item.levels[newLvl - 1].desc;
            } else {
                picked.ref.level++;
                p.recalculateStats();
                newLvl = picked.ref.level;
                desc = picked.item.levels[newLvl - 1].desc;
            }

            this.ui.showChest({
                type: 'upgrade',
                item: picked.item,
                newLevel: newLvl,
                desc: desc
            }, () => {
                this.state = 'PLAYING';
                this.lastFrameTime = performance.now();
            });
        } else {
            p.coins += 250;
            this.ui.showChest({
                type: 'coins',
                coins: 250
            }, () => {
                this.state = 'PLAYING';
                this.lastFrameTime = performance.now();
            });
        }
    }

    // --- Render System (With Screen Shake) ---
    render(animTime) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.player) return;

        // Apply Screen Shake offset
        let shakeX = 0;
        let shakeY = 0;
        if (this.screenShake > 0) {
            shakeX = (Math.random() - 0.5) * this.screenShake;
            shakeY = (Math.random() - 0.5) * this.screenShake;
        }

        const renderCamX = this.camera.x + shakeX;
        const renderCamY = this.camera.y + shakeY;

        // 1. Draw Map Tile Background
        this.renderer.renderBackground(renderCamX, renderCamY, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(-renderCamX, -renderCamY);

        // 2. Draw Exp Gems
        for (const gem of this.gems) {
            this.renderer.drawGem(gem, animTime);
        }

        // 3. Draw Chests
        for (const chest of this.chests) {
            this.renderer.drawChest(chest, animTime);
        }

        // 4. Draw Enemies
        for (const enemy of this.enemies) {
            this.renderer.drawEnemy(enemy, animTime);
        }

        // 5. Draw Player (8-Directional)
        this.renderer.drawPlayer(this.player, animTime);

        // 6. Draw Projectiles & Weapon VFX
        for (const proj of this.projectiles) {
            this.renderer.drawProjectile(proj, animTime);
        }

        // 7. Draw Particle Effects (Sparks, Embers, Shockwaves)
        this.particles.render(this.ctx);

        // 8. Draw Floating Damage Numbers
        for (const fText of this.floatingTexts) {
            this.renderer.drawFloatingText(fText);
        }

        this.ctx.restore();
    }
}

window.Game = Game;
