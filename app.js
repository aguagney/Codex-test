const authModal = document.getElementById('auth-modal');
const modalOverlay = document.getElementById('modal-overlay');
const closeModalButton = document.getElementById('close-modal');
const tabButtons = Array.from(document.querySelectorAll('.modal-tab'));
const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');
const toast = document.getElementById('toast');

const landingPage = document.getElementById('landing-page');
const dashboardView = document.getElementById('dashboard-view');
const accountView = document.getElementById('account-view');

const accountButton = document.getElementById('account-button');
const accountMenu = document.getElementById('account-menu');
const accountDetailsButton = document.getElementById('account-details');
const accountLogoutButton = document.getElementById('account-logout');
const accountBackButton = document.getElementById('account-back');
const accountLogoutSecondary = document.getElementById('account-logout-secondary');

const accountAvatarBadge = document.getElementById('account-avatar');
const accountNameLabel = document.getElementById('account-name');
const accountDetailAvatar = document.getElementById('account-detail-avatar');
const accountDetailName = document.getElementById('account-detail-name');
const accountDetailEmail = document.getElementById('account-detail-email');
const accountDetailEmailInline = document.getElementById('account-detail-email-inline');
const accountDetailGoal = document.getElementById('account-detail-goal');
const accountDetailAge = document.getElementById('account-detail-age');
const accountDetailGender = document.getElementById('account-detail-gender');

const dashboardGreeting = document.getElementById('dashboard-greeting');
const profileName = document.getElementById('profile-name');
const profileAvatar = document.getElementById('profile-avatar');
const profileGoal = document.getElementById('profile-goal');

const uploadCard = document.getElementById('upload-card');
const processingCard = document.getElementById('processing-card');
const resultsCard = document.getElementById('results-card');
const resultPhoto = document.getElementById('result-photo');
const resultsBody = document.getElementById('results-body');
const resultsMeta = document.getElementById('results-meta');
const totalCalories = document.getElementById('total-calories');
const totalProtein = document.getElementById('total-protein');
const totalCarbs = document.getElementById('total-carbs');
const totalFat = document.getElementById('total-fat');
const saveMealButton = document.getElementById('save-meal');
const retakePhotoButton = document.getElementById('retake-photo');
const saveSuccess = document.getElementById('save-success');
const successCalories = document.getElementById('success-calories');
const successMeal = document.getElementById('success-meal');
const summaryCalories = document.getElementById('summary-calories');
const summaryProtein = document.getElementById('summary-protein');
const summaryCarbs = document.getElementById('summary-carbs');
const summaryFat = document.getElementById('summary-fat');
const mealList = document.getElementById('meal-list');
const mealEmptyState = document.getElementById('meal-empty');
const mealDetailCard = document.getElementById('meal-detail');
const mealDetailName = document.getElementById('meal-detail-name');
const mealDetailMeta = document.getElementById('meal-detail-meta');
const mealDetailBody = document.getElementById('meal-detail-body');
const mealDetailTotalCalories = document.getElementById('meal-detail-total-calories');
const mealDetailTotalProtein = document.getElementById('meal-detail-total-protein');
const mealDetailTotalCarbs = document.getElementById('meal-detail-total-carbs');
const mealDetailTotalFat = document.getElementById('meal-detail-total-fat');
const currentYear = document.getElementById('current-year');

const photoInput = document.getElementById('photo-input');
const photoTrigger = document.getElementById('photo-trigger');
const openLogin = document.getElementById('open-login');
const openSignup = document.getElementById('open-signup');
const ctaStart = document.getElementById('cta-start');
const ctaTour = document.getElementById('cta-tour');

const STORAGE_USER_KEY = 'calsnap:user';
const STORAGE_USERS_KEY = 'calsnap:users';
const STORAGE_MEALS_KEY = 'calsnap:meals';
const STORAGE_SESSION_KEY = 'calsnap:session-active';
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_API_KEY = 'AIzaSyBSNYUAERvmEm_SS_RjmJEMNO9x_v3PKtA';
const MEAL_EMPTY_MESSAGE = "You haven't saved any meals yet.";
const MEAL_EMPTY_LOGGED_OUT_MESSAGE = 'Log in to save your meals.';

