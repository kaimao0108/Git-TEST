// Game Data, Weapons, Evolutions, Passives, Characters, and Monsters
const GAME_DATA = {
    // 角色設定 (DQ 經典職業)
    characters: {
        hero: {
            id: 'hero',
            name: '勇者 (Hero)',
            title: '傳說的羅德血脈',
            desc: '全能力均衡，初始自帶【羅德之劍】，擁有較高生命值與防禦。',
            baseHp: 130,
            speed: 215,
            might: 1.15,
            armor: 2,
            cooldownMod: 1.0,
            areaMod: 1.1,
            pickupRange: 120,
            startingWeapon: 'sword_loto',
            spriteColor: '#2b78e4'
        },
        mage: {
            id: 'mage',
            name: '魔導師 (Mage)',
            title: '皇家大魔導士',
            desc: '精通毀滅法術，初始自帶【美拉法杖】，攻擊力超群且冷卻更短。',
            baseHp: 90,
            speed: 205,
            might: 1.30,
            armor: 0,
            cooldownMod: 0.85,
            areaMod: 1.2,
            pickupRange: 130,
            startingWeapon: 'wand_frizz',
            spriteColor: '#8a2be2'
        },
        martial: {
            id: 'martial',
            name: '武鬥家 (Martial Artist)',
            title: '拳聖與刺客大師',
            desc: '身手敏捷，初始自帶【流星迴旋鏢】，移動飛快且暴擊率高達 25%。',
            baseHp: 110,
            speed: 250,
            might: 1.1,
            armor: 1,
            critRate: 0.25,
            cooldownMod: 0.95,
            areaMod: 1.0,
            pickupRange: 130,
            startingWeapon: 'boomerang',
            spriteColor: '#ff7700'
        },
        priest: {
            id: 'priest',
            name: '僧侶 (Priest)',
            title: '神聖引導者',
            desc: '神聖守護，初始自帶【基拉咒文書】，具備生命再生能力與高生存力。',
            baseHp: 120,
            speed: 210,
            might: 1.0,
            armor: 3,
            hpRegen: 1.5,
            cooldownMod: 1.0,
            areaMod: 1.25,
            pickupRange: 140,
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
            desc: '向左右兩側揮出鋒利劍氣斬擊，可穿透多名敵人。',
            maxLevel: 8,
            type: 'slash',
            baseDamage: 25,
            cooldown: 1.3,
            area: 110,
            projectiles: 1,
            knockback: 6,
            levels: [
                { damage: 25, area: 110, cooldown: 1.3, projectiles: 1, desc: '對身前與身後斬擊。' },
                { damage: 32, area: 120, cooldown: 1.25, projectiles: 1, desc: '傷害 +7，範圍增加。' },
                { damage: 32, area: 130, cooldown: 1.2, projectiles: 2, desc: '發射次數 +1。' },
                { damage: 42, area: 140, cooldown: 1.1, projectiles: 2, desc: '傷害 +10，冷卻時間縮短。' },
                { damage: 42, area: 155, cooldown: 1.05, projectiles: 3, desc: '發射次數 +1，範圍提升。' },
                { damage: 55, area: 170, cooldown: 1.0, projectiles: 3, desc: '傷害 +13，斬擊更加寬廣。' },
                { damage: 65, area: 185, cooldown: 0.95, projectiles: 4, desc: '發射次數 +1，傷害 +10。' },
                { damage: 80, area: 210, cooldown: 0.85, projectiles: 4, desc: '滿級！傷害與範圍極致強化。' }
            ]
        },
        wand_frizz: {
            id: 'wand_frizz',
            name: '美拉法杖',
            icon: '🔥',
            desc: '朝最近的敵人發射高熱火球。',
            maxLevel: 8,
            type: 'projectile_homing',
            baseDamage: 22,
            cooldown: 1.1,
            speed: 400,
            projectiles: 1,
            levels: [
                { damage: 22, cooldown: 1.1, projectiles: 1, desc: '向最近敵人發射火球。' },
                { damage: 28, cooldown: 1.0, projectiles: 1, desc: '傷害 +6，冷卻減少。' },
                { damage: 28, cooldown: 1.0, projectiles: 2, desc: '火球數量 +1。' },
                { damage: 36, cooldown: 0.9, projectiles: 2, desc: '傷害 +8，飛行速度加快。' },
                { damage: 36, cooldown: 0.85, projectiles: 3, desc: '火球數量 +1。' },
                { damage: 46, cooldown: 0.8, projectiles: 3, desc: '傷害 +10，冷卻縮減。' },
                { damage: 46, cooldown: 0.75, projectiles: 4, desc: '火球數量 +1。' },
                { damage: 60, cooldown: 0.65, projectiles: 5, desc: '滿級！連發 5 顆狂暴火球。' }
            ]
        },
        dagger_poison: {
            id: 'dagger_poison',
            name: '毒蛾短劍',
            icon: '🗡️',
            desc: '朝移動方向快速射出穿透飛刀。',
            maxLevel: 8,
            type: 'projectile_straight',
            baseDamage: 16,
            cooldown: 0.9,
            speed: 550,
            projectiles: 2,
            pierce: 1,
            levels: [
                { damage: 16, projectiles: 2, cooldown: 0.9, desc: '朝面前發射 2 把飛刀。' },
                { damage: 20, projectiles: 3, cooldown: 0.85, desc: '飛刀數量 +1，傷害增加。' },
                { damage: 20, projectiles: 3, cooldown: 0.75, pierce: 2, desc: '穿透力 +1，冷卻縮減。' },
                { damage: 26, projectiles: 4, cooldown: 0.7, pierce: 2, desc: '飛刀數量 +1。' },
                { damage: 26, projectiles: 5, cooldown: 0.65, pierce: 2, desc: '飛刀數量 +1，速度提升。' },
                { damage: 34, projectiles: 5, cooldown: 0.6, pierce: 3, desc: '穿透力 +1，傷害 +8。' },
                { damage: 34, projectiles: 6, cooldown: 0.55, pierce: 3, desc: '飛刀數量 +1。' },
                { damage: 45, projectiles: 8, cooldown: 0.45, pierce: 4, desc: '滿級！高速噴射 8 把劇毒短刃。' }
            ]
        },
        axe_battle: {
            id: 'axe_battle',
            name: '巨力之斧',
            icon: '🪓',
            desc: '向上拋出巨斧並砸落，具有極高單體與穿透砸地傷害。',
            maxLevel: 8,
            type: 'arc_lob',
            baseDamage: 40,
            cooldown: 1.8,
            area: 120,
            projectiles: 1,
            levels: [
                { damage: 40, projectiles: 1, cooldown: 1.8, desc: '向上高拋 1 把沉重巨斧。' },
                { damage: 52, projectiles: 1, cooldown: 1.7, desc: '傷害 +12。' },
                { damage: 52, projectiles: 2, cooldown: 1.6, desc: '斧頭數量 +1。' },
                { damage: 68, projectiles: 2, cooldown: 1.5, desc: '傷害 +16，範圍增加。' },
                { damage: 68, projectiles: 3, cooldown: 1.45, desc: '斧頭數量 +1。' },
                { damage: 85, projectiles: 3, cooldown: 1.35, desc: '傷害 +17。' },
                { damage: 85, projectiles: 4, cooldown: 1.25, desc: '斧頭數量 +1。' },
                { damage: 110, projectiles: 5, cooldown: 1.1, desc: '滿級！拋出 5 把雷霆破空重斧。' }
            ]
        },
        boomerang: {
            id: 'boomerang',
            name: '流星迴旋鏢',
            icon: '🪃',
            desc: '向前擲出並在極限處原路折返，穿透路徑上所有敵人。',
            maxLevel: 8,
            type: 'boomerang',
            baseDamage: 24,
            cooldown: 1.6,
            speed: 360,
            projectiles: 1,
            levels: [
                { damage: 24, projectiles: 1, cooldown: 1.6, desc: '擲出 1 枚穿透迴旋鏢。' },
                { damage: 30, projectiles: 1, cooldown: 1.5, desc: '傷害 +6，旋轉半徑增加。' },
                { damage: 30, projectiles: 2, cooldown: 1.45, desc: '數量 +1。' },
                { damage: 38, projectiles: 2, cooldown: 1.35, desc: '傷害 +8，飛行速度更快。' },
                { damage: 38, projectiles: 3, cooldown: 1.3, desc: '數量 +1。' },
                { damage: 48, projectiles: 3, cooldown: 1.2, desc: '傷害 +10。' },
                { damage: 48, projectiles: 4, cooldown: 1.1, desc: '數量 +1。' },
                { damage: 62, projectiles: 5, cooldown: 0.95, desc: '滿級！連續散射 5 枚流星飛鏢。' }
            ]
        },
        tome_sizz: {
            id: 'tome_sizz',
            name: '基拉咒文書',
            icon: '📖',
            desc: '召喚神聖光刃咒文圍繞自身旋轉，擊退接近的所有魔物。',
            maxLevel: 8,
            type: 'orbit',
            baseDamage: 18,
            cooldown: 2.8,
            duration: 2.5,
            orbitSpeed: 3.2,
            projectiles: 1,
            levels: [
                { damage: 18, projectiles: 1, duration: 2.5, cooldown: 2.8, desc: '1 圈神聖光印圍繞旋轉。' },
                { damage: 22, projectiles: 2, duration: 2.7, cooldown: 2.7, desc: '光印數量 +1。' },
                { damage: 26, projectiles: 2, duration: 3.0, cooldown: 2.6, desc: '持續時間增加，轉速加快。' },
                { damage: 26, projectiles: 3, duration: 3.2, cooldown: 2.5, desc: '光印數量 +1。' },
                { damage: 32, projectiles: 3, duration: 3.5, cooldown: 2.4, desc: '傷害 +6，持續延長。' },
                { damage: 32, projectiles: 4, duration: 3.8, cooldown: 2.3, desc: '光印數量 +1。' },
                { damage: 40, projectiles: 4, duration: 4.2, cooldown: 2.2, desc: '傷害 +8。' },
                { damage: 50, projectiles: 5, duration: 4.8, cooldown: 2.0, desc: '滿級！5 道聖光印記高速守護。' }
            ]
        },
        wand_bang: {
            id: 'wand_bang',
            name: '伊歐法杖',
            icon: '💥',
            desc: '在隨機敵人頭頂引發劇烈魔力爆炸，造成範圍毀滅傷。',
            maxLevel: 8,
            type: 'strike_area',
            baseDamage: 45,
            cooldown: 2.2,
            radius: 80,
            projectiles: 1,
            levels: [
                { damage: 45, projectiles: 1, cooldown: 2.2, radius: 80, desc: '隨機引發 1 次爆破。' },
                { damage: 55, projectiles: 1, cooldown: 2.1, radius: 90, desc: '傷害 +10，爆炸半徑擴大。' },
                { damage: 55, projectiles: 2, cooldown: 2.0, radius: 95, desc: '引爆次數 +1。' },
                { damage: 70, projectiles: 2, cooldown: 1.9, radius: 105, desc: '傷害 +15。' },
                { damage: 70, projectiles: 3, cooldown: 1.8, radius: 115, desc: '引爆次數 +1。' },
                { damage: 90, projectiles: 3, cooldown: 1.7, radius: 125, desc: '傷害 +20。' },
                { damage: 90, projectiles: 4, cooldown: 1.6, radius: 135, desc: '引爆次數 +1。' },
                { damage: 120, projectiles: 5, cooldown: 1.4, radius: 155, desc: '滿級！連續引爆 5 處巨大核爆。' }
            ]
        },
        aura_herb: {
            id: 'aura_herb',
            name: '藥草光環',
            icon: '🌿',
            desc: '周身散發淨化藥草光環，對踏入範圍的所有魔物造成持續傷害與減速。',
            maxLevel: 8,
            type: 'aura',
            baseDamage: 10,
            tickRate: 0.45,
            radius: 90,
            levels: [
                { damage: 10, radius: 90, tickRate: 0.45, desc: '自身周圍持續性傷害圈。' },
                { damage: 14, radius: 105, tickRate: 0.45, desc: '傷害 +4，光環半徑擴大。' },
                { damage: 18, radius: 120, tickRate: 0.42, desc: '打擊頻率加快，傷害 +4。' },
                { damage: 24, radius: 135, tickRate: 0.40, desc: '半徑擴大，傷害 +6。' },
                { damage: 30, radius: 150, tickRate: 0.38, desc: '擊退力增強，傷害 +6。' },
                { damage: 38, radius: 165, tickRate: 0.35, desc: '頻率與傷害進一步提升。' },
                { damage: 46, radius: 180, tickRate: 0.32, desc: '傷害 +8。' },
                { damage: 60, radius: 210, tickRate: 0.28, desc: '滿級！超大範圍神聖結界高頻震盪。' }
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
            desc: '【羅德之劍】與【豪傑手環】融合超進化！釋放全屏神聖金色十字劍氣，暴擊吸血恢復生命值！',
            damage: 135,
            cooldown: 0.65,
            area: 280,
            projectiles: 4,
            lifeSteal: 2, // 每次暴擊吸 2 點生命
            critChance: 0.45,
            critMultiplier: 2.5
        },
        wand_kafrizz: {
            id: 'wand_kafrizz',
            name: '美拉柔瑪之杖',
            icon: '🌋🔥',
            baseWeapon: 'wand_frizz',
            requiredPassive: 'scroll_sage',
            desc: '【美拉法杖】與【賢者卷軸】融合超進化！無間斷機關槍式連續轟射巨大追蹤滅世火球！',
            damage: 85,
            cooldown: 0.18,
            speed: 520,
            projectiles: 1,
            pierce: 3
        },
        thousand_needles: {
            id: 'thousand_needles',
            name: '千本毒針',
            icon: '💫🗡️',
            baseWeapon: 'dagger_poison',
            requiredPassive: 'boots_wind',
            desc: '【毒蛾短劍】與【疾風之靴】融合超進化！如瀑布般向前方瘋狂傾瀉無盡飛刃，機率觸發即死刺殺！',
            damage: 55,
            cooldown: 0.12,
            speed: 680,
            projectiles: 3,
            pierce: 999,
            instantKillChance: 0.04
        },
        death_scythe: {
            id: 'death_scythe',
            name: '死神之鐮',
            icon: '💀🪓',
            baseWeapon: 'axe_battle',
            requiredPassive: 'belt_power',
            desc: '【巨力之斧】與【力量腰帶】融合超進化！以自身為中心向 360 度四方爆發旋轉飛行的巨型破滅鐮刀！',
            damage: 160,
            cooldown: 1.0,
            speed: 280,
            projectiles: 8,
            pierce: 999
        },
        sacred_boomerang: {
            id: 'sacred_boomerang',
            name: '破邪神鏢',
            icon: '⭐🪃',
            baseWeapon: 'boomerang',
            requiredPassive: 'coin_luck',
            desc: '【流星迴旋鏢】與【幸運銀幣】融合超進化！金黃雷光神聖輪刃縱橫全場，高達 3.8 倍極限暴擊！',
            damage: 95,
            cooldown: 0.75,
            speed: 480,
            projectiles: 6,
            critChance: 0.6,
            critMultiplier: 3.8
        },
        halo_kasizz: {
            id: 'halo_kasizz',
            name: '貝基拉剛咒環',
            icon: '🔥📖',
            baseWeapon: 'tome_sizz',
            requiredPassive: 'rosary_saint',
            desc: '【基拉咒文書】與【聖者念珠】融合超進化！永不消逝的烈焰光輪結界環繞周身，形成絕對禁區！',
            damage: 75,
            duration: 999999,
            cooldown: 0.1,
            orbitSpeed: 5.5,
            projectiles: 8
        },
        wrath_kaboom: {
            id: 'wrath_kaboom',
            name: '伊歐那珍天怒',
            icon: '💥⚡',
            baseWeapon: 'wand_bang',
            requiredPassive: 'pendant_magic',
            desc: '【伊歐法杖】與【魔法吊墜】融合超進化！在全螢幕怪物密集處降下毀天滅地的連環神聖光爆！',
            damage: 180,
            cooldown: 1.2,
            radius: 200,
            projectiles: 7
        },
        domain_yggdrasil: {
            id: 'domain_yggdrasil',
            name: '世界樹結界',
            icon: '🌳🛡️',
            baseWeapon: 'aura_herb',
            requiredPassive: 'lantern_traveler',
            desc: '【藥草光環】與【旅人提燈】融合超進化！覆蓋半個螢幕的世界樹聖域，粉碎靠近魔物並持續吸血治療！',
            damage: 80,
            radius: 260,
            tickRate: 0.22,
            lifeSteal: 1
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

    // 怪物設定 (DQ 經典怪獸)
    monsters: {
        slime: {
            id: 'slime',
            name: '史萊姆',
            hp: 20,
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
            hp: 35,
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
            hp: 30,
            speed: 135,
            damage: 12,
            exp: 2,
            color: '#8b008b',
            radius: 15,
            erratic: true,
            points: 25
        },
        hammerhood: {
            id: 'hammerhood',
            name: '大木槌',
            hp: 80,
            speed: 75,
            damage: 18,
            exp: 4,
            color: '#cd853f',
            radius: 18,
            points: 50
        },
        mud_hand: {
            id: 'mud_hand',
            name: '泥手',
            hp: 45,
            speed: 95,
            damage: 14,
            exp: 3,
            color: '#8b5a2b',
            radius: 14,
            points: 30
        },
        metal_slime: {
            id: 'metal_slime',
            name: '金屬史萊姆',
            hp: 12,
            speed: 210,
            damage: 5,
            exp: 150, // 巨額經驗！
            color: '#d3d3d3',
            silver: true,
            radius: 14,
            points: 500,
            armor: 5 // 高防禦
        },
        skeleton: {
            id: 'skeleton',
            name: '骷髏戰士',
            hp: 150,
            speed: 110,
            damage: 22,
            exp: 6,
            color: '#f5f5f5',
            radius: 18,
            points: 80
        },
        golem: {
            id: 'golem',
            name: '魔像',
            hp: 380,
            speed: 65,
            damage: 32,
            exp: 12,
            color: '#b8860b',
            radius: 24,
            points: 150
        },
        chimera: {
            id: 'chimera',
            name: '奇美拉',
            hp: 220,
            speed: 140,
            damage: 25,
            exp: 10,
            color: '#ff4500',
            radius: 20,
            points: 120
        },
        archdemon: {
            id: 'archdemon',
            name: '惡魔神官',
            hp: 320,
            speed: 115,
            damage: 30,
            exp: 15,
            color: '#4b0082',
            radius: 22,
            points: 200
        },

        // 菁英與 BOSS
        slime_knight: {
            id: 'slime_knight',
            name: '史萊姆騎士 (MINI-BOSS)',
            hp: 1800,
            speed: 120,
            damage: 35,
            exp: 50,
            color: '#00fa9a',
            radius: 28,
            isBoss: true,
            chestDrop: true,
            points: 1000
        },
        killer_machine: {
            id: 'killer_machine',
            name: '殺人機器 (BOSS)',
            hp: 4500,
            speed: 145,
            damage: 45,
            exp: 100,
            color: '#4169e1',
            radius: 32,
            isBoss: true,
            chestDrop: true,
            points: 2500
        },
        great_dragon: {
            id: 'great_dragon',
            name: '巨龍 (BOSS)',
            hp: 9000,
            speed: 110,
            damage: 55,
            exp: 200,
            color: '#dc143c',
            radius: 40,
            isBoss: true,
            chestDrop: true,
            points: 5000
        },
        dragonlord: {
            id: 'dragonlord',
            name: '魔王 龍王 (FINAL BOSS)',
            hp: 24000,
            speed: 125,
            damage: 70,
            exp: 500,
            color: '#2e0854',
            radius: 46,
            isBoss: true,
            isFinalBoss: true,
            chestDrop: true,
            points: 10000
        }
    },

    // 15 分鐘波次進程表
    waves: [
        { startTime: 0, endTime: 90, enemies: ['slime'], spawnInterval: 0.8, maxActive: 60 },
        { startTime: 90, endTime: 180, enemies: ['slime', 'bubble_slime', 'dracky'], spawnInterval: 0.6, maxActive: 90 },
        { startTime: 180, endTime: 300, enemies: ['bubble_slime', 'dracky', 'hammerhood'], spawnInterval: 0.5, maxActive: 120 },
        // 5分鐘整點 Mini-boss
        { startTime: 300, endTime: 305, boss: 'slime_knight', announce: '⚔️ 警告！史萊姆騎士 率隊降臨！' },
        { startTime: 305, endTime: 480, enemies: ['mud_hand', 'hammerhood', 'dracky'], spawnInterval: 0.35, maxActive: 160, special: 'metal_slime_chance' },
        { startTime: 480, endTime: 600, enemies: ['skeleton', 'golem', 'mud_hand'], spawnInterval: 0.3, maxActive: 200 },
        // 10分鐘整點 Boss
        { startTime: 600, endTime: 605, boss: 'killer_machine', announce: '⚠️ 警報！殺戮兵器【殺人機器】出動！' },
        { startTime: 605, endTime: 780, enemies: ['chimera', 'skeleton', 'archdemon'], spawnInterval: 0.25, maxActive: 240 },
        { startTime: 780, endTime: 870, enemies: ['archdemon', 'golem', 'chimera', 'mud_hand'], spawnInterval: 0.2, maxActive: 280, swarm: true },
        // 14:30 巨龍降臨
        { startTime: 870, endTime: 900, boss: 'great_dragon', announce: '🔥 狂暴之火！巨龍 破空來襲！' },
        // 15:00 最終決戰
        { startTime: 900, endTime: 9999, boss: 'dragonlord', announce: '👑 決戰降臨！魔王【龍王】親自降臨！消滅它迎接世界和平！' }
    ],

    // 經驗值升級公式 (類似吸血鬼倖存者)
    getExpToNextLevel(level) {
        if (level === 1) return 5;
        if (level <= 20) return 5 + (level - 1) * 10;
        if (level <= 40) return 200 + (level - 20) * 16;
        return 520 + (level - 40) * 25;
    }
};

window.GAME_DATA = GAME_DATA;
