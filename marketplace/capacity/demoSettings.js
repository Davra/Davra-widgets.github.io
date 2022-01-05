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
        capacity: 6000,
        unit: "Litres",
        fontsize: 30,
        circleSize: 0.8,
        chartHeight: 500,
        theme: "Default",
        device: "Tank Sensor",
        devices: ["Tank Sensor"],
        metric: "tank_level",
        metrics: ["tank_level"],
        time: "Days",
        times: ["Days", "Seconds"],
        number: "Avg",
        numbers: ["Avg"],
        fonts: [50, 40, 30, 20, 10],
        circleSizes: [0.8],
        themes: ["Default", "Red/Navy", "Pink/Orange", "Yellow/Purple", "Lilac", "Brown", "Grey"],
        themesObj: {
            Default: "#34a4eb",
            "Red": "#fc0303",
            "Pink": "#fc03db",
            "Yellow": "#fcba03",
            "Purple": "#8003fc",
            "Brown": "#420e0e",
            "Black": "#000000",
        }
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

        })
    }
});

vueInstance.$emit('update', { capacity: 6000, unit: "Litres", fontsize: 30, circleSize: 0.8, chartHeight: 500, theme: "Default" });