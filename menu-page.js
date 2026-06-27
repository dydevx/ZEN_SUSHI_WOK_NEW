const categories = window.ZEN_MENU_CATEGORIES || [];
const menuData = window.ZEN_MENU_DATA || {};
const categoryFolders = window.ZEN_CATEGORY_FOLDERS || {};
const menuGroups = normalizeMenuGroups(window.ZEN_MENU_GROUPS, categories);
const categoryIntros = window.ZEN_CATEGORY_INTROS || {};

const nav = document.getElementById("mainNav");
const display = document.getElementById("foodDisplay");
const title = document.getElementById("currentCategoryName");
const homeSection = document.getElementById("homeSection");
const menuIntroSection = document.getElementById("menuIntroSection");
const homeRails = document.getElementById("homeRails");
const cartCountEl = document.getElementById("cartCount");
const cartTotalHeader = document.getElementById("cartTotalHeader");
const checkoutButton = document.getElementById("checkoutButton");
const cartButton = document.getElementById("cartButton");
const clearCartButton = document.getElementById("clearCartButton");
const validateCartButton = document.getElementById("validateCartButton");
const invoiceButton = document.getElementById("invoiceButton");
const cartDrawer = document.getElementById("cartDrawer");
const cartItems = document.getElementById("cartItems");
const cartAccessoriesSection = document.querySelector(".cart-accessories");
const accessoryItems = document.getElementById("accessoryItems");
const accessoryQuotaText = document.getElementById("accessoryQuotaText");
const cartPanelTotal = document.getElementById("cartPanelTotal");
const cartFoodTotal = document.getElementById("cartFoodTotal");
const cartAccessoryTotal = document.getElementById("cartAccessoryTotal");
const cartDeliveryRow = document.getElementById("cartDeliveryRow");
const cartDeliveryFee = document.getElementById("cartDeliveryFee");
const cartGrandTotal = document.getElementById("cartGrandTotal");
const cartServiceSummary = document.getElementById("cartServiceSummary");
const checkoutMessage = document.getElementById("checkoutMessage");
const customerNameInput = document.getElementById("customerName");
const customerPhoneInput = document.getElementById("customerPhone");
const customerAddressInput = document.getElementById("customerAddress");
const customerEmailInput = document.getElementById("customerEmail");
const modal = document.getElementById("dishModal");
const modalImage = document.getElementById("modalImage");
const modalDishName = document.getElementById("modalDishName");
const modalPieces = document.getElementById("modalPieces");
const modalPrice = document.getElementById("modalPrice");
const modalDescription = document.getElementById("modalDescription");
const modalComposition = document.getElementById("modalComposition");
const modalAllergenes = document.getElementById("modalAllergenes");
const modalOptionsBlock = document.getElementById("modalOptionsBlock");
const cartToast = document.getElementById("cartToast");
const productRails = document.getElementById("productRails");
const deliveryAddress = document.getElementById("deliveryAddress");
const deliveryMessage = document.getElementById("deliveryMessage");
const deliveryResult = document.getElementById("deliveryResult");
const checkDeliveryButton = document.getElementById("checkDeliveryButton");
const deliveryDistanceNote = document.getElementById("deliveryDistanceNote");
const deliveryFeeNote = document.getElementById("deliveryFeeNote");
const serviceButtons = document.querySelectorAll("[data-service-mode]");
const deliveryPanel = document.getElementById("deliveryPanel");
const pickupPanel = document.getElementById("pickupPanel");
const groupSubnav = document.createElement("div");
groupSubnav.className = "group-subnav";
groupSubnav.hidden = true;
nav.insertAdjacentElement("afterend", groupSubnav);
const selectedSubnav = document.createElement("div");
selectedSubnav.className = "selected-subnav";
selectedSubnav.hidden = true;
groupSubnav.insertAdjacentElement("afterend", selectedSubnav);
const mobileMenuQuery = window.matchMedia("(max-width: 760px)");

const WHATSAPP_ORDER_PHONE = "33763652285";
const CUSTOMER_INFO_KEY = "zenCustomerInfo";
const CHECKOUT_READY_MESSAGE = "Commande prete a envoyer sur WhatsApp.";
const RESTAURANT_MAP_ORIGIN = "Zen Sushi Wok, 108 Bd du General de Gaulle, 06340 La Trinite, France";
const DELIVERY_FEE_PENDING_LABEL = "A noter";
const WHATSAPP_SERVICE_MODE = "pickup";
const ACCESSORY_PRICE = 0.5;
const ACCESSORY_DEFAULTS_KEY = "zenAccessoryDefaults";
const ACCESSORIES = [
    { id: "soy-salty", label: "Sauce soja salée", quota: "sauce" },
    { id: "soy-sweet", label: "Sauce soja sucrée", quota: "sauce" },
    { id: "baguettes", label: "Baguettes", quota: "baguettes" },
    { id: "wasabi", label: "Wasabi", quota: "wasabi" },
    { id: "gingembre", label: "Gingembre", quota: "gingembre" }
];
const ACCESSORY_EXCLUDED_CATEGORIES = new Set(["BOISSON", "VINS", "DESSERT"]);
const FRESH_BOWL_SUPPLEMENTS = [
    { id: "saumon", label: "Saumon", price: 4 },
    { id: "thon", label: "Thon", price: 6 },
    { id: "avocat", label: "Avocat", price: 2 },
    { id: "cheese", label: "Cheese", price: 2 },
    { id: "tofu-frit", label: "Tofu frit", price: 2 },
    { id: "tempura-crevettes", label: "Tempura crevettes", price: 2.5, unit: "/ pièce" },
    { id: "poulet-pane", label: "Poulet pané", price: 3 },
    { id: "boulettes-poulet", label: "Boulettes de poulet", price: 2.5, unit: "/ pièce" },
    { id: "legumes", label: "Légumes", price: 2 }
];
const KIDS_EXTRA_DRINK_PRICE = 2.5;
const ZEN_WOK_VEGETABLES = [
    { id: "brocoli", label: "Brocoli" },
    { id: "champignons-paris", label: "Champignons de Paris" },
    { id: "germes-soja", label: "Germes de soja" },
    { id: "poivrons", label: "Poivrons" },
    { id: "courgettes", label: "Courgettes" },
    { id: "carottes", label: "Carottes" },
    { id: "oignons", label: "Oignons" }
];
const ZEN_WOK_SAUCES = ["Soja du chef", "Tamarin", "Saté", "Piquante", "Aigre-douce", "Curry au lait de coco"];
const ZEN_WOK_SIDES = ["Riz nature", "Nouille chinois", "Udon (nouille japonais)"];
const ZEN_WOK_SUPPLEMENTS = [
    { id: "boeuf", label: "Bœuf", price: 3 },
    { id: "poulet", label: "Poulet", price: 3 },
    { id: "canard", label: "Canard", price: 3 },
    { id: "crevettes", label: "Crevettes", price: 4 },
    { id: "calamars", label: "Calamars", price: 4 },
    { id: "tofu", label: "Tofu", price: 2 },
    { id: "legumes", label: "Légumes", price: 2 }
];

let activeDish = null;
let activeCategory = "";
let toastTimer = null;
let serviceMode = WHATSAPP_SERVICE_MODE;
let deliveryInfo = normalizeDeliveryInfo(readJson("zenDeliveryInfo", null));
let cart = readJson("zenCartItems", []);
let accessories = readJson("zenAccessories", {});
let accessoryDefaults = readJson(ACCESSORY_DEFAULTS_KEY, {});
let savedCustomizations = readJson("zenSavedCustomizations", {});
let selectedGroupItems = new Map();
let modalCustomization = null;
let modalEditingEntryId = "";
let currentOrderReference = "";

cart = cart.filter((entry) => entry && entry.id && entry.item && entry.qty > 0).map(normalizeCartEntry);
localStorage.setItem("zenServiceMode", WHATSAPP_SERVICE_MODE);
initCustomerFields();
syncAccessoryDefaults();
renderGroupNav();
renderHomeRails();
applyServiceMode(serviceMode);
selectInitialGroupFromHash();
updateCart();

function readJson(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (error) {
        return fallback;
    }
}

function writeJson(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        // Local previews can run with storage disabled.
    }
}

function getInputValue(input) {
    return input ? input.value.trim() : "";
}

function getCustomerInfo() {
    return {
        name: getInputValue(customerNameInput),
        phone: getInputValue(customerPhoneInput),
        address: getInputValue(customerAddressInput) || (deliveryInfo && deliveryInfo.address) || "",
        email: getInputValue(customerEmailInput)
    };
}

function saveCustomerInfo() {
    const info = getCustomerInfo();
    writeJson(CUSTOMER_INFO_KEY, info);
    return info;
}

function initCustomerFields() {
    const stored = readJson(CUSTOMER_INFO_KEY, {});
    const savedAddress = stored.address || (deliveryInfo && deliveryInfo.address) || "";
    if (customerNameInput) customerNameInput.value = stored.name || "";
    if (customerPhoneInput) customerPhoneInput.value = stored.phone || "";
    if (customerAddressInput) customerAddressInput.value = savedAddress;
    if (customerEmailInput) customerEmailInput.value = stored.email || "";
    if (deliveryAddress && savedAddress) deliveryAddress.value = savedAddress;
    syncDeliveryNoteInputs();

    [customerNameInput, customerPhoneInput, customerAddressInput, customerEmailInput]
        .filter(Boolean)
        .forEach((input) => {
            input.addEventListener("input", () => {
                if (input === customerAddressInput && deliveryAddress) {
                    deliveryAddress.value = customerAddressInput.value;
                    if (deliveryInfo && deliveryInfo.address !== customerAddressInput.value.trim()) {
                        deliveryInfo = null;
                        writeJson("zenDeliveryInfo", deliveryInfo);
                        if (deliveryResult) deliveryResult.hidden = true;
                    }
                }
                saveCustomerInfo();
                updateCart();
            });
        });

    if (deliveryAddress) {
        deliveryAddress.addEventListener("input", () => {
            if (customerAddressInput) customerAddressInput.value = deliveryAddress.value;
            if (deliveryInfo && deliveryInfo.address !== deliveryAddress.value.trim()) {
                deliveryInfo = null;
                writeJson("zenDeliveryInfo", deliveryInfo);
                if (deliveryResult) deliveryResult.hidden = true;
            }
            saveCustomerInfo();
            updateCart();
        });
    }

    [deliveryDistanceNote, deliveryFeeNote]
        .filter(Boolean)
        .forEach((input) => {
            input.addEventListener("input", () => {
                if ((deliveryAddress && deliveryAddress.value.trim()) || (customerAddressInput && customerAddressInput.value.trim())) {
                    saveManualDeliveryInfo();
                    renderDeliveryResult();
                }
                updateCart();
            });
        });
}

function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
    }[char]));
}

