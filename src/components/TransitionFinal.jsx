import { useState } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const PHASES = [
  { key: "w56", label: "W5–W6", color: "#81B29A", title: "SAA Exam + Project 1 Finish" },
  { key: "w78", label: "W7–W8", color: "#E07A5F", title: "IaC + GitOps + Thesis Submit" },
];

// Thesis daily targets — định lượng rõ "đủ target"
const THESIS_TARGETS = {
  w56: [
    { week: "W5", targets: ["NER pipeline: inference chạy được trên ≥10 CV mẫu", "Precision@5 có số liệu cụ thể (ghi vào doc)", "Chapter 2 outline: ≥5 bullet/section"] },
    { week: "W6", targets: ["FastAPI /recommend endpoint: trả kết quả trong <2s", "Streamlit UI: upload CV → hiện kết quả end-to-end", "README thesis repo: architecture diagram + usage"] },
  ],
  w78: [
    { week: "W7", targets: ["Chapter 3 methodology: ≥500 từ/ngày", "Chapter 4 results: bảng số liệu điền xong", "Figure/chart: ít nhất 1 hình/ngày"] },
    { week: "W8", targets: ["Polish pass: sửa tất cả comment supervisor", "Citation check: format chuẩn toàn bộ", "Submit-ready: PDF generate, đọc lại 1 lần cuối"] },
  ],
};

// WEEKDAY blocks — corrected math, Pomodoro, conditional evening
const WEEKDAY = [
  { time: "07:00", min: 30,  label: "Wake up + Plan ngày",      type: "life",
    detail: "07:00 cứng — không bargain dù không còn Bosch alarm. Viết 3 priority ra giấy trước khi mở laptop. Uống nước, ánh sáng tự nhiên.",
    w56: null, w78: null },
  { time: "07:30", min: 30,  label: "Ăn sáng",                  type: "life",
    detail: "Ăn no. Không mở laptop trước 08:00. Não cần glucose trước deep work, không phải notifications.",
    w56: null, w78: null },
  { time: "08:00", min: 30,  label: "🧠 LeetCode — Anchor",      type: "lc",
    detail: "1 bài Easy/ngày. Timer 25 phút. Xong mới được mở bất cứ thứ gì. Đây là anchor — nếu hôm nay chỉ làm được 1 thứ, LC vẫn phải xong.",
    w56: "W5: Binary Search, Tree BFS/DFS — 3 bài cuối để đạt 30. W6: LC = 30 ✅, dùng slot này explain solution tiếng Anh to.",
    w78: "W7–W8: LC done. 30 phút này: review 1 pattern yếu + explain bằng tiếng Anh như đang interview." },
  { time: "08:30", min: 120, label: "☁️ Cloud Lab Heavy [2× Pomodoro 50/10]", type: "cloud",
    detail: "Wifi nhà, không giới hạn data. 2 vòng Pomodoro: 50 phút code → 10 phút đứng dậy thật sự. KHÔNG ngồi liên tục 2h.",
    w56: "W5: Full practice exam SAA × 2 (sáng 1 lần, chiều review sai, thi cuối tuần). W6: EKS + ALB + CodePipeline — Bee-Shoeshop production-ready.",
    w78: "W7: Terraform VPC+EKS module từ đầu — kiểm tra state file, module output. W8: ArgoCD + kube-prometheus-stack via Helm, demo script viết sẵn." },
  { time: "10:30", min: 30,  label: "Break bắt buộc",            type: "life",
    detail: "Ra ngoài ban công hoặc xuống đường. Không scroll điện thoại. Không ngồi thêm vào ghế. 30 phút này quyết định chất lượng thesis block tiếp theo.",
    w56: null, w78: null },
  { time: "11:00", min: 120, label: "📓 Thesis Deep Work #1 [2× Pomodoro 50/10]", type: "thesis",
    detail: "Slot thesis nặng nhất — não còn fresh sau break. Code thật, run thật, viết thật. Không để Zalo/Discord mở. 2 Pomodoro 50/10.",
    w56: "W5: NER inference pipeline + precision@5 evaluation. W6: FastAPI endpoint + Streamlit UI end-to-end.",
    w78: "W7: Chapter 3 — methodology + results (target ≥500 từ). W8: Chapter 4 — analysis + conclusion." },
  { time: "13:00", min: 60,  label: "Ăn trưa + Nghỉ",            type: "life",
    detail: "Đồ meal prep sẵn. Nghỉ 20–30p sau ăn — không laptop. Không phải lãng phí, đây là recovery để chiều không bị brain fog.",
    w56: null, w78: null },
  { time: "14:00", min: 90,  label: "📓 Thesis Deep Work #2",    type: "thesis",
    detail: "Tiếp tục thesis nhưng task nhẹ hơn buổi sáng: GitHub update, README, architecture diagram, figure generation, evaluation docs.",
    w56: "W5: Thesis chapter 2 outline + research notes. W6: GitHub README + architecture diagram + cost estimate.",
    w78: "W7: Thesis chapter 3–4 polish, figures, citations. W8: Final review — formatting, submit checklist." },
  { time: "15:30", min: 45,  label: "🎤 Interview Prep — Nói to", type: "interview",
    detail: "Nói to, record lại. Không gõ. Toàn bộ nhà = của bạn, không ngại nói to. 45 phút cho 1 mock topic sâu.",
    w56: "W5: 'Walk me through Bee-Shoeshop architecture' — camera on, re-record đến khi fluent. W6: System design: 'CI/CD for 50 microservices on K8s'.",
    w78: "W7: Mock behavioral full 30 phút — record, watch back, note gaps. W8: Demo video quay + LinkedIn post draft." },
  { time: "16:15", min: 45,  label: "Wrap-up + Daily Review",    type: "review",
    detail: "Commit code, push GitHub, ghi 3 bullet 'learned today'. Update milestone tracker. KHÔNG bắt đầu task mới. Shutdown đúng 17:00.",
    w56: null, w78: null, shutdown: true },
  { time: "17:00", min: 90,  label: "🏋️ Gym — Kháng lực",        type: "life",
    detail: "Sớm hơn 1.5h so với thời Bosch. 6 buổi/tuần. Giảm còn 4 khi W5 (thi SAA) hoặc W8 (nộp thesis).",
    w56: "W5: Giảm còn 4 buổi tuần thi. W6: Back to 6 buổi.", w78: "W7: 6 buổi. W8: Giảm còn 3–4 nếu cần." },
  { time: "18:30", min: 60,  label: "Tắm + Ăn tối",              type: "life",
    detail: "Đồ meal prep sẵn. Không mở laptop trong lúc ăn.", w56: null, w78: null },
  { time: "19:30", min: 60,  label: "📓 Evening Thesis [Optional]", type: "evening",
    detail: "Light consolidation — đọc lại ghi chép buổi sáng, ghi note cho ngày mai, đọc paper liên quan. Không code mới, không debug. Chỉ làm khi CHƯA đạt thesis target ngày. W8: bắt buộc.",
    w56: "W5–W6: Chỉ bật nếu target ngày chưa đủ (xem tab Thesis Targets). Còn không → Steam, gọi Gia Lai.",
    w78: "W7: Tương tự, không force. W8: Bắt buộc 60–90 phút — tuần nộp không có off." },
  { time: "20:30", min: 90,  label: "Personal Time + Wind Down", type: "life",
    detail: "Steam, series, gọi về Gia Lai. Ngủ trước 23:00. Không để 'tự do' làm drift giờ ngủ muộn dần — đây là lỗi phổ biến nhất tuần đầu sau Bosch.",
    w56: null, w78: null },
];

