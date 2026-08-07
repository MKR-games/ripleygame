'use strict';

const WORD_PAIRS = [
  ['모자','가발'], ['안경','선글라스'], ['라면','우동'], ['침대','소파'], ['지하철','기차'],
  ['영화관','공연장'], ['카페','술집'], ['치킨','돈가스'], ['샴푸','바디워시'], ['냉장고','에어컨'],
  ['택시','버스'], ['호텔','모텔'], ['경찰','경비원'], ['의사','간호사'], ['유튜브','넷플릭스'],
  ['인스타그램','틱톡'], ['노트북','태블릿'], ['볼펜','샤프'], ['맥주','탄산음료'], ['김치찌개','부대찌개'],
  ['우산','우비'], ['운동화','슬리퍼'], ['칫솔','면도기'], ['향수','데오드란트'], ['지갑','카드지갑'],
  ['에스컬레이터','엘리베이터'], ['도서관','서점'], ['수족관','동물원'], ['수영장','해수욕장'], ['캠핑장','펜션'],
  ['승무원','여행가이드'], ['요리사','제빵사'], ['카메라','쌍안경'], ['피아노','신디사이저'], ['기타','우쿨렐레'],
  ['야구','테니스'], ['볼링','당구'], ['축구','풋살'], ['헬스장','필라테스'], ['햄버거','샌드위치'],
  ['핫도그','샌드위치'], ['아이스크림','요거트'], ['커피','코코아'], ['차','에이드'], ['콜라','사이다'],
  ['도넛','베이글'], ['크루아상','소금빵'], ['떡볶이','라볶이'], ['초밥','김밥'], ['비빔밥','볶음밥'],
  ['만두','춘권'], ['국밥','설렁탕'], ['스테이크','삼겹살'], ['회','초밥'], ['맥주','막걸리'],
  ['편의점','마트'], ['백화점','아울렛'], ['코인세탁방','세탁소'], ['약국','병원'], ['미용실','네일샵'],
  ['노래방','클럽'], ['PC방','오락실'], ['놀이공원','워터파크'], ['박물관','미술관'], ['공항','기차역'],
  ['다리','터널'], ['골목','지하도'], ['베란다','옥상'], ['주방','화장실'], ['문','창문'],
  ['베개','쿠션'], ['이불','침낭'], ['커튼','블라인드'], ['세탁기','식기세척기'], ['청소기','공기청정기'],
  ['전자레인지','오븐'], ['선풍기','헤어드라이어'], ['충전기','보조배터리'], ['이어폰','헤드폰'], ['스마트워치','스마트밴드'],
  ['리모컨','게임패드'], ['키보드','타자기'], ['공책','다이어리'], ['달력','시간표'], ['지도','내비게이션'],
  ['비밀번호','PIN번호'], ['알람','타이머'], ['꿈','기억'], ['거짓말','비밀'], ['소문','가십'],
  ['탐정','기자'], ['변호사','검사'], ['교사','강사'], ['학생','인턴'], ['사장','팀장'],
  ['소개팅','면접'], ['결혼식','졸업식'], ['생일','기념일'], ['여권','신분증'], ['열쇠','도어락']
];

if (WORD_PAIRS.length !== 100) {
  throw new Error(`단어 조합은 100개여야 합니다. 현재: ${WORD_PAIRS.length}`);
}

const screen = document.getElementById('screen');
const homeBtn = document.getElementById('homeBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalActions = document.getElementById('modalActions');

const ORDINALS = [
  '첫 번째','두 번째','세 번째','네 번째','다섯 번째','여섯 번째',
  '일곱 번째','여덟 번째','아홉 번째','열 번째','열한 번째','열두 번째'
];

const state = {
  totalPlayers: 5,
  ripleyCount: 4,
  citizenCount: 1,
  players: [],
  roles: [],
  pairIndex: null,
  ripleyWord: '',
  citizenWord: '',
  revealIndex: 0,
  speakerIndex: 0,
  confessionIndex: 0,
  confessionAnswers: [],
  votes: [],
  currentVoter: 0,
  phase: 'menu',
  result: null,
  secretTimer: null
};

function esc(str) {
  return String(str).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function ordinal(index) {
  return ORDINALS[index] || `${index + 1}번째`;
}

function playerLabel(index) {
  return `${ordinal(index)} 플레이어`;
}

function makePlayers(count) {
  return Array.from({length: count}, (_, i) => playerLabel(i));
}

function render(html, phase = state.phase) {
  if (state.secretTimer) {
    clearTimeout(state.secretTimer);
    state.secretTimer = null;
  }
  state.phase = phase;
  document.body.dataset.phase = phase;
  screen.innerHTML = `<section class="page">${html}</section>`;
  homeBtn.classList.toggle('hidden', phase === 'menu');
  window.scrollTo(0, 0);
}

function toast(message) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1900);
}

