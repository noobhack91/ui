﻿// react/src/utils/constants/serverErrorMessages.ts

// Define the type for server error messages
type ServerErrorMessage = {
    serverMessage: string;
    clientMessage: string;
};

// Define the constant array of server error messages
export const serverErrorMessages: ServerErrorMessage[] = [
    {
        serverMessage: "Cannot have more than one active order for the same orderable and care setting at same time",
        clientMessage: "One or more drugs you are trying to order are already active. Please change the start date of the conflicting drug or remove them from the new prescription."
    },
    {
        serverMessage: "[Order.cannot.have.more.than.one]",
        clientMessage: "One or more drugs you are trying to order are already active. Please change the start date of the conflicting drug or remove them from the new prescription."
    }
];
