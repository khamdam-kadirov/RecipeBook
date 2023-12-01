/*
 * Author: Igor, John, Sherali, Khamdam
 * Date: 11/30/2023
 * Class: CSC 337
 * Instructor: Benjamin Dicken
 *
 * Description: This script is responsible for setting up
 * the client side of the Recipe Sharing application.
 * Allowing the client to send requests to create users,
 * login etc.
 */

function addUser() {
    /**
     * Description: This function is responsible for adding
     * users to the marketplace, by gathering the Client's input
     * for username and password and sending a request to the server.
     *
     * Parameters: None
     *
     * Return: None
     */
    const username = document.getElementById("usernameCreate").value;
    const password = document.getElementById("passwordCreate").value;
  
    fetch("/add/user/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((data) => alert(data.message || data.error))
      .catch((error) => console.error("Error:", error));
  }
  
  function login() {
    /**
     * Description: This function is responsible for sending
     * a login request to the server and loging the user in.
     * The request is to /account/login/
     *
     * Parameters: None
     *
     * Return: None
     */
    let us = document.getElementById("usernameLogin").value;
    let pw = document.getElementById("passwordLogin").value;
    let data = { username: us, password: pw };
    let p = fetch("/account/login/", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    p.then((response) => {
      return response.text();
    }).then((text) => {
      console.log(text);
      if (text.startsWith("SUCCESS")) {
        alert(text);
        var welcomeMsg = "Welcome " + us + "! What would you like to do?";
        localStorage.setItem("welcomeMsg", welcomeMsg);
        localStorage.setItem("username", us);
        window.location.href = "./home.html";
      } else {
        document.getElementById("loginFail").innerText =
          "Issue logging with that info";
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('commentForm');

  form.onsubmit = function(e) {
      e.preventDefault();

      const recipeId = 'someRecipeId'; // Replace with actual recipe ID
      const commentText = document.getElementById('commentText').value;
      const username = 'currentUser'; // Replace with the username from the user's session

      const data = {
          username: username,
          text: commentText
      };

      fetch(`/recipe/comment/${recipeId}`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(data => {
          console.log('Success:', data);
          // Handle success - maybe clear the form or show a success message
      })
      .catch((error) => {
          console.error('Error:', error);
          // Handle errors here, such as displaying an error message
      });
  };
});

function searchRecipe() {
  let keyword = document.getElementById("searchInput").value;
  let url = "http://localhost:80/search/recipe/" + keyword;

  fetch(url)
    .then((response) => {
      return response.json();
    })
    .then((objects) => {
      populateRecipes(objects);
    })
    .catch((error) => {
      console.log(error);
  });
}

/*
  This function creates posts depending on the filters, 
  or it will be implmented when the program started running.
*/
function populateRecipes(objects) {
  let recipeTab = document.getElementById("recipe-feed");
  recipeTab.innerHTML = "";  // Clear all existing contents

  objects.forEach((item) => {
    const newRecipePost = document.createElement('article');
    newRecipePost.className = 'recipe-post';

    // Image data should be added
    const imageElement = document.createElement('img');
    // imageElement.src = imageUrl;
    // imageElement.alt = title;
    imageElement.className = 'recipe-image';

    // Create recipe contents
    const contentElement = document.createElement('div');
    contentElement.className = 'recipe-content';
    contentElement.innerHTML = `<h2>${item.title}</h2><p>${item.content}</p>`;

    // Create like button
    const likeButton = document.createElement('button');
    likeButton.id = 'heartBtn';
    likeButton.innerHTML = '<i class="fas fa-heart"></i> 0'; // Amount of like should be added
    likeButton.onclick = function () {
      IncrementLike();
    };

    // Create button for showing comments
    const commentButton = document.createElement('button');
    commentButton.id = 'commentBtn';
    commentButton.innerHTML = '<i class="far fa-comment"></i>';
    commentButton.onclick = function () {
      openCommentModal();
    };

    // Add elements into article tag
    newRecipePost.appendChild(imageElement);
    newRecipePost.appendChild(contentElement);
    newRecipePost.appendChild(likeButton);
    newRecipePost.appendChild(commentButton);

    // Add created article to recipe-feed section
    document.getElementById('recipe-feed').appendChild(newRecipePost);
  });
}

// Comment tab
function openCommentModal() {
  document.getElementById('commentModal').style.display = 'flex';
}

function closeCommentModal() {
  document.getElementById('commentModal').style.display = 'none';
}

function applyFilter() {
  const mealButtons = document.getElementsByName('meal');
  let selectedMeal = '';
  mealButtons.forEach(button => {
    if (button.checked) {
      selectedMeal = button.value;
    }
  });

  const sortButtons = document.getElementsByName('sort');
  let selectedSort = '';
  sortButtons.forEach(button => {
    if (button.checked) {
      selectedSort = button.value;
    }
  });

  // Filtering with server side code
}

function showUserPost() {
  let username = localStorage.getItem("username");  // When logged in, username should be stored in local storage
  let url = "http://localhost:80/get/recipe/" + username;

  fetch(url)
    .then((response) => {
      return response.json();
    })
    .then((objects) => {
      populateItems(objects);
    })
    .catch((error) => {
      console.log(error);
    });
}

function showRecipes() {
  fetch("http://localhost:80/get/recipes/")
    .then((response) => {
      return response.json();
    })
    .then((objects) => {
      populateItems(objects);
    })
    .catch((error) => {
      console.log(error);
  });
}

showRecipes();
