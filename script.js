// SCRIPT.JS 
// JavaScript 



const searchForm    = document.getElementById('searchForm');
const cityInput     = document.getElementById('cityInput');
const locateBtn     = document.getElementById('locateBtn');
const statusLine    = document.getElementById('statusLine');
const placeName     = document.getElementById('placeName');
const tempValue     = document.getElementById('tempValue');
const humidityValue = document.getElementById('humidityValue');
const windValue     = document.getElementById('windValue');
const alertList     = document.getElementById('alertList');
const tipsList      = document.getElementById('tipsList');



searchForm.addEventListener('submit', function (event) {
  event.preventDefault();                 
  const city = cityInput.value.trim();    

  if (city === '') {
    statusLine.textContent = 'Please type a city name first.';
    return;
  }

  getWeatherForCity(city);
});


locateBtn.addEventListener('click', function () {
  statusLine.textContent = 'Finding your location...';

  navigator.geolocation.getCurrentPosition(
    function (position) {
      
      getWeather(position.coords.latitude, position.coords.longitude, 'Your location');
    },
    function () {
    
      statusLine.textContent = 'Could not get your location. Type a city instead.';
    }
  );
});



async function getWeatherForCity(city) {
  statusLine.textContent = 'Looking up ' + city + '...';

  try {
    const url = 'https://geocoding-api.open-meteo.com/v1/search?name=' +
                encodeURIComponent(city) + '&count=1';
    const response = await fetch(url);
    const data = await response.json();

    if (!data.results) {
      statusLine.textContent = 'No place found. Check the spelling.';
      return;
    }

    const place = data.results[0];
    getWeather(place.latitude, place.longitude, place.name + ', ' + place.country);
  } catch (error) {
    statusLine.textContent = 'Something went wrong. Please try again.';
  }
}



async function getWeather(lat, lon, label) {
  statusLine.textContent = 'Loading weather...';

  try {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat +
                '&longitude=' + lon +
                '&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m' +
                '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_gusts_10m_max' +
                '&timezone=auto&forecast_days=6';
    const response = await fetch(url);
    const data = await response.json();

    showWeather(data, label);
    statusLine.textContent = 'Last updated ' + new Date().toLocaleTimeString();
  } catch (error) {
    statusLine.textContent = 'Something went wrong. Please try again.';
  }
}



function getAlerts(day) {
  const alerts = [];


  if (day.tempMax >= 32) {
    alerts.push({ level: 'warning', type: 'HEAT', title: 'Heat warning',
      text: 'High of ' + Math.round(day.tempMax) + '°C. Drink water and stay in the shade.' });
  }


  if (day.tempMin <= -15) {
    alerts.push({ level: 'warning', type: 'COLD', title: 'Cold warning',
      text: 'Low of ' + Math.round(day.tempMin) + '°C. Wear warm layers.' });
  }


  if (day.code >= 95) {
    alerts.push({ level: 'severe', type: 'THUNDERSTORM', title: 'Thunderstorm risk',
      text: 'Thunderstorms expected. Stay indoors during the storm.' });
  }


  if (day.code === 66 || day.code === 67) {
    alerts.push({ level: 'severe', type: 'ICE', title: 'Ice storm risk',
      text: 'Freezing rain expected. Roads may be very icy.' });
  }


  if (day.code === 75 || day.code === 86) {
    alerts.push({ level: 'warning', type: 'SNOW', title: 'Winter storm',
      text: 'Heavy snow expected. Travel may be slow and slippery.' });
  }


  if (day.rain >= 30) {
    alerts.push({ level: 'warning', type: 'FLOOD', title: 'Flood risk',
      text: Math.round(day.rain) + 'mm of rain expected. Watch for flooding.' });
  } else if (day.rain >= 15) {
    alerts.push({ level: 'watch', type: 'RAIN', title: 'Heavy rain watch',
      text: Math.round(day.rain) + 'mm of rain expected. Roads may be slippery.' });
  }


  if (day.gust >= 60) {
    alerts.push({ level: 'warning', type: 'WIND', title: 'Wind warning',
      text: 'Gusts up to ' + Math.round(day.gust) + ' km/h. Secure loose objects outside.' });
  }

  return alerts;
}



