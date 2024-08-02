import React, { useEffect, useRef } from 'react';

const FixedFirstColumn: React.FC = ({ children }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkIfTableLoaded = setInterval(() => {
            const container = containerRef.current;
            if (container) {
                const tables = container.getElementsByTagName('table');
                if (tables.length > 0) {
                    const rows = container.getElementsByTagName('tr');
                    Array.from(rows).forEach(row => {
                        const columns = row.children;
                        if (columns.length < 1) {
                            // Row with no columns? Ignore it.
                            return;
                        }
                        const column0 = columns[0];
                        const column1 = columns[1];

                        // Calculate heights of each <td>.
                        const height0 = column0.clientHeight;
                        const height1 = column1 ? column1.clientHeight : 0;

                        // Calculate final height.
                        const height = Math.max(height0, height1);

                        // Set heights of <td> and <tr>.
                        column0.style.height = `${height}px`;
                        row.style.height = `${height}px`;

                        if (column1) {
                            column1.style.height = `${height}px`;
                        }

                        // If <td> heights have stabilized.
                        if (height0 !== 0 && height0 === height1) {
                            clearInterval(checkIfTableLoaded);
                        }
                    });
                    clearInterval(checkIfTableLoaded);
                }
            }
        }, 100);

        return () => clearInterval(checkIfTableLoaded);
    }, []);

    return (
        <div className='table-responsive' ref={containerRef}>
            <div className='table-responsive-fixedColumn'>
                {children}
            </div>
        </div>
    );
};

export default FixedFirstColumn;
