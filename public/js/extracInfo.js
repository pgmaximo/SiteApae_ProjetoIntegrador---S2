document.addEventListener('DOMContentLoaded', function () {

    // Funçao pra mandar os requests
    function sendRequest(url, method, data, successCallback, errorCallback) {
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (response.status === 200) {
                    return response.json().then(data => successCallback(data));
                } else if (response.status === 409 || response.status === 401) {
                    return response.json().then(data => errorCallback(data, response.status));
                } else {
                    throw new Error(`Erro HTTP! status: ${response.status}`);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }


    // Função pra mostrar o popup
    function showErrorPopup(message) {
        document.getElementById('customPopupMessage').textContent = message;
        document.getElementById('customPopup').style.display = "block";
    }

    document.addEventListener('click', function (event) {
        var cliqueDentroPopup = document.querySelector('.custom-popup-content').contains(event.target);
        var popupAberto = document.getElementById('customPopup').style.display === "block";

        if (!cliqueDentroPopup && popupAberto) {
            document.getElementById('customPopup').style.display = "none";
        }
    });

    // Event listener pra fechar o popup
    document.querySelector('.custom-popup-close').addEventListener('click', function () {
        document.getElementById('customPopup').style.display = "none";
    });

    // Event listener pra registrar
    document.querySelector('.register-container form').addEventListener('submit', function (e) {
        e.preventDefault();

        const registrationData = {
            name: document.querySelector('input[name="Nome"]').value,
            email: document.querySelector('input[name="email"]').value,
            password: document.querySelector('input[name="senha"]').value,
            phone: document.querySelector('input[name="telefone"]').value,
            cpf: document.querySelector('input[name="cpf"]').value,
            date: document.querySelector('input[name="data"]').value
        };

        sendRequest('http://localhost:3001/register', 'POST', registrationData, function (data) {
            console.log('Cadastro feito com sucesso:', data);
            window.location.replace("doacao.html");
        }, function (errorData, status) {
            if (status === 409) {
                showErrorPopup("Este email já está cadastrado! Faça login com ele ou cadastre um email diferente.");
            } else {
                console.error(`Erro HTTP! status: ${response.status}`);
            }
        });
    });

    // Event listener pra login
    document.querySelector('.login-container form').addEventListener('submit', function (e) {
        e.preventDefault();

        const loginData = {
            email: document.querySelector('input[name="emailLogin"]').value,
            password: document.querySelector('input[name="senhaLogin"]').value
        };

        sendRequest('http://localhost:3001/login', 'POST', loginData, function (data) {
            console.log('Login feito com sucesso:', data);
            window.location.replace("doacao.html");
        }, function (errorData, status) {
            if (status === 401) {
                showErrorPopup("Email ou senha inválidos! Tente novamente ou crie uma conta nova.");
            } else {
                console.error(`Erro HTTP! status: ${status}`);
            }

        });
    });
});
