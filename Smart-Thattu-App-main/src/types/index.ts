export type Gender = "male" | "female" | "other";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export type HealthCategory =
  | "Healthy"
  | "Diabetes"
  | "Cardiovascular"
  | "Kidney"
  | "Liver"
  | "Digestive"
  | "Thyroid"
  | "Respiratory"
  | "Cancer"
  | "Autoimmune"
  | "Bone & Joint"
  | "Neurological"
  | "Mental Health"
  | "Women's Health"
  | "Pregnancy & Postpartum"
  | "Childhood & Growth"
  | "Elderly Care"
  | "Allergies & Intolerances"
  | "Weight Management"
  | "Infectious Disease"
  | "Post-Surgery Recovery"
  | "Sports Nutrition"
  | "Other";

export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  healthCategory: HealthCategory;
  medicalConditions: string[];
  goal?: string;
  createdAt: string;
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

export interface MealFoodItem {
  name: string;
  quantity: string;
}

export interface MealEntry {
  id: string;
  memberId: string;
  mealType: MealType;
  date: string;
  foods: MealFoodItem[];
  analysis?: MealAnalysis;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  micronutrients: string[];
}

export interface MealAnalysis {
  nutrition: NutritionInfo;
  healthScore: number;
  suggestions: string[];
  warnings?: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface GroceryCategory {
  category: string;
  items: string[];
}

export interface GroceryList {
  categories: GroceryCategory[];
}

export type Theme = "light" | "dark";
export type Language = "en" | "hi" | "ta" | "te" | "bn" | "gu" | "mr";

export interface AppSettings {
  model: string;
  language: Language;
  theme: Theme;
}
