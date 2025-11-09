const state = {
  trips: [],
  currentTrip: null,
  currentDayIndex: 0,
  currentView: 'list',
  autosaveTimeout: null
};

const storageKeys = {
  trips: 'tripTuner_trips',
  draft: 'tripTuner_currentDraft'
};

const selectors = {
  welcomeSection: document.getElementById('welcomeSection'),
  itinerarySection: document.getElementById('itinerarySection'),
  tripTitle: document.getElementById('tripTitle'),
  tripDates: document.getElementById('tripDates'),
  dayNav: document.getElementById('dayNav'),
  dayContent: document.getElementById('dayContent'),
  startDateInput: document.getElementById('startDateInput'),
  endDateInput: document.getElementById('endDateInput'),
  tripModal: document.getElementById('tripModal'),
  tripForm: document.getElementById('tripForm'),
  activityModal: document.getElementById('activityModal'),
  activityForm: document.getElementById('activityForm'),
  savedTripsList: document.getElementById('savedTripsList'),
  saveTripBtn: document.getElementById('saveTripBtn'),
  toast: document.getElementById('toast'),
  viewToggle: document.getElementById('viewToggle'),
  toggleViewBtn: document.getElementById('toggleViewBtn'),
};

const timeSlots = ['Morning', 'Afternoon', 'Evening'];

init();

function init() {
  loadTripsFromStorage();
  hydrateDraft();
  bindEvents();
  renderSavedTrips();
}

function bindEvents() {
  document.getElementById('newTripBtn').addEventListener('click', () => toggleModal(selectors.tripModal, true));

  const destinationInput = document.getElementById('destination');
  const tripNameInput = document.getElementById('tripName');

  tripNameInput.addEventListener('input', () => {
    if (tripNameInput.value.trim().length === 0) {
      delete tripNameInput.dataset.manual;
    } else {
      tripNameInput.dataset.manual = 'true';
    }
  });

  destinationInput.addEventListener('input', () => {
    if (!tripNameInput.dataset.manual) {
      const destValue = destinationInput.value.trim();
      tripNameInput.value = destValue ? `Trip to ${destValue}` : '';
    }
  });

  selectors.tripForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(selectors.tripForm);
    const destination = (formData.get('destination') || '').toString().trim();
    const tripName = (formData.get('tripName') || '').toString().trim();
    const startDate = formData.get('startDate');
    const endDate = formData.get('endDate');

    if (!destination) {
      showToast('Please choose a destination.', true);
      return;
    }

    if (!startDate || !endDate) {
      showToast('Please provide both start and end dates.', true);
      return;
    }

    const trip = {
      trip_id: `trip-${Date.now()}`,
      user_id: `user-${(formData.get('userName') || '').toString().trim().toLowerCase().replace(/\s+/g, '-')}`,
      user: {
        name: (formData.get('userName') || '').toString().trim(),
        age: Number(formData.get('userAge')),
        place: (formData.get('userPlace') || '').toString().trim()
      },
      trip_name: tripName || `Trip to ${destination}`,
      destination,
      start_date: startDate,
      end_date: endDate,
      budget: formData.get('budget') ? Number(formData.get('budget')) : null,
      days: []
    };

    if (parseDate(trip.end_date) < parseDate(trip.start_date)) {
      showToast('End date must be after the start date.', true);
      return;
    }

    trip.days = generateDays(trip.start_date, trip.end_date);
    state.currentTrip = trip;
    state.currentDayIndex = 0;
    selectors.tripForm.reset();
    delete tripNameInput.dataset.manual;
    toggleModal(selectors.tripModal, false);
    revealItinerary();
    renderTrip();
    queueAutosave();
  });

  selectors.activityForm.addEventListener('submit', handleActivitySubmit);

  document.querySelectorAll('[data-close]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const modal = event.target.closest('.modal');
      toggleModal(modal, false);
    });
  });

  selectors.saveTripBtn.addEventListener('click', saveCurrentTrip);

  selectors.startDateInput.addEventListener('change', (event) => {
    if (!state.currentTrip) return;
    const newStart = event.target.value;
    updateTripDates(newStart, selectors.endDateInput.value || state.currentTrip.end_date);
  });

  selectors.endDateInput.addEventListener('change', (event) => {
    if (!state.currentTrip) return;
    const newEnd = event.target.value;
    updateTripDates(selectors.startDateInput.value || state.currentTrip.start_date, newEnd);
  });

  selectors.viewToggle.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-view]');
    if (!button) return;
    const view = button.dataset.view;
    state.currentView = view;
    selectors.viewToggle.querySelectorAll('button').forEach((btn) => btn.classList.toggle('active', btn === button));
    selectors.toggleViewBtn.textContent = view === 'list' ? 'Map View' : 'List View';
    renderDayContent();
  });

  selectors.toggleViewBtn.addEventListener('click', () => {
    state.currentView = state.currentView === 'list' ? 'map' : 'list';
    selectors.viewToggle.querySelectorAll('button').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.view === state.currentView);
    });
    selectors.toggleViewBtn.textContent = state.currentView === 'list' ? 'Map View' : 'List View';
    renderDayContent();
  });
}

