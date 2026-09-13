import Link from 'next/link';
import { getLang } from '@/lib/i18n/server';

export function generateMetadata() {
  return { title: getLang() === 'zh' ? '使用指南 · MissionSeek' : 'Guide · MissionSeek' };
}

const body = 'text-[15px] leading-[1.78] text-neutral-700 dark:text-neutral-300';
const eyebrow = 'text-[11px] uppercase tracking-[0.2em] text-neutral-500';

function Sec({ id, eb, title, children }: { id?: string; eb?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="border-t border-neutral-200 py-9 first:border-t-0 first:pt-2 dark:border-neutral-800">
      {eb && <p className={eyebrow}>{eb}</p>}
      <h2 className="mt-1.5 text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
      <div className={`mt-3 max-w-[64ch] ${body}`}>{children}</div>
    </section>
  );
}

function Step({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 py-2">
      <span className="font-serif text-lg leading-none text-amber-700 tabular-nums dark:text-amber-500">{n}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function Mod({ href, name, what, how, tip }: { href: string; name: string; what: string; how: string; tip: string }) {
  const lang = getLang();
  return (
    <div className="border-t border-neutral-100 py-5 first:border-t-0 dark:border-neutral-800">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-100">{name}</h3>
        <Link href={href} className="text-xs text-neutral-400 hover:text-amber-700 dark:hover:text-amber-500">{lang === 'zh' ? '打开 →' : 'Open →'}</Link>
      </div>
      <p className="mt-1.5 text-[13px] text-neutral-500">{what}</p>
      <p className="mt-2 text-[14px] leading-relaxed text-neutral-700 dark:text-neutral-300">{how}</p>
      <p className="mt-2 text-[13px] text-amber-700 dark:text-amber-500">{(lang === 'zh' ? '诀窍 · ' : 'Tip · ') + tip}</p>
    </div>
  );
}

function GuideZh() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 md:px-10">
      <div className="border-b border-neutral-200 pb-5 dark:border-neutral-800">
        <p className={eyebrow}>使用指南</p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">如何用对 MissionSeek</h1>
        <p className={`mt-3 max-w-[60ch] ${body}`}>
          这不是一个打卡 App。它是一个会<strong className="font-semibold text-neutral-900 dark:text-neutral-100">复利的个人系统</strong>——越用越懂你，帮你练判断、找方向、把想清楚的事真正做成。用对它，靠的不是填满每个字段，而是<strong className="font-semibold text-neutral-900 dark:text-neutral-100">持续、诚实、把它接进真实决策</strong>。
        </p>
      </div>

      {/* 快速上手 callout */}
      <div className="mt-6 rounded-2xl border border-amber-600/30 bg-amber-500/[0.06] p-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-amber-700 dark:text-amber-500">第一天 · 约 15 分钟</p>
        <div className="mt-2">
          <Step n="1"><b className="font-semibold text-neutral-900 dark:text-neutral-100">先做讣告冷启动。</b> 别急着设目标——想象你 80 岁，你希望被如何记住。AI 会陪你写、追问、提炼成 3–5 条「北极星」。<Link href="/onboarding" className="text-amber-700 hover:underline dark:text-amber-500">去做 →</Link></Step>
          <Step n="2"><b className="font-semibold text-neutral-900 dark:text-neutral-100">记你今天真实面临的一个决策。</b> 写下选项、你的预测、置信度、到期日。当下就把选择想清楚了。<Link href="/decisions" className="text-amber-700 hover:underline dark:text-amber-500">去做 →</Link></Step>
          <Step n="3"><b className="font-semibold text-neutral-900 dark:text-neutral-100">记一条使命信号。</b> 最近让你嫉妒 / 愤怒 / 心流的一件事，AI 当场给你一条方向线索。<Link href="/signals" className="text-amber-700 hover:underline dark:text-amber-500">去做 →</Link></Step>
        </div>
        <p className="mt-2 text-[13px] text-neutral-600 dark:text-neutral-300">第一天就会有三次「原来如此」——这就是它跟打卡工具的区别。</p>
      </div>

      <Sec eb="心脏" title="核心循环：记录 → 洞察 → 行动 → 验证">
        <p>所有功能都服务这一条循环：<b>记录</b>你的决策、信号、进展 → 让 AI 和数据给你<b>洞察</b> → 转成<b>行动</b> → 到期<b>验证</b>预测对不对 → 再记录。转得越久，系统越懂你，建议越准。每周复盘就是这颗心脏的一次跳动。</p>
      </Sec>

      <Sec eb="六大模块" title="每个模块，怎么用对">
        <Mod href="/onboarding" name="讣告 · 北极星"
          what="给整个系统定方向。"
          how="从人生终点倒推：写你的讣告，AI 追问「这是真心还是你以为该写」，提炼出「你想被记住的样子」。每季度回看一次、修订版本。"
          tip="写真心话，不用漂亮。别人会看到的那种漂亮，恰恰是要被追问掉的。" />
        <Mod href="/decisions" name="决策 · 校准 · 三视角"
          what="给你的判断力装上反馈闭环。"
          how="面临选择时记一张决策卡：选项 + 预测 + 置信度(%) + 对账日期。到期系统提醒你记录真实结果，自动算 Brier 校准分。「召唤三视角」让过去/现在/未来的你各说一句。"
          tip="置信度要诚实。80% 就是「五次里你敢错一次」。校准分会揭穿你的乐观。" />
        <Mod href="/signals" name="使命信号雷达"
          what="用真实反应找方向，不靠空想。"
          how="随手记三类信号——嫉妒(欲望地图)、愤怒(价值观边界)、心流(天赋方向)。AI 当场给线索，攒够了点「提炼使命假设」聚成方向。"
          tip="嫉妒别羞耻，它是关于你想成为谁最诚实的数据。" />
        <Mod href="/review" name="每周复盘"
          what="把一周收敛成方向与行动。"
          how="固定时间做：看本周快照 → 让 AI 挑你自欺的地方 → 记 wins/learnings → 数 North Star（本周因系统而多做成的真实事）→ 定下周 ≤3 个行动。"
          tip="North Star 要狠：只算真实做成的事，虚的不算。这是判断系统值不值得用的唯一标准。" />
        <Mod href="/skills" name="能力账本"
          what="像资产一样管理能力——会折旧。"
          how="加技能，用「加证据」（作品/成果/反馈）坐实等级。没有证据的等级会被封顶 L1 并显示 🔒；久不练自动贬值提醒你。"
          tip="禁止自评刷等级。等级 > L1 必须有证据，这条铁律是为了不自欺。" />
        <Mod href="/settings" name="护栏 · 数据"
          what="反脆弱与数据主权。"
          how="反目标（我拒绝成为的人，当机会过滤器）；低潮期协议（趁状态好时预写「崩了怎么办」）；一键导出全部数据为 JSON（本地生成，你的数据你带走）。"
          tip="低潮协议不是等崩了才写——是现在写好，将来照做。" />
      </Sec>

      <Sec eb="心法" title="用对的六条原则">
        <ol className="list-none space-y-2">
          <li><b className="text-neutral-900 dark:text-neutral-100">证据优先</b>——能力、使命都要真实痕迹背书，拒绝自评。</li>
          <li><b className="text-neutral-900 dark:text-neutral-100">预测 + 校准</b>——凡判断先写预测，事后对账，让系统学会你的偏差。</li>
          <li><b className="text-neutral-900 dark:text-neutral-100">对抗式不是敌人</b>——AI 会反驳你、挑你自欺，那正是它的价值，别把它调成捧场的。</li>
          <li><b className="text-neutral-900 dark:text-neutral-100">低摩擦 &gt; 完整</b>——记一句胜过不记；追求持续，不追求填满。</li>
          <li><b className="text-neutral-900 dark:text-neutral-100">盯 North Star</b>——只看它有没有改变你的真实行动，不看条目数、登录时长。</li>
          <li><b className="text-neutral-900 dark:text-neutral-100">数据主权</b>——一切本地，随时导出，这是你最私密的数据集。</li>
        </ol>
      </Sec>

      <Sec eb="节奏" title="推荐使用节奏">
        <p><b>每天（0 摩擦）</b>：有真实决策就记一张卡；有嫉妒/愤怒/心流就随手记一条。不需要每天登录做功课。</p>
        <p className="mt-2"><b>每周（15 分钟）</b>：做一次每周复盘——这是唯一「必做」的仪式，是系统的心跳。</p>
        <p className="mt-2"><b>每季（回看）</b>：回看并修订讣告/北极星与使命假设，看看自己怎么演化了。</p>
      </Sec>

      <Sec eb="反模式" title="别踩这几个坑">
        <ul className="list-none space-y-2">
          <li><b className="text-neutral-900 dark:text-neutral-100">元工作陷阱（最大）</b>——沉迷于「打磨系统」而不去真正行动。系统是为了让你多做成事，不是替代做事。</li>
          <li><b className="text-neutral-900 dark:text-neutral-100">虚荣计数</b>——记了一堆却不对账、不复盘。数据不产生行动就是负担。</li>
          <li><b className="text-neutral-900 dark:text-neutral-100">自评刷等级</b>——能力账本没证据的等级不算数，别骗自己。</li>
          <li><b className="text-neutral-900 dark:text-neutral-100">把 AI 当捧场的</b>——它越敢反驳你越有用。</li>
        </ul>
      </Sec>

      <Sec eb="常见问题" title="FAQ">
        <p><b>AI 功能报错 / 不工作？</b> 在项目根 <code className="rounded bg-neutral-500/10 px-1 py-0.5 text-[13px]">.env.local</code> 配好 LLM：DeepSeek / OpenAI / Claude / 本地 Ollama 四选一（见 README「配置 AI」），改完重启。</p>
        <p className="mt-2"><b>我的数据在哪？安全吗？</b> 全部存在本地 SQLite（<code className="rounded bg-neutral-500/10 px-1 py-0.5 text-[13px]">./data/mission-seek.db</code>），不经任何第三方。随时在<Link href="/settings" className="text-amber-700 hover:underline dark:text-amber-500">护栏·数据</Link>一键导出 JSON 带走。</p>
        <p className="mt-2"><b>多久才能见效？</b> 讣告、决策卡、信号第一天就有回报；校准分、使命收敛、能力曲线需要几周累积——这正是「复利」的意思。</p>
      </Sec>

      <div className="mt-10 flex flex-wrap gap-3 border-t border-neutral-200 pt-8 dark:border-neutral-800">
        <Link href="/onboarding" className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white">开始讣告冷启动 →</Link>
        <Link href="/" className="rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:border-amber-500 dark:border-neutral-700 dark:text-neutral-200">回到概览</Link>
      </div>
    </main>
  );
}


