import React, { useState, useEffect } from 'react';
import moment from 'moment';
import _ from 'lodash';
import { spinner, surgicalAppointmentService, appService, surgicalAppointmentHelper, surgicalBlockFilter, printer } from '../services'; // Adjust the import paths as necessary
import { Bahmni } from '../utils/constants'; // Adjust the import paths as necessary

const ListViewController: React.FC = () => {
    const [viewDate, setViewDate] = useState(new Date());
    const [weekStartDate, setWeekStartDate] = useState(new Date());
    const [weekEndDate, setWeekEndDate] = useState(new Date());
    const [weekOrDay, setWeekOrDay] = useState('day');
    const [filterParams, setFilterParams] = useState({});
    const [surgicalBlocks, setSurgicalBlocks] = useState([]);
    const [surgicalAppointmentList, setSurgicalAppointmentList] = useState([]);
    const [reverseSort, setReverseSort] = useState(false);
    const [sortColumn, setSortColumn] = useState('');
    const [defaultAttributeTranslations, setDefaultAttributeTranslations] = useState({});
    const [filteredSurgicalAttributeTypes, setFilteredSurgicalAttributeTypes] = useState([]);
    const [tableInfo, setTableInfo] = useState([]);

    useEffect(() => {
        const startDatetime = moment(viewDate).toDate();
        const endDatetime = moment(startDatetime).endOf('day').toDate();
        spinner.forPromise(init(startDatetime, endDatetime));
    }, [viewDate]);

    useEffect(() => {
        const startDatetime = moment(weekStartDate).toDate();
        const endDatetime = moment(weekEndDate).endOf('day').toDate();
        spinner.forPromise(init(startDatetime, endDatetime));
    }, [weekStartDate, weekEndDate]);

    useEffect(() => {
        filterSurgicalBlocksAndMapAppointmentsForDisplay(surgicalBlocks);
    }, [filterParams]);

    const getTableInfo = () => {
        const listViewAttributes = [
            { heading: 'Status', sortInfo: 'status' },
            { heading: 'Day', sortInfo: 'derivedAttributes.expectedStartDate' },
            { heading: 'Date', sortInfo: 'derivedAttributes.expectedStartDate' },
            { heading: 'Identifier', sortInfo: 'derivedAttributes.patientIdentifier' },
            { heading: 'Patient Name', sortInfo: 'derivedAttributes.patientName' },
            { heading: 'Patient Age', sortInfo: 'derivedAttributes.patientAge' },
            { heading: 'Start Time', sortInfo: 'derivedAttributes.expectedStartTime' },
            { heading: 'Est Time', sortInfo: 'derivedAttributes.duration' },
            { heading: 'Actual Time', sortInfo: 'actualStartDatetime' },
            { heading: 'OT#', sortInfo: 'surgicalBlock.location.name' },
            { heading: 'Surgeon', sortInfo: 'surgicalBlock.provider.person.display' }
        ];

        const attributesRelatedToBed = [
            { heading: 'Status Change Notes', sortInfo: 'notes' },
            { heading: 'Bed Location', sortInfo: 'bedLocation' },
            { heading: 'Bed ID', sortInfo: 'bedNumber' }
        ];

        if ($rootScope.showPrimaryDiagnosisForOT != null && $rootScope.showPrimaryDiagnosisForOT !== "") {
            const primaryDiagnosisInfo = [{ heading: 'Primary Diagnoses', sortInfo: 'patientObservations' }];
            return listViewAttributes.concat(getSurgicalAttributesTableInfo(), attributesRelatedToBed, primaryDiagnosisInfo);
        } else {
            return listViewAttributes.concat(getSurgicalAttributesTableInfo(), attributesRelatedToBed);
        }
    };

    const getFilteredSurgicalAttributeTypes = () => {
        const derivedSurgicalAttributes = ['estTimeHours', 'estTimeMinutes', 'cleaningTime'];
        return surgicalAppointmentHelper.getAttributeTypesByRemovingAttributeNames($rootScope.attributeTypes, derivedSurgicalAttributes);
    };

    const getSurgicalAttributesTableInfo = () => {
        return _.map(filteredSurgicalAttributeTypes, (attributeType) => {
            const attributeName = 'surgicalAppointmentAttributes.'.concat(attributeType.name, '.value');
            return {
                heading: attributeType.name,
                sortInfo: attributeType.format === Bahmni.OT.Constants.providerSurgicalAttributeFormat ?
                    attributeName.concat('.person.display') : attributeName
            };
        });
    };

    const filterSurgicalBlocksAndMapAppointmentsForDisplay = (surgicalBlocks) => {
        const clonedSurgicalBlocks = _.cloneDeep(surgicalBlocks);
        const filteredSurgicalBlocks = surgicalBlockFilter(clonedSurgicalBlocks, filterParams);
        const mappedSurgicalBlocks = _.map(filteredSurgicalBlocks, (surgicalBlock) => {
            return surgicalBlockMapper.map(surgicalBlock, $rootScope.attributeTypes, $rootScope.surgeons);
        });

        const updatedMappedSurgicalBlocks = _.map(mappedSurgicalBlocks, (surgicalBlock) => {
            let blockStartDatetime = surgicalBlock.startDatetime;
            surgicalBlock.surgicalAppointments = _.map(surgicalBlock.surgicalAppointments, (appointment) => {
                const mappedAppointment = _.cloneDeep(appointment);
                mappedAppointment.surgicalBlock = surgicalBlock;
                mappedAppointment.derivedAttributes = {};

                const estTimeHours = mappedAppointment.surgicalAppointmentAttributes['estTimeHours'] && mappedAppointment.surgicalAppointmentAttributes['estTimeHours'].value;
                const estTimeMinutes = mappedAppointment.surgicalAppointmentAttributes['estTimeMinutes'] && mappedAppointment.surgicalAppointmentAttributes['estTimeMinutes'].value;
                const cleaningTime = mappedAppointment.surgicalAppointmentAttributes['cleaningTime'] && mappedAppointment.surgicalAppointmentAttributes['cleaningTime'].value;

                mappedAppointment.derivedAttributes.duration = surgicalAppointmentHelper.getAppointmentDuration(
                    estTimeHours, estTimeMinutes, cleaningTime
                );
                mappedAppointment.derivedAttributes.expectedStartDate = moment(blockStartDatetime).startOf('day').toDate();
                mappedAppointment.derivedAttributes.patientIdentifier = mappedAppointment.patient.display.split(' - ')[0];
                mappedAppointment.derivedAttributes.patientAge = mappedAppointment.patient.person.age;
                mappedAppointment.derivedAttributes.patientName = mappedAppointment.patient.display.split(' - ')[1];
                if (mappedAppointment.status === Bahmni.OT.Constants.completed || mappedAppointment.status === Bahmni.OT.Constants.scheduled) {
                    mappedAppointment.derivedAttributes.expectedStartTime = blockStartDatetime;
                    blockStartDatetime = Bahmni.Common.Util.DateUtil.addMinutes(blockStartDatetime, mappedAppointment.derivedAttributes.duration);
                }
                return mappedAppointment;
            });
            surgicalBlock.surgicalAppointments = _.filter(surgicalBlock.surgicalAppointments, (surgicalAppointment) => {
                if (surgicalAppointment.derivedAttributes.expectedStartTime) {
                    const surgicalAppointmentStartDateTime = surgicalAppointment.derivedAttributes.expectedStartTime;
                    const surgicalAppointmentEndDateTime = Bahmni.Common.Util.DateUtil.addMinutes(surgicalAppointmentStartDateTime, surgicalAppointment.derivedAttributes.duration);
                    return surgicalAppointmentStartDateTime < endDatetime && surgicalAppointmentEndDateTime > startDatetime;
                }
                return surgicalAppointment.derivedAttributes.expectedStartDate <= endDatetime
                    && surgicalAppointment.derivedAttributes.expectedStartDate >= startDatetime;
            });
            return surgicalBlock;
        });

        const surgicalAppointmentList = _.reduce(updatedMappedSurgicalBlocks, (surgicalAppointmentList, block) => {
            return surgicalAppointmentList.concat(block.surgicalAppointments);
        }, []);

        const filteredSurgicalAppointmentsByStatus = surgicalAppointmentHelper.filterSurgicalAppointmentsByStatus(
            surgicalAppointmentList, _.map(filterParams.statusList, (status) => {
                return status.name;
            })
        );

        const filteredSurgicalAppointmentsByPatient = surgicalAppointmentHelper.filterSurgicalAppointmentsByPatient(
            filteredSurgicalAppointmentsByStatus, filterParams.patient
        );

        setSurgicalAppointmentList(_.sortBy(filteredSurgicalAppointmentsByPatient, ["derivedAttributes.expectedStartDate", "surgicalBlock.location.name", "derivedAttributes.expectedStartDatetime"]));
    };

    const init = async (startDatetime, endDatetime) => {
        setAddActualTimeDisabled(true);
        setEditDisabled(true);
        setCancelDisabled(true);
        setReverseSort(false);
        setSortColumn("");
        const response = await surgicalAppointmentService.getSurgicalBlocksInDateRange(startDatetime, endDatetime, true, true);
        setSurgicalBlocks(response.data.results);
        filterSurgicalBlocksAndMapAppointmentsForDisplay(response.data.results);
    };

    const isCurrentDateinWeekView = (appointmentDate) => {
        return _.isEqual(moment().startOf('day').toDate(), appointmentDate) && weekOrDay === 'week';
    };

    const printPage = () => {
        const printTemplateUrl = appService.getAppDescriptor().getConfigValue("printListViewTemplateUrl") || 'views/listView.html';
        printer.print(printTemplateUrl, {
            surgicalAppointmentList,
            weekStartDate,
            weekEndDate,
            viewDate,
            weekOrDay,
            isCurrentDate: isCurrentDateinWeekView
        });
    };

    const sortSurgicalAppointmentsBy = (sortColumn) => {
        const emptyObjects = _.filter(surgicalAppointmentList, (appointment) => {
            return !_.property(sortColumn)(appointment);
        });
        const nonEmptyObjects = _.difference(surgicalAppointmentList, emptyObjects);
        const sortedNonEmptyObjects = _.sortBy(nonEmptyObjects, sortColumn);
        if (reverseSort) {
            sortedNonEmptyObjects.reverse();
        }
        setSurgicalAppointmentList(sortedNonEmptyObjects.concat(emptyObjects));
        setSortColumn(sortColumn);
        setReverseSort(!reverseSort);
    };

    const selectSurgicalAppointment = ($event, appointment) => {
        // SECOND AGENT: [MISSING CONTEXT] - Emit event for surgical appointment select
        $event.stopPropagation();
    };

    const deselectSurgicalAppointment = ($event) => {
        // SECOND AGENT: [MISSING CONTEXT] - Emit event for surgical block deselect
        $event.stopPropagation();
    };

    const isStatusPostponed = (status) => {
        return status === Bahmni.OT.Constants.postponed;
    };

    const isStatusCancelled = (status) => {
        return status === Bahmni.OT.Constants.cancelled;
    };

    return (
        <div>
            {/* Render the component UI here */}
        </div>
    );
};

export default ListViewController;