function toggleModal(modal, show) {
  modal.classList.toggle('hidden', !show);
  document.body.style.overflow = show ? 'hidden' : '';
}

function revealItinerary() {
  selectors.welcomeSection.classList.add('hidden');
  selectors.itinerarySection.classList.remove('hidden');
}

function renderTrip() {
  if (!state.currentTrip) return;
  const trip = state.currentTrip;
  selectors.tripTitle.textContent = trip.trip_name || `Trip to ${trip.destination}`;
  selectors.tripDates.textContent = `${formatDateDisplay(trip.start_date)} → ${formatDateDisplay(trip.end_date)} · ${trip.days.length} day${trip.days.length === 1 ? '' : 's'}`;
  selectors.startDateInput.value = trip.start_date;
  selectors.endDateInput.value = trip.end_date;
  renderDayNav();
  renderDayContent();
  persistDraft();
}

function renderDayNav() {
  selectors.dayNav.innerHTML = '';
  state.currentTrip.days.forEach((day, index) => {
    const button = document.createElement('button');
    button.textContent = `Day ${day.day_number}\n${formatDateDisplay(day.date)}`;
    button.classList.toggle('active', index === state.currentDayIndex);
    button.addEventListener('click', () => {
      state.currentDayIndex = index;
      renderDayNav();
      renderDayContent();
    });
    selectors.dayNav.appendChild(button);
  });
}

function renderDayContent() {
  const day = state.currentTrip.days[state.currentDayIndex];
  selectors.dayContent.innerHTML = '';

  if (state.currentView === 'map') {
    const mapView = document.createElement('div');
    mapView.className = 'map-view';
    mapView.innerHTML = `
      <h3>Map view is on the horizon ✨</h3>
      <p>Once locations are connected, Trip Tuner will plot <strong>${day.activities.length}</strong> stop${day.activities.length === 1 ? '' : 's'} for ${formatDateDisplay(day.date)} right here.
      For now, keep noting locations so you'll be ready!</p>
    `;
    selectors.dayContent.appendChild(mapView);
    return;
  }

  timeSlots.forEach((slot) => {
    const section = document.createElement('div');
    section.className = 'day-section';

    const slotTitle = document.createElement('h3');
    slotTitle.textContent = slot;
    section.appendChild(slotTitle);

    const sectionBody = document.createElement('div');
    sectionBody.className = 'section-body';

    const activities = day.activities.filter((activity) => activity.slot === slot);
    activities.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));

    activities.forEach((activity, index) => {
      sectionBody.appendChild(createActivityCard(activity, index, slot));
    });

    const addButton = document.createElement('button');
    addButton.className = 'add-activity';
    addButton.textContent = `＋ Add ${slot} activity`;
    addButton.addEventListener('click', () => openActivityModal(slot, null));
    sectionBody.appendChild(addButton);

    section.appendChild(sectionBody);
    selectors.dayContent.appendChild(section);
  });
}

function createActivityCard(activity, index, slot) {
  const card = document.createElement('div');
  card.className = 'activity-card';

  const info = document.createElement('div');
  info.className = 'activity-info';

  const title = document.createElement('h4');
  title.textContent = activity.title;
  info.appendChild(title);

  if (activity.description) {
    const description = document.createElement('p');
    description.textContent = activity.description;
    info.appendChild(description);
  }

  const meta = document.createElement('div');
  meta.className = 'activity-meta';
  if (activity.start_time || activity.end_time) {
    const time = document.createElement('span');
    const start = activity.start_time ? formatTime(activity.start_time) : '–';
    const end = activity.end_time ? formatTime(activity.end_time) : '–';
    time.textContent = `${start} → ${end}`;
    meta.appendChild(time);
  }

  if (activity.location) {
    const location = document.createElement('span');
    location.textContent = `📍 ${activity.location}`;
    meta.appendChild(location);
  }

  if (meta.childNodes.length) {
    info.appendChild(meta);
  }

  const actions = document.createElement('div');
  actions.className = 'activity-actions';

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', () => openActivityModal(slot, index));

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', () => deleteActivity(slot, index));

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  card.appendChild(info);
  card.appendChild(actions);

  return card;
}