function buildGoogleMapsDirectionsUrl(destination) {
    const params = new URLSearchParams({
        api: "1",
        origin: RESTAURANT_MAP_ORIGIN,
        destination,
        travelmode: "driving"
    });
    return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function normalizeDeliveryNote(value) {
    return String(value || "").trim();
}

function createDeliveryInfo(address, notes = {}) {
    const normalizedAddress = String(address || "").trim();
    if (!normalizedAddress) return null;
    return {
        address: normalizedAddress,
        mapUrl: buildGoogleMapsDirectionsUrl(normalizedAddress),
        available: true,
        needsConfirmation: false,
        fee: null,
        minimum: null,
        eta: null,
        distance: null,
        distanceNote: normalizeDeliveryNote(notes.distanceNote),
        feeNote: normalizeDeliveryNote(notes.feeNote)
    };
}

function normalizeDeliveryInfo(info) {
    if (!info || !info.address) return null;
    return createDeliveryInfo(info.address, {
        distanceNote: info.distanceNote,
        feeNote: info.feeNote
    });
}

function getDeliveryMapUrl(address) {
    const normalizedAddress = String(address || "").trim();
    if (!normalizedAddress) return "";
    if (deliveryInfo && deliveryInfo.address === normalizedAddress && deliveryInfo.mapUrl) {
        return deliveryInfo.mapUrl;
    }
    return buildGoogleMapsDirectionsUrl(normalizedAddress);
}

function getDeliveryFeeNote() {
    return normalizeDeliveryNote((deliveryFeeNote && deliveryFeeNote.value) || (deliveryInfo && deliveryInfo.feeNote));
}

function getDeliveryDistanceNote() {
    return normalizeDeliveryNote((deliveryDistanceNote && deliveryDistanceNote.value) || (deliveryInfo && deliveryInfo.distanceNote));
}

function getDeliveryDistanceLabel() {
    const note = getDeliveryDistanceNote();
    if (!note) return "A noter apres verification Google Maps";
    return /\d/.test(note) && !/km/i.test(note) ? `${note} km` : note;
}

function getDeliveryFeeLabel() {
    const note = getDeliveryFeeNote();
    if (!note) return DELIVERY_FEE_PENDING_LABEL;
    return /\d/.test(note) && !/€|eur/i.test(note) ? `${note}€` : note;
}

function syncDeliveryNoteInputs() {
    if (deliveryDistanceNote) deliveryDistanceNote.value = deliveryInfo && deliveryInfo.distanceNote ? deliveryInfo.distanceNote : "";
    if (deliveryFeeNote) deliveryFeeNote.value = deliveryInfo && deliveryInfo.feeNote ? deliveryInfo.feeNote : "";
}

function saveManualDeliveryInfo() {
    const address = (deliveryAddress && deliveryAddress.value ? deliveryAddress.value : (customerAddressInput ? customerAddressInput.value : "")).trim();
    deliveryInfo = createDeliveryInfo(address, {
        distanceNote: deliveryDistanceNote ? deliveryDistanceNote.value : "",
        feeNote: deliveryFeeNote ? deliveryFeeNote.value : ""
    });
    writeJson("zenDeliveryInfo", deliveryInfo);
    return deliveryInfo;
}

function renderDeliveryResult() {
    if (!deliveryResult) return;
    if (!deliveryInfo) {
        deliveryResult.hidden = true;
        deliveryResult.innerHTML = "";
        return;
    }

    deliveryResult.hidden = false;
    if (!deliveryInfo.available) {
        deliveryResult.innerHTML = `
            <span class="full">Zone non desservie actuellement.</span>
            ${deliveryInfo.address ? `<span class="full">Adresse: ${escapeHtml(deliveryInfo.address)}</span>` : ""}
        `;
        return;
    }

    deliveryResult.innerHTML = `
        <span class="full">Adresse livraison: ${escapeHtml(deliveryInfo.address)}</span>
        <span>Distance Google Maps: ${escapeHtml(getDeliveryDistanceLabel())}</span>
        <span>Frais de livraison: ${escapeHtml(getDeliveryFeeLabel())}</span>
        <span class="full">A verifier sur Google Maps avant confirmation.</span>
        <a class="delivery-map-link full" href="${escapeHtml(deliveryInfo.mapUrl)}" target="_blank" rel="noopener">Verifier sur Google Maps</a>
    `;
}

function normalizeMenuGroups(groups, fallbackCategories) {
    if (Array.isArray(groups) && groups.length) {
        return groups.map((group) => ({
            label: group.label,
            items: (group.items || [])
                .map((item) => ({
                    label: item.label || item.category,
                    category: item.category,
                    filter: item.filter || ""
                }))
                .filter((item) => item.category && menuData[item.category])
        })).filter((group) => group.label && group.items.length);
    }

    return fallbackCategories.map((category) => ({
        label: category,
        items: [{ label: category, category, filter: "" }]
    }));
}

function parsePrice(price) {
    const match = String(price || "").replace(",", ".").match(/\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : 0;
}

function formatMoney(value) {
    return `${Number(value || 0).toFixed(2).replace(".", ",")}€`;
}

function formatPrice(price) {
    if (!price) return "";
    const value = String(price).trim();
    if (/€|Voir carte|Sur demande|À confirmer|â‚¬/i.test(value)) return value.replace("â‚¬", "€");
    return `${value.replace(/\./g, ",")} €`;
}

function getDishId(category, item) {
    return `${category}::${item.fileName || item.name}`;
}

function findMenuItemForCart(category, entryItem, baseId) {
    return (menuData[category] || []).find((item) => (
        getDishId(category, item) === baseId
        || (entryItem.fileName && item.fileName === entryItem.fileName)
        || item.name === entryItem.name
    )) || entryItem;
}

function normalizeCartEntry(entry) {
    const category = entry.category || findCategoryForItem(entry.item);
    const baseId = entry.baseId || getDishId(category, entry.item);
    const item = findMenuItemForCart(category, entry.item, baseId);
    return {
        ...entry,
        item,
        category,
        baseId,
        qty: Math.max(0, Number(entry.qty) || 0),
        customization: needsCustomization(category, item) ? normalizeCustomization(category, item, entry.customization) : entry.customization || null
    };
}

function getEntryBaseId(entry) {
    return entry.baseId || getDishId(entry.category, entry.item);
}

function getCartEntry(category, item) {
    const baseId = getDishId(category, item);
    return cart.find((entry) => getEntryBaseId(entry) === baseId);
}

function getCartQty(category, item) {
    const baseId = getDishId(category, item);
    return cart.reduce((sum, entry) => sum + (getEntryBaseId(entry) === baseId ? entry.qty : 0), 0);
}

function setCartQty(category, item, qty) {
    if (needsCustomization(category, item)) {
        setCustomBaseQty(category, item, qty);
        return;
    }

    const id = getDishId(category, item);
    const nextQty = Math.max(0, Number(qty) || 0);
    const existing = cart.find((entry) => entry.id === id);

    if (!nextQty) {
        cart = cart.filter((entry) => entry.id !== id);
    } else if (existing) {
        existing.qty = nextQty;
    } else {
        cart.push({ id, baseId: id, category, item, qty: nextQty, customization: null });
    }

    writeJson("zenCartItems", cart);
    syncAccessoryDefaults();
    updateCart();
}

function addToCart(item, category = activeCategory || findCategoryForItem(item)) {
    if (needsCustomization(category, item)) {
        const customization = modal.classList.contains("open") && activeDish === item && activeCategory === category
            ? modalCustomization
            : getSavedCustomization(category, item);
        addConfiguredDishToCart(item, category, customization);
        return;
    }

    setCartQty(category, item, getCartQty(category, item) + 1);
    showToast(`${item.name} ajouté au panier`);
}

function findCategoryForItem(item) {
    return Object.keys(menuData).find((category) => (menuData[category] || []).includes(item)) || "";
}

function getFoodTotal() {
    return cart.reduce((sum, entry) => sum + getEntryUnitPrice(entry) * entry.qty, 0);
}

function getItemCount() {
    return cart.reduce((sum, entry) => sum + entry.qty, 0);
}

function isFreshBowlCategory(category) {
    return category === "CHIRASHI" || category === "POKE BOWL";
}

function isKidsMenu(item) {
    return /menu enfant/i.test(item.pieces || "") || /^Zen Kids/i.test(item.name || "");
}

function hasVariantChoices(item) {
    return !!item && Array.isArray(item.variants) && item.variants.length > 0;
}

function getVariantById(item, id) {
    return hasVariantChoices(item) ? item.variants.find((variant) => variant.id === id) : null;
}

function getDefaultVariant(item) {
    return hasVariantChoices(item) ? item.variants[0] : null;
}

function getSelectedVariant(item, customization) {
    if (!customization || customization.type !== "variant-choice") return getDefaultVariant(item);
    return getVariantById(item, customization.variant) || getDefaultVariant(item);
}

function needsCustomization(category, item) {
    return hasVariantChoices(item) || isFreshBowlCategory(category) || category === "ZEN WOK" || isKidsMenu(item);
}

function cloneCustomization(customization) {
    return customization ? JSON.parse(JSON.stringify(customization)) : null;
}

function getSavedCustomization(category, item) {
    const baseId = getDishId(category, item);
    return normalizeCustomization(category, item, savedCustomizations[baseId]);
}

function saveCustomization(category, item, customization) {
    if (!needsCustomization(category, item)) return;
    const baseId = getDishId(category, item);
    savedCustomizations[baseId] = normalizeCustomization(category, item, customization);
    writeJson("zenSavedCustomizations", savedCustomizations);
}

function normalizeCustomization(category, item, customization = null) {
    if (!needsCustomization(category, item)) return null;

    if (hasVariantChoices(item)) {
        const sourceVariant = customization && customization.type === "variant-choice" ? customization.variant : "";
        const variant = getVariantById(item, sourceVariant) || getDefaultVariant(item);
        return { type: "variant-choice", variant: variant ? variant.id : "" };
    }

    if (isFreshBowlCategory(category)) {
        const source = customization && customization.type === "fresh-supplements" ? customization.supplements || {} : {};
        return {
            type: "fresh-supplements",
            supplements: FRESH_BOWL_SUPPLEMENTS.reduce((acc, supplement) => {
                acc[supplement.id] = Math.max(0, Number(source[supplement.id]) || 0);
                return acc;
            }, {})
        };
    }

    if (isKidsMenu(item)) {
        const source = customization && customization.type === "kids-drinks" ? customization.drinks || {} : {};
        const drinks = getKidsDrinkOptions().reduce((acc, drink) => {
            acc[getDrinkChoiceId(drink)] = Math.max(0, Number(source[getDrinkChoiceId(drink)]) || 0);
            return acc;
        }, {});
        return { type: "kids-drinks", drinks };
    }

    const source = customization && customization.type === "zen-wok" ? customization : {};
    const vegetableIds = new Set(Array.isArray(source.vegetables) && source.vegetables.length
        ? source.vegetables
        : ZEN_WOK_VEGETABLES.map((vegetable) => vegetable.id));
    const sauce = ZEN_WOK_SAUCES.includes(source.sauce) ? source.sauce : ZEN_WOK_SAUCES[0];
    const side = ZEN_WOK_SIDES.includes(source.side) ? source.side : ZEN_WOK_SIDES[0];
    const supplementSource = source.supplements || {};

    return {
        type: "zen-wok",
        vegetables: ZEN_WOK_VEGETABLES.filter((vegetable) => vegetableIds.has(vegetable.id)).map((vegetable) => vegetable.id),
        sauce,
        side,
        supplements: ZEN_WOK_SUPPLEMENTS.reduce((acc, supplement) => {
            acc[supplement.id] = Math.max(0, Number(supplementSource[supplement.id]) || 0);
            return acc;
        }, {})
    };
}

function getKidsDrinkOptions() {
    return (menuData["BOISSON"] || []).filter((item) => !/bière|biere/i.test(item.name) && parsePrice(item.price) <= 3.5);
}

function getDrinkChoiceId(item) {
    return item.fileName || slugify(item.name);
}

function getDrinkChoiceById(id) {
    return getKidsDrinkOptions().find((item) => getDrinkChoiceId(item) === id);
}

function getSupplementById(id) {
    return FRESH_BOWL_SUPPLEMENTS.find((supplement) => supplement.id === id);
}

function getWokSupplementById(id) {
    return ZEN_WOK_SUPPLEMENTS.find((supplement) => supplement.id === id);
}

function getCustomizationCost(customization, item = null) {
    if (!customization) return 0;

    if (customization.type === "variant-choice") {
        const variant = item ? getSelectedVariant(item, customization) : null;
        return variant ? parsePrice(variant.price) - parsePrice(item.price) : 0;
    }

    if (customization.type === "fresh-supplements") {
        return Object.entries(customization.supplements || {}).reduce((sum, [id, qty]) => {
            const supplement = getSupplementById(id);
            return sum + (supplement ? supplement.price * qty : 0);
        }, 0);
    }

    if (customization.type === "kids-drinks") {
        const drinkCount = Object.values(customization.drinks || {}).reduce((sum, qty) => sum + qty, 0);
        return Math.max(0, drinkCount - 1) * KIDS_EXTRA_DRINK_PRICE;
    }

    if (customization.type === "zen-wok") {
        return Object.entries(customization.supplements || {}).reduce((sum, [id, qty]) => {
            const supplement = getWokSupplementById(id);
            return sum + (supplement ? supplement.price * qty : 0);
        }, 0);
    }

    return 0;
}

function getEntryUnitPrice(entry) {
    return parsePrice(entry.item.price) + getCustomizationCost(entry.customization, entry.item);
}

function getCustomizationKey(category, item, customization) {
    const normalized = normalizeCustomization(category, item, customization);
    if (!normalized) return "standard";

    if (normalized.type === "variant-choice") {
        return `variant-${slugify(normalized.variant || "standard")}`;
    }

    if (normalized.type === "fresh-supplements") {
        const selected = FRESH_BOWL_SUPPLEMENTS
            .map((supplement) => [supplement.id, normalized.supplements[supplement.id] || 0])
            .filter(([, qty]) => qty > 0)
            .map(([id, qty]) => `${id}-${qty}`);
        return `fresh-${selected.length ? selected.join("_") : "none"}`;
    }

    if (normalized.type === "kids-drinks") {
        const selected = Object.entries(normalized.drinks || {})
            .filter(([, qty]) => qty > 0)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([id, qty]) => `${slugify(id)}-${qty}`);
        return `kids-${selected.length ? selected.join("_") : "none"}`;
    }

    const vegetables = ZEN_WOK_VEGETABLES
        .filter((vegetable) => normalized.vegetables.includes(vegetable.id))
        .map((vegetable) => vegetable.id)
        .join("-");
    const supplements = ZEN_WOK_SUPPLEMENTS
        .map((supplement) => [supplement.id, normalized.supplements[supplement.id] || 0])
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => `${id}-${qty}`)
        .join("-");
    return `wok-${vegetables || "sans-legumes"}-${slugify(normalized.sauce)}-${slugify(normalized.side)}-${supplements || "sans-supplements"}`;
}

