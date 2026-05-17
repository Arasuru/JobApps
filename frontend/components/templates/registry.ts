// ─── CV Template Registry ────────────────────────────────────────────────────
// Add new templates here. Zero other files need to change.

export type TemplateId = "european" | "academic" | "south-asian";

export interface CvTemplate {
  id: TemplateId;
  name: string;
  tags: [string, string];       // [style, market] — shown as pills in sidebar
  fields: (keyof PersonalInfo)[]; // which personal info inputs to show
}

export interface PersonalInfo {
  Firstname: string;
  Lastname: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  IndustryPortfolio: string;
  PhDPortfolio: string;
}

export const EMPTY_PERSONAL_INFO: PersonalInfo = {
  Firstname: "",
  Lastname: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  IndustryPortfolio: "",
  PhDPortfolio: "",
};

export const CV_TEMPLATES: CvTemplate[] = [
  {
    id: "european",
    name: "European",
    tags: ["Industry", "DE/EU"],
    fields: ["Firstname", "Lastname", "email", "phone", "location", "linkedin", "IndustryPortfolio"],
  },
  {
    id: "academic",
    name: "Academic",
    tags: ["Research", "PhD"],
    fields: ["Firstname", "Lastname", "email", "phone", "location", "linkedin", "PhDPortfolio"],
  },
  {
    id: "south-asian",
    name: "South Asian",
    tags: ["Industry", "IN"],
    fields: ["Firstname", "Lastname", "email", "phone", "location", "linkedin", "IndustryPortfolio"],
  },
];

// Lookup helper
export function getTemplate(id: TemplateId): CvTemplate {
  return CV_TEMPLATES.find(t => t.id === id) ?? CV_TEMPLATES[0];
}

// Field display labels — used to render input placeholders
export const FIELD_LABELS: Record<keyof PersonalInfo, string> = {
  Firstname: "First Name",
  Lastname: "Last Name",
  email: "Email",
  phone: "Phone",
  location: "Location",
  linkedin: "LinkedIn URL",
  IndustryPortfolio: "Portfolio URL",
  PhDPortfolio: "PhD Portfolio URL",
};

// Which fields sit side-by-side in the two-column grid
export const FIELD_PAIRS: (keyof PersonalInfo)[][] = [
  ["Firstname", "Lastname"],
  ["email", "phone"],
  ["location", "linkedin"],
  ["IndustryPortfolio"],
  ["PhDPortfolio"],
];