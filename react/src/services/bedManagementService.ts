// react/src/services/bedManagementService.ts

interface BedLayout {
    rowNumber: number;
    columnNumber: number;
    bedId: string | null;
    bedNumber: string | null;
    bedType: { displayName: string } | null;
    bedTagMaps: any;
    status: string;
    patient: any;
}

class BedManagementService {
    private maxX: number;
    private maxY: number;
    private minX: number;
    private minY: number;
    private layout: any[];

    constructor() {
        this.maxX = 1;
        this.maxY = 1;
        this.minX = 1;
        this.minY = 1;
        this.layout = [];
    }

    private initialiseMinMaxRowColumnNumbers(): void {
        this.maxX = 1;
        this.maxY = 1;
        this.minX = 1;
        this.minY = 1;
    }

    public createLayoutGrid(bedLayouts: BedLayout[]): any[] {
        this.initialiseMinMaxRowColumnNumbers();
        this.layout = [];
        this.findMaxYMaxX(bedLayouts);
        let bedLayout: BedLayout | null;
        let rowLayout: any[] = [];
        for (let i = this.minX; i <= this.maxX; i++) {
            rowLayout = [];
            for (let j = this.minY; j <= this.maxY; j++) {
                bedLayout = this.getBedLayoutWithCoordinates(i, j, bedLayouts);
                rowLayout.push({
                    empty: this.isEmpty(bedLayout),
                    available: this.isAvailable(bedLayout),
                    bed: {
                        bedId: bedLayout !== null ? bedLayout.bedId : null,
                        bedNumber: bedLayout !== null ? bedLayout.bedNumber : null,
                        bedType: bedLayout !== null && bedLayout.bedType !== null ? bedLayout.bedType.displayName : null,
                        bedTagMaps: bedLayout !== null ? bedLayout.bedTagMaps : null,
                        status: bedLayout !== null ? bedLayout.status : null,
                        patient: bedLayout !== null ? bedLayout.patient : null
                    }
                });
            }
            this.layout.push(rowLayout);
        }
        return this.layout;
    }

    private findMaxYMaxX(bedLayouts: BedLayout[]): void {
        for (let i = 0; i < bedLayouts.length; i++) {
            const bedLayout = bedLayouts[i];
            if (bedLayout.rowNumber > this.maxX) {
                this.maxX = bedLayout.rowNumber;
            }
            if (bedLayout.columnNumber > this.maxY) {
                this.maxY = bedLayout.columnNumber;
            }
        }
    }

    private getBedLayoutWithCoordinates(rowNumber: number, columnNumber: number, bedLayouts: BedLayout[]): BedLayout | null {
        for (let i = 0, len = bedLayouts.length; i < len; i++) {
            if (bedLayouts[i].rowNumber === rowNumber && bedLayouts[i].columnNumber === columnNumber) {
                return bedLayouts[i];
            }
        }
        return null;
    }

    private isEmpty(bedLayout: BedLayout | null): boolean {
        return bedLayout === null || bedLayout.bedId === null;
    }

    private isAvailable(bedLayout: BedLayout | null): boolean {
        if (bedLayout === null) {
            return false;
        }
        return bedLayout.status === "AVAILABLE";
    }
}

export default BedManagementService;
