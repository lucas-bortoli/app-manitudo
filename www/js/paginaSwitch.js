function setPage(paginaId) {
  // Deselecionar página atual
  document.querySelector(".pagina.atual").classList.remove("atual");

  // Selecionar página nova
  document.querySelector('.pagina[x-pagina-id="' + paginaId + '"]').classList.add("atual");

  toggleMenu(null, false);
}
