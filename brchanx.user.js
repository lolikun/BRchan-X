// ==UserScript==
// @name           BRchan X 
// @namespace      Lolikun
// @description    Faz update da thread. Agora com backlinks, gifs animadas, hide automático de posts com sage e expandir imagens ao clicar.
// @version        1.80b
// @include        http://*.brchan.org/*
// ==/UserScript==

/* CONTRIBUIÇÕES
*
* - Miofag
* - Lolikun
*
*
* TODO
*
* - Quotes em cascata
*
*
* CHANGELOG
*
* 1.80b
* - Melhorias no estilo do quick reply
* - Adicionado evento que abre o quick reply ao apertar a tecla enter
*
* 1.80a
* - Trocado o estilo do quick reply
*
* 1.74
* - Corrigidos mais problemas no catálogo
*
* 1.73
* - Corrigido o problema no catálogo
* - Desativado o 'If-Modified-Since' por problemas de compatibilidade
*
* 1.72
* - Corrigido outro bug introduzido na versão 1.70
*
* 1.71
* - Corrigido um bug introduzido na versão 1.70 onde algumas coisas pararam de funcionar
*
* 1.70
* - Adicionado quick reply
* - Adicionado texto no catálogo
* - Adicionado o cabeçalho 'If-Modified-Since' para evitar carregamento desnecessário
* - Adicionado delay de 6 horas entre as verificações de atualização
*
* 1.60
* - Adicionada autalização automática
*
* 1.57
* - Contador de posts/imagens fica vermelho quando thread entra em autosage
*
* 1.56
* - Consertado o problema onde os links direcionavam para um post qualquer
*
* 1.55
* - Consertado o botão de 'Expandir todas as imagens' para funcionar com fit screen/gifs animadas
* - Adicionado contador do total de posts/imagens
*
* 1.54
* - Opção "esconder sage" agora fica salva
*
* 1.53
* - Adicionada compatibilidade com o Chrome
* - Trocado o valor subtraído no cálculo de tamanho máximo das imagens
*
* 1.52
* - Campo de senha permanente trocado de texto para password
*
* 1.51
* - Trocado o favicon de 404
*
* 1.50
* - Adicionado autonoko
* - Adicionada senha permanente
*
* 1.41
* - Correção do link do userscripts
*
* 1.40
* - Troca da função que faz o get da página (verificar se não quebrou alguma coisa)
* - Consertado o contador de respostas
* - Consertada a detecção de 404
* - Consertada a configuração de intervalo
* - Adicionado menu de opções
*
*/

// Modificado a partir do 4chan X Updater (aeosynth)
// Algumas funcionalidades foram baseadas no 4chan X (Mayhem)

// Copyright (c) 2010 James Campos

// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following
// conditions:

// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.

