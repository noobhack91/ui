import React, { useEffect, useState } from 'react';

interface ResizeProps {
    searchResults: any[];
    visibleResults: any[];
    setVisibleResults: (results: any[]) => void;
}

const Resize: React.FC<ResizeProps> = ({ searchResults, visibleResults, setVisibleResults }) => {
    const [tilesToFit, setTilesToFit] = useState(0);
    const [tilesToLoad, setTilesToLoad] = useState(0);

    const storeWindowDimensions = () => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const tileWidth = Bahmni.Common.PatientSearch.Constants.patientTileWidth;
        const tileHeight = Bahmni.Common.PatientSearch.Constants.patientTileHeight;
        const tilesToFit = Math.ceil(windowWidth * windowHeight / (tileWidth * tileHeight));
        const tilesToLoad = Math.ceil(tilesToFit * Bahmni.Common.PatientSearch.Constants.tileLoadRatio);
        setTilesToFit(tilesToFit);
        setTilesToLoad(tilesToLoad);
    };

    const updateVisibleResults = () => {
        setVisibleResults(searchResults.slice(0, tilesToLoad));
    };

    const loadMore = () => {
        const last = visibleResults.length;
        const more = (searchResults.length - last);
        const toShow = (more > tilesToLoad) ? tilesToLoad : more;
        if (toShow > 0) {
            setVisibleResults([...visibleResults, ...searchResults.slice(last, last + toShow)]);
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
                    {/* Render each result here */}
                </div>
            ))}
        </div>
    );
};

export default Resize;
