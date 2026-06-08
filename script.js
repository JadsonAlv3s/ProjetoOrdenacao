// ===== SCROLL PROGRESS BAR =====
const progressFill = document.getElementById('progressFill');

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    progressFill.style.width = `${progress}%`;
});

// ===== FADE-IN ON SCROLL =====
const fadeElements = document.querySelectorAll('.fade-in');
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
fadeElements.forEach(el => fadeObserver.observe(el));

// ===== ACTIVE NAV LINK =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 100) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
    });
});

// ===== BENCHMARK BAR ANIMATION =====
const barFills = document.querySelectorAll('.bar-fill[data-width]');
const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.width = `${entry.target.getAttribute('data-width')}%`;
        }
    });
}, { threshold: 0.3 });
barFills.forEach(bar => barObserver.observe(bar));

// ===== SPEED LABELS =====
const speedLabels = ['Muito lento', 'Lento', 'Normal', 'Rápido', 'Muito rápido'];

document.getElementById('bitonicSpeed').addEventListener('input', (e) => {
    document.getElementById('bitonicSpeedLabel').textContent = speedLabels[e.target.value - 1];
});
document.getElementById('smoothSpeed').addEventListener('input', (e) => {
    document.getElementById('smoothSpeedLabel').textContent = speedLabels[e.target.value - 1];
});

// ===== UTILITY FUNCTIONS =====
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getSpeed(sliderId) {
    const slider = document.getElementById(sliderId);
    const speeds = [1200, 700, 400, 200, 100];
    return speeds[slider.value - 1];
}

function generateArrayPow2(size, max) {
    const arr = [];
    for (let i = 0; i < size; i++) {
        arr.push(Math.floor(Math.random() * max) + 5);
    }
    return arr;
}

function generateArray(size, max) {
    const arr = [];
    for (let i = 0; i < size; i++) {
        arr.push(Math.floor(Math.random() * max) + 5);
    }
    return arr;
}

function renderArray(containerId, arr, maxVal) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    const maxHeight = 180;
    arr.forEach((val, idx) => {
        const bar = document.createElement('div');
        bar.className = 'array-bar default';
        bar.style.height = `${(val / maxVal) * maxHeight}px`;
        bar.id = `${containerId}-bar-${idx}`;
        const label = document.createElement('span');
        label.className = 'bar-value';
        label.textContent = val;
        bar.appendChild(label);
        container.appendChild(bar);
    });
}

function setBarClass(containerId, idx, className) {
    const bar = document.getElementById(`${containerId}-bar-${idx}`);
    if (bar) bar.className = `array-bar ${className}`;
}

function explain(panelId, text) {
    document.getElementById(panelId).textContent = text;
}

