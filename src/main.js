let aboutme = await fetch("/aboutme.html").then(response => response.text())
let projects = await fetch("/projects.html").then(response => response.text())
let posts = await fetch("/posts.html").then(response => response.text())
let faq = await fetch("/faq.html").then(response => response.text())
document.getElementById("content").innerHTML = aboutme;

document.getElementById("abtme").addEventListener("click", function() {
    document.getElementById("content").innerHTML = aboutme;
})
document.getElementById("projs").addEventListener("click", function() {
    document.getElementById("content").innerHTML = projects;
})
document.getElementById("faq").addEventListener("click", function() {
    document.getElementById("content").innerHTML = faq;
})

// set up the link/buttons to change the innerHTML within the "posts" virtual subpage
// this definitely isnt the best way to do it, but i'm lazy and this is not supposed to scale, so it's fine
let todo = await fetch("/posts/todo.html").then(response => response.text())
document.getElementById("posts").addEventListener("click", function() {
    document.getElementById("content").innerHTML = posts;

    document.getElementById("later").addEventListener("click", function() {
        document.getElementById("content").innerHTML = todo;
    });
});