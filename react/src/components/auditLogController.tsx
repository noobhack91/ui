import React, { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import { auditLogService } from '../services/auditLogService';
import { messagingService } from '../services/messagingService';
import { useTranslation } from 'react-i18next';
import { DateUtil } from '../utils/constants/DateUtil';

const AuditLogController: React.FC = () => {
    const { t } = useTranslation();
    const [logs, setLogs] = useState([]);
    const [firstIndex, setFirstIndex] = useState(0);
    const [lastIndex, setLastIndex] = useState(0);
    const [startDate, setStartDate] = useState(DateUtil.today());
    const [today] = useState(DateUtil.today());
    const [maxDate] = useState(DateUtil.getDateWithoutTime(today));
    const [username, setUsername] = useState('');
    const [patientId, setPatientId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const getTranslatedMessage = (key: string) => {
        return t(key);
    };

    const isNotEmpty = (value: any) => {
        return value !== undefined && value !== '';
    };

    const mapParamsForRequest = (params: any) => {
        return Object.fromEntries(Object.entries(params).filter(([_, v]) => isNotEmpty(v)));
    };

    const updateIndex = (logs: any[], defaultFirstIndex: number, defaultLastIndex: number) => {
        setFirstIndex(logs.length ? logs[0].auditLogId : defaultFirstIndex);
        setLastIndex(logs.length ? logs[logs.length - 1].auditLogId : defaultLastIndex);
    };

    const setMessage = (logsLength: number, message: string) => {
        setErrorMessage(logsLength ? '' : message);
    };

    const updatePage = (logs: any[], defaultFirstIndex: number, defaultLastIndex: number, message: string) => {
        if (logs.length) {
            setLogs(logs);
        }
        setMessage(logs.length, message);
        updateIndex(logs, defaultFirstIndex, defaultLastIndex);
    };

    const defaultView = (params: any, message: string) => {
        auditLogService.getLogs(params).then((logs: any[]) => {
            logs.reverse();
            updatePage(logs, 0, 0, message);
        });
    };

    const next = () => {
        const params = {
            lastAuditLogId: lastIndex,
            username,
            patientId,
            startFrom: startDate
        };
        const promise = auditLogService.getLogs(mapParamsForRequest(params)).then((logs: any[]) => {
            updatePage(logs, firstIndex, lastIndex, getTranslatedMessage("NO_MORE_EVENTS_FOUND"));
        });
        Spinner.forPromise(promise);
    };

    const prev = () => {
        const message = getTranslatedMessage("NO_MORE_EVENTS_FOUND");
        let promise;
        if (!firstIndex && !lastIndex) {
            promise = defaultView(mapParamsForRequest({
                defaultView: true,
                startFrom: startDate
            }), message);
        } else {
            const params = {
                lastAuditLogId: firstIndex,
                username,
                patientId,
                prev: true,
                startFrom: startDate
            };
            promise = auditLogService.getLogs(mapParamsForRequest(params)).then((logs: any[]) => {
                updatePage(logs, firstIndex, lastIndex, message);
            });
        }
        Spinner.forPromise(promise);
    };

    const runReport = () => {
        if (document.getElementById("startDate")?.classList.contains("ng-invalid-max")) {
            messagingService.showMessage("error", getTranslatedMessage("INVALID_DATE"));
            return;
        }
        const params = {
            username, patientId,
            startFrom: startDate
        };
        const promise = auditLogService.getLogs(mapParamsForRequest(params)).then((logs: any[]) => {
            setLogs(logs);
            setMessage(logs.length, getTranslatedMessage("MATCHING_EVENTS_NOT_FOUND"));
            updateIndex(logs, 0, 0);
        });
        Spinner.forPromise(promise);
    };

    useEffect(() => {
        setLogs([]);
        const promise = defaultView({ startFrom: startDate, defaultView: true }, getTranslatedMessage("NO_EVENTS_FOUND"));
        Spinner.forPromise(promise);
    }, []);

    return (
        <div>

    
                <label>{getTranslatedMessage("USERNAME")}</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
    
                <label>{getTranslatedMessage("PATIENT_ID")}</label>
                <input type="text" value={patientId} onChange={(e) => setPatientId(e.target.value)} />
            </div>
    
                <label>{getTranslatedMessage("START_DATE")}</label>
                <input type="date" id="startDate" value={startDate} max={maxDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
    
                <button onClick={runReport}>{getTranslatedMessage("RUN_REPORT")}</button>
                <button onClick={prev}>{getTranslatedMessage("PREVIOUS")}</button>
                <button onClick={next}>{getTranslatedMessage("NEXT")}</button>
            </div>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
    
                <table>
                    <thead>
                        <tr>
                            <th>{getTranslatedMessage("LOG_ID")}</th>
                            <th>{getTranslatedMessage("USERNAME")}</th>
                            <th>{getTranslatedMessage("PATIENT_ID")}</th>
                            <th>{getTranslatedMessage("ACTION")}</th>
                            <th>{getTranslatedMessage("TIMESTAMP")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.auditLogId}>
                                <td>{log.auditLogId}</td>
                                <td>{log.username}</td>
                                <td>{log.patientId}</td>
                                <td>{log.action}</td>
                                <td>{log.timestamp}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogController;
