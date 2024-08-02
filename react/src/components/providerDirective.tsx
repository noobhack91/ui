import React from 'react';

interface ProviderDirectiveProps {
    creatorName?: string;
    providerName: string;
    providerDate?: string;
}

const ProviderDirective: React.FC<ProviderDirectiveProps> = ({ creatorName, providerName, providerDate }) => {
    return (
        <span>
            {creatorName && providerName && creatorName !== providerName && (
                <span>
                    {creatorName} {`ON_BEHALF_OF_TRANSLATION_KEY`} {/* Assuming translation logic will be handled elsewhere */}
                </span>
            )}
            {providerName}
            {providerDate && (
                <span>
                    {providerDate} {/* Assuming bahmniTime filter logic will be handled elsewhere */}
                </span>
            )}
        </span>
    );
};

export default ProviderDirective;