function showModal(title, body, actions) {
  modalTitle.textContent = title;
  modalBody.innerHTML = body;
  modalActions.innerHTML = '';
  actions.forEach(action => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `btn ${action.className || ''}`.trim();
    btn.textContent = action.label;
    btn.addEventListener('click', () => {
      if (action.close !== false) hideModal();
      if (action.onClick) action.onClick();
    });
    modalActions.appendChild(btn);
  });
  modal.classList.remove('hidden');
}

function hideModal() {
  modal.classList.add('hidden');
}

function getUsedPairs() {
  try {
    const parsed = JSON.parse(localStorage.getItem('ripley-used-pairs') || '[]');
    return Array.isArray(parsed) ? parsed.filter(Number.isInteger) : [];
  } catch {
    return [];
  }
}

function choosePairIndex() {
  let used = getUsedPairs();
  if (used.length >= WORD_PAIRS.length) used = [];
  const usedSet = new Set(used);
  const available = WORD_PAIRS.map((_, i) => i).filter(i => !usedSet.has(i));
  const picked = available[Math.floor(Math.random() * available.length)];
  used.push(picked);
  try {
    localStorage.setItem('ripley-used-pairs', JSON.stringify(used));
  } catch {}
  return picked;
}

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function validateConfig(total, ripley, citizen) {
  if (![total, ripley, citizen].every(Number.isInteger)) return '인원수는 정수로 입력해 주세요.';
  if (total < 3 || total > 12) return '총 인원은 3명부터 12명까지 가능합니다.';
  if (ripley < 1 || citizen < 1) return '리플리와 시민은 각각 최소 1명이어야 합니다.';
  if (ripley + citizen !== total) return '리플리 수와 시민 수의 합이 총 인원과 같아야 합니다.';
  if (ripley <= citizen) return '이 게임에서는 리플리가 다수여야 합니다. 리플리 수를 시민 수보다 많게 설정해 주세요.';
  return '';
}

function prepareRound() {
  state.players = makePlayers(state.totalPlayers);
  state.pairIndex = choosePairIndex();
  const pair = WORD_PAIRS[state.pairIndex];
  const flip = Math.random() < 0.5;
  state.ripleyWord = pair[flip ? 1 : 0];
  state.citizenWord = pair[flip ? 0 : 1];
  state.roles = shuffle([
    ...Array(state.ripleyCount).fill('ripley'),
    ...Array(state.citizenCount).fill('citizen')
  ]);
  state.revealIndex = 0;
  state.speakerIndex = 0;
  state.confessionIndex = 0;
  state.confessionAnswers = [];
  state.votes = [];
  state.currentVoter = 0;
  state.result = null;
}

function playerWord(index) {
  return state.roles[index] === 'citizen' ? state.citizenWord : state.ripleyWord;
}

function citizenIndices() {
  return state.roles.map((role, i) => role === 'citizen' ? i : -1).filter(i => i >= 0);
}

function majorityThreshold() {
  return Math.floor(state.totalPlayers / 2) + 1;
}

function showMenu() {
  render(`
    <div class="hero">
      <span class="eyebrow">1 PHONE · HIDDEN IDENTITY · SOCIAL DEDUCTION</span>
      <div class="logo">R<span class="i">I</span>PLEY</div>
      <p class="tagline">남을 의심하기 전에, 먼저 자신을 의심하게 되는 라이어 게임.<br>인원과 역할 수를 정한 뒤 한 대의 스마트폰을 넘겨가며 플레이합니다.</p>
    </div>
    <div class="game-grid">
      <button class="game-card" id="citizenGame" type="button">
        <div class="game-kicker">GAME 01 · PLAYABLE</div>
        <div class="game-title">리플리 – 시민을 속여라</div>
        <div class="game-desc">다수의 리플리와 소수의 시민이 서로 비슷한 단어를 받습니다. 누구도 자신의 역할을 미리 알 수 없습니다.</div>
      </button>
      <button class="game-card" type="button" disabled>
        <div class="game-kicker">GAME 02</div>
        <div class="game-title">리플리 – 인생 조작단</div>
        <div class="game-desc">두 번째 리플리 게임. 새로운 심리전 규칙으로 확장될 예정입니다.</div>
        <span class="badge-dev">개발 예정</span>
      </button>
    </div>
  `, 'menu');
  document.getElementById('citizenGame').addEventListener('click', showIntro);
}

