var selectedRadius;
var selectedfont;

var vueInstance = new Vue({
    el: "#app",
    vuetify: new Vuetify(),
    data: {
        maxChartValue: null,
        minChartValue: null,
        device: "Humidity Sensor",
        devices: ["Humidity Sensor"],
        metric: "Humidity",
        metrics: ["Humidity", "Temperature"],
        time: "Seconds",
        times: ["Seconds"],
        number: "Avg",
        numbers: ["Avg"],
        groupBy: "Device",
        groupBys: ["Device"],
        fontsize: null,
        innerRadius: null,
        fonts: [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
        radii: [100, 90, 80, 70, 60, 50, 40, 30, 20, 10],
    },
    watch: {
        innerRadius(newVal) {
            selectedRadius = this.innerRadius;
        },
        fontsize(newVal) {
            selectedfont = this.fontsize;
        },
    },
    mounted() {

        this.$on("update", function (settings) {
            this.maxChartValue = settings.maxValue;
            this.minChartValue = settings.minValue;
            this.fontsize = settings.fontsize;
            this.innerRadius = settings.innerRadius;

        })
    }
});



vueInstance.$emit('update', { maxValue: 100, minValue: -50, fontsize: 11, innerRadius: 80,});
  


// Save the configuration
var saveWidgetSettings = function () {

    var settings = {};
    settings.minValue = parseInt(document.getElementById('minvalue').value)
    settings.maxValue = parseInt(document.getElementById('maxvalue').value)
    settings.innerRadius = selectedRadius
    settings.fontsize = selectedfont
    // Get the value of known DOM elements
    var metrics = $('#metricsselector').data('metricSelector').settings.data;
    if (metrics.length > 0) {
        settings.metrics = metrics;
        settings.metric = metrics[0].name;
    }
    var device = $('#deviceselector').data('deviceSelector').settings.data;
    if (device && device.id) {
        settings.deviceId = device.id;
    }
    var timerangesel = $('#timerangeselector').data('timerangeSelector').settings.data;
    if (timerangesel && timerangesel.timerange) {
        settings.timerange = timerangesel.timerange;
    }
    // Get the text inside the ACE editor
    settings.chartCfg = widgetUtils.retrieveAceEditorData();
    console.log(settings)

    widgetUtils.saveWidgetSettings(JSON.stringify(settings), function (err, data) {
        // You could deal with the response here. By default, feedback will be sent to $("#divUserFeedback") anyway.
    });
}



// Default gradingData
var gradingData = [
    {
        title: "Unsustainable",
        color: "#ee1f25",
        lowScore: -100,
        highScore: -20
    },
    {
        title: "Volatile",
        color: "#f04922",
        lowScore: -20,
        highScore: 0
    },
    {
        title: "Foundational",
        color: "#fdae19",
        lowScore: 0,
        highScore: 20
    },
    {
        title: "Developing",
        color: "#f3eb0c",
        lowScore: 20,
        highScore: 40
    },
    {
        title: "Maturing",
        color: "#b0d136",
        lowScore: 40,
        highScore: 60
    },
    {
        title: "Sustainable",
        color: "#54b947",
        lowScore: 60,
        highScore: 80
    },
    {
        title: "High Performing",
        color: "#0f9747",
        lowScore: 80,
        highScore: 100
    }
]