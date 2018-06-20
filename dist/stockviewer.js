var SMAComputer = (function () {
    function SMAComputer() {
    }
    SMAComputer.prototype.compute = function (data, day) {
        var tmp = [];
        var SMA = [];
        var len = data.length;
        for (var i = 0; i < day && i < len; i++) {
            tmp.push(data[i]);
        }
        SMA.push(this.computeOne(tmp, day));
        for (var i = day; i < len; i++) {
            tmp = tmp.slice(1, data.length);
            tmp.push(data[i]);
            SMA.push(this.computeOne(tmp, day));
        }
        return SMA;
    };
    SMAComputer.prototype.getIndices = function (data, day) {
        var len = data.length;
        var indices = [];
        for (var i = 0; i + day < len; i++) {
            indices.push(day + i);
        }
        return indices;
    };
    SMAComputer.prototype.computeOne = function (data, day) {
        var total = 0;
        var len = data.length;
        for (var i = 0; i < len; i++) {
            total += data[i];
        }
        return (total / day);
    };
    return SMAComputer;
}());
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
var LayoutOption = (function () {
    function LayoutOption() {
        this.priceTagWidth = 50;
        this.dateTagHeight = 20;
        this.gapBetweenVolumeAndViewer = 20;
    }
    return LayoutOption;
}());
var StyleOption = (function () {
    function StyleOption() {
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
    return StyleOption;
}());
var AdvancedOption = (function () {
    function AdvancedOption() {
        this.SMADay = [];
        this.SMAColor = [];
    }
    AdvancedOption.prototype.addSMA = function (day, color) {
        var index = this.SMADay.indexOf(day);
        if (index < 0) {
            this.SMADay.push(day);
            this.SMAColor.push(color);
        }
    };
    AdvancedOption.prototype.removeSMA = function (day) {
        var index = this.SMADay.indexOf(day);
        if (index > -1) {
            this.SMADay.splice(index, 1);
            this.SMAColor.splice(index, 1);
        }
    };
    return AdvancedOption;
}());
var ViewOption = (function () {
    function ViewOption() {
        this.layout = new LayoutOption();
        this.style = new StyleOption();
        this.responsive = true;
        this.advance = new AdvancedOption();
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
        var canvas = document.getElementById(this.canvasId);
        this.context = canvas.getContext('2d');
        this.afterCanvasMouseMove = new Array();
        this.SMAComputer = new SMAComputer();
        this.option = option || this.defaultOption();
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
        this.drawAdvanceOption();
    };
    StockViewer.prototype.defaultOption = function () {
        var option = new ViewOption();
        option.layout.volumeHeight = this.context.canvas.height * 0.2;
        option.layout.viewerHeight = this.context.canvas.height * 0.8;
        return option;
    };
    StockViewer.prototype.computeWidth = function () {
        var width = (this.context.canvas.width - this.option.layout.priceTagWidth) / this.record.length;
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
        this.pieceHeight = this.option.layout.viewerHeight / pieces;
        this.highestPrice = highest;
        this.lowestPrice = lowest;
    };
    StockViewer.prototype.drawPriceLine = function () {
        var price = this.lowestPrice;
        price = Math.ceil(price);
        var add = Math.floor(price * 0.1);
        var width = this.context.canvas.width - this.option.layout.priceTagWidth;
        while (price < this.highestPrice) {
            var Y = this.computePriceY(price);
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
    };
    StockViewer.prototype.drawBaseLine = function () {
        this.context.beginPath();
        this.context.moveTo(0, this.option.layout.viewerHeight);
        this.context.lineTo(this.context.canvas.width - this.option.layout.priceTagWidth, this.option.layout.viewerHeight);
        this.context.closePath();
        this.context.lineWidth = 0.5;
        this.context.strokeStyle = this.option.style.baseLineColor;
        this.context.stroke();
        var volumeBaseLineHeight = (this.option.layout.viewerHeight + this.option.layout.volumeHeight);
        this.context.beginPath();
        this.context.moveTo(0, volumeBaseLineHeight - this.option.layout.dateTagHeight);
        this.context.lineTo(this.context.canvas.width - this.option.layout.priceTagWidth, volumeBaseLineHeight - this.option.layout.dateTagHeight);
        this.context.closePath();
        this.context.lineWidth = 0.5;
        this.context.strokeStyle = this.option.style.baseLineColor;
        this.context.stroke();
    };
    StockViewer.prototype.computePriceY = function (price) {
        return this.option.layout.viewerHeight - (((price - this.lowestPrice) / 0.05) * this.pieceHeight);
    };
    StockViewer.prototype.computeIndexX = function (index) {
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
    };
    StockViewer.prototype.getDateText = function (date) {
        return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
    };
    StockViewer.prototype.drawDateText = function (coordinate, date) {
        var textHeight = this.option.layout.volumeHeight + this.option.layout.viewerHeight;
        this.context.font = '13px Ariel';
        this.context.fillStyle = this.option.style.tagColor;
        this.context.fillText(this.getDateText(date), coordinate.startX, textHeight - 2);
    };
    StockViewer.prototype.drawDateVerticalLine = function (coordinate) {
        var height = this.option.layout.viewerHeight + this.option.layout.volumeHeight;
        this.context.beginPath();
        this.context.moveTo(coordinate.middleX, 0);
        this.context.lineTo(coordinate.middleX, height - this.option.layout.dateTagHeight);
        this.context.closePath();
        this.context.lineWidth = 0.5;
        this.context.strokeStyle = this.option.style.backLineColor;
        this.context.stroke();
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
        this.context.strokeStyle = this.option.style.pieceBorderColor;
        this.context.stroke();
        this.context.fillStyle = record.openedPrice <= record.closedPrice ?
            this.option.style.risingColor : this.option.style.decliningColor;
        this.context.fill();
    };
    StockViewer.prototype.computeOneCoordinate = function (index) {
        var record = this.record[index];
        var coordinate = new Coordinate();
        var X = this.computeIndexX(index);
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
        this.volumeHeight = (this.option.layout.volumeHeight -
            this.option.layout.gapBetweenVolumeAndViewer -
            this.option.layout.dateTagHeight) / highestVolume;
    };
    StockViewer.prototype.computeVolumeY = function (volume) {
        var height = this.option.layout.volumeHeight + this.option.layout.viewerHeight;
        return height - (volume * this.volumeHeight) - this.option.layout.dateTagHeight;
    };
    StockViewer.prototype.drawVolume = function (coordinate, index) {
        var record = this.record[index];
        var fillStyle = this.option.style.volumeFlatColor;
        if (index - 1 >= 0) {
            var record1 = this.record[index - 1];
            if (record.closedPrice > record1.closedPrice) {
                fillStyle = this.option.style.volumeRisingColor;
            }
            else if (record.closedPrice < record1.closedPrice) {
                fillStyle = this.option.style.volumeDecliningColor;
            }
        }
        var height = this.option.layout.viewerHeight + this.option.layout.volumeHeight;
        var Y = this.computeVolumeY(record.volume);
        var baseY = height - this.option.layout.dateTagHeight;
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
    StockViewer.prototype.showHoverLine = function (record) {
        var hoverCoordinate = record.coordinate;
        this.cancelHoverLine();
        var vX = hoverCoordinate.startX - 10;
        var vWidth = hoverCoordinate.endX - hoverCoordinate.startX + 20;
        var lastVerticalImage = this.context.getImageData(vX, 0, vWidth, this.context.canvas.height);
        this.storedImages['lastVerticalImage'] = new CanvasImage(lastVerticalImage, vX, 0);
        var Y = this.computePriceY(record.closedPrice);
        var hY = Y - 10;
        var hWidth = this.context.canvas.width - this.option.layout.priceTagWidth;
        var lastHorizontalImage = this.context.getImageData(0, hY, hWidth, 15);
        this.storedImages['lastHorizontalImage'] = new CanvasImage(lastHorizontalImage, 0, hY);
        var lastPriceImage = this.context.getImageData(hWidth, Y - 30, this.option.layout.priceTagWidth, 50);
        this.storedImages['lastPriceImage'] = new CanvasImage(lastPriceImage, hWidth, Y - 30);
        this.context.fillStyle = this.option.style.hoverLineColor;
        this.context.fillRect(hWidth, Y - 20, this.option.layout.priceTagWidth, 30);
        this.context.font = '13px Arial';
        this.context.fillStyle = 'white';
        this.context.fillText(record.closedPrice.toString(), hWidth + 5, Y);
        this.drawHoverDate(record);
        this.context.beginPath();
        this.context.moveTo(hoverCoordinate.middleX, 0);
        this.context.lineTo(hoverCoordinate.middleX, this.context.canvas.height - this.option.layout.dateTagHeight + 2);
        this.context.closePath();
        this.context.lineWidth = 0.5;
        this.context.strokeStyle = this.option.style.hoverLineColor;
        this.context.stroke();
        this.context.beginPath();
        this.context.moveTo(0, Y);
        this.context.lineTo(hWidth, Y);
        this.context.closePath();
        this.context.lineWidth = 0.5;
        this.context.strokeStyle = this.option.style.hoverLineColor;
        this.context.stroke();
    };
    StockViewer.prototype.drawHoverDate = function (record) {
        var hoverCoordinate = record.coordinate;
        var startX = hoverCoordinate.startX;
        var width = 75;
        var copyWidth = 80;
        if (hoverCoordinate.startX + width > this.context.canvas.width) {
            startX = hoverCoordinate.endX - width;
        }
        var height = this.option.layout.volumeHeight + this.option.layout.viewerHeight;
        var dY = height - this.option.layout.dateTagHeight;
        var lastDateTextImage = this.context.getImageData(startX, dY, copyWidth, this.option.layout.dateTagHeight);
        this.storedImages['lastDateTextImage'] = new CanvasImage(lastDateTextImage, startX, dY);
        this.context.fillStyle = this.option.style.hoverLineColor;
        this.context.fillRect(startX, dY + 2, width, this.option.layout.dateTagHeight);
        this.context.font = '13px Arial';
        this.context.fillStyle = 'white';
        this.context.fillText(this.getDateText(record.date), startX + 5, height - 2);
    };
    StockViewer.prototype.hoverLineMoveTo = function (index, showHoverLine) {
        var hoverRecord = this.record[index];
        if (hoverRecord) {
            if (showHoverLine) {
                this.showHoverLine(hoverRecord);
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
        var len1 = this.record.length;
        var rect = this.context.canvas.getBoundingClientRect();
        var hoverX = evt.clientX - rect.left;
        var hoverY = evt.clientY - rect.top;
        for (; index < len1; index++) {
            var r1 = this.record[index].coordinate;
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
    StockViewer.prototype.drawLine = function (data, indices, color) {
        var len = data.length;
        this.context.beginPath();
        for (var i = 0; i < len; i++) {
            var Y = this.computePriceY(data[i]);
            var X = this.computeIndexX(indices[i]);
            var middleX = (X.start + X.end) * 0.5;
            if (i === 0) {
                this.context.moveTo(middleX, Y);
            }
            else {
                this.context.lineTo(middleX, Y);
            }
        }
        this.context.strokeStyle = color;
        this.context.lineWidth = 0.5;
        this.context.stroke();
    };
    StockViewer.prototype.drawAdvanceOption = function () {
        this.drawSMA();
    };
    StockViewer.prototype.drawSMA = function () {
        var len = this.option.advance.SMADay.length;
        var len1 = this.record.length;
        var data = [];
        for (var i = 0; i < len1; i++) {
            data.push(this.record[i].closedPrice);
        }
        for (var i = 0; i < len; i++) {
            var day = this.option.advance.SMADay[i];
            var color = this.option.advance.SMAColor[i];
            var dataOfSMA = this.SMAComputer.compute(data, day);
            var indicesOfSMA = this.SMAComputer.getIndices(data, day);
            this.drawLine(dataOfSMA, indicesOfSMA, color);
        }
    };
    return StockViewer;
}());
