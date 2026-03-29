import { useState } from "react";

const PHASES = [
  { id: 1, label: "Phase 1", weeks: "W1–W2", title: "AWS Foundation + Thesis Kickoff", color: "#FF6B35", bg: "#1a0d00", summary: "IAM/VPC/EC2/ASG lý thuyết. EKS lab cuối tuần. Thesis: NER schema + 100 samples." },
  { id: 2, label: "Phase 2", weeks: "W3–W4", title: "SAA Prep + Project 1 Deploy", color: "#F7C59F", bg: "#1a1200", summary: "SAA modules + quiz 70%. Deploy Bee-Shoeshop lên EKS + ALB. Thesis: FastAPI + Streamlit." },
  { id: 3, label: "Phase 3", weeks: "W5–W6", title: "SAA Exam + Project 1 Hoàn thiện", color: "#81B29A", bg: "#0d1a0d", summary: "Thi AWS SAA. CI/CD + docs. Thesis: NER + Qdrant pipeline, evaluation." },
  { id: 4, label: "Phase 4", weeks: "W7–W8", title: "IaC + GitOps + Final Polish", color: "#E07A5F", bg: "#1a0d0f", summary: "Terraform cơ bản, ArgoCD, Prometheus. Thesis chương 3–4. LC=30. Portfolio ready." },
];

const OFFICE_SPLIT = {
  1: { cloud: "1.5h — IAM/VPC/EC2/ASG lý thuyết + AWS Console nhẹ qua 4G", lc: "1h — Arrays, HashMap: Two Sum, Valid Anagram, Contains Duplicate", thesis: "0.5h — Đọc XLM-RoBERTa paper, sketch 17-rule NER schema" },
  2: { cloud: "1.5h — SAA modules: S3/EBS/RDS/Route53, quiz từng module", lc: "1h — Sliding Window, Two Pointers: Max Consecutive Ones, Valid Parentheses", thesis: "0.5h — FastAPI endpoint design, plan Streamlit UI layout" },
  3: { cloud: "1.5h — Practice exam 30 câu/ngày timed (Tutorials Dojo), review sai", lc: "1h — Stack, Queue: Daily Temperatures, Implement Stack using Queues", thesis: "0.5h — Qdrant API docs, embedding research, chạy thử pipeline nhẹ" },
  4: { cloud: "1.5h — Terraform docs, ArgoCD config examples, Prometheus PromQL basics", lc: "1h — Binary Search, Tree BFS/DFS: Inorder Traversal, Level Order", thesis: "0.5h — Viết thesis chapter 3–4 draft, generate figures" },
};

