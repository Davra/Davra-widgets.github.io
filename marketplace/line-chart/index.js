var deviceUUID;
var previewMode = false;
var widgetLevelQueryDevice = false;
var widgetLevelQueryTime = false;

var widgetConfig = {
  theme: undefined,
  fontSize: 30,
  chartHeight: 500,
};

var vueInstance = new Vue({
  el: "#main",
  data: {
    widgetConfig: null,
    settings: null,
    dataPoints: null,
    deviceUUID: null,
    chart: null,
    chartData: [],
    label: null,
  },
  watch: {
    dataPoints(newVal, oldVal) {
      if (newVal.length === 0) {
        this.chart.data = [];
        this.label.text = "No Data Available";
      } else if (newVal !== oldVal) {
        this.chartData = [];
        var value = 0;
        var previousValue;

        for (const point in newVal) {
          value = newVal[point][1];

          if (point > 0) {
            // add color to previous data item depending on whether current value is less or more than previous value
            if (previousValue <= value) {
              this.chartData[point - 1].color = this.chart.colors.getIndex(0);
            } else {
              this.chartData[point - 1].color = this.chart.colors.getIndex(5);
            }
          }

          this.chartData.push({
            date: new Date(newVal[point][0]),
            value: value,
          });
          previousValue = value;
        }
        this.label.text = "";
        this.chart.data = this.chartData;
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
        var chart = am4core.create("chartdiv", am4charts.XYChart);
        chart.paddingRight = 20;

        chart.resizable = true;
        var chartHeight =
          self.settings.chartHeight !== undefined
            ? self.settings.chartHeight
            : self.widgetConfig.chartHeight;
        chart.svgContainer.htmlElement.style.height =
          String(chartHeight) + "px";

        var fontsize =
          self.settings.fontsize !== undefined
            ? self.settings.fontsize
            : self.widgetConfig.fontsize;

        if (previewMode === true) {
          var data = [];
          var visits = 10;
          var previousValue;

          for (var i = 0; i < 100; i++) {
            visits += Math.round(
              (Math.random() < 0.5 ? 1 : -1) * Math.random() * 10
            );

            if (i > 0) {
              // add color to previous data item depending on whether current value is less or more than previous value
              if (previousValue <= visits) {
                data[i - 1].color = chart.colors.getIndex(0);
              } else {
                data[i - 1].color = chart.colors.getIndex(5);
              }
            }

            data.push({ date: new Date(2021, 0, i + 1), value: visits });
            previousValue = visits;
          }

          chart.data = data;
        } else {
          chart.data = self.chartData;
        }

        var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.grid.template.location = 0;
        dateAxis.renderer.axisFills.template.disabled = true;
        dateAxis.renderer.ticks.template.disabled = true;
        dateAxis.fontSize = fontsize;

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.tooltip.disabled = true;
        valueAxis.renderer.minWidth = 35;
        valueAxis.renderer.axisFills.template.disabled = true;
        valueAxis.renderer.ticks.template.disabled = true;
        valueAxis.fontSize = fontsize;

        var series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.dateX = "date";
        series.dataFields.valueY = "value";
        series.strokeWidth = 2;
        series.tooltipText = "Value: {valueY}, Change: {valueY.previousChange}";
        series.bullets.push(new am4charts.CircleBullet());

        var label = chart.createChild(am4core.Label);
        label.align = "center";
        label.fontSize = fontsize;

        if (
          !previewMode &&
          (self.dataPoints === null || self.dataPoints === [])
        ) {
          label.text = "No Data Available";
        }

        // set stroke property field
        series.propertyFields.stroke = "color";

        chart.cursor = new am4charts.XYCursor();

        var scrollbarX = new am4core.Scrollbar();
        chart.scrollbarX = scrollbarX;

        dateAxis.start = 0.7;
        dateAxis.keepSelection = true;
        self.chart = chart;
        self.label = label;
      }); // end am4core.ready()
    },

    getData(settings) {
      var query = {
        metrics: [
          {
            name: settings.metric,
            tags: { UUID: deviceUUID },
            aggregators: settings.metrics[0].timeBucket === "auto" ? [{
                            name: settings.metrics[0].aggregator,
                        }] : [{
                            name: settings.metrics[0].aggregator,
                            sampling: {
                                unit: settings.metrics[0].timeBucket,
                                value: settings.metrics[0].timeBucketValue
                            }
                        }]
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
            tags: { UUID: deviceUUID },
            aggregators: this.settings.metrics[0].timeBucket === "auto" ? [{
                            name: this.settings.metrics[0].aggregator,
                        }] : [{
                            name: this.settings.metrics[0].aggregator,
                            sampling: {
                                unit: this.settings.metrics[0].timeBucket,
                                value: this.settings.metrics[0].timeBucketValue
                            }
                        }]
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
    queryString === "https://davra.github.io/marketplace/line-chart/index.html"
  ) {
    previewMode = true;
    vueInstance.$emit("update", {
      deviceId: null,
      metrics: null,
      timerange: null,
    });
  }
}
