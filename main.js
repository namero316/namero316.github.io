// ============================================================
// Background Canvas — Floating Lottery Balls + Spotlights
// ============================================================

const bgCanvas = document.getElementById('bg-canvas');
const bgCtx = bgCanvas.getContext('2d');
const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx = confettiCanvas.getContext('2d');

function resizeCanvases() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}
resizeCanvases();
window.addEventListener('resize', resizeCanvases);

function bgBallColor(n) {
    if (n <= 10) return '#fbc400';
    if (n <= 20) return '#69c8f2';
    if (n <= 30) return '#ff7272';
    if (n <= 40) return '#aaaaaa';
    return '#b0d840';
}

const bgBalls = Array.from({ length: 20 }, () => {
    const n = Math.floor(Math.random() * 45) + 1;
    const r = 20 + Math.random() * 22;
    return {
        n, r,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.75,
        vy: (Math.random() - 0.5) * 0.75,
        color: bgBallColor(n),
        alpha: 0.07 + Math.random() * 0.12,
    };
});

function drawBgBall(b) {
    const { x, y, r, color, alpha, n } = b;
    bgCtx.save();
    bgCtx.globalAlpha = alpha;

    // Ball body — radial gradient for 3-D look
    const grad = bgCtx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.04, x, y, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, color);
    grad.addColorStop(1, color);
    bgCtx.beginPath();
    bgCtx.arc(x, y, r, 0, Math.PI * 2);
    bgCtx.fillStyle = grad;
    bgCtx.fill();

    // Specular highlight
    const hl = bgCtx.createRadialGradient(x - r * 0.27, y - r * 0.27, 0, x - r * 0.27, y - r * 0.27, r * 0.3);
    hl.addColorStop(0, 'rgba(255,255,255,0.52)');
    hl.addColorStop(1, 'rgba(255,255,255,0)');
    bgCtx.beginPath();
    bgCtx.arc(x - r * 0.27, y - r * 0.27, r * 0.3, 0, Math.PI * 2);
    bgCtx.fillStyle = hl;
    bgCtx.fill();

    // Number text
    bgCtx.globalAlpha = Math.min(alpha * 2.8, 0.48);
    bgCtx.fillStyle = '#fff';
    bgCtx.font = `bold ${Math.round(r * 0.88)}px Arial`;
    bgCtx.textAlign = 'center';
    bgCtx.textBaseline = 'middle';
    bgCtx.fillText(n, x, y + 1);

    bgCtx.restore();
}

let spotT = 0;
function drawSpotlights() {
    spotT += 0.007;
    const w = bgCanvas.width;
    const h = bgCanvas.height;
    const spots = [
        { base: w * 0.22, swing: w * 0.10, speed: 1.00, phase: 0.0 },
        { base: w * 0.50, swing: w * 0.09, speed: 0.65, phase: 1.8 },
        { base: w * 0.78, swing: w * 0.10, speed: 1.15, phase: 3.2 },
    ];
    for (const s of spots) {
        const x = s.base + Math.sin(spotT * s.speed + s.phase) * s.swing;
        const coneH = h * 0.75;
        const halfW = 85 + Math.sin(spotT * 0.38 + s.phase) * 18;
        const grad = bgCtx.createLinearGradient(x, 0, x, coneH);
        grad.addColorStop(0, 'rgba(255,240,175,0.13)');
        grad.addColorStop(0.45, 'rgba(255,240,175,0.04)');
        grad.addColorStop(1, 'rgba(255,240,175,0)');
        bgCtx.save();
        bgCtx.beginPath();
        bgCtx.moveTo(x, 0);
        bgCtx.lineTo(x - halfW, coneH);
        bgCtx.lineTo(x + halfW, coneH);
        bgCtx.closePath();
        bgCtx.fillStyle = grad;
        bgCtx.fill();
        bgCtx.restore();
    }
}

