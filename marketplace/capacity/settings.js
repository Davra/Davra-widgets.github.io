var selectedCircleSize;
var selectedfont;
var selectedIcon;
var selectedTheme;
var themesObject = {
  Default: "#34a4eb",
  "Red": "#fc0303",
  "Pink": "#fc03db",
  "Yellow": "#fcba03",
  "Purple": "#8003fc",
  "Brown": "#420e0e",
  "Black": "#000000",
};

var vueInstance = new Vue({
  el: "#app",
  vuetify: new Vuetify(),
  data: {
    capacity: null,
    unit: null,
    fontsize: null,
    circleSize: null,
    chartHeight: null,
    theme: null,
    fonts: [50, 40, 30, 20, 10],
    circleSizes: [0.2,0.4,0.6,0.8,1.0],
    themes: [
      "Default",
      "Red",
      "Pink",
      "Yellow",
      "Purple",
      "Brown",
      "Black",
    ],
    themesObj: {
      Default: "#34a4eb",
      "Red": "#fc0303",
      "Pink": "#fc03db",
      "Yellow": "#fcba03",
      "Purple": "#8003fc",
      "Brown": "#420e0e",
      "Black": "#000000",
    },
  },
  watch: {
    circleSize(newVal) {
      selectedCircleSize = this.circleSize;
    },
    fontsize(newVal) {
      selectedfont = this.fontsize;
    },
    theme(newVal) {
      selectedTheme = this.themesObj[this.theme];
    },
  },
  mounted() {
    this.$on("update", function (settings) {
      this.capacity = settings.capacity;
      this.unit = settings.unit;
      this.fontsize = settings.fontsize;
      this.circleSize = settings.circleSize;
      this.chartHeight = settings.chartHeight;
      this.theme = settings.theme;
    });
  },
});

// Initialise with all the prerequisites of widgetUtils including loading JS files.
try {
  widgetUtils.initialiseSettings({}, function () {
    // Load the configuration for this widget
    widgetUtils.loadWidgetSettings(function (err, widgetConfigData) {
      if (err != null) {
        $("#divUserFeedback").html(
          "Error encountered while loading configuration ",
          err
        );
        return;
      }

      widgetConfigData.capacity =
        widgetConfigData.capacity || widgetConfigData.capacity === 0
          ? widgetConfigData.capacity
          : 6000;
      widgetConfigData.fontsize = widgetConfigData.fontsize
        ? widgetConfigData.fontsize
        : 30;
      widgetConfigData.circleSize = widgetConfigData.circleSize
        ? widgetConfigData.circleSize
        : 0.8;
      widgetConfigData.chartHeight = widgetConfigData.chartHeight
        ? widgetConfigData.chartHeight
        : 500;
      widgetConfigData.unit = widgetConfigData.unit
        ? widgetConfigData.unit
        : "Litres";
      widgetConfigData.theme = widgetConfigData.theme
        ? Object.keys(themesObject).find(
            (key) => themesObject[key] === widgetConfigData.theme
          )
        : "Default";

      // Attach the plugins to known settings DOM elements and set to the current configuration
      $("#deviceselector").deviceSelector({
        data: {
          id: widgetConfigData.deviceId,
        },
      });

      $("#metricsselector").metricSelector({
        data: widgetConfigData.metrics,
        aggregate: true,
        groupBy: false,
        timeBucket: true,
        minMetricSections: 1,
        maxMetricSections: 1,
      });
      $("#timerangeselector").timerangeSelector({
        data: {
          timerange: widgetConfigData.timerange,
        },
      });

      // Create action for clicking the "apply" button
      $("#buttonSaveWidgetSettings").click(saveWidgetSettings);

      vueInstance.$emit("update", widgetConfigData);
    });
  });
} catch (err) {
  if (err instanceof ReferenceError) {
    vueInstance.$emit("update", {
      capacity: 6000,
      unit: "Litres",
      fontsize: 30,
      circleSize: 0.8,
      chartHeight: 500,
      units: "Litres",
      theme: "Default",
    });
  }
}

// Save the configuration
var saveWidgetSettings = function () {
  var settings = {};
  settings.unit = document.getElementById("unit").value;
  settings.capacity = parseFloat(document.getElementById("capacity").value);
  settings.circleSize = selectedCircleSize;
  settings.fontsize = selectedfont;
  settings.theme = selectedTheme;
  settings.chartHeight = parseInt(document.getElementById("chartHeight").value);
  // Get the value of known DOM elements
  var metrics = $("#metricsselector").data("metricSelector").settings.data;
  if (metrics.length > 0) {
    settings.metrics = metrics;
    settings.metric = metrics[0].name;
  }
  var device = $("#deviceselector").data("deviceSelector").settings.data;
  if (device && device.id) {
    settings.deviceId = device.id;
  }
  var timerangesel =
    $("#timerangeselector").data("timerangeSelector").settings.data;
  if (timerangesel && timerangesel.timerange) {
    settings.timerange = timerangesel.timerange;
  }

  widgetUtils.saveWidgetSettings(
    JSON.stringify(settings),
    function (err, data) {
      // You could deal with the response here. By default, feedback will be sent to $("#divUserFeedback") anyway.
    }
  );
};
