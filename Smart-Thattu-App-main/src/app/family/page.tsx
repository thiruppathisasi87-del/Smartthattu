"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Users as UsersIcon,
  Trash2,
  Edit3,
  Check,
  Loader2,
  Shield,
  User as UserIcon,
} from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  Input,
  Label,
  PageHeader,
  Select,
  Badge,
} from "@/components/ui";
import { Autocomplete } from "@/components/Autocomplete";
import { MEDICAL_CONDITIONS } from "@/data/conditions";
import { useAppStore } from "@/lib/store";
import type {
  ActivityLevel,
  FamilyMember,
  Gender,
  HealthCategory,
} from "@/types";
import { ageGroup, cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

function getActivityOptions(t: ReturnType<typeof useI18n>["t"]) {
  return [
    { value: "sedentary" as ActivityLevel, label: t("actSedentary"), desc: t("actSedentaryDesc") },
    { value: "light" as ActivityLevel, label: t("actLight"), desc: t("actLightDesc") },
    { value: "moderate" as ActivityLevel, label: t("actModerate"), desc: t("actModerateDesc") },
    { value: "active" as ActivityLevel, label: t("actActive"), desc: t("actActiveDesc") },
    { value: "very_active" as ActivityLevel, label: t("actVeryActive"), desc: t("actVeryActiveDesc") },
  ];
}

function getGoalPresets(t: ReturnType<typeof useI18n>["t"]) {
  return [
    t("goalGeneral"),
    t("goalLoss"),
    t("goalGain"),
    t("goalMuscle"),
    t("goalMaintain"),
    t("goalSugar"),
    t("goalBP"),
    t("goalPreg"),
    t("goalPostpartum"),
    t("goalChild"),
    t("goalSports"),
    t("goalSenior"),
  ];
}

interface FormState {
  name: string;
  age: string;
  gender: Gender;
  activityLevel: ActivityLevel;
  medicalConditions: string[];
  goal: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  age: "",
  gender: "male",
  activityLevel: "moderate",
  medicalConditions: [],
  goal: "General Health",
};

export default function FamilyPage() {
  const {
    family,
    addMember,
    updateMember,
    removeMember,
    selectMember,
    selectedMemberId,
    settings,
  } = useAppStore();
  const { t } = useI18n();

  const [form, setForm] = useState<FormState>({
    ...EMPTY_FORM,
    goal: t("goalGeneral"),
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState<HealthCategory | null>(null);
  const [showForm, setShowForm] = useState(false);

  const ACTIVITY_OPTIONS = getActivityOptions(t);
  const GOAL_PRESETS = getGoalPresets(t);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setDetectedCategory(null);
  }

  function startEdit(m: FamilyMember) {
    setEditingId(m.id);
    setShowForm(true);
    setForm({
      name: m.name,
      age: String(m.age),
      gender: m.gender,
      activityLevel: m.activityLevel,
      medicalConditions: [...m.medicalConditions],
      goal: m.goal ?? t("goalGeneral"),
    });
    setDetectedCategory(m.healthCategory);
  }

  async function detectCategory(
    conditions: string[],
    age: number,
    gender: Gender
  ): Promise<HealthCategory> {
    if (!conditions.length) return "Healthy";
    setDetecting(true);
    try {
      const res = await fetch("/api/ai/health-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conditions, age, gender }),
      });
      const data = await res.json();
      setDetectedCategory(data.category);
      return data.category as HealthCategory;
    } catch {
      const fallback = manualCategory(conditions);
      setDetectedCategory(fallback);
      return fallback;
    } finally {
      setDetecting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ageNum = parseInt(form.age, 10);
    if (!form.name.trim() || Number.isNaN(ageNum)) return;
    const category = await detectCategory(form.medicalConditions, ageNum, form.gender);

    if (editingId) {
      updateMember(editingId, {
        name: form.name.trim(),
        age: ageNum,
        gender: form.gender,
        activityLevel: form.activityLevel,
        medicalConditions: form.medicalConditions,
        healthCategory: category,
        goal: form.goal,
      });
    } else {
      addMember({
        name: form.name.trim(),
        age: ageNum,
        gender: form.gender,
        activityLevel: form.activityLevel,
        medicalConditions: form.medicalConditions,
        healthCategory: category,
        goal: form.goal,
      });
    }
    resetForm();
    setShowForm(false);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t("familyEyebrow")}
        title={t("familyTitle")}
        subtitle={t("familySubtitle")}
        action={
          !showForm && (
            <Button
              variant="accent"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              <UserPlus className="w-4 h-4" /> {t("addMember")}
            </Button>
          )
        }
      />

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            onSubmit={handleSubmit}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingId ? t("editMember") : t("addMember")}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="text-[var(--muted-foreground)] hover:text-[var(--danger)]"
              >
                {t("cancel")}
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">{t("fullName")}</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  required
                />
              </div>
              <div>
                <Label htmlFor="age">{t("age")}</Label>
                <Input
                  id="age"
                  type="number"
                  min={0}
                  max={120}
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="e.g. 34"
                  required
                />
              </div>

              <div>
                <Label htmlFor="gender">{t("gender")}</Label>
                <Select
                  id="gender"
                  value={form.gender}
                  onChange={(e) =>
                    setForm({ ...form, gender: e.target.value as Gender })
                  }
                >
                  <option value="male">{t("male")}</option>
                  <option value="female">{t("female")}</option>
                  <option value="other">{t("other")}</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="activity">{t("activityLevel")}</Label>
                <Select
                  id="activity"
                  value={form.activityLevel}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      activityLevel: e.target.value as ActivityLevel,
                    })
                  }
                >
                  {ACTIVITY_OPTIONS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label} — {a.desc}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="conditions">
                  {t("medicalConditions")}
                  <span className="ml-1 text-[11px] font-normal opacity-70">
                    ({t("medicalConditionsHint")})
                  </span>
                </Label>
                <Autocomplete
                  id="conditions"
                  options={MEDICAL_CONDITIONS}
                  value={form.medicalConditions}
                  onChange={(next) =>
                    setForm({ ...form, medicalConditions: next })
                  }
                  placeholder={"e.g. diabetes, thyroid…"}
                />
                {form.medicalConditions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {form.medicalConditions.map((c) => (
                      <span key={c} className="text-[11px] text-[var(--muted-foreground)]">
                        • {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="goal">{t("primaryGoal")}</Label>
                <Select
                  id="goal"
                  value={form.goal}
                  onChange={(e) => setForm({ ...form, goal: e.target.value })}
                >
                  {GOAL_PRESETS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-[var(--muted-foreground)]">
                  {t("healthCategory")}:
                </span>
                {detecting ? (
                  <span className="inline-flex items-center gap-1 text-[var(--muted-foreground)]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t("detecting")}
                  </span>
                ) : detectedCategory ? (
                  <Badge variant="accent">{translateCategory(detectedCategory, t)}</Badge>
                ) : (
                  <span className="text-[var(--muted-foreground)] text-xs">
                    {t("willDetect")}
                  </span>
                )}
              </div>
              <Button type="submit" variant="accent" loading={detecting}>
                <Check className="w-4 h-4" />
                {editingId ? t("save") : t("addMember")}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Member list */}
      {family.length === 0 ? (
        <EmptyState
          icon={<UsersIcon className="w-7 h-7" />}
          title={t("noMembersTitle")}
          subtitle={t("noMembersSubtitle")}
          action={
            <Button
              variant="accent"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              <UserPlus className="w-4 h-4" /> {t("addFirstMember")}
            </Button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {family.map((m) => (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "card cursor-pointer transition-all",
                selectedMemberId === m.id &&
                  "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background)]"
              )}
              onClick={() => selectMember(m.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-semibold shadow-md",
                      m.gender === "female"
                        ? "bg-gradient-to-br from-pink-500 to-rose-500"
                        : m.gender === "male"
                        ? "bg-gradient-to-br from-blue-500 to-indigo-500"
                        : "bg-gradient-to-br from-violet-500 to-purple-500"
                    )}
                  >
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold leading-tight">{m.name}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      {m.age} yrs · {ageGroup(m.age)} ·{" "}
                      {ACTIVITY_OPTIONS.find((a) => a.value === m.activityLevel)?.label}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(m);
                    }}
                    className="p-1.5 rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    aria-label="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(t("removeMemberConfirm", { name: m.name }))) removeMember(m.id);
                    }}
                    className="p-1.5 rounded-full hover:bg-red-500/10 text-[var(--muted-foreground)] hover:text-[var(--danger)]"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <Badge variant="accent">{translateCategory(m.healthCategory, t)}</Badge>
                {m.medicalConditions.slice(0, 3).map((c) => (
                  <Badge key={c}>{c}</Badge>
                ))}
                {m.medicalConditions.length > 3 && (
                  <Badge>+{m.medicalConditions.length - 3}</Badge>
                )}
              </div>

              {m.goal && (
                <div className="mt-3 text-xs text-[var(--muted-foreground)] flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5" /> {m.goal}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Link
                  href={`/meals?member=${m.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="btn-ghost text-xs flex-1 text-center"
                >
                  {t("logMealsFor")}
                </Link>
                <Link
                  href={`/recommend?member=${m.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="btn-primary text-xs flex-1 text-center"
                >
                  {t("recommendFor")}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Simple rule-based fallback when AI isn't reachable
function translateCategory(cat: HealthCategory, t: ReturnType<typeof useI18n>["t"]) {
  const key =
    ({
      Healthy: "catHealthy",
      Diabetes: "catDiabetes",
      Cardiovascular: "catCardio",
      Kidney: "catKidney",
      Liver: "catLiver",
      Digestive: "catDigestive",
      Thyroid: "catThyroid",
      Respiratory: "catRespiratory",
      Cancer: "catCancer",
      Autoimmune: "catAutoimmune",
      "Bone & Joint": "catBone",
      Neurological: "catNeuro",
      "Mental Health": "catMental",
      "Women's Health": "catWomen",
      "Pregnancy & Postpartum": "catPreg",
      "Childhood & Growth": "catChild",
      "Elderly Care": "catElder",
      "Allergies & Intolerances": "catAllergy",
      "Weight Management": "catWeight",
      "Infectious Disease": "catInfectious",
      "Post-Surgery Recovery": "catPostSurg",
      "Sports Nutrition": "catSports",
      Other: "catOther",
    } as const)[cat] ?? "catOther";
  return t(key);
}

function manualCategory(conditions: string[]): HealthCategory {
  const joined = conditions.join(" ").toLowerCase();
  if (/(diabet|prediabet|insulin)/.test(joined)) return "Diabetes";
  if (/(hypertension|blood pressure|cholesterol|heart|stroke|cardiac|angina)/.test(joined))
    return "Cardiovascular";
  if (/(kidney|renal|dialysis|nephr)/.test(joined)) return "Kidney";
  if (/(liver|fatty liver|hepatitis|cirrhosis|jaundice)/.test(joined)) return "Liver";
  if (/(gerd|acid reflux|gastritis|ulcer|ibs|crohn|colitis|celiac|constipation|diarrhea|piles|hemorrhoid|pancreatitis|gallstone)/.test(
    joined
  ))
    return "Digestive";
  if (/(thyroid|hashimoto|graves)/.test(joined)) return "Thyroid";
  if (/(asthma|copd|tuberculosis|bronchitis|pneumonia|rhinitis|sinusitis)/.test(joined))
    return "Respiratory";
  if (/cancer|chemo|tumor|tumou/.test(joined)) return "Cancer";
  if (/(arthritis|osteoporosis|gout|bone|joint|back pain|knee)/.test(joined))
    return "Bone & Joint";
  if (/(migraine|headache|epilepsy|parkinson|alzheimer|dementia|ms|neuropathy|vertigo|insomnia)/.test(
    joined
  ))
    return "Neurological";
  if (/(depression|anxiety|stress|adhd|autism|bipolar|ocd|ptsd)/.test(joined))
    return "Mental Health";
  if (/(pcos|pcod|endometriosis|menopause|menstrua|fertility)/.test(joined))
    return "Women's Health";
  if (/(pregnan|prenatal|postpartum|breastfeed|lactat)/.test(joined))
    return "Pregnancy & Postpartum";
  if (/(toddler|teen|child|infant|growth|fussy)/.test(joined)) return "Childhood & Growth";
  if (/(senior|elderly|old age|alzheimer)/.test(joined)) return "Elderly Care";
  if (/(allergy|intolerance|celiac|lactose|nut allergy|gluten)/.test(joined))
    return "Allergies & Intolerances";
  if (/(obes|overweight|underweight|weight loss|weight gain|muscle gain|metabolic)/.test(
    joined
  ))
    return "Weight Management";
  if (/(fever|viral|infection|covid|dengue|typhoid|malaria|flu|uti)/.test(joined))
    return "Infectious Disease";
  if (/(surgery|post.?op|recovery)/.test(joined)) return "Post-Surgery Recovery";
  if (/(sports|athlete|endurance|marathon|gym|fitness)/.test(joined)) return "Sports Nutrition";
  if (/(anemia|b12|iron|vitamin d|thalassemia)/.test(joined)) return "Other";
  return "Healthy";
}
