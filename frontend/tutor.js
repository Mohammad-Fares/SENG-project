document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    window.location.href = '/index.html';
    return;
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('name');
        window.location.href = '/index.html';
        location.reload();
      }
    });
  }

  document.getElementById('tutorPostForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!token) {
      return alert('You must be logged in to create a post.');
    }

    const postData = {
      name: document.getElementById('name').value,
      bio: document.getElementById('bio').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      rating: parseFloat(document.getElementById('rating').value),
      pricePerHour: parseFloat(document.getElementById('pricePerHour').value),
      location: document.getElementById('location').value,
      timeSlot: document.getElementById('timeSlot').value
    };

    try {
      const res = await fetch('/create-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(postData)
      });

      if (res.ok) {
        alert('Post created successfully!');
        document.getElementById('tutorPostForm').reset();
        loadTutorPosts(); 
      } else {
        const errorText = await res.text();
        alert('Error creating post: ' + errorText);
      }
    } catch (err) {
      console.error('Network error:', err);
      alert('Something went wrong.');
    }
  });

  function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return 'N/A';
    return unsafe.toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      if (res.ok) {
        alert('Post deleted successfully!');
        loadTutorPosts(); 
      } else {
        const errorText = await res.text();
        alert('Error deleting post: ' + errorText);
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post.');
    }
  }

  function loadTutorPosts() {
    fetch('/api/tutor-posts', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        return response.json();
      })
      .then(posts => {
        const container = document.getElementById('postContainer');
        container.innerHTML = ''; 

        if (posts.length === 0) {
          container.innerHTML = '<p>You haven\'t created any posts yet.</p>';
          return;
        }

        posts.forEach(post => {
          const card = document.createElement('div');
          card.className = 'card';
          card.innerHTML = `
            <h2>${escapeHtml(post.name)}</h2>
            <p><strong>Tutor:</strong> ${escapeHtml(post.tutor_name)}</p>
            <p><strong>Bio:</strong> ${escapeHtml(post.bio)}</p>
            <p><strong>Email:</strong> ${escapeHtml(post.email)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(post.phone)}</p>
            <p><strong>Rating:</strong> ${"★".repeat(post.rating)}${"☆".repeat(5-post.rating)}</p>
            <p><strong>Price/hr:</strong> $${post.pricePerHour ? post.pricePerHour.toFixed(2) : 'N/A'}</p>
            <p><strong>Location:</strong> ${escapeHtml(post.location)}</p>
            <p><strong>Time Slot:</strong> ${escapeHtml(post.timeSlot)}</p>
            <div class="center">
              <button class="remove-post" data-post-id="${post.postID}">
                <p>Delete Post</p>
              </button>
            </div>
          `;
          container.appendChild(card);
        });

        document.querySelectorAll('.remove-post').forEach(button => {
          button.addEventListener('click', (e) => {
            const postId = e.target.closest('.remove-post').getAttribute('data-post-id');
            deletePost(postId);
          });
        });
      })
      .catch(error => {
        console.error('Error loading posts:', error);
        const container = document.getElementById('postContainer');
        container.innerHTML = '<p>Error loading your posts. Please try again.</p>';
      });
  }

  loadTutorPosts();
});