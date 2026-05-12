const categories = window.ZEN_MENU_CATEGORIES || [];
const menuData = window.ZEN_MENU_DATA || {};
const categoryFolders = window.ZEN_CATEGORY_FOLDERS || {};
const menuGroups = normalizeMenuGroups(window.ZEN_MENU_GROUPS, categories);
const categoryIntros = window.ZEN_CATEGORY_INTROS || {};

const nav = document.getElementById("mainNav");
const display = document.getElementById("foodDisplay");
const title = document.getElementById("currentCategoryName");
const homeSection = document.getElementById("homeSection");
const homeRails = document.getElementById("homeRails");
const cartCountEl = document.getElementById("cartCount");
const cartTotalHeader = document.getElementById("cartTotalHeader");
const checkoutButton = document.getElementById("checkoutButton");
const cartButton = document.getElementById("cartButton");
const clearCartButton = document.getElementById("clearCartButton");
const validateCartButton = document.getElementById("validateCartButton");
const cartDrawer = document.getElementById("cartDrawer");
const cartItems = document.getElementById("cartItems");
const accessoryItems = document.getElementById("accessoryItems");
const accessoryQuotaText = document.getElementById("accessoryQuotaText");
const cartPanelTotal = document.getElementById("cartPanelTotal");
const cartFoodTotal = document.getElementById("cartFoodTotal");
const cartAccessoryTotal = document.getElementById("cartAccessoryTotal");
const cartDeliveryFee = document.getElementById("cartDeliveryFee");
const cartGrandTotal = document.getElementById("cartGrandTotal");
const cartServiceSummary = document.getElementById("cartServiceSummary");
const checkoutMessage = document.getElementById("checkoutMessage");
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

const DELIVERY_ZONES = [
    { max: 1.99, fee: 0, minimum: 15, eta: "25-35 min" },
    { max: 2.99, fee: 2, minimum: 25, eta: "30-40 min" },
    { max: 4.99, fee: 3, minimum: 35, eta: "35-50 min" },
    { max: 7.5, fee: 5, minimum: 45, eta: "45-60 min" }
];
const ACCESSORY_PRICE = 0.5;
const ACCESSORIES = [
    { id: "soy-salty", label: "Sauce soja salée", quota: "sauce" },
    { id: "soy-sweet", label: "Sauce soja sucrée", quota: "sauce" },
    { id: "baguettes", label: "Baguettes", quota: "baguettes" },
    { id: "wasabi", label: "Wasabi", quota: "wasabi" },
    { id: "gingembre", label: "Gingembre", quota: "gingembre" }
];
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
    { id: "poireaux", label: "Poireaux" },
    { id: "courgettes", label: "Courgettes" },
    { id: "carottes", label: "Carottes" },
    { id: "oignons", label: "Oignons" }
];
const ZEN_WOK_SAUCES = ["Soja du chef", "Tamarin", "Saté", "Piquante", "Aigre-douce", "Curry au lait de coco"];
const ZEN_WOK_SIDES = ["Riz nature", "Nouille chinois", "Udon (nouille japonais)"];

let activeDish = null;
let activeCategory = "";
let toastTimer = null;
let serviceMode = localStorage.getItem("zenServiceMode") || "delivery";
let deliveryInfo = readJson("zenDeliveryInfo", null);
let cart = readJson("zenCartItems", []);
let accessories = readJson("zenAccessories", {});
let savedCustomizations = readJson("zenSavedCustomizations", {});
let selectedGroupItems = new Map();
let modalCustomization = null;
let modalEditingEntryId = "";

cart = cart.filter((entry) => entry && entry.id && entry.item && entry.qty > 0).map(normalizeCartEntry);
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

function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
    }[char]));
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

