var selectedRadius;
var selectedfont;

var vueInstance = new Vue({
    el: "#app",
    vuetify: new Vuetify(),
    data: {
        maxChartValue: null,
        minChartValue: null,
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


// Initialise with all the prerequisites of widgetUtils including loading JS files.
try {
    widgetUtils.initialiseSettings({}, function () {
        // Load the configuration for this widget
        widgetUtils.loadWidgetSettings(function (err, widgetConfigData) {
            if (err != null) {
                $("#divUserFeedback").html("Error encountered while loading configuration ", err);
                return;
            }
            

            widgetConfigData.minValue = widgetConfigData.minValue ? widgetConfigData.minValue : -50
            widgetConfigData.maxValue = widgetConfigData.maxValue ? widgetConfigData.maxValue : 100
            widgetConfigData.fontsize =  widgetConfigData.fontsize ? widgetConfigData.fontsize : 11
            widgetConfigData.innerRadius = widgetConfigData.innerRadius ? widgetConfigData.innerRadius : 80

            // Attach the plugins to known settings DOM elements and set to the current configuration
            $('#deviceselector').deviceSelector({
                data: {
                    id: widgetConfigData.deviceId
                }
            });

            $('#metricsselector').metricSelector({
                data: widgetConfigData.metrics,
                aggregate: true,
                groupBy: true,
                timeBucket: true,
                minMetricSections: 1,
                maxMetricSections: 1
            });
            $('#timerangeselector').timerangeSelector({
                data: {
                    timerange: widgetConfigData.timerange
                }
            });

            // Chart config for AmCharts
            // If a default AMCharts config is available, use that but if there is a chartconfig in widgetConfig, use that
            if ($.isEmptyObject(widgetConfigData.chartCfg)) {
                widgetConfigData.chartCfg = gradingData; // Defined below
            }
            // For a DOM textarea with id="text-editor-for-ace", fill it with string data of the chartConfig
            widgetUtils.loadAceEditorWithData(JSON.stringify(widgetConfigData.chartCfg, null, 4));

            // Create action for clicking the "apply" button
            $('#buttonSaveWidgetSettings').click(saveWidgetSettings);

            vueInstance.$emit('update', widgetConfigData);
        });
    });
}
catch (err) {
    if (err instanceof ReferenceError) {
        vueInstance.$emit('update', { maxValue: 100, minValue: -50, fontsize: 11, innerRadius: 80 });
    }
}


// Save the configuration
var saveWidgetSettings = function () {

    var settings = {};
    settings.minValue = parseFloat(document.getElementById('minvalue').value)
    settings.maxValue = parseFloat(document.getElementById('maxvalue').value)
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