// WEEKEND — heavy lab + no commute, later wake
const WEEKEND = [
  { time: "07:30", min: 60,  label: "Wake up tự nhiên + Ăn sáng", type: "life",
    detail: "Không alarm cứng cuối tuần. Ăn sáng ngon, không vội — ngày dài, tiết kiệm energy đầu ngày.",
    w56: null, w78: null },
  { time: "08:30", min: 120, label: "☁️ Cloud Lab HEAVY — Session 1", type: "cloud",
    detail: "Slot cloud nặng nhất trong tuần. Wifi nhà, không giới hạn. EKS cluster, Terraform apply, Docker build, CI/CD pipeline chạy nhiều lần. Pomodoro 50/10.",
    w56: "W5: Full mock exam 65 câu × 2 (sáng thi, chiều review). W6: EKS + ALB full deploy + troubleshoot.",
    w78: "W7: Terraform state + module testing. W8: ArgoCD sync + Prometheus alert rules — demo dry run." },
  { time: "10:30", min: 30,  label: "Break", type: "life",
    detail: "Đứng dậy bắt buộc. Pha cafe, ra ngoài 10 phút.", w56: null, w78: null },
  { time: "11:00", min: 90,  label: "📓 Thesis Sprint #1",        type: "thesis",
    detail: "Code thật, run thật, wifi mạnh. Slot thesis nặng cuối tuần — không interrupt.",
    w56: "W5: NER training run nếu cần + kết quả evaluation. W6: Thesis chapter 2 viết — methodology section.",
    w78: "W7: Thesis chapter 3–4 draft tiếp. W8: Final polish pass — sửa theo feedback supervisor." },
  { time: "12:30", min: 90,  label: "Ăn trưa + Nghỉ + Meal Prep", type: "life",
    detail: "Nấu ăn batch cho cả tuần trong slot này. Ngủ trưa 30p nếu cần. Không guilt về thời gian này — meal prep tiết kiệm 30p/ngày weekday.",
    w56: null, w78: null },
  { time: "14:00", min: 90,  label: "📓 Thesis Sprint #2 / Portfolio", type: "thesis",
    detail: "Tiếp tục thesis hoặc chuyển sang portfolio: GitHub update, README, architecture diagram, CV cập nhật.",
    w56: "W5: Thesis outline tiếp. W6: GitHub repo README + portfolio update.", w78: "W7: Thesis polish. W8: Demo video 3 phút quay + LinkedIn post." },
  { time: "15:30", min: 60,  label: "🎤 Interview Prep — Record", type: "interview",
    detail: "Weekend: 1h thay vì 45 phút. Nói to, record, watch back, re-record.",
    w56: "W5: 'Explain your thesis project' — 2 phút tiếng Anh. W6: Mock system design camera on.", w78: "W7: Full mock behavioral 30 phút. W8: Demo video tiếp + portfolio review." },
  { time: "16:30", min: 30,  label: "🧠 LeetCode × 2",            type: "lc",
    detail: "Weekend: 2 bài thay vì 1. Retry bài fail trong tuần. Explain solution tiếng Anh to — luyện communication.",
    w56: null, w78: null },
  { time: "17:00", min: 60,  label: "🏃 Cardio / Outdoor",        type: "life",
    detail: "Đổi gió: chạy bộ, nhảy dây ngoài trời. Không gym tạ cuối tuần — cơ cần nghỉ, não cần không khí.",
    w56: null, w78: null },
  { time: "18:00", min: 90,  label: "Nấu ăn + Ăn tối",           type: "life",
    detail: "Batch cook thêm nếu cần. Ăn tối thoải mái — không vội.", w56: null, w78: null },
  { time: "19:30", min: 60,  label: "📊 Weekly Review",           type: "review",
    detail: "Check milestone tracker: LC count, cloud deliverable, thesis target, interview progress. Adjust tuần tới nếu miss ≥2 milestone.",
    w56: "W5: Check: LC=30✅, SAA exam booked, NER pipeline chạy ok, mock interview recorded. W6: Check: Bee-Shoeshop live, chapter 2 draft có.",
    w78: "W7: Check: Terraform done, thesis chương 3-4 draft. W8: Check: Thesis submitted✅, Project 2 demo live." },
  { time: "20:30", min: 150, label: "Weekend Wind Down",          type: "life",
    detail: "Game, phim, gọi về Gia Lai. Xả hơi 100%. Thứ 2 sẽ full năng lượng hơn nếu cuối tuần thật sự nghỉ.",
    w56: null, w78: null },
];

