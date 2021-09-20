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
        goal: 10000,
        unit: "Steps",
        fontsize: 30,
        innerRadius: 40,
        icon: "directions_walk",
        chartHeight: 500,
        theme: "default",
        device: "Humidity Sensor",
        devices: ["Humidity Sensor"],
        metric: "Steps",
        metrics: ["Steps", "Humidity", "Temperature"],
        time: "Days",
        times: ["Days", "Seconds"],
        number: "Avg",
        numbers: ["Avg"],
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

vueInstance.$emit('update', { goal: 10000, unit: "steps", fontsize: 30, innerRadius: 40, icon: "directions_walk", chartHeight: 500, units: "Steps", theme: "Default" });