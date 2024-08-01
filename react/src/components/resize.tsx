import React, { useEffect, useState } from 'react';

interface ResizeProps {
    searchResults: any[];
    visibleResults: any[];
}

const Resize: React.FC<ResizeProps> = ({ searchResults, visibleResults }) => {
    const [tilesToFit, setTilesToFit] = useState(0);
    const [tilesToLoad, setTilesToLoad] = useState(0);

    const storeWindowDimensions = () => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const tileWidth = 200; // SECOND AGENT: [MISSING CONTEXT] - Replace with actual constant value
        const tileHeight = 200; // SECOND AGENT: [MISSING CONTEXT] - Replace with actual constant value
        setTilesToFit(Math.ceil(windowWidth * windowHeight / (tileWidth * tileHeight)));
        setTilesToLoad(Math.ceil(tilesToFit * 0.8)); // SECOND AGENT: [MISSING CONTEXT] - Replace with actual constant value
    };

    const updateVisibleResults = () => {
        visibleResults = searchResults.slice(0, tilesToLoad);
    };

    const loadMore = () => {
        const last = visibleResults.length;
        const more = (searchResults.length - last);
        const toShow = (more > tilesToLoad) ? tilesToLoad : more;
        if (toShow > 0) {
            for (let i = 1; i <= toShow; i++) {
                visibleResults.push(searchResults[last + i - 1]);
            }
        }
    };

    useEffect(() => {
        storeWindowDimensions();
        window.addEventListener('resize', storeWindowDimensions);
        return () => {
            window.removeEventListener('resize', storeWindowDimensions);
        };
    }, []);

    useEffect(() => {
        updateVisibleResults();
    }, [searchResults, tilesToFit]);

    return (
        <div onScroll={loadMore}>
            {visibleResults.map((result, index) => (
                <div key={index}>
                    {/* Render each result */}
                </div>
            ))}
        </div>
    );
};

export default Resize;
