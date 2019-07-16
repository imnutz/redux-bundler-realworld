import * as React from "react";

import { connect } from "redux-bundler-react";
import dayjs from "dayjs";

const isOwner = (currentUser, author) => {
    return currentUser === author;
};

const renderButtons = ({
    username: currentUser,
    articleDetails = {},
    authToken,
    doFollowUser,
    doFavoriteArticle,
    doDeleteArticle
}) => {
    const {
        favorited,
        slug,
        author: { following = false, username }
    } = articleDetails;

    const followHandler = following
        ? doFollowUser.bind(null, username, authToken, true)
        : doFollowUser.bind(null, username, authToken, false);

    const favoriteHandler = favorited
        ? doFavoriteArticle.bind(null, slug, authToken, true)
        : doFavoriteArticle.bind(null, slug, authToken, false);

    const deleteArticleHandler = doDeleteArticle.bind(null, slug, authToken);

    if (isOwner(currentUser, username)) {
        return (
            <>
                <a
                    href={`/editor/${slug}`}
                    className="btn btn-sm btn-outline-secondary"
                    key="_edit_article"
                >
                    <i className="ion-edit" />
                    &nbsp; Edit Article
                </a>
                &nbsp;&nbsp;
                <button
                    className="btn btn-sm btn-outline-danger"
                    key="_delete_article"
                    onClick={deleteArticleHandler}
                >
                    <i className="ion-trash-a" />
                    &nbsp; Delete Article{" "}
                </button>
            </>
        );
    }

    let followText = following ? "Unfollow" : "Follow";
    let favoriteText = favorited ? "Unfavorite Article" : "Favorite Article";

    return (
        <>
            <button
                className="btn btn-sm btn-outline-secondary"
                key="_follow_user"
                onClick={followHandler}
            >
                <i className="ion-plus-round" />
                &nbsp; {followText} {articleDetails.author.username}{" "}
            </button>
            &nbsp;&nbsp;
            <button
                className="btn btn-sm btn-outline-primary"
                key="_favorite_article"
                onClick={favoriteHandler}
            >
                <i className="ion-heart" />
                &nbsp; {favoriteText}{" "}
                <span className="counter">
                    ({articleDetails.favoritesCount})
                </span>
            </button>
        </>
    );
};

const renderComments = (
    username,
    slug,
    token,
    comments = [],
    doDeleteUserComment
) => {
    const renderTrash = comment => {
        if (isOwner(username, comment.author.username)) {
            return (
                <span className="mod-options">
                    <i
                        className="ion-trash-a"
                        onClick={evt => {
                            evt.preventDefault();
                            doDeleteUserComment(slug, token, comment.id);
                        }}
                    />
                </span>
            );
        }
    };
    return comments.map(comment => {
        return (
            <div className="card" key={comment.id}>
                <div className="card-block">
                    <p className="card-text">{comment.body}</p>
                </div>
                <div className="card-footer">
                    <a href="" className="comment-author">
                        <img
                            src={comment.author.image}
                            className="comment-author-img"
                        />
                    </a>
                    &nbsp;
                    <a href="" className="comment-author">
                        {comment.author.username}
                    </a>
                    <span className="date-posted">
                        {dayjs(comment.createdAt).format("MMMM D, YYYY")}
                    </span>
                    {renderTrash(comment)}
                </div>
            </div>
        );
    });
};

const renderCommentForm = (
    slug,
    token,
    userImage,
    userComment,
    doPostComment,
    doUpdateUserComment
) => {
    if (!token) {
        return (
            <p>
                <a href="/signin">Sign in</a> or <a href="/signup">Sign up</a>{" "}
                to add comments on this article
            </p>
        );
    }

    return (
        <form className="card comment-form">
            <div className="card-block">
                <textarea
                    className="form-control"
                    placeholder="Write a comment..."
                    rows="3"
                    value={userComment || ""}
                    onChange={evt => {
                        evt.preventDefault();

                        doUpdateUserComment(evt.target.value);
                    }}
                />
            </div>
            <div className="card-footer">
                <img src={userImage} className="comment-author-img" />
                <button
                    className="btn btn-sm btn-primary"
                    onClick={evt => {
                        evt.preventDefault();

                        doPostComment(slug, token);
                    }}
                >
                    Post Comment
                </button>
            </div>
        </form>
    );
};

export default connect(
    "selectArticleDetails",
    "selectArticleComments",
    "selectUsername",
    "selectAuthToken",
    "selectUserImage",
    "selectUserComment",
    "doFollowUser",
    "doFavoriteArticle",
    "doDeleteArticle",
    "doPostComment",
    "doUpdateUserComment",
    "doDeleteUserComment",
    ({
        articleDetails,
        articleComments,
        username,
        authToken,
        userImage,
        userComment,
        doFollowUser,
        doFavoriteArticle,
        doDeleteArticle,
        doPostComment,
        doUpdateUserComment,
        doDeleteUserComment
    }) => {
        if (!articleDetails || !articleComments) {
            return (
                <div className="article-page">
                    <div className="container page">
                        <div className="row article-content">
                            <div className="col-md-12">loading...</div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="article-page">
                <div className="banner">
                    <div className="container">
                        <h1>{articleDetails.title}</h1>

                        <div className="article-meta">
                            <a href="">
                                <img src={articleDetails.author.image} />
                            </a>
                            <div className="info">
                                <a href="" className="author">
                                    {articleDetails.author.username}
                                </a>
                                <span className="date">
                                    {dayjs(articleDetails.createdAt).format(
                                        "MMMM D, YYYY"
                                    )}
                                </span>
                            </div>
                            {renderButtons({
                                username,
                                articleDetails,
                                authToken,
                                doFollowUser,
                                doFavoriteArticle,
                                doDeleteArticle
                            })}
                        </div>
                    </div>
                </div>

                <div className="container page">
                    <div className="row article-content">
                        <div className="col-md-12">
                            <h2 id="introducing-ionic">
                                {articleDetails.description}
                            </h2>
                            <div>{articleDetails.body}</div>
                        </div>
                    </div>

                    <hr />

                    <div className="article-actions">
                        <div className="article-meta">
                            <a href="">
                                <img src={articleDetails.author.image} />
                            </a>
                            <div className="info">
                                <a href="" className="author">
                                    {articleDetails.author.username}
                                </a>
                                <span className="date">
                                    {dayjs(articleDetails.createdAt).format(
                                        "MMMM D, YYYY"
                                    )}
                                </span>
                            </div>

                            {renderButtons({
                                username,
                                articleDetails,
                                authToken,
                                doFollowUser,
                                doFavoriteArticle,
                                doDeleteArticle
                            })}
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-xs-12 col-md-8 offset-md-2">
                            {renderCommentForm(
                                articleDetails.slug,
                                authToken,
                                userImage,
                                userComment,
                                doPostComment,
                                doUpdateUserComment
                            )}
                            {renderComments(
                                username,
                                articleDetails.slug,
                                authToken,
                                articleComments,
                                doDeleteUserComment
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);