function showIntro() {
  render(`
    <div class="panel">
      <span class="eyebrow">리플리 – 시민을 속여라</span>
      <h1 class="page-title" style="margin-top:14px">나는 정말<br>다수일까?</h1>
      <p class="page-sub">각 플레이어는 자기 단어만 확인합니다. <b style="color:#fff">역할은 절대 표시되지 않습니다.</b> 모두 한 번씩 설명한 뒤에만 자수 단계가 시작됩니다.</p>
      <div class="rule-list">
        <div class="rule"><div class="rule-num">1</div><div><b>인원 설정</b><span>총 인원, 리플리 수, 시민 수를 정합니다. 리플리는 반드시 다수여야 합니다.</span></div></div>
        <div class="rule"><div class="rule-num">2</div><div><b>비밀 단어 확인</b><span>첫 번째 플레이어부터 차례로 휴대폰을 넘겨 자기 단어만 확인합니다.</span></div></div>
        <div class="rule"><div class="rule-num">3</div><div><b>전원 1회 발언</b><span>모든 사람이 한 번씩 설명합니다. 발언 중에는 자수할 수 없습니다.</span></div></div>
        <div class="rule"><div class="rule-num">4</div><div><b>개인 자수 확인</b><span>다시 휴대폰을 돌리며 전원이 비밀리에 “예 / 아니요”를 선택합니다. 여러 명이 동시에 자수할 수 있습니다.</span></div></div>
        <div class="rule"><div class="rule-num">5</div><div><b>자수 판정 또는 비밀 투표</b><span>한 명이라도 자수하면 전원의 선택을 끝까지 받은 뒤 자수 결과를 발표합니다. 아무도 자수하지 않았을 때만 비밀 투표를 진행합니다.</span></div></div>
      </div>
      <div class="btn-row">
        <button id="setupBtn" class="btn btn-primary" type="button">인원 설정하기</button>
      </div>
    </div>
  `, 'intro');
  document.getElementById('setupBtn').addEventListener('click', showSetup);
}

function showSetup() {
  render(`
    <div class="panel">
      <span class="eyebrow">GAME SETUP</span>
      <h1 class="page-title" style="margin-top:14px">인원과 역할 설정</h1>
      <p class="page-sub">이름은 사용하지 않습니다. 게임에서는 첫 번째, 두 번째, 세 번째 플레이어처럼 순서로만 구분합니다.</p>

      <div class="role-config">
        <div class="count-control">
          <span class="count-label">총 인원</span>
          <div class="count-stepper">
            <button class="step-btn" type="button" data-step="totalPlayers" data-dir="-1" aria-label="총 인원 줄이기">−</button>
            <input id="totalPlayers" class="number-input" type="number" min="3" max="12" inputmode="numeric" value="${state.totalPlayers}" aria-label="총 인원" />
            <button class="step-btn" type="button" data-step="totalPlayers" data-dir="1" aria-label="총 인원 늘리기">+</button>
          </div>
          <small>3~12명</small>
        </div>
        <div class="count-control ripley-box">
          <span class="count-label">리플리</span>
          <div class="count-stepper">
            <button class="step-btn" type="button" data-step="ripleyCount" data-dir="-1" aria-label="리플리 줄이기">−</button>
            <input id="ripleyCount" class="number-input" type="number" min="1" max="11" inputmode="numeric" value="${state.ripleyCount}" aria-label="리플리 수" />
            <button class="step-btn" type="button" data-step="ripleyCount" data-dir="1" aria-label="리플리 늘리기">+</button>
          </div>
          <small>다수 단어</small>
        </div>
        <div class="count-control citizen-box">
          <span class="count-label">시민</span>
          <div class="count-stepper">
            <button class="step-btn" type="button" data-step="citizenCount" data-dir="-1" aria-label="시민 줄이기">−</button>
            <input id="citizenCount" class="number-input" type="number" min="1" max="5" inputmode="numeric" value="${state.citizenCount}" aria-label="시민 수" />
            <button class="step-btn" type="button" data-step="citizenCount" data-dir="1" aria-label="시민 늘리기">+</button>
          </div>
          <small>소수 단어</small>
        </div>
      </div>

      <div id="setupSummary" class="setup-summary"></div>
      <div id="setupError" class="setup-error hidden"></div>

      <div class="btn-row">
        <button id="startRoundBtn" class="btn btn-primary" type="button">게임 시작</button>
      </div>
      <div class="mini-note">총 100개 단어 조합 중 한 세트가 무작위 선택됩니다. 같은 기기에서는 100개를 모두 보기 전까지 가능한 한 중복되지 않습니다.</div>
    </div>
  `, 'setup');

  const totalEl = document.getElementById('totalPlayers');
  const ripleyEl = document.getElementById('ripleyCount');
  const citizenEl = document.getElementById('citizenCount');
  const startBtn = document.getElementById('startRoundBtn');
  const errorEl = document.getElementById('setupError');
  const summaryEl = document.getElementById('setupSummary');

  function refreshSetup(changed) {
    let total = Number(totalEl.value);
    let ripley = Number(ripleyEl.value);
    let citizen = Number(citizenEl.value);

    if (changed === 'total' && Number.isInteger(total) && total >= 3 && total <= 12) {
      citizen = Math.max(1, Math.min(citizen || 1, Math.floor((total - 1) / 2)));
      ripley = total - citizen;
      ripleyEl.value = ripley;
      citizenEl.value = citizen;
    }

    const error = validateConfig(total, ripley, citizen);
    startBtn.disabled = Boolean(error);
    errorEl.classList.toggle('hidden', !error);
    errorEl.textContent = error;

    if (!error) {
      summaryEl.innerHTML = `<b>${total}인 게임</b><span>리플리 ${ripley}명 · 시민 ${citizen}명 · 투표 과반 기준 ${Math.floor(total / 2) + 1}표</span>`;
    } else {
      summaryEl.innerHTML = `<b>설정을 확인해 주세요</b><span>리플리 수 + 시민 수 = 총 인원이어야 합니다.</span>`;
    }
  }

  document.querySelectorAll('[data-step]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.step;
      const input = document.getElementById(id);
      const min = Number(input.min || 0);
      const max = Number(input.max || 99);
      const dir = Number(btn.dataset.dir);
      const next = Math.max(min, Math.min(max, Number(input.value || min) + dir));
      input.value = next;
      refreshSetup(id === 'totalPlayers' ? 'total' : id === 'ripleyCount' ? 'ripley' : 'citizen');
    });
  });

  totalEl.addEventListener('input', () => refreshSetup('total'));
  ripleyEl.addEventListener('input', () => refreshSetup('ripley'));
  citizenEl.addEventListener('input', () => refreshSetup('citizen'));
  refreshSetup();

  startBtn.addEventListener('click', () => {
    const total = Number(totalEl.value);
    const ripley = Number(ripleyEl.value);
    const citizen = Number(citizenEl.value);
    const error = validateConfig(total, ripley, citizen);
    if (error) {
      toast(error);
      return;
    }
    state.totalPlayers = total;
    state.ripleyCount = ripley;
    state.citizenCount = citizen;
    prepareRound();
    showHandoff();
  });
}

