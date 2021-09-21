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
        fontsize: 15,
        chartHeight: 500,
        theme: "Default",
        device: "Humidity Sensor",
        devices: ["Humidity Sensor"],
        metric: "Humidity",
        metrics: ["Humidity", "Temperature"],
        time: "Seconds",
        times: ["Seconds"],
        number: "Avg",
        numbers: ["Avg"],
        fonts: [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
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
        fontsize(newVal) {
            selectedfont = this.fontsize;
        },
        theme(newVal) {
            selectedTheme = this.themesObj[this.theme];
        }
    },
    mounted() {

        this.$on("update", function (settings) {
            this.fontsize = settings.fontsize;
            this.chartHeight = settings.chartHeight;
            this.theme = settings.theme;

        })
    }
});

vueInstance.$emit('update', { fontsize: 15, chartHeight: 500, theme: "Default" });