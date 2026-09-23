// Game Data, Weapons, Evolutions, Passives, Characters, and Monsters (30 Minutes Deluxe Edition)
const GAME_DATA = {
    // 角色設定 (DQ 經典職業)
    characters: {
        hero: {
            id: 'hero',
            name: '勇者 (Hero)',
            title: '傳說的羅德血脈',
            desc: '全能力均衡，初始自帶【羅德之劍】，擁有高額生命值與護甲，具備 8 方向神聖劍技。',
            baseHp: 140,
            speed: 215,
            might: 1.15,
            armor: 2,
            cooldownMod: 1.0,
            areaMod: 1.15,
            pickupRange: 130,
            startingWeapon: 'sword_loto',
            spriteColor: '#1e6fd9'
        },
        mage: {
            id: 'mage',
            name: '魔導師 (Mage)',
            title: '皇家大魔導士',
            desc: '精通毀滅法術，初始自帶【美拉法杖】，攻擊力超群且冷卻時間更短。',
            baseHp: 95,
            speed: 205,
            might: 1.35,
            armor: 0,
            cooldownMod: 0.85,
            areaMod: 1.25,
            pickupRange: 135,
            startingWeapon: 'wand_frizz',
            spriteColor: '#7a288a'
        },
        martial: {
            id: 'martial',
            name: '武鬥家 (Martial Artist)',
            title: '拳聖與刺客大師',
            desc: '身手敏捷，初始自帶【流星迴旋鏢】，移動飛快且暴擊率高達 25%。',
            baseHp: 115,
            speed: 255,
            might: 1.12,
            armor: 1,
            critRate: 0.25,
            cooldownMod: 0.95,
            areaMod: 1.05,
            pickupRange: 135,
            startingWeapon: 'boomerang',
            spriteColor: '#e65c00'
        },
        priest: {
            id: 'priest',
            name: '僧侶 (Priest)',
            title: '神聖引導者',
            desc: '神聖守護，初始自帶【基拉咒文書】，具備生命再生能力與高生存力。',
            baseHp: 125,
            speed: 210,
            might: 1.05,
            armor: 3,
            hpRegen: 1.8,
            cooldownMod: 1.0,
            areaMod: 1.3,
            pickupRange: 150,
            startingWeapon: 'tome_sizz',
            spriteColor: '#20b2aa'
        }
    },

    // 基礎武器 (8種)
    weapons: {
        sword_loto: {
            id: 'sword_loto',
            name: '羅德之劍',
            icon: '🗡️',
            desc: '向移動方向與身後揮出神聖鋒利斬擊，可穿透多名敵人。',
            maxLevel: 8,
            type: 'slash',
            baseDamage: 28,
            cooldown: 1.25,
            area: 120,
            projectiles: 1,
            knockback: 7,
            levels: [
                { damage: 28, area: 120, cooldown: 1.25, projectiles: 1, desc: '對身前與身後斬擊。' },
                { damage: 36, area: 130, cooldown: 1.2, projectiles: 1, desc: '傷害 +8，斬擊範圍擴大。' },
                { damage: 36, area: 140, cooldown: 1.15, projectiles: 2, desc: '前後斬擊次數 +1。' },
                { damage: 46, area: 155, cooldown: 1.05, projectiles: 2, desc: '傷害 +10，冷卻時間縮短。' },
                { damage: 46, area: 170, cooldown: 1.0, projectiles: 3, desc: '斬擊次數 +1，範圍提升。' },
                { damage: 60, area: 185, cooldown: 0.95, projectiles: 3, desc: '傷害 +14，斬擊更加寬廣。' },
                { damage: 72, area: 200, cooldown: 0.9, projectiles: 4, desc: '發射次數 +1，傷害 +12。' },
                { damage: 90, area: 225, cooldown: 0.8, projectiles: 4, desc: '滿級！傷害與範圍極致強化。' }
            ]
        },
        wand_frizz: {
            id: 'wand_frizz',
            name: '美拉法杖',
            icon: '🔥',
            desc: '朝最近的敵人發射高熱追蹤火球。',
            maxLevel: 8,
            type: 'projectile_homing',
            baseDamage: 24,
            cooldown: 1.1,
            speed: 420,
            projectiles: 1,
            levels: [
                { damage: 24, cooldown: 1.1, projectiles: 1, desc: '向最近敵人發射火球。' },
                { damage: 30, cooldown: 1.0, projectiles: 1, desc: '傷害 +6，冷卻減少。' },
                { damage: 30, cooldown: 1.0, projectiles: 2, desc: '火球數量 +1。' },
                { damage: 40, cooldown: 0.9, projectiles: 2, desc: '傷害 +10，飛行速度加快。' },
                { damage: 40, cooldown: 0.85, projectiles: 3, desc: '火球數量 +1。' },
                { damage: 52, cooldown: 0.8, projectiles: 3, desc: '傷害 +12，冷卻縮減。' },
                { damage: 52, cooldown: 0.75, projectiles: 4, desc: '火球數量 +1。' },
                { damage: 68, cooldown: 0.65, projectiles: 5, desc: '滿級！連發 5 顆狂暴火球。' }
            ]
        },
        dagger_poison: {
            id: 'dagger_poison',
            name: '毒蛾短劍',
            icon: '🗡️',
            desc: '朝面向方向以極速射出穿透飛刀。',
            maxLevel: 8,
            type: 'projectile_straight',
            baseDamage: 18,
            cooldown: 0.85,
            speed: 580,
            projectiles: 2,
            pierce: 1,
            levels: [
                { damage: 18, projectiles: 2, cooldown: 0.85, desc: '朝面前發射 2 把飛刀。' },
                { damage: 24, projectiles: 3, cooldown: 0.8, desc: '飛刀數量 +1，傷害增加。' },
                { damage: 24, projectiles: 3, cooldown: 0.72, pierce: 2, desc: '穿透力 +1，冷卻縮減。' },
                { damage: 30, projectiles: 4, cooldown: 0.68, pierce: 2, desc: '飛刀數量 +1。' },
                { damage: 30, projectiles: 5, cooldown: 0.62, pierce: 2, desc: '飛刀數量 +1，速度提升。' },
                { damage: 38, projectiles: 5, cooldown: 0.58, pierce: 3, desc: '穿透力 +1，傷害 +8。' },
                { damage: 38, projectiles: 6, cooldown: 0.52, pierce: 3, desc: '飛刀數量 +1。' },
                { damage: 50, projectiles: 8, cooldown: 0.42, pierce: 4, desc: '滿級！高速噴射 8 把劇毒短刃。' }
            ]
        },
        axe_battle: {
            id: 'axe_battle',
            name: '巨力之斧',
            icon: '🪓',
            desc: '向上拋出巨斧並砸落，具有極高單體與穿透砸地傷害。',
            maxLevel: 8,
            type: 'arc_lob',
            baseDamage: 45,
            cooldown: 1.75,
            area: 130,
            projectiles: 1,
            levels: [
                { damage: 45, projectiles: 1, cooldown: 1.75, desc: '向上高拋 1 把沉重巨斧。' },
                { damage: 58, projectiles: 1, cooldown: 1.65, desc: '傷害 +13。' },
                { damage: 58, projectiles: 2, cooldown: 1.55, desc: '斧頭數量 +1。' },
                { damage: 75, projectiles: 2, cooldown: 1.45, desc: '傷害 +17，範圍增加。' },
                { damage: 75, projectiles: 3, cooldown: 1.4, desc: '斧頭數量 +1。' },
                { damage: 95, projectiles: 3, cooldown: 1.3, desc: '傷害 +20。' },
                { damage: 95, projectiles: 4, cooldown: 1.2, desc: '斧頭數量 +1。' },
                { damage: 125, projectiles: 5, cooldown: 1.05, desc: '滿級！拋出 5 把雷霆破空重斧。' }
            ]
        },
        boomerang: {
            id: 'boomerang',
            name: '流星迴旋鏢',
            icon: '🪃',
            desc: '向前擲出並在極限處原路折返，穿透路徑上所有敵人。',
            maxLevel: 8,
            type: 'boomerang',
            baseDamage: 26,
            cooldown: 1.55,
            speed: 380,
            projectiles: 1,
            levels: [
                { damage: 26, projectiles: 1, cooldown: 1.55, desc: '擲出 1 枚穿透迴旋鏢。' },
                { damage: 34, projectiles: 1, cooldown: 1.45, desc: '傷害 +8，旋轉半徑增加。' },
                { damage: 34, projectiles: 2, cooldown: 1.4, desc: '數量 +1。' },
                { damage: 44, projectiles: 2, cooldown: 1.3, desc: '傷害 +10，飛行速度更快。' },
                { damage: 44, projectiles: 3, cooldown: 1.25, desc: '數量 +1。' },
                { damage: 56, projectiles: 3, cooldown: 1.15, desc: '傷害 +12。' },
                { damage: 56, projectiles: 4, cooldown: 1.05, desc: '數量 +1。' },
                { damage: 72, projectiles: 5, cooldown: 0.9, desc: '滿級！連續散射 5 枚流星飛鏢。' }
            ]
        },
        tome_sizz: {
            id: 'tome_sizz',
            name: '基拉咒文書',
            icon: '📖',
            desc: '召喚神聖光刃咒文圍繞自身旋轉，擊退接近的所有魔物。',
            maxLevel: 8,
            type: 'orbit',
            baseDamage: 20,
            cooldown: 2.7,
            duration: 2.6,
            orbitSpeed: 3.4,
            projectiles: 1,
            levels: [
                { damage: 20, projectiles: 1, duration: 2.6, cooldown: 2.7, desc: '1 圈神聖光印圍繞旋轉。' },
                { damage: 25, projectiles: 2, duration: 2.8, cooldown: 2.6, desc: '光印數量 +1。' },
                { damage: 30, projectiles: 2, duration: 3.1, cooldown: 2.5, desc: '持續時間增加，轉速加快。' },
                { damage: 30, projectiles: 3, duration: 3.4, cooldown: 2.4, desc: '光印數量 +1。' },
                { damage: 38, projectiles: 3, duration: 3.7, cooldown: 2.3, desc: '傷害 +8，持續延長。' },
                { damage: 38, projectiles: 4, duration: 4.0, cooldown: 2.2, desc: '光印數量 +1。' },
                { damage: 48, projectiles: 4, duration: 4.4, cooldown: 2.1, desc: '傷害 +10。' },
                { damage: 60, projectiles: 5, duration: 5.0, cooldown: 1.9, desc: '滿級！5 道聖光印記高速守護。' }
            ]
        },
        wand_bang: {
            id: 'wand_bang',
            name: '伊歐法杖',
            icon: '💥',
            desc: '在隨機敵人頭頂引發劇烈魔力爆炸，造成範圍毀滅傷。',
            maxLevel: 8,
            type: 'strike_area',
            baseDamage: 50,
            cooldown: 2.1,
            radius: 85,
            projectiles: 1,
            levels: [
                { damage: 50, projectiles: 1, cooldown: 2.1, radius: 85, desc: '隨機引發 1 次爆破。' },
                { damage: 62, projectiles: 1, cooldown: 2.0, radius: 95, desc: '傷害 +12，爆炸半徑擴大。' },
                { damage: 62, projectiles: 2, cooldown: 1.9, radius: 100, desc: '引爆次數 +1。' },
                { damage: 80, projectiles: 2, cooldown: 1.8, radius: 110, desc: '傷害 +18。' },
                { damage: 80, projectiles: 3, cooldown: 1.7, radius: 120, desc: '引爆次數 +1。' },
                { damage: 102, projectiles: 3, cooldown: 1.6, radius: 130, desc: '傷害 +22。' },
                { damage: 102, projectiles: 4, cooldown: 1.5, radius: 140, desc: '引爆次數 +1。' },
                { damage: 135, projectiles: 5, cooldown: 1.3, radius: 160, desc: '滿級！連續引爆 5 處巨大核爆。' }
            ]
        },
        aura_herb: {
            id: 'aura_herb',
            name: '藥草光環',
            icon: '🌿',
            desc: '周身散發淨化藥草光環，對踏入範圍的所有魔物造成持續傷害與減速。',
            maxLevel: 8,
            type: 'aura',
            baseDamage: 12,
            tickRate: 0.42,
            radius: 95,
            levels: [
                { damage: 12, radius: 95, tickRate: 0.42, desc: '自身周圍持續性傷害圈。' },
                { damage: 16, radius: 110, tickRate: 0.42, desc: '傷害 +4，光環半徑擴大。' },
                { damage: 22, radius: 125, tickRate: 0.39, desc: '打擊頻率加快，傷害 +6。' },
                { damage: 28, radius: 140, tickRate: 0.37, desc: '半徑擴大，傷害 +6。' },
                { damage: 36, radius: 155, tickRate: 0.35, desc: '擊退力增強，傷害 +8。' },
                { damage: 45, radius: 170, tickRate: 0.32, desc: '頻率與傷害進一步提升。' },
                { damage: 55, radius: 185, tickRate: 0.30, desc: '傷害 +10。' },
                { damage: 70, radius: 215, tickRate: 0.26, desc: '滿級！超大範圍神聖結界高頻震盪。' }
            ]
        }
    },

    // 超進化武器 (8種)
    evolutions: {
        true_loto_blade: {
            id: 'true_loto_blade',
            name: '真・羅德神劍',
            icon: '✨⚔️',
            baseWeapon: 'sword_loto',
            requiredPassive: 'bracer_might',
            desc: '【羅德之劍】與【豪傑手環】融合超進化！前後左右極巨神聖十字劍弧，暴擊吸血恢復生命值！',
            damage: 155,
            cooldown: 0.62,
            area: 300,
            projectiles: 4,
            lifeSteal: 3,
            critChance: 0.45,
            critMultiplier: 2.6
        },
        wand_kafrizz: {
            id: 'wand_kafrizz',
            name: '美拉柔瑪之杖',
            icon: '🌋🔥',
            baseWeapon: 'wand_frizz',
            requiredPassive: 'scroll_sage',
            desc: '【美拉法杖】與【賢者卷軸】融合超進化！無間斷機關槍式連續轟射巨大追蹤滅世火球！',
            damage: 98,
            cooldown: 0.16,
            speed: 550,
            projectiles: 1,
            pierce: 4
        },
        thousand_needles: {
            id: 'thousand_needles',
            name: '千本毒針',
            icon: '💫🗡️',
            baseWeapon: 'dagger_poison',
            requiredPassive: 'boots_wind',
            desc: '【毒蛾短劍】與【疾風之靴】融合超進化！如瀑布般瘋狂傾瀉無盡暗影飛刃，機率觸發即死刺殺！',
            damage: 65,
            cooldown: 0.11,
            speed: 720,
            projectiles: 3,
            pierce: 999,
            instantKillChance: 0.05
        },
        death_scythe: {
            id: 'death_scythe',
            name: '死神之鐮',
            icon: '💀🪓',
            baseWeapon: 'axe_battle',
            requiredPassive: 'belt_power',
            desc: '【巨力之斧】與【力量腰帶】融合超進化！以自身為中心向 360 度爆發旋轉飛行的巨型破滅鐮刀！',
            damage: 185,
            cooldown: 0.95,
            speed: 300,
            projectiles: 8,
            pierce: 999
        },
        sacred_boomerang: {
            id: 'sacred_boomerang',
            name: '破邪神鏢',
            icon: '⭐🪃',
            baseWeapon: 'boomerang',
            requiredPassive: 'coin_luck',
            desc: '【流星迴旋鏢】與【幸運銀幣】融合超進化！金黃雷光神聖輪刃縱橫全場，高達 4.0 倍極限暴擊！',
            damage: 110,
            cooldown: 0.72,
            speed: 500,
            projectiles: 6,
            critChance: 0.65,
            critMultiplier: 4.0
        },
        halo_kasizz: {
            id: 'halo_kasizz',
            name: '貝基拉剛咒環',
            icon: '🔥📖',
            baseWeapon: 'tome_sizz',
            requiredPassive: 'rosary_saint',
            desc: '【基拉咒文書】與【聖者念珠】融合超進化！永不消逝的烈焰光輪壁障環繞周身，形成絕對禁區！',
            damage: 88,
            duration: 999999,
            cooldown: 0.1,
            orbitSpeed: 5.8,
            projectiles: 8
        },
        wrath_kaboom: {
            id: 'wrath_kaboom',
            name: '伊歐那珍天怒',
            icon: '💥⚡',
            baseWeapon: 'wand_bang',
            requiredPassive: 'pendant_magic',
            desc: '【伊歐法杖】與【魔法吊墜】融合超進化！在全螢幕敵群密集處降下毀天滅地的連環神聖光爆！',
            damage: 210,
            cooldown: 1.15,
            radius: 220,
            projectiles: 8
        },
        domain_yggdrasil: {
            id: 'domain_yggdrasil',
            name: '世界樹結界',
            icon: '🌳🛡️',
            baseWeapon: 'aura_herb',
            requiredPassive: 'lantern_traveler',
            desc: '【藥草光環】與【旅人提燈】融合超進化！覆蓋半個螢幕的世界樹聖域，粉碎靠近魔物並持續吸血治療！',
            damage: 95,
            radius: 280,
            tickRate: 0.20,
            lifeSteal: 2
        }
    },

    // 被動配件 (7種)
    passives: {
        bracer_might: {
            id: 'bracer_might',
            name: '豪傑手環',
            icon: '💪',
            desc: '強化體魄，提升所有武器的傷害威力。',
            maxLevel: 5,
            stat: 'might',
            levels: [
                { value: 0.10, desc: '所有傷害 +10%' },
                { value: 0.20, desc: '所有傷害 +20%' },
                { value: 0.30, desc: '所有傷害 +30%' },
                { value: 0.40, desc: '所有傷害 +40%' },
                { value: 0.50, desc: '所有傷害 +50%（超進化必要：羅德之劍）' }
            ]
        },
        scroll_sage: {
            id: 'scroll_sage',
            name: '賢者卷軸',
            icon: '📜',
            desc: '銘刻古代冥想術，大幅縮短所有武器的冷卻時間。',
            maxLevel: 5,
            stat: 'cooldown',
            levels: [
                { value: -0.08, desc: '武器冷卻時間 -8%' },
                { value: -0.16, desc: '武器冷卻時間 -16%' },
                { value: -0.24, desc: '武器冷卻時間 -24%' },
                { value: -0.32, desc: '武器冷卻時間 -32%' },
                { value: -0.40, desc: '武器冷卻時間 -40%（超進化必要：美拉法杖）' }
            ]
        },
        boots_wind: {
            id: 'boots_wind',
            name: '疾風之靴',
            icon: '👟',
            desc: '受到風之精靈庇護，大幅提升英雄移動速度。',
            maxLevel: 5,
            stat: 'speed',
            levels: [
                { value: 0.10, desc: '移動速度 +10%' },
                { value: 0.20, desc: '移動速度 +20%' },
                { value: 0.30, desc: '移動速度 +30%' },
                { value: 0.40, desc: '移動速度 +40%' },
                { value: 0.50, desc: '移動速度 +50%（超進化必要：毒蛾短劍）' }
            ]
        },
        belt_power: {
            id: 'belt_power',
            name: '力量腰帶',
            icon: '🥋',
            desc: '擴大所有武器與法術的攻擊與爆炸範圍。',
            maxLevel: 5,
            stat: 'area',
            levels: [
                { value: 0.12, desc: '攻擊範圍 +12%' },
                { value: 0.24, desc: '攻擊範圍 +24%' },
                { value: 0.36, desc: '攻擊範圍 +36%' },
                { value: 0.48, desc: '攻擊範圍 +48%' },
                { value: 0.60, desc: '攻擊範圍 +60%（超進化必要：巨力之斧）' }
            ]
        },
        coin_luck: {
            id: 'coin_luck',
            name: '幸運銀幣',
            icon: '🪙',
            desc: '獲得幸運女神眷顧，暴擊率大幅提升，擊殺金幣掉落增加。',
            maxLevel: 5,
            stat: 'crit',
            levels: [
                { value: 0.10, desc: '暴擊率 +10%' },
                { value: 0.20, desc: '暴擊率 +20%' },
                { value: 0.30, desc: '暴擊率 +30%' },
                { value: 0.40, desc: '暴擊率 +40%' },
                { value: 0.50, desc: '暴擊率 +50%（超進化必要：流星迴旋鏢）' }
            ]
        },
        rosary_saint: {
            id: 'rosary_saint',
            name: '聖者念珠',
            icon: '📿',
            desc: '神聖庇佑，延長旋轉法術持續時間並減輕受到的傷害。',
            maxLevel: 5,
            stat: 'duration',
            levels: [
                { value: 0.15, desc: '法術持續時間 +15%' },
                { value: 0.30, desc: '法術持續時間 +30%' },
                { value: 0.45, desc: '法術持續時間 +45%' },
                { value: 0.60, desc: '法術持續時間 +60%' },
                { value: 0.75, desc: '法術持續時間 +75%（超進化必要：基拉咒文書）' }
            ]
        },
        pendant_magic: {
            id: 'pendant_magic',
            name: '魔法吊墜',
            icon: '💎',
            desc: '注入純淨魔力，全武器投射物發射數量增加。',
            maxLevel: 5,
            stat: 'amount',
            levels: [
                { value: 1, desc: '全武器投射數量 +1' },
                { value: 1, desc: '全武器投射數量 +1 (累計2)' },
                { value: 2, desc: '全武器投射數量 +2 (累計3)' },
                { value: 2, desc: '全武器投射數量 +2 (累計4)' },
                { value: 3, desc: '全武器投射數量 +3 (超進化必要：伊歐法杖)' }
            ]
        },
        lantern_traveler: {
            id: 'lantern_traveler',
            name: '旅人提燈',
            icon: '🏮',
            desc: '照亮四周，極大幅度拓展經驗寶石與掉落物的吸取半徑。',
            maxLevel: 5,
            stat: 'magnet',
            levels: [
                { value: 0.35, desc: '拾取範圍 +35%' },
                { value: 0.70, desc: '拾取範圍 +70%' },
                { value: 1.05, desc: '拾取範圍 +105%' },
                { value: 1.40, desc: '拾取範圍 +140%' },
                { value: 1.75, desc: '拾取範圍 +175%（超進化必要：藥草光環）' }
            ]
        }
    },

    // 怪物設定 (DQ 經典怪獸擴充庫 - 共 20+ 種)
    monsters: {
        slime: {
            id: 'slime',
            name: '史萊姆',
            hp: 24,
            speed: 85,
            damage: 8,
            exp: 1,
            color: '#1e90ff',
            radius: 14,
            points: 10
        },
        bubble_slime: {
            id: 'bubble_slime',
            name: '斑點史萊姆',
            hp: 40,
            speed: 105,
            damage: 10,
            exp: 2,
            color: '#32cd32',
            radius: 16,
            points: 20
        },
        dracky: {
            id: 'dracky',
            name: '朵拉奇',
            hp: 36,
            speed: 135,
            damage: 12,
            exp: 2,
            color: '#8b008b',
            radius: 15,
            erratic: true,
            points: 25
        },
        healslime: {
            id: 'healslime',
            name: '荷伊米史萊姆',
            hp: 65,
            speed: 95,
            damage: 8,
            exp: 4,
            color: '#ffd700',
            radius: 15,
            isHealer: true,
            healRadius: 150,
            points: 40
        },
        hammerhood: {
            id: 'hammerhood',
            name: '大木槌',
            hp: 95,
            speed: 75,
            damage: 18,
            exp: 4,
            color: '#cd853f',
            radius: 18,
            points: 50
        },
        ghost: {
            id: 'ghost',
            name: '鬼魂',
            hp: 48,
            speed: 125,
            damage: 14,
            exp: 3,
            color: '#e0f7fa',
            radius: 15,
            erratic: true,
            points: 35
        },
        mud_hand: {
            id: 'mud_hand',
            name: '泥手',
            hp: 55,
            speed: 95,
            damage: 15,
            exp: 3,
            color: '#8b5a2b',
            radius: 14,
            points: 30
        },
        metal_slime: {
            id: 'metal_slime',
            name: '金屬史萊姆',
            hp: 14,
            speed: 215,
            damage: 6,
            exp: 180, // 巨額經驗！
            color: '#d3d3d3',
            silver: true,
            radius: 14,
            points: 500,
            armor: 6
        },
        skeleton: {
            id: 'skeleton',
            name: '骷髏戰士',
            hp: 180,
            speed: 110,
            damage: 22,
            exp: 6,
            color: '#f5f5f5',
            radius: 18,
            points: 80
        },
        liquid_metal_slime: {
            id: 'liquid_metal_slime',
            name: '迷路金屬史萊姆 (はぐれメタル)',
            hp: 20,
            speed: 250,
            damage: 10,
            exp: 450, // 超巨額經驗！
            color: '#e8e8e8',
            silver: true,
            radius: 16,
            points: 1200,
            armor: 10
        },
        golem: {
            id: 'golem',
            name: '巨岩魔像',
            hp: 450,
            speed: 65,
            damage: 34,
            exp: 14,
            color: '#b8860b',
            radius: 24,
            points: 150
        },
        restless_armour: {
            id: 'restless_armour',
            name: '死靈騎士',
            hp: 300,
            speed: 95,
            damage: 28,
            exp: 10,
            color: '#4682b4',
            radius: 19,
            armor: 3,
            points: 110
        },
        chimera: {
            id: 'chimera',
            name: '奇美拉',
            hp: 280,
            speed: 145,
            damage: 26,
            exp: 12,
            color: '#ff4500',
            radius: 20,
            points: 120
        },
        hellion: {
            id: 'hellion',
            name: '地獄炎魔',
            hp: 340,
            speed: 150,
            damage: 32,
            exp: 14,
            color: '#b22222',
            radius: 20,
            points: 140
        },
        archdemon: {
            id: 'archdemon',
            name: '惡魔神官',
            hp: 420,
            speed: 115,
            damage: 34,
            exp: 18,
            color: '#4b0082',
            radius: 22,
            points: 200
        },
        cyclops: {
            id: 'cyclops',
            name: '獨眼巨人',
            hp: 750,
            speed: 85,
            damage: 48,
            exp: 30,
            color: '#1e3f66',
            radius: 26,
            points: 300
        },
        king_metal_slime: {
            id: 'king_metal_slime',
            name: '金屬史萊姆王',
            hp: 40,
            speed: 230,
            damage: 15,
            exp: 1600, // 宇宙級經驗！
            color: '#ffffff',
            silver: true,
            radius: 22,
            points: 3000,
            armor: 14
        },

        // --- 菁英與 BOSS 大軍 (觸發 BOSS 專屬戰鬥曲) ---
        slime_knight: {
            id: 'slime_knight',
            name: '史萊姆騎士 (BOSS - 05:00)',
            hp: 2400,
            speed: 120,
            damage: 35,
            exp: 80,
            color: '#00fa9a',
            radius: 28,
            isBoss: true,
            chestDrop: true,
            points: 1000
        },
        mimic_king: {
            id: 'mimic_king',
            name: '寶箱怪王 (BOSS - 10:00)',
            hp: 6500,
            speed: 140,
            damage: 45,
            exp: 150,
            color: '#8b4513',
            radius: 30,
            isBoss: true,
            chestDrop: true,
            points: 2000
        },
        killer_machine: {
            id: 'killer_machine',
            name: '殺人機器 (BOSS - 15:00)',
            hp: 14000,
            speed: 150,
            damage: 55,
            exp: 250,
            color: '#4169e1',
            radius: 34,
            isBoss: true,
            chestDrop: true,
            points: 3500
        },
        great_dragon: {
            id: 'great_dragon',
            name: '巨龍 (BOSS - 20:00)',
            hp: 26000,
            speed: 115,
            damage: 65,
            exp: 400,
            color: '#dc143c',
            radius: 42,
            isBoss: true,
            chestDrop: true,
            points: 5000
        },
        baramos: {
            id: 'baramos',
            name: '魔王 巴拉莫斯 (BOSS - 25:00)',
            hp: 48000,
            speed: 125,
            damage: 75,
            exp: 800,
            color: '#7b1113',
            radius: 44,
            isBoss: true,
            chestDrop: true,
            points: 8000
        },
        zoma: {
            id: 'zoma',
            name: '大魔王 索瑪 (FINAL BOSS - 30:00)',
            hp: 110000,
            speed: 130,
            damage: 95,
            exp: 3000,
            color: '#1d2d50',
            radius: 50,
            isBoss: true,
            isFinalBoss: true,
            chestDrop: true,
            points: 20000
        }
    },

    // 30 分鐘完整波次進程表 (00:00 - 30:00)
    waves: [
        // 00:00 - 01:20: 新手期
        { startTime: 0, endTime: 80, enemies: ['slime', 'bubble_slime'], spawnInterval: 0.7, maxActive: 70 },
        // 01:20 (80s): 前哨 BOSS 史萊姆騎士 (第一時間體驗 DQ BOSS 戰鬥曲！)
        { startTime: 80, endTime: 85, boss: 'slime_knight', announce: '⚔️ 遭遇強敵！【史萊姆騎士】突襲現身！BOSS 戰鬥展開！' },
        // 01:25 - 03:00: 飛行朵拉奇與治療荷伊米史萊姆
        { startTime: 85, endTime: 180, enemies: ['slime', 'dracky', 'healslime'], spawnInterval: 0.55, maxActive: 95 },
        // 03:00 - 05:00: 大木槌與鬼魂推進
        { startTime: 180, endTime: 300, enemies: ['bubble_slime', 'hammerhood', 'ghost'], spawnInterval: 0.45, maxActive: 120 },

        // 05:00 (300s): BOSS 1 史萊姆騎士
        { startTime: 300, endTime: 305, boss: 'slime_knight', announce: '⚔️ 警告！史萊姆騎士 降臨！BOSS 戰鬥展開！' },
        // 05:00 - 08:00: 泥手海潮突圍 + 金屬史萊姆
        { startTime: 305, endTime: 480, enemies: ['mud_hand', 'dracky', 'hammerhood'], spawnInterval: 0.35, maxActive: 160, special: 'metal_slime_chance' },
        // 08:00 - 10:00: 骷髏部隊與死靈騎士 + 迷路金屬史萊姆
        { startTime: 480, endTime: 600, enemies: ['skeleton', 'restless_armour', 'ghost'], spawnInterval: 0.3, maxActive: 200, special: 'liquid_metal_chance' },

        // 10:00 (600s): BOSS 2 寶箱怪王
        { startTime: 600, endTime: 605, boss: 'mimic_king', announce: '⚠️ 貪婪陷阱！【寶箱怪王】狂暴襲擊！' },
        // 10:00 - 13:00: 巨石魔像重裝推進
        { startTime: 605, endTime: 780, enemies: ['golem', 'restless_armour', 'skeleton', 'healslime'], spawnInterval: 0.28, maxActive: 230 },
        // 13:00 - 15:00: 奇美拉與地獄炎魔遠程空中壓制
        { startTime: 780, endTime: 900, enemies: ['chimera', 'hellion', 'mud_hand'], spawnInterval: 0.25, maxActive: 260 },

        // 15:00 (900s): BOSS 3 殺人機器 (中期高潮！)
        { startTime: 900, endTime: 905, boss: 'killer_machine', announce: '🚨 殺戮兵器【殺人機器】狂暴啟動！死鬥開始！' },
        // 15:00 - 18:00: 獨眼巨人與惡魔神官合圍
        { startTime: 905, endTime: 1080, enemies: ['cyclops', 'archdemon', 'hellion'], spawnInterval: 0.22, maxActive: 280 },
        // 18:00 - 20:00: 金屬史萊姆王現身！
        { startTime: 1080, endTime: 1200, enemies: ['archdemon', 'cyclops', 'golem'], spawnInterval: 0.2, maxActive: 300, special: 'king_metal_chance' },

        // 20:00 (1200s): BOSS 4 巨龍烈焰
        { startTime: 1200, endTime: 1205, boss: 'great_dragon', announce: '🔥 狂暴烈焰！【巨龍】滅世降臨！' },
        // 20:00 - 23:00: 狂龍與高階惡魔群
        { startTime: 1205, endTime: 1380, enemies: ['chimera', 'hellion', 'cyclops', 'archdemon'], spawnInterval: 0.18, maxActive: 330 },
        // 23:00 - 25:00: 重裝軍團總動員
        { startTime: 1380, endTime: 1500, enemies: ['golem', 'restless_armour', 'archdemon', 'hellion'], spawnInterval: 0.16, maxActive: 360 },

        // 25:00 (1500s): BOSS 5 魔王 巴拉莫斯
        { startTime: 1500, endTime: 1505, boss: 'baramos', announce: '💀 大魔王先鋒【巴拉莫斯】親臨戰場！迎擊深淵狂潮！' },
        // 25:00 - 28:00: 索瑪禁衛部隊
        { startTime: 1505, endTime: 1680, enemies: ['archdemon', 'cyclops', 'hellion', 'skeleton'], spawnInterval: 0.14, maxActive: 380 },
        // 28:00 - 30:00: 世界末日大狂潮 (Doomsday Wave)
        { startTime: 1680, endTime: 1800, enemies: ['golem', 'cyclops', 'archdemon', 'hellion', 'chimera'], spawnInterval: 0.11, maxActive: 420, swarm: true },

        // 30:00 (1800s): FINAL CLIMAX - 大魔王 索瑪
        { startTime: 1800, endTime: 99999, boss: 'zoma', announce: '👑 終極決戰！大魔王【索瑪】現身！拯救世界的最終一戰！' }
    ],

    // 經驗值升級公式 (支援 30 分鐘 100+ 級)
    getExpToNextLevel(level) {
        if (level === 1) return 5;
        if (level <= 20) return 5 + (level - 1) * 10;
        if (level <= 40) return 200 + (level - 20) * 18;
        if (level <= 70) return 560 + (level - 40) * 28;
        return 1400 + (level - 70) * 45;
    }
};

window.GAME_DATA = GAME_DATA;
