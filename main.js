const generateBtn = document.getElementById('generate-btn');
const numberElements = document.querySelectorAll('.number');

generateBtn.addEventListener('click', () => {
    const lottoNumbers = new Set();
    while (lottoNumbers.size < 6) {
        lottoNumbers.add(Math.floor(Math.random() * 45) + 1);
    }

    const sortedNumbers = Array.from(lottoNumbers).sort((a, b) => a - b);

    numberElements.forEach((element, index) => {
        setTimeout(() => {
            element.textContent = sortedNumbers[index];
            element.style.transform = 'scale(1.1)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 300);
        }, index * 200);
    });
});
