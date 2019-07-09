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
    doFollowUser
}) => {
    const {
        favorited,
        author: { following = false }
    } = articleDetails;

    const followHandler = following
        ? doFollowUser.bind(
              null,
              articleDetails.author.username,
              authToken,
              true
          )
        : doFollowUser.bind(
              null,
              articleDetails.author.username,
              authToken,
              false
          );

    if (isOwner(currentUser, articleDetails.author.username)) {
        return (
            <>
                <button
                    className="btn btn-sm btn-outline-secondary"
                    key="_edit_article"
                >
                    <i className="ion-plus-round" />
                    &nbsp; Edit Article
                </button>
                &nbsp;&nbsp;
                <button
                    className="btn btn-sm btn-outline-danger"
                    key="_delete_article"
                >
                    <i className="ion-heart" />
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

const renderComments = (comments = []) => {
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
                </div>
            </div>
        );
    });
};

export default connect(
    "selectArticleDetails",
    "selectArticleComments",
    "selectUsername",
    "selectAuthToken",
    "selectUserImage",
    "doFollowUser",
    ({
        articleDetails,
        articleComments,
        username,
        authToken,
        userImage,
        doFollowUser
    }) => {
        if (!articleDetails || !articleComments)
            return <div className="article-page">loading...</div>;

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
                                doFollowUser
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
                                doFollowUser
                            })}
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-xs-12 col-md-8 offset-md-2">
                            <form className="card comment-form">
                                <div className="card-block">
                                    <textarea
                                        className="form-control"
                                        placeholder="Write a comment..."
                                        rows="3"
                                    />
                                </div>
                                <div className="card-footer">
                                    <img
                                        src={userImage}
                                        className="comment-author-img"
                                    />
                                    <button className="btn btn-sm btn-primary">
                                        Post Comment
                                    </button>
                                </div>
                            </form>

                            {renderComments(articleComments)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);
