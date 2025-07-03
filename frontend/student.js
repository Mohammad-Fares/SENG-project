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
        window.location.href = '/index.html';
        location.reload();
      }
    });
  }

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
    if (!confirm('Are you sure you have left this tutor?')) {
      return;
    }

    try {
      const res = await fetch(`/api/saved-posts/${postId}`, {
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

  async function addPost(postId) {
    if (!confirm('Are you sure you have started going to this tutor?')) {
      return;
    }

    try {
      console.log(postId)
      const res = await fetch(`/api/save-post`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({postId})
      });

    if (res.ok) {
      alert('Post saved successfully');
      loadPosts();
    } else {
      const errorText = await res.text();
      alert('Error saving post: ' + errorText);
    }

    } catch (err) {
      console.error('Error saving post:', err);
      alert('Failed to delete post.');
    }
  }

  function loadPosts() {
    fetch('/api/posts')
      .then(response => response.json())
      .then(posts => {
        const container = document.getElementById('postContainer');
        container.innerHTML = '';

        if (posts.length === 0) {
          container.innerHTML = '<p>No tutor posts found.</p>';
          return;
        }

        posts.forEach(post => {
          const card = document.createElement('div');
          card.className = 'card';
          card.innerHTML = `
            <h2>${escapeHtml(post.name)}</h2>
            <p><strong>Tutor:</strong> ${escapeHtml(post.tutor_name)}</p>
            <p><strong>Bio:</strong> ${escapeHtml(post.bio) || 'N/A'}</p>
            <p><strong>Email:</strong> ${escapeHtml(post.email) || 'N/A'}</p>
            <p><strong>Phone:</strong> ${escapeHtml(post.phone) || 'N/A'}</p>
            <p><strong>Endorsements:</strong> ${escapeHtml(post.rating)}</p>
            <p><strong>Price/hr:</strong> $${escapeHtml(post.pricePerHour?.toFixed(2)) || 'N/A'}</p>
            <p><strong>Location:</strong> ${escapeHtml(post.location) || 'N/A'}</p>
            <p><strong>Time Slot:</strong> ${escapeHtml(post.timeSlot) || 'N/A'}</p>
            <div class="center">
              <button class="add-tutor" data-post-id="${post.postID}">
                <p>⁺</p>
              </button>
            </div>
          `;
          container.appendChild(card);
        });


        document.querySelectorAll('.add-tutor').forEach(button => {
          button.addEventListener('click', (e) => {
            const postId = e.target.closest('.add-tutor').getAttribute('data-post-id');
            addPost(postId);
          });
        });
      })

      .catch(error => {
        console.error('Error loading posts:', error);
      });
  }

  loadPosts();
});

