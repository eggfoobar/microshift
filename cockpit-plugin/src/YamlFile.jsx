import cockpit from 'cockpit';
import React from 'react';
import { TextArea, Button, Alert, Split, SplitItem, Stack, StackItem } from "@patternfly/react-core";
const JSYaml = require("js-yaml");

const Ajv = require("ajv");
const AjvFormats = require('ajv-formats');
const AjvErrors = require('ajv-errors');
const ajv = new Ajv({ allErrors: true, strict: false });
const configSpecFilePath = '/etc/microshift/config-openapi-spec.json';
AjvFormats(ajv);
AjvErrors(ajv);

export class YamlFile extends React.Component {
    constructor(props) {
        super(props);
        this.state = { content: "", modified: false, hasError: false, errMessage: "", configSpec: {} };
        this.loadContent();
        this.loadSchemaSpec();
    }

    updateState = (c, m = false, he = false, em = "No error") => {
        this.setState({ content: c, modified: m, hasError: he, errMessage: em });
    };

    updateSpec = (spec) => {
        this.setState({ configSpec: spec });
    };

    loadSchemaSpec = () => {
        const configFilePromise = cockpit.file(configSpecFilePath, { syntax: JSON }).read();
        configFilePromise.then((specContent, tag) => {
            this.updateSpec(specContent);
        });
    };

    loadContent = () => {
        // Check cockpit.channel for permission elevation
        // https://cockpit-project.org/guide/latest/cockpit-channels.html#cockpit-channels-channel
        let fileName = this.props.fileName;

        const promise = cockpit.file(fileName).read();
        promise.then((content, tag) => {
            if (!content) {
                fileName += ".default";
                const promise = cockpit.file(fileName).read();
                promise.then((content, tag) => {
                    if (content) {
                        this.updateState(content);
                        this.validateContent();
                    } else {
                        this.updateState("", false, true, "Failed to open " + fileName);
                    }
                });
            } else {
                this.updateState(content);
                this.validateContent();
            }
        });
    };

    validateContent = () => {
        try {
            const data = JSYaml.load(this.state.content);
            const valid = ajv.validate(this.state.configSpec, data);
            if (valid) {
                this.updateState(this.state.content, this.state.modified);
            } else {
                let errMessage = "";

                ajv.errors.forEach((error) => {
                    const instancePath = error.instancePath.replaceAll("/", ".");
                    let message = `${instancePath}: ${error.message}`;

                    if (error.keyword === "required") {
                        const prefix = instancePath === "" ? "" : `${instancePath}: `;
                        message = `${prefix} ${error.message}`;
                    }
                    errMessage = errMessage === "" ? message : `${errMessage} | ${message}`;
                });

                this.updateState(this.state.content, this.state.modified, true, errMessage);
            }
        } catch (error) {
            this.updateState(this.state.content, this.state.modified, true, "Invalid YAML format");
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
        if (this.state.hasError === false) {
            cockpit.file(this.props.fileName).replace(this.state.content);
        }
    };

    render() {
        const taStyle = { height: "500px" };
        return (
            <Stack hasGutter>
                <StackItem>
                    <Alert
                        variant={this.state.hasError ? "danger" : "default"}
                        title={this.state.errMessage === "" ? "No errors" : this.state.errMessage}
                    />
                </StackItem>
                <StackItem>
                    <TextArea
                        id={this.props.fileName}
                        value={this.state.content}
                        onChange={value => this.handleChangeText(value)}
                        resizeOrientation='vertical'
                        style={taStyle}
                    />
                </StackItem>
                <StackItem>
                    {this.renderButtons()}
                </StackItem>
            </Stack>
        );
    }

    renderButtons = () => {
        return (
            <Split hasGutter>
                <SplitItem>
                    <Button
                        onClick={this.handleReload}
                    >
                        Reload
                    </Button>
                </SplitItem>
                <SplitItem>
                    <Button
                        isDisabled={this.state.content === ""}
                        onClick={this.handleValidate}
                    >
                        Validate
                    </Button>
                </SplitItem>
                <SplitItem>
                    <Button
                        isDisabled={!this.state.modified || this.state.hasError}
                        onClick={this.handleSaveClick}
                    >
                        Save
                    </Button>
                </SplitItem>
            </Split>
        );
    };
}