(function() {

var versaoatual = '1.80b';
var linkvchecker = 'https://raw.github.com/lolikun/BRchan-X/master/stable/latest.js';
var linkscript = 'https://raw.github.com/lolikun/BRchan-X/master/stable/brchanx.user.js';

var ConfigX, Conf;

ConfigX = {
	principal: {
		Funcionalidades: {
			'Atualização automática': [true, 'Checa se existe uma versão mais atual do script'],
			'Quick reply': [true, 'Adiciona um formulário de postagem flutuante'],
			'Texto no catálogo': [true, 'Adiciona o texto das threads no catálogo'],
			'Animar GIFs': [true, 'Anima automaticamente as thumbs de imagens do tipo GIF'],
			'Expansão de imagens': [true, 'Expande imagens no clique (com fit screen)'],
			'Adicionar backlinks': [true, 'Adiciona backlinks para os posts quotados'],
			'Autonoko': [true, 'Adiciona noko automaticamente ao campo de email']
		}
	}
}

Conf = {};

function verificaVersao(e) {

if (e.data.versao && e.data.versao != versaoatual && confirm('BRchan X: Existe uma nova versão disponível. Você deseja atualizar?')) {
	window.location=linkscript;
}

}

function formData(arg) {

var fd, key, val;
if (arg instanceof HTMLFormElement) {
	fd = new FormData(arg);
} else {
	fd = new FormData();
for (key in arg) {
	val = arg[key];
	if (val) {
		fd.append(key, val);
	}
}
}
return fd;

}

var randstr = '';
var possible = 'abcdefghijklmnopqrstuvwxyz0123456789';

for( var i=0; i < 5; i++ )
	randstr += possible.charAt(Math.floor(Math.random() * possible.length));

function onloadReply(html) {

var r = new XMLHttpRequest();
r.open('GET', 'http://www.brchan.org/usr/?mode=1&info=y', true);
r.send();
var x = new XMLHttpRequest();
x.open('GET', 'http://www.brchan.org/usr/?mode=2&info=533160108131b18e6c93b7a73e4' + randstr, true);
x.send();

var resposta = document.implementation.createHTMLDocument('');
resposta.documentElement.innerHTML = html;

if (resposta.getElementsByTagName('h2')[0] != undefined) {
	$$('#errorspan', document.body)[0].textContent=resposta.getElementsByTagName('h2')[0].textContent;
} else {
	clearReply();
	hideReply();
}

}

function onerrorReply() {

$$('#errorspan', document.body)[0].textContent='Problema na conexão com o servidor.';

}

function restartlessReply() {
document.body.addEventListener('DOMAttrModified', function(e){
	var bgcolor = window.getComputedStyle(document.body).getPropertyValue('background-color')
	bgcolor == 'transparent' ? bgcolor = 'rgb(214, 231, 168)' : '';
	if (e.attrName === 'style') { GM_addStyle('\
	div.postarea {\
		background-color: ' + bgcolor + ';\
		}'); }});
var bgcolor = window.getComputedStyle(document.body).getPropertyValue('background-color')
bgcolor == 'transparent' ? bgcolor = 'rgb(214, 231, 168)' : '';
GM_addStyle('\
	div.postarea {\
		padding: 1px;\
		border: 1px solid;\
		border-color: #AAA;\
		min-width: 320px;\
		background-color: ' + bgcolor + ';\
	}\
	div.postarea > form {\
		margin: 0;\
	}\
	.field {\
		border: 1px solid #CCC;\
		box-sizing: border-box;\
		-moz-box-sizing: border-box;\
		color: #333;\
		background-color: white;\
		font: 13px sans-serif;\
		margin: 0;\
		padding: 2px 4px 3px;\
		-webkit-transition: color .25s, border .25s;\
		-moz-transition: color .25s, border .25s;\
		-o-transition: color .25s, border .25s;\
		transition: color .25s, border .25s;\
	}\
	.field:-moz-placeholder,\
	.field:hover:-moz-placeholder {\
		color: #AAA;\
	}\
	.field:hover, .field:focus {\
		border-color: #999;\
		color: #000;\
		outline: none;\
	}\
	#postform > div:first-child > .field {\
		width: 25%;\
	}\
	div.postarea textarea.field {\
		display: -webkit-box;\
		min-height: 120px;\
		min-width: 100%;\
	}\
	.textarea {\
		position: relative;\
	}\
	div.postarea [name=postpassword] {\
		margin: 1px 0;\
		width: 30%;\
	}\
	div.postarea [type=file] {\
		color: black;\
		background-color: white;\
		margin: 1px 0;\
		width: 70%;\
	}\
	div.postarea [type=submit] {\
		width: 23%;\
		margin: 1%;\
		border: 1px solid #F3F3F3;\
		-moz-box-shadow: 0 0 0 1px #707070;\
		-webkit-box-shadow: 0 0 0 1px #707070;\
		box-shadow: 0 0 0 1px #707070;\
		-moz-border-radius: 3px;\
		-webkit-border-radius: 3px;\
		border-radius: 3px;\
		background: -moz-linear-gradient(top, #F2F2F2 0%, #EBEBEB 50%, #DDDDDD 51%, #CFCFCF 100%);\
		background: -webkit-gradient(linear, left top, left bottom, color-stop(0,#F2F2F2), color-stop(0.5,#EBEBEB),color-stop(0.51,#DDDDDD),color-stop(1,#CFCFCF));\
		background: linear-gradient(top, #F2F2F2 0%, #EBEBEB 50%, #DDDDDD 51%, #CFCFCF 100%);\
		filter: progid:DXImageTransform.Microsoft.gradient( startColorstr="#F2F2F2", endColorstr="#CFCFCF",GradientType=0 ); /* ie */\
		font: normal 12px sans-serif;\
		color: black;\
		text-decoration: none;\
	}\
	div.postarea [type=submit]:hover {\
		border: 1px solid #ECF7FD;\
		-moz-box-shadow: 0 0 0 1px #3C7FB1;\
		-webkit-box-shadow: 0 0 0 1px #3C7FB1;\
		box-shadow: 0 0 0 1px #3C7FB1;\
		background: -moz-linear-gradient(top, #EAF6FD 0%, #D9F0FC 50%, #BEE6FD 51%, #A7D9F5 100%);\
		background: -webkit-gradient(linear, left top, left bottom, color-stop(0,#EAF6FD), color-stop(0.5,#D9F0FC),color-stop(0.51,#BEE6FD),color-stop(1,#A7D9F5));\
		background: linear-gradient(top, #EAF6FD 0%, #D9F0FC 50%, #BEE6FD 51%, #A7D9F5 100%);\
		filter: progid:DXImageTransform.Microsoft.gradient( startColorstr="#EAF6FD", endColorstr="#A7D9F5",GradientType=0 ); /* ie */\
	}\
	div.postarea [type=submit]:active {\
		border: 1px solid #73A7C4;\
		border-bottom: 0;\
		-moz-box-shadow: 0 0 0 1px #2C628B;\
		-webkit-box-shadow: 0 0 0 1px #2C628B;\
		box-shadow: 0 0 0 1px #2C628B;\
		background: -moz-linear-gradient(top, #E5F4FC 0%, #C4E5F6 50%, #98D1EF 51%, #68B3DB 100%);\
		background: -webkit-gradient(linear, left top, left bottom, color-stop(0,#E5F4FC), color-stop(0.5,#C4E5F6),color-stop(0.51,#98D1EF),color-stop(1,#68B3DB));\
		filter: progid:DXImageTransform.Microsoft.gradient( startColorstr="#E5F4FC", endColorstr="#68B3DB",GradientType=0 ); /* ie */\
	}\
');

var f = document.createElement('form');
f.className='postform';
f.id='postform';
f.action='http://www.brchan.org/forum.php';
nameExists = $$('[name=name]', document.body)[0] != undefined ? 'enabled' : 'disabled';
embedExists = $$('[name=embed]', document.body)[0] != undefined ? '<div><input name=embed title=Embutir placeholder=Embutir class=field style="width:70%"><select name="embedtype" style="width: 30%"><option value="youtube">Youtube</option></select></div>' : '';
spoilerExists = $$('[name=spoiler]', document.body)[0] != undefined ? '<div style="float: left"><input name="spoiler" id="spoiler" type="checkbox"><label for="spoiler">Spoiler</label></div>' : '';
f.innerHTML = '\
  <div><input ' + nameExists + ' name=name title=Nome placeholder=Nome class=field size=1><input value=' + $$('[name=em]', document.body)[0].value + ' name=em title=E-mail placeholder=E-mail class=field size=1><input name=subject title=Assunto placeholder=Assunto class=field size=1><input value=Responder type=submit></div>\
  <div><input name="board" value="' + $$('[name=board]', document.body)[0].value + '" type="hidden"><input name="replythread" value="' + $$('[name=replythread]', document.body)[0].value + '" type="hidden"><input name="MAX_FILE_SIZE" value="' + $$('[name=MAX_FILE_SIZE]', document.body)[0].value + '" type="hidden"></div>\
  <div class=textarea><textarea name=message title=Mensagem placeholder=Mensagem class=field></textarea></div>\
  ' + embedExists + '\
  <div><input name=imagefile type=file multiple size=16><input value=' + $$('[name=postpassword]', document.body)[0].value + ' name=postpassword title=Senha placeholder=Senha class=field type=password size=1></div>\
  ' + spoilerExists;
$$('div.postarea', document.body)[0].replaceChild(f, $$('#postform', document.body)[0]);  


var arquivo;
var img = $$('[name=imagefile]', document.body)[0];
img.value = null;
img.addEventListener('change', function(x){ arquivo = this.files[0] });

var form = $$('#postform', document.body)[0];
form.addEventListener('submit',function(e){
	var formulario = formData({
		"board":$$('[name=board]', document.body)[0].value,
		"replythread":$$('[name=replythread]', document.body)[0].value,
		"MAX_FILE_SIZE":$$('[name=MAX_FILE_SIZE]', document.body)[0].value,
		"email":'',
		"name":($$('[name=name]', document.body)[0] != undefined) ? $$('[name=name]', document.body)[0].value : '',
		"em":$$('[name=em]', document.body)[0].value,
		"subject":$$('[name=subject]', document.body)[0].value,
		"message":$$('[name=message]', document.body)[0].value,
		"imagefile":arquivo,
		"spoiler":($$('[name=spoiler]', document.body)[0] != undefined) ? $$('[name=spoiler]', document.body)[0].value : '',
		"embed":($$('[name=embed]', document.body)[0] != undefined) ? $$('[name=embed]', document.body)[0].value : '',
		"embedtype":($$('[name=embedtype]', document.body)[0] != undefined) ? $$('[name=embedtype]', document.body)[0].value : '',
		"postpassword":$$('[name=postpassword]', document.body)[0].value
	});
	e.preventDefault();
	var r = new XMLHttpRequest();
	r.open('post', form.action, true);
	r.onload = function() {onloadReply(this.response)};
	r.onerror = function() {onerrorReply};
	r.upload.onprogress = function(e) { $$('#errorspan', document.body)[0].textContent="" + (Math.round(e.loaded / e.total * 100)) + "%"};
	r.setRequestHeader('Cache-Control', ''); 
    r.setRequestHeader('Pragma', ''); 
	r.send(formulario);
});

}

function hideReply() {

$$('div.postarea', document.body)[0].style.display='none';
document.body.onkeypress = function(e) { if (e.keyCode == 13) { showReply(); return false } };

}

function showReply() {

document.body.onkeypress = '';
$$('div.postarea', document.body)[0].style.display='block';
$$('[name=message]', document.body)[0].focus();

}

function clearReply() {

$$('#errorspan', document.body)[0].textContent='';
$$('[name=message]', document.body)[0].value = null;
$$('[name=imagefile]', document.body)[0].value = null;

}

function adicionaEventoQuote() {

var a = document.getElementsByTagName('a');
for (i=0;i<a.length;i++) {
	if (a[i].getAttribute('onclick') && a[i].getAttribute('onclick').substring(0,13) == 'return insert') {
		a[i].addEventListener('click', showReply);
	}
}

}

function floatingReply() {

var postarea = $$('div.postarea', document.body)[0];
postarea.style.display='none';
postarea.style.position='fixed';
postarea.style.right='0px';
postarea.style.top='45px';
postarea.height='80%';
postarea.removeChild(postarea.getElementsByTagName('hr')[0]);
postarea.parentNode.insertBefore(document.createElement('hr'), postarea.nextElementSibling);

var postform = $$('#postform', document.body)[0];

var botaofechar = document.createElement('div');
botaofechar.style.cssFloat='right';
botaofechar.innerHTML='<a id="hidereply" href="javascript:;">x</a>';

var errorspan = document.createElement('span');
errorspan.id='errorspan';
errorspan.style.cssFloat='left';
errorspan.className='error';

postform.parentNode.insertBefore(errorspan, postform);
postform.parentNode.insertBefore(botaofechar, postform);
postform.parentNode.insertBefore(document.createElement('br'), postform);
document.getElementById('hidereply').addEventListener('click', hideReply);

var linkabrir = document.createElement('h1');
linkabrir.innerHTML='<a id="abrirreply" href="javascript:;">Responder</a>';
linkabrir.style.textAlign='center';
postarea.parentNode.insertBefore(linkabrir, postarea);
document.getElementById('abrirreply').addEventListener('click', showReply);

adicionaEventoQuote();

}

function insereTextoCatalogo() {

var td = $$('td[valign=middle]', document.body);

for (var i=0;i<td.length;i++) {
	var a = td[i].getElementsByTagName('a')[0];
	if (a.getElementsByTagName('img')[0] != undefined) a.getElementsByTagName('img')[0].setAttribute('align','left');
	var small = td[i].getElementsByTagName('small')[0];
	small.parentNode.removeChild(small.parentNode.getElementsByTagName('br')[0]);
	var titulo = a.title.substring(0,41).replace(/\n/,' ').split(' ');
	var texto = '';
	if (titulo.length == 1) texto = titulo[0].length > 40 ? '...' : titulo[0];
	for (var k=1;k<titulo.length;k++) {
		texto += titulo[k - 1] + ' ';
	}
	if (texto == '') texto = '~';
	small.innerHTML += ' - ' + texto;
}

document.body.innerHTML = document.body.innerHTML.replace(/<\/td>\n<\/tr>\n<tr>\n<td valign="middle">/g, '</td><td valign="middle">');
document.body.innerHTML = document.body.innerHTML.replace(/<\/td>\n<td valign="middle">/g, '</td><td valign="middle">');
var str = document.body.innerHTML;
str = str.split(/<\/td><td valign="middle">/);
var html = '';
for (var i=1;i<=str.length;i++) {
	var tags = (i > 0 && i % 4 == 0) ? '</td></tr><tr><td valign="middle">' : '</td><td valign="middle">';
	html += str[i - 1] + tags;
}
document.body.innerHTML = html;

var maxwidth = (window.innerWidth - 320) / 4;
maxwidth = maxwidth > 200 ? 200 : maxwidth;
td[0].parentNode.parentNode.parentNode.style.width=maxwidth * 4;

var td = $$('td[valign=middle]', document.body);
for (var i=0;i<td.length;i++) {
	td[i].setAttribute('valign','top');
	td[i].style.maxWidth=maxwidth + 'px';
	td[i].style.wordWrap='break-word';
}

}

function salvaOpcao() {

GM_setValue(this.name, this.checked);
return Conf[this.name] = this.checked;	

}

function criaNumeroPosts() {

var nposts = $$('td.reply', document.body).length;
var nimgs = $$('img', document.body.getElementsByClassName('thread')[0]).length;
var div = document.createElement('div');
div.id = 'numeroposts';
div.textContent = nposts + ' / ' + (nimgs - 1);
if (nposts >= 200) div.style.color='red';
if (document.getElementById('numeroposts') != undefined) {
	document.body.replaceChild(div, document.getElementById('numeroposts'));
} else {
	document.body.appendChild(div);
}

}

function criaLinkOpcoes() {

criaOpcoes();
deletaOpcoes.call(document.getElementById('overlay'));

var a = document.getElementsByTagName('a');

for (var i=0;i<a.length;i++) {
	if (a[i].title == 'Tópicos observados.') {		
		var textoOpcoes = document.createElement('span');
		textoOpcoes.innerHTML = '[<a href="javascript:;" id="linkOpcoes">BRchan X</a>]';
		
		a[i].parentNode.appendChild(textoOpcoes);
		document.getElementById('linkOpcoes').addEventListener('click', criaOpcoes);
	}
}

}

function criaOpcoes() {

var dialogo, overlay;

dialogo = document.createElement('div');
dialogo.id = 'opcoes';
dialogo.className = 'reply dialog';
dialogo.innerHTML = '\
	<div id="barraopcoes">\
		<div id="fonte" style="float:right"><a target="_blank" href="http://userscripts.org/scripts/show/147517">BRchan X</a></div>\
		<div><label for="abaconfig">Configurações</label> | <label for="abasobre">Sobre</label></div>\
	</div>\
	<hr>\
	<div id="areaopcoes">\
		<input type="radio" name="aba" hidden id="abaconfig" checked>\
			<div class="divprincipal"></div>\
		<input type="radio" name="aba" hidden id="abasobre">\
			<div>BRchan X versão ' + versaoatual + '<br>\
			Baseado no 4chan X updater (aeosynth)<br>\
			<ul>Funcionalidades:\
				<li>- Thread updater</li>\
				<li>- Hide em posts específicos</li>\
				<li>- Hide automático em posts com sage para ser usado em casos de sagebomb (habilitável na parte inferior da página)</li>\
				<li>- Animação de GIFs</li>\
				<li>- Quote backlinks</li>\
				<li>- Expansão de imagens no clique com fit screen</li>\
				<li>- Autonoko</li>\
				<li>- Senha permanente</li>\
			</ul>\
			<ul>Contribuições:\
				<li>- Miofag - Adaptação do 4chan X updater para o kusaba</li>\
				<li>- Lolikun - Novas implementações</li>\
			</ul>\
			Caso encontre algum bug favor notificar na página do userscripts\
			</div>\
	</div>';

var config = ConfigX.principal, chave, objeto, ul, opcao, array, valor, checked, li, senha;	
	
for (chave in config) {
	objeto = config[chave];
	ul = document.createElement('ul');
	ul.textContent = chave + ':';
	for (opcao in objeto) {
		array = objeto[opcao];
		valor = GM_getValue(opcao, array[0]);
		checked = valor ? 'checked' : '';
		GM_setValue(opcao, valor);
		Conf[opcao] = valor;
		li = document.createElement('li');
		li.innerHTML = '<label><input type="checkbox" name="' + opcao + '" ' + checked + '>' + opcao + '</label>: ' + array[1];
		li.getElementsByTagName('input')[0].addEventListener('click',salvaOpcao);
		ul.appendChild(li);
	}
	dialogo.getElementsByClassName('divprincipal')[0].appendChild(ul);
}

GM_setValue('Senha permanente', GM_getValue('Senha permanente',''));
if (GM_getValue('Senha permanente','') != '') 
	document.getElementsByName("postpassword", "input")[0].value = document.getElementsByName("postpassword", "input")[1].value = GM_getValue('Senha permanente','');

senha = document.createElement('li');
senha.innerHTML = 'Senha permanente (deixe em branco para desabilitar): <input type="password" maxlength="12" size="12" value="' + GM_getValue('Senha permanente','') + '">';
senha.getElementsByTagName('input')[0].addEventListener('change',atualizaSenha, true);
dialogo.getElementsByClassName('divprincipal')[0].getElementsByTagName('ul')[0].appendChild(senha);
	
overlay = document.createElement('div');
overlay.id = 'overlay';

dialogo.addEventListener('click',function(e) {return e.stopPropagation()});
overlay.addEventListener('click',deletaOpcoes);

overlay.appendChild(dialogo);
document.body.appendChild(overlay);

}

function atualizaSenha() {

GM_setValue('Senha permanente', this.value);
Conf['Senha permanente'] = this.value;

if (this.value != '') 
	document.getElementsByName("postpassword", "input")[0].value = document.getElementsByName("postpassword", "input")[1].value = this.value;

}

function deletaOpcoes() {

this.parentNode.removeChild(this);

}

function atualizaTitulo() {

board = location.pathname.substring(1).split('/')[0];
document.title = "/" + board + "/ - " + document.getElementsByTagName('blockquote')[0].textContent;

}

function trocaOnClick() {

var a = document.getElementsByTagName('a');
var maxwidth = window.innerWidth - 100;
var expandetodos = document.createElement('a');
expandetodos.setAttribute('onclick','');
expandetodos.href='javascript:;';
expandetodos.textContent='Expandir todas as imagens';

for (var i=0;i<a.length;i++){

	var onclick = a[i].getAttribute('onclick');

	if (a[i].href.slice(-4) == ".gif" && GM_getValue('Animar GIFs', Conf['Animar GIFs'])){
		if (onclick != null && onclick.substring(0,20) == "javascript:expandimg" && a[i].id != "modificado") {
			var subonclick = onclick.split(" ")[0] + " " + onclick.split(" ")[2] + " " + onclick.split(" ")[1];
			subonclick += " " + onclick.split(" ")[5] + " " + onclick.split(" ")[6].split(")")[0] + ",";
			subonclick += " " + onclick.split(" ")[3] + " " + onclick.split(" ")[4].replace(",",")") + onclick.split(" ")[6].split(")")[1] + " " + onclick.split(" ")[7];			
			a[i].setAttribute('onclick', subonclick);
			a[i].id = "modificado";
		}
		a[i].addEventListener('click',animaGifs);
	}	
	
	var onclick = a[i].getAttribute('onclick');
	
	if (onclick != null && onclick.substring(0,20) == "javascript:expandimg") {
		var orgwidth = onclick.split(" ")[3].replace(",","").replace(/'/g,"");
		var orgheight = onclick.split(" ")[4].replace(",","").replace(/'/g,"");
		var ar, width, height;
		
		if (orgwidth > maxwidth) {
			ar = orgwidth / orgheight;
			width = maxwidth;
			height = Math.round(maxwidth / ar);
		} else {
			width = orgwidth;
			height = orgheight;
		}
			
		var subonclick = onclick.split(" ")[0] + " " + onclick.split(" ")[1] + " " + onclick.split(" ")[2];
		subonclick += " '" + width + "', '" + height + "',";
		subonclick += " " + onclick.split(" ")[5] + " " + onclick.split(" ")[6] + " " + onclick.split(" ")[7];
		if (a[i].getElementsByTagName('span')[0] != undefined) expandetodos.setAttribute('onclick', expandetodos.getAttribute('onclick') + subonclick.replace('return false;',''))
		a[i].setAttribute('onclick', subonclick);
	}
}

expandetodos.setAttribute('onclick', expandetodos.getAttribute('onclick') + 'return false;');
for (var i=0;i<a.length;i++) {
	if (a[i].textContent == 'Expandir todas as imagens') a[i].parentNode.replaceChild(expandetodos, a[i]);
}

}

function escondePost() {

var div = this.parentNode.nextElementSibling.getElementsByTagName("div")[0];

var filesize = div.getElementsByClassName('filesize')[0];
var img = div.getElementsByClassName('thumb')[0];
var blockquote = div.getElementsByTagName('blockquote')[0];

if (blockquote.style.display == "none") { 
	if (filesize != undefined) {
		filesize.style.display = "inline"; 
		img.style.display = "inline";
		img.parentNode.parentNode.previousElementSibling.style.display = "inline";
	}
	blockquote.style.display = "block";
	this.innerHTML = ">>"; 
	
} else {
	if (filesize != undefined) {
		filesize.style.display = "none"; 
		img.style.display = "none";
		img.parentNode.parentNode.previousElementSibling.style.display = "none";
	}
	blockquote.style.display = "none";
	this.innerHTML = "<<";
}
}

function adicionaHide() {

var doubledash = document.getElementsByClassName('doubledash');

for (var i=0;i<doubledash.length;i++) {
	if (doubledash[i].innerHTML.substring(1,9) == "&gt;&gt;") {
		doubledash[i].innerHTML = "<a href='javascript:;' class='hidepost'>>></a>";
		doubledash[i].getElementsByClassName('hidepost')[0].addEventListener("click", escondePost);
	}
}
}

function escondeSageOnClick() {

GM_setValue('Esconder sage', this.checked);
escondeSage(false);

}

function escondeSage(atualizacao) {

var reply = document.getElementsByClassName('reply');

for (var i=0;i<reply.length;i++) {
	var a = reply[i].getElementsByTagName('a');
	
	for (var k=0;k<a.length;k++) {
		if (a[k].href == "mailto:sage") {	
			td = reply[i].previousElementSibling;
			if ((atualizacao && reply[i].getElementsByTagName('blockquote')[0].style.display != "none" && document.getElementById('hidesage').checked) || !atualizacao) {
				escondePost.call(td.getElementsByClassName('hidepost')[0]);
			}
			break;
			
		}
	}
}
}

function adicionaCheckbox() {

var navbar = document.getElementsByClassName('navbar')[1];

var checkbox = document.createElement('div');
var hidesage = GM_getValue('Esconder sage',false) ? 'checked' : '';
checkbox.innerHTML = '<input type="checkbox" id="hidesage" ' + hidesage + '>Esconder sage<br>';

if (GM_getValue('Esconder sage',false)) escondeSage(false);

navbar.parentNode.insertBefore(checkbox,navbar);
document.getElementById('hidesage').addEventListener('click', escondeSageOnClick);

}

function expandeOnClick() {

var img = document.getElementsByTagName('a');

for (var i=0;i<img.length;i++) {
	if (img[i].getElementsByTagName('span')[0] != undefined) {
		var expand = img[i - 1].getAttribute('onclick');
		img[i].setAttribute('onclick',expand);
	}
}

}

function animaGifs() {
var thumbs = document.getElementsByTagName("img");
var num = thumbs.length;
 
for(i = 0; i < num; i++){
        if(thumbs[i].className == "thumb"){
                if(thumbs[i].src.match(".gif")){
                        thumbs[i].src = thumbs[i].src.replace("s.gif", ".gif");
                        thumbs[i].src = thumbs[i].src.replace("thumb", "src");
                }
        }
}
}

function updateBackLinks() {
var i;
var links = document.getElementsByTagName('a');
var linkslen = links.length;
	for (i=0;i<linkslen;i++){
		var linksclass = links[i].getAttribute('class');
		var testref = links[i].parentNode.getAttribute('class');
		if (linksclass != null && linksclass.indexOf('ref|') != -1 && (testref == undefined || testref != 'reflink')) {
			var onde = links[i].href.substr(links[i].href.indexOf('#') + 1);
			//adicionado um parentNode
			var quem = links[i].parentNode.parentNode.parentNode.getElementsByTagName('a')[0].name;
			var br = links[i].href.substring(links[i].href.indexOf('org/') +4, links[i].href.indexOf('/res'));
			var brlen = br.length;
			var tr = links[i].href.substring(links[i].href.indexOf('res/') +4, links[i].href.indexOf('.html'));
			addBackLinks(quem, onde, tr, br);
		}
	}

var spoilerspan = document.getElementsByTagName('span');
for (var k=0;k<spoilerspan.length;k++){
	if (spoilerspan[k].getAttribute('style') == 'color:black;background-color:#000;') {
		spoilerspan[k].setAttribute('style','color:black;');
		spoilerspan[k].setAttribute('onmouseover','');
	}
}

function addBackLinks (quem, onde, tr, br) {
	var ondeid = document.getElementById('reply' + onde);
	if (ondeid != undefined) {
		var onderefl = ondeid.querySelectorAll('span.reflink')[0];
		if (onderefl.innerHTML.indexOf(quem) == -1){
			var e = document.createElement('a');
			e.innerHTML=' <u>>>' + quem + '</u>';
			e.setAttribute('href','/' + br + '/res/' + tr + '.html#' + quem);
			e.setAttribute('class','ref|' + br + '|' + tr + '|' + quem);
			e.setAttribute('onclick','return highlight(\'' + quem + '\', true);');
			onderefl.appendChild(e);
			return linkslen++;
		}
	}
}
return 0;
}

  var $, $$, AEOS, BOARD, _i, _ref, aa, autoUpdate, changeCheckbox, changeInterval, checkboxListener, config, favDead, favDeadHalo, favHalo, favNormal, favicon, head, inBefore, intervalId, isDead, key, m, makeOptions, makeRow, makeUpdater, n, onloadUpdater, parseResponse, r, replace, request, scroll, timerF, toggleVerbose, unread, updateFavicon, x, lastModified = '0';
  var __hasProp = Object.prototype.hasOwnProperty;
  config = {
    'Verbose': true,
    'Update Title': true,
    'Auto Start': true,
    'Interval': 30
  };
  AEOS = {
    init: function() {
      if (typeof GM_deleteValue === 'undefined') {
        window.GM_setValue = function(name, value) {
          value = (typeof value)[0] + value;
          return localStorage.setItem(name, value);
        };
        window.GM_getValue = function(name, defaultValue) {
          var type, value;
          if (!(value = localStorage.getItem(name))) {
            return defaultValue;
          }
          type = value[0];
          value = value.substring(1);
          switch (type) {
            case 'b':
              return value === 'true';
            case 'n':
              return Number(value);
            default:
              return value;
          }
        };
        window.GM_addStyle = function(css) {
          var style;
          style = document.createElement('style');
          style.type = 'text/css';
          style.textContent = css;
          return document.getElementsByTagName('head')[0].appendChild(style);
        };
      }
      return GM_addStyle('\
            div.dialog {\
                border: 1px solid;\
            }\
            div.dialog > div.move {\
                cursor: move;\
            }\
            div.dialog label,\
            div.dialog a {\
                cursor: pointer;\
            }\
        ');
    },
    makeDialog: function(id, position) {
      var dialog, left, top;
      dialog = document.createElement('div');
      dialog.className = 'reply dialog';
      dialog.id = id;
      switch (position) {
        case 'topleft':
          left = '0px';
          top = '0px';
          break;
        case 'topright':
          left = null;
          top = '0px';
          break;
        case 'bottomleft':
          left = '0px';
          top = null;
          break;
        case 'bottomright':
          left = null;
          top = null;
          break;
      }
      left = GM_getValue("" + (id) + "Left", left);
      top = GM_getValue("" + (id) + "Top", top);
      if (left) {
        dialog.style.left = left;
      } else {
        dialog.style.right = '0px';
      }
      if (top) {
        dialog.style.top = top;
      } else {
        dialog.style.bottom = '0px';
      }
      return dialog;
    },
    move: function(e) {
      var div;
      div = this.parentNode;
      AEOS.div = div;
      AEOS.dx = e.clientX - div.offsetLeft;
      AEOS.dy = e.clientY - div.offsetTop;
      AEOS.width = document.body.clientWidth - div.offsetWidth;
      AEOS.height = document.body.clientHeight - div.offsetHeight;
      document.addEventListener('mousemove', AEOS.moveMove, true);
      return document.addEventListener('mouseup', AEOS.moveEnd, true);
    },
    moveMove: function(e) {
      var bottom, div, left, right, top;
      div = AEOS.div;
      left = e.clientX - AEOS.dx;
      if (left < 20) {
        left = '0px';
      } else if (AEOS.width - left < 20) {
        left = '';
      }
      right = left ? '' : '0px';
      div.style.left = left;
      div.style.right = right;
      top = e.clientY - AEOS.dy;
      if (top < 20) {
        top = '0px';
      } else if (AEOS.height - top < 20) {
        top = '';
      }
      bottom = top ? '' : '0px';
      div.style.top = top;
      return (div.style.bottom = bottom);
    },
    moveEnd: function() {
      var div, id;
      document.removeEventListener('mousemove', AEOS.moveMove, true);
      document.removeEventListener('mouseup', AEOS.moveEnd, true);
      div = AEOS.div;
      id = div.id;
      GM_setValue("" + (id) + "Left", div.style.left);
      return GM_setValue("" + (id) + "Top", div.style.top);
    }
  };
  x = function(path, root) {
    root || (root = document.body);
    return document.evaluate(path, root, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null).singleNodeValue;
  };
  $ = function(selector, root) {
    root || (root = document.body);
    return root.querySelector(selector);
  };
  $$ = function(selector, root) {
    var _i, _len, _ref, _result, node, result;
    root || (root = document.body);
    result = root.querySelectorAll(selector);
    _result = []; _ref = result;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      node = _ref[_i];
      _result.push(node);
    }
    return _result;
  };
  inBefore = function(root, el) {
    return root.parentNode.insertBefore(el, root);
  };
  replace = function(root, el) {
    return root.parentNode.replaceChild(el, root);
  };
  n = function(tag, properties) {
    var element;
    element = document.createElement(tag);
    if (properties) {
      m(element, properties);
    }
    return element;
  };
  m = function(element, properties) {
    var _ref, key, val;
    _ref = properties;
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      val = _ref[key];
      (element[key] = val);
    }
    return element;
  };
  AEOS.init();
  
//modificações aplicadas antes do primeiro update
//essas modificações serão aplicadas mesmo que não esteja dentro de uma thread
if (GM_getValue('Atualização automática', Conf['Atualização automática']) && parseInt(GM_getValue('ultimaAtualizacao',0), 10) < Date.now() - (6 * 1000 * 60 * 60)) {

GM_setValue('ultimaAtualizacao', Date.now().toString());
window.addEventListener('message', verificaVersao);
var r = GM_xmlhttpRequest({
	method: 'GET', 
	url: linkvchecker,
	onload: function(x) {
		var script = document.createElement('script');
		script.innerHTML = x.responseText;
		document.body.appendChild(script);
	}
});

}
var substring = location.pathname.substring(1).split('/');
if ((substring.length == 2 && substring[1] == '') || (substring.length > 1 && substring[1] == "res")) {
	criaLinkOpcoes();
	if (GM_getValue('Animar GIFs', Conf['Animar GIFs'])) animaGifs();
	if (GM_getValue('Adicionar backlinks', Conf['Adicionar backlinks'])) updateBackLinks();
	adicionaHide();
	adicionaCheckbox();
	if (GM_getValue('Expansão de imagens', Conf['Expansão de imagens'])) expandeOnClick();
	trocaOnClick();
	if (GM_getValue('Autonoko', Conf['Autonoko'])) document.getElementsByName("em", "input")[0].value = "noko";
} else if (substring.length > 1 && substring[1] == "catalog.html" &&GM_getValue('Texto no catálogo', Conf['Texto no catálogo'])) insereTextoCatalogo();
  
  GM_addStyle('\
    #updater {\
        padding: 5px;\
        position: fixed;\
        border: 1px solid;\
        text-align: right;\
    }\
    #updater label {\
        cursor: pointer;\
    }\
    #updater span.new {\
        background: lime;\
    }\
    #updater:not(:hover) > *:not(:first-child) {\
        display: none;\
    }\
    #updater input[type="text"] {\
        width: 50px;\
    }\
    .move {\
        cursor: move;\
    }\
    span.error {\
        color: red;\
    }\
	body.unscroll {\
		overflow: hidden;\
	}\
	#opcoes {\
		box-sizing: border-box;\
		-moz-box-sizing: border-box;\
		display: inline-block;\
		padding: 5px;\
		position: relative;\
		text-align: left;\
		vertical-align: middle;\
		width: 600px;\
		max-width: 100%;\
		height: 500px;\
		max-height: 100%;\
	}\
	#overlay {\
		position: fixed;\
		top: 0;\
		left: 0;\
		width: 100%;\
		height: 100%;\
		text-align: center;\
		background: rgba(0,0,0,.5);\
		z-index: 1;\
	}\
	#overlay::after {\
		content: "";\
		display: inline-block;\
		height: 100%;\
		vertical-align: middle;\
	}\
	[hidden],\
	#areaopcoes > [name=aba]:not(:checked) + div {\
		display: none !important;\
	}\
	#opcoes label {\
		text-decoration: underline;\
	}\
	#opcoes ul {\
		padding: 0;\
	}\
	#opcoes article li {\
		margin: 10px 0 10px 2em;\
	}\
	#areaopcoes {\
		overflow: auto;\
		position: absolute;\
		top: 2.5em;\
		right: 5px;\
		bottom: 5px;\
		left: 5px;\
	}\
	#numeroposts {\
        padding: 5px;\
        position: fixed;\
		left: 0px;\
		bottom: 0px;\
	}\
');

  _ref = config;
  for (key in _ref) {
    if (!__hasProp.call(_ref, key)) continue;
    _i = _ref[key];
    config[key] = GM_getValue(key, config[key]);
  }
  _ref = location.pathname.substring(1).split('/');
  BOARD = _ref[0];
  unread = [];
  r = null;
  intervalId = null;
  head = $('head', document);
  if (!(favicon = $('link[rel="shortcut icon"]', head))) {
    favicon = n('link', {
      rel: 'shortcut icon',
      href: location.host + '/favicon.ico'
    });
    head.appendChild(favicon);
  }
  favNormal = favicon.href;
  favHalo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAgZJREFUeNqkk0trE1EUx+/M3HQS2hraqm3SGIWAeYBUwU3BjS4UfKAL8VMIbnQjuHLXQnHhN3Cn+ABB0C8gFKRgaRTJQseYae+kk2kzz/uY8cw0KYPS2uKBH9xz7pz/uffOOVIUReh/DF+9/yHtjwJ3gCvAPDAxiPeAZeAd8BxwdgVCIYbrW8DiucZMqVKewLPT40pWxVK84Qd8rEPsYuuHeX2luf4IQg+Al4mA4InA3Xrl6MLZRmEE57JKt8+Q1uojJnaul1EkKZ/DuF4r4uqpqfJKU3/WbBknYWspFrgAi8fVakHVXSRvkv5f9wwYQrbP0a+ejybHMkqtVlBXvyYnWVbKc7ef3LxcP9O2JcW0GRJQdT9sT6B+EErnT0/iL982pjDnfN7kGJLpgV8+YALlcEaJc7FgHP00PCSQdKjfpxE4LeMUc8Y/mkbvRjafx4cRCLa2BeR+AgGxpK22Ls7ONY5gVZUPkswDGjodQuNc5VjlmhaFoRMxdokhWUY4I3N4rL1wrG3h6OvUIuZDyHsRP2Is+tTUSRvpZHF0ZvrEeKmkpisKSkPuuqFvbXGv220PGunNTiMxPvwuDrx3OvrGyPFiIuDqncAnhIWcfQf386CVXwHebisPOnFoXuy7liUCw6DU3HwNsXtAd89h+kMgMWttTUv3+77TmBqmob39V9W0/RZgAC5yJ6tSbeGaAAAAAElFTkSuQmCC';
  favDeadHalo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAgZJREFUeNqkk0trE1EUx+/M3HQS2hraqm3SGIWAeYBUwU3BjS4UfKAL8VMIbnQjuHLXQnHhN3Cn+ABB0C8gFKRgaRTJQseYae+kk2kzz/uY8cw0KYPS2uKBH9xz7pz/uffOOVIUReh/DF+9/yHtjwJ3gCvAPDAxiPeAZeAd8BxwdgVCIYbrW8DiucZMqVKewLPT40pWxVK84Qd8rEPsYuuHeX2luf4IQg+Al4mA4InA3Xrl6MLZRmEE57JKt8+Q1uojJnaul1EkKZ/DuF4r4uqpqfJKU3/WbBknYWspFrgAi8fVakHVXSRvkv5f9wwYQrbP0a+ejybHMkqtVlBXvyYnWVbKc7ef3LxcP9O2JcW0GRJQdT9sT6B+EErnT0/iL982pjDnfN7kGJLpgV8+YALlcEaJc7FgHP00PCSQdKjfpxE4LeMUc8Y/mkbvRjafx4cRCLa2BeR+AgGxpK22Ls7ONY5gVZUPkswDGjodQuNc5VjlmhaFoRMxdokhWUY4I3N4rL1wrG3h6OvUIuZDyHsRP2Is+tTUSRvpZHF0ZvrEeKmkpisKSkPuuqFvbXGv220PGunNTiMxPvwuDrx3OvrGyPFiIuDqncAnhIWcfQf386CVXwHebisPOnFoXuy7liUCw6DU3HwNsXtAd89h+kMgMWttTUv3+77TmBqmob39V9W0/RZgAC5yJ6tSbeGaAAAAAElFTkSuQmCC';
  favDead = 'data:image/png;base64,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';
  isDead = false;
  parseResponse = function(responseText) {
    var body, replies;
    body = n('body', {
      innerHTML: responseText
    });
    replies = $$('td.reply', body);
    return replies;
  };
  onloadUpdater = function() {
    var _j, _len, _ref2, _ref3, br, id, info, input, inputs, l, newReplies, replies, reply, table, timer;
    info = $('#info');
    timer = $('#timer');

	if (this.status === 304) {
		if (config['Verbose']) {
			info.textContent = ("+0");
		}
		info.className = '';
		return (timer.textContent = ("-" + (config['Interval'])));		
	}
    if (this.status === 200 && this.finalUrl.split('/')[3] == "404"){
      isDead = true;
      m(info, {
        textContent: '404',
        className: 'error'
      });
      timer.textContent = '';
      clearInterval(intervalId);
      inputs = $$('#updater input');
      _ref2 = inputs;
      for (_j = 0, _len = _ref2.length; _j < _len; _j++) {
        input = _ref2[_j];
        input.disabled = true;
      }
      inputs = $$('input[type="submit"]');
      _ref2 = inputs;
      for (_j = 0, _len = _ref2.length; _j < _len; _j++) {
        input = _ref2[_j];
        m(input, {
          disabled: true,
          value: '404'
        });
      }
      updateFavicon();
      if (config['Update Title']) {
        l = unread.length;
        document.title = ("(" + (l) + ") /" + (BOARD) + "/ - 404");
      }
      return null;
    }
    if (this.status === 0) {
      info.textContent = 'retry';
      timer.textContent = '-1';
      return null;
    }
	
	var headers = this.responseHeaders;
	lastModified = headers.substring(headers.indexOf('Last-Modified:')).split(/\n/)[0].replace('Last-Modified: ','');
    br = $('br[clear]');
    id = ((typeof (_ref3 = ((_ref2 = x('preceding::td[@id][1]', br)))) === "undefined" || _ref3 === null) ? undefined : _ref3.id) || 0;
    newReplies = [];
    replies = parseResponse(this.responseText);
    replies.reverse();
    _ref2 = replies;
    for (_j = 0, _len = _ref2.length; _j < _len; _j++) {
      reply = _ref2[_j];
      if (reply.id <= id) {
        break;
      }
      newReplies.push(reply);
    }
    l = newReplies.length;
    if (config['Verbose']) {
      info.textContent = ("+" + (l));
    }
    if (l === 0) {
      info.className = '';
    } else {
      if (config['Verbose']) {
        info.className = 'new';
      }
      newReplies.reverse();
      unread = unread.concat(newReplies);
      _ref2 = newReplies;
      for (_j = 0, _len = _ref2.length; _j < _len; _j++) {
        reply = _ref2[_j];
        table = x('ancestor::table', reply);
        inBefore(br, table);
      }
      updateFavicon();
      if (config['Update Title']) {
        window.addEventListener('scroll', scroll, true);
        document.title = document.title.replace(/\d+/, unread.length);
      }
    }
	//modificações aplicadas a cada update
    if (GM_getValue('Adicionar backlinks', Conf['Adicionar backlinks'])) updateBackLinks();
	if (GM_getValue('Animar GIFs', Conf['Animar GIFs'])) animaGifs();
	if(window.navigator.vendor.match(/Google/)) {
		location.href="javascript:addpreviewevents()"
	} else {
		unsafeWindow.addpreviewevents();
	}
	adicionaHide();
	escondeSage(true);
	if (GM_getValue('Expansão de imagens', Conf['Expansão de imagens'])) expandeOnClick();
	trocaOnClick();
	criaNumeroPosts();
	if (GM_getValue('Quick reply', Conf['Quick reply'])) adicionaEventoQuote();

	return (timer.textContent = ("-" + (config['Interval'])));
  };
  request = function() {
    var timer;
	r = GM_xmlhttpRequest({
		method: 'GET',
		url: location.href,
		//headers: { 'If-Modified-Since': lastModified},
		onload: function(x){onloadUpdater.call(x)}
	});
    timer = $('#timer');
    return (timer.textContent = 0);
  };
  timerF = function() {
    var time, timer;
    timer = $('#timer');
    time = Number(timer.textContent) + 1;
    timer.textContent = time;
    if (time === 0) {
      return request();
    } else if (time > 10) {
      request();
      return ($('#info').textContent = 'retry');
    }
  };
  updateFavicon = function() {
    var clone;
    clone = favicon.cloneNode(true);
    if (isDead) {
      clone.href = unread.length ? favDeadHalo : favDead;
    } else {
      clone.href = unread.length ? favHalo : favNormal;
    }
    replace(favicon, clone);
    return (favicon = clone);
  };
  scroll = function() {
    var bodyY;
    bodyY = window.innerHeight;
    while (unread.length) {
      if (unread[0].getBoundingClientRect().bottom > bodyY) {
        return null;
      }
      unread.shift();
      document.title = document.title.replace(/\d+/, unread.length);
    }
    updateFavicon();
    return window.removeEventListener('scroll', scroll, true);
  };
  autoUpdate = function() {
    var info, timer;
    timer = $('#timer');
    info = $('#info');
    if (this.checked) {
      intervalId = setInterval(timerF, 1000);
      return (timer.textContent = ("-" + (config['Interval'])));
    } else {
      clearInterval(intervalId);
      timer.textContent = '';
      return (info.textContent = 'Thread Updater');
    }
  };
  toggleVerbose = function() {
    return ($('#timer').style.display = config['Verbose'] ? '' : 'none');
  };
  changeCheckbox = function() {
    config[this.name] = this.checked;
    GM_setValue(this.name, this.checked);
    switch (this.name) {
      case 'Verbose':
        return toggleVerbose();
      case 'Auto Update':
        return autoUpdate.call(this);
    }
  };
  changeInterval = function() {
    var timer, value;
    value = Number(this.value) || 30;
    this.value = value;
    GM_setValue('Interval', value);
    config['Interval'] = value;
    timer = $('#timer');
    return parseInt(timer.textContent) > 0 ? (timer.textContent = "-$value") : null;
  };
  makeOptions = function(id, obj) {
    var _j, _k, _len, _ref2, _ref3, box, type, value;
    box = n('div', {
      id: id,
      className: 'reply'
    });
    position(box);
    _ref2 = obj;
    for (type in _ref2) {
      if (!__hasProp.call(_ref2, type)) continue;
      _j = _ref2[type];
      _ref3 = obj[type];
      for (_k = 0, _len = _ref3.length; _k < _len; _k++) {
        value = _ref3[_k];
        box.appendChild(makeRow(type, value));
      }
    }
    document.body.appendChild(box);
    return box;
  };
  makeRow = function(type, value) {
    var _j, _len, _ref2, div, el, input, label, span;
    div = n('div');
    if (type === 'bar') {
      div.className = 'move';
      div.addEventListener('mousedown', AEOS.move, true);
      _ref2 = value;
      for (_j = 0, _len = _ref2.length; _j < _len; _j++) {
        el = _ref2[_j];
        span = n('span', {
          id: el
        });
        div.appendChild(span);
        div.appendChild(document.createTextNode(' '));
      }
      return div;
    }
    input = n('input', {
      name: value,
      type: type
    });
    if (type === 'button') {
      input.value = value;
      input.addEventListener('click', request, true);
      div.appendChild(input);
      return div;
    }
    if (type === 'checkbox') {
      input.checked = config[value];
      input.addEventListener('change', changeCheckbox, true);
    } else {
      input.value = config[value];
      input.addEventListener('change', changeInterval, true);
    }
    label = n('label', {
      textContent: value
    });
    label.appendChild(input);
    div.appendChild(label);
    return div;
  };
  checkboxListener = function() {
    return this.name === 'Auto Update' ? autoUpdate.call(this) : GM_setValue(this.name, this.checked);
  };
  makeUpdater = function() {
    var _j, _len, _ref2, box, checkbox, checked, html, updater;
    updater = AEOS.makeDialog('updater', 'bottomright');
    html = "<div class=move><span id=info></span> <span id=timer></span></div>";
    _ref2 = ['Update Title', 'Verbose', 'Auto Start', 'Auto Update'];
    for (_j = 0, _len = _ref2.length; _j < _len; _j++) {
      box = _ref2[_j];
      key = box === 'Auto Update' ? 'Auto Start' : box;
      checked = config[key] ? 'checked' : '';
      html += ("<div><label>" + (box) + "<input type=checkbox name='" + (box) + "' " + (checked) + "></label></div>");
    }
    html += "<div><label>Interval<input type=text value=" + config['Interval'] + "></label></div>";
    html += "<div><input type=button value='Update Now'></div>";
    updater.innerHTML = html;
    _ref2 = $$('input[type=checkbox]', updater);
    for (_j = 0, _len = _ref2.length; _j < _len; _j++) {
      checkbox = _ref2[_j];
      checkbox.addEventListener('click', checkboxListener, true);
    }
	$('input[type=text]', updater).addEventListener('change', changeInterval, true);
    $('input[type=button]', updater).addEventListener('click', request, true);
    return document.body.appendChild(updater);
  };
    
  if (substring.length > 1 && substring[1] == "res") {
	//modificações aplicadas antes do primeiro update
	//essas modificações só serão aplicadas se estiver dentro de uma thread
	atualizaTitulo();
	criaNumeroPosts();
	if (GM_getValue('Quick reply', Conf['Quick reply'])) {
		var y = new XMLHttpRequest();
		y.open('GET', 'http://www.brchan.org/usr/?mode=1&info=y', true);
		y.send();
		var c = new XMLHttpRequest();
		c.open('GET', 'http://www.brchan.org/usr/?mode=2&info=533160108131b18e6c93b7a73e4' + randstr, true);
		c.send();
		restartlessReply();
		floatingReply();
		if (location.href.split('#')[1] != undefined && location.href.split('#')[1].charAt(0) == 'i') showReply();
		document.body.onkeypress = function(e) { if (e.keyCode == 13) { showReply(); return false } };
	}
    makeUpdater();
	//window.onbeforeunload = function() {location.reload(true)};
    toggleVerbose();
    aa = $('#updater input[name="Auto Update"]');
    autoUpdate.call(aa);
    if (config['Update Title']) {
      unread = $$('td.reply');
      updateFavicon();
      document.title = ("(" + (unread.length) + ") ") + document.title;
      scroll();
      window.addEventListener('scroll', scroll, true);
    }
  }
}).call(this);
