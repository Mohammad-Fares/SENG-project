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