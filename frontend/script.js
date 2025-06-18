function showForm(formId){
    document.querySelectorAll(".form_box").forEach(form => form.classList.remove("active"));
    document.getElementById(formId).classList.add("active");
}


document.addEventListener('DOMContentLoaded', () => {
    const JregForm = document.querySelector('.regForm');
    const JlogForm = document.querySelector('.logForm')
    

    JregForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const JregName = document.getElementById('regName').value;
        const JregEmail = document.getElementById('regEmail').value;
        const JregPass = document.getElementById('regPass').value;
        const JregDropdown = document.getElementById('regDropdown').value;

        regUser(JregName, JregEmail, JregPass, JregDropdown);
        JregForm.reset();
    });

    function regUser(name, email, password, role) {
        fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, role})
        })
        .then(response => response.json())
        .catch(error => console.error('Error:', error));
    }

    JlogForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const JlogEmail = document.getElementById('logEmail').value;
        const JlogPass = document.getElementById('logPass').value;

        logUser(JlogEmail, JlogPass);
    });

    function logUser(email, password) {
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email, password})
        })

        .then(response => {
            if (!response.ok) {
                throw new Error('Login failed');
            }
            return response.json();
        })

         .then(data => {
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('name', data.name); // ← Store name

            if (data.role === 'student') window.location.href = '/student.html';
            else window.location.href = '/tutor.html';
})


        .catch(error => {
            console.error('Error:', error);
            alert('Login failed. Please try again');
        });
    }
    
});

