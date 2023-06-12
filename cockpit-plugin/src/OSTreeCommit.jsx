import cockpit from 'cockpit';
import React from 'react';
import { FileUpload, Button, Alert, Split, SplitItem, Stack, StackItem, Progress } from "@patternfly/react-core";

export class OSTreeCommit extends React.Component {
    constructor(props) {
        super(props);
        this.state = { fileName: "", fileValue: null, hasErr: false, alertMessage: "", progressValue: 0 };
        this.commitLocation = this.props.commitLocation;
    }

    updateFile = (fileName, fileValue) => {
        this.setState({ fileName, fileValue });
    };

    updateFileUploadProgress = (progressValue) => {
        this.setState({ progressValue });
    };

    updateAlert = (message, isErr) => {
        this.setState({ alertMessage: message, hasErr: isErr });
    };

    handleFileInputChange = (_event, file) => {
        this.updateFile(file.name, file);
    };

    handleClear = () => {
        this.updateFile("", null);
    };

    handleUpload = (event) => {
        event.preventDefault();
        const file = this.state.fileValue;
        const maxSize = file.size;
        const _this = this;

        console.log("file:", file);
        const fileChannel = cockpit.channel({
            binary: true,
            payload: "fsreplace1",
            path: this.join(this.commitLocation, file.name),
            superuser: "require"
        });

        fileChannel.onready = () => {
            const reader = file.stream().getReader();
            let wssent = 0;
            reader.read().then(async function sendfile({ done, value }) {
                console.log("done", done);
                if (done) {
                    fileChannel.close();
                    _this.updateFileUploadProgress(wssent, maxSize);
                    return;
                }

                /* Send chunks of max 64k */
                const batch = 64 * 1024;
                const len = value.byteLength;
                for (let i = 0; i < len; i += batch) {
                    const n = Math.min(len, i + batch);
                    fileChannel.send(value.subarray(i, n));
                    wssent += n - i;
                    const percent = Math.round((wssent / maxSize) * 100);
                    if (percent !== _this.state.progressValue) {
                        _this.updateFileUploadProgress(percent);
                    }
                }
                return reader.read().then(sendfile);
            });
        };
        fileChannel.onclose = (ev) => {
            console.log(ev);
            if (ev.detail.problem)
                _this.updateAlert("Upload failed: " + ev.detail.message, true);
            else
                _this.updateAlert("Upload ok");
        };
        console.log("channel", fileChannel);
    };

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    join(p1, p2) {
        return p1.endsWith("/") ? p1 + p2 : `${p1}/${p2}`;
    }

    render() {
        return (
            <Stack hasGutter>
                <StackItem>
                    <Alert
                        hidden={!this.state.hasErr && this.state.alertMessage === ""}
                        variant={this.state.hasErr ? "danger" : "default"}
                        title={this.state.alertMessage === "" ? "No errors" : this.state.alertMessage}
                    />
                    <FileUpload
                        value={this.state.fileValue}
                        filename={this.state.fileName}
                        filenamePlaceholder="Drag and drop a file or upload one"
                        onFileInputChange={this.handleFileInputChange}
                        onClearClick={this.handleClear}
                        browseButtonText="Upload"
                    />
                    <Progress
                        value={this.state.progressValue}
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
                        onClick={this.handleUpload}
                    >
                        Upload
                    </Button>
                </SplitItem>
            </Split>
        );
    };
}
