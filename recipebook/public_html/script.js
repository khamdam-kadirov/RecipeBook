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

          fetch('/create-account', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, password })
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