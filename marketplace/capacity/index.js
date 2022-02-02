var deviceUUID;
var previewMode = false;
var widgetLevelQueryDevice = false;
var widgetLevelQueryTime = false;

var widgetConfig = {
    fontSize: 30,
    unit: "Litres",
    capacity: 6000,
    circleSize: 0.8,
    chartHeight: 500,
};

var vueInstance = new Vue({
    el: "#main",
    data: {
        widgetConfig: null,
        ranges: [],
        settings: null,
        dataPoints: null,
        deviceUUID: null,
        chart: null,
        label: null,
        setValue: null,
    },
    watch: {
        dataPoints(newVal, oldVal) {
            var capacity =
                this.settings.capacity !== undefined
                    ? this.settings.capacity
                    : this.widgetConfig.capacity;
            var unit =
                this.settings.unit !== undefined
                    ? this.settings.unit
                    : this.widgetConfig.unit;
            if (newVal.length === 0) {
                this.label.text = "No Data Available";
                this.label2.text = ""
                this.setValue(capacity - capacity);
            } else {
                if (newVal[0][0] === 0) {
                    this.label.text = "No Data Available";
                    this.label2.text = ""
                    this.setValue(capacity - capacity);
                } else {
                    this.label.text = newVal[0][1] + " " + unit;
                    this.label2.text = new Date(newVal[0][0]).toString();
                    this.setValue(newVal[0][1]);
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
            var theme =
                self.settings.theme !== undefined
                    ? self.settings.theme
                    : "#34a4eb";

            // Themes begin
            am4core.useTheme(am4themes_animated);
            am4core.options.commercialLicense = true;
            // Themes end

            var capacity =
                this.settings.capacity !== undefined
                    ? this.settings.capacity
                    : this.widgetConfig.capacity;
            if (previewMode === true) {
                var value = 4000;
            }
            var circleSize =
                this.settings.circleSize !== undefined
                    ? this.settings.circleSize
                    : this.widgetConfig.circleSize;

            var fontsize =
                self.settings.fontsize !== undefined
                    ? self.settings.fontsize
                    : self.widgetConfig.fontsize;
            var unit =
                self.settings.unit !== undefined
                    ? self.settings.unit
                    : self.widgetConfig.unit;

            var component = am4core.create("chartdiv", am4core.Container);
            component.width = am4core.percent(100);
            component.height = am4core.percent(100);

            var chartContainer = component.createChild(am4core.Container);
            chartContainer.x = am4core.percent(50);
            chartContainer.y = am4core.percent(50);

            var circle = chartContainer.createChild(am4core.Circle);
            circle.fill = am4core.color("#dadada");

            var circleMask = chartContainer.createChild(am4core.Circle);

            var waves = chartContainer.createChild(am4core.WavedRectangle);
            waves.fill = am4core.color(theme);
            waves.mask = circleMask;
            waves.horizontalCenter = "middle";
            waves.waveHeight = 10;
            waves.waveLength = 30;
            waves.y = 500;
            circleMask.y = -500;

            component.events.on("maxsizechanged", function () {
                var smallerSize = Math.min(component.pixelWidth, component.pixelHeight);
                var radius = (smallerSize * circleSize) / 2;

                circle.radius = radius;
                circleMask.radius = radius;
                waves.height = smallerSize;
                waves.width = Math.max(component.pixelWidth, component.pixelHeight);

                //capacityLabel.y = radius;


                var labelRadius = radius + 20;

                capacityLabel.path =
                    am4core.path.moveTo({ x: -labelRadius, y: 0 }) +
                    am4core.path.arcToPoint(
                        { x: labelRadius, y: 0 },
                        labelRadius,
                        labelRadius
                    );
                capacityLabel.locationOnPath = 0.5;
                if (previewMode === true) {
                    setValue(value);
                }
            });

            function setValue(value) {
                var y =
                    -circle.radius -
                    waves.waveHeight +
                    (1 - value / capacity) * circle.pixelRadius * 2;
                waves.animate(
                    [
                        { property: "y", to: y },
                        { property: "waveHeight", to: 10, from: 15 },
                        { property: "x", from: -50, to: 0 },
                    ],
                    5000,
                    am4core.ease.elasticOut
                );
                circleMask.animate(
                    [
                        { property: "y", to: -y },
                        { property: "x", from: 50, to: 0 },
                    ],
                    5000,
                    am4core.ease.elasticOut
                );
            };

            var label = chartContainer.createChild(am4core.Label);
            var formattedValue = component.numberFormatter.format(value, "#.#a");
            formattedValue = formattedValue.toUpperCase();

            label.text = formattedValue + " " + unit;
            label.fill = am4core.color("#fff");
            label.fontSize = fontsize;
            label.horizontalCenter = "middle";

            var label2 = chartContainer.createChild(am4core.Label);

            label2.fill = am4core.color("#fff");
            label2.fontSize = fontsize * 0.333;
            label2.horizontalCenter = "middle";
            label2.verticalCenter = "middle";

            var capacityLabel = chartContainer.createChild(am4core.Label);

            var formattedCapacity = component.numberFormatter
                .format(capacity, "#.#a")
                .toUpperCase();

            capacityLabel.text = "Capacity " + formattedCapacity + " " + unit;
            capacityLabel.fill = am4core.color(theme);
            capacityLabel.fontSize = fontsize * 0.666;
            capacityLabel.textAlign = "middle";
            capacityLabel.padding(0, 0, 0, 0);

            this.label = label;
            this.label2 = label2;
            this.setValue = setValue;
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
                        };
                    }
                    updateDeviceById(widgetConfigData.deviceId, function (err, data) {
                        deviceUUID = data;
                        vueInstance.$emit("update", widgetConfigData);
                    });
                } else {
                    widgetLevelQueryDevice = false;
                    widgetLevelQueryTime = false;
                    widgetConfigData.timerange = {
                        startTime: moment().subtract(24, "hours").valueOf(),
                        endTime: moment().valueOf(),
                    };
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
        queryString ===
        "https://davra.github.io/marketplace/capacity/index.html"
    ) {
        previewMode = true;
        vueInstance.$emit("update", {
            deviceId: null,
            metrics: null,
            timerange: null,
        });
    }
}
