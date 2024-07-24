document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const nivel_estudio = document.getElementById('nivel_estudio').value;

            fetch('/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password,
                    nivel_estudio: nivel_estudio
                })
            }).then(response => response.json()).then(data => {
                if (data.redirect) {
                    window.location.href = data.redirect;
                } else {
                    console.log(data);
                }
            });
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }).then(response => response.json()).then(data => {
                if (data.redirect) {
                    window.location.href = data.redirect;
                } else {
                    console.log(data);
                }
            });
        });
    }
});