function showHandoff() {
  const i = state.revealIndex;
  render(`
    <div class="panel handoff">
      <span class="player-chip">단어 확인 ${i + 1} / ${state.totalPlayers}</span>
      <div class="big-player">${esc(state.players[i])}</div>
      <p class="handoff-note">이 플레이어에게만 휴대폰을 넘겨주세요.<br>다른 사람은 화면을 보지 마세요.</p>
      <div class="privacy-card">단어만 표시됩니다. <b>리플리 / 시민 여부는 알려주지 않습니다.</b><br>자신의 단어가 다수인지 소수인지 직접 추리해야 합니다.</div>
      <div class="btn-row">
        <button id="revealBtn" class="btn btn-primary" type="button">내 단어 확인하기</button>
      </div>
    </div>
  `, 'reveal-handoff');
  document.getElementById('revealBtn').addEventListener('click', showSecretWord);
}

function showSecretWord() {
  const i = state.revealIndex;
  render(`
    <div class="panel word-stage">
      <div class="word-label">당신의 단어</div>
      <div class="secret-word">${esc(playerWord(i))}</div>
      <div class="timer-track"><div class="timer-bar"></div></div>
      <p class="page-sub">단어를 기억하세요. 이 화면은 6초 후 자동으로 가려집니다.</p>
      <div class="btn-row">
        <button id="seenBtn" class="btn btn-primary" type="button">확인했습니다</button>
      </div>
    </div>
  `, 'reveal-word');

  let closed = false;
  const finish = () => {
    if (closed) return;
    closed = true;
    state.revealIndex += 1;
    if (state.revealIndex >= state.totalPlayers) showReady();
    else showHandoff();
  };
  document.getElementById('seenBtn').addEventListener('click', finish);
  state.secretTimer = setTimeout(finish, 6000);
}

function showReady() {
  render(`
    <div class="panel handoff">
      <span class="eyebrow">ALL WORDS DELIVERED</span>
      <div class="big-player">모두 확인 완료</div>
      <p class="handoff-note">이제 휴대폰을 테이블 중앙에 놓으세요.<br>모든 플레이어가 한 번씩 설명한 뒤 자수 단계로 넘어갑니다.</p>
      <div class="privacy-card"><b>발언 중에는 자수하지 않습니다.</b><br>${esc(state.players[0])}부터 순서대로 단어를 직접 말하지 않고 특징을 설명하세요.</div>
      <div class="btn-row">
        <button id="beginTalkBtn" class="btn btn-primary" type="button">발언 시작</button>
      </div>
    </div>
  `, 'ready');
  document.getElementById('beginTalkBtn').addEventListener('click', showSpeaker);
}

