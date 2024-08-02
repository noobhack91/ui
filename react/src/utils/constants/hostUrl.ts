// react/src/utils/constants/hostUrl.ts

const hostUrl: string = localStorage.getItem('host') ? `https://${localStorage.getItem('host')}` : "";

export default hostUrl;
