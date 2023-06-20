import React from 'react';
import { getInputProps } from '@rjsf/utils';
import { TextInput } from "@patternfly/react-core";

export const BaseInputTemplate = (props) => {
    const {
        schema,
        id,
        options,
        label,
        value,
        type,
        placeholder,
        required,
        disabled,
        readonly,
        autofocus,
        onChange,
        onChangeOverride,
        onBlur,
        onFocus,
        rawErrors,
        hideError,
        uiSchema,
        registry,
        formContext,
        hideLabel,
        ...rest
    } = props;
    const onTextChange = ({ target: { value: val } }) => {
        // Use the options.emptyValue if it is specified and newVal is also an empty string
        onChange(val === '' ? options.emptyValue || '' : val);
    };
    const onTextBlur = ({ target: { value: val } }) => onBlur(id, val);
    const onTextFocus = ({ target: { value: val } }) => onFocus(id, val);

    const inputProps = { ...rest, ...getInputProps(schema, type, options) };
    const hasError = rawErrors && rawErrors.length > 0 && !hideError;

    return (
        <TextInput
            id={id}
            label={label}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readonly}
            autoFocus={autofocus}
            error={hasError}
            hidelabel={hideLabel.toString()}
            errors={hasError ? rawErrors : undefined}
            onChange={onChangeOverride || onTextChange}
            onBlur={onTextBlur}
            onFocus={onTextFocus}
            {...inputProps}
        />
    );
};
