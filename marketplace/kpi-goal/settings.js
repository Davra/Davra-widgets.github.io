var selectedRadius;
var selectedfont;
var selectedIcon;
var selectedTheme;
var themesObject = {
            "Default": "am4themes_animated",
            "Red/Navy": "am4themes_dataviz",
            "Pink/Orange": "am4themes_material",
            "Yellow/Purple": "am4themes_kelly",
            "Lilac": "am4themes_frozen",
            "Brown": "am4themes_moonrisekingdom",
            "Grey": "am4themes_spiritedaway"
        }

var vueInstance = new Vue({
    el: "#app",
    vuetify: new Vuetify(),
    data: {
        goal: null,
        unit: null,
        fontsize: null,
        innerRadius: null,
        icon: null,
        chartHeight: null,
        theme: null,
        fonts: [50, 40, 30, 20, 10],
        radii: [100, 90, 80, 70, 60, 50, 40, 30, 20, 10],
        icons: ["None", "directions_walk", "thermostat", "drive_eta", "local_shipping", "commute", "train", "agriculture", "wifi", "router", "speed"],
        themes: ["Default", "Red/Navy", "Pink/Orange", "Yellow/Purple", "Lilac", "Brown", "Grey"],
        themesObj: {
            "Default": "am4themes_animated",
            "Red/Navy": "am4themes_dataviz",
            "Pink/Orange": "am4themes_material",
            "Yellow/Purple": "am4themes_kelly",
            "Lilac": "am4themes_frozen",
            "Brown": "am4themes_moonrisekingdom", 
            "Grey": "am4themes_spiritedaway"
        }
    },
    watch: {
        innerRadius(newVal) {
            selectedRadius = this.innerRadius;
        },
        fontsize(newVal) {
            selectedfont = this.fontsize;
        },
        icon(newVal) {
            selectedIcon = this.icon;
        },
        theme(newVal) {
            selectedTheme = this.themesObj[this.theme];
        }
    },
    mounted() {

        this.$on("update", function (settings) {
            this.goal = settings.goal;
            this.unit = settings.unit;
            this.fontsize = settings.fontsize;
            this.innerRadius = settings.innerRadius;
            this.icon = settings.icon;
            this.chartHeight = settings.chartHeight;
            this.theme = settings.theme;

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
            
            widgetConfigData.goal = (widgetConfigData.goal || widgetConfigData.goal === 0) ? widgetConfigData.goal : 10000
            widgetConfigData.fontsize =  widgetConfigData.fontsize ? widgetConfigData.fontsize : 9
            widgetConfigData.innerRadius = widgetConfigData.innerRadius ? widgetConfigData.innerRadius : 80
            widgetConfigData.icon = widgetConfigData.icon ? widgetConfigData.icon : "directions_walk"
            widgetConfigData.chartHeight = widgetConfigData.chartHeight ? widgetConfigData.chartHeight : 500
            widgetConfigData.unit = widgetConfigData.unit ? widgetConfigData.unit : "Steps"
            widgetConfigData.theme =  widgetConfigData.theme ? Object.keys(themesObject).find(key => themesObject[key] === widgetConfigData.theme) : "Default"

            // Attach the plugins to known settings DOM elements and set to the current configuration
            $('#deviceselector').deviceSelector({
                data: {
                    id: widgetConfigData.deviceId
                }
            });

            $('#metricsselector').metricSelector({
                data: widgetConfigData.metrics,
                aggregate: true,
                groupBy: false,
                timeBucket: true,
                minMetricSections: 1,
                maxMetricSections: 1
            });
            $('#timerangeselector').timerangeSelector({
                data: {
                    timerange: widgetConfigData.timerange
                }
            });

            // Create action for clicking the "apply" button
            $('#buttonSaveWidgetSettings').click(saveWidgetSettings);

            vueInstance.$emit('update', widgetConfigData);
        });
    });
}
catch (err) {
    if (err instanceof ReferenceError) {
        vueInstance.$emit('update', { maxValue: 100, minValue: -50, fontsize: 9, innerRadius: 80, icon: "directions_walk", chartHeight: 500, units: "Steps", theme: "Default" });
    }
}


// Save the configuration
var saveWidgetSettings = function () {

    var settings = {};
    settings.unit = document.getElementById('unit').value
    settings.goal = parseFloat(document.getElementById('goal').value)
    settings.innerRadius = selectedRadius
    settings.fontsize = selectedfont
    settings.icon = selectedIcon
    settings.theme = selectedTheme
    settings.chartHeight = parseInt(document.getElementById('chartHeight').value)
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
 

    widgetUtils.saveWidgetSettings(JSON.stringify(settings), function (err, data) {
        // You could deal with the response here. By default, feedback will be sent to $("#divUserFeedback") anyway.
    });
}


