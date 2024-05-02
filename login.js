document.getElementById("idNumberInput").addEventListener("input", function(event) {
    var input = event.target.value;
    var numbersOnly = input.replace(/\D/g, ''); 

   
    if (numbersOnly.length > 6) {
        numbersOnly = numbersOnly.slice(0, 6);
    }

    
    if (input !== numbersOnly) {
        event.target.value = numbersOnly;
    }

    if (/^\d{0,6}$/.test(numbersOnly)) {
        event.target.value = numbersOnly;
    } else {
        event.target.value = '';
    }
});

document.getElementById("idNumberInput").addEventListener("keydown", function(event) {

    if (event.key === 'e' || event.key === 'E') {
        event.preventDefault();
    }
});


const form = [...document.querySelector('.form').children]

form.forEach((item, i) => {
    setTimeout(() =>{
        item.style.opacity = 1;
    }, i*100)
})

function redirectToDashboard() {

    window.location.href = "dashboard.html";
}

function login() {
    var username = document.getElementById("usernameInput").value;
    var password = document.getElementById("passwordInput").value;

    // Check if the username and password match the predefined values
    if (username === "admin" && password === "password") {
        // Redirect to the dashboard page
        window.location.href = "dashboard.html";
    } else {
        // Display an error message if the credentials are incorrect
        alert("Invalid username or password. Please try again.");
    }
}

