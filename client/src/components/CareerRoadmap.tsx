import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  CircleAlert,
  CircleCheck,
  Clock3,
  ExternalLink,
  LockKeyhole,
  MapPin,
  Milestone,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import {
  buildRoadmap,
  getRoadmapProfileGaps,
  inferredRequirementStatus,
  progressFor,
  ROADMAP_STATUS_LABELS,
  type RoadmapRequirement,
  type RoadmapRequirementStatus,
} from "../data/careerRoadmap";

const statusIcon = {
  completed: CircleCheck,
  "in-progress": Clock3,
  "not-started": Milestone,
  "not-applicable": CircleAlert,
};

export default function CareerRoadmap() {
  const { profile, setProfile } = useApp();
  const { user } = useAuth();
  const roadmap = useMemo(() => buildRoadmap(profile), [profile]);
  const gaps = useMemo(() => getRoadmapProfileGaps(profile), [profile]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const activeMilestone =
    roadmap?.milestones.find(milestone => milestone.id === activeId) ||
    roadmap?.milestones[0];
  const statusFor = (
    requirement: RoadmapRequirement
  ): RoadmapRequirementStatus =>
    profile.roadmapRequirementStatuses[requirement.id] ||
    inferredRequirementStatus(requirement, profile);
  const setRequirementStatus = (
    requirementId: string,
    status: RoadmapRequirementStatus
  ) => {
    setProfile(current => ({
      ...current,
      roadmapRequirementStatuses: {
        ...current.roadmapRequirementStatuses,
        [requirementId]: status,
      },
    }));
    setNotice("Roadmap progress saved.");
    window.setTimeout(() => setNotice(""), 2200);
  };

  if (!roadmap) {
    return (
      <section
        className="career-roadmap-shell rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7"
        aria-labelledby="roadmap-heading"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="eyebrow">Personal Career Roadmap</div>
            <h2
              id="roadmap-heading"
              className="mt-2 text-2xl font-extrabold tracking-tight"
            >
              Build the route from where you are to where you want to practise.
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Your roadmap uses your education stage, destination, specialty,
              language, and licensing context. Complete the missing profile
              details to unlock the milestone tracker.
            </p>
          </div>
          <div className="career-roadmap-empty rounded-xl border border-dashed border-primary/30 bg-secondary/45 p-4 lg:max-w-sm">
            <div className="flex items-start gap-3">
              <UserRound size={18} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-extrabold">
                  Complete your roadmap profile
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Still needed: {gaps.join(", ")}.
                </p>
                <Link
                  to="/profile"
                  className="btn-primary mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs"
                >
                  Update profile <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const progress = progressFor(roadmap, profile);
  const currentMilestone =
    roadmap.milestones.find(milestone =>
      milestone.requirements.some(
        requirement =>
          statusFor(requirement) !== "completed" &&
          statusFor(requirement) !== "not-applicable"
      )
    ) || roadmap.milestones[roadmap.milestones.length - 1];
  const nextRequirement = currentMilestone.requirements.find(
    requirement =>
      statusFor(requirement) !== "completed" &&
      statusFor(requirement) !== "not-applicable"
  );
  const completedMilestones = roadmap.milestones.filter(milestone =>
    milestone.requirements.every(requirement =>
      ["completed", "not-applicable"].includes(statusFor(requirement))
    )
  ).length;

  return (
    <section
      className="career-roadmap-shell rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7"
      aria-labelledby="roadmap-heading"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="eyebrow">Personal Career Roadmap</div>
          <h2
            id="roadmap-heading"
            className="mt-2 text-2xl font-extrabold tracking-tight"
          >
            Your route to {roadmap.specialtyName} in {roadmap.countryName}.
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            A living checklist for your route from {profile.currentCountry} to
            the {roadmap.countryName} medical system. Select a milestone to see
            what it means and what to do next.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/45 px-4 py-3">
          <div className="grid h-12 w-12 place-items-center rounded-full border-4 border-primary/20 border-t-primary text-sm font-extrabold text-primary">
            {progress.percentage}%
          </div>
          <div>
            <p className="text-xs font-extrabold">
              {progress.completed}/{progress.total} requirements
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {completedMilestones} milestones complete ·{" "}
              {user ? "Synced to your account" : "Saved on this device"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <div>
          <div
            className="career-roadmap-path"
            role="list"
            aria-label="Career roadmap milestones"
          >
            {roadmap.milestones.map((milestone, index) => {
              const milestoneStatuses = milestone.requirements.map(statusFor);
              const completed = milestoneStatuses.every(
                status => status === "completed" || status === "not-applicable"
              );
              const started = milestoneStatuses.some(
                status => status === "completed" || status === "in-progress"
              );
              const blocked = milestone.requirements.some(
                requirement =>
                  requirement.dependency && !profile.languageProficiency
              );
              const state = blocked
                ? "blocked"
                : completed
                  ? "completed"
                  : started
                    ? "in-progress"
                    : "upcoming";
              const Icon =
                state === "completed"
                  ? Check
                  : state === "blocked"
                    ? LockKeyhole
                    : index + 1;
              return (
                <div
                  className="career-roadmap-node"
                  key={milestone.id}
                  role="listitem"
                >
                  <button
                    type="button"
                    onClick={() => setActiveId(milestone.id)}
                    className={`career-roadmap-milestone ${state} ${activeMilestone?.id === milestone.id ? "active" : ""}`}
                    aria-pressed={activeMilestone?.id === milestone.id}
                  >
                    <span className="career-roadmap-circle">
                      {typeof Icon === "number" ? Icon : <Icon size={17} />}
                    </span>
                    <span className="career-roadmap-label">
                      <strong>{milestone.shortTitle}</strong>
                      <small>
                        {state === "blocked"
                          ? "Blocked"
                          : state === "completed"
                            ? "Complete"
                            : state === "in-progress"
                              ? "In progress"
                              : "Upcoming"}
                      </small>
                    </span>
                  </button>
                  {index < roadmap.milestones.length - 1 && (
                    <span
                      className={`career-roadmap-connector ${completed ? "complete" : ""}`}
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-secondary/45 p-3">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Current milestone
              </p>
              <p className="mt-1 text-sm font-extrabold">
                {currentMilestone.shortTitle}
              </p>
            </div>
            <div className="rounded-xl bg-secondary/45 p-3">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Next action
              </p>
              <p className="mt-1 text-sm font-extrabold">
                {nextRequirement?.title || "Review your completed route"}
              </p>
            </div>
            <div className="rounded-xl bg-secondary/45 p-3">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Destination
              </p>
              <p className="mt-1 flex items-center gap-1 text-sm font-extrabold">
                <MapPin size={13} className="text-primary" />
                {roadmap.countryName}
              </p>
            </div>
          </div>
        </div>

        <div className="career-roadmap-detail rounded-xl border border-border bg-background/60 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                Milestone {activeMilestone?.number}
              </p>
              <h3 className="mt-1 text-lg font-extrabold">
                {activeMilestone?.title}
              </h3>
            </div>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
              {activeMilestone?.requirements.length} requirements
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {activeMilestone?.description}
          </p>
          <div className="mt-4 space-y-3">
            {activeMilestone?.requirements.map(requirement => {
              const status = statusFor(requirement);
              const StatusIcon = statusIcon[status];
              return (
                <article
                  key={requirement.id}
                  className={`career-requirement ${status}`}
                >
                  <div className="flex items-start gap-2.5">
                    <StatusIcon
                      size={16}
                      className="mt-0.5 shrink-0 text-primary"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs font-extrabold">
                          {requirement.title}
                        </h4>
                        <span
                          className={`career-requirement-badge ${requirement.mandatory ? "mandatory" : "optional"}`}
                        >
                          {requirement.mandatory ? "Mandatory" : "Optional"}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                        {requirement.detail}
                      </p>
                      <p className="mt-2 text-[11px] font-bold text-foreground">
                        Action:{" "}
                        <span className="font-normal text-muted-foreground">
                          {requirement.action}
                        </span>
                      </p>
                      <a
                        href={requirement.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
                      >
                        {requirement.sourceLabel} <ExternalLink size={11} />
                      </a>
                    </div>
                    <select
                      value={status}
                      onChange={event =>
                        setRequirementStatus(
                          requirement.id,
                          event.target.value as RoadmapRequirementStatus
                        )
                      }
                      className="h-8 shrink-0 rounded-md border border-border bg-card px-1.5 text-[10px] font-bold"
                      aria-label={`Status for ${requirement.title}`}
                    >
                      {Object.entries(ROADMAP_STATUS_LABELS).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  {requirement.dependency && (
                    <p className="mt-2 border-t border-border pt-2 text-[10px] leading-4 text-muted-foreground">
                      <strong>Depends on:</strong> {requirement.dependency}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
          <div className="mt-4 rounded-lg border border-primary/15 bg-primary/5 p-3">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
              Next step
            </p>
            <p className="mt-1 text-xs leading-5">
              {nextRequirement
                ? nextRequirement.action
                : "Review the official authority guidance and update your profile as your route changes."}
            </p>
          </div>
          {notice && (
            <p
              className="mt-3 text-[11px] font-bold text-primary"
              role="status"
            >
              {notice}
            </p>
          )}
        </div>
      </div>
      <p className="mt-5 text-[11px] leading-5 text-muted-foreground">
        Roadmap guidance is an organized planning aid, not a registration
        decision. Requirements, exemptions, fees, and deadlines depend on your
        exact circumstances; confirm current details with the linked official
        authority before acting.{" "}
        <Link
          to={`/countries/${roadmap.countryId}`}
          className="font-bold text-primary hover:underline"
        >
          Open the {roadmap.countryName} guide{" "}
          <ArrowRight size={11} className="inline" />
        </Link>
      </p>
    </section>
  );
}
