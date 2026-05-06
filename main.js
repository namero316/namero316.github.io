// 1~1204회차(2002-12-07 ~ 2025-12-27) 실제 당첨 번호 기반 출현 빈도
const FREQUENCY = {
  1:164, 2:151, 3:168, 4:158, 5:151, 6:162, 7:167, 8:154,
  9:132, 10:157, 11:163, 12:177, 13:174, 14:169, 15:162,
  16:165, 17:166, 18:172, 19:165, 20:166, 21:164, 22:140,
  23:144, 24:162, 25:148, 26:162, 27:173, 28:151, 29:152,
  30:154, 31:162, 32:141, 33:172, 34:181, 35:159, 36:160,
  37:170, 38:164, 39:164, 40:171, 41:145, 42:151, 43:162,
  44:159, 45:170
};

// 1~1204회차 보너스 번호 출현 빈도
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
  // exclude된 번호를 제외한 부분 가중치로 다시 뽑기
  const eligible = table.cumul.filter(({ n }) => !exclude.has(n));
  const total = eligible.reduce((s, { n }) => s + FREQUENCY[n] || BONUS_FREQUENCY[n], 0);
  // 단순히 eligible 목록에서 각자 빈도 비중으로 뽑기
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
const numberElements = document.querySelectorAll('.number');
const bonusEl = document.getElementById('bonus-number');
const statsEl = document.getElementById('stats');

generateBtn.addEventListener('click', () => {
  const { numbers, bonusNum } = generateLotto();
  const all = numbers.length + 2; // 6 main + separator delay + bonus

  numberElements.forEach((el, i) => {
    setTimeout(() => {
      el.textContent = numbers[i];
      el.style.background = getBallColor(numbers[i]);
      el.style.color = '#fff';
      el.style.transform = 'scale(1.15)';
      setTimeout(() => { el.style.transform = 'scale(1)'; }, 300);
    }, i * 180);
  });

  // 보너스 번호 — 메인 6개 다 나온 뒤에 등장
  setTimeout(() => {
    bonusEl.textContent = bonusNum;
    bonusEl.style.background = getBallColor(bonusNum);
    bonusEl.style.transform = 'scale(1.15)';
    setTimeout(() => { bonusEl.style.transform = 'scale(1)'; }, 300);
  }, 6 * 180 + 300);

  // 확률 표시
  setTimeout(() => {
    const mainProbs = numbers.map(n => ((FREQUENCY[n] / (TOTAL_DRAWS * 6)) * 100).toFixed(2));
    const bonusProb = ((BONUS_FREQUENCY[bonusNum] / TOTAL_DRAWS) * 100).toFixed(2);
    statsEl.innerHTML =
      mainProbs.map((p, i) => `<span><b>${numbers[i]}번</b> ${p}%</span>`).join(' · ') +
      `<span class="bonus-stat"> · <b>보너스 ${bonusNum}번</b> ${bonusProb}%</span>`;
  }, all * 180 + 400);
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
let currentTab = 'main'; // 'main' | 'bonus'

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
