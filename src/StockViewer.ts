

class StockRecord {

    constructor( public date: Date,
        public highestPrice: number,
        public lowestPrice: number,
        public openedPrice: number,
        public closedPrice: number,
        public volume: number ) {
    }
}

class ViewOption {
    constructor( public volumeHeight: number,
        public viewerHeight: number,
        public priceTextWidth: number,
        public volumeViewerGap: number,
        public priceLineStokeStyle: string,
        public priceBorderColor: string,
        public risingColor: string,
        public decliningColor: string,
        public volumeBorderColor: string,
        public volumeRisingColor: string,
        public volumeDecliningColor: string,
        public volumeFlatColor: string,
        public hoverLineColor: string,
        public responsive: boolean
    ) {
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



class StockViewer {

    private context: CanvasRenderingContext2D;
    private pieceWidth: number;
    private pieceHeight: number;
    private volumeHeight: number;
    private highestPrice: number;
    private lowestPrice: number;
    private gapWidth: number;

    private defaultOption: ViewOption = {
        volumeHeight: 0,
        viewerHeight: 0,
        priceTextWidth: 80,
        volumeViewerGap: 20,
        priceLineStokeStyle: '#D7D5D5',
        priceBorderColor: 'black',
        risingColor: 'red',
        decliningColor: 'green',
        volumeBorderColor: 'black',
        volumeRisingColor: 'red',
        volumeDecliningColor: 'green',
        volumeFlatColor: 'gray',
        hoverLineColor: 'orange',
        responsive: true
    };

    private afterCanvasMouseMove: Array<(data: StockRecord) => void>;

    private coordinateRecord: Array<Coordinate>;

    private lastHoverIndex: number;
    private lastImageData: ImageData;

    constructor(private canvasId: string,
        private record: StockRecord[],
        private option?: ViewOption
    ) {
        // view context
        const canvas = <HTMLCanvasElement>document.getElementById(canvasId);
        this.context = canvas.getContext('2d');

        // after mousemove hook function
        this.afterCanvasMouseMove = new Array<(data: StockRecord) => void>();

        this.initializeOption();
        this.onCanvasMouseMove();
        this.onCanvasKeyDown();

        this.option = option || this.defaultOption;

        if ( this.option.responsive ) {
            this.context.canvas.width = this.context.canvas.parentElement.clientWidth;
            this.context.canvas.style.width = this.context.canvas.parentElement.clientWidth + 'px';
        }

        window.addEventListener('resize', this.onResize.bind(this), false);
    }

    private onResize(e: UIEvent): any {
        // responsive
        if (this.option.responsive) {
            this.context.canvas.width = this.context.canvas.parentElement.clientWidth;
            this.context.canvas.style.width = this.context.canvas.parentElement.clientWidth + 'px';
            this.display();
        }
    }

    // 在canvas上畫出圖形
    public display(): void {

        if (this.record.length <= 0) {
            return;
        }

        this.coordinateRecord = new Array<Coordinate>();
        this.lastHoverIndex = -1;

        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.computeWidth();
        this.computePriceHeight();
        this.computeVolumeHeight();
        this.drawPriceLine();
        this.draw();
    }
    private initializeOption(): void {
        // 成交量的高度初始化為整個canvas的1/5
        this.defaultOption.volumeHeight = this.context.canvas.height * 0.2;
        this.defaultOption.viewerHeight = this.context.canvas.height * 0.8;
    }
    // 計算每塊的寬度
    private computeWidth(): void {
        const width = (this.context.canvas.width - this.option.priceTextWidth) / this.record.length;
        this.pieceWidth = Math.floor(width);
        this.gapWidth = width * 0.25;

        if (width < this.pieceWidth + this.gapWidth) {
            const tmp = (this.pieceWidth + this.gapWidth) - width;
            this.pieceWidth -= tmp;
        }
    }
    // 計算每0.05元的高度
    private computePriceHeight(): void {
        let highest = 0, lowest = Infinity;
        const len = this.record.length;

        // search highest and lowest price from all record
        for (let i = 0; i < len; i++) {
            // get highest price
            if (this.record[i].highestPrice > highest) {
                highest = this.record[i].highestPrice;
            }

            // get lowest price
            if (this.record[i].lowestPrice < lowest) {
                lowest = this.record[i].lowestPrice;
            }
        }

        // up and down 10%
        highest = highest * 1.1;
        lowest = lowest * 0.9;

        // how many pieces divided by 0.05
        const pieces = Math.round((highest - lowest) / 0.05);

        this.pieceHeight = this.option.viewerHeight / pieces;
        this.highestPrice = highest;
        this.lowestPrice = lowest;
    }
    // draw price line
    private drawPriceLine(): void {
        let price = this.lowestPrice;
        price = Math.ceil(price);
        let add = Math.floor(price * 0.1);
        const width = this.context.canvas.width - this.option.priceTextWidth;
        // draw line each 10%
        while (price < this.highestPrice) {
            const Y = this.computePriceY(price);
            this.context.beginPath();
            this.context.moveTo(0, Y);
            this.context.lineTo(width, Y);
            this.context.closePath();

            this.context.lineWidth = 0.5;
            this.context.strokeStyle = this.option.priceLineStokeStyle;
            this.context.stroke();

            this.context.font = '15px Arial';
            this.context.fillText(price.toFixed(0).toString(), width + 10, Y + 5);
            price = price + add;
        }
    }
    // 計算價格的Y軸數值
    private computePriceY(price: number): number {
        return this.option.viewerHeight - (((price - this.lowestPrice) / 0.05) * this.pieceHeight);
    }
    // 計算X的開始和結束位置
    private computePriceX(index: number): any {
        const startX = index * (this.pieceWidth + this.gapWidth);
        const endX = (index + 1) * (this.pieceWidth + this.gapWidth) - this.gapWidth;
        return {
            start: startX,
            end: endX
        };
    }
    // draw all data
    private draw(): void {
        const len = this.record.length;
        for (let i = 0; i < len; i++) {
            const coordinate = this.computeOneCoordinate(i);
            this.drawPiece(coordinate, this.record[i]);
            this.drawVolume(coordinate, i);

            // record middleX index for retreive stock data
            let tmpCoor = new Coordinate();
            tmpCoor.middleX = coordinate.middleX;
            tmpCoor.startX = coordinate.startX;
            tmpCoor.endX = coordinate.endX;
            this.coordinateRecord.push(tmpCoor);
        }
    }
    // draw one piece
    private drawPiece(coordinate: Coordinate, record: StockRecord): void {
        this.context.beginPath();
        this.context.moveTo(coordinate.startX, coordinate.startY);

        // finish _|_
        this.context.lineTo(coordinate.middleX, coordinate.startY); // line to the middle
        this.context.lineTo(coordinate.middleX, coordinate.highestY); // line to the high price
        this.context.lineTo(coordinate.middleX, coordinate.startY); // return to the middle
        this.context.lineTo(coordinate.endX, coordinate.startY); // line to the end

        // finish _|_
        //           |
        this.context.lineTo(coordinate.endX, coordinate.endY);

        // finish _|_
        //          _|
        //         |
        this.context.lineTo(coordinate.middleX, coordinate.endY);
        this.context.lineTo(coordinate.middleX, coordinate.lowwestY);
        this.context.lineTo(coordinate.middleX, coordinate.endY);

        // finish all
        this.context.lineTo(coordinate.startX, coordinate.endY);
        this.context.lineTo(coordinate.startX, coordinate.startY);

        this.context.closePath();

        this.context.strokeStyle = this.option.priceBorderColor;
        this.context.stroke();
        // 開盤價大於收盤價就表示上漲
        this.context.fillStyle = record.openedPrice <= record.closedPrice ?
            this.option.risingColor : this.option.decliningColor;
        this.context.fill();
    }
    // compute stock record one coordinate
    private computeOneCoordinate(index: number): Coordinate {
        const record: StockRecord = this.record[index];
        let coordinate: Coordinate = new Coordinate();

        // compute start and end X that is accroding to index
        const X = this.computePriceX(index);
        coordinate.startX = X.start;
        coordinate.endX = X.end;
        coordinate.middleX = (X.start + X.end) * 0.5;

        if (record.openedPrice > record.closedPrice) {
            coordinate.startY = this.computePriceY(record.openedPrice);
            coordinate.endY = this.computePriceY(record.closedPrice);
        } else {
            coordinate.startY = this.computePriceY(record.closedPrice);
            coordinate.endY = this.computePriceY(record.openedPrice);
        }

        coordinate.highestY = this.computePriceY(record.highestPrice);
        coordinate.lowwestY = this.computePriceY(record.lowestPrice);
        return coordinate;
    }
    // 計算每1成交量的高度為多少
    private computeVolumeHeight(): void {
        const len = this.record.length;
        let highestVolume = 0;
        for (let i = 0; i < len; i++) {
            if (this.record[i].volume > highestVolume) {
                highestVolume = this.record[i].volume;
            }
        }

        this.volumeHeight = (this.option.volumeHeight - this.option.volumeViewerGap) / highestVolume;
    }
    // 計算成交量的X軸
    private computeVolumeY(volume: number): number {
        return this.context.canvas.height - (volume * this.volumeHeight);
    }

    private drawVolume(coordinate: Coordinate, index: number): void {
        const record = this.record[index];
        let fillStyle = this.option.volumeFlatColor;

        if (index - 1 >= 0) {
            const record1 = this.record[index - 1];
            if (record.closedPrice > record1.closedPrice) {
                fillStyle = this.option.volumeRisingColor;
            } else if (record.closedPrice < record1.closedPrice) {
                fillStyle = this.option.volumeDecliningColor;
            }
        }


        const Y = this.computeVolumeY(record.volume);
        const baseY = this.context.canvas.height;

        this.context.beginPath();
        this.context.moveTo(coordinate.startX, baseY);
        this.context.lineTo(coordinate.startX, Y);
        this.context.lineTo(coordinate.endX, Y);
        this.context.lineTo(coordinate.endX, baseY);
        this.context.lineTo(coordinate.startX, baseY);
        this.context.closePath();

        // this.context.strokeStyle = this.option.volumeBorderColor;
        // this.context.stroke();
        this.context.fillStyle = fillStyle;
        this.context.fill();
    }

    private showHoverLine(hoverCoordinate: Coordinate): void {

        this.cancelHoverLine();

        // record original image
        this.lastImageData = this.context.getImageData(hoverCoordinate.startX, 0,
            hoverCoordinate.endX - hoverCoordinate.startX, this.context.canvas.height);

        // draw vertical line
        this.context.beginPath();
        // this.context.setLineDash([5, 15]); if want to use dash line
        this.context.moveTo(hoverCoordinate.middleX, 0);
        this.context.lineTo(hoverCoordinate.middleX, this.context.canvas.height);
        this.context.closePath();
        this.context.lineWidth = 0.5;
        this.context.strokeStyle = this.option.hoverLineColor;
        this.context.stroke();
    }

    private hoverLineMoveTo(index: number, showHoverLine: boolean) {
        const hoverRecord = this.record[index];

        if (showHoverLine) {
            const r1 = this.coordinateRecord[index];
            this.showHoverLine(r1);
        }

        if (hoverRecord) {
            this.lastHoverIndex = index;
            // hook method that allow other user to get data
            const len = this.afterCanvasMouseMove.length;
            for (let i = 0; i < len; i++) {
                this.afterCanvasMouseMove[i](hoverRecord);
            }
        }
    }

    // canvas mouse move action
    private canvasMouseMoveFun(evt: MouseEvent): void {
        let index = 0;
        let show = false;
        const len1 = this.coordinateRecord.length;
        const rect = this.context.canvas.getBoundingClientRect();
        const hoverX = evt.clientX - rect.left;

        for (; index < len1; index++) {
            const r1 = this.coordinateRecord[index];
            // show hover line
            if (hoverX >= r1.startX && hoverX <= r1.endX) {
                show = true;
                break;
            }
        }

        this.hoverLineMoveTo(index, show);
    }

    // canvas mouse move event
    private onCanvasMouseMove(): void {
        this.context.canvas.addEventListener('mousemove', this.canvasMouseMoveFun.bind(this), false);
    }

    // add after mouse move hook function
    public addAfterCanvasMouseMove(fun: any, bindObj: any): void {
        this.afterCanvasMouseMove.push(fun.bind(bindObj));
    }

    // cancel the hover line on the viewer
    public cancelHoverLine(): void {
        if (this.lastHoverIndex > -1) {
            const r2 = this.coordinateRecord[this.lastHoverIndex];
            // put back the original image

            this.context.putImageData(this.lastImageData, r2.startX, 0);
            this.lastHoverIndex = -1;
            this.lastImageData = null;
        }
    }

    private onCanvasKeyDown(): void {
        window.addEventListener('keydown', this.canvasKeyDownFun.bind(this), false);
    }

    private canvasKeyDownFun(e: KeyboardEvent): void {
        if (this.lastHoverIndex > -1) {
            let index = 0;
            let acceptedCode = false;

            switch (e.keyCode) {
                case 37:
                    index = this.lastHoverIndex - 1 < 0 ? 0 : this.lastHoverIndex - 1;
                    acceptedCode = true; break;
                case 39:
                    index = this.lastHoverIndex + 1 >= this.record.length ?
                        this.record.length - 1 : this.lastHoverIndex + 1;
                    acceptedCode = true;
                    break;
                default: break;
            }

            if (acceptedCode) {
                this.hoverLineMoveTo(index, true);
            }
        }
    }
}
