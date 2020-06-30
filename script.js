let map;
let circles = [];
let circleColor = "#1d2c4d";

window.onload = () => {
  getCountryData();
  getHistoricalData();
  getGlobalData();
};

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 39.8283, lng: -98.5795 },
    zoom: 3,
    styles: mapStyle,
  });
}

const getGlobalData = () => {
  const FULL_URL = "https://corona.lmao.ninja/v2/all";

  const globalPromise = fetch(FULL_URL);

  globalPromise
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      showGlobalData(data);
      buildPieChart(data);
    })
    .catch((error) => {
      alert("Problem getting data from the API. Please try again later.");
    });
};

const showGlobalData = (globalData) => {
  document.getElementById("total-cases").innerText = `${numeral(
    globalData.cases
  ).format("0,0")}`;
  document.getElementById("active-cases").innerText = `${numeral(
    globalData.active
  ).format("0,0")}`;
  document.getElementById("total-recoveries").innerText = `${numeral(
    globalData.recovered
  ).format("0,0")}`;
  document.getElementById("total-deaths").innerText = `${numeral(
    globalData.deaths
  ).format("0,0")}`;
};

const getCountryData = (rad = "total") => {
  fetch("https://corona.lmao.ninja/v2/countries")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      showDataOnMap(data, rad);
      showDataInTable(data);
    });
};

const getHistoricalData = () => {
  fetch("https://corona.lmao.ninja/v2/historical/all?lastdays=120")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      buildChart(data);
    });
};

const openInfoWindow = () => {
  infoWindow.open(map);
};

function removeCircle() {
  for (let i = 0; i < circles.length; i++) {
    circles[i].setMap(null);
  }
}

const showDataOnMap = (data, rad) => {
  if (circles) {
    removeCircle();
  }
  data.map((country) => {
    let countryCenter = {
      lat: country.countryInfo.lat,
      lng: country.countryInfo.long,
    };

    function addCircle() {
      countryCircle.setMap(map);
    }

    let setRadius = () => {
      let radius = 0;
      if (rad === "total") {
        radius = country.cases;
        circleColor = "#1d2c4d";
      } else if (rad === "active") {
        radius = country.active;
        circleColor = "#9d80fe";
      } else if (rad === "recovered") {
        radius = country.recovered;
        circleColor = "#7dd71d";
      } else if (rad === "deaths") {
        radius = country.deaths;
        circleColor = "#fb4443";
      }
      return radius;
    };

    let countryCircle = new google.maps.Circle({
      strokeColor: circleColor,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: circleColor,
      fillOpacity: 0.35,
      center: countryCenter,
      radius: setRadius(),
    });
    circles.push(countryCircle);

    addCircle();

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
                    Total cases: ${numeral(country.cases).format("0,0")}
                </div>
                <div class="info-active">
                    Active cases: ${numeral(country.active).format("0,0")}
                </div>
                <div class="info-recovered">
                    Recovered: ${numeral(country.recovered).format("0,0")}
                </div>
                <div class="info-deaths">   
                    Deaths: ${numeral(country.deaths).format("0,0")}
                </div>
            </div>
        `;

    let infoWindow = new google.maps.InfoWindow({
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
  let dataSet = [];

  data.forEach((country) => {
    dataSet.push([
      country.country,
      numeral(country.cases).format("0,0"),
      numeral(country.recovered).format("0,0"),
      numeral(country.deaths).format("0,0"),
    ]);
  });

  $("#table").DataTable({
    retrieve: true,
    pageLength: 17,
    data: dataSet,
    columns: [
      { title: "Country Name" },
      { title: "Cases" },
      { title: "Recovered" },
      { title: "Deaths" },
    ],
  });
};

const makeActive = (elem) => {
  let cards = document.getElementsByClassName("card");

  for (let i = 0; i < cards.length; i++) {
    cards[i].classList.remove("active");
  }
  elem.classList.add("active");
};
