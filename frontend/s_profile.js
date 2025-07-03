document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    window.location.href = "/index.html";
    return;
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await fetch("/api/logout", {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
          },
        });
      } catch (err) {
        console.error("Logout error:", err);
      } finally {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/index.html";
        location.reload();
      }
    });
  }

  function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return "N/A";
    return unsafe
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function endorsePost(postId) {
    if (!confirm("Are you sure you want to endorse this post?")) {
      return;
    }

    try {
      const res = await fetch(`/api/endorse-post/`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token,
        },
        body: JSON.stringify({
          'postId': postId
        })
      });

      if (res.ok) {
        alert("Post endorsed successfully!");
        loadSavedPosts();
      } else {
        const errorText = await res.text();
        alert("Error endorsing post: " + errorText);
      }
    } catch (err) {
      console.error("Error endorsing post:", err);
      alert("Failed to endorse post.");
    }
  }

  async function deletePost(postId) {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const res = await fetch(`/api/saved-posts/${postId}`, {
        method: "DELETE",
        headers: {
          'Authorization': "Bearer " + token,
        },
      });

      if (res.ok) {
        alert("Post deleted successfully!");
        loadSavedPosts();
      } else {
        const errorText = await res.text();
        alert("Error deleting post: " + errorText);
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post.");
    }
  }

  function loadSavedPosts() {
    fetch("/api/saved-posts", {
      headers: {
        'Authorization': "Bearer " + token,
      },
    })
      .then((response) => {
        if (!response.ok) {
            console.log(response)
          throw new Error("Failed to fetch posts");
        }
        return response.json();
      })
      .then((posts) => {
        const container = document.getElementById("postContainer");
        container.innerHTML = "";

        if (posts.length === 0) {
          container.innerHTML = "<p>You haven't created any posts yet.</p>";
          return;
        }

        posts.forEach((post) => {
          console.log(post.name);
          const card = document.createElement("div");
          card.className = "card";
          card.innerHTML = `
            <h2>${escapeHtml(post.name)}</h2>
            <p><strong>Tutor:</strong> ${escapeHtml(post.tutor_name)}</p>
            <p><strong>Bio:</strong> ${escapeHtml(post.bio)}</p>
            <p><strong>Email:</strong> ${escapeHtml(post.email)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(post.phone)}</p>
            <p><strong>Endorsements:</strong> ${escapeHtml(post.rating)}</p>
            <p><strong>Price/hr:</strong> $${
              post.pricePerHour ? post.pricePerHour.toFixed(2) : "N/A"
            }</p>
            <p><strong>Location:</strong> ${escapeHtml(post.location)}</p>
            <p><strong>Time Slot:</strong> ${escapeHtml(post.timeSlot)}</p>
            <div class="center">
              <button class="endorse-post" data-post-id="${post.postID}">
                <p>Endorse Tutor</p>
              </button>
            </div>
            <div class="center">
              <button class="remove-post" data-post-id="${post.postID}">
                <p>Delete Post</p>
              </button>
            </div>
          `;
          container.appendChild(card);
        });

        document.querySelectorAll(".remove-post").forEach((button) => {
          button.addEventListener("click", (e) => {
            const postId = e.target
              .closest(".remove-post")
              .getAttribute("data-post-id");
            deletePost(postId);
          });
        });

        document.querySelectorAll(".endorse-post").forEach((button) => {
          button.addEventListener("click", (e) => {
            const postId = e.target
              .closest(".endorse-post")
              .getAttribute("data-post-id");
            endorsePost(postId);
          });
        });
      })
      .catch((error) => {
        console.error("Error loading posts:", error);
        const container = document.getElementById("postContainer");
        container.innerHTML =
          "<p>Error loading your posts. Please try again.</p>";
      });
  }

  loadSavedPosts();
});
