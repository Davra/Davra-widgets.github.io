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
        metrics: []
    },
    watch: {
        dataPoints(newVal, oldVal) {
            if (newVal === {}) {
                this.chart.data = [];
                this.label.text = "No Data Available";
            } else if (newVal !== oldVal) {
                this.chartData = [];
                var value = 0;
                var keys = Object.keys(newVal);
                for (const key in keys) {
                    for (const point in newVal[keys[key]]) {
                        value = newVal[keys[key]][point][1];
                        var obj = {}
                        obj['date'] = new Date(newVal[keys[key]][point][0])
                        obj[keys[key]] = value
                        this.chartData.push(obj);
                    }
                }
                this.label.text = "";
                this.chart.data = this.chartData;
            }
        },
        deviceUUID(newVal, oldVal) {
            if (this.metrics.length === 0) {
                for (const metric in this.settings.metrics) {
                    if (this.settings.metrics[metric].timeBucket !== "auto") {
                        this.metrics.push({
                            name: this.settings.metrics[metric].name,
                            tags: { UUID: newVal },
                            aggregators: [{
                                name: this.settings.metrics[metric].aggregator,
                                sampling: {
                                    unit: this.settings.metrics[metric].timeBucket,
                                    value: this.settings.metrics[metric].timeBucketValue
                                }
                            }]
                        })
                    } else {
                        this.metrics.push({
                            name: this.settings.metrics[metric].name,
                            tags: { UUID: deviceUUID }
                        })
                    }
                }
            } else {
                for (const metric in this.metrics) {
                    this.metrics[metric].tags.UUID = newVal
                }
            }

        }
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
                    for (const metric in this.settings.metrics) {
                        if (this.settings.metrics[metric].timeBucket !== "auto") {
                            this.metrics.push({
                                name: this.settings.metrics[metric].name,
                                tags: { UUID: deviceUUID },
                                aggregators: [{
                                    name: this.settings.metrics[metric].aggregator,
                                    sampling: {
                                        unit: this.settings.metrics[metric].timeBucket,
                                        value: this.settings.metrics[metric].timeBucketValue
                                    }
                                }]
                            })
                        } else {
                            this.metrics.push({
                                name: this.settings.metrics[metric].name,
                                tags: { UUID: deviceUUID }
                            })
                        }
                    }
                    this.getData(this.settings, this.metrics);
                }
            } else {
                previewMode = true;
            }

            this.renderChart();
        });

        this.$on("updateData", function (timerange) {
            this.getNewData(timerange);
        });
        this.$on("updateDeviceUUID", function (uuid) {
            this.deviceUUID = uuid;
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

                if (previewMode === true) {
                    var data = [];
                    var humidity = 10;
                    var temp = 10

                    var series = chart.series.push(new am4charts.LineSeries());
                    series.dataFields.dateX = "date";
                    series.dataFields.valueY = 'temp';
                    series.strokeWidth = 2;
                    series.tooltipText = 'Temp: {valueY}';
                    series.bullets.push(new am4charts.CircleBullet());

                    var series2 = chart.series.push(new am4charts.LineSeries());
                    series2.dataFields.dateX = "date";
                    series2.dataFields.valueY = 'humidity';
                    series2.strokeWidth = 2;
                    series2.tooltipText = 'Humidity: {valueY}';
                    series2.bullets.push(new am4charts.CircleBullet());

                    for (var i = 0; i < 100; i++) {
                        temp += Math.round(
                            (Math.random() < 0.5 ? 1 : -1) * Math.random() * 10
                        );

                        humidity += Math.round(
                            (Math.random() < 0.5 ? 1 : -1) * Math.random() * 10
                        );


                        data.push({ date: new Date(2021, 0, i + 1), temp: temp });
                        data.push({ date: new Date(2021, 0, i + 1), humidity: humidity });
                    }

                    chart.data = data;
                } else {
                    chart.data = self.chartData;
                }

                for (const metric in self.settings.metrics) {
                    var series = chart.series.push(new am4charts.LineSeries());
                    series.dataFields.dateX = "date";
                    series.dataFields.valueY = `${self.settings.metrics[metric].name}`;
                    series.strokeWidth = 2;
                    series.tooltipText = `${self.settings.metrics[metric].name}: {valueY}`;
                    series.bullets.push(new am4charts.CircleBullet());
                }


                var label = chart.createChild(am4core.Label);
                label.align = "center";
                label.fontSize = fontsize;

                if (
                    !previewMode &&
                    (self.dataPoints === null || self.dataPoints === [])
                ) {
                    label.text = "No Data Available";
                }


                chart.cursor = new am4charts.XYCursor();

                var scrollbarX = new am4core.Scrollbar();
                chart.scrollbarX = scrollbarX;

                dateAxis.start = 0.7;
                dateAxis.keepSelection = true;
                self.chart = chart;
                self.label = label;
            }); // end am4core.ready()
        },

        getData(settings, metrics) {
            var query = {
                metrics: metrics,
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
                    var data = {};
                    for (const result in res.queries) {
                        data[res.queries[result].results[0].name] = res.queries[result].results[0].values
                    }
                    this.dataPoints = data;
                    console.log(this.dataPoints);
                });
        },
        getNewData(timerange) {
            var query = {
                metrics: this.metrics,
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
                    var data = {};
                    for (const result in res.queries) {
                        data[res.queries[result].results[0].name] = res.queries[result].results[0].values
                    }
                    this.dataPoints = data;
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
                vueInstance.$emit("updateDeviceUUID", data)
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
        queryString === "https://davra.github.io/marketplace/multi-line-chart/index.html"
    ) {
        previewMode = true;
        vueInstance.$emit("update", {
            deviceId: null,
            metrics: null,
            timerange: null,
        });
    }
}