let currentUser = null;
let currentMeal = null;
let selectedMealId = null;

const views = {
  landing: landingPage,
  dashboard: dashboardView,
  account: accountView
};

const sampleMeals = [
  {
    name: 'Vibrant Veggie Bowl',
    items: [
      { item: 'Roasted Veggies', calories: 180, protein: 6, carbs: 24, fat: 6 },
      { item: 'Quinoa', calories: 220, protein: 8, carbs: 40, fat: 4 },
      { item: 'Tahini Drizzle', calories: 90, protein: 3, carbs: 6, fat: 7 }
    ]
  },
  {
    name: 'Protein Packed Breakfast',
    items: [
      { item: 'Scrambled Eggs', calories: 200, protein: 14, carbs: 2, fat: 15 },
      { item: 'Avocado Toast', calories: 240, protein: 6, carbs: 22, fat: 14 },
      { item: 'Greek Yogurt', calories: 120, protein: 11, carbs: 9, fat: 4 }
    ]
  },
  {
    name: 'Balanced Lunch Plate',
    items: [
      { item: 'Grilled Chicken', calories: 250, protein: 32, carbs: 0, fat: 8 },
      { item: 'Brown Rice', calories: 210, protein: 5, carbs: 45, fat: 2 },
      { item: 'Garden Salad', calories: 80, protein: 3, carbs: 10, fat: 3 }
    ]
  },
  {
    name: 'Comfort Dinner',
    items: [
      { item: 'Baked Salmon', calories: 280, protein: 28, carbs: 0, fat: 18 },
      { item: 'Sweet Potato Mash', calories: 190, protein: 4, carbs: 42, fat: 0 },
      { item: 'Steamed Greens', calories: 70, protein: 4, carbs: 9, fat: 1 }
    ]
  },
  {
    name: 'Energising Snack Platter',
    items: [
      { item: 'Hummus', calories: 110, protein: 4, carbs: 12, fat: 6 },
      { item: 'Wholegrain Pita', calories: 150, protein: 6, carbs: 28, fat: 2 },
      { item: 'Fresh Fruit', calories: 80, protein: 1, carbs: 20, fat: 0 }
    ]
  }
];

function buildGeminiPrompt() {
  return [
    'You are CalSnap, a nutrition assistant. Analyse the provided meal photo and estimate calories and macros.',
    'Respond with a strict JSON object with keys: mealName (string) and items (array).',
    'Each item must include item (string), calories (number kcal), protein (number grams), carbs (number grams), fat (number grams).',
    'Ensure numbers are realistic and omit any commentary, markdown, or explanations beyond the JSON.'
  ].join(' ');
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result?.toString() || '');
    reader.onerror = () => reject(reader.error || new Error('Unable to read file.'));
    reader.readAsDataURL(file);
  });
}

function extractBase64Data(dataUrl) {
  if (!dataUrl) return '';
  const commaIndex = dataUrl.indexOf(',');
  return commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
}

