(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const name = escape(CONFIG.recipientName), group = escape(CONFIG.groupName), brand = escape(CONFIG.giftBrand);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const state = { phase: 'boot', level: 0, xp: 0, question: 0, choice: null, sound: !!CONFIG.enableSounds, timer: null, run: 0, badges: [] };
  let audio, toastTimer, confettiFrame;
  document.body.classList.toggle('no-motion', !CONFIG.enableAnimations);
  $('#subject-name').textContent = CONFIG.recipientName.toUpperCase();
  document.title = `SPORT.EXE — THE ${CONFIG.groupName} PROTOCOL`;
  const primary = (text, action) => `<button class="primary" data-action="${action}">${text}<span class="arrow" aria-hidden="true">↗</span></button>`;
  const secondary = (text, action) => `<button class="secondary" data-action="${action}">${text}</button>`;
  const header = (tag, title, sub = '', step = '') => `<div class="kicker"><span class="tag">${tag}</span><span>THE ${group} PROTOCOL</span>${step ? `<span class="step-tag">${step}</span>` : ''}</div><h1>${title}</h1>${sub ? `<p class="intro-subtitle">${sub}</p>` : ''}`;
  const bootLines = [
    ['Initializing SERT_OS...', ''], ['Loading questionable hobbies database...', ''],
    ['Scanning sporting anomalies...', ''], ['Connecting to SERT headquarters...', ''],
    [`SUBJECT IDENTIFIED: ${CONFIG.recipientName.toUpperCase()}`, 'ok'],
    ['WARNING: HIGH-RISK SPORTING PROFILE DETECTED', 'warn']
  ];
  const diagnosticLines = [
    ['CPU', 'Overclocked'], ['RAM', '128 GB di informazioni inutili'], ['Coordinazione motoria', 'NOT VERIFIED'],
    ['Interesse per sport assurdi', '99.9%'], ['Buonsenso', 'NOT INSTALLED'], ['Propensione a nuovi hobby', 'CRITICAL'],
    ['Spazio per altra attrezzatura sportiva', 'UNKNOWN']
  ];
  const questions = [
    { title: 'Quale di questi sport esiste realmente?', answers: ['Chess Boxing', 'Extreme Ironing', 'Wife Carrying', 'Tutti e tre'], correct: 3, message: 'Corretto. La tua conoscenza degli sport assurdi è clinicamente preoccupante.' },
    { title: 'Nel Chess Boxing, cosa si alterna durante un incontro?', answers: ['Scacchi e pugilato', 'Scacchi e nuoto', 'Pugilato e programmazione Python', 'Scacchi e lancio del mouse'], correct: 0, message: 'Corretto. Finalmente uno sport in cui puoi perdere sia fisicamente sia intellettualmente.' },
    { title: "Cos’è l’Extreme Ironing?", answers: ['Stirare vestiti mentre si praticano attività estreme', 'Una disciplina olimpica di lancio del ferro da stiro', 'Un videogioco di simulazione domestica', 'Una competizione di assemblaggio di PC'], correct: 0, message: 'Esatto. E pensare che qualcuno continua a sostenere che i tuoi hobby siano strani.' }
  ];
  const obsessions = [
    ['⌖', 'Lanciare oggetti contro cose', 'Precisione facoltativa. Entusiasmo obbligatorio.', 'Finanzieremo il tuo talento. I vetri dei vicini restano a tuo carico.'],
    ['↟', 'Arrampicarmi dove non dovrei', 'Perché usare le scale sarebbe troppo semplice.', 'Hai scelto la strada in salita. Letteralmente. Il SERT declina le scale.'],
    ['▣', 'Comprare attrezzatura costosissima', 'Per uno sport che forse praticherò tre volte.', 'Il tuo carrello ha più potenza di calcolo del tuo PC. Ci sembrava giusto contribuire.'],
    ['⌘', 'Uno sport di cui nessuno ha mai sentito parlare', 'Più è incomprensibile, meglio è.', 'Sport non trovato. Errore 404. Budget per provarlo: trovato.']
  ];
  function play(kind = 'click') {
    if (!state.sound) return;
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume().catch(() => {});
      const notes = kind === 'win' ? [523, 659, 784, 1047] : kind === 'error' ? [180, 120] : kind === 'correct' ? [600, 900] : [440];
      notes.forEach((frequency, i) => {
        const oscillator = audio.createOscillator(), gain = audio.createGain(), start = audio.currentTime + i * .09;
        oscillator.type = 'square'; oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(.025, start); gain.gain.exponentialRampToValueAtTime(.001, start + .12);
        oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(start); oscillator.stop(start + .13);
      });
    } catch { /* L'audio è facoltativo anche nei browser che lo bloccano. */ }
  }
  function updateHUD(progress) {
    $('#xp').innerHTML = `${String(state.xp).padStart(3, '0')} <small>XP</small>`;
    $('#percent').textContent = `${progress}%`;
    $('#mission-progress').style.width = `${progress}%`;
    document.querySelectorAll('[data-level]').forEach(el => {
      const level = Number(el.dataset.level);
      el.classList.toggle('active', level === state.level);
      el.classList.toggle('done', level < state.level);
      el.querySelector('b').textContent = level < state.level ? '✓' : level === state.level ? '●' : '○';
    });
    if (state.level === 4) $('[data-level="4"] small').textContent = 'FINANZIAMENTO SBLOCCATO';
  }
  function render(html, path, progress = 0) {
    clearTimeout(state.timer); state.run++;
    $('#window-path').textContent = `sert_os / ${path}.exe`;
    $('#screen').innerHTML = html;
    updateHUD(progress);
    $('#screen').focus({ preventScroll: true });
    if (state.phase !== 'boot' && innerWidth < 651) $('.workspace').scrollIntoView({ behavior: reducedMotion || !CONFIG.enableAnimations ? 'instant' : 'smooth', block: 'start' });
  }
  // Ogni cambio schermata invalida i callback della sequenza precedente.
  function sequence(lines, output, interval, done) {
    const run = state.run; let index = 0;
    function next() {
      if (run !== state.run) return;
      output(lines[index], index); index++;
      if (index < lines.length) state.timer = setTimeout(next, interval);
      else state.timer = setTimeout(() => { if (run === state.run) done(); }, 350);
    }
    next();
  }
  function terminalLines(lines) { return lines.map(([text, type]) => `<div class="${type}">&gt; ${escape(text)}</div>`).join(''); }
  function boot(finish = false) {
    state.phase = finish ? 'intro' : 'boot'; state.level = 0;
    render(`${header('ACCESSO RISERVATO', 'Sport improbabili.<br><span class="outline">Soggetto probabile.</span>', 'Operazione: finanziare l’ennesimo sport improbabile.')}
      <div class="terminal"><div class="terminal-label"><span>● SERT_OS — BOOT SEQUENCE</span><span>SYS.LOG</span></div><div id="boot-log" aria-label="Registro di avvio">${finish ? terminalLines(bootLines) : ''}</div><span class="cursor" aria-hidden="true"></span></div>
      <div class="narrative"><p><strong>Caro ${name}, il ${group} ti osserva da tempo.</strong><br>Le tue tendenze verso sport improbabili hanno superato ogni soglia di sicurezza.</p><p>Per questo motivo sei stato selezionato per un protocollo sperimentale.<br>La tua collaborazione non è richiesta, ma sarebbe gradita.</p></div>
      <div id="boot-action">${finish ? primary('ACCETTO IL MIO DESTINO', 'diagnostics') : secondary('SALTA AVVIO →', 'skip-boot')}</div>
      <div class="helper"><span>◷ CIRCA 3–4 MINUTI</span><span>⌨ MOUSE, TOUCH O TASTIERA</span><span>♡ ZERO BUONSENSO</span></div>
      <div class="tiny-note">FASCICOLO #SERT-001 &nbsp; / &nbsp; SOGGETTO SOTTO OSSERVAZIONE: ${name.toUpperCase()}</div>`, 'accesso_riservato');
    if (!finish) sequence(bootLines, line => $('#boot-log').insertAdjacentHTML('beforeend', terminalLines([line])), 550, () => {
      state.phase = 'intro'; $('#boot-action').innerHTML = primary('ACCETTO IL MIO DESTINO', 'diagnostics');
    });
  }
  function diagnostics(complete = false) {
    state.phase = 'diagnostics'; state.level = 1;
    render(`${header('TEST 01', 'Hardware<br><span class="outline">diagnostics.</span>', 'Non muoverti. Stiamo cercando i driver del buonsenso.', '01 / 03')}
      <div class="loading-track" role="progressbar" aria-label="Scansione del soggetto" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${complete ? 100 : 0}"><span style="width:${complete ? 100 : 0}%"></span></div>
      <div class="diagnostics" id="diagnostic-log">${complete ? diagnosticLines.map(diagnosticRow).join('') : ''}</div>
      <div id="diagnostic-result">${complete ? diagnosticResult() : `<p class="muted" style="font:10px var(--mono)">Ricerca di una passione normale… 0 risultati.</p>${secondary('SALTA SCANSIONE →', 'skip-diagnostics')}`}</div>`, 'hardware_diagnostics', 12);
    if (!complete) sequence(diagnosticLines, (line, index) => {
      $('#diagnostic-log').insertAdjacentHTML('beforeend', diagnosticRow(line));
      $('.loading-track span').style.width = `${(index + 1) / 7 * 100}%`;
      $('.loading-track').setAttribute('aria-valuenow', Math.round((index + 1) / 7 * 100));
    }, 850, () => { $('#diagnostic-result').innerHTML = diagnosticResult(); updateHUD(25); });
    else updateHUD(25);
  }
  function diagnosticRow([key, value]) { return `<div class="diagnostic"><span>${escape(key)}</span><strong>${escape(value)}</strong></div>`; }
  function diagnosticResult() { return `<div class="alert" role="status"><strong>⚠ ATTENZIONE</strong><p>Il soggetto presenta una grave incompatibilità con gli sport normali.<br>Si consiglia un ulteriore approfondimento.</p></div>${primary('AVVIA TEST SPORTIVO', 'quiz')}`; }
  function quiz() {
    state.phase = 'quiz'; state.level = 2;
    const q = questions[state.question];
    render(`${header('TEST 02', 'Questionable<br><span class="outline">sports test.</span>', 'Tre domande. Una diagnosi sempre più preoccupante.', '02 / 03')}
      <div class="kicker"><span>DOMANDA ${state.question + 1} / 3</span><div class="quiz-dots">${questions.map((_, i) => `<span class="${i <= state.question ? 'filled' : ''}"></span>`).join('')}</div><span class="step-tag">+100 XP / RISPOSTA</span></div>
      <h2 class="question">${q.title}</h2><div class="options">${q.answers.map((answer, i) => `<button class="option" data-answer="${i}"><span class="letter">${'ABCD'[i]}</span><span>${answer}</span></button>`).join('')}</div>
      <div id="feedback" class="feedback" role="status">Seleziona una risposta. Il tuo fascicolo sta prendendo appunti.</div><div id="quiz-next"></div>
      <div class="tiny-note">NESSUN TIMER. NESSUNA VITA PERSA. SOLO LA NOSTRA STIMA, FORSE.</div>`, 'questionable_sports', 25 + state.question * 10);
  }
  let wrongCount = 0;
  function answer(index, button) {
    if (state.phase !== 'quiz' || button.disabled) return;
    const q = questions[state.question], feedback = $('#feedback');
    if (index !== q.correct) {
      play('error'); button.classList.add('wrong'); button.disabled = true;
      feedback.className = 'feedback error';
      feedback.textContent = ['Errore 404: risposta sensata non trovata. Riprova, il fascicolo non scappa.', 'Segmentation fault del buonsenso. Riavvia il neurone e riprova.', 'Quasi. Ma in una timeline decisamente sbagliata. Hai un altro tentativo.'][wrongCount++ % 3];
      return;
    }
    play('correct'); button.classList.add('correct');
    document.querySelectorAll('[data-answer]').forEach(el => { el.disabled = true; });
    state.xp += 100; feedback.className = 'feedback'; feedback.textContent = q.message;
    $('#quiz-next').innerHTML = primary(state.question === 2 ? 'VISUALIZZA DIAGNOSI' : 'PROSSIMA DOMANDA', 'next-question');
    updateHUD(35 + state.question * 10);
  }
  function quizComplete() {
    state.phase = 'quiz-complete'; state.badges.push('SPORT DETECTIVE');
    render(`${header('DIAGNOSI CONFERMATA', 'Sporting instability<br><span class="outline">confirmed.</span>', 'Il soggetto supera i parametri massimi di stranezza consentiti.')}
      <div class="badge-row"><span class="badge">✧ SPORT DETECTIVE</span><span class="badge">+300 XP ACQUISITI</span></div>
      <div class="terminal"><div class="terminal-label">REFERTO DEL SISTEMA</div><div>&gt; Sport normali compatibili: 0</div><div>&gt; Sport improbabili compatibili: TUTTI</div><div class="warn">&gt; Terapia consigliata: nessuna conosciuta.</div><div class="ok">&gt; Prossimo step: assecondare il problema.<span class="cursor"></span></div></div>
      <p class="narrative">La buona notizia? Hai passato il test.<br>La cattiva? Era proprio quello che temevamo.</p>${primary('CONTINUA L’INDAGINE', 'obsessions')}`, 'sporting_instability', 60);
  }
  function choose() {
    state.phase = 'choose'; state.level = 3;
    render(`${header('TEST 03', `${name},<br><span class="outline">è tempo di scegliere.</span>`, 'Quale sarà la tua prossima ossessione sportiva?', '03 / 03')}
      <div class="obsessions">${obsessions.map(([icon, title, description], i) => `<button class="obsession" data-choice="${i}"><span class="symbol" aria-hidden="true">${icon}</span><strong>${title}</strong><small>${description}</small></button>`).join('')}</div>
      <div class="tiny-note">SCEGLI UNA CARD PER CONTINUARE. OGNI SCELTA È UGUALMENTE DISCUTIBILE.</div>`, 'next_obsession', 65);
  }
  const processingLines = [['Analizzando le capacità del soggetto...', ''], ['Stimando il costo del nuovo hobby...', ''], ['Calcolando il rischio di abbandono dopo tre settimane...', ''], ['Verificando disponibilità economica...', ''], ['ERROR...', 'warn'], ['ERROR...', 'warn'], ['CRITICAL ERROR: INSUFFICIENT FUNDS', 'warn']];
  function processChoice(complete = false) {
    state.phase = 'processing';
    render(`<div class="processing">${header('ELABORAZIONE', 'Ottima scelta.<br><span class="error-title">Pessima solvibilità.</span>', 'Il sistema sta consultando il tuo conto e scuotendo la testa.')}
      <p class="narrative">${obsessions[state.choice][3]}</p><div class="terminal"><div class="terminal-label">FINANCE_MODULE / V.0.0.1</div><div id="processing-log">${complete ? terminalLines(processingLines) : ''}</div><span class="cursor"></span></div>
      <div id="funding">${complete ? fundingResult() : secondary('SALTA ELABORAZIONE →', 'skip-processing')}</div></div>`, 'funding_error', 80);
    if (!complete) sequence(processingLines, line => $('#processing-log').insertAdjacentHTML('beforeend', terminalLines([line])), 800, finishProcessing);
    else finishProcessing();
  }
  function fundingResult() { return `<div class="alert"><strong>NESSUN PROBLEMA.</strong><p>IL ${group} HA PREVISTO QUESTA EVENTUALITÀ.</p><p class="green">Emergency funding protocol activated…</p></div>${primary('SBLOCCA FINANZIAMENTO', 'finale')}`; }
  function finishProcessing() {
    $('#funding').innerHTML = fundingResult(); play('error');
    if (CONFIG.enableAnimations && !reducedMotion) { $('.workspace').classList.add('shake'); setTimeout(() => $('.workspace').classList.remove('shake'), 400); }
    updateHUD(90);
  }
  function giftAmount() {
    const value = CONFIG.giftAmount;
    if (value === null || value === undefined || value === '') return '';
    if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(value) : '';
    return String(value);
  }
  function finale() {
    state.phase = 'finale'; state.level = 4; state.xp = 500; state.badges = ['SPORT DETECTIVE', 'HOBBY ADDICT', 'SERT CERTIFIED'];
    render(`${header('MISSION COMPLETED!', 'Irrecuperabile,<br><span class="outline">ma finanziato.</span>', 'ACHIEVEMENT UNLOCKED · La tua prossima ossessione la offriamo noi.')}
      <div class="gift"><small>EMERGENCY FUNDING PROTOCOL / SBLOCCATO</small><h2>BUONO REGALO<br>${brand.toUpperCase()}</h2>${giftAmount() ? `<div class="amount">${escape(giftAmount())}</div>` : ''}<div class="gift-bottom"><span>DESTINATARIO: ${name.toUpperCase()}</span><span>DAL ${group}, CON PREOCCUPAZIONE ♡</span></div></div>
      <div class="dedication"><p>Caro ${name},<br>abbiamo provato a trovare una cura per la tua passione verso gli sport improbabili. Purtroppo non esiste.</p><p><strong>Quindi abbiamo deciso di finanziare il problema.</strong></p><p>Che questo buono possa aiutarti a scoprire un altro sport assurdo di cui ci parlerai per i prossimi sei mesi.</p><p>Con affetto e moderata preoccupazione,<br><strong>IL ${group}</strong></p></div>
      <p class="friends">${CONFIG.friends.map(escape).join(' · ')}</p><div class="badge-row">${state.badges.map(badge => `<span class="badge">✧ ${badge}</span>`).join('')}</div><span class="kicker">✓ ${group} APPROVED — 100% QUESTIONABLE</span>
      <div class="actions">${primary('RISCATTA IL TUO LOOT', 'loot')}${secondary('↓ SALVA IL TUO ACHIEVEMENT', 'save')}${secondary('↺ RIGIOCA', 'replay')}</div><div id="loot-result" aria-live="polite"></div>`, 'achievement_unlocked', 100);
    play('win'); celebrate();
  }
  function toast(message) { clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').classList.add('visible'); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 6500); }
  function celebrate() {
    cancelAnimationFrame(confettiFrame);
    const canvas = $('#confetti'), ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!CONFIG.enableAnimations || reducedMotion) return;
    canvas.width = innerWidth; canvas.height = innerHeight;
    const pieces = Array.from({ length: 85 }, () => ({ x: Math.random() * canvas.width, y: -Math.random() * canvas.height, vx: (Math.random() - .5) * 2, vy: 2 + Math.random() * 3, angle: Math.random() * 6, color: ['#72f5a4', '#8b5cf6', '#f8fafc', '#eac87a'][Math.floor(Math.random() * 4)] }));
    const start = performance.now(); let previous = start;
    function frame(now) {
      const delta = Math.min((now - previous) / 16.67, 3); previous = now; ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pieces) { p.x += p.vx * delta; p.y += p.vy * delta; p.angle += .04 * delta; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle); ctx.fillStyle = p.color; ctx.fillRect(-3, -5, 6, 10); ctx.restore(); }
      if (now - start < 5500 && state.phase === 'finale') confettiFrame = requestAnimationFrame(frame); else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    confettiFrame = requestAnimationFrame(frame);
  }
  function saveAchievement() {
    const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 1450;
    const ctx = canvas.getContext('2d'); if (!ctx) { toast('Il browser non supporta il salvataggio PNG.'); return; }
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#0b0f19'; ctx.fillRect(0, 0, 1200, 1450);
    ctx.strokeStyle = '#1a2730'; ctx.lineWidth = 1;
    for (let x = 0; x < 1200; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1450); ctx.stroke(); }
    for (let y = 0; y < 1450; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1200, y); ctx.stroke(); }
    ctx.strokeStyle = '#72f5a4'; ctx.strokeRect(55, 55, 1090, 1340);
    let y = 115;
    function text(message, size = 28, color = '#f8fafc', bold = false, maxWidth = 990) {
      ctx.font = `${bold ? 'bold ' : ''}${size}px ${size >= 50 ? 'Arial' : 'monospace'}`; ctx.fillStyle = color;
      let line = ''; const lineHeight = size * 1.5;
      for (const word of String(message).split(' ')) { if (ctx.measureText(line + word).width > maxWidth && line) { ctx.fillText(line.trim(), 100, y); y += lineHeight; line = ''; } line += word + ' '; }
      ctx.fillText(line.trim(), 100, y); y += lineHeight;
    }
    text(`SPORT.EXE / THE ${CONFIG.groupName} PROTOCOL`, 23, '#72f5a4'); y += 35;
    text('ACHIEVEMENT UNLOCKED', 22, '#bba0ff'); y += 10;
    text('IRRECUPERABILE,', 68, '#f8fafc', true); text('MA FINANZIATO.', 68, '#72f5a4', true); y += 30;
    text('BUONO REGALO', 32); text(CONFIG.giftBrand.toUpperCase(), 65, '#72f5a4', true);
    if (giftAmount()) text(giftAmount(), 38, '#72f5a4');
    y += 22; text(`Caro ${CONFIG.recipientName},`, 26);
    text('abbiamo provato a trovare una cura per la tua passione verso gli sport improbabili. Purtroppo non esiste.', 24);
    y += 12; text('Quindi abbiamo deciso di finanziare il problema.', 26, '#72f5a4', true);
    y += 12; text('Che questo buono possa aiutarti a scoprire un altro sport assurdo di cui ci parlerai per i prossimi sei mesi.', 24);
    y += 14; text('Con affetto e moderata preoccupazione,', 24); text(`IL ${CONFIG.groupName}`, 28, '#f8fafc', true);
    y += 18; text(CONFIG.friends.join(' · '), 22, '#aab8bb');
    if (state.choice !== null) { y += 12; text(obsessions[state.choice][3], 20, '#aab8bb'); }
    y = Math.max(y + 25, 1310); text(`${CONFIG.groupName} APPROVED — 100% QUESTIONABLE`, 22, '#72f5a4');
    canvas.toBlob(blob => {
      if (!blob) { toast('Impossibile creare il PNG. Riprova.'); return; }
      const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = 'SPORT-EXE-achievement.png'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
      toast('Achievement esportato! Il PNG è il tuo biglietto digitale.');
    }, 'image/png');
  }
  const actions = {
    'skip-boot': () => boot(true), diagnostics: () => diagnostics(), 'skip-diagnostics': () => diagnostics(true),
    quiz: () => { state.question = 0; quiz(); },
    'next-question': () => { state.question++; state.question < questions.length ? quiz() : quizComplete(); },
    obsessions: choose, 'skip-processing': () => processChoice(true), finale,
    loot: () => { $('#loot-result').innerHTML = `<div class="loot-message">Il tuo buono ${brand} è stato sbloccato! Il ${group} ti consegnerà il codice regalo separatamente.</div>`; },
    save: saveAchievement,
    replay: () => { state.xp = 0; state.question = 0; state.choice = null; state.badges = []; wrongCount = 0; $('[data-level="4"] small').textContent = 'ACCESSO BLOCCATO'; boot(true); }
  };
  $('#screen').addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button || button.disabled) return;
    if (button.hasAttribute('data-answer')) { answer(Number(button.dataset.answer), button); return; }
    play();
    if (button.hasAttribute('data-choice')) { state.choice = Number(button.dataset.choice); state.xp += 100; state.badges.push('HOBBY ADDICT'); processChoice(); return; }
    actions[button.dataset.action]?.();
  });
  function soundLabel() { $('#sound').innerHTML = `${state.sound ? '♪' : '♩'} <span>AUDIO ${state.sound ? 'ON' : 'OFF'}</span>`; $('#sound').setAttribute('aria-pressed', String(state.sound)); $('#sound').setAttribute('aria-label', state.sound ? 'Disattiva audio' : 'Attiva audio'); }
  $('#sound').addEventListener('click', () => { state.sound = !state.sound; soundLabel(); if (state.sound) play(); });
  const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']; let konamiIndex = 0;
  document.addEventListener('keydown', event => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    konamiIndex = key === konami[konamiIndex] ? konamiIndex + 1 : key === konami[0] ? 1 : 0;
    if (konamiIndex === konami.length) { konamiIndex = 0; toast('SERT CHEAT MODE ACTIVATED — Il buonsenso è stato definitivamente disinstallato.'); play('win'); }
  });
  soundLabel(); boot();
})();
