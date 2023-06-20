import cockpit from 'cockpit';
import React from 'react';
import { Stack, StackItem } from "@patternfly/react-core";
import validator from '@rjsf/validator-ajv8';
import Form from '@rjsf/core';
import RenderTemplates from './theme/index.jsx';

const JSYaml = require("js-yaml");

// const customWidgets = () => {
//     return {
//         StringField: renderString,
//         TitleField: renderTitleString,
//     };
// };

// const renderString = (props) => {
//     return (
//         <Text component={TextVariants.h4}>{String(props.value)}</Text>
//     );
// };

// const renderTitleString = (props) => {
//     return (
//         <Text component={TextVariants.h1}>{String(props.value)}</Text>
//     );
// };

// const theme = {
//     widgets: customWidgets(),
// };

export class FormConfigFile extends React.Component {
    constructor(props) {
        super(props);
        this.state = { fileContent: {}, specContent: {} };
        this.loadContent();
    }

    updateFileContent = (c) => {
        this.setState({ ...this.state, fileContent: c });
    };

    updateSpecContent = (c) => {
        this.setState({ ...this.state, specContent: c });
    };

    loadContent = () => {
        const filePath = this.props.filePath;
        const specFilePath = this.props.specFilePath;

        const filePathPromise = cockpit.file(filePath).read();
        filePathPromise.then((content, tag) => {
            if (!content) {
                const fileName = `${filePath}.default`;
                const defaultFilePromiae = cockpit.file(fileName).read();
                defaultFilePromiae.then((content, tag) => {
                    if (content) {
                        this.updateFileContent(JSYaml.load(content));
                    } else {
                        this.updateFileContent({});
                    }
                });
            } else {
                this.updateFileContent(JSYaml.load(content));
            }
        });

        const specFilePromise = cockpit.file(specFilePath).read();
        specFilePromise.then((content, tag) => {
            this.updateSpecContent(JSON.parse(content));
        });
    };

    validateContent = () => {
        try {
            JSYaml.load(this.state.content);
            this.updateFileContent(this.state.content);
        } catch {
            this.updateFileContent(this.state.content);
        }
    };

    handleChangeText = (value) => {
        this.updateState(value, true, this.state.hasError, this.state.errMessage);
    };

    handleReload = (event) => {
        this.loadContent();
    };

    handleValidate = (event) => {
        this.validateContent();
    };

    handleSaveClick = (event) => {
        this.validateContent();
    };

    handleOnSubmit = ({ formData }, e) => {
        this.updateFileContent(formData);
        const fileWritePromise = cockpit.file(this.props.filePath, { superuser: "require" }).replace(JSYaml.dump(formData));
        fileWritePromise.then(tag => {
            console.log("file updated");
        }).catch(error => {
            console.log("failed to update", error);
        });
    };

    render() {
        return (
            <Stack hasGutter>
                <StackItem>
                    <Form
                        schema={this.state.specContent}
                        formData={this.state.fileContent}
                        validator={validator}
                        noValidate
                        templates={RenderTemplates()}
                        onChange={console.log('changed')}
                        onSubmit={this.handleOnSubmit}
                        onError={console.log('errors')}
                    />
                </StackItem>
            </Stack>
        );
    }
}