// CORRECTED TIMING: rời Bosch 17:50, về nhà 18:40
const WEEKDAY_BLOCKS = [
  { time: "06:30", duration: "45m", label: "Wake up + Morning Routine", type: "life", detail: "Dậy tự nhiên không vội vã. Uống nước, vươn vai, review mục tiêu hôm nay trong đầu." },
  { time: "07:15", duration: "45m", label: "Chuẩn bị + Ăn sáng", type: "life", detail: "Ăn đầy đủ — quan trọng cho focus buổi sáng. Đồ đã meal prep sẵn từ cuối tuần." },
  { time: "08:00", duration: "50m", label: "🛵 Commute → Bosch", type: "commute",
    detail: "Nghe audio DevOps concepts hoặc podcast tiếng Anh. 50 phút này = passive learning không tốn extra time.",
    phaseDetail: { 1: "AWS Cloud Practitioner Essentials audio / Kubernetes concepts podcast", 2: "DevOps interview Q&A audio — tự record câu trả lời rồi nghe lại", 3: "System design concepts / Cloud architecture patterns tiếng Anh", 4: "Terraform concepts audio / Mock interview questions" } },
  { time: "08:50", duration: "90m", label: "☁️ Cloud Block — Focus Room", type: "cloud",
    detail: "Máy cá nhân, 4G cá nhân. AWS Console + docs + theory. KHÔNG heavy lab (EKS deploy, Terraform apply lớn) — để dành cuối tuần wifi nhà.",
    phaseDetail: { 1: "IAM (users/roles/policies) → VPC (subnet/SG/NAT) → EC2 (ASG/ELB). Video + ghi note.", 2: "SAA modules: S3, EBS, RDS, Route53. Làm quiz theo từng module.", 3: "Practice exam Tutorials Dojo 30 câu timed. Review sai → đọc lại concept. Lặp hàng ngày.", 4: "Đọc Terraform docs, ArgoCD config examples, Prometheus PromQL basics." } },
  { time: "10:20", duration: "60m", label: "🧠 LeetCode Block — Focus Room", type: "leetcode",
    detail: "1 bài Easy/ngày. Timer 25 phút. Không ra → đọc hint → tự code lại không nhìn. Ghi pattern vào note.",
    phaseDetail: { 1: "Arrays, HashMap: Two Sum, Valid Anagram, Contains Duplicate, Best Time to Buy Stock", 2: "Sliding Window, Two Pointers: Max Consecutive Ones, Valid Parentheses", 3: "Stack, Queue: Daily Temperatures, Implement Stack using Queues", 4: "Binary Search, Tree BFS/DFS: Inorder Traversal, Level Order Traversal" } },
  { time: "11:20", duration: "30m", label: "📓 Thesis Light — Focus Room", type: "thesis",
    detail: "Không cần wifi mạnh. Đọc paper, sketch architecture, plan task list. KHÔNG run training hay heavy compute.",
    phaseDetail: { 1: "Đọc XLM-RoBERTa paper, plan 17-rule NER schema, sketch CoNLL format examples", 2: "Design FastAPI endpoint schema, plan Streamlit UI layout, viết evaluation plan", 3: "Qdrant collection setup light, chạy thử embedding pipeline nhẹ", 4: "Viết thesis chapter 3–4 draft, generate figures, chuẩn bị slide present" } },
  { time: "11:50", duration: "60m", label: "💼 Bosch Tasks + Lunch", type: "work", detail: "Ăn trưa + xử lý task thật sự của Bosch nếu có. Nghỉ ngơi mắt 15–20 phút sau khi ăn." },
  { time: "12:50", duration: "210m", label: "💼 Bosch Afternoon", type: "work", detail: "Làm việc thật sự. Nếu rảnh: ôn lại notes buổi sáng, đọc AWS blog. Không mở tab mới." },
  { time: "16:20", duration: "90m", label: "💼 Bosch Wrap-up", type: "work", detail: "Xử lý nốt task, ghi 3 bullet: cloud learned / LC pattern / thesis progress. Chuẩn bị đồ về." },
  { time: "17:50", duration: "50m", label: "🛵 Commute ← Về nhà", type: "commute", detail: "Chuyển mindset sang recovery mode. Nghe nhạc hoặc nghe lại recording interview của bản thân." },
  { time: "18:40", duration: "5m", label: "Đến nhà — đổ đồ gym", type: "life", detail: "⚠ KHÔNG ngồi xuống sofa. Đổ đồ gym ngay, uống nước, đi liền. Ngồi xuống = ngủ quên 1 tiếng." },
  { time: "18:45", duration: "75m", label: "🏋️ Gym — Kháng lực", type: "life",
    detail: "6 buổi/tuần bình thường. Khi deadline gấp (W4, W5, W8) → giảm còn 3–4 buổi, dành 2 tối/tuần thêm cho thesis/project.",
    phaseDetail: { 1: "6 buổi/tuần — Phase 1 chưa gấp, giữ nguyên routine.", 2: "6 buổi/tuần — W3 bình thường. W4 (gần deadline Project 1): có thể giảm còn 4.", 3: "W5: giảm còn 4 buổi nếu cần ôn thi gấp. W6: back to 5-6.", 4: "W7 bình thường. W8 (deadline cuối): giảm còn 3 buổi nếu cần." } },
  { time: "20:00", duration: "45m", label: "Tắm + Ăn tối", type: "life", detail: "Đồ meal prep sẵn từ cuối tuần. Tắm trước ăn sau để cool down. Không mở laptop trong lúc ăn." },
  { time: "20:45", duration: "75m", label: "📓 Evening Deep Work", type: "evening",
    detail: "Slot duy nhất tối — Cloud đã cày ở cty, nên tối 100% Thesis + Interview. Rotate theo ngày (xem tab Evening).",
    phaseDetail: { 1: "Mon/Wed/Fri: Thesis NER pipeline (code thật). Tue/Thu: STAR stories + kịch bản PV tiếng Anh.", 2: "Mon/Wed/Fri: FastAPI + Streamlit build. Tue/Thu: Record tự trả lời interview questions.", 3: "Mon/Wed/Fri: Qdrant + evaluation. Tue/Thu: Mock system design + explain tiếng Anh.", 4: "Mon/Wed/Fri: Thesis chapter viết. Tue/Thu: Mock behavioral + portfolio review." } },
  { time: "22:00", duration: "60m", label: "Wind down + Personal Time", type: "life", detail: "Tắt mode làm việc hoàn toàn. Game, series, gọi về Gia Lai. Ngủ trước 23:00 để giữ 6:30 wake-up." },
];