function extractJsonFromText(text) {
  if (!text) return '';
  const fencedMatch = text.match(/```json([\s\S]*?)```/i);
  if (fencedMatch) {
    return fencedMatch[1].trim();
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : '';
}

function normaliseNumber(value) {
  const numeric = Number.parseFloat(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.round(numeric * 10) / 10);
}

function mapGeminiMeal(parsed) {
  if (!parsed) {
    throw new Error('Empty Gemini payload');
  }

  const name = parsed.mealName || parsed.name || 'Detected meal';
  const itemsSource = Array.isArray(parsed.items) ? parsed.items : [];
  if (!itemsSource.length) {
    throw new Error('No meal items provided');
  }

  const items = itemsSource
    .map((entry, index) => ({
      item: entry?.item || entry?.name || `Item ${index + 1}`,
      calories: normaliseNumber(entry?.calories),
      protein: normaliseNumber(entry?.protein),
      carbs: normaliseNumber(entry?.carbs),
      fat: normaliseNumber(entry?.fat)
    }))
    .filter((entry) => entry.item);

  if (!items.length) {
    throw new Error('Gemini returned empty meal items');
  }

  return {
    name,
    items,
    source: 'Estimated by Google Gemini'
  };
}

async function analyzePhotoWithGemini(file, dataUrl) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }
  const inlineData = extractBase64Data(dataUrl);
  if (!inlineData) {
    throw new Error('Missing encoded image');
  }

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': GEMINI_API_KEY
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: buildGeminiPrompt() },
            {
              inline_data: {
                mime_type: file.type || 'image/jpeg',
                data: inlineData
              }
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Gemini request failed: ${message}`);
  }

  const payload = await response.json();
  const contentParts = payload.candidates?.[0]?.content?.parts || [];
  const rawText = contentParts
    .map((part) => part.text)
    .filter(Boolean)
    .join('')
    .trim();

  const jsonPayload = extractJsonFromText(rawText);
  if (!jsonPayload) {
    throw new Error('Gemini response missing JSON payload');
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonPayload);
  } catch (error) {
    throw new Error('Unable to parse Gemini JSON');
  }

  return mapGeminiMeal(parsed);
}

function setCurrentYear() {
  currentYear.textContent = new Date().getFullYear();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2500);
}

function hideAccountMenu() {
  if (!accountMenu) return;
  accountMenu.hidden = true;
  accountButton?.setAttribute('aria-expanded', 'false');
}

function setActiveView(view) {
  Object.entries(views).forEach(([key, element]) => {
    if (!element) return;
    const isActive = key === view;
    element.hidden = !isActive;
    element.setAttribute('aria-hidden', String(!isActive));
  });

  document.body.classList.toggle('landing-active', view === 'landing');
  document.body.classList.toggle('dashboard-active', view === 'dashboard');
  document.body.classList.toggle('account-active', view === 'account');

  hideAccountMenu();
  window.scrollTo(0, 0);
}

function showLanding() {
  setActiveView('landing');
}

function showDashboard() {
  if (!currentUser) {
    showLanding();
    return;
  }

  setActiveView('dashboard');
}

function showAccountDetails() {
  if (!currentUser) {
    showToast('Log in to view your account details.');
    return;
  }

  updateAccountDetailsView();
  setActiveView('account');
}

function openModal(defaultTab = 'signup-form') {
  authModal.setAttribute('aria-hidden', 'false');
  switchTab(defaultTab);
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  authModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  loginMessage.textContent = '';
}

function switchTab(targetId) {
  tabButtons.forEach((btn) => {
    const isActive = btn.dataset.target === targetId;
    btn.classList.toggle('active', isActive);
  });
  [signupForm, loginForm].forEach((form) => {
    form.classList.toggle('active', form.id === targetId);
  });
}

function getLegacyStoredUser() {
  const raw = localStorage.getItem(STORAGE_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to parse legacy user', error);
    return null;
  }
}

function sanitiseUserRecord(user) {
  if (!user || typeof user !== 'object') return null;
  const email = typeof user.email === 'string' ? user.email.trim().toLowerCase() : '';
  if (!email) return null;

  return {
    ...user,
    email,
    name: typeof user.name === 'string' ? user.name : user.name?.toString?.() || '',
    goal: typeof user.goal === 'string' ? user.goal : user.goal?.toString?.() || ''
  };
}

function storeUsers(users) {
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

function getStoredUsers() {
  let users = [];
  const raw = localStorage.getItem(STORAGE_USERS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        users = parsed
          .map((entry) => {
            try {
              return sanitiseUserRecord(entry);
            } catch (error) {
              console.error('Failed to normalise stored user', error);
              return null;
            }
          })
          .filter(Boolean);
        storeUsers(users);
      }
    } catch (error) {
      console.error('Failed to parse users', error);
      users = [];
      localStorage.removeItem(STORAGE_USERS_KEY);
    }
  }

  const legacyUser = sanitiseUserRecord(getLegacyStoredUser());
  if (legacyUser) {
    const existingIndex = users.findIndex((entry) => entry.email === legacyUser.email);
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...legacyUser };
    } else {
      users.push(legacyUser);
    }
    storeUsers(users);
    localStorage.removeItem(STORAGE_USER_KEY);
  }

  return users;
}

function getStoredUser(email) {
  if (!email) return null;
  const normalisedEmail = email.trim().toLowerCase();
  if (!normalisedEmail) return null;
  const match = getStoredUsers().find((entry) => entry.email === normalisedEmail);
  return match ? { ...match } : null;
}

function storeUser(user) {
  const record = sanitiseUserRecord(user);
  if (!record) return;
  const users = getStoredUsers();
  const existingIndex = users.findIndex((entry) => entry.email === record.email);
  if (existingIndex >= 0) {
    users[existingIndex] = { ...users[existingIndex], ...record };
  } else {
    users.push(record);
  }
  storeUsers(users);
}

function getActiveSessionEmail() {
  const value = localStorage.getItem(STORAGE_SESSION_KEY);
  if (!value) return null;
  if (value === 'true') {
    const legacyUser = sanitiseUserRecord(getLegacyStoredUser());
    if (legacyUser?.email) {
      localStorage.setItem(STORAGE_SESSION_KEY, legacyUser.email);
      return legacyUser.email;
    }
    localStorage.removeItem(STORAGE_SESSION_KEY);
    return null;
  }
  return value.trim().toLowerCase();
}

function setSessionActive(email) {
  if (email) {
    localStorage.setItem(STORAGE_SESSION_KEY, email.trim().toLowerCase());
  } else {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  }
}

function getStoredMeals() {
  const raw = localStorage.getItem(STORAGE_MEALS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to parse meals', error);
    return [];
  }
}

function storeMeals(meals) {
  localStorage.setItem(STORAGE_MEALS_KEY, JSON.stringify(meals));
}

function updateProfileUI() {
  if (!currentUser) {
    dashboardGreeting.textContent = 'Hi there 👋';
    profileName.textContent = 'Guest';
    profileAvatar.textContent = 'G';
    profileGoal.textContent = 'Sign up to unlock personalised goals';
    updateAccountDetailsView();
    return;
  }

  dashboardGreeting.textContent = `Hi ${currentUser.name.split(' ')[0]} 👋`;
  profileName.textContent = currentUser.name;
  profileGoal.textContent = currentUser.goal || 'Goal not set';
  profileAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
  updateAccountDetailsView();
}

function updateAccountDetailsView() {
  if (!accountNameLabel) return;

  if (!currentUser) {
    accountNameLabel.textContent = 'Guest';
    accountAvatarBadge.textContent = 'G';
    accountDetailAvatar.textContent = 'G';
    accountDetailName.textContent = 'Guest';
    accountDetailEmail.textContent = '—';
    accountDetailEmailInline.textContent = '—';
    accountDetailGoal.textContent = '—';
    accountDetailAge.textContent = '—';
    accountDetailGender.textContent = '—';
    return;
  }

  const initials = currentUser.name.charAt(0).toUpperCase();
  accountNameLabel.textContent = currentUser.name.split(' ')[0];
  accountAvatarBadge.textContent = initials;
  accountDetailAvatar.textContent = initials;
  accountDetailName.textContent = currentUser.name;
  accountDetailEmail.textContent = currentUser.email;
  accountDetailEmailInline.textContent = currentUser.email;
  accountDetailGoal.textContent = currentUser.goal || 'Goal not set';
  accountDetailAge.textContent = `${currentUser.age} yrs`;

  const genderLabels = {
    female: 'Female',
    male: 'Male',
    'non-binary': 'Non-binary',
    'prefer-not': 'Prefer not to say'
  };
  accountDetailGender.textContent = genderLabels[currentUser.gender] || currentUser.gender || '—';
}

function resetResults() {
  currentMeal = null;
  resultsBody.innerHTML = '';
  totalCalories.textContent = '0 kcal';
  totalProtein.textContent = '0 g';
  totalCarbs.textContent = '0 g';
  totalFat.textContent = '0 g';
  saveSuccess.hidden = true;
  resultsCard.hidden = true;
  processingCard.hidden = true;
  uploadCard.hidden = false;
  resultPhoto.style.backgroundImage = '';
  if (photoInput) {
    photoInput.value = '';
  }
}

function showProcessingState() {
  uploadCard.hidden = true;
  resultsCard.hidden = true;
  saveSuccess.hidden = true;
  processingCard.hidden = false;
}

function showResults(meal) {
  processingCard.hidden = true;
  resultsCard.hidden = false;
  resultsBody.innerHTML = '';

  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;

  meal.items.forEach((row) => {
    calories += row.calories;
    protein += row.protein;
    carbs += row.carbs;
    fat += row.fat;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.item}</td>
      <td>${row.calories} kcal</td>
      <td>${row.protein} g</td>
      <td>${row.carbs} g</td>
      <td>${row.fat} g</td>
    `;
    resultsBody.appendChild(tr);
  });

  totalCalories.textContent = `${calories} kcal`;
  totalProtein.textContent = `${protein} g`;
  totalCarbs.textContent = `${carbs} g`;
  totalFat.textContent = `${fat} g`;
  const displayName = meal.name || 'Meal breakdown';
  const metaParts = [displayName, new Date().toLocaleDateString(), meal.source];
  resultsMeta.textContent = metaParts.filter(Boolean).join(' · ');
  successCalories.textContent = calories;
  currentMeal = { ...meal, name: displayName, total: { calories, protein, carbs, fat }, timestamp: Date.now() };
}

