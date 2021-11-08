var selectedfont;
var selectedTheme;
var themesObject = {
  "Default": "am4themes_amcharts",
  "Red/Navy": "am4themes_dataviz",
  "Pink/Orange": "am4themes_material",
  "Yellow/Purple": "am4themes_kelly",
  Lilac: "am4themes_frozen",
  Brown: "am4themes_moonrisekingdom",
  Grey: "am4themes_spiritedaway",
};

var vueInstance = new Vue({
  el: "#app",
  vuetify: new Vuetify(),
  data: {
    fontsize: null,
    chartHeight: null,
    theme: null,
    fonts: [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    themes: [
      "Default",
      "Red/Navy",
      "Pink/Orange",
      "Yellow/Purple",
      "Lilac",
      "Brown",
      "Grey",
    ],
    themesObj: {
      "Default": "am4themes_amcharts",
      "Red/Navy": "am4themes_dataviz",
      "Pink/Orange": "am4themes_material",
      "Yellow/Purple": "am4themes_kelly",
      Lilac: "am4themes_frozen",
      Brown: "am4themes_moonrisekingdom",
      Grey: "am4themes_spiritedaway",
    },
  },
  watch: {
    fontsize(newVal) {
      selectedfont = this.fontsize;
    },
    theme(newVal) {
      selectedTheme = this.themesObj[this.theme];
    },
  },
  mounted() {
    this.$on("update", function (settings) {
      this.fontsize = settings.fontsize;
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

      widgetConfigData.fontsize = widgetConfigData.fontsize
        ? widgetConfigData.fontsize
        : 15;
      widgetConfigData.chartHeight = widgetConfigData.chartHeight
        ? widgetConfigData.chartHeight
        : 500;
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
        groupBy: true,
        timeBucket: true,
        minMetricSections: 2,
        maxMetricSections: 100,
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
      fontsize: 30,
      chartHeight: 500,
      theme: "Default",
    });
  }
}

// Save the configuration
var saveWidgetSettings = function () {
  var settings = {};
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
