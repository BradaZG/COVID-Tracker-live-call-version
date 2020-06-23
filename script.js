let map;
let circles = [];

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

const buildPieChart = (data) => {
  var ctx = document.getElementById("pieChart").getContext("2d");

  let myChart = new Chart(ctx, {
    type: "pie",
    data: {
      datasets: [
        {
          data: [data.cases, data.active, data.recovered, data.deaths],
          backgroundColor: [
            "rgb(29, 44, 77)",
            "rgb(252, 60, 60)",
            "yellow",
            "rgb(0, 0, 255)",
          ],
        },
      ],

      // These labels appear in the legend and in the tooltips when hovering different arcs
      labels: ["Total Cases", "Active Cases", "Recovered", "Deaths"],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 1,
      legend: {
        onHover: function (e) {
          e.target.style.cursor = "pointer";
        },
      },
      tooltips: {
        mode: "index",
        intersect: true,
        callbacks: {
          label: function (tooltipItem, data) {
            let label = data.labels[tooltipItem.index] || "";
            let value =
              data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
            return label + ": " + numeral(value).format("0,0");
          },
        },
      },
    },
  });
};

const buildChart = (chartData) => {
  let totCases = Object.values(chartData.cases);
  let arrDates = Object.keys(chartData.cases);

  var timeFormat = "MM/DD/YY";
  var ctx = document.getElementById("myChart").getContext("2d");

  let myChart = new Chart(ctx, {
    // The type of chart we want to create
    type: "line",

    // The data for our dataset
    data: {
      labels: [...arrDates],
      datasets: [
        {
          label: "Total Cases",
          backgroundColor: "rgba(29, 44, 77, 0.8)",
          borderColor: "rgba(29, 44, 77, 0.9)",
          data: [...totCases],
          fill: true,
          borderWidth: 2,
        },
      ],
    },

    // Configuration options go here
    options: {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 2,
      title: {
        display: true,
        text: "Global Stats",
      },
      tooltips: {
        mode: "index",
        intersect: true,
        callbacks: {
          label: function (tooltipItem, data) {
            let label = data.datasets[tooltipItem.datasetIndex].label || "";
            let value =
              data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
            return label + ": " + numeral(value).format("0,0");
          },
        },
      },
      legend: {
        onHover: function (e) {
          e.target.style.cursor = "pointer";
        },
      },
      hover: {
        onHover: function (e) {
          let point = this.getElementAtEvent(e);
          if (point.length) e.target.style.cursor = "pointer";
          else e.target.style.cursor = "default";
        },
      },
      scales: {
        xAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Month",
            },
            type: "time",
            time: {
              parser: timeFormat,
              tooltipFormat: "ll",
            },
          },
        ],
        yAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Value",
            },
            ticks: {
              callback: function (value) {
                return numeral(value).format("0,0");
              },
            },
          },
        ],
      },
    },
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
      } else if (rad === "active") {
        radius = country.active;
      } else if (rad === "recovered") {
        radius = country.recovered;
      } else if (rad === "deaths") {
        radius = country.deaths;
      }
      return radius;
    };

    countryCircle = new google.maps.Circle({
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF0000",
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
