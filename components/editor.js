import * as React from "react";

import { connect } from "redux-bundler-react";

export default connect(
    "selectArticleTitle",
    "selectShortDescription",
    "selectArticleBody",
    "selectArticleTags",
    "doPostArticle",
    "doUpdateArticleTitle",
    "doUpdateShortDescription",
    "doUpdateArticleBody",
    "doUpdateArticleTags",
    "selectIsEditorLoading",
    "selectIsEditingArticle",
    ({
        articleTitle,
        shortDescription,
        articleBody,
        articleTags,
        doPostArticle,
        doUpdateArticleTitle,
        doUpdateShortDescription,
        doUpdateArticleBody,
        doUpdateArticleTags,
        isEditorLoading,
        isEditingArticle
    }) => {
        return (
            <div className="editor-page">
                <div className="container page">
                    <div className="row">
                        <div className="col-md-10 offset-md-1 col-xs-12">
                            {isEditorLoading ? (
                                "loading..."
                            ) : (
                                <form>
                                    <fieldset>
                                        <fieldset className="form-group">
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                placeholder="Article Title"
                                                value={articleTitle || ""}
                                                onChange={evt =>
                                                    doUpdateArticleTitle(
                                                        evt.target.value
                                                    )
                                                }
                                            />
                                        </fieldset>
                                        <fieldset className="form-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="What's this article about?"
                                                value={shortDescription || ""}
                                                onChange={evt =>
                                                    doUpdateShortDescription(
                                                        evt.target.value
                                                    )
                                                }
                                            />
                                        </fieldset>
                                        <fieldset className="form-group">
                                            <textarea
                                                className="form-control"
                                                rows="8"
                                                placeholder="Write your article (in markdown)"
                                                value={articleBody || ""}
                                                onChange={evt =>
                                                    doUpdateArticleBody(
                                                        evt.target.value
                                                    )
                                                }
                                            />
                                        </fieldset>
                                        <fieldset className="form-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter tags"
                                                value={articleTags || ""}
                                                onChange={evt =>
                                                    doUpdateArticleTags(
                                                        evt.target.value
                                                    )
                                                }
                                            />
                                            <div className="tag-list" />
                                        </fieldset>
                                        <button
                                            className="btn btn-lg pull-xs-right btn-primary"
                                            type="button"
                                            onClick={evt => {
                                                evt.preventDefault();

                                                doPostArticle(
                                                    articleTitle,
                                                    shortDescription,
                                                    articleBody,
                                                    articleTags,
                                                    isEditingArticle
                                                );
                                            }}
                                        >
                                            Publish Article
                                        </button>
                                    </fieldset>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);
