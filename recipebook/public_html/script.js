/*
 * Author: Igor, John, Sherali, Khamdam
 * Date: 12/06/2023
 * Class: CSC 337
 * Instructor: Benjamin Dicken
 *
 * Description: This script is responsible for setting up
 * the client side of the Recipe Sharing application.
 * Allowing the client to send requests to create users,
 * login etc.
 */


document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('userForm');
    if (loginForm) {
       /**
        * Description: Sets up an event listener for the login form. On form submission,
        * it sends the user's credentials to the server for authentication. If 
        * successful, redirects to the home page, else displays an error message.
        *
        * Parameters: None
        * Return: None
       */
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const username = document.getElementById('usernameLogin').value;
            const password = document.getElementById('passwordLogin').value;
  
            fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'same-origin'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    localStorage.setItem("username", username);
                    localStorage.setItem('sessionId', data.sessionId);
                    window.location.href = '/home.html';
                } else {
                    alert('Login failed: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }
  
    const createAccountForm = document.getElementById('createForm');
    if (createAccountForm) {
        /**
         * Description: Sets up an event listener for the account creation form. 
         * On submission, it sends the new account's details to the server. If account
         * creation is successful, redirects to the login page,
         * otherwise displays an error message.
         *
         * Parameters: None
         * Return: None
         */
        createAccountForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const username = document.getElementById('usernameCreate').value;
            const password = document.getElementById('passwordCreate').value;
            const firstName = document.getElementById('firstNameCreate').value;
            const lastName = document.getElementById('lastNameCreate').value;
            const createAccountForm = document.getElementById('createForm');
  
            fetch('/create-account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, firstName, lastName })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Account created successfully!');
                    window.location.href = '/signin.html';
                } else {
                    alert('Account creation failed: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }
  });
  
  const logoutButton = document.getElementById('logout');
  if (logoutButton) {
      logoutButton.addEventListener('click', function() {
          fetch('/logout', {
              method: 'POST',
              credentials: 'same-origin'
          })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  // Redirect to the login page or index page after successful logout
                  window.location.href = '/index.html';
              } else {
                  alert('Logout failed: ' + data.message);
              }
          })
          .catch(error => {
              console.error('Error:', error);
          });
      });
  }
  
  
  // Modify the event listener for comment form submission
  document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('commentForm');
  
    form.onsubmit = function(e) {
      e.preventDefault();
  
      const commentModal = document.getElementById('commentModal');
      const recipeId = commentModal.getAttribute('data-recipe-id');
      const commentText = document.getElementById('commentText').value;
      const username = localStorage.getItem("username");
  
      if (!commentText.trim()) {
        alert("Please enter a comment.");
        return;
      }
  
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
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        document.getElementById('commentText').value = '';
        showComments(recipeId);
        alert('Comment added successfully.');
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Error adding comment: ' + error.message);
      });
    };
  });
  
  
  function displayComments(comments) {
    const commentsContainer = document.getElementById('commentsContainer');
    commentsContainer.innerHTML = '';
  
    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.innerHTML = `<strong>${comment.username}:</strong> ${comment.text}`;
        commentsContainer.appendChild(commentElement);
    });
  }
  
  function showComments(recipeId) {
  
    fetch(`/recipe/comments/${recipeId}`)
        .then(response => response.json())
        .then(data => {
            console.log('Comments:', data);
            displayComments(data);
        })
        .catch(error => {
            console.error('Error fetching comments:', error);
        });
  }
  
  
  function searchRecipe() {
    let keyword = document.getElementById("searchInput").value.trim();
    let url = keyword ? "/search/recipe/" + keyword : "/get/recipes";
  
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((objects) => {
        populateRecipes(objects);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
  
  
function populateRecipes(objects) {
    let recipeTab = document.getElementById("recipe-feed");
    if (recipeTab) {
    recipeTab.innerHTML = "";
  }
    objects.forEach((item) => {
        const newRecipePost = document.createElement('article');
        newRecipePost.className = 'recipe-post';
  
        // Author Info
        const authorInfo = document.createElement('div');
        authorInfo.className = 'author-info';
      
        const authorImage = document.createElement('img');
        authorImage.className = 'author-image';
        // Check if author's image is available and handle it
        if (item.posted_by.profileImage && item.posted_by.profileImage.data) {
            let buffer = new Uint8Array(item.posted_by.profileImage.data);
            let base64String = buffer.reduce((data, byte) => {
                return data + String.fromCharCode(byte);
            }, '');
            base64String = btoa(base64String);
            authorImage.src = `data:image/png;base64,${base64String}`;
        } else {
            authorImage.src = '/default_profile.png';
        }
        authorImage.alt = `${item.posted_by.username}'s profile picture`;
  
        const authorName = document.createElement('div');
        authorName.className = 'author-name';
        authorName.innerText = item.posted_by.username
  
        authorInfo.appendChild(authorImage);
        authorInfo.appendChild(authorName);
        newRecipePost.appendChild(authorInfo);
  
        // Recipe Image
        let image = document.createElement("img");
        image.className = 'recipe-image';
        if (item.image && item.image.data) {
            let buffer = new Uint8Array(item.image.data);
            let base64String = buffer.reduce((data, byte) => {
                return data + String.fromCharCode(byte);
            }, '');
            base64String = btoa(base64String);
            image.src = `data:image/png;base64,${base64String}`;
        } else {
            image.src = './default-recipe.jpg';
        }
        image.alt = "Recipe Picture";
        newRecipePost.appendChild(image);
  
        // Recipe Content
        const contentElement = document.createElement('div');
        contentElement.className = 'recipe-content';
        contentElement.innerHTML = `
            <h2>${item.title}</h2>
            <p><strong>Category:</strong> ${item.category}</p>
            <p><strong>Time:</strong> ${item.time || 'N/A'}</p>
            <p><strong>Calories:</strong> ${item.calories || 'N/A'}</p>
            <p><strong>Difficulty:</strong> ${item.difficulty || 'N/A'}</p>
            <p class = 'recipe-text'>${item.content}</p>
        `;
        newRecipePost.appendChild(contentElement);
  
        // Like and Comment Buttons
        const likeButton = document.createElement('button');
        likeButton.id = 'heartBtn';
        likeButton.innerHTML = `<i class="fas fa-heart"></i> <span id="likeCount-${item._id}">${item.likes}</span>`;
        likeButton.onclick = function () {
            incrementLike(item._id);
        };
  
        const commentButton = document.createElement('button');
        commentButton.id = 'commentBtn';
        commentButton.innerHTML = '<i class="far fa-comment"></i>';
        commentButton.onclick = function () {
            openCommentModal(item._id);
        };
  
        newRecipePost.appendChild(likeButton);
        newRecipePost.appendChild(commentButton);
  
        // Append the new post to the feed
        recipeTab.appendChild(newRecipePost);
    });
  }
  
  
  
  
  function incrementLike(recipeId) {
    const username = localStorage.getItem("username");
  
    fetch(`/recipe/like/${recipeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: username }),
    })
    .then(response => {
      if (!response.ok) {
        if (response.status === 400) {
          alert('You have already liked this recipe.');
        }
        throw new Error('Failed to increment like');
      }
      return response.json();
    })
    .then(data => {
      console.log(data.message);
      updateLikeCount(recipeId);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
  
  function updateLikeCount(recipeId) {
    fetch(`/recipe/likes/${recipeId}`)
      .then(response => response.json())
      .then(data => {
        const likeCountElement = document.querySelector(`#likeCount-${recipeId}`);
        if (likeCountElement) {
          likeCountElement.textContent = data.likes;
        }
      })
      .catch(error => {
        console.error('Error updating like count:', error);
      });
  }
  
  
  // Comment tab
  function openCommentModal(recipeId) {
    const commentModal = document.getElementById('commentModal');
    commentModal.style.display = 'flex';
    commentModal.setAttribute('data-recipe-id', recipeId);
  
    showComments(recipeId); // Load comments for this recipe
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
  
    if (selectedMeal !== "Default") {
      let url = '/recipes/category/' + selectedMeal;
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
    } else {
      const sortButtons = document.getElementsByName('sort');
      let selectedSort = '';
      sortButtons.forEach(button => {
        if (button.checked) {
          selectedSort = button.value;
        }
      });
  
      if (selectedSort === "Most Likes") {
        fetch('/recipes/most-liked')
          .then((response) => {
            return response.json();
          })
          .then((objects) => {
            populateRecipes(objects);
          })
          .catch((error) => {
            console.log(error);
        });
      } else if (selectedSort === "User Liked") {
        let username = localStorage.getItem("username");
        let url = '/recipes/liked-by/' + username;
  
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
      } else if (selectedSort === "Default") {
        fetch("/get/recipes/")
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
    }
  }
  
  function showUserPost() {
    let username = localStorage.getItem("username");  
    let url = "/get/recipe/" + username;
  
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
  
  function showRecipes() {
    fetch("/get/recipes/")
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
  
  showRecipes();
  
  document.addEventListener('DOMContentLoaded', function() {
      const profileForm = document.getElementById('profileForm');
      if (profileForm) {
          profileForm.addEventListener('submit', function(e) {
              e.preventDefault();
              const formData = new FormData(this);
              fetch('/update-profile', {
                  method: 'PUT',
                  credentials: 'include',
                  body: formData
              })
              .then(response => response.json())
              .then(data => {
                  // Check if the update was successful
                  if (data.success) {
                      alert('Profile updated successfully.');
                      window.location.href = '/myprofile.html';
                  } else {
                      // Handle cases where 'success' is false
                      alert('Failed to update profile: ' + (data.message || 'Unknown error'));
                  }
              })
              .catch(error => {
                  console.error('Error:', error);
                  alert('An error occurred while updating your profile.');
              });
          });
      }
  
        const imageUpload = document.getElementById('imageUpload');
        if (imageUpload) {
            imageUpload.addEventListener('change', function(e) {
                if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        document.getElementById('profileImage').src = event.target.result;
                    };
                    reader.readAsDataURL(e.target.files[0]);
                }
            });
        }
});

  
  document.addEventListener('DOMContentLoaded', function() {
      // Fetch user profile data
      fetch('/get-user-profile', {
          method: 'GET',
          credentials: 'include'
      })
      .then(response => {
          if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
      })
      .then(data => {
          const profileImageElement = document.getElementById('profileImage') || 'default_profile.png';
          const userName = document.getElementById('userName');
          const userBio = document.getElementById('userBio');
          const firstNameInput = document.getElementById('firstName');
          const lastNameInput = document.getElementById('lastName');
          const bioInput = document.getElementById('bio');
  
          // Update profile image
          if (data.profileImage && data.profileImage.data) {
            let buffer = new Uint8Array(data.profileImage.data);
            let base64String = buffer.reduce((data, byte) => {
                return data + String.fromCharCode(byte);
            }, '');
            base64String = btoa(base64String); // Encode to Base64
            profileImageElement.src = `data:image/png;base64,${base64String}`;
          } else {
              profileImageElement.src = '/default_profile.png';
          }
  
          if (userName) {
              userName.textContent = `${data.firstName} ${data.lastName}`;
          }
          if (userBio) {
              userBio.textContent = data.bio;
          }
  
          // Set form fields values for editing
          if (firstNameInput) {
              firstNameInput.value = data.firstName || '';
          }
          if (lastNameInput) {
              lastNameInput.value = data.lastName || '';
          }
          if (bioInput) {
              bioInput.value = data.bio || '';
          }
      })
      .catch(error => {
          console.error('Error fetching user data:', error);
      });
  });
  
  document.addEventListener('DOMContentLoaded', function() {
    const recipeForm = document.getElementsByClassName('recipeForm')[0];
    if (recipeForm) {
        recipeForm.addEventListener('submit', function(event) {
            event.preventDefault();
  
            const formData = new FormData(recipeForm);
  
            fetch('/add/recipe', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    alert('Recipe posted successfully!');
                    window.location.href = '/home.html';
                } else {
                    alert('Failed to post recipe: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while posting the recipe.');
            });
        });
    }
    });
    