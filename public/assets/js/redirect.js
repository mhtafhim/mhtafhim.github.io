// Static compatibility pages retain query strings and section deep links.
const destination = document.querySelector('#redirect-target');
if (destination) {
  const target = new URL(destination.getAttribute('href'), location.href);
  if (target.origin === location.origin) {
    target.search = location.search;
    target.hash = location.hash;
    location.replace(target.href);
  }
}