const WEEKEND_BLOCKS = [
  { time: "07:30", duration: "60m", label: "Wake up tự nhiên + Ăn sáng", type: "life", detail: "Không alarm. Ăn sáng ngon, không vội. Ngày dài — tiết kiệm energy buổi đầu." },
  { time: "08:30", duration: "120m", label: "☁️ Cloud Lab HEAVY — Wifi nhà", type: "cloud",
    detail: "Slot duy nhất làm được heavy lab: EKS cluster, Terraform apply, Docker build lớn, CI/CD pipeline chạy nhiều lần. Wifi nhà = không giới hạn data.",
    phaseDetail: { 1: "W1: Build VPC từ scratch (public+private subnet, NAT GW, Bastion). W2: Deploy EKS cluster + nginx bằng eksctl.", 2: "W3: Full mock exam 65 câu timed. W4: Deploy Bee-Shoeshop lên EKS + ALB + CodePipeline.", 3: "W5: Ôn thi SAA (full practice exam ×2). W6: Hoàn thiện Project 1: CI/CD + docs + monitoring cơ bản.", 4: "W7: Terraform module VPC+EKS từ đầu. W8: ArgoCD + kube-prometheus-stack via Helm." } },
  { time: "10:30", duration: "30m", label: "Break — Pha cafe, đi lại", type: "life", detail: "Bắt buộc đứng dậy. Không ngồi quá 2h liên tục. Reset mắt và não." },
  { time: "11:00", duration: "90m", label: "📓 Thesis Sprint #1", type: "thesis",
    detail: "Code thật, run thật, wifi mạnh. Slot thesis nặng nhất trong tuần — không bị interrupt.",
    phaseDetail: { 1: "W1: Generate CoNLL batches, apply 17-rule schema, target 100+ samples. W2: Qdrant collection + multilingual-e5 embedding test.", 2: "W3: FastAPI /recommend + Streamlit UI end-to-end. W4: Precision@5 run trên 10 CV mẫu.", 3: "W5: NER pipeline hoàn chỉnh + đánh giá sơ bộ. W6: Viết thesis chapter 2 (methodology).", 4: "W7: Thesis chapter 3–4 draft. W8: Polish, figures, slide deck." } },
  { time: "12:30", duration: "90m", label: "Ăn trưa + Nghỉ ngơi", type: "life", detail: "Nấu ăn + meal prep cho tuần tới. Ngủ trưa 30–40p nếu cần. Không guilt về thời gian này." },
  { time: "14:00", duration: "90m", label: "📓 Thesis Sprint #2", type: "thesis",
    detail: "Tiếp tục hoặc chuyển sang documentation / GitHub update / CV cập nhật.",
    phaseDetail: { 1: "Tiếp NER labeling hoặc viết README pipeline. Target: 1 deliverable rõ ràng/tuần.", 2: "Fix bugs. Update GitHub repo + README + architecture diagram.", 3: "Evaluation run, ghi kết quả. Bắt đầu viết chapter.", 4: "Thesis polish. Chuẩn bị demo video 3 phút cho Project 2." } },
  { time: "15:30", duration: "60m", label: "🎤 Interview Prep — Nói to", type: "interview",
    detail: "Nói to, record lại. Không gõ — speaking practice khác với writing hoàn toàn.",
    phaseDetail: { 1: "STAR: Kể Bee-Shoeshop project trong 2 phút tiếng Anh. Record → nghe lại → re-record.", 2: "Explain concepts: 'What is GitOps?', 'How does ArgoCD work?' — 90 giây, không nhìn note.", 3: "Mock: 'Design CI/CD for 50 microservices on K8s' — sketch + explain 20 phút, camera on.", 4: "Portfolio review, mock behavioral, LinkedIn post draft." } },
  { time: "16:30", duration: "30m", label: "🧠 LeetCode × 2", type: "leetcode", detail: "Weekend: 2 bài thay vì 1. Retry bài fail trong tuần. Explain solution bằng tiếng Anh to." },
  { time: "17:00", duration: "60m", label: "🏃 Cardio / Outdoor", type: "life", detail: "Đổi gió: chạy bộ, nhảy dây ngoài trời. Không gym tạ cuối tuần — để cơ nghỉ, não refresh." },
  { time: "18:00", duration: "90m", label: "Nấu ăn + Batch Cook", type: "life", detail: "Nấu batch đồ cho cả tuần. Meal prep xong để tủ — tiết kiệm 30p/ngày weekday." },
  { time: "19:30", duration: "60m", label: "📊 Weekly Review", type: "review",
    detail: "Kiểm tra: LC count, cloud milestone, thesis deliverable, interview progress. Adjust tuần tới nếu miss.",
    phaseDetail: { 1: "Check: LC ≥6, VPC lab done, ≥100 NER samples, Qdrant setup started", 2: "Check: LC ≥12, SAA quiz ≥70%, FastAPI endpoint running, Project 1 staging", 3: "Check: LC ≥20, AWS SAA passed ✅, NER pipeline done, thesis chapter 2 draft", 4: "Check: LC=30 ✅, Project 2 live, Thesis submitted ✅, Portfolio ready" } },
  { time: "20:30", duration: "150m", label: "Weekend Wind Down", type: "life", detail: "Game, phim, gọi về Gia Lai. Không học. Xả hơi 100% để thứ 2 full năng lượng." },
];

