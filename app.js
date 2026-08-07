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


const LIFE_PROMPTS = [
  '마라톤','번지점프','소개팅','해외여행','고백','이별','면접','아르바이트','지각','결석',
  '전학','자취','이사','캠핑','등산','낚시','수영','스키','스노보드','서핑',
  '스쿠버다이빙','스노클링','래프팅','카약','패러글라이딩','스카이다이빙','롤러코스터','워터파크','콘서트','페스티벌',
  '클럽','노래방','방탈출','귀신의집','찜질방','PC방','밤샘','해돋이','기차여행','배낭여행',
  '제주여행','유럽여행','혼자여행','운전','주차','렌터카','막차','첫차','택시','비행기',
  '호캉스','게스트하우스','펜션','놀이공원','야시장','축제','수능','토익','시험','발표',
  '팀플','공모전','대회','장학금','첫월급','퇴사','야근','회식','연애','짝사랑',
  '장거리연애','재회','결혼식','축가','헌팅','미팅','소개팅앱','데이트','술게임','숙취',
  '만취','금주','요리','베이킹','다이어트','헬스','PT','러닝','문신','피어싱',
  '탈색','염색','셀프커트','중고거래','환불','오디션','팬미팅','사인회','브이로그','라이브방송'
];

if (LIFE_PROMPTS.length !== 100) {
  throw new Error(`인생 조작단 제시어는 100개여야 합니다. 현재: ${LIFE_PROMPTS.length}`);
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
  wordGuess: '',
  secretTimer: null
};


const lifeState = {
  totalPlayers: 5,
  players: [],
  roles: [],
  promptIndex: null,
  prompt: '',
  revealIndex: 0,
  speakerIndex: 0,
  votes: [],
  currentVoter: 0,
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
  state.wordGuess = '';
}

function playerWord(index) {
  return state.roles[index] === 'citizen' ? state.citizenWord : state.ripleyWord;
}

function citizenIndices() {
  return state.roles.map((role, i) => role === 'citizen' ? i : -1).filter(i => i >= 0);
}

function ripleyIndices() {
  return state.roles.map((role, i) => role === 'ripley' ? i : -1).filter(i => i >= 0);
}

function majorityThreshold() {
  return Math.floor(state.totalPlayers / 2) + 1;
}

function normalizeWord(value) {
  return String(value || '').trim().replace(/\s+/g, '').toLowerCase();
}

function showMenu() {
  render(`
    <div class="hero hero-minimal">
      <span class="eyebrow">1 PHONE · SOCIAL DEDUCTION</span>
      <div class="logo">R<span class="i">I</span>PLEY</div>
      <p class="tagline">같은 단어인가, 나만 다른가.</p>
    </div>
    <div class="game-grid game-grid-minimal">
      <button class="game-card game-card-play" id="citizenGame" type="button">
        <div class="game-kicker">GAME 01</div>
        <div class="game-title">리플리 – 시민을 속여라</div>
        <span class="card-action">플레이</span>
      </button>
      <button class="game-card game-card-play" id="lifeGame" type="button">
        <div class="game-kicker">GAME 02</div>
        <div class="game-title">리플리 – 인생 조작단</div>
        <span class="card-action">플레이</span>
      </button>
    </div>
  `, 'menu');
  document.getElementById('citizenGame').addEventListener('click', showIntro);
  document.getElementById('lifeGame').addEventListener('click', showLifeIntro);
}

function showIntro() {
  render(`
    <div class="panel compact-panel intro-panel minimal-panel">
      <span class="eyebrow">리플리 – 시민을 속여라</span>
      <h1 class="page-title">승리 조건</h1>

      <div class="win-condition-grid simple-win-grid">
        <div class="win-card ripley-win-card">
          <span class="win-role">리플리</span>
          <b>시민을 찾고, 단어를 숨겨라</b>
        </div>
        <div class="win-card citizen-win-card">
          <span class="win-role">시민</span>
          <b>숨거나, 잡혀도 단어를 맞혀라</b>
        </div>
      </div>

      <div class="flow-strip" aria-label="게임 진행 순서">
        <span><b>1</b>단어</span><i>›</i><span><b>2</b>발언·압박</span><i>›</i><span><b>3</b>자수</span><i>›</i><span><b>4</b>투표·역전</span>
      </div>
      <div class="micro-rule"><b>거짓말 가능</b> · 시민이 잡히면 리플리 단어 추리</div>

      <div class="btn-row action-row">
        <button id="setupBtn" class="btn btn-primary" type="button">게임 설정</button>
      </div>
    </div>
  `, 'intro');
  document.getElementById('setupBtn').addEventListener('click', showSetup);
}

