let appData; // Where the comments & user will be stored

// Runs as soon as the document is loaded
$(document).ready(async function () {
    appData = await getAppData(); // Gets comment data from data.json file
    $(".user__avatar").attr("src", appData.currentUser.image.webp); // Display current user's image on the form
    await renderComments(); // Renders all comment for the first time
    // Add comment form
    $("#main__form").submit(function (e) {
        e.preventDefault();
        //Template for new comment
        const newComment = {
            id: $(".comment__card").length + 1,
            content: $("#form__comment").val(),
            createdAt: "Now",
            score: 0,
            user: appData.currentUser,
            replies: []
        }
        $("#form__comment").val("");
        appData.comments.push(newComment); // Pushes new comment to appData array
        renderComments(); // Re-renders the comments section
    });
});

// Gets data from DB
async function getAppData() {
    // Ghost elements
    $(".main__comments").append('<div class="comments__ghost flex flex-col gap-4"><div class="h-64 rounded-md bg-grayish-blue opacity-20"></div><div class="h-64 rounded-md bg-grayish-blue opacity-20"></div><div class="h-64 rounded-md bg-grayish-blue opacity-20"></div></div>');

    // Gets data from external file
    const data = $.getJSON("./app/db/data.json")
        .done(function (data) {
            return data;
        })
        .fail(function () {
            alert("Could Not Fetch Comments");
            return null;
        })
    return data;
};

