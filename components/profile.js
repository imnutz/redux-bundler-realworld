import * as React from "react";

import { connect } from "redux-bundler-react";

const renderButtons = (
    isCurrentUser,
    username,
    token,
    isFollowing,
    doFollowProfile
) => {
    const followText = isFollowing ? "Unfollow" : "Follow";

    return isCurrentUser ? (
        <a
            className="btn btn-sm btn-outline-secondary action-btn"
            href="/settings"
        >
            <i className="ion-plus-round" />
            &nbsp; Edit Profile Settings
        </a>
    ) : (
        <button
            className="btn btn-sm btn-outline-secondary action-btn"
            onClick={evt => {
                evt.preventDefault();

                doFollowProfile(username, token, isFollowing);
            }}
        >
            <i className="ion-plus-round" />
            &nbsp; {followText} {username}
        </button>
    );
};

const renderArticleTags = (tags = []) => {
    if (!tags || !tags.length) return <></>;

    return (
        <ul className="tag-list">
            {tags.map(tag => (
                <li key={tag} className="tag-default tag-pill tag-outline">
                    {tag}
                </li>
            ))}
        </ul>
    );
};

const renderArticles = (articles = [], token, doFavoriteProfileArticle) => {
    return articles.map(article => {
        return (
            <div className="article-preview" key={article.slug}>
                <div className="article-meta">
                    <a href="profile.html">
                        <img src={article.author.image} alt="" />
                    </a>
                    <div className="info">
                        <a href="" className="author">
                            {article.author.username}
                        </a>
                        <span className="date">{article.createAt}</span>
                    </div>
                    <button
                        className="btn btn-outline-primary btn-sm pull-xs-right"
                        onClick={evt => {
                            doFavoriteProfileArticle(
                                article.slug,
                                token,
                                article.favorited
                            );
                        }}
                    >
                        <i className="ion-heart" />
                        &nbsp;{article.favoritesCount}
                    </button>
                </div>
                <a href={`/article/${article.slug}`} className="preview-link">
                    <h1>{article.title}</h1>
                    <p>{article.description}</p>
                    <span>Read more...</span>
                    {renderArticleTags(article.tagList)}
                </a>
            </div>
        );
    });
};

const renderTabs = (tabs = [], selectedTab, doUpdateProfileSelectedTab) => {
    return (
        <ul className="nav nav-pills outline-active">
            {tabs.map(tab => {
                let clazz = ["nav-link"];
                if (tab.id === selectedTab) {
                    clazz.push("active");
                }

                return (
                    <li className="nav-item" key={tab.id}>
                        <a
                            className={clazz.join(" ")}
                            href="#"
                            onClick={evt => {
                                evt.preventDefault();
                                doUpdateProfileSelectedTab(selectedTab, tab.id);
                            }}
                        >
                            {tab.name}
                        </a>
                    </li>
                );
            })}
        </ul>
    );
};

const renderPagination = (
    numberOfPages = [],
    currentPage = 0,
    doUpdateProfileCurrentPage
) => {
    const handler = evt => {
        evt.preventDefault();

        if (evt.target && evt.target.matches("a.page-link")) {
            doUpdateProfileCurrentPage(
                currentPage,
                Number(evt.target.textContent) - 1
            );
        }
    };
    return (
        <nav>
            <ul className="pagination" onClick={handler}>
                {numberOfPages.map(p => {
                    const clazz = ["page-item"];

                    if (p === currentPage) {
                        clazz.push("active");
                    }

                    return (
                        <li className={clazz.join(" ")} key={p}>
                            <a href="#" className="page-link">
                                {p + 1}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default connect(
    "selectUserProfile",
    "selectIsCurrentUser",
    "selectProfileArticles",
    "selectAuthToken",
    "selectProfileSelectedTab",
    "selectProfileTabsAsArray",
    "selectProfileArticlePages",
    "selectProfileArticleCurrentPage",
    "doUpdateProfileSelectedTab",
    "doFavoriteProfileArticle",
    "doFollowProfile",
    "doUpdateProfileCurrentPage",
    ({
        userProfile,
        isCurrentUser,
        profileArticles,
        authToken,
        profileSelectedTab,
        profileTabsAsArray,
        profileArticlePages,
        profileArticleCurrentPage,
        doUpdateProfileSelectedTab,
        doFavoriteProfileArticle,
        doFollowProfile,
        doUpdateProfileCurrentPage
    }) => {
        if (!userProfile)
            return (
                <div className="container">
                    <div className="row">
                        <div className="col-xs-12 col-md-10 offset-md-1">loading...</div>
                    </div>
                </div>
            );
        return (
            <div className="profile-page">
                <div className="user-info">
                    <div className="container">
                        <div className="row">
                            <div className="col-xs-12 col-md-10 offset-md-1">
                                <img
                                    src={userProfile.image}
                                    className="user-img"
                                />
                                <h4>{userProfile.username}</h4>
                                <p>{userProfile.bio}</p>
                                {renderButtons(
                                    isCurrentUser,
                                    userProfile.username,
                                    authToken,
                                    userProfile.following,
                                    doFollowProfile
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container">
                    <div className="row">
                        <div className="col-xs-12 col-md-10 offset-md-1">
                            <div className="articles-toggle">
                                {renderTabs(
                                    profileTabsAsArray,
                                    profileSelectedTab,
                                    doUpdateProfileSelectedTab
                                )}
                            </div>
                            {renderArticles(
                                profileArticles || [],
                                authToken,
                                doFavoriteProfileArticle
                            )}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-12 col-md-10 offset-md-1">
                            {renderPagination(
                                profileArticlePages,
                                profileArticleCurrentPage,
                                doUpdateProfileCurrentPage
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);
