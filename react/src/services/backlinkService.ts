// react/src/services/backlinkService.ts

export class BacklinkService {
    private urls: { label: string, action: () => void }[];

    constructor() {
        this.urls = [];
    }

    reset(): void {
        this.urls = [];
    }

    setUrls(backLinks: { label: string, action: () => void }[]): void {
        this.reset();
        backLinks.forEach(backLink => {
            this.addUrl(backLink);
        });
    }

    addUrl(backLink: { label: string, action: () => void }): void {
        this.urls.push(backLink);
    }

    addBackUrl(label?: string): void {
        const backLabel = label || "Back";
        this.urls.push({ label: backLabel, action: () => window.history.back() });
    }

    getUrlByLabel(label: string): { label: string, action: () => void }[] {
        return this.urls.filter(url => url.label === label);
    }

    getAllUrls(): { label: string, action: () => void }[] {
        return this.urls;
    }
}

const backlinkService = new BacklinkService();
export default backlinkService;
