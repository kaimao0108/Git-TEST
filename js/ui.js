// UI Controller for HUD, Cards, Modals, and DQ Dialogs

class UIController {
    constructor() {
        this.dom = {
            expBarFill: document.getElementById('exp-bar-fill'),
            expText: document.getElementById('hud-exp-text'),
            levelText: document.getElementById('hud-level-text'),
            hpBarFill: document.getElementById('hp-bar-fill'),
            hpText: document.getElementById('hp-text'),
            timer: document.getElementById('hud-timer'),
            kills: document.getElementById('hud-kills'),
            coins: document.getElementById('hud-coins'),
            weaponSlots: document.getElementById('weapon-slots'),
            passiveSlots: document.getElementById('passive-slots'),
            waveBanner: document.getElementById('wave-banner'),
            soundToggle: document.getElementById('sound-toggle'),
            bgmIndicator: document.getElementById('bgm-indicator'),
            btnPause: document.getElementById('btn-pause'),

            // Modals
            modalCharSelect: document.getElementById('modal-character-select'),
            charGrid: document.getElementById('char-selection-grid'),

            modalLevelUp: document.getElementById('modal-level-up'),
            levelUpCards: document.getElementById('level-up-cards'),

            modalChest: document.getElementById('modal-chest'),
            chestIcon: document.getElementById('chest-display-icon'),
            chestTitle: document.getElementById('chest-title'),
            chestDetail: document.getElementById('chest-content-detail'),
            btnChestClaim: document.getElementById('btn-chest-claim'),

            modalPause: document.getElementById('modal-pause'),
            pauseStatsTable: document.getElementById('pause-stats-table'),
            btnPauseField: document.getElementById('btn-pause-field'),
            btnPauseBoss: document.getElementById('btn-pause-boss'),
            btnResume: document.getElementById('btn-resume'),

            modalGameOver: document.getElementById('modal-game-over'),
            gameOverStats: document.getElementById('game-over-stats'),
            btnRestartGameOver: document.getElementById('btn-restart-gameover'),

            modalVictory: document.getElementById('modal-victory'),
            victoryStats: document.getElementById('victory-stats'),
            btnRestartVictory: document.getElementById('btn-restart-victory')
        };

        this.initStaticSlots();
        this.initSoundToggle();
    }

    initStaticSlots() {
        // Build 6 empty weapon slots
        this.dom.weaponSlots.innerHTML = '';
        for (let i = 0; i < 6; i++) {
            const div = document.createElement('div');
            div.className = 'slot-item';
            div.id = `w-slot-${i}`;
            this.dom.weaponSlots.appendChild(div);
        }

        // Build 6 empty passive slots
        this.dom.passiveSlots.innerHTML = '';
        for (let i = 0; i < 6; i++) {
            const div = document.createElement('div');
            div.className = 'slot-item';
            div.id = `p-slot-${i}`;
            this.dom.passiveSlots.appendChild(div);
        }
    }

    initSoundToggle() {
        this.dom.soundToggle.addEventListener('click', () => {
            const on = window.soundFx.toggle();
            this.dom.soundToggle.textContent = on ? '🔊' : '🔇';
            if (this.dom.bgmIndicator) {
                this.dom.bgmIndicator.style.opacity = on ? '1' : '0.4';
            }
        });

        if (this.dom.bgmIndicator) {
            this.dom.bgmIndicator.addEventListener('click', () => {
                window.soundFx.playSelect();
                if (window.soundFx.currentTrack === 'boss') {
                    window.soundFx.switchToField();
                } else {
                    window.soundFx.switchToBoss();
                }
            });

            window.soundFx.onTrackChange = (track) => {
                this.updateBgmIndicator(track);
            };
        }
    }

