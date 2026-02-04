let desconto = 0;
let tipoEntrega = 'entrega';

// 1. ENTRAR NO CARDÁPIO
function entrarNoCardapio() {
    const intro = document.getElementById('introScreen');
    const main = document.getElementById('mainApp');
    intro.style.opacity = "0";
    setTimeout(() => {
        intro.style.display = 'none';
        main.style.display = 'block';
        window.scrollTo(0, 0);
    }, 600);
}

// 2. CONTROLE DE QUANTIDADE
function changeQty(btn, delta) {
    const input = btn.parentNode.querySelector('.qty-input');
    let value = parseInt(input.value) + delta;
    if (value < 0) value = 0;
    input.value = value;
    calcularTotal();
}

// Ouvinte para Adicionais Pagos
document.querySelectorAll('input[name="adicional"]').forEach(check => {
    check.addEventListener('change', calcularTotal);
});

// 3. CONTROLE DE ACOMPANHAMENTOS (LIMITE 4)
document.querySelectorAll('.limit-4').forEach(check => {
    check.addEventListener('change', () => {
        const selecionados = document.querySelectorAll('.limit-4:checked');
        const contador = document.getElementById('count-acompanha');
        const todos = document.querySelectorAll('.limit-4');
       
        if (contador) contador.innerText = `(${selecionados.length}/4)`;

        if (selecionados.length >= 4) {
            todos.forEach(i => { if(!i.checked) i.parentElement.classList.add('limit-reached'); });
        } else {
            todos.forEach(i => i.parentElement.classList.remove('limit-reached'));
        }

        if (selecionados.length > 4) {
            check.checked = false;
            check.parentElement.classList.add('apply-shake');
            setTimeout(() => check.parentElement.classList.remove('apply-shake'), 300);
            alert("Limite de 4 atingido!");
        }
    });
});

