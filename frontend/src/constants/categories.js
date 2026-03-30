const CATEGORIES = {
  income: ["Salary", "Freelance", "Bonus", "Investment", "Other"],
  expense: ["Food", "Travel", "Bills", "Shopping", "Health", "Entertainment", "Other"],
};

const ALL_CATEGORIES = Array.from(
  new Set([...CATEGORIES.expense, ...CATEGORIES.income])
);

const DEFAULT_CATEGORY_BY_TYPE = {
  income: "Salary",
  expense: "Food",
};

export { CATEGORIES, ALL_CATEGORIES, DEFAULT_CATEGORY_BY_TYPE };
