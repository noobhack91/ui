import axios from 'axios';

interface PrinterService {
    print: (templateUrl: string, data: any, pageTitle?: string) => Promise<void>;
    printFromScope: (templateUrl: string, scope: any, afterPrint?: () => void) => Promise<void>;
}

const printer: PrinterService = {
    async print(templateUrl, data, pageTitle = null) {
        document.title = pageTitle || document.title;
        const response = await axios.get(templateUrl);
        const template = response.data;
        const printScope = { ...data };
        const element = document.createElement('div');
        element.innerHTML = template;

        Object.keys(printScope).forEach(key => {
            element.innerHTML = element.innerHTML.replace(new RegExp(`{{${key}}}`, 'g'), printScope[key]);
        });

        await printHtml(element.innerHTML);
        document.title = pageTitle || document.title;
    },

    async printFromScope(templateUrl, scope, afterPrint) {
        document.title = scope.pageTitle || document.title;
        const response = await axios.get(templateUrl);
        const template = response.data;
        const element = document.createElement('div');
        element.innerHTML = template;

        Object.keys(scope).forEach(key => {
            element.innerHTML = element.innerHTML.replace(new RegExp(`{{${key}}}`, 'g'), scope[key]);
        });

        await printHtml(element.innerHTML);
        if (afterPrint) {
            afterPrint();
        }
        document.title = scope.pageTitle || document.title;
    }
};

const printHtml = (html: string): Promise<void> => {
    return new Promise((resolve) => {
        const hiddenFrame = document.createElement('iframe');
        hiddenFrame.style.visibility = 'hidden';
        document.body.appendChild(hiddenFrame);

        hiddenFrame.contentWindow!.printAndRemove = function () {
            hiddenFrame.contentWindow!.print();
            document.body.removeChild(hiddenFrame);
            resolve();
        };

        const htmlContent = `
            <!doctype html>
            <html>
                <body onload="printAndRemove();">
                    ${html}
                </body>
            </html>
        `;

        const doc = hiddenFrame.contentWindow!.document.open("text/html", "replace");
        doc.write(htmlContent);
        doc.close();
    });
};

export default printer;
