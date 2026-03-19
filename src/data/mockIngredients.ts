import { DrinkBase, Liquid, Temperature, SubIngredient, Garnish, IngredientItem } from "@/types/ingredient";

export const initialBases: DrinkBase[] = [
  { id: "b1", category: "base", name: "슬링샷 시그니처 에스프레소 (다크 로스트)", origin: "브라질/콜롬비아 블렌드", dosingGrams: 18, extractionGrams: 36, extractionSeconds: 28, extractionTemp: 92, colorHex: "#3e2723" },
  { id: "b2", category: "base", name: "호지차 파우더", origin: "일본 교토", dosingGrams: 5, extractionGrams: 30, extractionSeconds: 15, extractionTemp: 85, colorHex: "#6d4c41" },
  { id: "b3", category: "base", name: "제주 말차", origin: "한국 제주", dosingGrams: 4, extractionGrams: 30, extractionSeconds: 15, extractionTemp: 80, colorHex: "#558b2f" },
];

export const initialLiquids: Liquid[] = [
  { id: "l1", category: "liquid", name: "일반 우유", defaultVolumeMl: 200, colorHex: "#ffffff" },
  { id: "l2", category: "liquid", name: "생크림", defaultVolumeMl: 50, colorHex: "#fffde7" },
  { id: "l3", category: "liquid", name: "오트 밀크", defaultVolumeMl: 200, colorHex: "#f5f5dc" },
  { id: "l4", category: "liquid", name: "두유", defaultVolumeMl: 200, colorHex: "#fff8dc" },
  { id: "l5", category: "liquid", name: "코코넛 워터", defaultVolumeMl: 150, colorHex: "#f0ffff" },
  { id: "l6", category: "liquid", name: "정수 (물)", defaultVolumeMl: 250, colorHex: "#e0f7fa" },
];

export const initialTemperatures: Temperature[] = [
  { id: "t1", category: "temperature", name: "HOT (0%)", level: 0, description: "따뜻한 음료 (얼음 없음)" },
  { id: "t2", category: "temperature", name: "ICED (25%)", level: 25, description: "얼음 조금" },
  { id: "t3", category: "temperature", name: "ICED (50%)", level: 50, description: "얼음 절반" },
  { id: "t4", category: "temperature", name: "ICED (75%)", level: 75, description: "얼음 넉넉히" },
  { id: "t5", category: "temperature", name: "ICED (100%)", level: 100, description: "얼음 가득" },
];

export const initialSubIngredients: SubIngredient[] = [
  { id: "s1", category: "subIngredient", name: "연유", flavorCategory: "sweet", colorHex: "#fff9c4", iconType: "Droplet" },
  { id: "s2", category: "subIngredient", name: "바닐라 시럽", flavorCategory: "sweet", colorHex: "#ffecb3", iconType: "Droplet" },
  { id: "s3", category: "subIngredient", name: "헤이즐넛 시럽", flavorCategory: "nutty", colorHex: "#d7ccc8", iconType: "Droplet" },
  { id: "s4", category: "subIngredient", name: "레몬청", flavorCategory: "sour", colorHex: "#fff59d", iconType: "Sparkles" },
  { id: "s5", category: "subIngredient", name: "딸기 과육", flavorCategory: "fruity", colorHex: "#ef9a9a", iconType: "Cherry" },
  { id: "s6", category: "subIngredient", name: "아몬드 페이스트", flavorCategory: "nutty", colorHex: "#bcaaa4", iconType: "Leaf" },
];

export const initialGarnishes: Garnish[] = [
  { id: "g1", category: "garnish", name: "우유 거품 (밀크폼)", colorHex: "#ffffff", iconType: "Cloud" },
  { id: "g2", category: "garnish", name: "생크림 (휘핑)", colorHex: "#fffde7", iconType: "CloudRain" },
  { id: "g3", category: "garnish", name: "말린 레몬 슬라이스", colorHex: "#ffe082", iconType: "Sun" },
  { id: "g4", category: "garnish", name: "식용 장미 꽃잎", colorHex: "#f48fb1", iconType: "Flower2" },
  { id: "g5", category: "garnish", name: "초코 파우더", colorHex: "#5d4037", iconType: "Sparkles" },
  { id: "g6", category: "garnish", name: "시나몬 파우더", colorHex: "#8d6e63", iconType: "Sparkles" },
];

export const allMockIngredients: IngredientItem[] = [
  ...initialBases,
  ...initialLiquids,
  ...initialTemperatures,
  ...initialSubIngredients,
  ...initialGarnishes
];
