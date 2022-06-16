import * as model from './model.js';
import { Memory } from './memoryClass.js';
import { data } from './data.js';
import { MESSAGE_TIME, INTERVAL_PERIOD } from './config.js';

let map;
let curMarker;
let curMemoryEl;
let cityName;

let popupAddMemory;
let btnMini;
const allMemories = [];

const placeLabel = document.querySelector('#place');
const btnAdd = document.querySelector('#btn-add');
const memoriesCont = document.querySelector('#memories-container');
const allMarkersCheckbox = document.querySelector('#show-all-checkbox');
const pictureContainer = document.querySelector('.picture-container');
const msg = document.querySelector('.msg');

///////////////
//// Init

function initMap() {
  // Load map
  map = L.map('map').setView([52.1387988, 4.6790481], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Click map
  map.on('click', function (e) {
    const { lat, lng } = e.latlng;

    // Toggle marker
    primalState();
    addMarker(lat, lng);
  });

  // Key events
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      primalState();
      map.closePopup();
      activateMemoryEl();
    }
    if (e.key === 'Delete' && curMemoryEl) {
      const i = curMemoryIndex();
      allMemories[i].marker.remove(map);
      allMemories.splice(i, 1);
      curMemoryEl.remove();
      curMemoryEl = '';
    }
  });
}

function initMemoriesHandler() {
  memoriesCont.addEventListener('click', function (e) {
    const memElJQ = $(e.target).closest('.memory-el');
    if (memElJQ.length === 0) return;
    activateMemoryEl(memElJQ);
  });
}

function initMemoriesAdd() {
  popupAddMemory = model.createPopupAddMarkup(addMemoryHandler);
  btnMini = popupAddMemory.querySelector('#btn-mini-add');

  btnAdd.addEventListener('click', function () {
    const popup = L.popup().setContent(popupAddMemory);
    curMarker.bindPopup(popup).openPopup();
  });
}

function initShowAll() {
  allMarkersCheckbox.checked = true;

  allMarkersCheckbox.addEventListener('change', function () {
    if (!allMarkersCheckbox.checked) {
      allMemories.forEach((el) => el.marker.remove());
      activateMemoryEl();
    }
    if (allMarkersCheckbox.checked) {
      allMemories.forEach((el) => {
        el.marker.addTo(map);
        el.marker._icon.classList.add('marker-added');
      });
    }
  });
}

function initPictureContainer() {
  pictureContainer.addEventListener('click', function (e) {
    e.preventDefault();
    pictureContainer.classList.add('hidden');
  });
}

///////////////
//// Functions

// Primal state --->

function primalState() {
  resetMarkerState();
  resetMemoriesContainerState();
  pictureContainer.classList.add('hidden');
}

function resetMarkerState() {
  if (curMarker) curMarker.remove(map);
  btnAdd.disabled = true;
  btnMini.classList.remove('btn-active');
  popupAddMemory.querySelector('.popup-form').reset();
  placeLabel.textContent = '';
}

function resetMemoriesContainerState() {
  if (curMemoryEl) {
    curMemoryEl.classList.remove('active');
    curMemoryEl = '';
  }
  activateMemoryEl();
}

// Marker --->

async function addMarker(lat, lng) {
  try {
    // Add marker to map
    curMarker = L.marker([lat, lng]).addTo(map);
    // Manage activation of buttons
    btnAdd.disabled = false;
    btnMini.classList.add('btn-active');
    // Manage place name
    cityName = await model.getCityName(lat, lng);
    if (cityName.length > 21) cityName = cityName.slice(0, 19) + '...';
    placeLabel.textContent = cityName;
  } catch (err) {
    showMessage(err.message);
  }
}

function onlyOneMarkerHandler(curMemoryEl) {
  if (!allMarkersCheckbox.checked) {
    allMemories.forEach((el) => {
      el.marker.remove();
      if (el.memoryEl === curMemoryEl) el.marker.addTo(map);
    });
  }
}

// Memory Element --->

function activateMemoryEl(memElJQ = [false]) {
  curMemoryEl = memElJQ[0];

  for (let i = 0; i < allMemories.length; i++) {
    allMemories[i].memoryEl.classList.remove('active');
    if (allMemories[i].memoryEl === curMemoryEl) continue;
    $(allMemories[i].memoryEl).children('p').slideUp(500);
  }
  onlyOneMarkerHandler(curMemoryEl);

  if (!curMemoryEl) return;

  curMemoryEl.classList.add('active');
  allMemories[curMemoryIndex()].marker.openPopup();
  resetMarkerState();
  curMemoryEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

  if (!memElJQ.children('p').text()) return;
  memElJQ.children('p').slideToggle(500);
}

// Manage memories --->

function addMemoryHandler(e) {
  e.preventDefault();
  const [title, imgUrl, text] = [...document.querySelectorAll('.form-el')].map(
    (el) => el.value
  );
  addMemory(title, imgUrl, text);
}

function addMemory(title, imgUrl, text) {
  // Create markup for memories container
  const newMemEl = model.createMemoryMarkup(title, cityName, imgUrl, text);
  // Create Memory object
  allMemories.push(
    new Memory(title, cityName, imgUrl, text, newMemEl, curMarker)
  );
  // Handle marker and popup
  curMarker
    .bindPopup(model.createPopupImage(imgUrl, showImageHandler))
    .openPopup();
  curMarker.on('click', function () {
    allMemories.forEach((el) => {
      if (el.marker === this) activateMemoryEl($(el.memoryEl));
    });
  });

  curMarker._icon.classList.add('marker-added');
  curMarker = '';
  memoriesCont.prepend(newMemEl);
  primalState();
}

function curMemoryIndex() {
  return allMemories.findIndex((mem) => mem.memoryEl === curMemoryEl);
}

// Show image --->

function showImageHandler() {
  pictureContainer.classList.remove('hidden');
  pictureContainer.children[0].src = this.children[0].src;
}

// Show message --->

function showMessage(text) {
  msg.textContent = text;
  msg.classList.remove('hidden');
  setTimeout(() => {
    msg.classList.add('hidden');
  }, MESSAGE_TIME * 1000);
}

function firstMessages(...msgs) {
  let i = 0;

  showMessage(msgs[i]);
  i++;
  if (i === msgs.length) return;

  const int = setInterval(function () {
    showMessage(msgs[i]);
    i++;
    if (i === msgs.length) clearInterval(int);
  }, INTERVAL_PERIOD * 1000);
}

// Load data --->

function load() {
  data.forEach((el) => {
    const marker = L.marker(el.coords).addTo(map);
    curMarker = marker;
    cityName = el.cityName;
    addMemory(el.title, el.imageURL, el.text);
  });
  map.closePopup();
}

/////////////
//// Run

initMap();
initMemoriesHandler();
initMemoriesAdd();
initShowAll();
initPictureContainer();
primalState();

load();
firstMessages(
  'Exemple memories were added as the quick presentation',
  'Choose memory: from the list or click on the marker',
  'Mark the Memory and click "Del" button to remove it',
  'Click on the picture to get a bigger view',
  'Quit picture: click on the image or double "Escape"'
);
