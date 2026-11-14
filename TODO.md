# Personal Career Roadmap

## Homepage placement and profile completion

- [x] Place Personal Career Roadmap directly below the homepage Hero Card and above the Countries section. Evidence: `client/src/pages/Home.tsx` renders `<CareerRoadmap />` immediately after the hero section.
- [x] Preserve existing homepage sections and functionality. Evidence: roadmap is additive; existing quick links, country cards, and downstream homepage sections remain in `Home.tsx`.
- [x] Show a profile-completion state when essential roadmap inputs are missing and link the user to complete their profile. Evidence: `CareerRoadmap.tsx` renders missing profile gaps and a `/profile` action.

## Personalized roadmap model

- [x] Build a scalable data structure for destination countries, specialties, milestones, requirements, official sources, and profile dependencies. Evidence: typed model and country authority overrides in `client/src/data/careerRoadmap.ts`.
- [x] Personalize the pathway using educational stage, current country, target country, specialty, language proficiency, licensing exams, qualifications, objectives, and timeline. Evidence: profile fields feed roadmap construction, profile gaps, inferred completion, and requirement copy.
- [x] Make country, specialty, nationality, medical-school, graduation-date, and other eligibility dependencies explicit where applicable. Evidence: foundation and licensing requirements name these dependencies and use recorded profile evidence without asserting eligibility.
- [x] Never invent official requirements, fees, deadlines, or processing times; link to official authorities and mark current details for verification. Evidence: requirements link to authority pages and the UI warns users to verify current requirements, exemptions, fees, and deadlines.

## Circular milestone roadmap

- [x] Render connected circular milestones for the user's journey. Evidence: responsive connected milestone path in `CareerRoadmap.tsx` and `index.css`.
- [x] Support Completed, In Progress, Upcoming, and Blocked states. Evidence: milestone state is derived from requirement statuses and language dependencies.
- [x] Make every milestone interactive and open detailed information. Evidence: each milestone button selects its detailed requirement panel.
- [x] Preserve the circle concept in a responsive mobile layout. Evidence: horizontal overflow path keeps circular nodes usable on narrow screens.

## Requirements tracker and progress

- [x] Show milestone meaning, purpose, documents, examinations, language requirements, eligibility, application procedure, authorities, costs/deadlines when reliable, sources, and actions. Evidence: each typed requirement includes detail, action, dependency, and official source; the UI explicitly routes users to verify costs/deadlines rather than inventing them.
- [x] Allow requirements to be marked Completed, In Progress, Not Started, or Not Applicable. Evidence: per-requirement status select with all four persisted values.
- [x] Distinguish mandatory requirements from optional recommendations. Evidence: mandatory/optional badges and typed `mandatory` field.
- [x] Calculate progress from actual requirement statuses. Evidence: `progressFor()` counts persisted or inferred statuses and excludes Not Applicable.
- [x] Show overall progress, completed milestones, current milestone, next milestone, remaining requirements, pending actions, and a clear Next Step. Evidence: roadmap summary and next-step panel derive these values from the current profile and status map.

## Persistence and quality

- [x] Save roadmap progress with the authenticated user's existing account data and provide local fallback behavior. Evidence: status map is stored in the existing profile JSON; `AppContext` writes localStorage and debounced authenticated Supabase upserts.
- [ ] Provide loading, empty, error, and success states where applicable. Empty/profile-completion and success save states are implemented; a dedicated cloud-sync error surface remains outside this frontend-only change.
- [x] Run typecheck and production build before publishing. Evidence: `pnpm run check` and `pnpm run build` both pass; `git diff --check` and local HTTP smoke tests also pass.