function animateBg() {
    const w = bgCanvas.width;
    const h = bgCanvas.height;

    const bg = bgCtx.createLinearGradient(0, 0, w * 0.5, h);
    bg.addColorStop(0, '#07071f');
    bg.addColorStop(0.5, '#11072a');
    bg.addColorStop(1, '#09190a');
    bgCtx.fillStyle = bg;
    bgCtx.fillRect(0, 0, w, h);

    drawSpotlights();

    for (const b of bgBalls) {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x - b.r < 0) { b.vx = Math.abs(b.vx); b.x = b.r; }
        else if (b.x + b.r > w) { b.vx = -Math.abs(b.vx); b.x = w - b.r; }
        if (b.y - b.r < 0) { b.vy = Math.abs(b.vy); b.y = b.r; }
        else if (b.y + b.r > h) { b.vy = -Math.abs(b.vy); b.y = h - b.r; }
        drawBgBall(b);
    }

    requestAnimationFrame(animateBg);
}
animateBg();

// ============================================================
// Confetti + Celebration
// ============================================================

const FESTIVE_COLORS = ['#fbc400', '#69c8f2', '#ff7272', '#b0b0b0', '#b0d840', '#ff69b4', '#ffffff', '#ffaa00'];

let particles = [];
let confettiRaf = null;

function launchCelebration() {
    particles = [];
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.42;

    // Burst from number area
    for (let i = 0; i < 140; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 15;
        const color = FESTIVE_COLORS[Math.floor(Math.random() * FESTIVE_COLORS.length)];
        const isCircle = Math.random() > 0.55;
        particles.push({
            x: cx + (Math.random() - 0.5) * 60,
            y: cy + (Math.random() - 0.5) * 20,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 5,
            color,
            w: isCircle ? 7 + Math.random() * 9 : 10 + Math.random() * 14,
            h: isCircle ? null : 4 + Math.random() * 5,
            rot: Math.random() * Math.PI * 2,
            rotV: (Math.random() - 0.5) * 0.24,
            alpha: 1,
            isCircle,
            grav: 0.19 + Math.random() * 0.13,
            drag: 0.982,
        });
    }

    // Rain from top
    for (let i = 0; i < 90; i++) {
        const color = FESTIVE_COLORS[Math.floor(Math.random() * FESTIVE_COLORS.length)];
        const isCircle = Math.random() > 0.65;
        particles.push({
            x: Math.random() * window.innerWidth,
            y: -30 - Math.random() * 160,
            vx: (Math.random() - 0.5) * 2.5,
            vy: 1.5 + Math.random() * 3.5,
            color,
            w: isCircle ? 5 + Math.random() * 8 : 6 + Math.random() * 11,
            h: isCircle ? null : 3 + Math.random() * 5,
            rot: Math.random() * Math.PI * 2,
            rotV: (Math.random() - 0.5) * 0.18,
            alpha: 1,
            isCircle,
            grav: 0.06 + Math.random() * 0.07,
            drag: 0.993,
        });
    }

    if (confettiRaf) cancelAnimationFrame(confettiRaf);
    drawConfetti();

    // Screen flash
    const flash = document.getElementById('screen-flash');
    flash.classList.remove('flash');
    void flash.offsetWidth;
    flash.classList.add('flash');

}

function drawConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = 0;
    for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.grav;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.rot += p.rotV;
        if (p.y > confettiCanvas.height * 0.88) p.alpha -= 0.025;
        if (p.alpha <= 0) continue;
        alive++;
        confettiCtx.save();
        confettiCtx.globalAlpha = Math.max(0, p.alpha);
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate(p.rot);
        confettiCtx.fillStyle = p.color;
        if (p.isCircle) {
            confettiCtx.beginPath();
            confettiCtx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
            confettiCtx.fill();
        } else {
            confettiCtx.fillRect(-p.w / 2, -(p.h || p.w / 4), p.w, p.h || p.w / 4);
        }
        confettiCtx.restore();
    }
    if (alive > 0) {
        confettiRaf = requestAnimationFrame(drawConfetti);
    } else {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
}

