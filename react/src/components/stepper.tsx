import React, { useState } from 'react';

interface StepperProps {
    obs: {
        disabled: boolean;
        uniqueId: string;
        concept: {
            hiNormal: number | null;
            lowNormal: number | null;
        };
    };
    ngClass?: string;
    focusMe?: boolean;
    ngModel: number;
    setNgModel: (value: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ obs, ngClass, focusMe, ngModel, setNgModel }) => {
    const increment = () => {
        if (obs.concept.hiNormal != null) {
            const currValue = isNaN(ngModel) ? 0 : ngModel;
            if (currValue < obs.concept.hiNormal) {
                updateModel(1);
            }
        } else {
            updateModel(1);
        }
    };

    const decrement = () => {
        if (obs.concept.lowNormal != null) {
            const currValue = isNaN(ngModel) ? 0 : ngModel;
            if (currValue > obs.concept.lowNormal) {
                updateModel(-1);
            }
        } else {
            updateModel(-1);
        }
    };

    const updateModel = (offset: number) => {
        let currValue = 0;
        if (isNaN(ngModel)) {
            if (obs.concept.lowNormal != null) {
                currValue = obs.concept.lowNormal - offset; // To mention the start point for Plus And Minus
                // if - or + is pressed on empty field, set them with low value or 0
            }
        } else {
            currValue = ngModel;
        }
        setNgModel(currValue + offset);
    };

    return (
        <div className="stepper clearfix">
            <button onClick={decrement} className="stepper__btn stepper__minus" disabled={obs.disabled}>-</button>
            <input
                id={obs.uniqueId}
                className={`stepper__field ${ngClass}`}
                type="text"
                value={ngModel}
                onChange={(e) => setNgModel(parseInt(e.target.value, 10))}
                disabled={obs.disabled}
                autoFocus={focusMe}
            />
            <button onClick={increment} className="stepper__btn stepper__plus" disabled={obs.disabled}>+</button>
        </div>
    );
};

export default Stepper;
