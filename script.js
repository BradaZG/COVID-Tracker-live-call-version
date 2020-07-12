window.onload = () => {
  getCountriesData();
  getHistoricalData();
  getWorldCoronaData();
};

// load a locale
numeral.register("locale", "us", {
  delimiters: {
    thousands: ",",
    decimal: ".",
  },
  abbreviations: {
    thousand: "K",
    million: "M",
    billion: "B",
    trillion: "T",
  },
});

// switch between locales
numeral.locale("us");

let map;
let infoWindow;
let coronaGlobalData;
let mapCircles = [];

const wordwideSelection = {
  name: "Worldwide",
  value: "www",
  selected: true,
};

let casesTypeColors = {
  cases: "#cc1034",
  active: "#9d80fe",
  recovered: "#7fd922",
  deaths: "#fa5575",
};

const mapCenter = { lat: 39.8283, lng: -98.5795 };

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: mapCenter,
    zoom: 3,
    styles: mapStyle,
  });
  infoWindow = new google.maps.InfoWindow();
}

let options = { year: "numeric", month: "long", day: "numeric" };
let year = new Date().getFullYear();
document.getElementById("year").innerText = year;
document.getElementById(
  "updated-date"
).innerText = new Date().toLocaleDateString("en-US", options);
document.getElementById("map-title").innerText = "Coronavirus Cases";

const changeDataSelection = (casesType = "cases") => {
  clearTheMap();
  makeActive(casesType);
  showDataOnMap(coronaGlobalData, casesType);
  if (casesType === "cases") {
    document.getElementById("map-title").innerText = "Coronavirus Cases";
  } else if (casesType === "recovered") {
    document.getElementById("map-title").innerText = "Recovered";
  } else {
    document.getElementById("map-title").innerText = "Deaths";
  }
};

const clearTheMap = () => {
  for (let circle of mapCircles) {
    circle.setMap(null);
  }
};

const setMapCenter = (lat, long, zoom) => {
  map.setZoom(zoom);
  map.panTo({
    lat: lat,
    lng: long,
  });
};

const initDropdown = (searchList) => {
  $(".ui.dropdown").dropdown({
    values: searchList,
    onChange: function (value, text) {
      if (value !== wordwideSelection.value) {
        getCountryData(value);
      } else {
        getWorldCoronaData();
      }
    },
  });
};

const setSearchList = (data) => {
  let searchList = [];
  searchList.push(wordwideSelection);
  data.forEach((countryData) => {
    searchList.push({
      name: countryData.country,
      value: countryData.countryInfo.iso3,
    });
  });
  initDropdown(searchList);
};

const getCountriesData = () => {
  fetch("https://corona.lmao.ninja/v2/countries")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      coronaGlobalData = data;
      setSearchList(data);
      showDataOnMap(data);
      showDataInTable(data);
    });
};

const getCountryData = (countryIso) => {
  const url = "https://disease.sh/v3/covid-19/countries/" + countryIso;
  fetch(url)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      setMapCenter(data.countryInfo.lat, data.countryInfo.long, 3);
      setStatsData(data);
    });
};

const getWorldCoronaData = () => {
  fetch("https://disease.sh/v2/all")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      setStatsData(data);
      setMapCenter(mapCenter.lat, mapCenter.lng, 2);
    });
};

const setStatsData = (data) => {
  let addedCases = numeral(data.todayCases).format("+0,0");
  let addedRecovered = numeral(data.todayRecovered).format("+0,0");
  let addedDeaths = numeral(data.todayDeaths).format("+0,0");
  let totalCases = numeral(data.cases).format("0.0a");
  let totalRecovered = numeral(data.recovered).format("0.0a");
  let totalDeaths = numeral(data.deaths).format("0.0a");
  document.querySelector(".total-number").innerHTML = addedCases;
  document.querySelector(".recovered-number").innerHTML = addedRecovered;
  document.querySelector(".deaths-number").innerHTML = addedDeaths;
  document.querySelector(".cases-total").innerHTML = `${totalCases} Total`;
  document.querySelector(
    ".recovered-total"
  ).innerHTML = `${totalRecovered} Total`;
  document.querySelector(".deaths-total").innerHTML = `${totalDeaths} Total`;
};

const getHistoricalData = () => {
  fetch("https://corona.lmao.ninja/v2/historical/all?lastdays=120")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      let chartData = buildChartData(data);
      buildChart(chartData);
    });
};

const openInfoWindow = () => {
  infoWindow.open(map);
};

const showDataOnMap = (data, casesType = "cases") => {
  data.map((country) => {
    let countryCenter = {
      lat: country.countryInfo.lat,
      lng: country.countryInfo.long,
    };

    var countryCircle = new google.maps.Circle({
      strokeColor: casesTypeColors[casesType],
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: casesTypeColors[casesType],
      fillOpacity: 0.35,
      map: map,
      center: countryCenter,
      radius: country[casesType],
    });

    mapCircles.push(countryCircle);

    var html = `
            <div class="info-container">
                <div class="info-flag" style="background-image: url(${
                  country.countryInfo.flag
                });">
                </div>
                <div class="info-name">
                    ${country.country}
                </div>
                <div class="info-confirmed">
                    Total: ${numeral(country.cases).format("0,0")}
                </div>
                <div class="info-recovered">
                    Recovered: ${numeral(country.recovered).format("0,0")}
                </div>
                <div class="info-deaths">   
                    Deaths: ${numeral(country.deaths).format("0,0")}
                </div>
            </div>
        `;

    var infoWindow = new google.maps.InfoWindow({
      content: html,
      position: countryCircle.center,
    });
    google.maps.event.addListener(countryCircle, "mouseover", function () {
      infoWindow.open(map);
    });

    google.maps.event.addListener(countryCircle, "mouseout", function () {
      infoWindow.close();
    });
  });
};

const showDataInTable = (data) => {
  var html = "";
  data.forEach((country) => {
    html += `
        <tr>
            <td>${country.country}</td>
            <td>${numeral(country.cases).format("0,0")}</td>
        </tr>
        `;
  });
  document.getElementById("table-data").innerHTML = html;
};

const makeActive = (elem) => {
  let cards = document.getElementsByClassName("card");

  for (let i = 0; i < cards.length; i++) {
    cards[i].classList.remove("active");
  }

  document.querySelector(`.${elem}`).classList.add("active");
};
