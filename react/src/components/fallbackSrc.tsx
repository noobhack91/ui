import React, { useState } from 'react';

interface FallbackSrcProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc: string;
}

const FallbackSrc: React.FC<FallbackSrcProps> = ({ fallbackSrc, src, ...props }) => {
    const [imgSrc, setImgSrc] = useState<string | undefined>(src);

    const handleError = () => {
        setImgSrc(fallbackSrc);
    };

    return <img {...props} src={imgSrc} onError={handleError} />;
};

export default FallbackSrc;
