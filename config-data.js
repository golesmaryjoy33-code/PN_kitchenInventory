/* ========================================
   PN KITCHEN - ROLE-BASED SMART INVENTORY ENGINE
   - Ate Tina (Staff): Full Access + Weekly Report Printing + Simple Budget
   - Student Coordinators (1st Yr & 2nd Yr): Deliveries & Book Out Usage Only
   - Everything seamlessly connected to Inventory, Budget & Weekly Reports
   ======================================== */

const INVENTORY_KEY = "pnKitchenInventory";
const SUPPLIERS_KEY = "pnKitchenSuppliersData";
const MENU_1_3_KEY = "pnKitchenMenu13Data";
const MENU_2_4_KEY = "pnKitchenMenu24Data";
const DELIVERIES_KEY = "pnKitchenDeliveriesData";
const USAGE_LOGS_KEY = "pnKitchenUsageLogsData";
const WEEKLY_BUDGET_KEY = "pnKitchenWeeklyBudget";
const USERS_KEY = "pnKitchenUsers";
const SESSION_KEY = "pnKitchenSession";

let activeWeekCycle = "1_3";
let currentLoggedInUser = null;

// CONSTANT OFFICIAL WEEKLY MENUS
const DEFAULT_MENU_1_3 = [
    {
        day: "SATURDAY",
        breakfast: ["APPLE", "SUNNY-SIDE UP EGG", "RICE", "ENERGEN"],
        lunch: ["FISH ESCABECHE", "RICE", "BANANA"],
        dinner: ["TAUGUE WITH CARROTS AND CABBAGE", "RICE", "WATERMELON"],
        snack: "SOPAS / LUGAW"
    },
    {
        day: "SUNDAY",
        breakfast: ["BANANA", "POTATO WITH EGG", "RICE", "MILK"],
        lunch: ["CHICKEN AFRITADA", "RICE", "WATERMELON"],
        dinner: ["UTAN BISAYA", "DRIED FISH", "RICE", "ORANGE"],
        snack: "BANANACUE"
    },
    {
        day: "MONDAY",
        breakfast: ["ORANGE", "KOREAN EGG ROLL", "RICE", "MILO"],
        lunch: ["PORKCHOP GUISADO", "RICE", "PINEAPPLE"],
        dinner: ["EGGPLANT WITH EGGS", "RICE", "APPLE"],
        snack: "ASSORTED BISCUITS"
    },
    {
        day: "TUESDAY",
        breakfast: ["WATERMELON", "BOILED EGGS", "RICE", "ENERGEN"],
        lunch: ["PORK MENUDO", "RICE", "APPLE"],
        dinner: ["CHOPSUEY", "RICE", "BANANA"],
        snack: "CHAMPORADO"
    },
    {
        day: "WEDNESDAY",
        breakfast: ["PINEAPPLE", "EGG OMELETTE WITH GINILING", "RICE", "MILK"],
        lunch: ["CHICKEN ADOBO", "SAUTEED VEGETABLES", "RICE", "ORANGE"],
        dinner: ["MONGGO SOUP WITH DRIED FISH", "RICE", "WATERMELON"],
        snack: "GINATAANG BILO-BILO"
    },
    {
        day: "THURSDAY",
        breakfast: ["APPLE", "SARDINES WITH TOMATOES AND EGG", "RICE"],
        lunch: ["BURGER STEAK WITH MORINGA AND MUSHROOMS", "RICE", "BANANA"],
        dinner: ["BAGUIO BEANS WITH MINCED PORK", "RICE", "ORANGE"],
        snack: "TURON"
    },
    {
        day: "FRIDAY",
        breakfast: ["BANANA", "EGG WITH TOMATO", "RICE"],
        lunch: ["FRIED FISH", "PINAKBET", "RICE", "ORANGE"],
        dinner: ["SARI-SARI WITH FISH FLAKES", "RICE", "APPLE"],
        snack: "PAN DE SAL"
    }
];

const DEFAULT_MENU_2_4 = [
    {
        day: "SATURDAY",
        breakfast: ["AMPALAYA WITH EGG", "RICE", "RIPE PAPAYA", "ENERGEN"],
        lunch: ["MEATBALLS", "RICE", "APPLE"],
        dinner: ["UTAN BISAYA", "DRIED FISH", "RICE", "BANANA"],
        snack: "SOPAS / LUGAW"
    },
    {
        day: "SUNDAY",
        breakfast: ["SOTANGHON GUISADO", "RICE", "ORANGE", "MILK"],
        lunch: ["TINOLANG MANOK", "RICE", "BANANA"],
        dinner: ["LUMPIA WITH VEGGIES", "RICE", "RIPE PAPAYA"],
        snack: "BANANACUE"
    },
    {
        day: "MONDAY",
        breakfast: ["SARDINES WITH EGG", "RICE", "PINEAPPLE", "MILO"],
        lunch: ["PORKCHOP GUISADO", "RICE", "RIPE PAPAYA"],
        dinner: ["TINUN-ANG KALABASA", "DRIED FISH", "RICE", "WATERMELON"],
        snack: "ASSORTED BISCUITS"
    },
    {
        day: "TUESDAY",
        breakfast: ["TOMATO WITH EGG AND CABBAGE", "RICE", "BANANA", "ENERGEN"],
        lunch: ["CHICKEN AFRITADA", "RICE", "GRAPES"],
        dinner: ["CHOPSUEY", "RICE", "PINEAPPLE"],
        snack: "CHAMPORADO"
    },
    {
        day: "WEDNESDAY",
        breakfast: ["SCRAMBLED EGG", "RICE", "RIPE PAPAYA", "MILK"],
        lunch: ["PORK MENUDO", "RICE", "WATERMELON"],
        dinner: ["MONGGO BEAN SOUP", "RICE", "GRAPES"],
        snack: "GINATAANG BILO-BILO"
    },
    {
        day: "THURSDAY",
        breakfast: ["EGG OMELETTE & GROUND PORK", "RICE", "GRAPES", "MILO"],
        lunch: ["FRIED FISH AND VEGGIES", "RICE", "BANANA"],
        dinner: ["STRING BEANS GUISADO", "RICE", "ORANGE"],
        snack: "TURON"
    },
    {
        day: "FRIDAY",
        breakfast: ["SAYOTE WITH EGG", "RICE", "WATERMELON", "ENERGEN"],
        lunch: ["FISH PAKSIW AND VEGGIES", "RICE", "ORANGE"],
        dinner: ["PAKBET", "RICE", "APPLE"],
        snack: "PAN DE SAL"
    }
];
