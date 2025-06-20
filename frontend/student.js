document.addEventListener('DOMContentLoaded', () => {
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
          <h2>${post.name}</h2>
          <p><strong>Tutor:</strong> ${post.tutor_name}</p>
          <p><strong>Bio:</strong> ${post.bio || 'N/A'}</p>
          <p><strong>Email:</strong> ${post.email || 'N/A'}</p>
          <p><strong>Phone:</strong> ${post.phone || 'N/A'}</p>
          <p><strong>Rating:</strong> ${post.rating || 'N/A'} ⭐</p>
          <p><strong>Price/hr:</strong> $${post.pricePerHour?.toFixed(2) || 'N/A'}</p>
          <p><strong>Location:</strong> ${post.location || 'N/A'}</p>
          <p><strong>Time Slot:</strong> ${post.timeSlot || 'N/A'}</p>
        `;
        container.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Error loading posts:', error);
    });
});