function showSetup() {
  render(`
    <div class="panel minimal-panel">
      <span class="eyebrow">GAME SETUP</span>
      <h1 class="page-title">인원 설정</h1>

      <div class="role-config">
        <label class="count-control">
          <span class="count-label">총 인원</span>
          <input id="totalPlayers" class="number-input" type="number" min="3" max="12" inputmode="numeric" value="${state.totalPlayers}" />
        </label>
        <label class="count-control ripley-box">
          <span class="count-label">리플리</span>
          <input id="ripleyCount" class="number-input" type="number" min="1" max="11" inputmode="numeric" value="${state.ripleyCount}" />
        </label>
        <label class="count-control citizen-box">
          <span class="count-label">시민</span>
          <input id="citizenCount" class="number-input" type="number" min="1" max="5" inputmode="numeric" value="${state.citizenCount}" />
        </label>
      </div>

      <div id="setupSummary" class="setup-summary"></div>
      <div id="setupError" class="setup-error hidden"></div>

      <div class="btn-row">
        <button id="startRoundBtn" class="btn btn-primary" type="button">게임 시작</button>
      </div>
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

    summaryEl.innerHTML = !error
      ? `<b>${total}명</b><span>리플리 ${ripley} · 시민 ${citizen}</span>`
      : `<b>설정을 확인하세요</b>`;
  }

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
    <div class="panel handoff minimal-panel">
      <span class="player-chip">단어 ${i + 1} / ${state.totalPlayers}</span>
      <div class="big-player">${esc(state.players[i])}</div>
      <p class="handoff-note">휴대폰을 넘겨주세요.</p>
      <div class="btn-row">
        <button id="revealBtn" class="btn btn-primary" type="button">단어 확인</button>
      </div>
    </div>
  `, 'reveal-handoff');
  document.getElementById('revealBtn').addEventListener('click', showSecretWord);
}

function showSecretWord() {
  const i = state.revealIndex;
  render(`
    <div class="panel word-stage minimal-panel">
      <div class="word-label">당신의 단어</div>
      <div class="secret-word">${esc(playerWord(i))}</div>
      <div class="timer-track"><div class="timer-bar"></div></div>
      <p class="micro-copy">6초 후 자동으로 가려집니다.</p>
      <div class="btn-row">
        <button id="seenBtn" class="btn btn-primary" type="button">확인</button>
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
    <div class="panel handoff minimal-panel">
      <span class="eyebrow">READY</span>
      <div class="big-player">모두 확인 완료</div>
      <p class="handoff-note">첫 번째 플레이어부터 한 번씩 설명하세요.</p>
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
    <div class="panel minimal-panel">
      <div class="progress-wrap">
        <div class="progress-meta"><span>발언</span><span>${i + 1} / ${state.totalPlayers}</span></div>
        <div class="progress"><div style="width:${pct}%"></div></div>
      </div>
      <div class="speaker-box speaker-box-minimal">
        <div class="speaker-name">${esc(state.players[i])}</div>
        <div class="speaker-help">단어를 말하지 말고 설명하세요.</div>
      </div>
      <div class="btn-row">
        <button id="speechDoneBtn" class="btn btn-primary" type="button">다음</button>
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
    <div class="panel handoff minimal-panel">
      <span class="eyebrow">PRESSURE</span>
      <div class="big-player">압박 시간</div>
      <p class="handoff-note">각자 한 명에게 질문 1회.</p>
      <div class="micro-rule rule-pill"><b>답변은 거짓말 가능 · 단어 직접 공개 금지</b></div>
      <div class="btn-row">
        <button id="confessionStartBtn" class="btn btn-primary" type="button">자수 시작</button>
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
    <div class="panel handoff minimal-panel">
      <span class="player-chip">자수 ${i + 1} / ${state.totalPlayers}</span>
      <div class="big-player">${esc(state.players[i])}</div>
      <p class="handoff-note">휴대폰을 넘겨주세요.</p>
      <div class="vote-status">${Array.from({length: state.totalPlayers}, (_, d) => `<span class="vote-dot ${d < i ? 'done' : ''}"></span>`).join('')}</div>
      <div class="btn-row">
        <button id="openConfessionBtn" class="btn btn-primary" type="button">선택</button>
      </div>
    </div>
  `, 'confession-handoff');
  document.getElementById('openConfessionBtn').addEventListener('click', showPrivateConfession);
}

function showPrivateConfession() {
  const i = state.confessionIndex;
  render(`
    <div class="panel vote-private minimal-panel">
      <span class="player-chip">${i + 1} / ${state.totalPlayers}</span>
      <h1 class="page-title decision-title">자수하시겠습니까?</h1>
      <p class="micro-copy">시민이어도 단어를 맞혀야 승리합니다.</p>
      <div class="decision-grid">
        <button id="confessYesBtn" class="btn decision-yes" type="button">예</button>
        <button id="confessNoBtn" class="btn decision-no" type="button">아니요</button>
      </div>
    </div>
  `, 'confession-private');

  document.getElementById('confessYesBtn').addEventListener('click', () => recordConfession(i, true));
  document.getElementById('confessNoBtn').addEventListener('click', () => recordConfession(i, false));
}