// Responsible for rendering all comments and replies from the database
async function renderComments() {
    $(".main__comments").empty(); // Clears previous comments

    // Cycles through comments and renders them
    for (let comment of appData.comments) {
        addComment(comment);
        // Cycles through replies if there are any
        if (comment.replies.length) {
            $(".main__comments").append(`<div class="replies__section flex"><div class="replies__replyline w-px shrink-0 bg-grayish-blue mr-4 mb-4 opacity-20 lg:ml-11 lg:mr-9"></div><div id="replies__${comment.id}" class="comments__replies flex flex-col w-full"></div></div>`);
            for (let reply of comment.replies) {
                addComment(reply);
            }
        }
    }

    // Reply to comment action
    $(".action__reply").click(async function (e) {
        const replyingTo = $(this).parents(".comment__card").find(".username").text();
        const commentID = parseInt($(this).parents(".comment__card").attr("id").substr(-1));

        if ($("#reply__form")) {
            $("#reply__form").remove();
        }

        // Reply form
        $(this).parents(".comment__card").after(`
            <div id="reply__form" class="p-4 bg-white rounded-md mb-4 flex transition duration-400 opacity-100 justify-between items-center flex-wrap lg:flex-nowrap lg:gap-4 lg:p-6 lg:items-start">
                <textarea id="form__reply" class="border border-light-gray rounded-md w-full h-24 py-3 px-6 font-rubik text-grayish-blue mb-4 focus:outline-none focus:border-moderate-blue hover:border-moderate-blue caret-moderate-blue lg:mb-0 lg:rounded-xl" placeholder="Add your reply..." required></textarea>
                <img class="h-8 lg:order-first lg:h-10" src="./images/avatars/image-juliusomo.webp" alt="">
                <button id="send__reply" class="uppercase font-rubik bg-moderate-blue text-white py-3 px-6 rounded-md hover:bg-light-grayish-blue">Reply</button>
            </div>`);

        // Reply form animations
        $("#reply__form").hide();
        $("#reply__form").css("opacity", 0);
        $("#reply__form").slideDown(300, function () {
            $("#reply__form").animate({
                opacity: 1
            }, 300);
        });

        // Adds reply to comment
        $("#send__reply").click(function (e) {
            e.preventDefault();
            //Template for new reply
            const newReply = {
                id: $(".comment__card").length + 1,
                content: $("#form__reply").val(),
                createdAt: "Now",
                score: 0,
                replyingTo: replyingTo,
                user: appData.currentUser
            }

            // Searches the comments/replies for where the reply should be added
            for (let i = 0; i < appData.comments.length; i++) {
                if (appData.comments[i].id === commentID) {
                    appData.comments[i].replies.push(newReply);
                    renderComments();
                    return;
                }
                if (appData.comments[i].replies.length) {
                    for (let j = 0; j < appData.comments[i].replies.length; j++) {
                        if (appData.comments[i].replies[j].id === commentID) {
                            appData.comments[i].replies.push(newReply);
                            renderComments();
                            return;
                        }
                    }
                }
            }

            // Animates after completion
            $("#reply__form").animate({
                opacity: 0
            }, 400, function () {
                $("#reply__form").slideUp(400, function () {
                    $("#reply__form").remove();
                });
            });
        });
    });

    // Delete comment action
    $(".action__delete").click(function (e) {
        // Saves ID of selected comment/reply
        const commentID = parseInt($(this).parents(".comment__card").attr("id").substr(-1));

        // Displays the confirm/cancel dialog
        $("main").append(`
            <div class="alert__overlay bg-black opacity-50 fixed top-0 left-0 w-full h-full"></div>
            <div class="main__alert fixed top-1/2 -translate-y-1/2 bg-white p-6 rounded-md flex flex-col mr-4 gap-4">
                    <span class="text-xl font-bold text-dark-blue">Delete comment</span>
                    <p class="text-grayish-blue">Are you sure you want to delete this comment? This will remove the comment and can't be undone.</p>
                    <div class="flex gap-3">
                        <button id="alert__cancel" class="bg-grayish-blue text-white w-full py-3 rounded-md uppercase">No, Cancel</button>
                        <button id="alert__confirm" class="bg-soft-red text-white w-full py-3 rounded-md uppercase">Yes, Delete</button>
                    </div>
            </div>`);

        // Cancels delete action
        $("#alert__cancel").click(function (e) {
            // Removes the confirm/cancel dialog
            $(".alert__overlay").remove();
            $(".main__alert").remove();
        });
        // Confirms delete action
        $("#alert__confirm").click(function (e) {
            // Removes the confirm/cancel dialog
            $(".alert__overlay").remove();
            $(".main__alert").remove();

            // Searches the comments/replies for the object to be deleted
            for (let i = 0; i < appData.comments.length; i++) {
                if (appData.comments[i].id === commentID) {
                    appData.comments.splice(i, 1);
                    renderComments();
                    return;
                }
                if (appData.comments[i].replies.length) {
                    for (let j = 0; j < appData.comments[i].replies.length; j++) {
                        if (appData.comments[i].replies[j].id === commentID) {
                            appData.comments[i].replies.splice(j, 1);
                            renderComments();
                            return;
                        }
                    }
                }
            }
        });
    });

    // Edit comment action
    $(".action__edit").click(async function (e) {
        const commentID = parseInt($(this).parents(".comment__card").attr("id").substr(-1));

        if ($("#edit__form")) {
            $("#edit__form").remove();
        }

        // Gets content of selected comment
        function getCommentContent(commentID) {
            for (let comment of appData.comments) {
                if (comment.id === commentID) {
                    return comment.content;
                }
                if (comment.replies.length) {
                    for (let reply of comment.replies) {
                        if (reply.id === commentID) {
                            return reply.content;
                        }
                    }
                }
            }
        }
        commentContent = getCommentContent(commentID);

        // Edit form
        $(this).parents(".comment__card").after(`
            <div id="edit__form" class="p-4 bg-white rounded-md mb-4 flex transition duration-400 opacity-100 justify-between items-center flex-wrap lg:flex-nowrap lg:gap-4 lg:p-6 lg:items-start">
                <textarea id="form__edit" class="border border-light-gray rounded-md w-full h-24 py-3 px-6 font-rubik text-grayish-blue mb-4 focus:outline-none focus:border-moderate-blue hover:border-moderate-blue caret-moderate-blue lg:mb-0 lg:rounded-xl h-32" required>${commentContent}</textarea>
                <img class="h-8 lg:order-first lg:h-10" src="./images/avatars/image-juliusomo.webp" alt="">
                <button id="send__edit" class="uppercase font-rubik bg-moderate-blue text-white py-3 px-6 rounded-md hover:bg-light-grayish-blue">Update</button>
            </div>`);

        // Edit form animations
        $("#edit__form").hide();
        $("#edit__form").css("opacity", 0);
        $("#edit__form").slideDown(300, function () {
            $("#edit__form").animate({
                opacity: 1
            }, 300);
        });

        // Adds reply to comment
        $("#send__edit").click(function (e) {
            e.preventDefault();
            let commentContent = $("#form__edit").val();
            if (commentContent === "") {
                commentContent = "<i>*Removed by user*</i>"
            }

            // Updates appData with edited content
            for (let i = 0; i < appData.comments.length; i++) {
                if (appData.comments[i].id === commentID) {
                    appData.comments[i].content = commentContent;
                    renderComments();
                    return;
                }
                if (appData.comments[i].replies.length) {
                    for (let j = 0; j < appData.comments[i].replies.length; j++) {
                        if (appData.comments[i].replies[j].id === commentID) {
                            appData.comments[i].replies[j].content = commentContent;
                            renderComments();
                            return;
                        }
                    }
                }
            }

            // Animates after completion
            $("#edit__form").animate({
                opacity: 0
            }, 400, function () {
                $("#edit__form").slideUp(400, function () {
                    $("#edit__form").remove();
                });
            });
        });
    });

    // Upvote action
    $(".action__upvote").click(function (e) {
        // Saves ID of selected comment/reply
        const commentID = parseInt($(this).parents(".comment__card").attr("id").substr(-1));

        // Searches the comments/replies
        for (let i = 0; i < appData.comments.length; i++) {
            if (appData.comments[i].id === commentID) {
                if (appData.comments[i].rating !== 1) {
                    appData.comments[i].rating = 1;
                } else {
                    appData.comments[i].rating = 0;
                }
                renderComments();
                return;
            }
            if (appData.comments[i].replies.length) {
                for (let j = 0; j < appData.comments[i].replies.length; j++) {
                    if (appData.comments[i].replies[j].id === commentID) {
                        if (appData.comments[i].replies[j].rating !== 1) {
                            appData.comments[i].replies[j].rating = 1;
                        } else {
                            appData.comments[i].replies[j].rating = 0;
                        }
                        renderComments();
                        return;
                    }
                }
            }
        }
    });

    // Downvote action
    $(".action__downvote").click(function (e) {
        // Saves ID of selected comment/reply
        const commentID = parseInt($(this).parents(".comment__card").attr("id").substr(-1));

        // Searches the comments/replies
        for (let i = 0; i < appData.comments.length; i++) {
            if (appData.comments[i].id === commentID) {
                if (appData.comments[i].rating !== -1) {
                    appData.comments[i].rating = -1;
                } else {
                    appData.comments[i].rating = 0;
                }
                renderComments();
                return;
            }
            if (appData.comments[i].replies.length) {
                for (let j = 0; j < appData.comments[i].replies.length; j++) {
                    if (appData.comments[i].replies[j].id === commentID) {
                        if (appData.comments[i].replies[j].rating !== -1) {
                            appData.comments[i].replies[j].rating = -1;
                        } else {
                            appData.comments[i].replies[j].rating = 0;
                        }
                        renderComments();
                        return;
                    }
                }
            }
        }
    });
};

