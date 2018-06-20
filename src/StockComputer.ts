
class SMAComputer {

    constructor() {
    }

    public compute(data: number[], day: number): number[] {
        let tmp: number[] = [] ;
        let SMA: number[] = [] ;
        const len = data.length;

        for ( let i = 0 ; i < day && i < len ; i++ ) {
            tmp.push( data[i] );
        }

        SMA.push( this.computeOne(tmp, day) );

        for ( let i = day ; i < len ; i++ ) {
            tmp = tmp.slice(1, data.length);
            tmp.push( data[i] );
            SMA.push( this.computeOne(tmp, day) );
        }

        return SMA;
    }

    public getIndices(data: number[], day: number): number[] {
        const len = data.length;
        let indices: number[] = [];

        for ( let i = 0 ; i + day < len ; i++ ) {
            indices.push(day + i);
        }

        return indices;
    }


    private computeOne( data: number[], day: number ): number {
        let total = 0;
        const len = data.length ;

        for ( let i = 0 ; i < len ; i++ ) {
            total += data[i];
        }

        return (total / day);
    }

}