function showSpeaker() {
  const i = state.speakerIndex;
  const pct = ((i + 1) / state.totalPlayers) * 100;
  render(`
    <div class="panel">
      <div class="progress-wrap">
        <div class="progress-meta"><span>전원 1회 발언</span><span>${i + 1} / ${state.totalPlayers}</span></div>
        <div class="progress"><div style="width:${pct}%"></div></div>
      </div>
      <div class="speaker-box">
        <div class="speaker-index">SPEAKER ${i + 1}</div>
        <div class="speaker-name">${esc(state.players[i])}</div>
        <div class="speaker-help">자신의 단어를 직접 말하지 말고 특징을 설명하세요.<br>다른 사람의 설명도 기억해 두세요.</div>
      </div>
      <div class="btn-row">
        <button id="speechDoneBtn" class="btn btn-primary" type="button">설명을 마쳤습니다</button>
      </div>
    </div>
  `, 'speaker');

  document.getElementById('speechDoneBtn').addEventListener('click', () => {
    if (state.speakerIndex + 1 >= state.totalPlayers) showSpeechComplete();
    else {
      state.speakerIndex += 1;
      showSpeaker();
    }
  });
}

function showSpeechComplete() {
  render(`
    <div class="panel handoff">
      <span class="eyebrow">SPEECH COMPLETE</span>
      <div class="big-player">전원 발언 완료</div>
      <p class="handoff-note">이제 다시 휴대폰을 한 명씩 넘깁니다.<br>각 플레이어는 다른 사람에게 보이지 않게 자수 여부를 선택합니다.</p>
      <div class="privacy-card">여러 명이 자수할 수 있습니다. 누가 <b>“예”</b>를 눌러도 결과는 바로 공개되지 않고 전원의 선택을 끝까지 받습니다.<br><b>벌칙: 자수한 리플리 + 자수하지 않은 시민</b><br>전원이 <b>“아니요”</b>를 선택했을 때만 비밀 투표가 시작됩니다.</div>
      <div class="btn-row">
        <button id="confessionStartBtn" class="btn btn-primary" type="button">자수 확인 시작</button>
      </div>
    </div>
  `, 'speech-complete');
  document.getElementById('confessionStartBtn').addEventListener('click', () => {
    state.confessionIndex = 0;
    state.confessionAnswers = [];
    showConfessionHandoff();
  });
}

function showConfessionHandoff() {
  const i = state.confessionIndex;
  render(`
    <div class="panel handoff">
      <span class="player-chip">자수 확인 ${i + 1} / ${state.totalPlayers}</span>
      <div class="big-player">${esc(state.players[i])}</div>
      <p class="handoff-note">이 플레이어에게 휴대폰을 넘겨주세요.<br>다른 사람은 화면을 보지 마세요.</p>
      <div class="vote-status">${Array.from({length: state.totalPlayers}, (_, d) => `<span class="vote-dot ${d < i ? 'done' : ''}"></span>`).join('')}</div>
      <div class="btn-row">
        <button id="openConfessionBtn" class="btn btn-primary" type="button">자수 여부 선택하기</button>
      </div>
    </div>
  `, 'confession-handoff');
  document.getElementById('openConfessionBtn').addEventListener('click', showPrivateConfession);
}

function showPrivateConfession() {
  const i = state.confessionIndex;
  render(`
    <div class="panel vote-private">
      <span class="eyebrow">PRIVATE CONFESSION · ${i + 1}/${state.totalPlayers}</span>
      <h1 class="page-title" style="margin-top:14px">자수하시겠습니까?</h1>
      <p class="page-sub">내 단어가 소수의 시민 단어라고 확신한다면 <b style="color:#fff">예</b>를 선택하세요.<br>선택은 다른 플레이어에게 보이지 않습니다.</p>
      <div class="decision-grid">
        <button id="confessYesBtn" class="btn decision-yes" type="button">예<small>내가 시민이라고 자수</small></button>
        <button id="confessNoBtn" class="btn decision-no" type="button">아니요<small>자수하지 않음</small></button>
      </div>
    </div>
  `, 'confession-private');

  document.getElementById('confessYesBtn').addEventListener('click', () => recordConfession(i, true));
  document.getElementById('confessNoBtn').addEventListener('click', () => recordConfession(i, false));
}

function showConfessionCover() {
  render(`
    <div class="panel handoff">
      <span class="player-chip">선택 저장 완료</span>
      <div class="big-player">선택이 가려졌습니다</div>
      <p class="handoff-note">다음 플레이어에게 휴대폰을 넘겨주세요.</p>
      <div class="btn-row">
        <button id="nextConfessionBtn" class="btn btn-primary" type="button">다음 플레이어</button>
      </div>
    </div>
  `, 'confession-cover');
  document.getElementById('nextConfessionBtn').addEventListener('click', showConfessionHandoff);
}