// 4. CÁLCULO DE TOTAL (CARDÁPIO E MODAL)
function calcularTotal() {
    let subtotal = 0;
    document.querySelectorAll('.qty-input').forEach(input => {
        const qtd = parseInt(input.value);
        const preco = parseFloat(input.getAttribute('data-price'));
        if (qtd > 0) subtotal += (qtd * preco);
    });

    const temAcai = Array.from(document.querySelectorAll('.qty-input')).some(i => parseInt(i.value) > 0);
    if (temAcai) {
        document.querySelectorAll('input[name="adicional"]:checked').forEach(ad => {
            subtotal += parseFloat(ad.getAttribute('data-price'));
        });
    }

    let valorDesconto = subtotal * desconto;
    let totalFinal = subtotal - valorDesconto;

    const displayTotal = document.getElementById('valorTotal');
    if (displayTotal) {
        displayTotal.innerText = totalFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    const resumoValores = document.getElementById('resumoValores');
    if (resumoValores) {
        resumoValores.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-top: 15px; border-top: 1px dashed #ddd; padding-top: 10px;">
                <span>Subtotal:</span> <b>${subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</b>
            </div>
            ${desconto > 0 ? `
            <div style="display: flex; justify-content: space-between; color: #27ae60;">
                <span>Desconto:</span> <b>- ${valorDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</b>
            </div>` : ''}
            <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 900; color: #38005e; margin-top: 5px;">
                <span>TOTAL:</span> <span>${totalFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
        `;
    }
    return totalFinal;
}

// 5. SISTEMA DE CUPOM
function aplicarCupom() {
    const input = document.getElementById('inputCupom');
    const cod = input.value.toUpperCase().trim();
    const msg = document.getElementById('msgCupom');
   
    if (cod === 'PURPURA10') {
        desconto = 0.10;
        msg.innerText = "✅ Cupom aplicado!";
        msg.style.color = "green";
    } else {
        desconto = 0;
        msg.innerText = cod === "" ? "" : "❌ Inválido";
        msg.style.color = "red";
    }
    calcularTotal();
}

// 6. ABRIR CHECKOUT
function abrirCheckout() {
    const totalQtd = Array.from(document.querySelectorAll('.qty-input')).reduce((sum, i) => sum + parseInt(i.value), 0);
    if (totalQtd === 0) return alert("Selecione pelo menos um açaí!");

    let resumoHtml = "<b>Resumo dos Itens:</b><br>";
    document.querySelectorAll('.qty-input').forEach(input => {
        if (parseInt(input.value) > 0) {
            resumoHtml += `<div style="display:flex; justify-content:space-between;">
                <span>${input.value}x Açaí ${input.getAttribute('data-name')}</span>
                <span>R$ ${(parseInt(input.value) * parseFloat(input.getAttribute('data-price'))).toFixed(2)}</span>
            </div>`;
        }
    });
   
    const acomp = Array.from(document.querySelectorAll('.limit-4:checked')).map(i => i.value);
    if(acomp.length > 0) resumoHtml += `<small style="color: #666;">Acomp: ${acomp.join(', ')}</small><br>`;

    document.querySelectorAll('input[name="adicional"]:checked').forEach(ad => {
        resumoHtml += `<div style="display:flex; justify-content:space-between; font-size: 0.85rem; color: #444;">
            <span>+ ${ad.value}</span>
            <span>R$ ${parseFloat(ad.getAttribute('data-price')).toFixed(2)}</span>
        </div>`;
    });

    resumoHtml += `<div id="resumoValores"></div>`;
    document.getElementById('resumoCarrinho').innerHTML = resumoHtml;
    document.getElementById('modalCheckout').style.display = 'flex';
    calcularTotal();
}

// 7. FINALIZAR IMEDIATO (SÓ MUDA TELA)
function finalizarDeVez() {
    const nome = document.getElementById('nomeCliente').value;
    const endereco = document.getElementById('enderecoCliente').value;
    const totalTexto = document.getElementById('valorTotal').innerText;

    if (!nome || (tipoEntrega === 'entrega' && !endereco)) {
        return alert("Por favor, preencha nome e endereço!");
    }

    // Fecha o modal de dados e abre o de sucesso na hora
    document.getElementById('modalCheckout').style.display = 'none';
    document.getElementById('screenSuccess').style.display = 'flex';
   
    // Injeta a mensagem final diretamente
    const areaSucesso = document.getElementById('resumoFinalSucesso');
    if(areaSucesso) {
        areaSucesso.innerHTML = `
            <div style="padding: 10px;">
                <h2 style="color: #27ae60; margin-bottom: 10px;">✓ PEDIDO FINALIZADO!</h2>
                <p>Obrigado, <b>${nome}</b>! Recebemos seu pedido.</p>
                <p>Valor total: <b>${totalTexto}</b></p>
                <button onclick="voltarParaInicio()" style="margin-top: 20px; padding: 12px 25px; background: #38005e; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
                    NOVO PEDIDO
                </button>
            </div>
        `;
    }
}

// 8. VOLTAR AO INÍCIO E RESETAR TUDO
function voltarParaInicio() {
    document.querySelectorAll('.qty-input').forEach(input => input.value = 0);
    document.querySelectorAll('input[type="checkbox"]').forEach(check => check.checked = false);
    document.querySelectorAll('.limit-reached').forEach(el => el.classList.remove('limit-reached'));
   
    document.getElementById('nomeCliente').value = "";
    document.getElementById('enderecoCliente').value = "";
    document.getElementById('inputCupom').value = "";
    document.getElementById('msgCupom').innerText = "";
    desconto = 0;

    calcularTotal();

    document.getElementById('screenSuccess').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
    const intro = document.getElementById('introScreen');
    intro.style.display = 'flex';
    intro.style.opacity = "1";
}

// 9. AUXILIARES
function setDelivery(tipo) {
    tipoEntrega = tipo;
    document.getElementById('btnEntrega').classList.toggle('active', tipo === 'entrega');
    document.getElementById('btnRetirada').classList.toggle('active', tipo === 'retirada');
    document.getElementById('campoEndereco').style.display = tipo === 'entrega' ? 'block' : 'none';
}

function fecharCheckout() {
    document.getElementById('modalCheckout').style.display = 'none';
}

function copiarCupom() {
    const textoCupom = document.getElementById('cupomTexto').innerText;
    navigator.clipboard.writeText(textoCupom).then(() => {
        alert("Cupom copiado: " + textoCupom);
    });
}
