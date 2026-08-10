// Comprehensive medical conditions database for SmartThattu
export interface MedicalCondition {
  name: string;
  aliases?: string[];
  category?: string;
}

export const MEDICAL_CONDITIONS: MedicalCondition[] = [
  // Diabetes
  { name: "Diabetes", aliases: ["diabetes mellitus", "madhumeh"] },
  { name: "Type 1 Diabetes", aliases: ["insulin dependent diabetes", "t1d"] },
  { name: "Type 2 Diabetes", aliases: ["non insulin dependent", "t2d", "adult onset diabetes"] },
  { name: "Prediabetes", aliases: ["borderline diabetes", "impaired glucose"] },
  { name: "Diabetic Neuropathy", aliases: ["diabetic nerve damage"] },
  { name: "Diabetic Nephropathy", aliases: ["diabetic kidney disease"] },
  { name: "Diabetic Retinopathy", aliases: ["diabetic eye disease"] },
  { name: "Gestational Diabetes", aliases: ["pregnancy diabetes"] },

  // Cardiovascular
  { name: "Hypertension", aliases: ["high blood pressure", "high bp", "rakthachapam"] },
  { name: "Hypotension", aliases: ["low blood pressure", "low bp"] },
  { name: "High Cholesterol", aliases: ["hypercholesterolemia", "high ldl"] },
  { name: "Heart Disease", aliases: ["cardiac disease", "cardiovascular disease"] },
  { name: "Coronary Artery Disease", aliases: ["cad", "blocked arteries"] },
  { name: "Stroke", aliases: ["brain attack", "pakshaghatam"] },
  { name: "Heart Failure", aliases: ["congestive heart failure", "chf"] },
  { name: "Arrhythmia", aliases: ["irregular heartbeat"] },
  { name: "Angina", aliases: ["chest pain"] },
  { name: "Atherosclerosis", aliases: ["hardening of arteries"] },

  // Kidney
  { name: "Kidney Disease", aliases: ["renal disease", "nephropathy"] },
  { name: "Chronic Kidney Disease", aliases: ["ckd"] },
  { name: "Kidney Failure", aliases: ["renal failure", "esrd"] },
  { name: "Kidney Stones", aliases: ["renal calculi", "nephrolithiasis"] },
  { name: "Dialysis", aliases: ["hemodialysis", "peritoneal dialysis"] },
  { name: "Nephrotic Syndrome" },
  { name: "Glomerulonephritis" },

  // Liver
  { name: "Liver Disease", aliases: ["hepatic disease"] },
  { name: "Fatty Liver", aliases: ["nafld", "steatosis"] },
  { name: "Hepatitis", aliases: ["hepatitis a", "hepatitis b", "hepatitis c"] },
  { name: "Cirrhosis", aliases: ["liver scarring"] },
  { name: "Jaundice", aliases: ["kamala", "piliya"] },
  { name: "Gilbert's Syndrome" },

  // Digestive
  { name: "GERD", aliases: ["acid reflux", "heartburn", "acidity"] },
  { name: "Gastritis", aliases: ["stomach inflammation"] },
  { name: "Peptic Ulcer", aliases: ["stomach ulcer", "gastric ulcer"] },
  { name: "IBS", aliases: ["irritable bowel syndrome"] },
  { name: "Crohn's Disease" },
  { name: "Ulcerative Colitis", aliases: ["uc"] },
  { name: "Celiac Disease", aliases: ["gluten sensitive enteropathy"] },
  { name: "Constipation", aliases: ["kabj"] },
  { name: "Diarrhea", aliases: ["loose motions", "dast"] },
  { name: "Dysentery" },
  { name: "Bloating", aliases: ["gas", "flatulence"] },
  { name: "Indigestion", aliases: ["dyspepsia"] },
  { name: "Hemorrhoids", aliases: ["piles"] },
  { name: "Gallstones", aliases: ["cholelithiasis"] },
  { name: "Pancreatitis" },

  // Thyroid
  { name: "Thyroid" },
  { name: "Hypothyroidism", aliases: ["underactive thyroid"] },
  { name: "Hyperthyroidism", aliases: ["overactive thyroid"] },
  { name: "Hashimoto's Thyroiditis" },
  { name: "Graves' Disease" },
  { name: "Goiter" },

  // Respiratory
  { name: "Asthma", aliases: ["dama"] },
  { name: "COPD", aliases: ["chronic obstructive pulmonary disease"] },
  { name: "Tuberculosis", aliases: ["tb", "tapur"] },
  { name: "Bronchitis" },
  { name: "Pneumonia" },
  { name: "Allergic Rhinitis", aliases: ["hay fever"] },
  { name: "Sinusitis" },
  { name: "Sleep Apnea" },

  // Cancer
  { name: "Cancer", aliases: ["oncology"] },
  { name: "Breast Cancer" },
  { name: "Colon Cancer" },
  { name: "Lung Cancer" },
  { name: "Prostate Cancer" },
  { name: "Stomach Cancer", aliases: ["gastric cancer"] },
  { name: "Oral Cancer" },
  { name: "Cervical Cancer" },
  { name: "Ovarian Cancer" },
  { name: "Chemotherapy Recovery" },
  { name: "Radiation Recovery" },

  // Blood / Anemia
  { name: "Anemia", aliases: ["low hemoglobin", "iron deficiency"] },
  { name: "Sickle Cell Anemia" },
  { name: "Thalassemia" },
  { name: "Hemochromatosis", aliases: ["iron overload"] },
  { name: "Vitamin B12 Deficiency" },
  { name: "Vitamin D Deficiency" },
  { name: "Iron Deficiency" },
  { name: "Folate Deficiency" },

  // Bone & Joint
  { name: "Arthritis", aliases: ["joint pain"] },
  { name: "Osteoarthritis", aliases: ["oa", "wear and tear arthritis"] },
  { name: "Rheumatoid Arthritis", aliases: ["ra"] },
  { name: "Osteoporosis", aliases: ["weak bones", "low bone density"] },
  { name: "Gout", aliases: ["high uric acid"] },
  { name: "Back Pain", aliases: ["lower back pain", "kamar dard"] },
  { name: "Knee Pain", aliases: ["ghutne dard"] },
  { name: "Frozen Shoulder" },
  { name: "Sciatica" },

  // Neurological
  { name: "Migraine", aliases: ["adhakapari", "severe headache"] },
  { name: "Headache", aliases: ["sir dard"] },
  { name: "Epilepsy", aliases: ["seizures"] },
  { name: "Parkinson's Disease" },
  { name: "Alzheimer's Disease", aliases: ["dementia"] },
  { name: "Multiple Sclerosis", aliases: ["ms"] },
  { name: "Vertigo", aliases: ["chakkar"] },
  { name: "Insomnia", aliases: ["sleeplessness"] },
  { name: "Neuropathy", aliases: ["nerve pain"] },

  // Mental Health
  { name: "Depression" },
  { name: "Anxiety", aliases: ["anxiety disorder"] },
  { name: "Stress", aliases: ["tension"] },
  { name: "ADHD", aliases: ["attention deficit hyperactivity disorder"] },
  { name: "Autism", aliases: ["autism spectrum disorder", "asd"] },
  { name: "Bipolar Disorder" },
  { name: "OCD", aliases: ["obsessive compulsive disorder"] },
  { name: "PTSD" },
  { name: "Eating Disorder" },

  // Women's Health
  { name: "PCOS", aliases: ["polycystic ovary syndrome"] },
  { name: "PCOD", aliases: ["polycystic ovarian disease"] },
  { name: "Endometriosis" },
  { name: "Menopause" },
  { name: "Perimenopause" },
  { name: "Menstrual Cramps", aliases: ["dysmenorrhea", "period pain"] },
  { name: "Heavy Menstrual Bleeding", aliases: ["menorrhagia"] },
  { name: "Pregnancy", aliases: ["pregnant", "garbhavastha"] },
  { name: "Breastfeeding", aliases: ["lactation", "nursing"] },
  { name: "Postpartum", aliases: ["post pregnancy"] },
  { name: "Prenatal Care" },
  { name: "Fertility Issues" },

  // Allergies & Intolerances
  { name: "Food Allergy" },
  { name: "Milk Allergy", aliases: ["cow milk allergy"] },
  { name: "Nut Allergy", aliases: ["peanut allergy", "tree nut allergy"] },
  { name: "Egg Allergy" },
  { name: "Seafood Allergy", aliases: ["fish allergy", "shellfish allergy"] },
  { name: "Soy Allergy" },
  { name: "Wheat Allergy" },
  { name: "Lactose Intolerance", aliases: ["milk intolerance"] },
  { name: "Gluten Intolerance", aliases: ["non celiac gluten sensitivity"] },
  { name: "Histamine Intolerance" },
  { name: "FODMAP Sensitivity" },

  // Weight Management
  { name: "Obesity", aliases: ["overweight"] },
  { name: "Underweight", aliases: ["low weight", "thin"] },
  { name: "Weight Gain" },
  { name: "Weight Loss", aliases: ["fat loss"] },
  { name: "Muscle Gain", aliases: ["bulk up", "bodybuilding"] },
  { name: "Metabolic Syndrome" },

  // Infections & Fever
  { name: "Fever", aliases: ["bukhar", "pyrexia"] },
  { name: "Viral Infection" },
  { name: "Bacterial Infection" },
  { name: "COVID", aliases: ["covid 19", "coronavirus"] },
  { name: "Dengue" },
  { name: "Typhoid", aliases: ["enteric fever"] },
  { name: "Malaria" },
  { name: "Chikungunya" },
  { name: "Common Cold", aliases: ["cough and cold"] },
  { name: "Flu", aliases: ["influenza"] },
  { name: "Viral Hepatitis" },
  { name: "Urinary Tract Infection", aliases: ["uti", "bladder infection"] },
  { name: "Fungal Infection" },

  // Recovery
  { name: "Recovery after Surgery", aliases: ["post surgery", "post operative"] },
  { name: "Recovery after Illness", aliases: ["convalescence"] },
  { name: "Weakness", aliases: ["kamjori"] },
  { name: "Fatigue", aliases: ["tiredness"] },
  { name: "Post COVID Recovery", aliases: ["long covid"] },

  // Sports & Fitness
  { name: "Sports Nutrition", aliases: ["athlete"] },
  { name: "Endurance Training" },
  { name: "Strength Training" },
  { name: "Marathon Training" },

  // Age Groups
  { name: "Senior Citizen", aliases: ["elderly", "old age", "senior"] },
  { name: "Toddler", aliases: ["toddlers", "1-3 years"] },
  { name: "Preschooler", aliases: ["3-5 years"] },
  { name: "Teenager", aliases: ["teen", "adolescent"] },
  { name: "Infant", aliases: ["baby", "6-12 months"] },
  { name: "Young Child", aliases: ["kids", "children"] },

  // Skin / Hair
  { name: "Acne", aliases: ["pimples"] },
  { name: "Eczema", aliases: ["atopic dermatitis"] },
  { name: "Psoriasis" },
  { name: "Hair Loss", aliases: ["alopecia"] },
  { name: "Hair Fall" },

  // Eye
  { name: "Dry Eyes" },
  { name: "Glaucoma" },
  { name: "Cataract" },
  { name: "Macular Degeneration" },

  // Autoimmune
  { name: "Autoimmune Disease" },
  { name: "Lupus", aliases: ["sle"] },
  { name: "Fibromyalgia" },
  { name: "Chronic Fatigue Syndrome" },

  // ENT & Oral
  { name: "Tonsillitis" },
  { name: "Sore Throat", aliases: ["gale mein dard"] },
  { name: "Mouth Ulcers", aliases: ["canker sores"] },
  { name: "Bad Breath", aliases: ["halitosis"] },

  // Other
  { name: "Gout" },
  { name: "Dehydration" },
  { name: "Detox" },
  { name: "Healthy", aliases: ["no conditions", "normal", "general health"] },
  { name: "Vegetarian" },
  { name: "Vegan" },
  { name: "Jain" },
  { name: "Keto Diet" },
  { name: "Paleo Diet" },
  { name: "Intermittent Fasting" },
  { name: "Low Sodium" },
  { name: "Low Potassium" },
  { name: "Low Purine" },
  { name: "Soft Diet" },
  { name: "Liquid Diet" },
  { name: "High Protein" },
  { name: "High Fiber" },
];
