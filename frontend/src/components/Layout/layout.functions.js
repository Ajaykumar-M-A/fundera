export function handleLogout(logout, navigate) {
  logout();
  navigate("/login");
}
