$(document).ready(function () {
    renderComments();
});

function renderComments(newComment) {
    $(".main__comments").empty();
    // Ghost elements
    $(".main__comments").append('<div class="comments__ghost flex flex-col gap-4"><div class="h-64 rounded-md bg-grayish-blue opacity-20"></div><div class="h-64 rounded-md bg-grayish-blue opacity-20"></div><div class="h-64 rounded-md bg-grayish-blue opacity-20"></div></div>')
    $.getJSON("./app/db/data.json")
        .done(function (data) {
            if (newComment) {
                data.comments.push(newComment);
            }
            $(".main__comments").empty();
            // Display current user's image on the form
            $(".user__avatar").attr("src", data.currentUser.image.webp);
            for (let comment of data.comments) {
                addComment(comment, data.currentUser);
                if (comment.replies.length) {
                    $(".main__comments").append(`<div class="flex"><div class="w-2 bg-light-gray mr-4 mb-4"></div><div class="comments__replies flex flex-col"></div></div>`)
                    for (let reply of comment.replies) {
                        addComment(reply, data.currentUser);
                    }
                }
            }
            $("#main__form").submit(function (e) {
                e.preventDefault();
                const newComment = {
                    id: data.comments.length + 1,
                    content: $("#form__comment").val(),
                    createdAt: "Now",
                    score: 0,
                    user: data.currentUser,
                    replies: []
                }
                $(form__comment).val("");
                renderComments(newComment);
            });
        })
        .fail(function () {
            alert("Could Not Fetch Comments");
        })
};

function addComment(comment, currentUser) {
    let commentSection = $(".main__comments");
    let commentClass = "comments__comment";
    let commentReplyingTo = "";
    // Checks if the comment being added is a reply
    if (comment.replyingTo) {
        commentSection = $(".comments__replies");
        commentClass = "replies__reply";
        commentReplyingTo = `<span class="text-moderate-blue font-bold mr-1">@${comment.replyingTo}</span>`;
    }
    // Appends the comment
    commentSection.append(`
            <div class="${commentClass} p-4 mb-4 bg-white rounded-md flex flex-col gap-4">
                <div class="flex items-center gap-4">
                    <img class="h-8" src="${comment.user.image.webp}">
                    <span class="username text-dark-blue font-bold">${comment.user.username}</span>
                    <span class="text-grayish-blue">${comment.createdAt}</span>
                </div>
                <p class="text-grayish-blue">${commentReplyingTo}${comment.content}</p>
                <div class="comment__action flex justify-between">
                    <div class="font-bold text-moderate-blue flex items-center gap-4 py-2 px-4 bg-very-light-gray rounded-lg">
                        <button class="font-rubik font-bold text-light-grayish-blue">+</button> ${comment.score} <button class="font-rubik font-bold text-light-grayish-blue">-</button>
                    </div>
                </div>
            </div>`);
    const currentComment = $(".main__comments").find(`.${commentClass}`).last();
    if (comment.user.username === currentUser.username) {
        // Adds "you" tag next to your comments
        currentComment.find(".username").append('<span class="bg-moderate-blue text-white text-xs font-normal px-2 py-px rounded-sm ml-2">you</span>');
        currentComment.find(".comment__action").append(`
            <div class="flex gap-4">
                <button class="action__delete font-rubik flex text-soft-red font-bold gap-2 items-center fill-soft-red hover:fill-pale-red hover:text-pale-red">
                    <svg width="12" height="14" xmlns="http://www.w3.org/2000/svg"><path d="M1.167 12.448c0 .854.7 1.552 1.555 1.552h6.222c.856 0 1.556-.698 1.556-1.552V3.5H1.167v8.948Zm10.5-11.281H8.75L7.773 0h-3.88l-.976 1.167H0v1.166h11.667V1.167Z"/></svg>Delete
                </button>
                <button class="action__edit font-rubik flex text-moderate-blue font-bold gap-2 items-center fill-moderate-blue hover:fill-light-grayish-blue hover:text-light-grayish-blue">
                    <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg"><path d="M13.479 2.872 11.08.474a1.75 1.75 0 0 0-2.327-.06L.879 8.287a1.75 1.75 0 0 0-.5 1.06l-.375 3.648a.875.875 0 0 0 .875.954h.078l3.65-.333c.399-.04.773-.216 1.058-.499l7.875-7.875a1.68 1.68 0 0 0-.061-2.371Zm-2.975 2.923L8.159 3.449 9.865 1.7l2.389 2.39-1.75 1.706Z"/></svg>Edit
                </button>
            </div>`);
    } else {
        currentComment.find(".comment__action").append(`
            <button class="comment__reply font-rubik flex text-moderate-blue font-bold gap-2 items-center fill-moderate-blue hover:fill-light-grayish-blue hover:text-light-grayish-blue">
                <svg width="14" height="13" xmlns="http://www.w3.org/2000/svg"><path d="M.227 4.316 5.04.16a.657.657 0 0 1 1.085.497v2.189c4.392.05 7.875.93 7.875 5.093 0 1.68-1.082 3.344-2.279 4.214-.373.272-.905-.07-.767-.51 1.24-3.964-.588-5.017-4.829-5.078v2.404c0 .566-.664.86-1.085.496L.227 5.31a.657.657 0 0 1 0-.993Z"/></svg>Reply
            </button>`);
    }
}

