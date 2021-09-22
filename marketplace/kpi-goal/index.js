var deviceUUID;
var previewMode = false;
var widgetLevelQueryDevice = false;
var widgetLevelQueryTime = false;

var widgetConfig = {
  colorTheme: null,
  fontSize: 30,
  icon: "directions_walk",
  unit: "Steps",
  goal: 10000,
  innerRadius: 40,
  chartHeight: 500,
};

var sampleData = [[163434340, 6969]];

var vueInstance = new Vue({
  el: "#main",
  data: {
    widgetConfig: null,
    ranges: [],
    settings: null,
    dataPoints: null,
    deviceUUID: null,
    chart: null,
    label3: null,
    pieSeries2: null
  },
  watch: {
    dataPoints(newVal, oldVal) {
      var goal =
        this.settings.goal !== undefined
          ? this.settings.goal
          : this.widgetConfig.goal;
      var unit =
        this.settings.unit !== undefined
          ? this.settings.unit
          : this.widgetConfig.unit;
      if (newVal.length === 0) {
        this.label3.text = "No Data Available";
      } else {
        this.score = newVal[0][1];
        this.dataPoints = newVal;
        this.pieSeries2.data = [
          {
            category: "Progress",
            value: newVal[0][1],
          },
          {
            category: "Remaining until Goal",
            value: goal - newVal[0][1],
          },
        ];

        if (newVal[0][0] === 0) {
          this.label3.text = "No Data Available";
        } else {
          this.label3.text = newVal[0][1] + " " + unit;
        }
      }
    },
  },
  mounted() {
    this.$on("update", function (settings) {
      this.settings = settings;
      this.widgetConfig = widgetConfig;
      if (settings.deviceId !== null || settings.metrics !== null) {
        if (
          settings.timerange &&
          settings.metric &&
          settings.deviceid !== null
        ) {
          this.getData(this.settings);
        } else {
          this.dataPoints = [[0, 0]];
        }
      } else {
        previewMode = true;
      }

      this.renderChart();
    });

    this.$on("updateData", function (timerange) {
      console.log(timerange);
      this.getNewData(timerange);
    });
  },

  methods: {
    renderChart() {
      var self = this;
      am4core.ready(function () {
        var theme =
          self.settings.theme !== undefined
            ? self.settings.theme
            : "am4themes_animated";

        // Themes begin
        am4core.useTheme(window[theme]);
        am4core.addLicense("ch-custom-attribution");
        // Themes end

        // Create chart instance
        var chart = am4core.create("chartdiv", am4charts.PieChart);

        // Let's cut a hole in our Pie chart
        chart.innerRadius = am4core.percent(
          self.settings.innerRadius !== undefined
            ? self.settings.innerRadius
            : self.widgetConfig.innerRadius
        );

        chart.resizable = true;
        var chartHeight =
          self.settings.chartHeight !== undefined
            ? self.settings.chartHeight
            : self.widgetConfig.chartHeight;
        chart.svgContainer.htmlElement.style.height =
          String(chartHeight) + "px";
        var goal =
          self.settings.goal !== undefined
            ? self.settings.goal
            : self.widgetConfig.goal;
        var unit =
          self.settings.unit !== undefined
            ? self.settings.unit
            : self.widgetConfig.unit;
        var icon =
          self.settings.icon !== undefined
            ? self.settings.icon
            : self.widgetConfig.icon;
        var fontsize =
          self.settings.fontsize !== undefined
            ? self.settings.fontsize
            : self.widgetConfig.fontsize;

        if (icon !== "None") {
          var label = chart.seriesContainer.createChild(am4core.Label);
          label.html = `<i class=\"material-icons\">${icon}</i>`;
          label.horizontalCenter = "middle";
          label.verticalCenter = "bottom";
          label.fontSize = fontsize;
        }

        var label2 = chart.seriesContainer.createChild(am4core.Label);
        label2.text = "Goal: " + String(goal) + " " + unit;
        label2.horizontalCenter = "middle";
        label2.verticalCenter = "top";
        label2.fontSize = fontsize;

        var label3 = chart.createChild(am4core.Label);
        label3.text =
          (self.dataPoints ? self.dataPoints[0][1] : 6969) + " " + unit;
        label3.fontSize = fontsize;
        label3.align = "center";

        // Add and configure Series
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "value";
        pieSeries.dataFields.category = "category";
        pieSeries.slices.template.stroke = am4core.color("#fff");
        pieSeries.innerRadius = 10;
        pieSeries.slices.template.fillOpacity = 0.5;

        pieSeries.slices.template.propertyFields.disabled = "labelDisabled";
        pieSeries.labels.template.propertyFields.disabled = "labelDisabled";
        pieSeries.ticks.template.propertyFields.disabled = "labelDisabled";
        pieSeries.ticks.template.disabled = true;
        pieSeries.labels.template.disabled = true;

        // Add data
        pieSeries.data = [
          {
            category: "Goal",
            value: goal,
          },
        ];

        // Disable sliding out of slices
        pieSeries.slices.template.states.getKey(
          "hover"
        ).properties.shiftRadius = 0;
        pieSeries.slices.template.states.getKey("hover").properties.scale = 1;

        // Add second series
        var pieSeries2 = chart.series.push(new am4charts.PieSeries());
        pieSeries2.dataFields.value = "value";
        pieSeries2.dataFields.category = "category";
        pieSeries2.slices.template.states.getKey(
          "hover"
        ).properties.shiftRadius = 0;
        pieSeries2.slices.template.states.getKey("hover").properties.scale = 1;
        pieSeries2.slices.template.propertyFields.fill = "fill";
        pieSeries2.labels.template.text = "{category}: {value} " + unit;
        pieSeries2.labels.template.fontSize = fontsize * 0.6;

        if (previewMode === true) {
          // Add data
          pieSeries2.data = [
            {
              category: "Progress",
              value: 6969,
            },
            {
              category: "Remaining until Goal",
              value: goal - 6969,
            },
          ];
        }

        pieSeries.adapter.add("innerRadius", function (innerRadius, target) {
          return am4core.percent(40);
        });

        pieSeries2.adapter.add("innerRadius", function (innerRadius, target) {
          return am4core.percent(60);
        });

        pieSeries.adapter.add("radius", function (innerRadius, target) {
          return am4core.percent(100);
        });

        pieSeries2.adapter.add("radius", function (innerRadius, target) {
          return am4core.percent(80);
        });

        self.pieSeries2 = pieSeries2;
        self.label3 = label3;
        self.chart = chart;
      }); // end am4core.ready()
    },

    getData(settings) {
      var query = {
        metrics: [
          {
            name: settings.metric,
            limit: 1,
            order: "desc",
            tags: { UUID: deviceUUID },
          },
        ],
        start_absolute: settings.timerange.startTime,
        end_absolute: settings.timerange.endTime,
      };
      return fetch("/api/v2/timeseriesData", {
        method: "POST",
        processData: true,
        body: JSON.stringify(query),
        headers: {
          "Content-type": "application/json",
        },
      })
        .then(function (response) {
          return response.json();
        })
        .then((res) => {
          this.dataPoints = res.queries[0].results[0].values;
          console.log(this.dataPoints);
        });
    },
    getNewData(timerange) {
      var query = {
        metrics: [
          {
            name: this.settings.metric,
            limit: 1,
            order: "desc",
            tags: { UUID: deviceUUID },
          },
        ],
        start_absolute: timerange.startTime,
        end_absolute: timerange.endTime,
      };
      return fetch("/api/v2/timeseriesData", {
        method: "POST",
        processData: true,
        body: JSON.stringify(query),
        headers: {
          "Content-type": "application/json",
        },
      })
        .then(function (response) {
          return response.json();
        })
        .then((res) => {
          this.dataPoints = res.queries[0].results[0].values;
          console.log(this.dataPoints);
        });
    },
  },
});

