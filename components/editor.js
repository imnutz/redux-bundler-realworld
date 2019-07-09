import * as React from "react";

import { connect } from "redux-bundler-react";

export default connect(
    "doPostArticle",
    class extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                title: null,
                shortDesc: null,
                body: null,
                tags: null
            };
        }

        handlePostArticle(evt) {
            evt.preventDefault();

            const postArticle = this.props.doPostArticle;
            const {
                title,
                shortDesc,
                body,
                tags
            } = this.state;

            postArticle(title, shortDesc, body, tags);
        }

        render() {
            return (
                <div className="editor-page">
                    <div className="container page">
                        <div className="row">
                            <div className="col-md-10 offset-md-1 col-xs-12">
                                <form>
                                    <fieldset>
                                        <fieldset className="form-group">
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                placeholder="Article Title"
                                                onChange={evt =>
                                                    this.setState({
                                                        title: evt.target.value
                                                    })
                                                }
                                            />
                                        </fieldset>
                                        <fieldset className="form-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="What's this article about?"
                                                onChange={evt =>
                                                    this.setState({
                                                        shortDesc:
                                                            evt.target.value
                                                    })
                                                }
                                            />
                                        </fieldset>
                                        <fieldset className="form-group">
                                            <textarea
                                                className="form-control"
                                                rows="8"
                                                placeholder="Write your article (in markdown)"
                                                onChange={evt =>
                                                    this.setState({
                                                        body: evt.target.value
                                                    })
                                                }
                                            />
                                        </fieldset>
                                        <fieldset className="form-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter tags"
                                                onChange={evt =>
                                                    this.setState({
                                                        tags: evt.target.value
                                                    })
                                                }
                                            />
                                            <div className="tag-list" />
                                        </fieldset>
                                        <button
                                            className="btn btn-lg pull-xs-right btn-primary"
                                            type="button"
                                            onClick={this.handlePostArticle.bind(this)}
                                        >
                                            Publish Article
                                        </button>
                                    </fieldset>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
);
