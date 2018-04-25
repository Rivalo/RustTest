var host = 'http://192.168.178.100'

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
        AmountStrips: 0,
        Ledstrip: [
            {
                r: 255, g: 255, b: 255
            }
        ],
        ledstate: true,
        loaded: false,
        selectedItem: 1
    }
    ,

    created: function () {
        this.loaded = false;
        this.selectedItem = 1;
        this.AmountStrips = 0;
        this.CheckAmount();
        this.fetchData();
        this.ledstate = false;
    },

    methods: {
        CheckAmount: function(){
            this.$http.get(host + '/led')
                .then(response =>{
                    this.AmountStrips = response.body.length;
                    this.loaded = true;
                }, response => {
                    this.loaded = false;
                })
                ;

        },

        fetchData: function () {
            this.$http.get(host + '/led/'+this.selectedItem)
                .then(response => {
                    this.Ledstrip[this.selectedItem] = response.body
                    //Dirty way to get around the problems after the first GETS
                    try{
                        ColorPicker.color.rgb = this.Ledstrip[this.selectedItem];
                    }catch(err){

                    }
                    this.loaded = true;

                }, response => {
                    this.loaded = false;
                })
                ;
        },

        getColor: function () {
            return {
                r: this.Ledstrip[this.selectedItem].r,
                b: this.Ledstrip[this.selectedItem].b,
                g: this.Ledstrip[this.selectedItem].g
            }
        },

        setColor: function (rgb) {
            this.Ledstrip[this.selectedItem] = rgb;
            this.sendDataLED();
        },

        sendDataLED: function () {
            this.$http.put(host + '/led/'+this.selectedItem, this.Ledstrip[this.selectedItem])
        }
    },

    mounted: function () {
        this.fetchData();
        
        setInterval(function () {
            this.fetchData();

        }.bind(this), 2000);
    }
});