const TIPS = {
  THUNDERSTORM: ['⛈️ Stay indoors and keep away from windows.', '🔌 Avoid using electrical items.'],
  HEAT:         ['🥵 Drink plenty of water.', '🌳 Stay in the shade or indoors.'],
  COLD:         ['🧥 Wear warm layers, a hat, and gloves.', '⏱️ Limit the time you spend outside.'],
  ICE:          ['🧊 Avoid driving if you can.', '🥾 Wear shoes with good grip.'],
  SNOW:         ['🌨️ Drive slowly and allow extra time.', '🔦 Keep a flashlight at home.'],
  FLOOD:        ['🌊 Never drive through flooded roads.', '⬆️ Move away from low areas.'],
  RAIN:         ['🌧️ Drive slowly.', '☂️ Take an umbrella.'],
  WIND:         ['🌳 Stay away from trees and power lines.', '🪑 Tie down loose outdoor objects.']
};


const GENERAL_TIPS = [
  '📱 Check the weather forecast every day.',
  '🎒 Keep a small emergency kit at home: water, flashlight, first aid.'
];

function showTips(allAlerts) {
  tipsList.innerHTML = '';      


  let tipsToShow = [];
  for (let i = 0; i < allAlerts.length; i++) {
    const type = allAlerts[i].type;
    
    if (TIPS[type] && !tipsToShow.includes(TIPS[type][0])) {
      tipsToShow = tipsToShow.concat(TIPS[type]);
    }
  }

  
  if (tipsToShow.length === 0) {
    tipsToShow = GENERAL_TIPS;
  }


  for (let i = 0; i < tipsToShow.length; i++) {
    const li = document.createElement('li');
    li.textContent = tipsToShow[i];
    tipsList.appendChild(li);
  }
}


function getBackground(code) {
  if (code >= 95) return 'bg-storm';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'bg-snow';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'bg-rain';
  if (code === 2 || code === 3 || code === 45 || code === 48) return 'bg-cloudy';
  return 'bg-clear';
}


function showAlerts(allAlerts, label) {
  alertList.innerHTML = '';       


  if (allAlerts.length === 0) {
    alertList.innerHTML =
      '<div class="allclear">' +
        '<div class="check-circle">✓</div>' +
        '<h3>All Clear</h3>' +
        '<p>No extreme weather alerts coming. Enjoy the weather!</p>' +
      '</div>';
    return;
  }

  
  for (let i = 0; i < allAlerts.length; i++) {
    const item = allAlerts[i];

    const card = document.createElement('div');
    card.className = 'alert ' + item.level;
    card.innerHTML =
      '<div class="alert-top">' +
        '<div>' +
          '<div class="alert-title">' + item.title + '</div>' +
          '<div class="alert-place"></div>' +
        '</div>' +
        '<span class="when">' + item.when + '</span>' +
      '</div>' +
      '<p class="alert-text">' + item.text + '</p>' +
      '<div class="tags"><span class="tag">' + item.type + '</span></div>';

    
    card.querySelector('.alert-place').textContent = label;
    alertList.appendChild(card);
  }
}



function showWeather(data, label) {

  placeName.textContent = label;
  tempValue.textContent = Math.round(data.current.temperature_2m) + '°C';
  humidityValue.textContent = Math.round(data.current.relative_humidity_2m) + '%';
  windValue.textContent = Math.round(data.current.wind_speed_10m) + ' km/h';

  // Beddel background-ka
  document.body.className = getBackground(data.current.weather_code);


  const daily = data.daily;
  const allAlerts = [];

  for (let i = 0; i < daily.time.length; i++) {
    const day = {
      code: daily.weather_code[i],
      tempMax: daily.temperature_2m_max[i],
      tempMin: daily.temperature_2m_min[i],
      rain: daily.precipitation_sum[i],
      gust: daily.wind_gusts_10m_max[i]
    };

  
    let when = daily.time[i];
    if (i === 0) when = 'Today';
    if (i === 1) when = 'Tomorrow';

  
    const dayAlerts = getAlerts(day);
    for (let j = 0; j < dayAlerts.length; j++) {
      dayAlerts[j].when = when;
      allAlerts.push(dayAlerts[j]);
    }
  }

  showTips(allAlerts);
  showAlerts(allAlerts, label);
}