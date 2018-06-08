class StockRecord {

    public coordinate: Coordinate;

    constructor(public date: Date,
        public highestPrice: number,
        public lowestPrice: number,
        public openedPrice: number,
        public closedPrice: number,
        public volume: number) {
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
    public backLineColor: string;
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
        this.backgroundColor = 'white';
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


class ViewOption {
    public layout: LayoutOption;
    public style: StyleOption;
    public responsive: boolean;

    constructor() {
        this.layout = new LayoutOption();
        this.style = new StyleOption();
        this.responsive = true;
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



class Dictionary {
    [index: string]: any;
}

class StockViewer {

    private context: CanvasRenderingContext2D;
    private pieceWidth: number;
    private pieceHeight: number;
    private volumeHeight: number;
    private highestPrice: number;
    private lowestPrice: number;
    private gapWidth: number;

    private afterCanvasMouseMove: Array<(data: StockRecord) => void>;

    private storedImages: Dictionary;
    private lastHoverIndex: number;

    constructor(private canvasId: string,
        private record: StockRecord[],
        public option?: ViewOption
    ) {
        // view context
        const canvas = <HTMLCanvasElement>document.getElementById(this.canvasId);
        this.context = canvas.getContext('2d');

        // after mousemove hook function
        this.afterCanvasMouseMove = new Array<(data: StockRecord) => void>();
        this.option = option || this.defaultOption();

        this.onCanvasMouseMove();
        this.onCanvasKeyDown();

        if (this.option.responsive) {
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

        this.storedImages = new Dictionary();
        this.lastHoverIndex = -1;

        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.context.fillStyle = this.option.style.backgroundColor;
        this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);

        this.computeWidth();
        this.computePriceHeight();
        this.computeVolumeHeight();
        this.drawPriceLine();
        this.drawBaseLine();
        this.draw();
    }

    private defaultOption(): ViewOption {
        const option = new ViewOption();
        // 成交量的高度初始化為整個canvas的1/5
        option.layout.volumeHeight = this.context.canvas.height * 0.2;
        option.layout.viewerHeight = this.context.canvas.height * 0.8;
        return option;
    }

    // 計算每塊的寬度
    private computeWidth(): void {
        const width = (this.context.canvas.width - this.option.layout.priceTagWidth) / this.record.length;
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

        this.pieceHeight = this.option.layout.viewerHeight / pieces;
        this.highestPrice = highest;
        this.lowestPrice = lowest;
    }
    // draw price line
    private drawPriceLine(): void {
        let price = this.lowestPrice;
        price = Math.ceil(price);
        let add = Math.floor(price * 0.1);
        const width = this.context.canvas.width - this.option.layout.priceTagWidth;
        // draw line each 10%
        while (price < this.highestPrice) {
            const Y = this.computePriceY(price);
            this.context.beginPath();
            this.context.moveTo(0, Y);
            this.context.lineTo(width, Y);
            this.context.closePath();

            this.context.lineWidth = 0.5;
            this.context.strokeStyle = this.option.style.backLineColor;
            this.context.stroke();

            this.context.fillStyle = this.option.style.tagColor;
            this.context.font = '15px Arial';
            this.context.fillText(price.toFixed(0).toString(), width + 10, Y + 5);
            price = price + add;
        }
    }

    private drawBaseLine(): void {
        // draw k chart base line
        this.context.beginPath();
        this.context.moveTo(0, this.option.layout.viewerHeight);
        this.context.lineTo(this.context.canvas.width - this.option.layout.priceTagWidth, this.option.layout.viewerHeight);
        this.context.closePath();
        this.context.lineWidth = 0.5;
        this.context.strokeStyle = this.option.style.baseLineColor;
        this.context.stroke();

        // draw volume chart base line
        this.context.beginPath();
        this.context.moveTo(0, this.context.canvas.height - this.option.layout.dateTagHeight);
        this.context.lineTo(this.context.canvas.width - this.option.layout.priceTagWidth,
            this.context.canvas.height - this.option.layout.dateTagHeight);
        this.context.closePath();
        this.context.lineWidth = 0.5;
        this.context.strokeStyle = this.option.style.baseLineColor;
        this.context.stroke();
    }
    // 計算價格的Y軸數值
    private computePriceY(price: number): number {
        return this.option.layout.viewerHeight - (((price - this.lowestPrice) / 0.05) * this.pieceHeight);
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
        let lastDrawnDate: Date = this.record[0].date;
        let currentDate: Date;

        for (let i = 0; i < len; i++) {
            const coordinate = this.computeOneCoordinate(i);
            this.record[i].coordinate = coordinate;

            currentDate = this.record[i].date;
            if (i === 0 || lastDrawnDate.getMonth() !== currentDate.getMonth()) {
                this.drawDateText(coordinate, currentDate);
                this.drawDateVerticalLine(coordinate);
                lastDrawnDate = currentDate;
            }

            this.drawPiece(coordinate, this.record[i]);
            this.drawVolume(coordinate, i);
        }
    }

    // return yyyy/MM/dd
    private getDateText(date: Date): string {
        return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    }

    // draw date text
    private drawDateText(coordinate: Coordinate, date: Date): void {
        this.context.font = '13px Ariel';
        this.context.fillStyle = this.option.style.tagColor;
        this.context.fillText(this.getDateText(date), coordinate.startX, this.context.canvas.height - 2);
    }

    private drawDateVerticalLine(coordinate: Coordinate): void {
        this.context.beginPath();
        this.context.moveTo(coordinate.middleX, 0);
        this.context.lineTo(coordinate.middleX, this.context.canvas.height - this.option.layout.dateTagHeight);
        this.context.closePath();
        this.context.lineWidth = 0.5;
        this.context.strokeStyle = this.option.style.backLineColor;
        this.context.stroke();
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

        this.context.strokeStyle = this.option.style.pieceBorderColor;
        this.context.stroke();
        // 開盤價大於收盤價就表示上漲
        this.context.fillStyle = record.openedPrice <= record.closedPrice ?
            this.option.style.risingColor : this.option.style.decliningColor;
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

        this.volumeHeight = (this.option.layout.volumeHeight -
            this.option.layout.gapBetweenVolumeAndViewer -
            this.option.layout.dateTagHeight) / highestVolume;
    }
    // 計算成交量的X軸
    private computeVolumeY(volume: number): number {
        return this.context.canvas.height - (volume * this.volumeHeight) - this.option.layout.dateTagHeight;
    }

    private drawVolume(coordinate: Coordinate, index: number): void {
        const record = this.record[index];
        let fillStyle = this.option.style.volumeFlatColor;

        if (index - 1 >= 0) {
            const record1 = this.record[index - 1];
            if (record.closedPrice > record1.closedPrice) {
                fillStyle = this.option.style.volumeRisingColor;
            } else if (record.closedPrice < record1.closedPrice) {
                fillStyle = this.option.style.volumeDecliningColor;
            }
        }


        const Y = this.computeVolumeY(record.volume);
        const baseY = this.context.canvas.height - this.option.layout.dateTagHeight;

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

    private showHoverLine(record: StockRecord): void {
        const hoverCoordinate = record.coordinate;
        this.cancelHoverLine();

        // copy large image to avoid window is too small
        // record vertial original image
        const vX = hoverCoordinate.startX - 10;
        const vWidth = hoverCoordinate.endX - hoverCoordinate.startX + 20;
        const lastVerticalImage = this.context.getImageData(vX, 0, vWidth, this.context.canvas.height);
        this.storedImages['lastVerticalImage'] = new CanvasImage(lastVerticalImage, vX, 0);

        // record horizon original image
        const Y = this.computePriceY(record.closedPrice);
        const hY = Y - 10;
        const hWidth = this.context.canvas.width - this.option.layout.priceTagWidth;
        const lastHorizontalImage = this.context.getImageData(0, hY, hWidth, 15);
        this.storedImages['lastHorizontalImage'] = new CanvasImage(lastHorizontalImage, 0, hY);

        // record hover price region image
        const lastPriceImage = this.context.getImageData(hWidth, Y - 30, this.option.layout.priceTagWidth, 50);
        this.storedImages['lastPriceImage'] = new CanvasImage(lastPriceImage, hWidth, Y - 30);

        // draw hover closed price
        this.context.fillStyle = this.option.style.hoverLineColor;
        this.context.fillRect(hWidth, Y - 20, this.option.layout.priceTagWidth, 30);
        this.context.font = '13px Arial';
        this.context.fillStyle = 'white';
        this.context.fillText(record.closedPrice.toString(), hWidth + 5, Y);

        this.drawHoverDate(record);

        // draw vertical line
        this.context.beginPath();
        // this.context.setLineDash([5, 15]); if want to use dash line
        this.context.moveTo(hoverCoordinate.middleX, 0);
        // +2 because date rect
        this.context.lineTo(hoverCoordinate.middleX, this.context.canvas.height - this.option.layout.dateTagHeight + 2);
        this.context.closePath();
        this.context.lineWidth = 0.5;
        this.context.strokeStyle = this.option.style.hoverLineColor;
        this.context.stroke();

        // draw horizontal line
        this.context.beginPath();
        this.context.moveTo(0, Y);
        this.context.lineTo(hWidth, Y);
        this.context.closePath();
        this.context.lineWidth = 0.5;
        this.context.strokeStyle = this.option.style.hoverLineColor;
        this.context.stroke();
    }

    private drawHoverDate(record: StockRecord): void {
        const hoverCoordinate = record.coordinate;
        let startX = hoverCoordinate.startX;
        let width = 75;
        let copyWidth = 80;

        if (hoverCoordinate.startX + width > this.context.canvas.width) {
            startX = hoverCoordinate.endX - width;
        }

        // record hover date image
        const dY = this.context.canvas.height - this.option.layout.dateTagHeight;
        const lastDateTextImage = this.context.getImageData(startX, dY, copyWidth, this.option.layout.dateTagHeight);
        this.storedImages['lastDateTextImage'] = new CanvasImage(lastDateTextImage, startX, dY);


        // draw hover date
        this.context.fillStyle = this.option.style.hoverLineColor;
        this.context.fillRect(startX, dY + 2, width, this.option.layout.dateTagHeight);
        this.context.font = '13px Arial';
        this.context.fillStyle = 'white';
        this.context.fillText(this.getDateText(record.date), startX + 5, this.context.canvas.height - 2);
    }


    private hoverLineMoveTo(index: number, showHoverLine: boolean) {
        const hoverRecord = this.record[index];

        if (hoverRecord) {

            if (showHoverLine) {
                this.showHoverLine(hoverRecord);
            }

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
        const len1 = this.record.length;
        const rect = this.context.canvas.getBoundingClientRect();
        const hoverX = evt.clientX - rect.left;
        const hoverY = evt.clientY - rect.top;

        for (; index < len1; index++) {
            const r1 = this.record[index].coordinate;
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
            // put back the original image
            const lastVerticalImage = <CanvasImage>this.storedImages['lastVerticalImage'];
            const lastHorizontalImage = <CanvasImage>this.storedImages['lastHorizontalImage'];
            const lastPriceImage = <CanvasImage>this.storedImages['lastPriceImage'];
            const lastDateTextImage = <CanvasImage>this.storedImages['lastDateTextImage'];

            this.context.putImageData(lastVerticalImage.image, lastVerticalImage.x, lastVerticalImage.y);
            this.context.putImageData(lastHorizontalImage.image, lastHorizontalImage.x, lastHorizontalImage.y);
            this.context.putImageData(lastPriceImage.image, lastPriceImage.x, lastPriceImage.y);
            this.context.putImageData(lastDateTextImage.image, lastDateTextImage.x, lastDateTextImage.y);

            this.lastHoverIndex = -1;
            this.storedImages['lastVerticalImage'] = null;
            this.storedImages['lastHorizontalImage'] = null;
            this.storedImages['lastPriceImage'] = null;
            this.storedImages['lastDateTextImage'] = null;
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