// Milestones W5–W8 — clickable
const MILESTONES = [
  { week: "W5", color: "#81B29A",
    major: "🎯 AWS SAA-C03 EXAM",
    items: [
      { cat: "☁️ Cloud",    val: "Practice exam ≥80%. Thi SAA cuối tuần. Pass." },
      { cat: "🧠 LC",       val: "30 bài ✅ — đạt target toàn roadmap" },
      { cat: "📓 Thesis",   val: "NER pipeline hoàn chỉnh. Precision@5 có số liệu." },
      { cat: "🎤 Interview", val: "Record 'Bee-Shoeshop architecture' fluent < 2 phút." },
    ]},
  { week: "W6", color: "#E07A5F",
    major: "⭐ Project 1: Bee-Shoeshop on EKS LIVE",
    items: [
      { cat: "☁️ Cloud",    val: "EKS + ALB + CodePipeline live. CI/CD push-to-deploy ok." },
      { cat: "🧠 LC",       val: "Maintain 30. Review 1 pattern/ngày tiếng Anh." },
      { cat: "📓 Thesis",   val: "FastAPI + Streamlit end-to-end. Chapter 2 draft có." },
      { cat: "🎤 Interview", val: "System design mock: 'CI/CD for 50 microservices' — recorded." },
    ]},
  { week: "W7", color: "#D4A5A5",
    major: null,
    items: [
      { cat: "☁️ Cloud",    val: "Terraform VPC+EKS module done. State file clean." },
      { cat: "🧠 LC",       val: "Maintain 30. Explain pattern bằng tiếng Anh hàng ngày." },
      { cat: "📓 Thesis",   val: "Chapter 3–4 draft xong. Figures + bảng số liệu có." },
      { cat: "🎤 Interview", val: "Full behavioral mock 30 phút — recorded + reviewed." },
    ]},
  { week: "W8", color: "#F4D03F",
    major: "🎯 Thesis SUBMITTED + Project 2 LIVE + Portfolio READY",
    items: [
      { cat: "☁️ Cloud",    val: "ArgoCD + Prometheus stack. Project 2 demo script chạy ok." },
      { cat: "🧠 LC",       val: "30 ✅. Demo video: explain 1 solution tiếng Anh." },
      { cat: "📓 Thesis",   val: "🎯 SUBMITTED. PDF clean, format chuẩn." },
      { cat: "🎤 Interview", val: "LinkedIn post + README + demo video 3 phút DONE." },
    ]},
];

