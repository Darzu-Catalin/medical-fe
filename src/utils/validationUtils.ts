import React from 'react';

export const validateNameInput = (event: React.FormEvent<HTMLInputElement>) => {
    const invalidChars = /[0-9!@#$%^&*(),.?":{}|<>]/g;
    const inputElement = event.target as HTMLInputElement;
    if (invalidChars.test(inputElement.value)) {
        inputElement.value = inputElement.value.replace(invalidChars, '');
    }
};

export const validatePhoneInput = (event: React.FormEvent<HTMLInputElement>) => {
    const invalidChars = /[^0-9+\-() ]/g;
    const inputElement = event.target as HTMLInputElement;
    if (invalidChars.test(inputElement.value)) {
        inputElement.value = inputElement.value.replace(invalidChars, '');
    }
};

export const validateEmailInput = (event: React.FormEvent<HTMLInputElement>) => {
    // Allow common email chars including '+'
    const invalidChars = /[^a-zA-Z0-9@._+\-]/g;
    const inputElement = event.target as HTMLInputElement;
    if (invalidChars.test(inputElement.value)) {
        inputElement.value = inputElement.value.replace(invalidChars, '');
    }
};

// validate number input
export const validateNumberInput = (event: React.FormEvent<HTMLInputElement>) => {
    const invalidChars = /[^1-9]/g;
    const inputElement = event.target as HTMLInputElement;
    if (invalidChars.test(inputElement.value)) {
        inputElement.value = inputElement.value.replace(invalidChars, '');
    }
};