type Translations = {
  [key: string]: {
    ko: string;
    en: string;
  };
};

export const translations: Translations = {
  appTitle: {
    ko: "SLINSHOT : FILL YOUR DAY",
    en: "SLINSHOT : FILL YOUR DAY",
  },
  appDescription: {
    ko: "슬링샷의 음료 레시피를 확인하고, 나만의 음료도 만들어보세요.",
    en: "Explore Slinshot's drink recipes and create your own.",
  },
  createNewDrink: {
    ko: "새 음료 만들기",
    en: "Create New Drink",
  },
  recentRecipes: {
    ko: "최근 레시피",
    en: "Recent Recipes",
  },
  myFavorites: {
    ko: "즐겨찾기",
    en: "My Favorites",
  },
  searchPlaceholder: {
    ko: "음료 이름이나 재료를 검색하세요...",
    en: "Search for a drink or ingredient...",
  },
};