function addCommentFunctions(element, currentUser) {
    if (element.find(".username").text() === currentUser.username) {
        element.find(".username").append('<span class="bg-moderate-blue text-white text-xs font-normal px-2 py-px rounded-sm ml-2">you</span>');
        element.find(".comment__actions").append(`
            <div class="flex gap-4">
                <button class="comment__delete font-rubik flex text-soft-red font-bold gap-2 items-center fill-soft-red hover:fill-pale-red hover:text-pale-red">
                    <svg width="12" height="14" xmlns="http://www.w3.org/2000/svg"><path d="M1.167 12.448c0 .854.7 1.552 1.555 1.552h6.222c.856 0 1.556-.698 1.556-1.552V3.5H1.167v8.948Zm10.5-11.281H8.75L7.773 0h-3.88l-.976 1.167H0v1.166h11.667V1.167Z"/></svg>Delete
                </button>
                <button class="comment__edit font-rubik flex text-moderate-blue font-bold gap-2 items-center fill-moderate-blue hover:fill-light-grayish-blue hover:text-light-grayish-blue">
                    <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg"><path d="M13.479 2.872 11.08.474a1.75 1.75 0 0 0-2.327-.06L.879 8.287a1.75 1.75 0 0 0-.5 1.06l-.375 3.648a.875.875 0 0 0 .875.954h.078l3.65-.333c.399-.04.773-.216 1.058-.499l7.875-7.875a1.68 1.68 0 0 0-.061-2.371Zm-2.975 2.923L8.159 3.449 9.865 1.7l2.389 2.39-1.75 1.706Z"/></svg>Edit
                </button>
            </div>`);
    } else {
        element.find(".comment__actions").append(`
            <button class="comment__reply font-rubik flex text-moderate-blue font-bold gap-2 items-center fill-moderate-blue hover:fill-light-grayish-blue hover:text-light-grayish-blue">
                <svg width="14" height="13" xmlns="http://www.w3.org/2000/svg"><path d="M.227 4.316 5.04.16a.657.657 0 0 1 1.085.497v2.189c4.392.05 7.875.93 7.875 5.093 0 1.68-1.082 3.344-2.279 4.214-.373.272-.905-.07-.767-.51 1.24-3.964-.588-5.017-4.829-5.078v2.404c0 .566-.664.86-1.085.496L.227 5.31a.657.657 0 0 1 0-.993Z"/></svg>Reply
            </button>`);
    }
    $(".comment__actions").last().find(".comment__delete").click(function (e) {
        let comment;
        if ($(this).parents(".replies__reply").length) {
            comment = $(this).parents(".replies__reply");
        } else {
            comment = $(this).parents(".comments__comment");
        }
        $("main").append(`
            <div class="main__overlay bg-black opacity-50 fixed top-0 left-0 w-full h-full"></div>
            <div class="main__alert fixed top-1/2 -translate-y-1/2 bg-white p-6 rounded-md flex flex-col mr-4 gap-4">
                    <span class="text-xl font-bold text-dark-blue">Delete comment</span>
                    <p class="text-grayish-blue">Are you sure you want to delete this comment? This will remove the comment and can't be undone.</p>
                    <div class="flex gap-3">
                        <button id="alert__cancel" class="bg-grayish-blue text-white w-full py-3 rounded-md uppercase">No, Cancel</button>
                        <button id="alert__confirm" class="bg-soft-red text-white w-full py-3 rounded-md uppercase">Yes, Delete</button>
                    </div>
            </div>`);
        $("#alert__cancel").click(function (e) {
            $(".main__overlay").detach();
            $(".main__alert").detach();
        });
        $("#alert__confirm").click(function (e) {
            comment.detach();
            $(".main__overlay").detach();
            $(".main__alert").detach();
        });
    });
    $(".comment__actions").last().find(".comment__reply").click(function (e) {
        let comment;
        $(".reply__form").detach();
        if ($(this).parents(".replies__reply").length) {
            comment = $(this).parents(".replies__reply");
        } else {
            comment = $(this).parents(".comments__comment");
        }
        comment.after(`
            <div class="reply__form p-4 bg-white rounded-md mb-4 flex flex-col">
                <textarea id="form__reply" class="border border-light-gray rounded-md w-full h-24 py-3 px-6 font-rubik text-grayish-blue mb-4 focus:outline-light-grayish-blue" placeholder="Add your reply..." required></textarea>
                <div class="form__bottom flex justify-between items-center">
                    <img class="h-8" src="./images/avatars/image-juliusomo.webp">
                    <button class="send__reply uppercase font-rubik bg-moderate-blue text-white py-3 px-6 rounded-md hover:bg-light-grayish-blue">Reply</button>
                </div>
            </div>`);
        $(".send__reply").click(function (e) {
            if ($(".reply__form").after().find(".comments__replies").length === 0) {
                $(".reply__form").before(`<div class="flex"><div class="w-2 bg-light-gray mr-4 mb-4"></div><div class="comments__replies flex flex-col"></div></div>`);
            }
            let reply = {
                content: $(".form__reply").val(),
                createdAt: "Now",
                id: $(".reply__form").after().find(".comments__replies").length + 1,
                replyingTo: comment.find(".username"),
                score: 0,
                user: currentUser
            }
            addReply(reply, currentUser);
            $(".reply__form").detach();
        });
    });
}