function simulateDetection() {
  const randomMeal = sampleMeals[Math.floor(Math.random() * sampleMeals.length)];
  return {
    name: randomMeal.name,
    items: randomMeal.items.map((item) => ({ ...item })),
    source: 'Sample meal suggestion'
  };
}

async function handlePhotoSelection(file) {
  if (!file) return;
  showProcessingState();

  let dataUrl = '';
  try {
    dataUrl = await readFileAsDataURL(file);
  } catch (error) {
    console.error('Failed to read image file', error);
    showToast('We could not read that image. Please try a different photo.');
    resetResults();
    return;
  }

  if (dataUrl) {
    resultPhoto.style.backgroundImage = `url('${dataUrl}')`;
  }

  try {
    const detectedMeal = await analyzePhotoWithGemini(file, dataUrl);
    showResults(detectedMeal);
  } catch (error) {
    console.error('Gemini analysis failed', error);
    const fallbackMeal = simulateDetection();
    showToast('We had trouble analysing that photo. Showing a sample meal instead.');
    showResults(fallbackMeal);
  } finally {
    if (photoInput) {
      photoInput.value = '';
    }
  }
}

function saveCurrentMeal() {
  if (!currentUser || !currentMeal) {
    showToast('Log in to save your meal.');
    return;
  }

  const meals = getStoredMeals();
  const timestamp = Date.now();
  const newEntry = {
    ...currentMeal,
    timestamp,
    userEmail: currentUser.email,
    mealType: inferMealType(),
    date: new Date().toISOString()
  };
  currentMeal = { ...currentMeal, timestamp };
  meals.push(newEntry);
  storeMeals(meals);
  selectedMealId = timestamp;
  successMeal.textContent = newEntry.mealType;
  saveSuccess.hidden = false;
  showToast('Meal saved to your daily log.');
  updateMealSummary();
  renderSavedMeals();
}

