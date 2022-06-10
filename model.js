import { WAITING_TIME } from './config.js';

function wait(sec) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${sec} second`));
    }, sec * 1000);
  });
}

async function getJson(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (err) {
    throw err;
  }
}

//////////
// IMPORT

export async function getCityName(lat, lng) {
  try {
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=ef4225eddaea4a099558f6b50a53de2d`;
    const response = await Promise.race([wait(WAITING_TIME), getJson(url)]);
    return response.features[0].properties.city;
  } catch (err) {
    throw new Error('Cannot load city name');
  }
}

//////////
// MARKUPS

export function createMemoryMarkup(title, place, imgUrl, desc) {
  const memEl = document.createElement('div');
  memEl.classList.add('memory-el');
  memEl.innerHTML = `
  <header>
    <h2>${title || place}</h2>
    <h3>${title && place}</h3>
  </header>
  <img src="${imgUrl}" onerror="this.src='img/mapIcon.png';" class="img-small">
  <p class="memory-text">${desc}</p>
  `;
  return memEl;
}

export function createPopupAddMarkup(miniBtnHandler) {
  const cont = document.createElement('div');
  cont.className = 'popup';
  cont.innerHTML = `
  <form class="popup-form">
     <input id="title" class="form-el" type="text" placeholder="Title (optional)">
     <button id="btn-mini-add" class="btn">+</button>
     <input id="img-url" class="form-el" type="text" placeholder="Image url">
     <textarea id="text" class="form-el" maxlength="200" placeholder="Text (optional)"></textarea>
  </form>
  `;
  cont.querySelector('.btn').addEventListener('click', miniBtnHandler);

  return cont;
}

export function createPopupImage(imgUrl, handler) {
  const cont = document.createElement('div');
  cont.innerHTML = `<img src="${imgUrl}" onerror="this.src='img/mapIcon.png';" class="img-popup">`;
  cont.addEventListener('click', handler);
  return cont;
}
