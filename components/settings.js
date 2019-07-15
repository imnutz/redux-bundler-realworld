import * as React from "react";

import { connect } from "redux-bundler-react";

export default connect(
    "selectSettingsUsername",
    "selectAvatarUrl",
    "selectSettingsBio",
    "selectSettingsEmail",
    "selectSettingsPassword",
    "selectAuthToken",
    "doUpdateAvatarUrl",
    "doUpdateSettingsUsername",
    "doUpdateSettingsBio",
    "doUpdateSettingsEmail",
    "doUpdateSettingsPassword",
    "doUpdateSettings",
    "doSignOut",
    ({
        settingsUsername,
        avatarUrl,
        settingsBio,
        settingsEmail,
        settingsPassword,
        authToken,
        doUpdateAvatarUrl,
        doUpdateSettingsUsername,
        doUpdateSettingsBio,
        doUpdateSettingsEmail,
        doUpdateSettingsPassword,
        doUpdateSettings,
        doSignOut
    }) => {
        if (!settingsUsername) return <></>;

        return (
            <div className="settings-page">
                <div className="container page">
                    <div className="row">
                        <div className="col-md-6 offset-md-3 col-xs-12">
                            <h1 className="text-xs-center">Your Settings</h1>

                            <form>
                                <fieldset>
                                    <fieldset className="form-group">
                                        <input
                                            className="form-control"
                                            type="text"
                                            value={avatarUrl || ""}
                                            placeholder="URL of profile picture"
                                            onChange={evt => {
                                                evt.preventDefault();
                                                doUpdateAvatarUrl(
                                                    evt.target.value
                                                );
                                            }}
                                        />
                                    </fieldset>
                                    <fieldset className="form-group">
                                        <input
                                            className="form-control form-control-lg"
                                            type="text"
                                            value={settingsUsername || ""}
                                            placeholder="Your Name"
                                            onChange={evt => {
                                                evt.preventDefault();

                                                doUpdateSettingsUsername(
                                                    evt.target.value
                                                );
                                            }}
                                        />
                                    </fieldset>
                                    <fieldset className="form-group">
                                        <textarea
                                            className="form-control form-control-lg"
                                            rows="8"
                                            value={settingsBio || ""}
                                            placeholder="Short bio about you"
                                            onChange={evt => {
                                                evt.preventDefault();

                                                doUpdateSettingsBio(
                                                    evt.target.value
                                                );
                                            }}
                                        />
                                    </fieldset>
                                    <fieldset className="form-group">
                                        <input
                                            className="form-control form-control-lg"
                                            type="text"
                                            value={settingsEmail || ""}
                                            placeholder="Email"
                                            onChange={evt => {
                                                evt.preventDefault();

                                                doUpdateSettingsEmail(
                                                    evt.target.value
                                                );
                                            }}
                                        />
                                    </fieldset>
                                    <fieldset className="form-group">
                                        <input
                                            className="form-control form-control-lg"
                                            type="password"
                                            placeholder="New Password"
                                            onChange={evt => {
                                                evt.preventDefault();
                                                doUpdateSettingsPassword(
                                                    evt.target.value
                                                );
                                            }}
                                        />
                                    </fieldset>
                                    <button
                                        className="btn btn-lg btn-primary pull-xs-right"
                                        onClick={evt => {
                                            evt.preventDefault();

                                            doUpdateSettings(
                                                {
                                                    avatarUrl,
                                                    settingsUsername,
                                                    settingsBio,
                                                    settingsEmail,
                                                    settingsPassword
                                                },
                                                authToken
                                            );
                                        }}
                                    >
                                        Update Settings
                                    </button>
                                </fieldset>
                            </form>

                            <hr />
                            <button
                                className="btn btn-outline-danger"
                                onClick={evt => {
                                    evt.preventDefault();

                                    doSignOut();
                                }}
                            >
                                Or click here to logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);