// $.getJSON("./app/db/data.json")
//     .done(function (data) {
//         for (let comment of data.comments) {
//             addComment(comment, data.currentUser);
//             if (comment.replies.length) {
//                 $(".main__comments").append(`<div class="flex"><div class="w-2 bg-light-gray mr-4 mb-4"></div><div class="comments__replies flex flex-col"></div></div>`)
//                 for (let reply of comment.replies) {
//                     addReply(reply, data.currentUser);
//                 }
//             }
//         }
//         $(".form__bottom").prepend(`<img class="h-8" src="${data.currentUser.image.webp}">`);

//         $(".send__comment").click(function (e) {
//             e.preventDefault();
//             data.comments.push({
//                 content: $("#form__comment").val(),
//                 createdAt: "Now",
//                 id: data.comments.length + 1,
//                 replies: [],
//                 score: 0,
//                 user: data.currentUser
//             })
//             addComment(data.comments[data.comments.length - 1], data.currentUser);
//             $("#form__comment").val("")
//         });
//     })
//     .fail(function () {
//         alert("Could Not Fetch Data");
//     });

// function addComment(comment, currentUser) {
//     $(".main__comments").append(`
//         <div class="comments__comment p-4 mb-4 bg-white rounded-md flex flex-col gap-4">
//             <div class="flex items-center gap-4">
//                 <img class="h-8" src="${comment.user.image.webp}">
//                 <span class="username text-dark-blue font-bold">${comment.user.username}</span>
//                 <span class="text-grayish-blue">${comment.createdAt}</span>
//             </div>
//             <p class="text-grayish-blue">${comment.content}</p>
//             <div class="comment__actions flex justify-between">
//                 <div class="font-bold text-moderate-blue flex items-center gap-4 py-2 px-4 bg-very-light-gray rounded-lg">
//                     <button class="font-rubik font-bold text-light-grayish-blue">+</button> ${comment.score} <button class="font-rubik font-bold text-light-grayish-blue">-</button>
//                 </div>
//             </div>
//         </div>`);
//     addCommentFunctions($(".comments__comment").last(), currentUser);
// }

