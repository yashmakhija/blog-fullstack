document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  // Function to show a message to the user with animation
  function showMessage(message, isError = false) {
    const messageElement = document.getElementById("message");
    if (messageElement) {
      messageElement.textContent = message;
      messageElement.style.color = isError ? "red" : "green";
      messageElement.classList.add("message-animation"); // Add animation class

      // Show the message and clear it after animation ends (2 seconds)
      setTimeout(() => {
        messageElement.classList.remove("message-animation");
        messageElement.textContent = "";
      }, 2000);
    }
  }

  // Function to update visibility of buttons based on authentication status
  function updateButtonVisibility() {
    const isAuthenticated = !!token;

    const createPostForm = document.getElementById("createPostForm");
    const signinLink = document.getElementById("signinLink");
    const signupLink = document.getElementById("signupLink");
    const logoutBtn = document.getElementById("logoutBtn");
    const deletePostBtn = document.getElementById("deletePostBtn");

    if (createPostForm)
      createPostForm.style.display = isAuthenticated ? "block" : "none";
    if (signinLink)
      signinLink.style.display = isAuthenticated ? "none" : "inline";
    if (signupLink)
      signupLink.style.display = isAuthenticated ? "none" : "inline";
    if (logoutBtn)
      logoutBtn.style.display = isAuthenticated ? "inline" : "none";
    if (deletePostBtn)
      deletePostBtn.style.display = isAuthenticated ? "inline" : "none";
  }

  // Update button visibility on page load
  updateButtonVisibility();

  // Handle post creation
  const createPostForm = document.getElementById("createPostForm");
  if (createPostForm) {
    createPostForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const title = document.getElementById("postTitle").value;
      const content = document.getElementById("postContent").value;

      fetch("/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({ title, content }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            showMessage("Post created successfully!");
            createPostForm.reset();
          } else {
            showMessage(
              "Failed to create post. Server response: " +
                (data.message || "Unknown error"),
              true
            );
          }
        })
        .catch((error) => {
          console.error("Error creating post:", error);
          showMessage("An unexpected error occurred. Please try again.", true);
        });
    });
  }

  // Handle post display on homepage (index.html)
  const postContainer = document.getElementById("postContainer");
  if (postContainer) {
    function fetchPosts() {
      fetch("/blogs")
        .then((response) => response.json())
        .then((data) => {
          postContainer.innerHTML = ""; // Clear existing posts
          data.forEach((post) => {
            const postElement = document.createElement("div");
            postElement.classList.add("post");
            postElement.innerHTML = `
              <h2 class="post-title">${post.title}</h2>
              <p class="post-excerpt">${post.content.substring(0, 100)}... 
              <a href="post.html?id=${
                post._id
              }" class="read-more-btn">Read More</a></p>
            `;
            postContainer.appendChild(postElement);
          });
        })
        .catch((error) => {
          console.error("Error fetching blogs:", error);
          showMessage("Error fetching posts. Please try again.", true);
        });
    }
    fetchPosts(); // Initial fetch
  }

  // Handle post display on post.html
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("id");

  if (postId) {
    fetch(`/blogs/${postId}`)
      .then((response) => response.json())
      .then((post) => {
        if (post) {
          document.getElementById("postTitle").textContent = post.title;
          document.getElementById("postContent").textContent = post.content;

          // Set values for update form
          const updatePostForm = document.getElementById("updatePostForm");
          if (updatePostForm) {
            document.getElementById("postId").value = post._id; // Use _id
            document.getElementById("updatePostTitle").value = post.title;
            document.getElementById("updatePostContent").value = post.content;

            updatePostForm.addEventListener("submit", (event) => {
              event.preventDefault();
              const updatedTitle =
                document.getElementById("updatePostTitle").value;
              const updatedContent =
                document.getElementById("updatePostContent").value;

              fetch(`/blogs/${postId}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  token: token,
                },
                body: JSON.stringify({
                  title: updatedTitle,
                  content: updatedContent,
                }),
              })
                .then((response) => response.json())
                .then((data) => {
                  if (data.success) {
                    showMessage("Post updated successfully!");
                    document.getElementById("postTitle").textContent =
                      updatedTitle;
                    document.getElementById("postContent").textContent =
                      updatedContent;
                  } else {
                    showMessage(
                      "Failed to update post. Server response: " + data.message,
                      true
                    );
                  }
                })
                .catch((error) => {
                  console.error("Error updating post:", error);
                  showMessage("Error updating post. Please try again.", true);
                });
            });
          }

          // Show delete button if user is signed in
          updateButtonVisibility(); // Update visibility for delete button based on sign-in status

          if (deletePostBtn) {
            deletePostBtn.addEventListener("click", () => {
              fetch(`/blogs/${postId}`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  token: token,
                },
              })
                .then((response) => response.json())
                .then((data) => {
                  if (data.success) {
                    showMessage("Post deleted successfully!");
                    setTimeout(() => {
                      window.location.href = "index.html";
                    }, 2000);
                  } else {
                    showMessage(
                      "Failed to delete post. Server response: " + data.message,
                      true
                    );
                  }
                })
                .catch((error) => {
                  console.error("Error deleting post:", error);
                  showMessage("Error deleting post. Please try again.", true);
                });
            });
          }
        } else {
          showMessage("Post not found.", true);
        }
      })
      .catch((error) => {
        console.error("Error fetching post details:", error);
        showMessage("Error fetching post details. Please try again.", true);
      });
  }

  // Handle sign-in
  const signinForm = document.getElementById("signinForm");
  if (signinForm) {
    signinForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      fetch("/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.token) {
            localStorage.setItem("token", data.token);
            showMessage("Sign-in successful!");
            updateButtonVisibility(); // Update visibility on successful sign-in
            window.location.href = "index.html";
          } else {
            showMessage("Sign-in failed. Please check your credentials.", true);
          }
        })
        .catch((error) => {
          console.error("Error during sign-in:", error);
          showMessage("Error during sign-in. Please try again.", true);
        });
    });
  }

  // Handle sign-up
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const username = document.getElementById("username").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      fetch("/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            showMessage("Sign-up successful! You can now sign in.");
            window.location.href = "signin.html";
          } else {
            showMessage("Sign-up failed. Please try again.", true);
          }
        })
        .catch((error) => {
          console.error("Error during sign-up:", error);
          showMessage("Error during sign-up. Please try again.", true);
        });
    });
  }

  // Handle search functionality
  const searchForm = document.getElementById("searchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = document.getElementById("searchQuery").value;

      fetch(`/blogs/search?query=${encodeURIComponent(query)}`)
        .then((response) => response.json())
        .then((data) => {
          if (postContainer) {
            // Clear existing posts
            postContainer.innerHTML = "";

            data.forEach((post) => {
              const postElement = document.createElement("div");
              postElement.classList.add("post");
              postElement.innerHTML = `
                <h2 class="post-title">${post.title}</h2>
                <p class="post-excerpt">${post.content.substring(0, 100)}... 
                <a href="post.html?id=${
                  post._id
                }" class="read-more-btn">Read More</a></p>
              `;
              postContainer.appendChild(postElement);
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching search results:", error);
          showMessage("Error fetching search results. Please try again.", true);
        });
    });
  }

  // Logout functionality
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      showMessage("Logged out successfully!");
      updateButtonVisibility(); // Update visibility on logout
      window.location.href = "index.html";
    });
  }
});
