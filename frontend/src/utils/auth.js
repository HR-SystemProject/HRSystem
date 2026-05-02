export const getToken = () => localStorage.getItem("token");

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const getUserId = () => getUser()?.id;
export const getRole = () => getUser()?.role;