function makeCartEntryId(category, item, customization) {
    const baseId = getDishId(category, item);
    return needsCustomization(category, item) ? `${baseId}::${getCustomizationKey(category, item, customization)}` : baseId;
}

function getConfiguredCartQty(category, item, customization) {
    const id = makeCartEntryId(category, item, customization);
    const entry = cart.find((cartEntry) => cartEntry.id === id);
    return entry ? entry.qty : 0;
}

function addConfiguredDishToCart(item, category, customization, qty = 1) {
    const normalized = normalizeCustomization(category, item, customization);
    const baseId = getDishId(category, item);
    const id = makeCartEntryId(category, item, normalized);
    const existing = cart.find((entry) => entry.id === id);

    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({ id, baseId, category, item, qty, customization: cloneCustomization(normalized) });
    }

    saveCustomization(category, item, normalized);
    writeJson("zenCartItems", cart);
    syncAccessoryDefaults();
    updateCart();
    showToast(`${item.name} ajouté au panier`);
}

function updateConfiguredCartEntry(entryId, category, item, customization) {
    const entry = cart.find((cartEntry) => cartEntry.id === entryId);
    if (!entry) {
        addConfiguredDishToCart(item, category, customization);
        return;
    }

    const normalized = normalizeCustomization(category, item, customization);
    const nextId = makeCartEntryId(category, item, normalized);
    const duplicate = cart.find((cartEntry) => cartEntry.id === nextId && cartEntry.id !== entryId);

    if (duplicate) {
        duplicate.qty += entry.qty;
        cart = cart.filter((cartEntry) => cartEntry.id !== entryId);
        modalEditingEntryId = duplicate.id;
    } else {
        entry.id = nextId;
        entry.baseId = getDishId(category, item);
        entry.customization = cloneCustomization(normalized);
        modalEditingEntryId = nextId;
    }

    saveCustomization(category, item, normalized);
    writeJson("zenCartItems", cart);
    syncAccessoryDefaults();
    updateCart();
    showToast(`${item.name} modifié`);
}

function setCartEntryQty(entryId, qty) {
    const nextQty = Math.max(0, Number(qty) || 0);
    const entry = cart.find((cartEntry) => cartEntry.id === entryId);
    if (!entry) return;

    if (!nextQty) {
        cart = cart.filter((cartEntry) => cartEntry.id !== entryId);
    } else {
        entry.qty = nextQty;
    }

    writeJson("zenCartItems", cart);
    syncAccessoryDefaults();
    updateCart();
}

function decrementCartBaseItem(category, item) {
    const baseId = getDishId(category, item);
    const entry = [...cart].reverse().find((cartEntry) => getEntryBaseId(cartEntry) === baseId);
    if (entry) setCartEntryQty(entry.id, entry.qty - 1);
}

function decrementConfiguredCartItem(category, item, customization) {
    const id = makeCartEntryId(category, item, customization);
    const entry = cart.find((cartEntry) => cartEntry.id === id);
    if (entry) setCartEntryQty(entry.id, entry.qty - 1);
}

function setCustomBaseQty(category, item, qty) {
    const baseId = getDishId(category, item);
    const targetQty = Math.max(0, Number(qty) || 0);
    const currentQty = getCartQty(category, item);

    if (targetQty > currentQty) {
        addConfiguredDishToCart(item, category, getSavedCustomization(category, item), targetQty - currentQty);
        return;
    }

    let toRemove = currentQty - targetQty;
    for (let index = cart.length - 1; index >= 0 && toRemove > 0; index -= 1) {
        const entry = cart[index];
        if (getEntryBaseId(entry) !== baseId) continue;
        const removed = Math.min(entry.qty, toRemove);
        entry.qty -= removed;
        toRemove -= removed;
    }

    cart = cart.filter((entry) => entry.qty > 0);
    writeJson("zenCartItems", cart);
    syncAccessoryDefaults();
    updateCart();
}

function getCustomizationSummary(customization, item = null) {
    if (!customization) return [];

    if (customization.type === "variant-choice") {
        const variant = item ? getSelectedVariant(item, customization) : null;
        return variant ? [`Choix: ${variant.label}`] : [];
    }

    if (customization.type === "fresh-supplements") {
        const selected = FRESH_BOWL_SUPPLEMENTS
            .filter((supplement) => (customization.supplements || {})[supplement.id] > 0)
            .map((supplement) => `${supplement.label} x${customization.supplements[supplement.id]}`);
        return selected.length ? [`Suppléments: ${selected.join(", ")}`] : [];
    }

    if (customization.type === "kids-drinks") {
        const selected = Object.entries(customization.drinks || {})
            .filter(([, qty]) => qty > 0)
            .map(([id, qty]) => {
                const drink = getDrinkChoiceById(id);
                return `${drink ? drink.name : id} x${qty}`;
            });
        const total = Object.values(customization.drinks || {}).reduce((sum, qty) => sum + qty, 0);
        if (!total) return ["Choix de boisson: aucune"];
        const paid = Math.max(0, total - 1);
        return [
            `Choix de boisson: ${selected.join(", ")}`,
            paid ? `Boisson supplémentaire: ${formatMoney(paid * KIDS_EXTRA_DRINK_PRICE)}` : "1 boisson incluse"
        ];
    }

    if (customization.type === "zen-wok") {
        const vegetables = ZEN_WOK_VEGETABLES
            .filter((vegetable) => customization.vegetables.includes(vegetable.id))
            .map((vegetable) => vegetable.label);
        const supplements = ZEN_WOK_SUPPLEMENTS
            .filter((supplement) => (customization.supplements || {})[supplement.id] > 0)
            .map((supplement) => `${supplement.label} x${customization.supplements[supplement.id]}`);
        return [
            `Légumes: ${vegetables.length ? vegetables.join(", ") : "sans légumes"}`,
            `Sauce: ${customization.sauce}`,
            `Accompagnement: ${customization.side}`,
            supplements.length ? `Suppléments: ${supplements.join(", ")}` : ""
        ].filter(Boolean);
    }

    return [];
}

function isAccessoryEligibleCategory(category) {
    return !ACCESSORY_EXCLUDED_CATEGORIES.has(category);
}

function getAccessoryBase() {
    return cart.reduce((base, entry) => {
        if (!isAccessoryEligibleCategory(entry.category)) return base;
        const lineTotal = getEntryUnitPrice(entry) * entry.qty;
        base.eligibleTotal += lineTotal;
        base.eligibleQty += entry.qty;
        return base;
    }, { eligibleTotal: 0, eligibleQty: 0 });
}

function getAccessoryQuota() {
    const base = getAccessoryBase();
    const eligibleCents = Math.round(base.eligibleTotal * 100);
    const quota = eligibleCents > 0 ? Math.ceil(eligibleCents / 1500) : 0;
    return {
        sauce: quota,
        baguettes: quota,
        wasabi: quota,
        gingembre: quota,
        hasEligibleItems: base.eligibleQty > 0
    };
}

function getAvailableAccessories(quota = getAccessoryQuota()) {
    return quota.hasEligibleItems ? ACCESSORIES : [];
}

function getDefaultAccessoryQty(accessory, quota) {
    return 0;
}

function syncAccessoryDefaults() {
    const quota = getAccessoryQuota();
    const availableAccessories = getAvailableAccessories(quota);
    const availableIds = new Set(availableAccessories.map((accessory) => accessory.id));

    Object.keys(accessories).forEach((id) => {
        if (!availableIds.has(id)) delete accessories[id];
    });
    Object.keys(accessoryDefaults).forEach((id) => {
        if (!availableIds.has(id)) delete accessoryDefaults[id];
    });

    availableAccessories.forEach((accessory) => {
        const nextDefault = getDefaultAccessoryQty(accessory, quota);
        const previousDefault = accessoryDefaults[accessory.id];
        if (accessories[accessory.id] == null) {
            accessories[accessory.id] = nextDefault;
        } else if (previousDefault != null && accessories[accessory.id] === previousDefault) {
            accessories[accessory.id] = nextDefault;
        }
        accessoryDefaults[accessory.id] = nextDefault;
    });

    writeJson("zenAccessories", accessories);
    writeJson(ACCESSORY_DEFAULTS_KEY, accessoryDefaults);
}

