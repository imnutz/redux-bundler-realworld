import * as React from "react";

import debounce from "lodash/fp/debounce";

import { connect } from "redux-bundler-react";

const DEBOUNCE_TIME = 300;

const getErrorMessages = (hasError, errorDetails) => {
    if (!hasError) return null;

    return (
        <ul className="error-messages">
            {errorDetails ? (
                Object.keys(errorDetails).map(key => {
                    return <li key={key}>{key}: {errorDetails[key]}</li>;
                })
            ) : (
                <li>The registration cannot be completed at the moment. Plz try again later!</li>
            )}
        </ul>
    );
};

export default connect(
    "doUpdateEmail",
    "doUpdateName",
    "doUpdatePassword",
    "doSignup",
    "selectHasSignupValues",
    "selectHasError",
    "selectErrorDetails",
    ({
        doUpdateEmail,
        doUpdateName,
        doUpdatePassword,
        doSignup,
        hasSignupValues,
        hasError,
        errorDetails
    }) => {
        const debouncedUpdateName = debounce(DEBOUNCE_TIME, doUpdateName);
        const debouncedUpdateEmail = debounce(DEBOUNCE_TIME, doUpdateEmail);
        const debouncedUpdatePassword = debounce(DEBOUNCE_TIME, doUpdatePassword);

        return (
            <div className="auth-page">
                <div className="container page">
                    <div className="row">
                        <div className="col-md-6 offset-md-3 col-xs-12">
                            <h1 className="text-xs-center">Sign up</h1>
                            <p className="text-xs-center">
                                <a href="/signin">Have an account?</a>
                            </p>

                            {getErrorMessages(hasError, errorDetails)}

                            <form>
                                <fieldset className="form-group">
                                    <input
                                        className="form-control form-control-lg"
                                        type="text"
                                        placeholder="Your Name"
                                        onChange={evt => {
                                            debouncedUpdateName(
                                                evt.target.value
                                            );
                                        }}
                                    />
                                </fieldset>
                                <fieldset className="form-group">
                                    <input
                                        className="form-control form-control-lg"
                                        type="text"
                                        placeholder="Email"
                                        onChange={e => {
                                            debouncedUpdateEmail(
                                                e.target.value
                                            );
                                        }}
                                    />
                                </fieldset>
                                <fieldset className="form-group">
                                    <input
                                        className="form-control form-control-lg"
                                        type="password"
                                        placeholder="Password"
                                        onChange={e => {
                                            debouncedUpdatePassword(
                                                e.target.value
                                            );
                                        }}
                                    />
                                </fieldset>
                                <button
                                    className="btn btn-lg btn-primary pull-xs-right"
                                    disabled={!hasSignupValues}
                                    onClick={doSignup}
                                >
                                    Sign up
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);
