import React, { useState } from 'react';

interface FallbackSrcProps {
    src: string;
    fallbackSrc: string;
    alt?: string;
}

const FallbackSrc: React.FC<FallbackSrcProps> = ({ src, fallbackSrc, alt }) => {
    const [imgSrc, setImgSrc] = useState(src);

    const handleError = () => {
        setImgSrc(fallbackSrc);
    };

    return <img src={imgSrc} onError={handleError} alt={alt} />;
};

export default FallbackSrc;
