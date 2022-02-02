var img_src = null;
var img_height = null;
var img_width = null;
var settings = null;

var selectedMetrics = null;

var defaultStart = moment().subtract(24, 'hours').valueOf();
var defaultEnd = moment().valueOf();

var newTimerange = null;

var chosenDevices = [];

var metric_by_name = {};

var draw_img = function (devices) {
    var $shownImage = $("#image");

    var iframe_parent = window.frameElement.parentElement;
    //  var container_height = iframe_parent.clientHeight;
    // var container_width = iframe_parent.clientWidth;

    // var delta
    var img = $('<img id="image" style="display:none;">');
    //  var correct_height, correct_width;
    img.attr('src', img_src);
    img.on('load', function () {
        img_height = this.height;
        img_width = this.width;

        $shownImage.remove();
        this.style = "display: block;";

        img.appendTo('#image-container');

        for (let i = 0; i < devices.length; i++) {

            let xPos = parseInt(devices[i].Xpos);
            let yPos = parseInt(devices[i].Ypos);

            xPos = parseInt((xPos / 100) * img_width);
            yPos = parseInt((yPos / 100) * img_height);

            add_sensor(xPos, yPos, devices[i]);

        }

    })



}

function connecthingWidgetInit(context) {
    context.filters.subscribe(handleFilterChange);
    widgetUtils.getMetricsListFromServer(function (err, res) {

        for (let i = 0; i < res.length; i++) {
            metric_by_name[res[i].name] = res[i].units;
        }
    })
    widgetUtils.loadWidgetSettings(function (err, widgetConfigData) {
        img_src = widgetConfigData.image;
        chosenDevices = widgetConfigData.chosenDevices
        selectedMetrics = widgetConfigData.metrics
        settings = widgetConfigData
        if (img_src !== null || img_src !== undefined) {
            draw_img(chosenDevices);
        }

    })
}

function handleFilterChange(filters) {
    if (filters) {
        update_sensors(filters.timerange)
    }
}

function update_sensors(timerange) {
    newTimerange = timerange
    for (let i = 0; i < chosenDevices.length; i++) {
        $("#sensor-container").remove()
    }
    for (let i = 0; i < chosenDevices.length; i++) {

        let xPos = parseInt(chosenDevices[i].Xpos);
        let yPos = parseInt(chosenDevices[i].Ypos);

        xPos = parseInt((xPos / 100) * img_width);
        yPos = parseInt((yPos / 100) * img_height);

        add_sensor(xPos, yPos, chosenDevices[i]);

    }
}


function update_data(device, $popover, timerange = { startTime: defaultStart, endTime: defaultEnd }) {

    let uuid = device.deviceUUID;

    let query = {};

    query.start_absolute = timerange.startTime
    query.end_absolute = timerange.endTime

    query.metrics = []
    for (const metric of selectedMetrics) {
        query.metrics.push({
            name: metric.name,
            limit: 1,
            order: "desc",
            tags: { UUID: uuid }
        });
    }
    fetch("/api/v2/timeseriesData", {
        method: "POST",
        processData: true,
        body: JSON.stringify(query),
        headers: {
            "Content-type": "application/json",
        },
    })
        .then(function (response) {
            return response.json();
        }).then((res) => {
            for (const dataPoints of res.queries) {
                if (dataPoints.results[0].values.length >= 1) {
                    add_metric(dataPoints.results[0].name, $popover);
                    let point = dataPoints.results[0].values[0][1]
                    $popover.find(`#${dataPoints.results[0].name} .value`).text(point + ' ' + metric_by_name[dataPoints.results[0].name]);
                }
            }
        });
}


function add_metric(name, $popover) {
    let $metric_container = $('<div id="' + name + '">');

    let $metric_name = $('<span class="metric">');
    let $metric_value = $('<span class="value">');

    $metric_name.text(name);
    $metric_value.text("-");

    $metric_name.appendTo($metric_container);
    $metric_value.appendTo($metric_container);

    $metric_container.appendTo($popover);
}


function append_popover(xPos, yPos, device, $sensor, $sensor_container) {
    let $popover = $('<div class="popover sensor-popover">');

    let xOffset = (xPos - 20 - $popover.width() > 10) ? xPos - 20 - $popover.width() - 5 : xPos + $sensor.width() + 5;
    let yOffset = ((yPos + 20) - ($popover.height() / 2) > 5) ? (yPos + 20) - ($popover.height() / 2) : 5;

    let $name = $('<div class="name">');
    let $id = $('<div class="id">');

    $name.text(device.deviceName);
    $name.wrapInner("<strong />");

    //  $id.text(device.deviceUUID);

    $name.appendTo($popover);
    $id.appendTo($popover);

    $("<hr/>").appendTo($popover);
    $popover.css("left", xPos + xOffset);
    $popover.css("top", yPos + yOffset);

    $sensor.on("mouseover", function () {
        $popover.show();
        $popover.css("left", xOffset);
        $popover.css("top", yOffset);
    });

    $sensor.on("mouseout", function () {
        //$popover.css("visibility", "hidden");
        $popover.hide();
        //$popover.show();    
    });

    $popover.on("mouseover", function () {
        $popover.show();

    });

    $popover.on("mouseout", function () {
        //$popover.css("visibility", "hidden");
        $popover.hide();
        //$popover.show();
    });


    $sensor.on("dragstart", function (event, ui) {
        $popover.hide();
    });

    $sensor.on("dragstop", function (event, ui) {

        xOffset = (ui.position.left - 20 - $popover.width() > 10) ? ui.position.left - 20 - $popover.width() - 5 : ui.position.left + $sensor.width() + 5;
        yOffset = ((ui.position.top + 20) - ($popover.height() / 2) > 5) ? (ui.position.top + 20) - ($popover.height() / 2) : 5;

        $popover.css("left", xOffset);
        $popover.css("top", yOffset);

        chosenDevices.find(function (element, index) {
            if (element.deviceUUID === device.deviceUUID) {
                chosenDevices[index].Xpos = Math.round((ui.position.left / img_width) * 100)
                chosenDevices[index].Ypos = Math.round((ui.position.top / img_height) * 100)
                settings.chosenDevices = chosenDevices
                document.getElementById("saveBtn").style.visibility = "visible"
            }

        });
    });

    $popover.appendTo($sensor_container);

    $popover.hide();

    return $popover;

}

function add_sensor(xPos, yPos, device) {
    var $image = $("#image-container");

    let $sensor_container = $('<div id="sensor-container" class"sensorsCon">');
    let $sensor = $('<span class="sensor">');
    let $sensor_icon = $(`<span class="material-icons">${device.icon}</span>`);

    let $popover = append_popover(xPos, yPos, device, $sensor, $sensor_container);

    $sensor_icon.appendTo($sensor);


    $sensor.css('left', xPos);
    $sensor.css('top', yPos);


    $sensor.appendTo($sensor_container);
    $sensor_container.appendTo($image);

    $sensor.draggable()

    if (newTimerange !== null) {
        update_data(device, $popover, newTimerange);
    } else {
        update_data(device, $popover);
    }
}

function saveChanges() {
    widgetUtils.saveWidgetSettings(
        JSON.stringify(settings),
        function (err, data) {
            // You could deal with the response here. By default, feedback will be sent to $("#divUserFeedback") anyway.
            document.getElementById("saveBtn").style.visibility = "hidden"
        }
    );
}