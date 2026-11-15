import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, LockKeyhole, RotateCcw, Save, ShieldAlert, Target } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { answerKey, calculateRoadmap, questionScore, ROADMAP_COUNTRIES, type RoadmapCountry, type RoadmapQuestion } from "../data/roadmapReadiness";
import CareerDashboard from "./CareerDashboard";

function CountryCard({ country, selected, onClick }: { country: RoadmapCountry; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`text-left rounded-2xl border p-5 transition ${selected ? "border-primary bg-primary/5 shadow-md" : "border-border bg-card hover:-translate-y-0.5 hover:border-primary/40"}`}>
      <div className="flex items-center justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-xs font-black">{country.flag}</span>
        {selected && <CheckCircle2 size={19} className="text-primary" />}
      </div>
      <h3 className="mt-4 text-lg font-extrabold">{country.name}</h3>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{country.summary}</p>
      <p className="mt-4 text-[10px] font-extrabold uppercase tracking-wider text-primary">{country.questions.length} tailored checks</p>
    </button>
  );
}

function QuestionCard({ country, question, value, onChange }: { country: RoadmapCountry; question: RoadmapQuestion; value: string; onChange: (value: string) => void }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-extrabold">{question.label}</h3>
            <span className={`career-requirement-badge ${question.gate ? "mandatory" : "optional"}`}>{question.gate ? "Eligibility gate" : "Competitive factor"}</span>
          </div>
          <p className="mt-2 text-sm font-bold leading-6">{question.prompt}</p>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-muted-foreground">Weight {question.weight}</span>
      </div>
      {question.type === "select" ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {question.choices?.map(choice => (
            <button key={choice.value} type="button" onClick={() => onChange(choice.value)} className={`rounded-xl border px-3 py-3 text-left text-xs font-bold transition ${value === choice.value ? "border-primary bg-primary/10 text-primary" : "border-border bg-background/40 hover:border-primary/40"}`}>
              {choice.label}
            </button>
          ))}
        </div>
      ) : (
        <input type="number" min={question.min} max={question.max} value={value} onChange={event => onChange(event.target.value)} placeholder={question.placeholder} className="mt-4 h-11 w-full rounded-xl border border-border bg-background/50 px-3 text-sm outline-hidden focus:border-primary/50 focus:ring-2 focus:ring-primary/15" />
      )}
      <p className="mt-3 text-[11px] leading-5 text-muted-foreground">{question.advice}</p>
      <a href={question.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline">{question.sourceLabel} <ExternalLink size={11} /></a>
    </article>
  );
}

