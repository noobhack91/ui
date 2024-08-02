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
        const tileWidth = 200; // SECOND AGENT: [MISSING CONTEXT] - Replace with actual constant value for patientTileWidth
        const tileHeight = 200; // SECOND AGENT: [MISSING CONTEXT] - Replace with actual constant value for patientTileHeight
        const tilesToFit = Math.ceil(windowWidth * windowHeight / (tileWidth * tileHeight));
        const tilesToLoad = Math.ceil(tilesToFit * 1.5); // SECOND AGENT: [MISSING CONTEXT] - Replace with actual constant value for tileLoadRatio
        setTilesToFit(tilesToFit);
        setTilesToLoad(tilesToLoad);
    };

    const updateVisibleResults = () => {
        const newVisibleResults = searchResults.slice(0, tilesToLoad);

        visibleResults.splice(0, visibleResults.length, ...newVisibleResults);
    };

    const loadMore = () => {
        const last = visibleResults.length;
        const more = searchResults.length - last;
        const toShow = more > tilesToLoad ? tilesToLoad : more;
        if (toShow > 0) {
            const newVisibleResults = [
                ...visibleResults,
                ...searchResults.slice(last, last + toShow)

            setVisibleResults(newVisibleResults);
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

            {visibleResults.map((result, index) => (
                <div key={index}>
                    {/* Render each result here */}
                    {/* Assuming result has a 'name' property for demonstration purposes */}
                    <p>{result.name}</p>
                </div>
            ))}
        </div>

        <button onClick={loadMore}>Load More</button>
        </div>
    );
};

export default Resize;
