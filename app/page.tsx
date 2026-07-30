"use client";

import { CSSProperties, PointerEvent, useEffect, useRef, useState } from "react";

type Choice = "A" | "B";

type Role = {
  id: number;
  short: string;
  name: string;
  color: string;
  colorSoft: string;
  question: string;
  discovery: string;
  contribution: string;
  clues: Array<{ label: string; x: string; y: string }>;
  suggestions: string[];
};

const ROLES: Role[] = [
  {
    id: 0,
    short: "열과 그늘",
    name: "관람객 1",
    color: "#ff7b8d",
    colorSoft: "rgba(255, 123, 141, .22)",
    question: "이 골목은 어디가 가장 뜨거울까요?",
    discovery: "이 골목에는 그늘이 부족합니다.",
    contribution: "처마형 잎과 휴식 공간에 반영되었습니다.",
    clues: [
      { label: "뜨거운 노면", x: "52%", y: "74%" },
      { label: "그늘 없이 쉬는 주민", x: "26%", y: "61%" },
      { label: "강한 햇빛의 벽면", x: "68%", y: "35%" },
    ],
    suggestions: [
      "노인들이 쉴 수 있는 그늘이 필요해.",
      "여름의 뜨거운 열기를 줄여야 해.",
      "햇빛을 막는 넓은 잎이 필요해.",
    ],
  },
  {
    id: 1,
    short: "이동과 통로",
    name: "관람객 2",
    color: "#f2dd64",
    colorSoft: "rgba(242, 221, 100, .2)",
    question: "어떤 길은 반드시 비워둬야 할까요?",
    discovery: "식물이 자라도 이 길은 막히면 안 됩니다.",
    contribution: "벽면 성장과 열린 배송 통로에 반영되었습니다.",
    clues: [
      { label: "배송 카트의 경로", x: "58%", y: "65%" },
      { label: "보행 충돌 구간", x: "43%", y: "57%" },
      { label: "비워야 할 중앙 통로", x: "50%", y: "82%" },
    ],
    suggestions: [
      "배송 카트가 지나갈 길은 남겨야 해.",
      "보행자와 식물이 충돌하면 안 돼.",
      "골목 중앙은 비워두어야 해.",
    ],
  },
  {
    id: 2,
    short: "빗물과 생태",
    name: "관람객 3",
    color: "#65e5e0",
    colorSoft: "rgba(101, 229, 224, .2)",
    question: "물이 멈춘 곳에서 무엇이 생길까요?",
    discovery: "고인 물이 해충을 다시 불러오고 있습니다.",
    contribution: "저장 뿌리와 파리지옥 포획엽에 반영되었습니다.",
    clues: [
      { label: "빗물 고임", x: "31%", y: "79%" },
      { label: "물가의 해충", x: "36%", y: "70%" },
      { label: "막힌 배수 구간", x: "72%", y: "77%" },
    ],
    suggestions: [
      "빗물이 고이지 않게 해야 해.",
      "해충이 다시 생기지 않아야 해.",
      "물을 저장하고 다시 사용할 수 있어야 해.",
    ],
  },
];

const STEPS = ["발견", "두 미래", "선택", "한 문장", "새로운 미래", "결과"];

