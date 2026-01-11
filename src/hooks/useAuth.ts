import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "@/services/endpoints";
import { useInactivityLogout } from "./useInactivityLogout";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

// ------------------------------------------------------
// Map technical errors to human-friendly messages
// ------------------------------------------------------
function getFriendlyError(error: any) {
  if (!error) return "Something went wrong, please try again.";

  // AxiosError with response from server
  if (error.isAxiosError && error.response?.data) {
    const message = error.response.data.msg || error.response.data.message;

    if (message) {
      const msg = message.toString().toLowerCase();

      if (msg.includes("invalid credentials") || msg.includes("wrong password"))
        return "Incorrect email or password.";

      if (msg.includes("user not found"))
        return "User does not exist, please check your email.";

      if (msg.includes("email already exists"))
        return "This email is already registered, try logging in.";

      if (msg.includes("too many requests"))
        return "Too many login attempts. Please wait a few minutes.";

      return message; // fallback to backend message
    }

    // Status code-based fallback
    switch (error.response.status) {
      case 400:
        return "Wrong input, please check your data.";
      case 401:
        return "Unauthorized access, please login again.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "Requested resource not found.";
      case 429:
        return "Too many requests. Please try again later.";
      default:
        if (error.response.status >= 500)
          return "Server error, please try again later.";
    }
  }

  // Network / timeout errors
  if (error.message?.includes("Network Error"))
    return "Unable to connect to server. Check your internet.";

  return "Something went wrong, please try again.";
}

// ------------------------------------------------------
// useAuth Hook
// ------------------------------------------------------
export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/login" || pathname === "/signup";

  // ---------------------------
  // Fetch user
  // ---------------------------
  const {
    data: user,
    isLoading: queryLoading,
    isError: isUserError,
    error: userError,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authAPI.me().then((res) => res.data.user),
    retry: false,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: !isLoginPage,
    enabled: !isLoginPage,
  });

  // ---------------------------
  // Login Mutation
  // ---------------------------
  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] }),
  });

  // ---------------------------
  // Register Mutation
  // ---------------------------
  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] }),
  });

  // ---------------------------
  // Logout Mutation
  // ---------------------------
  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["auth", "me"] });
    },
    onSuccess: () => {
      router.push("/login");
      setTimeout(() => queryClient.clear(), 100);
    },
  });

  // ---------------------------
  // Auto logout
  // ---------------------------
  useInactivityLogout(!!user && !isLoginPage);

  // ---------------------------
  // Redirect authenticated users away from /login
  // ---------------------------
  useEffect(() => {
    if (user && isLoginPage) router.replace("/");
  }, [user, isLoginPage, router]);

  // ---------------------------
  // Return API
  // ---------------------------
  return {
    user: user || null,
    isLoading: queryLoading && !isLoginPage,
    isAuthenticated: !!user,

    // MUTATIONS
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutate,

    // STATES
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,

    // HUMAN-FRIENDLY ERROR STATES
    loginError: loginMutation.isError
      ? getFriendlyError(loginMutation.error)
      : null,
    registerError: registerMutation.isError
      ? getFriendlyError(registerMutation.error)
      : null,
    logoutError: logoutMutation.isError
      ? getFriendlyError(logoutMutation.error)
      : null,
    userError: isUserError ? getFriendlyError(userError) : null,

    // Boolean Flags
    isLoginError: loginMutation.isError,
    isRegisterError: registerMutation.isError,
    isLogoutError: logoutMutation.isError,
  };
}
