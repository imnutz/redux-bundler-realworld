import * as React from "react";
import { connect } from "redux-bundler-react";

import debounce from "lodash/fp/debounce";

const DEBOUNCE_TIME = 300;

export default connect(
    "selectHasSigninValues",
    "doUpdateSigninEmail",
    "doUpdateSigninPassword",
    "doSignIn",
    ({
        hasSigninValues,
        doUpdateSigninEmail,
        doUpdateSigninPassword,
        doSignIn
    }) => {
        const debouncedUpdateEmail = debounce(
            DEBOUNCE_TIME,
            doUpdateSigninEmail
        );
        const debouncedUpdatePassword = debounce(
            DEBOUNCE_TIME,
            doUpdateSigninPassword
        );

        return (
            <div className="auth-page">
                <div className="container page">
                    <div className="row">
                        <div className="col-md-6 offset-md-3 col-xs-12">
                            <h1 className="text-xs-center">Sign in</h1>
                            <p className="text-xs-center">
                                <a href="/signup">Need an account?</a>
                            </p>

                            {/* {getErrorMessages(hasError, errorDetails)} */}

                            <form>
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
                                    disabled={!hasSigninValues}
                                    onClick={doSignIn}
                                >
                                    Sign in
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);