function recordConfession(idx, answer) {
  state.confessionAnswers[idx] = answer;
  state.confessionIndex += 1;

  if (state.confessionIndex >= state.totalPlayers) {
    resolveConfessionRound();
  } else {
    showConfessionCover();
  }
}

function resolveConfessionRound() {
  const confessed = state.confessionAnswers
    .map((answer, i) => answer ? i : -1)
    .filter(i => i >= 0);

  if (confessed.length === 0) {
    showVotingIntro();
    return;
  }

  const confessedCitizens = confessed.filter(i => state.roles[i] === 'citizen');
  const confessedRipleys = confessed.filter(i => state.roles[i] === 'ripley');
  const nonConfessedCitizens = citizenIndices().filter(i => !state.confessionAnswers[i]);
  const penaltyIndices = [...confessedRipleys, ...nonConfessedCitizens].sort((a, b) => a - b);

  state.result = {
    type: 'confession-result',
    confessed,
    confessedCitizens,
    confessedRipleys,
    nonConfessedCitizens,
    penaltyIndices
  };
  showResultReady('모든 자수 선택이 완료되었습니다');
}

function showVotingIntro() {
  render(`
    <div class="panel handoff">
      <span class="eyebrow">NO CONFESSION</span>
      <div class="big-player">아무도 자수하지 않았습니다</div>
      <p class="handoff-note">비밀 투표를 시작합니다. 다시 첫 번째 플레이어부터 휴대폰을 넘겨 한 명씩 시민 의심자를 선택합니다.</p>
      <div class="privacy-card">각 플레이어는 <b>시민이라고 생각하는 사람 한 명</b>에게 투표합니다.<br>실제 시민에게 간 표가 전체 투표의 과반수 이상이면 리플리 진영이 승리합니다.</div>
      <div class="btn-row">
        <button id="startVoteBtn" class="btn btn-primary" type="button">비밀 투표 개시</button>
      </div>
    </div>
  `, 'vote-intro');
  document.getElementById('startVoteBtn').addEventListener('click', startVoting);
}

function startVoting() {
  state.currentVoter = 0;
  state.votes = [];
  showVoteHandoff();
}

function showVoteHandoff() {
  const i = state.currentVoter;
  render(`
    <div class="panel handoff">
      <span class="player-chip">비밀 투표 ${i + 1} / ${state.totalPlayers}</span>
      <div class="big-player">${esc(state.players[i])}</div>
      <p class="handoff-note">이 플레이어에게 휴대폰을 넘겨주세요.<br>다른 사람은 화면을 보지 마세요.</p>
      <div class="vote-status">${Array.from({length: state.totalPlayers}, (_, d) => `<span class="vote-dot ${d < i ? 'done' : ''}"></span>`).join('')}</div>
      <div class="btn-row">
        <button id="voteOpenBtn" class="btn btn-primary" type="button">시민 의심자 선택</button>
      </div>
    </div>
  `, 'vote-handoff');
  document.getElementById('voteOpenBtn').addEventListener('click', showVoteChoices);
}

function showVoteChoices() {
  const voter = state.currentVoter;
  render(`
    <div class="panel vote-private">
      <span class="eyebrow">SECRET VOTE · ${voter + 1}/${state.totalPlayers}</span>
      <h1 class="page-title" style="margin-top:14px">누가 시민 같나요?</h1>
      <p class="page-sub">한 명만 선택하세요. 선택 내용은 바로 가려집니다.</p>
      <div class="vote-grid dynamic-vote-grid">
        ${state.players.map((p, i) => `<button class="person-btn" data-vote="${i}" type="button">${esc(p)}<small>${i === voter ? '본인 선택 가능' : '시민으로 지목'}</small></button>`).join('')}
      </div>
    </div>
  `, 'vote-choice');

  document.querySelectorAll('[data-vote]').forEach(btn => btn.addEventListener('click', () => {
    const target = Number(btn.dataset.vote);
    state.votes[voter] = target;
    state.currentVoter += 1;
    if (state.currentVoter >= state.totalPlayers) resolveVote();
    else showVoteCover();
  }));
}

function showVoteCover() {
  render(`
    <div class="panel handoff">
      <span class="player-chip">투표 저장 완료</span>
      <div class="big-player">선택이 가려졌습니다</div>
      <p class="handoff-note">다음 플레이어에게 휴대폰을 넘겨주세요.</p>
      <div class="btn-row">
        <button id="nextVoterBtn" class="btn btn-primary" type="button">다음 투표자</button>
      </div>
    </div>
  `, 'vote-cover');
  document.getElementById('nextVoterBtn').addEventListener('click', showVoteHandoff);
}

