const buildPieChart = (data) => {
  var ctx = document.getElementById("pieChart").getContext("2d");

  let myChart = new Chart(ctx, {
    type: "pie",
    data: {
      datasets: [
        {
          data: [data.active, data.recovered, data.deaths],
          backgroundColor: ["#9d80fe", "#7dd71d", "#fb4443"],
        },
      ],

      // These labels appear in the legend and in the tooltips when hovering different arcs
      labels: ["Active Cases", "Recovered", "Deaths"],
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
  let totDeaths = Object.values(chartData.deaths);
  let totRecovered = Object.values(chartData.recovered);
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
          backgroundColor: "#1d2c4d66",
          borderColor: "#1d2c4d",
          data: [...totCases],
          fill: true,
          borderWidth: 1,
        },
        {
          label: "Recovered",
          backgroundColor: "#7dd71d66",
          borderColor: "#7dd71d",
          fill: true,
          data: [...totRecovered],
          borderWidth: 1,
        },
        {
          label: "Deaths",
          backgroundColor: "#fb444366",
          borderColor: "#fb4443",
          fill: true,
          data: [...totDeaths],
          borderWidth: 1,
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
