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

document.getElementById('quickSpeed').addEventListener('input', (e) => {
    document.getElementById('quickSpeedLabel').textContent = speedLabels[e.target.value - 1];
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

// ===== QUICKSORT ANIMATION (DIDACTIC) =====
let quickArr = [];
let quickRunning = false;
let quickStepMode = false;
let quickStepResolve = null;
let quickComparisons = 0;
let quickSwaps = 0;
let quickSortedIndices = new Set();
const QUICK_SIZE = 10;
const QUICK_MAX = 70;

function initQuickSort() {
    quickArr = generateArray(QUICK_SIZE, QUICK_MAX);
    renderArray('quickArray', quickArr, QUICK_MAX);
    quickRunning = false;
    quickStepMode = false;
    quickComparisons = 0;
    quickSwaps = 0;
    quickSortedIndices = new Set();
    updateCounter('quickComparisons', 'Comparações: 0');
    updateCounter('quickSwaps', 'Trocas: 0');
    updateCounter('quickPhase', 'Fase: Aguardando');
    explain('quickExplainText', 'Clique em "Iniciar" para ver o algoritmo funcionando, ou use "Passo a Passo" para controlar manualmente.');
}

function markQuickSorted(containerId) {
    quickSortedIndices.forEach(idx => setBarClass(containerId, idx, 'sorted'));
}

function quickWait() {
    if (quickStepMode) {
        return new Promise(resolve => { quickStepResolve = resolve; });
    }
    return sleep(getSpeed('quickSpeed'));
}

async function animateQuickSort(arr, low, high, containerId, depth) {
    if (!quickRunning) return;
    if (low < high) {
        updateCounter('quickPhase', `Fase: Particionando (nível ${depth})`);
        explain('quickExplainText',
            `Vamos dividir o grupo das posições ${low} até ${high}. Primeiro, escolhemos o último elemento como pivô.`);
        await quickWait();

        const pi = await animatePartition(arr, low, high, containerId);
        if (!quickRunning) return;

        explain('quickExplainText',
            `O pivô ${arr[pi]} está na posição ${pi}. Agora tudo à esquerda é menor e tudo à direita é maior. Vamos repetir o processo em cada lado.`);
        await quickWait();

        await animateQuickSort(arr, low, pi - 1, containerId, depth + 1);
        if (!quickRunning) return;
        await animateQuickSort(arr, pi + 1, high, containerId, depth + 1);
    } else if (low >= 0 && low < arr.length) {
        quickSortedIndices.add(low);
        setBarClass(containerId, low, 'sorted');
    }
}

async function animatePartition(arr, low, high, containerId) {
    const pivot = arr[high];
    setBarClass(containerId, high, 'pivot');
    markQuickSorted(containerId);
    explain('quickExplainText',
        `Pivô escolhido: ${pivot} (última posição). Agora vamos percorrer os outros elementos. Se um elemento for MENOR ou IGUAL ao pivô, ele vai para o lado esquerdo.`);
    await quickWait();

    let i = low - 1;

    for (let j = low; j < high; j++) {
        if (!quickRunning) return low;

        setBarClass(containerId, j, 'comparing');
        quickComparisons++;
        updateCounter('quickComparisons', `Comparações: ${quickComparisons}`);

        if (arr[j] <= pivot) {
            explain('quickExplainText',
                `${arr[j]} ≤ ${pivot} (pivô)? SIM! Então movemos ${arr[j]} para o lado esquerdo (posição ${i + 1}).`);
        } else {
            explain('quickExplainText',
                `${arr[j]} ≤ ${pivot} (pivô)? NÃO. O ${arr[j]} é maior, então fica onde está (lado direito).`);
        }
        await quickWait();

        if (arr[j] <= pivot) {
            i++;
            if (i !== j) {
                quickSwaps++;
                updateCounter('quickSwaps', `Trocas: ${quickSwaps}`);
                [arr[i], arr[j]] = [arr[j], arr[i]];
                renderArray(containerId, arr, QUICK_MAX);
                setBarClass(containerId, high, 'pivot');
                setBarClass(containerId, i, 'comparing');
                markQuickSorted(containerId);
            } else {
                setBarClass(containerId, j, 'default');
            }
        } else {
            setBarClass(containerId, j, 'default');
        }
        await quickWait();
    }

    // Place pivot in correct position
    i++;
    if (i !== high) {
        quickSwaps++;
        updateCounter('quickSwaps', `Trocas: ${quickSwaps}`);
        explain('quickExplainText',
            `Agora colocamos o pivô ${pivot} na posição correta (${i}). Tudo à esquerda é menor, tudo à direita é maior!`);
        [arr[i], arr[high]] = [arr[high], arr[i]];
    } else {
        explain('quickExplainText',
            `O pivô ${pivot} já está na posição correta (${i})!`);
    }
    renderArray(containerId, arr, QUICK_MAX);
    quickSortedIndices.add(i);
    markQuickSorted(containerId);
    await quickWait();

    return i;
}

// Auto mode
document.getElementById('quickStart').addEventListener('click', async () => {
    if (quickRunning) return;
    quickRunning = true;
    quickStepMode = false;
    document.getElementById('quickStart').textContent = '⏸ Executando...';
    document.getElementById('quickStart').disabled = true;
    document.getElementById('quickStep').disabled = true;

    await animateQuickSort(quickArr, 0, quickArr.length - 1, 'quickArray', 1);

    if (quickRunning) {
        for (let i = 0; i < quickArr.length; i++) setBarClass('quickArray', i, 'sorted');
        updateCounter('quickPhase', 'Fase: Concluído ✓');
        explain('quickExplainText',
            `Pronto! O array está completamente ordenado. Foram necessárias ${quickComparisons} comparações e ${quickSwaps} trocas.`);
    }
    document.getElementById('quickStart').textContent = '▶ Iniciar Automático';
    document.getElementById('quickStart').disabled = false;
    document.getElementById('quickStep').disabled = false;
    quickRunning = false;
});

// Step mode
document.getElementById('quickStep').addEventListener('click', async () => {
    if (!quickRunning) {
        // Start in step mode
        quickRunning = true;
        quickStepMode = true;
        document.getElementById('quickStart').disabled = true;
        document.getElementById('quickStep').textContent = '⏭ Próximo Passo';
        explain('quickExplainText', 'Modo passo a passo ativado. Clique "Próximo Passo" para avançar.');

        await animateQuickSort(quickArr, 0, quickArr.length - 1, 'quickArray', 1);

        if (quickRunning) {
            for (let i = 0; i < quickArr.length; i++) setBarClass('quickArray', i, 'sorted');
            updateCounter('quickPhase', 'Fase: Concluído ✓');
            explain('quickExplainText',
                `Pronto! O array está ordenado. Total: ${quickComparisons} comparações e ${quickSwaps} trocas.`);
        }
        document.getElementById('quickStart').disabled = false;
        document.getElementById('quickStep').textContent = '⏭ Passo a Passo';
        quickRunning = false;
    } else if (quickStepResolve) {
        // Advance one step
        const resolve = quickStepResolve;
        quickStepResolve = null;
        resolve();
    }
});

document.getElementById('quickReset').addEventListener('click', () => {
    quickRunning = false;
    if (quickStepResolve) { quickStepResolve(); quickStepResolve = null; }
    document.getElementById('quickStart').textContent = '▶ Iniciar Automático';
    document.getElementById('quickStart').disabled = false;
    document.getElementById('quickStep').textContent = '⏭ Passo a Passo';
    document.getElementById('quickStep').disabled = false;
    quickSortedIndices = new Set();
    initQuickSort();
});

initQuickSort();

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

    // Phase 1: Build heap
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

                // Keep sorted markers
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

        // Mark all sorted
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