function resolveVote() {
  const citizenSet = new Set(citizenIndices());
  const citizenTargetVotes = state.votes.filter(v => citizenSet.has(v)).length;
  const threshold = majorityThreshold();
  state.result = {
    type: citizenTargetVotes >= threshold ? 'ripley-vote-win' : 'citizen-vote-win',
    citizenTargetVotes,
    threshold
  };
  showResultReady('모든 비밀 투표가 완료되었습니다');
}


function showResultReady(message) {
  render(`
    <div class="panel handoff">
      <span class="eyebrow">RESULT READY</span>
      <div class="big-player">${esc(message)}</div>
      <p class="handoff-note">휴대폰을 테이블 중앙에 놓아 모두가 화면을 볼 수 있게 해주세요.<br>아직 정답과 역할은 공개되지 않았습니다.</p>
      <div class="btn-row">
        <button id="revealResultBtn" class="btn btn-primary" type="button">결과 발표</button>
      </div>
    </div>
  `, 'result-ready');
  document.getElementById('revealResultBtn').addEventListener('click', showResult);
}

function voteCounts() {
  return state.players.map((_, i) => state.votes.filter(v => v === i).length);
}

function roleName(index) {
  return state.roles[index] === 'citizen' ? '시민' : '리플리';
}

function penaltyIndicesForResult(r) {
  if (r.type === 'confession-result') return [...r.penaltyIndices];
  if (r.type === 'ripley-vote-win') return citizenIndices();
  if (r.type === 'citizen-vote-win') {
    return state.roles.map((role, i) => role === 'ripley' ? i : -1).filter(i => i >= 0);
  }
  return [];
}

function penaltyReason(index, r) {
  if (r.type === 'confession-result') {
    if (state.roles[index] === 'ripley' && state.confessionAnswers[index]) return '잘못 자수한 리플리';
    if (state.roles[index] === 'citizen' && !state.confessionAnswers[index]) return '자수하지 않은 시민';
  }
  if (r.type === 'ripley-vote-win') return '투표에서 검거된 시민';
  if (r.type === 'citizen-vote-win') return '시민을 잡지 못한 리플리';
  return '';
}

