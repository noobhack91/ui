import React, { useState, useEffect, useContext } from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import printer from '../services/printer';
import appService from '../services/appService';

interface RoomControllerProps {
    room: any;
}

const RoomController: React.FC<RoomControllerProps> = ({ room }) => {
    const { t } = useTranslation();
    const [defaultTags] = useState(['AVAILABLE', 'OCCUPIED']);
    const [bedTagsColorConfig, setBedTagsColorConfig] = useState([]);
    const [currentView, setCurrentView] = useState('Grid');
    const [showPrintIcon, setShowPrintIcon] = useState(false);
    const [selectedBed, setSelectedBed] = useState(null);
    const [oldBedNumber, setOldBedNumber] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [tableHeader, setTableHeader] = useState([]);

    useEffect(() => {
        const appDescriptor = appService.getAppDescriptor();
        setBedTagsColorConfig(appDescriptor.getConfigValue("colorForTags") || []);
        setShowPrintIcon(appDescriptor.getConfigValue("wardListPrintEnabled") || false);

        if (room.beds) {
            const bedDetails = room.beds.flat().find(bed => bed.bed.bedId === oldBedNumber);
            if (bedDetails) {
                setSelectedBed(bedDetails.bed);
            }
        }
    }, [room, oldBedNumber]);

    const toggleWardView = () => {
        setCurrentView(prevView => (prevView === "Grid" ? "List" : "Grid"));
    };

    const printWardList = () => {
        const printTemplateUrl = appService.getAppDescriptor().getConfigValue('wardListPrintViewTemplateUrl') || 'views/wardListPrint.html';
        const configuredTableHeader = appService.getAppDescriptor().getConfigValue('wardListPrintAttributes');
        if (configuredTableHeader && configuredTableHeader.length > 0) {
            setTableHeader(configuredTableHeader);
        }
        printer.print(printTemplateUrl, {
            wardName: room.name,
            date: moment().format('DD-MMM-YYYY'),
            totalBeds: room.totalBeds,
            occupiedBeds: room.totalBeds - room.availableBeds,
            tableData: tableData,
            tableHeader: tableHeader,
            isEmptyRow: isEmptyRow
        });
    };

    const isEmptyRow = (row: any) => {
        for (let i = 0; i < tableHeader.length; i++) {
            const header = tableHeader[i];
            if (row[header]) {
                return false;
            }
        }
        return true;
    };

    const getTagName = (tag: string) => {
        if (tag === 'AVAILABLE') {
            return t("KEY_AVAILABLE");
        } else if (tag === 'OCCUPIED') {
            return t("KEY_OCCUPIED");
        }
    };

    return (
        <div>
            <button onClick={toggleWardView}>
                {currentView === "Grid" ? "Switch to List View" : "Switch to Grid View"}
            </button>
            {showPrintIcon && <button onClick={printWardList}>Print Ward List</button>}
            {/* Render room details and bed information here */}
        </div>
    );
};

export default RoomController;