function normalizeCartEntry(entry) {
    const category = entry.category || findCategoryForItem(entry.item);
    const baseId = entry.baseId || getDishId(category, entry.item);
    return {
        ...entry,
        category,
        baseId,
        qty: Math.max(0, Number(entry.qty) || 0),
        customization: entry.customization || null
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

function needsCustomization(category, item) {
    return isFreshBowlCategory(category) || category === "ZEN WOK" || isKidsMenu(item);
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
        if (!Object.values(drinks).some((qty) => qty > 0)) {
            const defaultDrink = getDefaultKidsDrink();
            if (defaultDrink) drinks[getDrinkChoiceId(defaultDrink)] = 1;
        }
        return { type: "kids-drinks", drinks };
    }

    const source = customization && customization.type === "zen-wok" ? customization : {};
    const vegetableIds = new Set(Array.isArray(source.vegetables) && source.vegetables.length
        ? source.vegetables
        : ZEN_WOK_VEGETABLES.map((vegetable) => vegetable.id));
    const sauce = ZEN_WOK_SAUCES.includes(source.sauce) ? source.sauce : ZEN_WOK_SAUCES[0];
    const side = ZEN_WOK_SIDES.includes(source.side) ? source.side : ZEN_WOK_SIDES[0];

    return {
        type: "zen-wok",
        vegetables: ZEN_WOK_VEGETABLES.filter((vegetable) => vegetableIds.has(vegetable.id)).map((vegetable) => vegetable.id),
        sauce,
        side
    };
}

function getKidsDrinkOptions() {
    return (menuData["BOISSON"] || []).filter((item) => !/bière|biere/i.test(item.name) && parsePrice(item.price) <= 3.5);
}

function getDefaultKidsDrink() {
    const drinks = getKidsDrinkOptions();
    return drinks.find((item) => /^Coca-Cola$/i.test(item.name)) || drinks[0] || null;
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

function getCustomizationCost(customization) {
    if (!customization) return 0;

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

    return 0;
}

function getEntryUnitPrice(entry) {
    return parsePrice(entry.item.price) + getCustomizationCost(entry.customization);
}

function getCustomizationKey(category, item, customization) {
    const normalized = normalizeCustomization(category, item, customization);
    if (!normalized) return "standard";

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
        return `kids-${selected.join("_")}`;
    }

    const vegetables = ZEN_WOK_VEGETABLES
        .filter((vegetable) => normalized.vegetables.includes(vegetable.id))
        .map((vegetable) => vegetable.id)
        .join("-");
    return `wok-${vegetables || "sans-legumes"}-${slugify(normalized.sauce)}-${slugify(normalized.side)}`;
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

function getCustomizationSummary(customization) {
    if (!customization) return [];

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
        return [
            `Légumes: ${vegetables.length ? vegetables.join(", ") : "sans légumes"}`,
            `Sauce: ${customization.sauce}`,
            `Accompagnement: ${customization.side}`
        ];
    }

    return [];
}

function getAccessoryQuota() {
    const quota = Math.floor(getFoodTotal() / 10);
    return {
        sauce: quota,
        baguettes: quota,
        wasabi: quota,
        gingembre: quota
    };
}

function syncAccessoryDefaults() {
    const quota = getAccessoryQuota();
    ACCESSORIES.forEach((accessory) => {
        if (accessories[accessory.id] == null) {
            accessories[accessory.id] = accessory.id === "soy-salty" ? quota.sauce : quota[accessory.quota];
        }
    });
    writeJson("zenAccessories", accessories);
}

function getAccessoryOverage() {
    const quota = getAccessoryQuota();
    const sauceQty = (accessories["soy-salty"] || 0) + (accessories["soy-sweet"] || 0);
    return ACCESSORIES.reduce((sum, accessory) => {
        if (accessory.quota === "sauce") return sum;
        return sum + Math.max(0, (accessories[accessory.id] || 0) - quota[accessory.quota]);
    }, Math.max(0, sauceQty - quota.sauce));
}

function getDeliveryFee() {
    return serviceMode === "delivery" && deliveryInfo && deliveryInfo.available ? deliveryInfo.fee : 0;
}

function getGrandTotal() {
    return getFoodTotal() + getAccessoryOverage() * ACCESSORY_PRICE + getDeliveryFee();
}

function updateCart() {
    const itemCount = getItemCount();
    const foodTotal = getFoodTotal();
    const accessoryTotal = getAccessoryOverage() * ACCESSORY_PRICE;
    const deliveryFee = getDeliveryFee();
    const grandTotal = getGrandTotal();

    cartCountEl.textContent = String(itemCount);
    cartTotalHeader.textContent = formatMoney(grandTotal);
    checkoutButton.hidden = itemCount === 0;
    cartButton.classList.toggle("has-items", itemCount > 0);
    cartPanelTotal.textContent = formatMoney(grandTotal);
    cartFoodTotal.textContent = formatMoney(foodTotal);
    cartAccessoryTotal.textContent = formatMoney(accessoryTotal);
    cartDeliveryFee.textContent = deliveryFee ? formatMoney(deliveryFee) : (serviceMode === "delivery" ? "À calculer" : "0,00€");
    cartGrandTotal.textContent = formatMoney(grandTotal);

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
                ${getCustomizationSummary(entry.customization).map((line) => `<span class="cart-option-line">${escapeHtml(line)}</span>`).join("")}
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
    const quota = getAccessoryQuota();
    const sauceQty = (accessories["soy-salty"] || 0) + (accessories["soy-sweet"] || 0);
    accessoryQuotaText.textContent = `Quota gratuit: ${quota.baguettes} baguette(s), ${quota.sauce} sauce(s), ${quota.wasabi} wasabi, ${quota.gingembre} gingembre.`;
    accessoryItems.innerHTML = ACCESSORIES.map((accessory) => {
        const qty = accessories[accessory.id] || 0;
        const free = accessory.quota === "sauce" ? Math.min(qty, Math.max(0, quota.sauce - Math.max(0, sauceQty - qty))) : Math.min(qty, quota[accessory.quota]);
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
        cartServiceSummary.innerHTML = `<strong>À emporter</strong><span>Retrait au restaurant. Adresse et horaires à confirmer.</span>`;
        return;
    }

    if (!deliveryInfo) {
        cartServiceSummary.innerHTML = `<strong>Livraison</strong><span>Entrez votre adresse avant de valider la commande.</span>`;
        return;
    }

    if (!deliveryInfo.available) {
        cartServiceSummary.innerHTML = `<strong>Livraison</strong><span>Zone non desservie actuellement.</span>`;
        return;
    }

    cartServiceSummary.innerHTML = `<strong>Livraison</strong><span>${deliveryInfo.distance.toFixed(1)} km - frais ${formatMoney(deliveryInfo.fee)} - minimum ${formatMoney(deliveryInfo.minimum)} - ${deliveryInfo.eta}</span>`;
}

function updateCheckoutMessage() {
    const foodTotal = getFoodTotal();
    let message = "";

    if (!cart.length) {
        message = "Ajoutez un plat pour commencer.";
    } else if (serviceMode === "delivery" && !deliveryInfo) {
        message = "Veuillez vérifier votre adresse de livraison.";
    } else if (serviceMode === "delivery" && deliveryInfo && !deliveryInfo.available) {
        message = "Zone non desservie actuellement.";
    } else if (serviceMode === "delivery" && deliveryInfo && foodTotal < deliveryInfo.minimum) {
        message = `Montant minimum pour cette zone : ${formatMoney(deliveryInfo.minimum)}. Il manque ${formatMoney(deliveryInfo.minimum - foodTotal)}.`;
    } else {
        message = "Commande prête à valider.";
    }

    checkoutMessage.textContent = message;
    validateCartButton.disabled = message !== "Commande prête à valider.";
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

function inferAllergenes(item) {
    const text = `${item.name} ${item.composition} ${item.description}`.toLowerCase();
    const allergenes = [];
    const add = (label, pattern) => {
        if (pattern.test(text) && !allergenes.includes(label)) allergenes.push(label);
    };

    add("Poisson", /saumon|thon|poisson|sashimi|sushi|tataki/);
    add("Crustacés", /crevette|crevettes|tempura|seiche|seiches/);
    add("Gluten", /panko|corn flakes|pané|panée|tempura|nouilles|udon|gyoza|nems|cheesecake|beignet/);
    add("Lait", /cheese|fromage|lait|cheesecake|mochi cream/);
    add("Sésame", /sésame|sesame/);
    add("Soja", /soja|tofu|edamame|miso|yakitori/);
    add("Œufs", /mayonnaise|mayo/);
    add("Sulfites", /vin rouge|vin blanc|vin rosé|bière/);

    return allergenes.length ? allergenes : ["À confirmer"];
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
                <strong class="custom-total">Total suppléments: ${formatMoney(getCustomizationCost(modalCustomization))}</strong>
            </section>
        `;
        return;
    }

    if (modalCustomization.type === "kids-drinks") {
        const drinks = getKidsDrinkOptions();
        const drinkCount = Object.values(modalCustomization.drinks || {}).reduce((sum, qty) => sum + qty, 0);
        const paid = Math.max(0, drinkCount - 1);
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
                <strong class="custom-total">${paid ? `Supplément boissons: ${formatMoney(paid * KIDS_EXTRA_DRINK_PRICE)}` : "1 boisson offerte incluse"}</strong>
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

    modalOptionsBlock.innerHTML = `
        <section class="custom-section">
            <div class="options-title">Choix des légumes</div>
            <p class="custom-help">Les 7 légumes sont sélectionnés par défaut. Décochez uniquement ceux à retirer.</p>
            <div class="choice-grid">${vegetableChoices}</div>
            <div class="options-title custom-subtitle">Choix de sauce</div>
            <div class="choice-grid">${sauceChoices}</div>
            <div class="options-title custom-subtitle">Accompagnement</div>
            <div class="choice-grid">${sideChoices}</div>
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
        const currentTotal = Object.values(modalCustomization.drinks || {}).reduce((sum, qty) => sum + qty, 0);
        if (currentTotal - current + next < 1) return;
        modalCustomization.drinks[id] = next;
    }

    modalCustomization = normalizeCustomization(activeCategory, activeDish, modalCustomization);
    renderModalOptions();
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
    const unitPrice = parsePrice(activeDish.price) + getCustomizationCost(normalized);
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
    modalAllergenes.innerHTML = inferAllergenes(item).map((label) => `<li>${escapeHtml(label)}</li>`).join("");
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

    const group = menuGroups.find((menuGroup) => slugify(menuGroup.label) === hash);
    const groupIndex = menuGroups.indexOf(group);
    const groupButton = document.querySelectorAll(".nav-item")[groupIndex];
    if (group && groupButton) selectCategory(group, group.items[0], groupButton);
}

function scrollToMenu() {
    const firstGroup = menuGroups[0];
    const firstNavItem = document.querySelector(".nav-item");
    if (!firstGroup || !firstNavItem) return;
    selectCategory(firstGroup, firstGroup.items[0], firstNavItem, false);
}

function showHome() {
    document.body.classList.remove("ordering-mode", "header-compact");
    homeSection.classList.remove("hidden");
    if (homeRails) homeRails.hidden = false;
    display.innerHTML = "";
    title.textContent = "";
    document.querySelectorAll(".nav-item").forEach((item) => {
        item.classList.remove("active");
        item.setAttribute("aria-expanded", "false");
    });
    hideGroupSubnav();
    selectedSubnav.hidden = true;
    if (window.location.hash) window.history.replaceState(null, "", window.location.pathname + window.location.search);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function renderHomeRails() {
    if (!productRails) return;
    const railDefs = [
        { title: "Tous les plats", entries: getCategoryItems("PLATEAU").slice(0, 8).map((item) => ({ category: "PLATEAU", item })) },
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
                ${rail.entries.map((entry) => railCardMarkup(entry.item, entry.category)).join("")}
            </div>
        </section>
    `).join("");

    productRails.querySelectorAll(".rail-track").forEach((track) => startRailAutoScroll(track));
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

function startRailAutoScroll(track) {
    let paused = false;
    track.addEventListener("mouseenter", () => { paused = true; });
    track.addEventListener("mouseleave", () => { paused = false; });
    track.addEventListener("touchstart", () => { paused = true; }, { passive: true });
    track.addEventListener("touchend", () => { setTimeout(() => { paused = false; }, 1200); }, { passive: true });
    setInterval(() => {
        if (paused || document.body.classList.contains("ordering-mode")) return;
        track.scrollLeft += 1;
        if (track.scrollLeft > track.scrollWidth / 2) track.scrollLeft = 0;
    }, 55);
}

function findDishById(id) {
    const [category, itemKey] = String(id || "").split("::");
    const item = (menuData[category] || []).find((dish) => dish.fileName === itemKey || dish.name === itemKey);
    return item ? { category, item } : null;
}

function applyServiceMode(mode) {
    serviceMode = mode;
    localStorage.setItem("zenServiceMode", mode);
    serviceButtons.forEach((button) => button.classList.toggle("active", button.dataset.serviceMode === mode));
    if (deliveryPanel) deliveryPanel.hidden = mode !== "delivery";
    if (pickupPanel) pickupPanel.hidden = mode !== "pickup";
    updateCart();
}

function estimateDelivery() {
    const value = deliveryAddress.value.trim();
    if (!value) {
        deliveryInfo = null;
        deliveryResult.hidden = true;
        deliveryMessage.textContent = "Entrez une adresse pour calculer la zone, les frais et le minimum de commande.";
        writeJson("zenDeliveryInfo", deliveryInfo);
        updateCart();
        return;
    }

    const postcode = value.match(/\b\d{5}\b/);
    let distance = 2.4;
    if (postcode) {
        const tail = Number(postcode[0].slice(-2));
        distance = 0.8 + (tail % 8) * 0.75;
    } else {
        distance = 1.5 + Math.min(5.5, value.length / 14);
    }

    const zone = DELIVERY_ZONES.find((item) => distance <= item.max);
    deliveryInfo = zone
        ? { address: value, distance, fee: zone.fee, minimum: zone.minimum, eta: zone.eta, available: true }
        : { address: value, distance, available: false };

    writeJson("zenDeliveryInfo", deliveryInfo);
    if (!deliveryInfo.available) {
        deliveryMessage.textContent = "Zone non desservie actuellement.";
        deliveryResult.hidden = true;
    } else {
        deliveryMessage.textContent = "Adresse vérifiée.";
        deliveryResult.hidden = false;
        deliveryResult.innerHTML = `
            <span>${deliveryInfo.distance.toFixed(1)} km</span>
            <span>Frais: ${formatMoney(deliveryInfo.fee)}</span>
            <span>Minimum: ${formatMoney(deliveryInfo.minimum)}</span>
            <span>${deliveryInfo.eta}</span>
        `;
    }
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
    savedCustomizations = {};
    writeJson("zenCartItems", cart);
    writeJson("zenAccessories", accessories);
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
validateCartButton.addEventListener("click", () => showToast(validateCartButton.disabled ? checkoutMessage.textContent : "Commande prête. Connexion paiement à brancher."));
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
