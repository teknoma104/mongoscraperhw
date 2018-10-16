// Grab the articles as a json
$.getJSON("/articles", function (data) {

    if (data.length === 0) {
        $("#title").text("No articles found, hit that scrape route.");
    }
    else {
        $("#title").text("Behold! Found scraped Monster Hunter reddit threads!");
    }

    // For each one
    for (var i = 0; i < data.length; i++) {
        // Display the apropos information on the page
        $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    }
});

// Scrape button onclick function
$("#scrape").on("click", function() {
    $.ajax({
        method: "GET",
        url: "/scrape",
    }).done(function(data) {
        console.log(data)
        window.location = "/"
    })
});

// Article Save button onclick function
$(".save").on("click", function() {
    console.log("article save button clicked");
    var savedId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/save/" + savedId
    }).done(function(data) {
        window.location = "/"
    })
});

// Remove Saved Article onclick function
$(".removeArticle").on("click", function() {
    var savedId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/remove/" + savedId
    }).done(function(data) {
        window.location = "/saved"
    })
});


// Whenever someone clicks a p tag
// $(document).on("click", "#mh-articles", function () {
//     console.log("card clicked");
//     // Empty the notes from the note section
//     $("#notes").empty();
//     // Save the id from the p tag
//     var thisId = $(this).attr("data-id");
//     console.log("ID:  " + thisId);

//     // Now make an ajax call for the Article
//     $.ajax({
//         method: "GET",
//         url: "/articles/" + thisId
//     })
//         // With that done, add the note information to the page
//         .then(function (data) {
//             console.log(data);
//             // The title of the article
//             $("#notes").append("<h2>" + data.title + "</h2>");
//             // An input to enter a new title
//             $("#notes").append("<input id='titleinput' name='title' >");
//             // A textarea to add a new note body
//             $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
//             // A button to submit a new note, with the id of the article saved to it
//             $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

//             // If there's a note in the article
//             if (data.note) {
//                 // Place the title of the note in the title input
//                 $("#titleinput").val(data.note.title);
//                 // Place the body of the note in the body textarea
//                 $("#bodyinput").val(data.note.body);
//             }
//         });
// });


//Handle Save Note button
$(".saveComment").on("click", function() {
    console.log("saveComment button clicked");
    
    var thisId = $(this).attr("data-id");
    console.log("thiID:  " + thisId);
    
    if (!$("#noteText" + thisId).val()) {
        alert("Blank comments are not allowed, please type in something")
    }else {
      $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: {
              body: $("#noteText" + thisId).val()
            }
          }).done(function(data) {
              // Log the response
              console.log(data);
              // Empty the notes section
              $("#noteText" + thisId).val("");
              $(".modalNote").modal("hide");
              window.location = "/saved"
          });
    }
});


// $(".addNote").on("click", function() {
//     console.log("add comment button clicked");
//     var thisId = $(this).attr("data-id");
//     console.log("thiID:  " + thisId);
// });

// // When you click the savenote button
// $(document).on("click", "#savenote", function () {
//     // Grab the id associated with the article from the submit button
//     var thisId = $(this).attr("data-id");

//     // Run a POST request to change the note, using what's entered in the inputs
//     $.ajax({
//         method: "POST",
//         url: "/articles/" + thisId,
//         data: {
//             // Value taken from title input
//             title: $("#titleinput").val(),
//             // Value taken from note textarea
//             body: $("#bodyinput").val()
//         }
//     })
//         // With that done
//         .then(function (data) {
//             // Log the response
//             console.log(data);
//             // Empty the notes section
//             $("#notes").empty();
//         });

//     // Also, remove the values entered in the input and textarea for note entry
//     $("#titleinput").val("");
//     $("#bodyinput").val("");
// });


// $(".modalNote").on('show.bs.modal', function (event) {
//     console.log("modal note popup");
//     var button = $(event.relatedTarget) // Button that triggered the modal
//     var recipient = button.data('whatever') // Extract info from data-* attributes
//     // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
//     // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
//     var modal = $(this)
//     modal.find('.modal-title').text('New message to ' + recipient)
//     modal.find('.modal-body input').val(recipient)
//   })