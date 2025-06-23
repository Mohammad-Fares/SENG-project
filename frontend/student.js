document.addEventListener('DOMContentLoaded', () => {
  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
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
          <p><strong>Rating:</strong> ${escapeHtml(post.rating?.toString()) || 'N/A'} ⭐</p>
          <p><strong>Price/hr:</strong> $${escapeHtml(post.pricePerHour?.toFixed(2)) || 'N/A'}</p>
          <p><strong>Location:</strong> ${escapeHtml(post.location) || 'N/A'}</p>
          <p><strong>Time Slot:</strong> ${escapeHtml(post.timeSlot) || 'N/A'}</p>
        `;
        container.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Error loading posts:', error);
    });
});

