const buildChartData = (data) => {
  let chartData = [];
  for (let date in data.cases) {
    let newDataPoint = {
      x: date,
      y: data.cases[date],
    };
    chartData.push(newDataPoint);
  }
  return chartData;
};

const buildChart = (chartData) => {
  var timeFormat = "MM/DD/YY";
  var ctx = document.getElementById("myChart").getContext("2d");
  var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: "line",

    // The data for our dataset
    data: {
      datasets: [
        {
          label: "Total Cases",
          backgroundColor: "rgba(204, 16, 52, 0.5)",
          borderColor: "#CC1034",
          data: chartData,
        },
      ],
    },

    // Configuration options go here
    options: {
      maintainAspectRatio: false,
      responsive: true,
      tooltips: {
        mode: "index",
        intersect: false,
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
            type: "time",
            time: {
              parser: timeFormat,
              tooltipFormat: "ll",
            },
          },
        ],
        yAxes: [
          {
            gridLines: {
              display: false,
            },
            ticks: {
              // Include a dollar sign in the ticks
              callback: function (value, index, values) {
                return numeral(value).format("0a");
              },
            },
          },
        ],
      },
    },
  });
};

const buildPieChart = (data) => {
  var ctx = document.getElementById("myPieChart").getContext("2d");
  var myPieChart = new Chart(ctx, {
    type: "pie",
    data: {
      datasets: [
        {
          data: [data.active, data.recovered, data.deaths],
          backgroundColor: ["#9d80fe", "#7dd71d", "#fb4443"],
        },
      ],

      // These labels appear in the legend and in the tooltips when hovering different arcs
      labels: ["Active", "Recovered", "Deaths"],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
};
