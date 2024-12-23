const navLinks = Array.from(document.querySelectorAll(".nav-item"));
const btnFind = document.querySelector("#btnFind");
const findInput = document.querySelector("#findInput");
const forecast = document.querySelector("#forecast");

// API
const APIKey = "cd2505f62c394b8093d230305241112";
const baseURL = "https://api.weatherapi.com/v1/forecast.json";

let searchLocation = "";
let weatherList = {};
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

getCity();

function toggleCssClass(el, className, condition) {
  condition ? el.classList.add(className) : el.classList.remove(className);
}

function handleDay(dateS) {
  let d = new Date(dateS);
  let dayName = days[d.getDay()];
  return dayName;
}
function handleMonth(dateS) {
  let d = new Date(dateS);
  let monthName = monthNames[d.getMonth()];
  return monthName;
}

function normalizeCityName(cityName) {
  return cityName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getCity() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        try {
          let response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          let data = await response.json();
          data.city ? (searchLocation = normalizeCityName(data.city)) : (searchLocation = "Cairo");
          displayWeather();
        } catch (err) {
          console.log("Error ", err);
          searchLocation = "Cairo";
          displayWeather();
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
        } else {
          console.log("Error getting user location:", error.message);
        }
        searchLocation = "Cairo";
        displayWeather();
      }
    );
  } else {
    searchLocation = "Cairo";
    displayWeather();
  }
}

function handleActiveNavLink(linksArr, link) {
  linksArr.forEach((l) => toggleCssClass(l, "active", false));
  toggleCssClass(link, "active", true);
}

async function getWeather(searchLocation) {
  try {
    let response = await fetch(`${baseURL}?key=${APIKey}&q=${searchLocation}&days=3`);
    if (response.ok && response.status === 200) {
      return await response.json();
    }
  } catch (e) {
    console.log("An error occurred:", e);
  }
}

async function displayWeather() {
  weatherList = await getWeather(searchLocation);
  if (!weatherList) {
    return;
  }
  let currentObj = weatherList.current;
  let locationObj = weatherList.location;
  let forecastArr = weatherList.forecast.forecastday;
  let weatherContainer = `
       <!--^ today -->
      <div class="col-lg-4">
          <div class=" forecast today rounded  rounded-3">
              <div id="today" class="forecast-header px-3  d-flex justify-content-between">
                  <div class="day fw-semibold">${handleDay(locationObj.localtime)}</div>
                  <div class="date text-light">${new Date(locationObj.localtime.split(" ")[0]).getDay()} ${handleMonth(locationObj.localtime.split(" ")[0])}</div>
                  </div>
                  <div id="current" class="forecast-content  px-3">
                  <div class="location fs-4">${locationObj.country},${locationObj.name}</div>
                  <div class="time me-auto">update: ${locationObj.localtime.split(" ")[1]}</div>
                  <div class="degree d-flex justify-content-between mt-2">
                      <div class="num">${currentObj.temp_c}<sup>o</sup>C</div>
                      <div class="forecast-icon align-self-end">
                          <img src=${currentObj.condition.icon} alt="" width="90">
                      </div>
                  </div>
                  <p class="custom fs-5">${currentObj.condition.text}</p>
                  <div class=" mt-4 d-flex justify-content-between">
                      <span class="fs-5"><img class="me-2" src="./img/icon-umberella.png"
                              alt="">${currentObj.wind_degree}%</span>
                      <span class="fs-5"><img class="me-2" src="./img/icon-wind.png"
                              alt="">${currentObj.wind_kph}km/h</span>
                      <span class="fs-5"><img class="me-2" src="./img/icon-compass.png"
                              alt="">${currentObj.wind_dir}</span>
                  </div>
              </div>
          </div>
      </div>
      <!--^ tomorrow -->
      <div id="tomorrow" class="col-lg-4 mt-3 mt-lg-0">
          <div class="text-center h-100 rounded-2 forecast tomorrow">
              <div class="forecast-header fw-semibold px-3">
                  <div class="day">${handleDay(forecastArr[1].date)}</div>
              </div>
              <div class="forecast-content px-3">
                  <div class="forecast-icon">
                      <img src=${forecastArr[1].day.condition.icon} alt="weather icon"
                          width="90">
                  </div>
                  <div class="degree fs-2">${forecastArr[1].day.maxtemp_c}<sup>o</sup>C</div>
                  <p class="fs-5 mb-0">${forecastArr[1].day.mintemp_c}<sup>o</sup></p>
                  <p class="custom fs-5">${forecastArr[1].day.condition.text}</p>
              </div>
          </div>
      </div>
      <!--^ afterTomorrow -->
      <div id="afterTomorrow" class="col-lg-4 mt-3 mt-lg-0">
          <div class="text-center h-100 rounded-2 forecast">
              <div class="forecast-header fw-semibold px-3">
                  <div class="day">${handleDay(forecastArr[2].date)}</div>
              </div>
              <div class="forecast-content px-3">
                  <div class="forecast-icon">
                      <img src=${forecastArr[1].day.condition.icon} alt="weather icon"
                          width="90">
                  </div>
                  <div class="degree fs-2">${forecastArr[2].day.maxtemp_c}<sup>o</sup>C</div>
                  <p class="fs-5 mb-0">${forecastArr[2].day.mintemp_c}<sup>o</sup></p>
                  <p class="custom fs-5">${forecastArr[2].day.condition.text}</p>
              </div>
          </div>
      </div>
  `;
  forecast.innerHTML = weatherContainer;
}

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    handlingActiveNavLink(navLinks, e.target.parentNode);
  });
});

btnFind.addEventListener("click", (e) => {
  e.preventDefault();
  if (findInput.value) {
    searchLocation = findInput.value;
    displayWeather();
  }
});
findInput.addEventListener("keyup", (e) => {
  e.preventDefault();
  if (findInput.value) {
    searchLocation = findInput.value;
    displayWeather();
  }
});