function updateCounter(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

// ===== BITONIC SORT ANIMATION (DIDACTIC) =====
let bitonicArr = [];
let bitonicRunning = false;
let bitonicStepMode = false;
let bitonicStepResolve = null;
let bitonicComparisons = 0;
let bitonicSwaps = 0;
const BITONIC_SIZE = 8; // Must be power of 2
const BITONIC_MAX = 70;

function initBitonicSort() {
    bitonicArr = generateArrayPow2(BITONIC_SIZE, BITONIC_MAX);
    renderArray('bitonicArray', bitonicArr, BITONIC_MAX);
    bitonicRunning = false;
    bitonicStepMode = false;
    bitonicComparisons = 0;
    bitonicSwaps = 0;
    updateCounter('bitonicComparisons', 'Comparações: 0');
    updateCounter('bitonicSwaps', 'Trocas: 0');
    updateCounter('bitonicPhase', 'Fase: Aguardando');
    explain('bitonicExplainText', 'Clique em "Iniciar" para ver o algoritmo funcionando, ou use "Passo a Passo" para controlar manualmente.');
}

function bitonicWait() {
    if (bitonicStepMode) {
        return new Promise(resolve => { bitonicStepResolve = resolve; });
    }
    return sleep(getSpeed('bitonicSpeed'));
}

async function animateBitonicSort(arr, containerId) {
    const n = arr.length;

    explain('bitonicExplainText',
        `O array tem ${n} elementos (potência de 2). Vamos criar sequências bitônicas cada vez maiores e mesclá-las até ordenar tudo.`);
    updateCounter('bitonicPhase', 'Fase: Construindo sequências bitônicas');
    await bitonicWait();

    // Bitonic Sort: build progressively larger bitonic sequences
    for (let size = 2; size <= n; size *= 2) {
        if (!bitonicRunning) return;

        for (let startIdx = 0; startIdx < n; startIdx += size) {
            if (!bitonicRunning) return;
            // Determine direction: alternating asc/desc to form bitonic sequence
            // In the final pass (size == n), everything is ascending
            const ascending = ((startIdx / size) % 2 === 0);
            const dirText = ascending ? 'crescente ↑' : 'decrescente ↓';

            if (size < n) {
                explain('bitonicExplainText',
                    `Ordenando bloco [${startIdx}..${startIdx + size - 1}] em ordem ${dirText}. Blocos adjacentes com direções opostas formam sequência bitônica.`);
            } else {
                explain('bitonicExplainText',
                    `Mesclagem final: ordenando todo o array [0..${n - 1}] em ordem crescente. A sequência bitônica se transforma em ordenada!`);
                updateCounter('bitonicPhase', 'Fase: Mesclagem final');
            }
            await bitonicWait();

            await bitonicMerge(arr, startIdx, size, ascending, containerId);
        }

        if (size < n) {
            updateCounter('bitonicPhase', `Fase: Blocos de tamanho ${size} prontos`);
        }
    }
}

async function bitonicMerge(arr, low, cnt, ascending, containerId) {
    if (cnt <= 1 || !bitonicRunning) return;

    const mid = cnt / 2;

    for (let i = low; i < low + mid; i++) {
        if (!bitonicRunning) return;
        const j = i + mid;

        // Highlight the pair being compared
        setBarClass(containerId, i, 'pivot');
        setBarClass(containerId, j, 'pivot');
        bitonicComparisons++;
        updateCounter('bitonicComparisons', `Comparações: ${bitonicComparisons}`);

        const shouldSwap = ascending ? (arr[i] > arr[j]) : (arr[i] < arr[j]);
        const dirSymbol = ascending ? '>' : '<';

        if (shouldSwap) {
            explain('bitonicExplainText',
                `Comparando posição ${i} (${arr[i]}) com posição ${j} (${arr[j]}): ${arr[i]} ${dirSymbol} ${arr[j]}? SIM → trocamos!`);
            await bitonicWait();

            setBarClass(containerId, i, 'comparing');
            setBarClass(containerId, j, 'comparing');

            bitonicSwaps++;
            updateCounter('bitonicSwaps', `Trocas: ${bitonicSwaps}`);
            [arr[i], arr[j]] = [arr[j], arr[i]];
            renderArray(containerId, arr, BITONIC_MAX);
            setBarClass(containerId, i, 'comparing');
            setBarClass(containerId, j, 'comparing');
            await bitonicWait();
        } else {
            explain('bitonicExplainText',
                `Comparando posição ${i} (${arr[i]}) com posição ${j} (${arr[j]}): ${arr[i]} ${dirSymbol} ${arr[j]}? NÃO → já estão na ordem certa.`);
            await bitonicWait();
        }

        setBarClass(containerId, i, 'default');
        setBarClass(containerId, j, 'default');
    }

    // Recursively merge halves
    await bitonicMerge(arr, low, mid, ascending, containerId);
    await bitonicMerge(arr, low + mid, mid, ascending, containerId);
}

// Auto mode
document.getElementById('bitonicStart').addEventListener('click', async () => {
    if (bitonicRunning) return;
    bitonicRunning = true;
    bitonicStepMode = false;
    document.getElementById('bitonicStart').textContent = '⏸ Executando...';
    document.getElementById('bitonicStart').disabled = true;
    document.getElementById('bitonicStep').disabled = true;

    await animateBitonicSort(bitonicArr, 'bitonicArray');

    if (bitonicRunning) {
        for (let i = 0; i < bitonicArr.length; i++) setBarClass('bitonicArray', i, 'sorted');
        updateCounter('bitonicPhase', 'Fase: Concluído ✓');
        explain('bitonicExplainText',
            `Pronto! O array está ordenado. Foram ${bitonicComparisons} comparações e ${bitonicSwaps} trocas. Note como todas as comparações usam distância fixa — isso permite paralelismo total!`);
    }
    document.getElementById('bitonicStart').textContent = '▶ Iniciar Automático';
    document.getElementById('bitonicStart').disabled = false;
    document.getElementById('bitonicStep').disabled = false;
    bitonicRunning = false;
});

// Step mode
document.getElementById('bitonicStep').addEventListener('click', async () => {
    if (!bitonicRunning) {
        bitonicRunning = true;
        bitonicStepMode = true;
        document.getElementById('bitonicStart').disabled = true;
        document.getElementById('bitonicStep').textContent = '⏭ Próximo Passo';
        explain('bitonicExplainText', 'Modo passo a passo ativado. Clique "Próximo Passo" para avançar.');

        await animateBitonicSort(bitonicArr, 'bitonicArray');

        if (bitonicRunning) {
            for (let i = 0; i < bitonicArr.length; i++) setBarClass('bitonicArray', i, 'sorted');
            updateCounter('bitonicPhase', 'Fase: Concluído ✓');
            explain('bitonicExplainText',
                `Pronto! Array ordenado. Total: ${bitonicComparisons} comparações e ${bitonicSwaps} trocas.`);
        }
        document.getElementById('bitonicStart').disabled = false;
        document.getElementById('bitonicStep').textContent = '⏭ Passo a Passo';
        bitonicRunning = false;
    } else if (bitonicStepResolve) {
        const resolve = bitonicStepResolve;
        bitonicStepResolve = null;
        resolve();
    }
});

document.getElementById('bitonicReset').addEventListener('click', () => {
    bitonicRunning = false;
    if (bitonicStepResolve) { bitonicStepResolve(); bitonicStepResolve = null; }
    document.getElementById('bitonicStart').textContent = '▶ Iniciar Automático';
    document.getElementById('bitonicStart').disabled = false;
    document.getElementById('bitonicStep').textContent = '⏭ Passo a Passo';
    document.getElementById('bitonicStep').disabled = false;
    initBitonicSort();
});

initBitonicSort();

// ===== SMOOTHSORT ANIMATION (DIDACTIC) =====
let smoothArr = [];
let smoothRunning = false;
let smoothStepMode = false;
let smoothStepResolve = null;
let smoothComparisons = 0;
let smoothSwaps = 0;
const SMOOTH_SIZE = 10;
const SMOOTH_MAX = 70;

function initSmoothSort() {
    smoothArr = generateArray(SMOOTH_SIZE, SMOOTH_MAX);
    renderArray('smoothArray', smoothArr, SMOOTH_MAX);
    smoothRunning = false;
    smoothStepMode = false;
    smoothComparisons = 0;
    smoothSwaps = 0;
    updateCounter('smoothComparisons', 'Comparações: 0');
    updateCounter('smoothSwaps', 'Trocas: 0');
    updateCounter('smoothPhase', 'Fase: Aguardando');
    explain('smoothExplainText', 'Clique em "Iniciar" para ver o algoritmo funcionando, ou use "Passo a Passo" para controlar manualmente.');
}

function smoothWait() {
    if (smoothStepMode) {
        return new Promise(resolve => { smoothStepResolve = resolve; });
    }
    return sleep(getSpeed('smoothSpeed'));
}

async function animateSmoothSort(arr, containerId) {
    const n = arr.length;

    updateCounter('smoothPhase', 'Fase 1: Construindo Heap');
    explain('smoothExplainText',
        'Fase 1: Vamos organizar o array como um "heap" (árvore onde o pai é sempre maior que os filhos). Isso nos ajuda a encontrar o maior elemento rapidamente.');
    await smoothWait();

    async function siftDown(start, end) {
        let root = start;
        while (root * 2 + 1 <= end) {
            if (!smoothRunning) return;
            let child = root * 2 + 1;
            let swap = root;

            setBarClass(containerId, root, 'heap-root');

            smoothComparisons++;
            updateCounter('smoothComparisons', `Comparações: ${smoothComparisons}`);
            if (arr[swap] < arr[child]) swap = child;

            if (child + 1 <= end) {
                smoothComparisons++;
                updateCounter('smoothComparisons', `Comparações: ${smoothComparisons}`);
                if (arr[swap] < arr[child + 1]) swap = child + 1;
            }

            if (swap !== root) {
                setBarClass(containerId, swap, 'comparing');
                explain('smoothExplainText',
                    `O elemento ${arr[root]} (pai) é menor que ${arr[swap]} (filho). Precisamos trocar para manter a regra: pai sempre maior que filhos.`);
                await smoothWait();

                smoothSwaps++;
                updateCounter('smoothSwaps', `Trocas: ${smoothSwaps}`);
                [arr[root], arr[swap]] = [arr[swap], arr[root]];
                renderArray(containerId, arr, SMOOTH_MAX);
                setBarClass(containerId, swap, 'heap-root');

                for (let k = end + 1; k < n; k++) setBarClass(containerId, k, 'sorted');
                await smoothWait();

                root = swap;
            } else {
                explain('smoothExplainText',
                    `O elemento ${arr[root]} já é maior que seus filhos. Posição correta no heap!`);
                await smoothWait();
                break;
            }
        }
        setBarClass(containerId, root, 'default');
    }

    // Build max-heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        if (!smoothRunning) return;
        setBarClass(containerId, i, 'heap-root');
        explain('smoothExplainText',
            `Verificando posição ${i} (valor ${arr[i]}): garantindo que este "pai" seja maior que seus "filhos" na árvore.`);
        await smoothWait();
        await siftDown(i, n - 1);
    }

    if (!smoothRunning) return;

    explain('smoothExplainText',
        'Heap construído! O maior elemento está na primeira posição. Agora vamos extrair os elementos um a um do maior para o menor.');
    updateCounter('smoothPhase', 'Fase 2: Extraindo em ordem');
    await smoothWait();

    // Phase 2: Extract elements
    for (let end = n - 1; end > 0; end--) {
        if (!smoothRunning) return;

        setBarClass(containerId, 0, 'heap-root');
        explain('smoothExplainText',
            `O maior elemento do heap é ${arr[0]}. Vamos movê-lo para a posição ${end} (final da parte não-ordenada).`);
        await smoothWait();

        setBarClass(containerId, end, 'swapping');
        await smoothWait();

        smoothSwaps++;
        updateCounter('smoothSwaps', `Trocas: ${smoothSwaps}`);
        [arr[0], arr[end]] = [arr[end], arr[0]];
        renderArray(containerId, arr, SMOOTH_MAX);
        setBarClass(containerId, end, 'sorted');

        for (let k = end; k < n; k++) setBarClass(containerId, k, 'sorted');

        explain('smoothExplainText',
            `${arr[end]} está na posição final! Agora precisamos reorganizar o heap com os elementos restantes.`);
        await smoothWait();

        await siftDown(0, end - 1);
    }

    if (smoothRunning) {
        setBarClass(containerId, 0, 'sorted');
    }
}

