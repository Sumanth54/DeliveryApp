import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import { api } from "../lib/api";
import type { User } from "../types";

const STORAGE_KEY = "namma-basket-auth";

type AuthStateValue = {
  token: string | null;
  user: User | null;
  loading: boolean;
};

type AuthActionsValue = {
  requestOtp: (phone: string, name: string) => Promise<string>;
  verifyOtp: (phone: string, otp: string, name: string) => Promise<void>;
  logout: () => void;
};

const AuthStateContext = createContext<AuthStateValue | undefined>(undefined);
const AuthActionsContext = createContext<AuthActionsValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.me(token);
        setUser(response.user);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    void bootstrap();
  }, [token]);

  const requestOtp = useCallback(async (phone: string, name: string) => {
    const response = await api.requestOtp(phone, name);
    return response.debugOtp;
  }, []);

  const verifyOtp = useCallback(async (phone: string, otp: string, name: string) => {
    const response = await api.verifyOtp(phone, otp, name);
    localStorage.setItem(STORAGE_KEY, response.token);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const stateValue = useMemo<AuthStateValue>(
    () => ({
      token,
      user,
      loading
    }),
    [loading, token, user]
  );

  const actionsValue = useMemo<AuthActionsValue>(
    () => ({
      requestOtp,
      verifyOtp,
      logout
    }),
    [logout, requestOtp, verifyOtp]
  );

  return (
    <AuthStateContext.Provider value={stateValue}>
      <AuthActionsContext.Provider value={actionsValue}>{children}</AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
}

export function useAuthState() {
  const context = useContext(AuthStateContext);

  if (!context) {
    throw new Error("useAuthState must be used within AuthProvider");
  }

  return context;
}

export function useAuthActions() {
  const context = useContext(AuthActionsContext);

  if (!context) {
    throw new Error("useAuthActions must be used within AuthProvider");
  }

  return context;
}

export function useAuth() {
  const state = useAuthState();
  const actions = useAuthActions();

  return useMemo(
    () => ({
      ...state,
      ...actions
    }),
    [actions, state]
  );
}
