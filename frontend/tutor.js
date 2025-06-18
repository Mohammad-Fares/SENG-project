document.getElementById('tutorPostForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('accessToken');
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

    const messageElement = document.getElementById('statusMessage');
    if (res.ok) {
      const text = await res.text();
      messageElement.style.color = 'green';
      messageElement.textContent = text;
      document.getElementById('tutorPostForm').reset();
    } else {
      const errorText = await res.text();
      messageElement.style.color = 'red';
      messageElement.textContent = 'Error: ' + errorText;
    }
  } catch (err) {
    console.error('Network error:', err);
    alert('Something went wrong.');
  }
});
