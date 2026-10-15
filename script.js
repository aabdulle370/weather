


const searchForm    = document.getElementById('searchForm');
const cityInput     = document.getElementById('cityInput');
const locateBtn     = document.getElementById('locateBtn');
const statusLine    = document.getElementById('statusLine');
const placeName     = document.getElementById('placeName');
const tempValue     = document.getElementById('tempValue');
const humidityValue = document.getElementById('humidityValue');
const windValue     = document.getElementById('windValue');
const alertList     = document.getElementById('alertList');

searchForm.addEventListener('submit', function (event) {
  event.preventDefault();                
  const city = cityInput.value.trim();   
  if (city === '') {
    setStatus('Please type a city name first.');
    return;
  }
  loadWeatherForCity(city);
});


locateBtn.addEventListener('click', function () {
  if (!navigator.geolocation) {
    setStatus('Your browser cannot find your location. Type a city instead.');
    return;
  }
  setStatus('Finding your location...');
  navigator.geolocation.getCurrentPosition(
    function (position) {
      loadWeatherForCoords(position.coords.latitude, position.coords.longitude, 'Your location');
    },
    function () {
      setStatus('Could not get your location. Type a city instead.');
    }
  );
});


function setStatus(message) {
  statusLine.textContent = message;
}

async function loadWeatherForCity(city) {
  setStatus('Looking up ' + city + '...');
  try {
    const geoUrl = 'https://geocoding-api.open-meteo.com/v1/search?name=' +
                   encodeURIComponent(city) + '&count=1&language=en&format=json';
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      setStatus('No place found called "' + city + '". Check the spelling.');
      return;
    }

    const place = geoData.results[0];
    const label = [place.name, place.admin1, place.country].filter(Boolean).join(', ');
    loadWeatherForCoords(place.latitude, place.longitude, label);
  } catch (error) {
    console.error(error);
    setStatus('Something went wrong. Please try again.');
  }
}

async function loadWeatherForCoords(lat, lon, label) {
  setStatus('Loading weather for ' + label + '...');
  try {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_gusts_10m_max',
      timezone: 'auto',
      forecast_days: '6'
    });
    const response = await fetch('https://api.open-meteo.com/v1/forecast?' + params.toString());
    const data = await response.json();

    showWeather(data, label);
    setStatus('Last updated ' + new Date().toLocaleTimeString());
  } catch (error) {
    console.error(error);
    setStatus('Something went wrong loading the weather. Please try again.');
  }
}

function checkAlerts(day) {
  const found = [];

  
  if (day.tempMax >= 38) {
    found.push({ level: 'severe', icon: '🥵', title: 'Extreme heat', type: 'HEAT',
      text: 'High of ' + Math.round(day.tempMax) + '°C. Serious risk of heatstroke. Limit time outdoors and drink water.' });
  } else if (day.tempMax >= 32) {
    found.push({ level: 'warning', icon: '🌡️', title: 'Heat warning', type: 'HEAT',
      text: 'High of ' + Math.round(day.tempMax) + '°C. Stay hydrated and avoid strenuous activity.' });
  }

  
  if (day.tempMin <= -25) {
    found.push({ level: 'severe', icon: '🥶', title: 'Extreme cold', type: 'COLD',
      text: 'Low of ' + Math.round(day.tempMin) + '°C. Frostbite can happen within minutes.' });
  } else if (day.tempMin <= -15) {
    found.push({ level: 'warning', icon: '❄️', title: 'Cold warning', type: 'COLD',
      text: 'Low of ' + Math.round(day.tempMin) + '°C. Dress in layers and limit time outside.' });
  }

  
  if ([95, 96, 99].includes(day.code)) {
    found.push({ level: 'severe', icon: '⛈️', title: 'Thunderstorm risk', type: 'THUNDERSTORM',
      text: 'Thunderstorms expected. Stay indoors during storms. Lightning may cause power outages.' });
  }

  
  if ([66, 67].includes(day.code)) {
    found.push({ level: 'severe', icon: '🧊', title: 'Ice storm risk', type: 'ICE',
      text: 'Freezing rain expected. Roads and walkways may be very icy.' });
  }

  
  if ([75, 86].includes(day.code)) {
    found.push({ level: 'warning', icon: '🌨️', title: 'Winter storm', type: 'SNOW',
      text: 'Heavy snow expected. Plan for slow and slippery travel.' });
  }

  
  if (day.rain >= 30) {
    found.push({ level: 'warning', icon: '🌊', title: 'Flood risk', type: 'FLOOD',
      text: Math.round(day.rain) + 'mm of rain expected. Watch for flooding on low roads.' });
  } else if (day.rain >= 15) {
    found.push({ level: 'watch', icon: '🌧️', title: 'Heavy rain watch', type: 'RAIN',
      text: Math.round(day.rain) + 'mm of rain expected. Roads may be slippery.' });
  }

  
  if (day.gust >= 80) {
    found.push({ level: 'severe', icon: '💨', title: 'Damaging wind', type: 'WIND',
      text: 'Gusts up to ' + Math.round(day.gust) + ' km/h. Branches may fall and power may go out.' });
  } else if (day.gust >= 60) {
    found.push({ level: 'warning', icon: '🌬️', title: 'Wind warning', type: 'WIND',
      text: 'Gusts up to ' + Math.round(day.gust) + ' km/h. Secure loose outdoor objects.' });
  }

  return found;
}


