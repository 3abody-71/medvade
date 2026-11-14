import { ArrowRight, MapPinned, ShieldCheck, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

export default function CareerRoadmap() {
  const { isArabic } = useApp();
  return (
    <section className="career-roadmap-shell rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7" aria-labelledby="roadmap-heading">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="eyebrow">Personal Career Roadmap</div>
          <h2 id="roadmap-heading" className="mt-2 text-2xl font-extrabold tracking-tight">
            {isArabic ? "اختر الدولة وأجب عن متطلبات الإقامة خطوة بخطوة" : "Choose a country and answer its residency requirements step by step."}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {isArabic
              ? "تدخل إلى صفحة مستقلة، تختار الدولة والتخصص والدورة، ثم نطرح عليك أسئلة خاصة بالنظام المختار ونوضح ما الذي ينقصك."
              : "Open the dedicated roadmap page, choose your destination, specialty and cycle, then answer country-specific questions to see your preparation gaps."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-bold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5"><MapPinned size={13} /> {isArabic ? "6 دول" : "6 countries"}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5"><Stethoscope size={13} /> {isArabic ? "أسئلة خاصة بكل دولة" : "Country-specific questions"}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5"><ShieldCheck size={13} /> {isArabic ? "نسبة جاهزية وليست ضمان قبول" : "Preparation score, not a guarantee"}</span>
          </div>
        </div>
        <Link to="/roadmap" className="btn-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-extrabold">
          {isArabic ? "افتح Roadmap" : "Open Career Roadmap"} <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}
