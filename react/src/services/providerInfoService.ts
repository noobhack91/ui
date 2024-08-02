// react/src/services/providerInfoService.ts

interface ProviderInfoService {
    setProvider: (obs: any[]) => void;
}

class ProviderInfoServiceImpl implements ProviderInfoService {
    private provider: any = null;

    setProvider(obs: any[]): void {
        if (this.provider === null) {
            if (obs.length > 0) {
                this.provider = obs[0].providers;
            }
        }
    }
}

const providerInfoService: ProviderInfoService = new ProviderInfoServiceImpl();

export default providerInfoService;
