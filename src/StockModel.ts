

class StockRecord {

    public coordinate: Coordinate;

    constructor( public date: Date,
        public highestPrice: number,
        public lowestPrice: number,
        public openedPrice: number,
        public closedPrice: number,
        public volume: number ) {
    }
}

class LayoutOption {
    public volumeHeight: number;
    public viewerHeight: number;
    public priceTagWidth: number;
    public dateTagHeight: number;
    public gapBetweenVolumeAndViewer: number;

    constructor() {
        this.priceTagWidth = 50;
        this.dateTagHeight = 20;
        this.gapBetweenVolumeAndViewer = 20;
    }
}


class StyleOption {
    // background line color
    public backLineColor: string ;
    public backgroundColor: string;
    public tagColor: string;
    public baseLineColor: string;

    // chart piece styles
    public pieceBorderColor: string;
    public risingColor: string;
    public decliningColor: string;

    // volume viewer style
    public volumeBorderColor: string;
    public volumeRisingColor: string;
    public volumeDecliningColor: string;
    public volumeFlatColor: string;

    // hover style
    public hoverLineColor: string;

    constructor() {
        this.baseLineColor = 'black';
        this.tagColor = 'black';
        this.backLineColor = '#D7D5D5';
        this.backgroundColor = 'white' ;
        this.pieceBorderColor = 'black';
        this.risingColor = 'red';
        this.decliningColor = 'green';
        this.volumeBorderColor = 'black';
        this.volumeRisingColor = 'red';
        this.volumeDecliningColor = 'green';
        this.volumeFlatColor = 'gray';
        this.hoverLineColor = 'orange';
    }
}

class AdvancedOption {
    public readonly SMADay: number[];
    public readonly SMAColor: string[];

    constructor() {
        this.SMADay = [];
        this.SMAColor = [];
    }

    public addSMA( day: number, color: string ) {
        const index = this.SMADay.indexOf(day) ;

        if ( index < 0 ) {
            this.SMADay.push(day);
            this.SMAColor.push(color);
        }
    }

    public removeSMA( day: number ) {
        const index = this.SMADay.indexOf(day);

        if ( index > -1 ) {
            this.SMADay.splice(index, 1);
            this.SMAColor.splice(index, 1);
        }
    }
}


class ViewOption {
    public layout: LayoutOption;
    public style: StyleOption;
    public responsive: boolean;
    public advance: AdvancedOption;

    constructor() {
        this.layout = new LayoutOption();
        this.style = new StyleOption();
        this.responsive = true;
        this.advance = new AdvancedOption();
    }

}

class Coordinate {
    public startX: number;
    public endX: number;
    public startY: number;
    public endY: number;
    public highestY: number;
    public lowwestY: number;
    public middleX: number;

    constructor() {
    }
}

class CanvasImage {
    constructor(public image: ImageData,
        public x: number,
        public y: number) {
    }
}