function openActivityModal(slot, index) {
  const day = state.currentTrip.days[state.currentDayIndex];
  const activity = index != null ? day.activities.filter((item) => item.slot === slot)[index] : null;
  document.getElementById('activitySlot').value = slot;
  document.getElementById('activityDay').value = state.currentDayIndex;
  document.getElementById('activityIndex').value = index != null ? index : '';
  document.getElementById('activityModalTitle').textContent = index != null ? 'Edit Activity' : `Add ${slot} Activity`;
  document.getElementById('activityTitle').value = activity?.title || '';
  document.getElementById('activityDescription').value = activity?.description || '';
  document.getElementById('activityLocation').value = activity?.location || '';
  document.getElementById('activityStart').value = activity?.start_time || '';
  document.getElementById('activityEnd').value = activity?.end_time || '';
  toggleModal(selectors.activityModal, true);
}

function handleActivitySubmit(event) {
  event.preventDefault();
  if (!state.currentTrip) return;

  const slot = document.getElementById('activitySlot').value;
  const dayIndex = Number(document.getElementById('activityDay').value);
  const activityIndex = document.getElementById('activityIndex').value !== '' ? Number(document.getElementById('activityIndex').value) : null;

  const day = state.currentTrip.days[dayIndex];
  const activitiesForSlot = day.activities.filter((activity) => activity.slot === slot);
  const otherActivities = day.activities.filter((activity) => activity.slot !== slot);

  const newActivity = {
    title: document.getElementById('activityTitle').value.trim(),
    description: document.getElementById('activityDescription').value.trim(),
    location: document.getElementById('activityLocation').value.trim(),
    start_time: document.getElementById('activityStart').value,
    end_time: document.getElementById('activityEnd').value,
    slot
  };

  if (!newActivity.title) {
    showToast('Please add a title to keep things memorable.', true);
    return;
  }

  if (activityIndex != null) {
    activitiesForSlot[activityIndex] = newActivity;
  } else {
    activitiesForSlot.push(newActivity);
  }

  day.activities = [...otherActivities, ...activitiesForSlot];

  toggleModal(selectors.activityModal, false);
  renderDayContent();
  queueAutosave();
  showToast('Activity updated ✨');
}

function deleteActivity(slot, index) {
  const day = state.currentTrip.days[state.currentDayIndex];
  const activitiesForSlot = day.activities.filter((activity) => activity.slot === slot);
  if (!activitiesForSlot[index]) return;
  if (!confirm('Remove this activity?')) return;
  activitiesForSlot.splice(index, 1);
  const otherActivities = day.activities.filter((activity) => activity.slot !== slot);
  day.activities = [...otherActivities, ...activitiesForSlot];
  renderDayContent();
  queueAutosave();
  showToast('Activity removed');
}

function generateDays(start, end) {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  const days = [];
  let current = new Date(startDate.getTime());
  let dayNumber = 1;
  while (current <= endDate) {
    days.push({
      day_number: dayNumber,
      date: formatISODate(current),
      activities: []
    });
    current.setDate(current.getDate() + 1);
    dayNumber += 1;
  }
  return days;
}

function updateTripDates(newStart, newEnd) {
  if (parseDate(newEnd) < parseDate(newStart)) {
    showToast('End date must be after start date.', true);
    selectors.startDateInput.value = state.currentTrip.start_date;
    selectors.endDateInput.value = state.currentTrip.end_date;
    return;
  }

  const newDays = generateDays(newStart, newEnd);
  const currentDays = state.currentTrip.days;

  if (newDays.length < currentDays.length) {
    const confirmShrink = confirm(`Shorten trip to ${newDays.length} day${newDays.length === 1 ? '' : 's'}? Extra days will be removed.`);
    if (!confirmShrink) {
      selectors.startDateInput.value = state.currentTrip.start_date;
      selectors.endDateInput.value = state.currentTrip.end_date;
      return;
    }
    const remainingDates = new Set(newDays.map((day) => day.date));
    state.currentTrip.days = currentDays.filter((day) => remainingDates.has(day.date));
  } else {
    const existingMap = new Map(currentDays.map((day) => [day.date, day]));
    state.currentTrip.days = newDays.map((day) => existingMap.get(day.date) || day);
  }

  state.currentTrip.start_date = newStart;
  state.currentTrip.end_date = newEnd;
  state.currentTrip.days.forEach((day, index) => {
    day.day_number = index + 1;
  });

  if (state.currentDayIndex >= state.currentTrip.days.length) {
    state.currentDayIndex = state.currentTrip.days.length - 1;
  }

  renderTrip();
  showToast('Dates refreshed ✨');
  queueAutosave();
}