function inferMealType() {
  const hour = new Date().getHours();
  if (hour < 11) return 'Breakfast';
  if (hour < 16) return 'Lunch';
  if (hour < 21) return 'Dinner';
  return 'Snack';
}

function updateMealSummary() {
  if (!currentUser) {
    summaryCalories.textContent = '0 kcal';
    summaryProtein.textContent = '0 g';
    summaryCarbs.textContent = '0 g';
    summaryFat.textContent = '0 g';
    return;
  }

  const meals = getStoredMeals();
  const today = new Date().toISOString().split('T')[0];
  const todaysMeals = meals.filter(
    (meal) => meal.userEmail === currentUser.email && meal.date.startsWith(today)
  );

  const totals = todaysMeals.reduce(
    (acc, meal) => {
      acc.calories += meal.total.calories;
      acc.protein += meal.total.protein;
      acc.carbs += meal.total.carbs;
      acc.fat += meal.total.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  summaryCalories.textContent = `${totals.calories} kcal`;
  summaryProtein.textContent = `${totals.protein} g`;
  summaryCarbs.textContent = `${totals.carbs} g`;
  summaryFat.textContent = `${totals.fat} g`;
}

function hideMealDetail() {
  if (mealDetailCard) {
    mealDetailCard.hidden = true;
  }
  if (mealList) {
    Array.from(mealList.children).forEach((item) => {
      item.classList.remove('selected');
      item.setAttribute('aria-current', 'false');
    });
  }
}

function showMealDetail(meal) {
  if (!mealDetailCard) return;

  const totals = meal.total || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const savedDate = meal.date ? new Date(meal.date) : null;

  mealDetailCard.hidden = false;
  mealDetailName.textContent = meal.name || meal.mealType || 'Saved meal';

  const metaParts = [];
  if (meal.mealType) metaParts.push(meal.mealType);
  if (savedDate) {
    metaParts.push(savedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
    metaParts.push(savedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }
  if (meal.source) metaParts.push(meal.source);
  mealDetailMeta.textContent = metaParts.join(' · ') || 'Saved meal details';

  mealDetailBody.innerHTML = '';
  (meal.items || []).forEach((item) => {
    const row = document.createElement('tr');

    const itemCell = document.createElement('td');
    itemCell.textContent = item.item;

    const caloriesCell = document.createElement('td');
    caloriesCell.textContent = `${item.calories} kcal`;

    const proteinCell = document.createElement('td');
    proteinCell.textContent = `${item.protein} g`;

    const carbsCell = document.createElement('td');
    carbsCell.textContent = `${item.carbs} g`;

    const fatCell = document.createElement('td');
    fatCell.textContent = `${item.fat} g`;

    row.append(itemCell, caloriesCell, proteinCell, carbsCell, fatCell);
    mealDetailBody.appendChild(row);
  });

  mealDetailTotalCalories.textContent = `${totals.calories} kcal`;
  mealDetailTotalProtein.textContent = `${totals.protein} g protein`;
  mealDetailTotalCarbs.textContent = `${totals.carbs} g carbs`;
  mealDetailTotalFat.textContent = `${totals.fat} g fat`;
}

function renderSavedMeals() {
  mealList.innerHTML = '';

  if (!currentUser) {
    if (mealEmptyState) {
      mealEmptyState.hidden = false;
      mealEmptyState.textContent = MEAL_EMPTY_LOGGED_OUT_MESSAGE;
    }
    if (mealList) {
      mealList.hidden = true;
    }
    selectedMealId = null;
    hideMealDetail();
    return;
  }

  const meals = getStoredMeals()
    .filter((meal) => meal.userEmail === currentUser.email)
    .sort((a, b) => b.timestamp - a.timestamp);

  if (!meals.length) {
    if (mealEmptyState) {
      mealEmptyState.hidden = false;
      mealEmptyState.textContent = MEAL_EMPTY_MESSAGE;
    }
    mealList.hidden = true;
    selectedMealId = null;
    hideMealDetail();
    return;
  }

  mealList.hidden = false;
  if (mealEmptyState) {
    mealEmptyState.hidden = true;
  }

  const recentMeals = meals.slice(0, 10);

  recentMeals.forEach((meal) => {
    const listItem = document.createElement('li');
    listItem.className = 'meal-item';
    listItem.dataset.timestamp = String(meal.timestamp);
    listItem.tabIndex = 0;
    listItem.setAttribute('role', 'button');

    const savedDate = meal.date ? new Date(meal.date) : null;
    const mealTypeLabel = meal.mealType || 'Meal';
    const accessibleLabelParts = [mealTypeLabel, `${meal.total?.calories ?? 0} calories`];
    if (savedDate) {
      accessibleLabelParts.push(
        `saved on ${savedDate.toLocaleDateString()} at ${savedDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })}`
      );
    }
    listItem.setAttribute('aria-label', accessibleLabelParts.join(', '));

    const info = document.createElement('div');
    info.className = 'meal-item-info';

    const name = document.createElement('span');
    name.className = 'meal-item-name';
    name.textContent = mealTypeLabel;

    const meta = document.createElement('span');
    meta.className = 'meal-item-meta';
    const metaParts = [`${meal.total?.calories ?? 0} kcal`];
    if (savedDate) {
      metaParts.push(savedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
      metaParts.push(savedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
    meta.textContent = metaParts.join(' · ');

    info.append(name, meta);

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'meal-delete-button';
    deleteButton.dataset.timestamp = String(meal.timestamp);
    deleteButton.setAttribute('aria-label', `Delete ${mealTypeLabel}`);
    deleteButton.innerHTML = '&times;';

    listItem.append(info, deleteButton);

    const isSelected = selectedMealId === meal.timestamp;
    if (isSelected) {
      listItem.classList.add('selected');
    }
    listItem.setAttribute('aria-current', String(isSelected));

    mealList.appendChild(listItem);
  });

  if (selectedMealId) {
    const selectedMeal = meals.find((meal) => meal.timestamp === selectedMealId);
    if (selectedMeal) {
      showMealDetail(selectedMeal);
      const selectedElement = mealList.querySelector(`[data-timestamp="${selectedMealId}"]`);
      selectedElement?.classList.add('selected');
      selectedElement?.setAttribute('aria-current', 'true');
    } else {
      selectedMealId = null;
      hideMealDetail();
    }
  } else {
    hideMealDetail();
  }
}

function deleteMeal(timestamp) {
  const meals = getStoredMeals();
  const updatedMeals = meals.filter((meal) => meal.timestamp !== timestamp);
  if (updatedMeals.length === meals.length) {
    return;
  }

  storeMeals(updatedMeals);

  if (selectedMealId === timestamp) {
    const remainingMeals = updatedMeals
      .filter((meal) => currentUser && meal.userEmail === currentUser.email)
      .sort((a, b) => b.timestamp - a.timestamp);
    selectedMealId = remainingMeals[0]?.timestamp ?? null;
  }

  updateMealSummary();
  renderSavedMeals();
  showToast('Meal removed from history.');
}

function handleMealListClick(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const deleteButton = target.closest('.meal-delete-button');
  if (deleteButton) {
    event.stopPropagation();
    const timestamp = Number.parseInt(deleteButton.dataset.timestamp || '', 10);
    if (!Number.isNaN(timestamp)) {
      deleteMeal(timestamp);
    }
    return;
  }

  const listItem = target.closest('.meal-item');
  if (!listItem) {
    return;
  }

  const timestamp = Number.parseInt(listItem.dataset.timestamp || '', 10);
  if (Number.isNaN(timestamp)) {
    return;
  }

  const meals = getStoredMeals();
  const selectedMeal = meals.find(
    (meal) => meal.timestamp === timestamp && meal.userEmail === currentUser?.email
  );
  if (!selectedMeal) {
    return;
  }

  selectedMealId = timestamp;

  mealList.querySelectorAll('.meal-item').forEach((item) => {
    item.classList.toggle('selected', item === listItem);
    item.setAttribute('aria-current', String(item === listItem));
  });

  showMealDetail(selectedMeal);
}

function handleMealListKeydown(event) {
  if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') {
    return;
  }

  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (target.closest('.meal-delete-button')) {
    return;
  }

  const listItem = target.closest('.meal-item');
  if (!listItem) {
    return;
  }

  event.preventDefault();
  listItem.click();
}

function authenticateUser(email, password) {
  const storedUser = getStoredUser(email);
  if (!storedUser) return null;
  if (storedUser.password === password) {
    return storedUser;
  }
  return null;
}

function handleSignup(event) {
  event.preventDefault();
  const formData = new FormData(signupForm);
  const name = formData.get('name')?.toString().trim();
  const age = Number(formData.get('age'));
  const gender = formData.get('gender');
  const email = formData.get('email')?.toString().trim().toLowerCase();
  const password = formData.get('password')?.toString();
  const goal = formData.get('goal');

  if (!name || !age || !gender || !email || !password || !goal) {
    showToast('Please fill in all fields to continue.');
    return;
  }

  const existingUser = getStoredUser(email);
  if (existingUser) {
    switchTab('login-form');
    loginForm.email.value = email;
    loginForm.password.value = '';
    loginMessage.textContent = 'Account was already created earlier.';
    loginForm.email.focus();
    return;
  }

  const user = { name, age, gender, email, password, goal };
  storeUser(user);
  currentUser = getStoredUser(email) || user;
  setSessionActive(email);
  selectedMealId = null;
  updateProfileUI();
  updateMealSummary();
  renderSavedMeals();
  resetResults();
  closeModal();
  showDashboard();
  showToast('Welcome to CalSnap! Account created.');
  signupForm.reset();
}

function handleLogin(event) {
  event.preventDefault();
  const email = loginForm.email.value.trim().toLowerCase();
  const password = loginForm.password.value.trim();

  const user = authenticateUser(email, password);
  if (user) {
    currentUser = user;
    setSessionActive(user.email);
    selectedMealId = null;
    updateProfileUI();
    updateMealSummary();
    renderSavedMeals();
    resetResults();
    closeModal();
    loginForm.reset();
    loginMessage.textContent = '';
    showDashboard();
    showToast('Logged in successfully.');
  } else {
    loginMessage.textContent = 'Please check your details.';
  }
}

function handleLogout() {
  currentUser = null;
  setSessionActive(null);
  selectedMealId = null;
  resetResults();
  updateProfileUI();
  updateMealSummary();
  renderSavedMeals();
  hideMealDetail();
  showLanding();
  showToast('You have logged out.');
}

function initAuthModal() {
  openSignup?.addEventListener('click', () => openModal('signup-form'));
  openLogin?.addEventListener('click', () => openModal('login-form'));
  ctaStart?.addEventListener('click', () => openModal('signup-form'));
  ctaTour?.addEventListener('click', () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  });

  tabButtons.forEach((button) =>
    button.addEventListener('click', () => switchTab(button.dataset.target))
  );

  closeModalButton.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    if (authModal.getAttribute('aria-hidden') === 'false') {
      closeModal();
    }

    if (accountMenu && !accountMenu.hidden) {
      hideAccountMenu();
    }
  });
}

function initUploadFlow() {
  photoTrigger.addEventListener('click', () => photoInput.click());
  photoInput.addEventListener('change', async () => {
    const file = photoInput.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast('Please choose an image under 10 MB.');
      return;
    }
    await handlePhotoSelection(file);
  });

  retakePhotoButton.addEventListener('click', () => {
    photoInput.value = '';
    resetResults();
  });

  saveMealButton.addEventListener('click', saveCurrentMeal);
}

function initAccountControls() {
  accountButton?.addEventListener('click', (event) => {
    event.stopPropagation();
    if (!currentUser) {
      openModal('login-form');
      return;
    }

    const willOpen = accountMenu.hidden;
    accountMenu.hidden = !willOpen;
    accountButton.setAttribute('aria-expanded', String(willOpen));
  });

  accountMenu?.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  accountDetailsButton?.addEventListener('click', () => {
    showAccountDetails();
  });

  accountBackButton?.addEventListener('click', () => {
    showDashboard();
  });

  [accountLogoutButton, accountLogoutSecondary].forEach((button) =>
    button?.addEventListener('click', () => {
      handleLogout();
    })
  );

  document.addEventListener('click', (event) => {
    if (!accountMenu || accountMenu.hidden) return;
    if (accountButton?.contains(event.target)) return;
    if (accountMenu.contains(event.target)) return;
    hideAccountMenu();
  });
}

function restoreSession() {
  const activeEmail = getActiveSessionEmail();
  const storedUser = activeEmail ? getStoredUser(activeEmail) : null;

  if (storedUser) {
    currentUser = storedUser;
    updateProfileUI();
    updateMealSummary();
    renderSavedMeals();
    resetResults();
    showDashboard();
    return;
  }

  currentUser = null;
  setSessionActive(null);
  updateProfileUI();
  updateMealSummary();
  renderSavedMeals();
  resetResults();
  showLanding();
}

function init() {
  setCurrentYear();
  initAuthModal();
  initUploadFlow();
  initAccountControls();
  signupForm.addEventListener('submit', handleSignup);
  loginForm.addEventListener('submit', handleLogin);
  mealList?.addEventListener('click', handleMealListClick);
  mealList?.addEventListener('keydown', handleMealListKeydown);
  restoreSession();
}

init();
