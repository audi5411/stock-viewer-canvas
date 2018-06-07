var StockRecord = (function () {
    function StockRecord(date, highestPrice, lowestPrice, openedPrice, closedPrice, volume) {
        this.date = date;
        this.highestPrice = highestPrice;
        this.lowestPrice = lowestPrice;
        this.openedPrice = openedPrice;
        this.closedPrice = closedPrice;
        this.volume = volume;
    }
    return StockRecord;
}());
var ViewOption = (function () {
    function ViewOption(volumeHeight, viewerHeight, priceTextWidth, dateTextHeight, volumeViewerGap, priceLineStokeStyle, priceBorderColor, risingColor, decliningColor, volumeBorderColor, volumeRisingColor, volumeDecliningColor, volumeFlatColor, hoverLineColor, responsive) {
        this.volumeHeight = volumeHeight;
        this.viewerHeight = viewerHeight;
        this.priceTextWidth = priceTextWidth;
        this.dateTextHeight = dateTextHeight;
        this.volumeViewerGap = volumeViewerGap;
        this.priceLineStokeStyle = priceLineStokeStyle;
        this.priceBorderColor = priceBorderColor;
        this.risingColor = risingColor;
        this.decliningColor = decliningColor;
        this.volumeBorderColor = volumeBorderColor;
        this.volumeRisingColor = volumeRisingColor;
        this.volumeDecliningColor = volumeDecliningColor;
        this.volumeFlatColor = volumeFlatColor;
        this.hoverLineColor = hoverLineColor;
        this.responsive = responsive;
    }
    return ViewOption;
}());
var Coordinate = (function () {
    function Coordinate() {
    }
    return Coordinate;
}());
var CanvasImage = (function () {
    function CanvasImage(image, x, y) {
        this.image = image;
        this.x = x;
        this.y = y;
    }
    return CanvasImage;
}());
var Dictionary = (function () {
    function Dictionary() {
    }
    return Dictionary;
}());
var StockViewer = (function () {
    function StockViewer(canvasId, record, option) {
        this.canvasId = canvasId;
        this.record = record;
        this.option = option;
        this.defaultOption = {
            volumeHeight: 0,
            viewerHeight: 0,
            priceTextWidth: 50,
            dateTextHeight: 20,
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
        var canvas = document.getElementById(canvasId);
        this.context = canvas.getContext('2d');
        this.afterCanvasMouseMove = new Array();
        this.option = option || this.defaultOption;
        this.initializeOption();
        this.onCanvasMouseMove();
        this.onCanvasKeyDown();
        if (this.option.responsive) {
            this.context.canvas.width = this.context.canvas.parentElement.clientWidth;
            this.context.canvas.style.width = this.context.canvas.parentElement.clientWidth + 'px';
        }
        window.addEventListener('resize', this.onResize.bind(this), false);
    }
    StockViewer.prototype.onResize = function (e) {
        if (this.option.responsive) {
            this.context.canvas.width = this.context.canvas.parentElement.clientWidth;
            this.context.canvas.style.width = this.context.canvas.parentElement.clientWidth + 'px';
            this.display();
        }
    };
    StockViewer.prototype.display = function () {
        if (this.record.length <= 0) {
            return;
        }
        this.storedImages = new Dictionary();
        this.coordinateRecord = new Array();
        this.lastHoverIndex = -1;
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.computeWidth();
        this.computePriceHeight();
        this.computeVolumeHeight();
        this.drawPriceLine();
        this.drawBaseLine();
        this.draw();
    };
    StockViewer.prototype.initializeOption = function () {
        this.defaultOption.volumeHeight = this.context.canvas.height * 0.2;
        this.defaultOption.viewerHeight = this.context.canvas.height * 0.8;
    };
    StockViewer.prototype.computeWidth = function () {
        var width = (this.context.canvas.width - this.option.priceTextWidth) / this.record.length;
        this.pieceWidth = Math.floor(width);
        this.gapWidth = width * 0.25;
        if (width < this.pieceWidth + this.gapWidth) {
            var tmp = (this.pieceWidth + this.gapWidth) - width;
            this.pieceWidth -= tmp;
        }
    };
    StockViewer.prototype.computePriceHeight = function () {
        var highest = 0, lowest = Infinity;
        var len = this.record.length;
        for (var i = 0; i < len; i++) {
            if (this.record[i].highestPrice > highest) {
                highest = this.record[i].highestPrice;
            }
            if (this.record[i].lowestPrice < lowest) {
                lowest = this.record[i].lowestPrice;
            }
        }
        highest = highest * 1.1;
        lowest = lowest * 0.9;
        var pieces = Math.round((highest - lowest) / 0.05);
        this.pieceHeight = this.option.viewerHeight / pieces;
        this.highestPrice = highest;
        this.lowestPrice = lowest;
    };
    StockViewer.prototype.drawPriceLine = function () {
        var price = this.lowestPrice;
        price = Math.ceil(price);
        var add = Math.floor(price * 0.1);
        var width = this.context.canvas.width - this.option.priceTextWidth;
        while (price < this.highestPrice) {
            var Y = this.computePriceY(price);
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
    };
    StockViewer.prototype.drawBaseLine = function () {
        this.context.beginPath();
        this.context.moveTo(0, this.option.viewerHeight);
        this.context.lineTo(this.context.canvas.width - this.option.priceTextWidth, this.option.viewerHeight);
        this.context.closePath();
        this.context.lineWidth = 0.5;
        this.context.strokeStyle = 'black';
        this.context.stroke();
        this.context.beginPath();
        this.context.moveTo(0, this.context.canvas.height - this.option.dateTextHeight);
        this.context.lineTo(this.context.canvas.width - this.option.priceTextWidth, this.context.canvas.height - this.option.dateTextHeight);
        this.context.closePath();
        this.context.lineWidth = 0.5;
        this.context.strokeStyle = 'black';
        this.context.stroke();
    };
    StockViewer.prototype.computePriceY = function (price) {
        return this.option.viewerHeight - (((price - this.lowestPrice) / 0.05) * this.pieceHeight);
    };
    StockViewer.prototype.computePriceX = function (index) {
        var startX = index * (this.pieceWidth + this.gapWidth);
        var endX = (index + 1) * (this.pieceWidth + this.gapWidth) - this.gapWidth;
        return {
            start: startX,
            end: endX
        };
    };
    StockViewer.prototype.draw = function () {
        var len = this.record.length;
        var lastDrawnDate = this.record[0].date;
        var currentDate;
        for (var i = 0; i < len; i++) {
            var coordinate = this.computeOneCoordinate(i);
            currentDate = this.record[i].date;
            if (i === 0 || lastDrawnDate.getMonth() !== currentDate.getMonth()) {
                this.drawDateText(coordinate, currentDate);
                this.drawDateVerticalLine(coordinate);
                lastDrawnDate = currentDate;
            }
            this.drawPiece(coordinate, this.record[i]);
            this.drawVolume(coordinate, i);
            this.recordMiddleX(coordinate);
        }
    };
    StockViewer.prototype.getDateText = function (date) {
        return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
    };
    StockViewer.prototype.drawDateText = function (coordinate, date) {
        this.context.font = '13px Ariel';
        this.context.fillStyle = 'black';
        this.context.fillText(this.getDateText(date), coordinate.startX, this.context.canvas.height);
    };
    StockViewer.prototype.drawDateVerticalLine = function (coordinate) {
        this.context.beginPath();
        this.context.moveTo(coordinate.middleX, 0);
        this.context.lineTo(coordinate.middleX, this.context.canvas.height - this.option.dateTextHeight);
        this.context.closePath();
        this.context.lineWidth = 0.5;
        this.context.strokeStyle = this.option.priceLineStokeStyle;
        this.context.stroke();
    };
    StockViewer.prototype.recordMiddleX = function (coordinate) {
        var tmp = new Coordinate();
        tmp.middleX = coordinate.middleX;
        tmp.startX = coordinate.startX;
        tmp.endX = coordinate.endX;
        this.coordinateRecord.push(tmp);
    };
    StockViewer.prototype.drawPiece = function (coordinate, record) {
        this.context.beginPath();
        this.context.moveTo(coordinate.startX, coordinate.startY);
        this.context.lineTo(coordinate.middleX, coordinate.startY);
        this.context.lineTo(coordinate.middleX, coordinate.highestY);
        this.context.lineTo(coordinate.middleX, coordinate.startY);
        this.context.lineTo(coordinate.endX, coordinate.startY);
        this.context.lineTo(coordinate.endX, coordinate.endY);
        this.context.lineTo(coordinate.middleX, coordinate.endY);
        this.context.lineTo(coordinate.middleX, coordinate.lowwestY);
        this.context.lineTo(coordinate.middleX, coordinate.endY);
        this.context.lineTo(coordinate.startX, coordinate.endY);
        this.context.lineTo(coordinate.startX, coordinate.startY);
        this.context.closePath();
        this.context.strokeStyle = this.option.priceBorderColor;
        this.context.stroke();
        this.context.fillStyle = record.openedPrice <= record.closedPrice ?
            this.option.risingColor : this.option.decliningColor;
        this.context.fill();
    };
    StockViewer.prototype.computeOneCoordinate = function (index) {
        var record = this.record[index];
        var coordinate = new Coordinate();
        var X = this.computePriceX(index);
        coordinate.startX = X.start;
        coordinate.endX = X.end;
        coordinate.middleX = (X.start + X.end) * 0.5;
        if (record.openedPrice > record.closedPrice) {
            coordinate.startY = this.computePriceY(record.openedPrice);
            coordinate.endY = this.computePriceY(record.closedPrice);
        }
        else {
            coordinate.startY = this.computePriceY(record.closedPrice);
            coordinate.endY = this.computePriceY(record.openedPrice);
        }
        coordinate.highestY = this.computePriceY(record.highestPrice);
        coordinate.lowwestY = this.computePriceY(record.lowestPrice);
        return coordinate;
    };
    StockViewer.prototype.computeVolumeHeight = function () {
        var len = this.record.length;
        var highestVolume = 0;
        for (var i = 0; i < len; i++) {
            if (this.record[i].volume > highestVolume) {
                highestVolume = this.record[i].volume;
            }
        }
        this.volumeHeight = (this.option.volumeHeight - this.option.volumeViewerGap - this.option.dateTextHeight) / highestVolume;
    };
    StockViewer.prototype.computeVolumeY = function (volume) {
        return this.context.canvas.height - (volume * this.volumeHeight) - this.option.dateTextHeight;
    };
    StockViewer.prototype.drawVolume = function (coordinate, index) {
        var record = this.record[index];
        var fillStyle = this.option.volumeFlatColor;
        if (index - 1 >= 0) {
            var record1 = this.record[index - 1];
            if (record.closedPrice > record1.closedPrice) {
                fillStyle = this.option.volumeRisingColor;
            }
            else if (record.closedPrice < record1.closedPrice) {
                fillStyle = this.option.volumeDecliningColor;
            }
        }
        var Y = this.computeVolumeY(record.volume);
        var baseY = this.context.canvas.height - this.option.dateTextHeight;
        this.context.beginPath();
        this.context.moveTo(coordinate.startX, baseY);
        this.context.lineTo(coordinate.startX, Y);
        this.context.lineTo(coordinate.endX, Y);
        this.context.lineTo(coordinate.endX, baseY);
        this.context.lineTo(coordinate.startX, baseY);
        this.context.closePath();
        this.context.fillStyle = fillStyle;
        this.context.fill();
    };
    StockViewer.prototype.showHoverLine = function (hoverCoordinate, record) {
        this.cancelHoverLine();
        var vX = hoverCoordinate.startX - 10;
        var vWidth = hoverCoordinate.endX - hoverCoordinate.startX + 20;
        var lastVerticalImage = this.context.getImageData(vX, 0, vWidth, this.context.canvas.height);
        this.storedImages['lastVerticalImage'] = new CanvasImage(lastVerticalImage, vX, 0);
        var Y = this.computePriceY(record.closedPrice);
        var hY = Y - 10;
        var hWidth = this.context.canvas.width - this.option.priceTextWidth;
        var lastHorizontalImage = this.context.getImageData(0, hY, hWidth, 15);
        this.storedImages['lastHorizontalImage'] = new CanvasImage(lastHorizontalImage, 0, hY);
        var lastPriceImage = this.context.getImageData(hWidth, Y - 30, this.option.priceTextWidth, 50);
        this.storedImages['lastPriceImage'] = new CanvasImage(lastPriceImage, hWidth, Y - 30);
        this.context.fillStyle = this.option.hoverLineColor;
        this.context.fillRect(hWidth, Y - 20, this.option.priceTextWidth, 30);
        this.context.font = '13px Arial';
        this.context.fillStyle = 'white';
        this.context.fillText(record.closedPrice.toString(), hWidth + 5, Y);
        this.drawHoverDate(hoverCoordinate, record);
        this.context.beginPath();
        this.context.moveTo(hoverCoordinate.middleX, 0);
        this.context.lineTo(hoverCoordinate.middleX, this.context.canvas.height - this.option.dateTextHeight + 2);
        this.context.closePath();
        this.context.lineWidth = 0.5;
        this.context.strokeStyle = this.option.hoverLineColor;
        this.context.stroke();
        this.context.beginPath();
        this.context.moveTo(0, Y);
        this.context.lineTo(hWidth, Y);
        this.context.closePath();
        this.context.lineWidth = 0.5;
        this.context.strokeStyle = this.option.hoverLineColor;
        this.context.stroke();
    };
    StockViewer.prototype.drawHoverDate = function (hoverCoordinate, record) {
        var startX = hoverCoordinate.startX;
        var width = 75;
        var copyWidth = 80;
        if (hoverCoordinate.startX + width > this.context.canvas.width) {
            startX = hoverCoordinate.endX - width;
        }
        var dY = this.context.canvas.height - this.option.dateTextHeight;
        var lastDateTextImage = this.context.getImageData(startX, dY, copyWidth, this.option.dateTextHeight);
        this.storedImages['lastDateTextImage'] = new CanvasImage(lastDateTextImage, startX, dY);
        this.context.fillStyle = this.option.hoverLineColor;
        this.context.fillRect(startX, dY + 2, width, this.option.dateTextHeight);
        this.context.font = '13px Arial';
        this.context.fillStyle = 'white';
        this.context.fillText(this.getDateText(record.date), startX + 5, this.context.canvas.height - 2);
    };
    StockViewer.prototype.hoverLineMoveTo = function (index, showHoverLine) {
        var hoverRecord = this.record[index];
        if (hoverRecord) {
            if (showHoverLine) {
                var r1 = this.coordinateRecord[index];
                this.showHoverLine(r1, hoverRecord);
            }
            this.lastHoverIndex = index;
            var len = this.afterCanvasMouseMove.length;
            for (var i = 0; i < len; i++) {
                this.afterCanvasMouseMove[i](hoverRecord);
            }
        }
    };
    StockViewer.prototype.canvasMouseMoveFun = function (evt) {
        var index = 0;
        var show = false;
        var len1 = this.coordinateRecord.length;
        var rect = this.context.canvas.getBoundingClientRect();
        var hoverX = evt.clientX - rect.left;
        var hoverY = evt.clientY - rect.top;
        for (; index < len1; index++) {
            var r1 = this.coordinateRecord[index];
            if (hoverX >= r1.startX && hoverX <= r1.endX) {
                show = true;
                break;
            }
        }
        this.hoverLineMoveTo(index, show);
    };
    StockViewer.prototype.onCanvasMouseMove = function () {
        this.context.canvas.addEventListener('mousemove', this.canvasMouseMoveFun.bind(this), false);
    };
    StockViewer.prototype.addAfterCanvasMouseMove = function (fun, bindObj) {
        this.afterCanvasMouseMove.push(fun.bind(bindObj));
    };
    StockViewer.prototype.cancelHoverLine = function () {
        if (this.lastHoverIndex > -1) {
            var lastVerticalImage = this.storedImages['lastVerticalImage'];
            var lastHorizontalImage = this.storedImages['lastHorizontalImage'];
            var lastPriceImage = this.storedImages['lastPriceImage'];
            var lastDateTextImage = this.storedImages['lastDateTextImage'];
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
    };
    StockViewer.prototype.onCanvasKeyDown = function () {
        window.addEventListener('keydown', this.canvasKeyDownFun.bind(this), false);
    };
    StockViewer.prototype.canvasKeyDownFun = function (e) {
        if (this.lastHoverIndex > -1) {
            var index = 0;
            var acceptedCode = false;
            switch (e.keyCode) {
                case 37:
                    index = this.lastHoverIndex - 1 < 0 ? 0 : this.lastHoverIndex - 1;
                    acceptedCode = true;
                    break;
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
    };
    return StockViewer;
}());
