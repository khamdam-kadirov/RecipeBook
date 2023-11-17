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
  