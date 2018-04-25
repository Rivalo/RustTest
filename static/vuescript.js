var host = 'http://192.168.178.100:80'

var ColorPicker = new iro.ColorPicker("#color-picker-container", {
    width: 320,
    height: 320,
    color: { r: 255, g: 0, b: 0, a: 0 },
    markerRadius: 8,
    padding: 4,
    sliderMargin: 24,
    sliderHeight: 36,
    borderWidth: 2,
    borderColor: "#fff",
    anticlockwise: true,
});

ColorPicker.on("mount", function (color) {
    ColorPicker.color.rgb = vm.getColor();
});

ColorPicker.on("input:end", function (color) {
    vm.setColor(color.rgb);
});

var vm = new Vue({
    el: '#app',
    template: '#main-page',
    data: {
        'LEDdat': {
            r: 255, g: 255, b: 255
        },
        ledstate: true
    }
    ,

    created: function () {
        this.fetchData();
        this.ledstate = false;
        this.LEDdat.r = 255;
        this.LEDdat.g = 255;
        this.LEDdat.b = 255;
    },

    methods: {
        fetchData: function () {
            this.$http.get(host + '/led/1')
                .then(response => {
                    this.LEDdat = response.body

                })
                ;
        },

        getColor: function () {
            return {
                r: this.LEDdat.r,
                b: this.LEDdat.b,
                g: this.LEDdat.g
            }
        },

        setColor: function (rgb) {
            this.LEDdat = rgb;
            this.sendDataLED();
        },

        sendDataLED: function () {
            this.$http.put(host + '/led/1', this.LEDdat)
        }
    },

    mounted: function () {
        this.fetchData();

        setInterval(function () {
            this.fetchData();

        }.bind(this), 2000);
    }
});