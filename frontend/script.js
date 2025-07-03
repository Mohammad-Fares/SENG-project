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

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,20}$/;

        if (emailRegex.test(JregEmail)) {
            if (passwordRegex.test(JregPass)) {
                regUser(JregName, JregEmail, JregPass, JregDropdown);
                JregForm.reset();
            } else {
                alert('register failed, invalid password, require at least 1 uppercase, 1 lowercase and 1 number, between 8 and 20 characters');
            }          
        } else {
            alert('register failed, invalid email require at ####@##.com format')
        }

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

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,20}$/;

        if (emailRegex.test(JlogEmail)) {
            if (passwordRegex.test(JlogPass)) {
                logUser(JlogEmail, JlogPass);
                JlogForm.reset();
            } else {
                alert('login failed, invalid password, require at least 1 uppercase, 1 lowercase and 1 number, between 8 and 20 characters');
            }          
        } else {
            alert('login failed, invalid email require at ####@##.com format')
        }

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

            if (data.role === 'student') window.location.href = '/student.html';
            else window.location.href = '/tutor.html';
})


        .catch(error => {
            console.error('Error:', error);
            alert('Login failed. Please try again');
        });
    }
    
});

