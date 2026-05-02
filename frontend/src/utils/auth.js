export const getToken = () => localStorage.getItem("token");

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const getUserId = () => {
  const user = getUser();
  return user ? user._id || user.id : null;
};

export const getRole = () => {
  const user = getUser();
  return user?.role || null;
};