// Buffer system — nếu ngày bị interrupt
const BUFFER_RULES = [
  { trigger: "Việc nhà đột xuất < 30 phút", action: "Cắt Break 30p (10:30) — đây là buffer đầu tiên, không ảnh hưởng study." },
  { trigger: "Việc nhà 30–60 phút", action: "Cắt Interview Prep (15:30) — thesis và cloud được bảo vệ trước." },
  { trigger: "Interrupt > 60 phút hoặc cả buổi sáng", action: "Kích hoạt Evening Thesis bắt buộc hôm đó — không phải optional." },
  { trigger: "Ngày mất hoàn toàn (bệnh, việc gia đình)", action: "Không cố bù trong ngày. Ghi log, adjust milestone tuần sau. 1 ngày miss không phá được cả roadmap." },
  { trigger: "2+ ngày miss trong 1 tuần", action: "Sunday review: assess lại milestone tuần đó, shift non-critical task sang tuần sau. Cloud lab > Thesis > Interview > LC (thứ tự ưu tiên bảo vệ)." },
];

const TYPE_META = {
  cloud:     { color: "#FF6B35", label: "CLOUD" },
  lc:        { color: "#a78bfa", label: "LEETCODE" },
  thesis:    { color: "#60a5fa", label: "THESIS" },
  interview: { color: "#22c55e", label: "INTERVIEW" },
  review:    { color: "#34d399", label: "REVIEW" },
  evening:   { color: "#f472b6", label: "EVENING" },
  life:      { color: "#333",    label: "" },
};

const MATH_BASE = [
  { label: "LC",          h: 0.5,  color: "#a78bfa" },
  { label: "Cloud",       h: 2.0,  color: "#FF6B35" },
  { label: "Thesis #1",   h: 2.0,  color: "#60a5fa" },
  { label: "Thesis #2",   h: 1.5,  color: "#3a7fcc" },
  { label: "Interview",   h: 0.75, color: "#22c55e" },
  { label: "Eve (opt)",   h: 1.0,  color: "#f472b6", optional: true },
];