function saveCurrentTrip() {
  if (!state.currentTrip) return;
  const existingIndex = state.trips.findIndex((trip) => trip.trip_id === state.currentTrip.trip_id);
  const storedTrip = JSON.parse(JSON.stringify(state.currentTrip));
  if (existingIndex >= 0) {
    state.trips[existingIndex] = storedTrip;
  } else {
    state.trips.push(storedTrip);
  }
  localStorage.setItem(storageKeys.trips, JSON.stringify(state.trips));
  showToast('Trip saved to your travel shelf ✨');
  renderSavedTrips();
}

function renderSavedTrips() {
  selectors.savedTripsList.innerHTML = '';
  if (!state.trips.length) {
    const empty = document.createElement('p');
    empty.textContent = 'Your planned escapes will appear here.';
    empty.className = 'muted';
    selectors.savedTripsList.appendChild(empty);
    return;
  }

  state.trips.forEach((trip) => {
    const card = document.createElement('div');
    card.className = 'trip-card';
    card.innerHTML = `
      <h3>${trip.trip_name || `Trip to ${trip.destination}`}</h3>
      <p>${formatDateDisplay(trip.start_date)} → ${formatDateDisplay(trip.end_date)} · ${trip.destination}</p>
    `;
    card.addEventListener('click', () => loadTrip(trip.trip_id));
    selectors.savedTripsList.appendChild(card);
  });
}

function loadTrip(tripId) {
  const trip = state.trips.find((item) => item.trip_id === tripId);
  if (!trip) return;
  state.currentTrip = JSON.parse(JSON.stringify(trip));
  state.currentDayIndex = 0;
  state.currentView = 'list';
  selectors.viewToggle.querySelectorAll('button').forEach((btn) => btn.classList.toggle('active', btn.dataset.view === 'list'));
  selectors.toggleViewBtn.textContent = 'Map View';
  revealItinerary();
  renderTrip();
  showToast(`Loaded ${trip.trip_name}`);
}

function queueAutosave() {
  if (state.autosaveTimeout) {
    clearTimeout(state.autosaveTimeout);
  }
  state.autosaveTimeout = setTimeout(() => {
    persistDraft();
    showToast('Changes saved automatically');
  }, 1200);
}

function persistDraft() {
  if (!state.currentTrip) {
    localStorage.removeItem(storageKeys.draft);
    return;
  }
  const draft = JSON.parse(JSON.stringify({
    trip: state.currentTrip,
    currentDayIndex: state.currentDayIndex,
    currentView: state.currentView
  }));
  localStorage.setItem(storageKeys.draft, JSON.stringify(draft));
}

function hydrateDraft() {
  const draft = localStorage.getItem(storageKeys.draft);
  if (draft) {
    try {
      const parsed = JSON.parse(draft);
      state.currentTrip = parsed.trip;
      state.currentDayIndex = parsed.currentDayIndex || 0;
      state.currentView = parsed.currentView || 'list';
      if (state.currentTrip) {
        revealItinerary();
        renderTrip();
        selectors.viewToggle.querySelectorAll('button').forEach((btn) => btn.classList.toggle('active', btn.dataset.view === state.currentView));
        selectors.toggleViewBtn.textContent = state.currentView === 'list' ? 'Map View' : 'List View';
      }
    } catch (error) {
      console.error('Failed to load draft', error);
    }
  }
}

function loadTripsFromStorage() {
  const stored = localStorage.getItem(storageKeys.trips);
  if (stored) {
    try {
      state.trips = JSON.parse(stored);
    } catch (error) {
      console.error('Unable to parse saved trips', error);
      state.trips = [];
    }
  }
}

function showToast(message, isError = false) {
  selectors.toast.textContent = message;
  selectors.toast.classList.add('show');
  selectors.toast.style.background = isError ? 'rgba(239, 68, 68, 0.95)' : 'rgba(15, 23, 42, 0.85)';
  clearTimeout(selectors.toast._timeout);
  selectors.toast._timeout = setTimeout(() => {
    selectors.toast.classList.remove('show');
  }, 2200);
}

function formatDateDisplay(dateString) {
  const date = parseDate(dateString);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(time) {
  const [hour, minute] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hour, minute);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function parseDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

window.addEventListener('click', (event) => {
  const activeModal = [selectors.tripModal, selectors.activityModal].find((modal) => !modal.classList.contains('hidden'));
  if (activeModal && event.target === activeModal) {
    toggleModal(activeModal, false);
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    [selectors.tripModal, selectors.activityModal].forEach((modal) => toggleModal(modal, false));
  }
});