function backgroundFor(code) {
  if ([95, 96, 99].includes(code)) return 'bg-storm';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'bg-snow';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'bg-rain';
  if ([2, 3, 45, 48].includes(code)) return 'bg-cloudy';
  return 'bg-clear';
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const RANK = { severe: 0, warning: 1, watch: 2 };  

function showWeather(data, label) {
  const current = data.current;
  const daily = data.daily;


  placeName.textContent = label;
  tempValue.textContent = Math.round(current.temperature_2m) + '°C';
  humidityValue.textContent = Math.round(current.relative_humidity_2m) + '%';
  windValue.textContent = Math.round(current.wind_speed_10m) + ' km/h';

  // Beddel background-ka
  document.body.className = backgroundFor(current.weather_code);

  
  const allAlerts = [];
  daily.time.forEach(function (dateStr, i) {
    const date = new Date(dateStr + 'T00:00:00');
    const day = {
      code: daily.weather_code[i],
      tempMax: daily.temperature_2m_max[i],
      tempMin: daily.temperature_2m_min[i],
      rain: daily.precipitation_sum[i],
      gust: daily.wind_gusts_10m_max[i]
    };

    let dayLabel = WEEKDAYS[date.getDay()];
    if (i === 0) dayLabel = 'Today';
    if (i === 1) dayLabel = 'Tomorrow';

    checkAlerts(day).forEach(function (alert) {
      alert.when = dayLabel;
      alert.dayIndex = i;
      allAlerts.push(alert);
    });
  });

  
  allAlerts.sort(function (a, b) {
    if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
    return RANK[a.level] - RANK[b.level];
  });

  
  alertList.innerHTML = '';

  
  if (allAlerts.length === 0) {
    alertList.innerHTML =
      '<div class="allclear">' +
        '<div class="check-circle">✓</div>' +
        '<h3>All Clear</h3>' +
        '<p>No extreme weather alerts for the next 5 days. Enjoy the weather!</p>' +
      '</div>';
    return;
  }

  
  allAlerts.forEach(function (alert) {
    const card = document.createElement('div');
    card.className = 'alert ' + alert.level;
    card.innerHTML =
      '<div class="alert-top">' +
        '<div>' +
          '<div class="alert-title">' + alert.icon + ' ' + alert.title + '</div>' +
          '<div class="alert-place"></div>' +
        '</div>' +
        '<span class="when">' + alert.when + '</span>' +
      '</div>' +
      '<p class="alert-text">' + alert.text + '</p>' +
      '<div class="tags"><span class="tag">' + alert.type + '</span></div>';

  
    card.querySelector('.alert-place').textContent = label;
    alertList.appendChild(card);
  });
}