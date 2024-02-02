var divEmail = document.getElementById("div_email_esqueceu_senha"); // Div para a tela de inserção de e-mail
var divAuthCode = document.getElementById("div_auth_code"); // Div para a tela de inserção de código de autenticação
var divAtualizarSenha = document.getElementById("div_atualizar_senha"); // Div para a tela de atualização de senha
var divSucessoSenha = document.getElementById("div_sucesso_senha"); // Div para a tela de sucesso na atualização de senha

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

function enviarEmail(){
  const emailData = {
    email: document.querySelector('input[name="email"]').value
  }
  sendRequest('http://localhost:3001/enviar-email', 'POST', emailData, function (data) {
    // Após o envio do código, mude para a próxima tela
    console.log('Email enviado com sucesso:', data);
    divEmail.style.display = "none";
    divAuthCode.style.display = "block";
    console.log('divEmail.style.display:', divEmail.style.display);
    console.log('divAuthCode.style.display:', divAuthCode.style.display);

  }, function (errorData, status) {
    if (status === 401) {
      showErrorPopup("Email não cadastrado");
    } else if (status === 409){
      showErrorPopup("Erro ao enviar email");
    } else { 
      console.error(`Erro HTTP! status: ${status}`);
    }
  });
};

function verificarCodigo(){
  const verificarData = {
    codigo: document.querySelector('input[name="auth_code"]').value
  }

  sendRequest('http://localhost:3001/verificar-codigo', 'POST', verificarData, function (data) {
    // sucesso
    console.log('Código verificado com sucesso:', data);
    divAuthCode.style.display = "none";
    divAtualizarSenha.style.display = "block";
  }, function (errorData, status) {
    // erro
    if (status === 409) {
      showErrorPopup("Erro ao verificar código");
    } else if (status === 401){
      showErrorPopup("Código incorreto");
    } else{
      console.error(`Erro HTTP! status: ${status}`);
    }
  });
};

function atualizarSenha() {
  const atualizarData = {
    usuario: document.querySelector('input[name="confirmaUsuario"]').value,
    senha: document.querySelector('input[name="novaSenha"]').value
  }
  sendRequest('http://localhost:3001/atualizar-senha', 'POST', atualizarData, function (data) {
    console.log('Senha atualizada com sucesso', data);
    // Após a atualização da senha, mude para a tela de sucesso
    divAtualizarSenha.style.display = "none";
    divSucessoSenha.style.display = "block";
  }, function (errorData, status) {
    if (status === 409) {
      // divAtualizarSenha.style.display="block";
      console.log("erro ao atualizar senha");
      showErrorPopup("Erro ao atualizar senha");
    } else {
      showErrorPopup("Email incorreto")
      console.error(`Erro HTTP! status: ${response.status}`);
    }
  });
};

// Função para voltar para a página inicial
function voltarParaHome() {
  // Redirecionar para a página inicial
  window.location.replace("index.html");
}