const EVENING_ROTATION = [
  { day: "Thứ 2", icon: "📓", focus: "Thesis", color: "#60a5fa", ph1: "NER CoNLL generator — code, apply 17 rules, kiểm tra output", ph2: "FastAPI /recommend endpoint — implement + test với Qdrant", ph3: "Qdrant + precision@5 — chạy evaluation, ghi kết quả", ph4: "Thesis chapter 3 — viết methodology section" },
  { day: "Thứ 3", icon: "🎤", focus: "Interview", color: "#22c55e", ph1: "Viết STAR scripts: Bee-Shoeshop + OnlineShop stories", ph2: "Record: 'Explain your CI/CD pipeline' — 2 phút tiếng Anh", ph3: "Mock behavioral: 'Biggest challenge at Bosch?' — record + review", ph4: "Mock system design: 'Design K8s monitoring' — draw + explain" },
  { day: "Thứ 4", icon: "📓", focus: "Thesis", color: "#60a5fa", ph1: "Qdrant collection config + multilingual-e5 embedding pipeline test", ph2: "Streamlit UI — search bar + result cards + CV upload", ph3: "Thesis chapter 2 draft — viết methodology", ph4: "Thesis chapter 4 draft — viết results + analysis" },
  { day: "Thứ 5", icon: "🎤", focus: "Interview", color: "#22c55e", ph1: "Behavioral: 'Why DevOps?', 'Where in 5 years?' — viết + nói", ph2: "Technical: 'GitOps vs CI/CD?' — diagram + 90s explanation", ph3: "Mock system design: 'CI/CD for microservices' — draw + explain", ph4: "Mock behavioral + portfolio review (camera on)" },
  { day: "Thứ 6", icon: "📓", focus: "Thesis", color: "#60a5fa", ph1: "Fix NER label quality — review samples, apply corrections 17-rule", ph2: "Evaluation run — Precision@5 on 10 CV samples", ph3: "Thesis chapter 2–3 polish + figures", ph4: "Thesis final polish — citations, formatting, submit" },
  { day: "Thứ 7", icon: "☁️", focus: "Cloud Lab", color: "#FF6B35", ph1: "Morning lab (see Weekend tab) — tối nghỉ từ 20:30", ph2: "Morning lab (see Weekend tab) — tối nghỉ từ 20:30", ph3: "Morning lab (see Weekend tab) — tối nghỉ từ 20:30", ph4: "Morning lab (see Weekend tab) — tối nghỉ từ 20:30" },
  { day: "CN", icon: "🌿", focus: "Review + Rest", color: "#34d399", ph1: "Weekly Review 19:30 → Wind down 20:30", ph2: "Weekly Review 19:30 → Wind down 20:30", ph3: "Weekly Review 19:30 → Wind down 20:30", ph4: "Weekly Review 19:30 → Wind down 20:30" },
];

const MILESTONES = [
  { week: "W1", color: "#FF6B35", cloud: "Xong lý thuyết IAM + VPC + EC2 + ASG. VPC lab cuối tuần.", lc: "6 bài (Arrays/HashMap)", thesis: "100+ NER samples labeled, CoNLL format chuẩn", interview: "Draft STAR story cho Bee-Shoeshop (viết xong)", major: null },
  { week: "W2", color: "#F7C59F", cloud: "EKS cluster deployed (eksctl), nginx chạy ok.", lc: "12 bài (Sliding Window, Two Pointers)", thesis: "Qdrant collection + embedding pipeline end-to-end", interview: "Kể Bee-Shoeshop < 2 phút tiếng Anh (record ok)", major: null },
  { week: "W3", color: "#EFEFD0", cloud: "SAA modules 1–6, quiz ≥70%.", lc: "18 bài (Stack, Queue)", thesis: "FastAPI + Streamlit prototype chạy được", interview: "Explain GitOps, CI/CD, ArgoCD — 90 giây mỗi cái", major: null },
  { week: "W4", color: "#81B29A", cloud: "Bee-Shoeshop lên EKS + ALB (chưa CI/CD ok).", lc: "24 bài", thesis: "Precision@5 evaluation có số liệu thật", interview: "Full mock interview 30 phút, record, review", major: "⭐ Project 1: Bee-Shoeshop on EKS LIVE" },
  { week: "W5", color: "#3D405B", cloud: "Ôn thi SAA, practice exam ≥80%. Thi cuối tuần.", lc: "27 bài (Binary Search, Tree)", thesis: "NER pipeline hoàn chỉnh + embedding test", interview: "Mock: 'Design CI/CD for 50 microservices'", major: "🎯 AWS SAA-C03 EXAM" },
  { week: "W6", color: "#E07A5F", cloud: "Project 1 hoàn thiện: CI/CD + docs + monitoring cơ bản.", lc: "30 bài ✅", thesis: "Thesis chapter 2 draft", interview: "Record giải thích hệ thống bằng tiếng Anh", major: "⭐ Project 1 hoàn chỉnh + 🎯 LC = 30 ✅" },
  { week: "W7", color: "#D4A5A5", cloud: "Terraform module VPC+EKS cơ bản done.", lc: "30 bài ✅ (maintain)", thesis: "Thesis chapter 3–4 draft", interview: "Mock behavioral + portfolio review", major: null },
  { week: "W8", color: "#F4D03F", cloud: "ArgoCD + Prometheus stack (GitOps cơ bản) live.", lc: "30 bài ✅", thesis: "🎯 Thesis SUBMITTED", interview: "Portfolio README + demo video + LinkedIn post", major: "🎯 Project 2: GitOps DEMO + Thesis SUBMITTED + Portfolio READY" },
];

