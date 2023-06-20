import React from 'react';
import { Title } from "@patternfly/react-core";

export const TitleFieldTemplate = (props) => {
    const { id, required, title } = props;
    return (
        <Title id={id} headingLevel="h4">{title}{required && <mark>*</mark>}</Title>
    );
};
