import React from 'react';
import { Button } from "@patternfly/react-core";
import { PlusCircleIcon, MinusCircleIcon, ArrowCircleDownIcon, ArrowCircleUpIcon } from '@patternfly/react-icons/dist/esm/icons';

const AddButton = (props) => {
    const { icon, iconType, uiSchema, ...btnProps } = props;
    return (
        <Button variant="secondary" {...btnProps} icon={<PlusCircleIcon />}>
            Add
        </Button>
    );
};

const RemoveButton = (props) => {
    const { icon, iconType, uiSchema, ...btnProps } = props;
    delete btnProps.uiSchema;
    return (
        <Button variant="secondary" isDanger {...btnProps} icon={<MinusCircleIcon />}>
            Remove
        </Button>
    );
};

const MoveUpButton = (props) => {
    const { icon, iconType, uiSchema, ...btnProps } = props;
    return (
        <Button variant="tertiary" {...btnProps} icon={<ArrowCircleUpIcon />} />
    );
};

const MoveDownButton = (props) => {
    const { icon, iconType, uiSchema, ...btnProps } = props;
    return (
        <Button variant="tertiary" {...btnProps} icon={<ArrowCircleDownIcon />} />
    );
};

const SubmitButton = (props) => {
    const { icon, iconType, uiSchema, ...btnProps } = props;
    return (
        <Button variant="primary" {...btnProps} icon={icon}>
            Submit
        </Button>
    );
};

export const ButtonTemplates = {
    AddButton,
    RemoveButton,
    MoveUpButton,
    MoveDownButton,
    SubmitButton,
};