// Adds the comment from parameters to the DOM
function addComment(comment) {
    let commentSection = $(".main__comments"); // Where the comment will be added
    let commentClass = "comments__comment"; // The comment/reply's class
    let replyTag = ownerTag = commentActions = "";

    // Creates ID for each comment
    const commentID = comment.id;

    // Checks if the comment being added is a reply
    if (comment.replyingTo) {
        // Finds id of the comment that was replied to
        for (let i = 0; i < appData.comments.length; i++) {
            for (let j = 0; j < appData.comments[i].replies.length; j++) {
                if (appData.comments[i].replies.length) {
                    if (appData.comments[i].replies[j].id === commentID) {
                        commentSection = $(`#replies__${i + 1}`);
                    }
                }
            }
            commentClass = "replies__reply";
            replyTag = `<span class="text-moderate-blue font-bold mr-1">@${comment.replyingTo}</span>`;
        }
    }

    // Checks if you are the owner of the comment
    if (comment.user.username === appData.currentUser.username) {
        // "You" tag next to your username
        ownerTag = '<span class="bg-moderate-blue text-white text-xs font-normal px-2 py-px rounded-sm ml-2">you</span>';
        // Edit, delete actions
        commentActions = `
            <div class="flex gap-4 lg:absolute lg:top-6 lg:right-6">
                <button class="action__delete font-rubik flex text-soft-red font-bold gap-2 items-center fill-soft-red hover:fill-pale-red hover:text-pale-red">
                    <svg width="12" height="14" xmlns="http://www.w3.org/2000/svg"><path d="M1.167 12.448c0 .854.7 1.552 1.555 1.552h6.222c.856 0 1.556-.698 1.556-1.552V3.5H1.167v8.948Zm10.5-11.281H8.75L7.773 0h-3.88l-.976 1.167H0v1.166h11.667V1.167Z"/></svg>Delete
                </button>
                <button class="action__edit font-rubik flex text-moderate-blue font-bold gap-2 items-center fill-moderate-blue hover:fill-light-grayish-blue hover:text-light-grayish-blue">
                    <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg"><path d="M13.479 2.872 11.08.474a1.75 1.75 0 0 0-2.327-.06L.879 8.287a1.75 1.75 0 0 0-.5 1.06l-.375 3.648a.875.875 0 0 0 .875.954h.078l3.65-.333c.399-.04.773-.216 1.058-.499l7.875-7.875a1.68 1.68 0 0 0-.061-2.371Zm-2.975 2.923L8.159 3.449 9.865 1.7l2.389 2.39-1.75 1.706Z"/></svg>Edit
                </button>
            </div>`;
    } else {
        // Reply action
        commentActions = `
            <button class="action__reply font-rubik flex text-moderate-blue font-bold gap-2 items-center fill-moderate-blue hover:fill-light-grayish-blue hover:text-light-grayish-blue lg:absolute lg:top-6 lg:right-6">
                <svg width="14" height="13" xmlns="http://www.w3.org/2000/svg"><path d="M.227 4.316 5.04.16a.657.657 0 0 1 1.085.497v2.189c4.392.05 7.875.93 7.875 5.093 0 1.68-1.082 3.344-2.279 4.214-.373.272-.905-.07-.767-.51 1.24-3.964-.588-5.017-4.829-5.078v2.404c0 .566-.664.86-1.085.496L.227 5.31a.657.657 0 0 1 0-.993Z"/></svg>Reply
            </button>`;
    }

    // Checks if comment score has been rated by user
    let commentScore = `<button class="action__upvote font-rubik font-bold text-light-grayish-blue hover:text-moderate-blue lg:text-lg">+</button> ${comment.score} <button class="action__downvote font-rubik font-bold text-light-grayish-blue hover:text-moderate-blue lg:text-lg">-</button>`;
    if (comment.rating) {
        if (comment.rating === 1) {
            commentScore = `<button class="action__upvote font-rubik font-bold text-moderate-blue lg:text-lg">+</button> ${comment.score + 1} <button class="action__downvote font-rubik font-bold text-light-grayish-blue hover:text-moderate-blue lg:text-lg">-</button>`;
        } else if (comment.rating === -1) {
            commentScore = `<button class="action__upvote font-rubik font-bold text-light-grayish-blue hover:text-moderate-blue lg:text-lg">+</button> ${comment.score - 1} <button class="action__downvote font-rubik font-bold text-moderate-blue lg:text-lg">-</button>`;
        } else {
            commentScore = commentScore;
        }
    }

    // Appends the comment/reply
    commentSection.append(`
            <div id="comment__${commentID}" class="${commentClass} comment__card p-4 mb-4 bg-white rounded-md flex flex-col gap-4 lg:relative lg:p-6 lg:flex-row lg:gap-6">
                <div class="flex flex-col gap-4">
                    <div class="flex items-center gap-4">
                        <img class="h-8" src="${comment.user.image.webp}">
                        <span class="username text-dark-blue font-bold">${comment.user.username}${ownerTag}</span>
                        <span class="text-grayish-blue">${comment.createdAt}</span>
                    </div>
                    <p class="comment__body text-grayish-blue">${replyTag}${comment.content}</p>
                </div>
                <div class="comment__action flex justify-between lg:order-first lg:items-start">
                    <div class="font-bold text-moderate-blue flex items-center gap-4 py-2 px-4 bg-very-light-gray rounded-lg lg:flex-col lg:gap-1 lg:rounded-xl lg:py-0 lg:px-0 lg:w-10">${commentScore}</div>
                    ${commentActions}
                </div>
            </div>`);
}