// function addReply(reply, currentUser) {
//     $(".comments__replies").append(`
//         <div class="replies__reply flex mb-4">
//             <div class="p-4 bg-white rounded-md flex flex-col gap-4">
//                 <div class="flex items-center gap-4">
//                     <img class="h-8" src="${reply.user.image.webp}">
//                     <span class="username text-dark-blue font-bold">${reply.user.username}</span>
//                     <span class="text-grayish-blue">${reply.createdAt}</span>
//                 </div>
//                 <p class="text-grayish-blue">
//                     <span class="text-moderate-blue font-bold">@${reply.replyingTo}</span> ${reply.content}
//                 </p>
//                 <div class="comment__actions flex justify-between">
//                     <div class="font-bold text-moderate-blue flex items-center gap-4 py-2 px-4 bg-very-light-gray rounded-lg">
//                         <button class="font-rubik font-bold text-light-grayish-blue hover:text-moderate-blue">+</button>${reply.score}<button class="font-rubik font-bold text-light-grayish-blue hover:text-moderate-blue">-</button>
//                     </div>
//                 </div>
//             </div>
//         </div>`);
//     addCommentFunctions($(".replies__reply").last(), currentUser);
// }

// function addCommentFunctions(element, currentUser) {
//     if (element.find(".username").text() === currentUser.username) {
//         element.find(".username").append('<span class="bg-moderate-blue text-white text-xs font-normal px-2 py-px rounded-sm ml-2">you</span>');
//         element.find(".comment__actions").append(`
//             <div class="flex gap-4">
//                 <button class="comment__delete font-rubik flex text-soft-red font-bold gap-2 items-center fill-soft-red hover:fill-pale-red hover:text-pale-red">
//                     <svg width="12" height="14" xmlns="http://www.w3.org/2000/svg"><path d="M1.167 12.448c0 .854.7 1.552 1.555 1.552h6.222c.856 0 1.556-.698 1.556-1.552V3.5H1.167v8.948Zm10.5-11.281H8.75L7.773 0h-3.88l-.976 1.167H0v1.166h11.667V1.167Z"/></svg>Delete
//                 </button>
//                 <button class="comment__edit font-rubik flex text-moderate-blue font-bold gap-2 items-center fill-moderate-blue hover:fill-light-grayish-blue hover:text-light-grayish-blue">
//                     <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg"><path d="M13.479 2.872 11.08.474a1.75 1.75 0 0 0-2.327-.06L.879 8.287a1.75 1.75 0 0 0-.5 1.06l-.375 3.648a.875.875 0 0 0 .875.954h.078l3.65-.333c.399-.04.773-.216 1.058-.499l7.875-7.875a1.68 1.68 0 0 0-.061-2.371Zm-2.975 2.923L8.159 3.449 9.865 1.7l2.389 2.39-1.75 1.706Z"/></svg>Edit
//                 </button>
//             </div>`);
//     } else {
//         element.find(".comment__actions").append(`
//             <button class="comment__reply font-rubik flex text-moderate-blue font-bold gap-2 items-center fill-moderate-blue hover:fill-light-grayish-blue hover:text-light-grayish-blue">
//                 <svg width="14" height="13" xmlns="http://www.w3.org/2000/svg"><path d="M.227 4.316 5.04.16a.657.657 0 0 1 1.085.497v2.189c4.392.05 7.875.93 7.875 5.093 0 1.68-1.082 3.344-2.279 4.214-.373.272-.905-.07-.767-.51 1.24-3.964-.588-5.017-4.829-5.078v2.404c0 .566-.664.86-1.085.496L.227 5.31a.657.657 0 0 1 0-.993Z"/></svg>Reply
//             </button>`);
//     }
//     $(".comment__actions").last().find(".comment__delete").click(function (e) {
//         let comment;
//         if ($(this).parents(".replies__reply").length) {
//             comment = $(this).parents(".replies__reply");
//         } else {
//             comment = $(this).parents(".comments__comment");
//         }
//         $("main").append(`
//             <div class="main__overlay bg-black opacity-50 fixed top-0 left-0 w-full h-full"></div>
//             <div class="main__alert fixed top-1/2 -translate-y-1/2 bg-white p-6 rounded-md flex flex-col mr-4 gap-4">
//                     <span class="text-xl font-bold text-dark-blue">Delete comment</span>
//                     <p class="text-grayish-blue">Are you sure you want to delete this comment? This will remove the comment and can't be undone.</p>
//                     <div class="flex gap-3">
//                         <button id="alert__cancel" class="bg-grayish-blue text-white w-full py-3 rounded-md uppercase">No, Cancel</button>
//                         <button id="alert__confirm" class="bg-soft-red text-white w-full py-3 rounded-md uppercase">Yes, Delete</button>
//                     </div>
//             </div>`);
//         $("#alert__cancel").click(function (e) {
//             $(".main__overlay").detach();
//             $(".main__alert").detach();
//         });
//         $("#alert__confirm").click(function (e) {
//             comment.detach();
//             $(".main__overlay").detach();
//             $(".main__alert").detach();
//         });
//     });
//     $(".comment__actions").last().find(".comment__reply").click(function (e) {
//         let comment;
//         $(".reply__form").detach();
//         if ($(this).parents(".replies__reply").length) {
//             comment = $(this).parents(".replies__reply");
//         } else {
//             comment = $(this).parents(".comments__comment");
//         }
//         comment.after(`
//             <div class="reply__form p-4 bg-white rounded-md mb-4 flex flex-col">
//                 <textarea id="form__reply" class="border border-light-gray rounded-md w-full h-24 py-3 px-6 font-rubik text-grayish-blue mb-4 focus:outline-light-grayish-blue" placeholder="Add your reply..." required></textarea>
//                 <div class="form__bottom flex justify-between items-center">
//                     <img class="h-8" src="./images/avatars/image-juliusomo.webp">
//                     <button class="send__reply uppercase font-rubik bg-moderate-blue text-white py-3 px-6 rounded-md hover:bg-light-grayish-blue">Reply</button>
//                 </div>
//             </div>`);
//         $(".send__reply").click(function (e) {
//             if ($(".reply__form").after().find(".comments__replies").length === 0) {
//                 $(".reply__form").before(`<div class="flex"><div class="w-2 bg-light-gray mr-4 mb-4"></div><div class="comments__replies flex flex-col"></div></div>`);
//             }
//             let reply = {
//                 content: $(".form__reply").val(),
//                 createdAt: "Now",
//                 id: $(".reply__form").after().find(".comments__replies").length + 1,
//                 replyingTo: comment.find(".username"),
//                 score: 0,
//                 user: currentUser
//             }
//             addReply(reply, currentUser);
//             $(".reply__form").detach();
//         });
//     });
// }