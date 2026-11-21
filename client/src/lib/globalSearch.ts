import countries from "../data/countries.json";
import specialties from "../data/specialties.json";
import {
  FEATURE_VISIBILITY,
  isCountryNameVisible,
  isCountryVisible,
} from "../config/featureVisibility";

export type SearchCategory =
  | "countries"
  | "licensing"
  | "specialties"
  | "guides";

export interface SearchItem {
  id: string;
  category: SearchCategory;
  title: string;
  description: string;
  to: string;
  searchText: string;
}

const ARABIC_COUNTRY_NAMES: Record<string, string[]> = {
  usa: ["الولايات المتحدة", "امريكا", "أمريكا"],
  uk: ["المملكة المتحدة", "بريطانيا", "إنجلترا"],
  australia: ["أستراليا"],
  canada: ["كندا"],
  germany: ["ألمانيا"],
  ireland: ["أيرلندا", "ايرلندا"],
};

const countryData = countries as Array<{
  id: string;
  name: string;
  region: string;
  summary: string;
  licensingBody: string;
  languageRequirement: string;
  requirements: string[];
  steps: string[];
}>;

const visibleCountries = countryData
  .filter(
    country =>
      isCountryVisible(country.id) && isCountryNameVisible(country.name)
  )
  .filter(
    country => !country.summary.toLowerCase().includes("details coming soon")
  );

const countryItems: SearchItem[] = visibleCountries.map(country => {
  const arabicNames = ARABIC_COUNTRY_NAMES[country.id] ?? [];
  const pathwayText = [
    country.summary,
    country.region,
    country.licensingBody,
    country.languageRequirement,
    ...country.requirements,
    ...country.steps,
  ].join(" ");

  return {
    id: `country-${country.id}`,
    category: "countries",
    title: country.name,
    description: country.summary,
    to: `/countries/${country.id}`,
    searchText: [country.name, country.id, ...arabicNames, pathwayText].join(
      " "
    ),
  };
});

const licensingItems: SearchItem[] = visibleCountries
  .filter(country => country.requirements.length > 0)
  .map(country => {
    const arabicNames = ARABIC_COUNTRY_NAMES[country.id] ?? [];
    const description = [
      country.licensingBody,
      country.languageRequirement,
      ...country.requirements,
    ].join(" · ");

    return {
      id: `licensing-${country.id}`,
      category: "licensing",
      title: `${country.name} licensing requirements`,
      description,
      to: `/countries/${country.id}`,
      searchText: [
        country.name,
        country.id,
        ...arabicNames,
        description,
        ...country.steps,
      ].join(" "),
    };
  });

const specialtyItems: SearchItem[] = FEATURE_VISIBILITY.specialties
  ? (
      specialties as Array<{
        id: string;
        name: string;
        category?: string;
        description: string;
        tags?: string[];
        workStyle?: string;
        competitiveness?: string;
      }>
    ).map(specialty => ({
      id: `specialty-${specialty.id}`,
      category: "specialties",
      title: specialty.name,
      description: specialty.description,
      to: `/explore/${specialty.id}`,
      searchText: [
        specialty.name,
        specialty.id,
        specialty.category,
        specialty.description,
        specialty.workStyle,
        specialty.competitiveness,
        ...(specialty.tags ?? []),
      ]
        .filter(Boolean)
        .join(" "),
    }))
  : [];

const guideItems: SearchItem[] = [
  {
    id: "guide-career-roadmap",
    category: "guides",
    title: "Career roadmap",
    description:
      "Build and review your personalized medical career milestones.",
    to: "/roadmap",
    searchText:
      "career roadmap milestones requirements profile action plan خريطة المسار المهني",
  },
  ...countryItems.map(country => ({
    id: `guide-pathway-${country.id.replace("country-", "")}`,
    category: "guides" as const,
    title: `${country.title} pathway information`,
    description: `Guides and resources for the ${country.title} pathway.`,
    to: `${country.to}/pathway-info`,
    searchText: `${country.title} pathway information guide library مسار معلومات الترخيص`,
  })),
  ...(isCountryVisible("usa")
    ? [
        {
          id: "guide-usmle",
          category: "guides" as const,
          title: "USMLE Step 1 and Step 2 CK guide",
          description:
            "Exam structure, preparation resources, test locations, and costs.",
          to: "/countries/usa/pathway-info/usmle",
          searchText:
            "USMLE Step 1 Step 2 CK ECFMG exam preparation Boards Beyond Pathoma First Aid Sketchy Anki UWorld test locations costs امتحان أمريكا",
        },
      ]
    : []),
  ...(isCountryVisible("uk")
    ? [
        {
          id: "guide-uk-prioritisation-2026",
          category: "guides" as const,
          title: "UK medical training prioritisation for IMGs",
          description:
            "A 2026 policy FAQ about medical training prioritisation in the UK.",
          to: "/countries/uk/pathway-info/prioritisation-2026",
          searchText:
            "United Kingdom UK medical training prioritisation 2026 policy FAQ international medical graduates IMG NHS Oriel المملكة المتحدة أولوية التدريب",
        },
      ]
    : []),
  ...(isCountryVisible("germany")
    ? [
        {
          id: "guide-germany-states",
          category: "guides" as const,
          title: "Germany for doctors: salaries, states, shifts, and holidays",
          description:
            "Compare doctor salaries, German states, shift patterns, and leave.",
          to: "/countries/germany/pathway-info/states-salaries-shifts",
          searchText:
            "Germany doctors salaries states shifts holidays Approbation Assistenzarzt Bavaria North Rhine Westphalia German language ألمانيا الأطباء الرواتب الولايات المناوبات",
        },
      ]
    : []),
];

export const GLOBAL_SEARCH_ITEMS: SearchItem[] = [
  ...countryItems,
  ...licensingItems,
  ...specialtyItems,
  ...guideItems,
];

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/\u0640/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function searchSiteContent(query: string): SearchItem[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  const terms = normalizedQuery.split(" ");
  return GLOBAL_SEARCH_ITEMS.map(item => {
    const normalizedText = normalizeSearchText(
      `${item.title} ${item.description} ${item.searchText}`
    );
    if (!terms.every(term => normalizedText.includes(term))) return null;

    const normalizedTitle = normalizeSearchText(item.title);
    const score = terms.reduce((total, term) => {
      if (normalizedTitle === term) return total + 5;
      if (normalizedTitle.startsWith(term)) return total + 3;
      if (normalizedTitle.includes(term)) return total + 2;
      return total;
    }, 0);
    return { item, score };
  })
    .filter(
      (match): match is { item: SearchItem; score: number } => match !== null
    )
    .sort(
      (a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title)
    )
    .map(match => match.item);
}
