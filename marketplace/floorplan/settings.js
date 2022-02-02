var devicesMap;
var devices;
var imageFile = null;

var vueInstance = new Vue({
    el: "#app",
    vuetify: new Vuetify(),
    data: {
        deviceNames: null,
        loading: false,
        items: [],
        chosenDevices: [{ deviceName: '', deviceUUID: '', Xpos: 0, Ypos: 0, icon: "sensors" }],
        axis: Array.from(Array(100).keys()),
        ImageFile: null,
        updateImageBtn: false,
        icons: ["sensors", "thermostat", "bluetooth", "router", "sensor_door", "local_parking", "directions_car", "watch", "sim_card", "gps_fixed", "storage", "battery_std"]

    },
    watch: {
        chosenDevices(newVal) {
            devicesMap = newVal;
        },
        ImageFile(newVal) {
            imageFile = newVal
        },
    },

    mounted() {
        this.$on("update", function (settings, devices, names) {
            this.chosenDevices = settings.chosenDevices;
            this.devices = devices;
            this.deviceNames = names
            if (settings.image) {
                imageFile = settings.image
                this.updateImageBtn = true
            }
        });
    },
    methods: {
        addSelection() {
            this.chosenDevices.push({ deviceName: '', deviceUUID: '', Xpos: 0, Ypos: 0, icon: "sensors" })
        },
        deleteSelection(i) {
            this.chosenDevices.splice(i, 1)
        }
    }
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

            widgetConfigData.chosenDevices = widgetConfigData.chosenDevices
                ? widgetConfigData.chosenDevices
                : [{ deviceName: '', deviceUUID: '', Xpos: 0, Ypos: 0 }];

            // Attach the plugins to known settings DOM elements and set to the current configuration

            $("#metricsselector").metricSelector({
                data: widgetConfigData.metrics,
                aggregate: false,
                groupBy: false,
                timeBucket: false,
                minMetricSections: 1,
                maxMetricSections: 100,
            });

            // Create action for clicking the "apply" button
            $("#buttonSaveWidgetSettings").click(saveWidgetSettings);

            let names = []
            $.get("/api/v1/devices", function (data, err) {
                data = JSON.parse(data);
                devices = data.records
                for (let i = 0; i < data.records.length; i++) {
                    names.push(data.records[i].name)
                }
            })


            vueInstance.$emit("update", widgetConfigData, devices, names);
        });
    });
} catch (err) {
    if (err instanceof ReferenceError) {
        vueInstance.$emit("update", {
            chosenDevices: [{ deviceName: '', deviceUUID: '', Xpos: 0, Ypos: 0 }],
        });
    }
}

// Save the configuration
var saveWidgetSettings = function () {
    var settings = {};
    settings.chosenDevices = devicesMap;
    // Get the value of known DOM elements
    var metrics = $("#metricsselector").data("metricSelector").settings.data;
    if (metrics.length > 0) {
        settings.metrics = metrics;
    }

    for (let device of devicesMap) {
        const matchingDevice = devices.filter(record => record.name === device.deviceName);
        device.deviceUUID = matchingDevice[0].UUID
    }

    var widgetId = widgetUtils.getUrlParameter("widgetid");
    if (imageFile !== null && typeof imageFile !== 'string') {
        fetch(`/api/v1/widgettemplates/${widgetId}/attachments/${imageFile.name}`, {
            method: "POST",
            processData: true,
            body: imageFile,
            headers: {
                "Content-type": imageFile.type,
            },
        })
        settings.image = imageFile.name
    } else if (typeof imageFile === 'string') {
        settings.image = imageFile
    }

    widgetUtils.saveWidgetSettings(
        JSON.stringify(settings),
        function (err, data) {
            // You could deal with the response here. By default, feedback will be sent to $("#divUserFeedback") anyway.
        }
    );
};