function connecthingWidgetInit(context) {
  context.filters.subscribe(handleFilterChange);

  widgetUtils.loadWidgetSettings(function (err, widgetConfigData) {
    if (err === undefined || err === null) {
      if (widgetConfigData !== undefined) {
        if (widgetConfigData.deviceId != null) {
          widgetLevelQueryDevice = true;
          if (widgetConfigData.timerange != null) {
            widgetLevelQueryTime = true;
          } else {
            widgetLevelQueryTime = false;
            widgetConfigData.timerange = {
              startTime: moment().subtract(24, "hours").valueOf(),
              endTime: moment().valueOf(),
            }
          }
          updateDeviceById(widgetConfigData.deviceId, function (err, data) {
            deviceUUID = data;
            vueInstance.$emit("update", widgetConfigData);
          });
        } else {
          widgetLevelQueryDevice = false;
          widgetLevelQueryTime = false;
          vueInstance.$emit("update", widgetConfigData);
        }
      }
    }
  });
}

function handleFilterChange(filters) {
  previewMode = false;

  if (filters) {
    if (!widgetLevelQueryDevice && filters.tags) {
      updateDeviceById(filters.tags.deviceId[0], function (err, data) {
        deviceUUID = data;
        vueInstance.$emit("updateData", filters.timerange);
      });
    } else if (!widgetLevelQueryTime && widgetLevelQueryDevice) {
      vueInstance.$emit("updateData", filters.timerange);
    }
  }
}

function updateDeviceById(id, callback) {
  $.ajax("/api/v1/devices/" + id, {
    cache: false,
    context: this,
    dataType: "json",
    method: "GET",
    processData: true,
    contentType: "application/json",
    error: function (xhr, status, err) {
      console.log("Error getting connecthingGetDevicesFromServer", err);
    },
    success: function (data, status, xhr) {
      console.log("Got list of devices from server:", data);
      if (data && data.records) {
        if (callback) {
          callback(null, data.records[0].UUID);
        }
      }
    },
  });
}

checkPreviewMode();

function checkPreviewMode() {
  const queryString = window.location.href;

  if (
    queryString === "https://davra.github.io/marketplace/kpi-goal/index.html"
  ) {
    previewMode = true;
    vueInstance.$emit("update", {
      deviceId: null,
      metrics: null,
      timerange: null,
    });
  }
}
