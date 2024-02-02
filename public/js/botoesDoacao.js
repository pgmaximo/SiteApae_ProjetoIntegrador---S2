// variaveis e funçao pra mudar o exibido baseado na opçao selecionada
var qrcode = document.getElementById('qrcode');
var linkpagseguro = document.getElementById('link-pagseguro');
var radioButtons = document.querySelectorAll('input[name="forma-doacao"]');
var selectedOptionTextElement = document.getElementById('selected-option-text');
var sucesso = document.getElementById('div_sucesso_doacao');
var escolha = document.getElementById('opcoes-pagamento-id');
var btnHome = document.getElementById('btnVoltarHome');
var btnSucesso = document.getElementById('btnSucesso');
var qrcodeDiv = document.getElementById('div_qrcode');

radioButtons.forEach(function (radioButton) {
    radioButton.addEventListener('change', function () {
        var selectedOptionValue = this.value;

        if (selectedOptionValue === "pix") {
            qrcode.style.display = "block"
        }
        else {
            qrcode.style.display = "none"
        }
        if (selectedOptionValue === "outras") {
            linkpagseguro.style.display = "block"
        }
        else {
            linkpagseguro.style.display = "none"
        }
    });
});
btnHome.onclick = function () {
    window.location.href = "home.html";
};
btnSucesso.onclick = function () {
    qrcodeDiv.style.display = "none";
    sucesso.style.display = "block";
};

document.addEventListener('DOMContentLoaded', function () {
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

    // Event listener pra doacao
    document.querySelector('.qrcode form').addEventListener('submit', function (e) {
        e.preventDefault();

        const doacaoData = {
            Email: document.querySelector('input[name="email"]').value,
            valor: document.querySelector('input[name="valor"]').value
        };

        sendRequest('http://localhost:3001/doacao', 'POST', doacaoData, function (data) { //3001
            console.log('Doacao salva com sucesso:', data);
            qrcode.style.display = "none";
            escolha.style.display = "none";
            qrcodeDiv.style.display = "block";
        }, function (errorData, status) {
            if (status === 409) {
                showErrorPopup("Erro ao salvar doacao");
            } else if (status === 401) {
                showErrorPopup("Email não registrado");
            } else {
                console.error(`Erro HTTP! status: ${response.status}`);
            }
        });
    });
});