export default function GuidePage() {
  return getLang() === 'zh' ? <GuideZh /> : <GuideEn />;
}

function GuideEn() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 md:px-10">
      <div className="border-b border-neutral-200 pb-5 dark:border-neutral-800">
        <p className={eyebrow}>Guide</p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">How to use MissionSeek well</h1>
        <p className={`mt-3 max-w-[60ch] ${body}`}>
          This isn’t a check-in app. It’s a <strong className="font-semibold text-neutral-900 dark:text-neutral-100">personal system that compounds</strong>—it understands you more the more you use it, helping you train judgment, find direction, and actually finish what you’ve thought through. Using it well isn’t about filling every field; it’s about being <strong className="font-semibold text-neutral-900 dark:text-neutral-100">consistent, honest, and wiring it into real decisions</strong>.
        </p>
      </div>

      {/* quick-start callout */}
      <div className="mt-6 rounded-2xl border border-amber-600/30 bg-amber-500/[0.06] p-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-amber-700 dark:text-amber-500">Day one · about 15 minutes</p>
        <div className="mt-2">
          <Step n="1"><b className="font-semibold text-neutral-900 dark:text-neutral-100">Start with the eulogy cold-start.</b> Don’t rush to set goals—imagine you’re 80 and how you’d want to be remembered. AI writes with you, probes, and distills 3–5 “North Star” lines. <Link href="/onboarding" className="text-amber-700 hover:underline dark:text-amber-500">Do it →</Link></Step>
          <Step n="2"><b className="font-semibold text-neutral-900 dark:text-neutral-100">Log a real decision you face today.</b> Write the options, your prediction, confidence, and reconcile date. You think the choice through right now. <Link href="/decisions" className="text-amber-700 hover:underline dark:text-amber-500">Do it →</Link></Step>
          <Step n="3"><b className="font-semibold text-neutral-900 dark:text-neutral-100">Log a mission signal.</b> Something that recently made you envious / angry / hit flow—AI gives you a direction clue on the spot. <Link href="/signals" className="text-amber-700 hover:underline dark:text-amber-500">Do it →</Link></Step>
        </div>
        <p className="mt-2 text-[13px] text-neutral-600 dark:text-neutral-300">You’ll get three “aha” moments on day one—that’s what sets it apart from a habit tracker.</p>
      </div>

      <Sec eb="The heart" title="Core loop: Record → Insight → Act → Verify">
        <p>Every feature serves one loop: <b>record</b> your decisions, signals, and progress → let AI and data give you <b>insight</b> → turn it into <b>action</b> → <b>verify</b> whether the prediction held when it’s due → record again. The longer it spins, the better the system knows you and the sharper its advice. The weekly review is one beat of this heart.</p>
      </Sec>

      <Sec eb="Six modules" title="Each module, and how to use it right">
        <Mod href="/onboarding" name="Eulogy · North Star"
          what="Sets the direction for the whole system."
          how="Work backward from the end of life: write your eulogy, AI asks “is this real, or what you think you should write,” and distills “how you want to be remembered.” Revisit and revise each quarter."
          tip="Write the honest thing, not the pretty thing. The pretty version others would see is exactly what gets probed away." />
        <Mod href="/decisions" name="Decisions · Calibration · 3 Perspectives"
          what="Puts a feedback loop on your judgment."
          how="When you face a choice, log a decision card: options + prediction + confidence (%) + reconcile date. When it’s due, the system prompts you to record the real outcome and computes your Brier calibration score. “Summon 3 perspectives” lets your past / present / future self each say a line."
          tip="Be honest with confidence. 80% means “you’d dare be wrong one time in five.” The calibration score will expose your optimism." />
        <Mod href="/signals" name="Mission-Signal Radar"
          what="Find direction from real reactions, not wishful thinking."
          how="Jot three kinds of signal—envy (a map of desire), anger (a boundary of values), flow (a direction of talent). AI gives a clue on the spot; once you have enough, tap “synthesize mission hypotheses” to cluster them into direction."
          tip="Don’t be ashamed of envy—it’s the most honest data about who you want to become." />
        <Mod href="/review" name="Weekly Review"
          what="Converge a week into direction and actions."
          how="Do it at a fixed time: read the week’s snapshot → let AI call out where you fooled yourself → note wins/learnings → count your North Star (real things you did or did better this week because of the system) → set ≤3 actions for next week."
          tip="Be ruthless about North Star: only real, finished things count—fluff doesn’t. It’s the one test of whether the system is worth using." />
        <Mod href="/skills" name="Capability Ledger"
          what="Manage skills like assets—they depreciate."
          how="Add a skill, then use “Add evidence” (artifact / outcome / feedback) to make its level real. A level without evidence is capped at L1 and shows 🔒; what you stop practicing depreciates and nudges you."
          tip="No self-inflated levels. Any level > L1 must have evidence—an iron rule, so you don’t fool yourself." />
        <Mod href="/settings" name="Guardrails · Data"
          what="Anti-fragility and data sovereignty."
          how="Anti-goals (who I refuse to become, as an opportunity filter); a low-point protocol (write “what to do when I crash” while you feel good); one-click export of all data to JSON (generated locally—your data goes with you)."
          tip="The low-point protocol isn’t written after you crash—write it now, follow it later." />
      </Sec>

      <Sec eb="Mindset" title="Six principles for using it right">
        <ol className="list-none space-y-2">
          <li><b className="text-neutral-900 dark:text-neutral-100">Evidence first</b>—skills and mission both need real traces to back them; no self-assessment.</li>
          <li><b className="text-neutral-900 dark:text-neutral-100">Predict + calibrate</b>—write a prediction before any judgment, reconcile afterward, and let the system learn your bias.</li>
          <li><b className="text-neutral-900 dark:text-neutral-100">Adversarial isn’t the enemy</b>—AI pushes back and calls out your self-deception; that’s the value, so don’t tune it into a cheerleader.</li>
          <li><b className="text-neutral-900 dark:text-neutral-100">Low friction &gt; completeness</b>—one line beats none; aim for consistency, not filling everything in.</li>
          <li><b className="text-neutral-900 dark:text-neutral-100">Watch the North Star</b>—only whether it changed your real actions, not entry counts or time logged in.</li>
          <li><b className="text-neutral-900 dark:text-neutral-100">Data sovereignty</b>—everything local, exportable anytime; this is your most private dataset.</li>
        </ol>
      </Sec>

      <Sec eb="Cadence" title="A recommended cadence">
        <p><b>Daily (zero friction)</b>: log a card when there’s a real decision; jot a line when you feel envy / anger / flow. No need to log in daily to do homework.</p>
        <p className="mt-2"><b>Weekly (15 minutes)</b>: do one weekly review—the only “must-do” ritual, the system’s heartbeat.</p>
        <p className="mt-2"><b>Quarterly (look back)</b>: revisit and revise your eulogy / North Star and mission hypotheses, and see how you’ve evolved.</p>
      </Sec>

      <Sec eb="Anti-patterns" title="Traps not to step in">
        <ul className="list-none space-y-2">
          <li><b className="text-neutral-900 dark:text-neutral-100">The meta-work trap (biggest)</b>—getting hooked on “polishing the system” instead of actually acting. The system exists to help you finish more, not to replace doing.</li>
          <li><b className="text-neutral-900 dark:text-neutral-100">Vanity counting</b>—logging a pile but never reconciling or reviewing. Data that produces no action is just weight.</li>
          <li><b className="text-neutral-900 dark:text-neutral-100">Self-inflated levels</b>—in the Capability Ledger a level without evidence doesn’t count. Don’t kid yourself.</li>
          <li><b className="text-neutral-900 dark:text-neutral-100">Treating AI as a cheerleader</b>—the more it dares to push back, the more useful it is.</li>
        </ul>
      </Sec>

      <Sec eb="FAQ" title="FAQ">
        <p><b>AI features erroring / not working?</b> Configure an LLM in <code className="rounded bg-neutral-500/10 px-1 py-0.5 text-[13px]">.env.local</code> at the project root: pick one of DeepSeek / OpenAI / Claude / local Ollama (see “Configure AI” in the README), or set it in-app under Settings · AI. Restart after editing the file.</p>
        <p className="mt-2"><b>Where’s my data? Is it safe?</b> All in local SQLite (<code className="rounded bg-neutral-500/10 px-1 py-0.5 text-[13px]">./data/mission-seek.db</code>), through no third party. Export it to JSON anytime from <Link href="/settings" className="text-amber-700 hover:underline dark:text-amber-500">Guardrails · Data</Link> and take it with you.</p>
        <p className="mt-2"><b>How long until it pays off?</b> Eulogy, decision cards, and signals pay back on day one; the calibration score, mission convergence, and capability curve take a few weeks to accrue—which is exactly what “compounding” means.</p>
      </Sec>

      <div className="mt-10 flex flex-wrap gap-3 border-t border-neutral-200 pt-8 dark:border-neutral-800">
        <Link href="/onboarding" className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white">Start the eulogy cold-start →</Link>
        <Link href="/" className="rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:border-amber-500 dark:border-neutral-700 dark:text-neutral-200">Back to overview</Link>
      </div>
    </main>
  );
}

