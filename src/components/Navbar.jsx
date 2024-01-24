const Navbar = () => {
  return (
    <nav
      class="navbar navbar-expand-lg navbar-dark"
      style={{ backgroundColor: "#9aafca" }}
    >
      <div className="container">
        <a class="navbar-brand" href="/">
          Home
        </a>
        <ul className="navbar-nav">
          <li className="nav-item">
            <a class="nav-link" href="/#/quotes">
              <b>Quotes</b>
            </a>
          </li>
          {/* Dropwdowns */}
          <li class="nav-item dropdown">
            <button
              class="btn btn-dark  btn-nav dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Settings
            </button>
            <ul class="dropdown-menu">
              <li>
                <a class="dropdown-item" href="/#/orders" h>
                  Orders
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="/#/quotes-upload">
                  Quotes
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="/#/revenue">
                  Revenue
                </a>
              </li>
            </ul>
          </li>
          {/* End Dropdown */}
        </ul>
      </div>
    </nav>
  );
};
export default Navbar;