// ============================================================
// 1~1204회차(2002-12-07 ~ 2025-12-27) 실제 당첨 번호 기반 출현 빈도
// ============================================================

const FREQUENCY = {
  1:164, 2:151, 3:168, 4:158, 5:151, 6:162, 7:167, 8:154,
  9:132, 10:157, 11:163, 12:177, 13:174, 14:169, 15:162,
  16:165, 17:166, 18:172, 19:165, 20:166, 21:164, 22:140,
  23:144, 24:162, 25:148, 26:162, 27:173, 28:151, 29:152,
  30:154, 31:162, 32:141, 33:172, 34:181, 35:159, 36:160,
  37:170, 38:164, 39:164, 40:171, 41:145, 42:151, 43:162,
  44:159, 45:170
};

const BONUS_FREQUENCY = {
  1:32,  2:34,  3:31,  4:35,  5:25,  6:34,  7:32,  8:24,
  9:25,  10:27, 11:25, 12:27, 13:27, 14:22, 15:25,
  16:28, 17:33, 18:19, 19:22, 20:29, 21:25, 22:20,
  23:20, 24:32, 25:20, 26:31, 27:31, 28:25, 29:17,
  30:32, 31:30, 32:34, 33:31, 34:23, 35:30, 36:24,
  37:26, 38:30, 39:24, 40:22, 41:17, 42:25, 43:35,
  44:24, 45:20
};

const TOTAL_DRAWS = 1204;
const NUMBERS = Object.keys(FREQUENCY).map(Number);

function buildCumulative(freq) {
    const nums = Object.keys(freq).map(Number);
    const cumul = [];
    let total = 0;
    for (const n of nums) {
        total += freq[n];
        cumul.push({ n, c: total });
    }
    return { cumul, total };
}

const main = buildCumulative(FREQUENCY);
const bonus = buildCumulative(BONUS_FREQUENCY);

function weightedPick(table, exclude = new Set()) {
    const eligible = table.cumul.filter(({ n }) => !exclude.has(n));
    let sum = 0;
    const weights = eligible.map(({ n }) => {
        const w = table === main ? FREQUENCY[n] : BONUS_FREQUENCY[n];
        sum += w;
        return { n, w };
    });
    const r = Math.random() * sum;
    let acc = 0;
    for (const { n, w } of weights) {
        acc += w;
        if (r < acc) return n;
    }
    return weights[weights.length - 1].n;
}

function generateLotto() {
    const picked = new Set();
    while (picked.size < 6) picked.add(weightedPick(main, new Set()));
    const numbers = Array.from(picked).sort((a, b) => a - b);
    const bonusNum = weightedPick(bonus, picked);
    return { numbers, bonusNum };
}

function getBallColor(n) {
    if (n <= 10) return '#fbc400';
    if (n <= 20) return '#69c8f2';
    if (n <= 30) return '#ff7272';
    if (n <= 40) return '#aaa';
    return '#b0d840';
}

const generateBtn = document.getElementById('generate-btn');
const mainNumberEls = document.querySelectorAll('.number:not(.bonus-ball)');
const bonusEl = document.getElementById('bonus-number');
const statsEl = document.getElementById('stats');

