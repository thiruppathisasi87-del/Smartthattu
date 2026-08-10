export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

export interface DBTables {
  family_members: {
    id: string;
    user_id: string;
    name: string;
    age: number;
    gender: string;
    activity_level: string;
    health_category: string;
    medical_conditions: string[];
    goal: string | null;
    created_at: string;
  };
  meals: {
    id: string;
    user_id: string;
    member_id: string;
    meal_type: "breakfast" | "lunch" | "dinner" | "snacks";
    date: string;
    foods: Array<{ name: string; quantity: string }>;
    analysis: {
      nutrition: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
        micronutrients: string[];
      };
      healthScore: number;
      suggestions: string[];
      warnings?: string[];
    } | null;
    created_at: string;
  };
  chat_messages: {
    id: string;
    user_id: string;
    role: "user" | "assistant";
    content: string;
    created_at: string;
  };
  user_settings: {
    user_id: string;
    model: string;
    language: string;
    theme: "light" | "dark";
    updated_at: string;
  };
}
