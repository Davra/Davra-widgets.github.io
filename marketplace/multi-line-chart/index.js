var deviceUUID;
var deviceId;
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
        metrics: [],
        activeSeries: []
    },
    watch: {
        dataPoints(newVal, oldVal) {
            if (newVal === {}) {
                this.chart.data = [];
                this.label.text = "No Data Available";
            } else if (newVal !== oldVal) {
                this.chartData = [];
                var value = 0;
                var seenDates = [];
                var keys = Object.keys(newVal);
                for (const key in keys) {
                    if (!this.activeSeries.includes(keys[key])) {
                        this.addSeries(keys[key])
                    }
                    for (const point in newVal[keys[key]]) {
                        value = newVal[keys[key]][point][1];
                        if (seenDates.includes(newVal[keys[key]][point][0])) {
                            let existingObj = this.chartData.find(o => o.date == newVal[keys[key]][point][0]);
                            existingObj[keys[key]] = value
                        } else {
                            seenDates.push(newVal[keys[key]][point][0])
                            var obj = {}
                            obj['date'] = newVal[keys[key]][point][0]
                            obj[keys[key]] = value
                            this.chartData.push(obj);
                        }
                    }
                }
                this.label.text = "";
                this.chart.data = this.chartData;
            }
        },
        deviceUUID(newVal, oldVal) {
            if (this.metrics.length === 0) {
                for (const metric in this.settings.metrics) {
                    this.metrics.push({
                        name: this.settings.metrics[metric].name,
                        tags: { UUID: newVal },
                        group_by: this.settings.metrics[metric].dimensions !== undefined && this.settings.metrics[metric].dimensions.length > 0 ? [{ name: "tag", tags: this.settings.metrics[metric].dimensions }] : [],
                        aggregators: this.settings.metrics[metric].timeBucket === "auto" ? [{
                            name: this.settings.metrics[metric].aggregator
                        }] : [{
                            name: this.settings.metrics[metric].aggregator,
                            sampling: {
                                unit: this.settings.metrics[metric].timeBucket,
                                value: this.settings.metrics[metric].timeBucketValue
                            }
                        }]
                    })
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
                    settings.metric
                ) {
                    for (const metric in this.settings.metrics) {
                        this.metrics.push({
                            name: this.settings.metrics[metric].name,
                            tags: settings.deviceId !== null ? { UUID: deviceUUID } : {},
                            group_by: this.settings.metrics[metric].dimensions !== undefined && this.settings.metrics[metric].dimensions.length > 0 ? [{ name: "tag", tags: this.settings.metrics[metric].dimensions }] : [],
                            aggregators: this.settings.metrics[metric].timeBucket === "auto" ? [{
                                name: this.settings.metrics[metric].aggregator
                            }] : [{
                                name: this.settings.metrics[metric].aggregator,
                                sampling: {
                                    unit: this.settings.metrics[metric].timeBucket,
                                    value: this.settings.metrics[metric].timeBucketValue
                                }
                            }]
                        })

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
                am4core.options.commercialLicense = true;
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
                dateAxis.tooltip.disabled = true
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
                    series.tooltipText = 'Temperature: {valueY}';
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


                        //   data.push({ date: new Date(2021, 0, i + 1), temp: temp });
                        data.push({ date: new Date(2021, 0, i + 1), humidity: humidity, temp: temp });
                    }

                    chart.data = data;
                } else {
                    chart.data = self.chartData;
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

                chart.legend = new am4charts.Legend();
                chart.legend.useDefaultMarker = true;

                dateAxis.keepSelection = true;
                self.chart = chart;
                self.label = label;
            }); // end am4core.ready()
        },

        addSeries(name) {
            var series = this.chart.series.push(new am4charts.LineSeries());
            series.dataFields.dateX = "date";
            series.dataFields.valueY = name;
            series.strokeWidth = 2;
            series.bullets.push(new am4charts.CircleBullet());
            series.tooltipText = `${name}: {valueY}`;
            this.activeSeries.push(name);
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
                .then(async (res) => {
                    var data = {};
                    for (const result in res.queries) {
                        if (res.queries[result].results.length > 0 && res.queries[result].results[0].group_by.length <= 1) {
                            data[res.queries[result].results[0].name] = res.queries[result].results[0].values;
                        } else if (res.queries[result].results.length >= 1) {
                            for (const index in res.queries[result].results) {
                                data[res.queries[result].results[index].name + "-" + await this.getDeviceName(res.queries[result].results[index].tags.UUID[0])] = res.queries[result].results[index].values;
                            }
                        }
                    }
                    this.dataPoints = data;
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
                .then(async (res) => {
                    var data = {};
                    for (const result in res.queries) {
                        if (res.queries[result].results[0].group_by !== undefined) {
                            if (res.queries[result].results.length > 0 && res.queries[result].results[0].group_by.length <= 1) {
                                data[res.queries[result].results[0].name] = res.queries[result].results[0].values;
                            } else if (res.queries[result].results.length >= 1) {
                                for (const index in res.queries[result].results) {
                                    data[res.queries[result].results[index].name + "-" + await this.getDeviceName(res.queries[result].results[index].tags.UUID[0])] = res.queries[result].results[index].values;
                                }
                            }
                        }
                    }
                    this.dataPoints = data;
                });
        },
        getDeviceName(uuid) {
            return fetch(`/api/v1/devices/${uuid}`, {
                method: "GET",
                processData: true,
                headers: {
                    "Content-type": "application/json",
                },
            })
                .then(function (response) {
                    return response.json();
                })
                .then((res) => {
                    return res.records[0].name
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
                    widgetConfigData.timerange = {
                        startTime: moment().subtract(24, "hours").valueOf(),
                        endTime: moment().valueOf(),
                    }
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
            if (deviceId !== filters.tags.deviceId[0]) {
                deviceId = filters.tags.deviceId[0]
                updateDeviceById(filters.tags.deviceId[0], function (err, data) {
                    deviceUUID = data;
                    vueInstance.$emit("updateDeviceUUID", data)
                });
            }
            vueInstance.$emit("updateData", filters.timerange);

        } else if (!widgetLevelQueryTime && widgetLevelQueryDevice) {
            vueInstance.$emit("updateData", filters.timerange);
        } else {
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