function DwellTarget({
  children,
  className = "",
  onComplete,
  disabled = false,
  label,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  onComplete: () => void;
  disabled?: boolean;
  label: string;
  style?: CSSProperties;
}) {
  const [progress, setProgress] = useState(0);
  const frame = useRef<number | null>(null);
  const started = useRef(0);
  const finished = useRef(false);

  const stop = () => {
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = null;
    started.current = 0;
    if (!finished.current) setProgress(0);
  };

  const complete = () => {
    if (disabled || finished.current) return;
    finished.current = true;
    setProgress(100);
    onComplete();
    window.setTimeout(() => {
      finished.current = false;
      setProgress(0);
    }, 350);
  };

  const start = () => {
    if (disabled || finished.current) return;
    started.current = performance.now();
    const tick = (time: number) => {
      const value = Math.min(100, ((time - started.current) / 1500) * 100);
      setProgress(value);
      if (value >= 100) {
        complete();
        return;
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => stop(), []);

  return (
    <button
      type="button"
      aria-label={`${label}, 1.5초 시선 체류 또는 클릭`}
      className={`dwell-target ${className}`}
      disabled={disabled}
      onPointerEnter={start}
      onPointerLeave={stop}
      onFocus={start}
      onBlur={stop}
      onClick={complete}
      style={{ ...style, "--dwell": `${progress * 3.6}deg` } as CSSProperties}
    >
      {children}
      <span className="dwell-ring" aria-hidden="true" />
    </button>
  );
}

function RoleTabs({
  activeRole,
  onChange,
  discovered,
  votes,
  compact = false,
}: {
  activeRole: number;
  onChange: (id: number) => void;
  discovered: Record<number, number>;
  votes: Record<number, Choice>;
  compact?: boolean;
}) {
  return (
    <div className={`role-tabs ${compact ? "compact" : ""}`} aria-label="관람객 역할 전환">
      {ROLES.map((role) => (
        <button
          type="button"
          key={role.id}
          className={`role-tab ${activeRole === role.id ? "active" : ""}`}
          onClick={() => onChange(role.id)}
          style={{ "--role-color": role.color, "--role-soft": role.colorSoft } as CSSProperties}
        >
          <span className="role-dot">
            {votes[role.id] || (discovered[role.id] !== undefined ? "✓" : role.id + 1)}
          </span>
          <span>
            <b>{role.name}</b>
            <small>{role.short}</small>
          </span>
        </button>
      ))}
    </div>
  );
}

export default function Home() {
  const [stage, setStage] = useState(0);
  const [activeRole, setActiveRole] = useState(0);
  const [discovered, setDiscovered] = useState<Record<number, number>>({});
  const [votes, setVotes] = useState<Record<number, Choice>>({});
  const [reasons, setReasons] = useState<Record<number, string>>({});
  const [branch, setBranch] = useState<"split" | "unanimous" | null>(null);
  const [growthTick, setGrowthTick] = useState(0);
  const [growthReady, setGrowthReady] = useState(false);
  const [resultRole, setResultRole] = useState<number | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  const role = ROLES[activeRole];
  const discoveryComplete = ROLES.every((item) => discovered[item.id] !== undefined);
  const voteComplete = ROLES.every((item) => votes[item.id]);
  const choiceCounts = {
    A: Object.values(votes).filter((value) => value === "A").length,
    B: Object.values(votes).filter((value) => value === "B").length,
  };
  const currentStep =
    stage === 0
      ? -1
      : stage === 1
        ? 0
        : stage === 2
          ? Object.keys(votes).length === 0
            ? 1
            : 2
          : stage === 3
            ? branch === "split"
              ? 3
              : 4
            : stage === 4
              ? 4
              : 5;

  const moveCursor = (event: PointerEvent<HTMLElement>) => {
    if (!cursorRef.current || event.pointerType === "touch") return;
    cursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    cursorRef.current.dataset.visible = "true";
  };

  const resetAll = () => {
    setStage(0);
    setActiveRole(0);
    setDiscovered({});
    setVotes({});
    setReasons({});
    setBranch(null);
    setGrowthTick(0);
    setGrowthReady(false);
    setResultRole(null);
  };

  const discoverClue = (roleId: number, clueIndex: number) => {
    setDiscovered((prev) => ({ ...prev, [roleId]: clueIndex }));
    const next = ROLES.find((item) => item.id > roleId && discovered[item.id] === undefined);
    if (next) window.setTimeout(() => setActiveRole(next.id), 650);
  };

  const selectFuture = (choice: Choice) => {
    setVotes((prev) => ({ ...prev, [activeRole]: choice }));
    const next = ROLES.find((item) => item.id !== activeRole && !votes[item.id]);
    if (next) window.setTimeout(() => setActiveRole(next.id), 450);
  };

  const revealBranch = () => {
    const values = Object.values(votes);
    setBranch(values.every((value) => value === values[0]) ? "unanimous" : "split");
    setStage(3);
  };

  const beginGrowth = () => {
    setStage(4);
    setGrowthTick(0);
    setGrowthReady(false);
  };

  useEffect(() => {
    if (stage !== 4) return;
    const timers = [
      window.setTimeout(() => setGrowthTick(1), 700),
      window.setTimeout(() => setGrowthTick(2), 2300),
      window.setTimeout(() => setGrowthTick(3), 3800),
      window.setTimeout(() => setGrowthTick(4), 5300),
      window.setTimeout(() => setGrowthTick(5), 6800),
      window.setTimeout(() => setGrowthTick(6), 8200),
      window.setTimeout(() => setGrowthReady(true), 9200),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [stage]);

  const retryChoices = () => {
    setVotes({});
    setReasons({});
    setBranch(null);
    setActiveRole(0);
    setGrowthTick(0);
    setGrowthReady(false);
    setStage(2);
  };

  const replayResult = () => beginGrowth();

  const keywords = branch === "split"
    ? [
        reasons[0]?.includes("열기") ? "낮은 온도" : "그늘",
        reasons[1]?.includes("배송") ? "배송" : "통로",
        reasons[2]?.includes("해충") ? "해충" : "빗물",
      ]
    : votes[0] === "A"
      ? ["그늘", "휴식", "열린 통로"]
      : ["통로", "배송", "선택적 그늘"];

  const resultName =
    branch === "split"
      ? "성북구 처마 포식 덩굴"
      : votes[0] === "A"
        ? "성북구 그늘 순환 덩굴"
        : "성북구 벽면 처마 덩굴";

  return (
    <main
      className={`experience stage-${stage}`}
      onPointerMove={moveCursor}
      onPointerLeave={() => {
        if (cursorRef.current) cursorRef.current.dataset.visible = "false";
      }}
      style={{ "--active-color": role.color, "--active-soft": role.colorSoft } as CSSProperties}
    >
      <div className="grain" aria-hidden="true" />
      <div className="ambient-orb orb-one" aria-hidden="true" />
      <div className="ambient-orb orb-two" aria-hidden="true" />
      <div className="gaze-cursor" ref={cursorRef} aria-hidden="true">
        <span />
      </div>

      {stage > 0 && (
        <header className="topbar">
          <button className="brand" type="button" onClick={resetAll} aria-label="서울 2070 처음으로">
            <span className="brand-seed" />
            <span>
              <b>서울 2070</b>
              <small>두 개의 미래</small>
            </span>
          </button>

          <nav className="stepper" aria-label="체험 진행 단계">
            {STEPS.map((label, index) => (
              <div
                key={label}
                className={`step ${currentStep === index ? "active" : ""} ${currentStep > index ? "done" : ""}`}
              >
                <span>{currentStep > index ? "✓" : index + 1}</span>
                <small>{label}</small>
              </div>
            ))}
          </nav>

          <button className="reset-button" type="button" onClick={resetAll}>
            <span>↺</span> 처음부터
          </button>
        </header>
      )}

      {stage === 0 && (
        <section className="intro scene-shell">
          <div className="scene-image intro-image" />
          <div className="scene-vignette" />
          <div className="bio-line line-a" />
          <div className="bio-line line-b" />
          <div className="heat-haze" />
          <div className="puddle intro-puddle">
            <i />
            <i />
            <i />
          </div>
          <div className="intro-copy">
            <p className="eyebrow"><span /> SEOUL ECOLOGICAL SIMULATION · 2070</p>
            <h1>
              우리 셋이<br />
              <em>서울 한 곳</em>을 바꿉니다.
            </h1>
            <p className="intro-sub">서로 다른 문제를 발견하고, 우리가 원하는 미래를 선택하세요.</p>
            <DwellTarget className="primary-action intro-action" onComplete={() => setStage(1)} label="체험 시작하기">
              <span>시작하기</span>
              <b>1.5초 바라보기</b>
              <i>→</i>
            </DwellTarget>
            <div className="intro-hint">
              <span className="mouse-mark">◎</span>
              마우스를 시선처럼 움직이세요 · 클릭으로도 선택할 수 있어요
            </div>
          </div>
          <div className="intro-specimen">
            <span>SPECIMEN</span>
            <b>SB-2070</b>
            <small>37.592° N / 127.016° E</small>
          </div>
          <div className="intro-role-stripe">
            {ROLES.map((item) => (
              <span key={item.id} style={{ "--stripe-color": item.color } as CSSProperties}>
                0{item.id + 1} · {item.short}
              </span>
            ))}
          </div>
        </section>
      )}

      {stage === 1 && (
        <section className="discover-layout">
          <div className="scene-shell discovery-scene">
            <div className="scene-image muted-scene" />
            <div className="scene-vignette" />
            <div className="scan-lines" />
            <div className="role-filter" />
            <div className="scene-caption">
              <span>성북구 경사 골목</span>
              <small>현재 시선 · {role.short}</small>
            </div>

            {role.clues.map((clue, index) => {
              const found = discovered[role.id] === index;
              return (
                <DwellTarget
                  key={`${role.id}-${clue.label}`}
                  className={`clue-hotspot ${found ? "found" : ""}`}
                  label={clue.label}
                  disabled={found}
                  onComplete={() => discoverClue(role.id, index)}
                  style={{ left: clue.x, top: clue.y }}
                >
                  <span className="hotspot-core" />
                  <span className="hotspot-wave" />
                  <b>{found ? clue.label : "?"}</b>
                  <small>{found ? "단서 발견" : "바라보기"}</small>
                </DwellTarget>
              );
            })}

            {Object.entries(discovered).map(([id, clueIndex]) => {
              const item = ROLES[Number(id)];
              const clue = item.clues[clueIndex];
              return (
                <span
                  className="evidence-trace"
                  key={`evidence-${id}`}
                  style={{ left: clue.x, top: clue.y, "--trace-color": item.color } as CSSProperties}
                />
              );
            })}
          </div>

          <aside className="discovery-panel">
            <p className="eyebrow"><span /> 같은 서울, 다른 단서</p>
            <div className="role-number" style={{ color: role.color }}>0{role.id + 1}</div>
            <h2>{role.question}</h2>
            <p>
              화면 속에서 <strong style={{ color: role.color }}>{role.short}</strong>과 관련된 이상 징후를 찾으세요.
              한 지점을 1.5초 바라보면 단서가 열립니다.
            </p>

            <div className={`discovery-message ${discovered[role.id] !== undefined ? "visible" : ""}`}>
              <span style={{ background: role.color }} />
              <div>
                <small>발견한 조건</small>
                <b>{role.discovery}</b>
              </div>
            </div>

            <div className="discovery-status">
              <small>우리의 발견</small>
              <div>
                {ROLES.map((item) => (
                  <span
                    key={item.id}
                    className={discovered[item.id] !== undefined ? "complete" : ""}
                    style={{ "--status-color": item.color } as CSSProperties}
                  >
                    {discovered[item.id] !== undefined ? "✓" : item.id + 1}
                  </span>
                ))}
              </div>
              <b>{Object.keys(discovered).length} / 3</b>
            </div>

            {discoveryComplete && (
              <div className="all-found">
                <p>우리는 같은 골목에서<br /><strong>서로 다른 문제</strong>를 보고 있었습니다.</p>
                <button className="primary-action" type="button" onClick={() => setStage(2)}>
                  두 개의 미래 보기 <i>→</i>
                </button>
              </div>
            )}
          </aside>

          <RoleTabs activeRole={activeRole} onChange={setActiveRole} discovered={discovered} votes={votes} />
        </section>
      )}

      {stage === 2 && (
        <section className="future-layout">
          <div className="future-heading">
            <p className="eyebrow"><span /> VISUAL BALANCE GAME</p>
            <h2>이 골목에는 어떤 미래가 더 필요할까요?</h2>
            <p>넓은 그늘을 만들면 시원해지지만, 배송 통로가 좁아집니다.</p>
          </div>

          <div className="future-split">
            <DwellTarget
              className={`future-panel future-a ${votes[activeRole] === "A" ? "selected" : ""}`}
              label="미래 A 시원한 골목 선택"
              onComplete={() => selectFuture("A")}
            >
              <div className="future-bg future-a-bg" />
              <div className="future-overlay" />
              <div className="canopy-shape canopy-one" />
              <div className="canopy-shape canopy-two" />
              <div className="blocked-path" />
              <div className="future-letter">A</div>
              <div className="future-copy">
                <span className="temperature">↓ 4.8°C</span>
                <h3>시원한 골목</h3>
                <p>그늘과 휴식은 충분하지만<br />길이 좁아집니다.</p>
                <div className="tags">
                  <span>넓은 그늘</span><span>낮은 온도</span><span>휴식 공간</span><span className="loss">좁은 통로</span>
                </div>
              </div>
              <span className="gaze-prompt">1.5초 바라봐 선택</span>
              <div className="vote-markers">
                {ROLES.filter((item) => votes[item.id] === "A").map((item) => (
                  <i key={item.id} style={{ background: item.color }}>{item.id + 1}</i>
                ))}
              </div>
            </DwellTarget>

            <div className="versus">
              <span>OR</span>
              <i />
            </div>

            <DwellTarget
              className={`future-panel future-b ${votes[activeRole] === "B" ? "selected" : ""}`}
              label="미래 B 열린 골목 선택"
              onComplete={() => selectFuture("B")}
            >
              <div className="future-bg future-b-bg" />
              <div className="future-overlay" />
              <div className="wall-vines" />
              <div className="open-path" />
              <div className="future-letter">B</div>
              <div className="future-copy">
                <span className="temperature">↔ 2.4m</span>
                <h3>열린 골목</h3>
                <p>이동은 편리하지만<br />그늘과 쉴 곳이 부족합니다.</p>
                <div className="tags">
                  <span>넓은 통로</span><span>편리한 이동</span><span>배송 유지</span><span className="loss">부족한 그늘</span>
                </div>
              </div>
              <span className="gaze-prompt">1.5초 바라봐 선택</span>
              <div className="vote-markers">
                {ROLES.filter((item) => votes[item.id] === "B").map((item) => (
                  <i key={item.id} style={{ background: item.color }}>{item.id + 1}</i>
                ))}
              </div>
            </DwellTarget>
          </div>

          <div className="selection-dock">
            <RoleTabs
              activeRole={activeRole}
              onChange={setActiveRole}
              discovered={discovered}
              votes={votes}
              compact
            />
            <div className="vote-summary">
              <span><i className="summary-a" /> 시원한 골목 <b>{choiceCounts.A}명</b></span>
              <span className="summary-divider" />
              <span><i className="summary-b" /> 열린 골목 <b>{choiceCounts.B}명</b></span>
            </div>
            <button className="primary-action" type="button" disabled={!voteComplete} onClick={revealBranch}>
              선택 확인하기 <i>→</i>
            </button>
          </div>
        </section>
      )}

      {stage === 3 && branch === "unanimous" && (
        <section className="branch-scene">
          <div className={`consensus-visual choice-${votes[0]?.toLowerCase()}`}>
            <div className="scene-image" />
            <div className="scene-vignette" />
          </div>
          <div className="branch-card consensus-card">
            <div className="branch-icon">
              {ROLES.map((item) => <i key={item.id} style={{ background: item.color }} />)}
            </div>
            <p className="eyebrow"><span /> ONE SHARED DIRECTION</p>
            <h2>세 사람의 시선이<br />하나의 미래를 선택했습니다.</h2>
            <p>
              선택하지 않은 미래의 장점도 작은 보조 기능으로 남깁니다.<br />
              <strong>
                {votes[0] === "A"
                  ? "넓은 그늘을 유지하면서 중앙 통로를 비웁니다."
                  : "열린 통로를 유지하면서 필요한 위치에만 그늘을 더합니다."}
              </strong>
            </p>
            <button className="primary-action" type="button" onClick={beginGrowth}>
              식물 성장 시작 <i>→</i>
            </button>
          </div>
        </section>
      )}

      {stage === 3 && branch === "split" && (
        <section className="reason-layout">
          <div className="reason-heading">
            <div className="split-orbit">
              {ROLES.map((item) => <i key={item.id} style={{ "--orbit-color": item.color } as CSSProperties} />)}
              <span />
            </div>
            <p className="eyebrow"><span /> DIFFERENT SIGNALS DETECTED</p>
            <h2>우리의 선택이 갈렸습니다.</h2>
            <p>자신에게 가장 중요했던 조건을 <strong>한 문장</strong>으로 알려주세요.</p>
          </div>

          <div className="reason-cards">
            {ROLES.map((item) => (
              <article
                className="reason-card"
                key={item.id}
                style={{ "--card-color": item.color, "--card-soft": item.colorSoft } as CSSProperties}
              >
                <header>
                  <span>0{item.id + 1}</span>
                  <div><b>{item.name}</b><small>{item.short}</small></div>
                  <i>{votes[item.id]}</i>
                </header>
                <label htmlFor={`reason-${item.id}`}>나에게 가장 중요한 조건</label>
                <textarea
                  id={`reason-${item.id}`}
                  maxLength={40}
                  value={reasons[item.id] || ""}
                  placeholder={item.suggestions[0]}
                  onChange={(event) => setReasons((prev) => ({ ...prev, [item.id]: event.target.value.slice(0, 40) }))}
                />
                <small className="char-count">{(reasons[item.id] || "").length} / 40</small>
                <div className="suggestion-list">
                  {item.suggestions.map((suggestion) => (
                    <button
                      type="button"
                      key={suggestion}
                      className={reasons[item.id] === suggestion ? "selected" : ""}
                      onClick={() => setReasons((prev) => ({ ...prev, [item.id]: suggestion }))}
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="combine-dock">
            <p><span>{Object.values(reasons).filter((value) => value.trim()).length}</span> / 3개의 조건 수집</p>
            <button
              className="primary-action"
              type="button"
              disabled={!ROLES.every((item) => reasons[item.id]?.trim())}
              onClick={beginGrowth}
            >
              우리의 조건 조합하기 <i>✦</i>
            </button>
          </div>
        </section>
      )}

      {stage === 4 && (
        <section className={`growth-layout growth-${growthTick} ${growthReady ? "ready" : ""}`}>
          <div className="growth-scene">
            <div className="scene-image final-scene" />
            <div className="growth-darkness" />
            <div className="root-network root-left" />
            <div className="root-network root-right" />
            <div className="wall-stem stem-one" />
            <div className="wall-stem stem-two" />
            <div className="eave-leaf leaf-one" />
            <div className="eave-leaf leaf-two" />
            <div className="trap-leaf trap-one"><span /></div>
            <div className="trap-leaf trap-two"><span /></div>
            <div className="delivery-light" />
            <div className="cooperation-pulse" />
          </div>

          {growthTick < 2 && (
            <div className="keyword-convergence">
              <p>{branch === "split" ? "서로 다른 조건이" : "하나의 선택과 보완 조건이"}</p>
              <h2>새로운 미래를 열고 있습니다.</h2>
              <div className="keyword-field">
                {keywords.map((keyword, index) => (
                  <span key={keyword} style={{ "--key-color": ROLES[index].color } as CSSProperties}>
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {growthTick >= 2 && (
            <div className="growth-copy">
              <p className="eyebrow"><span /> FUTURE {branch === "split" ? "C" : "HYBRID"} UNLOCKED</p>
              <h2>{resultName}</h2>
              <p>벽을 따라 자라 길을 지키고, 처마처럼 그늘을 만들며,<br />빗물을 저장해 해충을 줄입니다.</p>
            </div>
          )}

          <div className="growth-timeline">
            {["빗물 뿌리", "벽면 줄기", "처마 잎", "포획엽", "열린 통로"].map((label, index) => (
              <span className={growthTick >= index + 2 ? "active" : ""} key={label}>
                <i />{label}
              </span>
            ))}
          </div>

          {growthReady && (
            <div className="growth-finish">
              <p>혼자서는 만들 수 없는 서울이 완성되었습니다.</p>
              <button className="primary-action" type="button" onClick={() => setStage(5)}>
                우리의 결과 확인 <i>→</i>
              </button>
            </div>
          )}
        </section>
      )}

      {stage === 5 && (
        <section className="result-layout">
          <div className="result-visual">
            <div className="scene-image final-scene" />
            <div className="scene-vignette" />
            <div className={`result-highlight role-${resultRole ?? "none"}`} />
            <div className="result-title">
              <p className="eyebrow"><span /> SEOUL SPECIMEN · SB-2070</p>
              <h1>{resultName}</h1>
              <p>세 사람의 서로 다른 시선으로 완성되었습니다.</p>
            </div>
            <div className="specimen-tags">
              <span style={{ "--tag-color": ROLES[0].color } as CSSProperties}>처마형 그늘</span>
              <span style={{ "--tag-color": ROLES[1].color } as CSSProperties}>벽면 성장</span>
              <span style={{ "--tag-color": ROLES[2].color } as CSSProperties}>저장 뿌리 · 포획엽</span>
            </div>
          </div>

          <aside className="result-panel">
            <header>
              <p className="eyebrow"><span /> 우리의 서울 레시피</p>
              <h2>선택이 식물의<br />기능이 되었습니다.</h2>
            </header>

            <div className="recipe-list">
              {[
                ["01", "필요한 위치에만 그늘 만들기"],
                ["02", "배송과 보행 통로 유지하기"],
                ["03", "빗물 저장과 해충 줄이기"],
                ["04", "주민이 잠시 쉴 구조 만들기"],
              ].map(([number, text]) => (
                <div key={number}><span>{number}</span><b>{text}</b></div>
              ))}
            </div>

            <div className="contribution-title">
              <b>관람객별 기여</b>
              <small>선택하면 식물의 해당 부위가 빛납니다.</small>
            </div>
            <div className="contribution-list">
              {ROLES.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={resultRole === item.id ? "active" : ""}
                  onClick={() => setResultRole(resultRole === item.id ? null : item.id)}
                  style={{ "--contribution-color": item.color, "--contribution-soft": item.colorSoft } as CSSProperties}
                >
                  <i>{item.id + 1}</i>
                  <span>
                    <b>{item.short}</b>
                    <small>{item.contribution}</small>
                    {branch === "split" && reasons[item.id] && <em>“{reasons[item.id]}”</em>}
                  </span>
                  <strong>＋</strong>
                </button>
              ))}
            </div>

            <div className="result-actions">
              <button type="button" onClick={replayResult}>↻ 결과 다시 보기</button>
              <button type="button" onClick={retryChoices}>◇ 다른 선택 해보기</button>
              <button type="button" onClick={resetAll}>↺ 처음부터</button>
            </div>
          </aside>
        </section>
      )}
    </main>
  );
}
