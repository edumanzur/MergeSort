import React, { useMemo, useRef, useState } from 'react';

const SMALL_RANDOM_LIST = [84, 17, 63, 29, 91, 42, 58, 13, 76, 35, 67, 24];
const MEDIUM_RANDOM_LIST = [72, 14, 88, 37, 59, 21, 95, 46, 68, 11, 53, 27, 81, 33, 74, 19, 62, 48, 97, 25, 70, 39, 56, 16];
const LARGE_RANDOM_LIST = [
  432, 809, 213, 725, 37, 960, 578, 63, 921, 145, 689, 281, 506, 955, 194, 374, 820, 62, 890, 485,
  786, 911, 394, 178, 627, 902, 420, 579, 733, 96, 311, 654, 250, 771, 9, 624, 712, 135, 505, 884,
  445, 688, 77, 912, 721, 390, 538, 893, 470, 679, 1, 869, 302, 946, 561, 144, 790, 422, 769, 57,
  899, 308, 687, 469, 237, 630, 961, 36, 578, 799, 180, 628, 886, 298, 835, 62, 974, 214, 518, 746,
  132, 899, 243, 511, 798, 235, 681, 61, 918, 375, 692, 993, 183, 553, 846, 24, 954, 286, 647, 129,
];

const EXAMPLE_LISTS = [
  { id: 'small', title: 'Aleatória Pequena', description: '12 elementos', data: SMALL_RANDOM_LIST },
  { id: 'medium', title: 'Aleatória Média', description: '24 elementos', data: MEDIUM_RANDOM_LIST },
  { id: 'large', title: 'Aleatória Grande', description: '100 elementos', data: LARGE_RANDOM_LIST },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const cloneArray = (values) => [...values];
const getDelay = (speed) => Math.max(2, Math.round(80 / speed));

export default function App() {
  const [speed, setSpeed] = useState(10);
  const [selectedExample, setSelectedExample] = useState('small');
  const [baseArray, setBaseArray] = useState(() => cloneArray(SMALL_RANDOM_LIST));
  const [mergeArray, setMergeArray] = useState(() => cloneArray(SMALL_RANDOM_LIST));
  const [bubbleArray, setBubbleArray] = useState(() => cloneArray(SMALL_RANDOM_LIST));
  const [mergeComps, setMergeComps] = useState(0);
  const [mergeMerges, setMergeMerges] = useState(0);
  const [mergeTime, setMergeTime] = useState('0.000ms');
  const [bubbleComps, setBubbleComps] = useState(0);
  const [bubbleSwaps, setBubbleSwaps] = useState(0);
  const [bubbleTime, setBubbleTime] = useState('0.000ms');
  const [mergeStatus, setMergeStatus] = useState('Aguardando...');
  const [bubbleStatus, setBubbleStatus] = useState('Aguardando...');
  const [mergeState, setMergeState] = useState('idle');
  const [bubbleState, setBubbleState] = useState('idle');
  const [running, setRunning] = useState(false);

  const stopRef = useRef(false);
  const runningRef = useRef(false);

  const selectedExampleData = useMemo(
    () => EXAMPLE_LISTS.find((item) => item.id === selectedExample) || EXAMPLE_LISTS[0],
    [selectedExample],
  );

  const resetStats = () => {
    setMergeComps(0);
    setMergeMerges(0);
    setMergeTime('0.000ms');
    setBubbleComps(0);
    setBubbleSwaps(0);
    setBubbleTime('0.000ms');
  };

  const resetStatuses = (message = 'Aguardando...') => {
    setMergeState('idle');
    setBubbleState('idle');
    setMergeStatus(message);
    setBubbleStatus(message);
  };

  const loadExample = (mode = selectedExample) => {
    const nextExample = EXAMPLE_LISTS.find((item) => item.id === mode) || EXAMPLE_LISTS[0];
    const nextArray = cloneArray(nextExample.data);

    setSelectedExample(nextExample.id);
    setBaseArray(nextArray);
    setMergeArray(nextArray);
    setBubbleArray(nextArray);
    resetStats();
    resetStatuses('Aguardando...');
  };

  const runMergeSort = async (source) => {
    const arr = [...source];
    let comps = 0;
    let merges = 0;
    const startTime = performance.now();

    const updateTime = () => setMergeTime(`${(performance.now() - startTime).toFixed(3)}ms`);

    const merge = async (left, mid, right) => {
      const leftArr = arr.slice(left, mid + 1);
      const rightArr = arr.slice(mid + 1, right + 1);
      let i = 0;
      let j = 0;
      let k = left;

      while (i < leftArr.length && j < rightArr.length) {
        if (stopRef.current) return;

        comps += 1;
        setMergeComps(comps);
        setMergeState('active');
        setMergeStatus(`Comparando blocos em ${left + i} e ${mid + 1 + j}`);
        updateTime();

        await sleep(getDelay(speed));

        if (leftArr[i] <= rightArr[j]) {
          arr[k] = leftArr[i];
          i += 1;
        } else {
          arr[k] = rightArr[j];
          j += 1;
        }

        merges += 1;
        k += 1;
        setMergeMerges(merges);
        setMergeArray([...arr]);
        updateTime();
        await sleep(Math.max(1, Math.round(getDelay(speed) * 0.35)));
      }

      while (i < leftArr.length) {
        if (stopRef.current) return;
        arr[k] = leftArr[i];
        i += 1;
        k += 1;
        merges += 1;
        setMergeMerges(merges);
      }

      while (j < rightArr.length) {
        if (stopRef.current) return;
        arr[k] = rightArr[j];
        j += 1;
        k += 1;
        merges += 1;
        setMergeMerges(merges);
      }

      setMergeArray([...arr]);
    };

    const mergeSort = async (left, right) => {
      if (stopRef.current || left >= right) return;

      const mid = Math.floor((left + right) / 2);
      setMergeState('active');
      setMergeStatus(`Dividindo [${left}..${mid}] e [${mid + 1}..${right}]`);

      await mergeSort(left, mid);
      await mergeSort(mid + 1, right);
      await merge(left, mid, right);
    };

    await mergeSort(0, arr.length - 1);

    const elapsed = `${(performance.now() - startTime).toFixed(3)}ms`;
    setMergeTime(elapsed);

    if (!stopRef.current) {
      setMergeArray([...arr]);
      setMergeState('done');
      setMergeStatus(`Concluído em ${elapsed} - ${comps} comparações, ${merges} mesclagens`);
    }
  };

  const runBubbleSort = async (source) => {
    const arr = [...source];
    let comps = 0;
    let swaps = 0;
    const startTime = performance.now();

    const updateTime = () => setBubbleTime(`${(performance.now() - startTime).toFixed(3)}ms`);

    for (let i = 0; i < arr.length - 1; i += 1) {
      if (stopRef.current) break;

      let swapped = false;
      setBubbleState('active');
      setBubbleStatus(`Passagem ${i + 1} de ${arr.length - 1}`);

      for (let j = 0; j < arr.length - 1 - i; j += 1) {
        if (stopRef.current) break;

        comps += 1;
        setBubbleComps(comps);
        setBubbleArray([...arr]);
        updateTime();
        await sleep(getDelay(speed));

        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swaps += 1;
          swapped = true;
          setBubbleSwaps(swaps);
          setBubbleArray([...arr]);
          updateTime();
          await sleep(Math.max(1, Math.round(getDelay(speed) * 0.4)));
        }
      }

      if (!swapped) break;
    }

    const elapsed = `${(performance.now() - startTime).toFixed(3)}ms`;
    setBubbleTime(elapsed);

    if (!stopRef.current) {
      setBubbleArray([...arr]);
      setBubbleState('done');
      setBubbleStatus(`Concluído em ${elapsed} - ${comps} comparações, ${swaps} trocas`);
    }
  };

  const startSort = async () => {
    if (runningRef.current) return;

    runningRef.current = true;
    stopRef.current = false;
    setRunning(true);
    resetStats();
    setMergeState('idle');
    setBubbleState('idle');
    setMergeStatus('Ordenação em andamento...');
    setBubbleStatus('Ordenação em andamento...');

    const arrA = [...baseArray];
    const arrB = [...baseArray];

    try {
      await Promise.all([runMergeSort(arrA), runBubbleSort(arrB)]);
    } finally {
      runningRef.current = false;
      setRunning(false);

      if (stopRef.current) {
        setMergeState('idle');
        setBubbleState('idle');
        setMergeStatus('Parado pelo usuário.');
        setBubbleStatus('Parado pelo usuário.');
      }
    }
  };

  const stopSort = () => {
    stopRef.current = true;
  };

  const barHeights = (arr) => {
    const maxValue = Math.max(...arr, 1);

    return arr.map((value) => ({
      height: `${Math.max(4, Math.floor((value / maxValue) * 204))}px`,
    }));
  };

  const mergeBars = barHeights(mergeArray);
  const bubbleBars = barHeights(bubbleArray);

  return (
    <div className="container">
      <header>
        <h1 className="title">
          <span className="merge">Merge</span> vs <span className="bubble">Bubble</span>
        </h1>
        <p className="subtitle">Visualizador de Algoritmos de Ordenação em React</p>
      </header>

      <div className="controls">
        <div className="control-group">
          <label>Velocidade</label>
          <input type="range" min="1" max="10" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} disabled={running} />
          <span className="value-display">{speed}</span>
        </div>

        <button className="btn btn-primary" onClick={startSort} disabled={running}>
          ▶ Iniciar
        </button>
        <button className="btn btn-danger" onClick={stopSort} disabled={!running}>
          ■ Parar
        </button>
      </div>

      <section className="example-picker">
        <div className="example-picker-header">
          <div>
            <div className="example-picker-title">Listas de exemplo</div>
            <div className="example-picker-help">Clique em uma lista para carregar o exemplo no visualizador.</div>
          </div>
          <div className="example-picker-help">Selecionada: {selectedExampleData.title}</div>
        </div>

        <div className="example-list">
          {EXAMPLE_LISTS.map((example) => (
            <button
              key={example.id}
              className={`example-card ${selectedExample === example.id ? 'active' : ''}`}
              onClick={() => {
                if (!running) loadExample(example.id);
              }}
              disabled={running}
            >
              <span className="example-card-title">{example.title}</span>
              <span className="example-card-desc">{example.description}</span>
            </button>
          ))}
        </div>

        <div className="example-values">
          <div className="example-values-label">Valores da lista selecionada</div>
          <div className="example-values-grid">
            {selectedExampleData.data.map((value, index) => (
              <span className="example-value-chip" key={`${selectedExampleData.id}-${index}-${value}`}>
                {value}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="legend">
        <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--bar-default)' }}></div>Padrão</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--compare)' }}></div>Comparando</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--swap)' }}></div>Trocando</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--sorted)' }}></div>Ordenado</div>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title merge">Merge Sort</span>
            <div className="panel-stats">
              <span>Comparações: <span className="stat-val">{mergeComps}</span></span>
              <span>Mesclagens: <span className="stat-val">{mergeMerges}</span></span>
              <span className="timer merge">{mergeTime}</span>
            </div>
          </div>
          <div className="viz-area">
            {mergeArray.map((value, index) => (
              <div
                key={`merge-${index}-${value}`}
                className={`bar ${mergeState === 'done' ? 'sorted' : ''}`}
                style={{ height: mergeBars[index].height }}
              />
            ))}
          </div>
          <div className="status-bar">
            <div className={`status-dot ${mergeState === 'active' ? 'active' : mergeState === 'done' ? 'done' : ''}`} />
            <span>{mergeStatus}</span>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <span className="panel-title bubble">Bubble Sort</span>
            <div className="panel-stats">
              <span>Comparações: <span className="stat-val">{bubbleComps}</span></span>
              <span>Trocas: <span className="stat-val">{bubbleSwaps}</span></span>
              <span className="timer bubble">{bubbleTime}</span>
            </div>
          </div>
          <div className="viz-area">
            {bubbleArray.map((value, index) => (
              <div
                key={`bubble-${index}-${value}`}
                className={`bar ${bubbleState === 'done' ? 'sorted' : ''}`}
                style={{ height: bubbleBars[index].height }}
              />
            ))}
          </div>
          <div className="status-bar">
            <div className={`status-dot ${bubbleState === 'active' ? 'active' : bubbleState === 'done' ? 'done' : ''}`} />
            <span>{bubbleStatus}</span>
          </div>
        </div>
      </div>

      <div className="complexity">
        <div className="complexity-card">
          <strong className="merge">Merge Sort - Complexidade</strong>
          Melhor caso: <code>O(n log n)</code><br />
          Caso médio: <code>O(n log n)</code><br />
          Pior caso: <code>O(n log n)</code><br />
          Espaço: <code>O(n)</code> - precisa de memória extra
        </div>
        <div className="complexity-card">
          <strong className="bubble">Bubble Sort - Complexidade</strong>
          Melhor caso: <code>O(n)</code> - array já ordenado<br />
          Caso médio: <code>O(n²)</code><br />
          Pior caso: <code>O(n²)</code><br />
          Espaço: <code>O(1)</code> - in-place
        </div>
      </div>
    </div>
  );
}