const TABS = [
  { key: "weekday",  label: "Weekday" },
  { key: "weekend",  label: "Weekend" },
  { key: "targets",  label: "Thesis Targets" },
  { key: "milestones", label: "Milestones" },
  { key: "buffer",   label: "Buffer" },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function TransitionFinal() {
  const [tab,      setTab]      = useState("weekday");
  const [phase,    setPhase]    = useState("w56");
  const [expanded, setExpanded] = useState(null);
  const [eveOn,    setEveOn]    = useState(false);
  const [lcCount,  setLcCount]  = useState(0);
  const [msDone,   setMsDone]   = useState({});

  const cp       = PHASES.find(p => p.key === phase);
  const blocks   = tab === "weekend" ? WEEKEND : WEEKDAY;
  const baseH    = MATH_BASE.filter(b => !b.optional).reduce((s, b) => s + b.h, 0);
  const fullH    = MATH_BASE.reduce((s, b) => s + b.h, 0);
  const toggleMs = (k) => setMsDone(d => ({ ...d, [k]: !d[k] }));

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
        .dot { cursor: pointer; transition: transform 0.1s; user-select: none; }
        .dot:hover { transform: scale(1.2); }
        .dot:active { transform: scale(0.9); }
        .ms { cursor: pointer; transition: background 0.1s; }
        .ms:hover { background: rgba(255,255,255,0.02); }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ padding: "14px 22px 12px", borderBottom: "1px solid #161616" }}>
        <div style={{ fontSize: 8, color: "#FF6B35", letterSpacing: 4, marginBottom: 3, fontWeight: 700 }}>
          TRANSITION FINAL · POST-INTERNSHIP · W5–W8
        </div>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, lineHeight: 1.2 }}>
          Full-day sprint tại nhà — có cấu trúc.<span style={{ color: "#FF6B35" }}>.</span>
        </div>

        {/* Timing anchors */}
        <div style={{ marginTop: 10, display: "flex", gap: 5, flexWrap: "wrap" }}>
          {[
            { e: "⏰", l: "Wake", v: "07:00" }, { e: "📖", l: "Study start", v: "08:00" },
            { e: "🛑", l: "Shutdown", v: "17:00" }, { e: "🏋️", l: "Gym", v: "17:00–18:30" },
            { e: "😴", l: "Ngủ", v: "< 23:00" },
          ].map((t, i) => (
            <div key={i} style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 2, padding: "3px 8px", display: "flex", gap: 5, alignItems: "center" }}>
              <span style={{ fontSize: 10 }}>{t.e}</span>
              <div>
                <div style={{ fontSize: 6, color: "#444", letterSpacing: 1 }}>{t.l}</div>
                <div style={{ fontSize: 9, color: "#bbb", fontWeight: 600 }}>{t.v}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── LC TRACKER ── */}
      <div style={{ padding: "10px 22px", borderBottom: "1px solid #161616", background: "#0c0a18", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 7, color: "#a78bfa", letterSpacing: 3, marginBottom: 8, fontWeight: 700 }}>
            LEETCODE · 1/NGÀY WEEKDAY · 2/NGÀY WEEKEND
          </div>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap", maxWidth: 380, position: "relative", paddingTop: 14 }}>
            {Array.from({ length: 30 }).map((_, i) => {
              const marks = { 0: "W5", 7: "W6", 14: "W7", 21: "W8" };
              return (
                <div key={i} style={{ position: "relative" }}>
                  {marks[i] && (
                    <div style={{ position: "absolute", top: -13, left: 0, fontSize: 6, color: "#555", whiteSpace: "nowrap" }}>{marks[i]}</div>
                  )}
                  <div className="dot"
                    onClick={() => setLcCount(i < lcCount ? i : i + 1)}
                    title={`Bài ${i + 1}`}
                    style={{ width: 15, height: 15, borderRadius: 2, background: i < lcCount ? "#a78bfa" : "#1a1630", border: i < lcCount ? "none" : "1px solid #252040" }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: "#a78bfa" }}>
          {lcCount}<span style={{ fontSize: 12, color: "#333" }}>/30</span>
        </div>
        <div style={{ display: "flex", gap: 6, flexDirection: "column" }}>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn dot" onClick={() => setLcCount(Math.max(0, lcCount - 1))}
              style={{ background: "#1a1630", border: "1px solid #252040", color: "#777", padding: "4px 10px", borderRadius: 2, fontSize: 11 }}>−</button>
            <button className="btn dot" onClick={() => setLcCount(Math.min(30, lcCount + 1))}
              style={{ background: "#a78bfa", border: "none", color: "#000", padding: "4px 12px", borderRadius: 2, fontSize: 11, fontWeight: 700 }}>+ Done</button>
          </div>
          <div style={{ fontSize: 9, color: lcCount >= 30 ? "#a78bfa" : "#333", fontWeight: lcCount >= 30 ? 700 : 400 }}>
            {lcCount >= 30 ? "🎯 TARGET REACHED" : `${30 - lcCount} bài còn lại`}
          </div>
        </div>
      </div>

      {/* ── MATH BAR ── */}
      <div style={{ padding: "10px 22px", borderBottom: "1px solid #161616", background: "#0a0a0a" }}>
        <div style={{ fontSize: 7, color: "#444", letterSpacing: 3, marginBottom: 8, fontWeight: 700 }}>DAILY STUDY VOLUME</div>
        <div style={{ display: "flex", height: 18, borderRadius: 2, overflow: "hidden", gap: 1, marginBottom: 8 }}>
          {MATH_BASE.filter(b => eveOn || !b.optional).map((b, i) => (
            <div key={i} style={{ flex: b.h, background: b.color, opacity: b.optional ? 0.5 : 1 }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          {MATH_BASE.map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: 1, background: b.color, opacity: b.optional ? 0.5 : 1 }} />
              <span style={{ fontSize: 8, color: b.optional ? "#555" : "#777" }}>{b.label} {b.h}h</span>
            </div>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
            <button className="btn" onClick={() => setEveOn(e => !e)}
              style={{ background: eveOn ? "#1a0a14" : "#111", border: `1px solid ${eveOn ? "#f472b640" : "#1a1a1a"}`, color: eveOn ? "#f472b6" : "#555", padding: "2px 8px", borderRadius: 2, fontSize: 8 }}>
              Eve {eveOn ? "ON" : "OFF"}
            </button>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 7, color: "#444", letterSpacing: 1 }}>{eveOn ? "W/ EVENING" : "BASE ONLY"}</div>
              <div style={{ fontSize: 15, color: eveOn ? "#f472b6" : "#22c55e", fontWeight: 700, fontFamily: "'Sora',sans-serif" }}>
                {(eveOn ? fullH : baseH).toFixed(2)}h
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{ display: "flex", borderBottom: "1px solid #161616", padding: "0 22px", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.key} className="btn" onClick={() => { setTab(t.key); setExpanded(null); }}
            style={{ background: "transparent", color: tab === t.key ? "#FF6B35" : "#444", borderBottom: tab === t.key ? "2px solid #FF6B35" : "2px solid transparent", padding: "9px 12px", fontSize: 9, letterSpacing: 1.2, fontWeight: tab === t.key ? 700 : 400, whiteSpace: "nowrap" }}>
            {t.label.toUpperCase()}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center", padding: "4px 0" }}>
          {PHASES.map(p => (
            <button key={p.key} className="btn" onClick={() => setPhase(p.key)}
              style={{ background: phase === p.key ? p.color : "#111", color: phase === p.key ? "#000" : "#555", border: phase === p.key ? "none" : "1px solid #1a1a1a", padding: "3px 10px", borderRadius: 2, fontSize: 9, fontWeight: phase === p.key ? 700 : 400 }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── SCHEDULE VIEWS ── */}
      {(tab === "weekday" || tab === "weekend") && (
        <div style={{ padding: "0 22px 32px" }}>
          {/* Legend */}
          <div style={{ padding: "8px 0", display: "flex", gap: 10, flexWrap: "wrap", borderBottom: "1px solid #111", marginBottom: 2 }}>
            {Object.entries(TYPE_META).filter(([k]) => k !== "life").map(([k, v]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: 1, background: v.color }} />
                <span style={{ fontSize: 7, color: "#444" }}>{v.label}</span>
              </div>
            ))}
          </div>

          {blocks.map((blk, i) => {
            const meta  = TYPE_META[blk.type] || TYPE_META.life;
            const isExp = expanded === i;
            const dim   = blk.type === "life";
            const isEve = blk.type === "evening";
            const pd    = blk[phase];

            return (
              <div key={i}>
                {blk.shutdown && (
                  <div style={{ margin: "2px -22px", padding: "5px 22px", background: "#0a0a0a", borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, height: 1, background: "#1e1e1e" }} />
                    <div style={{ fontSize: 7, color: "#34d399", letterSpacing: 2, fontWeight: 700 }}>⬇ SHUTDOWN 17:00 — STUDY ENDS HERE</div>
                    <div style={{ flex: 1, height: 1, background: "#1e1e1e" }} />
                  </div>
                )}
                <div className="row" onClick={() => setExpanded(isExp ? null : i)}
                  style={{ display: "grid", gridTemplateColumns: "50px 3px 1fr", gap: "0 10px", borderBottom: "1px solid #0f0f0f", background: isExp ? "#0d0d0d" : "transparent", margin: "0 -22px", padding: isExp ? "11px 22px" : "9px 22px", alignItems: "start", opacity: isEve && !eveOn ? 0.35 : 1 }}>
                  <div style={{ fontSize: 9, color: "#383838", fontVariantNumeric: "tabular-nums", paddingTop: 1 }}>
                    {blk.time}<div style={{ fontSize: 6, color: "#252525", marginTop: 2 }}>{blk.min}m</div>
                  </div>
                  <div style={{ background: meta.color, opacity: dim ? 0.1 : isEve ? 0.35 : 0.55, borderRadius: 1, alignSelf: "stretch", minHeight: 16, marginTop: 1 }} />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: dim ? "#555" : "#ddd", fontWeight: dim ? 400 : 600 }}>{blk.label}</span>
                      {meta.label && <span style={{ fontSize: 6, color: meta.color, border: `1px solid ${meta.color}35`, padding: "1px 4px", borderRadius: 2, letterSpacing: 1 }}>{meta.label}</span>}
                      {(blk.type === "cloud" || (blk.type === "thesis" && blk.label.includes("#1"))) &&
                        <span style={{ fontSize: 6, color: "#666", border: "1px solid #222", padding: "1px 4px", borderRadius: 2 }}>POMODORO 50/10</span>}
                      {isEve && <span style={{ fontSize: 6, color: "#f472b660", border: "1px solid #f472b620", padding: "1px 4px", borderRadius: 2 }}>OPT W5–W7 · REQ W8</span>}
                      <span style={{ fontSize: 7, color: "#252525", marginLeft: "auto" }}>{isExp ? "▲" : "▼"}</span>
                    </div>
                    {isExp && (
                      <div style={{ marginTop: 9, display: "flex", flexDirection: "column", gap: 7 }}>
                        <div style={{ fontSize: 10, color: "#888", lineHeight: 1.75 }}>{blk.detail}</div>
                        {pd && <div style={{ fontSize: 10, color: meta.color, background: `${meta.color}0c`, border: `1px solid ${meta.color}1a`, padding: "7px 11px", borderRadius: 3, lineHeight: 1.65 }}>
                          <span style={{ fontSize: 6, letterSpacing: 2, opacity: 0.5 }}>{cp.label} → </span><br />{pd}
                        </div>}
                        {isEve && <div style={{ fontSize: 10, color: "#f472b6", background: "#180a1440", border: "1px solid #f472b61a", padding: "7px 11px", borderRadius: 3, lineHeight: 1.6 }}>
                          Đạt thesis target ngày → tắt máy, mở Steam, gọi Gia Lai. Không có gì để prove thêm. Xem tab "Thesis Targets" để biết target cụ thể.
                        </div>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── THESIS TARGETS ── */}
      {tab === "targets" && (
        <div style={{ padding: "18px 22px 32px" }}>
          <div style={{ fontSize: 10, color: "#555", marginBottom: 16, lineHeight: 1.8 }}>
            "Đủ target" = đạt ít nhất 2/3 items dưới đây trong ngày. Nếu đủ → không có evening thesis obligation.
          </div>
          {(THESIS_TARGETS[phase] || []).map((tw, i) => (
            <div key={i} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, color: cp.color, letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>{tw.week}</div>
              {tw.targets.map((t, j) => (
                <div key={j} style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 8, padding: "8px 12px", background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 3 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#60a5fa", flexShrink: 0, marginTop: 3 }} />
                  <div style={{ fontSize: 11, color: "#aaa", lineHeight: 1.6 }}>{t}</div>
                </div>
              ))}
            </div>
          ))}
          <div style={{ background: "#0a1020", border: "1px solid #60a5fa25", borderRadius: 3, padding: 14, marginTop: 8 }}>
            <div style={{ fontSize: 8, color: "#60a5fa", letterSpacing: 2, marginBottom: 8, fontWeight: 700 }}>QUY TẮC EVENING</div>
            {[
              "Đạt ≥2/3 target → Evening OFF. Mở Steam, gọi Gia Lai.",
              "Đạt 1/3 target → Evening 45 phút light (đọc lại, outline, không code mới).",
              "Miss toàn bộ → Evening 60 phút focused — tìm hiểu tại sao bị miss trước khi code.",
              "W8 bất kể → Evening bắt buộc. Tuần nộp không có off.",
            ].map((r, i) => (
              <div key={i} style={{ fontSize: 10, color: "#7a9ccc", lineHeight: 1.7, display: "flex", gap: 8 }}>
                <span style={{ color: "#60a5fa40" }}>·</span>{r}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MILESTONES ── */}
      {tab === "milestones" && (
        <div style={{ padding: "18px 22px 32px" }}>
          <div style={{ fontSize: 9, color: "#555", marginBottom: 16 }}>Sunday 19:30 Weekly Review. Click để tick done.</div>
          {MILESTONES.map((m, wi) => (
            <div key={wi} style={{ marginBottom: 22, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ background: m.color, color: wi < 2 ? "#000" : "#fff", fontSize: 10, fontWeight: 800, padding: "5px 7px", borderRadius: 2, minWidth: 34, textAlign: "center", flexShrink: 0, marginTop: 2 }}>
                {m.week}
              </div>
              <div style={{ flex: 1, borderLeft: `2px solid ${m.color}30`, paddingLeft: 14 }}>
                {m.major && <div style={{ fontSize: 12, color: m.color, fontWeight: 700, marginBottom: 10, lineHeight: 1.4 }}>{m.major}</div>}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 12px" }}>
                  {m.items.map((item, j) => {
                    const key  = `${wi}-${j}`;
                    const done = msDone[key];
                    const c    = [{ c: "#FF6B35" }, { c: "#a78bfa" }, { c: "#60a5fa" }, { c: "#22c55e" }][j]?.c || "#888";
                    return (
                      <div key={j} className="ms" onClick={() => toggleMs(key)}
                        style={{ padding: "6px 8px", borderRadius: 2, background: done ? `${c}10` : "transparent", border: `1px solid ${done ? c + "30" : "transparent"}` }}>
                        <div style={{ fontSize: 7, color: done ? c : "#444", letterSpacing: 1, marginBottom: 2, display: "flex", alignItems: "center", gap: 4 }}>
                          <span>{done ? "✓" : "○"}</span> {item.cat}
                        </div>
                        <div style={{ fontSize: 10, color: done ? "#bbb" : "#666", lineHeight: 1.5, textDecoration: done ? "line-through" : "none" }}>{item.val}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── BUFFER RULES ── */}
      {tab === "buffer" && (
        <div style={{ padding: "18px 22px 32px" }}>
          <div style={{ fontSize: 10, color: "#555", marginBottom: 16, lineHeight: 1.8 }}>
            Lịch này build cho ngày lý tưởng — thực tế sẽ có interrupt. Đây là protocol xử lý khi bị lệch.
          </div>
          {BUFFER_RULES.map((r, i) => (
            <div key={i} style={{ marginBottom: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, border: "1px solid #1a1a1a", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ background: "#111", padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#FF6B35", flexShrink: 0, marginTop: 4 }} />
                <div style={{ fontSize: 10, color: "#888", lineHeight: 1.6 }}>{r.trigger}</div>
              </div>
              <div style={{ background: "#0d1a0d", padding: "10px 14px", borderLeft: "1px solid #22c55e15", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ fontSize: 8, color: "#22c55e", fontWeight: 700, flexShrink: 0, paddingTop: 1, letterSpacing: 1 }}>DO</div>
                <div style={{ fontSize: 10, color: "#8aaa8a", lineHeight: 1.6 }}>{r.action}</div>
              </div>
            </div>
          ))}

          {/* Priority order when cutting */}
          <div style={{ marginTop: 20, background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 3, padding: 14 }}>
            <div style={{ fontSize: 8, color: "#444", letterSpacing: 2, marginBottom: 12, fontWeight: 700 }}>THỨ TỰ BẢO VỆ KHI PHẢI CẮT</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {[
                { label: "Thesis", color: "#60a5fa", rank: 1 },
                { label: "Cloud Lab", color: "#FF6B35", rank: 2 },
                { label: "Interview", color: "#22c55e", rank: 3 },
                { label: "LC", color: "#a78bfa", rank: 4 },
                { label: "Break", color: "#444", rank: "cắt đầu" },
              ].map((item, i, arr) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ background: item.color + "20", border: `1px solid ${item.color}40`, borderRadius: 2, padding: "4px 10px", fontSize: 10, color: item.color, fontWeight: 600 }}>
                    {typeof item.rank === "number" ? `${item.rank}. ` : ""}{item.label}
                    {item.rank === "cắt đầu" && <span style={{ fontSize: 8, opacity: 0.6 }}> → buffer đầu tiên</span>}
                  </div>
                  {i < arr.length - 1 && <span style={{ color: "#333", fontSize: 12 }}>›</span>}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 9, color: "#555", lineHeight: 1.7 }}>
              LC bị cắt sau cùng vì chỉ cần 25 phút và làm được bất kỳ lúc nào trong ngày. Thesis bảo vệ đầu tiên vì không thể compress về cuối ngày.
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <div style={{ borderTop: "1px solid #111", padding: "9px 22px", background: "#050505", display: "flex", gap: 14, flexWrap: "wrap" }}>
        {[
          { l: "BASE/NGÀY",    v: `${baseH.toFixed(2)}h`, c: "#22c55e" },
          { l: "W/ EVENING",   v: `${fullH.toFixed(2)}h`, c: "#f472b6" },
          { l: "SHUTDOWN",     v: "17:00 cứng",   c: "#34d399" },
          { l: "WEEKEND",      v: "Heavy lab",    c: "#FF6B35" },
          { l: "BUFFER",       v: "Protocol có",  c: "#60a5fa" },
          { l: "EVE W5–W7",    v: "Optional",     c: "#888" },
          { l: "EVE W8",       v: "Required",     c: "#f472b6" },
        ].map((s, i) => (
          <div key={i}>
            <div style={{ fontSize: 6, color: "#2a2a2a", letterSpacing: 2 }}>{s.l}</div>
            <div style={{ fontSize: 10, color: s.c, fontWeight: 600, marginTop: 1 }}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
