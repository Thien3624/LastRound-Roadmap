import { useState } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const PHASES = [
  { key: "w56", label: "W5–W6", title: "SAA Exam + Project 1 Finish", color: "#81B29A" },
  { key: "w78", label: "W7–W8", title: "IaC + GitOps + Thesis Submit", color: "#E07A5F" },
];

// Mỗi block: time, duration (phút), label, type, detail, phaseDetail, eveningMode
const SCHEDULE = [
  {
    time: "07:00", min: 30, label: "Wake up + Plan ngày",
    type: "life",
    detail: "Dậy 07:00 — fixed, không bargain. Uống nước, ánh sáng tự nhiên. Viết 3 priority ra giấy trước khi mở laptop.",
    note: null,
  },
  {
    time: "07:30", min: 30, label: "Ăn sáng",
    type: "life",
    detail: "Ăn no. Không mở laptop. Não cần glucose trước deep work, không phải notifications.",
    note: null,
  },
  {
    time: "08:00", min: 30, label: "🧠 LeetCode — Anchor đầu ngày",
    type: "lc",
    detail: "1 bài Easy/ngày. Timer 25 phút. Làm xong mới được mở bất cứ thứ gì khác. Đây là anchor — nếu hôm nay chỉ làm được 1 thứ, LC vẫn phải xong.",
    w56: "W5: Binary Search, Tree BFS/DFS — 3 bài còn lại để đạt 30. W6: Done, dùng slot này review pattern yếu.",
    w78: "W7–W8: LC = 30 ✅. Dùng 30 phút này explain 1 solution bằng tiếng Anh to — luyện interview.",
  },
  {
    time: "08:30", min: 120, label: "☁️ Cloud Deep Lab [Pomodoro 50/10]",
    type: "cloud",
    detail: "2 vòng Pomodoro: 50 phút làm → 10 phút nghỉ thật sự (không check điện thoại, đứng dậy đi lại). Wifi nhà, không giới hạn data — đây là slot heavy lab duy nhất không có ở Bosch.",
    w56: "W5: Full practice exam SAA × 2 (sáng + chiều review sai). W6: EKS + ALB + CodePipeline — deploy Bee-Shoeshop production-ready.",
    w78: "W7: Terraform VPC+EKS module từ đầu, kiểm tra state file. W8: ArgoCD + kube-prometheus-stack via Helm — GitOps stack demo-ready.",
  },
  {
    time: "10:30", min: 30, label: "Break — Bắt buộc",
    type: "life",
    detail: "Đứng dậy, ra ngoài ban công hoặc xuống đường. Không ngồi scroll điện thoại. Não cần oxygen thật, không phải content.",
    note: null,
  },
  {
    time: "11:00", min: 120, label: "📓 Thesis Deep Work #1 [Pomodoro 50/10]",
    type: "thesis",
    detail: "Slot thesis nặng nhất trong ngày — não còn fresh sau break. 2 vòng Pomodoro. Code thật, run thật, viết thật. Không để Zalo/Discord mở.",
    w56: "W5: NER pipeline hoàn chỉnh — chạy inference, đánh giá precision@5 trên 10 CV mẫu. W6: FastAPI + Streamlit end-to-end, fix bugs còn lại.",
    w78: "W7: Thesis chapter 3 — viết methodology + results. W8: Chapter 4 — analysis + conclusion, đây là section quyết định.",
  },
  {
    time: "13:00", min: 60, label: "Ăn trưa + Nghỉ ngơi",
    type: "life",
    detail: "Đồ meal prep sẵn. Ăn xong nghỉ 20–30 phút — nằm hoặc ngồi thoải mái, không laptop. Đây không phải lãng phí thời gian, đây là recovery để buổi chiều không bị brain fog.",
    note: null,
  },
  {
    time: "14:00", min: 90, label: "📓 Thesis Deep Work #2",
    type: "thesis",
    detail: "Tiếp tục thesis nhưng có thể chuyển sang task nhẹ hơn buổi sáng: GitHub update, README, architecture diagram, evaluation documentation, figure generation.",
    w56: "W5: Viết thesis chapter 2 outline. W6: Update GitHub repo — README + architecture diagram + cost estimate.",
    w78: "W7: Thesis chapter 3–4 polish, figures, citations. W8: Final review pass — check formatting, submit checklist.",
  },
  {
    time: "15:30", min: 45, label: "🎤 Interview Prep — Nói to",
    type: "interview",
    detail: "Nói to, record lại. Không gõ. Toàn bộ nhà là của bạn → không ngại nói to. 45 phút đủ để làm 1 mock topic sâu.",
    w56: "W5: 'Walk me through your Bee-Shoeshop architecture' — camera on, 10 phút, re-record đến khi fluent. W6: System design: 'Design CI/CD for 50 microservices on K8s'.",
    w78: "W7: Mock behavioral full 30 phút — record, watch back, note improvement. W8: Portfolio demo video quay + LinkedIn post viết.",
  },
  {
    time: "16:15", min: 45, label: "Wrap-up + Daily Review",
    type: "review",
    detail: "Đóng laptop đúng 17:00. Dùng 45 phút này: commit code, push GitHub, ghi bullet 'learned today', update milestone tracker. Không bắt đầu task mới.",
    note: "⚑ SHUTDOWN 17:00 — Sau đây não bộ chính thức nghỉ.",
  },
  {
    time: "17:00", min: 90, label: "🏋️ Gym — Kháng lực",
    type: "life",
    detail: "Sớm hơn 1.5h so với thời kỳ đi làm (trước là 18:45). 6 buổi/tuần. Giảm còn 4 khi W5 (thi SAA) và W8 (nộp thesis) nếu cần.",
    w56: "W5: Có thể giảm còn 4 buổi tuần thi. W6: Back to 6 buổi.",
    w78: "W7: 6 buổi bình thường. W8: Tuần nộp → giảm còn 3–4, dành tối thêm cho thesis nếu cần.",
  },
  {
    time: "18:30", min: 60, label: "Tắm + Ăn tối",
    type: "life",
    detail: "Tắm xong ăn ngon. Batch cook nếu chưa có đồ. Không mở laptop trong lúc ăn — meal time là meal time.",
    note: null,
  },
  {
    time: "19:30", min: 60, label: "📓 Evening Thesis — Conditional",
    type: "evening",
    detail: "Không phải deep work. Đây là 'light consolidation' — đọc lại những gì viết buổi sáng, ghi note cho ngày mai, đọc paper liên quan. Không code mới, không debug. Nếu hôm nay đã đạt đủ target thesis → OFF hoàn toàn, không guilt.",
    w56: "W5–W6: Chỉ làm nếu thesis target ngày hôm đó chưa đủ. Còn không → Steam, gọi về Gia Lai. Không force.",
    w78: "W7: Tương tự — chỉ làm khi chưa đủ quota. W8 (tuần nộp): Bắt buộc — 60–90 phút để hoàn thiện section còn thiếu.",
  },
  {
    time: "20:30", min: 90, label: "Personal Time + Wind Down",
    type: "life",
    detail: "Steam, series, gọi về Gia Lai. Ngủ trước 23:00. Không để 'tự do' làm drift giờ ngủ muộn dần — đây là lỗi phổ biến nhất tuần đầu sau Bosch.",
    note: null,
  },
];

