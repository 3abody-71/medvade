# Personal Career Roadmap

## Implementation

Add a personalized roadmap directly below the homepage hero and before the country cards. Reuse the existing `AppContext` profile persistence: roadmap inputs and requirement statuses live inside the authenticated user's existing `medweg_user_data.profile` JSON document, with localStorage fallback for signed-out visitors. This avoids introducing a new database table while keeping cloud state associated with `auth.users.id` through the existing upsert.

Create a data-driven `careerRoadmap.ts` module containing reusable milestone and requirement definitions, country-specific licensing metadata sourced from the existing country records, specialty labels from `specialties.json`, official authority links, and explicit profile dependencies. The first implementation supports every currently visible destination country and any specialty already present in the specialty library.

Add the `CareerRoadmap` homepage section immediately below the hero. It will show a profile-completion state when essential inputs are missing; otherwise it will render a responsive connected circular milestone path, calculated progress, current/next milestone, remaining requirements, and an actionable next step. Clicking a milestone opens its detailed requirements tracker. Requirement statuses are persisted through the existing profile save pipeline.

Extend the Profile page with target specialty, language proficiency, completed licensing exams, professional qualifications, and timeline fields. Keep existing profile and homepage behavior unchanged.

## Design

Use MedVade's existing restrained teal/blue palette, rounded borders, compact typography, and card language. The roadmap's signature element is a horizontal/stacked path of circular milestone buttons with thin connectors, four status treatments, and a focused detail panel. On mobile the circles become a vertically connected path while retaining the circular milestone concept. Avoid decorative percentage-only progress: every percentage is computed from requirement statuses.

## Project structure

- `client/src/data/careerRoadmap.ts`: typed roadmap model, reusable milestone definitions, country-specific metadata, personalization, and progress helpers.
- `client/src/components/CareerRoadmap.tsx`: homepage roadmap UI, milestone interaction, requirement tracker, and profile-completion state.
- `client/src/contexts/AppContext.tsx`: profile fields and persisted roadmap requirement statuses.
- `client/src/pages/Profile.tsx`: roadmap profile inputs.
- `client/src/pages/Home.tsx`: exact hero → roadmap → country section placement.
- `client/src/index.css`: responsive roadmap path and status styling.
- `supabase/community.sql`: existing community migration remains unchanged because roadmap state uses the existing profile JSON persistence.