    updateBgmIndicator(track) {
        if (!this.dom.bgmIndicator) return;
        if (track === 'boss') {
            this.dom.bgmIndicator.textContent = '⚔️ DQ BOSS戰【勇者的挑戰】';
            this.dom.bgmIndicator.style.borderColor = '#ff4444';
            this.dom.bgmIndicator.style.color = '#ff6666';
            this.dom.bgmIndicator.style.boxShadow = '0 0 10px rgba(255, 68, 68, 0.5)';
        } else {
            this.dom.bgmIndicator.textContent = '🌲 DQ 原野【冒險的旅程】';
            this.dom.bgmIndicator.style.borderColor = '#ffd700';
            this.dom.bgmIndicator.style.color = '#ffd700';
            this.dom.bgmIndicator.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.35)';
        }
    }

    updateHUD(player, gameTime) {
        // Level & Exp
        const expPct = Math.min(100, Math.floor((player.exp / player.expToNext) * 100));
        this.dom.expBarFill.style.width = `${expPct}%`;
        this.dom.expText.textContent = `EXP: ${player.exp} / ${player.expToNext} (${expPct}%)`;
        this.dom.levelText.textContent = `Lv. ${player.level} ${player.character.name}`;

        // HP Bar
        const hpPct = Math.max(0, Math.min(100, Math.floor((player.hp / player.maxHp) * 100)));
        this.dom.hpBarFill.style.width = `${hpPct}%`;
        this.dom.hpText.textContent = `HP: ${Math.round(player.hp)} / ${player.maxHp}`;

        // Timer (MM:SS)
        const mins = Math.floor(gameTime / 60);
        const secs = Math.floor(gameTime % 60);
        this.dom.timer.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        // Kills & Coins
        this.dom.kills.textContent = `💀 ${player.kills}`;
        this.dom.coins.textContent = `🪙 ${player.coins}`;

        // Inventory Weapon Slots
        for (let i = 0; i < 6; i++) {
            const slot = document.getElementById(`w-slot-${i}`);
            if (i < player.weapons.length) {
                const w = player.weapons[i];
                const data = w.isEvolved ? GAME_DATA.evolutions[w.id] : GAME_DATA.weapons[w.id];
                slot.className = `slot-item active ${w.isEvolved ? 'evolved' : ''}`;
                slot.innerHTML = `<span>${data.icon}</span><span class="slot-level">${w.isEvolved ? 'MAX' : 'Lv' + w.level}</span>`;
                slot.title = `${data.name} ${w.isEvolved ? '(超進化神兵)' : '(Lv.' + w.level + ')'}`;
            } else {
                slot.className = 'slot-item';
                slot.innerHTML = '';
                slot.title = '未裝備武器';
            }
        }

        // Inventory Passive Slots
        for (let i = 0; i < 6; i++) {
            const slot = document.getElementById(`p-slot-${i}`);
            if (i < player.passives.length) {
                const p = player.passives[i];
                const data = GAME_DATA.passives[p.id];
                slot.className = 'slot-item active';
                slot.innerHTML = `<span>${data.icon}</span><span class="slot-level">Lv${p.level}</span>`;
                slot.title = `${data.name} (Lv.${p.level})`;
            } else {
                slot.className = 'slot-item';
                slot.innerHTML = '';
                slot.title = '未裝備飾品';
            }
        }
    }

    showBanner(text, duration = 3500) {
        const b = this.dom.waveBanner;
        b.textContent = text;
        b.style.display = 'block';
        if (this.bannerTimeout) clearTimeout(this.bannerTimeout);
        this.bannerTimeout = setTimeout(() => {
            b.style.display = 'none';
        }, duration);
    }

    showCharacterSelect(onSelect) {
        this.dom.charGrid.innerHTML = '';
        Object.values(GAME_DATA.characters).forEach(char => {
            const card = document.createElement('div');
            card.className = 'char-card';
            const startingW = GAME_DATA.weapons[char.startingWeapon];
            card.innerHTML = `
                <h3>${char.name}</h3>
                <div class="char-title">${char.title}</div>
                <p>${char.desc}</p>
                <div class="starting-item">初始武器：${startingW.icon} ${startingW.name}</div>
            `;
            card.addEventListener('click', () => {
                window.soundFx.playSelect();
                this.dom.modalCharSelect.style.display = 'none';
                onSelect(char.id);
            });
            this.dom.charGrid.appendChild(card);
        });
        this.dom.modalCharSelect.style.display = 'flex';
    }

    showLevelUp(options, onChoose) {
        window.soundFx.playLevelUp();
        this.dom.levelUpCards.innerHTML = '';

        options.forEach(opt => {
            const card = document.createElement('div');
            card.className = `upgrade-card ${opt.isEvo ? 'is-evo' : ''}`;
            card.innerHTML = `
                <div class="card-icon">${opt.icon}</div>
                <div class="card-info">
                    <div class="card-header">
                        <span class="card-name">${opt.name}</span>
                        <span class="card-level-tag">${opt.levelText}</span>
                    </div>
                    <div class="card-desc">${opt.desc}</div>
                </div>
            `;
            card.addEventListener('click', () => {
                window.soundFx.playSelect();
                this.dom.modalLevelUp.style.display = 'none';
                onChoose(opt);
            });
            this.dom.levelUpCards.appendChild(card);
        });

        this.dom.modalLevelUp.style.display = 'flex';
    }

    showChest(chestResult, onClaim) {
        if (chestResult.type === 'evolution') {
            window.soundFx.playEvolution();
            this.dom.chestIcon.textContent = '🌟⚔️';
            this.dom.chestTitle.innerHTML = '<span style="color: #ff00ff; text-shadow: 0 0 10px #ff00ff;">✨ 武器超進化！SUPER EVOLUTION ✨</span>';
            const evo = chestResult.evo;
            this.dom.chestDetail.innerHTML = `
                <div style="font-size: 20px; color: #ffd700; font-weight: bold; margin-bottom: 8px;">
                    獲得神兵：${evo.icon} ${evo.name}！
                </div>
                <p style="color: #00ffff; font-size: 14px; margin-bottom: 8px;">原武器【${chestResult.baseWeapon.name}】已究極覺醒！</p>
                <p style="color: #fff; font-size: 13px; line-height: 1.5;">${evo.desc}</p>
            `;
        } else if (chestResult.type === 'upgrade') {
            window.soundFx.playChest();
            this.dom.chestIcon.textContent = '🎁';
            this.dom.chestTitle.textContent = '寶箱開啟！獲得強化！';
            this.dom.chestDetail.innerHTML = `
                <div style="font-size: 18px; color: #ffd700; font-weight: bold; margin-bottom: 8px;">
                    ${chestResult.item.icon} ${chestResult.item.name} 升級！
                </div>
                <p style="color: #00ffcc; font-size: 14px;">等級提升至 Lv.${chestResult.newLevel}</p>
                <p style="color: #ddd; font-size: 13px;">${chestResult.desc}</p>
            `;
        } else {
            window.soundFx.playChest();
            this.dom.chestIcon.textContent = '💰';
            this.dom.chestTitle.textContent = '寶箱開啟！獲得大量金幣！';
            this.dom.chestDetail.innerHTML = `
                <div style="font-size: 22px; color: #ffd700; font-weight: bold; margin-bottom: 8px;">
                    🪙 +${chestResult.coins} 金幣！
                </div>
                <p style="color: #aaa;">裝備已全滿，獲得豐厚金幣獎勵！</p>
            `;
        }

        this.dom.btnChestClaim.onclick = () => {
            window.soundFx.playSelect();
            this.dom.modalChest.style.display = 'none';
            onClaim();
        };

        this.dom.modalChest.style.display = 'flex';
    }

    showPause(player, gameTime, onResume) {
        window.soundFx.playSelect();
        const mins = Math.floor(gameTime / 60);
        const secs = Math.floor(gameTime % 60);
        const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        this.dom.pauseStatsTable.innerHTML = `
            <tr><td>生存時間</td><td>${timeStr}</td></tr>
            <tr><td>勇者等級</td><td>Lv. ${player.level}</td></tr>
            <tr><td>擊殺魔物數</td><td>${player.kills} 隻</td></tr>
            <tr><td>累積傷害總計</td><td>${Math.round(player.damageDealt)}</td></tr>
            <tr><td>當前生命值</td><td>${Math.round(player.hp)} / ${player.maxHp}</td></tr>
            <tr><td>攻擊威力加成</td><td>+${Math.round((player.might - 1) * 100)}%</td></tr>
            <tr><td>冷卻縮減加成</td><td>${Math.round((1 - player.cooldownMod) * 100)}%</td></tr>
            <tr><td>移動速度</td><td>${Math.round(player.speed)}</td></tr>
            <tr><td>護甲防禦</td><td>${player.armor}</td></tr>
            <tr><td>暴擊機率</td><td>${Math.round(player.critChance * 100)}%</td></tr>
            <tr><td>磁吸範圍</td><td>${Math.round(player.pickupRange)}</td></tr>
        `;

        if (this.dom.btnPauseField) {
            this.dom.btnPauseField.onclick = () => {
                window.soundFx.playSelect();
                window.soundFx.switchToField();
            };
        }

        if (this.dom.btnPauseBoss) {
            this.dom.btnPauseBoss.onclick = () => {
                window.soundFx.playSelect();
                window.soundFx.switchToBoss();
            };
        }

        this.dom.btnResume.onclick = () => {
            window.soundFx.playSelect();
            this.dom.modalPause.style.display = 'none';
            onResume();
        };

        this.dom.modalPause.style.display = 'flex';
    }

    showGameOver(player, gameTime, onRestart) {
        window.soundFx.playGameOver();
        const mins = Math.floor(gameTime / 60);
        const secs = Math.floor(gameTime % 60);
        const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        this.dom.gameOverStats.innerHTML = `
            <tr><td>最終生存時間</td><td>${timeStr}</td></tr>
            <tr><td>勇者等級</td><td>Lv. ${player.level}</td></tr>
            <tr><td>擊殺魔物</td><td>${player.kills} 隻</td></tr>
            <tr><td>造成傷害總量</td><td>${Math.round(player.damageDealt)}</td></tr>
            <tr><td>收集金幣</td><td>🪙 ${player.coins}</td></tr>
        `;

        this.dom.btnRestartGameOver.onclick = () => {
            window.soundFx.playSelect();
            this.dom.modalGameOver.style.display = 'none';
            onRestart();
        };

        this.dom.modalGameOver.style.display = 'flex';
    }

    showVictory(player, gameTime, onRestart) {
        window.soundFx.playVictory();
        const mins = Math.floor(gameTime / 60);
        const secs = Math.floor(gameTime % 60);
        const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        this.dom.victoryStats.innerHTML = `
            <tr><td>通關時間</td><td>${timeStr}</td></tr>
            <tr><td>傳說勇者等級</td><td>Lv. ${player.level}</td></tr>
            <tr><td>掃蕩魔物數</td><td>${player.kills} 隻</td></tr>
            <tr><td>毀滅級輸出總計</td><td>${Math.round(player.damageDealt)}</td></tr>
            <tr><td>收集金幣</td><td>🪙 ${player.coins}</td></tr>
        `;

        this.dom.btnRestartVictory.onclick = () => {
            window.soundFx.playSelect();
            this.dom.modalVictory.style.display = 'none';
            onRestart();
        };

        this.dom.modalVictory.style.display = 'flex';
    }
}

window.UIController = UIController;