generateBtn.addEventListener('click', () => {
    generateBtn.disabled = true;

    const { numbers, bonusNum } = generateLotto();

    // Reveal main numbers one by one
    mainNumberEls.forEach((el, i) => {
        setTimeout(() => {
            el.textContent = numbers[i];
            el.style.background = getBallColor(numbers[i]);
            el.style.color = '#fff';
            el.style.transform = 'scale(1.15)';
            setTimeout(() => { el.style.transform = 'scale(1)'; }, 300);
        }, i * 180);
    });

    // Bonus number — appears after all 6 main numbers
    const bonusDelay = 6 * 180 + 300;
    setTimeout(() => {
        bonusEl.textContent = bonusNum;
        bonusEl.style.background = getBallColor(bonusNum);
        bonusEl.style.transform = 'scale(1.15)';
        setTimeout(() => { bonusEl.style.transform = 'scale(1)'; }, 300);
    }, bonusDelay);

    // Stats text
    const statsDelay = bonusDelay + 500;
    setTimeout(() => {
        const mainProbs = numbers.map(n => ((FREQUENCY[n] / (TOTAL_DRAWS * 6)) * 100).toFixed(2));
        const bonusProb = ((BONUS_FREQUENCY[bonusNum] / TOTAL_DRAWS) * 100).toFixed(2);
        statsEl.innerHTML =
            mainProbs.map((p, i) => `<span><b>${numbers[i]}번</b> ${p}%</span>`).join(' · ') +
            `<span class="bonus-stat"> · <b>보너스 ${bonusNum}번</b> ${bonusProb}%</span>`;
    }, statsDelay);

    // Win glow on all balls
    const glowDelay = bonusDelay + 550;
    setTimeout(() => {
        [...mainNumberEls, bonusEl].forEach(el => {
            el.classList.remove('win-glow');
            void el.offsetWidth;
            el.classList.add('win-glow');
            el.addEventListener('animationend', () => el.classList.remove('win-glow'), { once: true });
        });
    }, glowDelay);

    // Confetti + flash + banner
    const celebrationDelay = bonusDelay + 700;
    setTimeout(launchCelebration, celebrationDelay);

    // Re-enable button after celebration
    setTimeout(() => { generateBtn.disabled = false; }, celebrationDelay + 3200);
});

// 상위/하위 번호 초기 표시
const sorted = [...NUMBERS].sort((a, b) => FREQUENCY[b] - FREQUENCY[a]);
const topEl = document.getElementById('top-numbers');
const botEl = document.getElementById('bot-numbers');
if (topEl) topEl.textContent = sorted.slice(0, 5).join(', ');
if (botEl) botEl.textContent = sorted.slice(-5).reverse().join(', ');

// 번호별 출현 통계 테이블
const statsBtn = document.getElementById('stats-btn');
const statsTable = document.getElementById('stats-table');
let tableVisible = false;
let currentTab = 'main';

function renderTable(tab) {
    const freq = tab === 'main' ? FREQUENCY : BONUS_FREQUENCY;
    const denom = tab === 'main' ? TOTAL_DRAWS * 6 : TOTAL_DRAWS;
    const sortedNums = [...NUMBERS].sort((a, b) => freq[b] - freq[a]);
    const maxFreq = freq[sortedNums[0]];

    const tabHtml = `
        <div class="tab-row">
          <button class="tab-btn ${tab === 'main' ? 'active' : ''}" data-tab="main">당첨 번호</button>
          <button class="tab-btn ${tab === 'bonus' ? 'active' : ''}" data-tab="bonus">보너스 번호</button>
        </div>`;

    const rows = sortedNums.map((n, rank) => {
        const f = freq[n];
        const prob = ((f / denom) * 100).toFixed(2);
        const barWidth = Math.round((f / maxFreq) * 100);
        const color = getBallColor(n);
        return `
          <div class="stat-row">
            <span class="stat-rank">${rank + 1}</span>
            <span class="stat-ball" style="background:${color}">${n}</span>
            <div class="stat-bar-wrap">
              <div class="stat-bar" style="width:${barWidth}%;background:${color}"></div>
            </div>
            <span class="stat-count">${f}회</span>
            <span class="stat-prob">${prob}%</span>
          </div>`;
    }).join('');

    statsTable.innerHTML = tabHtml + rows;

    statsTable.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentTab = btn.dataset.tab;
            renderTable(currentTab);
        });
    });
}

statsBtn.addEventListener('click', () => {
    tableVisible = !tableVisible;
    statsBtn.textContent = tableVisible ? '통계 닫기' : '번호별 출현 통계 보기';
    if (!tableVisible) {
        statsTable.classList.add('hidden');
    } else {
        renderTable(currentTab);
        statsTable.classList.remove('hidden');
    }
});
