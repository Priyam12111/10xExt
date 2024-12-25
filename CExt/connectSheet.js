const observer = new MutationObserver(() => {
  const gmail_search = document.querySelector(".gb_we");
});
observer.observe(document.body, { childList: true, subtree: true });