function getAccessoryFreeQty(accessory, quota) {
    const qty = accessories[accessory.id] || 0;
    const groupLimit = quota[accessory.quota] || 0;
    const quotaGroup = ACCESSORIES.filter((candidate) => candidate.quota === accessory.quota);
    if (quotaGroup.length <= 1) {
        return Math.min(qty, groupLimit);
    }

    let remaining = groupLimit;
    for (const candidate of quotaGroup) {
        const candidateQty = accessories[candidate.id] || 0;
        const free = Math.min(candidateQty, remaining);
        if (candidate.id === accessory.id) return free;
        remaining -= free;
    }
    return 0;
}

function getAccessoryOverage() {
    const quota = getAccessoryQuota();
    const availableAccessories = getAvailableAccessories(quota);
    return availableAccessories.reduce((sum, accessory) => {
        const qty = accessories[accessory.id] || 0;
        const free = getAccessoryFreeQty(accessory, quota);
        return sum + Math.max(0, qty - free);
    }, 0);
}

function hasConfirmedDeliveryFee() {
    return serviceMode === "delivery"
        && deliveryInfo
        && deliveryInfo.available
        && deliveryInfo.needsConfirmation !== true
        && deliveryInfo.fee != null
        && Number.isFinite(Number(deliveryInfo.fee));
}

function getDeliveryFee() {
    return hasConfirmedDeliveryFee() ? Number(deliveryInfo.fee) : 0;
}

function getDeliveryLabel() {
    if (serviceMode !== "delivery") return formatMoney(0);
    return hasConfirmedDeliveryFee() ? formatMoney(getDeliveryFee()) : getDeliveryFeeLabel();
}

function getGrandTotal() {
    return getFoodTotal() + getAccessoryOverage() * ACCESSORY_PRICE + getDeliveryFee();
}

function getDeliveryTotalSuffix() {
    return serviceMode === "delivery" ? " + livraison" : "";
}

function updateCart() {
    const itemCount = getItemCount();
    const foodTotal = getFoodTotal();
    const accessoryTotal = getAccessoryOverage() * ACCESSORY_PRICE;
    const deliveryFee = getDeliveryFee();
    const grandTotal = getGrandTotal();

    cartCountEl.textContent = String(itemCount);
    cartTotalHeader.textContent = `${formatMoney(grandTotal)}${getDeliveryTotalSuffix()}`;
    checkoutButton.hidden = itemCount === 0;
    cartButton.classList.toggle("has-items", itemCount > 0);
    cartPanelTotal.textContent = `${formatMoney(grandTotal)}${getDeliveryTotalSuffix()}`;
    cartFoodTotal.textContent = formatMoney(foodTotal);
    cartAccessoryTotal.textContent = formatMoney(accessoryTotal);
    if (cartDeliveryRow) cartDeliveryRow.hidden = serviceMode !== "delivery";
    cartDeliveryFee.textContent = getDeliveryLabel();
    cartGrandTotal.textContent = `${formatMoney(grandTotal)}${getDeliveryTotalSuffix()}`;

    renderCartItems();
    renderAccessories();
    renderCartServiceSummary();
    updateCheckoutMessage();
    updateVisibleQuantityControls();
}

function renderCartItems() {
    if (!cart.length) {
        cartItems.innerHTML = `<p class="empty-cart">Votre panier est vide.</p>`;
        return;
    }

    cartItems.innerHTML = cart.map((entry) => `
        <article class="cart-line">
            <div>
                <strong>${escapeHtml(entry.item.name)}</strong>
                <span>${formatMoney(getEntryUnitPrice(entry))} / unité</span>
                ${getCustomizationSummary(entry.customization, entry.item).map((line) => `<span class="cart-option-line">${escapeHtml(line)}</span>`).join("")}
                ${entry.customization ? `<button class="cart-edit-button" type="button" data-edit-cart="${escapeHtml(entry.id)}">Modifier</button>` : ""}
            </div>
            <div class="qty-control compact">
                <button type="button" data-cart-dec="${escapeHtml(entry.id)}">-</button>
                <span>${entry.qty}</span>
                <button type="button" data-cart-inc="${escapeHtml(entry.id)}">+</button>
            </div>
            <strong>${formatMoney(getEntryUnitPrice(entry) * entry.qty)}</strong>
        </article>
    `).join("");
}

function renderAccessories() {
    if (!cartAccessoriesSection || !accessoryItems || !accessoryQuotaText) return;
    const quota = getAccessoryQuota();
    const availableAccessories = getAvailableAccessories(quota);
    if (!availableAccessories.length) {
        cartAccessoriesSection.hidden = true;
        accessoryQuotaText.textContent = "";
        accessoryItems.innerHTML = "";
        return;
    }

    cartAccessoriesSection.hidden = false;
    const quotaNotes = [];
    quotaNotes.push(`${quota.baguettes} paire(s) de baguettes`);
    quotaNotes.push(`${quota.sauce} sauce soja au choix`);
    quotaNotes.push(`${quota.wasabi} wasabi`);
    quotaNotes.push(`${quota.gingembre} gingembre`);
    accessoryQuotaText.textContent = `Choisissez uniquement ce dont vous avez besoin. Quota gratuit: ${quotaNotes.join(", ")}. Au-delà, chaque supplément est facturé ${formatMoney(ACCESSORY_PRICE)}.`;
    accessoryItems.innerHTML = availableAccessories.map((accessory) => {
        const qty = accessories[accessory.id] || 0;
        const free = getAccessoryFreeQty(accessory, quota);
        const paid = Math.max(0, qty - free);
        return `
            <article class="accessory-line">
                <div>
                    <strong>${accessory.label}</strong>
                    <span>${free} gratuite(s)${paid ? ` + ${paid} supplément (${formatMoney(paid * ACCESSORY_PRICE)})` : ""}</span>
                </div>
                <div class="qty-control compact">
                    <button type="button" data-accessory-dec="${accessory.id}">-</button>
                    <span>${qty}</span>
                    <button type="button" data-accessory-inc="${accessory.id}">+</button>
                </div>
            </article>
        `;
    }).join("");
}

function renderCartServiceSummary() {
    if (serviceMode === "pickup") {
        cartServiceSummary.innerHTML = `<strong>À emporter</strong><span>ZEN SUSHI WOK - 108 Boulevard du Général de Gaulle, 06340 La Trinité - 07 63 65 22 85</span>`;
        return;
    }

    const info = getCustomerInfo();
    if (!info.address) {
        cartServiceSummary.innerHTML = `<strong>Livraison</strong><span>Veuillez indiquer l'adresse de livraison.</span>`;
        return;
    }

    const mapUrl = getDeliveryMapUrl(info.address);
    const mapLink = mapUrl
        ? `<a class="delivery-map-link" href="${escapeHtml(mapUrl)}" target="_blank" rel="noopener">Verifier sur Google Maps</a>`
        : "";
    cartServiceSummary.innerHTML = `<strong>Livraison</strong><span>${escapeHtml(getDeliveryDistanceLabel())} - frais ${escapeHtml(getDeliveryFeeLabel())}. A verifier sur Google Maps.</span>${mapLink}`;
}

function getCustomerValidationMessage() {
    if (!customerNameInput && !customerPhoneInput && !customerAddressInput && !customerEmailInput) return "";
    const info = getCustomerInfo();
    if (!info.name) return "Veuillez indiquer le nom du client.";
    if (!info.phone) return "Veuillez indiquer le telephone du client.";
    if (serviceMode === "delivery" && !info.address) return "Veuillez indiquer l'adresse de livraison.";
    if (info.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) return "Veuillez verifier l'email du client.";
    return "";
}

function updateCheckoutMessage() {
    const foodTotal = getFoodTotal();
    const customerMessage = getCustomerValidationMessage();
    let message = "";

    if (!cart.length) {
        message = "Ajoutez un plat pour commencer.";
    } else if (customerMessage) {
        message = customerMessage;
    } else {
        message = CHECKOUT_READY_MESSAGE;
    }

    checkoutMessage.textContent = message;
    validateCartButton.disabled = message !== CHECKOUT_READY_MESSAGE;
    if (invoiceButton) invoiceButton.disabled = validateCartButton.disabled;
}