const TYPE_CONFIG = {
  cloud:     { color: "#FF6B35", bg: "#1a0800", label: "CLOUD" },
  leetcode:  { color: "#a78bfa", bg: "#0f0a1a", label: "LEETCODE" },
  thesis:    { color: "#60a5fa", bg: "#0a1020", label: "THESIS" },
  interview: { color: "#22c55e", bg: "#0a1a0a", label: "INTERVIEW" },
  commute:   { color: "#facc15", bg: "#1a1500", label: "COMMUTE" },
  work:      { color: "#444",    bg: "#0e0e0e", label: "BOSCH" },
  life:      { color: "#555",    bg: "#0e0e0e", label: "LIFE" },
  review:    { color: "#34d399", bg: "#0a1a10", label: "REVIEW" },
  evening:   { color: "#f472b6", bg: "#1a0a10", label: "EVENING" },
};

const TABS = [
  { key: "weekday", label: "Weekday" },
  { key: "weekend", label: "Weekend" },
  { key: "office",  label: "Office Split" },
  { key: "rotation", label: "Evening" },
  { key: "milestones", label: "Milestones" },
];

export default function FinalRoadmap() {
  const [view, setView]     = useState("weekday");
  const [phase, setPhase]   = useState(1);
  const [expanded, setExpanded] = useState(null);
  const [lcCount, setLcCount]   = useState(0);
  const [msDone, setMsDone]     = useState({});
  const [deadlineMode, setDeadlineMode] = useState(false);

  const blocks = view === "weekend" ? WEEKEND_BLOCKS : WEEKDAY_BLOCKS;
  const cp = PHASES.find(p => p.id === phase);
  const toggleMs = (key) => setMsDone(d => ({ ...d, [key]: !d[key] }));

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", background: "#080808", color: "#E0E0E0", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=Sora:wght@600;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; background: #111; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
        .btn { transition: all 0.15s; cursor: pointer; border: none; font-family: inherit; }
        .btn:hover { opacity: 0.82; }
        .row { transition: background 0.08s; cursor: pointer; }
        .row:hover { background: rgba(255,255,255,0.03) !important; }
        .dot { cursor: pointer; transition: all 0.1s; user-select: none; }
        .dot:hover { transform: scale(1.15); }
        .dot:active { transform: scale(0.9); }
        .ms-row { cursor: pointer; transition: background 0.1s; }
        .ms-row:hover { background: rgba(255,255,255,0.02); }
        .toggle { cursor: pointer; user-select: none; }
      `}</style>

      {/* HEADER */}
      <div style={{ padding: "16px 22px 12px", borderBottom: "1px solid #161616" }}>
        <div style={{ fontSize: 8, color: "#FF6B35", letterSpacing: 4, marginBottom: 4, fontWeight: 700 }}>
          FINAL ROADMAP · 8 TUẦN · TIMING THỰC TẾ
        </div>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 19, fontWeight: 800, lineHeight: 1.15 }}>
          AWS SAA-C03 · 2 Projects · Thesis · LC×30<span style={{ color: "#FF6B35" }}>.</span>
        </div>

        {/* Timing badge row */}
        <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { icon: "🛵", label: "Rời Bosch", val: "17:50" },
            { icon: "🏠", label: "Về nhà",    val: "18:40" },
            { icon: "🏋️", label: "Gym xong",  val: "20:00" },
            { icon: "📓", label: "Deep work", val: "20:45–22:00" },
            { icon: "😴", label: "Ngủ",       val: "23:00" },
          ].map((t, i) => (
            <div key={i} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 2, padding: "4px 8px", display: "flex", gap: 5, alignItems: "center" }}>
              <span style={{ fontSize: 10 }}>{t.icon}</span>
              <div>
                <div style={{ fontSize: 7, color: "#444", letterSpacing: 1 }}>{t.label}</div>
                <div style={{ fontSize: 10, color: "#ccc", fontWeight: 600 }}>{t.val}</div>
              </div>
            </div>
          ))}

          {/* Deadline mode toggle */}
          <div
            className="toggle"
            onClick={() => setDeadlineMode(d => !d)}
            style={{
              marginLeft: "auto",
              background: deadlineMode ? "#2d1a0a" : "#111",
              border: `1px solid ${deadlineMode ? "#FF6B35" : "#1e1e1e"}`,
              borderRadius: 2, padding: "4px 10px",
              display: "flex", alignItems: "center", gap: 6,
            }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: deadlineMode ? "#FF6B35" : "#333" }} />
            <div>
              <div style={{ fontSize: 7, color: deadlineMode ? "#FF6B35" : "#444", letterSpacing: 1 }}>DEADLINE MODE</div>
              <div style={{ fontSize: 9, color: deadlineMode ? "#FF6B35" : "#555" }}>Gym 3–4 buổi</div>
            </div>
          </div>
        </div>

        {deadlineMode && (
          <div style={{ marginTop: 8, background: "#1a0d00", border: "1px solid #FF6B3540", borderRadius: 2, padding: "8px 12px", fontSize: 10, color: "#cc8855", lineHeight: 1.6 }}>
            ⚠ Deadline Mode ON — Gym giảm còn 3–4 buổi/tuần. Hai tối được giải phóng → dùng cho thesis/project. Áp dụng khi: W4 (Project 1 deploy), W5 (SAA exam), W8 (final submit).
          </div>
        )}
      </div>

      {/* PHASE BAR */}
      <div style={{ padding: "10px 22px", borderBottom: "1px solid #161616", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        {PHASES.map(p => (
          <button key={p.id} className="btn"
            onClick={() => { setPhase(p.id); setExpanded(null); }}
            style={{ background: phase === p.id ? p.color : "#111", color: phase === p.id ? "#000" : "#555", border: phase === p.id ? "none" : "1px solid #1e1e1e", padding: "5px 14px", borderRadius: 2, fontSize: 10, fontWeight: phase === p.id ? 700 : 400 }}>
            {p.label} <span style={{ opacity: 0.6, fontSize: 9 }}>{p.weeks}</span>
          </button>
        ))}
        <div style={{ marginLeft: "auto", fontSize: 10, color: cp.color, fontStyle: "italic", maxWidth: 280, textAlign: "right", lineHeight: 1.4 }}>
          {cp.summary}
        </div>
      </div>

      {/* LC TRACKER */}
      <div style={{ padding: "10px 22px", borderBottom: "1px solid #161616", background: "#0c0a18", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 7, color: "#a78bfa", letterSpacing: 3, marginBottom: 5, fontWeight: 700 }}>LEETCODE · 1/NGÀY OFFICE · 2/NGÀY WEEKEND</div>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap", maxWidth: 380, marginTop: 10 }}>
            {Array.from({ length: 30 }).map((_, i) => {
              const weekMarks = { 5: "W1", 11: "W2", 17: "W3", 23: "W4", 26: "W5" };
              return (
                <div key={i} className="dot"
                  onClick={() => setLcCount(i < lcCount ? i : i + 1)}
                  title={`Bài ${i + 1}`}
                  style={{ width: 15, height: 15, borderRadius: 2, background: i < lcCount ? "#a78bfa" : "#1a1630", border: i < lcCount ? "none" : "1px solid #252040", position: "relative" }}>
                  {weekMarks[i] && <div style={{ position: "absolute", top: -13, left: 0, fontSize: 6, color: "#555", whiteSpace: "nowrap" }}>{weekMarks[i]}</div>}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 30, fontWeight: 800, color: "#a78bfa" }}>
          {lcCount}<span style={{ fontSize: 13, color: "#333" }}>/30</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn dot" onClick={() => setLcCount(Math.max(0, lcCount - 1))}
            style={{ background: "#1a1630", border: "1px solid #252040", color: "#777", padding: "5px 12px", borderRadius: 2, fontSize: 12 }}>−</button>
          <button className="btn dot" onClick={() => setLcCount(Math.min(30, lcCount + 1))}
            style={{ background: "#a78bfa", border: "none", color: "#000", padding: "5px 14px", borderRadius: 2, fontSize: 11, fontWeight: 700 }}>+ Done</button>
        </div>
        <div style={{ fontSize: 10, color: lcCount >= 30 ? "#a78bfa" : "#333", marginLeft: "auto", fontWeight: lcCount >= 30 ? 700 : 400 }}>
          {lcCount >= 30 ? "🎯 TARGET REACHED" : `${30 - lcCount} bài còn lại`}
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", borderBottom: "1px solid #161616", padding: "0 22px", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.key} className="btn"
            onClick={() => { setView(t.key); setExpanded(null); }}
            style={{ background: "transparent", color: view === t.key ? "#FF6B35" : "#444", borderBottom: view === t.key ? "2px solid #FF6B35" : "2px solid transparent", padding: "10px 14px", fontSize: 9, letterSpacing: 1.5, fontWeight: view === t.key ? 700 : 400, whiteSpace: "nowrap" }}>
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* SCHEDULE */}
      {(view === "weekday" || view === "weekend") && (
        <div style={{ padding: "0 22px 32px" }}>
          <div style={{ padding: "10px 0 8px", display: "flex", gap: 10, flexWrap: "wrap", borderBottom: "1px solid #111" }}>
            {Object.entries(TYPE_CONFIG).map(([k, v]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 7, height: 7, borderRadius: 1, background: v.color, opacity: k === "life" || k === "work" ? 0.3 : 0.8 }} />
                <span style={{ fontSize: 7, color: "#444" }}>{v.label}</span>
              </div>
            ))}
          </div>

          {blocks.map((blk, i) => {
            const cfg = TYPE_CONFIG[blk.type];
            const isExp = expanded === i;
            const hasPD = blk.phaseDetail?.[phase];
            const dim = blk.type === "life" || blk.type === "work";
            const isGym = blk.label.includes("Gym");

            return (
              <div key={i} className="row"
                onClick={() => setExpanded(isExp ? null : i)}
                style={{ display: "grid", gridTemplateColumns: "54px 3px 1fr", gap: "0 10px", borderBottom: "1px solid #0f0f0f", background: isExp ? cfg.bg : "transparent", margin: "0 -22px", padding: isExp ? "12px 22px" : "10px 22px", alignItems: "start" }}>
                <div style={{ fontSize: 10, color: "#383838", fontVariantNumeric: "tabular-nums", paddingTop: 1 }}>
                  {blk.time}
                  <div style={{ fontSize: 7, color: "#2a2a2a", marginTop: 2 }}>{blk.duration}</div>
                </div>
                <div style={{ background: cfg.color, opacity: dim ? 0.15 : 0.55, borderRadius: 1, alignSelf: "stretch", minHeight: 18, marginTop: 1 }} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, color: dim ? "#555" : "#ddd", fontWeight: dim ? 400 : 600, lineHeight: 1.3 }}>{blk.label}</span>
                    {!dim && <span style={{ fontSize: 7, color: cfg.color, border: `1px solid ${cfg.color}35`, padding: "1px 5px", borderRadius: 2, letterSpacing: 1 }}>{cfg.label}</span>}
                    {isGym && deadlineMode && <span style={{ fontSize: 7, color: "#FF6B35", border: "1px solid #FF6B3540", padding: "1px 5px", borderRadius: 2 }}>3–4 buổi/tuần</span>}
                    <span style={{ fontSize: 8, color: "#2a2a2a", marginLeft: "auto" }}>{isExp ? "▲" : "▼"}</span>
                  </div>
                  {isExp && (
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ fontSize: 11, color: "#888", lineHeight: 1.75 }}>{blk.detail}</div>
                      {hasPD && (
                        <div style={{ fontSize: 11, color: cfg.color, background: `${cfg.color}0d`, border: `1px solid ${cfg.color}20`, padding: "8px 12px", borderRadius: 3, lineHeight: 1.65 }}>
                          <span style={{ fontSize: 7, letterSpacing: 2, opacity: 0.6 }}>PHASE {phase} · {cp.weeks} → </span>
                          <br />{blk.phaseDetail[phase]}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OFFICE SPLIT */}
      {view === "office" && (
        <div style={{ padding: "20px 22px 32px" }}>
          <div style={{ fontSize: 10, color: "#555", marginBottom: 4, lineHeight: 1.8 }}>Focus room · Máy cá nhân · 4G cá nhân · 3h realistic/ngày (8h50 → 11h50)</div>
          <div style={{ fontSize: 9, color: "#FF6B35", marginBottom: 20 }}>Heavy lab → để cuối tuần wifi nhà · Buổi chiều (12h50 onward) = Bosch tasks + recovery</div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 8, color: "#444", letterSpacing: 2, marginBottom: 10 }}>DAILY SPLIT — 3H OFFICE (8:50–11:50)</div>
            <div style={{ display: "flex", height: 32, borderRadius: 3, overflow: "hidden", gap: 2 }}>
              {[{ label: "Cloud 1.5h", pct: 50, color: "#FF6B35" }, { label: "LC 1h", pct: 33, color: "#a78bfa" }, { label: "Thesis 0.5h", pct: 17, color: "#60a5fa" }].map((s, i) => (
                <div key={i} style={{ flex: s.pct, background: s.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#000" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          {[1,2,3,4].map(ph => {
            const p = PHASES[ph-1];
            const sp = OFFICE_SPLIT[ph];
            return (
              <div key={ph} style={{ marginBottom: 16, border: `1px solid ${p.color}25`, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ background: `${p.color}15`, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: p.color }}>{p.label} · {p.weeks}</span>
                  <span style={{ fontSize: 9, color: "#555" }}>{p.title}</span>
                </div>
                {[{ label: "☁️ CLOUD 1.5H", val: sp.cloud, color: "#FF6B35" }, { label: "🧠 LEETCODE 1H", val: sp.lc, color: "#a78bfa" }, { label: "📓 THESIS 0.5H", val: sp.thesis, color: "#60a5fa" }].map((row, i) => (
                  <div key={i} style={{ padding: "9px 14px", borderTop: "1px solid #111", display: "grid", gridTemplateColumns: "110px 1fr", gap: 12 }}>
                    <div style={{ fontSize: 8, color: row.color, letterSpacing: 1, fontWeight: 700 }}>{row.label}</div>
                    <div style={{ fontSize: 11, color: "#999", lineHeight: 1.6 }}>{row.val}</div>
                  </div>
                ))}
              </div>
            );
          })}
          <div style={{ background: "#1a0800", border: "1px solid #FF6B3530", borderRadius: 3, padding: 14 }}>
            <div style={{ fontSize: 8, color: "#FF6B35", letterSpacing: 2, marginBottom: 8 }}>⚠ OFFICE RULES</div>
            {["4G: OK cho Console, docs, practice exam — KHÔNG kéo Docker image lớn", "Bosch task đột xuất → cắt Cloud block trước, giữ LC + Thesis", "Ngủ quên trong focus room = set phone timer 45p cho mỗi block", "Buổi chiều rảnh: ôn lại notes buổi sáng, đọc AWS blog — đừng mở tab mới"].map((r,i) => (
              <div key={i} style={{ fontSize: 10, color: "#888", lineHeight: 1.7, display: "flex", gap: 8 }}>
                <span style={{ color: "#FF6B35" }}>·</span>{r}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EVENING ROTATION */}
      {view === "rotation" && (
        <div style={{ padding: "18px 22px 32px" }}>
          <div style={{ fontSize: 9, color: "#555", marginBottom: 18, lineHeight: 1.8 }}>
            Slot 20:45–22:00 · Cloud đã cày ở cty → tối 100% Thesis + Interview · Không mix 2 chủ đề cùng 1 tối
          </div>
          {EVENING_ROTATION.map((row, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "56px 90px 1fr", gap: 12, padding: "14px 0", borderBottom: "1px solid #0f0f0f", alignItems: "start" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#666" }}>{row.day}</div>
              <div>
                <div style={{ fontSize: 16, marginBottom: 3 }}>{row.icon}</div>
                <div style={{ fontSize: 9, color: row.color, fontWeight: 700 }}>{row.focus}</div>
              </div>
              <div>
                {[{ label: "Ph1 W1–2", val: row.ph1, color: "#FF6B35" }, { label: "Ph2 W3–4", val: row.ph2, color: "#F7C59F" }, { label: "Ph3 W5–6", val: row.ph3, color: "#81B29A" }, { label: "Ph4 W7–8", val: row.ph4, color: "#E07A5F" }].map((p, j) => (
                  <div key={j} style={{ display: "flex", gap: 10, marginBottom: 7, alignItems: "baseline" }}>
                    <div style={{ fontSize: 7, color: p.color, letterSpacing: 1, minWidth: 56, opacity: 0.65, flexShrink: 0 }}>{p.label}</div>
                    <div style={{ fontSize: 10, color: "#888", lineHeight: 1.55 }}>{p.val}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MILESTONES */}
      {view === "milestones" && (
        <div style={{ padding: "18px 22px 32px" }}>
          <div style={{ fontSize: 9, color: "#555", marginBottom: 18 }}>Weekly Review mỗi Sunday 19:30. Click từng item để tick done.</div>
          {MILESTONES.map((m, wi) => (
            <div key={wi} style={{ marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ background: m.color, color: wi < 4 ? "#000" : "#fff", fontSize: 10, fontWeight: 800, padding: "5px 8px", borderRadius: 2, minWidth: 36, textAlign: "center", flexShrink: 0, marginTop: 2 }}>{m.week}</div>
              <div style={{ flex: 1, borderLeft: `2px solid ${m.color}30`, paddingLeft: 14 }}>
                {m.major && (
                  <div style={{ fontSize: 12, color: m.color, fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>{m.major}</div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 14px" }}>
                  {[{ label: "☁️ Cloud", val: m.cloud, color: "#FF6B35" }, { label: "🧠 LC", val: m.lc, color: "#a78bfa" }, { label: "📓 Thesis", val: m.thesis, color: "#60a5fa" }, { label: "🎤 Interview", val: m.interview, color: "#22c55e" }].map((item, j) => {
                    const key = `${wi}-${j}`;
                    const done = msDone[key];
                    return (
                      <div key={j} className="ms-row"
                        onClick={() => toggleMs(key)}
                        style={{ padding: "6px 8px", borderRadius: 2, background: done ? `${item.color}10` : "transparent", border: `1px solid ${done ? item.color + "30" : "transparent"}` }}>
                        <div style={{ fontSize: 7, color: done ? item.color : "#444", letterSpacing: 1, marginBottom: 2, display: "flex", alignItems: "center", gap: 4 }}>
                          <span>{done ? "✓" : "○"}</span> {item.label}
                        </div>
                        <div style={{ fontSize: 10, color: done ? "#ccc" : "#777", lineHeight: 1.5, textDecoration: done ? "line-through" : "none" }}>{item.val}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FOOTER */}
      <div style={{ borderTop: "1px solid #111", padding: "10px 22px", background: "#050505", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
        {[
          { l: "CLOUD THEORY", v: "~7.5h/wk (office)", c: "#FF6B35" },
          { l: "CLOUD LAB",    v: "~4h/wk (weekend)",  c: "#F7C59F" },
          { l: "LEETCODE",     v: "~5h/wk",            c: "#a78bfa" },
          { l: "THESIS",       v: "~8h/wk",            c: "#60a5fa" },
          { l: "INTERVIEW",    v: "~2.5h/wk",          c: "#22c55e" },
          { l: "TOTAL STUDY",  v: "~27h/week",         c: "#ddd"    },
        ].map((s,i) => (
          <div key={i}>
            <div style={{ fontSize: 7, color: "#333", letterSpacing: 2 }}>{s.l}</div>
            <div style={{ fontSize: 11, color: s.c, fontWeight: 600, marginTop: 1 }}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