const TYPE_META = {
  cloud:     { color: "#FF6B35", label: "CLOUD" },
  lc:        { color: "#a78bfa", label: "LEETCODE" },
  thesis:    { color: "#60a5fa", label: "THESIS" },
  interview: { color: "#22c55e", label: "INTERVIEW" },
  review:    { color: "#34d399", label: "REVIEW" },
  evening:   { color: "#f472b6", label: "EVENING" },
  life:      { color: "#444",    label: "" },
};

// Block-level math breakdown (corrected)
const MATH = [
  { label: "LeetCode",            h: 0.5,  color: "#a78bfa" },
  { label: "Cloud lab",           h: 2.0,  color: "#FF6B35" },
  { label: "Thesis #1",           h: 2.0,  color: "#60a5fa" },
  { label: "Thesis #2",           h: 1.5,  color: "#3a7fcc" },
  { label: "Interview prep",      h: 0.75, color: "#22c55e" },
  { label: "Evening (optional)",  h: 1.0,  color: "#f472b6", optional: true },
];

const RISKS = [
  {
    icon: "😴", title: "Sleep drift",
    desc: "Không còn alarm Bosch → ngủ đến 9–10h, mất buổi sáng tốt nhất.",
    fix: "07:00 wake-up cứng. Không phải 6:30, nhưng cũng không phải tùy ý.",
  },
  {
    icon: "🌀", title: "Infinite horizon trap",
    desc: "'Còn cả ngày' → không làm gì cả. Tự do không cấu trúc = procrastination tệ hơn cả bận.",
    fix: "Time-block như đang đi làm. 8:00–17:00 = office hours, không bargain.",
  },
  {
    icon: "🔥", title: "Volume quá cao",
    desc: "9h deep work một mình ở nhà = burnout sau 3 ngày. Cty có natural breaks (đi lại, nói chuyện, uống nước), nhà thì không.",
    fix: "Pomodoro 50/10 cho mọi block > 1h. Hard cap 6.5h study/ngày (không đếm evening).",
  },
  {
    icon: "🏠", title: "Home = comfort context",
    desc: "Giường, sofa, Steam cùng phòng với laptop. Não không phân biệt được 'giờ làm' và 'giờ nghỉ'.",
    fix: "Mặc quần áo ra ngoài trước khi ngồi vào laptop. Ritual nhỏ = signal lớn cho não.",
  },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function TransitionV2() {
  const [tab,      setTab]      = useState("schedule");
  const [phase,    setPhase]    = useState("w56");
  const [expanded, setExpanded] = useState(null);
  const [showOptional, setShowOptional] = useState(true);

  const cp = PHASES.find(p => p.key === phase);
  const studyBlocks = MATH.filter(b => !b.optional);
  const baseTotal   = studyBlocks.reduce((s, b) => s + b.h, 0);
  const fullTotal   = MATH.reduce((s, b) => s + b.h, 0);

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", background: "#080808", color: "#E0E0E0", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=Sora:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; background: #111; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; }
        .btn { transition: all 0.15s; cursor: pointer; border: none; font-family: inherit; }
        .btn:hover { opacity: 0.8; }
        .row { cursor: pointer; transition: background 0.08s; }
        .row:hover { background: rgba(255,255,255,0.025) !important; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ padding: "16px 22px 14px", borderBottom: "1px solid #161616" }}>
        <div style={{ fontSize: 8, color: "#FF6B35", letterSpacing: 4, marginBottom: 4, fontWeight: 700 }}>
          TRANSITION BRIEF V2 · POST-INTERNSHIP · W5–W8
        </div>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 19, fontWeight: 800, lineHeight: 1.2 }}>
          Strict nhưng không tự sát.<span style={{ color: "#FF6B35" }}>.</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 10, color: "#555", lineHeight: 1.7 }}>
          Office hours 08:00–17:00 · Shutdown cứng sau gym · Evening thesis = conditional, không phải bắt buộc
        </div>
      </div>

      {/* ── MATH SUMMARY — luôn hiển thị ── */}
      <div style={{ padding: "12px 22px", borderBottom: "1px solid #161616", background: "#0c0c0c" }}>
        <div style={{ fontSize: 7, color: "#444", letterSpacing: 3, marginBottom: 10, fontWeight: 700 }}>
          DAILY VOLUME — CORRECTED MATH
        </div>
        {/* Bar */}
        <div style={{ display: "flex", height: 20, borderRadius: 2, overflow: "hidden", gap: 1, marginBottom: 10 }}>
          {MATH.filter(b => showOptional || !b.optional).map((b, i) => (
            <div key={i} style={{ flex: b.h, background: b.color, opacity: b.optional ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              {b.optional && (
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.3) 3px, rgba(0,0,0,0.3) 6px)" }} />
              )}
            </div>
          ))}
        </div>
        {/* Legend + totals */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          {MATH.map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 1, background: b.color, opacity: b.optional ? 0.5 : 1 }} />
              <span style={{ fontSize: 9, color: b.optional ? "#555" : "#888" }}>
                {b.label} {b.h}h{b.optional ? " (opt)" : ""}
              </span>
            </div>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 7, color: "#444", letterSpacing: 2 }}>BASE (no evening)</div>
              <div style={{ fontSize: 16, color: "#22c55e", fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>{baseTotal.toFixed(1)}h</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 7, color: "#444", letterSpacing: 2 }}>W/ EVENING</div>
              <div style={{ fontSize: 16, color: "#f472b6", fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>{fullTotal.toFixed(1)}h</div>
            </div>
          </div>
        </div>
        {/* Toggle */}
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
          <button className="btn"
            onClick={() => setShowOptional(s => !s)}
            style={{ background: showOptional ? "#1a0a14" : "#111", border: `1px solid ${showOptional ? "#f472b640" : "#1e1e1e"}`, color: showOptional ? "#f472b6" : "#555", padding: "3px 10px", borderRadius: 2, fontSize: 9 }}>
            {showOptional ? "Evening: ON" : "Evening: OFF"}
          </button>
          <span style={{ fontSize: 9, color: "#444" }}>
            {showOptional
              ? "Evening thesis bật — chỉ dùng khi chưa đủ target ngày. W8: bắt buộc."
              : "Không có evening — 6.75h/ngày là đủ nếu execute tốt 08:00–17:00."}
          </span>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ display: "flex", borderBottom: "1px solid #161616", padding: "0 22px" }}>
        {[
          { key: "schedule", label: "Lịch mới" },
          { key: "risks",    label: "Rủi ro" },
          { key: "rules",    label: "Nguyên tắc" },
        ].map(t => (
          <button key={t.key} className="btn"
            onClick={() => setTab(t.key)}
            style={{ background: "transparent", color: tab === t.key ? "#FF6B35" : "#444", borderBottom: tab === t.key ? "2px solid #FF6B35" : "2px solid transparent", padding: "10px 14px", fontSize: 9, letterSpacing: 1.5, fontWeight: tab === t.key ? 700 : 400 }}>
            {t.label.toUpperCase()}
          </button>
        ))}
        {/* Phase selector in header */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center", padding: "6px 0" }}>
          {PHASES.map(p => (
            <button key={p.key} className="btn"
              onClick={() => setPhase(p.key)}
              style={{ background: phase === p.key ? p.color : "#111", color: phase === p.key ? "#000" : "#555", border: phase === p.key ? "none" : "1px solid #1e1e1e", padding: "3px 10px", borderRadius: 2, fontSize: 9, fontWeight: phase === p.key ? 700 : 400 }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── SCHEDULE ── */}
      {tab === "schedule" && (
        <div style={{ padding: "0 22px 32px" }}>
          <div style={{ padding: "10px 0 6px", fontSize: 9, color: cp.color, fontStyle: "italic", borderBottom: "1px solid #111" }}>
            {cp.title} · Click vào block để xem chi tiết theo phase
          </div>

          {SCHEDULE.map((blk, i) => {
            const meta = TYPE_META[blk.type];
            const isExp  = expanded === i;
            const dim    = blk.type === "life";
            const isEve  = blk.type === "evening";
            const phaseNote = blk[phase];
            const isShutdown = !!blk.note?.includes("SHUTDOWN");

            return (
              <div key={i}>
                {/* Shutdown divider */}
                {isShutdown && (
                  <div style={{ margin: "4px -22px 0", padding: "6px 22px", background: "#0d0d0d", borderTop: "1px solid #1e1e1e", borderBottom: "1px solid #1e1e1e", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, height: 1, background: "#1e1e1e" }} />
                    <div style={{ fontSize: 8, color: "#34d399", letterSpacing: 2, fontWeight: 700 }}>⬇ SHUTDOWN 17:00 — STUDY ENDS HERE</div>
                    <div style={{ flex: 1, height: 1, background: "#1e1e1e" }} />
                  </div>
                )}

                <div className="row"
                  onClick={() => setExpanded(isExp ? null : i)}
                  style={{
                    display: "grid", gridTemplateColumns: "54px 3px 1fr",
                    gap: "0 10px", borderBottom: "1px solid #0f0f0f",
                    background: isExp ? (dim ? "#0e0e0e" : "#0f0f0f") : "transparent",
                    margin: "0 -22px", padding: isExp ? "12px 22px" : "10px 22px",
                    alignItems: "start",
                    opacity: isEve && !showOptional ? 0.4 : 1,
                  }}>
                  <div style={{ fontSize: 10, color: "#383838", fontVariantNumeric: "tabular-nums", paddingTop: 1 }}>
                    {blk.time}
                    <div style={{ fontSize: 7, color: "#2a2a2a", marginTop: 2 }}>{blk.min}m</div>
                  </div>

                  <div style={{ background: meta.color, opacity: dim ? 0.12 : isEve ? 0.4 : 0.6, borderRadius: 1, alignSelf: "stretch", minHeight: 18, marginTop: 1 }} />

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, color: dim ? "#555" : "#ddd", fontWeight: dim ? 400 : 600 }}>
                        {blk.label}
                      </span>
                      {meta.label && (
                        <span style={{ fontSize: 7, color: meta.color, border: `1px solid ${meta.color}35`, padding: "1px 5px", borderRadius: 2, letterSpacing: 1 }}>
                          {meta.label}
                        </span>
                      )}
                      {isEve && (
                        <span style={{ fontSize: 7, color: "#f472b660", border: "1px solid #f472b625", padding: "1px 5px", borderRadius: 2 }}>
                          OPTIONAL W5–W7 · REQUIRED W8
                        </span>
                      )}
                      {blk.type === "cloud" && (
                        <span style={{ fontSize: 7, color: "#FF6B3580", border: "1px solid #FF6B3525", padding: "1px 5px", borderRadius: 2 }}>
                          POMODORO 50/10
                        </span>
                      )}
                      {blk.type === "thesis" && blk.label.includes("#1") && (
                        <span style={{ fontSize: 7, color: "#60a5fa80", border: "1px solid #60a5fa25", padding: "1px 5px", borderRadius: 2 }}>
                          POMODORO 50/10
                        </span>
                      )}
                      <span style={{ fontSize: 8, color: "#2a2a2a", marginLeft: "auto" }}>{isExp ? "▲" : "▼"}</span>
                    </div>

                    {isExp && (
                      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ fontSize: 11, color: "#888", lineHeight: 1.75 }}>{blk.detail}</div>
                        {phaseNote && (
                          <div style={{ fontSize: 11, color: meta.color, background: `${meta.color}0d`, border: `1px solid ${meta.color}20`, padding: "8px 12px", borderRadius: 3, lineHeight: 1.65 }}>
                            <span style={{ fontSize: 7, letterSpacing: 2, opacity: 0.5 }}>{cp.label} → </span>
                            <br />{phaseNote}
                          </div>
                        )}
                        {isEve && (
                          <div style={{ fontSize: 10, color: "#f472b6", background: "#1a0a1440", border: "1px solid #f472b620", padding: "8px 12px", borderRadius: 3, lineHeight: 1.6 }}>
                            Nếu đã đạt target thesis ban ngày → tắt laptop, mở Steam, gọi về Gia Lai. Không có gì để prove ở đây. W8 là ngoại lệ duy nhất — tuần đó bắt buộc.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── RISKS ── */}
      {tab === "risks" && (
        <div style={{ padding: "20px 22px 32px" }}>
          <div style={{ fontSize: 10, color: "#555", marginBottom: 20, lineHeight: 1.7 }}>
            Tuần đầu sau Bosch là tuần nguy hiểm nhất. 4 trap dưới đây xuất hiện theo thứ tự — không phải ngẫu nhiên.
          </div>
          {RISKS.map((r, i) => (
            <div key={i} style={{ marginBottom: 14, border: "1px solid #1a1a1a", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ background: "#111", padding: "12px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{r.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#ddd", marginBottom: 4 }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: "#666", lineHeight: 1.65 }}>{r.desc}</div>
                </div>
              </div>
              <div style={{ background: "#0d1a0d", borderTop: "1px solid #22c55e15", padding: "10px 16px", display: "flex", gap: 10 }}>
                <span style={{ fontSize: 8, color: "#22c55e", letterSpacing: 2, fontWeight: 700, flexShrink: 0, paddingTop: 1 }}>FIX</span>
                <span style={{ fontSize: 11, color: "#8aaa8a", lineHeight: 1.6 }}>{r.fix}</span>
              </div>
            </div>
          ))}

          <div style={{ background: "#1a0d00", border: "1px solid #FF6B3540", borderRadius: 4, padding: 16, marginTop: 8 }}>
            <div style={{ fontSize: 8, color: "#FF6B35", letterSpacing: 2, marginBottom: 10, fontWeight: 700 }}>⚠ NGÀY ĐẦU TIÊN SAU BOSCH</div>
            <div style={{ fontSize: 11, color: "#cc8855", lineHeight: 1.75 }}>
              Ngày đầu tiên không đi Bosch: execute lịch mới ngay, không cho phép "relax 1 ngày trước khi bắt đầu". Cảm giác vacation sẽ rất mạnh — nhưng W5 cũng là tuần thi SAA. Không có buffer. Mở máy lúc 8:00, làm LC, không thương lượng.
            </div>
          </div>
        </div>
      )}

      {/* ── RULES ── */}
      {tab === "rules" && (
        <div style={{ padding: "20px 22px 32px" }}>
          <div style={{ fontSize: 10, color: "#555", marginBottom: 20, lineHeight: 1.7 }}>
            5 nguyên tắc không thương lượng cho W5–W8. Không phải guidelines — là rules.
          </div>

          {[
            {
              n: "01", color: "#FF6B35",
              title: "07:00 wake-up — cứng",
              body: "Không còn Bosch alarm nhưng vẫn phải có anchor. 07:00, không trễ hơn. Mỗi ngày sleep drift 30 phút là mất 3.5h/tuần buổi sáng tốt nhất.",
            },
            {
              n: "02", color: "#a78bfa",
              title: "LC xong trước 08:30 — không bargain",
              body: "Đây là anchor của ngày. Nếu hôm nay chỉ làm được 1 thứ, LC vẫn phải xong. Làm trước khi mở thesis, cloud, hay bất cứ thứ gì khác.",
            },
            {
              n: "03", color: "#FF6B35",
              title: "Pomodoro 50/10 cho mọi block > 60 phút",
              body: "Cloud 2h và Thesis #1 2h đều phải dùng Pomodoro. 10 phút break = đứng dậy thật sự, không scroll. Không có Pomodoro = brain fog sau 70 phút = output tệ hơn.",
            },
            {
              n: "04", color: "#34d399",
              title: "Shutdown 17:00 — sau đây là của bạn",
              body: "Commit code, push GitHub, đóng laptop đúng 17:00. Sau gym về: Steam, series, gọi về Gia Lai. Không check Slack, không 'xem nhanh 1 cái'. Não cần biết khi nào được nghỉ.",
            },
            {
              n: "05", color: "#f472b6",
              title: "Evening thesis = reward system, không phải obligation",
              body: "Nếu ban ngày đã đủ target → không mở laptop tối. Nếu chưa đủ → làm 60 phút light consolidation, không code nặng. W8 là ngoại lệ duy nhất: bắt buộc làm đủ.",
            },
          ].map((r, i) => (
            <div key={i} style={{ marginBottom: 16, display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ background: r.color, color: "#000", fontSize: 11, fontWeight: 800, padding: "4px 8px", borderRadius: 2, flexShrink: 0, minWidth: 32, textAlign: "center" }}>
                {r.n}
              </div>
              <div style={{ borderLeft: `2px solid ${r.color}30`, paddingLeft: 14, flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#ddd", marginBottom: 6 }}>{r.title}</div>
                <div style={{ fontSize: 11, color: "#777", lineHeight: 1.7 }}>{r.body}</div>
              </div>
            </div>
          ))}

          {/* Weekly flex note */}
          <div style={{ marginTop: 8, background: "#0a1020", border: "1px solid #60a5fa25", borderRadius: 4, padding: 16 }}>
            <div style={{ fontSize: 8, color: "#60a5fa", letterSpacing: 2, marginBottom: 10, fontWeight: 700 }}>FLEX THEO TUẦN</div>
            {[
              { week: "W5", note: "Thi SAA cuối tuần → tăng cloud review, giảm thesis. Gym 4–5 buổi.", color: "#81B29A" },
              { week: "W6", note: "Project 1 finish + thesis chapter 2. Gym back to 6 buổi.", color: "#81B29A" },
              { week: "W7", note: "Terraform + GitOps + thesis chapter 3–4. Nhịp bình thường.", color: "#E07A5F" },
              { week: "W8", note: "Deadline tuần: Evening bắt buộc. Gym giảm còn 3–4. Tất cả cho thesis + portfolio.", color: "#E07A5F" },
            ].map((w, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 12, marginBottom: 8 }}>
                <div style={{ background: w.color, color: "#000", fontSize: 9, fontWeight: 800, padding: "2px 0", borderRadius: 2, textAlign: "center" }}>{w.week}</div>
                <div style={{ fontSize: 11, color: "#888", lineHeight: 1.55 }}>{w.note}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <div style={{ borderTop: "1px solid #111", padding: "10px 22px", background: "#050505", display: "flex", gap: 16, flexWrap: "wrap" }}>
        {[
          { l: "BASE (no evening)", v: `${baseTotal.toFixed(1)}h/ngày`, c: "#22c55e" },
          { l: "W/ EVENING",       v: `${fullTotal.toFixed(1)}h/ngày`, c: "#f472b6" },
          { l: "VS. V1 (sai)",     v: "9.5h ❌ fixed", c: "#ef4444" },
          { l: "SHUTDOWN",         v: "17:00 cứng",    c: "#34d399" },
          { l: "EVENING W8",       v: "Required",      c: "#f472b6" },
        ].map((s, i) => (
          <div key={i}>
            <div style={{ fontSize: 7, color: "#333", letterSpacing: 2 }}>{s.l}</div>
            <div style={{ fontSize: 11, color: s.c, fontWeight: 600, marginTop: 1 }}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
