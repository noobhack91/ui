import React from 'react';

interface DiseaseTemplateProps {
    template: any;
    config: any;
    patient: any;
    showDateTimeForIntake: boolean;
    showTimeForProgress: boolean;
    sectionId: any;
}

const DiseaseTemplate: React.FC<DiseaseTemplateProps> = ({
    template,
    config,
    patient,
    showDateTimeForIntake,
    showTimeForProgress,
    sectionId
}) => {

    const dateTimeDisplayConfig = (obsTemplate: any) => {
        let showDate = false;
        let showTime = false;
        if (obsTemplate.conceptClass === 'caseIntakeConceptClass') { // SECOND AGENT: [MISSING CONTEXT] - Replace 'caseIntakeConceptClass' with the actual constant from Bahmni.Clinical.Constants
            if (showDateTimeForIntake) {
                showDate = true;
                showTime = true;
            }
        } else {
            if (showTimeForProgress) {
                showTime = true;
            }
        }
        return {
            showDate: showDate,
            showTime: showTime
        };
    };

    const isIntakeTemplate = (obsTemplate: any) => {
        return obsTemplate.conceptClass === 'caseIntakeConceptClass'; // SECOND AGENT: [MISSING CONTEXT] - Replace 'caseIntakeConceptClass' with the actual constant from Bahmni.Clinical.Constants
    };

    const showGroupDateTime = config.showGroupDateTime !== false;

    return (
        <div>

            <h3>Disease Template</h3>
    
                {template.map((obsTemplate: any, index: number) => (
                    <div key={index}>
                
                            <strong>Concept Class:</strong> {obsTemplate.conceptClass}
                        </div>
                
                            <strong>Show Date:</strong> {dateTimeDisplayConfig(obsTemplate).showDate ? 'Yes' : 'No'}
                        </div>
                
                            <strong>Show Time:</strong> {dateTimeDisplayConfig(obsTemplate).showTime ? 'Yes' : 'No'}
                        </div>
                
                            <strong>Is Intake Template:</strong> {isIntakeTemplate(obsTemplate) ? 'Yes' : 'No'}
                        </div>
                    </div>
                ))}
            </div>
            {showGroupDateTime && (
        
                    <strong>Group Date Time is shown</strong>
                </div>
            )}
        </div>
    );
};

export default DiseaseTemplate;
