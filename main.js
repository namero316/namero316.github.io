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

const TOTAL_DRAWS = 1204;

// 누적 가중치 테이블 생성
const NUMBERS = Object.keys(FREQUENCY).map(Number);
const WEIGHTS = NUMBERS.map(n => FREQUENCY[n]);
const CUMULATIVE = [];
let sum = 0;
for (const w of WEIGHTS) {
  sum += w;
  CUMULATIVE.push(sum);
}
const TOTAL_WEIGHT = sum;

function weightedRandom() {
  const r = Math.random() * TOTAL_WEIGHT;
  for (let i = 0; i < CUMULATIVE.length; i++) {
    if (r < CUMULATIVE[i]) return NUMBERS[i];
  }
  return NUMBERS[NUMBERS.length - 1];
}

function generateWeightedLotto() {
  const picked = new Set();
  while (picked.size < 6) {
    picked.add(weightedRandom());
  }
  return Array.from(picked).sort((a, b) => a - b);
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
const statsEl = document.getElementById('stats');

generateBtn.addEventListener('click', () => {
  const numbers = generateWeightedLotto();

  numberElements.forEach((el, i) => {
    setTimeout(() => {
      el.textContent = numbers[i];
      el.style.background = getBallColor(numbers[i]);
      el.style.color = '#fff';
      el.style.transform = 'scale(1.15)';
      setTimeout(() => { el.style.transform = 'scale(1)'; }, 300);
    }, i * 180);
  });

  // 선택된 번호의 확률 표시
  setTimeout(() => {
    const probs = numbers.map(n => ((FREQUENCY[n] / (TOTAL_DRAWS * 6)) * 100).toFixed(2));
    statsEl.innerHTML = numbers.map((n, i) =>
      `<span><b>${n}번</b> ${probs[i]}%</span>`
    ).join(' · ');
  }, numbers.length * 180 + 100);
});

// 상위/하위 번호 초기 표시
const sorted = [...NUMBERS].sort((a, b) => FREQUENCY[b] - FREQUENCY[a]);
const topEl = document.getElementById('top-numbers');
const botEl = document.getElementById('bot-numbers');
if (topEl) topEl.textContent = sorted.slice(0, 5).join(', ');
if (botEl) botEl.textContent = sorted.slice(-5).reverse().join(', ');
