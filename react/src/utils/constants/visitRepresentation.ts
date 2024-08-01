// Type definition for the visit representation
type VisitRepresentation = {
    uuid: string;
    startDatetime: string;
    stopDatetime: string;
    visitType: string;
    patient: string;
};

// Constant for visit representation
export const visitRepresentation: VisitRepresentation = {
    uuid: "uuid",
    startDatetime: "startDatetime",
    stopDatetime: "stopDatetime",
    visitType: "visitType",
    patient: "patient"
};
