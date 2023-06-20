import React from 'react';
import { GridItem } from "@patternfly/react-core";

export const FieldTemplate = (props) => {
    const { id, classNames, style, label, help, required, description, errors, children } = props;
    return (
        <GridItem className={classNames} style={style}>
            <label htmlFor={id}>
                {label}
                {required ? '*' : null}
            </label>
            {description}
            {children}
            {errors}
            {help}
        </GridItem>
    );
};