function getOrderReference() {
    if (currentOrderReference) return currentOrderReference;
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    currentOrderReference = `ZSW-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    return currentOrderReference;
}

function getSelectedAccessoryLines() {
    const quota = getAccessoryQuota();
    const availableAccessories = getAvailableAccessories(quota);
    return availableAccessories
        .map((accessory) => {
            const qty = accessories[accessory.id] || 0;
            if (!qty) return null;
            const free = getAccessoryFreeQty(accessory, quota);
            const paid = Math.max(0, qty - free);
            const suffix = paid
                ? `${free} gratuit(s), ${paid} supplement(s) ${formatMoney(paid * ACCESSORY_PRICE)}`
                : "gratuit";
            return `- ${accessory.label} x${qty} (${suffix})`;
        })
        .filter(Boolean);
}

function buildWhatsAppOrderMessage() {
    const info = getCustomerInfo();
    const foodTotal = getFoodTotal();
    const accessoryTotal = getAccessoryOverage() * ACCESSORY_PRICE;
    const deliveryFee = getDeliveryFee();
    const deliveryLabel = getDeliveryLabel();
    const deliveryMapUrl = serviceMode === "delivery" ? getDeliveryMapUrl(info.address) : "";
    const serviceLabel = serviceMode === "pickup" ? "A emporter" : "Livraison";
    const lines = [
        "ZEN SUSHI WOK - Nouvelle commande",
        `Reference: ${getOrderReference()}`,
        `Date: ${new Date().toLocaleString("fr-FR")}`,
        `Service: ${serviceLabel}`,
        "",
        "CLIENT",
        `Nom: ${info.name}`,
        `Telephone: ${info.phone}`,
        `Email: ${info.email || "-"}`,
        `Adresse: ${info.address || "-"}`,
        "",
        "PLATS"
    ];

    cart.forEach((entry, index) => {
        const unitPrice = getEntryUnitPrice(entry);
        lines.push(`${index + 1}. ${entry.item.name} x${entry.qty}`);
        if (entry.item.pieces) lines.push(`   ${entry.item.pieces}`);
        getCustomizationSummary(entry.customization, entry.item).forEach((line) => lines.push(`   ${line}`));
        lines.push(`   ${formatMoney(unitPrice)} / unite = ${formatMoney(unitPrice * entry.qty)}`);
    });

    const accessoryLines = getSelectedAccessoryLines();
    if (accessoryLines.length) {
        lines.push("", "ACCESSOIRES", ...accessoryLines);
    }

    if (serviceMode === "delivery") {
        lines.push("", "LIVRAISON", `Frais: ${deliveryLabel}`);
        lines.push(`Distance Google Maps: ${getDeliveryDistanceLabel()}`);
        lines.push("Note: frais et distance a confirmer apres verification sur Google Maps.");
        if (deliveryMapUrl) lines.push(`Lien Google Maps: ${deliveryMapUrl}`);
    }

    lines.push(
        "",
        "TOTAL",
        `Plats: ${formatMoney(foodTotal)}`,
        `Accessoires: ${formatMoney(accessoryTotal)}`
    );
    if (serviceMode === "delivery") {
        lines.push(`Livraison: ${deliveryLabel}`);
    } else {
        lines.push("Service: A emporter");
    }
    lines.push(`Total: ${formatMoney(foodTotal + accessoryTotal + deliveryFee)}${getDeliveryTotalSuffix()}`);

    return lines.join("\n");
}

function buildInvoiceDocument() {
    const info = getCustomerInfo();
    const foodTotal = getFoodTotal();
    const accessoryTotal = getAccessoryOverage() * ACCESSORY_PRICE;
    const deliveryFee = getDeliveryFee();
    const grandTotal = foodTotal + accessoryTotal + deliveryFee;
    const deliveryLabel = getDeliveryLabel();
    const deliveryMapUrl = serviceMode === "delivery" ? getDeliveryMapUrl(info.address) : "";
    const serviceLabel = serviceMode === "pickup" ? "A emporter" : "Livraison";
    const reference = getOrderReference();
    const createdAt = new Date().toLocaleString("fr-FR");
    const whatsappUrl = `https://wa.me/${WHATSAPP_ORDER_PHONE}?text=${encodeURIComponent(buildWhatsAppOrderMessage())}`;
    const itemRows = cart.map((entry) => {
        const unitPrice = getEntryUnitPrice(entry);
        const details = [
            entry.item.pieces,
            ...getCustomizationSummary(entry.customization, entry.item)
        ].filter(Boolean);
        return `
            <tr>
                <td>
                    <strong>${escapeHtml(entry.item.name)}</strong>
                    ${details.length ? `<span>${details.map(escapeHtml).join("<br>")}</span>` : ""}
                </td>
                <td>${entry.qty}</td>
                <td>${formatMoney(unitPrice)}</td>
                <td>${formatMoney(unitPrice * entry.qty)}</td>
            </tr>
        `;
    }).join("");
    const accessoryRows = getSelectedAccessoryLines().map((line) => `<li>${escapeHtml(line.replace(/^- /, ""))}</li>`).join("");

    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture ${reference} - Zen Sushi Wok</title>
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            background: #f2f0ed;
            color: #151515;
            font-family: Arial, sans-serif;
        }
        .invoice-actions {
            position: sticky;
            top: 0;
            z-index: 2;
            display: flex;
            justify-content: center;
            gap: 10px;
            padding: 12px;
            background: #111;
        }
        .invoice-actions button,
        .invoice-actions a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 42px;
            padding: 0 16px;
            border: 0;
            border-radius: 8px;
            background: #d83a2e;
            color: #fff;
            font-size: 14px;
            font-weight: 800;
            text-decoration: none;
        }
        .sheet {
            width: min(820px, calc(100% - 28px));
            margin: 24px auto;
            padding: 36px;
            border-radius: 12px;
            background: #fff;
            box-shadow: 0 16px 44px rgba(0, 0, 0, 0.13);
        }
        .invoice-head {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            padding-bottom: 24px;
            border-bottom: 3px solid #111;
        }
        .brand h1 {
            margin: 0;
            font-size: 34px;
            line-height: 1;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        .brand h1 span { color: #ef6a22; }
        .brand p,
        .meta p,
        .box p {
            margin: 6px 0 0;
            color: #666;
            line-height: 1.45;
        }
        .meta {
            min-width: 220px;
            text-align: right;
        }
        .meta strong {
            display: block;
            color: #d83a2e;
            font-size: 22px;
        }
        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin: 24px 0;
        }
        .box {
            padding: 16px;
            border: 1px solid #e7e2dc;
            border-radius: 10px;
            background: #fbfbfb;
        }
        .box h2,
        .summary h2 {
            margin: 0 0 8px;
            font-size: 13px;
            letter-spacing: 0.6px;
            text-transform: uppercase;
        }
        .box a {
            color: #d83a2e;
            font-weight: 800;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            overflow: hidden;
            border-radius: 10px;
        }
        th {
            padding: 12px;
            background: #111;
            color: #fff;
            font-size: 12px;
            text-align: left;
            text-transform: uppercase;
        }
        td {
            padding: 13px 12px;
            border-bottom: 1px solid #ece7e1;
            vertical-align: top;
        }
        td:nth-child(n+2),
        th:nth-child(n+2) {
            text-align: right;
            white-space: nowrap;
        }
        td span {
            display: block;
            margin-top: 5px;
            color: #666;
            font-size: 12px;
            line-height: 1.45;
        }
        .accessories {
            margin: 22px 0 0;
            padding: 16px;
            border-radius: 10px;
            background: #fff5f3;
        }
        .accessories h2 { margin: 0 0 8px; font-size: 13px; text-transform: uppercase; }
        .accessories ul { margin: 0; padding-left: 18px; color: #444; line-height: 1.7; }
        .totals {
            width: min(360px, 100%);
            margin: 24px 0 0 auto;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            padding: 9px 0;
            border-bottom: 1px solid #ece7e1;
            color: #444;
        }
        .total-row.grand {
            border-bottom: 0;
            color: #111;
            font-size: 22px;
            font-weight: 800;
        }
        .note {
            margin-top: 26px;
            padding-top: 18px;
            border-top: 1px solid #ece7e1;
            color: #666;
            font-size: 12px;
            line-height: 1.55;
        }
        @media (max-width: 680px) {
            .sheet { padding: 22px; }
            .invoice-head,
            .grid { grid-template-columns: 1fr; display: grid; }
            .meta { text-align: left; }
            th, td { padding: 10px 8px; font-size: 13px; }
        }
        @media print {
            body { background: #fff; }
            .invoice-actions { display: none; }
            .sheet {
                width: 100%;
                margin: 0;
                padding: 0;
                border-radius: 0;
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-actions">
        <button type="button" onclick="window.print()">Imprimer / Enregistrer en PDF</button>
        <a href="${whatsappUrl}" target="_blank" rel="noopener">Ouvrir WhatsApp</a>
    </div>
    <main class="sheet">
        <header class="invoice-head">
            <div class="brand">
                <h1>Zen Sushi <span>Wok</span></h1>
                <p>108 BD du Général de Gaulle<br>06340 La Trinité - France</p>
                <p>zensushiwok06@gmail.com</p>
            </div>
            <div class="meta">
                <strong>Facture</strong>
                <p>Référence: ${escapeHtml(reference)}</p>
                <p>Date: ${escapeHtml(createdAt)}</p>
            </div>
        </header>
        <section class="grid">
            <div class="box">
                <h2>Client</h2>
                <p><strong>${escapeHtml(info.name)}</strong></p>
                <p>${escapeHtml(info.phone)}</p>
                <p>${escapeHtml(info.email || "-")}</p>
                <p>${escapeHtml(info.address || "-")}</p>
            </div>
            <div class="box">
                <h2>Service</h2>
                <p><strong>${serviceLabel}</strong></p>
                ${serviceMode === "delivery" ? `<p>Livraison: ${deliveryLabel}</p>` : `<p>Retrait au restaurant</p>`}
                ${serviceMode === "delivery" ? `<p>Distance Google Maps: ${escapeHtml(getDeliveryDistanceLabel())}</p>` : ""}
                ${serviceMode === "delivery" ? `<p>Frais et distance a confirmer apres verification Google Maps.</p>` : ""}
                ${deliveryMapUrl ? `<p><a href="${escapeHtml(deliveryMapUrl)}" target="_blank" rel="noopener">Verifier sur Google Maps</a></p>` : ""}
            </div>
        </section>
        <section class="summary">
            <h2>Détail de la commande</h2>
            <table>
                <thead>
                    <tr>
                        <th>Article</th>
                        <th>Qté</th>
                        <th>PU</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>${itemRows}</tbody>
            </table>
        </section>
        ${accessoryRows ? `<section class="accessories"><h2>Accessoires</h2><ul>${accessoryRows}</ul></section>` : ""}
        <section class="totals">
            <div class="total-row"><span>Plats</span><strong>${formatMoney(foodTotal)}</strong></div>
            <div class="total-row"><span>Accessoires</span><strong>${formatMoney(accessoryTotal)}</strong></div>
            ${serviceMode === "delivery" ? `<div class="total-row"><span>Livraison</span><strong>${deliveryLabel}</strong></div>` : ""}
            <div class="total-row grand"><span>Total</span><strong>${formatMoney(grandTotal)}${getDeliveryTotalSuffix()}</strong></div>
        </section>
        <p class="note">Document généré depuis le site Zen Sushi Wok. Les prix et disponibilités restent à confirmer par le restaurant.</p>
    </main>
</body>
</html>`;
}

function openInvoiceWindow() {
    saveCustomerInfo();
    updateCart();
    if (validateCartButton.disabled) {
        showToast(checkoutMessage.textContent);
        return;
    }
    const invoiceWindow = window.open("", "_blank");
    if (!invoiceWindow) {
        showToast("Autorisez les pop-ups pour ouvrir la facture.");
        return;
    }
    invoiceWindow.document.open();
    invoiceWindow.document.write(buildInvoiceDocument());
    invoiceWindow.document.close();
}

function submitWhatsAppOrder() {
    saveCustomerInfo();
    updateCart();
    if (validateCartButton.disabled) {
        showToast(checkoutMessage.textContent);
        return;
    }
    const url = `https://wa.me/${WHATSAPP_ORDER_PHONE}?text=${encodeURIComponent(buildWhatsAppOrderMessage())}`;
    const opened = window.open(url, "_blank");
    if (opened) opened.opener = null;
    else window.location.href = url;
}

function updateVisibleQuantityControls() {
    document.querySelectorAll("[data-qty-for]").forEach((element) => {
        const found = findDishById(element.dataset.qtyFor);
        if (!found) return;
        const qty = getCartQty(found.category, found.item);
        element.innerHTML = qty ? quantityMarkup(found.category, found.item, qty) : addButtonMarkup(found.category, found.item);
    });

    if (activeDish && activeCategory) {
        updateModalPriceAndAction();
    }
}

function addButtonMarkup(category, item, label = "+ Ajouter") {
    return `<button class="add-btn" type="button" data-add-item="${escapeHtml(getDishId(category, item))}">${label}</button>`;
}

function quantityMarkup(category, item, qty) {
    return `
        <div class="qty-control">
            <button type="button" data-dec-item="${escapeHtml(getDishId(category, item))}">-</button>
            <span>${qty}</span>
            <button type="button" data-inc-item="${escapeHtml(getDishId(category, item))}">+</button>
        </div>
    `;
}

function showToast(message) {
    cartToast.textContent = message;
    cartToast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => cartToast.classList.remove("show"), 1800);
}

function getMenuImageSources(folderName, fileName) {
    if (!folderName || !fileName) return null;
    const baseName = fileName.replace(/\.[^/.]+$/, "");
    return {
        optimized: encodeURI(`menu-optimized/${folderName}/${baseName}.jpg`),
        original: encodeURI(`menu/${folderName}/${fileName}`)
    };
}

function setupImageFallback(img, imgBox) {
    img.onload = () => {
        img.classList.add("is-loaded");
        imgBox.classList.remove("loading");
    };
    img.onerror = () => {
        const fallbackSrc = img.dataset.fallbackSrc;
        if (fallbackSrc) {
            img.dataset.fallbackSrc = "";
            img.src = fallbackSrc;
            return;
        }
        img.classList.add("is-loaded");
        imgBox.classList.remove("loading");
    };
    if (img.complete) {
        if (img.naturalWidth > 0) img.onload();
        else img.onerror();
    }
}

function makePlaceholder(label) {
    return `<div class="placeholder-art">${escapeHtml(label || "Zen Sushi Wok")}</div>`;
}

function inferAllergenes(item, category = "") {
    if (Array.isArray(item.allergenes)) {
        return item.allergenes.length ? item.allergenes : ["Aucun allergène majeur indiqué"];
    }
    if (category === "VINS") return ["Sulfites"];

    const text = `${item.name} ${item.composition} ${item.description}`.toLowerCase();
    const sesameSignatureFiles = new Set(["sig7.png", "sig8.png", "sig9.png", "sig11.png", "sig12.png"]);
    const allergenes = [];
    const add = (label, pattern) => {
        if (pattern.test(text) && !allergenes.includes(label)) allergenes.push(label);
    };
    const addIf = (label, condition) => {
        if (condition && !allergenes.includes(label)) allergenes.push(label);
    };

    add("Poisson", /saumon|thon|poisson|sashimi|tataki|sushi duo|zen salmon|zen love|zen dégustation|zen degustation|zen family|zen kids salmon/);
    add("Crustacés", /crevette|crevettes|shrimp/);
    add("Mollusques", /seiche|seiches/);
    add("Gluten", /panko|corn flakes|pané|panée|tempura|gyoza|nems|beignet|raviolis|udon|cheesecake|bière|biere/);
    add("Lait", /cheese|fromage|cheddar|café au lait|cafe au lait|mochi cream|cheesecake|lait(?! de coco)/);
    add("Sésame", /sésame|sesame/);
    add("Soja", /soja|tofu|edamame|miso|yakitori/);
    add("Œufs", /mayonnaise|mayo|cheesecake/);
    add("Arachides", /cacahuète|cacahuetes|cacahuètes|arachide/);
    add("Fruits à coque", /nougat|amande|noisette|pistache|noix/);
    addIf("Œufs", /nougat/.test(text));
    addIf("Lait", /mochi glacé|mochi glace/.test(text));
    addIf(
        "Sésame",
        ["CALIFORNIA", "GUNKAN", "TEMAKI", "CHIRASHI", "POKE BOWL", "CRUSTY BOWL"].includes(category)
            || (category === "PLATEAU" && /california|gunkan|temaki|poke|tartare|sésame|sesame/.test(text))
            || (category === "SIGNATURES" && sesameSignatureFiles.has(item.fileName))
    );
    addIf("Soja", category === "POKE BOWL" || category === "ZEN WOK" || /^pad thai/i.test(item.name || ""));
    addIf("Gluten", category === "CRUSTY BOWL" || category === "ZEN WOK");
    addIf("Lait", category === "CRUSTY BOWL");
    addIf("Arachides", category === "ZEN WOK" || /^pad thai/i.test(item.name || ""));
    addIf("Crustacés", /assortiment de nems/i.test(item.name || ""));
    addIf("Soja", /assortiment de brochettes|assortiment de gyoza/i.test(item.name || ""));
    addIf("Lait", /assortiment de brochettes/i.test(item.name || ""));
    return allergenes.length ? allergenes : ["Aucun allergène majeur indiqué"];
}

function isDrinkCategory(category) {
    return category === "BOISSON" || category === "VINS";
}

function getGroupItemKey(groupItem) {
    return `${groupItem.category}::${groupItem.filter || ""}`;
}

function slugify(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function getCategoryItems(category, filter = "") {
    const items = menuData[category] || [];
    if (filter === "tartare") return items.filter((item) => /tartare/i.test(item.name));
    if (filter === "chirashi") return items.filter((item) => !/tartare/i.test(item.name));
    if (filter === "bieres") return items.filter((item) => /bière|biere/i.test(item.name));
    if (filter === "softs") return items.filter((item) => !/bière|biere/i.test(item.name));
    return items;
}

function renderFoods(category, titleLabel = category, filter = "") {
    activeCategory = category;
    display.innerHTML = "";
    title.textContent = titleLabel;
    const folderName = categoryFolders[category];
    const items = getCategoryItems(category, filter);
    const fragment = document.createDocumentFragment();
    const intro = categoryIntros[category];

    if (intro && !filter) {
        const introCard = document.createElement("article");
        introCard.className = "category-intro-card";
        introCard.innerHTML = `
            <strong>${escapeHtml(intro.title)}</strong>
            <p>${escapeHtml(intro.text)}</p>
        `;
        fragment.appendChild(introCard);
    }

    items.forEach((item, index) => {
        const card = document.createElement("article");
        card.className = [
            "food-card",
            category === "VINS" ? "wine-card" : "",
            category === "BOISSON" ? "drink-card" : ""
        ].filter(Boolean).join(" ");
        const sources = getMenuImageSources(folderName, item.fileName);
        const isPriorityImage = index < 4;
        const pieces = item.pieces || "";
        const imageMarkup = sources
            ? `<img loading="${isPriorityImage ? "eager" : "lazy"}" fetchpriority="${isPriorityImage ? "high" : "low"}" decoding="async" width="700" height="700" src="${sources.optimized}" data-fallback-src="${sources.original}" alt="${escapeHtml(item.name)}">`
            : makePlaceholder(item.name);

        card.innerHTML = `
            <div class="card-stack">
                <button class="image-trigger" type="button" aria-label="Voir ${escapeHtml(item.name)}">
                    <div class="img-box${sources ? " loading" : ""}">
                        ${imageMarkup}
                        ${pieces ? `<div class="badge">${escapeHtml(pieces)}</div>` : ""}
                    </div>
                </button>
                <div class="food-info">
                    <div>
                        <h3 class="food-name">${escapeHtml(item.name)}</h3>
                        <p class="food-composition"><span>Composition:</span> ${escapeHtml(item.composition || "À compléter")}</p>
                        <p class="food-description">${escapeHtml(item.description || item.composition || "")}</p>
                    </div>
                    <div class="food-bottom">
                        ${pieces ? `<span class="food-pieces">${escapeHtml(pieces)}</span>` : "<span></span>"}
                        <strong class="food-price">${escapeHtml(formatPrice(item.price))}</strong>
                    </div>
                    <div data-qty-for="${escapeHtml(getDishId(category, item))}">
                        ${getCartQty(category, item) ? quantityMarkup(category, item, getCartQty(category, item)) : addButtonMarkup(category, item)}
                    </div>
                </div>
            </div>
        `;

        card.querySelector(".image-trigger").addEventListener("click", () => openDishModal(item, category));
        card.querySelector(".food-name").addEventListener("click", () => openDishModal(item, category));

        if (sources) setupImageFallback(card.querySelector("img"), card.querySelector(".img-box"));
        fragment.appendChild(card);
    });

    display.appendChild(fragment);
}

function renderDefaultOptions() {
    return `
        <div class="options-title">Options</div>
        <div class="option-list">
            <label><input type="checkbox" value="Sans sésame"> Sans sésame</label>
            <label><input type="checkbox" value="Supplément sauce"> Supplément sauce</label>
        </div>
    `;
}

function renderModalOptions() {
    if (!activeDish || isDrinkCategory(activeCategory)) {
        modalOptionsBlock.innerHTML = "";
        modalOptionsBlock.style.display = "none";
        return;
    }

    modalOptionsBlock.style.display = "block";

    if (!needsCustomization(activeCategory, activeDish)) {
        modalOptionsBlock.innerHTML = renderDefaultOptions();
        return;
    }

    if (modalCustomization.type === "variant-choice") {
        const choices = (activeDish.variants || []).map((variant) => `
            <label class="variant-choice-card">
                <input type="radio" name="dishVariant" value="${escapeHtml(variant.id)}" data-variant-choice="${escapeHtml(variant.id)}" ${modalCustomization.variant === variant.id ? "checked" : ""}>
                <span>${escapeHtml(variant.label)}</span>
                <strong>${formatMoney(parsePrice(variant.price))}</strong>
            </label>
        `).join("");

        modalOptionsBlock.innerHTML = `
            <section class="custom-section">
                <div class="options-title">Choix de gyoza</div>
                <div class="variant-choice-grid">${choices}</div>
            </section>
        `;
        return;
    }

    if (modalCustomization.type === "fresh-supplements") {
        const rows = FRESH_BOWL_SUPPLEMENTS.map((supplement) => {
            const qty = modalCustomization.supplements[supplement.id] || 0;
            return `
                <article class="custom-option-row">
                    <div>
                        <strong>${escapeHtml(supplement.label)}</strong>
                        <span>+${formatMoney(supplement.price)} ${supplement.unit || ""}</span>
                    </div>
                    <div class="qty-control compact custom-qty">
                        <button type="button" data-custom-dec="supplement::${supplement.id}">-</button>
                        <span>${qty}</span>
                        <button type="button" data-custom-inc="supplement::${supplement.id}">+</button>
                    </div>
                </article>
            `;
        }).join("");

        modalOptionsBlock.innerHTML = `
            <section class="custom-section">
                <div class="options-title">Suppléments</div>
                <p class="custom-help">Ajoutez autant de suppléments que souhaité. Le total du plat se met à jour automatiquement.</p>
                <div class="custom-option-list">${rows}</div>
                <strong class="custom-total">Total suppléments: ${formatMoney(getCustomizationCost(modalCustomization, activeDish))}</strong>
            </section>
        `;
        return;
    }

    if (modalCustomization.type === "kids-drinks") {
        const drinks = getKidsDrinkOptions();
        const drinkCount = Object.values(modalCustomization.drinks || {}).reduce((sum, qty) => sum + qty, 0);
        const paid = Math.max(0, drinkCount - 1);
        const drinkTotalLabel = !drinkCount
            ? "Aucune boisson selectionnee"
            : paid
                ? `Supplement boissons: ${formatMoney(paid * KIDS_EXTRA_DRINK_PRICE)}`
                : "1 boisson offerte incluse";
        const rows = drinks.map((drink) => {
            const id = getDrinkChoiceId(drink);
            const qty = modalCustomization.drinks[id] || 0;
            const sources = getMenuImageSources(categoryFolders["BOISSON"], drink.fileName);
            return `
                <article class="custom-option-row drink-choice-row">
                    <div class="custom-option-main">
                        <span class="custom-option-media">
                            ${sources ? `<img src="${sources.original}" alt="${escapeHtml(drink.name)}">` : `<i class="fa-solid fa-glass-water"></i>`}
                        </span>
                        <span class="custom-option-copy">
                            <strong>${escapeHtml(drink.name)}</strong>
                            <span>${qty > 0 && drinkCount <= 1 ? "Inclus" : formatPrice(drink.price)}</span>
                        </span>
                    </div>
                    <div class="qty-control compact custom-qty">
                        <button type="button" data-custom-dec="drink::${escapeHtml(id)}">-</button>
                        <span>${qty}</span>
                        <button type="button" data-custom-inc="drink::${escapeHtml(id)}">+</button>
                    </div>
                </article>
            `;
        }).join("");

        modalOptionsBlock.innerHTML = `
            <section class="custom-section">
                <div class="options-title">Choix de boisson</div>
                <p class="custom-help">1 soft inclus. Au-delà: +${formatMoney(KIDS_EXTRA_DRINK_PRICE)} par boisson supplémentaire.</p>
                <div class="custom-option-list custom-option-list-scroll">${rows}</div>
                <strong class="custom-total">${drinkTotalLabel}</strong>
            </section>
        `;
        return;
    }

    const vegetableChoices = ZEN_WOK_VEGETABLES.map((vegetable) => `
        <label class="choice-card">
            <input type="checkbox" data-wok-veg="${vegetable.id}" ${modalCustomization.vegetables.includes(vegetable.id) ? "checked" : ""}>
            <span>${escapeHtml(vegetable.label)}</span>
        </label>
    `).join("");
    const sauceChoices = ZEN_WOK_SAUCES.map((sauce) => `
        <label class="choice-card">
            <input type="radio" name="wokSauce" data-wok-sauce="${escapeHtml(sauce)}" ${modalCustomization.sauce === sauce ? "checked" : ""}>
            <span>${escapeHtml(sauce)}</span>
        </label>
    `).join("");
    const sideChoices = ZEN_WOK_SIDES.map((side) => `
        <label class="choice-card">
            <input type="radio" name="wokSide" data-wok-side="${escapeHtml(side)}" ${modalCustomization.side === side ? "checked" : ""}>
            <span>${escapeHtml(side)}</span>
        </label>
    `).join("");
    const supplementRows = ZEN_WOK_SUPPLEMENTS.map((supplement) => {
        const qty = modalCustomization.supplements[supplement.id] || 0;
        return `
            <article class="custom-option-row">
                <div>
                    <strong>${escapeHtml(supplement.label)}</strong>
                    <span>+${formatMoney(supplement.price)}</span>
                </div>
                <div class="qty-control compact custom-qty">
                    <button type="button" data-custom-dec="wok-supplement::${supplement.id}">-</button>
                    <span>${qty}</span>
                    <button type="button" data-custom-inc="wok-supplement::${supplement.id}">+</button>
                </div>
            </article>
        `;
    }).join("");

    modalOptionsBlock.innerHTML = `
        <section class="custom-section">
            <div class="options-title">Choix des légumes</div>
            <p class="custom-help">Les 7 légumes sont sélectionnés par défaut. Décochez uniquement ceux à retirer.</p>
            <div class="choice-grid">${vegetableChoices}</div>
            <div class="options-title custom-subtitle">Choix de sauce</div>
            <div class="choice-grid">${sauceChoices}</div>
            <div class="options-title custom-subtitle">Accompagnement</div>
            <div class="choice-grid">${sideChoices}</div>
            <div class="options-title custom-subtitle">Suppléments</div>
            <div class="custom-option-list">${supplementRows}</div>
            <strong class="custom-total">Total suppléments: ${formatMoney(getCustomizationCost(modalCustomization, activeDish))}</strong>
        </section>
    `;
}

function updateCustomizationQuantity(rawKey, delta) {
    if (!modalCustomization || !rawKey) return;
    const [type, id] = rawKey.split("::");

    if (type === "supplement" && modalCustomization.type === "fresh-supplements") {
        modalCustomization.supplements[id] = Math.max(0, (modalCustomization.supplements[id] || 0) + delta);
    }

    if (type === "drink" && modalCustomization.type === "kids-drinks") {
        const current = modalCustomization.drinks[id] || 0;
        const next = Math.max(0, current + delta);
        modalCustomization.drinks[id] = next;
    }

    if (type === "wok-supplement" && modalCustomization.type === "zen-wok") {
        modalCustomization.supplements[id] = Math.max(0, (modalCustomization.supplements[id] || 0) + delta);
    }

    modalCustomization = normalizeCustomization(activeCategory, activeDish, modalCustomization);
    renderModalOptions();
    updateModalPriceAndAction();
}

function updateVariantCustomization(target) {
    if (!modalCustomization || modalCustomization.type !== "variant-choice") return;
    if (!target.matches("[data-variant-choice]") || !target.checked) return;

    modalCustomization.variant = target.dataset.variantChoice;
    modalCustomization = normalizeCustomization(activeCategory, activeDish, modalCustomization);
    updateModalPriceAndAction();
}

function updateWokCustomization(target) {
    if (!modalCustomization || modalCustomization.type !== "zen-wok") return;

    if (target.matches("[data-wok-veg]")) {
        const selected = new Set(modalCustomization.vegetables);
        if (target.checked) selected.add(target.dataset.wokVeg);
        else selected.delete(target.dataset.wokVeg);
        modalCustomization.vegetables = ZEN_WOK_VEGETABLES
            .filter((vegetable) => selected.has(vegetable.id))
            .map((vegetable) => vegetable.id);
    }

    if (target.matches("[data-wok-sauce]") && target.checked) {
        modalCustomization.sauce = target.dataset.wokSauce;
    }

    if (target.matches("[data-wok-side]") && target.checked) {
        modalCustomization.side = target.dataset.wokSide;
    }

    modalCustomization = normalizeCustomization(activeCategory, activeDish, modalCustomization);
    updateModalPriceAndAction();
}

function updateModalPriceAndAction() {
    const modalAction = document.getElementById("modalAddButton");
    if (!modalAction || !activeDish || !activeCategory) return;

    const isCustom = needsCustomization(activeCategory, activeDish);
    const normalized = isCustom ? normalizeCustomization(activeCategory, activeDish, modalCustomization) : null;
    if (isCustom) modalCustomization = normalized;
    const unitPrice = parsePrice(activeDish.price) + getCustomizationCost(normalized, activeDish);
    modalPrice.textContent = isCustom ? formatMoney(unitPrice) : formatPrice(activeDish.price);

    let actionMarkup = "";
    if (isCustom && modalEditingEntryId) {
        actionMarkup = `<button class="add-btn" type="button" data-add-item="${escapeHtml(getDishId(activeCategory, activeDish))}">Mettre à jour - ${formatMoney(unitPrice)}</button>`;
    } else if (isCustom) {
        const qty = getConfiguredCartQty(activeCategory, activeDish, normalized);
        actionMarkup = qty
            ? quantityMarkup(activeCategory, activeDish, qty)
            : addButtonMarkup(activeCategory, activeDish, `Ajouter au panier - ${formatMoney(unitPrice)}`);
    } else {
        const qty = getCartQty(activeCategory, activeDish);
        actionMarkup = qty ? quantityMarkup(activeCategory, activeDish, qty) : addButtonMarkup(activeCategory, activeDish, "Ajouter au panier");
    }

    modalAction.outerHTML = `<div class="modal-cart-action" id="modalAddButton">${actionMarkup}</div>`;
}

function openDishModal(item, category, cartEntry = null) {
    const folderName = categoryFolders[category];
    const sources = getMenuImageSources(folderName, item.fileName);
    activeDish = item;
    activeCategory = category;
    modalEditingEntryId = cartEntry ? cartEntry.id : "";
    modalCustomization = needsCustomization(category, item)
        ? normalizeCustomization(category, item, cartEntry ? cartEntry.customization : getSavedCustomization(category, item))
        : null;

    modalDishName.textContent = item.name;
    modalPieces.textContent = item.pieces || "";
    modalPieces.style.display = item.pieces ? "inline-flex" : "none";
    modalDescription.textContent = item.description || item.composition || "Détails à confirmer auprès du restaurant.";
    modalComposition.textContent = item.composition || "Composition à confirmer auprès du restaurant.";
    modalAllergenes.innerHTML = inferAllergenes(item, category).map((label) => `<li>${escapeHtml(label)}</li>`).join("");
    modal.classList.toggle("wine-modal", category === "VINS");
    modal.classList.toggle("drink-modal", category === "BOISSON");
    modal.classList.toggle("custom-modal", needsCustomization(category, item));

    if (sources) {
        modalImage.innerHTML = `<img src="${sources.optimized}" data-fallback-src="${sources.original}" alt="${escapeHtml(item.name)}">`;
        setupImageFallback(modalImage.querySelector("img"), modalImage);
    } else {
        modalImage.innerHTML = makePlaceholder(item.name);
    }

    renderModalOptions();
    updateModalPriceAndAction();
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
}

function closeDishModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    activeDish = null;
    modalCustomization = null;
    modalEditingEntryId = "";
}

function setActiveGroup(groupButton) {
    document.querySelectorAll(".nav-item").forEach((item) => {
        item.classList.toggle("active", item === groupButton);
        if (item !== groupButton) item.setAttribute("aria-expanded", "false");
    });

    if (groupButton) {
        const navWidth = nav.offsetWidth;
        nav.scrollTo({ left: groupButton.offsetLeft - navWidth / 2 + groupButton.offsetWidth / 2, behavior: "smooth" });
    }
}

function setActiveSubItem(activeKey) {
    groupSubnav.querySelectorAll(".subnav-item").forEach((item) => {
        item.classList.toggle("active", item.dataset.key === activeKey);
    });
}

function hideGroupSubnav() {
    groupSubnav.hidden = true;
    groupSubnav.innerHTML = "";
}

function makeTitleLabel(group, groupItem) {
    if (!group || !groupItem) return groupItem ? groupItem.category : "";
    return group.items.length > 1 ? `${group.label} - ${groupItem.label}` : group.label;
}

function updateSelectedSubnav(group, groupItem) {
    selectedSubnav.textContent = makeTitleLabel(group, groupItem);
    selectedSubnav.hidden = false;
}

function enterOrderingMode() {
    document.body.classList.add("ordering-mode");
    homeSection.classList.add("hidden");
    if (menuIntroSection) menuIntroSection.hidden = true;
    if (homeRails) homeRails.hidden = true;
}

function selectCategory(group, groupItem, groupButton, collapseSubnav = false) {
    enterOrderingMode();
    setActiveGroup(groupButton);
    selectedGroupItems.set(group.label, groupItem);
    if (group.items.length <= 1) {
        hideGroupSubnav();
    } else if (collapseSubnav) {
        groupButton.setAttribute("aria-expanded", "false");
        hideGroupSubnav();
    } else {
        groupButton.setAttribute("aria-expanded", "true");
        renderGroupSubnav(group, groupButton, getGroupItemKey(groupItem));
    }
    if (group.items.length <= 1 || collapseSubnav) updateSelectedSubnav(group, groupItem);
    else selectedSubnav.hidden = true;
    renderFoods(groupItem.category, makeTitleLabel(group, groupItem), groupItem.filter);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function renderGroupSubnav(group, groupButton, activeKey = getGroupItemKey(group.items[0])) {
    groupSubnav.innerHTML = "";
    const fragment = document.createDocumentFragment();

    group.items.forEach((groupItem) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "subnav-item";
        item.dataset.key = getGroupItemKey(groupItem);
        item.textContent = groupItem.label;
        item.addEventListener("click", () => selectCategory(group, groupItem, groupButton, false));
        fragment.appendChild(item);
    });

    groupSubnav.appendChild(fragment);
    groupSubnav.hidden = false;
    setActiveSubItem(activeKey);
}

function renderGroupNav() {
    menuGroups.forEach((group) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = `nav-item${group.items.length > 1 ? " has-subnav" : ""}`;
        item.textContent = group.label;
        item.setAttribute("aria-expanded", "false");
        item.addEventListener("click", (event) => {
            event.preventDefault();
            const activeItem = groupSubnav.querySelector(".subnav-item.active");
            const currentKey = activeItem ? activeItem.dataset.key : "";
            const selectedItem = selectedGroupItems.get(group.label)
                || group.items.find((groupItem) => getGroupItemKey(groupItem) === currentKey)
                || group.items[0];
            selectCategory(group, selectedItem, item, false);
        });
        nav.appendChild(item);
    });
}

function selectInitialGroupFromHash() {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    if (hash === "menu") {
        showMenuIntro();
        return;
    }

    const group = menuGroups.find((menuGroup) => slugify(menuGroup.label) === hash);
    const groupIndex = menuGroups.indexOf(group);
    const groupButton = document.querySelectorAll(".nav-item")[groupIndex];
    if (group && groupButton) selectCategory(group, group.items[0], groupButton);
}

function scrollToMenu() {
    showMenuIntro();
}

function focusMenuCategories() {
    const firstGroup = menuGroups[0];
    const firstNavItem = document.querySelector(".nav-item");
    if (!firstGroup || !firstNavItem) return;
    selectCategory(firstGroup, firstGroup.items[0], firstNavItem, false);
}

function resetMenuSelection() {
    display.innerHTML = "";
    title.textContent = "";
    document.querySelectorAll(".nav-item").forEach((item) => {
        item.classList.remove("active");
        item.setAttribute("aria-expanded", "false");
    });
    hideGroupSubnav();
    selectedSubnav.hidden = true;
}

function showMenuIntro() {
    if (!menuIntroSection) {
        showHome();
        return;
    }
    document.body.classList.remove("ordering-mode", "header-compact");
    homeSection.classList.add("hidden");
    if (homeRails) homeRails.hidden = true;
    menuIntroSection.hidden = false;
    resetMenuSelection();
    if (window.location.hash !== "#menu") window.history.replaceState(null, "", "#menu");
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function showHome() {
    document.body.classList.remove("ordering-mode", "header-compact");
    homeSection.classList.remove("hidden");
    if (menuIntroSection) menuIntroSection.hidden = true;
    if (homeRails) homeRails.hidden = false;
    resetMenuSelection();
    if (window.location.hash) window.history.replaceState(null, "", window.location.pathname + window.location.search);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function renderHomeRails() {
    if (!productRails) return;
    const railDefs = [
        { title: "Tous les plats", entries: getCategoryItems("PLATEAU").map((item) => ({ category: "PLATEAU", item })) },
        { title: "Signatures Roll", entries: getCategoryItems("SIGNATURES").slice(0, 10).map((item) => ({ category: "SIGNATURES", item })) },
        {
            title: "Hot Bowl",
            entries: [
                ...getCategoryItems("ZEN WOK").slice(0, 5).map((item) => ({ category: "ZEN WOK", item })),
                ...getCategoryItems("CRUSTY BOWL").slice(0, 3).map((item) => ({ category: "CRUSTY BOWL", item }))
            ]
        },
        {
            title: "Fresh Bowl",
            entries: [
                ...getCategoryItems("POKE BOWL").slice(0, 6).map((item) => ({ category: "POKE BOWL", item })),
                ...getCategoryItems("CHIRASHI").slice(0, 4).map((item) => ({ category: "CHIRASHI", item }))
            ]
        }
    ];

    productRails.innerHTML = railDefs.map((rail, railIndex) => `
        <section class="product-rail">
            <div class="rail-head">
                <h3>${rail.title}</h3>
                <div>
                    <button type="button" data-rail-prev="${railIndex}" aria-label="Précédent"><i class="fa-solid fa-chevron-left"></i></button>
                    <button type="button" data-rail-next="${railIndex}" aria-label="Suivant"><i class="fa-solid fa-chevron-right"></i></button>
                </div>
            </div>
            <div class="rail-track" data-rail-track="${railIndex}">
                ${rail.entries.map((entry) => railCardMarkup(entry.item, entry.category)).join("")}
            </div>
        </section>
    `).join("");
}

function railCardMarkup(item, category) {
    const sources = getMenuImageSources(categoryFolders[category], item.fileName);
    return `
        <article class="rail-card">
            <button class="rail-image" type="button" data-open-item="${escapeHtml(getDishId(category, item))}">
                ${sources ? `<img src="${sources.optimized}" data-fallback-src="${sources.original}" alt="${escapeHtml(item.name)}">` : makePlaceholder(item.name)}
            </button>
            <button class="rail-title" type="button" data-open-item="${escapeHtml(getDishId(category, item))}">${escapeHtml(item.name)}</button>
            <div class="rail-bottom">
                <strong>${formatPrice(item.price)}</strong>
                <button type="button" data-add-item="${escapeHtml(getDishId(category, item))}">+ Ajouter</button>
            </div>
        </article>
    `;
}

function findDishById(id) {
    const [category, itemKey] = String(id || "").split("::");
    const item = (menuData[category] || []).find((dish) => dish.fileName === itemKey || dish.name === itemKey);
    return item ? { category, item } : null;
}

function applyServiceMode(mode) {
    const nextMode = WHATSAPP_SERVICE_MODE;
    serviceMode = nextMode;
    localStorage.setItem("zenServiceMode", nextMode);
    serviceButtons.forEach((button) => button.classList.toggle("active", button.dataset.serviceMode === nextMode));
    if (deliveryPanel) deliveryPanel.hidden = true;
    if (pickupPanel) pickupPanel.hidden = nextMode !== "pickup";
    updateCart();
}

function estimateDelivery() {
    const value = (customerAddressInput && customerAddressInput.value ? customerAddressInput.value : (deliveryAddress ? deliveryAddress.value : "")).trim();
    if (deliveryAddress) deliveryAddress.value = value;
    if (customerAddressInput) customerAddressInput.value = value;
    saveCustomerInfo();
    if (!value) {
        deliveryInfo = null;
        if (deliveryResult) deliveryResult.hidden = true;
        if (deliveryMessage) deliveryMessage.textContent = "Entrez l'adresse, puis notez la distance et les frais apres verification sur Google Maps.";
        writeJson("zenDeliveryInfo", deliveryInfo);
        updateCart();
        return;
    }

    saveManualDeliveryInfo();
    renderDeliveryResult();
    if (deliveryMessage) deliveryMessage.textContent = "Adresse enregistree. Verifiez la distance sur Google Maps et notez les frais de livraison.";
    updateCart();
}

function openCart() {
    cartDrawer.classList.add("open");
    cartDrawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("cart-open");
}

function closeCart() {
    cartDrawer.classList.remove("open");
    cartDrawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cart-open");
}

function clearCart() {
    cart = [];
    accessories = {};
    accessoryDefaults = {};
    savedCustomizations = {};
    currentOrderReference = "";
    writeJson("zenCartItems", cart);
    writeJson("zenAccessories", accessories);
    writeJson(ACCESSORY_DEFAULTS_KEY, accessoryDefaults);
    writeJson("zenSavedCustomizations", savedCustomizations);
    syncAccessoryDefaults();
    updateCart();
}

document.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-item]");
    const incButton = event.target.closest("[data-inc-item]");
    const decButton = event.target.closest("[data-dec-item]");
    const openButton = event.target.closest("[data-open-item]");
    const cartIncButton = event.target.closest("[data-cart-inc]");
    const cartDecButton = event.target.closest("[data-cart-dec]");
    const editCartButton = event.target.closest("[data-edit-cart]");
    const accessoryIncButton = event.target.closest("[data-accessory-inc]");
    const accessoryDecButton = event.target.closest("[data-accessory-dec]");
    const customIncButton = event.target.closest("[data-custom-inc]");
    const customDecButton = event.target.closest("[data-custom-dec]");
    const railNext = event.target.closest("[data-rail-next]");
    const railPrev = event.target.closest("[data-rail-prev]");

    if (customIncButton || customDecButton) {
        updateCustomizationQuantity((customIncButton || customDecButton).dataset.customInc || (customIncButton || customDecButton).dataset.customDec, customIncButton ? 1 : -1);
        return;
    }

    if (addButton || incButton || decButton || openButton) {
        const actionButton = addButton || incButton || decButton || openButton;
        const id = actionButton.dataset.addItem
            || actionButton.dataset.incItem
            || actionButton.dataset.decItem
            || actionButton.dataset.openItem;
        const found = findDishById(id);
        if (!found) return;
        const modalAction = modal.classList.contains("open") && modal.contains(actionButton);
        const customItem = needsCustomization(found.category, found.item);

        if (openButton) {
            openDishModal(found.item, found.category);
            return;
        }

        if ((addButton || incButton) && customItem && !modalAction) {
            openDishModal(found.item, found.category);
            return;
        }

        if ((addButton || incButton) && customItem && modalAction) {
            if (modalEditingEntryId && addButton) updateConfiguredCartEntry(modalEditingEntryId, found.category, found.item, modalCustomization);
            else addConfiguredDishToCart(found.item, found.category, modalCustomization);
            return;
        }

        if (decButton && customItem && modalAction) {
            decrementConfiguredCartItem(found.category, found.item, modalCustomization);
            return;
        }

        if (addButton || incButton) addToCart(found.item, found.category);
        if (decButton) {
            if (customItem) decrementCartBaseItem(found.category, found.item);
            else setCartQty(found.category, found.item, getCartQty(found.category, found.item) - 1);
        }
    }

    if (cartIncButton || cartDecButton) {
        const id = (cartIncButton || cartDecButton).dataset.cartInc || (cartIncButton || cartDecButton).dataset.cartDec;
        const entry = cart.find((item) => item.id === id);
        if (!entry) return;
        setCartEntryQty(entry.id, entry.qty + (cartIncButton ? 1 : -1));
    }

    if (editCartButton) {
        const entry = cart.find((cartEntry) => cartEntry.id === editCartButton.dataset.editCart);
        if (entry) openDishModal(entry.item, entry.category, entry);
    }

    if (accessoryIncButton || accessoryDecButton) {
        const id = (accessoryIncButton || accessoryDecButton).dataset.accessoryInc || (accessoryIncButton || accessoryDecButton).dataset.accessoryDec;
        if (!getAvailableAccessories().some((accessory) => accessory.id === id)) return;
        accessories[id] = Math.max(0, (accessories[id] || 0) + (accessoryIncButton ? 1 : -1));
        writeJson("zenAccessories", accessories);
        updateCart();
    }

    if (railNext || railPrev) {
        const index = (railNext || railPrev).dataset.railNext || (railNext || railPrev).dataset.railPrev;
        const track = document.querySelector(`[data-rail-track="${index}"]`);
        if (track) track.scrollBy({ left: railNext ? 320 : -320, behavior: "smooth" });
    }
});

document.addEventListener("change", (event) => {
    if (event.target.matches("[data-variant-choice]")) {
        updateVariantCustomization(event.target);
    }

    if (event.target.matches("[data-wok-veg], [data-wok-sauce], [data-wok-side]")) {
        updateWokCustomization(event.target);
    }
});

document.querySelectorAll("[data-close-modal]").forEach((element) => element.addEventListener("click", closeDishModal));
document.querySelectorAll("[data-close-cart]").forEach((element) => element.addEventListener("click", closeCart));
serviceButtons.forEach((button) => button.addEventListener("click", () => applyServiceMode(button.dataset.serviceMode)));
if (checkDeliveryButton) checkDeliveryButton.addEventListener("click", estimateDelivery);
if (deliveryAddress) deliveryAddress.addEventListener("keydown", (event) => { if (event.key === "Enter") estimateDelivery(); });
cartButton.addEventListener("click", openCart);
checkoutButton.addEventListener("click", openCart);
if (invoiceButton) invoiceButton.addEventListener("click", openInvoiceWindow);
validateCartButton.addEventListener("click", submitWhatsAppOrder);
clearCartButton.addEventListener("click", clearCart);

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        if (modal.classList.contains("open")) closeDishModal();
        if (cartDrawer.classList.contains("open")) closeCart();
    }
});

window.addEventListener("scroll", () => {
    document.body.classList.toggle("header-compact", window.scrollY > 80 || document.body.classList.contains("ordering-mode"));
}, { passive: true });
