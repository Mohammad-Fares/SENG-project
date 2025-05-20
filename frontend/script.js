function showForm(formId){
    document.querySelectorAll(".form_box").forEach(form => form.classList.remove("active"));
    document.getElementById(formId).classList.add("active");
}

function regsubmit(){ /* i lowkey don't know if im gonna use this */
    const selectElement = document.getElementById("regDropdown");
    const selectedValue = selectElement.value;

    if (selectedValue === "student") {
        return 1;
    } else if (selectedValue === "tutor") {
        return 2;
    }
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