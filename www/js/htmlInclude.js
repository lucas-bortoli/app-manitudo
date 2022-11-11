(function () {
  var elementos = document.querySelectorAll("x-html-include[src]:not([src='']");
  var xhr = new XMLHttpRequest();

  var get = function (url) {
    xhr.open("GET", url, false);
    xhr.send(url);

    if (xhr.status == 200) {
      return xhr.responseText;
    } else {
      throw new Error(`${xhr.status} ${url}`);
    }
  };

  var prefixCss = function (pageId, cssSource) {
    var selectorMatch = /^[^}@]+[,{]/gm;
    return cssSource.replace(selectorMatch, (selector) => {
      return `.${pageId} ${selector}`;
    });
  };

  for (var elemento of elementos) {
    var pageId = elemento.getAttribute("page-id");
    var htmlLink = elemento.getAttribute("src");
    var cssLink = elemento.getAttribute("css-src");

    // Buscar o arquivo do atributo "src"
    try {
      // Adicionar separadores para auxiliar a visualização no devtools
      var prefixo = `<!-- --><!-- --><!-- --><!-- página::: ${htmlLink} -->`;
      var html = get(htmlLink);
      var sufixo = `<!-- fim da página::: ${htmlLink} --><!-- @@@ --><!-- @@@ --><!-- @@@ -->`;

      // Substituir o x-html-include pelo conteúdo do arquivo
      elemento.outerHTML = prefixo + html + sufixo;

      if (pageId && cssLink) {
        var cssSource = get(cssLink);
        var style = document.createElement("style");
        style.textContent = prefixCss(pageId, cssSource);
        document.body.prepend(style);
        console.log(style);
      }
    } catch (error) {
      elemento.innerHTML = "<p><strong>Erro ao incluir o arquivo</strong> " + htmlLink + "</p>";
      console.error(error, xhr);
    }
  }
})();