// Auto mode
document.getElementById('smoothStart').addEventListener('click', async () => {
    if (smoothRunning) return;
    smoothRunning = true;
    smoothStepMode = false;
    document.getElementById('smoothStart').textContent = '⏸ Executando...';
    document.getElementById('smoothStart').disabled = true;
    document.getElementById('smoothStep').disabled = true;

    await animateSmoothSort(smoothArr, 'smoothArray');

    if (smoothRunning) {
        for (let i = 0; i < smoothArr.length; i++) setBarClass('smoothArray', i, 'sorted');
        updateCounter('smoothPhase', 'Fase: Concluído ✓');
        explain('smoothExplainText',
            `Pronto! Array ordenado. Foram ${smoothComparisons} comparações e ${smoothSwaps} trocas. Note como o heap permitiu encontrar o maior elemento rapidamente a cada passo.`);
    }
    document.getElementById('smoothStart').textContent = '▶ Iniciar Automático';
    document.getElementById('smoothStart').disabled = false;
    document.getElementById('smoothStep').disabled = false;
    smoothRunning = false;
});

// Step mode
document.getElementById('smoothStep').addEventListener('click', async () => {
    if (!smoothRunning) {
        smoothRunning = true;
        smoothStepMode = true;
        document.getElementById('smoothStart').disabled = true;
        document.getElementById('smoothStep').textContent = '⏭ Próximo Passo';
        explain('smoothExplainText', 'Modo passo a passo ativado. Clique "Próximo Passo" para avançar.');

        await animateSmoothSort(smoothArr, 'smoothArray');

        if (smoothRunning) {
            for (let i = 0; i < smoothArr.length; i++) setBarClass('smoothArray', i, 'sorted');
            updateCounter('smoothPhase', 'Fase: Concluído ✓');
            explain('smoothExplainText',
                `Pronto! Array ordenado. Total: ${smoothComparisons} comparações e ${smoothSwaps} trocas.`);
        }
        document.getElementById('smoothStart').disabled = false;
        document.getElementById('smoothStep').textContent = '⏭ Passo a Passo';
        smoothRunning = false;
    } else if (smoothStepResolve) {
        const resolve = smoothStepResolve;
        smoothStepResolve = null;
        resolve();
    }
});

document.getElementById('smoothReset').addEventListener('click', () => {
    smoothRunning = false;
    if (smoothStepResolve) { smoothStepResolve(); smoothStepResolve = null; }
    document.getElementById('smoothStart').textContent = '▶ Iniciar Automático';
    document.getElementById('smoothStart').disabled = false;
    document.getElementById('smoothStep').textContent = '⏭ Passo a Passo';
    document.getElementById('smoothStep').disabled = false;
    initSmoothSort();
});

initSmoothSort();