function showConfessionCover() {
  render(`
    <div class="panel handoff minimal-panel">
      <span class="player-chip">저장 완료</span>
      <div class="big-player">선택 완료</div>
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
  const citizenOnlySuccess = confessedCitizens.length > 0 && confessedRipleys.length === 0;

  if (citizenOnlySuccess) {
    state.result = {
      type: 'word-guess-pending',
      source: 'confession',
      confessed,
      confessedCitizens,
      confessedRipleys,
      nonConfessedCitizens
    };
    showResultReady('자수 선택 완료');
    return;
  }

  const penaltyIndices = [...confessedRipleys, ...nonConfessedCitizens].sort((a, b) => a - b);
  state.result = {
    type: 'confession-result',
    confessed,
    confessedCitizens,
    confessedRipleys,
    nonConfessedCitizens,
    citizenOnlySuccess: false,
    penaltyIndices
  };
  showResultReady('모든 자수 선택이 완료되었습니다');
}

function showVotingIntro() {
  render(`
    <div class="panel compact-panel handoff minimal-panel">
      <span class="eyebrow">SECRET VOTE</span>
      <div class="big-player">비밀 투표</div>
      <p class="handoff-note">시민이라고 생각하는 사람 한 명을 고르세요.</p>
      <div class="tie-notice">동률 = 시민 승리</div>
      <div class="btn-row action-row">
        <button id="startVoteBtn" class="btn btn-primary" type="button">투표 시작</button>
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
    <div class="panel handoff minimal-panel">
      <span class="player-chip">투표 ${i + 1} / ${state.totalPlayers}</span>
      <div class="big-player">${esc(state.players[i])}</div>
      <p class="handoff-note">휴대폰을 넘겨주세요.</p>
      <div class="vote-status">${Array.from({length: state.totalPlayers}, (_, d) => `<span class="vote-dot ${d < i ? 'done' : ''}"></span>`).join('')}</div>
      <div class="btn-row">
        <button id="voteOpenBtn" class="btn btn-primary" type="button">투표하기</button>
      </div>
    </div>
  `, 'vote-handoff');
  document.getElementById('voteOpenBtn').addEventListener('click', showVoteChoices);
}

function showVoteChoices() {
  const voter = state.currentVoter;
  render(`
    <div class="panel vote-private minimal-panel vote-choice-panel">
      <span class="player-chip">투표 ${voter + 1} / ${state.totalPlayers}</span>
      <h1 class="page-title vote-title">누가 시민 같나요?</h1>
      <div class="vote-grid dynamic-vote-grid">
        ${state.players.map((p, i) => `<button class="person-btn" data-vote="${i}" type="button">${esc(p)}</button>`).join('')}
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
    <div class="panel handoff minimal-panel">
      <span class="player-chip">저장 완료</span>
      <div class="big-player">투표 완료</div>
      <div class="btn-row">
        <button id="nextVoterBtn" class="btn btn-primary" type="button">다음 플레이어</button>
      </div>
    </div>
  `, 'vote-cover');
  document.getElementById('nextVoterBtn').addEventListener('click', showVoteHandoff);
}

function resolveVote() {
  const citizenSet = new Set(citizenIndices());
  const citizenTargetVotes = state.votes.filter(v => citizenSet.has(v)).length;
  const ripleyTargetVotes = state.totalPlayers - citizenTargetVotes;
  const isTie = citizenTargetVotes === ripleyTargetVotes;

  if (citizenTargetVotes > ripleyTargetVotes) {
    state.result = {
      type: 'word-guess-pending',
      source: 'vote',
      citizenTargetVotes,
      ripleyTargetVotes,
      isTie
    };
  } else {
    state.result = {
      type: 'citizen-vote-win',
      citizenTargetVotes,
      ripleyTargetVotes,
      isTie
    };
  }
  showResultReady('모든 비밀 투표가 완료되었습니다');
}

function showResultReady(message) {
  render(`
    <div class="panel handoff minimal-panel">
      <span class="eyebrow">RESULT</span>
      <div class="big-player">결과 준비 완료</div>
      <p class="handoff-note">휴대폰을 중앙에 놓아주세요.</p>
      <div class="btn-row">
        <button id="revealResultBtn" class="btn btn-primary" type="button">결과 확인</button>
      </div>
    </div>
  `, 'result-ready');
  document.getElementById('revealResultBtn').addEventListener('click', playModeOneResultReveal);
}

function playDrumBeat(strong = false) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = playDrumBeat.ctx || (playDrumBeat.ctx = new AudioCtx());
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(strong ? 92 : 78, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(42, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(strong ? 0.34 : 0.22, ctx.currentTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.24);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {}
}

function revealStage(kicker, main, sub = '') {
  render(`
    <div class="panel handoff minimal-panel suspense-panel">
      <span class="eyebrow">${esc(kicker)}</span>
      <div class="suspense-main">${esc(main)}</div>
      ${sub ? `<p class="handoff-note">${esc(sub)}</p>` : ''}
      <div class="suspense-pulse" aria-hidden="true"><i></i><i></i><i></i></div>
    </div>
  `, 'result-reveal');
}

function runCountdown(finalFn) {
  let n = 3;
  const tick = () => {
    revealStage('FINAL', String(n), '');
    playDrumBeat(n === 1);
    if (navigator.vibrate) navigator.vibrate(n === 1 ? 90 : 45);
    n -= 1;
    if (n > 0) setTimeout(tick, 620);
    else setTimeout(finalFn, 760);
  };
  tick();
}

function revealImpact(kicker, main, sub, finalFn, delay = 1150) {
  revealStage(kicker, main, sub);
  playDrumBeat(true);
  if (navigator.vibrate) navigator.vibrate([70, 45, 110]);
  setTimeout(finalFn, delay);
}

function showManualReveal(kicker, main, sub, buttonLabel, onClick) {
  render(`
    <div class="panel handoff minimal-panel suspense-panel">
      <span class="eyebrow">${esc(kicker)}</span>
      <div class="suspense-main">${esc(main)}</div>
      ${sub ? `<p class="handoff-note">${esc(sub)}</p>` : ''}
      <div class="btn-row">
        <button id="manualRevealBtn" class="btn btn-primary" type="button">${esc(buttonLabel)}</button>
      </div>
    </div>
  `, 'manual-reveal');
  document.getElementById('manualRevealBtn').addEventListener('click', onClick);
}

function showModeOneFinalButton(kicker, main, sub = '') {
  showManualReveal(kicker, main, sub, '최종 결과 보기', showResult);
}

function showWordGuess() {
  const r = state.result;
  const citizens = r.source === 'confession' ? r.confessedCitizens : citizenIndices();
  const citizenLabel = citizens.map(i => ordinal(i)).join(' · ');
  render(`
    <div class="panel handoff minimal-panel">
      <span class="eyebrow">LAST CHANCE</span>
      <div class="big-player">시민의 마지막 추리</div>
      <p class="handoff-note">리플리들의 단어를 맞히세요.</p>
      <div class="rule-pill">시민 · <b>${esc(citizenLabel)}</b></div>
      <input id="wordGuessInput" class="word-guess-input" type="text" maxlength="20" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="단어 입력" />
      <div class="btn-row">
        <button id="lockWordGuessBtn" class="btn btn-primary" type="button">추측 확정</button>
      </div>
    </div>
  `, 'word-guess');

  const input = document.getElementById('wordGuessInput');
  const submit = () => {
    const guess = input.value.trim();
    if (!guess) { toast('단어를 입력해 주세요.'); return; }
    state.wordGuess = guess;
    const correct = normalizeWord(guess) === normalizeWord(state.ripleyWord);
    const base = state.result;
    const source = base.source;
    let penaltyIndices;
    if (correct) {
      penaltyIndices = ripleyIndices();
    } else if (source === 'vote') {
      penaltyIndices = citizenIndices();
    } else {
      penaltyIndices = base.confessedCitizens;
    }
    state.result = {
      ...base,
      type: 'word-guess-result',
      guess,
      correct,
      penaltyIndices
    };
    showManualReveal('LOCKED', '추측 잠금 완료', guess, '정답 공개', () => {
      runCountdown(() => {
        showManualReveal(
          correct ? 'CORRECT' : 'WRONG',
          state.ripleyWord,
          correct ? '시민 역전 성공' : '리플리 단어 방어 성공',
          '최종 결과 보기',
          showResult
        );
      });
    });
  };
  document.getElementById('lockWordGuessBtn').addEventListener('click', submit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
  setTimeout(() => input.focus(), 50);
}

function playModeOneResultReveal() {
  const r = state.result;

  if (r.type === 'word-guess-pending') {
    if (r.source === 'vote') {
      showManualReveal(
        'SECRET VOTE',
        `${r.citizenTargetVotes} : ${r.ripleyTargetVotes}`,
        '시민 지목 · 리플리 지목',
        '판정 공개',
        () => runCountdown(() => showManualReveal('CAUGHT', '시민 검거', '하지만 아직 끝나지 않았습니다.', '마지막 추리', showWordGuess))
      );
    } else {
      showManualReveal(
        'CONFESSION',
        `자수 ${r.confessed.length}명`,
        '자수자가 정말 시민일까',
        '판정 공개',
        () => runCountdown(() => showManualReveal('CONFESSION', '시민 자수 성공', '단어를 맞혀야 최종 승리합니다.', '마지막 추리', showWordGuess))
      );
    }
    return;
  }

  if (r.type === 'confession-result') {
    let main = '자수 판정';
    if (r.confessedCitizens.length && r.confessedRipleys.length) main = '양쪽 모두 자수';
    else if (r.confessedRipleys.length) main = '리플리 오자수';
    showManualReveal(
      'CONFESSION',
      `자수 ${r.confessed.length}명`,
      '정체를 확인합니다.',
      '판정 공개',
      () => runCountdown(() => showModeOneFinalButton('CONFESSION', main, `시민 ${r.confessedCitizens.length} · 리플리 ${r.confessedRipleys.length}`))
    );
    return;
  }

  showManualReveal(
    r.isTie ? 'TIE' : 'SECRET VOTE',
    `${r.citizenTargetVotes} : ${r.ripleyTargetVotes}`,
    `시민 지목 · 리플리 지목${r.isTie ? ' · 동률' : ''}`,
    '판정 공개',
    () => runCountdown(() => showModeOneFinalButton(r.isTie ? 'TIE' : 'VOTE RESULT', '시민 승리', r.isTie ? '동률은 시민 승리' : '시민이 살아남았습니다.'))
  );
}

function voteCounts() {
  return state.players.map((_, i) => state.votes.filter(v => v === i).length);
}

function roleName(index) {
  return state.roles[index] === 'citizen' ? '시민' : '리플리';
}

function showResult() {
  const r = state.result;
  const isConfession = r.type === 'confession-result';
  const isWordGuess = r.type === 'word-guess-result';
  const counts = state.votes.length === state.totalPlayers ? voteCounts() : null;

  let title = '';
  let kicker = '';
  let penaltyIndices = [];
  let scoreHtml = '';

  if (isWordGuess) {
    title = r.correct ? '시민 역전 승리' : '리플리 승리';
    kicker = r.correct ? 'WORD STEAL' : 'WORD DEFENSE';
    penaltyIndices = r.penaltyIndices || [];
    scoreHtml = `
      <div class="result-score confession-score">
        <div><span>시민 추측</span><strong class="guess-result-word">${esc(r.guess)}</strong></div>
        <div><span>정답</span><strong class="guess-result-word">${esc(state.ripleyWord)}</strong></div>
      </div>`;
  } else if (isConfession) {
    title = '자수 결과';
    kicker = 'CONFESSION';
    penaltyIndices = r.penaltyIndices;
    scoreHtml = `
      <div class="result-score confession-score">
        <div><span>시민 자수</span><strong>${r.confessedCitizens.length}</strong></div>
        <div><span>리플리 자수</span><strong>${r.confessedRipleys.length}</strong></div>
      </div>`;
  } else {
    title = '시민 승리';
    kicker = r.isTie ? '동률 · 시민 승리' : 'VOTE RESULT';
    penaltyIndices = ripleyIndices();
    scoreHtml = `
      <div class="versus-score">
        <div class="side citizen-side"><span>시민 지목</span><strong>${r.citizenTargetVotes}</strong></div>
        <div class="vs-mark">:</div>
        <div class="side ripley-side"><span>리플리 지목</span><strong>${r.ripleyTargetVotes}</strong></div>
      </div>`;
  }

  const penaltyLabels = penaltyIndices.map(i => ordinal(i));
  const penaltyHtml = penaltyLabels.length
    ? `<div class="penalty-hero"><span class="penalty-kicker">🚨 벌칙 ${penaltyLabels.length}명</span><div class="penalty-names">${penaltyLabels.map(esc).join('<span>·</span>')}</div></div>`
    : `<div class="penalty-hero safe"><span class="penalty-kicker">✓ 벌칙 없음</span><div class="penalty-names">모두 생존</div></div>`;

  let detailRows = '';
  if (isConfession) {
    detailRows = state.players.map((p, i) => {
      const confessed = Boolean(state.confessionAnswers[i]);
      const penalized = penaltyIndices.includes(i);
      return `<div class="detail-row ${penalized ? 'is-penalty' : 'is-safe'}"><span>${esc(p)}</span><small>${roleName(i)} · ${confessed ? '자수' : '미자수'}</small><b>${penalized ? '벌칙' : '생존'}</b></div>`;
    }).join('');
  } else if (counts) {
    detailRows = counts.map((c, i) => {
      const penalized = penaltyIndices.includes(i);
      return `<div class="detail-row ${penalized ? 'is-penalty' : 'is-safe'}"><span>${esc(state.players[i])}</span><small>${roleName(i)}</small><b>${c}표</b></div>`;
    }).join('');
  } else {
    detailRows = state.players.map((p, i) => {
      const penalized = penaltyIndices.includes(i);
      return `<div class="detail-row ${penalized ? 'is-penalty' : 'is-safe'}"><span>${esc(p)}</span><small>${roleName(i)}</small><b>${penalized ? '벌칙' : '생존'}</b></div>`;
    }).join('');
  }

  render(`
    <div class="panel result result-compact result-ultra-compact">
      <div class="result-topline"><span class="result-kicker">${kicker}</span></div>
      <h1>${title}</h1>
      ${scoreHtml}
      ${penaltyHtml}

      <div class="word-reveal-inline">
        <div><span>리플리</span><b>${esc(state.ripleyWord)}</b></div>
        <i>↔</i>
        <div class="citizen-word"><span>시민</span><b>${esc(state.citizenWord)}</b></div>
      </div>

      <details class="result-details">
        <summary>상세 보기</summary>
        <div class="detail-list">${detailRows}</div>
      </details>

      <div class="result-actions">
        <button id="againBtn" class="btn btn-primary" type="button">한 판 더</button>
        <button id="setupAgainBtn" class="btn" type="button">설정</button>
        <button id="menuBtn" class="btn btn-ghost slim-btn" type="button">게임 선택</button>
      </div>
    </div>
  `, 'result');

  document.getElementById('againBtn').addEventListener('click', () => {
    prepareRound();
    showHandoff();
  });
  document.getElementById('setupAgainBtn').addEventListener('click', showSetup);
  document.getElementById('menuBtn').addEventListener('click', showMenu);
}


function getUsedLifePrompts() {
  try {
    const parsed = JSON.parse(localStorage.getItem('ripley-life-used-prompts') || '[]');
    return Array.isArray(parsed) ? parsed.filter(Number.isInteger) : [];
  } catch {
    return [];
  }
}

function chooseLifePromptIndex() {
  let used = getUsedLifePrompts();
  if (used.length >= LIFE_PROMPTS.length) used = [];
  const usedSet = new Set(used);
  const available = LIFE_PROMPTS.map((_, i) => i).filter(i => !usedSet.has(i));
  const picked = available[Math.floor(Math.random() * available.length)];
  used.push(picked);
  try {
    localStorage.setItem('ripley-life-used-prompts', JSON.stringify(used));
  } catch {}
  return picked;
}

function prepareLifeRound() {
  lifeState.players = makePlayers(lifeState.totalPlayers);
  lifeState.promptIndex = chooseLifePromptIndex();
  lifeState.prompt = LIFE_PROMPTS[lifeState.promptIndex];
  lifeState.roles = shuffle([
    'ripley',
    ...Array(lifeState.totalPlayers - 1).fill('citizen')
  ]);
  lifeState.revealIndex = 0;
  lifeState.speakerIndex = 0;
  lifeState.votes = [];
  lifeState.currentVoter = 0;
  lifeState.result = null;
}

function lifeRipleyIndex() {
  return lifeState.roles.indexOf('ripley');
}

function showLifeIntro() {
  render(`
    <div class="panel compact-panel intro-panel minimal-panel">
      <span class="eyebrow">리플리 – 인생 조작단</span>
      <h1 class="page-title">승리 조건</h1>

      <div class="win-condition-grid simple-win-grid">
        <div class="win-card ripley-win-card">
          <span class="win-role">리플리</span>
          <b>끝까지 들키지 않으면 승리</b>
        </div>
        <div class="win-card citizen-win-card">
          <span class="win-role">시민</span>
          <b>리플리를 최다 지목하면 승리</b>
        </div>
      </div>

      <div class="flow-strip" aria-label="게임 진행 순서">
        <span><b>1</b>제시어</span><i>›</i><span><b>2</b>역할</span><i>›</i><span><b>3</b>진술·압박</span><i>›</i><span><b>4</b>투표</span>
      </div>

      <div class="btn-row action-row">
        <button id="lifeSetupBtn" class="btn btn-primary" type="button">게임 설정</button>
      </div>
    </div>
  `, 'life-intro');
  document.getElementById('lifeSetupBtn').addEventListener('click', showLifeSetup);
}

function showLifeSetup() {
  const citizens = Math.max(3, lifeState.totalPlayers - 1);
  render(`
    <div class="panel minimal-panel">
      <span class="eyebrow">GAME SETUP</span>
      <h1 class="page-title">인원 설정</h1>

      <div class="role-config">
        <label class="count-control">
          <span class="count-label">총 인원</span>
          <input id="lifeTotalPlayers" class="number-input" type="number" min="4" max="12" inputmode="numeric" value="${lifeState.totalPlayers}" />
        </label>
        <div class="count-control ripley-box">
          <span class="count-label">리플리</span>
          <div class="number-input" style="display:grid;place-items:center">1</div>
        </div>
        <div class="count-control citizen-box">
          <span class="count-label">시민</span>
          <div id="lifeCitizenCount" class="number-input" style="display:grid;place-items:center">${citizens}</div>
        </div>
      </div>

      <div id="lifeSetupError" class="setup-error hidden"></div>
      <div class="btn-row">
        <button id="lifeStartBtn" class="btn btn-primary" type="button">게임 시작</button>
      </div>
    </div>
  `, 'life-setup');

  const totalEl = document.getElementById('lifeTotalPlayers');
  const citizenEl = document.getElementById('lifeCitizenCount');
  const errorEl = document.getElementById('lifeSetupError');
  const startBtn = document.getElementById('lifeStartBtn');

  function refresh() {
    const total = Number(totalEl.value);
    const error = !Number.isInteger(total) || total < 4 || total > 12 ? '총 인원은 4명부터 12명까지 가능합니다.' : '';
    citizenEl.textContent = Number.isInteger(total) ? Math.max(0, total - 1) : '-';
    startBtn.disabled = Boolean(error);
    errorEl.classList.toggle('hidden', !error);
    errorEl.textContent = error;
  }

  totalEl.addEventListener('input', refresh);
  refresh();

  startBtn.addEventListener('click', () => {
    const total = Number(totalEl.value);
    if (!Number.isInteger(total) || total < 4 || total > 12) {
      toast('총 인원은 4명부터 12명까지 가능합니다.');
      return;
    }
    lifeState.totalPlayers = total;
    prepareLifeRound();
    showLifePrompt();
  });
}

function showLifePrompt() {
  render(`
    <div class="panel word-stage minimal-panel">
      <div class="word-label">공통 제시어</div>
      <div class="secret-word">${esc(lifeState.prompt)}</div>
      <div class="btn-row">
        <button id="lifeRoleStartBtn" class="btn btn-primary" type="button">역할 확인</button>
      </div>
    </div>
  `, 'life-prompt');
  document.getElementById('lifeRoleStartBtn').addEventListener('click', () => {
    lifeState.revealIndex = 0;
    showLifeRoleHandoff();
  });
}

function showLifeRoleHandoff() {
  const i = lifeState.revealIndex;
  render(`
    <div class="panel handoff minimal-panel">
      <span class="player-chip">역할 ${i + 1} / ${lifeState.totalPlayers}</span>
      <div class="big-player">${esc(lifeState.players[i])}</div>
      <p class="handoff-note">휴대폰을 넘겨주세요.</p>
      <div class="btn-row">
        <button id="lifeRevealRoleBtn" class="btn btn-primary" type="button">역할 확인</button>
      </div>
    </div>
  `, 'life-role-handoff');
  document.getElementById('lifeRevealRoleBtn').addEventListener('click', showLifeRole);
}

function showLifeRole() {
  const i = lifeState.revealIndex;
  const isRipley = lifeState.roles[i] === 'ripley';
  render(`
    <div class="panel word-stage minimal-panel">
      <div class="word-label">${esc(lifeState.prompt)}</div>
      <div class="secret-word">${isRipley ? '리플리' : '시민'}</div>
      <p class="micro-copy">${isRipley ? '경험도 정치도 조작하세요.' : '경험은 진실. 정치는 자유.'}</p>
      <div class="timer-track"><div class="timer-bar"></div></div>
      <div class="btn-row">
        <button id="lifeRoleSeenBtn" class="btn btn-primary" type="button">확인</button>
      </div>
    </div>
  `, 'life-role');

  let closed = false;
  const finish = () => {
    if (closed) return;
    closed = true;
    lifeState.revealIndex += 1;
    if (lifeState.revealIndex >= lifeState.totalPlayers) showLifeReady();
    else showLifeRoleHandoff();
  };
  document.getElementById('lifeRoleSeenBtn').addEventListener('click', finish);
  state.secretTimer = setTimeout(finish, 6000);
}

function showLifeReady() {
  render(`
    <div class="panel handoff minimal-panel">
      <span class="player-chip">${esc(lifeState.prompt)}</span>
      <div class="big-player">인생 진술</div>
      <p class="handoff-note">첫 번째 플레이어부터 시작하세요.</p>
      <div class="btn-row">
        <button id="lifeTalkBtn" class="btn btn-primary" type="button">진술 시작</button>
      </div>
    </div>
  `, 'life-ready');
  document.getElementById('lifeTalkBtn').addEventListener('click', () => {
    lifeState.speakerIndex = 0;
    showLifeSpeaker();
  });
}

function showLifeSpeaker() {
  const i = lifeState.speakerIndex;
  const pct = ((i + 1) / lifeState.totalPlayers) * 100;
  render(`
    <div class="panel minimal-panel">
      <div class="progress-wrap">
        <div class="progress-meta"><span>${esc(lifeState.prompt)}</span><span>${i + 1} / ${lifeState.totalPlayers}</span></div>
        <div class="progress"><div style="width:${pct}%"></div></div>
      </div>
      <div class="speaker-box speaker-box-minimal">
        <div class="speaker-name">${esc(lifeState.players[i])}</div>
        <div class="speaker-help">진술하세요.</div>
      </div>
      <div class="btn-row">
        <button id="lifeSpeechDoneBtn" class="btn btn-primary" type="button">다음</button>
      </div>
    </div>
  `, 'life-speaker');

  document.getElementById('lifeSpeechDoneBtn').addEventListener('click', () => {
    if (lifeState.speakerIndex + 1 >= lifeState.totalPlayers) showLifeDebate();
    else {
      lifeState.speakerIndex += 1;
      showLifeSpeaker();
    }
  });
}

function showLifeDebate() {
  render(`
    <div class="panel handoff minimal-panel">
      <span class="player-chip">${esc(lifeState.prompt)}</span>
      <div class="big-player">압박 시간</div>
      <p class="handoff-note">각자 한 명에게 질문 1회.</p>
      <div class="micro-rule rule-pill"><b>후보 공개 지목 · 실제 투표는 달라도 됨</b></div>
      <div class="btn-row">
        <button id="lifeVoteStartBtn" class="btn btn-primary" type="button">비밀 투표</button>
      </div>
    </div>
  `, 'life-debate');
  document.getElementById('lifeVoteStartBtn').addEventListener('click', () => {
    lifeState.currentVoter = 0;
    lifeState.votes = [];
    showLifeVoteHandoff();
  });
}

function showLifeVoteHandoff() {
  const i = lifeState.currentVoter;
  render(`
    <div class="panel handoff minimal-panel">
      <span class="player-chip">투표 ${i + 1} / ${lifeState.totalPlayers}</span>
      <div class="big-player">${esc(lifeState.players[i])}</div>
      <p class="handoff-note">휴대폰을 넘겨주세요.</p>
      <div class="vote-status">${Array.from({length: lifeState.totalPlayers}, (_, d) => `<span class="vote-dot ${d < i ? 'done' : ''}"></span>`).join('')}</div>
      <div class="btn-row">
        <button id="lifeVoteOpenBtn" class="btn btn-primary" type="button">투표하기</button>
      </div>
    </div>
  `, 'life-vote-handoff');
  document.getElementById('lifeVoteOpenBtn').addEventListener('click', showLifeVoteChoices);
}

function showLifeVoteChoices() {
  const voter = lifeState.currentVoter;
  render(`
    <div class="panel vote-private minimal-panel vote-choice-panel">
      <span class="player-chip">투표 ${voter + 1} / ${lifeState.totalPlayers}</span>
      <h1 class="page-title vote-title">누가 리플리인가요?</h1>
      <div class="vote-grid dynamic-vote-grid">
        ${lifeState.players.map((p, i) => i === voter ? '' : `<button class="person-btn" data-life-vote="${i}" type="button">${esc(p)}</button>`).join('')}
      </div>
    </div>
  `, 'life-vote-choice');

  document.querySelectorAll('[data-life-vote]').forEach(btn => btn.addEventListener('click', () => {
    lifeState.votes[voter] = Number(btn.dataset.lifeVote);
    lifeState.currentVoter += 1;
    if (lifeState.currentVoter >= lifeState.totalPlayers) resolveLifeVote();
    else showLifeVoteCover();
  }));
}

function showLifeVoteCover() {
  render(`
    <div class="panel handoff minimal-panel">
      <span class="player-chip">저장 완료</span>
      <div class="big-player">투표 완료</div>
      <div class="btn-row">
        <button id="lifeNextVoterBtn" class="btn btn-primary" type="button">다음 플레이어</button>
      </div>
    </div>
  `, 'life-vote-cover');
  document.getElementById('lifeNextVoterBtn').addEventListener('click', showLifeVoteHandoff);
}

function lifeVoteCounts() {
  return lifeState.players.map((_, i) => lifeState.votes.filter(v => v === i).length);
}

function resolveLifeVote() {
  const counts = lifeVoteCounts();
  const ripleyIndex = lifeRipleyIndex();
  const maxVotes = Math.max(...counts);
  const topIndices = counts.map((count, i) => count === maxVotes ? i : -1).filter(i => i >= 0);
  const citizenWin = topIndices.length === 1 && topIndices[0] === ripleyIndex;
  const topCitizenIndices = topIndices.filter(i => lifeState.roles[i] === 'citizen');

  lifeState.result = {
    citizenWin,
    counts,
    ripleyIndex,
    topCitizenIndices
  };
  showLifeResultReady();
}

function showLifeResultReady() {
  render(`
    <div class="panel handoff minimal-panel">
      <span class="eyebrow">RESULT</span>
      <div class="big-player">결과 준비 완료</div>
      <p class="handoff-note">휴대폰을 중앙에 놓아주세요.</p>
      <div class="btn-row">
        <button id="lifeRevealResultBtn" class="btn btn-primary" type="button">결과 발표</button>
      </div>
    </div>
  `, 'life-result-ready');
  document.getElementById('lifeRevealResultBtn').addEventListener('click', playLifeResultReveal);
}

function playLifeResultReveal() {
  const r = lifeState.result;
  const maxVotes = Math.max(...r.counts);
  const top = r.counts.map((c, i) => c === maxVotes ? i : -1).filter(i => i >= 0);
  const label = top.length === 1
    ? `${ordinal(top[0])}`
    : top.map(i => ordinal(i)).join(' · ');

  showManualReveal('TOP VOTE', '최다 득표', label, '정체 공개', () => {
    runCountdown(() => {
      if (top.length === 1) {
        const role = lifeState.roles[top[0]] === 'ripley' ? '리플리' : '시민';
        showManualReveal('IDENTITY', role, `${ordinal(top[0])}`, '최종 결과 보기', showLifeResult);
      } else {
        const includesRipley = top.includes(r.ripleyIndex);
        showManualReveal(
          'IDENTITY',
          '동률',
          includesRipley ? '리플리가 포함됐지만 단독 검거 실패' : '시민끼리 최다 득표',
          '최종 결과 보기',
          showLifeResult
        );
      }
    });
  });
}

function showLifeResult() {
  const r = lifeState.result;
  const citizenIndices = lifeState.roles.map((role, i) => role === 'citizen' ? i : -1).filter(i => i >= 0);
  const topCitizenSet = new Set(r.topCitizenIndices);

  let penaltyHtml = '';
  if (r.citizenWin) {
    penaltyHtml = `<div class="penalty-hero"><span class="penalty-kicker">🚨 벌칙 1명</span><div class="penalty-names">${esc(ordinal(r.ripleyIndex))} · 1잔</div></div>`;
  } else {
    const double = citizenIndices.filter(i => topCitizenSet.has(i));
    const single = citizenIndices.filter(i => !topCitizenSet.has(i));
    const parts = [];
    if (double.length) parts.push(`2잔 · ${double.map(i => esc(ordinal(i))).join(' · ')}`);
    if (single.length) parts.push(`1잔 · ${single.map(i => esc(ordinal(i))).join(' · ')}`);
    penaltyHtml = `<div class="penalty-hero"><span class="penalty-kicker">🚨 시민 전원 벌칙</span><div class="penalty-names">${parts.join('<br>')}</div></div>`;
  }

  const detailRows = r.counts.map((count, i) => {
    const role = lifeState.roles[i] === 'ripley' ? '리플리' : '시민';
    return `<div class="detail-row"><span>${esc(lifeState.players[i])}</span><small>${role}</small><b>${count}표</b></div>`;
  }).join('');

  render(`
    <div class="panel result result-compact result-ultra-compact">
      <div class="result-topline"><span class="result-kicker">VOTE RESULT</span></div>
      <h1>${r.citizenWin ? '시민 승리' : '리플리 승리'}</h1>
      ${penaltyHtml}

      <div class="word-reveal-inline">
        <div><span>제시어</span><b>${esc(lifeState.prompt)}</b></div>
        <i>·</i>
        <div class="citizen-word"><span>리플리</span><b>${esc(ordinal(r.ripleyIndex))}</b></div>
      </div>

      <details class="result-details">
        <summary>득표 상세</summary>
        <div class="detail-list">${detailRows}</div>
      </details>

      <div class="result-actions">
        <button id="lifeAgainBtn" class="btn btn-primary" type="button">한 판 더</button>
        <button id="lifeSetupAgainBtn" class="btn" type="button">인원</button>
        <button id="lifeMenuBtn" class="btn btn-ghost slim-btn" type="button">게임 선택</button>
      </div>
    </div>
  `, 'life-result');

  document.getElementById('lifeAgainBtn').addEventListener('click', () => {
    prepareLifeRound();
    showLifePrompt();
  });
  document.getElementById('lifeSetupAgainBtn').addEventListener('click', showLifeSetup);
  document.getElementById('lifeMenuBtn').addEventListener('click', showMenu);
}

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else {
        toast('이 브라우저는 전체 화면 버튼을 지원하지 않습니다.');
      }
    } else if (document.exitFullscreen) {
      await document.exitFullscreen();
    }
  } catch {
    toast('브라우저 설정 때문에 전체 화면을 열 수 없습니다.');
  }
}

fullscreenBtn.addEventListener('click', toggleFullscreen);
document.addEventListener('fullscreenchange', () => {
  const label = fullscreenBtn.querySelector('.top-label');
  const icon = fullscreenBtn.querySelector('.top-icon');
  if (label) label.textContent = document.fullscreenElement ? '나가기' : '전체화면';
  if (icon) icon.textContent = document.fullscreenElement ? '↙' : '⛶';
  fullscreenBtn.setAttribute('aria-label', document.fullscreenElement ? '전체 화면 나가기' : '전체 화면');
});
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
