function showForm(formId){
    document.querySelectorAll(".form_box").forEach(form => form.classList.remove("active"));
    document.getElementById(formId).classList.add("active");
}


document.addEventListener('DOMContentLoaded', () => {
    const JregForm = document.querySelector('.regForm');
    

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
})