export default function Roadmap() {
  const { profile, setProfile } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [countryId, setCountryId] = useState(profile.targetCountries[0] && ROADMAP_COUNTRIES.some(country => country.id === profile.targetCountries[0]) ? profile.targetCountries[0] : "");
  const [resultShown, setResultShown] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const country = ROADMAP_COUNTRIES.find(item => item.id === countryId);
  const answers = useMemo(() => {
    if (!country) return {};
    return Object.fromEntries(country.questions.map(question => [question.key, profile.residencyEvidence[answerKey(country.id, question.key)] || ""]));
  }, [country, profile.residencyEvidence]);
  const result = country ? calculateRoadmap(country, answers) : null;
  const savedResult = country ? profile.roadmapResults[country.id] : undefined;

  const updateAnswer = (question: RoadmapQuestion, value: string) => {
    if (!country) return;
    setProfile(current => ({
      ...current,
      residencyEvidence: { ...current.residencyEvidence, [answerKey(country.id, question.key)]: value },
      targetCountries: current.targetCountries.includes(country.id) ? current.targetCountries : [...current.targetCountries, country.id],
    }));
  };

  const reset = () => {
    if (!country) return;
    setProfile(current => {
      const next = { ...current.residencyEvidence };
      country.questions.forEach(question => delete next[answerKey(country.id, question.key)]);
      return { ...current, residencyEvidence: next };
    });
    setResultShown(false);
    setStep(1);
  };

  const saveResult = () => {
    if (!country || !result) return;
    setProfile(current => ({
      ...current,
      roadmapResults: {
        ...current.roadmapResults,
        [country.id]: {
          percentage: result.percentage,
          gatesMet: result.gatesMet,
          gatesTotal: result.gatesTotal,
          specialty: current.targetSpecialty,
          cycle: current.residencyCycle,
          savedAt: new Date().toISOString(),
        },
      },
    }));
    navigate("/");
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="eyebrow">Personal Career Roadmap</div>
          <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">Build your residency route, country by country.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Choose one destination, answer the requirements for that system, and receive a transparent preparation score with the largest gaps to fix next.</p>
        </div>
        <Link to="/" className="btn-quiet inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold"><ArrowLeft size={14} /> Back home</Link>
      </div>

      <div className="mt-8 grid gap-2 sm:grid-cols-3">
        {["Choose country", "Answer requirements", "Review readiness"].map((label, index) => <div key={label} className={`rounded-xl border px-4 py-3 text-xs font-extrabold ${step === index ? "border-primary bg-primary/10 text-primary" : step > index ? "border-primary/20 bg-primary/5" : "border-border bg-card text-muted-foreground"}`}><span className="mr-2">{index + 1}</span>{label}</div>)}
      </div>

      {step === 0 && (
        <section className="mt-8" aria-labelledby="country-choice-heading">
          <div className="flex items-end justify-between gap-4"><div><h2 id="country-choice-heading" className="text-xl font-extrabold">First, choose the country you want to enter.</h2><p className="mt-1 text-sm text-muted-foreground">The next page changes its questions and scoring inputs to match this destination.</p></div><Target className="hidden text-primary sm:block" /></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{ROADMAP_COUNTRIES.map(item => <CountryCard key={item.id} country={item} selected={countryId === item.id} onClick={() => { setCountryId(item.id); setResultShown(false); }} />)}</div>
          <div className="mt-6 flex justify-end"><button type="button" disabled={!country} onClick={() => setStep(1)} className="btn-primary inline-flex items-center gap-2 rounded-lg px-5 py-3 text-xs font-extrabold disabled:cursor-not-allowed disabled:opacity-40">Continue to requirements <ArrowRight size={14} /></button></div>
        </section>
      )}

      {step === 1 && country && !resultShown && (
        <section id="readiness-interview" className="mt-8" aria-labelledby="requirements-heading">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5"><p className="text-xs font-extrabold uppercase tracking-wider text-primary">{country.name} readiness interview</p><h2 id="requirements-heading" className="mt-2 text-2xl font-black">Answer every requirement for this pathway.</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Start with your target specialty and cycle, then answer the official eligibility gates and the competitive factors. Your answers save automatically on this device.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="rounded-xl border border-border bg-card p-3"><span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Target specialty</span><input value={profile.targetSpecialty} onChange={event => setProfile(current => ({ ...current, targetSpecialty: event.target.value }))} placeholder="e.g. Internal Medicine" className="mt-2 h-10 w-full rounded-lg border border-border bg-background/50 px-3 text-xs outline-hidden focus:border-primary/50" /></label><label className="rounded-xl border border-border bg-card p-3"><span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Target cycle</span><input value={profile.residencyCycle} onChange={event => setProfile(current => ({ ...current, residencyCycle: event.target.value }))} placeholder="e.g. 2027" className="mt-2 h-10 w-full rounded-lg border border-border bg-background/50 px-3 text-xs outline-hidden focus:border-primary/50" /></label></div></div>
          <div className="mt-5 space-y-4">{country.questions.map(question => <QuestionCard key={question.key} country={country} question={question} value={answers[question.key]} onChange={value => updateAnswer(question, value)} />)}</div>
          <div className="sticky bottom-4 z-10 mt-6 flex flex-wrap justify-between gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur"><button type="button" onClick={() => setStep(0)} className="btn-quiet inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold"><ArrowLeft size={14} /> Change country</button><button type="button" onClick={() => { setResultShown(true); setStep(2); }} className="btn-primary inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-extrabold">Calculate my readiness <ArrowRight size={14} /></button></div>
        </section>
      )}

      {step === 2 && country && resultShown && result && (
        <section className="mt-8" aria-labelledby="result-heading">
          <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]"><div className="rounded-2xl border border-primary/20 bg-primary/5 p-6"><p className="text-xs font-extrabold uppercase tracking-wider text-primary">{country.name} preparation result</p><h2 id="result-heading" className="mt-2 text-2xl font-black">You are {result.percentage}% prepared.</h2><div className="mt-6 grid place-items-center"><div className="grid h-40 w-40 place-items-center rounded-full border-[14px] border-primary/15 border-t-primary text-4xl font-black text-primary">{result.percentage}%</div></div><p className="mt-5 text-center text-xs leading-5 text-muted-foreground">{result.gatesMet}/{result.gatesTotal} official eligibility gates currently meet the calculator benchmark.</p><div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] leading-5 text-muted-foreground"><ShieldAlert size={16} className="mt-0.5 shrink-0 text-amber-600" /><span>This is a product-defined preparation coverage score, not the official probability of getting a residency place. No universal country-wide formula converts exams, research or electives into match odds.</span></div></div><div className="space-y-5"><div className="rounded-2xl border border-border bg-card p-5"><h3 className="flex items-center gap-2 text-sm font-extrabold"><LockKeyhole size={16} className="text-destructive" /> Biggest eligibility gaps</h3><div className="mt-3 space-y-3">{result.blockers.length ? result.blockers.map(question => <div key={question.key} className="rounded-xl border border-destructive/15 bg-destructive/5 p-3"><p className="text-xs font-extrabold">{question.label}</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">{question.advice}</p></div>) : <p className="text-xs text-muted-foreground">No major gate is currently below the benchmark. Verify the named program before relying on the result.</p>}</div></div><div className="rounded-2xl border border-border bg-card p-5"><h3 className="text-sm font-extrabold">What would raise your score next?</h3><div className="mt-3 space-y-3">{result.improvements.map(question => <div key={question.key} className="flex items-start gap-3 rounded-xl bg-secondary/45 p-3"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-black text-primary-foreground">+</span><div><p className="text-xs font-extrabold">{question.label}</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">{question.advice}</p></div></div>)}</div></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={saveResult} className="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-extrabold"><Save size={14} /> {savedResult?.percentage === result.percentage ? "Update saved result" : "Save result"}</button><button type="button" onClick={() => { setResultShown(false); setStep(1); }} className="btn-quiet inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold"><ArrowLeft size={14} /> Edit answers</button><button type="button" onClick={reset} className="btn-quiet inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold"><RotateCcw size={14} /> Start again</button><a href={country.officialUrl} target="_blank" rel="noreferrer" className="btn-quiet inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold">Official rules <ExternalLink size={13} /></a>{savedNotice && <span className="text-xs font-bold text-primary">Saved. It will appear on Home.</span>}</div></div></div>
        </section>
      )}

      <section id="career-dashboard" className="mt-12 border-t border-border pt-10" aria-labelledby="career-dashboard-heading">
        <div className="mb-6">
          <div className="eyebrow">Complete pathway workspace</div>
          <h2 id="career-dashboard-heading" className="mt-2 text-2xl font-black tracking-tight">Eligibility, readiness, and competitiveness in one roadmap</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Keep your country questions, pathway requirements, profile strength, official references, and preparation status together. These assessments remain independent and are never combined into one score.</p>
        </div>
        <CareerDashboard />
      </section>
    </main>
  );
}