function showResult() {
  const r = state.result;
  let icon = '◉';
  let title = '';
  let desc = '';

  if (r.type === 'confession-result') {
    icon = r.confessedCitizens.length > 0 ? '✦' : '×';
    title = r.confessedCitizens.length > 0 ? '자수 판정 완료' : '시민은 자수하지 못했습니다';

    const successText = r.confessedCitizens.length > 0
      ? `시민 ${r.confessedCitizens.length}명이 자신의 정체를 정확히 알아차리고 자수했습니다.`
      : '자수한 사람 중 시민은 없었습니다.';
    const falseText = r.confessedRipleys.length > 0
      ? ` 리플리 ${r.confessedRipleys.length}명은 시민이라고 착각해 잘못 자수했습니다.`
      : '';
    const missedText = r.nonConfessedCitizens.length > 0
      ? ` 자수하지 않은 시민 ${r.nonConfessedCitizens.length}명도 정체를 알아차리지 못했습니다.`
      : '';
    desc = successText + falseText + missedText;
  } else if (r.type === 'ripley-vote-win') {
    icon = '◎';
    title = '리플리 승리';
    desc = `실제 시민에게 간 표가 ${r.citizenTargetVotes}표로 과반 기준 ${r.threshold}표를 넘겼습니다.`;
  } else {
    icon = '✦';
    title = '시민 승리';
    desc = `실제 시민에게 간 표는 ${r.citizenTargetVotes}표였습니다. 과반 기준 ${r.threshold}표에 미치지 못했습니다.`;
  }

  const penaltyIndices = penaltyIndicesForResult(r);
  const penaltySet = new Set(penaltyIndices);
  const counts = state.votes.length === state.totalPlayers ? voteCounts() : null;

  const penaltyHero = penaltyIndices.length > 0 ? `
    <section class="penalty-hero" aria-label="이번 판 벌칙 대상">
      <div class="penalty-hero-top"><span class="penalty-siren">🚨</span><span>이번 판 벌칙 대상</span></div>
      <div class="penalty-count"><strong>${penaltyIndices.length}</strong><span>명</span></div>
      <div class="penalty-names">
        ${penaltyIndices.map(i => `<div class="penalty-person"><span>${esc(state.players[i])}</span><b>벌칙</b><small>${esc(penaltyReason(i, r))}</small></div>`).join('')}
      </div>
      <div class="penalty-callout">위 플레이어가 벌칙을 받습니다.</div>
    </section>` : `
    <section class="penalty-hero is-safe" aria-label="벌칙 대상 없음">
      <div class="penalty-hero-top"><span class="penalty-siren">✓</span><span>이번 판 벌칙 대상</span></div>
      <div class="penalty-none">없음</div>
      <div class="penalty-callout">이번 판에는 벌칙을 받을 사람이 없습니다.</div>
    </section>`;

  render(`
    <div class="panel result">
      <div class="result-icon">${icon}</div>
      <h1>${title}</h1>
      <p class="result-desc">${desc}</p>

      ${penaltyHero}

      <div class="result-section-title">정답 공개</div>
      <div class="reveal-grid">
        <div class="reveal-card">
          <div class="label">리플리 ${state.ripleyCount}명의 단어</div>
          <div class="word">${esc(state.ripleyWord)}</div>
        </div>
        <div class="reveal-card citizen">
          <div class="label">시민 ${state.citizenCount}명의 단어</div>
          <div class="word">${esc(state.citizenWord)}</div>
        </div>
      </div>

      <div class="result-section-title">플레이어 판정</div>
      <div class="role-reveal player-outcomes">
        ${state.players.map((p, i) => {
          const penalized = penaltySet.has(i);
          return `<div class="role-row outcome-row ${state.roles[i] === 'citizen' ? 'is-citizen' : ''} ${penalized ? 'is-penalty' : 'is-safe'}">
            <div class="outcome-main">
              <span class="outcome-name">${esc(p)}</span>
              <span class="outcome-role">${roleName(i)}${r.type === 'confession-result' ? ` · ${state.confessionAnswers[i] ? '자수함' : '자수 안 함'}` : ''}</span>
            </div>
            <div class="outcome-badge ${penalized ? 'penalty-badge' : 'safe-badge'}">${penalized ? '🚨 벌칙' : '✓ 생존'}</div>
          </div>`;
        }).join('')}
      </div>

      ${counts ? `
        <div class="vote-tally">
          <div class="tally-heading">최종 투표 결과</div>
          ${counts.map((c, i) => `<div class="tally-row ${penaltySet.has(i) ? 'is-penalty-tally' : ''}"><span>${esc(state.players[i])} · ${roleName(i)}</span><b>${c}표</b></div>`).join('')}
        </div>` : ''}

      <div class="btn-row two">
        <button id="againBtn" class="btn btn-primary" type="button">같은 설정으로 한 판 더</button>
        <button id="setupAgainBtn" class="btn" type="button">인원 다시 설정</button>
      </div>
      <div class="btn-row compact-row">
        <button id="menuBtn" class="btn btn-ghost" type="button">게임 선택으로</button>
      </div>
      <div class="mini-note">사용된 단어 조합 ${state.pairIndex + 1}/100 · 다음 판에는 가능한 한 다른 조합이 나옵니다.</div>
    </div>
  `, 'result');

  document.getElementById('againBtn').addEventListener('click', () => {
    prepareRound();
    showHandoff();
  });
  document.getElementById('setupAgainBtn').addEventListener('click', showSetup);
  document.getElementById('menuBtn').addEventListener('click', showMenu);
}

function fullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || null;
}

function syncFullscreenUI() {
  const active = Boolean(fullscreenElement());
  document.documentElement.classList.toggle('is-fullscreen', active);
  fullscreenBtn.setAttribute('aria-label', active ? '전체 화면 종료' : '전체 화면');
  fullscreenBtn.setAttribute('title', active ? '전체 화면 종료' : '전체 화면');
}

async function toggleFullscreen() {
  try {
    if (!fullscreenElement()) {
      const request = document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen;
      if (request) {
        await request.call(document.documentElement);
      } else {
        toast('이 모바일 브라우저에서는 전체 화면 전환을 지원하지 않습니다.');
      }
    } else {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) await exit.call(document);
    }
  } catch {
    toast('브라우저 설정 때문에 전체 화면을 열 수 없습니다.');
  }
  syncFullscreenUI();
}

fullscreenBtn.addEventListener('click', toggleFullscreen);
document.addEventListener('fullscreenchange', syncFullscreenUI);
document.addEventListener('webkitfullscreenchange', syncFullscreenUI);
homeBtn.addEventListener('click', () => {
  showModal('게임을 종료할까요?', '현재 진행 중인 판의 정보는 사라지고 처음 화면으로 돌아갑니다.', [
    {label:'계속하기', className:'btn-ghost'},
    {label:'처음 화면으로', className:'btn-danger', onClick:showMenu}
  ]);
});
modal.addEventListener('click', e => {
  if (e.target === modal) hideModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) hideModal();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.phase === 'reveal-word') {
    toast('단어 화면이 열려 있었습니다. 다른 사람에게 보이지 않게 주의하세요.');
  }
});

showMenu();
